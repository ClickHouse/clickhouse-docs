#!/usr/bin/env python3
"""
Advanced header analysis with better heuristics focused on the most common issues.
"""

import json
import os
import re
from typing import List, Dict


def load_sections(json_file: str) -> List[Dict]:
    """Load sections from JSON file."""
    with open(json_file, 'r') as f:
        return json.load(f)


def analyze_what_is_headers(sections: List[Dict]) -> List[Dict]:
    """
    Find "What is X?" headers where content doesn't answer the question.
    This is the most common issue per the problem statement.
    """
    issues = []
    
    for section in sections:
        header = section['header']
        content = section['content']
        
        # Look for "What is" questions
        if not (header.lower().startswith('what is ') or 
                header.lower().startswith('what are ') or
                'what is' in header.lower()):
            continue
        
        # Skip if content is too short to analyze
        if len(content) < 100:
            continue
        
        # Get first 500 chars of actual content (skip images, imports, etc.)
        lines = content.split('\n')
        content_lines = []
        in_code_block = False
        
        for line in lines:
            if '```' in line:
                in_code_block = not in_code_block
                continue
            if in_code_block:
                continue
            if (line.strip() and 
                not line.strip().startswith(':::') and
                not line.strip().startswith('<Image') and
                not line.strip().startswith('import ') and
                not line.strip().startswith('_Fig')):
                content_lines.append(line.strip())
                if len(' '.join(content_lines)) > 500:
                    break
        
        first_content = ' '.join(content_lines)[:600]
        
        if not first_content:
            continue
        
        # Check if content starts with definition/explanation
        definition_patterns = [
            r'^([A-Z][\w\s-]+)\s+is\s+(a|an)\s+',  # "X is a/an..."
            r'^([A-Z][\w\s-]+)\s+refers to\s+',     # "X refers to..."
            r'^In ClickHouse[,\s]+([A-Z][\w\s-]+)\s+is\s+',  # "In ClickHouse, X is..."
            r'^A\s+([A-Z][\w\s-]+)\s+is\s+',        # "A X is..."
            r'^The\s+([A-Z][\w\s-]+)\s+is\s+',      # "The X is..."
        ]
        
        has_definition = any(re.search(pattern, first_content) for pattern in definition_patterns)
        
        # Check for bad starts that suggest the content doesn't answer "what is"
        bad_starts = [
            r'^(Available|Included|Requires|Required)',
            r'^Each\s+\w+\s+(includes|has|contains)',
            r'^(You can|To)\s+',
            r'^(This|These)\s+(feature|setting|option)',
            r'^\w+\s+is available (for|in)',
            r'^(Scale and Enterprise|Development|Production)',
        ]
        
        has_bad_start = any(re.search(pattern, first_content, re.IGNORECASE) for pattern in bad_starts)
        
        # If no clear definition and has a bad start, likely an issue
        if not has_definition and has_bad_start:
            issues.append({
                'file': section['file'],
                'line': section['line'],
                'header': header,
                'anchor': section.get('anchor'),
                'issue_type': 'what_is_no_answer',
                'reasoning': "Header asks 'What is X?' but content starts with availability/usage info instead of defining what X is",
                'first_sentence': first_content[:200],
                'suggested_header': None  # Will be filled by manual review
            })
            continue
        
        # Check if answer is delayed (definition doesn't come until later)
        if not has_definition and 'is a' in first_content.lower()[100:400]:
            issues.append({
                'file': section['file'],
                'line': section['line'],
                'header': header,
                'anchor': section.get('anchor'),
                'issue_type': 'what_is_delayed_answer',
                'reasoning': "Header asks 'What is X?' but the definition doesn't appear until later in the section",
                'first_sentence': first_content[:200],
                'suggested_header': None
            })
    
    return issues


