#!/usr/bin/env python3
"""
Prepare sections for manual AI review - select the best candidates.
"""

import json
import os


def load_json(filepath):
    with open(filepath, 'r') as f:
        return json.load(f)


def main():
    base_dir = "/home/runner/work/clickhouse-docs/clickhouse-docs"
    
    # Load the focused issues
    issues = load_json(os.path.join(base_dir, "focused_header_issues.json"))
    sections = load_json(os.path.join(base_dir, "sections_for_analysis.json"))
    
    # Create a map of (file, line) -> full section
    section_map = {}
    for section in sections:
        key = (section['file'], section['line'])
        section_map[key] = section
    
    # Focus on the most promising issue types
    promising_issues = [i for i in issues if i['issue_type'] in ['what_is_delayed_answer', 'too_generic']]
    
    # Enhance issues with full content
    enhanced_issues = []
    for issue in promising_issues:
        key = (issue['file'], issue['line'])
        if key in section_map:
            full_section = section_map[key]
            issue['full_content'] = full_section['content']
            enhanced_issues.append(issue)
    
    # Save for manual review
    output_file = os.path.join(base_dir, "candidates_for_ai_review.json")
    with open(output_file, 'w') as f:
        json.dump(enhanced_issues, f, indent=2)
    
    print(f"Prepared {len(enhanced_issues)} candidates for AI review")
    print(f"Saved to: {output_file}")
    
    # Print summary
    by_type = {}
    for issue in enhanced_issues:
        issue_type = issue['issue_type']
        by_type.setdefault(issue_type, []).append(issue)
    
    print("\nCandidates by type:")
    for issue_type, items in by_type.items():
        print(f"  {issue_type}: {len(items)}")


if __name__ == "__main__":
    main()
