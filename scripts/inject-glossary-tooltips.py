import os
import re
import json
import argparse
import difflib
# This script injects glossary tooltips into Markdown files based on a glossary JSON file.
# Path to the glossary JSON file and target directory for Markdown files
# Adjust these paths as necessary
GLOSSARY_FILE = 'src/components/GlossaryTooltip/glossary.json'
TARGET_DIR = 'docs/getting-started/quick-start'

with open(GLOSSARY_FILE, 'r', encoding='utf-8') as f:
    glossary = json.load(f)

terms = sorted(glossary.keys(), key=len, reverse=True)

def build_term_regex(term):
    escaped = re.escape(term)
    return re.compile(rf'\b({escaped})(s|es)?\b', re.IGNORECASE)

term_regexes = {term: build_term_regex(term) for term in terms}

def capitalize_word(word):
    return word[0].upper() + word[1:] if word else word

def replace_terms(line, replaced_terms):
    for term in terms:
        if term in replaced_terms:
            continue

        regex = term_regexes[term]

        def _replacer(match):
            if term in replaced_terms:
                return match.group(0)

            base, plural = match.group(1), match.group(2) or ''
            capitalize = base[0].isupper()
            capital_attr = ' capitalize' if capitalize else ''
            plural_attr = f' plural="{plural}"' if plural else ''
            replaced_terms.add(term)
            return f'<GlossaryTooltip term="{term}"{capital_attr}{plural_attr} />'

        line, count = regex.subn(_replacer, line, count=1)
        if count > 0:
            break  # one term per line max

    return line

def process_markdown(content):
    if '<!-- no-glossary -->' in content:
        return content, False

    lines = content.splitlines()
    inside_code_block = False
    replaced_terms = set()
    modified = False
    output_lines = []

    for line in lines:
        stripped = line.strip()

        # Fence detection for code blocks
        if stripped.startswith('```'):
            inside_code_block = not inside_code_block
            output_lines.append(line)
            continue

        # Skip inside code or headings
        if inside_code_block or stripped.startswith('#'):
            output_lines.append(line)
            continue

        new_line = replace_terms(line, replaced_terms)
        if new_line != line:
            modified = True
        output_lines.append(new_line)

    return '\n'.join(output_lines), modified

def rename_md_to_mdx(filepath):
    if filepath.endswith('.md'):
        new_path = filepath[:-3] + '.mdx'
        os.rename(filepath, new_path)
        print(f'Renamed: {filepath} → {new_path}')
        return new_path
    return filepath

def walk_files(target_dir):
    for root, _, files in os.walk(target_dir):
        for filename in files:
            if filename.endswith('.md') or filename.endswith('.mdx'):
                yield os.path.join(root, filename)

def print_diff(original, modified, path):
    diff_lines = list(difflib.unified_diff(
        original.splitlines(),
        modified.splitlines(),
        fromfile=path,
        tofile=path,
        lineterm=''
    ))
    if diff_lines:
        print('\n'.join(diff_lines))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true', help='Show diffs without writing')
    args = parser.parse_args()

    for filepath in walk_files(TARGET_DIR):
        with open(filepath, 'r', encoding='utf-8') as f:
            original = f.read()

        modified, changed = process_markdown(original)

        if changed:
            if args.dry_run:
                print(f'\n--- DRY RUN: {filepath} ---')
                print_diff(original, modified, filepath)
            else:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(modified)
                print(f'✅ Updated: {filepath}')

                # Rename to .mdx if needed
                if filepath.endswith('.md'):
                    filepath = rename_md_to_mdx(filepath)

if __name__ == '__main__':
    main()
