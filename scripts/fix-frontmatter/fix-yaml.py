#!/usr/bin/env python3
import os
import re
import sys
import yaml
import argparse
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


def parse_error_log(log_file: str) -> Dict[str, List[str]]:
    """
    Parse the validation error log file and extract the errors for each file.

    Args:
        log_file: Path to the error log file

    Returns:
        Dictionary mapping file paths to lists of error messages
    """
    errors_by_file = {}
    current_file = None

    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()

                # Check if this line is a file path
                if line.endswith(':') and not line.startswith('  •'):
                    current_file = line[:-1]  # Remove the trailing colon
                    # Remove docs/ prefix if present
                    if current_file.startswith('docs/'):
                        current_file = current_file[5:]
                    errors_by_file[current_file] = []

                # Check if this line is an error message
                elif (line.startswith('•') or line.startswith('  •')) and current_file is not None:
                    error_msg = line.lstrip('• ').strip()
                    errors_by_file[current_file].append(error_msg)
    except FileNotFoundError:
        logger.error(f"Error log file not found: {log_file}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error parsing log file: {e}")
        sys.exit(1)

    return errors_by_file


def extract_frontmatter(content: str) -> Tuple[Optional[str], str, int]:
    """
    Extract frontmatter from content.

    Args:
        content: The file content

    Returns:
        Tuple containing (frontmatter, remaining_content, end_position)
    """
    frontmatter_match = re.search(r'^---\s*(.*?)\s*---', content, re.DOTALL)
    if not frontmatter_match:
        return None, content, 0

    frontmatter = frontmatter_match.group(1)
    remaining_content = content[frontmatter_match.end():]
    end_position = frontmatter_match.end()

    return frontmatter, remaining_content, end_position


def is_compact_array_format(frontmatter: str) -> bool:
    """
    Check if the frontmatter uses compact array format for keywords.

    Args:
        frontmatter: The YAML frontmatter content

    Returns:
        True if compact array format is used, False otherwise
    """
    return bool(re.search(r'keywords\s*:\s*\[', frontmatter))


def preserve_original_format(original_frontmatter: str, fixed_content: Dict) -> str:
    """
    Attempts to preserve the original formatting while applying fixes.
    This is especially important for maintaining the compact array format.

    Args:
        original_frontmatter: The original frontmatter text
        fixed_content: Dictionary with the fixed/updated content

    Returns:
        Formatted frontmatter with original style preserved as much as possible
    """
    # Split into lines for processing
    lines = original_frontmatter.split('\n')
    result_lines = []
    processed_keys = set()

    # First pass - preserve original lines where possible
    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Skip empty lines
        if not line:
            result_lines.append('')
            i += 1
            continue

        # Check if this is a key line
        key_match = re.match(r'^([^:]+):\s*(.*)$', line)
        if key_match:
            key = key_match.group(1).strip()
            value_text = key_match.group(2).strip()

            # Check if it's the keywords line with compact array format
            if key == 'keywords' and value_text.startswith('['):
                if key in fixed_content:
                    # Get the fixed keywords array
                    keywords = fixed_content[key]
                    if isinstance(keywords, list):
                        # Format with single quotes and compact style
                        quoted_items = []
                        for item in keywords:
                            clean_item = str(item)
                            if (clean_item.startswith("'") and clean_item.endswith("'")) or (clean_item.startswith('"') and clean_item.endswith('"')):
                                clean_item = clean_item[1:-1]
                            quoted_items.append(f"'{clean_item}'")

                        result_lines.append(f"{key}: [{', '.join(quoted_items)}]")
                        processed_keys.add(key)
                    else:
                        # Not a list, use as is
                        result_lines.append(f"{key}: {fixed_content[key]}")
                        processed_keys.add(key)
                else:
                    # Keep original if not fixed
                    result_lines.append(lines[i])

                i += 1
                continue

            # For other normal key-value pairs
            if key in fixed_content:
                if isinstance(fixed_content[key], str):
                    # Check if the value needs quotes
                    value = fixed_content[key]
                    if re.search(r'[:#\[\]{}]', value) or value.strip() != value:
                        result_lines.append(f"{key}: '{value}'")
                    else:
                        result_lines.append(f"{key}: {value}")
                else:
                    # Keep non-string values as is
                    value_str = yaml.dump({key: fixed_content[key]}, default_flow_style=False, allow_unicode=True, sort_keys=False).strip()
                    result_lines.append(value_str)

                processed_keys.add(key)
            else:
                # Keep original if not fixed
                result_lines.append(lines[i])

            i += 1
        else:
            # Keep non-key lines as is
            result_lines.append(lines[i])
            i += 1

    # Second pass - add any new keys that weren't in the original
    for key, value in fixed_content.items():
        if key not in processed_keys:
            if key == 'keywords' and isinstance(value, list):
                # Use compact format for new keywords by default
                quoted_items = []
                for item in value:
                    clean_item = str(item)
                    if (clean_item.startswith("'") and clean_item.endswith("'")) or (clean_item.startswith('"') and clean_item.endswith('"')):
                        clean_item = clean_item[1:-1]
                    quoted_items.append(f"'{clean_item}'")

                result_lines.append(f"{key}: [{', '.join(quoted_items)}]")
            elif isinstance(value, str):
                # Check if the value needs quotes
                if re.search(r'[:#\[\]{}]', value) or value.strip() != value:
                    result_lines.append(f"{key}: '{value}'")
                else:
                    result_lines.append(f"{key}: {value}")
            else:
                # Format non-string values
                value_str = yaml.dump({key: value}, default_flow_style=False, allow_unicode=True, sort_keys=False).strip()
                result_lines.append(value_str)

    # Join lines back together
    return '\n'.join(result_lines)


