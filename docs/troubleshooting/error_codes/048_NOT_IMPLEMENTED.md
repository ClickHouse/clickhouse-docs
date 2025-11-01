---
slug: /troubleshooting/error-codes/048_NOT_IMPLEMENTED
sidebar_label: '048 NOT_IMPLEMENTED'
doc_type: 'reference'
keywords: ['error codes', 'NOT_IMPLEMENTED', '048']
title: '048 NOT_IMPLEMENTED'
description: 'ClickHouse error code - 048 NOT_IMPLEMENTED'
---

# Error 48: NOT_IMPLEMENTED

:::tip
This error occurs when you attempt to use a feature, function, or operation that is not implemented in your ClickHouse version, not supported for your specific table engine or configuration, or requires enabling experimental settings to use.
:::

## Most common causes {#most-common-causes}

1. **Table engine limitations**
   - `ALTER` operations not supported on specific table engines (View, Memory, File, URL tables)
   - Mutations (`UPDATE`/`DELETE`) not available for certain engines
   - `OPTIMIZE` or other maintenance operations unavailable for read-only or external engines
   - Missing replication features on non-Replicated table engines

2. **Experimental or preview features not enabled**
   - An experimental or beta feature has not been enabled through a [setting](/beta-and-experimental-features)
   - The feature is not yet available in ClickHouse Cloud
   - The feature is in private preview and access needs to be provided by Cloud support

3. **Version-specific features**
   - Using features from newer ClickHouse versions on older installations
   - Functions or syntax not backported to your version
   - Cloud vs self-managed feature differences
   - Deprecated features removed in newer versions

4. **Data type or operation incompatibilities**
   - Operations not supported for specific data types (Array, Map, Tuple operations)
   - Type conversions that don't have implementations
   - Mathematical operations on incompatible types
   - Special column operations (ephemeral, alias columns)

5. **Distributed and replicated table limitations**
   - Certain `ALTER` operations not supported on Distributed tables
   - Global joins or subqueries not fully implemented
   - Cross-cluster operations with limited support
   - Replication features unavailable in standalone mode

6. **Storage and integration limitations**
   - S3/HDFS operations not fully implemented
   - Table function limitations (URL, S3, MySQL, PostgreSQL engines)
   - Backup/restore operations unavailable for certain engines
   - External dictionary refresh operations not supported

## Common solutions {#common-solutions}

**1. Enable required experimental settings**

```sql
-- Error: Window functions not available (older versions)
SELECT 
    user_id,
    row_number() OVER (PARTITION BY user_id ORDER BY timestamp) as rn
FROM events;

-- Solution: Enable experimental window functions (< v21.12)
SET allow_experimental_window_functions = 1;

SELECT 
    user_id,
    row_number() OVER (PARTITION BY user_id ORDER BY timestamp) as rn
FROM events;
```

:::tip
See ["Beta and experimental features"](/beta-and-experimental-features) page for a list of experimental and beta flags.
:::

**2. Use supported table engine for operations**

```sql
-- Error: Cannot ALTER a View table
ALTER TABLE my_view ADD COLUMN new_column String;

-- Solution: ALTER the underlying table instead
ALTER TABLE underlying_table ADD COLUMN new_column String;

-- Then recreate the view if needed
CREATE OR REPLACE VIEW my_view AS
SELECT *, new_column
FROM underlying_table;
```

**3. Switch from non-replicated to Replicated table engine**

```sql
-- Error: Replication features not available on MergeTree
-- Operations like SYNC REPLICA, FETCH PARTITION fail

-- Solution: Migrate to ReplicatedMergeTree
CREATE TABLE new_table
(
    date Date,
    user_id UInt64,
    value Float64
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/new_table', '{replica}')
PARTITION BY toYYYYMM(date)
ORDER BY (date, user_id);

-- Migrate data
INSERT INTO new_table SELECT * FROM old_table;

-- Rename tables
RENAME TABLE old_table TO old_table_backup, new_table TO old_table;
```

