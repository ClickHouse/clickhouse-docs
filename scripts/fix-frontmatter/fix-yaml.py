#!/usr/bin/env python3
import os
import re
import sys
import yaml
import argparse
from pathlib import Path

from networkx.algorithms.connectivity import node_disjoint_paths


def parse_error_log(log_file):
    """
    Parse the validation error log file and extract the errors for each file.
    Returns a dictionary mapping file paths to lists of error messages.
    """
    errors_by_file = {}
    current_file = None

    with open(log_file, 'r') as f:
        for line in f:
            line = line.strip()

            # Check if this line is a file path
            if line.endswith(':') and not line.startswith('  •'):
                current_file = line[:-1]  # Remove the trailing colon
                current_file = current_file[5:] # Remove docs/
                errors_by_file[current_file] = []

            # Check if this line is an error message
            elif line.startswith('•') and current_file is not None:
                error_msg = line[1:].strip()  # Remove the bullet point
                errors_by_file[current_file].append(error_msg)

    return errors_by_file

def fix_single_quotes_error(content, error_line):
    """Fix errors related to single quotes in frontmatter values."""
    match = re.search(r'value should use single quotes in line: "(.*?)"', error_line)
    if match:
        # Extract just the key from the error message
        partial_line = match.group(1)
        key_match = re.search(r'([^:]+):', partial_line)

        if key_match:
            key = key_match.group(1).strip()

            # Find the full line in the frontmatter
            frontmatter_match = re.search(r'---\s*(.*?)\s*---', content, re.DOTALL)
            if frontmatter_match:
                frontmatter = frontmatter_match.group(1)

                # Find the line with this key in the frontmatter
                frontmatter_lines = frontmatter.split('\n')
                for i, line in enumerate(frontmatter_lines):
                    if line.strip().startswith(f"{key}:"):
                        # Extract the full key and value
                        key_value_pattern = r'([^:]+):\s*(.*)'
                        key_value_match = re.search(key_value_pattern, line)

                        if key_value_match:
                            key = key_value_match.group(1).strip()
                            value = key_value_match.group(2).strip()

                            # Remove any existing quotes
                            if value.startswith('"') and value.endswith('"'):
                                value = value[1:-1]

                            # Create replacement with single quotes
                            replacement = f"{key}: '{value}'"

                            # Replace just this line in the frontmatter
                            frontmatter_lines[i] = replacement

                            # Rebuild the frontmatter and content
                            new_frontmatter = '\n'.join(frontmatter_lines)
                            content = re.sub(r'---\s*(.*?)\s*---', f'---\n{new_frontmatter}\n---', content, flags=re.DOTALL)
                            break

    return content

def fix_array_item_quotes(content, error_line):
    """Fix errors related to array items needing single quotes."""
    match = re.search(r"keywords array item '([^']+)' should be wrapped in single quotes", error_line)
    if match:
        item = match.group(1)

        # Look for the keywords array in the frontmatter
        frontmatter_match = re.search(r'---\s*(.*?)\s*---', content, re.DOTALL)
        if frontmatter_match:
            frontmatter = frontmatter_match.group(1)

            # Parse the frontmatter
            try:
                # Use safe_load to avoid code execution
                fm_dict = yaml.safe_load(frontmatter)

                # Update the keywords array to ensure items are strings
                if 'keywords' in fm_dict and isinstance(fm_dict['keywords'], list):
                    # Convert all items to strings if they're not already
                    for i, kw in enumerate(fm_dict['keywords']):
                        if kw == item:
                            fm_dict['keywords'][i] = str(kw)

                # Convert back to YAML and replace in the content
                new_frontmatter = yaml.dump(fm_dict, default_flow_style=False, allow_unicode=True)
                content = re.sub(r'---\s*(.*?)\s*---', f'---\n{new_frontmatter}---', content, flags=re.DOTALL)
            except yaml.YAMLError as e:
                print(f"Error parsing YAML: {e}")

    return content

