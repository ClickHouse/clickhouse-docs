---
sidebar_label: 'Go connector guide'
sidebar_position: 7
keywords: ['clickhouse', 'go', 'golang', 'connector', 'integration', 'clickhouse-go', 'insert', 'query', 'schema']
description: 'Guide for building a Go-based connector or integration on top of ClickHouse using clickhouse-go'
slug: /integrations/building-integrations/go
title: 'Go connector guide'
doc_type: 'guide'
---

# Go connector guide

This guide covers the full lifecycle of building a Go connector, ETL pipeline, or data service on top of ClickHouse using `github.com/ClickHouse/clickhouse-go/v2`. It is opinionated: it recommends specific patterns and calls out known pitfalls.

For the complete API reference, see the [Go client reference](/integrations/go). This guide pairs with the [ingestion patterns](/integrations/building-integrations/ingestion) and [consumption patterns](/integrations/building-integrations/consumption) guides.

The library provides two APIs:

- **Native ClickHouse API** — recommended for connectors. Uses the native binary protocol (port 9440 on Cloud), supports the full ClickHouse type system, and provides the most control over batch inserts and streaming.
- **`database/sql` compatible API** — use when your code must satisfy `*sql.DB` or when integrating with frameworks that expect the standard Go SQL interface. It wraps the native client but trades some type fidelity for compatibility.

## Installation {#installation}

```bash
go get github.com/ClickHouse/clickhouse-go/v2
```

## Connecting {#connecting}

### Native API {#native-api-connect}

```go
package main

import (
    "crypto/tls"
    "os"

    "github.com/ClickHouse/clickhouse-go/v2"
)

func newConn() (clickhouse.Conn, error) {
    conn, err := clickhouse.Open(&clickhouse.Options{
        Addr: []string{os.Getenv("CH_HOST") + ":9440"},
        Auth: clickhouse.Auth{
            Database: os.Getenv("CH_DATABASE"),
            Username: os.Getenv("CH_USER"),
            Password: os.Getenv("CH_PASSWORD"),
        },
        TLS: &tls.Config{},
        ClientInfo: clickhouse.ClientInfo{
            Products: []struct {
                Name    string
                Version string
            }{
                {Name: "my-connector", Version: "1.0"},
            },
        },
    })
    return conn, err
}
```

Passing `&tls.Config{}` enables TLS with system certificate verification. For ClickHouse Cloud, always use TLS: native port `9440`, HTTP port `8443`. Plaintext connections are not accepted on Cloud.

`ClientInfo.Products` sets the `User-Agent` header on all queries issued by this connection, making them attributable in `system.query_log`.

### database/sql API {#sql-api-connect}

```go
import (
    "database/sql"
    "fmt"
    "os"

    _ "github.com/ClickHouse/clickhouse-go/v2"
)

func newDB() (*sql.DB, error) {
    dsn := fmt.Sprintf(
        "clickhouse://%s:%s@%s:9440/%s?secure=true",
        os.Getenv("CH_USER"),
        os.Getenv("CH_PASSWORD"),
        os.Getenv("CH_HOST"),
        os.Getenv("CH_DATABASE"),
    )
    return sql.Open("clickhouse", dsn)
}
```

Use the `database/sql` API when your integration framework requires a `*sql.DB` — for example, when using `sqlx`, `gorm`, or any library that only accepts the standard interface.

### Connection options {#connection-options}

