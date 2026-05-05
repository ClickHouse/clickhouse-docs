---
sidebar_label: 'Python connector guide'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'connector', 'integration', 'clickhouse-connect', 'insert', 'query', 'schema']
description: 'Guide for building a Python-based connector or integration on top of ClickHouse using clickhouse-connect'
slug: /integrations/building-integrations/python
title: 'Python connector guide'
doc_type: 'guide'
---

# Python connector guide

This guide covers the full lifecycle of building a Python connector, ETL pipeline, or BI backend on top of ClickHouse using the `clickhouse-connect` library. It is opinionated: it recommends specific patterns and calls out known pitfalls.

For the complete API reference, see the [Python client reference](/integrations/python). This guide pairs with the [ingestion patterns](/integrations/building-integrations/ingestion) and [consumption patterns](/integrations/building-integrations/consumption) guides.

## Installation {#installation}

```bash
pip install clickhouse-connect
```

On Windows, `zoneinfo` (used internally by clickhouse-connect for timezone handling) requires the `tzdata` package, which is not bundled with the Windows Python distribution:

```bash
pip install clickhouse-connect tzdata
```

This is not needed on Linux or macOS, where the system timezone database is available at `/usr/share/zoneinfo`.

## Creating a client {#client-setup}

Use `clickhouse_connect.get_client()` to create a connected client. For ClickHouse Cloud, always set `secure=True` and use port `8443`:

```python
import os
import clickhouse_connect

client = clickhouse_connect.get_client(
    host=os.environ["CH_HOST"],
    port=8443,
    username=os.environ["CH_USER"],
    password=os.environ["CH_PASSWORD"],
    secure=True,
)
```

Read credentials from environment variables rather than hardcoding them. For self-managed ClickHouse over plain HTTP, omit `secure` or set it to `False` and use port `8123`.

The client is thread-safe and intended to be shared across threads. Create one instance per process rather than one per request.

### Verifying connectivity {#verify-connection}

```python
result = client.query("SELECT version()")
print(result.first_row[0])
```

## Schema discovery {#schema-discovery}

Use `system.*` tables for schema introspection. Do not use `INFORMATION_SCHEMA` for connector-level metadata — it omits ClickHouse-specific fields like `is_in_sorting_key` and does not expose type modifiers like `LowCardinality`.

### Listing databases {#list-databases}

```python
result = client.query(
    "SELECT name FROM system.databases WHERE engine != 'System' ORDER BY name"
)
databases = [row[0] for row in result.result_rows]
```

### Listing columns {#list-columns}

```python
result = client.query(
    """
    SELECT
        table,
        name,
        type,
        is_in_sorting_key,
        is_in_primary_key,
        comment
    FROM system.columns
    WHERE database = {db:String}
      AND table = {tbl:String}
    ORDER BY position
    """,
    parameters={"db": database, "tbl": table},
)

columns = [
    {
        "name": row[1],
        "type": row[2],
        "is_in_sorting_key": bool(row[3]),
        "is_in_primary_key": bool(row[4]),
        "comment": row[5],
    }
    for row in result.result_rows
]
```

`system.columns.type` returns the full type string including modifiers — for example `Nullable(LowCardinality(String))` or `Array(DateTime64(3, 'UTC'))`. `INFORMATION_SCHEMA.COLUMNS.DATA_TYPE` strips these wrappers and loses information your connector needs for correct type mapping.

### Parsing type modifiers {#parse-types}

Strip `Nullable` and `LowCardinality` wrappers before mapping to Python types. Both wrappers can be nested in any order:

```python
def unwrap_type(ch_type: str) -> tuple[str, bool]:
    """Return (inner_type, is_nullable) after stripping Nullable and LowCardinality."""
    nullable = False
    t = ch_type.strip()
    changed = True
    while changed:
        changed = False
        if t.startswith("Nullable(") and t.endswith(")"):
            t = t[len("Nullable("):-1].strip()
            nullable = True
            changed = True
        if t.startswith("LowCardinality(") and t.endswith(")"):
            t = t[len("LowCardinality("):-1].strip()
            changed = True
    return t, nullable
```

```python
inner, is_nullable = unwrap_type("Nullable(LowCardinality(String))")
# inner = "String", is_nullable = True
```

