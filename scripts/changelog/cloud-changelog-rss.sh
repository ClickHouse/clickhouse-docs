#!/bin/bash

# Configuration
export LC_ALL=C
export LANG=C

CHANGELOG_FILE="docs/cloud/reference/01_changelog/01_changelog.md"
OUTPUT_FILE="static/cloud/changelog-rss.xml"
FEED_URL="https://clickhouse.com/docs/cloud/changelog-rss.xml"
SITE_URL="https://clickhouse.com/docs/cloud/whats-new/cloud"

# XML escape function
escape_xml() {
    echo "$1" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g; s/'\''/\&apos;/g'
}

# Convert date to RFC822 format
date_to_rfc822() {
    local date_str="$1"
    date -d "$date_str" -R 2>/dev/null || date -j -f "%B %d, %Y" "$date_str" "+%a, %d %b %Y 00:00:00 %z" 2>/dev/null
}

# Remove markdown formatting
clean_markdown() {
    local text="$1"
    echo "$text" | perl -pe '
        s/\[([^\]]+)\]\([^\)]+\)/$1/g;
        s/`([^`]+)`/$1/g;
        s/\*\*([^\*]+)\*\*/$1/g;
        s/\*([^\*]+)\*/$1/g;
        s/_{2}([^_]+)_{2}/$1/g;
        s/_([^_]+)_/$1/g;
    '
}

# Extract features from content as plain text
extract_features() {
    local content="$1"
    local output=""
    local current_section=""
    
    while IFS= read -r line; do
        # Match section headers: ### Section Name
        if [[ "$line" =~ ^###[[:space:]]+(.+) ]]; then
            section="${BASH_REMATCH[1]}"
            section=$(echo "$section" | sed 's/ {#[^}]*}$//')
            section=$(clean_markdown "$section")
            
            if [ -n "$current_section" ]; then
                output="${output}\n"
            fi
            current_section="$section"
            output="${output}${section}:\n"
            
        # Match bold bullet points: - **Title** description
        elif [[ "$line" =~ ^[[:space:]]*[-*][[:space:]]+\*\*([^*]+)\*\*[[:space:]]*(.*) ]]; then
            title="${BASH_REMATCH[1]}"
            desc="${BASH_REMATCH[2]}"
            
            desc=$(clean_markdown "$desc" | tr '\n' ' ' | sed 's/  */ /g' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            
            if [ -n "$title" ]; then
                if [ -n "$desc" ]; then
                    output="${output}- ${title}: ${desc}\n"
                else
                    output="${output}- ${title}\n"
                fi
            fi
            
        # Match simple bullets
        elif [[ "$line" =~ ^[[:space:]]*[-*][[:space:]]+([^*].+) ]]; then
            bullet="${BASH_REMATCH[1]}"
            bullet=$(clean_markdown "$bullet" | tr '\n' ' ' | sed 's/  */ /g' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
            
            if [ ${#bullet} -gt 3 ]; then
                output="${output}- ${bullet}\n"
            fi
        fi
    done <<< "$content"
    
    if [ -n "$output" ]; then
        echo -e "$output"
    else
        echo "See full changelog for details."
    fi
}

# Generate RSS feed
generate_rss() {
    local entries="$1"
    
    cat > "$OUTPUT_FILE" << EOF
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ClickHouse Cloud Changelog</title>
    <link>${SITE_URL}</link>
    <description>Latest updates and features in ClickHouse Cloud</description>
    <language>en-us</language>
    <lastBuildDate>$(date -R 2>/dev/null || date "+%a, %d %b %Y %H:%M:%S %z")</lastBuildDate>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
EOF
}

# Main processing
main() {
    if ! command -v perl &> /dev/null; then
        echo "Error: perl is required but not installed."
        exit 1
    fi
    
    if [ ! -f "$CHANGELOG_FILE" ]; then
        echo "Error: Changelog file not found: $CHANGELOG_FILE"
        exit 1
    fi
    
    echo "Parsing changelog: $CHANGELOG_FILE"
    
    local items=""
    local count=0
    local in_release=0
    local current_title=""
    local current_slug=""
    local current_date=""
    local current_content=""
    
    while IFS= read -r line; do
        if [[ "$line" =~ ^##[[:space:]]+(.+)[[:space:]]+\{#([^}]+)\} ]]; then
            if [ $in_release -eq 1 ]; then
                description=$(extract_features "$current_content")
                description=$(escape_xml "$description")
                rfc_date=$(date_to_rfc822 "$current_date")
                
                items="${items}    <item>
      <title>$(escape_xml "ClickHouse Cloud - $current_title")</title>
      <link>${SITE_URL}#${current_slug}</link>
      <description>${description}</description>
      <pubDate>${rfc_date}</pubDate>
      <guid isPermaLink=\"true\">${SITE_URL}#${current_slug}</guid>
    </item>
"
                ((count++))
            fi
            
            current_title="${BASH_REMATCH[1]}"
            current_slug="${BASH_REMATCH[2]}"
            current_date="$current_title"
            current_content=""
            in_release=1
            
        elif [ $in_release -eq 1 ]; then
            current_content="${current_content}${line}"$'\n'
        fi
        
    done < "$CHANGELOG_FILE"
    
    if [ $in_release -eq 1 ]; then
        description=$(extract_features "$current_content")
        description=$(escape_xml "$description")
        rfc_date=$(date_to_rfc822 "$current_date")
        
        items="${items}    <item>
      <title>$(escape_xml "ClickHouse Cloud - $current_title")</title>
      <link>${SITE_URL}#${current_slug}</link>
      <description>${description}</description>
      <pubDate>${rfc_date}</pubDate>
      <guid isPermaLink=\"true\">${SITE_URL}#${current_slug}</guid>
    </item>
"
    fi
    
    echo "Generated $count entries"
    
    mkdir -p "$(dirname "$OUTPUT_FILE")"
    
    generate_rss "$items"
    
    echo "RSS feed written to $OUTPUT_FILE"
    echo "Feed will be available at: ${FEED_URL}"
}

main
