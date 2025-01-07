---
sidebar_label: ClickPipes for Postgres FAQ
description: Frequently asked questions about ClickPipes for Postgres.
slug: /en/integrations/clickpipes/postgres/faq
sidebar_position: 2
---

# ClickPipes for Postgres FAQ

### How does idling affect my Postgres CDC Clickpipe?

If your ClickHouse Cloud service is idling, your Postgres CDC clickpipe will continue to sync data, your service will wake-up at the next sync interval to handle the incoming data. Once the sync is finished and the idle period is reached, your service will go back to idling.

As an example, if your sync interval is set to 30 mins and your service idle time is set to 10 mins, Your service will wake-up every 30 mins and be active for 10 mins, then go back to idling.

### How are TOAST columns handled in ClickPipes for Postgres?

Please refer to the [Handling TOAST Columns](./toast) page for more information.

### How are generated columns handled in ClickPipes for Postgres?

Please refer to the [Postgres Generated Columns: Gotchas and Best Practices](./generated_columns) page for more information.

### Do tables need to have primary keys to be part of Postgres CDC?

Yes, for CDC, tables must have either a primary key or a [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY). The REPLICA IDENTITY can be set to FULL or configured to use a unique index.

### Do you support partitioned tables as part of Postgres CDC?

Yes, partitioned tables are supported out of the box, as long as they have a PRIMARY KEY or REPLICA IDENTITY defined. The PRIMARY KEY and REPLICA IDENTITY must be present on both the parent table and its partitions. You can read more about it [here](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables).

### Can I connect Postgres databases that don't have a public IP or are in private networks?

Yes! ClickPipes for Postgres offers two ways to connect to databases in private networks:

1. **SSH Tunneling**
   - Works well for most use cases
   - See the setup instructions [here](https://clickhouse.com/docs/en/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)
   - Works across all regions

2. **AWS PrivateLink**
   - Available in three AWS regions:
     - us-east-1
     - us-east-2 
     - eu-central-1
   - For detailed setup instructions, see our [PrivateLink documentation](https://clickhouse.com/docs/knowledgebase/aws-privatelink-setup-for-clickpipes#requirements)
   - For regions where PrivateLink is not available, please use SSH tunneling

### How do you handle UPDATEs and DELETEs?

ClickPipes for Postgres captures both INSERTs and UPDATEs from Postgres as new rows with different versions (using the _peerdb_version column) in ClickHouse. The ReplacingMergeTree table engine periodically performs deduplication in the background based on the ordering key (ORDER BY columns), retaining only the row with the latest _peerdb_version.

DELETEs from Postgres are propagated as new rows marked as deleted (using the _peerdb_is_deleted column). Since the deduplication process is asynchronous, you might temporarily see duplicates. To address this, you need to handle deduplication at the query layer.

For more details, refer to:

* [ReplacingMergeTree table engine best practices](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres-to-ClickHouse CDC internals blog](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### Do you support schema changes?

Please refer to the [ClickPipes for Postgres: Schema Changes Propagation Support](./schema-changes) page for more information.

### What are the costs for ClickPipes for Postgres CDC?

During the preview, ClickPipes is free of cost. Post-GA, pricing is still to be determined. The goal is to make the pricing reasonable and highly competitive compared to external ETL tools.

### My replication slot size is growing or not decreasing; what might be the issue?

If you're noticing that the size of your Postgres replication slot keeps increasing or isn’t coming back down, it usually means that **WAL (Write-Ahead Log) records aren’t being consumed (or “replayed”) quickly enough** by your CDC pipeline or replication process. Below are the most common causes and how you can address them.

1. **Sudden Spikes in Database Activity**  
   - Large batch updates, bulk inserts, or significant schema changes can quickly generate a lot of WAL data.  
   - The replication slot will hold these WAL records until they are consumed, causing a temporary spike in size.

2. **Long-Running Transactions**  
   - An open transaction forces Postgres to keep all WAL segments generated since the transaction began, which can dramatically increase slot size.  
   - Set `session_timeout` and `idle_in_transaction_session_timeout` to reasonable values to prevent transactions from staying open indefinitely:
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
   - Consider using autovacuum tuning parameters or scheduling manual VACUUMs during off-peak hours.

5. **Replication Consumer Not Actively Reading the Slot**  
   - If your CDC pipeline (e.g., ClickPipes) or another replication consumer stops, pauses, or crashes, WAL data will accumulate in the slot.  
   - Ensure your pipeline is continuously running and check logs for connectivity or authentication errors.
