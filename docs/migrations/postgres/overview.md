---
slug: /migrations/postgresql/overview
title: 'Migrating from PostgreSQL to ClickHouse'
description: 'A guide to migrating from PostgreSQL to ClickHouse'
keywords: ['postgres', 'postgresql', 'migrate', 'migration']
doc_type: overview
---

## Why use ClickHouse over Postgres? {#why-use-clickhouse-over-postgres}

TLDR: Because ClickHouse is designed for fast analytics, specifically `GROUP BY` queries, as an OLAP database whereas Postgres is an OLTP database designed for transactional workloads.

OLTP, or online transactional processing databases, are designed to manage transactional information.The primary objective of these databases, for which Postgres is the classic example,  is to ensure that an engineer can submit a block of updates to the database and be sure that it will — in its entirety — either succeed or fail. These types of transactional guarantees with ACID properties are the main focus of OLTP databases and a huge strength of Postgres. Given these requirements, OLTP databases typically hit performance limitations when used for analytical queries over large datasets.

OLAP, or online analytical processing databases, are designed to meet those needs — to manage analytical workloads. The primary objective of these databases is to ensure that engineers can efficiently query and aggregate over vast datasets. Real-time OLAP systems like ClickHouse allow this analysis to happen as data is ingested in real time.

See [here](/migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts) for a more in-depth comparison of ClickHouse and PostgreSQL.

To see the potential performance differences between ClickHouse and Postgres on analytical queries, see [Rewriting PostgreSQL Queries in ClickHouse](/migrations/postgresql/rewriting-queries).

## Migration strategies {#migration-strategies}

When migrating from PostgreSQL to ClickHouse, the right strategy depends on your use case, infrastructure, and data requirements. In general, real-time Change Data Capture (CDC) is the best approach for most modern use cases, while manual bulk loading followed by periodic updates is suitable for simpler scenarios or one-time migrations.

Below section describes the two main strategies for migration: **Real-Time CDC** and **Manual Bulk Load + Periodic Updates**.

### Real-time replication (CDC) {#real-time-replication-cdc}

Change Data Capture (CDC) is the process by which tables are kept in sync between two databases. It is the most efficient approach for most migration from PostgreSQL, but yet more complex as it handles insert, updates and deletes from PostgreSQL to ClickHouse in near real-time. It is ideal for use cases where real-time analytics are important. 

Real-time Change Data Capture (CDC) can be implemented in ClickHouse using [ClickPipes](/integrations/clickpipes/postgres/deduplication), if you're using ClickHouse Cloud, or [PeerDB](https://github.com/PeerDB-io/peerdb) in case you're running ClickHouse on-prem. Those solutions handles the complexities of real-time data synchronization, including initial load, by capturing inserts, updates, and deletes from PostgreSQL and replicating them in ClickHouse. This approach ensures that the data in ClickHouse is always fresh and accurate without requiring manual intervention.

### Manual bulk load + periodic updates {#manual-bulk-load-periodic-updates}

In some cases, a more straightforward approach like manual bulk loading followed by periodic updates may be sufficient. This strategy is ideal for one-time migrations or situations where real-time replication is not required. It involves loading data from PostgreSQL to ClickHouse in bulk, either through direct SQL `INSERT` commands or by exporting and importing CSV files. After the initial migration, you can periodically update the data in ClickHouse by syncing changes from PostgreSQL at regular intervals.

The bulk load process is simple and flexible but comes with the downside of no real-time updates. Once the initial data is in ClickHouse, updates won't be reflected immediately, so you must schedule periodic updates to sync the changes from PostgreSQL. This approach works well for less time-sensitive use cases, but it introduces a delay between when data changes in PostgreSQL and when those changes appear in ClickHouse.

### Which strategy to choose? {#which-strategy-to-choose}

For most applications that require fresh, up-to-date data in ClickHouse, real-time CDC through ClickPipes is the recommended approach. It provides continuous data syncing with minimal setup and maintenance. On the other hand, manual bulk loading with periodic updates is a viable option for simpler, one-off migrations or workloads where real-time updates aren't critical.

---

**[Start the PostgreSQL migration guide here](/migrations/postgresql/dataset).**
