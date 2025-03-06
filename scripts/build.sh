#!/bin/bash

function parse_args() {
  config_file=""  # Default: No config specified
  out_dir=""      # Default: No custom output directory

  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      --config)
        config_file="$2"
        shift 2
        ;;
      --out-dir)
        out_dir="$2"
        shift 2
        ;;
      -h|--help)
        echo "Usage: $0 [--config docusaurus.<locale>.config.js] [--out-dir path]"
        echo ""
        echo "Options:"
        echo "  --config       Specify the Docusaurus config file (e.g., docusaurus.jp.config.js)."
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

function extract_locale_from_config() {
  local config_name
  config_name=$(basename "$1")

  if [[ "$config_name" =~ ^docusaurus\.([a-zA-Z-]+)\.config\.js$ ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo "Error: Invalid config filename format: $config_name" >&2
    exit 1
  fi
}

main() {
  parse_args "$@"

  if [[ -z "$config_file" ]]; then
    echo "Building default Docusaurus"
    build_command="GENERATE_SOURCEMAP=false docusaurus build"
  else
    locale=$(extract_locale_from_config "$config_file")
    echo "Building Docusaurus en before ${locale} (currently required)"
    build_command="GENERATE_SOURCEMAP=false docusaurus build --config $config_file --locale en"
  fi

  # Append output directory if provided
  if [[ -n "$out_dir" ]]; then
    build_command+=" --out-dir $out_dir/en"
  fi

  # Execute the build command for English (or without locale if no config)
  eval "$build_command"

  if [[ -n "$config_file" ]]; then
    echo "Building Docusaurus with locale: $locale"
    build_command="GENERATE_SOURCEMAP=false docusaurus build --config $config_file --locale $locale"

    if [[ -n "$out_dir" ]]; then
      build_command+=" --out-dir $out_dir/$locale"
    fi

    # Execute the build command for the additional locale
    eval "$build_command"
  fi
}

main "$@"