def fix_single_quotes_error(frontmatter: str, error_line: str) -> str:
    """
    Fix errors related to single quotes in frontmatter values.

    Args:
        frontmatter: The YAML frontmatter content
        error_line: The error message line

    Returns:
        Modified frontmatter content
    """
    match = re.search(r'value should use single quotes in line: "(.*?)"', error_line)
    if not match:
        return frontmatter

    # Extract just the key from the error message
    partial_line = match.group(1)
    key_match = re.search(r'([^:]+):', partial_line)

    if not key_match:
        return frontmatter

    key = key_match.group(1).strip()

    # Parse the frontmatter
    try:
        fm_dict = yaml.safe_load(frontmatter) or {}

        # Reconstruct the frontmatter with proper quotes
        # We'll use the round-trip method to preserve formatting for other fields
        frontmatter_lines = frontmatter.split('\n')
        for i, line in enumerate(frontmatter_lines):
            if line.strip().startswith(f"{key}:"):
                key_value_pattern = r'([^:]+):\s*(.*)'
                key_value_match = re.search(key_value_pattern, line)

                if key_value_match:
                    key_found = key_value_match.group(1).strip()
                    value = key_value_match.group(2).strip()

                    # Remove any existing quotes
                    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                        value = value[1:-1]

                    # Create replacement with single quotes
                    frontmatter_lines[i] = f"{key_found}: '{value}'"
                    break

        return '\n'.join(frontmatter_lines)

    except yaml.YAMLError as e:
        logger.warning(f"Error parsing YAML: {e}")
        return frontmatter


