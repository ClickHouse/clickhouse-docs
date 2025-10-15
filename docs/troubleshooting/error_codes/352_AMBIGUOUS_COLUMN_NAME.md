---
slug: /troubleshooting/error-codes/352_AMBIGUOUS_COLUMN_NAME
sidebar_label: '352 AMBIGUOUS_COLUMN_NAME'
doc_type: 'reference'
keywords: ['error codes', 'AMBIGUOUS_COLUMN_NAME', '352']
title: '352 AMBIGUOUS_COLUMN_NAME'
description: 'ClickHouse error code - 352 AMBIGUOUS_COLUMN_NAME'
---

# Error 352: AMBIGUOUS_COLUMN_NAME

:::tip
This error occurs when a column reference in a query is ambiguous because it could refer to columns from multiple tables.
It indicates that ClickHouse cannot determine which table's column you're referencing, typically in JOIN queries or when using duplicate column names.
:::

## Most common causes {#most-common-causes}

1. **Column exists in multiple joined tables**
    - The same column name appears in two or more tables being joined
    - No table qualifier used to specify which table's column is needed
    - Ambiguous column reference in `SELECT`, `WHERE`, `GROUP BY`, or `ORDER BY` clauses

2. **Self-join without proper aliases**
    - Joining a table to itself
    - Column referenced without table alias qualifier
    - Both instances of the table have the same column

3. **Analyzer behavior with joined tables**
    - New analyzer (enabled with `allow_experimental_analyzer = 1`) enforces stricter rules
    - Old analyzer preferred left table in ambiguous cases (non-standard SQL)
    - Table aliases don't block original table name identifiers

4. **Multiple JOIN operations**
    - Column present in multiple tables across chain of JOINs
    - Missing table qualifiers on shared column names
    - Complex queries with many joined tables

5. **Column name conflicts in subqueries**
    - Subquery aliases creating duplicate column names
    - Derived tables with overlapping column names
    - `UNION` queries with inconsistent column naming

## Common solutions {#common-solutions}

**1. Use explicit table qualifiers**

```sql
-- WRONG: Ambiguous column reference
SELECT id, name
FROM table1
JOIN table2 ON table1.user_id = table2.user_id;

-- CORRECT: Qualify columns with table names
SELECT 
    table1.id,
    table1.name,
    table2.name AS name2
FROM table1
JOIN table2 ON table1.user_id = table2.user_id;
```

**2. Use table aliases for clarity**

```sql
-- WRONG: Ambiguous in self-join
SELECT t4.c0
FROM t4
INNER JOIN t4 AS right_0 ON t4.c0 = right_0.c0;

-- CORRECT: Use aliases consistently
SELECT 
    left_t.c0 AS left_c0,
    right_t.c0 AS right_c0
FROM t4 AS left_t
INNER JOIN t4 AS right_t ON left_t.c0 = right_t.c0;
```

**3. Alias duplicate column names**

```sql
-- WRONG: Both tables have 'name' column
SELECT *
FROM users u
JOIN profiles p ON u.id = p.user_id;

-- CORRECT: Alias one or both
SELECT 
    u.id,
    u.name AS user_name,
    p.name AS profile_name
FROM users u
JOIN profiles p ON u.id = p.user_id;
```

**4. Use `USING` clause for common columns**

```sql
-- Instead of ON clause
SELECT *
FROM table1
JOIN table2 USING (user_id, date);

-- This automatically qualifies columns and avoids ambiguity
```

**5. Enable the new analyzer (if needed)**

```sql
-- New analyzer provides better error messages and handling
SET allow_experimental_analyzer = 1;

-- Query will now give clearer error about ambiguity
SELECT * FROM t1 JOIN t2 ON t1.id = t2.id WHERE name = 'test';
```

**6. Specify columns explicitly instead of `SELECT` \***

```sql
-- WRONG: SELECT * can create ambiguity
SELECT *
FROM orders o
JOIN customers c ON o.customer_id = c.id;

-- CORRECT: List needed columns explicitly
SELECT 
    o.order_id,
    o.order_date,
    c.id AS customer_id,
    c.customer_name
FROM orders o
JOIN customers c ON o.customer_id = c.id;
```

