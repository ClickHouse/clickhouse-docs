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

cp $PLACEHOLDER/changelog/_index.md $DOCS/whats-new/changelog/index.md
echo "Copying completed"
echo "----END----"
