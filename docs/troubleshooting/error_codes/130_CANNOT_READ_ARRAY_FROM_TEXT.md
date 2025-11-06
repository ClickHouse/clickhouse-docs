---
slug: /troubleshooting/error-codes/130_CANNOT_READ_ARRAY_FROM_TEXT
sidebar_label: '130 CANNOT_READ_ARRAY_FROM_TEXT'
doc_type: 'reference'
keywords: ['error codes', 'CANNOT_READ_ARRAY_FROM_TEXT', '130', 'array', 'parsing', 'format', 'brackets']
title: '130 CANNOT_READ_ARRAY_FROM_TEXT'
description: 'ClickHouse error code - 130 CANNOT_READ_ARRAY_FROM_TEXT'
---

# Error 130: CANNOT_READ_ARRAY_FROM_TEXT

:::tip
This error occurs when ClickHouse cannot parse array data from text formats because the array doesn't start with the expected `[` character or contains invalid syntax.
This typically happens during data import, when using arrays with scalar CTEs/subqueries, or when migrating data from other databases like PostgreSQL.
:::

## Most common causes {#most-common-causes}

1. **Incorrect array syntax in text formats**
    - Array uses curly braces `{1,2,3}` instead of square brackets `[1,2,3]`
    - Common when importing data from PostgreSQL
    - Array quoted incorrectly in CSV/TSV formats
    - Missing opening `[` bracket
    - Malformed array syntax

2. **Using scalar CTE/subquery returning array with IN clause**
    - Using `WITH (SELECT groupArray(...)) AS arr` syntax (scalar)
    - ClickHouse tries to parse scalar result as text array
    - Should use CTE syntax `WITH arr AS (SELECT ...)` instead
    - Affects queries with `WHERE col IN (scalar_array)`

3. **Nested array format mismatch**
    - Inner arrays use different bracket styles
    - Mixed quoting in nested arrays
    - Spaces inside array not allowed in some formats

4. **Format-specific array syntax issues**
    - Values format expects unquoted array literals
    - CSV expects arrays in quoted strings
    - TSV expects specific array escaping
    - Custom delimiters not matching format expectations

5. **Invalid characters in array**
    - Unescaped quotes inside array elements
    - Special characters not properly escaped
    - Null representation issues

## What to do when you encounter this error {#what-to-do}

**1. Check your array syntax**

```sql
-- Verify array format
SELECT * FROM format(TSV, '[1,2,3]');  -- Correct
SELECT * FROM format(TSV, '{1,2,3}');  -- Wrong - throws error
```

**2. Examine your data file**

```bash
# Check actual array syntax in file
head -n 10 your_data_file.tsv

# Look for arrays with curly braces {} instead of []
grep -o '{[0-9,]*}' your_data_file.tsv | head
```

**3. Test with simplified array data**

```sql
-- Test minimal case
SELECT * FROM format(CSV, '"[1,2,3]"');

-- Check if escaping is the issue
DESC format(CSV, '\"[1,2,3]\",\"[[1, 2], [], [3, 4]]\"');
```

**4. Review recent queries for scalar CTE usage**

```sql
-- Check query_log for CANNOT_READ_ARRAY_FROM_TEXT errors
SELECT
    event_time,
    query,
    exception
FROM system.query_log
WHERE exception_code = 130
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC
LIMIT 10;
```

## Quick fixes {#quick-fixes}

**1. PostgreSQL array import - convert curly braces to brackets**

```bash
# Replace curly braces with square brackets before import
sed 's/{/[/g; s/}/]/g' postgres_dump.tsv > clickhouse_import.tsv

# Or use sed during pipe
cat postgres_dump.tsv | sed 's/{/[/g; s/}/]/g' | clickhouse-client --query="INSERT INTO table FORMAT TSV"
```

**2. Fix scalar CTE syntax for arrays in IN clause**

```sql
-- Instead of scalar syntax (fails):
WITH (SELECT groupArray(number) FROM numbers(10)) AS ids
SELECT * FROM numbers(100) WHERE number IN (ids);
-- Error: CANNOT_READ_ARRAY_FROM_TEXT

-- Use CTE syntax (works):
WITH ids AS (SELECT groupArray(number) FROM numbers(10))
SELECT * FROM numbers(100) WHERE number IN (SELECT arrayJoin(arr) FROM ids);

-- Or use literal array construction:
WITH ids AS (SELECT groupArray(number) FROM numbers(10))
SELECT * FROM numbers(100) WHERE number IN ids;

-- Or extract values with arrayJoin:
WITH (SELECT groupArray(number) FROM numbers(10)) AS ids
SELECT * FROM numbers(100) WHERE number IN (SELECT arrayJoin(ids));
```

**3. Ensure proper quoting in CSV format**

