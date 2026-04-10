---
sidebar_label: 'Configuration Reference'
sidebar_position: 3
keywords: ['clickhouse', 'go', 'golang', 'configuration', 'options', 'reference', 'DSN', 'connection pool', 'TLS', 'compression', 'timeout']
description: 'Complete per-option configuration reference for the clickhouse-go client, covering connection-level, context-level, and batch options.'
slug: /integrations/language-clients/go/config-reference
title: 'Configuration Reference'
doc_type: 'reference'
---

# Configuration Reference {#config-reference}

This page documents every configurable option in `clickhouse-go` v2.x. For narrative guides with code examples, see [Configuration](/integrations/language-clients/go/configuration).

## How options are set {#how-options-are-set}

Options exist at three scopes:

| Scope | How to set | Lifetime |
|-------|-----------|----------|
| **Connection** | `clickhouse.Options` struct or DSN string | All queries on the connection |
| **Query** | `clickhouse.Context()` with `WithXxx` functions | Single query execution |
| **Batch** | `PrepareBatch()` option functions | Single batch operation |

**Via Options struct:**

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr:        []string{"localhost:9000"},
    Auth:        clickhouse.Auth{Database: "default", Username: "default", Password: ""},
    DialTimeout: 10 * time.Second,
    Compression: &clickhouse.Compression{Method: clickhouse.CompressionLZ4},
})
```

**Via DSN string:**

```go
db, err := sql.Open("clickhouse", "clickhouse://user:pass@localhost:9000/default?dial_timeout=10s&compress=lz4")
```

**Via Connector (database/sql with Options struct):**

```go
db := sql.OpenDB(clickhouse.Connector(&clickhouse.Options{
    Addr:        []string{"localhost:9000"},
    Auth:        clickhouse.Auth{Database: "default", Username: "default"},
    DialTimeout: 10 * time.Second,
}))
// Set database/sql-only pool settings after creation
db.SetConnMaxIdleTime(5 * time.Minute)
```

**Via context (per-query):**

```go
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithQueryID("my-query-123"),
    clickhouse.WithSettings(clickhouse.Settings{"max_execution_time": 60}),
)
rows, err := conn.Query(ctx, "SELECT ...")
```

---

## Connection Options {#connection-options}

### Protocol and Connection {#protocol-and-connection}

#### Protocol {#protocol}

Determines the communication protocol between client and server.

| | |
|---|---|
| **Type** | `Protocol` (`Native` = 0, `HTTP` = 1) |
| **Default** | `Native` |
| **DSN parameter** | Inferred from scheme: `clickhouse://` or `tcp://` = Native, `http://` or `https://` = HTTP |
| **Overridable per query** | No |

**Best practice:** Use Native for best performance (~30% faster). Use HTTP when you need proxy support, firewall traversal (port 80/443), or HTTP-only features like `gzip`/`br` compression.

