#!/usr/bin/env bash

# --- Script Configuration ---
SCRIPT_NAME=$(basename "$0")
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
# Determine target directory assuming script is in project_root/scripts/system-tables/
target_dir=$(dirname "$(dirname "$SCRIPT_DIR")") # Should be project root: .../clickhouse-docs
# Temporary directory within the target project structure
tmp_dir="$target_dir/scripts/tmp-system-tables"

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

# Function to install ClickHouse via official script
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

# --- Dependency Checks ---
for cmd in bash curl uname mv chmod rm mkdir find cat grep sed ls pwd sort head tar; do
    if ! command_exists $cmd; then
        echo "[$SCRIPT_NAME] Error: Required command '$cmd' not found!"
        exit 1
    fi
done
echo "[$SCRIPT_NAME] All basic dependencies found."

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
      if install_clickhouse_via_script; then
        INSTALL_SUCCESS=true
      else
        INSTALL_SUCCESS=false
      fi
    fi
  else
    echo "[$SCRIPT_NAME] ClickHouse binary not found at $script_path. Attempting install via script..."
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

# --- Dynamically retrieve system tables list ---
echo "[$SCRIPT_NAME] Retrieving list of system tables from ClickHouse..."

# Query to get all system tables
SYSTEM_TABLES_QUERY="SELECT name FROM system.tables WHERE database = 'system' ORDER BY name FORMAT TSV"

# Execute the query and store results in an array (macOS compatible)
SYSTEM_TABLES=()
while IFS= read -r line; do
    SYSTEM_TABLES+=("$line")
done < <("$script_path" --query "$SYSTEM_TABLES_QUERY" 2>/dev/null)

if [ ${#SYSTEM_TABLES[@]} -eq 0 ]; then
    echo "[$SCRIPT_NAME] Error: Failed to retrieve system tables list or no tables found."
    exit 1
fi

echo "[$SCRIPT_NAME] Found ${#SYSTEM_TABLES[@]} system tables to process."

# --- Auto-generate System Tables Documentation ---
echo "[$SCRIPT_NAME] Auto-generating system tables documentation..."

# Generate system tables documentation using the consolidated SQL file
SYSTEM_TABLES_SQL_FILE="$SCRIPT_DIR/system-tables.sql"
if [ -f "$SYSTEM_TABLES_SQL_FILE" ]; then
    echo "[$SCRIPT_NAME] Generating system tables documentation using consolidated SQL file..."

    for TABLE in "${SYSTEM_TABLES[@]}"; do
        echo "[$SCRIPT_NAME] Processing system table: $TABLE"
        "$script_path" --param_table="$TABLE" --queries-file "$SYSTEM_TABLES_SQL_FILE" || {
            echo "[$SCRIPT_NAME] FATAL: Failed to execute queries for system.$TABLE table.";
            echo "[$SCRIPT_NAME] Attempting to re-run with output:"
            "$script_path" --param_table="$TABLE" --queries-file "$SYSTEM_TABLES_SQL_FILE"
            exit 1;
        }

        # Rename the temporary output file to the correct name
        if [ -f "temp-system-table.md" ]; then
            mv "temp-system-table.md" "${TABLE}.md" || {
                echo "[$SCRIPT_NAME] Error: Failed to rename temp-system-table.md to ${TABLE}.md"
                exit 1
            }
            echo "[$SCRIPT_NAME] Generated ${TABLE}.md"
        else
            echo "[$SCRIPT_NAME] Warning: temp-system-table.md not found for system.$TABLE"
        fi
    done
else
    echo "[$SCRIPT_NAME] Warning: System tables SQL file not found at $SYSTEM_TABLES_SQL_FILE"
    exit 1
fi

# --- Insert generated content between AUTOGENERATED tags ---
echo "[$SCRIPT_NAME] Inserting generated markdown content between AUTOGENERATED_START and AUTOGENERATED_END tags"

for TABLE in "${SYSTEM_TABLES[@]}"; do
    src_file="${TABLE}.md"
    # Construct full destination path using $target_dir (project root)
    dest_full_path="$target_dir/docs/operations/system-tables/${TABLE}.md"
    # Source file is relative to CWD ($tmp_dir)
    src_rel_path="./$src_file"

    if [ -f "$src_rel_path" ]; then
        # Ensure destination directory exists
        mkdir -p "$(dirname "$dest_full_path")" || { 
            echo "[$SCRIPT_NAME] Error: Failed to create directory for $dest_full_path"; 
            exit 1; 
        }

        # Check if destination file exists and has AUTOGENERATED tags
        if [ -f "$dest_full_path" ] && grep -q "<!--AUTOGENERATED_START-->" "$dest_full_path" && grep -q "<!--AUTOGENERATED_END-->" "$dest_full_path"; then
            echo "[$SCRIPT_NAME] Updating content in existing file: $dest_full_path"
            
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
            echo "[$SCRIPT_NAME] Warning: File $dest_full_path does not exist or missing AUTOGENERATED tags. Skipping."
            echo "[$SCRIPT_NAME] You may need to create the file with proper AUTOGENERATED_START and AUTOGENERATED_END tags."
        fi

        # Remove source file after processing
        rm -f "$src_rel_path"
    else
        echo "[$SCRIPT_NAME] Warning: Expected output file $src_rel_path not found in $tmp_dir. Skipping."
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

echo "[$SCRIPT_NAME] Auto-generation of system tables documentation completed successfully."
echo "[$SCRIPT_NAME] Processed ${#SYSTEM_TABLES[@]} system tables."
exit 0