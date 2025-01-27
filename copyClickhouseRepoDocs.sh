#! /bin/bash

SCRIPT_NAME=$(basename "$0")

rm -rf ClickHouse
echo "[$SCRIPT_NAME] Start tasks for copying docs from ClickHouse repo"

# Clone ClickHouse repo
echo "[$SCRIPT_NAME] Start cloning ClickHouse repo"
git clone --depth 1 https://github.com/ClickHouse/ClickHouse.git temp
cp -r temp/ ClickHouse/
rm -rf temp
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

# Necessary for autogenerating settings
cp ClickHouse/src/Core/FormatFactorySettings.h "$(dirname "$0")"
cp ClickHouse/src/Core/Settings.cpp "$(dirname "$0")"

echo "[$SCRIPT_NAME] Copying completed"

echo "[$SCRIPT_NAME] Generate changelog"
cp docs/en/_placeholders/changelog/_index.md docs/en/whats-new/changelog/index.md
if grep -q "^# $(date +%Y) Changelog" ClickHouse/CHANGELOG.md; then
  echo "Generating $(date +%Y) Changelog..."
  sed "/^# $(date +%Y) Changelog/d" ClickHouse/CHANGELOG.md > temp.txt
  echo "Changelog copied to temp.txt"
  cat temp.txt >> docs/en/whats-new/changelog/index.md
  echo "Changelog written to docs/en/whats-new/changelog/index.md"
  rm -f temp.txt
  echo "$(date +%Y) Changelog was updated."
else
  current_year="$(date +%Y)"
  previous_year="$(($current_year - 1))"
  echo "No Changelog found for $current_year."
  echo -e ":::note\nThere have been no new releases yet for $current_year.  \n View changelog for the year [$previous_year](/docs/en/whats-new/changelog/$previous_year).\n:::" >> docs/en/whats-new/changelog/index.md
fi

# Delete ClickHouse repo
echo "[$SCRIPT_NAME] Start deleting ClickHouse repo"
rm -rf ClickHouse
echo "[$SCRIPT_NAME] Deleting ClickHouse repo completed"

echo "[$SCRIPT_NAME] Finish tasks for copying docs from ClickHouse repo"
