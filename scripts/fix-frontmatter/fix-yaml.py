#!/usr/bin/env python3
import os
import re
import sys
import yaml
import argparse
from pathlib import Path

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
        line_to_fix = match.group(1)
        # Split the line into key and value
        key_value_pattern = r'([^:]+):\s*(.*)'
        key_value_match = re.search(key_value_pattern, line_to_fix)

        if key_value_match:
            key = key_value_match.group(1).strip()
            value = key_value_match.group(2).strip()

            # Create replacement with single quotes
            replacement = f"{key}: '{value}'"

            # Replace in content (being careful with regex special characters)
            escaped_line = re.escape(line_to_fix)
            content = re.sub(escaped_line, replacement, content)

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

        for error in errors:
            if 'value should use single quotes in line' in error:
                content = fix_single_quotes_error(content, error)
            elif 'keywords array item' in error and 'should be wrapped in single quotes' in error:
                content = fix_array_item_quotes(content, error)
            elif 'missing required field' in error:
                content = add_missing_field(content, error)
            else:
                print(f"Unhandled error type: {error}")

        # Only write the file if changes were made
        if content != original_content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
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