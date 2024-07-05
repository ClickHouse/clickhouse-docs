---
sidebar_label: Migrating data
sidebar_position: 30
title: Migrating data
slug: /en/migrations/postgresql/migrating
description: Migrating data from PostgreSQL to ClickHouse
keywords: [migrate, migration, migrating, data, etl, elt, postgresql, postgres]
---

Migrating data between ClickHouse and Postgres falls into two primary workload types:

- Initial bulk load with periodic updates - An initial dataset must be migrated along with periodic updates at set intervals e.g. daily. Updates here are handled by resending rows that have changed - identified by either a column that can be used for comparisons (e.g., a date) or the XMIN value. Deletes are handled with a complete periodic reload of the dataset.
- Real time replication or CDC -  An initial dataset must be migrated. Changes to this dataset must be reflected in ClickHouse in near-real time with only a delay of several seconds acceptable. This is effectively a Change Data Capture (CDC) process where tables in Postgres must be synchronized with ClickHouse i.e. Inserts, updates and deletes in the Postgres table must be applied to an equivalent table in ClickHouse.

## Initial bulk load with periodic updates

This workload represents the simpler of the above workloads since changes can be periodically applied. An initial bulk load of the dataset can be achieved via:

1. **Table functions** - Using Postgres table functions in ClickHouse to SELECT data from Postgres and INSERT it into a ClickHouse table. Relevant to **bulk loads** up to datasets of several hundred GB.
2. **Exports** - Exporting to intermediary formats such as CSV or SQL script file. These files can then be loaded into ClickHouse from either the client via the `INSERT FROM INFILE` clause or using object storage and their associated functions e.g. s3, gcs.

Incremental loads can, in turn, be scheduled. If the Postgres table only receives inserts and an incrementing id or timestamp exists, users can use the above table function approach to load increments, i.e. a WHERE clause can be applied to the SELECT.  This approach may also be used to support updates if these are guaranteed to update the same column. Supporting deletes will, however, require a complete reload, which may be difficult to achieve as the table grows.

We demonstrate an initial load and incremental load using the `CreationDate` (we assume this gets updated if rows are updated).


```sql
-- initial load
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

:::note
ClickHouse will push down simple `WHERE` clauses such as =, !=, >, >=, <, <=, and IN to the PostgreSQL server. Incremental loads can thus be made more efficient by ensuring an index exists on columns used to identify the change set.
:::

:::note
A possible method to detect UPDATE operations when using query replication is using the [XMIN system](https://www.postgresql.org/docs/9.1/ddl-system-columns.html) column (transaction IDs) as a watermark - a change in this column is indicative of a change and therefore can be applied to the destination table. Users employing this approach should be aware that [XMIN values can wrap around](https://cloud.google.com/sql/docs/postgres/recommender-high-transactionid-utilization) and comparisons require a full table scan, making tracking changes more complex. For further details on this approach, see "Change Data Capture (CDC)".
:::

## Real time replication or CDC

Change Data Capture (CDC) is the process by which tables are kept in sync between two databases. This is significantly more complex if updates and deletes are to be handled in near real-time. Several solutions currently exist:

1. **Build your own - **This can be achieved with **Debezium + Kafka** - Debezium offers the ability to capture all changes on a Postgres table, forwarding these as events to a Kafka queue. These events can then be consumed by either the ClickHouse Kafka connector or[ Clickpipes in ClickHouse Cloud](https://clickhouse.com/cloud/clickpipes), for insertion into ClickHouse. This represents Change Data Capture (CDC) as Debezium will not only perform an initial copy of the tables but also ensure all subsequent updates, deletes, and inserts are detected on Postgres, resulting in the downstream events. This requires careful configuration of both Postgres, Debezium, and ClickHouse. Examples can be found[ here](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2).
2. **PeerDB** - PeerDB offers an open code specialist Postgres CDC solution users can run self-managed or through a SaaS solution, which has shown to perform well at scale with Postgres and ClickHouse. The solution focuses on low-level optimizations to achieve high-performance transfer data and reliability guarantees between Postgres and ClickHouse. It supports both online and offline loads.

For the examples below, we assume an initial bulk load only, focusing on data exploration and easy iteration toward production schemas usable for other approaches.

We discuss Change Capture Control in greater detail [here](/docs/en/migrations/postgresql/cdc).
