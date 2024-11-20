---
date: 2024-04-17
title: Searching across nodes for tables with a wildcard
keywords: [search nodes, query_log, wildcard, table prefix]
---

# How do I search across the cluster for data with from different tables which have same prefix?


This is useful when there are tables that have similar naming conventions and similar columns but are not replicated. An example is searching the system database for entries in the query log tables.

The `query_log` table is not replicated, and only queries that are executed on a specific node get logged. Data may also roll to a different table For example, data may be inserted into `query_log_0`, `query_log_1`, etc. Since one node may roll at a different time than others, it is useful to try to find the data we're looking for in tables that are not exactly named the same.

In essence, we need to do something like this, but in ClickHouse syntax:

`SELECT column1, column2 FROM my_db.my_table_*`

For this, we can use the `clusterAllReplicas()` to search all the nodes and the `merge()` table function to be able to use a regex pattern to search the multiple tables.

The following example shows how to query all tables with the prefix `query_log`:

```
clickhouse-cloud :) SELECT 
  `event_time`, 
  `query_id`,
  `query`, 
  `type` 
FROM
  clusterAllReplicas(default,merge('system', '^query_log*'))
WHERE
  query ilike '%db1.table1%' and event_time > now() - toIntervalMinute(5);

SELECT
    event_time,
    query_id,
    query,
    type
FROM clusterAllReplicas(default, merge('system', '^query_log*'))
WHERE (query ILIKE '%db1.table1%') AND (event_time > (now() - toIntervalMinute(5)))

Query id: de95c13e-5759-436e-90d9-a12c1327889e

┌──────────event_time─┬─query_id─────────────────────────────┬─query──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type────────┐
│ 2024-02-08 00:15:20 │ d1dd0d6a-4337-4e58-bdd1-c2c827b6dfe2 │ /* ddl_entry=query-0000000428 */ CREATE TABLE db1.table1 UUID '781f25db-3cd1-47c6-a76e-701945a67485' (`id` Int32, `string_column` String) ENGINE = ReplicatedMergeTree ORDER BY id │ QueryStart  │
│ 2024-02-08 00:15:20 │ d1dd0d6a-4337-4e58-bdd1-c2c827b6dfe2 │ /* ddl_entry=query-0000000428 */ CREATE TABLE db1.table1 UUID '781f25db-3cd1-47c6-a76e-701945a67485' (`id` Int32, `string_column` String) ENGINE = ReplicatedMergeTree ORDER BY id │ QueryFinish │
└─────────────────────┴──────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴─────────────┘
┌──────────event_time─┬─query_id─────────────────────────────┬─query──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type────────┐
│ 2024-02-08 00:15:20 │ f0ca43b2-544e-4b94-a21d-0f05e777fa96 │ /* ddl_entry=query-0000000428 */ CREATE TABLE db1.table1 UUID '781f25db-3cd1-47c6-a76e-701945a67485' (`id` Int32, `string_column` String) ENGINE = ReplicatedMergeTree ORDER BY id │ QueryStart  │
│ 2024-02-08 00:15:20 │ f0ca43b2-544e-4b94-a21d-0f05e777fa96 │ /* ddl_entry=query-0000000428 */ CREATE TABLE db1.table1 UUID '781f25db-3cd1-47c6-a76e-701945a67485' (`id` Int32, `string_column` String) ENGINE = ReplicatedMergeTree ORDER BY id │ QueryFinish │
└─────────────────────┴──────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴─────────────┘
┌──────────event_time─┬─query_id─────────────────────────────┬─query──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type────────┐
│ 2024-02-08 00:15:20 │ 5cc0a508-7f64-460b-a5be-949ef1d1f2ca │ /* ddl_entry=query-0000000428 */ CREATE TABLE db1.table1 UUID '781f25db-3cd1-47c6-a76e-701945a67485' (`id` Int32, `string_column` String) ENGINE = ReplicatedMergeTree ORDER BY id │ QueryStart  │
│ 2024-02-08 00:15:20 │ 5cc0a508-7f64-460b-a5be-949ef1d1f2ca │ /* ddl_entry=query-0000000428 */ CREATE TABLE db1.table1 UUID '781f25db-3cd1-47c6-a76e-701945a67485' (`id` Int32, `string_column` String) ENGINE = ReplicatedMergeTree ORDER BY id │ QueryFinish │
│ 2024-02-08 00:15:20 │ d1e01cb0-a27c-44b2-829c-90fb2596c9c0 │ create table db1.table1
(
  id Int32,
  string_column String
)
engine = MergeTree
order by id                                                                                            │ QueryStart  │
│ 2024-02-08 00:15:20 │ d1e01cb0-a27c-44b2-829c-90fb2596c9c0 │ create table db1.table1
(
  id Int32,
  string_column String
)
engine = MergeTree
order by id                                                                                            │ QueryFinish │
│ 2024-02-08 00:15:27 │ 6c2c6c3f-173e-464f-bfa0-643089ca085e │ insert into db1.table1
values
                                                                                                                                                       │ QueryStart  │
│ 2024-02-08 00:15:27 │ 6c2c6c3f-173e-464f-bfa0-643089ca085e │ insert into db1.table1
values
                                                                                                                                                       │ QueryFinish │
└─────────────────────┴──────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴─────────────┘

10 rows in set. Elapsed: 0.046 sec. Processed 317.27 thousand rows, 33.57 MB (6.89 million rows/s., 729.43 MB/s.)
Peak memory usage: 67.04 MiB.
```

Note that the columns you select must exist on each of the tables being queried or you may encounter an error such as:

```
Received exception from server (version 24.0.2):
Code: 47. DB::Exception: Received from abc123.us-west-2.aws.clickhouse.cloud:9440. DB::Exception: Missing columns: 'hostname' while processing query: 'WITH 'query_log_0' AS _table
```

Alternatively, you can use the `EXCEPT` clause to exclude any columns that may not be present on different tables.

example:
```
SELECT * EXCEPT (used_privileges, missing_privileges)
FROM clusterAllReplicas(default, merge('system', 'query_log[\\_]*'))
WHERE (query_id = '31a93b8e-1149-4edd-a33d-f03f47a676cc') AND (event_time = '2024-10-21 12:49:04')
```

