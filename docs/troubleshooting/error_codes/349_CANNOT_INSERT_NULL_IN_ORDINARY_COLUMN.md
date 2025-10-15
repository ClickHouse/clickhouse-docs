---
slug: /troubleshooting/error-codes/349_CANNOT_INSERT_NULL_IN_ORDINARY_COLUMN
sidebar_label: '349 CANNOT_INSERT_NULL_IN_ORDINARY_COLUMN'
doc_type: 'reference'
keywords: ['error codes', 'CANNOT_INSERT_NULL_IN_ORDINARY_COLUMN', '349', 'null', 'nullable', 'insert']
title: '349 CANNOT_INSERT_NULL_IN_ORDINARY_COLUMN'
description: 'ClickHouse error code - 349 CANNOT_INSERT_NULL_IN_ORDINARY_COLUMN'
---

# Error 349: CANNOT_INSERT_NULL_IN_ORDINARY_COLUMN

:::tip
This error occurs when you attempt to insert a `NULL` value into a column that is not defined as `Nullable`.
ClickHouse requires explicit `Nullable()` type declaration to accept null values.
:::

## Most common causes {#most-common-causes}

1. **Importing data with NULL values from external sources**
    - Parquet, CSV, or JSON files containing null values
    - Schema inference creates Nullable types that don't match table schema
    - S3, file(), or table function imports without explicit schema
    - NULL values in arrays or nested structures

2. **Materialized view type mismatches**
    - SELECT clause returns nullable columns but target table expects non-nullable
    - Using `NULL` literal without column alias in materialized views
    - Conditional expressions (if/case) that can return NULL
    - Missing `coalesce()` or default value handling

3. **Schema inference conflicts**
    - `schema_inference_make_columns_nullable=1` creates Nullable types
    - Target table columns are non-nullable
    - Using wildcards `{}` in file paths changes inference behavior
    - Applying functions in SELECT prevents using INSERT table structure

4. **Tuple and complex type conversions**
    - Nested fields in Tuples have nullable elements
    - Target table has non-nullable nested elements
    - Error messages may not clearly indicate which tuple field failed

5. **Direct INSERT with NULL literals**
    - Using `NULL as column_name` syntax incorrectly
    - Inserting explicit NULL values into non-nullable columns
    - Missing type casts for NULL values

## What to do when you encounter this error {#what-to-do}

**1. Identify the problematic column**

The error message indicates which column cannot accept NULL:

```
Cannot convert NULL value to non-Nullable type: while converting source column 
price to destination column price
```

**2. Check your table schema**

```sql
-- View column nullability
SELECT 
    name,
    type,
    is_in_primary_key
FROM system.columns
WHERE table = 'your_table' 
  AND database = 'your_database'
ORDER BY position;
```

**3. Review source data for NULL values**

```sql
-- For Parquet/CSV files via s3()
DESCRIBE s3('your-file-path', 'format');

-- Check for NULL values
SELECT 
    column_name,
    countIf(column_name IS NULL) as null_count
FROM s3('your-file-path', 'format')
GROUP BY column_name;
```

## Quick fixes {#quick-fixes}

**1. Make the column Nullable**

```sql
-- Modify existing column to accept NULL
ALTER TABLE your_table 
    MODIFY COLUMN column_name Nullable(String);

-- Create new table with Nullable columns
CREATE TABLE your_table
(
    id UInt64,
    name Nullable(String),  -- Allows NULL
    status String           -- Does not allow NULL
)
ENGINE = MergeTree
ORDER BY id;
```

**2. For file imports - use safe conversion settings**

```sql
-- Let NULLs become default values (0, '', etc.)
SET input_format_null_as_default = 1;

-- Disable automatic nullable inference
SET schema_inference_make_columns_nullable = 0;

-- Then import
INSERT INTO your_table 
SELECT * FROM s3('file.parquet', 'Parquet');
```

**3. For file imports with wildcards or functions - specify schema**

```sql
-- Explicitly define column structure
INSERT INTO your_table
SELECT *
FROM s3(
    'https://bucket.s3.amazonaws.com/{file*.parquet}',
    'access_key',
    'secret_key',
    'Parquet',
    'id UInt64, name String, price Float64'  -- Explicit non-nullable schema
);

-- Or use setting to inherit from target table
SET use_structure_from_insertion_table_in_table_functions = 1;
```

**4. For materialized views - use `coalesce()`**

```sql
-- Instead of this (fails):
CREATE MATERIALIZED VIEW mv TO target_table AS
SELECT
    if(op = 'd', before_id, after_id) AS business_id
FROM source_table;

-- Use this (works):
CREATE MATERIALIZED VIEW mv TO target_table AS
SELECT
    coalesce(if(op = 'd', before_id, after_id), 0) AS business_id
FROM source_table;
```

**5. Handle NULL explicitly in queries**

```sql
-- Replace NULL with default values
INSERT INTO target_table
SELECT
    coalesce(nullable_column, 0) AS column_name,
    ifNull(another_column, 'default') AS another_name
FROM source;

-- Or use assumeNotNull (careful - throws error if NULL exists)
SELECT assumeNotNull(nullable_column) FROM source;
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: Parquet file import with NULL values**

```
Cannot convert NULL value to non-Nullable type: While executing ParquetBlockInputFormat
```

**Cause:** Parquet file contains NULL values, but table columns are not Nullable.

**Solution:**
```sql
-- Option 1: Make columns Nullable
ALTER TABLE your_table MODIFY COLUMN name Nullable(String);