## Type mapping {#type-mapping}

clickhouse-connect deserializes ClickHouse values into Python types automatically. The table below shows the default mappings:

| ClickHouse type | Python type | Notes |
|---|---|---|
| `Int8`, `Int16`, `Int32`, `Int64` | `int` | |
| `UInt8`, `UInt16`, `UInt32` | `int` | |
| `UInt64` | `int` | Values above `2^63 - 1` are valid; handle them as Python `int` (arbitrary precision) |
| `Int128`, `Int256`, `UInt128`, `UInt256` | `int` | Python `int` is arbitrary precision — no overflow |
| `Float32`, `Float64` | `float` | |
| `Decimal32/64/128/256` | `decimal.Decimal` | |
| `String` | `str` | |
| `FixedString(N)` | `str` | clickhouse-connect strips trailing null bytes automatically |
| `Date` | `datetime.date` | |
| `Date32` | `datetime.date` | Extended range |
| `DateTime` | `datetime.datetime` | Timezone-aware if column has explicit timezone; naive (UTC) otherwise |
| `DateTime64(n)` | `datetime.datetime` | Sub-second precision; timezone-aware if column has explicit timezone |
| `UUID` | `uuid.UUID` | |
| `IPv4` | `ipaddress.IPv4Address` | |
| `IPv6` | `ipaddress.IPv6Address` | |
| `Bool` | `bool` | |
| `Array(T)` | `list` | Nested arrays are nested lists |
| `Map(K, V)` | `dict` | |
| `Tuple(T1, T2, ...)` | `tuple` | |
| `Nullable(T)` | `T` or `None` | |

### Timezone-aware datetime parameters {#datetime-params}

When passing `datetime` values as query parameters, include timezone information:

```python
from datetime import datetime, timezone

client.query(
    "SELECT * FROM events WHERE ts > {min_ts:DateTime64(3)}",
    parameters={"min_ts": datetime(2024, 1, 1, tzinfo=timezone.utc)},
)
```

On clickhouse-connect versions before 0.7.x, a bug caused naive `datetime` parameters to be interpreted as local time and then shifted incorrectly to UTC, producing a ~5-hour offset in common US timezones. Always attach `timezone.utc` or the correct `ZoneInfo` timezone when constructing `datetime` parameters.

## Querying {#querying}

### Streaming query results {#streaming}

Use `client.query_rows_stream()` for any result set that might exceed 10,000 rows. The non-streaming `client.query()` buffers the entire result in memory before returning.

```python
with client.query_rows_stream(
    "SELECT user_id, event, ts FROM events WHERE date = {d:Date}",
    parameters={"d": date(2024, 1, 15)},
) as stream:
    for row in stream:
        process(row[0], row[1], row[2])
```

The context manager ensures the underlying connection is released when iteration ends or if an exception is raised mid-stream. Do not hold the stream open longer than needed.

### Parameterized queries {#parameterized}

Always use parameterized queries for any value that comes from user input or external data. ClickHouse uses `{name:Type}` syntax in the SQL string:

```python
from datetime import date

result = client.query(
    """
    SELECT
        user_id,
        count() AS events,
        max(ts) AS last_seen
    FROM events
    WHERE user_id = {user_id:String}
      AND date >= {min_date:Date}
    GROUP BY user_id
    """,
    parameters={
        "user_id": "alice",
        "min_date": date(2024, 1, 1),
    },
)
```

The `{name:Type}` syntax is ClickHouse server-side parameter binding. The value is sent separately and never interpolated into the SQL string, so SQL injection is not possible.

### Query tagging {#tagging}

Tag every query with a `query_id` and a `log_comment` so queries are attributable in `system.query_log`. This is essential for debugging customer issues and for identifying which part of your connector generated a slow query:

```python
result = client.query(
    "SELECT count() FROM events",
    query_id="connector:schema-check:job-42",
    settings={"log_comment": "connector:schema-discovery"},
)
```

Use a deterministic `query_id` derived from your job or request context. When retrying after a timeout, reuse the same `query_id` — ClickHouse will return the result of the already-running query rather than starting a duplicate.

## Inserting data {#inserts}

### Inserting lists of dicts {#insert-dicts}

