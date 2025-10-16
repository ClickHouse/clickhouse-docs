---
slug: /troubleshooting/error-codes/215_NOT_AN_AGGREGATE
sidebar_label: '215 NOT_AN_AGGREGATE'
doc_type: 'reference'
keywords: ['error codes', 'NOT_AN_AGGREGATE', '215', 'GROUP BY', 'aggregate function']
title: '215 NOT_AN_AGGREGATE'
description: 'ClickHouse error code - 215 NOT_AN_AGGREGATE'
---

# Error 215: NOT_AN_AGGREGATE

:::tip
This error occurs when a column in a SELECT statement with GROUP BY is not wrapped in an aggregate function and is not listed in the GROUP BY clause. Every column in the SELECT list must either be aggregated (e.g., using SUM, COUNT, MAX) or be part of the GROUP BY clause.
:::

## Quick reference {#quick-reference}

**Most common fixes:**

```sql
-- Error: 'name' not in GROUP BY
SELECT user_id, name, COUNT(*) FROM users GROUP BY user_id;

-- Fix 1: Add to GROUP BY
SELECT user_id, name, COUNT(*) FROM users GROUP BY user_id, name;

-- Fix 2: Use aggregate function
SELECT user_id, any(name), COUNT(*) FROM users GROUP BY user_id;
```

**If you're getting errors after upgrading to 22.8+ or 23.5+:**

```sql
-- Fails in 22.8+ due to alias reuse
SELECT max(b) AS b, b AS b1 FROM t GROUP BY a;

-- Quick fix: Use different alias names
SELECT max(b) AS max_b, max_b AS b1 FROM t GROUP BY a;

-- Or use subquery
SELECT *, col1 / col2 AS result 
FROM (SELECT argMax(col1, ts) AS col1, argMax(col2, ts) AS col2 FROM t GROUP BY key);

-- Or enable experimental analyzer (23.x+)
SELECT max(b) AS b, b AS b1 FROM t GROUP BY a SETTINGS allow_experimental_analyzer = 1;
```

**For materialized views in 24.11+:**

```sql
-- Fails in 24.11+
GROUP BY 1, 2, 3  -- Positional arguments

-- Fix: Use explicit column names
GROUP BY driver_id, creation_date_hour, operation_area
```

## Most common causes {#most-common-causes}

1. **Column missing from GROUP BY clause**
   - Selecting columns that are neither aggregated nor in GROUP BY
   - Referencing columns from subqueries that aren't properly grouped
   - Using alias substitution incorrectly with GROUP BY

2. **Alias reuse conflicts (22.8+ regression)**
   - Since ClickHouse 22.3.16 and 22.8+, alias reuse behavior changed
   - When an aggregate result uses the same alias as a source column, referencing it twice causes issues
   - Example: `SELECT max(b) AS b, b AS b1 FROM t GROUP BY a` fails because `b` is replaced with `max(b)`
   - This is a known backward compatibility issue introduced in PR #42827

3. **GROUPING SETS and complex grouping**
   - Using columns in ORDER BY that aren't in all grouping sets
   - GROUPING SETS queries with columns that don't appear in every set
   - Window functions combined with GROUP BY incorrectly

4. **Positional GROUP BY with materialized views (24.11+)**
   - Using positional arguments (`GROUP BY 1, 2, 3`) in materialized views
   - Works with `enable_positional_arguments=1` in regular queries but fails in mat views
   - Affects version 24.11+ specifically

5. **Conditional expressions referencing ungrouped columns**
   - Using CASE/IF expressions that reference columns not in GROUP BY
   - Example: `CASE WHEN rank > 100 THEN column ELSE NULL END` where `rank` isn't grouped
   - Common with window functions in subqueries

6. **Tuple grouping issues**
   - Grouping by tuple `(col1, col2)` instead of individual columns
   - ClickHouse may not properly recognize injective function optimizations
   - Example: `GROUP BY (iteration, centroid)` vs `GROUP BY iteration, centroid`

## Common solutions {#common-solutions}

**1. Add missing columns to GROUP BY**

```sql
-- Error: column 'name' not in GROUP BY
SELECT 
    user_id,
    name,
    COUNT(*) AS total
FROM users
GROUP BY user_id;

-- Fix: add name to GROUP BY
SELECT 
    user_id,
    name,
    COUNT(*) AS total
FROM users
GROUP BY user_id, name;

-- Or use aggregate function if you want one value per user_id
SELECT 
    user_id,
    any(name) AS name,  -- or min(name), max(name), etc.
    COUNT(*) AS total
FROM users
GROUP BY user_id;
```

