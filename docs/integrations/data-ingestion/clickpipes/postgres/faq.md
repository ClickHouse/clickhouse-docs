---
sidebar_label: 'FAQ'
description: 'Frequently asked questions about ClickPipes for Postgres.'
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
title: 'ClickPipes for Postgres FAQ'
doc_type: 'how-to'
---

# ClickPipes for Postgres FAQ

### How does idling affect my Postgres CDC ClickPipe? {#how-does-idling-affect-my-postgres-cdc-clickpipe}

If your ClickHouse Cloud service is idling, your Postgres CDC ClickPipe will continue to sync data, your service will wake-up at the next sync interval to handle the incoming data. Once the sync is finished and the idle period is reached, your service will go back to idling.

As an example, if your sync interval is set to 30 mins and your service idle time is set to 10 mins, Your service will wake-up every 30 mins and be active for 10 mins, then go back to idling.

### How are TOAST columns handled in ClickPipes for Postgres? {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

Please refer to the [Handling TOAST Columns](./toast) page for more information.

### How are generated columns handled in ClickPipes for Postgres? {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

Please refer to the [Postgres Generated Columns: Gotchas and Best Practices](./generated_columns) page for more information.

### Do tables need to have primary keys to be part of Postgres CDC? {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

Yes, for CDC, tables must have either a primary key or a [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY). The REPLICA IDENTITY can be set to FULL or configured to use a unique index.

### Do you support partitioned tables as part of Postgres CDC? {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

Yes, partitioned tables are supported out of the box, as long as they have a PRIMARY KEY or REPLICA IDENTITY defined. The PRIMARY KEY and REPLICA IDENTITY must be present on both the parent table and its partitions. You can read more about it [here](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables).

### Can I connect Postgres databases that don't have a public IP or are in private networks? {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

Yes! ClickPipes for Postgres offers two ways to connect to databases in private networks:

1. **SSH Tunneling**
   - Works well for most use cases
   - See the setup instructions [here](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)
   - Works across all regions

2. **AWS PrivateLink**
   - Available in three AWS regions: 
     - us-east-1
     - us-east-2 
     - eu-central-1
   - For detailed setup instructions, see our [PrivateLink documentation](/knowledgebase/aws-privatelink-setup-for-clickpipes)
   - For regions where PrivateLink is not available, please use SSH tunneling

### How do you handle UPDATEs and DELETEs? {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgres captures both INSERTs and UPDATEs from Postgres as new rows with different versions (using the `_peerdb_` version column) in ClickHouse. The ReplacingMergeTree table engine periodically performs deduplication in the background based on the ordering key (ORDER BY columns), retaining only the row with the latest `_peerdb_` version.

DELETEs from Postgres are propagated as new rows marked as deleted (using the `_peerdb_is_deleted` column). Since the deduplication process is asynchronous, you might temporarily see duplicates. To address this, you need to handle deduplication at the query layer.

For more details, refer to:

