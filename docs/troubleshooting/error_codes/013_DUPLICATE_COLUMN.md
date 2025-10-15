---
slug: /troubleshooting/error-codes/013_DUPLICATE_COLUMN
sidebar_label: '013 DUPLICATE_COLUMN'
doc_type: 'reference'
keywords: ['error codes', 'DUPLICATE_COLUMN', '013', '015', 'duplicate', 'column', 'alias']
title: '013 DUPLICATE_COLUMN'
description: 'ClickHouse error code - 013 DUPLICATE_COLUMN'
---

# Error 13: DUPLICATE_COLUMN

:::tip
This error occurs when you attempt to create or add a column with a name that already exists in the table, or when you use duplicate aliases in queries.
ClickHouse column names are case-sensitive, so `name` and `Name` are different columns.
:::

## Most common causes {#most-common-causes}

1. **ALTER TABLE operations on replicated tables**
   - Replicated DDL executed twice due to race condition
   - Distributed DDL task executed on multiple replicas simultaneously
   - ZooKeeper lock timing issues causing duplicate execution
   - Custom ZooKeeper paths with inconsistent shard/replica configuration

2. **Creating tables with duplicate column names**
   - Accidentally specifying the same column name twice in CREATE TABLE
   - Case-sensitive column names (`name` vs `Name`) treated as different by ClickHouse
   - Schema inference creating conflicts with explicit column definitions

3. **Duplicate aliases in queries**
   - Same alias used for multiple expressions in SELECT
   - Column alias conflicts with table alias
   - WITH clause alias conflicts with SELECT alias
   - Materialized column aliases reused in multiple column definitions

4. **INSERT with conflicting column mappings**
   - Same column selected multiple times with different aliases
   - Schema inference from source conflicts with target table
   - [`use_structure_from_insertion_table_in_table_functions`](/operations/settings/settings#use_structure_from_insertion_table_in_table_functions) causes conflicts

5. **Query analyzer issues with aliases**
   - New analyzer stricter about duplicate aliases than old analyzer
   - Column and table sharing same alias name
   - Nested subqueries with conflicting aliases

## What to do when you encounter this error {#what-to-do}

**1. Check the error message for the specific column**

The error message indicates which column name is duplicated:

```
Cannot add column `remark`: column with this name already exists
Cannot add column bid: column with this name already exists
Different expressions with the same alias custom_properties_map
```

**2. Check existing columns in the table**

```sql
-- View all columns and their types
SELECT
    name,
    type,
    position
FROM system.columns
WHERE table = 'your_table'
  AND database = 'your_database'
ORDER BY position;

-- Check for case-sensitive duplicates
SELECT
    name,
    count() AS cnt
FROM system.columns
WHERE table = 'your_table'
  AND database = 'your_database'
GROUP BY name
HAVING cnt > 1;
```

**3. For replicated tables, check if the operation actually succeeded**

```sql
-- Even if error appears, check if column was added
SHOW CREATE TABLE your_table;

-- Check DDL queue status
SELECT *
FROM system.distributed_ddl_queue
WHERE entry LIKE '%ADD COLUMN%'
ORDER BY entry_create_time DESC
LIMIT 10;
```

**4. Review recent DDL operations**

```sql
-- Check for duplicate DDL executions
SELECT
    event_time,
    query,
    exception
FROM system.query_log
WHERE exception_code IN (13, 15)
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC;
```

## Quick fixes {#quick-fixes}

**1. Use `IF NOT EXISTS` for idempotent operations**

```sql
-- Instead of this (may fail if column exists):
ALTER TABLE your_table ADD COLUMN new_col String;

-- Use this (safe to run multiple times):
ALTER TABLE your_table ADD COLUMN IF NOT EXISTS new_col String;

-- Similarly for DROP
ALTER TABLE your_table DROP COLUMN IF EXISTS old_col;
```

**2. Rename duplicate column in `CREATE TABLE`**

```sql
-- Instead of this (fails):
CREATE TABLE users (
    uid Int16,
    name String,
    age Int16,
    Name String  -- Error: different case but ClickHouse allows it
) ENGINE = Memory;

-- Use unique names:
CREATE TABLE users (
    uid Int16,
    name String,
    age Int16,
    full_name String
) ENGINE = Memory;
```

**3. Fix duplicate aliases in queries**

```sql
-- Instead of this (fails):
SELECT
    map('name', errors.name) AS labels,
    value,
    'ch_errors_total' AS name  -- Conflicts with errors.name in map()
FROM system.errors;

-- Use this (works):
SELECT
    map('name', errors.name) AS labels,
    value,
    'ch_errors_total' AS metric_name  -- Different alias
FROM system.errors;
```

**4. Fix duplicate aliases in materialized columns**

```sql
-- Instead of this (fails on restart):
CREATE TABLE events (
    properties String,
    custom_map Map(String, String) MATERIALIZED 
        mapFromArrays(...JSONExtractKeysAndValuesRaw(properties) AS custom_properties_map...),
    custom_map_sorted Map(String, String) MATERIALIZED
        mapSort(...JSONExtractKeysAndValuesRaw(properties) AS custom_properties_map...)
        -- Same alias 'custom_properties_map' used twice!
) ENGINE = MergeTree ORDER BY tuple();

-- Use unique aliases:
CREATE TABLE events (
    properties String,
    custom_map Map(String, String) MATERIALIZED 
        mapFromArrays(...JSONExtractKeysAndValuesRaw(properties) AS custom_properties_map...),
    custom_map_sorted Map(String, String) MATERIALIZED
        mapSort(...JSONExtractKeysAndValuesRaw(properties) AS custom_properties_map_smaller...)
) ENGINE = MergeTree ORDER BY tuple();
```

**5. For `INSERT` with conflicting aliases**

```sql
-- Disable automatic structure inference
SET use_structure_from_insertion_table_in_table_functions = 0;

-- Then run your INSERT
INSERT INTO target_table
SELECT
    datetime,
    base,
    quote,
    bid AS bid_v1,
    bid AS bid_v2,
    bid AS bid_v3
FROM s3('file.csv', 'CSVWithNames');
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: Replicated DDL executed twice (race condition)**

```
Cannot add column `remark`: column with this name already exists. (DUPLICATE_COLUMN)
Task query-0000000004 was not executed by anyone, maximum number of retries exceeded
```

**Cause:** Two replicas both attempted to execute the same DDL task due to ZooKeeper lock timing issues. The column was actually added successfully on the first execution, but the second execution failed with DUPLICATE_COLUMN.

**Solution:**

```sql
-- The operation actually succeeded despite the error
-- Verify the column exists:
SHOW CREATE TABLE your_table;

-- Use idempotent syntax going forward:
ALTER TABLE your_table ADD COLUMN IF NOT EXISTS new_col String;
```

:::note
This was a bug in versions before 22.4, fixed in [PR #31295](https://github.com/ClickHouse/ClickHouse/pull/31295).
:::