**2. Handle alias reuse conflicts (22.8+ backward compatibility issue)**

```sql
-- Fails in 22.8+ due to alias substitution
SELECT 
    argMax(col1, timestamp) AS col1,
    argMax(col2, timestamp) AS col2,
    col1 / col2 AS final_col  -- Error: col1 becomes argMax(argMax(...))
FROM table
GROUP BY col3;

-- Solution 1: Use different aliases
SELECT 
    argMax(col1, timestamp) AS max_col1,
    argMax(col2, timestamp) AS max_col2,
    max_col1 / max_col2 AS final_col
FROM table
GROUP BY col3;

-- Solution 2: Use subquery
SELECT 
    *,
    col1 / col2 AS final_col
FROM (
    SELECT 
        argMax(col1, timestamp) AS col1,
        argMax(col2, timestamp) AS col2
    FROM table
    GROUP BY col3
);

-- Solution 3: Use type cast to force different identifier
SELECT 
    max(b) AS b,
    b::Int8 AS b1  -- Cast creates different node
FROM t
GROUP BY a;

-- Solution 4: Enable experimental analyzer (works in 23.x+)
SELECT 
    argMax(col1, timestamp) AS col1,
    argMax(col2, timestamp) AS col2,
    col1 / col2 AS final_col
FROM table
GROUP BY col3
SETTINGS allow_experimental_analyzer = 1;
```

**3. Use prefer_column_name_to_alias setting**

```sql
-- May help with some alias conflicts
SELECT 
    max(b) AS b,
    b AS b1
FROM t
GROUP BY a
SETTINGS prefer_column_name_to_alias = 1;

-- Works for MySQL compatibility issues
SELECT 
    CASE WHEN `$RANK_1` > 2500 THEN 1 ELSE 0 END AS `isotherrow_1`,
    COUNT(*) AS `$otherbucket_group_count`
FROM (
    SELECT 
        COUNT(*) AS `count`,
        DENSE_RANK() OVER (ORDER BY `radio` DESC) AS `$RANK_1`
    FROM `cell_towers`
    GROUP BY `radio`
)
SETTINGS prefer_column_name_to_alias = 1;
```

**4. Fix tuple grouping syntax**

```sql
-- Error: grouping by tuple
SELECT 
    iteration,
    centroid,
    avgForEachState(v) AS vector
FROM temp
GROUP BY (iteration, centroid);  -- Tuple notation

-- Fix: group by individual columns
SELECT 
    iteration,
    centroid,
    avgForEachState(v) AS vector
FROM temp
GROUP BY iteration, centroid;  -- Correct syntax
```

**5. Replace positional GROUP BY in materialized views (24.11+)**

```sql
-- Fails in materialized views on 24.11+
CREATE MATERIALIZED VIEW mv_driver_location
ENGINE = AggregatingMergeTree()
ORDER BY (driver_id, creation_date_hour, operation_area)
AS
SELECT 
    driver_id,
    toStartOfHour(creation_date) AS creation_date_hour,
    operation_area,
    uniqState(toStartOfMinute(creation_date)) AS online_minutes_agg
FROM fct_driver__location
WHERE driver_status = 1
GROUP BY 1, 2, 3;  -- Positional GROUP BY

-- Fix: use explicit column names
CREATE MATERIALIZED VIEW mv_driver_location
ENGINE = AggregatingMergeTree()
ORDER BY (driver_id, creation_date_hour, operation_area)
AS
SELECT 
    driver_id,
    toStartOfHour(creation_date) AS creation_date_hour,
    operation_area,
    uniqState(toStartOfMinute(creation_date)) AS online_minutes_agg
FROM fct_driver__location
WHERE driver_status = 1
GROUP BY driver_id, creation_date_hour, operation_area;
```

**6. Handle window functions in subqueries correctly**

