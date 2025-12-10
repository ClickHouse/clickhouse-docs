#!/bin/bash
# vale-report.sh - Generate Vale report and track progress

PROGRESS_FILE="vale-progress.csv"

find docs/ -type f -name "*.md" \
  -exec vale --output=JSON {} + > vale-report.json 2>&1

# Check if vale-report.json is valid JSON
if ! jq empty vale-report.json 2>/dev/null; then
    echo "Error: Vale did not produce valid JSON output"
    echo ""
    echo "Vale output:"
    cat vale-report.json
    exit 1
fi

# Initialize CSV if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
    echo "timestamp,date,errors,warnings,suggestions,total" > "$PROGRESS_FILE"
fi

# Count issues by severity
ERRORS=$(jq '[.[] | .[] | select(.Severity == "error")] | length' vale-report.json)
WARNINGS=$(jq '[.[] | .[] | select(.Severity == "warning")] | length' vale-report.json)
SUGGESTIONS=$(jq '[.[] | .[] | select(.Severity == "suggestion")] | length' vale-report.json)
TOTAL=$((ERRORS + WARNINGS + SUGGESTIONS))

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
DATE=$(date '+%Y-%m-%d')

# Get the last entry to check if numbers changed
if [ -f "$PROGRESS_FILE" ]; then
    LAST_ENTRY=$(tail -n 1 "$PROGRESS_FILE")
    LAST_ERRORS=$(echo "$LAST_ENTRY" | cut -d',' -f3)
    LAST_WARNINGS=$(echo "$LAST_ENTRY" | cut -d',' -f4)
    LAST_SUGGESTIONS=$(echo "$LAST_ENTRY" | cut -d',' -f5)
    
    # Only add entry if numbers changed
    if [ "$ERRORS" != "$LAST_ERRORS" ] || [ "$WARNINGS" != "$LAST_WARNINGS" ] || [ "$SUGGESTIONS" != "$LAST_SUGGESTIONS" ]; then
        echo "$TIMESTAMP,$DATE,$ERRORS,$WARNINGS,$SUGGESTIONS,$TOTAL" >> "$PROGRESS_FILE"
        CHANGE_INDICATOR=" (CHANGED - logged to $PROGRESS_FILE)"
    else
        CHANGE_INDICATOR=" (no change since last run)"
    fi
else
    # First entry
    echo "$TIMESTAMP,$DATE,$ERRORS,$WARNINGS,$SUGGESTIONS,$TOTAL" >> "$PROGRESS_FILE"
    CHANGE_INDICATOR=" (first entry logged)"
fi

echo "================================================"
echo "Vale Report - $DATE"
echo "================================================"
echo ""

echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo "Suggestions: $SUGGESTIONS"
echo "Total: $TOTAL"
echo "$CHANGE_INDICATOR"
echo ""

echo "Top Warning Rules:"
jq -r '[.[] | .[] | select(.Severity == "warning") | .Check] | group_by(.) | map({rule: .[0], count: length}) | sort_by(-.count) | .[:5] | .[] | "\(.count)\t\(.rule)"' vale-report.json | column -t -s $'\t'
echo ""

echo "Top Files to Fix:"
jq -r 'to_entries | map({file: .key, count: [.value[] | select(.Severity == "warning")] | length}) | map(select(.count > 0)) | sort_by(-.count) | .[:15] | .[] | "\(.count)\t\(.file)"' vale-report.json | column -t -s $'\t'
echo ""

echo "================================================"
echo "Progress tracking: $PROGRESS_FILE"
echo "View progress: cat $PROGRESS_FILE"
echo ""
echo "To fix a file:"
echo "   vale docs/path/to/file.md"
echo "   vim docs/path/to/file.md"
echo "================================================"
