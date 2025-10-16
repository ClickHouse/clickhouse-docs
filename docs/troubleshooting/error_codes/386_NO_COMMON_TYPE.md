---
slug: /troubleshooting/error-codes/386_NO_COMMON_TYPE
sidebar_label: '386 NO_COMMON_TYPE'
doc_type: 'reference'
keywords: ['error codes', 'NO_COMMON_TYPE', '386', 'type mismatch', 'supertype']
title: '386 NO_COMMON_TYPE'
description: 'ClickHouse error code - 386 NO_COMMON_TYPE'
---

# Error 386: NO_COMMON_TYPE

:::tip
This error occurs when ClickHouse cannot find a common (super) type to unify different data types in operations that require type compatibility—such as UNION, CASE statements, IF expressions, or array operations. This typically happens when trying to combine incompatible types like String and Integer, or signed and unsigned integers of different ranges.
:::

## Quick reference {#quick-reference}

**What you'll see:**

```
Code: 386. DB::Exception: There is no supertype for types String, UInt8 because some of them are String/FixedString/Enum and some of them are not. 
(NO_COMMON_TYPE)
```

Or:

```
Code: 386. DB::Exception: There is no supertype for types Int64, UInt64 because some of them are signed integers and some are unsigned integers, but there is no signed integer type that can exactly represent all required unsigned integer values.
(NO_COMMON_TYPE)
```

**Most common causes:**
1. **UNION ALL with incompatible types** (String and numeric, signed vs unsigned integers)
2. **IF/CASE expressions** with different return types
3. **AggregateFunction mixed with regular types** in CASE statements
4. **Array operations** requiring consistent element types
5. **Dynamic/JSON column** type mismatches (25.x+ versions)

**Quick diagnostic:**

Check the types involved:

```sql
-- Identify column types
SELECT toTypeName(column1), toTypeName(column2) FROM table;

-- Test type compatibility
SELECT toTypeName(if(1, 'text', 123));  -- Will fail
```

**Quick fixes:**

```sql
-- Error: String and Int incompatible
SELECT 1 UNION ALL SELECT 'hello';

-- Fix: Cast to common type
SELECT toString(1) UNION ALL SELECT 'hello';

-- Error: Signed vs Unsigned
SELECT -1::Int64 UNION ALL SELECT 18446744073709551615::UInt64;

-- Fix: Cast to wider signed type
SELECT -1::Int128 UNION ALL SELECT 18446744073709551615::Int128;

-- Error: AggregateFunction in CASE
SELECT CASE WHEN condition THEN total_claims ELSE 0 END
WHERE total_claims is AggregateFunction(uniq, UInt64)

-- Fix: Apply merge function first
SELECT CASE WHEN condition THEN uniqMerge(total_claims) ELSE 0 END
```

## Most common causes {#most-common-causes}

### 1. **UNION with incompatible types**

The most common cause—trying to UNION queries that return fundamentally different types.

```sql
-- String vs Integer
SELECT 1 AS x
UNION ALL
SELECT 'Hello';
-- Error: No supertype for UInt8, String

-- Signed vs Unsigned (range overflow)
SELECT -100::Int64 AS value
UNION ALL
SELECT 18446744073709551615::UInt64;
-- Error: No signed integer type can represent all required unsigned values
```

### 2. **IF/CASE expressions with mixed types**

```sql
-- Returns different types based on condition
SELECT 
    CASE 
        WHEN status = 'active' THEN 1
        ELSE 'inactive'
    END AS result;
-- Error: No supertype for UInt8, String

-- DateTime vs String
SELECT if(date_field >= '2024-01-01', date_field, '1970-01-01');
-- Error: No supertype for DateTime, String
```

### 3. **AggregateFunction mixed with regular types**

This is a subtle error when working with AggregatingMergeTree tables:

```sql
-- Table with AggregateFunction column
CREATE TABLE test_table (
    code String,
    total_claims AggregateFunction(uniq, UInt64),
    roll_up_date Date
) ENGINE = AggregatingMergeTree()
ORDER BY code;

-- Using AggregateFunction directly in CASE
SELECT 
    CASE 
        WHEN roll_up_date BETWEEN '2022-01-01' AND '2022-12-31'
        THEN total_claims  -- AggregateFunction type
        ELSE 0             -- UInt8 type
    END
FROM test_table;
-- Error: No supertype for UInt8, AggregateFunction
```

### 4. **Array operations with mixed types**

```sql
-- Array with mixed element types
SELECT [1, 2, 'three'];
-- Error: No supertype for UInt8, String

-- Array functions expecting consistent types
SELECT arrayConcat([1, 2], ['a', 'b']);
-- Error: No supertype
```

### 5. **Dynamic/JSON column type mismatches (25.x+)**

Starting in ClickHouse 25.x with stable JSON/Dynamic types:

```sql
-- JSON column with mixed types
CREATE TABLE events (
    ts DateTime,
    attributes JSON
) ENGINE = MergeTree()
ORDER BY ts;

INSERT INTO events VALUES ('2025-01-01 12:00:00', '{"label":"5"}');
INSERT INTO events VALUES ('2025-01-02 12:00:00', '{"label":5}');

-- Comparing Dynamic column with literal of different type
SELECT * FROM events WHERE attributes.label = 5;
-- Error: No supertype for String, UInt8
-- (Because one row has String "5", another has Int64 5)
```

### 6. **Signed vs Unsigned integer range issues**

```sql
-- Cannot find common type for these ranges
SELECT 
    CASE 
        WHEN condition THEN -9223372036854775808::Int64  -- Min Int64
        ELSE 18446744073709551615::UInt64                -- Max UInt64
    END;
-- Error: No signed integer type can represent all required unsigned values
```

