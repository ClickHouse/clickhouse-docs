#!/usr/bin/env bash

# --- Script Configuration ---
SCRIPT_NAME=$(basename "$0")
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
# Determine target directory assuming script is in project_root/scripts/settings/
target_dir=$(dirname "$(dirname "$SCRIPT_DIR")") # Should be project root: .../clickhouse-docs
tmp_dir="$target_dir/scripts/tmp"

# --- Ensure temporary directory exists ---
mkdir -p "$tmp_dir" || { echo "[$SCRIPT_NAME] Error: Failed to create temporary directory $tmp_dir"; exit 1; }
cd "$tmp_dir" || { echo "[$SCRIPT_NAME] Error: Failed to change directory to $tmp_dir"; exit 1; }
echo "[$SCRIPT_NAME] Changed working directory to: $(pwd)"

# --- Target Binary Configuration ---
script_filename="clickhouse"
script_path="./$script_filename" # Relative path within tmp_dir

# --- Helper Functions ---
command_exists() {
  command -v "$1" &> /dev/null
}

# --- Dependency Checks ---
for cmd in bash curl uname mv chmod rm mkdir find cat grep sed ls pwd; do
    if ! command_exists $cmd; then
        echo "[$SCRIPT_NAME] Error: Required command '$cmd' not found!"
        exit 1
    fi
done
# file command is useful but not strictly required for core logic if verification is removed/simplified
# if ! command_exists file; then
#     echo "[$SCRIPT_NAME] Warning: 'file' command not found. Cannot verify downloaded file type."
# fi
echo "[$SCRIPT_NAME] All basic dependencies found."


# --- Core Installation Function (Official Script) ---
install_clickhouse_via_script() {
  echo "[$SCRIPT_NAME] Installing clickhouse binary via official script (curl | sh) into current directory ($tmp_dir)..."
  local install_script_path="./install_clickhouse.sh"
  local install_success=true

  # Download the installer script
  if ! curl -fsSL -o "$install_script_path" https://clickhouse.com/; then
      echo "[$SCRIPT_NAME] Error: Failed to download the official install script from https://clickhouse.com/"
      rm -f "$install_script_path"
      return 1
  fi

  echo "[$SCRIPT_NAME] Downloaded install script. Executing..."
  chmod +x "$install_script_path" || echo "[$SCRIPT_NAME] Warning: Could not chmod install script."

  # Execute the downloaded script using bash
  if ! bash "$install_script_path"; then
      echo "[$SCRIPT_NAME] Error: The official install script failed. See output above."
      install_success=false
  fi
  rm -f "$install_script_path" # Clean up installer script

  if ! $install_success; then return 1; fi
  echo "[$SCRIPT_NAME] Official install script finished."

  # --- Verification Steps ---
  if [[ ! -f "$script_path" ]]; then
      echo "[$SCRIPT_NAME] Error: ClickHouse binary not found at '$script_path' after running install script."
      ls -lA .; return 1; # Keep ls here to show state on error
  fi
  echo "[$SCRIPT_NAME] Found binary at '$script_path'."
  chmod +x "$script_path" || { echo "[$SCRIPT_NAME] Error: Failed to set execute permission on '$script_path'"; return 1; }

  echo "[$SCRIPT_NAME] Verifying downloaded binary '$script_path'..."
  local version_output # local is OK here as it's inside a function
  version_output=$("$script_path" --version 2> /dev/null)
  local exit_code=$? # local is OK here

  if [ $exit_code -eq 0 ]; then
    echo "[$SCRIPT_NAME] ClickHouse binary installed and verified successfully at '$script_path'"
    echo "[$SCRIPT_NAME] Installed version info: $version_output"
    return 0
  else
    echo "[$SCRIPT_NAME] Error: Downloaded binary '$script_path' is not functioning correctly (Exit code: $exit_code)."
    # Attempt to run again to show potential error output from the binary itself
    "$script_path" --version
    rm -f "$script_path"; return 1;
  fi
}

# --- Main Script Logic ---

# Check if the binary already exists and works
if [ -f "$script_path" ]; then
  echo "[$SCRIPT_NAME] Found existing binary at $script_path. Verifying..."
  chmod +x "$script_path" || echo "[$SCRIPT_NAME] Warning: Could not set executable permission on existing binary."
  existing_version_output=$("$script_path" --version 2> /dev/null) # Not using local here (global scope)
  if [ $? -eq 0 ]; then
    echo "[$SCRIPT_NAME] Using existing, working clickhouse binary at $script_path"
    echo "[$SCRIPT_NAME] Existing version info: $existing_version_output"
  else
    echo "[$SCRIPT_NAME] Existing binary at $script_path is not working. Attempting installation..."
    rm -f "$script_path"
    install_clickhouse_via_script || { echo "[$SCRIPT_NAME] FATAL: Failed to install clickhouse binary via script."; exit 1; }
  fi
