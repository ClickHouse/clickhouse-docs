---
sidebar_label: 'Building Integrations'
sidebar_position: 10
keywords: ['clickhouse', 'integration', 'connector', 'developer', 'JDBC', 'HTTP', 'ISV', 'best practices']
description: 'Best practices for ISVs and developers building integrations, connectors, and tools on top of ClickHouse'
slug: /integrations/building-integrations
title: 'Integration Development Best Practices'
doc_type: 'guide'
---

# Integration Development Best Practices

This guide is for developers building integrations on top of ClickHouse — BI tool connectors, ETL/ELT pipelines, data catalog adapters, IDE plugins, or any software that connects to ClickHouse on behalf of end users. It covers connectivity choices, schema discovery, data type mapping, query patterns, observability, and ClickHouse Cloud specifics.

If you are a developer writing an application that happens to use ClickHouse directly, the [language client documentation](/integrations/java) is a better starting point.

## Choosing a connectivity protocol {#connectivity}

ClickHouse exposes several interfaces. Choose the one that best fits your integration's language and architecture:

| Protocol | Port | Best for |
|---|---|---|
| **HTTP API** | 8123 (HTTP), 8443 (HTTPS) | Custom connectors in any language, REST-oriented tools, maximum control over format and compression |
| **JDBC** | 8123 / 8443 | Java-based integrations, BI tools and frameworks that expect a standard JDBC `DataSource` |
| **ODBC** | 8123 / 8443 | Windows-native tools, Excel, legacy enterprise software |
| **Native TCP** | 9000 / 9440 | Internal tooling where maximum throughput is required; not recommended for external integrations as the protocol is not versioned for stability |
| **MySQL wire protocol** | 9004 | Tools with built-in MySQL support and no ClickHouse driver available |
| **PostgreSQL wire protocol** | 9005 | Tools with built-in PostgreSQL support and no ClickHouse driver available |

**HTTP API is the recommended foundation** for new integrations. It is stable, format-agnostic, works from any language, and exposes the full feature set of ClickHouse. JDBC is the best choice when your integration targets the Java ecosystem or needs to interoperate with JDBC-aware frameworks.

:::note ClickHouse Cloud
ClickHouse Cloud exposes only the HTTPS port (8443) and the secure native port (9440). Plaintext HTTP connections are not accepted. Design your integration to require TLS from the start.
:::

## Authentication {#authentication}

ClickHouse uses username and password authentication. Pass credentials either as HTTP Basic Auth headers or as URL parameters.

### HTTP API {#auth-http-api}

```bash
# Basic Auth (recommended — credentials not in URL)
curl --user "myuser:mypassword" \
     "https://my-service.clickhouse.cloud:8443/?query=SELECT+1"

# URL parameters (convenient for testing, avoid in production)
curl "https://my-service.clickhouse.cloud:8443/?user=myuser&password=mypassword&query=SELECT+1"
```

### JDBC {#auth-jdbc}

```java
Properties props = new Properties();
props.setProperty("user", System.getenv("CH_USER"));
props.setProperty("password", System.getenv("CH_PASSWORD"));
props.setProperty("ssl", "true");
props.setProperty("sslmode", "strict");

Connection conn = DriverManager.getConnection(
    "jdbc:ch:https://my-service.clickhouse.cloud:8443/my_db", props);
```

Never embed credentials in connection URLs that may appear in logs or error messages. Read them from environment variables or a secrets manager.

### Dedicated service accounts {#service-accounts}

Create a dedicated ClickHouse user for your integration with only the permissions it needs. Avoid connecting as `default`:

```sql
CREATE USER integration_user IDENTIFIED BY 'strong_password';
GRANT SELECT ON my_database.* TO integration_user;
-- Grant INSERT if your integration writes data
GRANT INSERT ON my_database.* TO integration_user;
```

### SSL/TLS {#ssl-tls}

