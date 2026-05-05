---
sidebar_label: 'Ingestion patterns'
sidebar_position: 2
keywords: ['clickhouse', 'integration', 'connector', 'insert', 'ingest', 'ETL', 'batch', 'async', 'deduplication']
description: 'Patterns for writing data into ClickHouse from connectors, ETL pipelines, and integrations'
slug: /integrations/building-integrations/ingestion
title: 'Ingestion patterns'
doc_type: 'guide'
---

# Ingestion patterns

This guide covers how to write data into ClickHouse from a connector, ETL pipeline, or integration. It pairs with the [consumption patterns](/integrations/building-integrations/consumption) guide and the [integration development best practices](/integrations/building-integrations) index.

For language-specific insert APIs, see the client reference pages: [Java/JDBC](/integrations/java), [Python](/integrations/python), [Go](/integrations/go), [JavaScript](/integrations/javascript).

## Choosing a write protocol {#write-protocol}

| Protocol | Best for |
|---|---|
| **HTTP API** | Language-agnostic connectors, streaming ingestion, maximum control over format and compression. The recommended default for new integrations. |
| **JDBC** | Java connectors, BI tools, and frameworks that already depend on a JDBC `DataSource`. |
| **Native client libraries** | Go, Python, and JavaScript connectors where idiomatic code and maximum throughput matter. The native protocol avoids HTTP overhead. |

:::note ClickHouse Cloud
ClickHouse Cloud exposes only HTTPS (port 8443) and the secure native port (9440). Design your integration to require TLS. Plaintext connections are not accepted.
:::

## Batch insert fundamentals {#batch-fundamentals}

Every `INSERT` statement creates a new on-disk data part. ClickHouse merges parts asynchronously in the background. If inserts arrive faster than merges complete, the active part count in a partition exceeds the default threshold (300 parts) and ClickHouse raises:

```text
DB::Exception: Too many parts (300). Merges are processing significantly slower than inserts.
```

This is the most common production failure mode for connector-driven ingest. The fix is always larger batches.

Rules:

- Minimum **1,000 rows per INSERT**; target **10,000–100,000 rows**
- No more than **1–2 INSERTs per second per table** from a single process
- Never INSERT one row at a time from an ORM loop

### HTTP (curl) {#batch-http}

```bash
curl --user "user:password" \
     "https://host:8443/?query=INSERT+INTO+events+FORMAT+JSONEachRow" \
     --data '{"user_id":"alice","event":"login","ts":"2024-01-15 12:00:00"}
{"user_id":"bob","event":"signup","ts":"2024-01-15 12:01:00"}'
```

### JDBC (Java) {#batch-jdbc}

```java
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO events (user_id, event, ts) VALUES (?, ?, ?)")) {
    for (Event e : batch) {
        ps.setString(1, e.userId());
        ps.setString(2, e.event());
        ps.setObject(3, e.ts());
        ps.addBatch();
    }
    ps.executeBatch();
}
```

Create a new `PreparedStatement` per batch cycle. In JDBC driver versions 0.8.6 and above, reusing a `PreparedStatement` across multiple `executeBatch()` calls re-inserts rows from all previous batches because the batch buffer is not cleared between executions.

### Python {#batch-python}

```python
client.insert(
    "events",
    data=rows,           # list of dicts or list of tuples
    column_names=["user_id", "event", "ts"],
)
```

See the [Python client reference](/integrations/python) for connection setup and driver options.

### Go {#batch-go}

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO events (user_id, event, ts)")
if err != nil {
    return err
}
for _, e := range rows {
    if err := batch.Append(e.UserID, e.Event, e.TS); err != nil {
        return err
    }
}
return batch.Send()
```

See the [Go client reference](/integrations/go) for connection setup.

### JavaScript {#batch-js}

```js
await client.insert({
    table: 'events',
    values: createReadStream('./events.ndjson'),
    format: 'JSONEachRow',
});
```

See the [JavaScript client reference](/integrations/javascript) for streaming and connection setup.

## Choosing an insert format {#insert-format}

| Format | Use when |
|---|---|
| **JSONEachRow** | Default for most connectors. One JSON object per line, easy to generate and stream, human-readable. |
| **RowBinary / RowBinaryWithNamesAndTypes** | High-volume pipelines where throughput is the bottleneck. Binary row format, type-safe, no JSON serialization overhead. |
| **Native** | Highest performance. Binary columnar format. Use when using the native client library directly; not practical over generic HTTP. |
| **CSV / TSV** | File-based imports and spreadsheet tools. |
| **Parquet / Arrow** | Data lakehouse integrations; columnar exchange with Spark, dbt, DuckDB. |

Use **JSONEachRow** as the default for new integrations. Switch to **RowBinary** when profiling shows serialization or network throughput is the bottleneck.

```bash
# JSONEachRow insert over HTTP
curl --user "user:password" \
     "https://host:8443/?query=INSERT+INTO+events+FORMAT+JSONEachRow" \
     --data-binary @events.ndjson

