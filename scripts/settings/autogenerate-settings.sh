#!/bin/bash

# always run "yarn copy-clickhouse-repo-docs" before invoking this script
# otherwise it will fail not being able to find the files it needs which
# are copied to scripts/tmp and configured in package.json -> "autogen_settings_needed_files"

target_dir=$(dirname "$(dirname "$(realpath "$0")")")
file="$target_dir/settings/clickhouse-temp"
SCRIPT_NAME=$(basename "$0")

echo "[$SCRIPT_NAME] Auto-generating settings"

# Install ClickHouse
curl -o temp_file.bin https://clickhouse.com/ && mv temp_file.bin "$file"
chmod +x "$file"
cd "$target_dir/settings" || exit

# Autogenerate Format settings
#./clickhouse-temp local --query-file 'autogeneration-queries.sql'

echo "[$SCRIPT_NAME] Auto-generation of settings markdown pages completed"

if [ ! -f ./clickhouse ]; then
  rm -rf "$file"
fi