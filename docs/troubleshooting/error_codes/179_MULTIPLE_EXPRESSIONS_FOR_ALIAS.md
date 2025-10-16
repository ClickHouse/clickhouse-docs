---
slug: /troubleshooting/error-codes/179_MULTIPLE_EXPRESSIONS_FOR_ALIAS
sidebar_label: '179 MULTIPLE_EXPRESSIONS_FOR_ALIAS'
doc_type: 'reference'
keywords: ['error codes', 'MULTIPLE_EXPRESSIONS_FOR_ALIAS', '179', 'alias', 'duplicate']
title: '179 MULTIPLE_EXPRESSIONS_FOR_ALIAS'
description: 'ClickHouse error code - 179 MULTIPLE_EXPRESSIONS_FOR_ALIAS'
---

# Error 179: MULTIPLE_EXPRESSIONS_FOR_ALIAS

:::tip
This error occurs when you assign the same alias to multiple different expressions in a query.
ClickHouse cannot determine which expression the alias should refer to, causing ambiguity.
This is a semantic error that prevents the query from executing.
:::

## Most common causes {#most-common-causes}

1. **Same alias used for different expressions in SELECT**
   - Multiple columns with identical alias names
   - One expression references the alias of another expression with the same name
   - Nested expressions creating circular alias references
   - Different calculations assigned to same result name

2. **Query optimizer creating duplicate aliases (23.1-23.2 bug)**
   - Optimization of `OR` chains into `IN` expressions
   - Works fine in ClickHouse 22.12 but breaks in 23.1-23.2
   - Particularly affects LowCardinality columns on distributed tables
   - Query rewriting adds aliases during optimization

3. **Alias column conflicts with SELECT alias in distributed queries**
   - Table has ALIAS column with name `X`
   - SELECT expression also uses `AS X`
   - Works fine on local tables
   - Fails with `remote()` or Distributed tables
   - Especially with parallel replicas enabled

4. **WITH clause expression reused with same alias**
   - WITH clause defines an alias
   - SELECT clause redefines the same alias differently
   - Subqueries reference the ambiguous alias
   - Query rewriting expands aliases incorrectly

5. **Self-referential alias definitions**
   - Expression references its own alias name
   - `platform AS platform` where `platform` is both column and alias
   - Recursive alias definitions in complex queries
   - Especially problematic with `if()` or `CASE` expressions

## What to do when you encounter this error {#what-to-do}

**1. Check the error message for conflicting expressions**

```
Different expressions with the same alias alias1:
((position(path, '/a') > 0) AND (NOT (position(path, 'a') > 0))) OR ((path IN ('/b', '/b/')) AS alias1) AS alias1
and
path IN ('/b', '/b/') AS alias1
```

**2. Review your SELECT clause for duplicate aliases**

```sql
-- Check query_log for the failing query
SELECT
    event_time,
    query,
    exception
FROM system.query_log
WHERE exception_code = 179
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC;
```

**3. Check your ClickHouse version**

```sql
SELECT version();

-- Versions 23.1-23.2 had a query optimizer bug
-- Consider upgrading to 23.3+ or downgrading to 22.12
```

## Quick fixes {#quick-fixes}

**1. Use unique alias names**

```sql
-- Instead of this (fails):
SELECT
    number AS num,
    num * 1 AS num  -- Duplicate alias!
FROM numbers(10);

-- Use this (works):
SELECT
    number AS num,
    num * 1 AS num_times_one
FROM numbers(10);
```

**2. Avoid self-referential aliases**

```sql
-- Instead of this (may fail on distributed tables):
SELECT
    if(platform = 'ios', 'apple', platform) AS platform
FROM table;

-- Use different alias:
SELECT
    if(platform = 'ios', 'apple', platform) AS platform_normalized
FROM table;

-- Or don't use alias for column:
SELECT
    if(t.platform = 'ios', 'apple', t.platform) AS platform
FROM table AS t;
```

**3. For optimizer bug (23.1-23.2) - workaround or upgrade**

