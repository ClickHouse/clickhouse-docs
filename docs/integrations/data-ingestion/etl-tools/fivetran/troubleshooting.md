---
sidebar_label: 'Troubleshooting'
slug: /integrations/fivetran/troubleshooting
sidebar_position: 4
description: 'Common errors, debugging tips, and best practices for the Fivetran ClickHouse destination.'
title: 'Fivetran ClickHouse Destination - Troubleshooting & Best Practices'
doc_type: 'guide'
keywords: ['fivetran', 'clickhouse destination', 'troubleshooting', 'OOM', 'batch size', 'AST too big', 'EOF', 'replica inactive', 'ORDER BY', 'database occupied', 'BYOC']
---

# Fivetran ClickHouse Destination - Troubleshooting & Best Practices

## Configuring batch sizes {#batch-size-configuration}

Many of the errors below can be mitigated by tuning batch sizes via a JSON configuration file. See the [Advanced configuration](/integrations/fivetran/setup-guide#advanced-configuration) section of the setup guide for full details.

Quick reference:

| Setting | Default | Min | Max |
|---------|---------|-----|-----|
| `write_batch_size` | 100,000 | 5,000 | 100,000 |
| `select_batch_size` | 1,500 | 200 | 1,500 |
| `mutation_batch_size` | 1,500 | 200 | 1,500 |
| `hard_delete_batch_size` | 1,500 | 200 | 1,500 |

```json
{
  "destination_configurations": {
    "write_batch_size": 50000,
    "mutation_batch_size": 200
  }
}
```

---

## Common errors {#common-errors}

### AST is too big (code 168) {#ast-too-big}

**Error message:**

```sh
code: 168, message: AST is too big. Maximum: 50000
```

**Cause:** Large UPDATE or DELETE batches generate SQL statements with very complex abstract syntax trees. Common with wide tables or history mode enabled.

**Solutions:**

1. **Reduce batch sizes** (recommended): Lower `mutation_batch_size` and `hard_delete_batch_size` in the [configuration file](#batch-size-configuration).
2. **Increase ClickHouse limits** (workaround):
   ```sql
   ALTER USER fivetran_user SETTINGS max_ast_elements = 1000000, max_query_size = 10000000;
   ```
   :::note
   Increasing these values raises safety limits for query parsing. Monitor CPU and memory usage after making this change.
   :::

---

### Max query size exceeded (code 62) {#max-query-size}

**Error message:**

```sh
code: 62, message: Max query size exceeded
```

**Cause:** The generated SQL exceeds the `max_query_size` limit (default: 262,144 bytes). Common with history mode or wide tables.

**Solutions:**

1. **Reduce batch sizes**: Lower `mutation_batch_size` and `hard_delete_batch_size`.
2. **Increase `max_query_size`**:
   ```sql
   ALTER USER fivetran_user SETTINGS max_query_size = 10000000;
   ```

---

### Memory limit exceeded / OOM (code 241) {#memory-limit-exceeded}

**Error message:**

```sh
code: 241, message: (total) memory limit exceeded: would use 14.01 GiB
```

**Cause:** The INSERT operation requires more memory than available. Happens during large initial syncs, with wide tables, or concurrent batch operations.

**Solutions:**

1. **Reduce `write_batch_size`**: Lower to 50,000 or even 5,000 for very large tables.
2. **Scale up the ClickHouse Cloud service** to provide more memory.
3. **Reduce concurrent load**: If the source produces very wide CSV files (200+ columns), the connector may need more memory.

:::note
If the connector pod itself is killed by OOM (no error in ClickHouse logs), the issue is on the Fivetran side. Reducing `write_batch_size` to 5,000 may help. Improvements to stream CSV data in batches are in development.
:::

---

### Inactive replicas during ALTER/DELETE (code 341) {#inactive-replicas}

**Error message:**

```sh
code: 341, message: Not finished because some replicas are inactive right now
```

**Cause:** A DDL or lightweight DELETE was executed, but one or more replicas are inactive. This can happen when ClickHouse Cloud has a stopped or idling child service (compute-compute separation). The connector checks `system.replicas` and finds inactive entries from the idle service.

**Solutions:**

1. **Start or remove the idle child service.** Once all child services are running or removed, the connector finds all replicas active.
2. **Set `lightweight_deletes_sync` to 3** for the Fivetran user:
   ```sql
   ALTER USER fivetran_user SETTINGS lightweight_deletes_sync = 3;
   ```
   :::note
   Recent versions of the connector apply this setting by default and exclude idle instances from DDL wait logic.
   :::
3. **Verify replica status**:
   ```sql
   SELECT replica_is_active FROM system.replicas
   WHERE database = '<db>' AND table = '<table>';
   ```

---

### Replica not available / Failed after 600 attempts {#replica-not-available}

**Error message:**

```sh
Failed to alter table ... all_replicas_active ... failed after 600 attempts
```

**Cause:** The connector waits up to 600 seconds for all replicas to become available. This fails when:
- Nodes are offline or unhealthy.
- Orphaned replica entries remain after a service migration or resize.

**Solutions:**

1. **Ensure all nodes are running**: All replicas must be online during Fivetran syncs.
2. **Check for orphaned replicas**: After a service migration, old replica names may remain in `system.replicas`. Remove them:
   ```sql
   -- Find orphaned replicas
   SELECT DISTINCT arrayJoin(mapKeys(replica_is_active)) AS replica_name
   FROM system.replicas
   WHERE arrayJoin(mapValues(replica_is_active)) = 0;

   -- Remove orphaned replica
   SYSTEM DROP REPLICA '<old-replica-name>' FROM TABLE <db>.<table>;
   ```
3. **Check the ClickHouse Cloud console** for scaling events or maintenance windows.

---

### Database name occupied by another replica (code 341) {#database-occupied}

**Error message:**

```sh
code: 341, message: Database name schema was occupied by another replica
```

**Cause:** A race condition during `CREATE DATABASE IF NOT EXISTS` when multiple replicas are active, typically during the first historical sync with multiple tables being created concurrently.

**Solutions:**

1. **Retry the sync**: This is usually transient during initial setup.
2. **Check replica status** in the ClickHouse Cloud console.
3. **Open a support ticket** if the error persists across multiple retries.

---

### Unexpected EOF / Connection error {#unexpected-eof}

**Error message:**

```sh
ClickHouse connection error: unexpected EOF
```

Or `FAILURE_WITH_TASK` with no stack trace in Fivetran logs.

**Cause:**
- IP access list not configured to allow Fivetran traffic.
- Transient network issues between Fivetran and ClickHouse Cloud.
- Corrupted or invalid source data causing the destination connector to crash.

**Solutions:**

1. **Check IP access list**: In ClickHouse Cloud, go to **Settings > Security** and add the [Fivetran IP addresses](https://fivetran.com/docs/using-fivetran/ips) or allow access from anywhere.
2. **Retry**: Recent connector versions automatically retry EOF errors. Sporadic errors (1–2 per day) are likely transient.
3. **If the issue persists**: Open a support ticket with ClickHouse providing the error time window. Also ask Fivetran support to investigate source data quality.

---

### Truncate before time is zero {#truncate-before-time-zero}

**Error message:**

```sh
Failed to truncate table ... cause: truncate before time is zero
```

**Cause:** A bug in the connector where timestamps with exactly 0 seconds and 0 nanoseconds (e.g., `10:00:00`) were incorrectly treated as invalid. Fixed in connector PR #49 (December 2025).

**Solutions:**

1. **Ensure you are running the latest version** of the ClickHouse Fivetran destination.
2. **If the error persists**: The issue may be caused by corrupted source data. Contact Fivetran support.

---

### Can't map type UInt64 {#uint64-type-error}

**Error message:**

```sh
cause: can't map type UInt64 to Fivetran types
```

**Cause:** The connector maps `LONG` to `Int64`, never `UInt64`. This error occurs when a user manually altered a column type in a Fivetran-managed table.

**Solutions:**

1. **Do not manually modify column types** in Fivetran-managed tables.
2. **To recover**: Alter the column back to the expected type (e.g., `Int64`) or delete and re-sync the table.
3. **For custom types**: Create a [materialized view](/sql-reference/statements/create/view#materialized-view) on top of the Fivetran-managed table.

---

### No primary keys for table {#no-primary-keys}

**Error message:**

```sh
Failed to alter table ... cause: no primary keys for table
```

**Cause:** Every ClickHouse table requires an `ORDER BY`. When the source has no primary key, Fivetran adds `_fivetran_id` automatically. This error occurs in edge cases where the source defines a PK but the data does not contain it.

**Solutions:**

1. **Contact Fivetran support** to investigate the source pipeline.
2. **Check the source schema**: Ensure primary key columns are present in the data.

---

### Role-based grants failing {#role-based-grants}

**Error message:**

```sh
user is missing the required grants on *.*: ALTER, CREATE DATABASE, CREATE TABLE, INSERT, SELECT
```

**Cause:** The connector checks grants with:

```sql
SELECT access_type, database, table, column FROM system.grants WHERE user_name = 'my_user'
```

This only returns direct grants. Privileges assigned via a ClickHouse role have `user_name = NULL` and `role_name = 'my_role'`, so they are invisible to this check.

**Solutions:**

1. **Grant privileges directly** to the Fivetran user:
   ```sql
   GRANT SELECT, INSERT, ALTER, CREATE TABLE, CREATE DATABASE ON *.* TO fivetran_user;
   ```
2. A fix for the connector to also check `system.role_grants` is tracked.

---

### Network closed / Sync rescheduled {#network-closed}

**Error message:**

Syncs fail with "Network closed for unknown reason" and are rescheduled.

**Cause:**
- Connector pod OOM killed (process terminates with no error logged).
- Long-running query exceeds ClickHouse socket timeout (default: 300 seconds).
- Transient network issues.

**Solutions:**

1. **Check for OOM**: If the connector disappears without errors, see [Memory limit exceeded](#memory-limit-exceeded).
2. **Reduce batch sizes**: See [batch size configuration](#batch-size-configuration).
3. **If timeout-related** (`SOCKET_TIMEOUT` in ClickHouse logs): Contact ClickHouse support.

---

## Best practices {#best-practices}

### Dedicated ClickHouse service for Fivetran {#dedicated-service}

Use ClickHouse Cloud's compute-compute separation to create a dedicated service for Fivetran write workloads. This isolates ingestion from analytical queries and prevents resource contention.

Recommended architecture:

- **Service A (writer)**: Fivetran destination + other ingestion tools (ClickPipes, Kafka connectors)
- **Service B (reader)**: BI tools, dashboards, ad-hoc queries

### Duplicate records with ReplacingMergeTree {#duplicate-records}

ClickHouse uses `ReplacingMergeTree` for Fivetran destination tables. Duplicate rows with the same primary key are normal — deduplication happens asynchronously during background merges.

**Always use the `FINAL` modifier** to get deduplicated results:

```sql
SELECT * FROM schema.table FINAL WHERE ...
```

See the [data deduplication](/integrations/fivetran/reference#deduplication) reference for more details.

### Primary key and ORDER BY optimization {#primary-key-optimization}

Fivetran replicates the source table's primary key as the ClickHouse `ORDER BY` clause. When the source has no PK, `_fivetran_id` (a UUID) becomes the sorting key, which leads to poor query performance because ClickHouse builds its [sparse primary index](/guides/best-practices/sparse-primary-indexes) from the `ORDER BY` columns.

**Recommendations:**

1. **Treat Fivetran tables as raw staging tables.** Do not query them directly for analytics.
2. **Create materialized views** with an `ORDER BY` optimized for your query patterns:
   ```sql
   CREATE MATERIALIZED VIEW schema.table_optimized
   ENGINE = ReplacingMergeTree()
   ORDER BY (user_id, event_date)
   AS SELECT * FROM schema.table_raw;
   ```

### Don't manually modify Fivetran-managed tables {#dont-modify-tables}

Avoid manual DDL changes (e.g., `ALTER TABLE ... MODIFY COLUMN`) to tables managed by Fivetran. The connector expects the schema it created. Manual changes can cause [type mapping errors](#uint64-type-error) and schema mismatch failures.

Use materialized views for custom transformations.

### Ensure cluster health during syncs {#cluster-health}

The Fivetran destination checks that all replicas are active before performing operations. If any replica is offline, operations fail after retrying for up to 600 seconds.

- Keep all replicas running during sync windows.
- Schedule syncs when all nodes are available if you scale down during off-hours.
- Monitor the ClickHouse Cloud console for service issues.

### Tuning for large initial syncs {#large-initial-syncs}

For large datasets (hundreds of millions of rows or multi-TB):

1. **Start with lower batch sizes**: Set `write_batch_size` to 50,000 or lower.
2. **Scale up the ClickHouse Cloud service** before the initial sync.
3. **Monitor memory usage** on both ClickHouse and Fivetran sides.
4. **Be patient**: Large syncs (10+ TB) can take days to weeks depending on data complexity, batch sizes, and source extraction speed.

### BYOC compatibility {#byoc-compatibility}

The Fivetran destination works with ClickHouse Cloud BYOC (Bring Your Own Cloud) deployments. The connector uses `SharedMergeTree`, which is the engine in all ClickHouse Cloud services including BYOC. There is no difference in configuration or behavior.
