-- Consolidated system table documentation generator with nested enum handling
WITH table_columns AS (
    SELECT
        name,
        type,
        comment,
        position
    FROM system.columns
    WHERE database = 'system' AND table = {table:String}
    ORDER BY position
),
formatted_columns AS (
    SELECT
        CASE
            -- Check if this is an Enum type with possible values listed
            WHEN startsWith(type, 'Enum') AND position(comment, 'Possible values:') > 0 THEN
                concat(
                    '- `', name, '` ([', type, '](../../sql-reference/data-types/)) — ',
                    -- Main description before "Possible values:"
                    trim(substring(comment, 1, position(comment, 'Possible values:') - 1)),
                    'Possible values:\n',
                    -- Parse and format each enum value as nested bullet
                    arrayStringConcat(
                        arrayMap(
                            x -> concat('  - **', 
                                       trim(replaceRegexpOne(splitByString(' — ', x)[1], '^[''"]|[''"]$', '')),
                                       '** — ', 
                                       trim(arrayElement(splitByString(' — ', x), 2))),
                            arrayFilter(
                                x -> length(trim(x)) > 0,
                                splitByString(', ', 
                                    trim(substring(comment, position(comment, 'Possible values:') + length('Possible values:'))))
                            )
                        ),
                        char(10)
                    )
                )
            -- Regular column (non-enum or enum without parsed values)
            ELSE
                concat('- `', name, '` ([', type, '](../../sql-reference/data-types/)) — ', comment)
        END as formatted_column
    FROM table_columns
    WHERE comment != ''
)
SELECT
    arrayStringConcat(
        groupArray(formatted_column),
        char(10)
    )
FROM formatted_columns
LIMIT 1
INTO OUTFILE 'temp-system-table.md' TRUNCATE FORMAT LineAsString