```sql
-- Workaround 1: Remove LowCardinality from distributed table
ALTER TABLE distributed_table 
    MODIFY COLUMN path String;  -- Instead of LowCardinality(String)

-- Workaround 2: Upgrade to ClickHouse 23.3+
-- Or downgrade to 22.12

-- Workaround 3: Disable the problematic optimization
SET optimize_min_equality_disjunction_chain_length = 0; -- Note: Ignored in 23.1+
```

**4. For distributed/remote table alias conflicts**

```sql
-- Option 1: Use different alias names
SELECT max(x.ta) AS ta_max  -- Not 'ta'
FROM remote('127.0.0.1', default, t) x;

-- Option 2: Disable analyzer (temporary fix)
SELECT max(x.ta) AS ta
FROM remote('127.0.0.1', default, t) x
SETTINGS enable_analyzer = 0;

-- Option 3: Disable alias optimization
SELECT max(x.ta) AS ta
FROM remote('127.0.0.1', default, t) x
SETTINGS optimize_respect_aliases = 0;
```

**5. Rewrite complex expressions**

```sql
-- Instead of nested aliasing:
WITH 
    (path = '/b') OR (path = '/b/') AS alias1
SELECT max(alias1) FROM table;

-- Use explicit expression:
WITH 
    calculated_value AS (SELECT (path = '/b') OR (path = '/b/') FROM table)
SELECT max(calculated_value);
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: Query optimizer bug in 23.1-23.2 with LowCardinality**

```
Code: 179. DB::Exception: Different expressions with the same alias alias1:
((position(path, '/a') > 0) AND (NOT (position(path, 'a') > 0))) OR ((path IN ('/b', '/b/')) AS alias1) AS alias1
and
path IN ('/b', '/b/') AS alias1
```

**Cause:** Bug in ClickHouse 23.1-23.2 where optimizer converted `OR` conditions into `IN` expressions and incorrectly added aliases.
Affects LowCardinality columns on distributed tables.

**Solution:**

```sql
-- Upgrade to 23.3+ where this is fixed

-- Or remove LowCardinality from distributed table:
ALTER TABLE distributed_table 
    MODIFY COLUMN path String;

-- Original failing query:
WITH ((position(path, '/a') > 0) AND (NOT (position(path, 'a') > 0))) 
     OR (path = '/b') OR (path = '/b/') AS alias1
SELECT max(alias1)
FROM distributed_table
WHERE id = 299386662;
```

**Scenario 2: Self-referential alias in SELECT**

```
Code: 179. DB::Exception: Different expressions with the same alias num:
num * 1 AS num
and
number AS num
```

**Cause:** Using the same column name as an alias, then referencing that alias.

**Solution:**

```sql
-- Instead of:
SELECT
    number AS num,
    num * 1 AS num  -- Error!
FROM numbers(10);

-- Use different names:
SELECT
    number AS num,
    num * 1 AS num_times_one
FROM numbers(10);
```

**Scenario 3: ALIAS column conflicts with SELECT alias on distributed tables**

```
Code: 179. DB::Exception: Multiple expressions toStartOfHour(__table1.t) AS ta 
and max(toStartOfHour(__table1.t) AS ta) AS ta for alias ta
```

**Cause:** Table has `ta DateTime ALIAS toStartOfHour(t)`, and SELECT uses `max(x.ta) AS ta`. Works locally but fails with `remote()` or parallel replicas.

**Solution:**

```sql
-- Table definition:
CREATE TABLE t (
    uid Int16,
    t DateTime,
    ta DateTime ALIAS toStartOfHour(t)  -- ALIAS column named 'ta'
) ENGINE = MergeTree ORDER BY uid;

-- Instead of (fails on distributed):
SELECT max(x.ta) AS ta  -- Conflicts with ALIAS column
FROM remote('127.0.0.1', default, t) x;

-- Use different alias:
SELECT max(x.ta) AS ta_max
FROM remote('127.0.0.1', default, t) x;

