---
slug: /en/migrations/postgresql/overview
title: Migrating from PostgreSQL to ClickHouse
description: A guide to migrating from PostgreSQL to ClickHouse
keywords: [postgres, postgresql, migrate, migration]
---

## Why use ClickHouse over Postgres?

TLDR: Because ClickHouse is designed for fast analytics, specifically `GROUP BY` queries, as an OLAP database whereas Postgres is an OLTP database designed for transactional workloads.

OLTP, or online transactional processing databases, are designed to manage transactional information.The primary objective of these databases, for which Postgres is the classic example,  is to ensure that an engineer can submit a block of updates to the database and be sure that it will — in its entirety — either succeed or fail. These types of transactional guarantees with ACID properties are the main focus of OLTP databases and a huge strength of Postgres. Given these requirements, OLTP databases typically hit performance limitations when used for analytical queries over large datasets.

OLAP, or online analytical processing databases, are designed to meet those needs — to manage analytical workloads. The primary objective of these databases is to ensure that engineers can efficiently query and aggregate over vast datasets. Real-time OLAP systems like ClickHouse allow this analysis to happen as data is ingested in real time.

For a more advanced comparison, please see [this blog post](https://clickhouse.com/blog/adding-real-time-analytics-to-a-supabase-application).

To see the potential performance differences between ClickHouse and Postgres on analytical queries, see [Rewriting PostgreSQL Queries in ClickHouse](/en/migrations/postgresql/rewriting-queries).

---

**[Start the PostgreSQL migration guide here](/en/migrations/postgresql/dataset).**
