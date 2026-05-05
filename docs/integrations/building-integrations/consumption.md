---
sidebar_label: 'Consumption patterns'
sidebar_position: 3
keywords: ['clickhouse', 'integration', 'connector', 'query', 'schema', 'read', 'BI', 'type mapping', 'pagination']
description: 'Patterns for reading data from ClickHouse in connectors, BI tools, and analytics integrations'
slug: /integrations/building-integrations/consumption
title: 'Consumption patterns'
doc_type: 'guide'
---

# Consumption patterns

This guide covers how to read data from ClickHouse in a connector, BI tool, or analytics integration. It pairs with [Ingestion patterns](/integrations/building-integrations/ingestion) and the [integration development best practices](/integrations/building-integrations) index.

For language-specific query APIs, see the client reference pages: [Java/JDBC](/integrations/java), [Python](/integrations/python), [Go](/integrations/go), [JavaScript](/integrations/javascript).

## Schema discovery {#schema-discovery}

### Listing databases {#list-databases}

Query `system.databases` and exclude the built-in namespaces that users never interact with:

```sql
SELECT name
FROM system.databases
WHERE name NOT IN ('system', 'information_schema', 'INFORMATION_SCHEMA')
ORDER BY name
```

### Listing tables {#list-tables}

```sql
SELECT
    database,
    name,
    engine,
    total_rows,
    formatReadableSize(total_bytes) AS total_size,
    comment,
    is_temporary
FROM system.tables
WHERE database NOT IN ('system', 'information_schema', 'INFORMATION_SCHEMA')
  AND is_temporary = 0
ORDER BY database, name
```

`total_rows` is an estimate for some engines (e.g. ReplicatedMergeTree) and exact for others. It can be NULL for views — handle NULL in your display layer.

### Listing columns {#list-columns}

```sql
SELECT
    database,
    table,
    name,
    type,
    default_kind,
    default_expression,
    comment,
    is_in_primary_key,
    is_in_sorting_key
FROM system.columns
WHERE database NOT IN ('system', 'information_schema', 'INFORMATION_SCHEMA')
ORDER BY database, table, position
```