For the native API, configure pooling and timeouts via `clickhouse.Options`:

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{os.Getenv("CH_HOST") + ":9440"},
    Auth: clickhouse.Auth{
        Database: os.Getenv("CH_DATABASE"),
        Username: os.Getenv("CH_USER"),
        Password: os.Getenv("CH_PASSWORD"),
    },
    TLS: &tls.Config{},
    MaxOpenConns:     10,
    MaxIdleConns:     5,
    ConnMaxLifetime:  270 * time.Second,
    DialTimeout:      30 * time.Second,
})
```

Key parameters:

| Option | Recommended value | Why |
|---|---|---|
| `MaxOpenConns` | 10–20 for BI, 2–4 for ETL | ClickHouse handles concurrency server-side; more connections rarely help |
| `ConnMaxLifetime` | 270s | ClickHouse Cloud's keep-alive timeout is 10 minutes; 270s stays comfortably below it and avoids broken-pipe errors on idle connections |
| `DialTimeout` | 30s | ClickHouse Cloud services on the development tier auto-pause; first connection after a pause can take several seconds |

For the `database/sql` API, apply equivalent settings on `*sql.DB` after opening:

```go
db.SetMaxOpenConns(10)
db.SetMaxIdleConns(5)
db.SetConnMaxLifetime(270 * time.Second)
```

## Schema discovery {#schema-discovery}

### Listing columns {#list-columns}

Query `system.columns` and scan into a struct. Do not use `INFORMATION_SCHEMA` — it does not expose `is_in_sorting_key`, `is_in_primary_key`, or the full type string with modifiers:

```go
type ColumnInfo struct {
    Name           string
    Type           string
    IsInSortingKey uint8
    IsInPrimaryKey uint8
    Comment        string
}

func listColumns(ctx context.Context, conn clickhouse.Conn, database, table string) ([]ColumnInfo, error) {
    rows, err := conn.Query(ctx,
        `SELECT name, type, is_in_sorting_key, is_in_primary_key, comment
         FROM system.columns
         WHERE database = $1 AND table = $2
         ORDER BY position`,
        database, table,
    )
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var cols []ColumnInfo
    for rows.Next() {
        var c ColumnInfo
        if err := rows.Scan(&c.Name, &c.Type, &c.IsInSortingKey, &c.IsInPrimaryKey, &c.Comment); err != nil {
            return nil, err
        }
        cols = append(cols, c)
    }
    return cols, rows.Err()
}
```

Always call `rows.Close()` (via `defer`) and check `rows.Err()` after the loop. An error mid-stream appears in `rows.Err()`, not in the initial `conn.Query()` call.

### Parsing type modifiers {#parse-types}

Strip `Nullable` and `LowCardinality` wrappers before mapping to Go types. Both can be nested in any order:

```go
import "strings"

// UnwrapType strips Nullable and LowCardinality wrappers and returns
// the inner type and whether the original was nullable.
func UnwrapType(chType string) (inner string, nullable bool) {
    t := strings.TrimSpace(chType)
    for {
        switch {
        case strings.HasPrefix(t, "Nullable(") && strings.HasSuffix(t, ")"):
            t = strings.TrimSpace(t[len("Nullable(") : len(t)-1])
            nullable = true
        case strings.HasPrefix(t, "LowCardinality(") && strings.HasSuffix(t, ")"):
            t = strings.TrimSpace(t[len("LowCardinality(") : len(t)-1])
        default:
            return t, nullable
        }
    }
}
```

## Type mapping {#type-mapping}

clickhouse-go maps ClickHouse types to Go types automatically when scanning into typed variables. Use the following as your mapping reference:

| ClickHouse type | Go type | Notes |
|---|---|---|
| `Int8` | `int8` | |
| `Int16` | `int16` | |
| `Int32` | `int32` | |
| `Int64` | `int64` | |
| `UInt8` | `uint8` | |
| `UInt16` | `uint16` | |
| `UInt32` | `uint32` | |
| `UInt64` | `uint64` | |
| `Float32` | `float32` | |
| `Float64` | `float64` | |
| `Decimal*` | `decimal.Decimal` (shopspring) or `string` | No native Go decimal type; shopspring/decimal is the standard choice |
| `String` | `string` | |
| `FixedString(N)` | `string` | Null-padded on read — use `strings.TrimRight(s, "\x00")` to strip |
| `Date`, `Date32` | `time.Time` | Date precision only; time component is zero |
| `DateTime`, `DateTime64` | `time.Time` | Timezone-aware |
| `UUID` | `[16]byte` or `github.com/google/uuid.UUID` | clickhouse-go accepts both |
| `IPv4`, `IPv6` | `net.IP` | |
| `Bool` | `bool` | |
| `Array(T)` | `[]T` | Nested arrays are `[][]T` etc. |
| `Map(K, V)` | `map[K]V` | |
| `Nullable(T)` | `*T` | Scan into a pointer; nil means NULL |

For `Nullable(T)` columns, scan into a pointer of the appropriate type:

```go
var maybeStr *string
rows.Scan(&maybeStr)
if maybeStr != nil {
    fmt.Println(*maybeStr)
}
```

## Querying {#querying}

### Streaming with rows.Next() {#streaming}

`conn.Query()` returns a streaming cursor — rows are not buffered in memory. Iterate with `rows.Next()`:

```go
func streamEvents(ctx context.Context, conn clickhouse.Conn, userID string) error {
    rows, err := conn.Query(ctx,
        "SELECT user_id, event, ts FROM events WHERE user_id = $1",
        userID,
    )
    if err != nil {
        return err
    }
    defer rows.Close()

    for rows.Next() {
        var (
            uid   string
            event string
            ts    time.Time
        )
        if err := rows.Scan(&uid, &event, &ts); err != nil {
            return err
        }
        process(uid, event, ts)
    }
    return rows.Err()
}
```

`defer rows.Close()` is required — it releases the underlying connection back to the pool. If you return early (on error or when you have read enough rows), `Close()` must still be called.

### Parameterized queries {#parameterized}

Use positional `$1`, `$2`, ... parameters with the native API:

```go
rows, err := conn.Query(ctx,
    "SELECT * FROM events WHERE user_id = $1 AND ts > $2",
    userID, since,
)
```

For named parameters, use `clickhouse.Named`:

```go
rows, err := conn.Query(ctx,
    "SELECT * FROM events WHERE user_id = @uid AND ts > @since",
    clickhouse.Named("uid", userID),
    clickhouse.Named("since", since),
)
```

Named parameters are clearer in long queries and when a value is used more than once. Parameters are passed as typed values alongside the query, not interpolated into the SQL string, so SQL injection is not possible.

### Query tagging {#tagging}

Attach a `query_id` and `log_comment` to every query for traceability in `system.query_log`. Use `clickhouse.Context` to decorate the context:

```go
import "github.com/ClickHouse/clickhouse-go/v2"

