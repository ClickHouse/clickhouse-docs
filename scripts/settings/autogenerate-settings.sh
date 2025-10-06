#!/usr/bin/env bash

# --- Script Configuration ---
SCRIPT_NAME=$(basename "$0")
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
# Determine target directory assuming script is in project_root/scripts/settings/
target_dir=$(dirname "$(dirname "$SCRIPT_DIR")") # Should be project root: .../clickhouse-docs
# Temporary directory within the target project structure
tmp_dir="$target_dir/scripts/tmp"

# --- Parse Command Line Arguments ---
CUSTOM_BINARY=""
while getopts "b:" opt; do
  case $opt in
    b)
      CUSTOM_BINARY="$OPTARG"
      echo "[$SCRIPT_NAME] Custom ClickHouse binary specified: $CUSTOM_BINARY"
      ;;
    \?)
      echo "[$SCRIPT_NAME] Invalid option: -$OPTARG" >&2
      echo "[$SCRIPT_NAME] Usage: $0 [-b custom_clickhouse_binary_path]" >&2
      exit 1
      ;;
    :)
      echo "[$SCRIPT_NAME] Option -$OPTARG requires an argument." >&2
      echo "[$SCRIPT_NAME] Usage: $0 [-b custom_clickhouse_binary_path]" >&2
      exit 1
      ;;
  esac
done

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

# Function to verify a ClickHouse binary
verify_clickhouse_binary() {
  local binary_path="$1"
  echo "[$SCRIPT_NAME] Verifying ClickHouse binary at '$binary_path'..."

  if [[ ! -f "$binary_path" ]]; then
    echo "[$SCRIPT_NAME] Error: Binary file not found at '$binary_path'"
    return 1
  fi

  if [[ ! -x "$binary_path" ]]; then
    echo "[$SCRIPT_NAME] Setting executable permission on binary..."
    chmod +x "$binary_path" || {
      echo "[$SCRIPT_NAME] Error: Failed to set execute permission on '$binary_path'";
      return 1;
    }
  fi

  local version_output
  version_output=$("$binary_path" --version 2> /dev/null)
  local exit_code=$?

  if [ $exit_code -eq 0 ]; then
    echo "[$SCRIPT_NAME] ClickHouse binary verified successfully at '$binary_path'"
    echo "[$SCRIPT_NAME] Version info: $version_output"
    return 0 # Success
  else
    echo "[$SCRIPT_NAME] Error: Binary at '$binary_path' is not a valid ClickHouse executable (Exit code: $exit_code)"
    "$binary_path" --version # Show error output
    return 1 # Failure
  fi
}

# Function to setup a custom binary
setup_custom_binary() {
  local source_path="$1"

  # Verify the provided binary first
  if ! verify_clickhouse_binary "$source_path"; then
    echo "[$SCRIPT_NAME] Error: The specified custom binary is not valid."
    return 1
  fi

  # Copy the binary to our tmp directory with the expected name
  echo "[$SCRIPT_NAME] Copying custom binary to '$script_path'..."
  cp "$source_path" "$script_path" || {
    echo "[$SCRIPT_NAME] Error: Failed to copy custom binary to tmp directory."
    return 1
  }

  chmod +x "$script_path" || {
    echo "[$SCRIPT_NAME] Error: Failed to set execute permission on copied binary."
    return 1
  }

  # Verify the copied binary
  verify_clickhouse_binary "$script_path"
  return $?
}

# --- Dependency Checks ---
for cmd in bash curl uname mv chmod rm mkdir find cat grep sed ls pwd sort head tar; do
    if ! command_exists $cmd; then
        echo "[$SCRIPT_NAME] Error: Required command '$cmd' not found!"
        exit 1
    fi
done
echo "[$SCRIPT_NAME] All basic dependencies found."

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

# Check if a custom binary was provided
if [[ -n "$CUSTOM_BINARY" ]]; then
  echo "[$SCRIPT_NAME] Using custom ClickHouse binary: $CUSTOM_BINARY"
  if setup_custom_binary "$CUSTOM_BINARY"; then
    INSTALL_SUCCESS=true
  else
    echo "[$SCRIPT_NAME] Failed to setup custom binary. Exiting."
    exit 1
  fi
