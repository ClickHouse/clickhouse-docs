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

# Define function to copy docs locally
function copy_docs_locally() {
  local local_path=$1

  # Validate local path only if it's provided
  if [[ -n "$local_path" ]]; then
    validate_local "$local_path"
  fi

  # Read package.json to get list of docs folders and files
  package_json=$(cat "$(pwd)/package.json")
  docs_folders_en=$(echo "$package_json" | jq -r '.config.prep_array_en')
  docs_folders_other=$(echo "$package_json" | jq -r '.config.prep_array_root')
  files_for_autogen_settings=$(echo "$package_json" | jq -r '.config.autogen_needed_files')

  # Copy docs folders
  for folder in $docs_folders_en; do
    if command -v rsync &> /dev/null; then
      rsync -a "$local_path/$folder" docs/en
    else
      cp -a "$local_path/$folder" docs/en
    fi
  done

  for folder in $docs_folders_other; do
    if command -v rsync &> /dev/null; then
      rsync -a "$local_path/$folder" docs/
    else
      cp -a "$local_path/$folder" docs/
    fi
  done

  # Copy files for autogen settings
  for source_file in $files_for_autogen_settings; do
    if command -v rsync &> /dev/null; then
      rsync -a "$local_path/$source_file" scripts/tmp
    else
      cp -a "$local_path/$source_file" scripts/tmp
    fi
  done
}

# Main function
main() {
  # Parse arguments
  parse_args "$@"

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