def fix_array_item_quotes(frontmatter: str, error_line: str) -> str:
    """
    Fix errors related to array items needing single quotes.

    Args:
        frontmatter: The YAML frontmatter content
        error_line: The error message line

    Returns:
        Modified frontmatter content
    """
    match = re.search(r"keywords array item '([^']+)' should be wrapped in single quotes", error_line)
    if not match:
        return frontmatter

    item = match.group(1)

    # Try to directly fix the keywords line if it's in the compact [item1, item2] format
    keywords_pattern = r'(keywords\s*:\s*\[)(.*?)(\])'
    keywords_match = re.search(keywords_pattern, frontmatter, re.DOTALL)

    if keywords_match:
        # Found keywords in the compact array format
        prefix = keywords_match.group(1)  # The "keywords: [" part
        items_text = keywords_match.group(2)  # The contents between brackets
        suffix = keywords_match.group(3)  # The closing "]"

        # Split items, respecting existing commas
        items = [i.strip() for i in items_text.split(',')]
        quoted_items = []

        for i, val in enumerate(items):
            # Check if this is our target item
            clean_val = val.strip()
            # Remove any existing quotes
            if (clean_val.startswith("'") and clean_val.endswith("'")) or (clean_val.startswith('"') and clean_val.endswith('"')):
                clean_val = clean_val[1:-1]

            if clean_val == item:
                # This is the item we need to fix
                quoted_items.append(f"'{clean_val}'")
            elif clean_val.startswith("'") and clean_val.endswith("'"):
                # Already properly quoted
                quoted_items.append(clean_val)
            else:
                # Not our target and not properly quoted
                quoted_items.append(f"'{clean_val}'")

        # Reconstruct the keywords line
        fixed_keywords = f"{prefix}{', '.join(quoted_items)}{suffix}"
        return frontmatter.replace(keywords_match.group(0), fixed_keywords)

    # Try to fix the issue if keywords are in a list format with each item on a new line
    frontmatter_lines = frontmatter.split('\n')
    keywords_started = False
    keywords_indentation = ""

    for i, line in enumerate(frontmatter_lines):
        stripped = line.strip()

        # Check if this is the keywords line
        if stripped == "keywords:" or stripped.startswith("keywords:"):
            keywords_started = True
            # Extract indentation pattern
            keywords_indentation = re.match(r'(\s*)', line).group(1)
            continue

        # If we're in the keywords section, look for the item to fix
        if keywords_started and stripped.startswith('-'):
            # Extract the value part
            value_match = re.search(r'-\s*(.*)', stripped)
            if value_match:
                value = value_match.group(1).strip()

                if value == item:
                    # Always use single quotes for keyword items
                    # First remove any existing quotes
                    if (value.startswith("'") and value.endswith("'")) or (value.startswith('"') and value.endswith('"')):
                        value = value[1:-1]
                    # Replace with properly quoted version
                    frontmatter_lines[i] = line.replace(f"- {value}", f"- '{value}'").replace(f"- \"{value}\"", f"- '{value}'").replace(f"- '{value}\"", f"- '{value}'").replace(f"- \"{value}'", f"- '{value}'")

    # If we fixed it directly, return the modified frontmatter
    modified = '\n'.join(frontmatter_lines)
    if modified != frontmatter:
        return modified

    # If direct fix didn't work, fall back to YAML parsing
    try:
        # Parse the frontmatter
        fm_dict = yaml.safe_load(frontmatter) or {}

        # Update the keywords array to ensure items are strings
        if 'keywords' in fm_dict and isinstance(fm_dict['keywords'], list):
            # Convert all items to strings if they're not already
            for i, kw in enumerate(fm_dict['keywords']):
                if str(kw) == item:
                    fm_dict['keywords'][i] = str(kw)

        # Convert back to YAML, preserving the format
        lines = []
        for key, value in fm_dict.items():
            if key == 'keywords' and isinstance(value, list):
                # Check if we should use compact array format
                if re.search(r'keywords\s*:\s*\[', frontmatter):
                    # Compact array format [item1, item2]
                    quoted_items = []
                    for kw in value:
                        clean_kw = str(kw)
                        if (clean_kw.startswith("'") and clean_kw.endswith("'")) or (clean_kw.startswith('"') and clean_kw.endswith('"')):
                            clean_kw = clean_kw[1:-1]
                        quoted_items.append(f"'{clean_kw}'")

                    lines.append(f"{key}: [{', '.join(quoted_items)}]")
                else:
                    # Multi-line format
                    if value:  # Only if there are keywords
                        lines.append(f"{key}:")
                        for kw in value:
                            # Always use single quotes for keywords
                            clean_kw = str(kw)
                            if (clean_kw.startswith("'") and clean_kw.endswith("'")) or (clean_kw.startswith('"') and clean_kw.endswith('"')):
                                clean_kw = clean_kw[1:-1]
                            lines.append(f"  - '{clean_kw}'")
                    else:
                        # Empty list case
                        lines.append(f"{key}: []")
            else:
                # Use yaml.dump for non-list values
                temp_dict = {key: value}
                item_yaml = yaml.dump(
                    temp_dict,
                    default_flow_style=False,
                    allow_unicode=True,
                    sort_keys=False
                ).strip()
                lines.append(item_yaml)

        return '\n'.join(lines)

    except yaml.YAMLError as e:
        logger.warning(f"Error parsing YAML: {e}")
        return frontmatter


