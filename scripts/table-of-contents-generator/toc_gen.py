#!/usr/bin/env python3

"""
This script can be used to automatically generate a table of contents (JSON file) from the markdown files in a directory,
or multiple directories.
"""

import json
import os
import argparse
import sys
from collections import defaultdict
import yaml
import re

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
        description="Script to generate .json table of contents from YAML frontmatter title, description and slug",
    )
    parser.add_argument(
        "--single-toc",
        action="store_true",
        help="Generates a single TOC for all files in all sub-directories of provided directory. By default, generates TOC per folder.",
    )
    parser.add_argument(
        "--out",
        default=None,
        help="Path to output the resulting table of contents file to (by default it is output to the provided directory - file is named according to --dir)"
    )
    parser.add_argument(
        "--md",
        default=None,
        help="Path to markdown file to append the table of contents to"
    )
    parser.add_argument(
        "--dir",
        help="Path to a folder containing markdown (.md, .mdx) documents containing YAML with title, description, slug."
    )
    parser.add_argument('--ignore', metavar='S', type=str, nargs='+',
                        help='Directory names to ignore. E.g --ignore _snippets images')
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )
    return parser.parse_args()

def log(message, verbose=False):
    """Print message only if verbose mode is enabled"""
    if verbose:
        print(message)

def extract_title_description_slug(filename, verbose=False):
    data = defaultdict(str)
    missing_fields = []
    frontmatter_data = {}

    try:
        with open(filename, "r") as f:
            content = f.read()
            # find the first frontmatter tag
            frontmatter_start = content.find('---\n')
            if frontmatter_start != -1:
                # find the second frontmatter tag
                frontmatter_end = content.find('---\n', frontmatter_start + 4)
                if frontmatter_start != -1:
                    # find the second frontmatter tag
                    frontmatter_end = content.find('---\n', frontmatter_start + 4)
                    if frontmatter_end != -1:
                        frontmatter_str = content[frontmatter_start+4:frontmatter_end]
                        frontmatter_data = yaml.safe_load(frontmatter_str) or {}

        data.update(frontmatter_data)

        if missing_fields and verbose:
            log(f"Warning: {filename} is missing some fields:", verbose)
            for field in missing_fields:
                log(f"- {field}", verbose)

        return frontmatter_data
    except OSError as e:
        log(f"Ran into a problem reading frontmatter: {e}", verbose)
        sys.exit(1)

def walk_dirs(root_dir, ignore_dirs=[], verbose=False):
    for root, dirs, files in os.walk(root_dir):
        # Modify the 'dirs' list in-place to remove ignored directories
        if (ignore_dirs is not None):
            dirs[:] = [d for d in dirs if d not in ignore_dirs
                       and not any(d.startswith(ig) for ig in ignore_dirs)]
        yield root

def write_md_to_file(json_items, path_to_md_file, verbose=False):
    try:
        with open(path_to_md_file, encoding='utf-8') as pre_check:
            existing_content = pre_check.read()
            if "| Page | Description |" in existing_content:
                log(f"Markdown table already exists in {path_to_md_file}. Skipping.", verbose)
                return

        with open(path_to_md_file, 'a', encoding='utf-8') as f:

            f.write("| Page | Description |\n")
            f.write("|-----|-----|\n")

            for item in json_items:
                title = item.get('title', '')
                slug = item.get('slug', '')
                description = item.get('description','')
                link = f"[{title}]({slug})" if slug else title
                f.write(f"| {link} | {description} |\n")

        log(f"Markdown table appended to {path_to_md_file}", verbose)

    except Exception as e:
        log(f"An error occurred: {e}", verbose)

def write_to_file(json_items, directory, output=None, verbose=False):
    if output is not None:
        # output to the given path the toc.json file
        # If dir='docs/en/interfaces/formats' the file is called docs_en_interfaces_formats_toc.json
        output_path = output+"/"+directory.replace("/", "_")
    else:
        output_path = directory
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)  # Create directories if they don't exist
        with open(output_path, "w") as f:
            json.dump(json_items, f, indent=4, default=str)
            f.write('\n')
            log(f"Wrote {output_path}", verbose)
    except OSError as e:
        if e.errno == 21:
            log(f"Directory already exists: {e}", verbose)
        elif e.errno != 17:
            log(f"An error occurred creating directory: {e}", verbose)

def write_file(json_items, args, directory):
    if (args.out is not None) and (args.md is None):
        write_to_file(json_items, directory+"/toc.json", args.out, args.verbose)
    elif (args.out is None) and (args.md is None):
        write_to_file(json_items, directory+"/toc.json", verbose=args.verbose)
    elif (args.out is None) and (args.md is not None):
        write_md_to_file(json_items, args.md, args.verbose)

def sort_by_title_before_underscore(json_items):
    def sort_key(item):
        title = item.get("title", "")
        if "_" in title:
            return title.lower().split("_")[0]  # Sort by part before underscore
        else:
            return title.lower()  # Sort by whole title if no underscore

    return sorted(json_items, key=sort_key)

def main():
    # Extract script arguments
    args = parse_args()
    root_dir = args.dir
    if root_dir is None:
        log("Please provide a directory with argument --dir", True)  # Always show critical errors
        sys.exit(1)
    if os.path.lexists(root_dir) is False:
        log("Path provided does not exist", True)  # Always show critical errors
        sys.exit(1)
    if args.single_toc is True:
        json_items = [] # single list for all directories

    for directory in walk_dirs(root_dir, args.ignore, args.verbose): # Walk directories
        if args.single_toc is False:
            json_items = [] # new list for each directory

        for filename in os.listdir(directory): # for each directory
            full_path = os.path.join(directory, filename)
            if os.path.isfile(full_path) is False:
                continue
            else:
                # index.md is ignored as we expect this to be the page for the table of contents
                if (filename.endswith(".md") or filename.endswith(".mdx")) and filename != "index.md":
                    result = extract_title_description_slug(full_path, args.verbose)
                    if result is not None:
                        json_items.append(result)
                        if args.single_toc is False:
                            # don't write toc.json for empty folders
                            if len(json_items) != 0:
                                json_items = sort_by_title_before_underscore(json_items)
                                # output to the specified directory if arg --out is provided
                                write_file(json_items, args, directory)
                            else:
                                log("Ran into an issue trying to extract YAML: empty result", args.verbose)

        if args.single_toc is True:
            # don't write toc.json for empty folders
            if len(json_items) != 0:
                json_array = sort_by_title_before_underscore(json_items)
                # output to the specified directory if arg --out is provided
                write_file(json_items, args, directory)
                sys.exit(0)
            else:
                sys.exit(1)

if __name__ == "__main__":
    main()