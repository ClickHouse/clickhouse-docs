---
slug: /troubleshooting/error-codes/125_INCORRECT_RESULT_OF_SCALAR_SUBQUERY
sidebar_label: '125 INCORRECT_RESULT_OF_SCALAR_SUBQUERY'
doc_type: 'reference'
keywords: ['error codes', 'INCORRECT_RESULT_OF_SCALAR_SUBQUERY', '125', 'scalar', 'subquery', 'CTE', 'WITH']
title: '125 INCORRECT_RESULT_OF_SCALAR_SUBQUERY'
description: 'ClickHouse error code - 125 INCORRECT_RESULT_OF_SCALAR_SUBQUERY'
---

# Error 125: INCORRECT_RESULT_OF_SCALAR_SUBQUERY

:::tip
This error occurs when a scalar subquery returns more than one row.
A scalar subquery is expected to return exactly zero or one row with a single value.
This can also indicate misuse of WITH clauses or CTE syntax, particularly when using `WITH (SELECT ...) AS alias` syntax incorrectly.
:::

## Most common causes {#most-common-causes}

1. **Subquery returns multiple rows**
   - Scalar subquery without proper LIMIT or aggregation
   - Missing `GROUP BY` or `DISTINCT`
   - Distributed table queries executed on multiple shards
   - Correlated subquery returning multiple matches
   - Subquery not properly filtered

2. **Incorrect WITH clause syntax (scalar vs CTE)**
   - Using `WITH (SELECT ...) AS alias` when `WITH alias AS (SELECT ...)` intended
   - ClickHouse has two different WITH syntaxes with different meanings
   - `WITH (subquery) AS alias` creates a scalar value
   - `WITH alias AS (subquery)` creates a CTE (table expression)
   - Confusion between the two syntaxes causes error

3. **Alias conflicts with column names**
   - Scalar subquery alias matches source table column name
   - `prefer_alias_to_column_name` setting causes wrong column resolution
   - ClickHouse uses column from table instead of scalar value
   - Only affects certain positions (typically first matching column)
   - Fixed in new analyzer