```sql
-- Arrays in CSV must be quoted
-- Correct:
SELECT * FROM format(CSV, '"[1,2,3]","[[1,2],[3,4]]"');

-- Wrong (not quoted):
SELECT * FROM format(CSV, '[1,2,3],[[1,2],[3,4]]');
```

**4. Use appropriate format settings for array parsing**

```sql
-- For nested CSV arrays:
SET input_format_csv_arrays_as_nested_csv = 1;
SELECT * FROM format(CSV, '"""[""""Hello"""", """"world"""", """"42"""""""" TV""""]"""');

-- Adjust max array size if needed:
SET format_binary_max_array_size = 0;  -- Unlimited
```

**5. Convert data inline during SELECT**

```sql
-- If source has curly braces, transform during read:
SELECT
    replaceRegexpAll(array_column, '[{}]', match -> if(match = '{', '[', ']'))
FROM input('array_column String')
FORMAT TSV
SETTINGS input_format_tsv_use_best_effort_in_schema_inference = 0;
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: PostgreSQL array migration**

```text
Code: 130. DB::Exception: Array does not start with '[' character. (CANNOT_READ_ARRAY_FROM_TEXT)
```

**Cause:** PostgreSQL exports arrays with curly braces `{1,2,3}` but ClickHouse expects square brackets `[1,2,3]`.

**Solution:**
```bash
# Option 1: Transform during export with psql
psql -c "COPY (SELECT regexp_replace(flags::text, '[{}]', '', 'g') as flags FROM table) TO STDOUT" | 
    clickhouse-client --query="INSERT INTO table FORMAT TSV"

# Option 2: Transform the TSV file
sed -i 's/{/[/g; s/}/]/g' postgres_export.tsv
clickhouse-client --query="INSERT INTO table FORMAT TSV" < postgres_export.tsv

# Option 3: Read as String and transform in ClickHouse
CREATE TABLE staging (flags String) ENGINE = Memory;
INSERT INTO staging FROM INFILE 'postgres_export.tsv' FORMAT TSV;

INSERT INTO target_table
SELECT replaceAll(replaceAll(flags, '{', '['), '}', ']') AS flags
FROM staging;
```

**Scenario 2: Scalar CTE with array in IN clause**

```text
Code: 130. DB::Exception: Array does not start with '[' character: 
while executing 'FUNCTION in(toString(number), _subquery) UInt8'. (CANNOT_READ_ARRAY_FROM_TEXT)
```

**Cause:** Using scalar CTE syntax `WITH (SELECT groupArray(...)) AS arr` creates a scalar value, not a usable array in IN clause.

**Solution:**

```sql
-- Problem (scalar CTE):
WITH (SELECT groupArray(number) FROM numbers(10)) AS ids
SELECT * FROM numbers(100) WHERE number IN (ids);
-- Error: CANNOT_READ_ARRAY_FROM_TEXT

-- Solution 1: Use arrayJoin to expand array:
WITH (SELECT groupArray(number) FROM numbers(10)) AS ids
SELECT * FROM numbers(100) WHERE number IN (SELECT arrayJoin(ids));

-- Solution 2: Use proper CTE syntax (not scalar):
WITH ids AS (SELECT number FROM numbers(10))
SELECT * FROM numbers(100) WHERE number IN ids;

-- Solution 3: Use array literal directly:
WITH [0,1,2,3,4,5,6,7,8,9] AS ids
SELECT * FROM numbers(100) WHERE number IN ids;
```

**Scenario 3: Array format in TSV import**

```text
Code: 130. DB::Exception: Array does not start with '[' character: (at row 2)
```

**Cause:** TSV file contains improperly formatted array data (wrong brackets, missing quotes, etc).

**Solution:**
```sql
-- Verify TSV array format
-- Arrays in TSV should look like:
-- [1,2,3]    [['a','b'],['c','d']]

-- For quoted arrays:
-- ['Hello', 'world']    [['Abc', 'Def'], []]

-- If data has wrong format, read as String first:
CREATE TABLE temp (arr_str String) ENGINE = Memory;
INSERT INTO temp FROM INFILE 'data.tsv' FORMAT TSV;

-- Then parse and fix:
INSERT INTO target_table
SELECT 
    JSONExtract(
        replaceAll(replaceAll(arr_str, '{', '['), '}', ']'), 
        'Array(Int64)'
    ) AS arr
FROM temp;
```

**Scenario 4: Nested CSV arrays**

```text
Array does not start with '[' character in CSV nested array
```

**Cause:** CSV nested arrays require special escaping and quoting.

**Solution:**

```sql
-- Enable nested CSV arrays setting:
SET input_format_csv_arrays_as_nested_csv = 1;

-- Arrays in CSV can then be quoted with nested escaping:
SELECT * FROM format(CSV, '"""[""""Hello"""", """"world""""]"""');

