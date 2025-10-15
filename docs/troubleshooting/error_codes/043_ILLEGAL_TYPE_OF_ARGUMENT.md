---
slug: /troubleshooting/error-codes/043_ILLEGAL_TYPE_OF_ARGUMENT
sidebar_label: '043 ILLEGAL_TYPE_OF_ARGUMENT'
doc_type: 'reference'
keywords: ['error codes', 'ILLEGAL_TYPE_OF_ARGUMENT', '043']
title: '043 ILLEGAL_TYPE_OF_ARGUMENT'
description: 'ClickHouse error code - 043 ILLEGAL_TYPE_OF_ARGUMENT'
---

# Error 43: ILLEGAL_TYPE_OF_ARGUMENT

:::tip
This error occurs when a function receives an argument with an incompatible or inappropriate data type that cannot be used with that specific function.
It indicates a type mismatch between what a function expects and what was actually provided.
:::

## Most common causes {#most-common-causes}

1. **Type Incompatibility in Arithmetic Operations**
    - Mixing signed and unsigned integers in operations
    - Attempting arithmetic between incompatible numeric types (e.g., `UInt64` with `Nullable(Nothing)`)
    - Using `NULL` or empty values in arithmetic expressions

2. **Incorrect Mutation Queries**
    - `ALTER TABLE` mutations with type mismatches in `UPDATE` or `DELETE` expressions
    - Applying functions to columns with incompatible types during mutations
    - Most common in background mutation tasks that fail repeatedly

3. **Function Type Requirements Not Met**
    - String functions receiving numeric types
    - Date/time functions receiving non-temporal types
    - Aggregation functions with incompatible input types
    - Type conversion functions with unsupported source types

4. **Nullable Type Issues**
    - Operations between `Nullable` and non-`Nullable` types without proper handling
    - Functions that don't support `Nullable` arguments
    - Mixing `Nullable(Nothing)` with concrete types

5. **Union Query Type Mismatches**
    - Different data types in corresponding columns across `UNION` branches
    - Incompatible signed/unsigned integer combinations
    - Mixed nullability across union branches

## Common solutions {#common-solutions}

**1. Check and Cast Types Explicitly**

Use explicit type casting to ensure compatibility:

```sql
-- WRONG: Type mismatch in arithmetic
SELECT column_uint64 - column_nullable

-- CORRECT: Cast to compatible types
SELECT toInt64(column_uint64) - assumeNotNull(column_nullable)
```

**2. Handle Nullable Types Properly**

Ensure nullable types are handled before operations:

```sql
-- Use assumeNotNull() or ifNull()
SELECT ifNull(nullable_column, 0) + other_column

-- Or cast explicitly
SELECT CAST(nullable_column AS UInt64) + other_column
```

**3. Fix Mutations with Type Mismatches**

Check stuck mutations and kill those with type errors:

```sql
-- Check for stuck mutations
SELECT * 
FROM system.mutations 
WHERE NOT is_done AND latest_fail_reason LIKE '%ILLEGAL_TYPE_OF_ARGUMENT%';

-- Kill the problematic mutation
KILL MUTATION WHERE mutation_id = 'problematic_mutation_id';

-- Rewrite the mutation with proper types
ALTER TABLE your_table 
UPDATE column = CAST(expression AS CorrectType)
WHERE condition;
```

**4. Ensure Union Compatibility**

Cast columns to common types in UNION queries:

```sql
-- WRONG: Mixed types in UNION
SELECT uint_col FROM table1
UNION ALL
SELECT int_col FROM table2

-- CORRECT: Cast to common type
SELECT CAST(uint_col AS Int64) AS col FROM table1
UNION ALL  
SELECT int_col AS col FROM table2
```

**5. Use Type-Aware Comparison Functions**

For signed/unsigned comparisons, use appropriate functions:

```sql
-- For mixed signed/unsigned comparisons
SELECT * 
FROM table
WHERE toInt64(unsigned_col) > signed_col
```

**6. Check Function Requirements**

Verify the function accepts your argument types:

```sql
-- Use DESCRIBE to check types
DESCRIBE TABLE your_table;

-- Check function documentation for accepted types
SELECT toTypeName(your_column);
```

## Common scenarios {#common-scenarios}

**Scenario 1: Signed/Unsigned Integer Conflicts**

```
Error: There is no supertype for types Int64, UInt64 because some of them 
are signed integers and some are unsigned integers
```

**Solution:** Cast to a common wider signed type like `Int128` or ensure all are unsigned.

**Scenario 2: Nullable Arithmetic**

```
Error: Arguments of 'minus' have incorrect data types: 
'UInt64' and 'Nullable(Nothing)'
```

**Solution:** Use `assumeNotNull()`, `ifNull()`, or explicit casting.

**Scenario 3: Failed Background Mutations**

```
Latest_fail_reason: ILLEGAL_TYPE_OF_ARGUMENT in mutation
```

**Solution:** Kill the mutation and rewrite with proper type handling.

## Prevention tips {#prevention-tips}

1. **Use Consistent Types**: Design schemas with consistent types across related columns
2. **Explicit Casting**: Always cast types explicitly in complex expressions rather than relying on implicit conversion
3. **Test Mutations**: Test `ALTER TABLE` mutations on a subset of data before applying to production tables
4. **Handle Nullability**: Use `Nullable` types judiciously and handle them explicitly in queries
5. **Check Schema Compatibility**: When using `UNION`, ensure column types match exactly or cast appropriately
6. **Monitor Mutations**: Regularly check `system.mutations` for stuck operations

## Special considerations {#special-considerations}

**Mutations Context:**

This error is frequently seen in background mutations because:
- Mutations continue retrying with the same incorrect query
- The only fix is to kill the mutation (errors persist until manually resolved)
- It's classified as a "client error" since the mutation query itself is incorrect

**When merging/processing data:**

- Type mismatches can occur when old and new data parts have different schemas
- Consider using `ALTER TABLE MODIFY COLUMN` to standardize types before complex operations

If you're experiencing this error:
1. Identify the exact column and operation causing the issue from the error message
2. Check data types with `DESCRIBE TABLE` or `system.columns`
3. For mutations: Check `system.mutations` and kill if necessary
4. Add explicit type casts or use type-conversion functions
5. Test the corrected query on sample data before full execution
