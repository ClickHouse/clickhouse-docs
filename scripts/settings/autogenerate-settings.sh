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
  
  # Save the installation script first
  curl -s https://clickhouse.com/ | sh &> /dev/null

  if [[ ! -f "$script_path" ]]; then
    echo "Error: File not found after curl download!"
    exit 1
  fi
  
  # Wait for the clickhouse binary to appear
  max_wait=60  # maximum wait time in seconds
  wait_time=0
  echo "Waiting for ClickHouse binary to be ready..."
  
  while [ ! -f "$script_path" ] && [ $wait_time -lt $max_wait ]; do
    sleep 1
    wait_time=$((wait_time + 1))
    echo -n "."
  done
  
  echo ""
  
  # Check if we found the binary within the timeout period
  if [ ! -f "$script_path" ]; then
    echo "Error: ClickHouse binary not found after waiting $max_wait seconds!"
    exit 1
  fi
  
  # Test that the binary is actually executable
  chmod +x "$script_path" || { echo "Error: Failed to set execute permission"; exit 1; }
  
  # Simple test to verify the binary is working
  "$script_path" --version >/dev/null 2>&1 || { 
    echo "Error: ClickHouse binary exists but is not functioning correctly!"
    exit 1
  }
fi


echo "Downloaded to: $script_path"
echo "[$SCRIPT_NAME] Auto-generating settings"
chmod +x "$script_path" || { echo "Error: Failed to set execute permission"; exit 1; }
root=$(dirname "$(dirname "$(realpath "$tmp_dir")")")

# Autogenerate settings for all .sql files in directory
for SQL_FILE in "$SCRIPT_DIR"/*.sql; do
  if [ -f "$SQL_FILE" ]; then
    echo "Running: $SQL_FILE"
    ./clickhouse --queries-file "$SQL_FILE" > /dev/null || { echo "Failed to generate some settings:" && ./clickhouse --queries-file "$SQL_FILE"; exit 1; }
  fi
done

# move across files to where they need to be
mv settings-formats.md "$root/docs/operations/settings" || { echo "Failed to move generated settings-format.md"; exit 1; }
mv settings.md "$root/docs/operations/settings" || { echo "Failed to move generated settings.md"; exit 1; }
mv server_settings.md "$root/docs/operations/server-configuration-parameters/settings.md" || { echo "Failed to move generated server_settings.md"; exit 1; }
cat generated_merge_tree_settings.md >> "$root/docs/operations/settings/merge-tree-settings.md" || { echo "Failed to append MergeTree settings.md"; exit 1; }
cat experimental-settings.md >> "$root/docs/settings/beta-and-experimental-features.md" || { echo "Failed to append experimental settings.md"; exit 1; }
cat beta-settings.md >> "$root/docs/settings/beta-and-experimental-features.md" || { echo "Failed to append beta settings.md"; exit 1; }

echo "[$SCRIPT_NAME] Auto-generation of settings markdown pages completed successfully"

# perform cleanup
rm -rf "$tmp_dir"/{settings-formats.md, settings.md, FormatFactorySettings.h, Settings.cpp, generated_merge_tree_settings.md, experimental-settings.md, clickhouse}

echo "[$SCRIPT_NAME] Autogenerating settings completed"
