#! ./bin/bash
echo "Copying placeholder files over generated content"
PLACEHOLDER=docs/_placeholders 
DOCS=docs

FOLDERS_TO_REMOVE="docs/development docs/engines docs/interfaces docs/operations docs/sql-reference"
IFS=' ' read -ra FOLDER_ARRAY <<< "$FOLDERS_TO_REMOVE"

echo "Removing ClickHouse/ClickHouse repository folders..."

# Loop through each folder and remove it
for folder in "${FOLDER_ARRAY[@]}"; do
    if [ -d "$folder" ]; then
        echo "Removing directory: $folder"
        rm -rf "$folder"
        echo "✓ Removed: $folder"
    else
        echo "⚠ Directory not found: $folder"
    fi
done

# Generate changelog index dynamically (year calculated at runtime)
current_year="$(date +%Y)"
cat > "$DOCS/whats-new/changelog/index.md" << EOF
---
description: 'Changelog for $current_year'
note: 'This file is generated with yarn build'
slug: /whats-new/changelog/
sidebar_position: -9998
sidebar_label: '$current_year'
title: 'Changelog $current_year'
doc_type: 'changelog'
---

EOF
echo "Changelog placeholder generated for $current_year"
echo "----END----"