-- Or use standard array format in quoted field:
SELECT * FROM format(CSV, '"[''Hello'', ''world'']"');
```

**Scenario 5: Incompatible array delimiters in custom formats**

```text
CANNOT_READ_ARRAY_FROM_TEXT in CustomSeparated format
```

**Cause:** Custom format using delimiters that conflict with array syntax.

**Solution:**
```sql
-- Ensure custom delimiters don't use array characters
SET format_custom_field_delimiter = '|';     -- Not ',' or ']' or '['
SET format_custom_escaping_rule = 'Escaped';

-- Or read arrays as strings first:
CREATE TABLE temp (arr String) ENGINE = Memory;
-- Insert with custom format
-- Then parse:
SELECT JSONExtract(arr, 'Array(String)') FROM temp;
```

## Prevention best practices {#prevention}

1. **Understand array format requirements by input format**

   ```sql
   -- CSV: Arrays must be in quoted strings
   '"[1,2,3]","[4,5,6]"'
   
   -- TSV: Arrays without quotes
   '[1,2,3]\t[4,5,6]'
   
   -- Values: Array literals
   '([1,2,3], [4,5,6])'
   
   -- JSON: Native JSON arrays
   '{"arr": [1,2,3]}'
   ```

2. **Use appropriate scalar vs CTE syntax**

   ```sql
   -- For scalar values (single result):
   WITH (SELECT max(x) FROM table) AS max_val
   SELECT ...;
   
   -- For arrays/sets (multiple values):
   WITH ids AS (SELECT id FROM table)
   SELECT ... WHERE id IN ids;
   
   -- NOT: WITH (SELECT groupArray(id) FROM table) AS ids
   ```

3. **Validate array syntax before import**

   ```bash
   # Check array format in file
   head -n 5 data.tsv | grep -o '\[.*\]'
   
   # Replace PostgreSQL arrays before import
   sed 's/{/[/g; s/}/]/g' input.tsv > output.tsv
   ```

4. **Test format with small sample first**

   ```sql
   -- Test parsing with single row
   SELECT * FROM format(TSV, '[1,2,3]');
   
   -- Verify schema inference
   DESC format(TSV, '[1,2,3]\t["a","b","c"]');
   ```

5. **Handle format-specific array settings**

   ```sql
   -- Configure for your format:
   SET input_format_csv_arrays_as_nested_csv = 1;  -- For nested CSV
   SET input_format_tsv_use_best_effort_in_schema_inference = 1;
   SET format_binary_max_array_size = 1000000;  -- Prevent huge arrays
   ```

6. **Use schema hints for complex arrays**

   ```sql
   -- Specify array types explicitly
   SELECT * FROM file('data.tsv')
   SETTINGS schema_inference_hints = 'arr1 Array(Int64), arr2 Array(String)';
   ```

## Related error codes {#related-errors}

- **Error 6 `CANNOT_PARSE_TEXT`**: General parsing error for malformed text data
- **Error 53 `TYPE_MISMATCH`**: CAST AS Array type mismatch
- **Error 33 `CANNOT_READ_ALL_DATA`**: Cannot read all array values from binary format

## Array format reference by input format {#array-format-reference}

| Format              | Array Syntax                  | Example                | Requires Quoting  |
|---------------------|-------------------------------|------------------------|-------------------|
| **CSV**             | Square brackets in quotes     | `"[1,2,3]"`            | Yes               |
| **TSV**             | Square brackets, no quotes    | `[1,2,3]`              | No                |
| **Values**          | Square brackets, SQL-style    | `([1,2,3], ['a','b'])` | No                |
| **JSON**            | Native JSON arrays            | `{"arr": [1,2,3]}`     | N/A (JSON format) |
| **JSONEachRow**     | Native JSON arrays            | `{"arr": [1,2,3]}`     | N/A (JSON format) |
| **TabSeparated**    | Square brackets with escaping | `[1,2,3]`              | No                |
| **CustomSeparated** | Depends on escaping rule      | Varies                 | Varies            |

**PostgreSQL compatibility:**
- PostgreSQL exports: `{1,2,3}`
- ClickHouse expects: `[1,2,3]`
- **Must transform before import**

## Related settings {#related-settings}

```sql
-- CSV array settings
SET input_format_csv_arrays_as_nested_csv = 1;  -- Nested CSV in arrays
SET input_format_csv_use_best_effort_in_schema_inference = 1;

-- TSV array settings
SET input_format_tsv_use_best_effort_in_schema_inference = 1;

-- Array size limits
SET format_binary_max_array_size = 1000000;  -- Max array elements (0 = unlimited)

-- Schema inference
SET schema_inference_hints = 'column_name Array(Type)';
SET input_format_max_rows_to_read_for_schema_inference = 25000;

-- Error tolerance during import
SET input_format_allow_errors_num = 10;  -- Allow N errors
SET input_format_allow_errors_ratio = 0.01;  -- Allow 1% errors
```
