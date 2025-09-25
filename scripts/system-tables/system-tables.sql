-- Consolidated system table documentation generator
WITH table_columns AS (
    SELECT
        name,
        type,
        comment,
        position
    FROM system.columns
    WHERE database = 'system' AND table = {table:String}
    ORDER BY position
)
SELECT
    (SELECT groupConcat('- `' || name || '` ([' || type || '](../../sql-reference/data-types/)) — ' || comment, '\n') 
     FROM table_columns WHERE comment != '')
FROM table_columns
LIMIT 1
INTO OUTFILE 'temp-system-table.md' TRUNCATE FORMAT LineAsString