#!/usr/bin/env bash

# --- Script Configuration ---
SCRIPT_NAME=$(basename "$0")
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
# Determine target directory assuming script is in project_root/scripts/settings/
target_dir=$(dirname "$(dirname "$SCRIPT_DIR")") # Should be project root: .../clickhouse-docs
# Temporary directory within the target project structure
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

# Function to get architecture name for download URLs (handles macOS arm64)
get_arch() {
  local arch_raw
  arch_raw=$(uname -m)
  case "$arch_raw" in
    x86_64) echo "amd64" ;;   # For x86_64 Linux / Intel Macs
    aarch64) echo "arm64" ;;  # For aarch64 Linux
    arm64) echo "arm64" ;;    # For arm64 macOS (Apple Silicon) -> maps to arm64 download
    *) echo "" ;;             # Return empty for other architectures
  esac
}


# --- Dependency Checks ---
for cmd in bash curl uname mv chmod rm mkdir find cat grep sed ls pwd sort head tar; do
    if ! command_exists $cmd; then
        echo "[$SCRIPT_NAME] Error: Required command '$cmd' not found!"
        exit 1
    fi
done
echo "[$SCRIPT_NAME] All basic dependencies found."

# --- Installation Function 1 (Fallback: TGZ Download/Extract) ---
# install_clickhouse_via_tgz() {
#   echo "[$SCRIPT_NAME] Attempting install via TGZ download..."

#   # Determine architecture
#   local arch=$(get_arch)
#   if [ -z "$arch" ]; then
#       echo "[$SCRIPT_NAME] Error (TGZ): Unsupported architecture: $(uname -m)"
#       return 1
#   fi
#   echo "[$SCRIPT_NAME] Detected architecture for TGZ: $arch"

#   # Find the latest STABLE version number via version_date.tsv
#   echo "[$SCRIPT_NAME] Finding latest STABLE version via version_date.tsv..."
#   local tsv_url="https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv"
#   local latest_numeric_version

#   latest_numeric_version=$(curl -fsSL "$tsv_url" | \
#                            grep -E '\s+v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(-stable)?\s+' | \
#                            sed -E 's/.*\s+(v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(-stable)?)\s+.*/\1/' | \
#                            sed -E 's/^v//; s/-stable$//' | \
#                            sort -V -r | head -n 1)
#   if [ -z "$latest_numeric_version" ]; then
#       echo "[$SCRIPT_NAME] Warning (TGZ): No recent '-stable' or numeric tag found in TSV via primary pattern. Falling back..."
#       latest_numeric_version=$(curl -fsSL "$tsv_url" | \
#                            grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | \
#                            sort -V -r | head -n 1)
#   fi
#   if [ -z "$latest_numeric_version" ]; then
#     echo "[$SCRIPT_NAME] Error (TGZ): Could not determine the latest stable version from $tsv_url."
#     return 1
#   fi
#   echo "[$SCRIPT_NAME] Latest stable version found: $latest_numeric_version"

#   # Construct the TGZ download URL (using stable channel)
#   local channel="stable"
#   local download_url="https://packages.clickhouse.com/tgz/${channel}/clickhouse-common-static-${latest_numeric_version}-${arch}.tgz"
#   local temp_tgz_file="./clickhouse_${channel}_${latest_numeric_version}.tgz" # Relative path

#   echo "[$SCRIPT_NAME] Using download URL: $download_url"
#   echo "[$SCRIPT_NAME] Downloading ClickHouse TGZ (version $latest_numeric_version)..."
#   if ! curl -fSL -o "$temp_tgz_file" "$download_url"; then
#       echo "[$SCRIPT_NAME] Error (TGZ): Failed to download ClickHouse TGZ (URL: $download_url)"
#       rm -f "$temp_tgz_file"; return 1;
#   fi
#   echo "[$SCRIPT_NAME] TGZ downloaded successfully to $temp_tgz_file"

#   echo "[$SCRIPT_NAME] Verifying downloaded file type..."
#    if ! file "$temp_tgz_file" | grep -q 'gzip compressed data'; then
#       echo "[$SCRIPT_NAME] Error (TGZ): Downloaded file $temp_tgz_file is not a valid gzip archive."
#       file "$temp_tgz_file"; echo "[$SCRIPT_NAME] File head:"; head "$temp_tgz_file"; rm -f "$temp_tgz_file"; return 1;
#   fi