else
  echo "[$SCRIPT_NAME] ClickHouse binary not found at $script_path. Installing..."
  install_clickhouse_via_script || { echo "[$SCRIPT_NAME] FATAL: Failed to install clickhouse binary via script."; exit 1; }
fi

# --- Auto-generate Settings Documentation ---
# Source files are assumed to be present in the CWD ($tmp_dir) by an external script
echo "[$SCRIPT_NAME] Auto-generating settings markdown pages..."
root=$(dirname "$target_dir")

sql_files_found=$(find "$SCRIPT_DIR" -maxdepth 1 -name '*.sql' -print -quit)
if [ -z "$sql_files_found" ]; then
    echo "[$SCRIPT_NAME] Warning: No *.sql files found in $SCRIPT_DIR to process."
else
    for SQL_FILE in "$SCRIPT_DIR"/*.sql; do
      if [ -f "$SQL_FILE" ]; then
        echo "[$SCRIPT_NAME] Processing SQL file: $SQL_FILE"
        "$script_path" --queries-file "$SQL_FILE" || {
            echo "[$SCRIPT_NAME] FATAL: Failed to execute queries in $SQL_FILE.";
            echo "[$SCRIPT_NAME] Attempting to re-run with output:"
            "$script_path" --queries-file "$SQL_FILE"
            exit 1;
           }
      fi
    done
fi

--- Move Generated Files ---
move_src_files=("settings-formats.md" "settings.md" "server_settings.md")
move_dest_files=(
    "docs/operations/settings/settings-formats.md"
    "docs/operations/settings/settings.md"
    "docs/operations/server-configuration-parameters/settings.md"
)
append_src_files=("generated_merge_tree_settings.md" "experimental-settings.md" "beta-settings.md")
append_dest_files=(
    "docs/operations/settings/merge-tree-settings.md"
    "docs/settings/beta-and-experimental-features.md"
    "docs/settings/beta-and-experimental-features.md"
)

echo "[$SCRIPT_NAME] Moving generated markdown files to documentation directories..."
# Iterate using index; declare loop variables WITHOUT 'local'
for i in "${!move_src_files[@]}"; do
    src_file="${move_src_files[i]}"
    dest_file="${move_dest_files[i]}"
    if [ -f "./$src_file" ]; then
        echo "[$SCRIPT_NAME] Moving $tmp_dir/$src_file to $target_dir/$dest_file"
        mv "$tmp_dir/$src_file" "$target_dir/$dest_file" || { echo "[$SCRIPT_NAME] Error: Failed to move $src_file to $target_dir/$dest_file"; exit 1; }
    else
        echo "[$SCRIPT_NAME] Warning: Expected output file ./$src_file not found in $tmp_dir. Skipping move."
    fi
done

echo "[$SCRIPT_NAME] Appending generated markdown files to documentation directories..."
# Iterate using index; declare loop variables WITHOUT 'local'
for i in "${!append_src_files[@]}"; do
     src_file="${append_src_files[i]}"
     dest_file="${append_dest_files[i]}"
     if [ -f "./$src_file" ]; then
        echo "[$SCRIPT_NAME] Appending $tmp_dir/$src_file to $target_dir/$dest_file"
        cat "$tmp_dir/$src_file" >> "$target_dir/$dest_file" || { echo "[$SCRIPT_NAME] Error: Failed to append $src_file to $dest_file"; exit 1; }
     else
        echo "[$SCRIPT_NAME] Warning: Expected output file ./$src_file not found in $tmp_dir. Skipping append."
     fi
done


--- Final Cleanup ---
echo "[$SCRIPT_NAME] Performing final cleanup..."
cd .. || echo "[$SCRIPT_NAME] Warning: Failed to cd back to $target_dir before cleanup."
echo "[$SCRIPT_NAME] Removing contents of temporary directory: $tmp_dir"
rm -rf "$tmp_dir"/*
rmdir "$tmp_dir" 2>/dev/null || echo "[$SCRIPT_NAME] Info: Did not remove $tmp_dir (might contain hidden files or already gone)."

echo "[$SCRIPT_NAME] Auto-generation of settings markdown pages completed successfully."
exit 0
