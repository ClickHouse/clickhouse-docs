---
slug: /troubleshooting/error-codes/047_UNKNOWN_IDENTIFIER
sidebar_label: '047 UNKNOWN_IDENTIFIER'
doc_type: 'reference'
keywords: ['error codes', 'UNKNOWN_IDENTIFIER', '047']
title: '047 UNKNOWN_IDENTIFIER'
description: 'ClickHouse error code - 047 UNKNOWN_IDENTIFIER'
---

# Error 47: UNKNOWN_IDENTIFIER

:::tip
This error occurs when a query references a column name, alias, or identifier that does not exist in the specified scope or context.
It typically indicates a column name that doesn't exist in the table, a missing alias, or incorrect identifier resolution in complex queries.
:::

## Most common causes {#most-common-causes}

1. **Column does not exist in table**
    - Referencing a column name that is not present in the table schema
    - Typo in column name
    - Column was dropped or never created

2. **Incorrect identifier scope in joins**
    - Referencing columns without proper table aliases
    - Ambiguous column references in multi-table queries
    - Column from wrong side of join
    - Using columns that exist in one table but not in the joined result

3. **Missing columns in subqueries or CTEs**
    - Column not selected in inner query but referenced in outer query
    - Column not available in the scope where it's being referenced
    - Incorrect nesting of subqueries

4. **Alias issues**
    - Using an alias before it's defined
    - Referencing column by original name after aliasing
    - Alias not properly propagated through query stages

5. **Materialized view or integration issues**
    - Column missing from source table in materialized view
    - Schema mismatch between source and target
    - Replication or CDC tools referencing non-existent columns

6. **Aggregation context problems**
    - Using non-aggregated columns not in `GROUP BY` clause
    - Referencing columns that are only available after aggregation
    - Incorrect use of columns in `HAVING` vs `WHERE` clauses

## Common solutions {#common-solutions}

**1. Verify column exists in table**

```sql
-- Check table structure
DESCRIBE TABLE your_table;

-- Or check system tables
SELECT name, type 
FROM system.columns 
WHERE database = 'your_database' 
AND table = 'your_table';
```

**2. Use proper table aliases in joins**

```sql
-- WRONG: Ambiguous reference
SELECT column1, unique_column
FROM table1
INNER JOIN table2 ON table1.id = table2.id;

-- CORRECT: Explicit table references
SELECT t1.column1, t2.unique_column
FROM table1 AS t1
INNER JOIN table2 AS t2 ON t1.id = t2.id;
```

**3. Check column availability in scope**

```sql
-- WRONG: Column not in subquery SELECT
SELECT outer_column
FROM (
    SELECT inner_column 
    FROM table1
) 
WHERE outer_column > 10;

-- CORRECT: Include needed columns in subquery
SELECT outer_column
FROM (
    SELECT inner_column, outer_column 
    FROM table1
)
WHERE outer_column > 10;
```

**4. Fix aggregation issues**

```sql
-- WRONG: Non-aggregated column not in GROUP BY
SELECT user_id, count(*), email
FROM users
GROUP BY user_id;

-- CORRECT: Include all non-aggregated columns in GROUP BY
SELECT user_id, count(*), email
FROM users
GROUP BY user_id, email;

-- OR: Use any() aggregate function
SELECT user_id, count(*), any(email) AS email
FROM users
GROUP BY user_id;
```

**5. Use `EXPLAIN` to debug**

```sql
EXPLAIN SYNTAX
SELECT column_name FROM your_table;
```

This shows how ClickHouse interprets your query and may reveal the actual column names being used.

**6. Handle case sensitivity**

```sql
-- Column names are case-sensitive in ClickHouse
SELECT UserID FROM users;  -- May fail

-- Use exact case from schema
SELECT userId FROM users;  -- Correct
```

## Common scenarios {#common-scenarios}

**Scenario 1: Missing column in materialized view**

```
Error: Missing columns: 'email_id' while processing query
```

**Solution:** Ensure the column exists in the source table or add it to the materialized view definition.

**Scenario 2: Column ambiguity in joins**

```
Error: Unknown column: customtag1, there are only columns sum(viewercount), sumMap(eventcount_map)
```

**Solution:** The column exists in the joined table but isn't in the aggregation scope. Use proper aliases and ensure the column is accessible in the aggregation context.

**Scenario 3: Alias before definition**

```sql
-- WRONG
SELECT count(*) FROM table WHERE count > 10;

-- CORRECT
SELECT count(*) AS count FROM table HAVING count > 10;
```

## Prevention tips {#prevention-tips}

1. **Use explicit table aliases**: Always use `table.column` or `alias.column` syntax in joins
2. **Verify schema before querying**: Use `DESCRIBE TABLE` to confirm column names and types
3. **Check column case**: Column names are case-sensitive
4. **Review aggregation logic**: Ensure all non-aggregated columns are in `GROUP BY`
5. **Use IDE or query validator**: Many tools can catch column reference errors before execution
6. **Test subqueries independently**: Verify inner queries work before nesting them
7. **Monitor schema changes**: Track `ALTER TABLE` operations that might remove columns

## Debugging steps {#debugging-steps}

If you're experiencing this error:

1. **Check the error message carefully** - it often suggests similar column names with "maybe you meant: ['column_name']"
2. **Verify table schema**:

   ```sql
   DESCRIBE TABLE your_table;
   ```
3. **Check if column is in the right scope** for joins and subqueries
4. **Use `EXPLAIN SYNTAX`** to see how ClickHouse interprets your query
5. **Test with simpler query** - remove joins and subqueries to isolate the issue
6. **Check for typos** in column names (including case sensitivity)
7. **Review recent schema changes** - was the column recently dropped or renamed?
8. **For integrations/materialized views** - verify source and target schemas match

## Special considerations {#special-considerations}

**For CDC and replication tools:**
- This error often occurs when schema changes aren't synchronized
- The source table may have different columns than expected
- Check both source and target schemas

**For complex queries with aggregations:**
- Remember that aggregation changes the available columns
- Use proper aggregate functions or add columns to `GROUP BY`
- `HAVING` clause has different column availability than `WHERE`

**For materialized views:**
- The source table must have all columns referenced in the view query
- Schema changes to source tables can break materialized views
- Consider using `SELECT *` cautiously as it can cause issues with schema evolution