#   echo "[$SCRIPT_NAME] Extracting binary from TGZ..."
#   local extract_dir="./extract_${latest_numeric_version}" # Relative path
#   mkdir -p "$extract_dir" || { echo "[$SCRIPT_NAME] Error (TGZ): Failed to create extraction directory $extract_dir"; rm -f "$temp_tgz_file"; return 1; }

#   if ! tar -xzf "$temp_tgz_file" -C "$extract_dir"; then
#     echo "[$SCRIPT_NAME] Error (TGZ): Failed to extract ClickHouse archive $temp_tgz_file"
#     rm -f "$temp_tgz_file"; rm -rf "$extract_dir"; return 1;
#   fi

#   echo "[$SCRIPT_NAME] Searching for extracted binary in $extract_dir..."
#   # Use find without -executable for macOS compatibility
#   local extracted_bin=$(find "$extract_dir" -name "clickhouse" -type f | head -n 1)
#   if [ -z "$extracted_bin" ]; then
#     echo "[$SCRIPT_NAME] Error (TGZ): ClickHouse binary not found in extracted archive at $extract_dir"; echo "Contents:"; find "$extract_dir"; rm -f "$temp_tgz_file"; rm -rf "$extract_dir"; return 1;
#   fi
#   echo "[$SCRIPT_NAME] Found extracted binary at: $extracted_bin"

#   echo "[$SCRIPT_NAME] Moving binary to $script_path" # script_path is ./clickhouse
#   mv "$extracted_bin" "$script_path" || { echo "[$SCRIPT_NAME] Error (TGZ): Failed to move binary to $script_path"; rm -f "$temp_tgz_file"; rm -rf "$extract_dir"; return 1; }

#   chmod +x "$script_path" || { echo "[$SCRIPT_NAME] Error (TGZ): Failed to set execute permission on $script_path"; rm -f "$script_path"; rm -f "$temp_tgz_file"; rm -rf "$extract_dir"; return 1; }

#   echo "[$SCRIPT_NAME] Verifying ClickHouse binary (TGZ method)..."
#   local version_output
#   version_output=$("$script_path" --version 2> /dev/null)
#   local exit_code=$?
#   if [ $exit_code -ne 0 ]; then
#     echo "[$SCRIPT_NAME] Error (TGZ): ClickHouse binary downloaded but not functioning correctly (Exit code: $exit_code)"; "$script_path" --version; rm -f "$script_path"; rm -f "$temp_tgz_file"; rm -rf "$extract_dir"; return 1;
#   fi
#   echo "[$SCRIPT_NAME] ClickHouse binary (TGZ method) verified successfully. Version: $version_output"

#   echo "[$SCRIPT_NAME] Cleaning up temporary TGZ download files..."
#   rm -f "$temp_tgz_file"
#   rm -rf "$extract_dir"
#   rm -rf "./clickhouse-common-static"* # Older cleanup pattern relative to CWD

#   echo "[$SCRIPT_NAME] Clickhouse binary installed successfully from TGZ to $script_path"
#   return 0 # Success
# }


# --- Installation Function 2 (Primary: Official Script) ---
install_clickhouse_via_script() {
  echo "[$SCRIPT_NAME] Attempting install via official script (curl | sh) into current directory ($tmp_dir)..."
  local install_script_path="./install_clickhouse.sh"
  local install_success=true

  # Download the installer script
  if ! curl -fsSL -o "$install_script_path" https://clickhouse.com/; then
      echo "[$SCRIPT_NAME] Error (Script): Failed to download the official install script from https://clickhouse.com/"
      rm -f "$install_script_path"
      return 1
  fi

  echo "[$SCRIPT_NAME] Downloaded install script. Executing..."
  chmod +x "$install_script_path" || echo "[$SCRIPT_NAME] Warning (Script): Could not chmod install script."

  # Execute the downloaded script using bash
  if ! bash "$install_script_path"; then
      echo "[$SCRIPT_NAME] Error (Script): The official install script failed. See output above."
      install_success=false
  fi
  rm -f "$install_script_path" # Clean up installer script

  if ! $install_success; then return 1; fi
  echo "[$SCRIPT_NAME] Official install script finished."

  # --- Verification Steps ---
  if [[ ! -f "$script_path" ]]; then # Checks for ./clickhouse
      echo "[$SCRIPT_NAME] Error (Script): ClickHouse binary not found at '$script_path' after running install script."
      ls -lA .; return 1;
  fi
  echo "[$SCRIPT_NAME] Found binary at '$script_path'."
  chmod +x "$script_path" || { echo "[$SCRIPT_NAME] Error (Script): Failed to set execute permission on '$script_path'"; return 1; }

  echo "[$SCRIPT_NAME] Verifying downloaded binary '$script_path' (Script method)..."
  local version_output
  version_output=$("$script_path" --version 2> /dev/null)
  local exit_code=$?

  if [ $exit_code -eq 0 ]; then
    echo "[$SCRIPT_NAME] ClickHouse binary (Script method) installed and verified successfully at '$script_path'"
    echo "[$SCRIPT_NAME] Installed version info: $version_output"
    return 0 # Success
  else
    echo "[$SCRIPT_NAME] Error (Script): Downloaded binary '$script_path' is not functioning correctly (Exit code: $exit_code)."
    "$script_path" --version # Show error output
    rm -f "$script_path"; return 1; # Failure
  fi
}