def analyze_generic_headers(sections: List[Dict]) -> List[Dict]:
    """Find overly generic headers that could be more specific."""
    issues = []
    
    generic_terms = ['overview', 'introduction', 'usage', 'examples', 'description', 'details']
    
    for section in sections:
        header = section['header'].lower().strip()
        content = section['content']
        
        # Only single-word generic headers
        if header not in generic_terms:
            continue
        
        # Skip if content is short
        if len(content) < 200:
            continue
        
        # Get first meaningful paragraph
        lines = content.split('\n')
        content_lines = []
        for line in lines:
            if (line.strip() and 
                not line.strip().startswith(':::') and
                not line.strip().startswith('<Image') and
                not line.strip().startswith('import ')):
                content_lines.append(line.strip())
                if len(' '.join(content_lines)) > 300:
                    break
        
        first_para = ' '.join(content_lines)[:400]
        
        # If content discusses specific features/concepts, header could be more specific
        if any(term in first_para.lower() for term in ['feature', 'capability', 'function', 'method', 'setting']):
            issues.append({
                'file': section['file'],
                'line': section['line'],
                'header': section['header'],
                'anchor': section.get('anchor'),
                'issue_type': 'too_generic',
                'reasoning': f"Header '{section['header']}' is generic but content discusses specific features/concepts",
                'first_sentence': first_para[:200],
                'suggested_header': None
            })
    
    return issues


def analyze_mismatched_terms(sections: List[Dict]) -> List[Dict]:
    """Find headers where key terms don't appear in content."""
    issues = []
    
    for section in sections:
        header = section['header']
        content = section['content']
        
        # Skip very short content
        if len(content) < 150:
            continue
        
        # Extract significant terms from header (4+ chars, not common words)
        common_words = {'what', 'with', 'from', 'this', 'that', 'your', 'about', 'using', 
                       'guide', 'example', 'overview', 'section', 'chapter'}
        header_terms = set()
        for word in re.findall(r'\b\w{4,}\b', header.lower()):
            if word not in common_words:
                header_terms.add(word)
        
        if not header_terms or len(header_terms) > 5:
            continue
        
        # Check if any header terms appear in first 400 chars of content
        first_content = content[:400].lower()
        
        matching_terms = [term for term in header_terms if term in first_content]
        
        # If none of the significant header terms appear early, it's suspicious
        if len(matching_terms) == 0 and len(header_terms) <= 3:
            # Get actual first sentence
            lines = [l.strip() for l in content.split('\n') if l.strip() and not l.strip().startswith(('import ', ':::', '<Image'))]
            first_line = lines[0] if lines else ''
            
            issues.append({
                'file': section['file'],
                'line': section['line'],
                'header': header,
                'anchor': section.get('anchor'),
                'issue_type': 'term_mismatch',
                'reasoning': f"Header terms {list(header_terms)} don't appear in the beginning of content",
                'first_sentence': first_line[:200],
                'suggested_header': None
            })
    
    return issues


def main():
    base_dir = "/home/runner/work/clickhouse-docs/clickhouse-docs"
    sections_file = os.path.join(base_dir, "sections_for_analysis.json")
    
    print("Loading sections...")
    sections = load_sections(sections_file)
    print(f"Loaded {len(sections)} sections")
    
    # Run different analyses
    print("\n1. Analyzing 'What is X?' headers...")
    what_is_issues = analyze_what_is_headers(sections)
    print(f"   Found {len(what_is_issues)} potential issues")
    
    print("\n2. Analyzing generic headers...")
    generic_issues = analyze_generic_headers(sections)
    print(f"   Found {len(generic_issues)} potential issues")
    
    print("\n3. Analyzing term mismatches...")
    mismatch_issues = analyze_mismatched_terms(sections)
    print(f"   Found {len(mismatch_issues)} potential issues")
    
    # Combine all issues
    all_issues = what_is_issues + generic_issues + mismatch_issues
    
    print(f"\nTotal issues found: {len(all_issues)}")
    
    # Save to JSON for further analysis
    output_file = os.path.join(base_dir, "focused_header_issues.json")
    with open(output_file, 'w') as f:
        json.dump(all_issues, f, indent=2)
    
    print(f"Saved to: {output_file}")
    
    # Group by issue type
    by_type = {}
    for issue in all_issues:
        issue_type = issue['issue_type']
        by_type.setdefault(issue_type, []).append(issue)
    
    print("\nIssues by type:")
    for issue_type, issues in by_type.items():
        print(f"  {issue_type}: {len(issues)}")
    
    # Print some examples
    print("\n" + "="*80)
    print("SAMPLE ISSUES (first 5 from each type):")
    print("="*80)
    
    for issue_type, issues in by_type.items():
        print(f"\n{issue_type.upper()}:")
        for issue in issues[:5]:
            rel_path = issue['file'].replace(base_dir + '/', '')
            print(f"\n  File: {rel_path}")
            print(f"  Header: {issue['header']}")
            print(f"  Reason: {issue['reasoning']}")
            print(f"  First content: {issue['first_sentence'][:150]}...")


if __name__ == "__main__":
    main()
