#!/usr/bin/env python3
"""
Script to identify changed lines in Markdown files from a git diff.

This script finds all changed markdown files in the docs directory
and creates a JSON file showing which lines were modified.

Usage:
    python scripts/get_changed_lines.py <base_sha> <head_sha>

Output:
    Creates a JSON file at logs/changed_lines.json with format:
    [
        {
            "filename": "docs/path/to/file.md",
            "changed_lines": [11, 15, 20]
        },
        ...
    ]
"""

import json
import subprocess
import sys
import re
import os
from pathlib import Path

def get_changed_files(base_sha, head_sha, pattern=r'^docs/.*\.(md|mdx)$'):
    """Get list of changed files matching the pattern."""
    try:
        cmd = f"git diff --name-only {base_sha} {head_sha}"
        result = subprocess.check_output(cmd, shell=True, text=True)
        all_files = result.splitlines()

        # Filter files by pattern
        changed_files = [f for f in all_files if re.match(pattern, f) and os.path.isfile(f)]

        print(f"Found {len(changed_files)} changed files matching pattern")
        return changed_files
    except subprocess.CalledProcessError as e:
        print(f"Error getting changed files: {e}")
        return []

def get_changed_lines(file_path, base_sha, head_sha):
    """Get line numbers that were changed in a specific file."""
    try:
        cmd = f"git diff --unified=0 {base_sha} {head_sha} -- {file_path}"
        diff_output = subprocess.check_output(cmd, shell=True, text=True)

        changed_lines = []
        for line in diff_output.splitlines():
            if line.startswith("@@"):
                # Extract line number from git diff header
                match = re.search(r"^@@ -[0-9]+(?:,[0-9]+)? \+([0-9]+)(?:,[0-9]+)? @@", line)
                if match:
                    line_number = int(match.group(1))
                    changed_lines.append(line_number)

        return changed_lines
    except subprocess.CalledProcessError as e:
        print(f"Error getting changed lines for {file_path}: {e}")
        return []

def main():
    if len(sys.argv) < 3:
        print("Usage: python get_changed_lines.py <base_sha> <head_sha>")
        sys.exit(1)

    base_sha = sys.argv[1]
    head_sha = sys.argv[2]

    # Create output directory
    Path("logs").mkdir(exist_ok=True)

    # Get changed files
    changed_files = get_changed_files(base_sha, head_sha)

    # Process each file
    result = []
    for file in changed_files:
        print(f"Processing file: {file}")
        changed_lines = get_changed_lines(file, base_sha, head_sha)

        if changed_lines:
            result.append({
                "filename": file,
                "changed_lines": changed_lines
            })
            print(f"Found {len(changed_lines)} changed lines in {file}")

    # Write results to JSON file
    output_path = "logs/changed_lines.json"
    with open(output_path, "w") as f:
        json.dump(result, f, indent=2)

    print(f"Generated JSON log at {output_path}")

    # Print the log for debugging
    with open(output_path, "r") as f:
        print(f.read())

if __name__ == "__main__":
    main()