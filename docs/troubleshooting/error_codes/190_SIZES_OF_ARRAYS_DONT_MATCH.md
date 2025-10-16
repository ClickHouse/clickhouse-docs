---
slug: /troubleshooting/error-codes/190_SIZES_OF_ARRAYS_DONT_MATCH
sidebar_label: '190 SIZES_OF_ARRAYS_DONT_MATCH'
doc_type: 'reference'
keywords: ['error codes', 'SIZES_OF_ARRAYS_DONT_MATCH', '190']
title: '190 SIZES_OF_ARRAYS_DONT_MATCH'
description: 'ClickHouse error code - 190 SIZES_OF_ARRAYS_DONT_MATCH'
---

# Error 190: SIZES_OF_ARRAYS_DONT_MATCH

:::tip
This error occurs when array functions that require equal-length arrays receive arrays of different sizes.
This commonly happens with functions like `arrayMap`, `arrayZip`, higher-order array functions, and array distance functions (like `arrayL2Distance`) that operate on corresponding elements from multiple arrays.
:::

## Most common causes {#most-common-causes}

1. **Array functions with mismatched input arrays**
   - Using `arrayMap` with lambda functions that require multiple arrays of different lengths
   - Passing arrays of different sizes to `arrayZip` when it expects equal-length inputs
   - Using higher-order functions like `arrayFilter`, `arrayExists`, or `arraySplit` with multiple arrays of different sizes
   - Array distance functions receiving embeddings or vectors of different dimensions

2. **Misleading error messages in recent versions (24.2+)**
   - In ClickHouse 24.2+, the error message may report incorrect array sizes (e.g., "Argument 2 has size 1, but expected 1")
   - The reported sizes in the error message may not accurately reflect the actual array dimensions
   - This makes debugging more difficult on large queries where the actual mismatch is unclear

3. **Version-specific issues with array functions**
   - After migrating from 24.1.4.20 to 24.2.1.2248, functions like `arrayL2Distance` may fail with this error
   - Can occur when processing embeddings or vector data with inconsistent dimensions
   - Bitmap transformation functions may trigger internal array mismatches

4. **Context-dependent evaluation with untuple and arrayZip**
   - Using `arrayZip(untuple(...))` with certain table engines (ReplicatedMergeTree) may fail
   - Adding WHERE clauses can trigger unexpected behavior with empty untuple results
   - Works differently on Memory engine vs. ReplicatedMergeTree

5. **Data quality issues**
   - Inconsistent data ingestion creating arrays of varying lengths
   - Nested structures where inner arrays have different sizes across rows
   - NULL or empty arrays mixed with populated arrays in multi-array operations

## Common solutions {#common-solutions}

**1. Verify array lengths before calling array functions**

```sql
-- Option A: Filter to only equal-length arrays
SELECT 
    arrayMap((x, y) -> x + y, arr1, arr2) AS result
FROM table
WHERE length(arr1) = length(arr2);

-- Option B: Pad shorter arrays to match length (keeps all rows)
SELECT 
    arrayMap((x, y) -> x + y, 
        arrayResize(arr1, greatest(length(arr1), length(arr2)), 0),
        arrayResize(arr2, greatest(length(arr1), length(arr2)), 0)
    ) AS result
FROM table;

-- Option C: Use CASE to handle mismatched rows
SELECT 
    CASE 
        WHEN length(arr1) = length(arr2) 
        THEN arrayMap((x, y) -> x + y, arr1, arr2)
        ELSE []  -- or NULL, or some default value
    END AS result
FROM table;
```

**2. Use `arrayZipUnaligned` for arrays of different lengths**

```sql
-- Instead of arrayZip which requires equal sizes
SELECT arrayZip(['a'], [1, 2, 3]);
-- Error: SIZES_OF_ARRAYS_DONT_MATCH

-- Use arrayZipUnaligned which pads with NULLs
SELECT arrayZipUnaligned(['a'], [1, 2, 3]);
-- Result: [('a', 1), (NULL, 2), (NULL, 3)]

-- Alternative: manually pad with arrayResize before using arrayZip
SELECT arrayZip(
    arrayResize(['a'], 3, ''),
    [1, 2, 3]
);
-- Result: [('a', 1), ('', 2), ('', 3)]
```

**3. Validate embedding dimensions before distance calculations**

```sql
-- For vector similarity operations, ensure all embeddings have same dimension
SELECT 
    id,
    arrayL2Distance(embedding1, embedding2) AS distance
FROM table
WHERE length(embedding1) = length(embedding2)
    AND length(embedding1) = 384;  -- Expected embedding size

-- Or add validation in your data pipeline
INSERT INTO embeddings_table
SELECT 
    id,
    embedding
FROM source_table
WHERE length(embedding) = 384;  -- Reject invalid embeddings at ingestion
```