Pass a list of dicts (or a list of lists) and specify column names explicitly:

```python
rows = [
    {"user_id": "alice", "event": "login",  "ts": datetime(2024, 1, 15, 12, 0, 0)},
    {"user_id": "bob",   "event": "signup", "ts": datetime(2024, 1, 15, 12, 1, 0)},
]

client.insert(
    "events",
    data=rows,
    column_names=["user_id", "event", "ts"],
)
```

You can also pass a list of lists or tuples — column order must then match `column_names` exactly.

### Batch sizing {#batch-size}

Target 10,000–100,000 rows per `insert()` call. Each call creates a new data part on disk; ClickHouse merges parts asynchronously. Inserting one row at a time (or even one hundred rows at a time) causes the part count to exceed ClickHouse's default threshold and raises:

```text
DB::Exception: Too many parts (300). Merges are processing significantly slower than inserts.
```

Never call `client.insert()` inside a per-row loop. Accumulate rows in memory and flush in batches.

### InsertContext for high-throughput {#insert-context}

For pipelines that insert into the same table repeatedly, create an `InsertContext` once and reuse it across insert calls. This avoids a pre-insert query to look up column types on every call:

```python
context = client.create_insert_context(
    table="events",
    column_names=["user_id", "event", "ts"],
)

for batch in batches:
    context.data = batch
    client.insert(context=context)
```

The `InsertContext` holds the column schema and serialization state. Reusing it has measurable throughput impact at high insert rates.

### Async insert {#async-insert}

When multiple producers are writing small payloads, use server-side async buffering to avoid the "too many parts" problem. The server buffers incoming inserts and flushes them in bulk:

```python
client.insert(
    "events",
    data=rows,
    column_names=["user_id", "event", "ts"],
    settings={
        "async_insert": 1,
        "wait_for_async_insert": 1,
    },
)
```

`wait_for_async_insert=1` blocks until the server confirms the data has been written. With `wait_for_async_insert=0`, the call returns immediately but a type error in any row silently drops the entire buffered batch with no error returned to the client. Use `wait_for_async_insert=1` in all connectors unless you have a specific reason to accept silent drops.

### Idempotent inserts {#deduplication}

Set `insert_deduplication_token` to a stable string per logical batch. On retry after a network error, send the same token — if the original insert succeeded, ClickHouse silently skips the retry:

```python
client.insert(
    "events",
    data=rows,
    column_names=["user_id", "event", "ts"],
    settings={"insert_deduplication_token": "pipeline-job-001-batch-042"},
)
```

Derive the token from your job and batch identifiers, not from the data itself. The deduplication window covers the last 100 inserts by default; tokens older than that window are no longer tracked and will not deduplicate.

## Error handling {#error-handling}

Catch `clickhouse_connect.driver.exceptions.DatabaseError` for server-reported errors. The ClickHouse error code is available as `e.code`:

```python
from clickhouse_connect.driver.exceptions import DatabaseError
import time

def insert_with_retry(client, table, rows, column_names, max_retries=3):
    token = f"job-{job_id}-batch-{batch_num}"
    for attempt in range(max_retries):
        try:
            client.insert(
                table,
                data=rows,
                column_names=column_names,
                settings={"insert_deduplication_token": token},
            )
            return
        except DatabaseError as e:
            if e.code == 60:
                raise RuntimeError(f"Table {table} does not exist") from e
            if e.code == 241:
                raise RuntimeError("ClickHouse memory limit exceeded") from e
            if e.code == 159:
                raise RuntimeError("Query timed out") from e
            raise
        except Exception:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)
```

Key error codes for connector developers:

| Code | Name | Action |
|---|---|---|
| 60 | `UNKNOWN_TABLE` | Do not retry; surface to user |
| 81 | `UNKNOWN_DATABASE` | Do not retry; surface to user |
| 164 | `READONLY` | Do not retry; check user permissions |
| 241 | `MEMORY_LIMIT_EXCEEDED` | Do not retry; reduce batch size or query scope |
| 159 | `TIMEOUT_EXCEEDED` | May retry with a larger `max_execution_time` setting |

For network-level errors (`ConnectionError`, `TimeoutError`, `OSError`), retry with exponential backoff. Always reuse the same `insert_deduplication_token` on insert retries.
