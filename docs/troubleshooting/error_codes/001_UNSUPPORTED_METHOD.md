---
slug: /troubleshooting/error-codes/001_UNSUPPORTED_METHOD
sidebar_label: '001 UNSUPPORTED_METHOD'
doc_type: 'reference'
keywords: ['error codes', 'UNSUPPORTED_METHOD', '001', 'not supported', 'method']
title: '001 UNSUPPORTED_METHOD'
description: 'ClickHouse error code - 001 UNSUPPORTED_METHOD'
---

# Error 1: UNSUPPORTED_METHOD

:::tip
This error occurs when you attempt to use a method, operation, or feature that is not supported by the specific storage engine, data type, or context you're working with.
:::

## Most common causes {#most-common-causes}

1. **Storage engine limitations**
   - Attempting write operations on read-only storage (e.g., View, Dictionary)
   - Using unsupported operations with specific table engines
   - Trying to modify materialized views directly
   - Operations not supported by remote/distributed storage

2. **Data type method limitations**
   - Methods not implemented for specific column types (JSON, Object, Dynamic)
   - Operations not supported for complex types (Nullable, Array, Tuple)
   - Serialization/deserialization methods unavailable for certain types
   - Hash functions not supporting specific data types

3. **Query analyzer limitations**
   - Correlated subqueries without proper settings
   - WITH RECURSIVE without new analyzer
   - Advanced SQL features requiring specific settings
   - Subquery correlation issues

4. **Feature not available in current version**
   - Using experimental features without enabling them
   - Features that exist in newer versions but not in your current version
   - MySQL dialect compatibility issues
   - Missing table function support

5. **Integration/connector limitations**
   - dbt-clickhouse connector limitations with certain operations
   - External system integration constraints
   - Protocol-specific limitations (MySQL wire protocol vs native)
   - Third-party tool incompatibilities

## What to do when you encounter this error {#what-to-do}

**1. Read the error message carefully**

The error message usually tells you exactly what method or operation is not supported:

```text
Method write is not supported by storage View
Method serializeValueIntoMemory is not supported for Object
WITH RECURSIVE is not supported with the old analyzer
```

**2. Check which storage engine or data type you're using**

```sql
-- Check table engine
SELECT engine
FROM system.tables
WHERE database = 'your_database'
  AND name = 'your_table';

-- Check column types
SELECT
    name,
    type
FROM system.columns
WHERE table = 'your_table'
  AND database = 'your_database';
```

**3. Review your ClickHouse version**

```sql
SELECT version();
```

**4. Check if experimental features need to be enabled**

```sql
-- Enable analyzer for advanced features
SET allow_experimental_analyzer = 1;

-- Enable correlated subqueries
SET allow_experimental_correlated_subqueries = 1;

-- Check current settings
SELECT name, value
FROM system.settings
WHERE name LIKE '%experimental%';
```

## Quick fixes {#quick-fixes}

**1. For write operations on views**

```sql
-- Instead of writing to a view (fails):
INSERT INTO my_view VALUES (...);

-- Write to the underlying table:
INSERT INTO underlying_table VALUES (...);

-- Or drop and recreate as a materialized view with proper target table
CREATE MATERIALIZED VIEW my_view TO target_table AS
SELECT * FROM source_table;
```

**2. For JSON/Object type operations**

```sql
-- Instead of using unsupported operations on JSON (fails):
SELECT my_json_column FROM table GROUP BY my_json_column;

-- Cast to String or extract specific fields:
SELECT toString(my_json_column) FROM table GROUP BY 1;

-- Or extract and group by specific paths:
SELECT my_json_column.field1 FROM table GROUP BY 1;
```

**3. For `WITH RECURSIVE` queries**

```sql
-- Enable the new analyzer
SET allow_experimental_analyzer = 1;

-- Then run your recursive query
WITH RECURSIVE cte AS (
    SELECT ...
    UNION ALL
    SELECT ...
)
SELECT * FROM cte;
```

**4. For correlated subqueries**

```sql
-- Enable correlated subqueries
SET allow_experimental_correlated_subqueries = 1;

-- Or rewrite as JOIN
-- Instead of this (may fail):
SELECT
    name,
    (SELECT value FROM other_table WHERE id = main.id) AS value
FROM main_table AS main;

-- Use this:
SELECT
    m.name,
    o.value
FROM main_table AS m
LEFT JOIN other_table AS o ON m.id = o.id;
```

**5. For data type compatibility**

```sql
-- Check if your data type supports the operation
-- Replace with compatible type if needed:

-- Instead of Nullable(JSON) in GROUP BY:
SELECT CAST(json_col AS String) AS json_str
FROM table
GROUP BY json_str;

-- Or use non-nullable version:
ALTER TABLE your_table
    MODIFY COLUMN json_col JSON;  -- Remove Nullable wrapper
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: Method write is not supported by storage View**

```text
Code: 1. DB::Exception: Method write is not supported by storage View
```

**Cause:** Attempting to insert data directly into a View. Views are read-only representations of data.

**Solution:**

```sql
-- If you need a writable view, use a materialized view with a target table
CREATE MATERIALIZED VIEW mv_name TO target_table AS
SELECT * FROM source_table;

