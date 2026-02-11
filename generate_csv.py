#!/usr/bin/env python3
"""
Generate a CSV file with all problematic headers for easy tracking.
"""

import json
import csv
import os


def load_json(filepath):
    with open(filepath, 'r') as f:
        return json.load(f)


def main():
    base_dir = "/home/runner/work/clickhouse-docs/clickhouse-docs"
    
    # Load what-is analysis
    what_is_data = load_json(os.path.join(base_dir, "what_is_headers_analysis.json"))
    
    # Load candidates
    candidates = load_json(os.path.join(base_dir, "candidates_for_ai_review.json"))
    
    # Prepare CSV data
    csv_rows = []
    
    # Add "What is" headers (filter out good ones)
    good_categories = ['good_direct_answer']
    for item in what_is_data:
        if item['category'] not in good_categories:
            rel_path = item['file'].replace(base_dir + '/', '')
            csv_rows.append({
                'File': rel_path,
                'Line': item['line'],
                'Category': 'What is X?',
                'Current Header': item['header'],
                'Issue': f"Category: {item['category']}",
                'Suggested Header': '',  # To be filled
                'First Content': item['first_para'][:150],
                'Priority': 'High' if item['category'] in ['delayed_definition', 'no_clear_definition'] else 'Medium'
            })
    
    # Add generic headers from candidates
    for item in candidates:
        if item['issue_type'] == 'too_generic':
            rel_path = item['file'].replace(base_dir + '/', '')
            csv_rows.append({
                'File': rel_path,
                'Line': item['line'],
                'Category': 'Too Generic',
                'Current Header': item['header'],
                'Issue': item['reasoning'],
                'Suggested Header': item.get('suggested_header', ''),
                'First Content': item.get('first_sentence', '')[:150],
                'Priority': 'Medium'
            })
    
    # Write CSV
    output_file = os.path.join(base_dir, "problematic_headers.csv")
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['Priority', 'Category', 'File', 'Line', 'Current Header', 'Suggested Header', 'Issue', 'First Content']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        
        writer.writeheader()
        
        # Sort by priority then category
        priority_order = {'High': 0, 'Medium': 1, 'Low': 2}
        csv_rows.sort(key=lambda x: (priority_order.get(x['Priority'], 3), x['Category'], x['File']))
        
        for row in csv_rows:
            writer.writerow(row)
    
    print(f"Generated CSV with {len(csv_rows)} problematic headers")
    print(f"Saved to: {output_file}")
    
    # Print summary
    by_category = {}
    by_priority = {}
    for row in csv_rows:
        cat = row['Category']
        pri = row['Priority']
        by_category[cat] = by_category.get(cat, 0) + 1
        by_priority[pri] = by_priority.get(pri, 0) + 1
    
    print("\nSummary:")
    print("  By Category:")
    for cat, count in sorted(by_category.items()):
        print(f"    {cat}: {count}")
    
    print("\n  By Priority:")
    for pri, count in sorted(by_priority.items(), key=lambda x: priority_order.get(x[0], 3)):
        print(f"    {pri}: {count}")


if __name__ == "__main__":
    main()
