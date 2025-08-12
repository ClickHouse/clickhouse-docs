import argparse
import json
import os
import re
import sys
from ruamel.yaml import YAML
from algoliasearch.search.client import SearchClientSync
import networkx as nx
from urllib.parse import urlparse, urlunparse

IGNORE_FILES = ["index.md", "changelog.md", "CHANGELOG.md"]
IGNORE_DIRS = ["ru", "zh"]

SUB_DIRECTORIES = {
    "docs": "https://clickhouse.com/docs",
    "knowledgebase": "https://clickhouse.com/docs/knowledgebase",
}

# Load Algolia settings
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'settings.json'), 'r') as f:
    settings = json.load(f)

# Global tracking
object_ids = set()
link_data = []


def is_changelog(file_path):
    """Check if a file is a changelog based on path or filename"""
    changelog_patterns = ['changelog', 'change-log', 'release-notes', 'releases', 'history', 'news']
    return any(pattern in file_path.lower() for pattern in changelog_patterns)


def get_doc_type_score(doc_type):
    """Calculate doc_type_score based on Diataxis classification"""
    doc_type_scores = {
        'tutorial': 1000,
        'how-to': 900, 
        'explanation': 800,
        'overview': 700,
        'reference': 100
    }
    return doc_type_scores.get(doc_type, 500)


def clean_content(content):
    """Clean markdown content for indexing"""
    # Remove code blocks
    content = re.sub(r'```.*?```', '', content, flags=re.DOTALL)
    # Remove HTML tags
    content = re.sub(r'<[^>]*>', '', content)
    # Remove MDX imports
    content = re.sub(r'^import .+?from .+?$', '', content, flags=re.MULTILINE)
    # Remove image references
    content = re.sub(r'!\[.*?\]\(.*?\)', '', content)
    # Clean up whitespace
    content = re.sub(r'\s+', ' ', content).strip()
    return content


def parse_frontmatter(content):
    """Extract YAML frontmatter from markdown content"""
    frontmatter_pattern = r'^---\n(.*?)\n---\n'
    match = re.match(frontmatter_pattern, content, re.DOTALL)
    
    if not match:
        return {}, content
    
    try:
        yaml = YAML()
        yaml.preserve_quotes = True
        metadata = yaml.load(match.group(1)) or {}
    except Exception:
        # Fallback to basic parsing
        metadata = {}
        for line in match.group(1).split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                if key in ['title', 'description', 'slug', 'keywords', 'doc_type', 'score']:
                    metadata[key] = value.strip().strip('"\'')
    
    # Remove frontmatter from content
    content_without_frontmatter = re.sub(frontmatter_pattern, '', content, flags=re.DOTALL)
    
    return metadata, content_without_frontmatter


def extract_links(content):
    """Extract markdown links for PageRank calculation"""
    # Find markdown links: [text](url)
    link_pattern = r'\[.*?\]\((.*?)\)'
    links = re.findall(link_pattern, content)
    
    # Filter for internal links (start with / but not http)
    internal_links = []
    for link in links:
        if link.startswith('/') and not link.startswith('//'):
            # Clean the link
            clean_link = link.split('#')[0].rstrip('/')
            if clean_link:
                internal_links.append(clean_link)
    
    return internal_links


def generate_slug(file_path, base_directory):
    """Generate URL slug from file path"""
    # Get relative path from docs directory
    rel_path = os.path.relpath(file_path, base_directory)
    
    # Remove file extension
    slug = re.sub(r'\.(md|mdx)$', '', rel_path)
    
    # Convert to URL format
    slug = slug.replace(os.sep, '/')
    
    # Clean up
    slug = slug.strip('/')
    
    return slug


def get_unique_object_id(base_id):
    """Generate unique object ID"""
    if base_id not in object_ids:
        object_ids.add(base_id)
        return base_id
    
    counter = 1
    while f"{base_id}-{counter}" in object_ids:
        counter += 1
    
    unique_id = f"{base_id}-{counter}"
    object_ids.add(unique_id)
    return unique_id


