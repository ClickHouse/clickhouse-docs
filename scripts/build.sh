#!/bin/bash

function parse_args() {
  locale="en"  # Default locale

  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      -l|--locale)
        locale="$2"
        shift 2
        ;;
      -h|--help)
        echo "Usage: $0 [-l locale]"
        echo ""
        echo "Options:"
        echo "  -l, --locale   Locale to build docs for (default: en)."
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
  GENERATE_SOURCEMAP=false docusaurus build --locale en

  if [[ "$locale" != "en" ]]; then
    echo "Building Docusaurus with additional locale: $locale"
    GENERATE_SOURCEMAP=false docusaurus build --locale "$locale"
  fi
}

main "$@"
