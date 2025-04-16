#!/bin/bash

function parse_args() {
  force_pull=false

  while getopts "hl:f" opt; do
    case "$opt" in
      h)
        # Display the usage information and exit when -h is provided
        echo "Usage: $0 [-l path_to_local_clickhouse_repo] [-f]"
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
}

# Copy files/folders using rsync (or fallback to cp)
copy_item() {
  local source="$1"
  local destination="$2"

  if $has_rsync; then
    rsync -a "$source" "$destination"
  else
    cp -r "$source" "$destination"
    if [ $? -ne 0 ]; then
      echo "Error copying $source to $destination"
      error=1
    fi
  fi
}

# Define function to copy docs locally
function copy_docs_locally() {
  local local_path=$1

  # Read package.json to get list of docs folders and files
  package_json=$(cat "$(pwd)/package.json")

  # Extract clickhouse_repo_folders
  clickhouse_repo_folders=$(echo "$package_json" | awk -F'"' '/"clickhouse_repo_folders":/{print $4}')

  # Extract files_for_autogen_settings
  files_for_autogen_settings=$(echo "$package_json" | awk -F'"' '/"autogen_needed_files":/{print $4}')

  if [ "$clickhouse_repo_folders" = "" ] || [ "$files_for_autogen_settings" = "" ]
  then
    echo "An error occurred trying to extract directory and file names from package.json"
    exit 1
  fi

  error=0
  # Copy docs folders
  for folder in $clickhouse_repo_folders; do
    copy_item "$local_path/$folder" "docs/"
  done

  # check if tmp directory exists, if not make it
  if [[ -d "scripts/tmp" ]]; then
    echo "scripts/tmp already exists"
  else
    mkdir scripts/tmp
  fi
  # Copy files for autogen settings
  for source_file in $files_for_autogen_settings; do
    copy_item "$local_path/$source_file" "scripts/tmp"
  done

  if [ "$error" -eq 1 ]; then
    echo "an error occurred copying the files"
    exit 1
  fi
}

main() {
  parse_args "$@"

  # Check if rsync is available
  has_rsync=false
  if command -v rsync &> /dev/null; then
    echo "rsync found"
    has_rsync=true
  else
    echo "rsync not found - falling back to use cp command. For faster dev builds we recommend installing rsync."
  fi

  # If no local path is provided, clone the ClickHouse repo

  if [[ -z "$local_path" ]]; then

    # Check if override is set
    if [[ "$MASTER_PULL" == "false" ]]; then
      echo "expecting /ClickHouse folder to be present without having to pull it from the repo"
      copy_docs_locally "/ClickHouse"
    else
      git clone --depth 1 --branch master https://github.com/ClickHouse/ClickHouse
      # Copy docs from cloned repository
      copy_docs_locally "$(pwd)/ClickHouse"
    fi

    # Remove cloned repository
    rm -rf ClickHouse

    echo "Successfully executed copy from master"
  else
    # Copy docs from the provided local path
    copy_docs_locally "$local_path"
    echo "Successfully executed local copy"
  fi
}

main "$@"