The `type` column gives the full unwrapped type string including `LowCardinality` and `Nullable` wrappers (e.g. `LowCardinality(Nullable(String))`). This is intentional — use it as your source of truth for type mapping. See [Stripping type modifiers](#strip-modifiers).

### Prefer system tables over INFORMATION_SCHEMA {#system-vs-information-schema}

`INFORMATION_SCHEMA` exists for SQL-standard compatibility but has several gaps that break connector logic:

- **Type fidelity**: `INFORMATION_SCHEMA.COLUMNS.DATA_TYPE` strips modifiers. `LowCardinality(Nullable(String))` may appear as just `character varying`. Use `system.columns.type` instead.
- **Row counts**: `INFORMATION_SCHEMA.TABLES.TABLE_ROWS` is always NULL. Use `system.tables.total_rows`.
- **Foreign keys**: `KEY_COLUMN_USAGE` and `REFERENTIAL_CONSTRAINTS` are always empty. ClickHouse has no foreign key constraints.
- **Primary keys via JDBC**: `DatabaseMetaData.getPrimaryKeys()` is approximate. ClickHouse has no primary key constraint in the relational sense — the ORDER BY columns act as the physical ordering key. Query `system.tables.sorting_key` for the actual sort key string and `system.columns.is_in_sorting_key` for per-column flags.

### Sorting key vs primary key {#sorting-key}

ClickHouse MergeTree tables have two related but distinct concepts:

- **Sorting key** (`ORDER BY`): determines the physical sort order on disk. Governs index pruning and merge behavior.
- **Primary key** (`PRIMARY KEY`): must be a prefix of the sorting key. If omitted, defaults to the full sorting key.

For query generation — including push-down predicates and sort-order-aware pagination — treat the sorting key as the effective primary key. Use `system.columns.is_in_sorting_key` to identify which columns participate, and `system.tables.sorting_key` for the full expression string.

```sql
SELECT sorting_key, primary_key
FROM system.tables
WHERE database = {db:String} AND name = {table:String}
```

## Type mapping {#type-mapping}

### Stripping type modifiers {#strip-modifiers}

The raw `type` string from `system.columns` includes wrappers that must be stripped before mapping to target types. The two wrappers are:

- `Nullable(T)` — mark the column as nullable, then map `T`
- `LowCardinality(T)` — dictionary-encoded on disk; treat identically to `T` for all practical purposes

Both can nest: `LowCardinality(Nullable(String))` → `String` + nullable.

Strip by repeatedly checking and removing the outermost wrapper:

```python
import re

def strip_modifiers(ch_type: str) -> tuple[str, bool]:
    """Return (base_type, is_nullable) after stripping LowCardinality/Nullable."""
    nullable = False
    while True:
        if ch_type.startswith("Nullable(") and ch_type.endswith(")"):
            ch_type = ch_type[len("Nullable("):-1]
            nullable = True
        elif ch_type.startswith("LowCardinality(") and ch_type.endswith(")"):
            ch_type = ch_type[len("LowCardinality("):-1]
        else:
            break
    return ch_type, nullable
```

After stripping, match against the base type name (e.g. `String`, `Int32`, `DateTime64(3, 'UTC')`).

### Numeric type mapping {#numeric-mapping}

| ClickHouse type | Java | Python | Go |
|---|---|---|---|
| `Int8` | `Byte` | `int` | `int8` |
| `Int16` | `Short` | `int` | `int16` |
| `Int32` | `Integer` | `int` | `int32` |
| `Int64` | `Long` | `int` | `int64` |
| `Int128` / `Int256` | `BigInteger` | `int` | `*big.Int` |
| `UInt8` | `Short` | `int` | `uint8` |
| `UInt16` | `Integer` | `int` | `uint16` |
| `UInt32` | `Long` | `int` | `uint32` |
| `UInt64` | `BigInteger` | `int` | `uint64` |
| `Float32` | `Float` | `float` | `float32` |
| `Float64` | `Double` | `float` | `float64` |
| `Decimal(P, S)` | `BigDecimal` | `Decimal` | `*big.Float` |

`UInt64` exceeds `Long.MAX_VALUE` (2^63 - 1). In Java, use `BigInteger` or unsigned long arithmetic. In JSON output, see [64-bit integers in JSON](#js-int64).

### String types {#string-types-mapping}

- **`String`**: raw bytes, UTF-8 by convention. Map to `String` / `str` / `string`.
- **`FixedString(N)`**: stored as exactly N bytes, zero-padded. Strip trailing null bytes (`\x00`) before displaying or comparing. Do not expose raw `FixedString` values to end users without stripping.
- **`Enum8` / `Enum16`**: returned as their string labels by default over HTTP and JDBC. Access the underlying integer with `CAST(col AS Int8)` / `CAST(col AS Int16)`.

### Date and time types {#datetime-mapping}

| ClickHouse type | Java | Python | Go |
|---|---|---|---|
| `Date` | `LocalDate` | `datetime.date` | `time.Time` (date only) |
| `Date32` | `LocalDate` | `datetime.date` | `time.Time` (date only) |
| `DateTime` | `ZonedDateTime` | `datetime` (with tz) | `time.Time` |
| `DateTime64(n)` | `ZonedDateTime` | `datetime` (with tz) | `time.Time` |
| `Time` | `LocalTime` | `datetime.time` | `time.Duration` |
| `Time64(n)` | `LocalTime` | `datetime.time` | `time.Duration` |

`Time` and `Time64` are new in ClickHouse 25.6. Check server version before relying on them.

`DateTime` and `DateTime64` carry a timezone that can be set at the column level or at the server level. Parse the timezone from the type string when present: `DateTime64(3, 'America/New_York')`.

**Do not use `session_timezone`**. It is experimental and can invalidate partition pruning by changing how DateTime literals are interpreted. Convert timezones in the application layer using the column's declared timezone.

### Complex types {#complex-type-mapping}

| ClickHouse type | HTTP (JSONEachRow) | JDBC |
|---|---|---|
| `Array(T)` | JSON array | `java.sql.Array` |
| `Map(K, V)` | JSON object | `Map<K, V>` via `getObject()` |
| `Tuple(T1, T2, ...)` | JSON array (positional) | `List<Object>` via `getObject()` |
| `UUID` | Standard UUID string | `java.util.UUID` |
| `IPv4` | Dotted-decimal string | `String` |
| `IPv6` | Colon-hex string | `String` |

Additional notes:

- **`JSON` / `Variant` / `Dynamic`**: introduced in ClickHouse 24.x. Connector support is limited. Cast to `String` or extract sub-paths in the `SELECT` clause until your client library adds native support.
- **`AggregateFunction`**: contains binary intermediate state. It is not human-readable and cannot be decoded by generic connectors. Exclude `AggregateFunction` columns from user-facing column lists. Users interact with them via `-Merge` combinators (e.g. `sumMerge`, `avgMerge`).

### Identifiers are case-sensitive {#case-sensitivity}

Database names, table names, column names, and most function names are case-sensitive in ClickHouse. `MyTable` and `mytable` are different tables.

When generating SQL from schema discovery results, always preserve the exact casing returned by `system.tables` and `system.columns`. Wrap identifiers in double quotes if they conflict with reserved words or contain special characters:

```sql
SELECT "from", "Order", city FROM "MyDatabase"."MyTable"
```

## Querying patterns {#query-patterns}

### Always use parameterized queries {#parameterized}

Never concatenate user-supplied values into query strings. ClickHouse supports parameterized queries on both the HTTP API and JDBC.

**HTTP API** — use `{name:Type}` placeholders in the query body and pass values as `param_name` query parameters:

```http
POST /query?param_user_id=42&param_min_date=2024-01-01 HTTP/1.1
Host: my-instance.clickhouse.cloud:8443
X-ClickHouse-User: default
X-ClickHouse-Key: <password>

SELECT *
FROM events
WHERE user_id = {user_id:UInt64}
  AND created_at >= {min_date:Date}
LIMIT 1000
```

**JDBC** — use `PreparedStatement`:

```java
PreparedStatement ps = conn.prepareStatement(
    "SELECT * FROM events WHERE user_id = ? AND created_at >= ? LIMIT 1000"
);
ps.setLong(1, userId);
ps.setDate(2, java.sql.Date.valueOf(minDate));
ResultSet rs = ps.executeQuery();
```

### HTTP 200 does not mean success {#http-200-error}

ClickHouse sends an HTTP `200 OK` before it knows whether the query will complete successfully — the status line is written before query execution begins. Errors appear either in the `X-ClickHouse-Exception-Code` response header or mid-stream in the response body.

Always handle errors on HTTP responses as follows:

1. **Check `X-ClickHouse-Exception-Code`** on every response, regardless of HTTP status code. A non-empty value means the query failed.
2. **Scan the body** for `Code: NNN. DB::Exception:` when consuming a streaming response. This string signals a server-side error that terminated the stream mid-result.
3. **Force synchronous error reporting** by adding `wait_end_of_query=1` to the request. This buffers the entire result server-side before sending any bytes, so the HTTP status code is accurate. Use only for small results — buffering a large result set on the server defeats streaming and risks OOM.

```http
POST /query?wait_end_of_query=1 HTTP/1.1
```

### Streaming large result sets {#streaming}

Use a streaming format for any query that might return large results. `JSON` and `JSONCompact` buffer the entire result set before sending — they will OOM on large exports.

Recommended streaming formats:

| Format | Use case |
|---|---|
| `JSONEachRow` | Human-readable, self-describing, easy to parse line-by-line |
| `TabSeparated` / `TabSeparatedWithNames` | High-throughput exports, simple parsing |
| `RowBinary` | Maximum throughput, compact wire format |

**Python** — streaming with `requests`:

```python
import requests

with requests.post(
    "https://my-instance.clickhouse.cloud:8443/",
    params={"query": "SELECT * FROM events FORMAT JSONEachRow"},
    auth=("default", password),
    stream=True,
) as resp:
    resp.raise_for_status()
    for line in resp.iter_lines():
        if line:
            row = json.loads(line)
            process(row)
```

**Go** — streaming with `database/sql`:

```go
rows, err := db.QueryContext(ctx, "SELECT id, name, created_at FROM events")
if err != nil {
    return err
}
defer rows.Close()

for rows.Next() {
    var id int64
    var name string
    var createdAt time.Time
    if err := rows.Scan(&id, &name, &createdAt); err != nil {
        return err
    }
    process(id, name, createdAt)
}
return rows.Err()
```

**JavaScript** — streaming with the ClickHouse JS client:

```javascript
const resultSet = await client.query({
    query: 'SELECT * FROM events',
    format: 'JSONEachRow',
});

const stream = resultSet.stream();
for await (const rows of stream) {
    for (const row of rows) {
        process(row.json());
    }
}
```

### Set timeouts {#timeouts}

Always set `max_execution_time` (in seconds) in query settings to prevent runaway queries from consuming server resources indefinitely.

The client-side socket timeout must be **strictly greater** than `max_execution_time`. If the socket timeout fires first, the client drops the connection, but the server continues executing the query with no way to cancel it from that connection.

```http
POST /query?max_execution_time=30 HTTP/1.1
```

For out-of-band cancellation, issue `KILL QUERY` from a separate connection using the `query_id` you assigned:

```sql
KILL QUERY WHERE query_id = '550e8400-e29b-41d4-a716-446655440000'
```

See [Tagging queries](#tagging) for how to assign a deterministic `query_id`.

### Pagination {#pagination}

`LIMIT`/`OFFSET` degrades linearly as the offset grows — ClickHouse must scan and discard the first N rows on every page. It also has a documented correctness issue at certain offset values with some table engines.

Use keyset (cursor-based) pagination instead:

```sql
SELECT id, name, created_at
FROM events
WHERE created_at < {cursor:DateTime64(3)}
ORDER BY created_at DESC
LIMIT 1000
```

On each page, pass the `created_at` of the last row as the next cursor value. The cursor column should be part of the sorting key so that ClickHouse can prune data granules instead of scanning the full table.

For very large exports (millions of rows), stream the full result set rather than paginating — see [Streaming large result sets](#streaming).

### 64-bit integers in JSON (JavaScript) {#js-int64}

`Int64` and `UInt64` values in ClickHouse JSON output are sent as bare JSON numbers by default. JavaScript's `JSON.parse()` silently loses precision for integers above 2^53 because it maps all numbers to `float64`.

Set `output_format_json_quote_64bit_integers=1` to receive 64-bit integers as quoted strings:

```http
POST /query?output_format_json_quote_64bit_integers=1 HTTP/1.1
```

Output changes from:

```json
{"id": 9223372036854775807}
```

to:

```json
{"id": "9223372036854775807"}
```

Parse these with a BigInt-aware library in your connector.

## Connection management {#connection-management}

### Connection pooling {#pooling}

ClickHouse uses stateless HTTP — there is no server-side session to maintain between requests. Pool HTTP connections (TCP sockets), not logical sessions.

Recommended HikariCP settings for typical BI workloads:

```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:ch://my-instance.clickhouse.cloud:8443/default?ssl=true");
config.setUsername("default");
config.setPassword(password);
config.setMaximumPoolSize(20);
config.setConnectionTimeout(5_000);
config.setMaxLifetime(270_000);   // 4.5 min — below server keep_alive_timeout
config.setKeepaliveTime(60_000);
config.setConnectionTestQuery("SELECT 1");
```

The `maxLifetime` setting is critical: it must be below the server's `keep_alive_timeout`. ClickHouse Cloud sets this to 10 seconds by default; self-hosted clusters vary. If a pooled connection outlives the server's idle timeout, the next request on that connection receives a broken-pipe error. Setting `maxLifetime` to 270,000 ms (4.5 minutes) is a safe default for self-hosted deployments where `keep_alive_timeout` is typically 300 seconds.

For non-Java connectors, configure the equivalent HTTP keep-alive and connection TTL settings on your HTTP client.

### ClickHouse Cloud: auto-pause and warm-up {#cloud-autopause}

Development tier services on ClickHouse Cloud auto-pause after a period of inactivity. The first connection after a pause can take 10–30 seconds while the service resumes.

Design your connection setup to retry with exponential backoff before surfacing an error:

```python
import time
import clickhouse_connect

def connect_with_retry(host, user, password, retries=5, delay=2.0):
    for attempt in range(retries):
        try:
            client = clickhouse_connect.get_client(
                host=host, user=user, password=password, secure=True
            )
            client.ping()
            return client
        except Exception as e:
            if attempt == retries - 1:
                raise
            time.sleep(delay * (2 ** attempt))
```

Do not surface the first connection failure to the user immediately — auto-pause recovery is expected behavior, not an error.

## Observability {#observability}

### Tagging queries {#tagging}

Assign a `query_id` and `log_comment` to every query your connector issues. This makes queries attributable in `system.query_log`, which is essential for debugging slow queries and auditing.

**HTTP** — set headers on each request:

```http
POST /query HTTP/1.1
X-ClickHouse-Query-Id: 550e8400-e29b-41d4-a716-446655440000
X-ClickHouse-Log-Comment: superset:dashboard:42:chart:7
```

Use a deterministic `query_id` scheme (e.g. `<job-name>:<sequence>` or a UUID derived from the query content) so that retries produce the same ID and duplicates are easy to spot in `system.query_log`.

**JDBC** — ClickHouse JDBC exposes `ClickHouseStatement` which accepts settings:

```java
Statement stmt = conn.createStatement();
ClickHouseStatement chStmt = stmt.unwrap(ClickHouseStatement.class);
chStmt.setOption("query_id", "550e8400-e29b-41d4-a716-446655440000");
chStmt.setOption("log_comment", "superset:dashboard:42:chart:7");
ResultSet rs = stmt.executeQuery("SELECT ...");
```

### system.query_log flush latency {#query-log-latency}

`system.query_log` is written asynchronously. The default flush interval is approximately 7.5 seconds. Do not query `system.query_log` immediately after issuing a query — the row may not exist yet.

If your connector needs to read query metadata (e.g. rows read, elapsed time) after execution, either:

- Add a delay of at least 10 seconds before querying `system.query_log`.
- Poll with retry until the row appears:

```sql
SELECT
    query_id,
    read_rows,
    read_bytes,
    result_rows,
    query_duration_ms,
    exception
FROM system.query_log
WHERE query_id = {query_id:String}
  AND type = 'QueryFinish'
LIMIT 1
```

The `type` column distinguishes query lifecycle events: `QueryStart`, `QueryFinish`, `ExceptionBeforeStart`, `ExceptionWhileProcessing`. Filter to `QueryFinish` for completed queries.
