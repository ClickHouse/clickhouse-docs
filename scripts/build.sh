#!/bin/bash

function parse_args() {
  locale="en"  # Default locale
  out_dir=""   # Default empty, meaning no custom output directory

  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      -l|--locale)
        locale="$2"
        shift 2
        ;;
      --out-dir)
        out_dir="$2"
        shift 2
        ;;
      -h|--help)
        echo "Usage: $0 [-l locale] [--out-dir path]"
        echo ""
        echo "Options:"
        echo "  -l, --locale   Locale to build docs for (default: en)."
        echo "  --out-dir      Specify output directory for the build."
        echo "  -h, --help     Display this help message."
        exit 0
        ;;
      *)
        echo "Invalid option: $1" >&2
        exit 1
        ;;
    esac
  done
}

main() {
  parse_args "$@"

  echo "Building Docusaurus with locale: en (currently required)"
  build_command="GENERATE_SOURCEMAP=false docusaurus build --locale en"

  # Append output directory if provided
  if [[ -n "$out_dir" ]]; then
    build_command+=" --out-dir $out_dir/en"
  fi

  # Execute the build command for English
  eval "$build_command"

  if [[ "$locale" != "en" ]]; then
    echo "Building Docusaurus with additional locale: $locale"
    build_command="GENERATE_SOURCEMAP=false docusaurus build --locale $locale"

    if [[ -n "$out_dir" ]]; then
      build_command+=" --out-dir $out_dir/$locale"
    fi

    # Execute the build command for the additional locale
    eval "$build_command"
  fi
}

main "$@"
