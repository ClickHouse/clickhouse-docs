#!/usr/bin/env python3

import json
import re
import os
import glob
import argparse

def load_glossary(file_path):
    """Load glossary terms from JSON file"""
    with open(file_path, 'r') as f:
        glossary = json.load(f)
    
    # Sort by length (longest first) to avoid partial matches
    terms = sorted(glossary.keys(), key=len, reverse=True)
    print(f"📚 Loaded {len(terms)} glossary terms")
    return terms

def should_skip_file(file_path):
    """Check if file should be skipped based on path patterns"""
    skip_patterns = [
        '_snippets', 'snippets', 'examples', 'example-data', 'sample-data',
        'changelog', 'changelogs', 'release-notes', 'releases', 
        '_partials', 'partials', '_includes', 'includes'
    ]
    
    return any(pattern in file_path for pattern in skip_patterns)

def extract_text_content(content, force_process=False):
    """Extract text content, avoiding code blocks and JSX"""
    
    # Skip if already has glossary syntax (unless forced)
    if not force_process and '^^' in content:
        return None
    
    return content

def extract_protected_ranges(content):
    """Find all ranges that should be protected from glossary wrapping"""
    protected_ranges = []
    
    # Find frontmatter
    frontmatter_match = re.match(r'^(---.*?---)', content, re.DOTALL)
    if frontmatter_match:
        protected_ranges.append((0, frontmatter_match.end()))
    
    # Find code blocks
    for match in re.finditer(r'```[\s\S]*?```', content):
        protected_ranges.append((match.start(), match.end()))
    
    # Find inline code
    for match in re.finditer(r'`[^`]*`', content):
        protected_ranges.append((match.start(), match.end()))
    
    # Find markdown links - protect the entire link [text](url)
    for match in re.finditer(r'\[[^\]]*\]\([^)]*\)', content):
        protected_ranges.append((match.start(), match.end()))
    
    # Find markdown tables - protect entire table blocks
    # Tables start with | and have multiple lines with |
    lines = content.split('\n')
    in_table = False
    table_start = 0
    
    for i, line in enumerate(lines):
        line_start = sum(len(lines[j]) + 1 for j in range(i))  # +1 for \n
        
        if '|' in line and line.strip():
            if not in_table:
                in_table = True
                table_start = line_start
        else:
            if in_table:
                # End of table
                table_end = line_start - 1  # Don't include the newline
                protected_ranges.append((table_start, table_end))
                in_table = False
    
    # Handle table at end of file
    if in_table:
        protected_ranges.append((table_start, len(content)))
    
    # Find JSX component tags
    for match in re.finditer(r'<[A-Z][^>]*/?>', content):
        protected_ranges.append((match.start(), match.end()))
    
    # Sort and merge overlapping ranges
    protected_ranges.sort()
    merged = []
    for start, end in protected_ranges:
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    
    return merged

def is_position_protected(pos, protected_ranges):
    """Check if a position falls within any protected range"""
    for start, end in protected_ranges:
        if start <= pos < end:
            return True
    return False

def wrap_terms_in_content(original_content, terms):
    """Wrap glossary terms with ^^ syntax, avoiding protected areas"""
    
    # Find all protected ranges
    protected_ranges = extract_protected_ranges(original_content)
    
    content = original_content
    changes = 0
    
    for term in terms:
        # Use word boundaries for exact matches
        pattern = r'\b' + re.escape(term) + r'\b'
        matches = list(re.finditer(pattern, content, re.IGNORECASE))
        
        if matches:
            # Replace from end to start to maintain positions
            for match in reversed(matches):
                start, end = match.span()
                
                # Check if this match is in a protected area
                if is_position_protected(start, protected_ranges):
                    continue
                
                matched_term = content[start:end]
                
                # Check if not already wrapped
                before = content[:start]
                if not (before.endswith('^^') or '^^' in before[-10:]):
                    content = content[:start] + f'^^{matched_term}^^' + content[end:]
                    changes += 1
                    
                    # Update protected ranges since we modified the content
                    adjustment = len(f'^^{matched_term}^^') - len(matched_term)
                    protected_ranges = [(s + adjustment if s > start else s, 
                                       e + adjustment if e > start else e) 
                                      for s, e in protected_ranges]
    
    return content, changes

