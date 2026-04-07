---
sidebar_label: 'Advanced querying'
sidebar_position: 9
keywords: ['clickhouse', 'python', 'query', 'advanced', 'streaming', 'formats']
description: 'Advanced query features: QueryContexts, streaming, read formats, external data, and timezones'
slug: /integrations/language-clients/python/advanced-querying
title: 'Advanced querying'
doc_type: 'reference'
---

# Advanced Querying {#advanced-querying}

For common query workflows, see [Querying](querying.md). This page covers QueryContexts, streaming internals, read formats, external data, and timezone handling.

## QueryContexts {#querycontexts}

A `QueryContext` encapsulates the query string, parameters, settings, format options, and other configuration. By reusing a QueryContext across multiple calls, you avoid repeating the same configuration and skip the column type lookup that normally happens on each query.

Create one with `client.create_query_context()`, which accepts the same parameters as `client.query()`:

```python
qc = client.create_query_context(
    query="SELECT value1, value2 FROM data_table WHERE key = {k:Int32}",
    parameters={"k": 2},
    column_oriented=True,
)

result = client.query(context=qc)
assert result.result_set[1][0] == "second_value2"

# Reuse with different parameters
qc.set_parameter("k", 1)
result = client.query(context=qc)
assert result.result_set[1][0] == "first_value2"
```

Additional arguments passed to `query()` override the context's properties.

`QueryContext` objects are not thread-safe. Use `QueryContext.updated_copy()` to get a safe copy for another thread.

## Streaming queries {#streaming-queries}

