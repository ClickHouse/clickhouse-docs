#!/usr/bin/env bash

echo "Checking markdown..."

# Check if markdownlint-cli2 is installed
if ! yarn list --pattern markdownlint-cli2 --depth=0 | grep -q "markdownlint-cli2"; then
    echo "Error: markdownlint-cli2 is not installed."
    echo "Please install it with:"
    echo "  yarn add -D markdownlint-cli2"
    exit 1
fi

yarn markdownlint-cli2 --config ./scripts/.markdownlint-cli2.yaml 'docs/**/*.md'
