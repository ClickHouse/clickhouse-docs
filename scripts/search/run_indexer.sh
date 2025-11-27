#!/bin/bash

# Define constants
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"
REQUIREMENTS_FILE="$SCRIPT_DIR/requirements.txt"
PYTHON_SCRIPT="$SCRIPT_DIR/index_pages.py"
DEFAULT_ALGOLIA_APP_ID="5H9UG7CX5W"

# Base directory is two levels up from the `scripts/search` directory
BASE_DIRECTORY="$(dirname "$(dirname "$SCRIPT_DIR")")"

if [ -z "$ALGOLIA_API_KEY" ]; then
    echo "Error: ALGOLIA_API_KEY environment variable is not set. Exiting."
    exit 1
fi

ALGOLIA_APP_ID=${ALGOLIA_APP_ID:-$DEFAULT_ALGOLIA_APP_ID}

# Base directory is two levels up from the `scripts/search` directory
BASE_DIRECTORY="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Check if virtual environment exists, and create if it doesn't
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment in $VENV_DIR..."
    python3 -m venv "$VENV_DIR"
fi

# Activate the virtual environment
source "$VENV_DIR/bin/activate"

# Install dependencies
if [ -f "$REQUIREMENTS_FILE" ]; then
    echo "Installing dependencies from $REQUIREMENTS_FILE..."
    pip install -r "$REQUIREMENTS_FILE"
else
    echo "Warning: $REQUIREMENTS_FILE not found. Skipping dependency installation."
fi

BASE_DIRECTORY_ARG="$BASE_DIRECTORY"
DRY_RUN=false
LOCALE="en"

# allows us to override params if needed
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -d|--base_directory) BASE_DIRECTORY_ARG="$2"; shift ;;
        -x|--dry_run) DRY_RUN=true ;;
        -l|--locale) LOCALE="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# Run the Python script
echo "Running the Python script..."
python "$PYTHON_SCRIPT" \
    --base_directory "$BASE_DIRECTORY_ARG" \
    $( [ "$DRY_RUN" = true ] && echo "--dry_run" ) \
    --algolia_app_id "$ALGOLIA_APP_ID" \
    --algolia_api_key "$ALGOLIA_API_KEY" \
    --locale "$LOCALE"

deactivate