# RowBinaryWithNamesAndTypes — types are self-described in the header
curl --user "user:password" \
     "https://host:8443/?query=INSERT+INTO+events+FORMAT+RowBinaryWithNamesAndTypes" \
     --data-binary @events.rowbinary
```

## Async insert {#async-insert}

`async_insert=1` tells the server to buffer incoming inserts and flush them in bulk. This is useful when the client cannot form large batches — for example, many small producers writing individual events.

### Enabling via HTTP {#async-insert-http}

```bash
curl --user "user:password" \
     "https://host:8443/?async_insert=1&wait_for_async_insert=1" \
     --data "INSERT INTO events FORMAT JSONEachRow {\"user_id\":\"alice\",\"event\":\"login\"}"
```

### Enabling via JDBC {#async-insert-jdbc}

```java
Properties props = new Properties();
props.setProperty("async_insert", "1");
props.setProperty("wait_for_async_insert", "1");
Connection conn = DriverManager.getConnection("jdbc:ch:https://host:8443/db", props);
```

### Critical gotchas {#async-insert-gotchas}

**`SETTINGS` placement.** The `SETTINGS` clause must appear before `VALUES` in an INSERT statement:

```sql
-- Correct
INSERT INTO events SETTINGS async_insert=1 VALUES (?, ?)

-- Wrong — server does not detect async mode; parts accumulate rapidly
INSERT INTO events VALUES (?, ?) SETTINGS async_insert=1
```

**`wait_for_async_insert=0` silently drops bad data.** With fire-and-forget mode, the server returns HTTP 200 immediately — before the buffer is validated or flushed. If a row has a type error, the entire buffered batch is silently dropped. No error is returned to the client.

Use `wait_for_async_insert=1` in most connectors to get synchronous error feedback. Reserve `wait_for_async_insert=0` for pipelines where you accept eventual delivery and are not doing per-insert validation.

**Monitor for silent failures.** Query `system.asynchronous_insert_log` to detect dropped batches:

```sql
SELECT
    event_time,
    table,
    rows,
    status,
    exception
FROM system.asynchronous_insert_log
WHERE status != 'Ok'
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC;
```

## Idempotent inserts with deduplication {#deduplication}

Set `insert_deduplication_token` to a stable identifier per logical batch (for example, `job_id + batch_number`). ClickHouse records a checksum for each insert and silently skips re-inserts with the same token within the deduplication window (default: last 100 inserts).

```bash
curl --user "user:password" \
     "https://host:8443/?insert_deduplication_token=pipeline-job-42-batch-007" \
     --data "INSERT INTO events FORMAT JSONEachRow ..."
```

On retry after a network error, send the same token. If the original insert succeeded, the retry is a no-op. If it did not, ClickHouse processes it normally.

### Edge cases {#deduplication-edge-cases}

**Deduplication is per-shard.** On a distributed cluster, retrying on a different shard will insert a duplicate. Pin retries to the same shard, or use an idempotent downstream merge strategy.

**`ALTER TABLE DELETE` does not clear deduplication checksums.** If you delete rows and then retry an insert with the same original content and token, ClickHouse considers it already seen and silently drops it. Assign a new token when re-inserting after a deletion.

**The deduplication window is finite.** Only the last 100 inserts are tracked by default (configurable via `replicated_deduplication_window`). Retries beyond that window are not deduplicated.

**Columns with non-deterministic defaults bypass deduplication.** A column with `DEFAULT rand()` or `DEFAULT now()` produces a different row checksum on each attempt — the two inserts are not considered duplicates and both are written. Use an explicit, stable value instead if deduplication matters for that column.

## Writing missing JSON fields and DEFAULT expressions {#json-defaults}

When inserting JSON payloads that omit some columns, `input_format_skip_unknown_fields=1` drops fields that do not exist in the table schema. However, columns absent from the JSON receive the **type default** (0 for integers, empty string for strings) — not the DDL `DEFAULT` expression.

To invoke DDL defaults like `DEFAULT now()` or `DEFAULT generateUUIDv4()`, enable both settings together:

```bash
curl --user "user:password" \
     "https://host:8443/?input_format_skip_unknown_fields=1&input_format_defaults_for_omitted_fields=1" \
     --data "INSERT INTO events FORMAT JSONEachRow {\"user_id\":\"alice\",\"event\":\"login\"}"