def add_missing_field(frontmatter: str, error_line: str) -> str:
    """
    Add missing required fields to frontmatter.

    Args:
        frontmatter: The YAML frontmatter content
        error_line: The error message line

    Returns:
        Modified frontmatter content
    """
    match = re.search(r'missing required field: (\w+)', error_line)
    if not match:
        return frontmatter

    field_name = match.group(1)

    try:
        # Parse the frontmatter
        fm_dict = yaml.safe_load(frontmatter) or {}

        # Add the missing field with a placeholder value
        if field_name not in fm_dict:
            fm_dict[field_name] = f'TODO: Add {field_name}'

        # Handle special cases for known field types
        if field_name == 'keywords' and not isinstance(fm_dict[field_name], list):
            fm_dict[field_name] = ['placeholder']

        # Check if the frontmatter already has keywords in compact array format [item1, item2]
        compact_array_format = re.search(r'keywords\s*:\s*\[', frontmatter) is not None

        # Convert back to YAML manually for better formatting control
        lines = []
        for key, value in fm_dict.items():
            if key == 'keywords' and isinstance(value, list):
                # Check if we should use compact array format
                if compact_array_format:
                    # Compact array format [item1, item2]
                    quoted_items = []
                    for item in value:
                        clean_item = str(item)
                        if (clean_item.startswith("'") and clean_item.endswith("'")) or (clean_item.startswith('"') and clean_item.endswith('"')):
                            clean_item = clean_item[1:-1]
                        quoted_items.append(f"'{clean_item}'")

                    lines.append(f"{key}: [{', '.join(quoted_items)}]")
                else:
                    # Multi-line format
                    if value:  # Only if there are keywords
                        lines.append(f"{key}:")
                        for item in value:
                            # Always use single quotes for keywords
                            clean_item = str(item)
                            if (clean_item.startswith("'") and clean_item.endswith("'")) or (clean_item.startswith('"') and clean_item.endswith('"')):
                                clean_item = clean_item[1:-1]
                            lines.append(f"  - '{clean_item}'")
                    else:
                        # Empty list case
                        lines.append(f"{key}: []")
            else:
                # For strings, add single quotes
                if isinstance(value, str):
                    # Check if the value needs quotes
                    if re.search(r'[:#\[\]{}]', value) or value.strip() != value:
                        # Remove any existing quotes
                        if (value.startswith("'") and value.endswith("'")) or (value.startswith('"') and value.endswith('"')):
                            value = value[1:-1]
                        lines.append(f"{key}: '{value}'")
                    else:
                        lines.append(f"{key}: {value}")
                else:
                    # Use yaml.dump for non-string values to handle complex types
                    temp_dict = {key: value}
                    item_yaml = yaml.dump(
                        temp_dict,
                        default_flow_style=False,
                        allow_unicode=True,
                        sort_keys=False
                    ).strip()
                    lines.append(item_yaml)

        return '\n'.join(lines)
    except yaml.YAMLError as e:
        logger.warning(f"Error parsing YAML: {e}")
        return frontmatter


