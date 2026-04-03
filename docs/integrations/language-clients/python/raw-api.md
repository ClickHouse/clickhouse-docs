---
sidebar_label: 'Raw API'
sidebar_position: 10

keywords: ['clickhouse', 'python', 'raw', 'http', 'bytes', 'stream']
description: 'Raw HTTP-style query and insert methods in clickhouse-connect'
slug: /integrations/language-clients/python/raw-api
title: 'Raw API'
doc_type: 'reference'
---

# Raw API {#raw-api}

The raw methods bypass ClickHouse Connect's type system entirely. They send and receive data as raw bytes using whichever ClickHouse format you specify. Use these when you need direct control over the wire format, want to export data to files, or are working with pre-formatted data.

For most applications, the typed [query](querying.md) and [insert](inserting.md) methods are a better fit.

## raw_query {#raw-query}

Returns the query result as an unprocessed `bytes` object. ClickHouse Connect still handles parameter binding, error handling, retries, and settings.

| Parameter            | Type             | Default    | Description                                                                                           |
|----------------------|------------------|------------|-------------------------------------------------------------------------------------------------------|
| `query`              | str              | *Required* | Any valid ClickHouse query                                                                            |
| `parameters`         | dict or iterable | *None*     | See [parameters](querying.md#parameters)                                                              |
| `settings`           | dict             | *None*     | See [settings](driver-api.md#settings-argument-1)                                                       |
| `fmt`                | str              | *None*     | ClickHouse output format (e.g., `"CSVWithNames"`, `"JSONEachRow"`). Defaults to TSV if not specified. |
| `use_database`       | bool             | True       | Use the client's assigned database                                                                    |
| `external_data`      | ExternalData     | *None*     | See [external data](advanced-querying.md#external-data)                                               |
| `transport_settings` | dict             | *None*     | HTTP headers to include with this request                                                             |

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Get CSV output
csv_bytes = client.raw_query(
    "SELECT number, toString(number) FROM system.numbers LIMIT 5",
    fmt="CSVWithNames",
)
print(csv_bytes.decode())
# "number","toString(number)"
# 0,"0"
# 1,"1"
# 2,"2"
# 3,"3"
# 4,"4"
```

:::note
`query_arrow` is a thin wrapper around `raw_query` using the ClickHouse `Arrow` output format.
:::

## raw_stream {#raw-stream}

Same API as `raw_query`, but returns an `io.IOBase` stream object that can be iterated to yield `bytes` chunks. Use this for large results to avoid loading everything into memory.

```python
stream = client.raw_stream(
    "SELECT number, toString(number) FROM system.numbers LIMIT 5",
    fmt="CSVWithNames",
)
for chunk in stream:
    process(chunk)
```

## Saving query results to files {#saving-to-files}

`raw_stream` is the natural way to export query results to disk:

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

query = "SELECT number, toString(number) AS str FROM system.numbers LIMIT 1000"
stream = client.raw_stream(query=query, fmt="CSVWithNames")

with open("output.csv", "wb") as f:
    for chunk in stream:
        f.write(chunk)
```

This works with any [ClickHouse output format](/interfaces/formats): `CSVWithNames`, `TabSeparated`, `JSONEachRow`, `Parquet`, etc.

## raw_insert {#raw-insert}

Inserts pre-formatted data directly. Because no client-side processing occurs, this is the highest-throughput insert path.

| Parameter            | Type                                   | Default    | Description                                                   |
|----------------------|----------------------------------------|------------|---------------------------------------------------------------|
| `table`              | str                                    | *Required* | Target table (database-qualified names allowed)               |
| `column_names`       | Sequence[str]                          | *None*     | Column names. Required if the format doesn't include them.    |
| `insert_block`       | str, bytes, Generator[bytes], BinaryIO | *Required* | The data to insert. Strings are encoded with client encoding. |
| `settings`           | dict                                   | *None*     | See [settings](driver-api.md#settings-argument-1)               |
| `fmt`                | str                                    | *None*     | ClickHouse input format. Defaults to Native if not specified. |
| `compression`        | str                                    | *None*     | Compression type (`"lz4"`, `"zstd"`, etc.)                    |
| `transport_settings` | dict                                   | *None*     | HTTP headers to include with this request                     |

It is your responsibility to ensure the `insert_block` matches the specified format and compression.

```python
# Insert CSV data
csv_data = b'"id","name"\n1,"event_a"\n2,"event_b"\n'
client.raw_insert("events", insert_block=csv_data, fmt="CSVWithNames")
```

```python
# Stream from a file
with open("data.csv", "rb") as f:
    client.raw_insert("events", insert_block=f, fmt="CSVWithNames")
```

```python
# Insert with a generator
def data_generator():
    for i in range(100):
        yield f"{i}\tevent_{i}\n".encode()

client.raw_insert("events", column_names=["id", "name"], insert_block=data_generator())
```

:::note
The raw methods do not use the compression settings configured on the client. You must specify compression explicitly per call if needed.
:::
