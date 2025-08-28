#!/usr/bin/env python3
"""
Related docs generator for Algolia.
Generates relationships between ClickHouse documentation pages using local similarity scoring.
"""

import argparse
import json
import os
import time
from algoliasearch.search.client import SearchClientSync


# Configuration
CONFIG = {
    'MIN_SIMILARITY_SCORE': 20,
    'MAX_RELATED_DOCS': 5,
    'RATE_LIMIT_DELAY': 0.1,
}

# Doc type compatibility matrix
DOC_TYPE_COMPATIBILITY = {
    'tutorial': {'how-to': 80, 'explanation': 60, 'overview': 40, 'reference': 20},
    'how-to': {'tutorial': 80, 'explanation': 70, 'overview': 30, 'reference': 25},
    'explanation': {'tutorial': 60, 'how-to': 70, 'overview': 50, 'reference': 30},
    'overview': {'tutorial': 40, 'how-to': 30, 'explanation': 50, 'reference': 60},
    'reference': {'tutorial': 20, 'how-to': 25, 'explanation': 30, 'overview': 60}
}


def rate_limit_sleep():
    """Simple rate limiting to avoid hitting Algolia limits"""
    time.sleep(CONFIG['RATE_LIMIT_DELAY'])


def safe_get_attr(hit, attr, default=''):
    """Safely get attribute from Algolia Hit object"""
    try:
        # Try standard attribute access
        if hasattr(hit, attr):
            val = getattr(hit, attr, default)
            if val is not None:
                return val
        
        # Try dictionary-style access
        try:
            val = hit[attr]
            if val is not None:
                return val
        except (KeyError, TypeError):
            pass
        
        # For objectID, try common alternatives
        if attr == 'objectID':
            for alt_name in ['object_id', 'id', '_id', 'objectId']:
                if hasattr(hit, alt_name):
                    val = getattr(hit, alt_name, default)
                    if val is not None:
                        return val
                try:
                    val = hit[alt_name]
                    if val is not None:
                        return val
                except (KeyError, TypeError):
                    continue
        
        return default
    except Exception:
        return default


def get_all_docs(client, index_name):
    """Get all documents using multiple targeted queries for comprehensive coverage"""
    print("📚 Fetching documents from Algolia...")
    
    all_docs = {}  # Use dict to deduplicate by objectID
    
    # Multiple queries to ensure comprehensive coverage
    queries = [
        {'query': '', 'hitsPerPage': 1000},  # Main empty query
        {'filters': 'url:*/sql-reference/*', 'hitsPerPage': 300},
        {'filters': 'url:*/integrations/*', 'hitsPerPage': 300}, 
        {'filters': 'url:*/cloud/*', 'hitsPerPage': 200},
        {'filters': 'url:*/guides/*', 'hitsPerPage': 200},
        {'query': 'tutorial', 'hitsPerPage': 200},
        {'query': 'reference', 'hitsPerPage': 200},
        {'query': 'how-to', 'hitsPerPage': 200},
        {'query': 'clickhouse', 'hitsPerPage': 300}
    ]
    
    for i, search_params in enumerate(queries, 1):
        rate_limit_sleep()
        try:
            response = client.search_single_index(
                index_name=index_name,
                search_params={
                    **search_params,
                    'attributesToRetrieve': [
                        'objectID', 'title', 'url', 'doc_type', 'keywords', 
                        'content', 'hierarchy', 'type'
                    ]
                }
            )
            
            new_count = 0
            for hit in response.hits:
                object_id = safe_get_attr(hit, 'objectID')
                
                if object_id and object_id not in all_docs:
                    all_docs[object_id] = hit
                    new_count += 1
            
            print(f"  Query {i}: {new_count} new docs, {len(all_docs)} total")
            
        except Exception as e:
            print(f"  Query {i} failed: {e}")
    
    docs_list = list(all_docs.values())
    print(f"✅ Got {len(docs_list)} unique documents")
    return docs_list


