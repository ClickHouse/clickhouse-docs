WITH
    merge_tree_settings AS
        (
            SELECT format(
                           '## {} {} \n{}\n{}{}',
                           name,
                           '{#'||name||'}',
                           multiIf(tier == 'Experimental', '\n<ExperimentalBadge/>\n', tier == 'Beta', '\n<BetaBadge/>\n', ''),
                           if(type != '' AND default != '', format('|Type|Default|\n|---|---|\n|`{}`|`{}`|\n\n',type, default), ''),
                           replaceRegexpAll(description, '(?m)(^[ \t]+|[ \t]+$)', '')
                   )
            FROM system.merge_tree_settings ORDER BY name
        )
SELECT * FROM merge_tree_settings
INTO OUTFILE 'generated_merge_tree_settings.md' TRUNCATE FORMAT LineAsString