def process_file(file_path, terms, dry_run=False, force_process=False):
    """Process a single MDX file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Check if should skip
        text_content = extract_text_content(original_content, force_process)
        if text_content is None:
            return 'skipped', 0
        
        # Wrap terms
        new_content, changes = wrap_terms_in_content(original_content, terms)
        
        if changes > 0:
            if not dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
            return 'modified', changes
        else:
            return 'unchanged', 0
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return 'error', 0

def main():
    parser = argparse.ArgumentParser(description='Wrap glossary terms in MDX files')
    parser.add_argument('--docs-dir', default='./docs', help='Documentation directory')
    parser.add_argument('--glossary', default='./src/components/GlossaryTooltip/glossary.json', help='Glossary JSON file')
    parser.add_argument('--dry-run', action='store_true', help='Show changes without writing files')
    parser.add_argument('--force', action='store_true', help='Process files even if they already have glossary syntax')
    parser.add_argument('--check', action='store_true', help='Check for unwrapped terms and show warnings (non-blocking)')
    
    args = parser.parse_args()
    
    if not args.check:
        print("🚀 Starting Glossary Term Wrapper...\n")
    
    # Load glossary
    if not os.path.exists(args.glossary):
        print(f"❌ Glossary file not found: {args.glossary}")
        return
    
    terms = load_glossary(args.glossary)
    
    # Find MDX files
    pattern = os.path.join(args.docs_dir, '**/*.mdx')
    all_files = glob.glob(pattern, recursive=True)
    
    # Filter out skip patterns
    files = [f for f in all_files if not should_skip_file(f)]
    
    if not args.check:
        print(f"📁 Found {len(all_files)} MDX files, processing {len(files)} files")
        print(f"⏭️  Skipped {len(all_files) - len(files)} files based on skip patterns")
        
        if args.force:
            print("💪 FORCE MODE - Processing files even with existing glossary syntax")
        
        if args.dry_run:
            print("🔍 DRY RUN MODE - No files will be modified")
        
        print()
    
    # Process files
    stats = {'modified': 0, 'unchanged': 0, 'skipped': 0, 'error': 0, 'terms_wrapped': 0}
    file_details = []  # Track which files had terms for warning display
    
    for file_path in files:
        rel_path = os.path.relpath(file_path, args.docs_dir)
        # For check mode, always use dry_run=True to avoid writing files
        status, changes = process_file(file_path, terms, args.dry_run or args.check, args.force)
        
        if status == 'modified' and changes > 0:
            file_details.append((rel_path, changes))
            if not args.check:
                print(f"✅ Modified {rel_path} ({changes} terms)")
        elif status == 'unchanged' and not args.check:
            print(f"➖ No changes needed for {rel_path}")
        elif status == 'skipped' and not args.check:
            print(f"⏭️  Skipped {rel_path} (already has glossary syntax)")
        
        stats[status] += 1
        stats['terms_wrapped'] += changes
    
    # Show results
    if args.check:
        # Check mode: show warning if terms found
        if stats['terms_wrapped'] > 0:
            print(f"⚠️  GLOSSARY WARNING: Found {stats['terms_wrapped']} unwrapped glossary terms in {len(file_details)} files")
            print("💡 Run 'python3 scripts/wrap_glossary_terms.py' to add glossary tooltips")
            
            # Show files with opportunities (limit to top 10 to avoid spam)
            if file_details:
                print("   Files with unwrapped terms:")
                for rel_path, count in sorted(file_details, key=lambda x: x[1], reverse=True)[:10]:
                    print(f"   - {rel_path} ({count} terms)")
                if len(file_details) > 10:
                    print(f"   ... and {len(file_details) - 10} more files")
        else:
            print("✅ All glossary terms are properly wrapped")
    else:
        # Normal mode: show detailed summary
        print(f"\n📊 Summary:")
        print(f"   Files processed: {stats['modified'] + stats['unchanged']}")
        print(f"   Files modified: {stats['modified']}")
        print(f"   Files skipped: {stats['skipped']}")
        print(f"   Terms wrapped: {stats['terms_wrapped']}")
        
        if args.dry_run:
            print("\n💡 Run without --dry-run to apply changes")
        if not args.force and stats['skipped'] > 0:
            print("💡 Use --force to process files with existing glossary syntax")

if __name__ == '__main__':
    main()