* [ReplacingMergeTree table engine best practices](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres-to-ClickHouse CDC internals blog](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### Do you support schema changes? {#do-you-support-schema-changes}

Please refer to the [ClickPipes for Postgres: Schema Changes Propagation Support](./schema-changes) page for more information.

### What are the costs for ClickPipes for Postgres CDC? {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

For detailed pricing information, please refer to the [ClickPipes for Postgres CDC pricing section on our main billing overview page](/cloud/manage/billing/overview#clickpipes-for-postgres-cdc).

### My replication slot size is growing or not decreasing; what might be the issue? {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

If you're noticing that the size of your Postgres replication slot keeps increasing or isn't coming back down, it usually means that **WAL (Write-Ahead Log) records aren't being consumed (or "replayed") quickly enough** by your CDC pipeline or replication process. Below are the most common causes and how you can address them.

1. **Sudden Spikes in Database Activity**  
   - Large batch updates, bulk inserts, or significant schema changes can quickly generate a lot of WAL data.  
   - The replication slot will hold these WAL records until they are consumed, causing a temporary spike in size.

2. **Long-Running Transactions**  
   - An open transaction forces Postgres to keep all WAL segments generated since the transaction began, which can dramatically increase slot size.  
   - Set `statement_timeout` and `idle_in_transaction_session_timeout` to reasonable values to prevent transactions from staying open indefinitely:
     ```sql
     SELECT 
         pid,
         state,
         age(now(), xact_start) AS transaction_duration,
         query AS current_query
     FROM 
         pg_stat_activity
     WHERE 
         xact_start IS NOT NULL
     ORDER BY 
         age(now(), xact_start) DESC;
     ```
     Use this query to identify unusually long-running transactions.

3. **Maintenance or Utility Operations (e.g., `pg_repack`)**  
   - Tools like `pg_repack` can rewrite entire tables, generating large amounts of WAL data in a short time.  
   - Schedule these operations during slower traffic periods or monitor your WAL usage closely while they run.

4. **VACUUM and VACUUM ANALYZE**  
   - Although necessary for database health, these operations can create extra WAL traffic—especially if they scan large tables.  
   - Consider using autovacuum tuning parameters or scheduling manual VACUUM operations during off-peak hours.

5. **Replication Consumer Not Actively Reading the Slot**  
   - If your CDC pipeline (e.g., ClickPipes) or another replication consumer stops, pauses, or crashes, WAL data will accumulate in the slot.  
   - Ensure your pipeline is continuously running and check logs for connectivity or authentication errors.

For an excellent deep dive into this topic, check out our blog post: [Overcoming Pitfalls of Postgres Logical Decoding](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it).

### How are Postgres data types mapped to ClickHouse? {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgres aims to map Postgres data types as natively as possible on the ClickHouse side. This document provides a comprehensive list of each data type and its mapping: [Data Type Matrix](https://docs.peerdb.io/datatypes/datatype-matrix).

### Can I define my own data type mapping while replicating data from Postgres to ClickHouse? {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

Currently, we don't support defining custom data type mappings as part of the pipe. However, note that the default data type mapping used by ClickPipes is highly native. Most column types in Postgres are replicated as closely as possible to their native equivalents on ClickHouse. Integer array types in Postgres, for instance, are replicated as integer array types on ClickHouse.

### How are JSON and JSONB columns replicated from Postgres? {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSON and JSONB columns are replicated as String type in ClickHouse. Since ClickHouse supports a native [JSON type](/sql-reference/data-types/newjson), you can create a materialized view over the ClickPipes tables to perform the translation if needed. Alternatively, you can use [JSON functions](/sql-reference/functions/json-functions) directly on the String column(s). We are actively working on a feature that replicates JSON and JSONB columns directly to the JSON type in ClickHouse. This feature is expected to be available in a few months.

### What happens to inserts when a mirror is paused? {#what-happens-to-inserts-when-a-mirror-is-paused}

When you pause the mirror, the messages are queued up in the replication slot on the source Postgres, ensuring they are buffered and not lost. However, pausing and resuming the mirror will re-establish the connection, which could take some time depending on the source.

During this process, both the sync (pulling data from Postgres and streaming it into the ClickHouse raw table) and normalize (from raw table to target table) operations are aborted. However, they retain the state required to resume durably. 

- For sync, if it is canceled mid-way, the confirmed_flush_lsn in Postgres is not advanced, so the next sync will start from the same position as the aborted one, ensuring data consistency.
- For normalize, the ReplacingMergeTree insert order handles deduplication.

In summary, while sync and normalize processes are terminated during a pause, it is safe to do so as they can resume without data loss or inconsistency.

### Can ClickPipe creation be automated or done via API or CLI? {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

A Postgres ClickPipe can also be created and managed via [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) endpoints. This feature is in beta, and the API reference can be found [here](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta). We are actively working on Terraform support to create Postgres ClickPipes as well.

### How do I speed up my initial load? {#how-do-i-speed-up-my-initial-load}

You cannot speed up an already running initial load. However, you can optimize future initial loads by adjusting certain settings. By default, the settings are configured with 4 parallel threads and a snapshot number of rows per partition set to 100,000. These are advanced settings and are generally sufficient for most use cases.

For Postgres versions 13 or lower, CTID range scans are slower, and these settings become more critical. In such cases, consider the following process to improve performance:

1. **Drop the existing pipe**: This is necessary to apply new settings.
2. **Delete destination tables on ClickHouse**: Ensure that the tables created by the previous pipe are removed.
3. **Create a new pipe with optimized settings**: Typically, increase the snapshot number of rows per partition to between 1 million and 10 million, depending on your specific requirements and the load your Postgres instance can handle.

These adjustments should significantly enhance the performance of the initial load, especially for older Postgres versions. If you are using Postgres 14 or later, these settings are less impactful due to improved support for CTID range scans.

### How should I scope my publications when setting up replication? {#how-should-i-scope-my-publications-when-setting-up-replication}

You can let ClickPipes manage your publications (requires additional permissions) or create them yourself. With ClickPipes-managed publications, we automatically handle table additions and removals as you edit the pipe. If self-managing, carefully scope your publications to only include tables you need to replicate - including unnecessary tables will slow down Postgres WAL decoding.

If you include any table in your publication, make sure it has either a primary key or `REPLICA IDENTITY FULL`. If you have tables without a primary key, creating a publication for all tables will cause DELETE and UPDATE operations to fail on those tables.

To identify tables without primary keys in your database, you can use this query:
```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE
    (table_catalog, table_schema, table_name) NOT IN (
        SELECT table_catalog, table_schema, table_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'PRIMARY KEY') AND
    table_schema NOT IN ('information_schema', 'pg_catalog', 'pgq', 'londiste');
```

You have two options when dealing with tables without primary keys:

1. **Exclude tables without primary keys from ClickPipes**:
   Create the publication with only the tables that have a primary key:
   ```sql
   CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
   ```

2. **Include tables without primary keys in ClickPipes**:
   If you want to include tables without a primary key, you need to alter their replica identity to `FULL`. This ensures that UPDATE and DELETE operations work correctly:
   ```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
   ```

:::tip
If you're creating a publication manually instead of letting ClickPipes manage it, we don't recommend creating a publication `FOR ALL TABLES`, this leads to more traffic from Postgres to ClickPipes (to sending changes for other tables not in the pipe) and reduces overall efficiency.

For manually created publications, please add any tables you want to the publication before adding them to the pipe.
::: 

## Recommended `max_slot_wal_keep_size` settings {#recommended-max_slot_wal_keep_size-settings}

- **At Minimum:** Set [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) to retain at least **two days' worth** of WAL data.
- **For Large Databases (High Transaction Volume):** Retain at least **2-3 times** the peak WAL generation per day.
- **For Storage-Constrained Environments:** Tune this conservatively to **avoid disk exhaustion** while ensuring replication stability.

### How to calculate the right value {#how-to-calculate-the-right-value}

To determine the right setting, measure the WAL generation rate:

#### For PostgreSQL 10+ {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

#### For PostgreSQL 9.6 and below: {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* Run the above query at different times of the day, especially during highly transactional periods.
* Calculate how much WAL is generated per 24-hour period.
* Multiply that number by 2 or 3 to provide sufficient retention.
* Set `max_slot_wal_keep_size` to the resulting value in MB or GB.

#### Example {#example}

If your database generates 100 GB of WAL per day, set:

```sql
max_slot_wal_keep_size = 200GB
```

### My replication slot is invalidated. What should I do? {#my-replication-slot-is-invalidated-what-should-i-do}

The only way to recover ClickPipe is by triggering a resync, which you can do in the Settings page.

The most common cause of replication slot invalidation is a low `max_slot_wal_keep_size` setting on your PostgreSQL database (e.g., a few gigabytes). We recommend increasing this value. [Refer to this section](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings) on tuning `max_slot_wal_keep_size`. Ideally, this should be set to at least 200GB to prevent replication slot invalidation.

In rare cases, we have seen this issue occur even when `max_slot_wal_keep_size` is not configured. This could be due to an intricate and rare bug in PostgreSQL, although the cause remains unclear.

## I am seeing out of memory (OOMs) on ClickHouse while my ClickPipe is ingesting data. Can you help? {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

One common reason for OOMs on ClickHouse is that your service is undersized. This means that your current service configuration doesn't have enough resources (e.g., memory or CPU) to handle the ingestion load effectively. We strongly recommend scaling up the service to meet the demands of your ClickPipe data ingestion.

Another reason we've observed is the presence of downstream Materialized Views with potentially unoptimized joins:

- A common optimization technique for JOINs is if you have a `LEFT JOIN` where the right-hand side table is very large. In this case, rewrite the query to use a `RIGHT JOIN` and move the larger table to the left-hand side. This allows the query planner to be more memory efficient.

- Another optimization for JOINs is to explicitly filter the tables through `subqueries` or `CTEs` and then perform the `JOIN` across these subqueries. This provides the planner with hints on how to efficiently filter rows and perform the `JOIN`.

## I am seeing an `invalid snapshot identifier` during the initial load. What should I do? {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

The `invalid snapshot identifier` error occurs when there is a connection drop between ClickPipes and your Postgres database. This can happen due to gateway timeouts, database restarts, or other transient issues.

It is recommended that you do not carry out any disruptive operations like upgrades or restarts on your Postgres database while Initial Load is in progress and ensure that the network connection to your database is stable. 

To resolve this issue, you can trigger a resync from the ClickPipes UI. This will restart the initial load process from the beginning.

## What happens if I drop a publication in Postgres? {#what-happens-if-i-drop-a-publication-in-postgres}

Dropping a publication in Postgres will break your ClickPipe connection since the publication is required for the ClickPipe to pull changes from the source. When this happens, you'll typically receive an error alert indicating that the publication no longer exists.

To recover your ClickPipe after dropping a publication:

1. Create a new publication with the same name and required tables in Postgres
2. Click the 'Resync tables' button in the Settings tab of your ClickPipe

This resync is necessary because the recreated publication will have a different Object Identifier (OID) in Postgres, even if it has the same name. The resync process refreshes your destination tables and restores the connection.

Alternatively, you can create an entirely new pipe if preferred.

Note that if you're working with partitioned tables, make sure to create your publication with the appropriate settings:

```sql
CREATE PUBLICATION clickpipes_publication 
FOR TABLE <...>, <...>  
WITH (publish_via_partition_root = true);
```

## What if I am seeing `Unexpected Datatype` errors or `Cannot parse type XX ...` {#what-if-i-am-seeing-unexpected-datatype-errors}

This error typically occurs when the source Postgres database has a datatype which cannot be mapped during ingestion.
For more specific issue, refer to the possibilities below.

### `Cannot parse type Decimal(XX, YY), expected non-empty binary data with size equal to or less than ...` {#cannot-parse-type-decimal-expected-non-empty-binary-data-with-size-equal-to-or-less-than}

Postgres `NUMERIC`s have really high precision (up to 131072 digits before the decimal point; up to 16383 digits after the decimal point) and ClickHouse Decimal type allows maximum of (76 digits, 39 scale).
The system assumes that _usually_ the size would not get that high and does an optimistic cast for the same as source table can have large number of rows or the row can come in during the CDC phase.

The current workaround would be to map the NUMERIC type to string on ClickHouse. To enable this please raise a ticket with the support team and this will be enabled for your ClickPipes.
