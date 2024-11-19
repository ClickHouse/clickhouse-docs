#! ./bin/bash

SCRIPT_NAME=$(basename "$0")

echo "[$SCRIPT_NAME] Autogenerating markdown from settings"

# Install ClickHouse
if [ ! -f ./clickhouse ]; then
  echo -e "[$SCRIPT_NAME] Installing ClickHouse binary\n"
  curl https://clickhouse.com/ | sh
fi

# Autogenerate Format settings
echo "[$SCRIPT_NAME] Autogenerating format settings"
./clickhouse -q "
WITH
'FormatFactorySettings.h' AS cpp_file,
format_settings_from_source AS
(
    SELECT extract(line, 'DECLARE\\(\\w+, (\\w+),') AS name
    FROM file(cpp_file, LineAsString)
    WHERE match(line, '^\\s*DECLARE\\(')
)
SELECT
    name,
    description,
    type,
    default,
    tier,
FROM system.settings
WHERE name IN format_settings_from_source
ORDER BY
  CASE
    WHEN tier = 'Production' THEN 1
    WHEN tier = 'Beta' THEN 2
    WHEN tier = 'Experimental' THEN 3
    WHEN tier = 'Obsolete' THEN 4
  END, name ASC
INTO OUTFILE 'docs/en/operations/settings/settings-formats.md' TRUNCATE
FORMAT Template
SETTINGS
format_template_resultset = 'scripts/settings/resultset_format_settings.format',
format_template_row = 'scripts/settings/row_settings.format'
"

# Autogenerate system.settings (Core Settings)
echo "[$SCRIPT_NAME] Autogenerating core settings"
./clickhouse -q "
WITH
'Settings.cpp' AS cpp_file,
system_settings_from_source AS
(
    SELECT extract(line, 'DECLARE\\(\\w+, (\\w+),') AS name
    FROM file(cpp_file, LineAsString)
    WHERE match(line, '^\\s*DECLARE\\(')
)
SELECT
    name,
    description,
    type,
    default,
    tier
FROM system.settings
WHERE name IN system_settings_from_source
ORDER BY
  CASE
    WHEN tier = 'Production' THEN 1
    WHEN tier = 'Beta' THEN 2
    WHEN tier = 'Experimental' THEN 3
    WHEN tier = 'Obsolete' THEN 4
  END, name ASC
INTO OUTFILE 'docs/en/operations/settings/settings.md' TRUNCATE
FORMAT Template
SETTINGS format_template_resultset = 'scripts/settings/resultset_system_settings.format',
format_template_row = 'scripts/settings/row_settings.format'
"

# Autogenerate system.merge_tree_settings
echo "[$SCRIPT_NAME] Autogenerating merge tree settings"
./clickhouse -q "
SELECT
    name,
    description,
    type,
    value,
    tier
FROM system.merge_tree_settings
ORDER BY
  CASE
    WHEN tier = 'Production' THEN 1
    WHEN tier = 'Beta' THEN 2
    WHEN tier = 'Experimental' THEN 3
    WHEN tier = 'Obsolete' THEN 4
  END, name ASC
INTO OUTFILE 'docs/en/operations/settings/merge-tree-settings.md' TRUNCATE
FORMAT Template
SETTINGS format_template_resultset = 'scripts/settings/resultset_merge_tree_settings.format',
format_template_row = 'scripts/settings/row_settings.format'
"

# Delete ClickHouse
if [ -f ./clickhouse ]; then
  echo -e "\n[$SCRIPT_NAME] Deleting ClickHouse binary"
  rm ./clickhouse
fi

echo "[$SCRIPT_NAME] Autogenerating settings completed"
