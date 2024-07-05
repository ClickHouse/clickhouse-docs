---
sidebar_label: PostgreSQL
sidebar_position: 20
title: Migrating from PostgreSQL to ClickHouse
slug: /en/migrations/postgresql
description: Migrating from PostgreSQL to ClickHouse
keywords: [migrate, migration, migrating, data, etl, elt, postgresql, postgres]
---

# Migrating from PostgreSQL to ClickHouse

## Why?

**TLDR:** Because ClickHouse is designed for fast analytics, specifically `GROUP BY` queries, as an OLAP database whereas Postgres is an OLTP database designed for transactional workloads.

**“Ok I want to know more…”**

OLTP, or _online transactional processing_ databases, are designed to manage _transactional_ information.

The primary objective of these databases, for which Postgres is the classic example,  is to ensure that an engineer can submit a block of updates to the database and be sure that it will — in its entirety — either succeed or fail.

These types of _transactional_ guarantees with ACID properties are the main focus of OLTP databases and a huge strength of Postgres.

Given these requirements, OLTP databases typically hit performance limitations when used for analytical queries over large datasets.

OLAP, or _online analytical processing_ databases, are designed to meet those needs — to manage _analytical_ workloads.

The primary objective of these databases is to ensure that engineers can efficiently query and aggregate over vast datasets. _Real-time_ OLAP systems like ClickHouse allow this analysis to happen as data is ingested in real time.

**“Ok, I want to know even more”**

[https://clickhouse.com/blog/adding-real-time-analytics-to-a-supabase-application](https://clickhouse.com/blog/adding-real-time-analytics-to-a-supabase-application)

To see the potential performance differences between ClickHouse and Postgres on analytical queries, see “Rewriting Postgres Queries in ClickHouse”.

As an example of the performance difference in aggregation queries between ClickHouse and Postgres, the following example uses the [Stack Overflow dataset](/docs/en/getting-started/example-datasets/stackoverflow) to compute which users have the highest cumulative score for their questions:

:::note
Counts here will slightly differ as the Postgres data only contains rows that satisfy the referential integrity of the foreign keys. ClickHouse imposes no such constraints and thus has the full dataset e.g. inc. anon users.
:::

```sql
--Postgres
SELECT OwnerDisplayName, SUM(Score) AS score
FROM public.posts
WHERE OwnerDisplayName != ''
GROUP BY OwnerDisplayName
ORDER BY score DESC
LIMIT 5;

 ownerdisplayname | score
------------------+--------
 Jon Skeet    	  | 102449
 Greg Hewgill 	  |  66203
 e-satis      	  |  44128
 Marc Gravell 	  |  39529
 nickf        	  |  33746
(5 rows)

Time: 107684.999 ms (01:47.685)

--Clickhouse
SELECT
	OwnerDisplayName,
	sum(Score) AS score
FROM stackoverflow.posts
WHERE OwnerDisplayName != ''
GROUP BY OwnerDisplayName
ORDER BY score DESC
LIMIT 5

┌─OwnerDisplayName─┬──score─┐
│ Jon Skeet    	   │ 102449 │
│ anon         	   │  76054 │
│ Greg Hewgill 	   │  66203 │
│ user330315   	   │  50478 │
│ e-satis      	   │  44128 │
└──────────────────┴────────┘

5 rows in set. Elapsed: 0.358 sec. Processed 59.82 million rows, 281.99 MB (167.24 million rows/s., 788.35 MB/s.)
Peak memory usage: 503.26 MiB.
```

## Dataset

As an example dataset to show a typical migration from Postgres to ClickHouse, we use the Stack Overflow dataset documented[ here](/docs/en/getting-started/example-datasets/stackoverflow). This contains every post, vote, user, comment, and badge that has occurred on Stack Overflow from 2008 to Apr 2024. The Postgres schema for this data is shown below:


<img src={require('./images/stackoverflow_postgres.png').default} class="image" alt="Stack Overflow in Postgres" style={{width: '600px', marginBottom: '20px', textAlign: 'left'}}/>