ctx = clickhouse.Context(ctx,
    clickhouse.WithQueryID("connector:schema-check:job-42"),
    clickhouse.WithSettings(clickhouse.Settings{
        "log_comment": "connector:schema-discovery",
    }),
)

rows, err := conn.Query(ctx, "SELECT name, type FROM system.columns WHERE database = $1", db)
```

Derive the `query_id` from your job and request context so it is unique and deterministic. On retry after a timeout, reuse the same `query_id`.

### Context cancellation {#cancellation}

Wrap long-running queries in a timeout context:

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

rows, err := conn.Query(ctx, "SELECT ...")
```

`ctx.Cancel()` attempts to stop the query on the client side, but does not always send a server-side `KILL QUERY`. Always set `max_execution_time` as a server-side backstop to prevent runaway queries from consuming server resources even after the client has moved on:

```go
ctx = clickhouse.Context(ctx,
    clickhouse.WithSettings(clickhouse.Settings{
        "max_execution_time": 30,
    }),
)
```

## Inserting data {#inserts}

### Batch insert with native API {#batch-insert}

The preferred pattern for high-throughput inserts is `PrepareBatch` + `Append` + `Send`:

```go
func insertBatch(ctx context.Context, conn clickhouse.Conn, rows []Event) error {
    batch, err := conn.PrepareBatch(ctx, "INSERT INTO events (user_id, event, ts)")
    if err != nil {
        return err
    }

    for _, row := range rows {
        if err := batch.Append(row.UserID, row.Event, row.TS); err != nil {
            return err
        }
    }

    return batch.Send()
}
```

`batch.Append()` serializes rows into the native binary format in memory. `batch.Send()` transmits the entire batch in a single network round trip. Target 10,000–100,000 rows per `Send()` call — smaller batches create excessive data parts and trigger `Too many parts` errors.

If `batch.Send()` fails with a network error, retry the entire batch. Use `insert_deduplication_token` (shown below) to make retries safe.

### database/sql batch insert {#sql-batch}

When using `*sql.DB`, batch inserts are done by beginning a transaction, executing statements in a loop, and committing. Note: ClickHouse does not have ACID transactions — `BeginTx` / `Commit` here is a client-side batching mechanism, not a true transaction:

