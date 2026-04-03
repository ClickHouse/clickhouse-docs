---
sidebar_label: 'Querying'
sidebar_position: 2
keywords: ['clickhouse', 'python', 'query', 'select', 'dataframe', 'arrow']
description: 'Reading data from ClickHouse with clickhouse-connect'
slug: /integrations/language-clients/python/querying
title: 'Querying'
doc_type: 'guide'
---

# Querying {#querying}

This page covers common read workflows. For streaming internals, QueryContexts, read format control, external data, and timezone edge cases, see [Advanced Querying](advanced-querying.md).

## Which query method should I use? {#which-query-method}

| Method           | Returns                                        | Best for                                        |
|------------------|------------------------------------------------|-------------------------------------------------|
| `query`          | `QueryResult` (rows/columns of Python objects) | General-purpose queries, iteration, dict access |
| `query_df`       | `pandas.DataFrame`                             | Pandas analysis and visualization               |
| `query_np`       | `numpy.ndarray`                                | NumPy computation                               |
| `query_arrow`    | `pyarrow.Table`                                | PyArrow pipelines, zero-copy interop            |
| `query_df_arrow` | Arrow-backed DataFrame (Pandas or Polars)      | Best performance for DataFrame workflows        |
| `command`        | Single value, row, or `QuerySummary`           | DDL, single-value queries (`SELECT count()`)    |
| `raw_query`      | `bytes`                                        | Unprocessed ClickHouse output in any format     |

Streaming variants (`query_*_stream`) exist for `query`, `query_df`, `query_np`, `query_arrow`, and `query_df_arrow`. The raw equivalent is `raw_stream`. See [Streaming](#streaming) below.

## Basic query {#basic-query}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT name, database FROM system.tables LIMIT 5")

# Row-oriented access (default)
for row in result.result_rows:
    print(row)

# Column-oriented access
print(result.result_columns)

# Named results (yields dicts)
for row_dict in result.named_results():
    print(row_dict)

# Convenience accessors
print(result.first_row)    # First row as tuple
print(result.first_item)   # First row as dict
print(result.row_count)    # Total rows
```

### The QueryResult object {#queryresult}

| Property          | Type                    | Description                                |
|-------------------|-------------------------|--------------------------------------------|
| `result_rows`     | list of tuples          | Rows of values                             |
| `result_columns`  | list of lists           | Columns of values                          |
| `column_names`    | tuple of str            | Column names                               |
| `column_types`    | tuple of ClickHouseType | Column type objects                        |
| `query_id`        | str                     | Server query ID (for `system.query_log`)   |
| `summary`         | dict                    | Summary from `X-ClickHouse-Summary` header |
| `first_row`       | tuple or list           | First row                                  |
| `first_item`      | dict                    | First row as `{column_name: value}`        |
| `row_count`       | int                     | Number of rows                             |
| `named_results()` | generator of dicts      | Yields each row as a dict                  |

## Parameters {#parameters}

ClickHouse Connect supports both server-side and client-side parameter binding.

### Server-side binding (recommended for SELECT) {#server-side-binding}

Values are sent as separate HTTP query parameters. Use the `{name:Type}` syntax:

```python
from datetime import datetime

result = client.query(
    "SELECT * FROM events WHERE created > {ts:DateTime} AND status = {s:String}",
    parameters={"ts": datetime(2024, 1, 1), "s": "active"},
)
```

:::note
Server-side binding is only supported for `SELECT` queries by the ClickHouse server. It does not work for `ALTER`, `DELETE`, or `INSERT`.
:::

### Client-side binding {#client-side-binding}

Uses Python printf-style formatting. Works with any query type.

```python
# Dict style
result = client.query(
    "SELECT * FROM events WHERE status = %(s)s",
    parameters={"s": "active"},
)

# Tuple style
result = client.query(
    "SELECT * FROM events WHERE id > %s AND status = %s",
    parameters=(100, "active"),
)
```

Client-side binding does not work for database identifiers (table names, column names). Use server-side `{name:Identifier}` syntax for those.

## The command method {#command}

Use `command` for DDL statements and queries that return a single value:

```python
# DDL
client.command("CREATE TABLE t (id UInt32) ENGINE MergeTree ORDER BY id")

# Single value
count = client.command("SELECT count() FROM system.tables")
print(count)  # 151

# Server version
print(client.command("SELECT version()"))  # '26.2.4.23'
```

`command` returns a `str`, `int`, `Sequence[str]`, or `QuerySummary` depending on the result.

## DataFrame and Arrow queries {#dataframe-and-arrow-queries}

### Pandas DataFrame {#pandas-query}

```python
df = client.query_df("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")
print(df)
#    number  doubled
# 0       0        0
# 1       1        2
# 2       2        4
# 3       3        6
# 4       4        8
```

### NumPy array {#numpy-query}

```python
arr = client.query_np("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")
print(arr)
# [[0 0]
#  [1 2]
#  [2 4]
#  [3 6]
#  [4 8]]
```

### PyArrow Table {#pyarrow-query}

```python
arrow_table = client.query_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3"
)
print(arrow_table)
# pyarrow.Table
# number: uint64 not null
# str: string not null
```

The `use_strings` parameter controls whether ClickHouse `String` columns are returned as Arrow strings (True) or bytes (False).

### Arrow-backed DataFrames (Pandas and Polars) {#arrow-backed-dataframes}

`query_df_arrow` returns a DataFrame with PyArrow dtype backend, providing better performance and memory efficiency than `query_df`:

```python
# Pandas with Arrow backend
df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="pandas",
)
print(df.dtypes)
# number    uint64[pyarrow]
# str       string[pyarrow]

