---
slug: /troubleshooting/error-codes/135_ZERO_ARRAY_OR_TUPLE_INDEX
sidebar_label: '135 ZERO_ARRAY_OR_TUPLE_INDEX'
doc_type: 'reference'
keywords: ['error codes', 'ZERO_ARRAY_OR_TUPLE_INDEX', '135', 'tuple', 'index', 'zero', 'tupleElement']
title: '135 ZERO_ARRAY_OR_TUPLE_INDEX'
description: 'ClickHouse error code - 135 ZERO_ARRAY_OR_TUPLE_INDEX'
---

# Error 135: ZERO_ARRAY_OR_TUPLE_INDEX

:::tip
This error occurs when you attempt to access a **tuple** element using index 0.
ClickHouse tuples use 1-based indexing, meaning the first element is at index 1, not 0.
:::

## Most common causes {#most-common-causes}

1. **Using 0-based indexing from other languages**
   - Developers coming from Python, JavaScript, C++, Java, etc. where arrays start at 0
   - Forgetting ClickHouse uses 1-based indexing for tuples and arrays (with arrays `0` will work but return the default value of the array type, not the first element)
   - Copy-pasting code from other systems without adjusting indices
   - Mental model mismatch between ClickHouse and application code

2. **Incorrect tuple element access**
   - Using `.0` to access first element instead of `.1`
   - Using `tupleElement(tuple, 0)` instead of `tupleElement(tuple, 1)`
   - Bracket notation with 0 index: `tuple[0]` instead of `tuple[1]`
   - Off-by-one errors in loop indices or calculations

3. **Dynamic index calculations**
   - Loop counters starting at 0 instead of 1
   - Range functions generating 0-based sequences
   - Mathematical calculations resulting in 0 index
   - Converting from 0-based system without adjustment

## Common solutions {#common-solutions}

**1. Use 1-based indexing for tuple access**

```sql
-- Error: Attempting to access tuple element at index 0
SELECT tupleElement((1, 'hello', 3.14), 0);

-- Solution: Use 1-based indexing
SELECT tupleElement((1, 'hello', 3.14), 1);  -- Returns: 1
SELECT tupleElement((1, 'hello', 3.14), 2);  -- Returns: 'hello'
SELECT tupleElement((1, 'hello', 3.14), 3);  -- Returns: 3.14
```

**2. Use dot notation with correct indices**

```sql
-- Error: Tuple element .0 doesn't exist
SELECT (1, 'hello', 3.14).0;

-- Solution: Start from .1
SELECT (1, 'hello', 3.14).1;  -- Returns: 1
SELECT (1, 'hello', 3.14).2;  -- Returns: 'hello'
SELECT (1, 'hello', 3.14).3;  -- Returns: 3.14
```

## Related error codes {#related-error-codes}

- [INDEX_OF_POSITIONAL_ARGUMENT_IS_OUT_OF_RANGE (69)](/troubleshooting/error-codes/069_INDEX_OF_POSITIONAL_ARGUMENT_IS_OUT_OF_RANGE) - Tuple/array index exceeds bounds
- [ILLEGAL_TYPE_OF_ARGUMENT (43)](/troubleshooting/error-codes/043_ILLEGAL_TYPE_OF_ARGUMENT) - Wrong type used for index
- [SIZES_OF_ARRAYS_DONT_MATCH (190)](/troubleshooting/error-codes/190_SIZES_OF_ARRAYS_DONT_MATCH) - Array size mismatches
- [ILLEGAL_INDEX (127)](/troubleshooting/error-codes/127_ILLEGAL_INDEX) - Invalid index usage