## Common scenarios {#common-scenarios}

**Scenario 1: Simple JOIN with shared column name**

```
Error: JOIN database.t4 ALL INNER JOIN database.t4 AS right_0 ON t4.c0 = right_0.c0 
ambiguous identifier 't4.c0'
```

**Cause:** Column `c0` exists in both sides of self-join.

**Solution:**

```sql
-- Use proper table aliases
SELECT 
    left_t.c0 AS left_value,
    right_t.c0 AS right_value
FROM t4 AS left_t
INNER JOIN t4 AS right_t ON left_t.id = right_t.id;
```

**Scenario 2: Multi-table JOIN ambiguity**

```
Error: Ambiguous column 'id' in SELECT
```

**Cause:** Column `id` appears in multiple joined tables.

**Solution:**

```sql
-- Qualify all columns
SELECT 
    t1.id AS t1_id,
    t2.id AS t2_id,
    t3.id AS t3_id
FROM t1
JOIN t2 ON t1.key = t2.key
JOIN t3 ON t2.key = t3.key;
```

**Scenario 3: WHERE clause ambiguity**

```
Error: Ambiguous column reference in WHERE clause
```

**Cause:** Column used in WHERE exists in multiple tables.

**Solution:**

```sql
-- WRONG
SELECT * FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE status = 'active';

-- CORRECT: Specify which table's status
SELECT * FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'active';
```

**Scenario 4: Analyzer differences**

```
Query works with old analyzer but fails with new analyzer
```

**Cause:** New analyzer enforces SQL standard more strictly.

**Solution:**

```sql
-- Option 1: Fix query to be explicit
SELECT t1.col FROM t1 JOIN t2 ON t1.id = t2.id;

-- Option 2: Temporarily disable new analyzer
SET allow_experimental_analyzer = 0;
```

**Scenario 5: Column name from wrong table in multi-JOIN**

```
Query accidentally uses t1.d but d doesn't exist in t1
(exists in t2 but query succeeds incorrectly)
```

**Cause:** Bug in old query analyzer with multi-table JOINs.

**Solution:**
- Enable new analyzer: `SET allow_experimental_analyzer = 1`
- Or explicitly qualify all column references
- Update to version with new analyzer as default

## Debugging steps {#debugging-steps}

1. **Identify the ambiguous column:**
2. 
   ```
   Error message shows: "ambiguous identifier 't4.c0'"
   ```
   The column name causing ambiguity is listed in the error.

2. **Check which tables have this column:**

   ```sql
   -- Find column across tables
   SELECT 
       database,
       table,
       name AS column_name,
       type
   FROM system.columns
   WHERE name = 'c0'  -- Replace with your column
       AND database = 'your_database';
   ```

3. **Review query structure:**
    - Identify all tables in the query
    - Check which tables have the ambiguous column
    - Note where column is referenced without qualifier

4. **Use `EXPLAIN` to understand the query:**
   ```sql
   EXPLAIN SYNTAX
   SELECT * FROM t1 JOIN t2 ON t1.id = t2.id;
   ```

5. **Test with the new analyzer:**
   ```sql
   -- Enable new analyzer for better error messages
   SET allow_experimental_analyzer = 1;
   SELECT your_query;
   ```

## Special considerations {#special-considerations}

**Old vs. new analyzer behavior:**
- **Old analyzer:** Preferred left table in ambiguous cases (non-SQL standard)
- **New analyzer:** Strictly enforces disambiguation (SQL standard compliant)
- **Migration:** Queries working on old analyzer may need fixes for new analyzer

**Self-joins:**
- Always use aliases for both table references
- Qualify every column reference
- Use descriptive aliases (not just `t1`, `t2`)

**Multiple JOINs:**
- Risk of ambiguity increases with each JOIN
- Some column names may work in 2-table JOIN but fail in 3+ table JOIN
- Old analyzer had bugs allowing incorrect column references from wrong tables

**Table aliases don't block original names:**

