#!/bin/bash

script_dir=$(dirname "$0")  # Get the directory of the script
parent_dir=$(realpath "$script_dir") # Get the parent directory

echo "Running Changelog Generation Script"
cp "$parent_dir/../docs/_placeholders/changelog/_index.md" "$parent_dir/../docs/whats-new/changelog/index.md"
if grep -q "^# $(date +%Y) Changelog" "$parent_dir/tmp/CHANGELOG.md"; then
  echo "Generating $(date +%Y) Changelog..."
    sed "/^# $(date +%Y) Changelog/d" "$parent_dir/tmp/CHANGELOG.md" > temp.txt
    echo "Changelog copied to temp.txt"
    cat temp.txt >> "$parent_dir/../docs/whats-new/changelog/index.md"
    echo "Changelog written to docs/en/whats-new/changelog/index.md"
    rm -f temp.txt
    echo "$(date +%Y) Changelog was updated."
else
    current_year="$(date +%Y)"
    previous_year="$(($current_year - 1))"
    echo "No Changelog found for $current_year."
    echo -e ":::note\nThere have been no new releases yet for $current_year.  \n View changelog for the year [$previous_year](/docs/whats-new/changelog/$previous_year).\n:::" >> "$parent_dir/../docs/whats-new/changelog/index.md"
fi