# Polars
polars_df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="polars",
)
print(polars_df.dtypes)
# [UInt64, String]
```

:::note
When ClickHouse returns data in Arrow format, some types are mapped to the closest Arrow equivalent. For example, `IPv4` becomes `UINT32`, and large integers (`Int128`, `UInt256`, etc.) become `FIXED_SIZE_BINARY`. Your application code must handle these conversions. See [Advanced Querying (Arrow type mapping)](advanced-querying.md#notes-and-caveats) for details.
:::

## Streaming {#streaming}

For large result sets, streaming methods let you process data block by block without loading everything into memory. Each method returns a `StreamContext` that must be used with a `with` statement.

```python
# Stream individual rows
with client.query_rows_stream("SELECT * FROM large_table") as stream:
    for row in stream:
        process(row)

# Stream blocks of rows (more efficient)
with client.query_row_block_stream("SELECT * FROM large_table") as stream:
    for block in stream:
        print(f"Block with {len(block)} rows")
        for row in block:
            process(row)

# Stream as Pandas DataFrames
with client.query_df_stream("SELECT * FROM large_table") as stream:
    for df in stream:
        process_dataframe(df)

# Stream as Arrow batches
with client.query_arrow_stream("SELECT * FROM large_table") as stream:
    for batch in stream:
        process_batch(batch)
```

All streaming methods:

| Method                      | Yields                                     |
|-----------------------------|--------------------------------------------|
| `query_rows_stream`         | Individual rows (auto-advances blocks)     |
| `query_row_block_stream`    | Blocks of rows                             |
| `query_column_block_stream` | Blocks of columns                          |
| `query_np_stream`           | NumPy arrays (one per block)               |
| `query_df_stream`           | Pandas DataFrames (one per block)          |
| `query_arrow_stream`        | PyArrow RecordBatches                      |
| `query_df_arrow_stream`     | Arrow-backed DataFrames (Pandas or Polars) |

Access column metadata from the stream's source:

```python
with client.query_df_stream("SELECT * FROM events") as stream:
    print(stream.source.column_names)
    for df in stream:
        process(df)
```

For details on block sizes, the HTTP buffer, and StreamContext behavior, see [Advanced Querying (Streaming)](advanced-querying.md#streaming-queries).

## Settings {#settings}

Pass ClickHouse server settings per query:

```python
result = client.query(
    "SELECT sum(number) FROM numbers(1000000)",
    settings={"max_block_size": 100000, "max_execution_time": 30},
)
```

See [Driver API Reference (Settings)](driver-api.md#settings-argument-1) for details on available settings.