```sql
-- Even with alias, original table name still works
SELECT t1.col  -- Works
FROM table1 AS t1;

-- This can cause ambiguity in joins
SELECT table1.col  -- Also works, but can be ambiguous
FROM table1 AS t1
JOIN table2 AS t2 ON...;
```

## Common patterns to avoid {#avoid-patterns}

```sql
-- AVOID: Unqualified columns in JOIN
SELECT id, name, email
FROM users
JOIN profiles ON users.id = profiles.user_id;

-- AVOID: Ambiguous WHERE conditions
SELECT *
FROM orders
JOIN customers ON orders.customer_id = customers.id
WHERE status = 'active';  -- Which table's status?

-- AVOID: GROUP BY without qualifiers
SELECT region, COUNT(*)
FROM sales
JOIN stores ON sales.store_id = stores.id
GROUP BY region;  -- Which table's region?

-- AVOID: Self-join without clear aliases
SELECT * FROM t JOIN t ON t.id = t.parent_id;
```

## Best practices {#best-practices}

```sql
-- GOOD: Fully qualified columns
SELECT 
    o.id AS order_id,
    o.status AS order_status,
    c.id AS customer_id,
    c.status AS customer_status
FROM orders AS o
JOIN customers AS c ON o.customer_id = c.id
WHERE o.status = 'active'
    AND c.status = 'verified'
GROUP BY o.region, c.region
ORDER BY o.created_at DESC;

-- GOOD: Use USING for common columns
SELECT *
FROM orders
JOIN order_items USING (order_id);

-- GOOD: Clear aliases in self-joins
SELECT 
    parent.id AS parent_id,
    child.id AS child_id,
    parent.name AS parent_name,
    child.name AS child_name
FROM categories AS parent
JOIN categories AS child ON child.parent_id = parent.id;
```

## Analyzer-specific information {#analyzer-info}

The new query analyzer (experimental in older versions, default in newer versions) handles ambiguity differently:

```sql
-- Check if analyzer is enabled
SELECT getSetting('allow_experimental_analyzer');

-- Enable for stricter checking
SET allow_experimental_analyzer = 1;

-- Disable to use old behavior (temporary workaround)
SET allow_experimental_analyzer = 0;
```

:::note
The new analyzer will become the default.
It's recommended to fix queries to work with it rather than relying on old behavior.
:::

## Related error codes {#related-errors}

- **`UNKNOWN_IDENTIFIER (47)`:** Column doesn't exist at all
- **`AMBIGUOUS_COLUMN_NAME (352)`:** Column exists in multiple tables
- **`AMBIGUOUS_IDENTIFIER (207)`:** General ambiguous identifier (older error code)
- **`BAD_ARGUMENTS (36)`:** Wrong arguments, sometimes related to column issues

## Migration to new analyzer {#analyzer-migration}

If enabling the new analyzer causes `AMBIGUOUS_COLUMN_NAME` errors in previously working queries:

1. **Add table qualifiers:**

   ```sql
   -- Change unqualified columns
   SELECT id, name  -- May fail with new analyzer
   -- To qualified columns
   SELECT t1.id, t1.name
   ```

2. **Use explicit aliases:**

   ```sql
   -- Add aliases for duplicate names
   SELECT 
       t1.status AS t1_status,
       t2.status AS t2_status
   ```

3. **Test incrementally:**

   ```sql
   -- Test one query at a time with analyzer
   SET allow_experimental_analyzer = 1;
   SELECT your_query;
   ```

If you're experiencing this error:
1. Identify which column name is ambiguous from the error message
2. Determine which tables in the query have this column
3. Add table qualifiers (e.g., `table.column` or `alias.column`) to all references
4. Use table aliases for clarity in complex JOINs
5. Test with new analyzer to catch these issues proactively
6. Consider using `USING` clause for join columns with same name
7. List columns explicitly instead of `SELECT *` to avoid hidden ambiguity

**Related documentation:**
- [JOIN clause](/sql-reference/statements/select/join)
- [Query analyzer](/operations/settings/settings#allow-experimental-analyzer)