#!/bin/bash
# vale-report.sh - Generate Vale report with progress tracking

PROGRESS_FILE="vale-progress.csv"

vale --output=JSON \
  $(find docs/ -name "*.md") \
  > vale-report.json 2>&1

# vale --output=JSON \
#   $(find docs/ -name "*.md" \
#     -not -path "docs/engines/*" \
#     -not -path "docs/development/*" \
#     -not -path "docs/interfaces/*" \
#     -not -path "docs/operations/*" \
#     -not -path "docs/sql-reference/*" \
#     -not -path "docs/whats-new/*" \
#     -not -path "docs/releases/*") \
#   > vale-report.json 2>&1

# Check if vale-report.json is valid JSON
if ! jq empty vale-report.json 2>/dev/null; then
    echo "Error: Vale did not produce valid JSON output"
    echo ""
    echo "Vale output:"
    cat vale-report.json
    exit 1
fi

WARNINGS=$(jq '[.[] | .[] | select(.Severity == "warning")] | length' vale-report.json)
SUGGESTIONS=$(jq '[.[] | .[] | select(.Severity == "suggestion")] | length' vale-report.json)

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
    echo "date,warnings,suggestions" > "$PROGRESS_FILE"
    echo "$(date '+%Y-%m-%d'),${WARNINGS},${SUGGESTIONS}" >> "$PROGRESS_FILE"
else
    # Only append if warning count changed from last entry
    LAST_WARNINGS=$(tail -n 1 "$PROGRESS_FILE" | cut -d',' -f2)
    if [ "$LAST_WARNINGS" != "$WARNINGS" ]; then
        echo "$(date '+%Y-%m-%d'),${WARNINGS},${SUGGESTIONS}" >> "$PROGRESS_FILE"
    fi
fi

# Show current report
echo "================================================"
echo "Vale Report - $(date '+%Y-%m-%d')"
echo "================================================"
echo ""

echo "Warnings: $WARNINGS"
echo "Suggestions: $SUGGESTIONS"
echo ""

# Show progress if we have historical data
if [ $(wc -l < "$PROGRESS_FILE") -gt 2 ]; then
    FIRST_WARNINGS=$(tail -n +2 "$PROGRESS_FILE" | head -n 1 | cut -d',' -f2)
    FIXED=$((FIRST_WARNINGS - WARNINGS))
    PERCENT=$(echo "scale=1; ($FIXED / $FIRST_WARNINGS) * 100" | bc 2>/dev/null || echo "0")
    
    echo "Progress since $(tail -n +2 "$PROGRESS_FILE" | head -n 1 | cut -d',' -f1):"
    echo "  Started with: $FIRST_WARNINGS warnings"
    echo "  Fixed: $FIXED warnings ($PERCENT% complete)"
    echo ""
fi

echo "Top Warning Rules:"
jq -r '[.[] | .[] | select(.Severity == "warning") | .Check] | group_by(.) | map({rule: .[0], count: length}) | sort_by(-.count) | .[:5] | .[] | "\(.count)\t\(.rule)"' vale-report.json | column -t -s $'\t'
echo ""

echo "Top Files to Fix:"
jq -r 'to_entries | map({file: .key, count: [.value[] | select(.Severity == "warning")] | length}) | map(select(.count > 0)) | sort_by(-.count) | .[:15] | .[] | "\(.count)\t\(.file)"' vale-report.json | column -t -s $'\t'
echo ""

echo "================================================"
echo "To fix a file:"
echo "   vale docs/path/to/file.md"
echo "   vim docs/path/to/file.md"
echo "================================================"
