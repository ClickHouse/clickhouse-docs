#!/bin/bash

script_dir=$(dirname "$0")
parent_dir=$(realpath "$script_dir")
current_year="$(date +%Y)"
previous_year="$(($current_year - 1))"
changelog_dir="$parent_dir/../docs/whats-new/changelog"

echo "Running Changelog Generation Script"
echo "Current year: $current_year"

# Step 1: Archive previous year if needed
previous_year_file="$changelog_dir/${previous_year}.md"
if [ ! -f "$previous_year_file" ] && grep -q "^# $previous_year Changelog" "$parent_dir/tmp/CHANGELOG.md"; then
    echo "Archiving $previous_year changelog to ${previous_year}.md..."
    
    cat > "$previous_year_file" << EOF
---
slug: /whats-new/changelog/$previous_year
sidebar_position: -$previous_year
sidebar_label: '$previous_year'
title: '$previous_year Changelog'
description: 'Changelog for $previous_year'
keywords: ['ClickHouse $previous_year', 'changelog $previous_year', 'release notes', 'version history', 'new features']
doc_type: 'changelog'
---

EOF
    
    sed -n "/^# $previous_year Changelog/,\$p" "$parent_dir/tmp/CHANGELOG.md" | \
    sed "1d" | \
    sed -E 's/### <a id="([0-9]+)"><\/a> (.*)/### \2 {#\1}/g' >> "$previous_year_file"
    
    echo "$previous_year changelog archived."
fi

# Step 2: Generate index.md with current year (fully dynamic)
cat > "$changelog_dir/index.md" << EOF
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

# Step 3: Add content or "no releases yet" note
if grep -q "^# $current_year Changelog" "$parent_dir/tmp/CHANGELOG.md"; then
    echo "Generating $current_year Changelog..."
    sed -n "/^# $current_year Changelog/,\$p" "$parent_dir/tmp/CHANGELOG.md" | \
    sed "1d" | \
    sed -E 's/### <a id="([0-9]+)"><\/a> (.*)/### \2 {#\1}/g' >> "$changelog_dir/index.md"
    echo "$current_year Changelog updated."
else
    echo "No releases yet for $current_year."
    echo -e ":::note\nThere have been no new releases yet for $current_year.\nView changelog for the year [$previous_year](/docs/whats-new/changelog/$previous_year).\n:::" >> "$changelog_dir/index.md"
fi