**4. Handle version-specific issues (24.2+ misleading errors)**

```sql
-- When error messages are misleading, debug with explicit length checks
SELECT 
    length(arr1) AS arr1_len,
    length(arr2) AS arr2_len,
    length(arr3) AS arr3_len
FROM table
WHERE NOT (length(arr1) = length(arr2) AND length(arr2) = length(arr3))
LIMIT 10;

-- This helps identify which arrays actually have mismatched lengths
-- despite what the error message claims
```

**5. Fix untuple issues with ReplicatedMergeTree (use PREWHERE or experimental analyzer)**

```sql
-- If encountering issues with arrayZip(untuple(...)) on ReplicatedMergeTree

-- Option A: Use PREWHERE instead of WHERE
SELECT 
    app,
    arrayZip(untuple(sumMap(k.keys, replicate(1, k.keys))))
FROM test 
PREWHERE c > 0 
GROUP BY app;

-- Option B: Enable experimental analyzer
SET allow_experimental_analyzer = 1;
SELECT 
    app,
    arrayZip(untuple(sumMap(k.keys, replicate(1, k.keys))))
FROM test 
WHERE c > 0 
GROUP BY app;

-- Option C: Use untuple more explicitly
SELECT 
    app,
    arrayZip(untuple(sumMap(([partition_id], [rows])))) AS rows_per_partition
FROM system.parts
GROUP BY app;
```

**6. Handle bitmap transform operations carefully**

```sql
-- For bitmap functions that can trigger this error due to internal array mismatches,
-- ensure consistent data types and proper null handling
SELECT 
    bitmapToArray(bitmapAnd(bitmap1, bitmap2)) AS result
FROM table
WHERE bitmap1 IS NOT NULL 
    AND bitmap2 IS NOT NULL
    AND bitmapCardinality(bitmap1) > 0
    AND bitmapCardinality(bitmap2) > 0;
```

**7. Debug complex queries with multiple arrays**

```sql
-- Break down complex arrayMap operations to identify the mismatch
WITH 
    arrays_checked AS (
        SELECT 
            arr1,
            arr2,
            arr3,
            length(arr1) as len1,
            length(arr2) as len2,
            length(arr3) as len3
        FROM source_table
    )
SELECT 
    arr1, arr2, arr3,
    len1, len2, len3,
    (len1 = len2 AND len2 = len3) AS all_equal
FROM arrays_checked
WHERE NOT all_equal;
```

## Prevention tips {#prevention-tips}

1. **Always validate array dimensions**: Before passing arrays to functions that require equal sizes, check their lengths using `length()` function or add assertions in your queries. Consider adding CHECK constraints on array columns if appropriate.
2. **Be cautious after version upgrades**: When upgrading ClickHouse (especially to 24.2+), test queries involving array functions as error messages may be misleading and behavior might have changed. Keep a test suite of array operations.
3. **Use appropriate array functions**: Choose `arrayZipUnaligned` when you need to handle arrays of different lengths, and `arrayZip` only when you're certain arrays are equal-sized.
4. **Validate embedding data pipelines**: If using vector embeddings, implement validation checks in your data ingestion pipeline to ensure all vectors have consistent dimensions before insertion. Reject or pad vectors at the source.
5. **Consider table engine differences**: Be aware that some array operations may behave differently on Memory engine vs. ReplicatedMergeTree, especially with complex expressions like `untuple`. Test on the target engine type.
6. **Add data quality checks**: Implement regular data quality monitoring to detect when arrays of varying lengths are being inserted:

```sql
-- Monitor array length consistency
SELECT 
    count() as total_rows,
    countIf(length(arr1) = length(arr2)) as matching_lengths,
    (matching_lengths / total_rows) * 100 as match_percentage
FROM table
WHERE toDate(inserted_at) = today();
```

7. **Document expected array sizes**: In table schemas and application code, clearly document the expected sizes of arrays, especially for ML embeddings or fixed-size data structures.

8. **Use materialized columns for validation**: Create materialized columns that compute and store array lengths for quick validation:

```sql
CREATE TABLE embeddings_table (
    id UInt64,
    embedding Array(Float32),
    embedding_size UInt32 MATERIALIZED length(embedding)
) ENGINE = MergeTree()
ORDER BY id;

-- Then you can quickly filter or validate
SELECT count() FROM embeddings_table WHERE embedding_size != 384;
```
