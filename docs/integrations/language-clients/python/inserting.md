---
sidebar_label: 'Inserting'
sidebar_position: 3

keywords: ['clickhouse', 'python', 'insert', 'write', 'dataframe', 'arrow']
description: 'Writing data to ClickHouse with clickhouse-connect'
slug: /integrations/language-clients/python/inserting
title: 'Inserting'
doc_type: 'guide'
---

# Inserting {#inserting}

This page covers common insert workflows. For InsertContexts, write format control, and advanced timezone handling, see [Advanced Inserting](advanced-inserting.md).

## Which insert method should I use? {#which-insert-method}

| Method            | Input                                     | Best for                                              |
|-------------------|-------------------------------------------|-------------------------------------------------------|
| `insert`          | List of rows or list of columns           | General-purpose inserts with native Python types      |
| `insert_df`       | `pandas.DataFrame`                        | Inserting from Pandas                                 |
| `insert_arrow`    | `pyarrow.Table`                           | Inserting from PyArrow (fastest, delegated to server) |
| `insert_df_arrow` | Arrow-backed DataFrame (Pandas or Polars) | Inserting from Polars or Arrow-backed Pandas          |
| `insert_file`     | File path                                 | Inserting CSV, TSV, or other file formats directly    |
| `raw_insert`      | `bytes`, generator, or file-like object   | Pre-formatted data in any ClickHouse input format     |

## Basic insert {#basic-insert}

### Row-oriented (default) {#row-oriented}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Create the table
client.command("""
    CREATE TABLE IF NOT EXISTS events
    (id UInt32, event_type String, metric Float64)
    ENGINE MergeTree ORDER BY id
""")

# Insert rows
data = [
    [1, "click", 3.14],
    [2, "view", 2.72],
    [3, "purchase", 1.62],
]

client.insert("events", data, column_names=["id", "event_type", "metric"])
```

### Column-oriented {#column-oriented}

Same table, but data organized by column instead of by row:

```python
data = [
    [1, 2, 3],                          # id column
    ["click", "view", "purchase"],       # event_type column
    [3.14, 2.72, 1.62],                  # metric column
]

client.insert("events", data, column_names=["id", "event_type", "metric"], column_oriented=True)
```

### With explicit column types {#explicit-column-types}

Providing column types avoids a `DESCRIBE` round-trip to the server:

```python
client.insert(
    "events",
    data,
    column_names=["id", "event_type", "metric"],
    column_type_names=["UInt32", "String", "Float64"],
)
```

### Insert parameters {#insert-parameters}

| Parameter            | Type                     | Default    | Description                                                                              |
|----------------------|--------------------------|------------|------------------------------------------------------------------------------------------|
| `table`              | str                      | *Required* | Target table. Database-qualified names are allowed.                                      |
| `data`               | Sequence of Sequences    | *Required* | Rows or columns of data to insert.                                                       |
| `column_names`       | Sequence[str] or str     | `"*"`      | Column names. `"*"` auto-fetches from the server.                                        |
| `database`           | str                      | `""`       | Target database. Falls back to client database.                                          |
| `column_types`       | Sequence[ClickHouseType] | *None*     | Explicit column types (avoids DESCRIBE query).                                           |
| `column_type_names`  | Sequence[str]            | *None*     | Column type names as strings (alternative to `column_types`).                            |
| `column_oriented`    | bool                     | False      | If True, `data` is a list of columns instead of rows.                                    |
| `settings`           | dict                     | *None*     | ClickHouse settings for this insert.                                                     |
| `context`            | InsertContext            | *None*     | Reusable insert context. See [Advanced Inserting](advanced-inserting.md#insertcontexts). |
| `transport_settings` | dict                     | *None*     | HTTP headers to include with this request.                                               |

Returns a `QuerySummary`. Access `summary.written_rows` (property), `summary.written_bytes()` (method), and `summary.query_id()` (method).

## DataFrame and Arrow inserts {#dataframe-and-arrow-inserts}

### Pandas DataFrame {#pandas-insert}

```python
import pandas as pd

df = pd.DataFrame({
    "id": [1, 2, 3],
    "event_type": ["click", "view", "purchase"],
    "metric": [3.14, 2.72, 1.62],
})

