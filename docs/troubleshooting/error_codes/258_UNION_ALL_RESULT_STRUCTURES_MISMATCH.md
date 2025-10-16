---
slug: /troubleshooting/error-codes/258_UNION_ALL_RESULT_STRUCTURES_MISMATCH
sidebar_label: '258 UNION_ALL_RESULT_STRUCTURES_MISMATCH'
doc_type: 'reference'
keywords: ['error codes', 'UNION_ALL_RESULT_STRUCTURES_MISMATCH', '258', 'UNION ALL', 'column mismatch']
title: '258 UNION_ALL_RESULT_STRUCTURES_MISMATCH'
description: 'ClickHouse error code - 258 UNION_ALL_RESULT_STRUCTURES_MISMATCH'
---

# Error 258: UNION_ALL_RESULT_STRUCTURES_MISMATCH

:::tip
This error occurs when the result sets of queries combined with `UNION ALL` have incompatible structures—different number of columns, different column types, or mismatched column names. All SELECT queries in a UNION ALL must return the same number of columns with compatible types.
:::

## Quick reference {#quick-reference}

**What you'll see:**

```
Code: 258. DB::Exception: UNION ALL result structures mismatch. 
(UNION_ALL_RESULT_STRUCTURES_MISMATCH)
```

Or in recent versions, this may manifest as:

```
Code: 352. DB::Exception: Block structure mismatch in (columns with identical name must have identical structure) stream: different types:
NULL Nullable(String) Nullable(size = 0, String(size = 0), UInt8(size = 0))
NULL Nullable(Nothing) Const(size = 0, Nullable(size = 1, Nothing(size = 1), UInt8(size = 1))). 
(AMBIGUOUS_COLUMN_NAME)
```

**Most common causes:**
1. **Different number of columns** in UNION ALL queries
2. **Incompatible column types** (e.g., String vs Int64)
3. **NULL type inference issues** (NULL in one query, typed value in another)
4. **Column order mismatch** between SELECT statements

**Quick diagnostic:**

```sql
-- Test each SELECT separately first
SELECT col1, col2 FROM table1;  -- Check column count and types
SELECT col1, col2 FROM table2;  -- Check column count and types

-- Then combine with UNION ALL
SELECT col1, col2 FROM table1
UNION ALL
SELECT col1, col2 FROM table2;
```

**Quick fixes:**

```sql
-- Error: Different number of columns
SELECT name, age FROM users
UNION ALL
SELECT name FROM customers;

-- Fix: Match column counts
SELECT name, age FROM users
UNION ALL
SELECT name, NULL AS age FROM customers;

-- Error: Different types
SELECT name, age FROM users      -- age is Int64
UNION ALL
SELECT name, signup_date FROM customers;  -- signup_date is DateTime

-- Fix: Cast to compatible types
SELECT name, age FROM users
UNION ALL
SELECT name, toInt64(0) AS age FROM customers;

-- Error: NULL type ambiguity
SELECT NULL, NULL
UNION ALL
SELECT 'xxx', NULL;

-- Fix: Explicitly type NULLs
SELECT NULL::Nullable(String), NULL
UNION ALL
SELECT 'xxx', NULL;
```

## Most common causes {#most-common-causes}

### 1. **Different number of columns**

The most straightforward cause—each SELECT in the UNION ALL must return the same number of columns.

```sql
-- Error
SELECT id, name, email FROM users
UNION ALL
SELECT id, name FROM customers;  -- Missing 'email' column

-- Fix
SELECT id, name, email FROM users
UNION ALL
SELECT id, name, NULL AS email FROM customers;
```

### 2. **Incompatible column types**

Even if column names match, types must be compatible or convertible.

```sql
-- Error: String vs Int64
SELECT 'text' AS col1
UNION ALL
SELECT 123 AS col1;

-- Fix: Cast to common type
SELECT 'text' AS col1
UNION ALL
SELECT toString(123) AS col1;

-- Or
SELECT CAST('text' AS String) AS col1
UNION ALL
SELECT CAST(123 AS String) AS col1;
```

### 3. **NULL type inference issues (version-specific)**

Before version 21.9, NULL handling was more lenient. Starting from 21.9+, ClickHouse is stricter about NULL type inference.

```sql
-- Error in 21.9+ (worked in older versions)
SELECT NULL, NULL
UNION ALL
SELECT 'xxx', NULL;

-- Error message:
-- different types:
-- NULL Nullable(String) ...
-- NULL Nullable(Nothing) ...

-- Fix: Explicitly type the NULL
SELECT NULL::Nullable(String), NULL
UNION ALL
SELECT 'xxx', NULL;

-- Or use CAST
SELECT CAST(NULL AS Nullable(String)), NULL
UNION ALL
SELECT 'xxx', NULL;
```

### 4. **Column order mismatch**

Column positions matter, not names. UNION ALL matches columns by position.

```sql
-- This combines mismatched columns
SELECT name, age FROM users      -- Position 1: name, Position 2: age
UNION ALL
SELECT age, name FROM employees;  -- Position 1: age, Position 2: name

-- Result: age values in name column, name values in age column!

-- Fix: Match column order
SELECT name, age FROM users
UNION ALL
SELECT name, age FROM employees;  -- Correct order
```

