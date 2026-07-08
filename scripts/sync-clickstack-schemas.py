#!/usr/bin/env python3
"""Sync ClickStack OTel schema CREATE TABLE statements from upstream HyperDX
into per-table snippet files in the docs.

Each snippet file under
docs/use-cases/observability/clickstack/ingesting-data/_snippets/ that
matches the glob `_schema_*.md` is the unit of sync. Its contents look like:

    <!-- sync-clickstack-schema: id=<table_name> source=<raw URL> -->
    ```sql
    CREATE TABLE ... ${DATABASE}.<table_name> ( ... );
    ```

The script fetches each `source`, extracts the CREATE TABLE matching `id`,
and rewrites the SQL block. Upstream variable placeholders like ${DATABASE}
and ${TABLES_TTL} are preserved verbatim.

Pages that need to display a schema import the snippet (one snippet per
table, reusable across schemas.md, performance tuning guides, etc.). To
add a new schema, drop a new snippet file with the marker comment and
SQL fence under the snippets directory; the script picks it up
automatically on the next run.

Exit code is always 0; the GitHub workflow detects changes via `git diff`.
"""

from __future__ import annotations

import re
import sys
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

SNIPPETS_DIR = (
    REPO_ROOT
    / "docs/use-cases/observability/clickstack/ingesting-data/_snippets"
)

BLOCK_RE = re.compile(
    r"<!-- sync-clickstack-schema: id=(?P<id>\S+) source=(?P<source>\S+) -->\n"
    r"```sql\n(?P<body>.*?)\n```",
    re.DOTALL,
)


def fetch_text(url: str) -> str:
    with urllib.request.urlopen(url, timeout=30) as resp:
        return resp.read().decode("utf-8")


def extract_create_table(sql: str, table_id: str) -> str:
    cleaned = "\n".join(
        line for line in sql.splitlines() if not re.match(r"--\s*\+goose\b", line)
    )
    pattern = re.compile(
        r"CREATE TABLE(?:\s+IF NOT EXISTS)?\s+\$\{DATABASE\}\."
        + re.escape(table_id)
        + r"\b.*?;",
        re.DOTALL,
    )
    match = pattern.search(cleaned)
    if not match:
        raise RuntimeError(f'Could not find CREATE TABLE for id="{table_id}"')
    return match.group(0).strip()


def sync_file(path: Path, source_cache: dict[str, str]) -> bool:
    original = path.read_text(encoding="utf-8")
    blocks = list(BLOCK_RE.finditer(original))
    if not blocks:
        print(f"[skip] no sync-clickstack-schema marker in {path}")
        return False

    updated = original
    for block in blocks:
        table_id = block.group("id")
        source = block.group("source")
        if source not in source_cache:
            print(f"  fetching {source}")
            source_cache[source] = fetch_text(source)
        new_create = extract_create_table(source_cache[source], table_id)
        replacement = (
            f"<!-- sync-clickstack-schema: id={table_id} source={source} -->\n"
            "```sql\n"
            f"{new_create}\n"
            "```"
        )
        updated = updated.replace(block.group(0), replacement)

    if updated == original:
        print(f"[unchanged] {path}")
        return False

    path.write_text(updated, encoding="utf-8")
    print(f"[updated]   {path}")
    return True


def main() -> int:
    targets = sorted(SNIPPETS_DIR.glob("_schema_*.md"))
    if not targets:
        print(f"No schema snippets found in {SNIPPETS_DIR}")
        return 0
    source_cache: dict[str, str] = {}
    any_changed = False
    for target in targets:
        if sync_file(target, source_cache):
            any_changed = True
    print("done" + (" (changes detected)" if any_changed else " (no changes)"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