Always use TLS for connections to ClickHouse Cloud and strongly recommended for self-managed production clusters. For HTTPS connections, `sslmode=strict` (the default) verifies the server certificate. Use `sslmode=none` only in isolated development environments — never in production or user-facing integrations.

## Schema discovery {#schema-discovery}

ClickHouse exposes rich metadata through `system.*` tables. Use these to enumerate databases, tables, columns, and other objects for features like schema browsers, column pickers, and query editors.

### Listing databases {#listing-databases}

```sql
SELECT name
FROM system.databases
WHERE engine NOT IN ('System')
ORDER BY name;
```

### Listing tables {#listing-tables}

```sql
SELECT
    database,
    name,
    engine,
    total_rows,
    formatReadableSize(total_bytes) AS size,
    comment
FROM system.tables
WHERE database NOT IN ('system', 'information_schema', 'INFORMATION_SCHEMA')
  AND is_temporary = 0
ORDER BY database, name;
```

### Listing columns {#listing-columns}

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
ORDER BY database, table, position;
```

### INFORMATION_SCHEMA {#information-schema}

ClickHouse also implements `INFORMATION_SCHEMA` for compatibility with tools that use standard SQL introspection queries. It covers a subset of metadata and is suitable when portability across databases matters:

```sql
SELECT table_schema, table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema NOT IN ('system', 'information_schema', 'INFORMATION_SCHEMA')
ORDER BY table_schema, table_name, ordinal_position;
```

:::note
Prefer `system.columns` over `INFORMATION_SCHEMA.columns` for ClickHouse-specific metadata like `is_in_sorting_key` and `is_in_primary_key`, which are important for generating efficient queries.
:::

## Data type mapping {#data-types}

ClickHouse has a richer type system than most databases your integration will encounter. The following sections cover the types that require special handling.

### Numeric types {#numeric-types}

ClickHouse signed integers map predictably. **Unsigned integers require care** — they exceed the range of their same-width signed Java/SQL counterparts and must be promoted:

| ClickHouse Type | Recommended Java/SQL mapping |
|---|---|
| Int8, Int16, Int32, Int64 | Byte, Short, Integer, Long |
| Int128, Int256 | BigInteger |
| UInt8 | Short |
| UInt16 | Integer |
| UInt32 | Long |
| UInt64 | BigInteger |
| UInt128, UInt256 | BigInteger |
| Float32, Float64 | Float, Double |
| Decimal32/64/128/256 | BigDecimal |

### String types {#string-types}

`String` in ClickHouse is a raw byte sequence with no enforced encoding (UTF-8 is conventional). `FixedString(N)` is zero-padded to N bytes when read — strip trailing null bytes (`\0`) before displaying values to users.

### Date and time types {#date-time-types}

| ClickHouse Type | Notes |
|---|---|
| `Date` | Days since 1970-01-01. No timezone. Map to `LocalDate`. |
| `Date32` | Extended date range. No timezone. Map to `LocalDate`. |
| `DateTime` | Unix timestamp in seconds, stored with optional server/session timezone. Map to `Instant` or `ZonedDateTime`. |
| `DateTime64(n)` | Sub-second precision (n = 0–9). Same timezone behavior as `DateTime`. |

`DateTime` and `DateTime64` values are affected by the server's or session's timezone setting. When generating queries, always set the session timezone explicitly to avoid ambiguity:

```sql
SET session_timezone = 'UTC';
SELECT toDateTime('2024-01-15 12:00:00') AS ts;
```

### Type modifiers {#type-modifiers}

Two modifiers wrap other types and must be handled by your integration:

- **`Nullable(T)`** — the column may contain NULL. Affects the type name returned in metadata (e.g., `Nullable(Int32)`). Strip the wrapper when mapping to target types.
- **`LowCardinality(T)`** — a dictionary-encoded form of T, used for performance. Treat identically to the underlying type for all practical purposes.

### Complex types {#complex-types}

| ClickHouse Type | Behavior |
|---|---|
| `Array(T)` | Nested arrays supported. Via JDBC, returned as `java.sql.Array`. Via HTTP, returned as JSON arrays. |
| `Map(K, V)` | Key-value pairs. Via HTTP, returned as a JSON object. |
| `Tuple(T1, T2, ...)` | Fixed-length heterogeneous sequence. Via HTTP, returned as a JSON array. |
| `Enum8`, `Enum16` | Returned as strings by default. Can be read as their underlying integer. |
| `UUID` | Returned as a string in `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` format over HTTP. |
| `IPv4`, `IPv6` | Returned as dotted-decimal / colon-hex strings over HTTP. |
| `JSON` | Returned as a JSON string. Supported in newer ClickHouse versions. |

`AggregateFunction` columns hold binary-encoded aggregate state. They are not human-readable and should generally be excluded from column listings exposed to end users.

## Query patterns {#queries}

### Use parameterized queries {#parameterized-queries}

Never concatenate user input into SQL strings. ClickHouse supports named query parameters that prevent SQL injection and improve query plan reuse.

**HTTP API:**

```bash
curl --user "user:password" \
     "https://host:8443/" \
     --data "SELECT * FROM events WHERE user_id = {user_id:String} AND event_date > {min_date:Date}" \
     -G --data-urlencode "param_user_id=alice" \
        --data-urlencode "param_min_date=2024-01-01"
