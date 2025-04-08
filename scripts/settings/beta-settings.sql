-- First write the header
SELECT '\n\n## Beta settings {#beta-settings}\n\n| Name | Default |\n|------|--------|'
INTO OUTFILE 'beta-settings.md' TRUNCATE
FORMAT TSVRaw;

-- Then append the table content
WITH
    experimental_session_settings AS
        (
            SELECT
                format('[{}](/operations/settings/settings#{})', name, name) AS Name,
                format('`{}`', ifNull(default, ' ')) AS Default
FROM system.settings
WHERE tier = 'Beta' AND alias_for=''
    ),
    experimental_mergetree_settings AS
    (
SELECT
    format('[{}](/operations/settings/merge-tree-settings#{})', name, name) AS Name,
    format('`{}`', default) AS Default
FROM system.merge_tree_settings
WHERE tier = 'Beta'
    ),
    combined AS
    (
SELECT *
FROM experimental_session_settings
UNION ALL
SELECT *
FROM experimental_mergetree_settings
ORDER BY Name ASC
    )
SELECT concat('| ', Name, ' | ', Default, ' |')
FROM combined
    INTO OUTFILE 'beta-settings.md' APPEND
FORMAT TSVRaw;