client.insert_df("events", df)
```

`insert_df` automatically handles column orientation. You can optionally pass `column_names`, `column_types`, or `column_type_names` to control the mapping.

### PyArrow Table {#pyarrow-insert}

```python
import pyarrow as pa

arrow_table = pa.table({
    "id": [1, 2, 3],
    "event_type": ["click", "view", "purchase"],
    "metric": [3.14, 2.72, 1.62],
})

client.insert_arrow("events", arrow_table)
```

`insert_arrow` passes the Arrow table directly to the ClickHouse server for processing. This is the fastest insert method because it skips client-side type conversion.

### Arrow-backed DataFrame (Pandas or Polars) {#arrow-backed-insert}

```python
# Pandas with Arrow dtypes
df = pd.DataFrame({
    "id": [1, 2, 3],
    "event_type": ["click", "view", "purchase"],
    "metric": [3.14, 2.72, 1.62],
}).convert_dtypes(dtype_backend="pyarrow")

client.insert_df_arrow("events", df)
```

```python
# Polars
import polars as pl

polars_df = pl.DataFrame({
    "id": [1, 2, 3],
    "event_type": ["click", "view", "purchase"],
    "metric": [3.14, 2.72, 1.62],
})

client.insert_df_arrow("events", polars_df)
```

`insert_df_arrow` validates that all Pandas columns use Arrow-backed dtypes. Polars DataFrames are detected automatically.

### NumPy arrays {#numpy-insert}

A NumPy array is a valid sequence of sequences, so it works directly with the standard `insert` method:

```python
import numpy as np

arr = np.array([[1, "click", 3.14], [2, "view", 2.72]])
client.insert("events", arr, column_names=["id", "event_type", "metric"])
```

## File inserts {#file-inserts}

Insert data directly from a file on disk. Parsing is delegated to the ClickHouse server.

```python
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()

insert_file(client, "events", "events.csv")
```

By default, `insert_file` assumes `CSVWithNames` format when `column_names` is not provided, and `CSV` when it is.

| Parameter      | Type          | Default    | Description                                                                                             |
|----------------|---------------|------------|---------------------------------------------------------------------------------------------------------|
| `client`       | Client        | *Required* | The client to use for the insert.                                                                       |
| `table`        | str           | *Required* | Target table (database-qualified names allowed).                                                        |
| `file_path`    | str           | *Required* | Path to the data file.                                                                                  |
| `fmt`          | str           | *None*     | ClickHouse input format. Defaults to `CSVWithNames` if `column_names` is not provided, `CSV` otherwise. |
| `column_names` | Sequence[str] | *None*     | Column names (not needed for formats that include them).                                                |
| `database`     | str           | *None*     | Target database.                                                                                        |
| `settings`     | dict          | *None*     | ClickHouse settings (e.g., `input_format_allow_errors_num`).                                            |
| `compression`  | str           | *None*     | Compression type for the Content-Encoding header (`lz4`, `zstd`, `gzip`).                               |

```python
# Insert with error tolerance
insert_file(
    client,
    "events",
    "messy_data.csv",
    settings={"input_format_allow_errors_ratio": 0.2, "input_format_allow_errors_num": 5},
)
```

## Timezone handling {#timezone-handling}

When inserting `datetime.datetime` objects, ClickHouse Connect handles timezone conversion automatically. ClickHouse stores all DateTime values as UTC epoch timestamps internally.

**Timezone-aware datetimes** are converted correctly regardless of their timezone:

```python
from datetime import datetime
from zoneinfo import ZoneInfo

data = [
    [datetime(2024, 6, 15, 10, 30, tzinfo=ZoneInfo("UTC"))],
    [datetime(2024, 6, 15, 10, 30, tzinfo=ZoneInfo("America/Denver"))],
    [datetime(2024, 6, 15, 10, 30, tzinfo=ZoneInfo("Asia/Tokyo"))],
]
client.insert("events", data, column_names=["event_time"])
```

Each datetime above represents a different point in time and will be stored as its correct UTC timestamp.

**Timezone-naive datetimes** are interpreted using the system's local timezone. To avoid ambiguity:

1. Always use timezone-aware datetime objects, or
2. Ensure your system timezone is UTC, or
3. Insert as epoch timestamps directly (integers)

For detailed timezone behavior during inserts, including columns with timezone metadata, see [Advanced Inserting (Time Zones)](advanced-inserting.md#time-zones).