```

Parameters are declared as `{name:type}` in the query and passed as `param_name` HTTP parameters.

**JDBC:**

```java
try (PreparedStatement ps = conn.prepareStatement(
        "SELECT * FROM events WHERE user_id = ? AND event_date > ?")) {
    ps.setString(1, userId);
    ps.setObject(2, LocalDate.parse("2024-01-01"));
    ResultSet rs = ps.executeQuery();
}
```

### Assign a query_id to every query {#query-id}

Set a deterministic `query_id` on each request. This lets you trace queries in `system.query_log`, cancel runaway queries, and implement idempotent retry logic.

**HTTP API:**

```bash
curl --user "user:password" \
     "https://host:8443/?query_id=my-connector-job-abc123" \
     --data "SELECT count() FROM events"
```

**JDBC:**

```java
Statement stmt = conn.createStatement();
stmt.unwrap(StatementImpl.class).getLocalSettings().queryId("my-connector-job-abc123");
ResultSet rs = stmt.executeQuery("SELECT count() FROM events");
```

If you retry a query after a timeout, reuse the same `query_id`. ClickHouse will return the result of the already-running query rather than executing it twice.

### Choose the right output format {#formats}

ClickHouse supports dozens of output formats. Choose based on what your integration needs:

| Format | Use when |
|---|---|
| `JSONEachRow` | Streaming row-by-row JSON; easy to parse incrementally |
| `JSONCompact` | Compact JSON with column names in a header; smaller than full JSON |
| `CSV` / `TSV` | Interoperability with spreadsheets and generic tools |
| `Parquet` | Columnar data exchange with data lakehouse tools |
| `RowBinary` / `Native` | Maximum throughput; binary format requiring type-aware deserialization |
| `Arrow` | In-memory columnar exchange with Apache Arrow-compatible tools |

For most connector use cases, `JSONEachRow` is the best default: it is easy to stream and parse without buffering the full response.

```bash
curl --user "user:password" \
     "https://host:8443/?default_format=JSONEachRow" \
     --data "SELECT user_id, event_name, created_at FROM events LIMIT 1000"
```

### Enable compression {#compression}

LZ4 compression over HTTP significantly reduces network transfer for large result sets and inserts, at negligible CPU cost. Enable it by sending the `Accept-Encoding` header:

```bash
curl --user "user:password" \
     -H "Accept-Encoding: lz4" \
     "https://host:8443/?enable_http_compression=1" \
     --data "SELECT * FROM large_table"
