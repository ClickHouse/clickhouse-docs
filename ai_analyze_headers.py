#!/usr/bin/env python3
"""
Use AI to analyze documentation headers for quality.
This script processes sections in batches and uses an LLM to identify
headers that don't accurately describe their content.
"""

import json
import os
import sys


def load_sections(json_file: str):
    """Load sections from JSON file."""
    with open(json_file, 'r') as f:
        return json.load(f)


def create_analysis_batches(sections, batch_size=50):
    """Split sections into batches for analysis."""
    batches = []
    current_batch = []
    
    for section in sections:
        # Filter out sections that are clearly not worth analyzing
        content = section.get('content', '')
        
        # Skip very short content
        if len(content) < 150:
            continue
        
        # Skip sections that are mostly imports/images
        if content.count('import ') > 5 or content.count('<Image') > 3:
            continue
        
        current_batch.append(section)
        
        if len(current_batch) >= batch_size:
            batches.append(current_batch)
            current_batch = []
    
    if current_batch:
        batches.append(current_batch)
    
    return batches


def format_sections_for_prompt(sections):
    """Format sections for AI analysis prompt."""
    formatted = []
    for i, section in enumerate(sections, 1):
        header = section['header']
        content = section['content'][:800]  # Limit content length
        file_path = section['file'].replace('/home/runner/work/clickhouse-docs/clickhouse-docs/', '')
        
        formatted.append(f"""
Section {i}:
File: {file_path}
Line: {section['line']}
Header: "{header}"
Content:
{content}
""")
    
    return '\n'.join(formatted)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 ai_analyze_headers.py <batch_number>")
        print("Example: python3 ai_analyze_headers.py 0")
        sys.exit(1)
    
    batch_num = int(sys.argv[1])
    
    base_dir = "/home/runner/work/clickhouse-docs/clickhouse-docs"
    sections_file = os.path.join(base_dir, "sections_for_analysis.json")
    
    print(f"Loading sections from {sections_file}...")
    sections = load_sections(sections_file)
    print(f"Loaded {len(sections)} sections")
    
    # Create batches
    batches = create_analysis_batches(sections, batch_size=30)
    print(f"Created {len(batches)} batches")
    
    if batch_num >= len(batches):
        print(f"Batch {batch_num} doesn't exist. Max batch: {len(batches) - 1}")
        sys.exit(1)
    
    batch = batches[batch_num]
    print(f"\nAnalyzing batch {batch_num} with {len(batch)} sections...")
    
    # Format for analysis
    formatted_sections = format_sections_for_prompt(batch)
    
    # Create the analysis prompt
    prompt = f"""You are analyzing documentation headers to identify those that don't accurately describe their content.

Review the following {len(batch)} documentation sections and identify headers that are:
1. Misleading or don't match what the content actually discusses
2. Questions (e.g., "What is X?") where the content doesn't directly answer that question
3. Too vague or generic for the specific content
4. Incorrect or outdated

For each problematic header, provide:
- Section number
- Why the header is inadequate
- A suggested better header

{formatted_sections}

Provide your analysis in JSON format:
{{
  "issues": [
    {{
      "section_number": 1,
      "reasoning": "Brief explanation of the problem",
      "suggested_header": "Better header text"
    }}
  ]
}}

Be critical but fair - only flag genuine issues where the header truly doesn't match the content."""
    
    # Save prompt to file for review
    prompt_file = os.path.join(base_dir, f"batch_{batch_num}_prompt.txt")
    with open(prompt_file, 'w') as f:
        f.write(prompt)
    
    print(f"Prompt saved to {prompt_file}")
    print(f"Prompt length: {len(prompt)} characters")
    print("\n" + "="*80)
    print("PROMPT:")
    print("="*80)
    print(prompt[:2000])
    print("...")
    print("="*80)


if __name__ == "__main__":
    main()
