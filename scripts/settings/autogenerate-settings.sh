#!/usr/bin/env bash

# --- Script Configuration ---
SCRIPT_NAME=$(basename "$0")
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
target_dir=$(dirname "$(dirname "$(realpath "$0")")")
tmp_dir="$target_dir/tmp"

# --- Ensure temporary directory exists ---
mkdir -p "$tmp_dir" || { echo "[$SCRIPT_NAME] Error: Failed to create temporary directory $tmp_dir"; exit 1; }
cd "$tmp_dir" || { echo "[$SCRIPT_NAME] Error: Failed to change directory to $tmp_dir"; exit 1; }

# --- Target Binary Configuration ---
script_filename="clickhouse" # Name of the target binary
script_path="$tmp_dir/$script_filename" # Where the binary will be placed temporarily

# --- Helper Functions ---

# Function to check if a command exists
command_exists() {
  command -v "$1" &> /dev/null
}

# Function to get architecture (amd64 or arm64)
get_arch() {
  local arch=$(uname -m)
  case "$arch" in
    x86_64) echo "amd64" ;;
    aarch64) echo "arm64" ;;
    *) echo "" ;; # Return empty for unsupported arch
  esac
}

# --- Dependency Checks ---
# Tools needed for TGZ download/extract and version finding
for cmd in bash curl grep sed sort head tar find file uname mv chmod rm mkdir; do
    if ! command_exists $cmd; then
        echo "[$SCRIPT_NAME] Error: Required command '$cmd' not found!"
        exit 1
    fi
done
echo "[$SCRIPT_NAME] All basic dependencies found."

