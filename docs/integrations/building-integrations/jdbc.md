---
sidebar_label: 'JDBC connector guide'
sidebar_position: 4
keywords: ['clickhouse', 'java', 'jdbc', 'connector', 'integration', 'HikariCP', 'schema', 'type mapping']
description: 'End-to-end guide for building a JDBC-based connector or integration on top of ClickHouse'
slug: /integrations/building-integrations/jdbc
title: 'JDBC connector guide'
doc_type: 'guide'
---

# JDBC connector guide

## Overview {#overview}

This guide is for Java developers building a BI tool connector, ETL integration, IDE plugin, or data catalog adapter that connects to ClickHouse via JDBC. It covers the full connector lifecycle: dependency setup, connection pooling, schema discovery, type mapping, query execution, batch inserts, and error handling.

This guide is opinionated. It documents the patterns that work reliably in production and calls out the known pitfalls in the current driver. It does not duplicate the JDBC API reference — for driver configuration options, supported settings, and version history, see the [JDBC driver reference](/integrations/java).

For language-agnostic connector patterns (HTTP API, format selection, observability, Cloud specifics), see:
- [Ingestion patterns](/integrations/building-integrations/ingestion)
- [Consumption patterns](/integrations/building-integrations/consumption)
- [Integration development best practices](/integrations/building-integrations)

---

## Maven setup {#maven-setup}

The current driver artifact is `com.clickhouse:clickhouse-jdbc`. Use the `all` classifier to include all transitive dependencies in a single jar, which avoids classpath conflicts in environments like application servers and BI tool plugin runtimes.

**Maven:**

```xml
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-jdbc</artifactId>
    <version>0.9.x</version>
    <classifier>all</classifier>
</dependency>
```

**Gradle:**

```groovy
implementation("com.clickhouse:clickhouse-jdbc:0.9.x:all") {
    transitive = false
}
```

The `transitive = false` flag is required when using the `all` classifier in Gradle — otherwise Gradle also resolves the transitive dependency graph and you end up with duplicate classes on the classpath.

**Do not use the legacy artifact** `ru.yandex.clickhouse:clickhouse-jdbc`. It is unmaintained and does not support current ClickHouse features or ClickHouse Cloud.

---

## Driver registration and connection URL {#connection-url}

The driver class is `com.clickhouse.jdbc.ClickHouseDriver`. In environments that support JDBC 4.0 service discovery (most modern JVMs and frameworks), explicit registration is not required. Register it manually only if your container does not auto-discover drivers from the classpath:

```java
Class.forName("com.clickhouse.jdbc.ClickHouseDriver");
```

### URL format {#url-format}

```text
jdbc:ch:https://host:port/database
```

Always use `https://` for ClickHouse Cloud. For self-managed instances with TLS, use `https://`. For local development only, `http://` is acceptable.

### DriverManager example {#driver-manager-example}

```java
Properties props = new Properties();
props.setProperty("user", System.getenv("CH_USER"));
props.setProperty("password", System.getenv("CH_PASSWORD"));
props.setProperty("ssl", "true");
props.setProperty("sslmode", "strict");
props.setProperty("client_name", "MyConnector/1.0");

Connection conn = DriverManager.getConnection(
    "jdbc:ch:https://my-service.clickhouse.cloud:8443/my_database",
    props
);
```

Never embed credentials in the URL string. Connection URLs may appear in logs, error messages, and thread dumps. Read credentials from environment variables or a secrets manager.

`client_name` sets the `http_user_agent` field in `system.query_log`, which is how you identify your connector's queries when debugging customer issues.

---

## Connection pooling with HikariCP {#connection-pool}

ClickHouse uses a stateless HTTP transport: each query is an independent HTTP request. There are no server-side sessions, no transaction state between requests, and no concept of a "connection" in the PostgreSQL or MySQL sense. What you are pooling is the underlying HTTP client and its keep-alive TCP connections — not logical database sessions.

This means connection pools behave well with ClickHouse, but some pool settings require tuning for the HTTP layer.

