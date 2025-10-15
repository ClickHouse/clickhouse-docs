---
slug: /troubleshooting/error-codes/010_NOT_FOUND_COLUMN_IN_BLOCK
sidebar_label: '010 NOT_FOUND_COLUMN_IN_BLOCK'
doc_type: 'reference'
keywords: ['error codes', 'NOT_FOUND_COLUMN_IN_BLOCK', '010']
title: '010 NOT_FOUND_COLUMN_IN_BLOCK'
description: 'ClickHouse error code - 010 NOT_FOUND_COLUMN_IN_BLOCK'
---

# Error 10: NOT_FOUND_COLUMN_IN_BLOCK

:::tip
This error occurs when ClickHouse attempts to access a column that doesn't exist in a data block during query execution, merge operations, or mutations.
It typically indicates schema inconsistency between table metadata and actual data parts.
:::

## Most common causes {#most-common-causes}

1. **Schema Evolution Issues with Mutations**
    - Mutations fail when trying to process parts that were created before certain columns were added to the table
    - Parts with different data versions have different column sets
    - Missing internal columns like `_block_number` during DELETE mutations

2. **`ALTER TABLE` Operations Gone Wrong**
    - Column additions/modifications not properly applied to all parts
    - Incomplete mutations that leave some parts with old schema

3. **Missing Internal Columns**
    - `_block_number` column missing during `DELETE` mutations (very common case)
    - Virtual columns expected but not present in older data parts

4. **Projection-Related Issues**
    - Materialized projections referencing columns that don't exist in older parts
    - Projection calculations failing when columns are missing from source data

## Common solutions {#common-solutions}

**1. Kill and Retry the Mutation**

```sql
-- Check stuck mutations
SELECT * FROM system.mutations WHERE NOT is_done;

-- Kill problematic mutation
KILL MUTATION WHERE mutation_id = 'your_mutation_id';

-- Retry the operation
```

**2. Force Part Merges**

```sql
-- For specific table
OPTIMIZE TABLE your_table FINAL;
```

This can help consolidate parts with different schemas.

**3. Check Part Versions**

```sql
SELECT 
    data_version,
    count(),
    groupArray(name)
FROM system.parts
WHERE database = 'your_db' AND table = 'your_table'
GROUP BY data_version;
```

Look for parts with very old data versions that might be missing columns.

**4. Verify Column Presence Across Parts**
- Old parts created before column additions may be missing columns
- Use `clickhouse-disk` utility to inspect actual column metadata in parts

**5. For Missing `_block_number` Errors**
This is a known issue with `DELETE` mutations on tables with older parts. Solutions:
- Kill the mutation and retry
- Consider using lightweight deletes if available in your version
- Upgrade to newer ClickHouse versions where this is fixed

**6. For Projection Errors**

If the error occurs during projection materialization:

```sql
-- Drop and recreate the projection
ALTER TABLE your_table DROP PROJECTION projection_name;
ALTER TABLE your_table ADD PROJECTION projection_name (...);
ALTER TABLE your_table MATERIALIZE PROJECTION projection_name;
```

## Prevention tips {#prevention-tips}

1. **Plan Schema Changes Carefully**: Understand that all existing parts need to be processed when adding columns used in mutations
2. **Monitor Mutation Queue**: Regularly check `system.mutations` for stuck operations
3. **Use Proper `ALTER` Syntax**: Ensure `ALTER TABLE` operations complete successfully
4. **Keep ClickHouse Updated**: Many of these issues are fixed in newer versions
5. **Regular `OPTIMIZE` Operations**: Help consolidate parts and maintain schema consistency

If you're experiencing this error, it is recommended to:
1. Check `system.mutations` to identify the stuck mutation
2. Examine part versions to find schema inconsistencies
3. Kill and retry the mutation as a first step
4. If it persists, consider escalating to ClickHouse support with specific details about your table schema and the failing operation