else
  # No custom binary provided, proceed with normal installation logic
  # Check if the binary already exists and works
  if [ -f "$script_path" ]; then
    echo "[$SCRIPT_NAME] Found existing binary at $script_path. Verifying..."
    if verify_clickhouse_binary "$script_path"; then
      echo "[$SCRIPT_NAME] Using existing, working clickhouse binary at $script_path"
      INSTALL_SUCCESS=true
    else
      echo "[$SCRIPT_NAME] Existing binary at $script_path is not working. Attempting installation..."
      rm -f "$script_path"
      # Try primary method
      if install_clickhouse_via_script; then
        INSTALL_SUCCESS=true
      else
        INSTALL_SUCCESS=false
      fi
    fi
  else
    echo "[$SCRIPT_NAME] ClickHouse binary not found at $script_path. Attempting primary install via script..."
    # Try primary method
    if install_clickhouse_via_script; then
      INSTALL_SUCCESS=true
    else
      INSTALL_SUCCESS=false
    fi
  fi
fi

# Check final install status
if ! $INSTALL_SUCCESS; then
    echo "[$SCRIPT_NAME] FATAL: All installation methods failed."
    cd .. || echo "[$SCRIPT_NAME] Warning: Failed to cd back to parent directory before exiting."
    exit 1
fi

# --- Auto-generate Settings Documentation ---
echo "[$SCRIPT_NAME] Auto-generating settings markdown pages..."

# Process other SQL files first (non-function related)
sql_files_found=$(find "$SCRIPT_DIR" -maxdepth 1 -name '*.sql' ! -name 'generate-functions.sql' -print -quit)
if [ -z "$sql_files_found" ]; then
    echo "[$SCRIPT_NAME] Warning: No non-function *.sql files found in $SCRIPT_DIR to process."