### Recommended HikariCP configuration {#hikari-config}

```java
import com.clickhouse.jdbc.ClickHouseDataSource;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

Properties dsProps = new Properties();
dsProps.setProperty("user", System.getenv("CH_USER"));
dsProps.setProperty("password", System.getenv("CH_PASSWORD"));
dsProps.setProperty("ssl", "true");
dsProps.setProperty("sslmode", "strict");
dsProps.setProperty("client_name", "MyConnector/1.0");
dsProps.setProperty("compress", "1");
dsProps.setProperty("socket_keepalive", "true");

ClickHouseDataSource dataSource = new ClickHouseDataSource(
    "jdbc:ch:https://my-service.clickhouse.cloud:8443/my_database",
    dsProps
);

HikariConfig config = new HikariConfig();
config.setDataSource(dataSource);
config.setMaximumPoolSize(10);
config.setMaxLifetime(270_000);
config.setConnectionTimeout(30_000);
config.setConnectionTestQuery("SELECT 1");
config.setKeepaliveTime(60_000);

HikariDataSource pool = new HikariDataSource(config);
```

### Key settings explained {#pool-settings}

**`maximumPoolSize: 10`** — For typical BI workloads where queries are issued serially per dashboard or per user session, 10 connections is sufficient. ClickHouse is fast at executing queries, so the limiting factor is usually query latency, not connection availability. Increase this only if profiling shows connection wait time.

**`maxLifetime: 270_000` (4.5 minutes)** — This must be less than ClickHouse Cloud's HTTP keep-alive timeout (approximately 10 seconds idle at the load balancer level, but connections are cycled more aggressively). Setting `maxLifetime` to 270,000 ms ensures HikariCP retires connections before they become stale at the network layer. Without this, long-lived idle connections receive broken-pipe errors on the next use. Note: 270s is a conservative value; tune it down if you observe connection errors in production.

**`connectionTimeout: 30_000` (30 seconds)** — ClickHouse Cloud services on the development tier auto-pause after inactivity. Waking a paused service can take several seconds. Setting a 30-second connection timeout prevents false failures on the first connection after a pause.

**`connectionTestQuery: SELECT 1`** — HikariCP uses this to validate connections before handing them to your application. `SELECT 1` is a no-op that returns in milliseconds and confirms the HTTP transport is alive.

**`dataSource` vs `jdbcUrl`** — Use `setDataSource` with an explicit `ClickHouseDataSource` instance (as shown above) rather than `setJdbcUrl`. The `jdbcUrl` path works but gives you less control over driver-level properties and makes it harder to pass `Properties` objects cleanly.

---

## Schema discovery {#schema-discovery}

ClickHouse exposes metadata via JDBC `DatabaseMetaData` and via `system.*` tables. Prefer `system.*` tables for any schema discovery that goes beyond basic enumeration — they carry ClickHouse-specific metadata that `DatabaseMetaData` does not expose, and they avoid the type-handling issues described below.

### Listing databases {#list-databases}

Via `DatabaseMetaData`:

```java
DatabaseMetaData meta = conn.getMetaData();
try (ResultSet rs = meta.getCatalogs()) {
    while (rs.next()) {
        System.out.println(rs.getString("TABLE_CAT"));
    }
}
```

Via direct SQL (preferred — filters system internals):

```java
String sql = """
    SELECT name
    FROM system.databases
    WHERE name NOT IN ('system', 'information_schema', 'INFORMATION_SCHEMA', '_temporary_and_external_tables')
    ORDER BY name
    """;
try (Statement stmt = conn.createStatement();
     ResultSet rs = stmt.executeQuery(sql)) {
    while (rs.next()) {
        System.out.println(rs.getString("name"));
    }
}
```

### Listing tables {#list-tables}

Via `DatabaseMetaData`:

```java
try (ResultSet rs = meta.getTables(database, null, "%", new String[]{"TABLE"})) {
    while (rs.next()) {
        System.out.println(rs.getString("TABLE_NAME"));
    }
}
```

Via direct SQL (preferred — includes engine and row-count metadata useful for BI tools):