# --- Main Script Logic ---

INSTALL_SUCCESS=false
# Check if the binary already exists and works
if [ -f "$script_path" ]; then
  echo "[$SCRIPT_NAME] Found existing binary at $script_path. Verifying..."
  chmod +x "$script_path" || echo "[$SCRIPT_NAME] Warning: Could not set executable permission on existing binary."
  existing_version_output=$("$script_path" --version 2> /dev/null)
  if [ $? -eq 0 ]; then
    echo "[$SCRIPT_NAME] Using existing, working clickhouse binary at $script_path"
    echo "[$SCRIPT_NAME] Existing version info: $existing_version_output"
    INSTALL_SUCCESS=true
  else
    echo "[$SCRIPT_NAME] Existing binary at $script_path is not working. Attempting installation..."
    rm -f "$script_path"
    # Try primary method first
    if install_clickhouse_via_script; then
      INSTALL_SUCCESS=true
    else
      # echo "[$SCRIPT_NAME] Install via script (curl | sh) failed. Attempting fallback to TGZ..."
      # if install_clickhouse_via_tgz; then
      #   INSTALL_SUCCESS=true
      # fi
      INSTALL_SUCCESS=false
    fi
  fi
else
  echo "[$SCRIPT_NAME] ClickHouse binary not found at $script_path. Attempting primary install via script..."
   # Try primary method first
  if install_clickhouse_via_script; then
    INSTALL_SUCCESS=true
  else
      # echo "[$SCRIPT_NAME] Primary install via script failed. Attempting fallback TGZ install..."
      # if install_clickhouse_via_tgz; then
      #   INSTALL_SUCCESS=true
      # fi
      INSTALL_SUCCESS=false
  fi
fi

# Check final install status
if ! $INSTALL_SUCCESS; then
    echo "[$SCRIPT_NAME] FATAL: All installation methods failed."
    cd .. || echo "[$SCRIPT_NAME] Warning: Failed to cd back to parent directory before exiting."
    exit 1
fi

# --- Auto-generate Settings Documentation ---
# Source files are assumed to be present in the CWD ($tmp_dir) by copy-clickhouse-repo-docs
echo "[$SCRIPT_NAME] Auto-generating settings markdown pages..."
# $target_dir is the project root (clickhouse-docs)

sql_files_found=$(find "$SCRIPT_DIR" -maxdepth 1 -name '*.sql' -print -quit)
if [ -z "$sql_files_found" ]; then
    echo "[$SCRIPT_NAME] Warning: No *.sql files found in $SCRIPT_DIR to process."