```

With `input_format_defaults_for_omitted_fields=1`, a column with `DEFAULT generateUUIDv4()` that is absent from the JSON will receive a new UUID per row. Without it, that column receives an empty string.

## Schema evolution {#schema-evolution}

### Adding columns {#schema-add-column}

`ALTER TABLE ... ADD COLUMN` is a metadata-only operation — no data is rewritten. New rows receive the specified default; existing rows return the `DEFAULT` expression value on read.

```sql
ALTER TABLE events ADD COLUMN region LowCardinality(String) DEFAULT '';
```

### Dropping columns {#schema-drop-column}

Dropping a column is safe but irreversible. Before dropping, check for dependent Materialized Views and dictionaries:

```sql
SELECT database, name, query
FROM system.tables
WHERE engine = 'MaterializedView'
  AND query LIKE '%my_column%';
```

### Adding enum values {#schema-add-enum}

Adding a value to an `Enum` column that is **not** in the `ORDER BY` key is a zero-cost metadata change. If the `Enum` column is part of the `ORDER BY` or partition key, adding values requires a full table rebuild. For value sets that may grow over time, use `LowCardinality(String)` instead.

### Changing column types {#schema-change-type}

Type changes require a background mutation that rewrites affected parts:

```sql
ALTER TABLE events MODIFY COLUMN payload String;
```

Mutations run asynchronously. Poll `system.mutations WHERE is_done = 0` to track progress. Run type changes during low-traffic windows — they compete for I/O with normal query workload.

## CDC and upsert patterns {#cdc-upsert}

ClickHouse has no ACID transactions and no native `UPDATE` statement. Use the appropriate table engine for your update pattern.

### ReplacingMergeTree {#cdc-replacing}

Append rows with the same primary key; the engine retains the latest version during background merges. Use this for CDC pipelines where the source emits full row snapshots.

```sql
CREATE TABLE users (
    user_id  UInt64,
    name     String,
    email    String,
    version  UInt64
) ENGINE = ReplacingMergeTree(version)
ORDER BY user_id;
```

Insert new and updated rows as normal appends:

```sql
INSERT INTO users (user_id, name, email, version) VALUES
    (1, 'Alice', 'alice@example.com', 1704067200),
    (1, 'Alice', 'alice@new.example.com', 1704153600);
```

Merges happen asynchronously. To read deduplicated results immediately, add `FINAL`:

```sql
SELECT * FROM users FINAL WHERE user_id = 1;
```

`FINAL` forces deduplication at query time and has a performance cost. For high-read workloads, prefer scheduling periodic `OPTIMIZE TABLE users FINAL` during off-peak hours instead.

### CollapsingMergeTree {#cdc-collapsing}

For CDC systems that emit discrete change events, `CollapsingMergeTree` uses a `sign` column: `1` for inserts and `-1` for deletes. The engine cancels paired rows during merge.

```sql
CREATE TABLE user_events (
    user_id  UInt64,
    state    String,
    sign     Int8
) ENGINE = CollapsingMergeTree(sign)
ORDER BY user_id;

-- Insert
INSERT INTO user_events VALUES (1, 'active', 1);

-- Delete (cancel previous state)
INSERT INTO user_events VALUES (1, 'active', -1);

-- Insert new state
INSERT INTO user_events VALUES (1, 'churned', 1);
```

### Avoid ALTER TABLE DELETE for high-frequency changes {#cdc-avoid-delete}

`ALTER TABLE ... DELETE` is an asynchronous mutation. It returns success immediately but rewrites affected parts in the background. A `SELECT` immediately after a `DELETE` may still return the deleted rows. Do not use it for per-row or per-event deletes — use `ReplacingMergeTree` or `CollapsingMergeTree` instead.

## Materialized views and row counts {#mv-row-counts}

When a Materialized View exists on a source table, the `rows_affected` count returned by an `INSERT` includes rows written to both the source table and all MV target tables. Inserting 1,000 rows returns `2,000 rows affected` with one MV attached.

Do not use server-reported row counts for ETL consistency validation. Use a post-insert count query instead:

```sql
SELECT count()
FROM events
WHERE ts >= {batch_start:DateTime64(3)}
  AND ts < {batch_end:DateTime64(3)};
```
