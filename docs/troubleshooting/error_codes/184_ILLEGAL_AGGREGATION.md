---
slug: /troubleshooting/error-codes/184_ILLEGAL_AGGREGATION
sidebar_label: '184 ILLEGAL_AGGREGATION'
doc_type: 'reference'
keywords: ['error codes', 'ILLEGAL_AGGREGATION', '184', 'aggregate', 'GROUP BY', 'nested']
title: '184 ILLEGAL_AGGREGATION'
description: 'ClickHouse error code - 184 ILLEGAL_AGGREGATION'
---

# Error 184: ILLEGAL_AGGREGATION

:::tip
This error occurs when aggregate functions are used incorrectly, such as nesting aggregate functions inside other aggregate functions, using aggregates in WHERE clauses, or mixing aggregated and non-aggregated columns without proper GROUP BY.
:::

## Most common causes {#most-common-causes}

1. **Nested aggregate functions**
   - Putting one aggregate function inside another
   - `SELECT sum(count(*))` without subquery
   - `SELECT max(avg(x))` directly in same query level
   - Aggregate functions must be at same nesting level or use subqueries

2. **Using aggregate functions in WHERE clause**
   - WHERE clause is evaluated before aggregation
   - `WHERE count(*) > 10` is invalid
   - Must use HAVING for post-aggregation filtering
   - Or use subquery/CTE structure

3. **Mixing aggregated and non-aggregated columns without GROUP BY**
   - `SELECT name, count(*) FROM table` without GROUP BY name
   - All non-aggregated columns must be in GROUP BY
   - Or all columns must be aggregate functions
   - ClickHouse requires explicit GROUP BY (unlike some databases)

4. **Aggregate functions in invalid contexts**
   - Using aggregates in JOIN ON conditions
   - Aggregates in PREWHERE clause
   - Aggregates in array indices or other expression contexts
   - Some contexts fundamentally don't support aggregation

5. **Complex alias references causing nested aggregation**
   - Query optimizer may expand aliases in ways that nest aggregates
   - Reusing aggregate result aliases in expressions
   - Circular or recursive alias dependencies

## What to do when you encounter this error {#what-to-do}

**1. Check the error message for the specific aggregate function**

```text
Aggregate function count(*) is found inside another aggregate function
Aggregate function sum(value) cannot be used in WHERE clause
```

**2. Review your query structure**

```sql
-- Look for:
-- - Nested aggregate functions
-- - Aggregates in WHERE clause
-- - Missing GROUP BY for non-aggregated columns
```

**3. Review query logs**

```sql
SELECT
    event_time,
    query,
    exception
FROM system.query_log
WHERE exception_code = 184
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC;
```

## Quick fixes {#quick-fixes}

**1. Use subqueries for nested aggregations**

```sql
-- Instead of this (fails):
SELECT sum(count(*)) FROM table;

-- Use subquery:
SELECT sum(cnt) FROM (
    SELECT count(*) AS cnt
    FROM table
    GROUP BY category
);
```

**2. Use HAVING instead of WHERE for aggregate conditions**

```sql
-- Instead of this (fails):
SELECT category, count(*) AS cnt
FROM table
WHERE count(*) > 10  -- Error: aggregation in WHERE
GROUP BY category;

-- Use HAVING:
SELECT category, count(*) AS cnt
FROM table
GROUP BY category
HAVING count(*) > 10;
```

**3. Add GROUP BY for non-aggregated columns**

```sql
-- Instead of this (fails):
SELECT category, count(*) FROM table;

-- Add GROUP BY:
SELECT category, count(*)
FROM table
GROUP BY category;

-- Or aggregate all columns:
SELECT any(category), count(*)
FROM table;
```

**4. Move aggregates to subquery**

```sql
-- Instead of using aggregate in JOIN:
SELECT *
FROM table1
JOIN table2 ON table1.id = count(table2.id);  -- Error

-- Use subquery:
SELECT *
FROM table1
JOIN (
    SELECT category, count(*) AS cnt
    FROM table2
    GROUP BY category
) AS agg ON table1.category = agg.category;
```

**5. Use window functions for running aggregates**

```sql
-- Instead of nested aggregates:
SELECT category, max(count(*)) OVER () FROM table GROUP BY category;

-- Window functions can access aggregate results:
SELECT
    category,
    count(*) AS cnt,
    max(cnt) OVER () AS max_cnt
FROM table
GROUP BY category;
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: Nested aggregate functions**

```text
Code: 184. DB::Exception: Aggregate function count(*) is found inside another aggregate function
```

**Cause:** Attempting to nest aggregate functions without proper query structure.

**Solution:**

```sql
-- Instead of:
SELECT sum(count(*)) FROM table;

-- Use subquery:
SELECT sum(cnt) FROM (
    SELECT count(*) AS cnt
    FROM table
    GROUP BY category
);

-- For finding maximum count per category:
SELECT max(cnt) FROM (
    SELECT category, count(*) AS cnt
    FROM table
    GROUP BY category
);
```

**Scenario 2: Aggregate in WHERE clause**

```text
Code: 184. DB::Exception: Aggregate function in WHERE clause
```

**Cause:** Using aggregate function in WHERE clause, which is evaluated before GROUP BY.

**Solution:**

```sql
-- Instead of:
SELECT category, count(*) AS cnt
FROM table
WHERE count(*) > 10  -- Error
GROUP BY category;

-- Use HAVING:
SELECT category, count(*) AS cnt
FROM table
GROUP BY category
HAVING count(*) > 10;

-- Or use subquery with WHERE:
SELECT * FROM (
    SELECT category, count(*) AS cnt
    FROM table
    GROUP BY category
)
WHERE cnt > 10;
```

**Scenario 3: Missing GROUP BY**

```text
Code: 184. DB::Exception: Column 'name' is not under aggregate function and not in GROUP BY
```

**Cause:** Selecting non-aggregated column without GROUP BY when aggregate functions are present.

**Solution:**

```sql
-- Instead of:
SELECT name, count(*) FROM users;

-- Add GROUP BY:
SELECT name, count(*) FROM users GROUP BY name;

-- Or aggregate all columns:
SELECT any(name), count(*) FROM users;

-- Or use appropriate aggregate:
SELECT uniq(name), count(*) FROM users;
```

**Scenario 4: Aggregate in JOIN condition**

```text
Code: 184. DB::Exception: Aggregate function not allowed in JOIN ON clause
```

**Cause:** Trying to use aggregate function directly in JOIN condition.

**Solution:**

```sql
-- Instead of:
SELECT *
FROM orders o
JOIN products p ON o.product_id = max(p.id);

-- Pre-aggregate in subquery:
SELECT *
FROM orders o
JOIN (
    SELECT category, max(id) AS max_id
    FROM products
    GROUP BY category
) p ON o.product_id = p.max_id;
```

**Scenario 5: Complex calculations with aggregate results**

```text
Code: 184. DB::Exception: Aggregate function found inside another aggregate function
```

**Cause:** Using aggregate result in expressions that get expanded incorrectly.

**Solution:**

```sql
-- Instead of trying to use aggregate results in complex expressions:
SELECT
    argMax(col1, timestamp) AS col1,
    argMax(col2, timestamp) AS col2,
    col1 / col2 AS ratio  -- May cause issues
FROM table
GROUP BY category;

-- Use subquery to separate aggregation from calculation:
SELECT
    col1,
    col2,
    col1 / col2 AS ratio
```