-- Option 2: Use settings to convert NULLs to defaults
SET input_format_null_as_default = 1;
INSERT INTO your_table SELECT * FROM s3('file.parquet');

-- Option 3: Handle NULLs explicitly
INSERT INTO your_table 
SELECT coalesce(name, '') AS name FROM s3('file.parquet');
```

**Scenario 2: Materialized view with NULL results**

```
Cannot convert NULL value to non-Nullable type: while pushing to view mv
```

**Cause:** Materialized view SELECT returns NULL values, but target table doesn't accept them. Direct INSERT auto-converts NULLs to defaults, but materialized view SELECT does not.

**Solution:**
```sql
-- Use coalesce() to provide defaults
CREATE MATERIALIZED VIEW mv TO target_table AS
SELECT
    coalesce(nullable_col, 0) AS col,
    ifNull(another_col, '') AS another
FROM source_table;
```

**Scenario 3: S3 import with wildcards or functions fails**

```
Cannot convert NULL value to non-Nullable type: while converting source column 
TMSR_FEATURES to destination column features
```

**Cause:** When using wildcards `{}` in file paths or functions in SELECT, ClickHouse doesn't use the target table structure for schema inference and infers Nullable types.

**Solution:**
```sql
-- Option 1: Use setting to inherit structure from target table
SET use_structure_from_insertion_table_in_table_functions = 1;

INSERT INTO target_table
SELECT * FROM s3('https://bucket/{file*.parquet}', 'key', 'secret');

-- Option 2: Explicitly specify schema in s3() function
INSERT INTO target_table
SELECT *
FROM s3(
    'https://bucket/{file*.parquet}',
    'key',
    'secret',
    'Parquet',
    'id UInt64, features Array(Float64), name String'
);

-- Option 3: Disable nullable inference
SET schema_inference_make_columns_nullable = 0;
```

**Scenario 4: Tuple fields with NULL values**

```
Cannot convert NULL value to non-Nullable type: while converting source column 
price to destination column price: while executing FUNCTION _CAST
```

**Cause:** Tuple contains nullable fields but target expects non-nullable.

**Solution:**
```sql
-- Define tuple with proper Nullable structure
CREATE TABLE your_table
(
    price Tuple(
        effective_price Nullable(Decimal(38, 9)),  -- Make nullable if needed
        tier_start_amount Decimal(38, 9),
        unit Nullable(String)
    )
);

-- Or handle NULLs in nested structures
SELECT tuple(
    coalesce(field1, 0),
    coalesce(field2, 0)
) AS price;
```

**Scenario 5: Using bare NULL in materialized views**

```
Data type Nullable(Nothing) cannot be used in tables
```

**Cause:** Using `NULL` without type specification or column alias.

**Solution:**
```sql
-- Instead of this (fails):
CREATE MATERIALIZED VIEW mv AS
SELECT
    customer_id,
    NULL,  -- Wrong!
    maxState(price) AS max_price
FROM source;

-- Use this (works):
CREATE MATERIALIZED VIEW mv AS
SELECT
    customer_id,
    NULL AS pincode,  -- Column name matches target table
    maxState(price) AS max_price
FROM source;

-- Or cast NULL to specific type:
SELECT
    CAST(NULL, 'String') AS column_name
FROM source;
```

## Prevention best practices {#prevention}

1. **Design tables with Nullable columns when appropriate**
    - Use `Nullable(Type)` for columns that may contain NULL values
    - Consider business logic - can this field legitimately be unknown?

2. **For file imports, use explicit schema definitions**
    - Specify column types in s3/file table functions
    - Use `use_structure_from_insertion_table_in_table_functions=1`
    - Control schema inference with `schema_inference_make_columns_nullable=0`

3. **In materialized views, handle NULL explicitly**
    - Always use `coalesce()`, `ifNull()`, or similar functions
    - Don't rely on automatic NULL-to-default conversion in SELECT

4. **Test data imports with sample files first**
    - Check for NULL values: `SELECT * FROM s3(...) WHERE column IS NULL`
    - Use `DESCRIBE s3(...)` to see inferred schema
    - Validate type compatibility before full import

5. **Use appropriate settings for your use case**
   ```sql
   -- Convert NULLs to default values during import
   SET input_format_null_as_default = 1;
   
   -- Keep NULLs as empty strings (for formats like CSV)
   SET input_format_csv_empty_as_default = 1;
   ```

6. **For complex nested types**
    - Define nullability at the correct nesting level
    - `LowCardinality(Nullable(String))` not `Nullable(LowCardinality(String))`
    - Test with small data samples first

## Related settings {#related-settings}

```sql
-- Control NULL handling during import
SET input_format_null_as_default = 1;              -- Convert NULLs to defaults
SET input_format_csv_empty_as_default = 1;         -- Treat empty CSV fields as defaults
SET schema_inference_make_columns_nullable = 0;    -- Don't infer Nullable types
SET use_structure_from_insertion_table_in_table_functions = 1;  -- Use target table schema
```
