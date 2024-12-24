#!/bin/bash

handle_error() {
  echo -e "\033[0;31m[$SCRIPT_NAME] An error occurred: $1"
  exit 1
}

SCRIPT_NAME=$(basename "$0")

echo "[$SCRIPT_NAME] Start tasks for copying docs from ClickHouse repo"

# Clone ClickHouse repo
echo "[$SCRIPT_NAME] Start cloning ClickHouse repo"
ch_temp=/tmp/ch_temp_$RANDOM && mkdir -p $ch_temp && git clone --depth 1 --branch master https://github.com/ClickHouse/ClickHouse $ch_temp
echo -e "[$SCRIPT_NAME] \033[0;32mCloning completed\033[0m"

# Copy docs folders from ClickHouse repo to docs folder
echo "[$SCRIPT_NAME] Start copying docs"
cp -r $ch_temp/docs/en/development     docs/en/ &&
cp -r $ch_temp/docs/en/engines         docs/en/ &&
cp -r $ch_temp/docs/en/getting-started docs/en/ &&
cp -r $ch_temp/docs/en/interfaces      docs/en/ &&
cp -r $ch_temp/docs/en/operations      docs/en/ &&
cp -r $ch_temp/docs/en/sql-reference   docs/en/ &&
cp -r $ch_temp/docs/ru                 docs/ &&
cp -r $ch_temp/docs/zh                 docs/ || handle_error "Copying docs folders from ClickHouse repo to docs folder"

# Necessary for autogenerating settings
cp $ch_temp/src/Core/FormatFactorySettings.h "$(dirname "$0")/settings" &&
cp $ch_temp/src/Core/Settings.cpp "$(dirname "$0")/settings" || handle_error "Copying C++ source files used for autogeneration"

echo -e "[$SCRIPT_NAME] \033[0;32mCopying completed successfully\033[0m"

echo -e "[$SCRIPT_NAME] Generate changelog"
cp docs/en/_placeholders/changelog/_index.md docs/en/whats-new/changelog/index.md &&
sed "0,/^# $(date +%Y) Changelog/d" \
    < ClickHouse/CHANGELOG.md \
    >> docs/en/whats-new/changelog/index.md || handle_error "Generating changelog"
echo -e "[$SCRIPT_NAME] \033[0;32mGenerate changelog completed successfully\033[0m"

# Cleanup
echo "[$SCRIPT_NAME] Start deleting temporarily cloned ClickHouse repo"
rm -r $ch_temp -f || handle_error "could not delete $ch_temp"

echo -e "[$SCRIPT_NAME] \033[0;32mCleanup completed successfully\033[0m"
echo -e "[$SCRIPT_NAME] \033[0;32mFinished successfully\033[0m"
