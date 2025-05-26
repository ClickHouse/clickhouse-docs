WITH arithmetic_functions AS (
    SELECT
        name,
        introduced_in,
        syntax,
        arguments,
        returned_value,
        examples
    FROM system.functions WHERE categories='Arithmetic'
)
SELECT
    format(
        '{}{}{}{}{}{}',
        '## ' || name || ' ' || printf('{#%s}', name) || '\n\n',
        'Introduced in: v'||introduced_in||'\n\n',
        '### Syntax {#syntax}\n\n'||printf('```sql\n%s\n```', syntax)||'\n\n',
        '### Arguments {#arguments}\n\n'||arguments||'\n',
        '### Returned value {#returned_value}\n\n'||trim(returned_value)||'\n\n',
        '### Examples {#examples}\n\n'||examples||'\n'
    )
FROM arithmetic_functions
INTO OUTFILE 'arithmetic-functions.md' TRUNCATE FORMAT LineAsString