-- Then inserts to source_table will populate target_table via the MV

-- Or if you accidentally created a regular view instead of table
DROP VIEW my_view;
CREATE TABLE my_table (
    id UInt64,
    name String
) ENGINE = MergeTree ORDER BY id;
```

**Scenario 2: Method serializeValueIntoMemory not supported for Object/JSON**

```text
Method serializeValueIntoMemory is not supported for Object(max_dynamic_paths=1024, max_dynamic_types=32)
```

**Cause:** Trying to use GROUP BY or aggregate functions with Nullable(JSON) type.

**Solution:**
```sql
-- Instead of this (fails):
SELECT json_col
FROM table
GROUP BY json_col;

-- Use non-nullable JSON:
SELECT CAST(json_col AS JSON) AS col
FROM table
GROUP BY col;

-- Or convert to String first:
SELECT toString(json_col) AS str_col
FROM table
GROUP BY str_col;
```

**Scenario 3: WITH RECURSIVE not supported with old analyzer**

```text
WITH RECURSIVE is not supported with the old analyzer. Please use `enable_analyzer=1`
```

**Cause:** Attempting to use recursive CTEs without the new analyzer.

**Solution:**

```sql
-- Enable the new analyzer
SET allow_experimental_analyzer = 1;

-- Then your recursive query will work
WITH RECURSIVE hierarchy AS (
    SELECT id, parent_id, name, 1 AS level
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    SELECT c.id, c.parent_id, c.name, h.level + 1
    FROM categories c
    INNER JOIN hierarchy h ON c.parent_id = h.id
)
SELECT * FROM hierarchy;
```

**Scenario 4: Correlated subqueries not supported**

```text
Resolved identifier in parent scope with correlated columns (Enable 'allow_experimental_correlated_subqueries' setting)
```

**Cause:** Using correlated subqueries without enabling experimental feature.

**Solution:**
```sql
-- Option 1: Enable the setting
SET allow_experimental_correlated_subqueries = 1;
SET allow_experimental_analyzer = 1;

-- Option 2: Rewrite as JOIN (recommended)
-- Instead of:
SELECT
    p.name,
    (SELECT l.name FROM platform_lists l WHERE l.id = p.list_id LIMIT 1) AS list_name
FROM platform_datas_view p;

-- Use:
SELECT
    p.name,
    l.name AS list_name
FROM platform_datas_view p
LEFT JOIN platform_lists l ON l.id = p.list_id;
```

**Scenario 5: Hash functions not supported for JSON type**

```text
Method getDataAt is not supported for Object
```

**Cause:** Trying to use hash functions (cityHash64, etc.) on JSON type.

**Solution:**

```sql
-- Instead of this (fails):
SELECT cityHash64(json_column) FROM table;

-- Convert to String first:
SELECT cityHash64(toString(json_column)) FROM table;

-- Or serialize properly:
SELECT cityHash64(JSONExtractRaw(json_column)) FROM table;
```

## Prevention best practices {#prevention}

1. **Understand storage engine capabilities**
   - Views are read-only - use materialized views for writable scenarios
   - Check engine documentation before using specific operations
   - Different engines support different operations

2. **Enable experimental features when needed**

   ```sql
   -- Add to your configuration or session:
   SET allow_experimental_analyzer = 1;
   SET allow_experimental_correlated_subqueries = 1;
   ```

3. **Use compatible data types**
   - Avoid Nullable wrappers on complex types when possible
   - Check if types support required operations (GROUP BY, hash, serialization)
   - Convert to compatible types when necessary

4. **Prefer standard SQL patterns**
   - Use JOINs instead of correlated subqueries when possible
   - Avoid deeply nested or complex subqueries
   - Test compatibility with simpler queries first

5. **Keep ClickHouse updated**
   - Newer versions support more operations
   - Check release notes for new features
   - Many "unsupported" operations become supported in later versions

6. **Review integration tool compatibility**
   - dbt-clickhouse, MySQL protocol, etc. have specific limitations
   - Check tool documentation for supported operations
   - Report issues to tool maintainers

## Related settings {#related-settings}

```sql
-- Enable new query analyzer (supports more features)
SET allow_experimental_analyzer = 1;

-- Enable correlated subqueries
SET allow_experimental_correlated_subqueries = 1;

-- Enable recursive CTEs
-- (Requires allow_experimental_analyzer = 1)

-- Check all experimental settings
SELECT name, value, description
FROM system.settings
WHERE name LIKE '%experimental%'
  AND name NOT LIKE '%internal%';
```