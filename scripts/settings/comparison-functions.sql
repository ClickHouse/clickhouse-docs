WITH comparison_functions AS (
    SELECT
        name,
        introduced_in,
        syntax,
        arguments,
        returned_value,
        examples
    FROM system.functions WHERE categories='Comparison' ORDER BY name ASC
)
SELECT
    format(
            '{}{}{}{}{}{}',
            '## ' || name || ' ' || printf('{#%s}', name) || '\n\n',
            'Introduced in: v'||introduced_in||'\n\n',
            '**Syntax**\n\n'||printf('```sql\n%s\n```', syntax)||'\n\n',
            if(empty(arguments), '**Arguments**\n\n- None.\n', '**Arguments**\n\n'||arguments||'\n'),
            '**Returned value**\n\n'||trim(returned_value)||'\n\n',
            '**Examples**\n\n'||examples||'\n'
    )
FROM comparison_functions
    INTO OUTFILE 'comparison-functions.md' TRUNCATE FORMAT LineAsString
