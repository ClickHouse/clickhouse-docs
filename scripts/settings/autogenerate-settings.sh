#!/usr/bin/env bash

if ! command -v bash &> /dev/null; then
    echo "Error: bash not found!"
    exit 1
fi

# always run "yarn copy-clickhouse-repo-docs" before invoking this script
# otherwise it will fail not being able to find the files it needs which
# are copied to scripts/tmp and configured in package.json -> "autogen_settings_needed_files"

if command -v curl >/dev/null 2>&1; then
  echo "curl is installed"
else
  echo "curl is NOT installed"
  exit 1
fi

target_dir=$(dirname "$(dirname "$(realpath "$0")")")
SCRIPT_NAME=$(basename "$0")
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
tmp_dir="$target_dir/tmp"

mkdir -p "$tmp_dir" || exit 1
cd "$tmp_dir" || exit 1

script_url="https://clickhouse.com/"  # URL of the installation script
script_filename="clickhouse" # Choose a descriptive name
script_path="$tmp_dir/$script_filename"

# Install ClickHouse
if [ ! -f "$script_path" ]; then
  echo -e "[$SCRIPT_NAME] Installing ClickHouse binary\n"
  curl -s https://clickhouse.com/ | sh &> /dev/null
fi

if [[ ! -f "$script_path" ]]; then
  echo "Error: File not found after curl download!"
  exit 1
fi

echo "Downloaded to: $script_path"
echo "[$SCRIPT_NAME] Auto-generating settings"
chmod +x "$script_path" || { echo "Error: Failed to set execute permission"; exit 1; }
root=$(dirname "$(dirname "$(realpath "$tmp_dir")")")

# Autogenerate settings for all .sql files in directory
for SQL_FILE in "$SCRIPT_DIR"/*.sql; do
  if [ -f "$SQL_FILE" ]; then
    ./clickhouse --queries-file "$SQL_FILE" > /dev/null || { echo "Failed to generate some settings"; exit 1; }
  fi
done

# move across files to where they need to be
mv settings-formats.md "$root/docs/operations/settings" || { echo "Failed to move generated settings-format.md"; exit 1; }
mv settings.md "$root/docs/operations/settings" || { echo "Failed to move generated settings.md"; exit 1; }
cat generated_merge_tree_settings.md >> "$root/docs/operations/settings/merge-tree-settings.md" || { echo "Failed to append MergeTree settings.md"; exit 1; }
mv server_settings.md "$root/docs/operations/server-configuration-parameters/settings.md" || { echo "Failed to move generated server_settings.md"; exit 1; }

echo "[$SCRIPT_NAME] Auto-generation of settings markdown pages completed successfully"

# perform cleanup
rm -rf "$tmp_dir"/{settings-formats.md,settings.md,FormatFactorySettings.h,Settings.cpp,generated_merge_tree_settings.md,clickhouse}

echo "[$SCRIPT_NAME] Autogenerating settings completed"
