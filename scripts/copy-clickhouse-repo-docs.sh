#!/bin/bash

# Define function to parse arguments using getopts
function parse_args() {

  while getopts "hl:" opt; do
    case "$opt" in
      h)
        # Display the usage information and exit when -h is provided
        echo "Usage: $0 [-l path_to_local_clickhouse_repo]"
        echo ""
        echo "Options:"
        echo "  -l   Path to a local copy of the ClickHouse repository."
        echo "  -h   Display this help message."
        exit 0
        ;;
      l)
        local_path="$OPTARG"
        ;;
      \?)
        echo "Invalid option: -$OPTARG" >&2
        exit 1
        ;;
    esac
  done

  echo "$local_path"
}

# Define function to validate local path
function validate_local() {

  if [[ -d "$local_path" && "$local_path" == *"ClickHouse" ]]; then
    return 0
  else
    echo "Please provide a valid path to your local ClickHouse repository."
    exit 1
  fi
}

# Function to copy files/folders using rsync or cp
copy_item() {
  local source="$1"
  local destination="$2"

  if $has_rsync; then
    rsync -a "$source" "$destination"
  else
    cp "$source" "$destination"
    if [ $? -ne 0 ]; then
      echo "Error copying $source to $destination"
      error=1
    fi
  fi
}

# Define function to copy docs locally
function copy_docs_locally() {
  local local_path=$1

  # Validate local path only if it's provided
  if [[ -n "$local_path" ]]; then
    validate_local "$local_path"
  fi

  # Read package.json to get list of docs folders and files
  package_json=$(cat "$(pwd)/package.json")

  # Extract docs_folders_en
  docs_folders_en=$(echo "$package_json" | awk -F'"' '/"prep_array_en": {/{print $4}')

  # Extract docs_folders_other
  docs_folders_other=$(echo "$package_json" | awk -F'"' '/"prep_array_root": {/{print $4}')

  # Extract files_for_autogen_settings
  files_for_autogen_settings=$(echo "$package_json" | awk -F'"' '/"autogen_needed_files": {/{print $4}')

  error=0
  # Copy docs folders
  for folder in $docs_folders_en; do
    copy_item "$local_path/$folder" "docs/en"
  done

  for folder in $docs_folders_other; do
    copy_item "$local_path/$folder" "docs/"
  done

  # Copy files for autogen settings
  for source_file in $files_for_autogen_settings; do
    copy_item "$local_path/$source_file" "scripts/tmp"
  done

  if [ "$error" -eq 1 ]; then
    echo "an error occurred copying the files"
    exit 1
  fi
}

# Main function
main() {
  # Parse arguments
  parse_args "$@"

  # Check for rsync once
  has_rsync=false
  if command -v rsync &> /dev/null; then
    echo "rsync found"
    has_rsync=true
  else
    echo "rsync not found - falling back to use cp command"
  fi

  # If no local path is provided, clone the ClickHouse repo
  if [[ -z "$local_path" ]]; then
    git clone --depth 1 --branch master https://github.com/ClickHouse/ClickHouse

    # Copy docs from cloned repository
    copy_docs_locally "$(pwd)/ClickHouse"

    # Remove cloned repository
    rm -rf ClickHouse

    echo "Successfully executed copy from master"
  else
    # Copy docs from the provided local path
    validate_local "$local_path"
    copy_docs_locally "$local_path"
    echo "Successfully executed local copy"
  fi
}

# Call main function
main "$@"
