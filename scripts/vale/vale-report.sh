#!/bin/bash
# vale-report.sh - Generate Vale report

vale docs/ \
  --glob='!docs/whats-new/**/*.md' \
  --output=JSON > vale-report.json 2>&1

# Check if vale-report.json is valid JSON
if ! jq empty vale-report.json 2>/dev/null; then
    echo "❌ Error: Vale did not produce valid JSON output"
    echo ""
    echo "Vale output:"
    cat vale-report.json
    exit 1
fi

echo "================================================"
echo "📝 Vale Report - $(date '+%Y-%m-%d')"
echo "================================================"
echo ""

WARNINGS=$(jq '[.[] | .[] | select(.Severity == "warning")] | length' vale-report.json)
SUGGESTIONS=$(jq '[.[] | .[] | select(.Severity == "suggestion")] | length' vale-report.json)

echo "⚠️  Warnings: $WARNINGS"
echo "💡 Suggestions: $SUGGESTIONS"
echo ""

echo "📋 Top Warning Rules:"
jq -r '[.[] | .[] | select(.Severity == "warning") | .Check] | group_by(.) | map({rule: .[0], count: length}) | sort_by(-.count) | .[:5] | .[] | "\(.count)\t\(.rule)"' vale-report.json | column -t -s $'\t'
echo ""

echo "📁 Top Files to Fix:"
jq -r 'to_entries | map({file: .key, count: [.value[] | select(.Severity == "warning")] | length}) | map(select(.count > 0)) | sort_by(-.count) | .[:15] | .[] | "\(.count)\t\(.file)"' vale-report.json | column -t -s $'\t'
echo ""

echo "================================================"
echo "✅ To fix a file:"
echo "   vale docs/path/to/file.md"
echo "   vim docs/path/to/file.md"
echo "================================================"