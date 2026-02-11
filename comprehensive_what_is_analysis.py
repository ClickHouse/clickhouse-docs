#!/usr/bin/env python3
"""
Create a comprehensive analysis of all 'What is' headers across the documentation.
"""

import json
import os
import re


def load_json(filepath):
    with open(filepath, 'r') as f:
        return json.load(f)


def analyze_what_is_sections(sections):
    """Analyze all 'What is' sections comprehensively."""
    what_is_sections = []
    
    for section in sections:
        header = section['header']
        
        # Match various "What is/are" patterns
        if not re.search(r'\bwhat\s+(is|are)\b', header, re.IGNORECASE):
            continue
        
        content = section.get('content', '')
        if len(content) < 100:
            continue
        
        # Parse content to get first substantial paragraph
        lines = content.split('\n')
        first_para_lines = []
        in_code = False
        
        for line in lines:
            if '```' in line:
                in_code = not in_code
                continue
            if in_code:
                continue
            
            stripped = line.strip()
            if (stripped and 
                not stripped.startswith(':::') and
                not stripped.startswith('<Image') and
                not stripped.startswith('import ') and
                not stripped.startswith('_Fig')):
                first_para_lines.append(stripped)
                
                # Get about 500 chars
                combined = ' '.join(first_para_lines)
                if len(combined) > 500:
                    break
        
        first_para = ' '.join(first_para_lines)[:600]
        
        # Categorize the opening
        category = categorize_opening(header, first_para)
        
        what_is_sections.append({
            'file': section['file'],
            'line': section['line'],
            'header': header,
            'anchor': section.get('anchor'),
            'first_para': first_para,
            'category': category,
            'full_content_len': len(content)
        })
    
    return what_is_sections


def categorize_opening(header, first_para):
    """Categorize how well the opening answers the 'What is X?' question."""
    
    # Direct definition patterns
    direct_def_patterns = [
        r'^(A|An|The)\s+\w+\s+is\s+(a|an)\s+',
        r'^(\w+)\s+is\s+(a|an|the)\s+',
        r'^\w+\s+refers\s+to\s+',
        r'^In\s+\w+,\s+\w+\s+is\s+',
    ]
    
    has_direct_def = any(re.search(p, first_para, re.IGNORECASE) for p in direct_def_patterns)
    
    # Bad opening patterns (discusses features/availability instead of definition)
    bad_opening_patterns = [
        (r'^(Available|Included)\s+', 'starts_with_availability'),
        (r'^(Each|Every)\s+\w+\s+(includes|has|contains)\s+', 'starts_with_components'),
        (r'^\w+\s+is\s+available\s+(for|in|on)\s+', 'starts_with_availability'),
        (r'^(You can|To)\s+', 'starts_with_instructions'),
        (r'^(Scale and Enterprise|Development|Production)', 'starts_with_tiers'),
        (r'^(There are|Several|Multiple)\s+', 'starts_with_enumeration'),
    ]
    
    for pattern, label in bad_opening_patterns:
        if re.search(pattern, first_para, re.IGNORECASE):
            if not has_direct_def:
                return label
    
    # Check if definition comes later
    if not has_direct_def:
        # Look for definition in later part (100-400 chars)
        if len(first_para) > 100 and re.search(r'\s+is\s+(a|an|the)\s+', first_para[100:]):
            return 'delayed_definition'
        return 'no_clear_definition'
    
    return 'good_direct_answer'


def main():
    base_dir = "/home/runner/work/clickhouse-docs/clickhouse-docs"
    sections_file = os.path.join(base_dir, "sections_for_analysis.json")
    
    print("Loading all sections...")
    sections = load_json(sections_file)
    print(f"Loaded {len(sections)} sections")
    
    print("\nAnalyzing 'What is/are' headers...")
    what_is_sections = analyze_what_is_sections(sections)
    print(f"Found {len(what_is_sections)} 'What is/are' sections")
    
    # Group by category
    by_category = {}
    for section in what_is_sections:
        cat = section['category']
        by_category.setdefault(cat, []).append(section)
    
    print("\nDistribution by category:")
    for cat, items in sorted(by_category.items(), key=lambda x: -len(x[1])):
        print(f"  {cat}: {len(items)}")
    
    # Save all what-is sections for further analysis
    output_file = os.path.join(base_dir, "what_is_headers_analysis.json")
    with open(output_file, 'w') as f:
        json.dump(what_is_sections, f, indent=2)
    
    print(f"\nSaved to: {output_file}")
    
    # Print examples from problematic categories
    problematic_categories = [
        'starts_with_availability',
        'starts_with_components', 
        'starts_with_tiers',
        'delayed_definition',
        'no_clear_definition'
    ]
    
    print("\n" + "="*80)
    print("PROBLEMATIC 'What is X?' HEADERS (Examples)")
    print("="*80)
    
    for cat in problematic_categories:
        if cat in by_category:
            print(f"\n\n{cat.upper()} ({len(by_category[cat])} total):")
            for item in by_category[cat][:3]:  # Show 3 examples
                rel_path = item['file'].replace(base_dir + '/', '')
                print(f"\n  File: {rel_path}:{item['line']}")
                print(f"  Header: {item['header']}")
                print(f"  Opening: {item['first_para'][:200]}...")


if __name__ == "__main__":
    main()
