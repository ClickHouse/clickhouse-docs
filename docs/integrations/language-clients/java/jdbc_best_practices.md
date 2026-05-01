---
sidebar_label: 'JDBC Best Practices'
sidebar_position: 5
keywords: ['clickhouse', 'java', 'jdbc', 'driver', 'best practices', 'connection pooling', 'security', 'performance']
description: 'Best practices for integrating with ClickHouse using the JDBC driver'
slug: /integrations/language-clients/java/jdbc_best_practices
title: 'JDBC Best Practices'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

# JDBC Best Practices

This guide covers patterns and recommendations for building reliable, performant, and secure integrations with ClickHouse using the JDBC driver. It is intended for developers integrating ClickHouse into Java applications, data pipelines, and BI tools.

:::tip
If you need maximum performance or access to ClickHouse-specific features not available via the standard JDBC interface (e.g., POJO SerDe, native format support), consider using the [Java client](/integrations/language-clients/java/client) directly instead of JDBC.
:::

## Setup and dependencies {#setup}

Always use the `all` classifier to include shaded dependencies and avoid classpath conflicts with libraries in your application:

```xml title="pom.xml"
<dependency>
    <groupId>com.clickhouse</groupId>
    <artifactId>clickhouse-jdbc</artifactId>
    <version>0.9.8</version>
    <classifier>all</classifier>
</dependency>
```

