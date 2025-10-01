-- Consolidated function documentation generator
-- Usage: Pass the category as a parameter, e.g.:
-- clickhouse --param_category='Arithmetic' --queries-file generate-functions.sql

WITH function_docs AS (
    SELECT
        name,
        description,
        introduced_in,
        syntax,
        arguments,
        returned_value,
        examples
    FROM system.functions
    WHERE categories = {category:String}
ORDER BY name ASC
    )
SELECT
    format(
            '{}{}{}{}{}{}{}',
            '## ' || name || ' ' || printf('{#%s}', name) || '\n\n',
            'Introduced in: v' || introduced_in || '\n\n',
            description || '\n\n',
            '**Syntax**\n\n' || printf('```sql\n%s\n```', syntax) || '\n\n',
            if(empty(arguments), '**Arguments**\n\n- None.\n', '**Arguments**\n\n' || arguments || '\n\n'),
            '**Returned value**\n\n' || trim(returned_value) || '\n\n',
            '**Examples**\n\n' || examples || '\n'
    )
FROM function_docs
INTO OUTFILE 'temp-functions.md' TRUNCATE FORMAT LineAsString
