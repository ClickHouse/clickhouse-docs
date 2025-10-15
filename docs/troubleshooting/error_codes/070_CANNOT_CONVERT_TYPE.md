---
slug: /troubleshooting/error-codes/070_CANNOT_CONVERT_TYPE
sidebar_label: '070 CANNOT_CONVERT_TYPE'
doc_type: 'reference'
keywords: ['error codes', 'CANNOT_CONVERT_TYPE', '070']
title: '070 CANNOT_CONVERT_TYPE'
description: 'ClickHouse error code - 070 CANNOT_CONVERT_TYPE'
---

# Error 70: CANNOT_CONVERT_TYPE

:::tip
This error occurs when ClickHouse cannot convert data from one type to another due to incompatibility or invalid values.
It indicates that a type conversion operation failed because the source data cannot be safely or logically converted to the target type.
:::

## Most common causes {#most-common-causes}

1. **Enum value mismatches during schema evolution**
   - Enum values changed between table schema and stored data
   - Enum element has different numeric value in current schema vs. data parts
   - Adding or removing enum values without proper migration
   - Reordering enum values causing value conflicts

2. **Invalid string to numeric conversions**
   - Trying to parse empty strings as numbers
   - String contains non-numeric characters
   - String value out of range for target numeric type

3. **Field value out of range**
   - Numeric value exceeds the maximum/minimum for target type
   - Large integers don't fit into smaller integer types
   - Settings values outside valid range

4. **Type incompatibility in comparisons or casts**
   - Comparing incompatible types without explicit conversion
   - Implicit type conversions that ClickHouse doesn't support
   - Wrong data type in partition column operations

5. **Data corruption or schema conflicts**
   - Stored data doesn't match current table schema
   - Metadata inconsistency between data parts
   - Broken data parts after incomplete schema changes

## What to do when you encounter this error {#what-to-do}

**1. Check the error message for specific details**

The error message usually includes:
- What value failed to convert
- Source and target types
- The context (column name, operation)

```sql
-- Query logs for recent conversion errors
SELECT 
    event_time,
    query,
    exception
FROM system.query_log
WHERE exception_code = 70
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC
LIMIT 10;
```

**2. For Enum conversion errors - check schema history**

```sql
-- Check table structure
SHOW CREATE TABLE your_table;

-- Compare enum definitions between current schema and data
-- Look for changed enum values or reordered items
```

**3. For string to number conversions - validate your data**

```sql
-- Find problematic values
SELECT column_name
FROM your_table
WHERE NOT match(column_name, '^-?[0-9]+$')  -- For integers
LIMIT 100;

-- Use safe conversion functions
SELECT toInt32OrZero(column_name)  -- Returns 0 for invalid values
FROM your_table;
```

**4. Check for data type mismatches**

```sql
-- Verify column types
SELECT 
    name,
    type
FROM system.columns
WHERE table = 'your_table'
  AND database = 'your_database';
```

## Quick fixes {#quick-fixes}

**1. For Enum schema changes - use safe conversion**

```sql
-- Option 1: Add new enum values at the end (safe)
ALTER TABLE your_table
    MODIFY COLUMN status Enum8('old1' = 1, 'old2' = 2, 'new3' = 3);

-- Option 2: Recreate table with new enum (for major changes)
CREATE TABLE your_table_new AS your_table
ENGINE = MergeTree()
ORDER BY ...;

INSERT INTO your_table_new SELECT * FROM your_table;

RENAME TABLE your_table TO your_table_old, your_table_new TO your_table;
```

**2. For string to numeric conversions - use safe functions**

```sql
-- Use OrZero variants that return 0 for invalid values
SELECT toInt32OrZero(string_column) FROM table;

-- Use OrNull variants that return NULL for invalid values
SELECT toInt32OrNull(string_column) FROM table;

-- Use tryParse functions
SELECT parseDateTimeBestEffortOrNull(date_string) FROM table;
```

**3. For range issues - use appropriate types**

```sql
-- Use larger types when needed
ALTER TABLE your_table 
    MODIFY COLUMN big_number Int64;  -- Instead of Int32

-- Or use Decimal for large numbers
ALTER TABLE your_table
    MODIFY COLUMN amount Decimal(18, 2);
```

**4. For corrupted data parts - rebuild affected parts**

```sql
-- Optimize specific partition
OPTIMIZE TABLE your_table PARTITION 'partition_id' FINAL;

-- If parts are broken, detach and reattach
ALTER TABLE your_table DETACH PARTITION 'partition_id';
ALTER TABLE your_table ATTACH PARTITION 'partition_id';
```

**5. Handle type conversions explicitly in queries**

```sql
-- Explicit CAST instead of implicit conversion
SELECT CAST(column AS Int32) FROM table;

-- Use appropriate comparison operators
SELECT * FROM table WHERE toString(id) = 'value';  -- Instead of id = 'value'
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: Enum conversion during merge**

```
Enum conversion changes value for element 'SystemLibrary' from 18 to 17
```

**Cause:** Data was written with one enum definition, but the schema changed and now the same element has a different numeric value.

**Solution:**
- Never reorder or change numeric values of existing enum elements
- Always add new enum values at the end
- If you must change enum values, recreate the table with data migration

**Scenario 2: Empty string to integer conversion**

```
Attempt to read after eof: while converting '' to UInt8
```

**Cause:** Trying to convert an empty string to a numeric type.

**Solution:**
```sql
-- Use safe conversion
SELECT toUInt8OrZero(column_name) FROM table;

-- Or handle empty strings
SELECT if(column_name = '', 0, toUInt8(column_name)) FROM table;
```

**Scenario 3: Field value out of range**

```
Field value 18446744073709551516 is out of range of long type
```

**Cause:** Setting or value exceeds the maximum value for the target type.

**Solution:**
```sql
-- Use correct value range for the setting
ALTER TABLE your_table 
    MODIFY SETTING zstd_window_log_max = 31;  -- Valid range

-- Or use larger data type
ALTER TABLE your_table 
    MODIFY COLUMN id UInt64;  -- Instead of Int64
```

**Scenario 4: ClickPipe/Replication type mismatch**

```
Cannot convert string to type UInt8
```

**Cause:** Column order mismatch between source and destination, or wrong type mapping.

**Solution:**
- Ensure column mapping uses names, not positions
- Verify data types match between source and target
- Check replication configuration for correct type mapping

## Prevention best practices {#prevention}

1. **Always add enum values at the end** - never reorder or change existing values
2. **Use safe conversion functions** (`toInt32OrNull`, `toInt32OrZero`) when data quality is uncertain
3. **Validate data before insertion** - use input format settings to handle bad data
4. **Choose appropriate data types** - use types large enough for your data range
5. **Test schema changes carefully** - especially with Enum types
6. **Monitor for conversion errors** - set up alerts on error code 70