4. **Invalid CTE references in outer scope (24.5-24.10 bug)**
   - Referencing CTE table with wildcard (`t.*`) from another CTE
   - Trying to access CTE columns outside their scope
   - `Table expression ... data must be initialized` error (LOGICAL_ERROR code 49)
   - Common with nested CTEs and complex queries
   - Fixed in ClickHouse 25.4 (PR #66143)

5. **Distributed tables with scalar subqueries**
   - Each shard returns rows, combined result has multiple rows
   - `distributed_product_mode = 'local'` can trigger this
   - Subquery executed per shard instead of globally
   - Need GLOBAL or different query structure

## What to do when you encounter this error {#what-to-do}

**1. Check if your subquery actually returns multiple rows**

```sql
-- Test the subquery alone
SELECT * FROM (
    SELECT column FROM table WHERE condition
);

-- Count how many rows it returns
SELECT count(*) FROM (
    SELECT column FROM table WHERE condition
);
```

**2. Determine which WITH syntax you need**

```sql
-- Scalar subquery syntax (single value):
WITH (SELECT max(price) FROM products) AS max_price
SELECT * FROM orders WHERE price > max_price;

-- CTE syntax (table expression):
WITH top_products AS (SELECT * FROM products ORDER BY sales DESC LIMIT 10)
SELECT * FROM top_products;
```

**3. Check your ClickHouse version**

```sql
SELECT version();

-- If on 24.5-24.10 with CTE wildcard issues, upgrade to 25.4+
-- If on pre-24.3 with scalar alias issues, enable new analyzer
```

**4. Review query logs**

```sql
SELECT
    event_time,
    query,
    exception
FROM system.query_log
WHERE exception_code = 125
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC
LIMIT 10;
```

## Quick fixes {#quick-fixes}

**1. Add LIMIT to scalar subquery**

```sql
-- Instead of this (may return multiple rows):
WITH (SELECT user_id FROM users WHERE active = 1) AS uid
SELECT * FROM orders WHERE user_id = uid;

-- Use this (guaranteed single row):
WITH (SELECT user_id FROM users WHERE active = 1 LIMIT 1) AS uid
SELECT * FROM orders WHERE user_id = uid;

-- Or use aggregation:
WITH (SELECT max(user_id) FROM users WHERE active = 1) AS uid
SELECT * FROM orders WHERE user_id = uid;
```

**2. Use correct WITH syntax for your use case**

```sql
-- For scalar value (parentheses around subquery):
WITH (SELECT 1) AS value
SELECT value;

-- For CTE table (no parentheses, use FROM):
WITH cte AS (SELECT 1 AS n)
SELECT * FROM cte;

-- NOT: WITH cte AS (SELECT 1) SELECT cte; -- This fails!
```

**3. Avoid alias conflicts with column names**

```sql
-- Instead of this (alias matches column name):
SELECT
    (SELECT max(i) FROM t1) AS i,  -- Alias 'i' conflicts with table column
    (SELECT max(j) FROM t1) AS j
FROM t1;

-- Use different alias names:
SELECT
    (SELECT max(i) FROM t1) AS max_i,
    (SELECT max(j) FROM t1) AS max_j
FROM t1;

-- Or disable prefer_alias_to_column_name:
SET prefer_alias_to_column_name = 0;
```

**4. Fix CTE wildcard references (24.5-24.10)**

```sql
-- Instead of this (fails in 24.5-24.10):
WITH 
    t1 AS (SELECT * FROM table1),
    t2 AS (SELECT t1.*, other_col FROM table2)  -- t1.* fails
SELECT * FROM t2;

-- Use this (works):
WITH 
    t1 AS (SELECT * FROM table1),
    t2 AS (
        SELECT t1.col1, t1.col2, t1.col3, other_col  -- List columns explicitly
        FROM t1
        CROSS JOIN table2
    )
SELECT * FROM t2;

-- Or upgrade to ClickHouse 25.4+
```

**5. Use GLOBAL for distributed scalar subqueries**

```sql
-- Instead of this (may fail on distributed tables):
WITH (SELECT x FROM distributed_table) AS filter_user
SELECT * FROM another_table WHERE id IN filter_user
SETTINGS distributed_product_mode = 'local';

-- Use proper CTE syntax:
WITH filter_user AS (SELECT x FROM distributed_table)
SELECT * FROM another_table 
WHERE id IN (SELECT x FROM filter_user);

-- Or use IN subquery directly:
SELECT * FROM another_table
WHERE id IN (SELECT x FROM distributed_table);
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: Distributed table returning multiple rows**

```
Scalar subquery returned more than one row: While processing (SELECT t3.x FROM ap_dist.tab3 AS t3) AS filter
```

**Cause:** Using `WITH (subquery) AS alias` syntax (scalar) instead of `WITH alias AS (subquery)` syntax (CTE). On distributed tables, scalar subquery executes on each shard and combines results.

**Solution:**

```sql
-- Instead of scalar syntax (fails):
WITH (SELECT t3.x FROM ap_dist.tab3 AS t3) AS filter_user
SELECT * FROM ap_dist.tab WHERE x IN filter_user;

-- Use CTE syntax (works):
WITH filter_user AS (SELECT t3.x FROM ap_dist.tab3 AS t3)
SELECT * FROM ap_dist.tab 
WHERE x IN (SELECT x FROM filter_user);
```

**Scenario 2: Scalar subquery alias conflicts with column name (old analyzer)**

```
Returns wrong values when scalar subquery alias matches table column name
```

**Cause:** When scalar subquery has alias that matches a column name in the FROM table, the old analyzer's `prefer_alias_to_column_name` setting causes it to use the table column instead of the scalar value.

**Solution:**
```sql
-- Problem (old analyzer):
SELECT
    (SELECT max(i) FROM t1) AS i,  -- Alias 'i' matches column, returns row values 0,1,2...
    (SELECT max(i) FROM t1) AS j   -- Different alias, works correctly (9)
FROM t1;

-- Solution 1: Use different alias name
SELECT
    (SELECT max(i) FROM t1) AS max_i,  -- No conflict
    (SELECT max(i) FROM t1) AS max_j
FROM t1;

-- Solution 2: Disable setting
SET prefer_alias_to_column_name = 0;

-- Solution 3: Upgrade to 24.3+ (new analyzer default)
SET allow_experimental_analyzer = 1;  -- Or upgrade to 24.3+
```

**Scenario 3: CTE wildcard reference error (24.5-24.10)**

```
Code: 49. DB::Exception: Table expression t1 AS (...) data must be initialized
```

**Cause:** Bug in ClickHouse 24.5-24.10 where referencing a CTE with wildcards (`t1.*`) from another CTE or outer query fails with LOGICAL_ERROR (code 49) instead of properly resolving columns.

**Solution:**
```sql
-- Fails in 24.5-24.10:
WITH 
    t1 AS (SELECT id, name FROM table1),
    t2 AS (SELECT t1.* FROM table2 WHERE table2.id = t1.id)  -- Error!
SELECT * FROM t2;

-- Workaround - list columns explicitly:
WITH 
    t1 AS (SELECT id, name FROM table1),
    t2 AS (SELECT t1.id, t1.name FROM t1 CROSS JOIN table2)
SELECT * FROM t2;

-- Or upgrade to 25.4+ (fixed by PR #66143)
```

**Scenario 4: Correlated subquery not using WHERE**

```
Scalar subquery returned more than one row
```

**Cause:** Using a subquery intended to filter rows, but missing WHERE clause or correlation, so it returns all rows.

**Solution:**
```sql
-- Instead of (returns all rows):
WITH (SELECT customer_id FROM customers) AS cust_id
SELECT * FROM orders WHERE customer_id = cust_id;

-- Option 1: Add proper filtering
WITH (SELECT customer_id FROM customers WHERE premium = 1 LIMIT 1) AS cust_id
SELECT * FROM orders WHERE customer_id = cust_id;

-- Option 2: Use IN instead
SELECT * FROM orders
WHERE customer_id IN (SELECT customer_id FROM customers WHERE premium = 1);

-- Option 3: Use JOIN
SELECT orders.*
FROM orders
INNER JOIN customers ON orders.customer_id = customers.customer_id
WHERE customers.premium = 1;
```

**Scenario 5: Missing aggregation in scalar context**

```
Scalar subquery returned more than one row
```

**Cause:** Expecting single value but query returns multiple rows without aggregation.

**Solution:**
```sql
-- Instead of:
SELECT
    name,
    (SELECT price FROM products WHERE category = items.category) AS price
FROM items;

-- Use aggregation:
SELECT
    name,
    (SELECT max(price) FROM products WHERE category = items.category) AS price
FROM items;

-- Or use ANY:
SELECT
    name,
    (SELECT any(price) FROM products WHERE category = items.category) AS price
FROM items;

-- Or use LIMIT 1:
SELECT
    name,
    (SELECT price FROM products WHERE category = items.category LIMIT 1) AS price
FROM items;
```

## Prevention best practices {#prevention}

1. **Understand WITH clause syntax differences**

   ```sql
   -- Scalar syntax (single value, uses parentheses):
   WITH (SELECT 1) AS value
   SELECT value;
   
   -- CTE syntax (table, no parentheses around subquery):
   WITH cte AS (SELECT 1 AS n)
   SELECT * FROM cte;
   ```

2. **Always use LIMIT 1 or aggregation in scalar subqueries**

   ```sql
   -- Ensure single row result
   WITH (SELECT max(id) FROM table) AS max_id
   SELECT ...;
   
   -- Or explicit LIMIT
   WITH (SELECT id FROM table ORDER BY created_at DESC LIMIT 1) AS latest_id
   SELECT ...;
   ```

3. **Avoid alias conflicts**
   - Don't name scalar subquery aliases same as table columns
   - Use descriptive prefixes: `max_`, `total_`, `latest_`
   - Use different names: `value` instead of column name

4. **Use the new analyzer (24.3+)**

   ```sql
   -- On 24.3+, new analyzer is default (better handling)
   -- On earlier versions, enable it:
   SET allow_experimental_analyzer = 1;
   ```

5. **Prefer IN/EXISTS over scalar subqueries for filtering**

   ```sql
   -- Instead of scalar subquery:
   WHERE id = (SELECT id FROM table2 LIMIT 1)
   
   -- Use IN (handles multiple values):
   WHERE id IN (SELECT id FROM table2)
   
   -- Or EXISTS (more efficient):
   WHERE EXISTS (SELECT 1 FROM table2 WHERE table2.id = table1.id)
   ```

6. **Test subqueries independently**

   ```sql
   -- Always test subquery returns expected rows
   SELECT count(*) FROM (
       SELECT column FROM table WHERE condition
   );
   
   -- Ensure it returns 0 or 1 for scalar context
   ```

## Related error codes {#related-errors}

- **Error 49 `LOGICAL_ERROR`**: "Table expression ... data must be initialized" - related CTE bug in 24.5-24.10
- **Error 47 `UNKNOWN_IDENTIFIER`**: Missing column errors related to CTE resolution
- **Error 184 `SET_SIZE_LIMIT_EXCEEDED`**: When IN subquery returns too many values

## WITH clause syntax reference {#with-syntax}

**Scalar subquery syntax (ClickHouse-specific):**

```sql
-- Creates a scalar value (single constant)
WITH (SELECT 1) AS value
SELECT value;  -- Returns: 1

-- Must return single row, single column
WITH (SELECT max(price) FROM products) AS max_price
SELECT * FROM products WHERE price = max_price;
```

**CTE syntax (SQL standard):**
```sql
-- Creates a table expression
WITH cte AS (SELECT 1 AS n)
SELECT * FROM cte;  -- Must use FROM

-- Can return multiple rows
WITH top_products AS (
    SELECT * FROM products ORDER BY sales DESC LIMIT 10
)
SELECT * FROM top_products;
```

**Key differences:**

| Feature      | Scalar: `WITH (SELECT ...) AS alias`  | CTE: `WITH alias AS (SELECT ...)`  |
|--------------|---------------------------------------|------------------------------------|
| Returns      | Single value                          | Table/result set                   |
| Usage        | `SELECT alias`                        | `SELECT * FROM alias`              |
| Rows allowed | 0 or 1                                | Any number                         |
| Scope        | Can be used as value                  | Must be used as table              |

## Related settings {#related-settings}

```sql
-- Alias resolution behavior
SET prefer_alias_to_column_name = 1;  -- Default, can cause conflicts

-- Enable new analyzer (fixes many subquery issues)
SET allow_experimental_analyzer = 1;  -- Default in 24.3+

-- Correlated subqueries (experimental)
SET allow_experimental_correlated_subqueries = 1;

-- Distributed query behavior
SET distributed_product_mode = 'local';  -- Can affect scalar subqueries
SET distributed_product_mode = 'global';
SET distributed_product_mode = 'allow';
```