Keep the driver version current. Newer releases include security fixes, bug fixes, and performance improvements. Check the [changelog](https://github.com/ClickHouse/clickhouse-java/blob/main/CHANGELOG.md) before upgrading.

## Connection management {#connection-management}

### Prefer DataSource over DriverManager

Use `DataSource` as the entry point for connection acquisition. It integrates cleanly with connection pools and dependency injection frameworks, and is the standard approach in production applications.

```java
DataSource dataSource = new DataSource("jdbc:ch://my-server:8123/my_db", properties);
try (Connection conn = dataSource.getConnection()) {
    // use connection
}
```

### Always use try-with-resources

JDBC resources (`Connection`, `Statement`, `PreparedStatement`, `ResultSet`) must be closed to avoid resource leaks. Use try-with-resources to ensure cleanup even when exceptions are thrown:

```java
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement("SELECT count() FROM my_table")) {
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            // process row
        }
    }
}
```

### Always specify protocol and port explicitly

The JDBC driver does not infer protocol from port number. Always specify both in the URL:

```java
// Correct
String url = "jdbc:ch:http://my-server:8123/my_db";
String tlsUrl = "jdbc:ch:https://my-server:8443/my_db";

// Incorrect — protocol ambiguous
String bad = "jdbc:ch://my-server/my_db";
```

### Pass credentials via Properties, not the URL

Embedding credentials in the connection URL risks accidental exposure in logs, config files, and stack traces. Pass them separately:

```java
Properties props = new Properties();
props.setProperty("user", System.getenv("CH_USER"));
props.setProperty("password", System.getenv("CH_PASSWORD"));

Connection conn = DriverManager.getConnection("jdbc:ch:https://my-server:8443/my_db", props);
```

## Connection pooling {#connection-pooling}

The underlying HTTP client maintains its own socket pool, so JDBC connection pooling provides limited throughput gains. However, a pool is still valuable for managing connection lifecycle, applying timeouts, and enforcing concurrency limits in frameworks that expect a `DataSource`.

[HikariCP](https://github.com/brettwooldridge/HikariCP) is the recommended pool:

```java
HikariConfig config = new HikariConfig();
config.setConnectionTimeout(5_000);     // ms to acquire a connection
config.setMaximumPoolSize(20);
config.setMaxLifetime(300_000);         // recycle connections every 5 min
config.setDataSource(new ClickHouseDataSource(url, properties));

try (HikariDataSource ds = new HikariDataSource(config);
     Connection conn = ds.getConnection()) {
    // use connection
}
```

Set `maxLifetime` to avoid holding stale connections over idle periods. For ClickHouse Cloud, a value between 3–5 minutes is a reasonable default.

## Security {#security}

### Enable TLS for all production connections

Always use HTTPS (port 8443) with `sslmode=strict` in production. This is required for ClickHouse Cloud and strongly recommended for self-managed deployments.

```java
Properties props = new Properties();
props.setProperty("ssl", "true");
props.setProperty("sslmode", "strict");
props.setProperty("sslrootcert", "/path/to/ca-bundle.crt"); // if using a custom CA

Connection conn = DriverManager.getConnection("jdbc:ch:https://my-server:8443/my_db", props);
```

Using `sslmode=none` disables certificate validation and should only be used in isolated development environments.

### Use parameterized queries to prevent SQL injection

Never concatenate user-supplied values directly into SQL strings. Always use `PreparedStatement` with parameter placeholders:

```java
// Correct
try (PreparedStatement ps = conn.prepareStatement(
        "SELECT * FROM events WHERE user_id = ? AND event_date > ?")) {
    ps.setString(1, userId);
    ps.setObject(2, LocalDate.now().minusDays(30));
    ResultSet rs = ps.executeQuery();
}

// Incorrect — vulnerable to SQL injection
String sql = "SELECT * FROM events WHERE user_id = '" + userId + "'";
```

### Use a dedicated ClickHouse user with minimal permissions

Avoid connecting with the `default` user. Create a dedicated user with permissions scoped to the databases and operations your application requires:

```sql
CREATE USER app_user IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT ON my_database.* TO app_user;
```

## High-performance inserts {#inserts}

### Use batched PreparedStatement for bulk inserts

For inserting multiple rows, use `addBatch()` and `executeBatch()` rather than executing individual statements. This buffers rows and sends them in a single network round-trip:

```java
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO events (user_id, event_name, created_at) VALUES (?, ?, ?)")) {
    for (Event event : events) {
        ps.setString(1, event.userId());
        ps.setString(2, event.name());
        ps.setObject(3, event.createdAt());
        ps.addBatch();
    }
    ps.executeBatch();
}
```

### Tune batch size for your workload

Batch sizes between 10,000 and 100,000 rows per `executeBatch()` call typically give the best throughput. Very small batches add per-request overhead; very large batches increase memory pressure and may hit timeout limits.

### Enable socket keep-alive for large inserts

Long-running insert operations can be interrupted by intermediate network devices that drop idle TCP connections. Enable keep-alive to prevent this:

```java
props.setProperty("socket_keepalive", "true");
```

On Linux, also update kernel parameters in `/etc/sysctl.conf`:

```ini
net.ipv4.tcp_keepalive_time = 60
net.ipv4.tcp_keepalive_intvl = 75
net.ipv4.tcp_keepalive_probes = 9
```

Apply with `sudo sysctl -p`.

### Enable LZ4 compression for large data transfers

LZ4 compression significantly reduces network bandwidth for large result sets and inserts, at minimal CPU cost:

```java
props.setProperty("compress", "1");  // enable LZ4 response compression
```

## Querying data {#queries}

### Prefer specific column selection over SELECT *

ClickHouse is a columnar database. Reading only the columns your application needs reduces I/O and improves query speed:

```java
// Preferred
ps = conn.prepareStatement("SELECT user_id, event_name FROM events WHERE created_at > ?");

// Avoid unless all columns are needed
ps = conn.prepareStatement("SELECT * FROM events WHERE created_at > ?");
```

### Apply LIMIT when exploring or sampling data

Always add `LIMIT` when the full result set is not needed. ClickHouse can scan billions of rows quickly, but transferring and deserializing them all in JDBC is expensive.

### Use java.time types for date and time values

The JDBC driver supports returning `java.time` types via `getObject(columnIndex, Class)`. Prefer them over the legacy `java.sql.Date` and `java.sql.Timestamp` for cleaner timezone handling:

```java
LocalDate date = rs.getObject(1, LocalDate.class);
LocalDateTime dateTime = rs.getObject(2, LocalDateTime.class);
ZonedDateTime zoned = rs.getObject(3, ZonedDateTime.class);
```

See the [Date/Time guide](/integrations/language-clients/java/jdbc_date_time_guide) for a full explanation of timezone behavior.

### Watch for unsigned integer widening

ClickHouse unsigned types (`UInt8`, `UInt16`, `UInt32`, `UInt64`) are mapped to wider Java types to preserve correctness. Do not narrow-cast them without validation:

| ClickHouse Type | Java Class         |
|-----------------|--------------------|
| UInt8           | `Short`            |
| UInt16          | `Integer`          |
| UInt32          | `Long`             |
| UInt64          | `BigInteger`       |

## Observability {#observability}

### Identify your application in query logs

Set a client name so your application's queries are identifiable in `system.query_log`. Use the `app_name/version` format:

```java
props.setProperty("client_name", "my-etl-pipeline/2.1");
```

This appears as the `http_user_agent` in `system.query_log`, making it easy to filter for your application's queries:

```sql
SELECT query, query_duration_ms, read_rows
FROM system.query_log
WHERE http_user_agent LIKE 'my-etl-pipeline%'
ORDER BY event_time DESC
LIMIT 20;
```

### Tag individual operations with log comments

For fine-grained tracing within your application, attach a `log_comment` to a specific statement. This is useful for debugging slow queries in production:

```java
import com.clickhouse.jdbc.StatementImpl;

StatementImpl stmt = (StatementImpl) conn.createStatement();
stmt.getLocalSettings().logComment("nightly-user-rollup/job-id-123");
ResultSet rs = stmt.executeQuery("SELECT ...");
```

:::note
`logComment` uses shared `localSettings` — this pattern is safe for single-threaded statement use only.
:::

### Configure structured logging

The driver uses [SLF4J](https://www.slf4j.org/), so plug in your preferred logging framework (Logback, Log4j2). Set the ClickHouse driver logger to `WARN` or `ERROR` in production to reduce noise; use `DEBUG` when diagnosing driver behavior:

```xml title="logback.xml"
<logger name="com.clickhouse" level="WARN" />
```

## Error handling {#error-handling}

### Handle SQLExceptions with retry logic for transient errors

Network timeouts and temporary service unavailability are common in distributed systems. Implement exponential backoff for retryable errors:

```java
int attempts = 0;
int maxAttempts = 3;
while (attempts < maxAttempts) {
    try (Connection conn = dataSource.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {
        // execute and break on success
        ps.executeUpdate();
        break;
    } catch (SQLException e) {
        attempts++;
        if (attempts == maxAttempts) throw e;
        Thread.sleep(1000L * (1L << attempts)); // exponential backoff
    }
}
```

### Do not rely on JDBC transaction support

ClickHouse has limited transaction support. The JDBC driver returns `false` for `supportsTransactions()`. Do not use `conn.setAutoCommit(false)`, `conn.commit()`, or `conn.rollback()` to guarantee atomicity — design your data pipelines around ClickHouse's native idempotency patterns (e.g., `ReplacingMergeTree`, deduplication via `insert_deduplication_token`).

## Framework integrations {#frameworks}

### Spring Boot / Spring JDBC

Use Spring's `JdbcTemplate` with a HikariCP `DataSource` bean:

```java
@Bean
public DataSource clickHouseDataSource() {
    HikariConfig config = new HikariConfig();
    config.setJdbcUrl("jdbc:ch:https://my-server:8443/my_db");
    config.setUsername(env.getProperty("CH_USER"));
    config.setPassword(env.getProperty("CH_PASSWORD"));
    config.setMaximumPoolSize(10);
    config.setMaxLifetime(300_000);
    config.addDataSourceProperty("ssl", "true");
    config.addDataSourceProperty("sslmode", "strict");
    return new HikariDataSource(config);
}
```

### Suppressing unsupported feature exceptions

Some frameworks probe JDBC capabilities (e.g., savepoints, scrollable cursors) that ClickHouse does not support. If an unsupported feature call does not affect correctness in your use case, you can suppress those exceptions:

```java
props.setProperty("jdbc_ignore_unsupported_values", "true");
```

## Quick reference checklist {#checklist}

Use this checklist when shipping a new JDBC integration to production:

- [ ] Driver version is current (`0.9.8` or later)
- [ ] Protocol (`https`) and port (`8443`) are explicit in the connection URL
- [ ] Credentials are read from environment variables or a secrets manager, not hardcoded
- [ ] TLS is enabled with `sslmode=strict`
- [ ] A dedicated ClickHouse user with minimal permissions is used
- [ ] All `Connection`, `Statement`, and `ResultSet` objects are closed (try-with-resources)
- [ ] Connection pool `maxLifetime` is set to ≤ 5 minutes
- [ ] Bulk inserts use `addBatch()` / `executeBatch()` with batch sizes of 10k–100k rows
- [ ] `socket_keepalive=true` is set for pipelines with large or long-running inserts
- [ ] `client_name` is set to identify your application in `system.query_log`
- [ ] All user-provided input passes through `PreparedStatement` parameters
- [ ] Application does not rely on JDBC transactions for data consistency