**When misconfigured:**
- Using HTTP scheme with Native port (9000): connection refused or protocol mismatch
- Native protocol blocked by corporate firewalls: connection timeouts
- See [TCP vs HTTP](/integrations/language-clients/go/configuration#tcp-vs-http) for a full comparison

---

#### Addr {#addr}

List of ClickHouse server addresses for connection and failover.

| | |
|---|---|
| **Type** | `[]string` (each entry `"host:port"`) |
| **Default** | `["localhost:9000"]` (Native) or `["localhost:8123"]` (HTTP) |
| **DSN parameter** | Comma-separated hosts: `clickhouse://host1:9000,host2:9000/db` |
| **Overridable per query** | No |

**Best practice:** Always specify multiple addresses in production for high availability. Combine with `ConnOpenStrategy` for load balancing. Use correct ports: 9000 (Native), 8123 (HTTP), 9440 (Native+TLS), 8443 (HTTP+TLS).

**When misconfigured:**
- Single address in production: no failover, single point of failure
- Wrong port for protocol: `"connection refused"` or `"unexpected EOF"`
- Empty/nil: defaults to `localhost`, fails in distributed deployments

---

#### ConnOpenStrategy {#conn-open-strategy}

Strategy for selecting which server to connect to from the `Addr` list.

| | |
|---|---|
| **Type** | `ConnOpenStrategy` (`uint8`) |
| **Default** | `ConnOpenInOrder` (0) |
| **DSN parameter** | `connection_open_strategy` (values: `in_order`, `round_robin`, `random`) |
| **Overridable per query** | No |

**Values:**
- `ConnOpenInOrder` (0) -- try servers in order; later addresses used only on failure (failover)
- `ConnOpenRoundRobin` (1) -- rotate through servers evenly (load balancing)
- `ConnOpenRandom` (2) -- randomly select a server

**Best practice:** Use `ConnOpenInOrder` for active-standby. Use `ConnOpenRoundRobin` for active-active clusters and Kubernetes. Use `ConnOpenRandom` to avoid thundering herd on restart.

**When misconfigured:**
- `InOrder` with active-active cluster: first server gets all connections, others idle
- All strategies try all servers on failure -- the strategy only affects which is tried *first*

---

### Authentication {#authentication}

#### Auth.Username {#auth-username}

Username for ClickHouse authentication.

| | |
|---|---|
| **Type** | `string` |
| **Default** | `"default"` (if empty) |
| **DSN parameter** | `username` or URL user portion (`clickhouse://user:pass@host`) |
| **Overridable per query** | No |

**Best practice:** Never use the `default` user in production. Create dedicated users with minimal required permissions.

**When misconfigured:**
- Wrong username: `"Code: 516. DB::Exception: user: Authentication failed"`
- Empty string: silently uses `"default"` after internal defaults are applied

---

#### Auth.Password {#auth-password}

Password for ClickHouse authentication.

| | |
|---|---|
| **Type** | `string` |
| **Default** | `""` (empty) |
| **DSN parameter** | `password` or URL password portion |
| **Overridable per query** | No |

**Best practice:** Use environment variables or secret managers in production. URL-encode special characters in DSN strings. Consider JWT for ClickHouse Cloud.

**When misconfigured:**
- Wrong password: `"Code: 516. DB::Exception: password: Authentication failed"`
- Special characters not URL-encoded in DSN: parsing errors or silent auth failure

---

#### Auth.Database {#auth-database}

Default database for the connection.

| | |
|---|---|
| **Type** | `string` |
| **Default** | `""` (empty -- uses server default, typically `default`) |
| **DSN parameter** | `database` or URL path (`clickhouse://host/mydb`) |
| **Overridable per query** | No |

**Best practice:** Always specify explicitly to avoid ambiguity. Use dedicated databases per application in production.

**When misconfigured:**
- Non-existent database: `"Code: 81. DB::Exception: Database xyz doesn't exist"`
- Empty in multi-tenant setup: queries hit the wrong database

---

#### GetJWT {#get-jwt}

Callback function to retrieve a JWT token for authentication with ClickHouse Cloud.

| | |
|---|---|
| **Type** | `func(ctx context.Context) (string, error)` |
| **Default** | `nil` (uses username/password) |
| **DSN parameter** | Not available (programmatic only) |
| **Overridable per query** | Yes, via `WithJWT(token)` |

**Best practice:** Implement token caching and refresh logic inside the callback. The function is called per connection/request, so it must be fast.

**When misconfigured:**
- Returning expired token: authentication errors on every request
- Blocking/slow callback: holds up connection acquisition, causes timeouts
- JWT takes precedence over username/password when both are set
- Requires TLS (HTTPS) -- without TLS, falls back to username/password silently

```go
GetJWT: func(ctx context.Context) (string, error) {
    return getTokenFromVault(ctx)
}
```

---

### Timeouts {#timeouts}

#### DialTimeout {#dial-timeout}

Maximum time to wait when establishing a new connection.

| | |
|---|---|
| **Type** | `time.Duration` |
| **Default** | `30s` |
| **DSN parameter** | `dial_timeout` (e.g. `?dial_timeout=10s`) |
| **Overridable per query** | No |

**Best practice:** 5-10s on LAN, 15-30s on WAN/cloud. Never below 1s. This timeout also controls how long the client waits to acquire a connection from the pool when `MaxOpenConns` is reached.

**When misconfigured:**
- Too short (< 5s): `"clickhouse: acquire conn timeout"` during network congestion or pool saturation
- Too long (> 60s): application hangs for extended periods during outages, blocked goroutines

---

#### ReadTimeout {#read-timeout}

Maximum time to wait for a server response on each read call.

| | |
|---|---|
| **Type** | `time.Duration` |
| **Default** | `5m` (300 seconds) |
| **DSN parameter** | `read_timeout` (e.g. `?read_timeout=60s`) |
| **Overridable per query** | No (but context deadline takes precedence) |

**Best practice:** 10-30s for OLTP, 5-30m for OLAP/long-running queries. Applied per block read, not entire query duration. If context has a deadline, that overrides this value.

**When misconfigured:**
- Too short: long queries fail mid-execution with `"i/o timeout"` or `"read: connection reset by peer"`; server continues executing (wasted resources)
- Too long: dead connections not detected promptly, resource exhaustion if many queries hang

---

### Connection Pool {#connection-pool}

#### MaxIdleConns {#max-idle-conns}

Maximum number of idle (unused but kept alive) connections in the pool.

| | |
|---|---|
| **Type** | `int` |
| **Default** | `5` |
| **DSN parameter** | `max_idle_conns` |
| **Overridable per query** | No |

**Best practice:** Set to 50-80% of expected concurrent queries. Low-traffic apps: 2-5, medium: 10-20, high: 20-50.

**When misconfigured:**
- Too low: frequent connection creation/destruction, higher latency per query, TCP connection churn
- Too high: wasted memory holding unused connections, server resources held unnecessarily
- Must be ≤ `MaxOpenConns` (automatically capped if higher)

---

#### MaxOpenConns {#max-open-conns}

Maximum total connections open at any time (idle + active).

| | |
|---|---|
| **Type** | `int` |
| **Default** | `MaxIdleConns + 5` (default: 10) |
| **DSN parameter** | `max_open_conns` |
| **Overridable per query** | No |

**Best practice:** Low-traffic: 10-20, medium: 20-50, high: 50-100. Formula: (expected concurrent queries) + (burst capacity) + (buffer). Monitor with `SELECT * FROM system.metrics WHERE metric='TCPConnection'`.

**When misconfigured:**
- Too low: `"clickhouse: acquire conn timeout"` -- queries queue waiting for a free connection
- Too high: server-side `"Too many connections"`, OS file descriptor limits exceeded, server memory exhaustion
- ClickHouse default `max_connections`: 1024 (shared across all clients)

---

#### ConnMaxLifetime {#conn-max-lifetime}

Maximum duration a connection can be reused before being closed and replaced.

| | |
|---|---|
| **Type** | `time.Duration` |
| **Default** | `1h` |
| **DSN parameter** | `conn_max_lifetime` (e.g. `?conn_max_lifetime=30m`) |
| **Overridable per query** | No |

**Best practice:** 1-5h for stable environments. 5-15m for Kubernetes or environments with rolling deployments, so connections rebalance across new pods. Never set to infinite.

**When misconfigured:**
- Too short (< 1m): excessive connection churn, higher latency, increased server load
- Too long (> 24h) or infinite: stale connections to removed servers, DNS/IP changes not picked up, traffic never rebalances after cluster scale events
- Checked when connection is returned to pool -- if expired, closed and replaced on next acquire

See [Connection Pooling](/integrations/language-clients/go/configuration#connection-pooling) for usage details.

---

#### ConnMaxIdleTime {#conn-max-idle-time}

Maximum amount of time a connection may sit idle in the pool before being closed. Unlike `ConnMaxLifetime` (which limits total age), this limits how long a connection can remain *unused*.

| | |
|---|---|
| **Type** | `time.Duration` |
| **Default** | `0` (no idle timeout) |
| **DSN parameter** | Not available |
| **Overridable per query** | No |
| **How to set** | `database/sql` only: call `db.SetConnMaxIdleTime(d)` on the `*sql.DB` returned by `OpenDB()` |

:::note database/sql only
This setting is not part of the `clickhouse.Options` struct. It is a standard Go `database/sql` pool setting, available only when using `OpenDB()` or `sql.Open()`. The ClickHouse API (`clickhouse.Open()`) does not expose this.
:::

**Best practice:** Set to 5-10m in Kubernetes or bursty workloads to reclaim connections that pile up after traffic spikes. Pair with `ConnMaxLifetime` for complete connection lifecycle control.

```go
db := clickhouse.OpenDB(&clickhouse.Options{...})
db.SetConnMaxIdleTime(5 * time.Minute)
```

**When misconfigured:**
- Not set (default 0): idle connections persist until `ConnMaxLifetime` expires, holding server and client resources during off-peak hours
- Too short (< 30s): connections closed and recreated frequently during normal request gaps, adding latency
- Too long: same problems as not setting it -- idle connections accumulate after burst traffic

---

### database/sql Post-Creation Settings {#sql-db-settings}

When using `clickhouse.OpenDB()` or `sql.Open("clickhouse", dsn)`, the returned `*sql.DB` supports Go's standard pool configuration methods. `OpenDB()` automatically applies `MaxIdleConns`, `MaxOpenConns`, and `ConnMaxLifetime` from `Options`, but you can override them or set additional options afterward:

```go
db := clickhouse.OpenDB(&clickhouse.Options{
    MaxIdleConns:    20,
    MaxOpenConns:    50,
    ConnMaxLifetime: 30 * time.Minute,
})

// Override or set additional pool settings
db.SetMaxIdleConns(25)
db.SetMaxOpenConns(75)
db.SetConnMaxLifetime(1 * time.Hour)
db.SetConnMaxIdleTime(5 * time.Minute) // not available in Options
```

| Method | Options equivalent | Notes |
|--------|--------------------|-------|
| `db.SetMaxIdleConns(n)` | `MaxIdleConns` | Auto-applied by `OpenDB()` |
| `db.SetMaxOpenConns(n)` | `MaxOpenConns` | Auto-applied by `OpenDB()` |
| `db.SetConnMaxLifetime(d)` | `ConnMaxLifetime` | Auto-applied by `OpenDB()` |
| `db.SetConnMaxIdleTime(d)` | *None* | Must be set manually post-creation |

:::note ClickHouse API (clickhouse.Open)
These methods are NOT available on the connection returned by `clickhouse.Open()`. The ClickHouse API manages its own pool internally using the `Options` struct fields directly.
:::

---

### Compression {#compression}

#### Compression.Method {#compression-method}

Compression algorithm for data transfer.

| | |
|---|---|
| **Type** | `CompressionMethod` (`byte`) |
| **Default** | None (no compression) |
| **DSN parameter** | `compress` (values: `lz4`, `zstd`, `lz4hc`, `gzip`, `deflate`, `br`, or `true` for LZ4) |
| **Overridable per query** | No |

**Available methods by protocol:**

| Method | Native | HTTP |
|--------|--------|------|
| `CompressionLZ4` | Yes | Yes |
| `CompressionLZ4HC` | Yes | No |
| `CompressionZSTD` | Yes | Yes |
| `CompressionGZIP` | No | Yes |
| `CompressionDeflate` | No | Yes |
| `CompressionBrotli` | No | Yes |

**Best practice:**

| Scenario | Recommended | Why |
|----------|-------------|-----|
| LAN / high bandwidth | None or LZ4 | Compression overhead exceeds transfer time |
| WAN / low bandwidth | ZSTD or LZ4 | Good compression with reasonable CPU |
| CPU constrained | LZ4 | Fastest, minimal CPU overhead |
| Maximum compression | ZSTD (Native) or Brotli (HTTP) | Best ratio, high CPU |
| Small inserts (< 1 MB) | None | Overhead not worth it |
| Large inserts (> 10 MB) | LZ4 or ZSTD | Significant bandwidth savings |

**When misconfigured:**
- GZIP/Brotli on Native protocol: connection failure during handshake
- LZ4HC on HTTP: error or silent fallback
- No compression on slow networks: 10-100x slower inserts, network saturation

---

#### Compression.Level {#compression-level}

Compression level (algorithm-specific intensity).

| | |
|---|---|
| **Type** | `int` |
| **Default** | `3` |
| **DSN parameter** | `compress_level` (e.g. `?compress=gzip&compress_level=6`) |
| **Overridable per query** | No |

**Ranges:**
- **GZIP/Deflate:** -2 (best speed) to 9 (best compression)
- **Brotli:** 0 (best speed) to 11 (best compression)
- **LZ4/LZ4HC/ZSTD:** level parameter is ignored

**When misconfigured:**
- Very high levels (9+ GZIP, 11 Brotli): extreme CPU with minimal additional compression benefit
- Non-zero for LZ4/ZSTD: silently ignored, false sense of configuration
- Setting level without enabling compression: no effect, no error

---

#### MaxCompressionBuffer {#max-compression-buffer}

Maximum size of the compression buffer before flushing during column-by-column compression.

| | |
|---|---|
| **Type** | `int` (bytes) |
| **Default** | `10485760` (10 MiB) |
| **DSN parameter** | `max_compression_buffer` (e.g. `?max_compression_buffer=20971520`) |
| **Overridable per query** | No |

**Best practice:** Default 10 MiB is good for most cases. Increase to 20-50 MiB for very wide rows. Each connection has its own buffer, so total memory = buffer size x `MaxOpenConns`.

**When misconfigured:**
- Too small (< 1 MiB): frequent flushes, poor compression efficiency, more network round trips
- Too large (> 100 MiB): high memory usage, potential OOM with many connections (memory x `MaxOpenConns`)

---

### TLS {#tls}

#### TLS {#tls-config}

TLS/SSL configuration for secure connections. A non-nil value enables TLS.

| | |
|---|---|
| **Type** | `*tls.Config` (Go standard library) |
| **Default** | `nil` (plain text) |
| **DSN parameter** | `secure=true` (basic TLS), `skip_verify=true` (skip certificate verification) |
| **Overridable per query** | No |

**Ports:**
- Native: 9000 (plain) / 9440 (TLS)
- HTTP: 8123 (plain) / 8443 (TLS)

**Best practice:** Always enable TLS in production and for ClickHouse Cloud (required). Use `InsecureSkipVerify: false` in production. Add custom CAs via `tls.Config.RootCAs` instead of skipping verification.

**When misconfigured:**
- TLS enabled but wrong port: `"connection reset by peer"` or `"unexpected EOF"`
- `skip_verify=true` in production: vulnerable to MITM attacks, compliance violations
- Expired certificate: `"x509: certificate has expired"`
- Wrong hostname: `"x509: certificate is valid for X, not Y"`
- Untrusted CA: `"x509: certificate signed by unknown authority"`
- HTTP DSN with `secure=true`: `"clickhouse [dsn parse]: http with TLS specify"` -- use `https://` scheme instead

See [TLS](/integrations/language-clients/go/configuration#using-tls) for code examples.

---

### Logging {#logging}

#### Logger {#logger}

Structured logger using Go's standard `log/slog` package.

| | |
|---|---|
| **Type** | `*slog.Logger` |
| **Default** | `nil` (no logging) |
| **DSN parameter** | Not available (programmatic only) |
| **Overridable per query** | No |

**Best practice:** Use `slog` with a JSON handler in production for structured, machine-parseable logs. Add application context with `logger.With(...)`. Priority order: `Debug`+`Debugf` (if set) > `Logger` > no-op.

```go
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
conn, err := clickhouse.Open(&clickhouse.Options{
    Logger: logger,
    // ...
})
```

See [Logging](/integrations/language-clients/go/configuration#logging) for full examples.

---

#### Debug (deprecated) {#debug}

Legacy debug logging toggle.

| | |
|---|---|
| **Type** | `bool` |
| **Default** | `false` |
| **DSN parameter** | `debug=true` |
| **Overridable per query** | No |

:::note
Deprecated -- use `Logger` instead. When enabled, logs to stdout unless `Debugf` is also set.
:::

**When misconfigured:**
- Enabled in production: performance overhead, verbose logs fill disk, sensitive data may appear in output

---

#### Debugf (deprecated) {#debugf}

Custom debug log function.

| | |
|---|---|
| **Type** | `func(format string, v ...any)` |
| **Default** | `nil` (logs to stdout when `Debug: true`) |
| **DSN parameter** | Not available (programmatic only) |
| **Overridable per query** | No |

:::note
Deprecated -- use `Logger` instead. Requires `Debug: true` to take effect.
:::

---

### Buffers and Memory {#buffers-and-memory}

#### BlockBufferSize {#block-buffer-size}

Number of decoded blocks to buffer in a channel when reading query results, allowing concurrent read and decode.

| | |
|---|---|
| **Type** | `uint8` |
| **Default** | `2` |
| **DSN parameter** | `block_buffer_size` |
| **Overridable per query** | Yes, via `WithBlockBufferSize(size)` |

**Best practice:** Default 2 is fine for most workloads. Increase to 5-10 for large streaming results. Memory cost = buffer size x block size x concurrent queries.

**When misconfigured:**
- Too small (1): blocks reader goroutine, increased latency for large results
- Too large (> 50): high memory usage, diminishing returns beyond 10-20

---

#### FreeBufOnConnRelease {#free-buf-on-conn-release}

Release the connection's memory buffer back to the pool after each query instead of reusing it.

| | |
|---|---|
| **Type** | `bool` |
| **Default** | `false` |
| **DSN parameter** | Not available (programmatic only) |
| **Overridable per query** | No |

**Best practice:** Keep `false` (default) for high query rates -- buffer reuse avoids allocation overhead. Set `true` in memory-constrained containers or when queries are infrequent with large batches.

**When misconfigured:**
- `false` with limited memory: idle connections hold buffers indefinitely, memory = buffer size x idle connections
- `true` with high query rate: constant allocation/deallocation, GC pressure, increased CPU

---

### HTTP-Specific {#http-specific}

These options only affect connections using `Protocol: clickhouse.HTTP`. They are silently ignored for the Native protocol.

#### HttpHeaders {#http-headers}

Additional HTTP headers sent on every request.

| | |
|---|---|
| **Type** | `map[string]string` |
| **Default** | `nil` (none) |
| **DSN parameter** | Not available (programmatic only) |
| **Overridable per query** | No |

**Best practice:** Use for tracing headers (`X-Request-ID`), authentication proxy headers, or custom routing. Keep minimal for performance.

**When misconfigured:**
- Conflicting headers: overriding internal headers (e.g., `Content-Type`, `Authorization`) causes unpredictable behavior
- Large headers: bandwidth overhead, possible server header size limits

---

#### HttpUrlPath {#http-url-path}

Additional URL path appended to HTTP requests.

| | |
|---|---|
| **Type** | `string` |
| **Default** | `""` (root `/`) |
| **DSN parameter** | `http_path` (e.g. `?http_path=/clickhouse`) |
| **Overridable per query** | No |

**Best practice:** Use when behind a reverse proxy with path-based routing. A leading `/` is added automatically if missing.

**When misconfigured:**
- Wrong path: HTTP 404 errors from proxy/load balancer

---

#### HttpMaxConnsPerHost {#http-max-conns-per-host}

Maximum concurrent TCP connections per host at the HTTP transport layer (`http.Transport.MaxConnsPerHost`).

| | |
|---|---|
| **Type** | `int` |
| **Default** | `0` (unlimited) |
| **DSN parameter** | Not available (programmatic only) |
| **Overridable per query** | No |

**Best practice:** Leave at 0 (unlimited) for most applications. The application-level pool (`MaxOpenConns`) is usually sufficient. Only set this when the ClickHouse server has strict connection limits shared across multiple clients.

:::note Two-layer HTTP pooling
When using HTTP, there are two connection pools:
- **Layer 1 (application):** `MaxIdleConns` / `MaxOpenConns` -- controls `httpConnect` objects
- **Layer 2 (transport):** `HttpMaxConnsPerHost` -- controls underlying TCP connections

The Native protocol has a simple 1:1 mapping and ignores `HttpMaxConnsPerHost`.
:::

**When misconfigured:**
- Too low (e.g., 10 with `MaxOpenConns` = 50): transport-layer bottleneck, slow queries despite low server load
- Setting it without understanding: more server connections than expected if left at 0 with many `httpConnect` objects

---

#### HTTPProxyURL {#http-proxy-url}

HTTP proxy URL for routing requests through a proxy server.

| | |
|---|---|
| **Type** | `*url.URL` |
| **Default** | `nil` (uses `HTTP_PROXY` / `HTTPS_PROXY` environment variables) |
| **DSN parameter** | `http_proxy` (URL-encoded) |
| **Overridable per query** | No |

**When misconfigured:**
- Wrong proxy address: `"dial tcp: lookup proxy: no such host"`, all queries fail
- Proxy requires auth but not provided: HTTP 407 Proxy Authentication Required
- Explicit value overrides environment variables, which can cause confusion across environments

---

#### TransportFunc {#transport-func}

Custom HTTP transport factory. Receives the default configured transport and returns a (possibly wrapped) `http.RoundTripper`.

| | |
|---|---|
| **Type** | `func(*http.Transport) (http.RoundTripper, error)` |
| **Default** | `nil` (uses default `http.Transport`) |
| **DSN parameter** | Not available (programmatic only) |
| **Overridable per query** | No |

**Best practice:** Use for adding observability (logging, metrics, tracing) as middleware around the transport. Avoid overriding `Proxy`, `DialContext`, or `TLSClientConfig` set by the client.

```go
TransportFunc: func(t *http.Transport) (http.RoundTripper, error) {
    return &loggingRoundTripper{transport: t}, nil
}
```

**When misconfigured:**
- Returning `nil`: panic or connection failure
- Overriding client-configured transport fields: TLS/proxy settings silently ignored
- Blocking operations in `RoundTripper`: deadlocks, all queries stall

---

### Advanced Connection {#advanced-connection}

#### DialContext {#dial-context}

Custom dial function to control how TCP connections are established. Works with both Native and HTTP protocols.

| | |
|---|---|
| **Type** | `func(ctx context.Context, addr string) (net.Conn, error)` |
| **Default** | `nil` (uses `net.DialTimeout` for plain, `tls.DialWithDialer` for TLS) |
| **DSN parameter** | Not available (programmatic only) |
| **Overridable per query** | No |

**Best practice:** Only needed for custom networking (Unix sockets, SOCKS proxy, custom DNS). For 99% of cases, leave `nil`.

**When misconfigured:**
- Not respecting context cancellation: hangs on timeout, resource leaks
- Ignoring TLS setting: when `TLS` is set in Options and `DialContext` is provided, the custom dialer must handle TLS itself
- Returning invalid `net.Conn`: crashes or type assertion failures

---

#### DialStrategy {#dial-strategy}

Custom strategy for selecting and connecting to servers. Overrides the default strategy that uses `ConnOpenStrategy`.

| | |
|---|---|
| **Type** | `func(ctx context.Context, connID int, options *Options, dial Dial) (DialResult, error)` |
| **Default** | `DefaultDialStrategy` (respects `ConnOpenStrategy`) |
| **DSN parameter** | Not available (programmatic only) |
| **Overridable per query** | No |

**Best practice:** Use the default for 99.9% of cases. Only implement a custom strategy for geo-aware routing, weighted selection, or health-check-based selection.

**When misconfigured:**
- Not trying all servers before returning error: fails even when healthy servers are available
- Expensive operations inside: called for every connection attempt, blocks pool acquisition

---

### Client Information {#client-information}

#### ClientInfo {#client-info}

Application identification sent to ClickHouse, visible in `system.query_log`.

| | |
|---|---|
| **Type** | `ClientInfo` struct (`Products []struct{Name, Version string}`, `Comment []string`) |
| **Default** | Automatically includes `clickhouse-go` version and Go runtime info |
| **DSN parameter** | `client_info_product=myapp/1.0,module/0.1` (comma-separated `name/version` pairs) |
| **Overridable per query** | Yes, appended via `WithClientInfo(ci)` |

**Best practice:** Always set your application name and version. Helps identify queries in `system.query_log` for debugging and monitoring in multi-service environments.

```go
ClientInfo: clickhouse.ClientInfo{
    Products: []struct{ Name, Version string }{
        {Name: "my-service", Version: "1.0.0"},
    },
}
```

Appears as: `clickhouse-go/2.x my-service/1.0.0 (lv:go/1.23; os:linux)`

Query attribution: `SELECT client_name FROM system.query_log WHERE client_name LIKE '%my-service%'`

---

### ClickHouse Server Settings {#server-settings}

#### Settings {#settings}

Map of ClickHouse server settings applied to every query on the connection.

| | |
|---|---|
| **Type** | `Settings` = `map[string]any` |
| **Default** | `nil` (empty) |
| **DSN parameter** | Any unrecognized DSN parameter becomes a setting (e.g. `?max_execution_time=60&readonly=1`) |
| **Overridable per query** | Yes, via `WithSettings()` (context settings override connection settings on conflict) |

**DSN value conversion:** `"true"` -> `1`, `"false"` -> `0`, numeric strings -> `int`, others -> `string`.

**Common settings:**

| Setting | Type | Description |
|---------|------|-------------|
| `max_execution_time` | int | Query timeout in seconds |
| `max_memory_usage` | int | Memory limit per query (bytes) |
| `max_block_size` | int | Block size for processing |
| `readonly` | int | 1 = read-only, 2 = read-only + settings changes |

**When misconfigured:**
- Typos in setting names: silently ignored or error depending on ClickHouse version
- Wrong types: `"Cannot parse string 'abc' as Int64"`
- `max_execution_time=0` with no context deadline: queries can run forever

---

#### CustomSetting {#custom-setting}

Wrapper to mark a setting as "custom" (non-important) for the Native protocol. Custom settings do not cause errors if the server doesn't recognize them.

| | |
|---|---|
| **Type** | `CustomSetting` struct (`Value string`) |
| **Default** | — |
| **DSN parameter** | Not available (programmatic only) |
| **Overridable per query** | Via `WithSettings()` |

```go
Settings: clickhouse.Settings{
    "max_execution_time":  60,                                        // important -- errors if unknown
    "my_custom_setting":   clickhouse.CustomSetting{Value: "value"},  // custom -- ignored if unknown
}
```

**Best practice:** Use for experimental or version-specific settings that may not exist on all server versions. HTTP protocol treats all settings as custom by default, so this distinction only matters for Native.

---

## Context-Level Query Options {#context-options}

These options are set per-query using `clickhouse.Context()`:

```go
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithQueryID("my-query"),
    clickhouse.WithSettings(clickhouse.Settings{"max_execution_time": 60}),
)
```

:::note Context deadline behavior
If the context has a deadline > 1s, `max_execution_time` is automatically set to `seconds_remaining + 5`. This overrides any manually set value.
:::

---

#### WithQueryID {#with-query-id}

Assign a custom identifier to the query, visible in `system.query_log` and `system.processes`.

| | |
|---|---|
| **Type** | `string` |
| **Default** | Auto-generated by server |

**Best practice:** Use UUIDs for uniqueness. Useful for tracking and killing specific queries: `KILL QUERY WHERE query_id='...'`.

**When misconfigured:**
- Duplicate IDs: confusion when tracking queries in `system.query_log`

---

#### WithQuotaKey {#with-quota-key}

Set a quota key for resource management in multi-tenant systems.

| | |
|---|---|
| **Type** | `string` |
| **Default** | `""` (no quota key) |

**Best practice:** Requires quota configuration on the ClickHouse server. Use for per-customer or per-user resource limits.

**When misconfigured:**
- Quota not configured server-side: key silently ignored

---

#### WithJWT {#with-jwt}

Override authentication with a different JWT for a single query.

| | |
|---|---|
| **Type** | `string` |
| **Default** | `""` (uses connection-level auth) |

**Best practice:** Use for per-request user authentication in multi-tenant proxies. HTTPS to ClickHouse Cloud only.

**When misconfigured:**
- Without TLS: JWT ignored, falls back to connection auth
- Expired token: `"Token has expired"` error

---

#### WithSettings {#with-settings}

Override or add ClickHouse server settings for a specific query.

| | |
|---|---|
| **Type** | `Settings` = `map[string]any` |
| **Default** | Inherits connection-level `Settings` |

Context settings are merged with connection settings; context wins on conflicts.

```go
ctx := clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
    "max_execution_time": 120,
    "max_rows_to_read":   1000000,
}))
```

---

#### WithParameters {#with-parameters}

Set parameters for parameterized queries (server-side parameter binding).

| | |
|---|---|
| **Type** | `Parameters` = `map[string]string` |
| **Default** | `nil` |

**Query syntax:** `{param_name:Type}` placeholders.

```go
ctx := clickhouse.Context(ctx, clickhouse.WithParameters(clickhouse.Parameters{
    "user_id":  "12345",
    "min_date": "2024-01-01",
}))
rows, err := conn.Query(ctx, "SELECT * FROM users WHERE id = {user_id:String} AND date >= {min_date:Date}")
```

**When misconfigured:**
- Missing parameter: `"Substitution {param_name:Type} is not set"`
- Wrong type: `"Cannot parse string 'abc' as UInt64"`

---

#### WithAsync {#with-async}

Enable asynchronous insert mode.

| | |
|---|---|
| **Type** | `bool` (the `wait` parameter) |
| **Default** | Synchronous inserts |

Sets `async_insert=1` and optionally `wait_for_async_insert=1`. Requires ClickHouse 21.11+.

```go
ctx := clickhouse.Context(ctx, clickhouse.WithAsync(false)) // fire-and-forget
```

**When misconfigured:**
- `wait=false` and checking errors: insert is accepted but may fail asynchronously -- check `system.asynchronous_insert_log`
- Using with SELECT: setting ignored, only affects INSERT
- Old server version: `"Unknown setting async_insert"`

---

#### WithLogs {#with-logs}

Receive server log entries during query execution. **Native protocol only.**

| | |
|---|---|
| **Type** | `func(*Log)` |
| **Default** | `nil` (no callback) |

---

#### WithProgress {#with-progress}

Receive query progress updates (rows/bytes processed). **Native protocol only.**

| | |
|---|---|
| **Type** | `func(*Progress)` |
| **Default** | `nil` (no callback) |

---

#### WithProfileInfo {#with-profile-info}

Receive query execution statistics. **Native protocol only.**

| | |
|---|---|
| **Type** | `func(*ProfileInfo)` |
| **Default** | `nil` (no callback) |

---

#### WithProfileEvents {#with-profile-events}

Receive performance counters. **Native protocol only.**

| | |
|---|---|
| **Type** | `func([]ProfileEvent)` |
| **Default** | `nil` (no callback) |

---

**Event handler best practices:**
- Keep callbacks fast -- they block query execution
- Use buffered channels or goroutines for expensive processing
- On HTTP protocol, callbacks are silently never called

```go
ctx := clickhouse.Context(ctx,
    clickhouse.WithProgress(func(p *clickhouse.Progress) {
        log.Printf("Progress: %d rows, %d bytes", p.Rows, p.Bytes)
    }),
    clickhouse.WithProfileInfo(func(p *clickhouse.ProfileInfo) {
        log.Printf("Rows: %d, Bytes: %d", p.Rows, p.Bytes)
    }),
)
```

See [Progress/Profile information](/integrations/language-clients/go/clickhouse-api#progress-profile-information) for full examples.

---

#### WithExternalTable {#with-external-table}

Attach external data tables to a query for use as temporary lookup tables.

| | |
|---|---|
| **Type** | `...*ext.Table` |
| **Default** | `nil` |

**Best practice:** Keep tables small (< 10 MB) -- data is transferred on every query. Native protocol is more efficient for this than HTTP (which uses multipart/form-data).

See [External Tables](/integrations/language-clients/go/clickhouse-api#external-tables) for full examples.

---

#### WithUserLocation {#with-user-location}

Override the timezone used for DateTime parsing.

| | |
|---|---|
| **Type** | `*time.Location` |
| **Default** | Server timezone (from handshake) |

```go
loc, _ := time.LoadLocation("America/New_York")
ctx := clickhouse.Context(ctx, clickhouse.WithUserLocation(loc))
```

**When misconfigured:**
- Wrong timezone: DateTime values silently off by hours, potential data corruption on inserts

---

#### WithColumnNamesAndTypes {#with-column-names-and-types}

Provide predetermined column names and types for HTTP inserts, skipping the `DESCRIBE TABLE` round trip.

| | |
|---|---|
| **Type** | `[]ColumnNameAndType` (each has `Name` and `Type` string fields) |
| **Default** | `nil` (client runs `DESCRIBE TABLE` automatically) |

**HTTP only.** No effect on Native protocol.

**When misconfigured:**
- Wrong column types: `"Cannot convert String to UInt64"`
- Schema drift after table migration: inserts fail with stale type info

---

#### WithBlockBufferSize {#with-block-buffer-size}

Override the connection-level `BlockBufferSize` for a single query.

| | |
|---|---|
| **Type** | `uint8` |
| **Default** | Connection-level `BlockBufferSize` (default 2) |

---

#### WithClientInfo {#with-client-info}

Append additional client information for a single query. Does not replace the connection-level `ClientInfo`, it appends to it.

| | |
|---|---|
| **Type** | `ClientInfo` |
| **Default** | Connection-level `ClientInfo` |

---

#### WithSpan {#with-span}

Attach an OpenTelemetry span context to the query for distributed tracing. **Native protocol only.**

| | |
|---|---|
| **Type** | `trace.SpanContext` (from `go.opentelemetry.io/otel/trace`) |
| **Default** | Empty span context |

See [OpenTelemetry support](/integrations/language-clients/go/clickhouse-api#open-telemetry) for details.

---

#### WithoutProfileEvents {#without-profile-events}

Instruct the server not to send profile events for this query. Performance optimization for servers >= 25.11. On older servers, returns an error for the unknown setting.

| | |
|---|---|
| **Type** | No parameters (sets `send_profile_events=0` internally) |
| **Default** | Profile events are sent |

---

## Batch Options {#batch-options}

Batch options are passed to `PrepareBatch()`:

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO table",
    driver.WithReleaseConnection(),
)
```

---

#### WithReleaseConnection {#with-release-connection}

Release the connection back to the pool immediately after `PrepareBatch()`, instead of holding it until `Send()`.

| | |
|---|---|
| **Type** | No parameters |
| **Default** | Connection held until batch is sent |
| **Import** | `github.com/ClickHouse/clickhouse-go/v2/lib/driver` |

**Best practice:** Use for long-lived batches that accumulate data over time. Prevents pool exhaustion when batches live for minutes/hours. On `Send()`/`Flush()`, a new connection is acquired from the pool.

**When misconfigured:**
- Not using for long batches: connection held for entire batch lifetime, `"acquire conn timeout"` if many long batches are active

---

#### WithCloseOnFlush {#with-close-on-flush}

Automatically close the batch when `Flush()` is called.

| | |
|---|---|
| **Type** | No parameters |
| **Default** | Batch remains open after `Flush()` |
| **Import** | `github.com/ClickHouse/clickhouse-go/v2/lib/driver` |

**Best practice:** Use for one-shot batches where you flush once and are done. Saves an explicit `Close()` call.

**When misconfigured:**
- Using with multiple `Flush()` calls: first flush closes the batch, subsequent operations fail

---

## Quick Reference Tables {#quick-reference-tables}

### Connection Pool Sizing {#pool-sizing}

| Application type | MaxIdleConns | MaxOpenConns | ConnMaxLifetime |
|------------------|-------------|-------------|-----------------|
| Low-traffic web app | 5 | 10 | 1h |
| Medium-traffic API | 20 | 50 | 30m |
| High-traffic service | 50 | 100 | 15m |
| Background batch jobs | 10 | 20 | 2h |
| Kubernetes deployment | 10 | 20 | 10m |
| Serverless (Lambda) | 1 | 5 | 5m |

### Timeout Recommendations {#timeout-recommendations}

| Environment | DialTimeout | ReadTimeout |
|-------------|------------|-------------|
| Local / LAN | 5s | 30s |
| Cloud, same region | 10s | 2m |
| Cloud, cross region | 30s | 5m |
| OLAP workload | 10s | 30m |
| Realtime / OLTP | 5s | 10s |

### DSN Parameter Quick Reference {#dsn-parameters}

| DSN parameter | Options field | Example |
|---------------|--------------|---------|
| `username` | `Auth.Username` | `?username=admin` |
| `password` | `Auth.Password` | `?password=secret` |
| `database` | `Auth.Database` | `?database=mydb` or `/mydb` in path |
| `dial_timeout` | `DialTimeout` | `?dial_timeout=10s` |
| `read_timeout` | `ReadTimeout` | `?read_timeout=5m` |
| `max_open_conns` | `MaxOpenConns` | `?max_open_conns=50` |
| `max_idle_conns` | `MaxIdleConns` | `?max_idle_conns=20` |
| `conn_max_lifetime` | `ConnMaxLifetime` | `?conn_max_lifetime=30m` |
| `connection_open_strategy` | `ConnOpenStrategy` | `?connection_open_strategy=round_robin` |
| `block_buffer_size` | `BlockBufferSize` | `?block_buffer_size=10` |
| `compress` | `Compression.Method` | `?compress=lz4` |
| `compress_level` | `Compression.Level` | `?compress_level=6` |
| `max_compression_buffer` | `MaxCompressionBuffer` | `?max_compression_buffer=20971520` |
| `secure` | `TLS` | `?secure=true` |
| `skip_verify` | `TLS.InsecureSkipVerify` | `?skip_verify=true` |
| `debug` | `Debug` | `?debug=true` |
| `client_info_product` | `ClientInfo.Products` | `?client_info_product=myapp/1.0` |
| `http_proxy` | `HTTPProxyURL` | `?http_proxy=http%3A%2F%2Fproxy%3A8080` |
| `http_path` | `HttpUrlPath` | `?http_path=/clickhouse` |
| *(any other)* | `Settings[key]` | `?max_execution_time=60` |

---

## Troubleshooting {#troubleshooting}

### "acquire conn timeout" {#acquire-conn-timeout}

**Cause:** Connection pool exhausted -- all `MaxOpenConns` connections are in use and none became available within `DialTimeout`.

**Fix:**
- Increase `MaxOpenConns` to match actual concurrency
- Increase `DialTimeout` for burst tolerance
- Check for long-running queries holding connections
- Use `WithReleaseConnection()` for long-lived batches

### "i/o timeout" or "read: connection reset by peer" {#io-timeout}

**Cause:** `ReadTimeout` exceeded while waiting for a server response, or the connection was closed by the server/network.

**Fix:**
- Increase `ReadTimeout` for long-running queries
- Use context deadlines for per-query timeout control
- Check ClickHouse server-side `max_execution_time` limits

### "Code: 516. Authentication failed" {#auth-failed}

**Cause:** Wrong username, password, or the user doesn't exist.

**Fix:**
- Verify credentials against `system.users` table
- Check for URL-encoding issues with special characters in DSN passwords
- Confirm the user has access to the specified database

### TLS certificate errors {#tls-errors}

| Error | Cause | Fix |
|-------|-------|-----|
| `x509: certificate has expired` | Server cert expired | Renew server certificate |
| `x509: certificate is valid for X, not Y` | Hostname mismatch | Use correct hostname or add to SANs |
| `x509: certificate signed by unknown authority` | Untrusted CA | Add CA to `tls.Config.RootCAs` |
| `connection reset by peer` | TLS/port mismatch | Use port 9440 (Native) or 8443 (HTTP) for TLS |

### Gradual memory growth {#memory-growth}

**Cause:** Large idle connection buffers accumulating.

**Fix:**
- Set `FreeBufOnConnRelease: true` in memory-constrained environments
- Reduce `MaxIdleConns` to limit idle connections
- Reduce `MaxCompressionBuffer` if using compression
- Lower `ConnMaxLifetime` to cycle connections more frequently
