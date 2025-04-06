WITH
    experimental_session_settings AS
        (
            SELECT
                format('[{}](/operations/settings/settings#{})', name, name) AS Name,
                format('`{}`', default) AS Default
            FROM system.settings
            WHERE tier = 'Experimental'
        ),
    experimental_mergetree_settings AS
        (
            SELECT
                format('[{}](/operations/settings/merge-tree-settings#{})', name, name) AS Name,
                format('`{}`', default) AS Default
            FROM system.merge_tree_settings
            WHERE tier = 'Experimental'
        ),
    combined AS
        (
            SELECT *
            FROM experimental_session_settings
            UNION ALL
            SELECT *
            FROM experimental_mergetree_settings
        )
SELECT *
FROM combined
ORDER BY Name ASC
INTO OUTFILE 'experimental-settings.md' TRUNCATE
FORMAT markdown
