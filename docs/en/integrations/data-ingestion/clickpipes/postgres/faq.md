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

ClickPipes for Postgres supports SSH tunneling (see the optional step [here](https://clickhouse.com/docs/en/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)) to connect to Postgres sources with private IPs. SSH tunneling works in most cases, and if it doesn't, we also support [AWS PrivateLink](https://clickhouse.com/docs/knowledgebase/aws-privatelink-setup-for-clickpipes).

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