```go
func insertBatchSQL(ctx context.Context, db *sql.DB, rows []Event) error {
    tx, err := db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }

    stmt, err := tx.PrepareContext(ctx,
        "INSERT INTO events (user_id, event, ts) VALUES (?, ?, ?)")
    if err != nil {
        tx.Rollback()
        return err
    }
    defer stmt.Close()

    for _, row := range rows {
        if _, err := stmt.ExecContext(ctx, row.UserID, row.Event, row.TS); err != nil {
            tx.Rollback()
            return err
        }
    }

    return tx.Commit()
}
```

Rollback on error to discard the buffered batch. Do not proceed to `Commit` after a failed `Exec` — the batch state is undefined.

### Async insert {#async-insert}

For many small producers writing low-volume payloads, use `conn.AsyncInsert()` to let the server buffer and merge inserts before writing:

```go
err := conn.AsyncInsert(
    ctx,
    "INSERT INTO events (user_id, event, ts) VALUES ($1, $2, $3)",
    true,  // wait=true: block until server confirms write
    row.UserID, row.Event, row.TS,
)
```

`wait=true` blocks until the server acknowledges the buffered data has been written to disk. With `wait=false`, the call returns immediately after the server receives the payload — data may not be persisted yet, and type errors silently drop the batch.

Use `wait=true` in all connectors that need error feedback. Reserve `wait=false` for fire-and-forget telemetry pipelines where you accept eventual delivery.

### Idempotent inserts {#deduplication}

Pass `insert_deduplication_token` as a query setting for retry-safe inserts:

```go
ctx = clickhouse.Context(ctx,
    clickhouse.WithSettings(clickhouse.Settings{
        "insert_deduplication_token": fmt.Sprintf("pipeline-%s-batch-%d", jobID, batchNum),
    }),
)

batch, err := conn.PrepareBatch(ctx, "INSERT INTO events (user_id, event, ts)")
```

Derive the token from your job and batch identifiers. On retry, send the same token — if the original insert reached the server, ClickHouse silently skips the retry.

## Error handling {#error-handling}

ClickHouse errors returned by the server are represented as `*clickhouse.Exception`. Type-assert to access the error code and message:

```go
import (
    "errors"
    "time"

    "github.com/ClickHouse/clickhouse-go/v2"
)

func insertWithRetry(ctx context.Context, conn clickhouse.Conn, rows []Event, jobID string, batchNum int) error {
    token := fmt.Sprintf("job-%s-batch-%d", jobID, batchNum)

    const maxRetries = 3
    for attempt := 0; attempt < maxRetries; attempt++ {
        err := insertBatch(ctx, conn, rows, token)
        if err == nil {
            return nil
        }

        var ex *clickhouse.Exception
        if errors.As(err, &ex) {
            switch ex.Code {
            case 60:
                return fmt.Errorf("table not found: %w", err)
            case 164:
                return fmt.Errorf("read-only user: check permissions: %w", err)
            case 241:
                return fmt.Errorf("memory limit exceeded: reduce batch size: %w", err)
            }
            // Other ClickHouse server errors — do not retry
            return err
        }

        // Network-level errors — retry with backoff
        if attempt == maxRetries-1 {
            return err
        }
        time.Sleep(time.Duration(1<<attempt) * time.Second)
    }
    return nil
}
```

Key error codes for connector developers:

| Code | Name | Action |
|---|---|---|
| 60 | `UNKNOWN_TABLE` | Do not retry; surface to user |
| 81 | `UNKNOWN_DATABASE` | Do not retry; surface to user |
| 164 | `READONLY` | Do not retry; check user permissions |
| 241 | `MEMORY_LIMIT_EXCEEDED` | Do not retry; reduce batch size or query scope |
| 159 | `TIMEOUT_EXCEEDED` | May retry with a larger `max_execution_time` setting |

For network-level errors (where `errors.As(err, &ex)` returns false), retry with exponential backoff. Always reuse the same `insert_deduplication_token` on insert retries.

Access the full error message via `ex.Message` and the originating ClickHouse stack trace via `ex.StackTrace` when filing bug reports or surfacing details in connector logs.