## Common solutions {#common-solutions}

### **1. Explicit type casting to common type**

```sql
-- Cast everything to String
SELECT toString(1) AS x
UNION ALL
SELECT 'Hello';

-- Cast to wider numeric type
SELECT -100::Int128 AS value
UNION ALL
SELECT 18446744073709551615::Int128;

-- Cast DateTime to String
SELECT 
    if(date_field >= '2024-01-01', 
       toString(date_field), 
       '1970-01-01'
    ) AS result;
```

### **2. Use appropriate merge functions for AggregateFunctions**

```sql
-- Apply uniqMerge first
SELECT 
    CASE 
        WHEN roll_up_date BETWEEN '2022-01-01' AND '2022-12-31'
        THEN uniqMerge(total_claims)
        ELSE 0
    END AS claims_count
FROM test_table;

-- Or restructure the query
SELECT uniqMerge(total_claims) AS claims_count
FROM test_table
WHERE roll_up_date BETWEEN '2022-01-01' AND '2022-12-31';
```

### **3. Handle Dynamic/JSON columns explicitly (25.x+)**

```sql
-- Cast Dynamic column to specific type
SELECT * FROM events 
WHERE attributes.label::String = '5';

-- Or use type-specific subcolumn
SELECT * FROM events 
WHERE attributes.label.:String = '5';

-- Use toString for comparison
SELECT * FROM events 
WHERE toString(attributes.label) = '5';
```

### **4. Restructure CASE/IF to return consistent types**

```sql
-- Original: mixed types
SELECT 
    CASE 
        WHEN status = 'active' THEN 1
        ELSE 'inactive'
    END;

-- Option 1: All strings
SELECT 
    CASE 
        WHEN status = 'active' THEN '1'
        ELSE 'inactive'
    END;

-- Option 2: Use separate columns
SELECT 
    if(status = 'active', 1, 0) AS is_active,
    if(status = 'active', '', 'inactive') AS status_text;
```

### **5. Use widest compatible numeric type**

```sql
-- When dealing with signed and unsigned integers
SELECT 
    CASE 
        WHEN condition THEN toInt128(-100)
        ELSE toInt128(18446744073709551615)
    END AS value;

-- Or use Float64 if precision loss is acceptable
SELECT 
    CASE 
        WHEN condition THEN toFloat64(-100)
        ELSE toFloat64(18446744073709551615)
    END AS value;
```

### **6. Enable Variant type for UNION (future versions)**

Starting from a future ClickHouse version (PR in progress):

```sql
-- Will automatically create Variant type
SELECT 1 AS x
UNION ALL
SELECT 'Hello';
-- Result: Variant(UInt8, String)

-- Current workaround: Use explicit Variant
SELECT CAST(1 AS Variant(UInt8, String))
UNION ALL
SELECT CAST('Hello' AS Variant(UInt8, String));
```

###  **7. Fix array homogeneity**

```sql
-- Mixed types
SELECT [1, 2, 'three'];

-- All the same type
SELECT [toString(1), toString(2), 'three'];

-- Or
SELECT [1, 2, 3];
```

## Prevention tips {#prevention-tips}

1. **Plan your type schema carefully**: When designing tables, ensure columns that will be combined in UNION or comparisons have compatible types.

2. **Be explicit with casts**: Don't rely on implicit type conversion—use explicit CAST or type conversion functions.

3. **Understand signed vs unsigned limits**: Be aware that combining signed and unsigned integers can fail if the unsigned value exceeds what the signed type can represent.

4. **Use Nullable consistently**: If one branch returns Nullable, ensure all branches do:

   ```sql
   SELECT 
       CASE 
           WHEN condition THEN NULL
           ELSE 0  -- Should be: toNullable(0) or CAST(0 AS Nullable(UInt8))
       END;
   ```

5. **For Dynamic/JSON columns (25.x+)**: Always cast to specific type before comparison:

   ```sql
   WHERE attributes.field::String = 'value'
   -- OR
   WHERE attributes.field.:String = 'value'
   ```

6. **Test UNION queries incrementally**: Test each SELECT in a UNION separately to identify type mismatches.

7. **Use `toTypeName()` for debugging**:

   ```sql
   SELECT toTypeName(column1), toTypeName(column2);
   ```

## Related error codes {#related-error-codes}

- [Error 258: `UNION_ALL_RESULT_STRUCTURES_MISMATCH`](/troubleshooting/error-codes/258_UNION_ALL_RESULT_STRUCTURES_MISMATCH) - Column count or structure mismatch in UNION
- [Error 53: `TYPE_MISMATCH`](/troubleshooting/error-codes/53_TYPE_MISMATCH) - General type mismatch error
- [Error 70: `CANNOT_CONVERT_TYPE`](/troubleshooting/error-codes/70_CANNOT_CONVERT_TYPE) - Type conversion failure

## Additional resources {#additional-resources}

**ClickHouse documentation:**
- [Data Types](/sql-reference/data-types) - Understanding ClickHouse type system
- [Type Conversion Functions](/sql-reference/functions/type-conversion-functions) - CAST and conversion functions
- [UNION Clause](/sql-reference/statements/select/union) - UNION behavior and type unification
- [Dynamic Type](/sql-reference/data-types/dynamic) - Working with Dynamic columns (25.x+)
- [JSON Type](/sql-reference/data-types/json) - Working with JSON columns (25.x+)
- [Variant Type](/sql-reference/data-types/variant) - Variant type for mixed types
