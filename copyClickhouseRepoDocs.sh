#! ./bin/bash

SCRIPT_NAME=$(basename "$0")

echo "[$SCRIPT_NAME] Start tasks for copying docs from ClickHouse repo"

# Clone ClickHouse repo
echo "[$SCRIPT_NAME] Start cloning ClickHouse repo"
git clone --depth 1 https://github.com/ClickHouse/ClickHouse.git
echo "[$SCRIPT_NAME] Cloning completed"

# Copy docs folders from ClickHouse repo to docs folder
echo "[$SCRIPT_NAME] Start copying docs"
cp -r ClickHouse/docs/en/development     docs/en/
cp -r ClickHouse/docs/en/engines         docs/en/
cp -r ClickHouse/docs/en/getting-started docs/en/
cp -r ClickHouse/docs/en/interfaces      docs/en/
cp -r ClickHouse/docs/en/operations      docs/en/
cp -r ClickHouse/docs/en/sql-reference   docs/en/
cp -r ClickHouse/docs/ru                 docs/
cp -r ClickHouse/docs/zh                 docs/
cp -r ClickHouse/docs/ja                 docs/

# Necessary for autogenerating settings
cp ClickHouse/src/Core/FormatFactorySettings.h "$(dirname "$0")"
cp ClickHouse/src/Core/Settings.cpp "$(dirname "$0")"

echo "[$SCRIPT_NAME] Copying completed"

echo "[$SCRIPT_NAME] Generate changelog"
cp docs/en/_placeholders/changelog/_index.md docs/en/whats-new/changelog/index.md
sed "0,/^# $(date +%Y) Changelog/d" \
    < ClickHouse/CHANGELOG.md \
    >> docs/en/whats-new/changelog/index.md

# Delete ClickHouse repo
echo "[$SCRIPT_NAME] Start deleting ClickHouse repo"
rm -r ClickHouse
echo "[$SCRIPT_NAME] Deleting ClickHouse repo completed"

echo "[$SCRIPT_NAME] Finish tasks for copying docs from ClickHouse repo"
