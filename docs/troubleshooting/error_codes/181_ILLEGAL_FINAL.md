---
slug: /troubleshooting/error-codes/181_ILLEGAL_FINAL
sidebar_label: '181 ILLEGAL_FINAL'
doc_type: 'reference'
keywords: ['error codes', 'ILLEGAL_FINAL', '181', 'FINAL', 'subquery', 'modifier']
title: '181 ILLEGAL_FINAL'
description: 'ClickHouse error code - 181 ILLEGAL_FINAL'
---

# Error 181: ILLEGAL_FINAL

:::tip
This error occurs when you use the FINAL modifier in contexts where it is not allowed.
FINAL can only be used directly on tables from the MergeTree family that support deduplication (`ReplacingMergeTree`, `CollapsingMergeTree`, etc.), not on subqueries, derived tables, or other table engines.
:::

## Most common causes {#most-common-causes}

1. **Using FINAL on subqueries**
   - `SELECT * FROM (SELECT * FROM table) FINAL` - not allowed
   - FINAL must be applied to the base table, not the subquery result
   - Applies to both inline subqueries and CTEs

2. **Using FINAL on derived tables**
   - Result of JOIN, UNION, or other operations
   - Attempting to deduplicate already processed data
   - FINAL only works on physical table storage

3. **Using FINAL on unsupported table engines**
   - View tables (materialized or regular)
   - Distributed tables in certain contexts
   - Tables without deduplication logic (regular MergeTree)
   - Dictionary tables

4. **FINAL in wrong position in query**
   - Placing FINAL after WHERE or other clauses
   - Must come immediately after table name
   - Incorrect syntax ordering

5. **Using FINAL on JOINed tables indirectly**
   - Attempting to apply FINAL to result of JOIN
   - FINAL must be on individual source tables before JOIN

## What to do when you encounter this error {#what-to-do}

**1. Check where FINAL is placed in your query**

```sql
-- Find the failing query
SELECT query
FROM system.query_log
WHERE exception_code = 181
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC;
```

**2. Verify table engine supports FINAL**

```sql
-- Check if table supports FINAL
SELECT 
    name,
    engine
FROM system.tables
WHERE database = 'your_database' 
  AND name = 'your_table';

-- FINAL works with:
-- - ReplacingMergeTree
-- - CollapsingMergeTree
-- - CoalescingMergeTree
-- - VersionedCollapsingMergeTree
-- - AggregatingMergeTree
```

## Quick fixes {#quick-fixes}

**1. Move FINAL to base table, not subquery**

```sql
-- Instead of this (fails):
SELECT * 
FROM (SELECT * FROM table WHERE condition) FINAL;

-- Use this (works):
SELECT * 
FROM table FINAL
WHERE condition;
```

**2. Apply FINAL before wrapping in subquery**

```sql
-- Instead of this (fails):
SELECT *
FROM (
    SELECT * FROM table1
    UNION ALL
    SELECT * FROM table2
) FINAL;

-- Use this (works):
SELECT * FROM table1 FINAL
UNION ALL
SELECT * FROM table2 FINAL;
```

**3. Use FINAL on each table in JOIN**

```sql
-- Instead of this (fails):
SELECT *
FROM (
    SELECT * FROM table1
    JOIN table2 USING (id)
) FINAL;

-- Use this (works):
SELECT *
FROM table1 FINAL
JOIN table2 FINAL USING (id);
```

**4. Apply FINAL directly after table name**

```sql
-- Correct syntax:
SELECT * FROM table FINAL WHERE condition;
SELECT * FROM table AS t FINAL WHERE t.id = 1;

-- Not:
SELECT * FROM table WHERE condition FINAL;  -- Wrong position
```

**5. Remove FINAL from unsupported engines**

```sql
-- Check table engine
SHOW CREATE TABLE your_table;

-- If engine is MergeTree (not Replacing/Collapsing):
-- FINAL has no effect anyway, remove it:
SELECT * FROM regular_mergetree_table;  -- No FINAL needed
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: FINAL on subquery result**

```
Code: 181. DB::Exception: ILLEGAL_FINAL
```

**Cause:** Attempting to use FINAL on a subquery or derived table.

**Solution:**
```sql
-- Instead of:
SELECT *
FROM (
    SELECT * FROM orders WHERE date > '2024-01-01'
) FINAL;

-- Move FINAL to base table:
SELECT *
FROM orders FINAL
WHERE date > '2024-01-01';
```

**Scenario 2: FINAL in CTE used as derived table**

```
Code: 181. DB::Exception: ILLEGAL_FINAL
```

**Cause:** Using FINAL on CTE reference instead of base table.

**Solution:**
```sql
-- Instead of:
WITH filtered AS (
    SELECT * FROM table WHERE condition
)
SELECT * FROM filtered FINAL;

-- Use FINAL in the CTE:
WITH filtered AS (
    SELECT * FROM table FINAL WHERE condition
)
SELECT * FROM filtered;
```

**Scenario 3: FINAL on Distributed table incorrectly**

```
Code: 181. DB::Exception: ILLEGAL_FINAL
```

**Cause:** Using FINAL on Distributed table in unsupported context.

**Solution:**
```sql
-- FINAL on Distributed tables works in most contexts:
SELECT * FROM distributed_table FINAL;

-- But not in subqueries:
-- SELECT * FROM (SELECT * FROM distributed_table) FINAL;  -- Wrong

-- Move FINAL to table reference:
SELECT * FROM (SELECT * FROM distributed_table FINAL);
```

**Scenario 4: FINAL on UNION result**

```
Code: 181. DB::Exception: ILLEGAL_FINAL
```

**Cause:** Trying to deduplicate UNION result with FINAL.

**Solution:**
```sql
-- Instead of:
SELECT * FROM (
    SELECT * FROM table1
    UNION ALL
    SELECT * FROM table2
) FINAL;

-- Apply FINAL to individual tables:
SELECT * FROM table1 FINAL
UNION ALL
SELECT * FROM table2 FINAL;

-- Or use DISTINCT if deduplication is needed:
SELECT DISTINCT * FROM (
    SELECT * FROM table1 FINAL
    UNION ALL
    SELECT * FROM table2 FINAL
);
```