```

### Paginate large result sets {#pagination}

ClickHouse does not have native cursor-based pagination. Use `LIMIT` / `OFFSET` for small datasets, or keyset pagination for large ones:

```sql
-- Keyset pagination (efficient — avoids full scan for OFFSET)
SELECT user_id, event_name, created_at
FROM events
WHERE created_at < {last_seen_ts:DateTime64(3)}
ORDER BY created_at DESC
LIMIT 1000;
```

For very large exports, prefer streaming: consume `JSONEachRow` output incrementally rather than paginating.

### Set query timeouts {#timeouts}

Protect your integration from runaway queries. Pass `max_execution_time` (seconds) as a query setting:

```bash
curl --user "user:password" \
     "https://host:8443/?max_execution_time=30" \
     --data "SELECT ..."
```

```java
// JDBC — via server settings prefix
props.setProperty("clickhouse_setting_max_execution_time", "30");
```

## Writing data {#writes}

### Use batch inserts {#batch-inserts}

Always batch rows into a single INSERT rather than sending one row per request. The HTTP API accepts INSERT data as the request body:

```bash
# Insert CSV data
curl --user "user:password" \
     "https://host:8443/?query=INSERT+INTO+events+FORMAT+CSV" \
     --data-binary @events.csv

# Insert JSONEachRow inline
curl --user "user:password" \
     "https://host:8443/?query=INSERT+INTO+events+FORMAT+JSONEachRow" \
     --data '{"user_id":"alice","event_name":"login","created_at":"2024-01-15 12:00:00"}
{"user_id":"bob","event_name":"signup","created_at":"2024-01-15 12:01:00"}'
```

Aim for batches of **10,000–100,000 rows** per request for optimal throughput. Smaller batches create excessive part merges in MergeTree; larger batches increase memory pressure.

### JDBC batch inserts {#jdbc-batch-inserts}

```java
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO events (user_id, event_name, created_at) VALUES (?, ?, ?)")) {
    for (Event e : batch) {
        ps.setString(1, e.userId());
        ps.setString(2, e.eventName());
        ps.setObject(3, e.createdAt());
        ps.addBatch();
    }
    ps.executeBatch();
}
```

### ClickHouse has no ACID transactions {#no-transactions}

Do not rely on `BEGIN` / `COMMIT` / `ROLLBACK` for data consistency. ClickHouse is append-optimized. Design writes to be idempotent:

- Use `insert_deduplication_token` to make retries safe — ClickHouse will deduplicate inserts with the same token within a configurable window:

```bash
curl --user "user:password" \
     "https://host:8443/?insert_deduplication_token=batch-20240115-001" \
     --data "INSERT INTO events FORMAT JSONEachRow ..."
```

- Use `ReplacingMergeTree` for upsert semantics — the engine merges duplicate primary keys, keeping the row with the highest version value.

## Identifying your integration {#identification}

Always identify your integration in the HTTP `User-Agent` header and in per-query metadata. This makes queries attributable in `system.query_log`, which is invaluable for debugging customer issues and monitoring usage.

### Set a User-Agent header {#user-agent}

Use the format `product/version (context)`:

```bash
curl --user "user:password" \
     -H "User-Agent: MyBITool/3.2 (ClickHouse connector)" \
     "https://host:8443/?query=SELECT+1"
```

Via JDBC:

```java
props.setProperty("client_name", "MyBITool/3.2");
```

### Tag individual queries with log_comment {#log-comment}

Attach operation context to each query so customer support and the customer themselves can filter `system.query_log` by feature or job:

```bash
curl --user "user:password" \
     "https://host:8443/?log_comment=dashboard%3Arevenue-by-region" \
     --data "SELECT region, sum(revenue) FROM sales GROUP BY region"
```

### Query your tagged queries in system.query_log {#query-log}

```sql
SELECT
    query_id,
    query,
    log_comment,
    query_duration_ms,
    read_rows,
    read_bytes,
    exception
FROM system.query_log
WHERE http_user_agent LIKE 'MyBITool%'
  AND event_time > now() - INTERVAL 1 HOUR
  AND type = 'QueryFinish'
