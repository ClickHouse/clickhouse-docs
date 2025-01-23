"""
This script can be used to automatically generate a table of contents (JSON file) from the markdown files in a directory,
or multiple directories.
"""

#!/usr/bin/env python3

import json
import os
import argparse
import sys

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
        "--dir",
        help="Path to a folder containing markdown (.md, .mdx) documents containing YAML with title, description, slug."
    )
    return parser.parse_args()

def extract_title_description_slug(filename):
    with open(filename, "r") as f:
        lines = f.readlines()

    title, description, slug = None, None, None
    for line in lines:
        if line.startswith("title:"):
            title = line.strip().split(": ")[1]
        if line.startswith("description:"):
            description = line.strip().split(": ")[1]
        elif line.startswith("slug:"):
            slug = line.strip().split(": ")[1]
    if title and slug and description:
        return {"title": title, "description": description, "slug": slug}
    return None

def walk_dirs(root_dir):
    for root, dirs, files in os.walk(root_dir):
        yield root

def write_to_file(json_array, output_path):
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)  # Create directories if they don't exist
        with open(output_path, "w") as f:
            json.dump(json_array, f, indent=4)
            f.write('\n')
    except OSError as e:
        if e.errno == 21:
            print(f"Directory already exists: {e}")
        else:
            print(f"An error occurred creating directory: {e}")

def main():

    # Extract script arguments
    args = parse_args()
    root_dir = args.dir
    if root_dir is None:
        print("Please provide a directory with argument --dir")
        sys.exit(1)

    if args.single_toc:
        json_items = [] # single list for all directories

    for directory in walk_dirs(root_dir): # Walk directories

        if not args.single_toc:
            json_items = [] # new list for each directory

        for filename in os.listdir(directory): # for each directory
            full_path = os.path.join(directory, filename)
            if os.path.isfile(full_path) is False:
                continue
            else:
                # index.md is ignored as we expect this to be the page for the table of contents
                if (filename.endswith(".md") or filename.endswith(".mdx")) and filename != "index.md":
                    result = extract_title_description_slug(full_path)
                    if result is not None:
                        json_items.append(result)

        if not args.single_toc:
            json_array = sorted(json_items, key=lambda x: x.get("title"))

            # don't write toc.json for empty folders
            if len(json_items) != 0:
                write_to_file(json_items, directory+"/toc.json")

    if args.single_toc:
        json_array = sorted(json_items, key=lambda x: x.get("title"))
        # don't write toc.json for empty folders
        if len(json_items) != 0:
            write_to_file(json_items, root_dir+"/toc.json")

if __name__ == "__main__":
    main()

