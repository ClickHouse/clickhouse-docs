#!/bin/bash
# This script is used to generate a list of feature badges in use in the docs
# It runs as part of a weekly github action and the result is sent as a notification
# to the #docs channel in Slack.

# Default to 'docs' directory if no argument provided
DOCS_DIR="${1:-docs}"

# Check if directory exists
if [ ! -d "$DOCS_DIR" ]; then
    echo "Error: Directory '$DOCS_DIR' does not exist"
    exit 1
fi

# Components to search for
components=(
    "BetaBadge"
    "ExperimentalBadge"
    "PrivatePreviewBadge"
    "CloudNotSupportedBadge"
    "CloudOnlyBadge"
)

# Custom display names (must match order of components array)
display_names=(
    "Beta Features"
    "Experimental Features"
    "Private Preview Features"
    "Cloud Unsupported Features"
    "Cloud Only Features"
)

# Function to extract slug from a file's frontmatter
extract_slug_from_file() {
    local filepath="$1"
    local slug=""
    # Look for "slug: some/path/slug" in the file
    slug=$(grep -m 1 "^slug:" "$filepath" 2>/dev/null | sed 's/^slug:[[:space:]]*//' | tr -d '"' | tr -d "'")
    # If no slug found, return the filepath as fallback
    if [ -z "$slug" ]; then
        slug="[no slug] $filepath"
    fi
    echo "$slug"
}

# Search for each component and collect all slugs
for i in "${!components[@]}"; do
    component="${components[$i]}"
    display_name="${display_names[$i]}"
    
    echo "$display_name:"
    # Get unique files containing the component
    files=$(grep -rl --include="*.md" --include="*.mdx" --include="*.jsx" --include="*.tsx" \
        -E "<$component[[:space:]/>]|</$component>" "$DOCS_DIR" 2>/dev/null | sort -u)
    
    if [ -z "$files" ]; then
        echo "  (none)"
    else
        while IFS= read -r file; do
            if [ -n "$file" ]; then
                slug=$(extract_slug_from_file "$file")
                if [[ "$slug" == \[no\ slug\]* ]]; then
                    echo "  • $slug"
                else
                    echo "  • https://clickhouse.com/docs$slug"
                fi
            fi
        done <<< "$files"
    fi
    echo
done