def calculate_similarity_score(source_hit, target_hit):
    """Calculate similarity score between two documents"""
    
    # Doc type compatibility (35% weight)
    source_type = safe_get_attr(source_hit, 'doc_type', 'reference')
    target_type = safe_get_attr(target_hit, 'doc_type', 'reference')
    
    if source_type == target_type:
        doc_type_score = 100
    else:
        doc_type_score = DOC_TYPE_COMPATIBILITY.get(source_type, {}).get(target_type, 10)
    
    # Keyword similarity (25% weight)
    keyword_score = calculate_keyword_similarity(source_hit, target_hit)
    
    # Title similarity (40% weight)
    title_score = calculate_title_similarity(source_hit, target_hit)
    
    # Combined weighted score
    total_score = (doc_type_score * 0.35) + (keyword_score * 0.25) + (title_score * 0.40)
    return round(total_score)


def calculate_keyword_similarity(source_hit, target_hit):
    """Calculate keyword overlap similarity"""
    source_keywords = safe_get_attr(source_hit, 'keywords', '')
    target_keywords = safe_get_attr(target_hit, 'keywords', '')
    
    source_kw_set = set()
    target_kw_set = set()
    
    if source_keywords:
        source_kw_set = {k.strip().lower() for k in source_keywords.split(',') 
                        if k.strip() and len(k.strip()) > 2}
    if target_keywords:
        target_kw_set = {k.strip().lower() for k in target_keywords.split(',') 
                        if k.strip() and len(k.strip()) > 2}
    
    if source_kw_set and target_kw_set:
        overlap = len(source_kw_set & target_kw_set)
        total = len(source_kw_set | target_kw_set)
        return (overlap / total) * 100 if total > 0 else 0
    else:
        return 0


def calculate_title_similarity(source_hit, target_hit):
    """Calculate title word overlap similarity"""
    source_title = safe_get_attr(source_hit, 'title', '')
    target_title = safe_get_attr(target_hit, 'title', '')
    
    source_words = {w.lower() for w in source_title.split() if len(w) > 3}
    target_words = {w.lower() for w in target_title.split() if len(w) > 3}
    
    if source_words and target_words:
        overlap = len(source_words & target_words)
        total = len(source_words | target_words)
        return (overlap / total) * 100 if total > 0 else 0
    else:
        return 0


def find_related_docs(source_hit, all_hits):
    """Find related documents for a source document"""
    candidates = []
    source_object_id = safe_get_attr(source_hit, 'objectID')
    
    for target_hit in all_hits:
        target_object_id = safe_get_attr(target_hit, 'objectID')
        target_title = safe_get_attr(target_hit, 'title')
        target_url = safe_get_attr(target_hit, 'url')
        
        # Skip self and documents without proper data
        if (target_object_id == source_object_id or
            not target_title or
            not target_url):
            continue
        
        # Calculate similarity
        score = calculate_similarity_score(source_hit, target_hit)
        
        # Only keep documents with reasonable similarity
        if score > CONFIG['MIN_SIMILARITY_SCORE']:
            candidates.append({
                'hit': target_hit,
                'score': score
            })
    
    # Sort by score and take top results
    candidates.sort(key=lambda x: x['score'], reverse=True)
    candidates = candidates[:CONFIG['MAX_RELATED_DOCS']]
    
    # Format results for JSON output
    return format_related_docs(source_hit, candidates)


def format_related_docs(source_hit, candidates):
    """Format candidate documents for JSON output"""
    related = []
    source_doc_type = safe_get_attr(source_hit, 'doc_type', 'reference')
    
    for candidate in candidates:
        hit = candidate['hit']
        
        hit_doc_type = safe_get_attr(hit, 'doc_type', 'reference')
        hit_title = safe_get_attr(hit, 'title')
        hit_url = safe_get_attr(hit, 'url')
        
        # Generate reason
        reason = generate_reason(source_doc_type, hit_doc_type, candidate['score'])
        
        # Clean URL for ID
        doc_id = hit_url.replace('https://clickhouse.com/docs/', '').strip('/')
        
        related.append({
            'id': doc_id,
            'title': hit_title,
            'url': hit_url,
            'doc_type': hit_doc_type,
            'reason': reason,
            'similarity_score': candidate['score']
        })
    
    return related