-- Or disable analyzer:
SELECT max(x.ta) AS ta
FROM remote('127.0.0.1', default, t) x
SETTINGS enable_analyzer = 0;
```

**Scenario 4: Parallel replicas with self-referential alias**

```
Code: 179. DB::Exception: Different expressions with the same alias platform:
if((_CAST(os, 'String') AS platform) = 'ios', 'apple', platform) AS platform
and
_CAST(os, 'String') AS platform
```

**Cause:** Using `if(platform = 'ios', 'apple', platform) AS platform` where `platform` is both the source column and the alias. Works without parallel replicas, fails with them.

**Solution:**

```sql
-- Instead of:
SELECT
    if(platform = 'ios', 'apple', platform) AS platform
FROM app_ids_per_day
GROUP BY platform
SETTINGS allow_experimental_parallel_reading_from_replicas = 2;

-- Use different alias:
SELECT
    if(platform = 'ios', 'apple', platform) AS platform_normalized
FROM app_ids_per_day
GROUP BY platform_normalized
SETTINGS allow_experimental_parallel_reading_from_replicas = 2;
```

## Prevention best practices {#prevention}

1. **Always use unique alias names**

   ```sql
   -- Don't reuse the same alias
   SELECT
       col1 AS result,
       col2 AS result  -- BAD!
   FROM table;
   
   -- Use descriptive unique names
   SELECT
       col1 AS result_col1,
       col2 AS result_col2
   FROM table;
   ```

2. **Avoid self-referential aliases**

   ```sql
   -- Don't use column name as its own alias
   SELECT
       platform AS platform  -- Problematic
   FROM table;
   
   -- Use different alias name or no alias
   SELECT
       platform AS platform_value
   FROM table;
   ```

3. **Be careful with ALIAS columns in distributed queries**

   ```sql
   -- If table has: ta DateTime ALIAS toStartOfHour(t)
   
   -- Don't use 'ta' as SELECT alias on distributed tables
   SELECT max(ta) AS ta_result  -- Not AS ta
   FROM distributed_table;
   ```

4. **Test on distributed tables if using remote()/Distributed**

   ```sql
   -- Test locally first
   SELECT ... FROM local_table;
   
   -- Then test on distributed
   SELECT ... FROM remote('host', db, local_table);
   
   -- Check for alias conflicts
   ```

5. **Keep ClickHouse updated to avoid optimizer bugs**

   ```sql
   -- Check version
   SELECT version();
   
   -- Versions 23.1-23.2 had alias optimization bugs
   -- Use 23.3+ or 22.12
   ```

6. **Use WITH clauses carefully**

   ```sql
   -- Ensure WITH aliases don't conflict with SELECT aliases
   WITH 
       calculated AS (SELECT value FROM table)
   SELECT
       other_value AS result,  -- Not AS calculated
       calculated
   FROM source;
   ```

## Related settings {#related-settings}

```sql
-- Disable analyzer (temporary workaround)
SET enable_analyzer = 0;  -- Old query interpreter

-- Disable alias optimization
SET optimize_respect_aliases = 0;  -- May help with distributed queries

-- Parallel replicas (can trigger the error)
SET allow_experimental_parallel_reading_from_replicas = 0;  -- Disable to test
SET max_parallel_replicas = 1;  -- Or reduce

-- Check current settings
SELECT name, value
FROM system.settings
WHERE name IN ('enable_analyzer', 'optimize_respect_aliases', 
               'allow_experimental_parallel_reading_from_replicas');
```

## Version-specific issues {#version-issues}

| ClickHouse Version         | Issue                                                          | Status                          |
|----------------------------|----------------------------------------------------------------|---------------------------------|
| **23.1 - 23.2**            | Optimizer bug creating duplicate aliases with LowCardinality   | Fixed in 23.3+                  |
| **24.3+**                  | New analyzer gives less clear error message (code 47)          | Known, different error code     |
| **All versions**           | ALIAS column conflicts with SELECT alias on distributed tables | Workaround: use different alias |
| **With parallel replicas** | Self-referential aliases fail                                  | Workaround: unique alias names  |

## Related error codes {#related-errors}

- **Error 47 `UNKNOWN_IDENTIFIER`**: New analyzer may show this instead of 179 for duplicate aliases
- **Error 13/15 `DUPLICATE_COLUMN`**: Similar but for table column definitions, not query aliases