def process_file(file_path, base_directory, base_url):
    """Process a single markdown file into an Algolia document"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Warning: couldn't read {file_path}: {e}")
        return None
    
    # Parse frontmatter
    metadata, content = parse_frontmatter(content)
    
    # Generate slug
    slug = metadata.get('slug') or generate_slug(file_path, base_directory)
    if slug.startswith('/'):
        slug = slug[1:]  # Remove leading slash
    
    # Build full URL
    url = f"{base_url.rstrip('/')}/{slug}"
    
    # Extract title
    title = metadata.get('title', '').strip()
    if not title:
        # Fallback to first h1 in content
        h1_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        title = h1_match.group(1).strip() if h1_match else os.path.basename(file_path)
    
    # Clean content for indexing
    clean_text = clean_content(content)
    
    # Truncate if too long (Algolia 10KB limit)
    if len(clean_text) > 8000:  # Leave some buffer for metadata
        clean_text = clean_text[:8000] + "..."
    
    # Extract internal links for PageRank
    internal_links = extract_links(content)
    for link in internal_links:
        target_url = f"{base_url.rstrip('/')}{link}"
        link_data.append((url, target_url))
    
    # Handle keywords
    keywords = metadata.get('keywords', '')
    if isinstance(keywords, list):
        keywords = ', '.join(str(k) for k in keywords)
    
    # Get doc type and scoring
    doc_type = metadata.get('doc_type', 'reference')
    doc_type_score = get_doc_type_score(doc_type)
    manual_score = metadata.get('score', 0)
    if isinstance(manual_score, str):
        try:
            manual_score = int(manual_score)
        except ValueError:
            manual_score = 0
    
    # Create Algolia document
    doc = {
        'objectID': get_unique_object_id(slug.replace('/', '-')),
        'title': title,
        'content': clean_text,
        'url': url,
        'slug': slug,
        'doc_type': doc_type,
        'doc_type_score': doc_type_score,
        'keywords': keywords,
        'description': metadata.get('description', ''),
        'score': manual_score,
        'file_path': file_path,
        # Hierarchy for compatibility with existing search
        'hierarchy': {
            'lvl0': title,
            'lvl1': title
        },
        'type': 'content'  # Mark as page-level content
    }
    
    return doc


def process_directory(directory, base_directory, base_url):
    """Process all markdown files in a directory"""
    docs = []
    
    for root, dirs, files in os.walk(directory):
        # Skip ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('_')]
        
        for file in files:
            if not (file.endswith('.md') or file.endswith('.mdx')):
                continue
            
            if file in IGNORE_FILES or is_changelog(file):
                continue
            
            file_path = os.path.join(root, file)
            doc = process_file(file_path, base_directory, base_url)
            
            if doc:
                docs.append(doc)
    
    return docs


def compute_page_rank(link_data, damping_factor=0.85, max_iter=100, tol=1e-6):
    """Compute PageRank scores for documents"""
    if not link_data:
        return {}
    
    # Create directed graph
    graph = nx.DiGraph()
    graph.add_edges_from(link_data)
    
    # Compute PageRank
    try:
        page_rank = nx.pagerank(graph, alpha=damping_factor, max_iter=max_iter, tol=tol)
        return page_rank
    except Exception as e:
        print(f"Warning: PageRank calculation failed: {e}")
        return {}


def send_to_algolia(client, index_name, records):
    """Send records to Algolia"""
    if not records:
        print("No records to send to Algolia.")
        return
    
    try:
        client.batch(index_name=index_name, batch_write_params={
            "requests": [{"action": "addObject", "body": record} for record in records],
        })
        print(f"Successfully sent {len(records)} records to Algolia.")
    except Exception as e:
        print(f"Error sending to Algolia: {e}")
        raise


def create_index(client, index_name):
    """Create and configure Algolia index"""
    try:
        client.delete_index(index_name)
        print(f'Deleted existing index \'{index_name}\'')
    except:
        print(f'Index \'{index_name}\' does not exist (creating new)')
    
    client.set_settings(index_name, settings['settings'])
    client.save_rules(index_name, settings['rules'])
    print(f"Applied settings to index '{index_name}'")


def main(base_directory, algolia_app_id, algolia_api_key, algolia_index_name, batch_size=1000, dry_run=False):
    """Main indexing function"""
    print(f"🚀 Starting simplified page-level indexing...")
    
    # Initialize Algolia client
    client = SearchClientSync(algolia_app_id, algolia_api_key)
    
    # Create/update index
    if not dry_run:
        temp_index_name = f"{algolia_index_name}_temp"
        create_index(client, temp_index_name)
    
    # Process all directories
    all_docs = []
    for sub_directory, base_url in SUB_DIRECTORIES.items():
        directory = os.path.join(base_directory, sub_directory)
        if not os.path.exists(directory):
            print(f"Warning: Directory {directory} does not exist")
            continue
        
        print(f"📁 Processing {directory}...")
        docs = process_directory(directory, base_directory, base_url)
        all_docs.extend(docs)
        print(f"   Found {len(docs)} documents")
    
    if not all_docs:
        print("❌ No documents found!")
        return
    
    print(f"📊 Total documents: {len(all_docs)}")
    
    # Calculate PageRank scores
    print(f"🔗 Calculating PageRank from {len(link_data)} internal links...")
    page_rank_scores = compute_page_rank(link_data)
    
    # Apply PageRank scores to documents
    for doc in all_docs:
        rank = page_rank_scores.get(doc['url'], 0)
        doc['page_rank'] = int(rank * 10000000)  # Scale for integer storage
    
    # Show statistics
    doc_types = {}
    for doc in all_docs:
        doc_type = doc['doc_type']
        doc_types[doc_type] = doc_types.get(doc_type, 0) + 1
    
    print(f"📈 Document types: {doc_types}")
    
    # Send to Algolia in batches
    total_sent = 0
    for i in range(0, len(all_docs), batch_size):
        batch = all_docs[i:i + batch_size]
        
        if dry_run:
            print(f"📄 Batch {i//batch_size + 1}: {len(batch)} documents")
            for doc in batch[:3]:  # Show first 3 as examples
                print(f"   - {doc['title']} ({doc['doc_type']}) -> {doc['url']}")
        else:
            send_to_algolia(client, temp_index_name, batch)
        
        total_sent += len(batch)
    
    print(f"✅ {'Processed' if dry_run else 'Indexed'} {total_sent} documents")
    
    # Switch to production index
    if not dry_run:
        print("🔄 Switching to production index...")
        client.operation_index(
            index_name=temp_index_name,
            operation_index_params={
                "operation": "move",
                "destination": algolia_index_name
            },
        )
        print("🎉 Indexing complete!")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Simple page-level Algolia indexing')
    parser.add_argument('-d', '--base_directory', required=True, help='Path to docs directory')
    parser.add_argument('-x', '--dry_run', action='store_true', help='Dry run (do not send to Algolia)')
    parser.add_argument('--algolia_app_id', required=True, help='Algolia Application ID')
    parser.add_argument('--algolia_api_key', required=True, help='Algolia Admin API Key')
    parser.add_argument('--algolia_index_name', default='clickhouse', help='Algolia Index Name')
    parser.add_argument('--batch_size', type=int, default=1000, help='Batch size for Algolia uploads')
    
    args = parser.parse_args()
    
    if args.dry_run:
        print('🧪 DRY RUN MODE - Not sending to Algolia')
    
    main(
        args.base_directory,
        args.algolia_app_id, 
        args.algolia_api_key,
        args.algolia_index_name,
        args.batch_size,
        args.dry_run
    )