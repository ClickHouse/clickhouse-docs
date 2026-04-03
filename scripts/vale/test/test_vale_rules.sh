#!/usr/bin/env bash
# -----------------------------------------------------------
# Unit tests for Vale rules.
# Run from the repo root:  bash scripts/vale/test/test_vale_rules.sh
#
# Test fixtures live in scripts/vale/test/ but are copied into
# docs/ before each run so they match the .vale.ini glob scope.
# -----------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
PASS=0
FAIL=0

# Vale's .vale.ini globs match relative paths, so we must run from the repo root.
cd "$REPO_ROOT"

TEST_DIR="docs/vale_test"

# ── setup / teardown ──────────────────────────────────────
setup() {
  mkdir -p "$TEST_DIR"
  cp "$SCRIPT_DIR"/test_*.md "$TEST_DIR/" 2>/dev/null || true
}

teardown() {
  rm -rf "$TEST_DIR"
}
trap teardown EXIT
setup

# ── helpers ────────────────────────────────────────────────
assert_vale_errors() {
  local file="$1" rule="$2" expected_count="$3"
  local actual_count
  actual_count=$(vale --output=JSON --no-exit "$file" 2>/dev/null \
    | python3 -c "
import sys, json
data = json.load(sys.stdin)
count = 0
for filepath, alerts in data.items():
    for a in alerts:
        if a.get('Check') == '$rule':
            count += 1
print(count)
" 2>/dev/null || echo "-1")

  local basename
  basename=$(basename "$file")
  if [ "$actual_count" = "$expected_count" ]; then
    echo "  PASS  $basename — $rule: $actual_count errors (expected $expected_count)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $basename — $rule: $actual_count errors (expected $expected_count)"
    FAIL=$((FAIL + 1))
  fi
}

# ── Headings (sentence case) ──────────────────────────────
echo "=== ClickHouse.Headings ==="

# Every heading in must_fail is a Title Case violation
assert_vale_errors \
  "$TEST_DIR/test_headings_must_fail.md" \
  "ClickHouse.Headings" \
  8

# Every heading in must_pass is valid sentence case
assert_vale_errors \
  "$TEST_DIR/test_headings_must_pass.md" \
  "ClickHouse.Headings" \
  0

# ── summary ───────────────────────────────────────────────
echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