**4. Upgrade ClickHouse version for newer features**

```sql
-- Error: Feature not implemented in version 21.3
SELECT quantileTDigestWeighted(0.95)(response_time, weight) FROM requests;

-- Solution: Upgrade to version 21.8+ or use alternative
-- Alternative for older versions:
SELECT quantileWeighted(0.95)(response_time, weight) FROM requests;

-- Or upgrade ClickHouse:
-- Check current version
SELECT version();

-- Plan upgrade to newer version with required features
```

**6. Work around Distributed table limitations**

```sql
-- Error: ALTER on Distributed table not fully supported
ALTER TABLE distributed_table DROP COLUMN old_column;

-- Solution: ALTER each underlying shard table
-- On each shard:
ALTER TABLE local_table DROP COLUMN old_column;

-- Recreate Distributed table if needed
DROP TABLE distributed_table;
CREATE TABLE distributed_table AS local_table
ENGINE = Distributed(cluster_name, database_name, local_table, rand());
```

**7. Use supported operations for external table engines**

```sql
-- Error: OPTIMIZE not supported for URL table engine
OPTIMIZE TABLE url_table FINAL;

-- Solution: For URL/File/external engines, recreate or use appropriate engine
-- If you need optimization, import to MergeTree first:
CREATE TABLE local_copy ENGINE = MergeTree() ORDER BY id AS
SELECT * FROM url_table;

OPTIMIZE TABLE local_copy FINAL;
```

**8. Enable ClickHouse Cloud preview features**

```sql
-- Error: Feature not available in ClickHouse Cloud
-- Check if feature requires enablement

-- Solution: Contact support or check Cloud console for preview features
-- Some features need to be enabled via Cloud console settings
-- Example: Advanced compute-compute separation, certain integrations

-- Alternatively, use feature flags in query settings:
SET allow_experimental_analyzer = 1;
SET enable_optimize_predicate_expression = 1;

SELECT * FROM table WHERE complex_condition;
```

## Prevention tips {#prevention-tips}

1. **Check compatibility before using new features**: Review ClickHouse release notes and documentation to verify feature availability in your version and deployment type (Cloud vs self-managed)
2. **Choose appropriate table engines**: Select table engines that support the operations you need (use ReplicatedMergeTree for replication, MergeTree family for mutations, etc.)
3. **Test experimental features in development first**: Always test experimental features in non-production environments before enabling in production, and monitor ClickHouse changelogs for when features become stable
4. **Keep ClickHouse versions updated**: Regularly upgrade to newer ClickHouse versions to access new features and improvements, following a testing → staging → production upgrade path
5. **Use Cloud-compatible patterns**: When using ClickHouse Cloud, design queries and schemas using features documented as Cloud-compatible to avoid surprises
6. **Review engine-specific limitations**: Before choosing a table engine, review its documentation for supported and unsupported operations (especially for Kafka, MaterializedView, Distributed engines)
7. **Monitor deprecation warnings**: Pay attention to deprecation notices in release notes to avoid using features that may be removed in future versions
8. **Use alternative implementations**: When a specific operation isn't implemented, look for alternative approaches using supported features (e.g., using INSERT INTO SELECT instead of UPDATE)

## Related error codes {#related-error-codes}

- [UNSUPPORTED_METHOD (1001)](/troubleshooting/error-codes/001_UNSUPPORTED_METHOD) - Method not supported in current context
- [ILLEGAL_TYPE_OF_ARGUMENT (43)](/troubleshooting/error-codes/043_ILLEGAL_TYPE_OF_ARGUMENT) - Operation not supported for data type
- [BAD_ARGUMENTS (36)](/troubleshooting/error-codes/036_BAD_ARGUMENTS) - Invalid arguments for function or operation
- [TABLE_IS_READ_ONLY (242)](/troubleshooting/error-codes/242_TABLE_IS_READ_ONLY) - Cannot modify read-only tables