```sql
-- Error: referencing window function result in GROUP BY
SELECT 
    CASE WHEN `$RANK_1` > 2500 THEN 1 ELSE 0 END AS `isotherrow_1`,
    COUNT(*) AS `count`
FROM (
    SELECT 
        COUNT(*) AS `count`,
        DENSE_RANK() OVER (ORDER BY `radio` DESC) AS `$RANK_1`
    FROM `cell_towers`
    GROUP BY `radio`
);  -- Missing GROUP BY

-- Fix: add GROUP BY for the window function result
SELECT 
    CASE WHEN `$RANK_1` > 2500 THEN 1 ELSE 0 END AS `isotherrow_1`,
    COUNT(*) AS `count`
FROM (
    SELECT 
        COUNT(*) AS `count`,
        DENSE_RANK() OVER (ORDER BY `radio` DESC) AS `$RANK_1`
    FROM `cell_towers`
    GROUP BY `radio`
)
GROUP BY CASE WHEN `$RANK_1` > 2500 THEN 1 ELSE 0 END;
```

**7. Handle GROUPING SETS correctly**

```sql
-- Error: referencing columns not in all grouping sets
SELECT 
    CounterID % 2 AS k,
    CounterID % 3 AS d,
    quantileBFloat16(0.5)(ResolutionWidth)
FROM datasets.hits
GROUP BY GROUPING SETS ((k), (d))
ORDER BY count() DESC, CounterID % 3 ASC;  -- CounterID not available

-- Fix: only reference columns that are in GROUP BY or use aggregates
SELECT 
    CounterID % 2 AS k,
    CounterID % 3 AS d,
    quantileBFloat16(0.5)(ResolutionWidth)
FROM datasets.hits
GROUP BY GROUPING SETS ((k), (d))
ORDER BY count() DESC, d ASC;  -- Use alias instead
```

## Prevention tips {#prevention-tips}

1. **Follow SQL GROUP BY rules**: Every non-aggregated column in SELECT must appear in GROUP BY. This is standard SQL behavior, not ClickHouse-specific.

2. **Avoid alias reuse in aggregation queries (22.8+)**: When using aggregate functions, don't reuse the same alias as the source column if you need to reference it multiple times. This prevents alias substitution issues.

3. **Test after version upgrades**: Version 22.3.16, 22.8+, and 24.11+ introduced behavior changes. Test all GROUP BY queries when upgrading, especially:
   - Queries with alias reuse
   - Materialized views with positional GROUP BY
   - Complex subqueries with window functions

4. **Use experimental analyzer for complex queries**: Enable `allow_experimental_analyzer=1` for queries with complex alias usage, nested aggregations, or window functions.

5. **Avoid positional GROUP BY in materialized views**: Always use explicit column names in GROUP BY clauses for materialized views, not positional arguments like `GROUP BY 1, 2, 3`.

6. **Be explicit with GROUPING SETS**: Only reference columns in SELECT/ORDER BY that appear in all grouping sets, or wrap them in aggregate functions.

7. **Document alias patterns**: If you have queries that worked in older versions but fail after upgrade, document them as known issues and prioritize refactoring.

8. **Use query validation in CI/CD**: Add automated tests for GROUP BY queries in your deployment pipeline to catch compatibility issues before production.

## Version-specific notes {#version-specific-notes}

### 22.3.16, 22.8+ - Alias substitution regression

Starting in these versions, PR #42827 changed how aliases are handled in GROUP BY queries. This causes previously working queries to fail:

```sql
-- Worked in 22.3.15, fails in 22.3.16+
SELECT max(b) AS b, b AS b1 FROM t GROUP BY a;
```

**Workaround**: Use subqueries, different aliases, or enable `allow_experimental_analyzer=1`.

### 23.5 - Conditional expression issues

Version 23.5 introduced stricter validation for conditional expressions in GROUP BY:

```sql
-- Works in 23.4, fails in 23.5
SELECT 
    false ? post_nat_source_ipv4 : '' as post_nat_source_ipv4
FROM fullflow
GROUP BY post_nat_source_ipv4;
```

**Workaround**: Ensure all columns referenced in conditional expressions are in GROUP BY, even if the condition is always false.

### 24.11+ - Positional GROUP BY in materialized views

Version 24.11 broke positional GROUP BY syntax in materialized views:

```sql
-- Fails in 24.11+
GROUP BY 1, 2, 3  -- in materialized view definition
```

**Fix**: Use explicit column names in GROUP BY.

## Related error codes {#related-error-codes}

- [Error 184: `ILLEGAL_AGGREGATION`](/docs/troubleshooting/error-codes/184_ILLEGAL_AGGREGATION) - Aggregate function used incorrectly (e.g., nested aggregates)
- [Error 47: `UNKNOWN_IDENTIFIER`](/docs/troubleshooting/error-codes/47_UNKNOWN_IDENTIFIER) - Column not found in the context
