---
sidebar_label: Handling joins
sidebar_position: 100
title: Handling joins
slug: /en/migrations/postgresql/joins
description: Handling joins
keywords: [migrate, migration, migrating, data, etl, elt, postgresql, postgres, concepts, mappings, data types, joins]
---

Users migrating from Postgres will be used to a database that is heavily optimized for workloads using JOINs. While ClickHouse has[ full JOIN support](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1), with a wide selection of join algorithms, join optimization often has to be performed manually - although recent developments with the new analyzer mean this is[ improving with each release](https://clickhouse.com/blog/clickhouse-release-24-05#cross-join-improvements).

## General guidelines

Users should aim to follow the recommendations listed below:

* For optimal performance, users should aim to reduce the number of JOINs in queries, especially for real-time analytical workloads where ms performance is required. Aim for a maximum of 3-4 joins in a query. We detail a number of changes to minimize joins in the [data modeling section](/docs/en/data-modeling/schema-design), including denormalization, dictionaries, and materialized views.
* Currently, ClickHouse does not reorder joins. Always ensure the smallest table is on the right-hand side of the Join. This will be held in memory for most join algorithms and will ensure the lowest memory overhead for the query.
* If your query requires a direct join i.e. a `LEFT ANY JOIN` - as shown below, we recommend using Dictionaries where possible. We detail this approach for the Stack Overflow dataset in the data modeling guide [here](/docs/en/dictionary).

<img src={require('./images/left_any.png').default} class="image" alt="Left any join" style={{width: '25%', marginBottom: '20px', textAlign: 'left'}}/>

* If performing inner joins, it is often more optimal to write these as sub-queries using the IN clause. Consider the following queries, which are functionally equivalent. Both find posts the number of posts that don’t mention ClickHouse in the question but do in the comments.

  ```sql
  SELECT count()
  FROM stackoverflow.posts AS p
  ANY INNER JOIN stackoverflow.comments AS c ON p.Id = c.PostId
  WHERE (p.Title != '') AND (p.Title NOT ILIKE '%clickhouse%') AND (p.Body NOT ILIKE '%clickhouse%') AND (c.Text ILIKE '%clickhouse%')

  ┌─count()─┐
  │  	86    │
  └─────────┘

  1 row in set. Elapsed: 8.209 sec. Processed 150.20 million rows, 56.05 GB (18.30 million rows/s., 6.83 GB/s.)
  Peak memory usage: 1.23 GiB.
  ```

:::note
Note we use an `ANY INNER JOIN` vs just an `INNER` join as we don’t want the cartesian product i.e. we want only one match for each post.
:::

  This join can be rewritten using a subquery, improving performance significantly:

  ```sql
  SELECT count()
  FROM stackoverflow.posts
  WHERE (Title != '') AND (Title NOT ILIKE '%clickhouse%') AND (Body NOT ILIKE '%clickhouse%') AND (Id IN (
	SELECT PostId
	FROM stackoverflow.comments
	WHERE Text ILIKE '%clickhouse%'
  ))
  ┌─count()─┐
  │  	86    │
  └─────────┘

  1 row in set. Elapsed: 2.284 sec. Processed 150.20 million rows, 16.61 GB (65.76 million rows/s., 7.27 GB/s.)
  Peak memory usage: 323.52 MiB.
  ```

* Although ClickHouse makes attempts to push down conditions to all join clauses and subqueries, we recommend users always manually apply conditions to all sub-clauses where possible - thus minimizing the size of the data to JOIN. Consider the following example below, where we want to compute the number of Upvotes for Java -related posts since 2020.

  A naive query, with the larger table on the left side, completes in 56s:

  ```sql
  SELECT countIf(VoteTypeId = 2) AS upvotes
  FROM stackoverflow.posts AS p
  INNER JOIN stackoverflow.votes AS v ON p.Id = v.PostId
  WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

  ┌─upvotes─┐
  │  261915 │
  └─────────┘

  1 row in set. Elapsed: 56.642 sec. Processed 252.30 million rows, 1.62 GB (4.45 million rows/s., 28.60 MB/s.)
  ```

  Re-ordering this join improves performance dramatically to 1.5s.

  ```sql
  SELECT countIf(VoteTypeId = 2) AS upvotes
  FROM stackoverflow.votes AS v
  INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
  WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

  ┌─upvotes─┐
  │  261915 │
  └─────────┘

  1 row in set. Elapsed: 1.519 sec. Processed 252.30 million rows, 1.62 GB (166.06 million rows/s., 1.07 GB/s.)
  ```

  Adding a filter to the right side table improves performance even further to 0.5s.

  ```sql
  SELECT countIf(VoteTypeId = 2) AS upvotes
  FROM stackoverflow.votes AS v
  INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
  WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01') AND (v.CreationDate >= '2020-01-01')

  ┌─upvotes─┐
  │  261915 │
  └─────────┘

  1 row in set. Elapsed: 0.597 sec. Processed 81.14 million rows, 1.31 GB (135.82 million rows/s., 2.19 GB/s.)
  Peak memory usage: 249.42 MiB.
  ```

 	This query can be improved even more by moving the INNER join to a subquery, as noted earlier, maintaining the filter on both the outer and inner queries.

  ```sql
  SELECT count() AS upvotes
  FROM stackoverflow.votes
  WHERE (VoteTypeId = 2) AND (PostId IN (
  	SELECT Id
  	FROM stackoverflow.posts
  	WHERE (CreationDate >= '2020-01-01') AND has(arrayFilter(t -> (t != ''), splitByChar('|', Tags)), 'java')
  ))

  ┌─upvotes─┐
  │  261915 │
  └─────────┘

  1 row in set. Elapsed: 0.383 sec. Processed 99.64 million rows, 804.55 MB (259.85 million rows/s., 2.10 GB/s.)
  Peak memory usage: 250.66 MiB.
  ```

## Choosing a join algorithm

ClickHouse supports a number of [join algorithms](/blog/clickhouse-fully-supports-joins-part1). These algorithms typically trade memory usage for performance. The following provides an overview of the ClickHouse join algorithms based on their relative memory consumption and execution time:

<img src={require('./images/join_algorithms.png').default} class="image" alt="Join algorithms" style={{width: '50%', marginBottom: '20px', textAlign: 'left'}}/>

These algorithms dictate the manner in which a join query is planned and executed. By default, ClickHouse uses the direct or the hash join algorithm based on the used join type and strictness and engine of the joined tables. Alternatively, ClickHouse can be configured to adaptively choose and dynamically change the join algorithm to use at runtime, depending on resource availability and usage: When [`join_algorithm=auto`](/docs/en/operations/settings/settings#join_algorithm) ClickHouse tries the hash join algorithm first, and if that algorithm’s memory limit is violated, the algorithm is switched on the fly to partial merge join. You can observe which algorithm was chosen via trace logging. ClickHouse also allows users to specify the desired join algorithm themselves via the [`join_algorithm`](/docs/en/operations/settings/settings#join_algorithm) setting. For example:


```sql
SELECT count() AS upvotes
FROM stackoverflow.votes
WHERE (VoteTypeId = 2) AND (PostId IN (
    SELECT Id
    FROM stackoverflow.posts
    WHERE (CreationDate >= '2020-01-01') AND has(arrayFilter(t -> (t != ''), splitByChar('|', Tags)), 'java')
))
SETTINGS join_algorithm = 'parallel_hash'

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 0.201 sec. Processed 74.66 million rows, 698.97 MB (371.66 million rows/s., 3.48 GB/s.)
Peak memory usage: 566.57 MiB.
```

The supported JOIN types for each join algorithm are shown below and should be considered prior to optimization:
