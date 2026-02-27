#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_DIR="${DOCS_ROOT}/docs/kubernetes-operator"

function parse_args() {
  force_pull=false

  while getopts "hl:f" opt; do
    case "$opt" in
      h)
        # Display the usage information and exit when -h is provided
        echo "Usage: $0 [-l path_to_local_clickhouse_operator_repo] [-f]"
        echo ""
        echo "Options:"
        echo "  -l   Path to a local copy of the clickhouse-operator repository."
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

# Define function to copy docs locally
function copy_docs_locally() {
  local local_path=$1

  # Copy doc .md files (not README.md or development.md) and _category_.yml files preserving directory structure
  echo "Copying operator docs to ${TARGET_DIR}..."
  (
    find ${local_path}/docs \( -name '*.md' ! -name 'README.md' ! -name 'development.md' \) -o -name '*.yml' | while read -r file; do
    dest_dir="${TARGET_DIR}/$(dirname "${file}")"
    mkdir -p "${dest_dir}"
    cp "${file}" "${dest_dir}/"
    done
  )
}

main() {
  parse_args "$@"

  # If no local path is provided, clone the clickhouse-operator repo

  if [[ -z "$local_path" ]]; then

    # Check if override is set
    if [[ "$MASTER_PULL" == "false" ]]; then
      echo "expecting /clickhouse-operator folder to be present without having to pull it from the repo"
      copy_docs_locally "/clickhouse-operator"
    else
      git clone --depth 1 --branch main https://github.com/ClickHouse/clickhouse-operator
      # Copy docs from cloned repository
      copy_docs_locally "$(pwd)/clickhouse-operator"
    fi

    # Remove cloned repository
    rm -rf clickhouse-operator

    echo "Successfully executed copy from main"
  else
    # Copy docs from the provided local path
    copy_docs_locally "$local_path"
    echo "Successfully executed local copy"
  fi
}

main "$@"
