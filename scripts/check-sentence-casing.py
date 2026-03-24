#!/usr/bin/env python3
"""
Checks sentence casing in:
  - Frontmatter `title` and `sidebar_label` fields in docs/**/*.{md,mdx}
  - `label` values in sidebars.js

Uses the same exceptions list as styles/ClickHouse/Headings.yml.

Usage:
  python3 scripts/check-sentence-casing.py
"""

import os
import re
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(REPO_ROOT, "docs")
SIDEBARS_PATH = os.path.join(REPO_ROOT, "sidebars.js")
HEADINGS_YML = os.path.join(REPO_ROOT, "styles", "ClickHouse", "Headings.yml")

# Directories that are gitignored or pulled from ClickHouse core at build time
IGNORED_DIRS = {
    "development", "engines", "interfaces", "operations",
    "sql-reference", "_clients", "ru", "zh",
    "whats-new", "releases", "changelogs",
}


def load_exceptions():
    """Load exception words and patterns from Headings.yml.

    Parses the YAML exceptions list without a YAML library — the format
    is a simple list of '  - value' lines under the 'exceptions:' key.
    """
    regex_patterns = []
    literal_words = set()

    with open(HEADINGS_YML, "r") as f:
        lines = f.readlines()

    in_exceptions = False
    for line in lines:
        stripped = line.strip()

        if stripped == "exceptions:":
            in_exceptions = True
            continue

        if in_exceptions:
            # End of exceptions block: a non-list, non-blank, non-comment line
            if stripped and not stripped.startswith("- ") and not stripped.startswith("#"):
                break

            if not stripped.startswith("- "):
                continue

            # Extract the value after "- "
            entry = stripped[2:]
            # Handle quoted values (may have trailing inline comments)
            if entry.startswith('"'):
                end = entry.find('"', 1)
                if end != -1:
                    entry = entry[1:end]
            elif entry.startswith("'"):
                end = entry.find("'", 1)
                if end != -1:
                    entry = entry[1:end]
            else:
                # Unquoted: strip inline comments
                if "  #" in entry:
                    entry = entry[:entry.index("  #")].rstrip()

            if not entry:
                continue

            # Unescape Vale-style backslashes (e.g., C\+\+ -> C++)
            if "\\" in entry and not entry.startswith("^"):
                unescaped = entry.replace("\\", "")
                literal_words.add(unescaped)
                for word in unescaped.split():
                    literal_words.add(word)
                continue

            if entry.startswith("^") or "*" in entry:
                try:
                    regex_patterns.append(re.compile(entry))
                except re.error:
                    pass
            else:
                literal_words.add(entry)
                for word in entry.split():
                    literal_words.add(word)

    return regex_patterns, literal_words


def check_sentence_casing(text, regex_patterns, literal_words):
    """Return list of words that violate sentence casing."""
    words = text.split()
    violations = []

    for i in range(1, len(words)):
        word = words[i]

        if not word or not word[0].isupper():
            continue

        # Strip surrounding punctuation for matching
        cleaned = re.sub(r"^[(\[{]+", "", word)
        cleaned = re.sub(r"[.,;:!?)\]}>]+$", "", cleaned)

        if not cleaned or not cleaned[0].isupper():
            continue

        # Skip ClickHouse variants (parser artifacts from escaped quotes)
        if cleaned.startswith("ClickHouse"):
            continue

        # Check literal exceptions
        if cleaned in literal_words:
            continue

        # Check if part of a multi-word exception in the full text
        multi_word_match = False
        for exc in literal_words:
            if " " in exc and exc in text:
                if cleaned in exc.split():
                    multi_word_match = True
                    break
        if multi_word_match:
            continue

        # Check regex patterns
        regex_match = False
        for pattern in regex_patterns:
            if pattern.search(cleaned):
                regex_match = True
                break
        if regex_match:
            continue

        violations.append(cleaned)

    return violations


def extract_frontmatter_field(content, field):
    """Extract a single field value from YAML frontmatter without a YAML library."""
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return None

    fm_text = match.group(1)
    # Match field: 'value' or field: "value" or field: value
    pattern = re.compile(
        rf"""^{re.escape(field)}:\s*(?:'([^']*)'|"([^"]*)"|(.+))$""",
        re.MULTILINE,
    )
    m = pattern.search(fm_text)
    if not m:
        return None
    return m.group(1) or m.group(2) or m.group(3).strip()


def find_doc_files(root):
    """Recursively find .md and .mdx files, skipping ignored dirs."""
    results = []
    for entry in sorted(os.listdir(root)):
        full_path = os.path.join(root, entry)
        if os.path.isdir(full_path):
            if root == DOCS_DIR and entry in IGNORED_DIRS:
                continue
            results.extend(find_doc_files(full_path))
        elif entry.endswith((".md", ".mdx")):
            results.append(full_path)
    return results


def check_sidebars(regex_patterns, literal_words):
    """Check label values in sidebars.js."""
    issues = []
    with open(SIDEBARS_PATH, "r") as f:
        lines = f.readlines()

    label_re = re.compile(r"""label:\s*['"](.+?)['"]""")

    for i, line in enumerate(lines, start=1):
        match = label_re.search(line)
        if not match:
            continue

        label = match.group(1)
        violations = check_sentence_casing(label, regex_patterns, literal_words)
        if violations:
            issues.append({
                "file": "sidebars.js",
                "line": i,
                "field": "label",
                "value": label,
                "violations": violations,
            })

    return issues


def main():
    regex_patterns, literal_words = load_exceptions()
    all_issues = []

    # Check frontmatter
    for filepath in find_doc_files(DOCS_DIR):
        with open(filepath, "r") as f:
            content = f.read()

        rel_path = os.path.relpath(filepath, REPO_ROOT)

        for field in ("title", "sidebar_label"):
            value = extract_frontmatter_field(content, field)
            if not value:
                continue

            violations = check_sentence_casing(value, regex_patterns, literal_words)
            if violations:
                all_issues.append({
                    "file": rel_path,
                    "line": None,
                    "field": field,
                    "value": value,
                    "violations": violations,
                })

    # Check sidebars.js
    all_issues.extend(check_sidebars(regex_patterns, literal_words))

    # Report
    if not all_issues:
        print("\u2713 All titles and labels use sentence casing.")
        sys.exit(0)

    print(f"Found {len(all_issues)} sentence casing issue(s):\n")

    for issue in all_issues:
        location = f"{issue['file']}:{issue['line']}" if issue["line"] else issue["file"]
        print(f"  {location}")
        print(f"    {issue['field']}: \"{issue['value']}\"")
        print(f"    Capitalized words: {', '.join(issue['violations'])}\n")

    sys.exit(1)


if __name__ == "__main__":
    main()