### 5. **Projection optimization conflicts (24.10+ version-specific)**

In versions 24.10+, there's a known issue where projection optimization can cause block structure mismatches in UNION operations, particularly with:
- Tables that have PROJECTION defined
- ARRAY JOIN operations
- Complex WHERE clauses with projections

```sql
-- May fail in 24.10-24.12 with projections
SELECT model_name 
FROM frame_events 
ARRAY JOIN detections.model_name AS model_name
WHERE event_time >= '2024-02-01'
  AND model_name != ''
GROUP BY model_name;

-- Workaround: Disable projection optimization
SELECT model_name 
FROM frame_events 
ARRAY JOIN detections.model_name AS model_name
WHERE event_time >= '2024-02-01'
  AND model_name != ''
GROUP BY model_name
SETTINGS optimize_use_projections = 0;
```

## Common solutions {#common-solutions}

### **1. Match column counts**

```sql
-- Ensure all queries return same number of columns
SELECT col1, col2, col3 FROM table1
UNION ALL
SELECT col1, col2, NULL AS col3 FROM table2;  -- Add NULL for missing columns
```

### **2. Cast to compatible types**

```sql
-- Different numeric types
SELECT id::UInt64, value::Float64 FROM table1
UNION ALL
SELECT id::UInt64, value::Float64 FROM table2;

-- String and numeric
SELECT name FROM users
UNION ALL
SELECT toString(user_id) FROM logs;

-- DateTime and Date
SELECT created_at::DateTime FROM orders
UNION ALL
SELECT toDateTime(order_date) FROM archived_orders;
```

### **3. Fix NULL type ambiguity**

```sql
-- Method 1: Explicit type casting
SELECT 
    NULL::Nullable(String) AS name,
    NULL::Nullable(Int64) AS age
UNION ALL
SELECT 'John', 30;

-- Method 2: Use actual values in first query
SELECT 'placeholder', 0 AS age WHERE 1=0  -- Returns no rows but establishes types
UNION ALL
SELECT name, age FROM users;

-- Method 3: Reorder queries (put typed query first)
SELECT name, age FROM users
UNION ALL
SELECT NULL::Nullable(String), NULL::Nullable(Int64);
```

### **4. Use UNION DISTINCT mode for automatic type coercion**

```sql
-- UNION (without ALL) applies type coercion more aggressively
SELECT 'text' AS col
UNION
SELECT 123;

-- But note: UNION removes duplicates (slower)
-- For performance, prefer UNION ALL with explicit casts
```

### **5. Verify column order**

```sql
-- Wrong: column positions don't match
SELECT first_name, last_name, age FROM users
UNION ALL
SELECT age, first_name, last_name FROM archived_users;

-- Correct: match positions
SELECT first_name, last_name, age FROM users
UNION ALL
SELECT first_name, last_name, age FROM archived_users;

-- Or explicitly reorder
SELECT first_name, last_name, age FROM users
UNION ALL
SELECT 
    first_name, 
    last_name, 
    age 
FROM archived_users;
```

### **6. Disable projection optimization (24.10+ workaround)**

If you're encountering "Block structure mismatch in UnionStep stream" errors related to projections:

```sql
-- Disable projection optimization for the query
SELECT * FROM table_with_projection
WHERE condition
SETTINGS optimize_use_projections = 0;

-- Or disable globally (not recommended)
SET optimize_use_projections = 0;

-- Check if table has projections
SELECT 
    database,
    table,
    name AS projection_name,
    type,
    sorting_key
FROM system.projections
WHERE table = 'your_table';
```

### **7. Debug with DESCRIBE**

```sql
-- Check structure of each query
DESCRIBE (SELECT col1, col2 FROM table1);
DESCRIBE (SELECT col1, col2 FROM table2);

-- Compare outputs to find mismatches
```

## Prevention tips {#prevention-tips}

1. **Always match column counts**: Every SELECT in UNION ALL must return the same number of columns.

2. **Be explicit with types**: Use explicit casts rather than relying on implicit type conversion, especially with NULL values.

3. **Use consistent column order**: Column positions matter more than names in UNION ALL.

4. **Test each query separately**: Before combining with UNION ALL, verify each SELECT works independently and returns expected types.

5. **Avoid NULL-only queries**: Don't use `SELECT NULL, NULL` without explicit type casting.

6. **Document your schema**: When combining data from multiple tables, document expected column types in comments.

7. **Use table aliases for clarity**:
   ```sql
   SELECT u.name, u.age FROM users u
   UNION ALL
   SELECT c.name, c.age FROM customers c;
   ```

8. **Consider using UNION instead of UNION ALL** if you need automatic type coercion (but be aware of performance implications).

## Related error codes {#related-error-codes}

- [Error 49: `LOGICAL_ERROR`](/docs/troubleshooting/error-codes/49_LOGICAL_ERROR) - Related to internal block structure mismatches
- [Error 352: `AMBIGUOUS_COLUMN_NAME`](/docs/troubleshooting/error-codes/352_AMBIGUOUS_COLUMN_NAME) - Can occur with UNION and column name conflicts
- [Error 386: `NO_COMMON_TYPE`](/docs/troubleshooting/error-codes/386_NO_COMMON_TYPE) - When types cannot be unified
