#!/usr/bin/env bash

echo "Checking knowledge base..."

# Ensure uv is installed
if ! command -v uv &> /dev/null; then
    echo "Error: uv is not installed."
    echo "Install it by running:"
    echo "  curl -Ls https://astral.sh/uv/install.sh | sh"
    echo "  uv python install 3.12"
    exit 1
fi

# Run the checker
uv run --with PyYAML==6.0.2 --with termcolor==2.5.0 -- python scripts/knowledgebase-checker/knowledgebase_article_checker.py --kb-dir=knowledgebase