ORDER BY event_time DESC
LIMIT 50;
```

## Error handling {#error-handling}

### HTTP status codes {#http-status-codes}

| Status | Meaning |
|---|---|
| 200 | Query succeeded |
| 400 | Bad request (malformed query, invalid parameter) |
| 401 | Authentication failed |
| 403 | Permission denied |
| 404 | Database or table not found |
| 500 | Server-side error (query execution failure, OOM, etc.) |

ClickHouse returns error details in the response body and as `X-ClickHouse-Exception-Code` and `X-ClickHouse-Summary` HTTP headers. Always read the body on non-200 responses:

```text
Code: 60. DB::Exception: Table my_db.unknown_table doesn't exist. (UNKNOWN_TABLE)
```

The numeric code (`60`) is stable across releases and suitable for programmatic handling.

### Retry strategy {#retry-strategy}

Retry on:
- Network-level errors (connection refused, timeout)
- HTTP 500 where the exception code indicates a transient condition (e.g., server overload)

Do not retry on:
- HTTP 400 (bad query — retrying won't help)
- HTTP 403 (wrong permissions — retrying won't help)

Use exponential backoff with jitter. Reuse the same `query_id` on retries for INSERT operations so ClickHouse can deduplicate.

### Handling streaming errors {#streaming-errors}

When using streaming output formats (e.g., `JSONEachRow`), ClickHouse may have already started writing rows before encountering an error. Errors in this case are appended at the end of the response stream rather than returned as an HTTP 500. Always read the full stream and check for a trailing error block:

```json
{"user_id":"alice","value":1}
{"user_id":"bob","value":2}
{"exception":"Code: 241. Memory limit exceeded"}
```

## ClickHouse Cloud considerations {#cloud}

### Connection endpoints {#cloud-endpoints}

ClickHouse Cloud service endpoints follow this pattern:

```text
{service-id}.{region}.{cloud}.clickhouse.cloud:8443
```

Where `cloud` is `aws`, `gcp`, or `azure`. Always use port 8443 (HTTPS) — port 8123 is not available on Cloud.

### Auto-pause and connection retries {#auto-pause}

ClickHouse Cloud services on the development tier may auto-pause after a period of inactivity. An initial connection after a pause may take a few seconds to respond. Design your integration to retry connection attempts with a short backoff before surfacing an error to the user.

### ClickHouse Cloud API for programmatic management {#cloud-api}

If your integration needs to enumerate or provision Cloud services (rather than query data), use the [ClickHouse Cloud API](https://clickhouse.com/docs/cloud/manage/api/api-overview). It is separate from the query interface and uses API key authentication.

## Testing your integration {#testing}

### Test against both OSS and ClickHouse Cloud {#test-oss-cloud}

Behavioral differences between self-managed ClickHouse and ClickHouse Cloud are minimal for most integrations, but test both. Specifically:

- ClickHouse Cloud always requires TLS
- Some system table columns may differ between versions
- Auto-pause behavior is Cloud-only

### Cover edge-case data types {#test-edge-cases}

Most integration bugs are found with edge cases. Explicitly test:

- `Nullable` columns — verify NULLs round-trip correctly
- `UInt64` values near `Long.MAX_VALUE`
- `FixedString` — verify zero-byte stripping
- `DateTime64` with sub-second precision and non-UTC timezones
- Arrays and Maps — verify nested types survive serialization
- Empty result sets and single-row result sets

### Use system.query_log to verify behavior {#test-query-log}

After running your integration's test suite, inspect `system.query_log` to verify:
- Queries are attributed to your integration's `User-Agent`
- No unexpected full-table scans (check `read_rows` and whether the primary key is used)
- Insert queries have the expected `written_rows`

```sql
SELECT
    query_start_time,
    query,
    read_rows,
    written_rows,
    query_duration_ms,
    exception
FROM system.query_log
WHERE http_user_agent LIKE 'MyIntegration%'
  AND event_time > now() - INTERVAL 10 MINUTE