else
    for SQL_FILE in "$SCRIPT_DIR"/*.sql; do
      if [ -f "$SQL_FILE" ]; then
        echo "[$SCRIPT_NAME] Processing SQL file: $SQL_FILE"
        # Run ClickHouse from CWD ($tmp_dir), passing absolute path to SQL file
        "$script_path" --queries-file "$SQL_FILE" || {
            echo "[$SCRIPT_NAME] FATAL: Failed to execute queries in $SQL_FILE.";
            echo "[$SCRIPT_NAME] Attempting to re-run with output:"
            "$script_path" --queries-file "$SQL_FILE"
            exit 1;
           }
      fi
    done
fi

# --- temporary sed replacements ---
sed -i.bak \
  -e 's/Limit the max number of partitions that can be accessed in one query. <= 0 means unlimited./Limit the max number of partitions that can be accessed in one query. `<=` 0 means unlimited./g' \
  -e 's/\(this merge is created when set min_age_to_force_merge_seconds > 0 and min_age_to_force_merge_on_partition_only = true\)/(this merge is created when set `min_age_to_force_merge_seconds > 0` and `min_age_to_force_merge_on_partition_only = true`)/g' \
  -e 's/If >= 1, columns will be always written in full serialization\./If `>= 1`, columns will be always written in full serialization./g' \
  -e 's#<candidate partitions for mutations only (partitions that cannot be merged)>/<candidate partitions for mutations>#`<candidate partitions for mutations only (partitions that cannot be merged)>/<candidate partitions for mutations>`#g' \
  -e 's#(<part>/columns and <part>/checksums)#`(<part>/columns and <part>/checksums)`#g' \
  "$tmp_dir"/generated_merge_tree_settings.md > /dev/null

# --- Move Generated Files ---
# Define destination paths relative to the project root ($target_dir)
move_src_files=("settings-formats.md" "settings.md" "server_settings.md")
move_dest_files=(
    "docs/operations/settings/settings-formats.md"
    "docs/operations/settings/settings.md"
    "docs/operations/server-configuration-parameters/settings.md"
)
append_src_files=("generated_merge_tree_settings.md" "experimental-settings.md" "beta-settings.md")
append_dest_files=(
    "docs/operations/settings/merge-tree-settings.md"
    "docs/about-us/beta-and-experimental-features.md"
    "docs/about-us/beta-and-experimental-features.md"
)

echo "[$SCRIPT_NAME] Moving generated markdown files to documentation directories..."
# Iterate using index; declare loop variables WITHOUT 'local'
for i in "${!move_src_files[@]}"; do
    src_file="${move_src_files[i]}"
    # Construct full destination path using $target_dir (project root)
    dest_full_path="$target_dir/${move_dest_files[i]}"
    # Source file is relative to CWD ($tmp_dir)
    src_rel_path="./$src_file"

    if [ -f "$src_rel_path" ]; then
        # Ensure destination directory exists
        mkdir -p "$(dirname "$dest_full_path")" || { echo "[$SCRIPT_NAME] Error: Failed to create directory for $dest_full_path"; exit 1; }
        echo "[$SCRIPT_NAME] Moving $src_rel_path to $dest_full_path"
        # Use correct source and destination paths
        mv "$src_rel_path" "$dest_full_path" || { echo "[$SCRIPT_NAME] Error: Failed to move $src_file to $dest_full_path"; exit 1; }
    else
        echo "[$SCRIPT_NAME] Warning: Expected output file $src_rel_path not found in $tmp_dir. Skipping move."
    fi
done

echo "[$SCRIPT_NAME] Appending generated markdown files to documentation directories..."
# Iterate using index; declare loop variables WITHOUT 'local'
for i in "${!append_src_files[@]}"; do
     src_file="${append_src_files[i]}"
     # Construct full destination path using $target_dir (project root)
     dest_full_path="$target_dir/${append_dest_files[i]}"
     # Source file is relative to CWD ($tmp_dir)
     src_rel_path="./$src_file"

     if [ -f "$src_rel_path" ]; then
        # Ensure destination directory exists
        mkdir -p "$(dirname "$dest_full_path")" || { echo "[$SCRIPT_NAME] Error: Failed to create directory for $dest_full_path"; exit 1; }
        echo "[$SCRIPT_NAME] Appending $src_rel_path to $dest_full_path"
        # Use correct source path
        cat "$src_rel_path" >> "$dest_full_path" || { echo "[$SCRIPT_NAME] Error: Failed to append $src_file to $dest_full_path"; exit 1; }
        # Remove source file after successful append (optional, good cleanup)
        rm -f "$src_rel_path"
     else
        echo "[$SCRIPT_NAME] Warning: Expected output file $src_rel_path not found in $tmp_dir. Skipping append."
     fi
done

# --- Final Cleanup ---
echo "[$SCRIPT_NAME] Performing final cleanup..."
# Determine parent dir of tmp_dir for cd step
parent_of_tmp=$(dirname "$tmp_dir")
cd "$parent_of_tmp" || echo "[$SCRIPT_NAME] Warning: Failed to cd back to parent directory $parent_of_tmp before cleanup."
echo "[$SCRIPT_NAME] Removing contents of temporary directory: $tmp_dir"
# Use full path for removal just in case cd failed
rm -rf "$tmp_dir"/*
rmdir "$tmp_dir" 2>/dev/null || echo "[$SCRIPT_NAME] Info: Did not remove $tmp_dir (might contain hidden files or already gone)."

echo "[$SCRIPT_NAME] Auto-generation of settings markdown pages completed successfully."
exit 0
