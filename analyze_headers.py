#!/usr/bin/env python3
"""
Analyze markdown documentation headers to identify headers that don't adequately
describe their content, and suggest better alternatives.

This script uses the task tool to leverage AI for analysis.
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict


def find_markdown_files(base_dir: str) -> List[str]:
    """Find all markdown files in the docs directory."""
    markdown_files = []
    docs_path = Path(base_dir) / "docs"
    
    for file_path in docs_path.rglob("*.md"):
        markdown_files.append(str(file_path))
    
    return sorted(markdown_files)


def parse_markdown_sections(content: str, file_path: str) -> List[Dict]:
    """
    Parse markdown content into sections with headers and their content.
    Returns a list of dictionaries with header info and content.
    """
    sections = []
    lines = content.split('\n')
    
    # Pattern to match markdown headers (# through ######)
    header_pattern = re.compile(r'^(#{1,6})\s+(.+?)(?:\s+\{#([^}]+)\})?$')
    
    current_section = None
    frontmatter = False
    frontmatter_count = 0
    
    for i, line in enumerate(lines):
        # Skip frontmatter
        if line.strip() == '---':
            frontmatter_count += 1
            if frontmatter_count <= 2:  # First two --- delimit frontmatter
                frontmatter = not frontmatter
                continue
        
        if frontmatter and frontmatter_count < 2:
            continue
        
        match = header_pattern.match(line)
        if match:
            # Save previous section if it exists
            if current_section is not None:
                sections.append(current_section)
            
            # Start new section
            level = len(match.group(1))
            header_text = match.group(2).strip()
            anchor = match.group(3) if match.group(3) else None
            
            current_section = {
                'file': file_path,
                'line': i + 1,
                'level': level,
                'header': header_text,
                'anchor': anchor,
                'content': []
            }
        elif current_section is not None:
            current_section['content'].append(line)
    
    # Add the last section
    if current_section is not None:
        sections.append(current_section)
    
    return sections


def analyze_section(section: Dict) -> Dict:
    """
    Analyze if the header adequately describes the content using heuristics.
    Returns analysis with suggestion if header is inadequate.
    """
    content = '\n'.join(section['content']).strip()
    header = section['header']
    
    # Skip very short sections or empty sections
    if len(content) < 100:
        return None
    
    # Skip sections with mostly code, imports, or images
    content_lines = content.split('\n')
    import_lines = sum(1 for line in content_lines if line.strip().startswith('import '))
    code_fence_lines = sum(1 for line in content_lines if '```' in line)
    image_lines = sum(1 for line in content_lines if '<Image ' in line or '![' in line)
    
    if import_lines > 5 or code_fence_lines > len(content_lines) / 5 or image_lines > len(content_lines) / 4:
        return None
    
    # Get the first substantial paragraph (skip images, code, notes)
    first_para = ""
    in_code_block = False
    para_lines = []
    
    for line in content_lines:
        if '```' in line:
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue
        if line.strip().startswith(':::') or line.strip().startswith('<Image') or line.strip().startswith('import '):
            continue
        if line.strip() and not line.strip().startswith('_Fig'):
            para_lines.append(line.strip())
            if len(' '.join(para_lines)) > 150:
                break
    
    first_para = ' '.join(para_lines)[:500]
    
    if not first_para:
        return None
    
    # Analyze for common issues
    issues = []
    suggested_header = None
    
    # Issue 1: "What is X?" headers that don't answer the question
    if header.lower().startswith('what is '):
        # Check if the content actually defines/explains what X is
        # Look for definition keywords in the first paragraph
        definition_keywords = ['is a', 'refers to', 'means', 'defined as', 'represents']
        has_definition = any(keyword in first_para.lower() for keyword in definition_keywords)
        
        if not has_definition:
            # Check if it talks about availability, requirements, or features instead
            if any(word in first_para.lower() for word in ['available', 'includes', 'allows you', 'tier', 'create']):
                issues.append("Header asks 'What is X?' but content focuses on availability, features, or how to use it rather than defining what X is")
                # Try to suggest based on content
                if 'available' in first_para.lower() or 'tier' in first_para.lower():
                    suggested_header = header.replace('What is ', 'Using ') + ' - Overview'
                elif 'allows' in first_para.lower() or 'create' in first_para.lower():
                    extracted_term = header.replace('What is ', '').replace('?', '')
                    suggested_header = f"{extracted_term} Overview"
    
    # Issue 2: Headers that are too generic for specific content
    generic_headers = ['overview', 'introduction', 'getting started', 'usage']
    if header.lower() in generic_headers or header.lower().endswith(' overview'):
        # Check if content is actually about something more specific
        if len(first_para) > 200:
            # Content is substantial enough that it might need a more specific title
            pass  # This is harder to detect without AI
    
    # Issue 3: Headers about configuration/setup but content about concepts
    if any(word in header.lower() for word in ['setup', 'configure', 'install', 'create']):
        # Check if the content is actually explaining concepts
        if any(word in first_para.lower()[:200] for word in ['concept', 'architecture', 'definition', 'what is', 'refers to']):
            issues.append("Header suggests setup/configuration but content explains concepts")
    
    # Issue 4: Headers that don't match the main topic discussed
    # Extract key terms from header
    header_terms = set(re.findall(r'\b\w{4,}\b', header.lower()))
    # Extract key terms from first paragraph
    content_terms = set(re.findall(r'\b\w{4,}\b', first_para.lower()[:300]))
    
    # Check overlap
    overlap = header_terms & content_terms
    if header_terms and len(overlap) == 0:
        issues.append("Header terms don't appear in the content beginning, suggesting misalignment")
    
    if issues:
        return {
            'file': section['file'],
            'line': section['line'],
            'level': section['level'],
            'current_header': header,
            'anchor': section.get('anchor'),
            'reasoning': '; '.join(issues),
            'suggested_header': suggested_header or "Manual review needed",
            'content_preview': first_para[:400],
            'full_content_length': len(content)
        }
    
    return None


def save_sections_for_ai_analysis(sections: List[Dict], output_file: str):
    """Save sections to a file for AI analysis."""
    # Filter to substantial sections only
    substantial = []
    for section in sections:
        content = '\n'.join(section['content']).strip()
        if len(content) >= 100:
            # Don't include full content, just enough for analysis
            section_copy = section.copy()
            section_copy['content'] = content[:1000]
            substantial.append(section_copy)
    
    with open(output_file, 'w') as f:
        json.dump(substantial, f, indent=2)
    
    print(f"Saved {len(substantial)} substantial sections to {output_file}")


def main():
    base_dir = "/home/runner/work/clickhouse-docs/clickhouse-docs"
    
    print("Finding markdown files...")
    markdown_files = find_markdown_files(base_dir)
    print(f"Found {len(markdown_files)} markdown files")
    
    all_sections = []
    print("\nParsing markdown files...")
    for file_path in markdown_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            sections = parse_markdown_sections(content, file_path)
            all_sections.extend(sections)
        except Exception as e:
            print(f"Error parsing {file_path}: {e}")
    
    print(f"Found {len(all_sections)} total sections")
    
    # Save sections for AI analysis
    sections_file = os.path.join(base_dir, "sections_for_analysis.json")
    save_sections_for_ai_analysis(all_sections, sections_file)
    
    # Analyze sections with heuristics
    print("\nAnalyzing sections with heuristics...")
    issues = []
    
    for i, section in enumerate(all_sections):
        if (i + 1) % 100 == 0:
            print(f"Analyzed {i + 1}/{len(all_sections)} sections, found {len(issues)} potential issues...")
        
        result = analyze_section(section)
        if result:
            issues.append(result)
    
    print(f"\nHeuristic analysis complete. Found {len(issues)} potential headers that may need improvement.")
    
    # Generate preliminary report
    report_path = os.path.join(base_dir, "header_analysis_preliminary.md")
    
    with open(report_path, 'w') as f:
        f.write("# Documentation Header Analysis - Preliminary Report\n\n")
        f.write(f"This preliminary report identifies {len(issues)} headers that may not adequately describe their content.\n\n")
        f.write("These were detected using heuristic rules. Manual review or AI analysis recommended.\n\n")
        f.write("---\n\n")
        
        for i, issue in enumerate(issues, 1):
            rel_path = issue['file'].replace(base_dir + '/', '')
            
            f.write(f"## Issue {i}\n\n")
            f.write(f"**File:** `{rel_path}`\n\n")
            f.write(f"**Line:** {issue['line']}\n\n")
            f.write(f"**Header Level:** {issue['level']}\n\n")
            f.write(f"**Current Header:** {issue['current_header']}\n\n")
            if issue.get('anchor'):
                f.write(f"**Anchor:** `{issue['anchor']}`\n\n")
            f.write(f"**Detected Issue:** {issue['reasoning']}\n\n")
            f.write(f"**Suggested Header:** {issue['suggested_header']}\n\n")
            f.write(f"**Content Preview:**\n```\n{issue['content_preview']}\n```\n\n")
            f.write("---\n\n")
    
    print(f"\nPreliminary report saved to: {report_path}")
    
    # Also save as JSON
    json_path = os.path.join(base_dir, "header_analysis_preliminary.json")
    with open(json_path, 'w') as f:
        json.dump(issues, f, indent=2)
    
    print(f"JSON report saved to: {json_path}")
    print(f"\nNext step: Use AI to analyze the sections in {sections_file}")


if __name__ == "__main__":
    main()
