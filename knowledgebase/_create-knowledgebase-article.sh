#!/bin/bash

# Get todays date.
article_date=$(date +"%Y-%m-%d")

# Grab the article title and description from the user's input.
read -p "Enter article title: " article_title
read -p "Enter a short description for this article: " article_description

# Slugify the title.
slugified_title=$(echo "$article_title.gc" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

# Add a .md using the below template.
touch "$slugified_title.md"
cat > "$slugified_title.md" <<EOF
---
title: "$article_title.gc"
description: "$article_description"
date: $article_date
---
EOF

# Done.