# --- Core Installation Function (TGZ Download/Extract) ---
install_clickhouse_stable() {
  echo "[$SCRIPT_NAME] Installing stable clickhouse binary via TGZ download to $script_path"

  # Determine architecture
  local arch=$(get_arch)
  if [ -z "$arch" ]; then
      echo "[$SCRIPT_NAME] Error: Unsupported architecture: $(uname -m)"
      return 1
  fi
  echo "[$SCRIPT_NAME] Detected architecture: $arch"

  # --- Find the latest STABLE version number via version_date.tsv ---
  echo "[$SCRIPT_NAME] Finding latest STABLE version via version_date.tsv..."
  local tsv_url="https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv"
  local latest_numeric_version

  # Find the latest version tagged specifically as '-stable' or purely numeric
  latest_numeric_version=$(curl -fsSL "$tsv_url" | \
                           # Find lines with tags like vX.Y.Z.W-stable or just vX.Y.Z.W
                           grep -E '\s+v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(-stable)?\s+' | \
                           # Extract the full tag (e.g., vX.Y.Z.W-stable or vX.Y.Z.W)
                           sed -E 's/.*\s+(v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(-stable)?)\s+.*/\1/' | \
                           # Remove the leading 'v' and trailing '-stable'
                           sed -E 's/^v//; s/-stable$//' | \
                           # Version sort descending, take the top one
                           sort -V -r | head -n 1)

  # Fallback if the specific stable pattern failed
  if [ -z "$latest_numeric_version" ]; then
      echo "[$SCRIPT_NAME] Warning: No recent '-stable' or numeric tag found in TSV via primary pattern. Falling back..."
      latest_numeric_version=$(curl -fsSL "$tsv_url" | \
                           grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | \
                           sort -V -r | head -n 1)
  fi

  # Final check
  if [ -z "$latest_numeric_version" ]; then
    echo "[$SCRIPT_NAME] Error: Could not determine the latest stable version from $tsv_url."
    return 1
  fi
  echo "[$SCRIPT_NAME] Latest stable version found: $latest_numeric_version"
  # --- END Version Finding ---

  # Construct the TGZ download URL (using stable channel)
  local channel="stable"
  local download_url="https://packages.clickhouse.com/tgz/${channel}/clickhouse-common-static-${latest_numeric_version}-${arch}.tgz"
  local temp_tgz_file="$tmp_dir/clickhouse_${channel}_${latest_numeric_version}.tgz"

  echo "[$SCRIPT_NAME] Using download URL: $download_url"

  # Download the specific TGZ archive
  echo "[$SCRIPT_NAME] Downloading ClickHouse TGZ (version $latest_numeric_version)..."
  if ! curl -fSL -o "$temp_tgz_file" "$download_url"; then
      echo "[$SCRIPT_NAME] Error: Failed to download ClickHouse TGZ (URL: $download_url)"
      rm -f "$temp_tgz_file" # Clean up partial download
      return 1
  fi
  echo "[$SCRIPT_NAME] TGZ downloaded successfully to $temp_tgz_file"

  # Check downloaded file integrity (basic check if it's a gzip file)
  echo "[$SCRIPT_NAME] Verifying downloaded file type..."
   if ! file "$temp_tgz_file" | grep -q 'gzip compressed data'; then
      echo "[$SCRIPT_NAME] Error: Downloaded file $temp_tgz_file is not a valid gzip archive."
      file "$temp_tgz_file"; echo "[$SCRIPT_NAME] File head:"; head "$temp_tgz_file"; rm -f "$temp_tgz_file"; return 1;
  fi

  # Extract the binary using tar into a dedicated directory
  echo "[$SCRIPT_NAME] Extracting binary from TGZ..."
  local extract_dir="$tmp_dir/extract_${latest_numeric_version}"
  mkdir -p "$extract_dir" || { echo "[$SCRIPT_NAME] Error: Failed to create extraction directory $extract_dir"; rm -f "$temp_tgz_file"; return 1; }

  # Use tar to extract the archive
  if ! tar -xzf "$temp_tgz_file" -C "$extract_dir"; then
    echo "[$SCRIPT_NAME] Error: Failed to extract ClickHouse archive $temp_tgz_file"
    rm -f "$temp_tgz_file"; rm -rf "$extract_dir"; return 1;
  fi

  # Find the extracted binary (robustly using find)
  echo "[$SCRIPT_NAME] Searching for extracted binary in $extract_dir..."
  local extracted_bin=$(find "$extract_dir" -name "clickhouse" -type f -executable | head -n 1)
  if [ -z "$extracted_bin" ]; then
    echo "[$SCRIPT_NAME] Error: ClickHouse binary not found in extracted archive at $extract_dir"; echo "Contents:"; find "$extract_dir"; rm -f "$temp_tgz_file"; rm -rf "$extract_dir"; return 1;
  fi
  echo "[$SCRIPT_NAME] Found extracted binary at: $extracted_bin"

  # Move to the desired temporary script path
  echo "[$SCRIPT_NAME] Moving binary to $script_path"
  mv "$extracted_bin" "$script_path" || { echo "[$SCRIPT_NAME] Error: Failed to move binary to $script_path"; rm -f "$temp_tgz_file"; rm -rf "$extract_dir"; return 1; }

  # Make binary executable
  chmod +x "$script_path" || { echo "[$SCRIPT_NAME] Error: Failed to set execute permission on $script_path"; rm -f "$script_path"; rm -f "$temp_tgz_file"; rm -rf "$extract_dir"; return 1; }

  # Verify it works
  echo "[$SCRIPT_NAME] Verifying ClickHouse binary..."
  "$script_path" --version &> /dev/null
  if [ $? -ne 0 ]; then
    echo "[$SCRIPT_NAME] Error: ClickHouse binary downloaded but not functioning correctly"; "$script_path" --version; rm -f "$script_path"; rm -f "$temp_tgz_file"; rm -rf "$extract_dir"; return 1;
  fi
  echo "[$SCRIPT_NAME] ClickHouse binary verified successfully."

  # Clean up downloaded TGZ and extraction directory
  echo "[$SCRIPT_NAME] Cleaning up temporary download files..."
  rm -f "$temp_tgz_file"
  rm -rf "$extract_dir"
  rm -rf "$tmp_dir/clickhouse-common-static"* # Older cleanup pattern

  echo "[$SCRIPT_NAME] Clickhouse binary installed successfully from TGZ to $script_path"
  return 0
}


# --- Main Script Logic ---

