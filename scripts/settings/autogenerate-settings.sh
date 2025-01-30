#!/bin/bash

# always run "yarn copy-clickhouse-repo-docs" before invoking this script
# otherwise it will fail not being able to find the files it needs which
# are copied to scripts/tmp and configured in package.json -> "autogen_settings_needed_files"

target_dir=$(dirname "$(dirname "$(realpath "$0")")")
file="$target_dir/settings/clickhouse-temp"
SCRIPT_NAME=$(basename "$0")

cd "$target_dir/tmp" || exit

# Install ClickHouse
curl https://clickhouse.com/ | sh

echo "[$SCRIPT_NAME] Auto-generating settings"
cd .. || exit
cd settings || exit
cp autogeneration-queries.sql ../tmp
cd ..
cd tmp || exit
# Autogenerate Format settings
./clickhouse --queries-file autogeneration-queries.sql

echo "[$SCRIPT_NAME] Auto-generation of settings markdown pages completed"

# perform cleanup
rm -rf clickhouse
rm -rf "$file"
rm -rf autogeneration-queries.sql