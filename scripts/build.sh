#!/bin/bash

function parse_args() {
  locale=""  # Default: No locale specified
  out_dir="" # Default: No custom output directory

  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      --locale)
        locale="$2"
        shift 2
        ;;
      --out-dir)
        out_dir="$2"
        shift 2
        ;;
      -h|--help)
        echo "Usage: $0 [--locale <locale>] [--out-dir <path>]"
        echo ""
        echo "Options:"
        echo "  --locale       Specify the locale to build (e.g., jp, zh, fr)."
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

  # Use environment variable if set, otherwise use the argument-provided locale
  locale="${DOCUSUARUS_LOCALE:-$locale}"

  if [[ -z "$locale" ]]; then
    echo "Building default Docusaurus (English)"
    build_command="GENERATE_SOURCEMAP=false docusaurus build --dev --locale en"
  else
    echo "Setting locale to: $locale"
    export DOCUSUARUS_LOCALE="$locale"

    echo "Building Docusaurus en before $locale (currently required)"
    build_command="GENERATE_SOURCEMAP=false docusaurus build --locale en"
  fi

  # Append output directory if provided
  if [[ -n "$out_dir" ]]; then
    build_command+=" --out-dir $out_dir"
  fi

  # Execute the build command for English (or without locale if no locale provided)
  eval "$build_command"
  build_status=$?
  if [[ $build_status -ne 0 ]]; then
    echo "Build failed with status $build_status"
    exit $build_status
  fi

  if [[ -n "$locale" ]]; then
    echo "Building Docusaurus with locale: $locale"
    build_command="GENERATE_SOURCEMAP=false docusaurus build --locale $locale"

    if [[ -n "$out_dir" ]]; then
      build_command+=" --out-dir $out_dir"
    fi

    # Execute the build command for the additional locale
    eval "$build_command"
    build_status=$?
    if [[ $build_status -ne 0 ]]; then
      echo "Build failed with status $build_status"
      exit $build_status
    fi
  fi
}

main "$@"
