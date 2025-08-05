#!/usr/bin/env python3

import re
import json
import argparse

def extract_glossary_terms(markdown_content):
    """Extract terms and definitions from ClickHouse glossary markdown"""
    
    # Pattern to match: ## Term {#anchor} followed by definition paragraph(s)
    pattern = r'^## ([^{]+?)\s*\{#[^}]+\}\s*\n\n(.*?)(?=\n## |\Z)'
    
    matches = re.findall(pattern, markdown_content, re.MULTILINE | re.DOTALL)
    
    glossary = {}
    
    for term, definition in matches:
        # Clean up the term
        term = term.strip()
        
        # Clean up the definition
        definition = definition.strip()
        
        # Remove extra whitespace and normalize line breaks
        definition = re.sub(r'\n+', ' ', definition)
        definition = re.sub(r'\s+', ' ', definition)
        
        glossary[term] = definition
    
    return glossary

def main():
    parser = argparse.ArgumentParser(description='Convert ClickHouse glossary.md to JSON')
    parser.add_argument('--input', '-i', default='./docs/concepts/glossary.md',
                       help='Input markdown file')
    parser.add_argument('--output', '-o', default='./src/components/GlossaryTooltip/glossary.json',
                       help='Output JSON file')
    
    args = parser.parse_args()
    
    # Read the markdown file
    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"❌ Input file not found: {args.input}")
        return
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return
    
    # Extract glossary terms
    glossary = extract_glossary_terms(content)
    
    if not glossary:
        print("❌ No glossary terms found")
        return
    
    print(f"✅ Extracted {len(glossary)} terms:")
    for term in sorted(glossary.keys()):
        print(f"   - {term}")
    
    # Write JSON file
    try:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(glossary, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Saved to: {args.output}")
        
    except Exception as e:
        print(f"❌ Error writing JSON file: {e}")

if __name__ == '__main__':
    main()