def add_missing_field(content, error_line):
    """Add missing required fields to frontmatter."""
    match = re.search(r'missing required field: (\w+)', error_line)
    if match:
        field_name = match.group(1)

        # Look for the frontmatter in the content
        frontmatter_match = re.search(r'---\s*(.*?)\s*---', content, re.DOTALL)
        if frontmatter_match:
            frontmatter = frontmatter_match.group(1)

            # Parse the frontmatter
            try:
                # Use safe_load to avoid code execution
                fm_dict = yaml.safe_load(frontmatter) or {}

                # Add the missing field with a placeholder value
                if field_name not in fm_dict:
                    fm_dict[field_name] = f'TODO: Add {field_name}'

                # Convert back to YAML and replace in the content
                new_frontmatter = yaml.dump(fm_dict, default_flow_style=False, allow_unicode=True)
                content = re.sub(r'---\s*(.*?)\s*---', f'---\n{new_frontmatter}---', content, flags=re.DOTALL)
            except yaml.YAMLError as e:
                print(f"Error parsing YAML: {e}")
        else:
            # No frontmatter found, add one
            new_frontmatter = yaml.dump({field_name: f'TODO: Add {field_name}'}, default_flow_style=False, allow_unicode=True)
            content = f'---\n{new_frontmatter}---\n\n{content}'

    return content

def fix_markdown_file(file_path, errors, root_dir):
    """
    Fix frontmatter validation errors in a markdown file.
    """
    full_path = os.path.join(root_dir, file_path)

    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content  # Save the original content

        # Extract frontmatter and content separately to avoid modifying markdown tables
        frontmatter_match = re.search(r'^---\s*(.*?)\s*---', content, re.DOTALL)
        if not frontmatter_match:
            print(f"No frontmatter found in {file_path}, skipping.")
            return False

        frontmatter = frontmatter_match.group(1)
        main_content = content[frontmatter_match.end():]

        # Only apply fixes to the frontmatter
        modified_frontmatter = frontmatter

        for error in errors:
            if 'value should use single quotes in line' in error:
                # Create a temporary content with just the frontmatter for processing
                temp_content = f"---\n{modified_frontmatter}\n---"
                temp_content = fix_single_quotes_error(temp_content, error)
                # Extract the modified frontmatter
                temp_match = re.search(r'^---\s*(.*?)\s*---', temp_content, re.DOTALL)
                if temp_match:
                    modified_frontmatter = temp_match.group(1)
            elif 'keywords array item' in error and 'should be wrapped in single quotes' in error:
                # Similar approach for keywords
                temp_content = f"---\n{modified_frontmatter}\n---"
                temp_content = fix_array_item_quotes(temp_content, error)
                temp_match = re.search(r'^---\s*(.*?)\s*---', temp_content, re.DOTALL)
                if temp_match:
                    modified_frontmatter = temp_match.group(1)
            elif 'missing required field' in error:
                # Similar approach for missing fields
                temp_content = f"---\n{modified_frontmatter}\n---"
                temp_content = add_missing_field(temp_content, error)
                temp_match = re.search(r'^---\s*(.*?)\s*---', temp_content, re.DOTALL)
                if temp_match:
                    modified_frontmatter = temp_match.group(1)
            else:
                print(f"Unhandled error type: {error}")

        # Reconstruct the file with modified frontmatter and original content
        modified_content = f"---\n{modified_frontmatter}\n---{main_content}"

        # Only write the file if changes were made
        if modified_content != original_content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            return True

        return False

    except Exception as e:
        print(f"Error fixing file {file_path}: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Fix frontmatter validation errors in markdown files.')
    parser.add_argument('log_file', help='Path to the validation error log file')
    parser.add_argument('root_dir', help='Root directory containing the markdown files')
    parser.add_argument('--dry-run', action='store_true', help='Print changes without modifying files')

    args = parser.parse_args()

    # Parse the error log
    errors_by_file = parse_error_log(args.log_file)

    # Fix each file
    fixed_files = 0
    total_files = len(errors_by_file)

    for file_path, errors in errors_by_file.items():
        print(f"Processing {file_path}...")

        if args.dry_run:
            print(f"  Would fix {len(errors)} errors")
        else:
            if fix_markdown_file(file_path, errors, args.root_dir):
                fixed_files += 1
                print(f"  Fixed {len(errors)} errors")
            else:
                print(f"  No changes made")

    print(f"\nSummary: Fixed {fixed_files}/{total_files} files")

if __name__ == "__main__":
    main()