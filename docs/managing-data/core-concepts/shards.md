---
slug: /shards
title: Table shards
description: What are table shards in ClickHouse
keywords: [shard, shards, sharding]
---

import image_01 from '@site/static/images/managing-data/core-concepts/shards_01.png'
import image_02 from '@site/static/images/managing-data/core-concepts/shards_02.png'
import image_03 from '@site/static/images/managing-data/core-concepts/shards_03.png'
import image_04 from '@site/static/images/managing-data/core-concepts/shards_04.png'

## What are table shards in ClickHouse? {#what-are-table-shards-in-clickhouse}

> This topic doesn’t apply to ClickHouse Cloud, where [Parallel Replicas](/docs/deployment-guides/parallel-replicas) serve the same purpose.

<br/>

In ClickHouse OSS, sharding is used when ① the data is too large for a single server or ② a single server is too slow for processing. The next figure illustrates case ①, where the [uk_price_paid_simple](/parts) table exceeds a single machine’s capacity:  

<img src={image_01} alt='SHARDS' class='image' />
<br/>

In such a case the data can be split over multiple ClickHouse servers in the form of table shards:

<img src={image_02} alt='SHARDS' class='image' />
<br/>

Each shard holds a subset of the data and functions as a regular ClickHouse table that can be queried independently. However, queries will only process that subset, which may be valid depending on data distribution. Typically, a [distributed table](/docs/engines/table-engines/special/distributed) (often per server) provides a unified view of the full dataset. It doesn’t store data itself but forwards **SELECT** queries to all shards, assembles the results, and routes **INSERTS** to distribute data evenly.

## Distributed table creation {#distributed-table-creation}

To illustrate **SELECT** query forwarding and **INSERT** routing, we consider the [What are table parts](/parts) example table split across two shards on two ClickHouse servers. First, we show the DDL statement for creating a corresponding **Distributed table** for this setup:


```sql
CREATE TABLE uk.uk_price_paid_simple_dist ON CLUSTER test_cluster
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = Distributed('test_cluster', 'uk', 'uk_price_paid_simple', rand())
```

The `ON CLUSTER` clause makes the DDL statement a [distributed DDL statement](/docs/sql-reference/distributed-ddl), instructing ClickHouse to create the table on all servers listed in the `test_cluster` [cluster definition](/docs/architecture/horizontal-scaling#replication-and-sharding-configuration). Distributed DDL requires an additional [Keeper](https://clickhouse.com/clickhouse/keeper) component in the [cluster architecture](/docs/architecture/horizontal-scaling#architecture-diagram).

For the [distributed engine parameters](/docs/engines/table-engines/special/distributed#distributed-parameters), we specify the cluster name (`test_cluster`), the database name (`uk`) for the sharded target table, the sharded target table's name (`uk_price_paid_simple`), and the **sharding key** for INSERT routing. In this example, we use the [rand]((/docs/sql-reference/functions/random-functions#rand)) function to randomly assign rows to shards. However, any expression—even complex ones—can be used as a sharding key, depending on the use case. The next section illustrates how INSERT routing works.

## INSERT routing {#insert-routing}

The diagram below illustrates how INSERTs into a distributed table are processed in ClickHouse:

<img src={image_03} alt='SHARDS' class='image' />
<br/>

① An INSERT (with a single row) targeting the distributed table is sent to a ClickHouse server hosting the table, either directly or via a load balancer.

② For each row from the INSERT (just one in our example), ClickHouse evaluates the sharding key (here, rand()), takes the result modulo the number of shard servers, and uses that as the target server ID (IDs start from 0 and increment by 1). The row is then forwarded and ③ inserted into the corresponding server's table shard.

The next section explains how SELECT forwarding works.

## SELECT forwarding {#insert-routing}

This diagram shows how SELECT queries are processed with a distributed table in ClickHouse:

<img src={image_04} alt='SHARDS' class='image' />
<br/>

① A SELECT aggregation query targeting the distributed table is sent to corresponding ClickHouse server, either directly or via a load balancer.

② The Distributed table forwards the query to all servers hosting shards of the target table, where each ClickHouse server computes its local aggregation result **in parallel**.


Then, the ClickHouse server hosting the initially targeted distributed table ③ collects all local results, ④ merges them into the final global result, and ⑤ returns it to the query sender.

## Where to find more information {#where-to-find-more-information}

For more details beyond this high-level introduction to table shards, check out our [deployment and scaling guide](/docs/architecture/horizontal-scaling). 

We also highly recommend this tutorial video for a deeper dive into ClickHouse shards:

<iframe width="768" height="432" src="https://www.youtube.com/embed/vBjCJtw_Ei0?si=WqopTrnti6usCMRs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