# Check if the binary already exists and works
if [ -f "$script_path" ]; then
  echo "[$SCRIPT_NAME] Found existing binary at $script_path. Verifying..."
  chmod +x "$script_path" || echo "[$SCRIPT_NAME] Warning: Could not set executable permission on existing binary."
  "$script_path" --version >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "[$SCRIPT_NAME] Using existing, working clickhouse binary at $script_path"
  else
    echo "[$SCRIPT_NAME] Existing binary at $script_path is not working. Attempting installation..."
    install_clickhouse_stable || { echo "[$SCRIPT_NAME] FATAL: Failed to install clickhouse binary."; exit 1; }
  fi
else
  echo "[$SCRIPT_NAME] ClickHouse binary not found at $script_path. Installing..."
  install_clickhouse_stable || { echo "[$SCRIPT_NAME] FATAL: Failed to install clickhouse binary."; exit 1; }
fi

# --- Auto-generate Settings Documentation ---
echo "[$SCRIPT_NAME] Auto-generating settings markdown pages..."
root=$(dirname "$target_dir") # Project root relative to tmp_dir's parent

sql_files_found=$(find "$SCRIPT_DIR" -maxdepth 1 -name '*.sql' -print -quit)
if [ -z "$sql_files_found" ]; then
    echo "[$SCRIPT_NAME] Warning: No *.sql files found in $SCRIPT_DIR to process."
else
    for SQL_FILE in "$SCRIPT_DIR"/*.sql; do
      if [ -f "$SQL_FILE" ]; then
        echo "[$SCRIPT_NAME] Processing SQL file: $SQL_FILE"
        # Run without redirecting stdout/stderr to see errors directly
        "$script_path" --queries-file "$SQL_FILE" || {
            echo "[$SCRIPT_NAME] FATAL: Failed to execute queries in $SQL_FILE.";
            exit 1;
           }
      fi
    done
fi

# --- Move Generated Files ---
echo "[$SCRIPT_NAME] Moving generated markdown files to documentation directories..."
declare -A files_to_move=(
    ["settings-formats.md"]="$root/docs/operations/settings/settings-formats.md"
    ["settings.md"]="$root/docs/operations/settings/settings.md"
    ["server_settings.md"]="$root/docs/operations/server-configuration-parameters/settings.md"
)
declare -A files_to_append=(
    ["generated_merge_tree_settings.md"]="$root/docs/operations/settings/merge-tree-settings.md"
    ["experimental-settings.md"]="$root/docs/settings/beta-and-experimental-features.md"
    ["beta-settings.md"]="$root/docs/settings/beta-and-experimental-features.md"
)

for src_file in "${!files_to_move[@]}"; do
  dest_file="${files_to_move[$src_file]}"
  if [ -f "$tmp_dir/$src_file" ]; then
    mkdir -p "$(dirname "$dest_file")" || { echo "[$SCRIPT_NAME] Error: Failed to create directory for $dest_file"; exit 1; }
    echo "[$SCRIPT_NAME] Moving $src_file to $dest_file"
    mv "$tmp_dir/$src_file" "$dest_file" || { echo "[$SCRIPT_NAME] Error: Failed to move $src_file to $dest_file"; exit 1; }
  else
    echo "[$SCRIPT_NAME] Warning: Expected output file $src_file not found in $tmp_dir. Skipping move."
  fi
done

for src_file in "${!files_to_append[@]}"; do
  dest_file="${files_to_append[$src_file]}"
   if [ -f "$tmp_dir/$src_file" ]; then
    mkdir -p "$(dirname "$dest_file")" || { echo "[$SCRIPT_NAME] Error: Failed to create directory for $dest_file"; exit 1; }
    echo "[$SCRIPT_NAME] Appending $src_file to $dest_file"
    cat "$tmp_dir/$src_file" >> "$dest_file" || { echo "[$SCRIPT_NAME] Error: Failed to append $src_file to $dest_file"; exit 1; }
  else
    echo "[$SCRIPT_NAME] Warning: Expected output file $src_file not found in $tmp_dir. Skipping append."
  fi
done

# --- Final Cleanup ---
echo "[$SCRIPT_NAME] Performing final cleanup..."
cd "$target_dir" || echo "[$SCRIPT_NAME] Warning: Failed to cd back to $target_dir before cleanup."
# Remove the entire temporary directory (which includes the downloaded TGZ and extracted binary)
rm -rf "$tmp_dir"/*

echo "[$SCRIPT_NAME] Auto-generation of settings markdown pages completed successfully."
exit 0
