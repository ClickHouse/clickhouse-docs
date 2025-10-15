---
slug: /troubleshooting/error-codes/053_TYPE_MISMATCH
sidebar_label: '053 TYPE_MISMATCH'
doc_type: 'reference'
keywords: ['error codes', 'TYPE_MISMATCH', '053']
title: '053 TYPE_MISMATCH'
description: 'ClickHouse error code - 053 TYPE_MISMATCH'
---

# Error 53: TYPE_MISMATCH

:::tip
This error occurs when there is an incompatibility between expected and actual data types during data processing, serialization, or type casting operations.
It typically indicates that ClickHouse encountered data of one type where it expected a different type, often during internal operations like column casting or data serialization.
:::

## Most common causes {#most-common-causes}

1. **Internal column type casting failures**
    - Bad cast from one column type to another (e.g., `ColumnDecimal` to `ColumnVector`)
    - Sparse column to dense column type mismatches
    - Nullable column to non-nullable column casts
    - Decimal precision mismatches (e.g., `Decimal64` vs `Decimal128`)

2. **Data serialization issues**
    - Type mismatches during binary bulk serialization
    - Writing data parts with incompatible types
    - Merge operations with incompatible column types

3. **Integration and replication problems**
    - Type mismatches in PostgreSQL/MySQL materialized views
    - CDC (Change Data Capture) operations with schema differences
    - External table type mapping errors

4. **Mutation and merge operations**
    - Mutations encountering data with unexpected types
    - Background merge tasks failing due to type incompatibilities
    - Part writing with mismatched column types

5. **Sparse column serialization**
    - Attempting to serialize sparse columns as dense columns
    - Type casting errors with sparse column representations

## What to do when you encounter this error {#what-to-do}

**1. This is often an internal bug**

`TYPE_MISMATCH` errors, especially those marked as `LOGICAL_ERROR`, typically indicate internal ClickHouse issues rather than user errors.
These should be reported if they persist.

**2. Check for schema mismatches**

```sql
-- Verify table schema
DESCRIBE TABLE your_table;

-- Check column types in system tables
SELECT 
    name,
    type,
    default_kind,
    default_expression
FROM system.columns
WHERE database = 'your_database' 
  AND table = 'your_table';
```

**3. Check for stuck mutations**

```sql
-- Look for failing mutations
SELECT 
    database,
    table,
    mutation_id,
    command,
    create_time,
    latest_fail_reason
FROM system.mutations
WHERE NOT is_done;
```

**4. Review recent schema changes**

Type mismatches often occur after:
- `ALTER TABLE MODIFY COLUMN` operations
- Schema changes in source systems (for integrations)
- Version upgrades

## Common solutions {#common-solutions}

**1. Kill and retry stuck mutations**

```sql
-- Kill problematic mutation
KILL MUTATION WHERE mutation_id = 'stuck_mutation_id';

-- Re-run the operation if needed
```

**2. Optimize table to consolidate parts**

```sql
-- Force merge to consolidate data types
OPTIMIZE TABLE your_table FINAL;
```

**3. Check and fix integration type mappings**

For PostgreSQL/MySQL integrations:

```sql
-- Verify external table schema matches ClickHouse expectations
SHOW CREATE TABLE your_postgresql_table;
```

**4. Disable sparse columns if problematic**

```sql
-- Disable sparse serialization setting
SET optimize_use_implicit_projections = 0;
SET use_sparse_serialization = 0;
```

**5. Detach and reattach table**

For persistent issues:

```sql
DETACH TABLE your_table;
ATTACH TABLE your_table;
```

**6. Rebuild affected parts**

If specific parts are corrupted:

```sql
-- Check parts
SELECT name, database, table, marks_bytes, rows
FROM system.parts
WHERE table = 'your_table' AND active;

-- Detach problematic part
ALTER TABLE your_table DETACH PART 'part_name';
```

## Common scenarios {#common-scenarios}

**Scenario 1: Bad cast during merge**

```
Bad cast from type DB::ColumnDecimal<DB::Decimal<long>> to 
DB::ColumnDecimal<DB::Decimal<wide::integer<128ul, int>>>
```

**Cause:** Decimal precision mismatch between parts being merged.

**Solution:**
- Check if recent schema changes modified decimal types
- Optimize table to merge parts with consistent types
- May need to drop and recreate table with correct schema

**Scenario 2: Sparse column serialization**

```
Bad cast from type DB::ColumnSparse to DB::ColumnVector<double>
```

**Cause:** Sparse column optimization conflicting with serialization.

**Solution:**

```sql
SET use_sparse_serialization = 0;
```
Or upgrade to newer version with fixes.

**Scenario 3: PostgreSQL replication type mismatch**

```
Bad cast from type DB::ColumnDecimal<DB::DateTime64> to 
DB::ColumnDecimal<DB::Decimal<long>>
```

**Cause:** PostgreSQL type mapped incorrectly to ClickHouse type.

**Solution:**
- Review PostgreSQL source column types
- Verify MaterializedPostgreSQL table definitions
- May need to recreate the materialized table

**Scenario 4: Integration type conflicts**

```
Unexpected type string for mysql type 15, got bool
```

**Cause:** MySQL/PostgreSQL type mapping mismatch.

**Solution:**
- Verify source schema hasn't changed
- Check destination table was created with correct types
- May need to recreate destination table

## Prevention tips {#prevention-tips}

1. **Consistent decimal types:** Use consistent decimal precision across your schema
2. **Test schema changes:** Test `ALTER` operations on non-production data first
3. **Monitor merges:** Watch `system.merges` for errors
4. **Version consistency:** Keep ClickHouse versions consistent across replicas
5. **Integration testing:** Test integration schemas before production
6. **Avoid sparse columns:** If encountering issues, disable sparse serialization

## Debugging steps {#debugging-steps}

1. **Identify the failing operation:**

   ```sql
   SELECT 
       event_time,
       query_id,
       exception,
       query
   FROM system.query_log
   WHERE exception_code = 53
   ORDER BY event_time DESC
   LIMIT 10;
   ```

2. **Check merge/mutation logs:**

   ```sql
   SELECT 
       database,
       table,
       elapsed,
       progress,
       latest_fail_reason
   FROM system.merges
   WHERE NOT