else
    for SQL_FILE in "$SCRIPT_DIR"/*.sql; do
      if [ -f "$SQL_FILE" ] && [ "$(basename "$SQL_FILE")" != "generate-functions.sql" ]; then
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

# Generate function documentation using the consolidated SQL file
FUNCTION_SQL_FILE="$SCRIPT_DIR/generate-functions.sql"
if [ -f "$FUNCTION_SQL_FILE" ]; then
    echo "[$SCRIPT_NAME] Generating function documentation using consolidated SQL file..."

    # Define function categories to process
    FUNCTION_CATEGORIES=(
      "Arithmetic"
      "Arrays"
      "Bit"
      "Bitmap"
      "Comparison"
      "Conditional"
      "Distance"
      "Dates and Times"
      "Encoding"
      "Financial"
      "Null"
      "Encryption"
      "Hash"
      "Introspection"
      "IP Address"
      "JSON"
      "Logical"
      "Mathematical"
      "Natural Language Processing"
      "Random Number"
    )

    for CATEGORY in "${FUNCTION_CATEGORIES[@]}"; do
        echo "[$SCRIPT_NAME] Processing $CATEGORY functions..."
        "$script_path" --param_category="$CATEGORY" --queries-file "$FUNCTION_SQL_FILE" || {
            echo "[$SCRIPT_NAME] FATAL: Failed to execute queries for $CATEGORY functions.";
            echo "[$SCRIPT_NAME] Attempting to re-run with output:"
            "$script_path" --param_category="$CATEGORY" --queries-file "$FUNCTION_SQL_FILE"
            exit 1;
        }

        # Rename the temporary output file to the correct name
        # Category can be "Dates and Times" for example, resulting in `dates and times-functions.md` so we change spaces to underscores
        CATEGORY_LOWER=$(echo "$CATEGORY" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')
        if [ -f "temp-functions.md" ]; then
            echo "${CATEGORY_LOWER}-functions.md"
            mv "temp-functions.md" "${CATEGORY_LOWER}-functions.md" || {
                echo "[$SCRIPT_NAME] Error: Failed to rename temp-functions.md to ${CATEGORY_LOWER}-functions.md"
                exit 1
            }
            echo "[$SCRIPT_NAME] Generated ${CATEGORY_LOWER}-functions.md"
        else
            echo "[$SCRIPT_NAME] Warning: temp-functions.md not found for $CATEGORY"
        fi
    done
else
    echo "[$SCRIPT_NAME] Warning: Consolidated function SQL file not found at $FUNCTION_SQL_FILE"
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
append_src_files=("generated_merge_tree_settings.md")
append_dest_files=(
    "docs/operations/settings/merge-tree-settings.md"
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
        # Remove source file after successful append
        rm -f "$src_rel_path"
     else
        echo "[$SCRIPT_NAME] Warning: Expected output file $src_rel_path not found in $tmp_dir. Skipping append."
     fi
done

# --- Append content between <!-- AUTOGENERATED_START --><!-- AUTOGENERATED_END --> tags on the page
insert_src_files=(
  "experimental-beta-settings.md"
  "arithmetic-functions.md"
  "arrays-functions.md"
  "bit-functions.md"
  "bitmap-functions.md"
  "comparison-functions.md"
  "conditional-functions.md"
  "distance-functions.md"
  "dates_and_times-functions.md"
  "encoding-functions.md"
  "financial-functions.md"
  "null-functions.md"
  "encryption-functions.md"
  "hash-functions.md"
  "introspection-functions.md"
  "ip_address-functions.md"
  "json-functions.md"
  "logical-functions.md"
  "mathematical-functions.md"
  "natural_language_processing-functions.md"
  "randomnumber-functions.md"
)

insert_dest_files=(
    "docs/about-us/beta-and-experimental-features.md"
    "docs/sql-reference/functions/arithmetic-functions.md"
    "docs/sql-reference/functions/array-functions.md"
    "docs/sql-reference/functions/bit-functions.md"
    "docs/sql-reference/functions/bitmap-functions.md"
    "docs/sql-reference/functions/comparison-functions.md"
    "docs/sql-reference/functions/conditional-functions.md"
    "docs/sql-reference/functions/distance-functions.md"
    "docs/sql-reference/functions/date-time-functions.md"
    "docs/sql-reference/functions/encoding-functions.md"
    "docs/sql-reference/functions/financial-functions.md"
    "docs/sql-reference/functions/functions-for-nulls.md"
    "docs/sql-reference/functions/encryption-functions.md"
    "docs/sql-reference/functions/hash-functions.md"
    "docs/sql-reference/functions/introspection.md"
    "docs/sql-reference/functions/ip-address-functions.md"
    "docs/sql-reference/functions/json-functions.md"
    "docs/sql-reference/functions/logical-functions.md"
    "docs/sql-reference/functions/math-functions.md"
    "docs/sql-reference/functions/nlp-functions.md"
    "docs/sql-reference/functions/random-functions.md"
)

echo "[$SCRIPT_NAME] Inserting generated markdown content between AUTOGENERATED_START and AUTOGENERATED_END tags"
for i in "${!insert_src_files[@]}"; do
  src_file="${insert_src_files[i]}"

  # Construct full destination path using $target_dir (project root)
  dest_full_path="$target_dir/${insert_dest_files[i]}"

  # Source file is relative to CWD ($tmp_dir)
  src_rel_path="./$src_file"

  if [ -f "$src_rel_path" ]; then

    # Ensure destination directory exists
    mkdir -p "$(dirname "$dest_full_path")" || { echo "[$SCRIPT_NAME] Error: Failed to create directory for $dest_full_path"; exit 1; }
    echo "[$SCRIPT_NAME] Appending $src_rel_path to $dest_full_path"

    # Replace the content between <!--AUTOGENERATED_START--> and <!--AUTOGENERATED_END--> tags
    if grep -q "<!--AUTOGENERATED_START-->" "$dest_full_path" && grep -q "<!--AUTOGENERATED_END-->" "$dest_full_path"; then
      # Create a temporary file
      tmp_file=$(mktemp)
      trap 'rm -f "$tmp_file"' EXIT

      # 1. Copy everything up to and including <!--AUTOGENERATED_START-->
      awk '/<!--AUTOGENERATED_START-->/ {print; exit}; {print}' "$dest_full_path" > "$tmp_file"

      # 2. Add the content from the source file
      cat "$src_rel_path" >> "$tmp_file"

      # 3. Add everything from <!--AUTOGENERATED_END--> to the end of the file
      awk 'BEGIN {found=0}; /<!--AUTOGENERATED_END-->/ {found=1}; found {print}' "$dest_full_path" >> "$tmp_file"

      # Replace the original file with the modified content
      mv "$tmp_file" "$dest_full_path"
    else
      echo "[$SCRIPT_NAME] Error: Expected to find AUTOGENERATED_START and AUTOGENERATED_END tags in $dest_full_path, but did not"
      exit 1
    fi

    # Remove source file after successful append
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
rmdir "$tmp_dir" 2>/dev/null || echo "[$SCRIPT_NAME] Unable to remove $tmp_dir"

echo "[$SCRIPT_NAME] Auto-generation of settings markdown pages completed successfully."
exit 0