```java
String sql = """
    SELECT
        name,
        engine,
        total_rows,
        formatReadableSize(total_bytes) AS size,
        sorting_key,
        comment
    FROM system.tables
    WHERE database = ?
      AND is_temporary = 0
    ORDER BY name
    """;
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, databaseName);
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            // process row
        }
    }
}
```

### Listing columns {#list-columns}

`DatabaseMetaData.getColumns()` has two known issues with ClickHouse:

1. Complex column types (`Array`, `Map`, `Tuple`, `Nested`) can produce `NullPointerException` in some driver versions when the type cannot be mapped to a standard `java.sql.Types` constant.
2. The `TYPE_NAME` column strips `Nullable(...)` and `LowCardinality(...)` wrappers, so you cannot determine nullability or encoding from the JDBC metadata alone.

Use `system.columns` instead:

```java
String sql = """
    SELECT
        name,
        type,
        default_kind,
        default_expression,
        comment,
        is_in_primary_key,
        is_in_sorting_key,
        position
    FROM system.columns
    WHERE database = ?
      AND table = ?
    ORDER BY position
    """;
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, databaseName);
    ps.setString(2, tableName);
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            String name = rs.getString("name");
            String type = rs.getString("type");  // full type, e.g. Nullable(LowCardinality(String))
            boolean inSortKey = rs.getBoolean("is_in_sorting_key");
        }
    }
}
```