All `query_*_stream` methods return a `StreamContext` that must be consumed with a `with` statement. For a summary of all streaming methods, see [Querying (Streaming)](querying.md#streaming).

### Data blocks {#data-blocks}

ClickHouse returns data in blocks. Block size is governed by two server settings:

- [max_block_size](/operations/settings/settings#max_block_size) - Maximum rows per block (default 65536).
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) - Soft byte limit per block (default 1,000,000).

Each block never exceeds `max_block_size` rows. Actual block sizes vary by query type, for example distributed queries may return smaller blocks from individual shards.

### HTTP data buffer {#http-data-buffer}

If your application processes blocks slower than the server streams them, the server may close the connection. Increase the buffer size to mitigate this:

```python
from clickhouse_connect import common
common.set_setting("http_buffer_size", 50_000_000)  # 50 MB
```

Data in the buffer is stored compressed when using `lz4` or `zstd`, so compression effectively increases the buffer capacity.

### StreamContext behavior {#streamcontexts}

- A `StreamContext` must be opened with `with`. Using it outside a `with` block raises an error.
- A `StreamContext` can only be consumed once. Reuse after exit raises `StreamClosedError`.
- Use `stream.source` to access the parent `QueryResult` (column names, types, etc.).

```python
with client.query_row_block_stream("SELECT * FROM taxi_trips") as stream:
    for block in stream:
        for row in block:
            process(row)
```

### Stream types {#stream-types}

**`query_column_block_stream`** - Each block is a list of columns. `block[0]` is a tuple of all values for the first column. Best for column-level aggregation.

**`query_row_block_stream`** - Each block is a list of rows. `block[0]` is the first row in the block. Best for row-by-row display or transformation.

**`query_rows_stream`** - Automatically advances across blocks, yielding one row at a time. Convenience wrapper around `query_row_block_stream`.

**`query_np_stream`** - Each block is a 2D NumPy array with shape `(columns, rows)`.

**`query_df_stream`** - Each block is a Pandas DataFrame.

**`query_arrow_stream`** - Returns a `pyarrow.ipc.RecordBatchStreamReader` wrapped in `StreamContext`. Each iteration yields a PyArrow RecordBatch.

**`query_df_arrow_stream`** - Each block is a DataFrame with PyArrow dtype backend. Set `dataframe_library="polars"` for Polars output.

## Arrow type mapping {#notes-and-caveats}

When ClickHouse returns data in Arrow format, types are mapped to the closest Arrow equivalent. See the [full server-side type mapping table](https://clickhouse.com/docs/interfaces/formats/Arrow#data-types-matching) for details. Some types have no native Arrow representation:

- `IPv4` -> Arrow `UINT32`
- `IPv6`, `Int128`, `UInt128`, `Int256`, `UInt256` -> Arrow `FIXED_SIZE_BINARY` or `BINARY`
- `UUID`, `Enum` -> Arrow binary types

Your application code must convert these bytes according to ClickHouse semantics:

```python
# Polars: Int128 from FIXED_SIZE_BINARY
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))

# Pandas: Date from UINT16 (days since epoch)
df["event_date"] = pd.to_datetime(df["event_date"], unit="D")

# Pure Python fallback for types without DataFrame-native support
values = [int.from_bytes(b, byteorder="little") for b in df["int128_col"].to_list()]
```

## Read formats {#read-formats}

Read formats control the Python types returned by `query`, `query_np`, and `query_df`. They do not apply to `raw_query` or `query_arrow`.

Formats can be set at three levels:

**Global** - Applies to all queries:

```python
from clickhouse_connect.datatypes.format import set_read_format

set_read_format("IPv*", "string")   # Return IP addresses as strings
set_read_format("Date*", "int")     # Return dates as epoch day integers
```

**Per-query** - Via the `query_formats` argument:

```python
client.query("SELECT user_uuid FROM users", query_formats={"UUID": "string"})
```

**Per-column** - Via the `column_formats` argument:

```python
client.query(
    "SELECT dev_address, gw_address FROM devices",
    column_formats={"dev_address": "string"},
)
```

The wildcard `*` matches any suffix in type names.

### Read format options {#read-format-options}

| ClickHouse Type            | Native Python Type    | Read Formats            | Notes                                                    |
|----------------------------|-----------------------|-------------------------|----------------------------------------------------------|
| Int[8-64], UInt[8-32]      | int                   | -                       |                                                          |
| UInt64                     | int                   | `signed`                | For tools that don't handle large unsigned values        |
| [U]Int[128,256]            | int                   | `string`                | Pandas/NumPy max 64 bits; return as string               |
| BFloat16, Float32, Float64 | float                 | -                       | All Python floats are 64-bit                             |
| Decimal                    | decimal.Decimal       | -                       |                                                          |
| String                     | str                   | `bytes`                 | Strings can also carry binary data                       |
| FixedString                | bytes                 | `string`                |                                                          |
| Enum[8,16]                 | str                   | `string`, `int`         |                                                          |
| Date, Date32               | datetime.date         | `int`                   | Days since 1970-01-01                                    |
| DateTime                   | datetime.datetime     | `int`                   | Epoch seconds                                            |
| DateTime64                 | datetime.datetime     | `int`                   | Raw 64-bit value (milliseconds/microseconds/nanoseconds) |
| Time, Time64               | datetime.timedelta    | `int`, `string`, `time` |                                                          |
| IPv4                       | ipaddress.IPv4Address | `string`                |                                                          |
| IPv6                       | ipaddress.IPv6Address | `string`                |                                                          |
| Tuple                      | dict or tuple         | `tuple`, `json`         | Named tuples return dicts by default                     |
| Map                        | dict                  | -                       |                                                          |
| Nested                     | Sequence[dict]        | -                       |                                                          |
| UUID                       | uuid.UUID             | `string`                | RFC 4122 format                                          |
| JSON                       | dict                  | `string`                | Returns JSON string instead of dict                      |
| Variant                    | object                | -                       | Python type matches stored ClickHouse type               |
| Dynamic                    | object                | -                       | Python type matches stored ClickHouse type               |
| QBit                       | list[float]           | -                       | Bit-transposed vector type. Experimental.                |

## External data {#external-data}

ClickHouse queries can accept external data files sent alongside the query. Create an `ExternalData` object:

| Parameter   | Type        | Description                                                     |
|-------------|-------------|-----------------------------------------------------------------|
| `file_path` | str         | Path to a local file. Either `file_path` or `data` is required. |
| `file_name` | str         | External data name. Derived from `file_path` if not provided.   |
| `data`      | bytes       | Binary data (instead of a file).                                |
| `fmt`       | str         | ClickHouse input format (default `"TSV"`).                      |
| `types`     | str or list | Column types (comma-separated string or list).                  |
| `structure` | str or list | Column names + types (e.g., `["name String", "year UInt16"]`).  |
| `mime_type` | str         | Optional MIME type.                                             |

```python
from clickhouse_connect.driver.external import ExternalData

ext_data = ExternalData(
    file_path="/data/movies.csv",
    fmt="CSV",
    structure=["movie String", "year UInt16", "rating Decimal32(3)", "director String"],
)

result = client.query(
    "SELECT name, avg(rating) FROM directors INNER JOIN movies ON directors.name = movies.director GROUP BY name",
    external_data=ext_data,
)
```

Add more files with `ext_data.add_file(...)`, which takes the same parameters.

## Time zones {#time-zones}

ClickHouse stores DateTime and DateTime64 values as timezone-naive epoch timestamps. All timezone application happens on the client side.

### Timezone source (`tz_source`) {#timezone-source}

Controls the fallback timezone for DateTime columns without an explicit timezone in their column definition.

| Value      | Behavior                                                                       |
|------------|--------------------------------------------------------------------------------|
| `"auto"`   | **(Default)** Uses the server timezone if it's DST-safe, otherwise uses local. |
| `"server"` | Always uses the server timezone.                                               |
| `"local"`  | Always uses the client's local timezone.                                       |

### Timezone mode (`tz_mode`) {#timezone-mode}

Controls how timezone information is represented in returned Python datetime values.

| Value         | Behavior                                                                                |
|---------------|-----------------------------------------------------------------------------------------|
| `"naive_utc"` | **(Default)** Returns timezone-naive datetimes when the applied timezone is UTC.        |
| `"aware"`     | Always returns timezone-aware datetimes.                                                |
| `"schema"`    | Matches the column definition: aware if the column defines a timezone, naive otherwise. |

Both `tz_source` and `tz_mode` can be set at client creation or overridden per query.

### Timezone precedence {#timezone-precedence}

When resolving which timezone to apply:

1. `column_tzs` parameter (per-column override)
2. Column timezone metadata (e.g., `DateTime64(3, 'America/Denver')`)
3. `query_tz` parameter
4. Session or query timezone setting
5. Fallback from `tz_source`

Then `tz_mode` controls whether the result is naive or aware.

:::note
Timezone conversion adds overhead. In performance-critical code, prefer treating DateTime values as epoch timestamps and converting only for display.
:::