def generate_reason(source_doc_type, target_doc_type, score):
    """Generate a human-readable reason for the relationship"""
    if target_doc_type == source_doc_type:
        return f"Same type ({target_doc_type})"
    
    doc_bonus = DOC_TYPE_COMPATIBILITY.get(source_doc_type, {}).get(target_doc_type, 0)
    if doc_bonus > 60:
        return "Compatible content"
    
    return f"Related content ({score}% match)"


def filter_valid_hits(all_hits):
    """Filter to hits that have the required fields"""
    valid_hits = []
    for hit in all_hits:
        if (safe_get_attr(hit, 'objectID') and 
            safe_get_attr(hit, 'title') and 
            safe_get_attr(hit, 'url')):
            valid_hits.append(hit)
    
    return valid_hits


def show_doc_type_distribution(valid_hits):
    """Show distribution of document types"""
    doc_types = {}
    for hit in valid_hits:
        dt = safe_get_attr(hit, 'doc_type', 'unknown')
        doc_types[dt] = doc_types.get(dt, 0) + 1
    
    print(f"📊 Doc types: {doc_types}")


def generate_related_docs_map(valid_hits):
    """Generate the complete related docs mapping"""
    related_docs_map = {}
    
    for i, hit in enumerate(valid_hits):
        try:
            # Create doc ID from URL
            hit_url = safe_get_attr(hit, 'url')
            doc_id = hit_url.replace('https://clickhouse.com/docs/', '').strip('/')
            
            # Find related docs
            related = find_related_docs(hit, valid_hits)
            related_docs_map[doc_id] = related
            
            if (i + 1) % 50 == 0:
                print(f"⏳ Processed {i + 1}/{len(valid_hits)} documents...")
                
        except Exception as e:
            hit_title = safe_get_attr(hit, 'title', 'unknown')
            print(f"❌ Error processing {hit_title}: {e}")
    
    return related_docs_map


def save_results(related_docs_map, output_path):
    """Save results to JSON file"""
    print(f"💾 Saving to {output_path}...")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(related_docs_map, f, indent=2)


def print_stats(valid_hits, related_docs_map):
    """Print generation statistics"""
    docs_with_related = sum(1 for docs in related_docs_map.values() if docs)
    total_related = sum(len(docs) for docs in related_docs_map.values())
    avg_related = total_related / docs_with_related if docs_with_related > 0 else 0
    
    print(f"\n📊 Results:")
    print(f"  - Documents processed: {len(valid_hits)}")
    print(f"  - Documents with related content: {docs_with_related}")
    print(f"  - Average related docs per page: {avg_related:.1f}")
    print(f"  - Total relationships: {total_related}")


def print_examples(related_docs_map):
    """Print example relationships"""
    examples = [(k, v) for k, v in related_docs_map.items() if v][:3]
    if examples:
        print(f"\n🔍 Examples:")
        for doc_id, related in examples:
            print(f"\n  {doc_id}:")
            for r in related[:2]:
                print(f"    → {r['title']} ({r['similarity_score']}%, {r['doc_type']})")


def main():
    parser = argparse.ArgumentParser(description='Generate related docs from Algolia index')
    parser.add_argument('--algolia_app_id', required=True, help='Algolia application ID')
    parser.add_argument('--algolia_api_key', required=True, help='Algolia API key')
    parser.add_argument('--index_name', default='clickhouse', help='Algolia index name')
    parser.add_argument('--output', default='src/data/related-docs.json', help='Output JSON file path')
    
    args = parser.parse_args()
    
    print("🚀 Starting related docs generation...")
    
    # Initialize client and get all documents
    client = SearchClientSync(args.algolia_app_id, args.algolia_api_key)
    all_hits = get_all_docs(client, args.index_name)
    
    if not all_hits:
        print("❌ No documents found!")
        return
    
    # Filter to valid documents and show stats
    valid_hits = filter_valid_hits(all_hits)
    print(f"📖 Processing {len(valid_hits)} valid documents")
    show_doc_type_distribution(valid_hits)
    
    # Generate related docs mapping
    related_docs_map = generate_related_docs_map(valid_hits)
    
    # Save results
    save_results(related_docs_map, args.output)
    
    # Print final statistics and examples
    print_stats(valid_hits, related_docs_map)
    print_examples(related_docs_map)
    
    print(f"\n🎉 Done! Related docs saved to {args.output}")


if __name__ == '__main__':
    main()