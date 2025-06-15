#!/bin/bash
# Script to run Vale on locally changed files or specified files
# Usage:
#   1. Run on changed files: ./run_vale_local.sh
#   2. Run on specific files: ./run_vale_local.sh -f "docs/**/*.md"
#   3. Run on list of files: ./run_vale_local.sh -f "docs/file1.md docs/file2.md"

# Get script directory and repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Change to repository root for reliable paths
cd "$REPO_ROOT"

SCRIPT_NAME=$(basename "$0")

# Colors for ANSI output formatting
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check that Vale is installed
vale -v
if [ $? -eq 1 ]
then
  echo "[$SCRIPT_NAME] Error: Vale not found. Please install vale."
  exit 1;
else
  echo "[$SCRIPT_NAME] Success: Found Vale."
fi

# Default values
BASE_BRANCH="main"
FILE_PATTERN=""
USE_CHANGED_FILES=true

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -f|--files)
      USE_CHANGED_FILES=false
      FILE_PATTERN="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Invalid argument: $1${NC}"
      echo "Usage: ./run_vale_local.sh [-f|--files \"file_pattern_or_list\"]"
      exit 1
      ;;
  esac
done

if $USE_CHANGED_FILES; then
  # Get current branch name
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

  echo -e "${GREEN}Running Vale check on files changed on $CURRENT_BRANCH branch${NC}"

  # Create logs directory
  mkdir -p logs

  # Find the merge-base (common ancestor) of main and current branch
  MERGE_BASE=$(git merge-base $BASE_BRANCH $CURRENT_BRANCH)

  # Get changed files between merge-base and current branch
  CHANGED_FILES=$(git diff --name-only --diff-filter=d $MERGE_BASE $CURRENT_BRANCH | grep -E '^docs/.*\.(md|mdx)$' | tr '\n' ' ')

  # Also check for uncommitted changes
  UNCOMMITTED_FILES=$(git diff --name-only HEAD | grep -E '^docs/.*\.(md|mdx)$' | tr '\n' ' ')

  # And new untracked files that match our pattern
  UNTRACKED_FILES=$(git ls-files --others --exclude-standard | grep -E '^docs/.*\.(md|mdx)$' | tr '\n' ' ')

  # Combine all files and remove duplicates
  ALL_FILES="$CHANGED_FILES $UNCOMMITTED_FILES $UNTRACKED_FILES"
  UNIQUE_FILES=$(echo "$ALL_FILES" | tr ' ' '\n' | sort | uniq | tr '\n' ' ')
  CHANGED_FILES="$UNIQUE_FILES"

  # Check if there are any changed files
  if [ -z "$CHANGED_FILES" ]; then
      echo -e "${GREEN}No changed files to analyze${NC}"
      exit 0
  fi

  echo -e "${YELLOW}Running Vale on changed files: $CHANGED_FILES${NC}"

  # Run Vale on the changed files
  vale --config="$REPO_ROOT/.vale.ini" $CHANGED_FILES
else
  # Run Vale on the specified files using glob pattern or list
  echo -e "${YELLOW}Running Vale on files: $FILE_PATTERN${NC}"

  # Handle the case where multiple files or patterns are specified
  if [[ "$FILE_PATTERN" == *"*"* ]]; then
    # Contains wildcard, use find to expand
    FILES_TO_CHECK=$(find . -type f -path "$FILE_PATTERN" | tr '\n' ' ')

    if [ -z "$FILES_TO_CHECK" ]; then
      echo -e "${RED}No files found matching pattern: $FILE_PATTERN${NC}"
      exit 1
    fi

    echo -e "${YELLOW}Found files: $FILES_TO_CHECK${NC}"
    vale --config="$REPO_ROOT/.vale.ini" $FILES_TO_CHECK
  else
    # Could be a space-separated list of files or a single file
    FILES_TO_CHECK=""

    # Split the input by spaces and check each file/pattern
    for file in $FILE_PATTERN; do
      if [ -f "$file" ]; then
        FILES_TO_CHECK="$FILES_TO_CHECK $file"
      else
        echo -e "${RED}Warning: File not found: $file${NC}"
      fi
    done

    if [ -z "$FILES_TO_CHECK" ]; then
      echo -e "${RED}No valid files found${NC}"
      exit 1
    fi

    echo -e "${YELLOW}Checking files: $FILES_TO_CHECK${NC}"
    vale --config="$REPO_ROOT/.vale.ini" $FILES_TO_CHECK
  fi
fi

echo -e "${GREEN}Vale check complete${NC}"