ORDER BY query_start_time;
```

## Implementation examples {#examples}

### HTTP API — Python connector skeleton {#example-python}

A minimal pattern for a Python-based connector that queries ClickHouse and streams results:

```python
import requests
from typing import Iterator

class ClickHouseConnector:
    def __init__(self, host: str, port: int, user: str, password: str):
        self.base_url = f"https://{host}:{port}/"
        self.session = requests.Session()
        self.session.auth = (user, password)
        self.session.headers.update({
            "User-Agent": "MyConnector/1.0 (ClickHouse integration)",
            "Accept-Encoding": "lz4",
        })

    def query_stream(self, sql: str, query_id: str = None) -> Iterator[dict]:
        params = {
            "default_format": "JSONEachRow",
            "enable_http_compression": "1",
            "max_execution_time": "60",
        }
        if query_id:
            params["query_id"] = query_id

        with self.session.post(
            self.base_url,
            data=sql,
            params=params,
            stream=True,
        ) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if line:
                    yield json.loads(line)

    def schema(self, database: str) -> list[dict]:
        sql = f"""
            SELECT name, type, is_in_primary_key, is_in_sorting_key
            FROM system.columns
            WHERE database = '{database}'
            ORDER BY table, position
        """
        return list(self.query_stream(sql))
```

### JDBC — Java BI connector skeleton {#example-jdbc}

A minimal pattern for a JDBC-based BI connector with connection pooling and query tagging:

```java
import com.clickhouse.jdbc.DataSource;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class ClickHouseJdbcConnector {

    private final HikariDataSource pool;

    public ClickHouseJdbcConnector(String host, int port, String database,
                                    String user, String password) {
        Properties props = new Properties();
        props.setProperty("user", user);
        props.setProperty("password", password);
        props.setProperty("ssl", "true");
        props.setProperty("sslmode", "strict");
        props.setProperty("client_name", "MyBITool/1.0");
        props.setProperty("socket_keepalive", "true");
        props.setProperty("compress", "1");

        HikariConfig config = new HikariConfig();
        config.setMaximumPoolSize(10);
        config.setMaxLifetime(300_000);
        config.setConnectionTimeout(5_000);
        config.setDataSource(new DataSource(
            String.format("jdbc:ch:https://%s:%d/%s", host, port, database), props));

        this.pool = new HikariDataSource(config);
    }

    public List<Map<String, Object>> query(String sql, String queryId) throws SQLException {
        try (Connection conn = pool.getConnection();
             Statement stmt = conn.createStatement()) {
            // tag the query for system.query_log attribution
            stmt.unwrap(StatementImpl.class)
                .getLocalSettings()
                .queryId(queryId);

            List<Map<String, Object>> rows = new ArrayList<>();
            try (ResultSet rs = stmt.executeQuery(sql)) {
                ResultSetMetaData meta = rs.getMetaData();
                int cols = meta.getColumnCount();
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    for (int i = 1; i <= cols; i++) {
                        row.put(meta.getColumnName(i), rs.getObject(i));
                    }
                    rows.add(row);
                }
            }
            return rows;
        }
    }
}
```

## Remote MCP integrations {#mcp}

Model Context Protocol (MCP) is an open standard that lets AI agents and LLM-powered tools discover and invoke capabilities exposed by a server. For ClickHouse integrations, MCP is the right surface when your integration is **AI-native** — meaning an agent or LLM is driving the queries — rather than a traditional BI tool, ETL pipeline, or application making programmatic requests.

| Integration type | Recommended surface |
|---|---|
| BI tool / query builder | JDBC or HTTP API |
| ETL / data pipeline | HTTP API or JDBC |
| AI agent / LLM assistant | Remote MCP server |
| IDE coding assistant | Local MCP server (stdio) or remote MCP |

### ClickHouse Cloud built-in remote MCP server {#mcp-cloud}

ClickHouse Cloud includes a fully managed remote MCP server. It requires no infrastructure to deploy and authenticates via OAuth 2.0.

**Endpoint:**

```text
https://mcp.clickhouse.cloud/mcp
```

**Transport:** Streamable HTTP (MCP standard)

**Authentication:** OAuth 2.0 — the MCP client initiates a browser-based OAuth flow using ClickHouse Cloud credentials on first connect.

**Capabilities:** 13 read-only tools across querying, schema discovery, service management, backups, ClickPipes, and billing. All tools are annotated with `readOnlyHint: true`.

Enable it per service in the ClickHouse Cloud console under **Connect → MCP**. Once enabled, point any MCP client at the endpoint above. See the [remote MCP setup guide](/use-cases/AI/MCP/remote_mcp) for IDE-specific configuration steps.

If your integration targets ClickHouse Cloud users, this is the fastest path to MCP connectivity — recommend it over building your own server.

### Open-source MCP server for self-hosted ClickHouse {#mcp-oss}

For integrations that must support self-hosted ClickHouse instances, use the [mcp-clickhouse](https://github.com/ClickHouse/mcp-clickhouse) open-source server as a starting point. It exposes three core tools (`run_query`, `list_databases`, `list_tables`) and supports both local stdio and remote HTTP/SSE transports.

### Building your own remote MCP server {#mcp-build}

Build a custom MCP server when you need tools or behavior that neither the Cloud server nor the open-source server provides — for example, domain-specific query templates, write operations under controlled conditions, or integration with your own auth system.

#### Choose the right transport {#mcp-transport}

| Transport | Use when |
|---|---|
| **stdio** | Local dev tools (Claude Code, Cursor, VS Code Copilot). No network exposure. |
| **Streamable HTTP** | Cloud-deployed servers, multi-tenant services, load-balanced deployments. The MCP standard transport for remote servers. |
| **SSE** (legacy) | Legacy MCP clients that predate Streamable HTTP. Prefer HTTP for new servers. |

For remote servers, Streamable HTTP is the current standard. Design stateless request handlers — do not store session state in memory, as load balancers will distribute requests across instances.

#### Authentication {#mcp-auth}

| Scenario | Recommended approach |
|---|---|
| User-facing (human authenticates) | OAuth 2.0 with PKCE — consistent with ClickHouse Cloud's own approach |
| Service-to-service (agent authenticates) | Static Bearer token via `Authorization` header; rotate regularly |
| Development / local-only | Disable auth (`CLICKHOUSE_MCP_AUTH_DISABLED=true`); never in production |

Always require authentication for any remotely accessible MCP server. The `/health` endpoint is the only route that should remain unauthenticated (for orchestrator probes).

#### Design read-only tools by default {#mcp-readonly}

Annotate every tool with `readOnlyHint: true` in its MCP metadata unless writes are explicitly part of your design. This signals to MCP hosts that the tool has no side effects, enabling better agent planning.

**`readOnlyHint` is advisory only** — it informs the LLM host but is not enforced. Apply server-side enforcement as well:

- Connect to ClickHouse with a **read-only user** (no INSERT, ALTER, DROP grants)
- Validate that query strings begin with `SELECT` or `WITH` before execution
- Use ClickHouse's `readonly` setting (`SET readonly = 1`) at the session level as a secondary guard:

```sql
SET readonly = 1;
SELECT ...
```

If your server must support writes (e.g., agent-driven INSERT), expose write tools under a separate, explicitly named operation, require an additional confirmation parameter, and log every invocation.

#### Apply resource limits to all queries {#mcp-limits}

Agents can generate unbounded queries. Always enforce limits to prevent runaway execution:

```bash
# Apply limits on the ClickHouse user level (recommended)
ALTER USER mcp_user SETTINGS
    max_execution_time = 30,       -- seconds
    max_result_rows = 10000,       -- rows returned to the agent
    max_bytes_to_read = 1073741824 -- 1 GB read limit
