---
date: 2023-03-17
---

# Useful queries for troubleshooting

In no particular order, here are some handy queries for troubleshooting ClickHouse and figuring out what is happening. We also have a great blog with some [essential queries for monitoring ClickHouse](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse).

## View which settings have been changed from the default

```sql
SELECT
    name,
    value
FROM system.settings
WHERE changed
```

## Get the size of all your tables

```sql
SELECT table,
    formatReadableSize(sum(bytes)) as size
    FROM system.parts
    WHERE active
GROUP BY table
```

The response looks like:

```response
┌─table───────────┬─size──────┐
│ stat            │ 38.89 MiB │
│ customers       │ 525.00 B  │
│ my_sparse_table │ 40.73 MiB │
│ crypto_prices   │ 32.18 MiB │
│ hackernews      │ 6.23 GiB  │
└─────────────────┴───────────┘
```

## Row count and average day size of your table

```sql
SELECT
    table,
    formatReadableSize(size) AS size,
    rows,
    days,
    formatReadableSize(avgDaySize) AS avgDaySize
FROM
(
    SELECT
        table,
        sum(bytes) AS size,
        sum(rows) AS rows,
        min(min_date) AS min_date,
        max(max_date) AS max_date,
        max_date - min_date AS days,
        size / (max_date - min_date) AS avgDaySize
    FROM system.parts
    WHERE active
    GROUP BY table
    ORDER BY rows DESC
)
```

## Compression columns percentage as well as the size of primary index in memory

You can see how compressed your data is by column. This query also returns the size of your primary indexes in memory - useful to know because primary indexes must fit in memory.

```sql
SELECT
    parts.*,
    columns.compressed_size,
    columns.uncompressed_size,
    columns.compression_ratio,
    columns.compression_percentage
FROM
(
    SELECT
        table,
        formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
        round(sum(data_compressed_bytes) / sum(data_uncompressed_bytes), 3) AS compression_ratio,
        round(100 - ((sum(data_compressed_bytes) * 100) / sum(data_uncompressed_bytes)), 3) AS compression_percentage
    FROM system.columns
    GROUP BY table
) AS columns
RIGHT JOIN
(
    SELECT
        table,
        sum(rows) AS rows,
        max(modification_time) AS latest_modification,
        formatReadableSize(sum(bytes)) AS disk_size,
        formatReadableSize(sum(primary_key_bytes_in_memory)) AS primary_keys_size,
        any(engine) AS engine,
        sum(bytes) AS bytes_size
    FROM system.parts
    WHERE active
    GROUP BY
        database,
        table
) AS parts ON columns.table = parts.table
ORDER BY parts.bytes_size DESC
```

## Number of queries sent by client in the last 10 minutes

Feel free to increase or decrease the time interval in the `toIntervalMinute(10)` function:

```sql
SELECT
    client_name,
    count(),
    query_kind,
    toStartOfMinute(event_time) AS event_time_m
FROM system.query_log
WHERE (type = 'QueryStart') AND (event_time > (now() - toIntervalMinute(10)))
GROUP BY
    event_time_m,
    client_name,
    query_kind
ORDER BY
    event_time_m DESC,
    count() ASC
```

## Number of parts in each partition

```sql
SELECT
    concat(database, '.', table),
    partition_id,
    count()
FROM system.parts
WHERE active
GROUP BY
    database,
    table,
    partition_id
```

## Finding long running queries

This can help find queries that are stuck:

```sql
SELECT
    elapsed,
    initial_user,
    client_name,
    hostname(),
    query_id,
    query
FROM clusterAllReplicas(default, system.processes)
ORDER BY elapsed DESC
```

Using the query id of the worst running query, we can get a stack trace that can help when debugging.

```
SET allow_introspection_functions=1;

SELECT
    arrayStringConcat(
        arrayMap(
            x,
            y -> concat(x, ': ', y),
            arrayMap(x -> addressToLine(x), trace),
            arrayMap(x -> demangle(addressToSymbol(x)), trace)
        ),
        '\n'
    ) as trace
FROM
    system.stack_trace
WHERE
    query_id = '0bb6e88b-9b9a-4ffc-b612-5746c859e360';
```

## View the most recent errors

```
SELECT *
FROM system.errors
ORDER BY last_error_time DESC
```

The response looks like:

```response
┌─name──────────────────┬─code─┬─value─┬─────last_error_time─┬─last_error_message──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─last_error_trace─┬─remote─┐
│ UNKNOWN_TABLE         │   60 │     3 │ 2023-03-14 01:02:35 │ Table system.stack_trace doesn't exist                                                                                                              │ []               │      0 │
│ BAD_GET               │  170 │     1 │ 2023-03-14 00:58:55 │ Requested cluster 'default' not found                                                                                                               │ []               │      0 │
│ UNKNOWN_IDENTIFIER    │   47 │     1 │ 2023-03-14 00:49:12 │ Missing columns: 'parts.table' 'table' while processing query: 'table = parts.table', required columns: 'table' 'parts.table' 'table' 'parts.table' │ []               │      0 │
│ NO_ELEMENTS_IN_CONFIG │  139 │     2 │ 2023-03-14 00:42:11 │ Certificate file is not set.                                                                                                                        │ []               │      0 │
└───────────────────────┴──────┴───────┴─────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────┴────────┘
```

## Top 10 queries that are using the most CPU and memory

```sql
SELECT
    type,
    event_time,
    initial_query_id,
    formatReadableSize(memory_usage) AS memory,
    `ProfileEvents.Values`[indexOf(`ProfileEvents.Names`, 'UserTimeMicroseconds')] AS userCPU,
    `ProfileEvents.Values`[indexOf(`ProfileEvents.Names`, 'SystemTimeMicroseconds')] AS systemCPU,
    normalizedQueryHash(query) AS normalized_query_hash
FROM system.query_log
ORDER BY memory_usage DESC
LIMIT 10
```

## How much disk space are my projection using

```sql
SELECT
    name,
    parent_name,
    formatReadableSize(bytes_on_disk) AS bytes,
    formatReadableSize(parent_bytes_on_disk) AS parent_bytes,
    bytes_on_disk / parent_bytes_on_disk AS ratio
FROM system.projection_parts
```


## Show disk storage, number of parts, number of rows in system.parts and marks across databases

```sql
SELECT
    database,
    table,
    partition,
    count() AS parts,
    formatReadableSize(sum(bytes_on_disk)) AS bytes_on_disk,
    formatReadableQuantity(sum(rows)) AS rows,
    sum(marks) AS marks
FROM system.parts
WHERE (database != 'system') AND active
GROUP BY
    database,
    table,
    partition
ORDER BY database ASC
```

## List details of recently written new parts

The details include when they got created, how large they are, how many rows, and more:

```sql
SELECT
    modification_time,
    rows,
    formatReadableSize(bytes_on_disk),
    *
FROM clusterAllReplicas(default, system.parts)
WHERE (database = 'default') AND active AND (level = 0)
ORDER BY modification_time DESC
LIMIT 100
```