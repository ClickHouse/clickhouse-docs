#!/bin/bash

# This script is used for automatically generating any .json table of contents files
# used for various things on the docs site, such as:
  # - landing pages
  # - indexing of the knowledgebase

# Don't exit on errors - we want to collect them all
set +e

# Function to cleanup on exit
cleanup() {
    if [ -d "venv" ]; then
        deactivate 2>/dev/null || true
        rm -rf venv
    fi
}

# Set trap to cleanup on exit (success or failure)
trap cleanup EXIT

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r scripts/table-of-contents-generator/requirements.txt

# Define all TOC generation commands
COMMANDS=(
    '--dir="knowledgebase" --single-toc --out="static" --ignore images'
    '--single-toc --dir="docs/operations/system-tables" --md="docs/operations/system-tables/index.md"'
    '--single-toc --dir="docs/operations/settings" --md="docs/operations/settings/index.md"'
    '--single-toc --dir="docs/engines/database-engines" --md="docs/engines/database-engines/index.md"'
    '--single-toc --dir="docs/engines/table-engines/mergetree-family" --md="docs/engines/table-engines/mergetree-family/index.md"'
    '--single-toc --dir="docs/engines/table-engines/integrations" --md="docs/engines/table-engines/integrations/index.md"'
    '--single-toc --dir="docs/engines/table-engines/special" --md="docs/engines/table-engines/special/index.md"'
    '--single-toc --dir="docs/sql-reference/aggregate-functions/reference" --md="docs/sql-reference/aggregate-functions/reference/index.md"'
    '--single-toc --dir="docs/sql-reference/table-functions" --md="docs/sql-reference/table-functions/index.md"'
    '--single-toc --dir="docs/chdb/guides" --md="docs/chdb/guides/index.md" --ignore images'
    '--single-toc --dir="docs/cloud/reference/01_changelog" --md="docs/cloud/reference/01_changelog/02_release_notes/index.md"'
    '--single-toc --dir="docs/development" --md="docs/development/index.md" --ignore images'
    '--single-toc --dir="docs/getting-started/example-datasets" --md="docs/getting-started/index.md" --ignore images'
    '--single-toc --dir="docs/integrations/data-ingestion/clickpipes/kafka" --md="docs/integrations/data-ingestion/clickpipes/kafka/index.md" --ignore images'
    '--single-toc --dir="docs/use-cases/AI_ML/MCP" --md="docs/use-cases/AI_ML/MCP/index.md" --ignore images'
    '--single-toc --dir="docs/use-cases/AI_ML/MCP/ai_agent_libraries" --md="docs/use-cases/AI_ML/MCP/ai_agent_libraries/index.md"'
)

# Execute each command
echo "Generating table of contents files..."
failed_commands=()

for args in "${COMMANDS[@]}"; do
    full_cmd="python3 scripts/table-of-contents-generator/toc_gen.py $args"
    echo "Running: $full_cmd"
    eval $full_cmd

    if [ $? -eq 0 ]; then
        echo -e "\033[32m✓ Success\033[0m"
    else
        echo -e "\033[31m✗ Failed\033[0m"
        failed_commands+=("$full_cmd")
    fi
    echo ""
done

# Report results
echo "========================================="
echo "Summary:"
echo "Total commands: ${#COMMANDS[@]}"
echo -e "Successful: \033[32m$((${#COMMANDS[@]} - ${#failed_commands[@]}))\033[0m"
echo -e "Failed: \033[31m${#failed_commands[@]}\033[0m"

if [ ${#failed_commands[@]} -gt 0 ]; then
    echo ""
    echo "Failed commands:"
    for failed_cmd in "${failed_commands[@]}"; do
        echo -e "  \033[31m✗ $failed_cmd\033[0m"
    done
    echo ""
    echo -e "\033[31mScript completed with errors!\033[0m"
    exit 1
else
    echo ""
    echo -e "\033[32mAll table of contents generation completed successfully!\033[0m"
    exit 0
fi
