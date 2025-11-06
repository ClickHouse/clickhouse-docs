---
slug: /troubleshooting/error-codes/044_ILLEGAL_COLUMN
sidebar_label: '044 ILLEGAL_COLUMN'
doc_type: 'reference'
keywords: ['error codes', 'ILLEGAL_COLUMN', '044']
title: '044 ILLEGAL_COLUMN'
description: 'ClickHouse error code - 044 ILLEGAL_COLUMN'
---

# Error 44: ILLEGAL_COLUMN

:::tip
This error occurs when you reference a column in an illegal context, such as using non-aggregated columns outside of `GROUP BY` clauses, referencing columns that aren't available in the current query scope, or attempting to use columns in ways that violate ClickHouse's query execution semantics.
:::

## Most common causes {#most-common-causes}

1. **Non-aggregated columns used without `GROUP BY`**
   - Selecting regular columns alongside aggregate functions without including them in GROUP BY
   - Mixing aggregated and non-aggregated columns incorrectly
   - Using columns in `HAVING` clause that aren't in `GROUP BY` or aggregate functions

2. **Column scope issues in subqueries**
   - Referencing outer query columns in correlated subqueries where not allowed
   - Using columns from inner queries in outer query contexts
   - Incorrect column visibility across query nesting levels

3. **Invalid column references in JOINs**
   - Referencing columns from tables not included in the current JOIN scope
   - Using columns before the table is introduced in the FROM/JOIN chain
   - Ambiguous column references when tables have overlapping column names

4. **Array JOIN context violations**
   - Using non-array columns as if they were arrays
   - Referencing array-joined columns outside their valid scope
   - Mixing array-joined and regular columns incorrectly

5. **Window function scope issues**
   - Using window function results in `WHERE` or `HAVING` clauses (not allowed)
   - Referencing window function aliases in contexts where they haven't been evaluated
   - Mixing window functions with aggregates incorrectly

## Common solutions {#common-solutions}

**1. Add missing columns to `GROUP BY` clause**

```sql
SELECT 
    user_id,
    count() as total_events
FROM events
GROUP BY date;

-- Solution: Include user_id in GROUP BY
SELECT 
    user_id,
    count() as total_events
FROM events
GROUP BY date, user_id;
```

**2. Use ANY or arbitrary aggregate functions for non-key columns**

```sql
-- Error: Can't select name without aggregation
SELECT 
    user_id,
    name,
    count() as events
FROM users
GROUP BY user_id;

-- Solution: Use any() or other aggregate function
SELECT 
    user_id,
    any(name) as name,
    count() as events
FROM users
GROUP BY user_id;
```

**3. Fix subquery column references**

```sql
-- Error: column 'user_id' from outer query used incorrectly
SELECT 
    user_id,
    (SELECT max(event_time) FROM events WHERE user_id = users.user_id) as last_event
FROM users;

-- Solution: Use proper correlation
SELECT 
    u.user_id,
    (SELECT max(event_time) FROM events e WHERE e.user_id = u.user_id) as last_event
FROM users u;
```

**4. Qualify column names with table aliases in JOINs**

```sql
-- Error: Ambiguous column reference
SELECT 
    id,
    name
FROM users
JOIN orders USING (id);

-- Solution: Use table aliases or qualify columns
SELECT 
    u.id as user_id,
    u.name,
    o.id as order_id
FROM users u
JOIN orders o ON u.id = o.user_id;
```

**5. Move window function logic to subquery or CTE**

```sql
-- Error: Can't use window function in WHERE
SELECT 
    user_id,
    row_number() OVER (PARTITION BY user_id ORDER BY event_time) as rn
FROM events
WHERE rn = 1;

-- Solution: Use subquery or CTE
WITH ranked AS (
    SELECT 
        user_id,
        event_time,
        row_number() OVER (PARTITION BY user_id ORDER BY event_time) as rn
    FROM events
)
SELECT user_id, event_time
FROM ranked
WHERE rn = 1;
```

**6. Fix ARRAY JOIN scope issues**

```sql
-- Error: Incorrect array column reference
SELECT 
    user_id,
    tag
FROM users
ARRAY JOIN tags as tag
WHERE user_id IN (SELECT user_id FROM users WHERE tag = 'premium');

-- Solution: Restructure to ensure proper scope
WITH tagged_users AS (
    SELECT DISTINCT user_id
    FROM users
    ARRAY JOIN tags as tag
    WHERE tag = 'premium'
)
SELECT 
    u.user_id,
    t.tag
FROM users u
ARRAY JOIN u.tags as t
WHERE u.user_id IN (SELECT user_id FROM tagged_users);
```

**7. Use proper aggregation in `HAVING` clauses**

```sql
-- Error: name not in GROUP BY or aggregate
SELECT 
    category,
    count() as cnt
FROM products
GROUP BY category
HAVING name LIKE '%special%';

-- Solution: Use aggregate function or move to WHERE
SELECT 
    category,
    count() as cnt
FROM products
WHERE name LIKE '%special%'
GROUP BY category;
```

## Prevention tips {#prevention-tips}

1. **Always aggregate non-GROUP BY columns**: When using `GROUP BY`, ensure every column in `SELECT` is either in the `GROUP BY` clause or wrapped in an aggregate function (count, sum, any, etc.)
2. **Use explicit table aliases in JOINs**: Always qualify column names with table aliases when working with multiple tables to avoid ambiguity and improve query clarity
3. **Understand query evaluation order**: Remember that SQL evaluates in order: `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`. Use this to understand where columns are available
4. **Test complex queries incrementally**: Build complex queries step by step, testing each level of nesting or each JOIN separately to identify where column scope issues arise
5. **Use CTEs for complex window functions**: When using window functions, consider using CTEs (WITH clauses) to separate the window function evaluation from filtering operations
6. **Enable strict mode settings**: Use `any_join_distinct_right_table_keys = 1` and other strict settings during development to catch column reference issues early
7. **Validate column existence**: Before running complex queries in production, verify that all referenced columns exist in their respective tables and are accessible in the query context

## Related error codes {#related-error-codes}

- [UNKNOWN_IDENTIFIER (47)](/troubleshooting/error-codes/047_UNKNOWN_IDENTIFIER) - Column or identifier not found
- [NOT_AN_AGGREGATE (215)](/troubleshooting/error-codes/215_NOT_AN_AGGREGATE) - Non-aggregate function used where aggregate expected
- [ILLEGAL_AGGREGATION (184)](/troubleshooting/error-codes/184_ILLEGAL_AGGREGATION) - Invalid aggregation usage
- [AMBIGUOUS_COLUMN_NAME (352)](/troubleshooting/error-codes/352_AMBIGUOUS_COLUMN_NAME) - Column name exists in multiple tables