---
sidebar_position: 3
sidebar_label: SELECT Queries
---

# SELECT Queries in ClickHouse

ClickHouse is a SQL database, and you query your data by writing the same type of `SELECT` queries you are already familiar with. For example:

```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
```

:::note
View the [SQL Reference](../sql-reference/statements/select/index.md) for more details on the syntax and available clauses and options.
:::

Notice the response comes back in a nice table format:

```response
┌─user_id─┬─message────────────────────────────────────────────┬───────────timestamp─┬──metric─┐
│     102 │ Insert a lot of rows per batch                     │ 2022-03-21 00:00:00 │ 1.41421 │
│     102 │ Sort your data based on your commonly-used queries │ 2022-03-22 00:00:00 │   2.718 │
│     101 │ Hello, ClickHouse!                                 │ 2022-03-22 14:04:09 │      -1 │
│     101 │ Granules are the smallest chunks of data read      │ 2022-03-22 14:04:14 │ 3.14159 │
└─────────┴────────────────────────────────────────────────────┴─────────────────────┴─────────┘

4 rows in set. Elapsed: 0.008 sec.
```

Add a `FORMAT` clause to specify one of the [many supported output formats of ClickHouse](../interfaces/formats.md):
```sql
SELECT *
FROM helloworld.my_first_table
ORDER BY timestamp
FORMAT TabSeparated
```

In the above query, the output is returned as tab-separated:

```response
Query id: 3604df1c-acfd-4117-9c56-f86c69721121

102 Insert a lot of rows per batch	2022-03-21 00:00:00	1.41421
102 Sort your data based on your commonly-used queries	2022-03-22 00:00:00	2.718
101 Hello, ClickHouse!	2022-03-22 14:04:09	-1
101 Granules are the smallest chunks of data read	2022-03-22 14:04:14	3.14159

4 rows in set. Elapsed: 0.005 sec.
```

:::note
ClickHouse supports over 70 input and output formats, so between the thousands of functions and all the data formats, you can use ClickHouse to perform some impressive and fast ETL-like data transformations. In fact, you don't even
need a ClickHouse server up and running to transform data - you can use the `clickhouse-local` tool. View the [docs page of `clickhouse-local`](../operations/utilities/clickhouse-local.md) for details.
:::