```

Or pass them per query via HTTP parameters:

```bash
curl --user "mcp_user:password" \
     "https://host:8443/?max_execution_time=30&max_result_rows=10000" \
     --data "SELECT ..."
```

10,000 rows is a reasonable ceiling for agent-readable results — LLMs cannot usefully process millions of rows. Design tool descriptions to guide agents toward aggregating queries rather than full table scans.

#### Write tool descriptions that constrain agent behavior {#mcp-descriptions}

Tool descriptions are read by the LLM to decide how and when to invoke a tool. Vague descriptions lead to over-use and inefficient queries. Be specific:

```python
# Too vague
Tool(
    name="run_query",
    description="Run a SQL query."
)

# Better
Tool(
    name="run_select_query",
    description=(
        "Execute a read-only SELECT query against ClickHouse. "
        "Use aggregation functions (count(), sum(), avg()) rather than returning raw rows when possible. "
        "Results are limited to 10,000 rows. "
        "Always include a WHERE clause or LIMIT to avoid full table scans."
    ),
    annotations={"readOnlyHint": True}
)
```

Include parameter descriptions that tell the agent what valid input looks like, including ClickHouse SQL syntax specifics (e.g., `count()` not `COUNT(*)`, `toDate()` for date literals).

#### Guard against prompt injection {#mcp-injection}

Query results returned by your MCP server flow back into the LLM's context. If a ClickHouse table contains user-generated text, that text could carry adversarial instructions targeting the agent.

Mitigations:
- **Limit result size** — small result sets reduce the attack surface
- **Return structured data** — prefer `JSONEachRow` and parse it server-side; avoid returning raw string columns that could contain markdown or instruction-like text directly into the agent's context
- **Sanitize schema names** — when returning database, table, or column names, strip or escape characters that could be interpreted as markdown formatting or instructions

#### Identify your MCP server in query logs {#mcp-observability}

Set a `User-Agent` and `log_comment` on all queries issued by your MCP server, exactly as you would for any integration. This makes it possible to distinguish agent-driven queries from human queries in `system.query_log`:

```python
params = {
    "log_comment": f"mcp:{tool_name}/session:{session_id}",
    "query_id": request_id,
}
headers = {
    "User-Agent": "MyMCPServer/1.0 (ClickHouse MCP)",
}
```

## Integration development checklist {#checklist}

- [ ] Integration uses HTTPS / TLS for all connections
- [ ] Credentials are read from environment variables or a secrets manager, not hardcoded
- [ ] A dedicated ClickHouse user with minimal permissions is used
- [ ] `User-Agent` header identifies the integration by name and version
- [ ] Every query carries a `query_id` for traceability and idempotent retries
- [ ] User-facing inputs pass through parameterized queries, not string concatenation
- [ ] Schema discovery queries exclude `system` and `information_schema` databases
- [ ] `Nullable` and `LowCardinality` type wrappers are stripped before type mapping
- [ ] `UInt64` and larger unsigned integers are mapped to `BigInteger` or equivalent
- [ ] `FixedString` values are stripped of trailing null bytes before display
- [ ] Bulk inserts use batches of 10,000–100,000 rows
- [ ] `insert_deduplication_token` is set for retry-safe inserts
- [ ] Streaming responses are fully consumed and checked for trailing error blocks
- [ ] Integration does not rely on JDBC transactions for consistency
- [ ] Integration tested against both ClickHouse OSS and ClickHouse Cloud
- [ ] Edge-case types (Nullable, UInt64, DateTime64, Array, Map) covered in tests
- **If building an MCP server:**
- [ ] Remote server uses Streamable HTTP transport and stateless request handlers
- [ ] All tools annotated with `readOnlyHint: true` unless writes are explicitly required
- [ ] Server-side enforcement: read-only ClickHouse user + SQL validation, not just `readOnlyHint`
- [ ] `max_execution_time`, `max_result_rows`, and `max_bytes_to_read` enforced on the ClickHouse user or per-query
- [ ] Tool descriptions guide agents toward aggregating queries; warn against full table scans
- [ ] `query_id` and `log_comment` set on every MCP-issued query for observability
- [ ] Prompt injection mitigations in place for result data flowing back to the LLM