def fix_markdown_file(file_path: str, errors: List[str], root_dir: str, dry_run: bool = False) -> bool:
    """
    Fix frontmatter validation errors in a markdown file.

    Args:
        file_path: Path to the markdown file (relative to root_dir)
        errors: List of error messages for this file
        root_dir: Root directory containing the markdown files
        dry_run: If True, don't actually modify the file

    Returns:
        True if changes were made (or would be made in dry_run mode), False otherwise
    """
    full_path = os.path.join(root_dir, file_path)

    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content  # Save the original content

        # Extract frontmatter and content separately
        frontmatter, main_content, end_position = extract_frontmatter(content)

        if frontmatter is None:
            logger.warning(f"No frontmatter found in {file_path}, adding empty frontmatter.")
            frontmatter = ""

        # Start with original frontmatter
        modified_frontmatter = frontmatter

        # Keep track of compact array format
        compact_format = is_compact_array_format(frontmatter)

        # First parse the original frontmatter to a dict
        try:
            fm_dict = yaml.safe_load(modified_frontmatter) or {}
        except yaml.YAMLError:
            logger.warning(f"Error parsing original frontmatter YAML in {file_path}, using empty dict")
            fm_dict = {}

        # Apply fixes one by one
        was_modified = False
        for error in errors:
            original_dict = fm_dict.copy()

            if 'value should use single quotes in line' in error:
                temp_frontmatter = fix_single_quotes_error(modified_frontmatter, error)
                if temp_frontmatter != modified_frontmatter:
                    modified_frontmatter = temp_frontmatter
                    was_modified = True

                    # Update the dict to reflect changes
                    try:
                        fm_dict = yaml.safe_load(modified_frontmatter) or {}
                    except yaml.YAMLError:
                        # If parsing fails, keep the previous dict
                        fm_dict = original_dict

            elif 'keywords array item' in error and 'should be wrapped in single quotes' in error:
                temp_frontmatter = fix_array_item_quotes(modified_frontmatter, error)
                if temp_frontmatter != modified_frontmatter:
                    modified_frontmatter = temp_frontmatter
                    was_modified = True

                    # Update the dict to reflect changes
                    try:
                        fm_dict = yaml.safe_load(modified_frontmatter) or {}
                    except yaml.YAMLError:
                        # If parsing fails, keep the previous dict
                        fm_dict = original_dict

            elif 'missing required field' in error:
                temp_frontmatter = add_missing_field(modified_frontmatter, error)
                if temp_frontmatter != modified_frontmatter:
                    modified_frontmatter = temp_frontmatter
                    was_modified = True

                    # Update the dict to reflect changes
                    try:
                        fm_dict = yaml.safe_load(modified_frontmatter) or {}
                    except yaml.YAMLError:
                        # If parsing fails, keep the previous dict
                        fm_dict = original_dict

            else:
                logger.warning(f"Unhandled error type: {error}")

        # If we made changes, ensure proper formatting by regenerating with original style preservation
        if was_modified:
            modified_frontmatter = preserve_original_format(frontmatter, fm_dict)

        # Reconstruct the file with modified frontmatter and original content
        modified_content = f"---\n{modified_frontmatter}\n---{main_content}"

        # Only write the file if changes were made
        if modified_content != original_content:
            if not dry_run:
                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write(modified_content)
            return True

        return False

    except Exception as e:
        logger.error(f"Error fixing file {file_path}: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Fix frontmatter validation errors in markdown files.')
    parser.add_argument('log_file', help='Path to the validation error log file')
    parser.add_argument('root_dir', help='Root directory containing the markdown files')
    parser.add_argument('--dry-run', action='store_true', help='Print changes without modifying files')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output')

    args = parser.parse_args()

    # Set logging level based on verbosity
    if args.verbose:
        logger.setLevel(logging.DEBUG)

    # Parse the error log
    errors_by_file = parse_error_log(args.log_file)

    # Fix each file
    fixed_files = 0
    total_files = len(errors_by_file)

    for file_path, errors in errors_by_file.items():
        logger.info(f"Processing {file_path}...")

        if args.dry_run:
            logger.info(f"  Would fix {len(errors)} errors")
            # Still call the function to see if changes would be made
            if fix_markdown_file(file_path, errors, args.root_dir, dry_run=True):
                fixed_files += 1
        else:
            if fix_markdown_file(file_path, errors, args.root_dir):
                fixed_files += 1
                logger.info(f"  Fixed {len(errors)} errors")
            else:
                logger.info(f"  No changes needed")

    logger.info(f"\nSummary: Fixed {fixed_files}/{total_files} files")


if __name__ == "__main__":
    main()