The `type` column returns the full type declaration including all wrappers. Strip them in your type-mapping layer (see [Stripping type modifiers](#strip-modifiers)).

### getPrimaryKeys() limitation {#primary-keys}

`DatabaseMetaData.getPrimaryKeys()` returns approximate or empty results for ClickHouse tables. ClickHouse has no primary key constraint in the relational sense. The effective physical sort order is defined by the table's `ORDER BY` clause, which is stored in `system.tables.sorting_key`.

For accurate sort key discovery:

```java
String sql = "SELECT sorting_key FROM system.tables WHERE database = ? AND name = ?";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, databaseName);
    ps.setString(2, tableName);
    try (ResultSet rs = ps.executeQuery()) {
        if (rs.next()) {
            String sortingKey = rs.getString("sorting_key");
            // e.g., "tenant_id, created_at" — parse as comma-separated expression list
        }
    }
}
```

---

## Type mapping {#type-mapping}

### Stripping type modifiers {#strip-modifiers}

ClickHouse wraps base types in two modifiers that appear in type names returned by `system.columns`:

- `Nullable(T)` — the column accepts NULL values.
- `LowCardinality(T)` — the column uses dictionary encoding for performance. Treat it as identical to `T` for type-mapping purposes.

Both wrappers can be nested: `Nullable(LowCardinality(String))` is valid. Strip them before looking up a Java type:

```java
public static String stripModifiers(String clickHouseType) {
    String t = clickHouseType.trim();
    while (true) {
        if (t.startsWith("Nullable(") && t.endsWith(")")) {
            t = t.substring("Nullable(".length(), t.length() - 1).trim();
        } else if (t.startsWith("LowCardinality(") && t.endsWith(")")) {
            t = t.substring("LowCardinality(".length(), t.length() - 1).trim();
        } else {
            break;
        }
    }
    return t;
}
```

### Full type mapping table {#type-table}

| ClickHouse type | Java class | Notes |
|---|---|---|
| `Int8` | `Byte` | |
| `Int16` | `Short` | |
| `Int32` | `Integer` | |
| `Int64` | `Long` | |
| `Int128`, `Int256` | `BigInteger` | |
| `UInt8` | `Short` | Promoted to avoid unsigned overflow |
| `UInt16` | `Integer` | Promoted |
| `UInt32` | `Long` | Promoted |
| `UInt64` | `BigInteger` | Values above `Long.MAX_VALUE` overflow silently if cast to `long` — always use `BigInteger` |
| `UInt128`, `UInt256` | `BigInteger` | |
| `Float32` | `Float` | |
| `Float64` | `Double` | |
| `Decimal(P, S)` | `BigDecimal` | |
| `String` | `String` | Raw byte sequence; UTF-8 by convention |
| `FixedString(N)` | `String` | Zero-padded to N bytes — strip trailing `\0` before display |
| `Date`, `Date32` | `LocalDate` | Use `rs.getObject(col, LocalDate.class)` — `java.sql.Date` applies the JVM timezone and silently shifts dates |
| `DateTime`, `DateTime64` | `ZonedDateTime` | Use `rs.getObject(col, ZonedDateTime.class)` — `LocalDateTime` loses timezone context |
| `UUID` | `String` or `UUID` | |
| `Boolean` | `Boolean` | |
| `Enum8`, `Enum16` | `String` | Returned as the enum label |
| `Array(T)` | `java.sql.Array` | Call `.getArray()` to get a Java array; element type follows this mapping |
| `Map(K, V)` | `Object` | Cast via `rs.getObject(col)`; the concrete type is a `Map` |
| `Tuple(T1, T2, ...)` | `Object[]` | |
| `IPv4`, `IPv6` | `String` | Dotted-decimal / colon-hex |

### Handling Nullable and LowCardinality {#nullable-lc}

For any column whose `system.columns.type` starts with `Nullable(`, always call `rs.wasNull()` after reading the value to detect actual NULLs:

```java
long value = rs.getLong("some_nullable_int64");
if (rs.wasNull()) {
    // treat as NULL — do not use `value`
}
```

`LowCardinality` columns are transparent at the JDBC layer. Read them the same way as their underlying type.

---

## Executing queries {#queries}

### PreparedStatement parameters {#prepared-statement}

Use `PreparedStatement` for all queries that incorporate user-supplied values. Never concatenate user input into SQL strings.

```java
String sql = "SELECT event_name, count() AS cnt FROM events WHERE user_id = ? AND event_date >= ? ORDER BY cnt DESC LIMIT 100";

try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, userId);
    ps.setObject(2, LocalDate.of(2024, 1, 1));  // NOT java.sql.Date

    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            String eventName = rs.getString("event_name");
            long count = rs.getLong("cnt");
        }
    }
}
```

Pass `LocalDate` for `Date`/`Date32` columns and `ZonedDateTime` for `DateTime`/`DateTime64` columns. Using `java.sql.Date` or `java.sql.Timestamp` causes the JVM's default timezone to be applied, which produces incorrect values when the JVM timezone differs from the ClickHouse server timezone.

### Streaming results {#streaming-results}

By default, the JDBC driver buffers the entire result set in memory before returning the first row. For large result sets, this causes high memory pressure and delays before the first row is visible to the caller.

To enable forward-only streaming mode:

```java
Statement stmt = conn.createStatement(
    ResultSet.TYPE_FORWARD_ONLY,
    ResultSet.CONCUR_READ_ONLY
);
stmt.setFetchSize(Integer.MIN_VALUE);
ResultSet rs = stmt.executeQuery("SELECT * FROM large_table");
while (rs.next()) {
    // rows are delivered incrementally
}
```

For very large exports where memory overhead is unacceptable, consider using the [HTTP API directly](/integrations/building-integrations/consumption) with `JSONEachRow` format and chunked transfer, which gives you full control over the streaming pipeline.

### Query tagging {#query-tagging}

Tag every query with a `query_id` so it is traceable in `system.query_log`. This enables idempotent retries (reusing the same `query_id` on a retry causes ClickHouse to return the result of the already-running query rather than executing twice) and supports customer debugging workflows.

```java
import com.clickhouse.jdbc.internal.StatementImpl;

Statement stmt = conn.createStatement();
stmt.unwrap(StatementImpl.class)
    .getLocalSettings()
    .queryId("myconnector-dashboard-" + UUID.randomUUID());

ResultSet rs = stmt.executeQuery("SELECT region, sum(revenue) FROM sales GROUP BY region");
```

Use a deterministic ID format that encodes the operation type and a correlation token (e.g., a request ID from your framework). This makes it possible to look up a specific query without scanning the full log.

---

## Batch inserts {#batch-inserts}

### PreparedStatement batch {#ps-batch}

Use `PreparedStatement.addBatch()` / `executeBatch()` for bulk inserts. Target 10,000–100,000 rows per batch. Smaller batches create too many data parts and trigger `Too many parts` errors; larger batches increase per-request memory pressure.

```java
String sql = "INSERT INTO events (user_id, event_name, event_date, value) VALUES (?, ?, ?, ?)";

try (PreparedStatement ps = conn.prepareStatement(sql)) {
    for (Event e : batch) {
        ps.setString(1, e.userId());
        ps.setString(2, e.eventName());
        ps.setObject(3, e.eventDate());      // LocalDate
        ps.setObject(4, e.value());
        ps.addBatch();
    }
    ps.executeBatch();
}
```

### Critical: create a new PreparedStatement per batch {#ps-reuse-bug}

In JDBC driver versions 0.8.6 and above, reusing a `PreparedStatement` across multiple `executeBatch()` calls re-inserts all rows from every previous batch in addition to the current one. The internal batch buffer is not cleared between executions.

Always create a new `PreparedStatement` instance for each batch cycle. The try-with-resources pattern enforces this naturally:

```java
for (List<Event> batch : partitionedBatches) {
    try (PreparedStatement ps = conn.prepareStatement(
            "INSERT INTO events (user_id, event_name, event_date, value) VALUES (?, ?, ?, ?)")) {
        for (Event e : batch) {
            ps.setString(1, e.userId());
            ps.setString(2, e.eventName());
            ps.setObject(3, e.eventDate());
            ps.setObject(4, e.value());
            ps.addBatch();
        }
        ps.executeBatch();
    }
    // ps is closed and discarded here — never reused
}
```

Do not cache `PreparedStatement` objects for INSERT across batch calls. Caching is safe for SELECT statements, but not for INSERT batches until this driver bug is resolved.

### Async insert via JDBC {#async-insert}

`async_insert=1` buffers rows server-side and flushes in bulk, which lets you send small batches without causing a part explosion. Enable it as a connection property:

```java
props.setProperty("clickhouse_setting_async_insert", "1");
props.setProperty("clickhouse_setting_wait_for_async_insert", "1");
```

`wait_for_async_insert=1` makes the server respond only after the buffered data has been flushed and validated. Without it (`wait_for_async_insert=0`), the server returns immediately and type errors in the buffered batch are silently discarded with no error surfaced to the client. Use `wait_for_async_insert=1` in any pipeline where data loss must be detectable.

One syntax constraint: the `SETTINGS` clause in an INSERT must appear **before** `VALUES`. The driver constructs this correctly when you use `PreparedStatement`, but if you are building INSERT strings manually, verify the clause ordering:

```sql
-- Correct
INSERT INTO events SETTINGS async_insert=1 VALUES (?, ?)

-- Wrong — server does not detect async-insert mode
INSERT INTO events VALUES (?, ?) SETTINGS async_insert=1
```

---

## Error handling {#error-handling}

### ClickHouse exception codes {#exception-codes}

The JDBC driver wraps all ClickHouse errors as `java.sql.SQLException`. The ClickHouse error code is available via `e.getErrorCode()`. These codes are stable integers suitable for programmatic handling — do not parse the error message string.

| Code | Constant name | Notes |
|---|---|---|
| 60 | `UNKNOWN_TABLE` | Table does not exist — do not retry |
| 81 | `READONLY` | Transient: usually ZooKeeper connectivity loss — retry with backoff |
| 159 | `TIMEOUT_EXCEEDED` | Query exceeded `max_execution_time` — do not retry without modifying the query |
| 241 | `MEMORY_LIMIT_EXCEEDED` | Query exceeded memory limit — do not retry without modifying the query |
| 164 | `READONLY_SETTING` | Attempt to set a readonly server setting |
| 516 | `AUTHENTICATION_FAILED` | Wrong credentials — do not retry |

```java
try {
    ps.executeBatch();
} catch (SQLException e) {
    switch (e.getErrorCode()) {
        case 81:
            // READONLY — ZooKeeper issue, retry with backoff
            scheduleRetry(batch);
            break;
        case 241:
            // MEMORY_LIMIT_EXCEEDED — reduce batch size or add LIMIT to query
            throw new ConnectorException("Query exceeded memory limit", e);
        default:
            throw e;
    }
}
```

### Retry strategy {#retry}

Retry on:
- `java.net.SocketException`, `java.net.SocketTimeoutException` — network-level failures
- Error code `81` (READONLY) — transient ZooKeeper issue
- HTTP 500 responses where the exception code is not in the do-not-retry list

Do not retry on:
- Error code `60` (UNKNOWN_TABLE) — the schema is wrong
- Error codes for syntax errors, access denied, or memory/timeout limits — retrying will produce the same outcome

Use exponential backoff with jitter. On INSERT retries, reuse the same `query_id` or set `insert_deduplication_token` so ClickHouse can deduplicate:

```java
props.setProperty("clickhouse_setting_insert_deduplication_token", batchId);
```

---

## ClickHouse Cloud specifics {#cloud}

**Always use `jdbc:ch:https://`** — port 8123 (plaintext HTTP) is not available on ClickHouse Cloud. Attempts to connect on port 8123 will fail with a connection refused or TLS error. The correct port is 8443.

**Auto-pause** — Development-tier services pause after a period of inactivity. The first connection after a pause can take several seconds while the service wakes. Set `connectionTimeout=30000` in your HikariCP config (as shown above) and implement a retry on the first connection attempt before surfacing an error to the user.

**Single endpoint, multiple nodes** — A ClickHouse Cloud endpoint hides a multi-node cluster behind a load balancer. Do not assume one endpoint equals one server. Session-level settings (`SET ...`) do not persist across requests because consecutive requests may land on different nodes. Pass settings as query parameters or connection properties instead.

**`sslmode=strict`** — The default and the correct setting for Cloud. Validates the server certificate chain. Never set `sslmode=none` in any user-facing or production integration.

---

## Migration from V1 to V2 {#v1-v2-migration}

The V2 API (`com.clickhouse:clickhouse-jdbc` 0.6+) is the current default. V1 (0.3.x / 0.4.x) is legacy and no longer receives fixes. This section covers the breaking changes you will encounter when migrating connector code written against V1.

### Breaking type changes {#v2-type-changes}

| Column type | V1 return type | V2 return type |
|---|---|---|
| `Date`, `Date32` | `ZonedDateTime` | `LocalDate` |
| `Array(T)` | `List<?>` | `java.sql.Array` |
| `Tuple(T1, T2, ...)` | `List<Object>` | `Object[]` |

Update all `ResultSet.getObject()` call sites that handle these types. Schema discovery code that inspects type names at the JDBC metadata level is generally unaffected.

### Unknown configuration keys now throw {#v2-config-keys}

In V1, unrecognized properties passed to `DriverManager.getConnection()` were silently ignored. In V2, they throw `ClientMisconfigurationException`. During migration, set the following property to suppress this while you audit your configuration:

```java
props.setProperty("ignore_unknown_config_key", "true");
```

Remove this once you have validated that all property keys are intentional.

### JDBC vs client property separation {#v2-property-separation}

V2 distinguishes between JDBC-layer properties (e.g., `ssl`, `sslmode`) and ClickHouse client properties. In V1, these were mixed together. In V2, JDBC properties must be set on the `Properties` object passed to `DriverManager` or `DataSource`, while server-level settings use the `clickhouse_setting_` prefix:

```java
// JDBC-layer properties — set directly
props.setProperty("ssl", "true");
props.setProperty("sslmode", "strict");

// ClickHouse server settings — prefixed
props.setProperty("clickhouse_setting_max_execution_time", "30");
props.setProperty("clickhouse_setting_async_insert", "1");
```

Mixing them in the wrong way was tolerated in V1 but will throw in V2 unless `ignore_unknown_config_key=true` is set.
