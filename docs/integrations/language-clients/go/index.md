---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'The Go clients for ClickHouse allows you to connect to ClickHouse using either the Go standard database/sql interface or an optimized native interface.'
title: 'ClickHouse Go'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';

# ClickHouse Go

## Quickstart {#quick-start}

Let's Go with a simple example.  This will connect to ClickHouse and select from the system database.  To get started you will need your connection details.

### Connection details {#connection-details}

<ConnectionDetails />

### Initialize a module {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```

### Copy in some sample code {#copy-in-some-sample-code}

Copy this code into the `clickhouse-golang-example` directory as `main.go`.

```go title=main.go
package main

import (
    "context"
    "crypto/tls"
    "fmt"
    "log"

    "github.com/ClickHouse/clickhouse-go/v2"
    "github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

func main() {
    conn, err := connect()
    if err != nil {
        panic(err)
    }

    ctx := context.Background()
    rows, err := conn.Query(ctx, "SELECT name, toString(uuid) as uuid_str FROM system.tables LIMIT 5")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()

    for rows.Next() {
        var name, uuid string
        if err := rows.Scan(&name, &uuid); err != nil {
            log.Fatal(err)
        }
        log.Printf("name: %s, uuid: %s", name, uuid)
    }

    // NOTE: Do not skip rows.Err() check
    if err := rows.Err(); err != nil {
        log.Fatal(err)
    }

}

func connect() (driver.Conn, error) {
    var (
        ctx       = context.Background()
        conn, err = clickhouse.Open(&clickhouse.Options{
            Addr: []string{"<CLICKHOUSE_SECURE_NATIVE_HOSTNAME>:9440"},
            Auth: clickhouse.Auth{
                Database: "default",
                Username: "default",
                Password: "<DEFAULT_USER_PASSWORD>",
            },
            ClientInfo: clickhouse.ClientInfo{
                Products: []struct {
                    Name    string
                    Version string
                }{
                    {Name: "an-example-go-client", Version: "0.1"},
                },
            },
            Debugf: func(format string, v ...interface{}) {
                fmt.Printf(format, v)
            },
            TLS: &tls.Config{
                InsecureSkipVerify: true,
            },
        })
    )

    if err != nil {
        return nil, err
    }

    if err := conn.Ping(ctx); err != nil {
        if exception, ok := err.(*clickhouse.Exception); ok {
            fmt.Printf("Exception [%d] %s \n%s\n", exception.Code, exception.Message, exception.StackTrace)
        }
        return nil, err
    }
    return conn, nil
}
```

### Run go mod tidy {#run-go-mod-tidy}

```bash
go mod tidy
```
### Set your connection details {#set-your-connection-details}
Earlier you looked up your connection details.  Set them in `main.go` in the `connect()` function:

```go
func connect() (driver.Conn, error) {
  var (
    ctx       = context.Background()
    conn, err = clickhouse.Open(&clickhouse.Options{
    #highlight-next-line
      Addr: []string{"<CLICKHOUSE_SECURE_NATIVE_HOSTNAME>:9440"},
      Auth: clickhouse.Auth{
    #highlight-start
        Database: "default",
        Username: "default",
        Password: "<DEFAULT_USER_PASSWORD>",
    #highlight-end
      },
```

### Run the example {#run-the-example}
```bash
go run .
```
```response
2023/03/06 14:18:33 name: COLUMNS, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: SCHEMATA, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: TABLES, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: VIEWS, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: hourly_data, uuid: a4e36bd4-1e82-45b3-be77-74a0fe65c52b
```

### Learn more {#learn-more}
The rest of the documentation in this category covers the details of the ClickHouse Go client.

## Overview {#overview}

ClickHouse supports two official Go clients. These clients are complementary and intentionally support different use cases.

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - High level language client which supports either the Go standard `database/sql` interface or the native ClickHouse API.
* [ch-go](https://github.com/ClickHouse/ch-go) - Low level client. Native interface only.

clickhouse-go provides a high-level interface, allowing users to query and insert data using row-orientated semantics and batching that are lenient with respect to data types - values will be converted provided no precision loss is potentially incurred. ch-go, meanwhile, provides an optimized column-orientated interface that provides fast data block streaming with low CPU and memory overhead at the expense of type strictness and more complex usage.

From version 2.3, clickhouse-go utilizes ch-go for low-level functions such as encoding, decoding, and compression. Both clients use the native format for their encoding to provide optimal performance and can communicate over the native ClickHouse protocol. clickhouse-go also supports HTTP as its transport mechanism for cases where users need to proxy or load balance traffic.

### Four ways to connect {#four-ways-to-connect}

clickhouse-go gives you two independent choices: **which API** to use and **which transport** to use. These combine into four connection modes:

|  | **TCP** (Native protocol, port 9000/9440) | **HTTP** (port 8123/8443) |
|:---|:---:|:---:|
| **ClickHouse API** (`clickhouse.Open`) | Default — best performance | Set `Protocol: clickhouse.HTTP` |
| **`database/sql` API** (`OpenDB` / `sql.Open`) | `clickhouse://host:9000` | `http://host:8123` |

**Choosing an API:** Pick the ClickHouse API for maximum performance and the full feature set (progress callbacks, columnar inserts, rich type support). Pick `database/sql` when you need to integrate with ORMs or tools that expect a standard Go database interface.

**Choosing a transport:** TCP is faster and is the default. Switch to HTTP when your infrastructure requires it — for example, when connecting through an HTTP load balancer or proxy, or when you need HTTP-specific features like sessions with temporary tables, or additional compression algorithms (`gzip`, `deflate`, `br`).

Both APIs use the native binary encoding regardless of transport, so HTTP carries no serialization overhead.

|                    | Native format | TCP transport | HTTP transport | Bulk write | Struct marshaling | Compression | Progress callbacks |
|:------------------:|:-------------:|:-------------:|:--------------:|:----------:|:-----------------:|:-----------:|:------------------:|
|   ClickHouse API   |       ✅       |       ✅       |       ✅        |     ✅      |         ✅         |      ✅      |         ✅          |
| `database/sql` API |       ✅       |       ✅       |       ✅        |     ✅      |                   |      ✅      |                    |

### Choosing a client {#choosing-a-client}

Selecting a client library depends on your usage patterns and need for optimal performance. For insert heavy use cases, where millions of inserts are required per second, we recommend using the low level client [ch-go](https://github.com/ClickHouse/ch-go). This client avoids the associated overhead of pivoting the data from a row-orientated format to columns, as the ClickHouse native format requires. Furthermore, it avoids any reflection or use of the `interface{}` (`any`) type to simplify usage.

For query workloads focused on aggregations or lower throughput insert workloads, the [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) provides a familiar `database/sql` interface and more straightforward row semantics. You can also optionally use HTTP for the transport protocol and take advantage of helper functions to marshal rows to and from structs.

|               | Native format | Native protocol | HTTP protocol | Row Orientated API | Column Orientated API | Type flexibility | Compression | Query Placeholders |
|:-------------:|:-------------:|:---------------:|:-------------:|:------------------:|:---------------------:|:----------------:|:-----------:|:------------------:|
| clickhouse-go |       ✅       |        ✅        |       ✅       |          ✅         |           ✅           |         ✅        |      ✅      |          ✅         |
|     ch-go     |       ✅       |        ✅        |               |                    |           ✅           |                  |      ✅      |                    |

## Installation {#installation}

v1 of the driver is deprecated and won't reach feature updates or support for new ClickHouse types. You should migrate to v2, which offers superior performance.

To install the 2.x version of the client, add the package to your go.mod file:

`require github.com/ClickHouse/clickhouse-go/v2 main`

Or, clone the repository:

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

To install another version, modify the path or the branch name accordingly.

```bash
mkdir my-clickhouse-app && cd my-clickhouse-app

cat > go.mod <<-END
  module my-clickhouse-app

  go 1.21

  require github.com/ClickHouse/clickhouse-go/v2 main
END

cat > main.go <<-END
  package main

  import (
    "fmt"
    "github.com/ClickHouse/clickhouse-go/v2"
  )

  func main() {
   conn, _ := clickhouse.Open(&clickhouse.Options{Addr: []string{"127.0.0.1:9000"}})
    v, _ := conn.ServerVersion()
    fmt.Println(v.String())
  }
END

go mod tidy
go run main.go

```

### Versioning {#versioning}

The client is released independently of ClickHouse. 2.x represents the current major under development. All versions of 2.x should be compatible with each other.

#### ClickHouse compatibility {#clickhouse-compatibility}

The client supports:

- All currently supported versions of ClickHouse as recorded [here](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md). As ClickHouse versions are no longer supported they're also no longer actively tested against client releases.
- All versions of ClickHouse 2 years from the release date of the client. Note only LTS versions are actively tested.

#### Golang compatibility {#golang-compatibility}

| Client Version | Golang Versions |
|:--------------:|:---------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|  >= 2.3, < 2.41 |       1.18+     |
|     >= 2.41    |      1.21+      |
|     >= 2.43    |      1.24+      |

## Configuration {#configuration}

### Connection settings {#connection-settings}

When opening a connection, an Options struct can be used to control client behavior. The following settings are available:

* `Protocol` - either `Native` (TCP, default) or `HTTP`. See [TCP vs HTTP](#tcp-vs-http).
* `TLS` - TLS options. A non-nil value enables TLS. See [TLS](#using-tls).
* `Addr` - a slice of addresses including port.
* `Auth` - Authentication detail. See [Authentication](#authentication).
* `DialContext` - custom dial function to determine how connections are established.
* `Debug` - (Deprecated, use `Logger` instead) true/false to enable debug logging to stdout.
* `Debugf` - (Deprecated, use `Logger` instead) provides a custom function to consume debug output. Requires `Debug` to be set to true.
* `Logger` - structured logger using Go's standard `log/slog` package. See [Logging](#logging).
* `Settings` - map of ClickHouse settings. These will be applied to all ClickHouse queries. [Using Context](#using-context) allows settings to be set per query.
* `Compression` - enable compression for blocks. See [Compression](#compression).
* `DialTimeout` - the maximum time to establish a connection. Defaults to `30s`.
* `MaxOpenConns` - max connections for use at any time. More or fewer connections may be in the idle pool, but only this number can be used at any time. Defaults to `MaxIdleConns+5`.
* `MaxIdleConns` - number of connections to maintain in the pool. Connections will be reused if possible. Defaults to `5`.
* `ConnMaxLifetime` - maximum lifetime to keep a connection available. Defaults to 1hr. Connections are destroyed after this time, with new connections added to the pool as required.
* `ConnOpenStrategy` - determines how the list of node addresses should be consumed and used to open connections. See [Connecting to Multiple Nodes](#connecting-to-multiple-nodes).
* `BlockBufferSize` - maximum number of blocks to decode into the buffer at once. Larger values will increase parallelization at the expense of memory. Block sizes are query dependent so while you can set this on the connection, we recommend you override per query based on the data it returns. Defaults to `2`.
* `GetJWT` - callback function that returns a JWT token for authentication with ClickHouse Cloud.
* `TransportFunc` - provides a custom HTTP transport. The default transport is passed as an argument allowing selective overrides. Only applies when using the HTTP protocol.

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    DialContext: func(ctx context.Context, addr string) (net.Conn, error) {
        dialCount++
        var d net.Dialer
        return d.DialContext(ctx, "tcp", addr)
    },
    Debug: true,
    Debugf: func(format string, v ...interface{}) {
        fmt.Printf(format, v)
    },
    Settings: clickhouse.Settings{
        "max_execution_time": 60,
    },
    Compression: &clickhouse.Compression{
        Method: clickhouse.CompressionLZ4,
    },
    DialTimeout:      time.Duration(10) * time.Second,
    MaxOpenConns:     5,
    MaxIdleConns:     5,
    ConnMaxLifetime:  time.Duration(10) * time.Minute,
    ConnOpenStrategy: clickhouse.ConnOpenInOrder,
    BlockBufferSize: 10,
})
if err != nil {
    return err
}
```
[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect_settings.go)

### TLS {#using-tls}

At a low level, all client connect methods (`DSN/OpenDB/Open`) will use the[ Go tls package](https://pkg.go.dev/crypto/tls) to establish a secure connection. The client knows to use TLS if the Options struct contains a non-nil `tls.Config` pointer.

```go
env, err := GetNativeTestEnvironment()
if err != nil {
    return err
}
cwd, err := os.Getwd()
if err != nil {
    return err
}
t := &tls.Config{}
caCert, err := ioutil.ReadFile(path.Join(cwd, "../../tests/resources/CAroot.crt"))
if err != nil {
    return err
}
caCertPool := x509.NewCertPool()
successful := caCertPool.AppendCertsFromPEM(caCert)
if !successful {
    return err
}
t.RootCAs = caCertPool
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.SslPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    TLS: t,
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
if err != nil {
    return err
}
fmt.Println(v.String())
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl.go)

This minimal `TLS.Config` is normally sufficient to connect to the secure native port (normally 9440) on a ClickHouse server. If the ClickHouse server doesn't have a valid certificate (expired, wrong hostname, not signed by a publicly recognized root Certificate Authority), `InsecureSkipVerify` can be true, but this is strongly discouraged.

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.SslPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    TLS: &tls.Config{
        InsecureSkipVerify: true,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
```
[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl_no_verify.go)

If additional TLS parameters are necessary, the application code should set the desired fields in the `tls.Config` struct. That can include specific cipher suites, forcing a particular TLS version (like 1.2 or 1.3), adding an internal CA certificate chain, adding a client certificate (and private key) if required by the ClickHouse server, and most of the other options that come with a more specialized security setup.

### Authentication {#authentication}

Specify an Auth struct in the connection details to specify a username and password.

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
})
if err != nil {
    return err
}

v, err := conn.ServerVersion()
```
[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)

### Connecting to multiple nodes {#connecting-to-multiple-nodes}

Multiple addresses can be specified via the `Addr` struct.

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{"127.0.0.1:9001", "127.0.0.1:9002", fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
if err != nil {
    return err
}
fmt.Println(v.String())
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)

Three connection strategies are available:

* `ConnOpenInOrder` (default)  - addresses are consumed in order. Later addresses are only utilized in case of failure to connect using addresses earlier in the list. This is effectively a failure-over strategy.
* `ConnOpenRoundRobin` - Load is balanced across the addresses using a round-robin strategy.
* `ConnOpenRandom` - A node is selected at random from the list of addresses.

This can be controlled through the option `ConnOpenStrategy`

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr:             []string{"127.0.0.1:9001", "127.0.0.1:9002", fmt.Sprintf("%s:%d", env.Host, env.Port)},
    ConnOpenStrategy: clickhouse.ConnOpenRoundRobin,
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
if err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L50-L67)

### Connection pooling {#connection-pooling}

The client maintains a pool of connections, reusing these across queries as required. At most, `MaxOpenConns` will be used at any time, with the maximum pool size controlled by the `MaxIdleConns`. The client will acquire a connection from the pool for each query execution, returning it to the pool for reuse. A connection is used for the lifetime of a batch and released on `Send()`.

There is no guarantee the same connection in a pool will be used for subsequent queries unless the user sets `MaxOpenConns=1`. This is rarely needed but may be required for cases where users are using temporary tables.

Also, note that the `ConnMaxLifetime` is by default 1hr. This can lead to cases where the load to ClickHouse becomes unbalanced if nodes leave the cluster. This can occur when a node becomes unavailable, connections will balance to the other nodes. These connections will persist and not be refreshed for 1hr by default, even if the problematic node returns to the cluster. Consider lowering this value in heavy workload cases.

Connection polling is enabled for both Native (TCP) and HTTP protocol.

### Logging {#logging}

The client supports structured logging via Go's standard `log/slog` package using the `Logger` field in `Options`. The older `Debug` and `Debugf` fields are deprecated but still work for backward compatibility (priority: `Debugf` > `Logger` > no-op).

```go
import (
    "log/slog"
    "os"
)

// JSON structured logging
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelDebug,
}))

conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Logger: logger,
})
```

You can also enrich the logger with application-level context:

```go
baseLogger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,
}))
enrichedLogger := baseLogger.With(
    slog.String("service", "my-service"),
    slog.String("environment", "production"),
)

conn, err := clickhouse.Open(&clickhouse.Options{
    // ...
    Logger: enrichedLogger,
})
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/logger_test.go)

### Compression {#compression}

Support for compression methods depends on the underlying protocol in use. For the native protocol, the client supports `LZ4` and `ZSTD` compression. This is performed at a block level only. Compression can be enabled by including a `Compression` configuration with the connection.

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Compression: &clickhouse.Compression{
        Method: clickhouse.CompressionZSTD,
    },
    MaxOpenConns: 1,
})
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(context.Background(), "DROP TABLE IF EXISTS example")
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 Array(String)
    ) Engine Memory
    `); err != nil {
    return err
}
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1000; i++ {
    if err := batch.Append([]string{strconv.Itoa(i), strconv.Itoa(i + 1), strconv.Itoa(i + 2), strconv.Itoa(i + 3)}); err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

Additional compression techniques are available when using HTTP transport: `gzip`, `deflate`, and `br`. See [database/sql API - Compression](#compression-sql) for details.

### TCP vs HTTP {#tcp-vs-http}

The transport is a single config switch — everything else in this guide applies to both. Here is what changes:

| | TCP (Native protocol) | HTTP |
|:---|:---|:---|
| **Default port** | 9000 (plain), 9440 (TLS) | 8123 (plain), 8443 (TLS) |
| **Enable** | Default — omit `Protocol` | `Protocol: clickhouse.HTTP` or use an `http://` DSN |
| **Compression** | `lz4`, `zstd` | `lz4`, `zstd`, `gzip`, `deflate`, `br` |
| **Sessions** | Built-in (always active) | Explicit — pass `session_id` as a setting |
| **HTTP headers** | — | `HttpHeaders`, `HttpUrlPath`, `HttpMaxConnsPerHost` |
| **Custom transport** | — | `TransportFunc` |
| **JWT auth** | — | `GetJWT` (ClickHouse Cloud HTTPS) |
| **OpenTelemetry (`WithSpan`)** | ✅ | Server supports it; client does not yet send `traceparent` header |

To switch either API to HTTP:

```go
// ClickHouse API over HTTP
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr:     []string{"host:8123"},
    Protocol: clickhouse.HTTP,
    // ... auth, etc.
})

// database/sql over HTTP — via Options
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr:     []string{"host:8123"},
    Protocol: clickhouse.HTTP,
    // ... auth, etc.
})

// database/sql over HTTP — via DSN
conn, err := sql.Open("clickhouse", "http://host:8123?username=user&password=pass")
```

## ClickHouse API {#clickhouse-api}

All code examples for the ClickHouse Client API can be found [here](https://github.com/ClickHouse/clickhouse-go/tree/main/examples).

For supported data types and Go type mappings, see [Data types](#data-types).

### Connecting {#connecting}

The following example, which returns the server version, demonstrates connecting to ClickHouse - assuming ClickHouse isn't secured and accessible with the default user.

Note we use the default native port to connect.

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
fmt.Println(v)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect.go)

**For all subsequent examples, unless explicitly shown, we assume the use of the ClickHouse `conn` variable has been created and is available.**

### Execution {#execution}

Arbitrary statements can be executed via the `Exec` method. This is useful for DDL and simple statements. It shouldn't be used for larger inserts or query iterations.

```go
conn.Exec(context.Background(), `DROP TABLE IF EXISTS example`)
err = conn.Exec(context.Background(), `
    CREATE TABLE IF NOT EXISTS example (
        Col1 UInt8,
        Col2 String
    ) engine=Memory
`)
if err != nil {
    return err
}
conn.Exec(context.Background(), "INSERT INTO example VALUES (1, 'test-1')")
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/exec.go)

Note the ability to pass a Context to the query. This can be used to pass specific query level settings - see [Using Context](#using-context).

### Batch insert {#batch-insert}

To insert a large number of rows, the client provides batch semantics. This requires the preparation of a batch to which rows can be appended. This is finally sent via the `Send()` method. Batches are held in memory until `Send` is executed.

It is recommended to call `Close` on the batch to prevent leaking connections. This can be done via the `defer` keyword after preparing the batch. This will clean up the connection if `Send` never gets called. Note that this will result in 0 row inserts showing up in the query log if no rows were appended.

```go
conn, err := GetNativeConnection(nil, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(context.Background(), "DROP TABLE IF EXISTS example")
err = conn.Exec(ctx, `
    CREATE TABLE IF NOT EXISTS example (
            Col1 UInt8
        , Col2 String
        , Col3 FixedString(3)
        , Col4 UUID
        , Col5 Map(String, UInt8)
        , Col6 Array(String)
        , Col7 Tuple(String, UInt8, Array(Map(String, String)))
        , Col8 DateTime
    ) Engine = Memory
`)
if err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1000; i++ {
    err := batch.Append(
        uint8(42),
        "ClickHouse",
        "Inc",
        uuid.New(),
        map[string]uint8{"key": 1},             // Map(String, UInt8)
        []string{"Q", "W", "E", "R", "T", "Y"}, // Array(String)
        []interface{}{ // Tuple(String, UInt8, Array(Map(String, String)))
            "String Value", uint8(5), []map[string]string{
                {"key": "value"},
                {"key": "value"},
                {"key": "value"},
            },
        },
        time.Now(),
    )
    if err != nil {
        return err
    }
}

return batch.Send()
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

Recommendations for ClickHouse apply [here](/guides/inserting-data#best-practices-for-inserts). Batches shouldn't be shared across go-routines - construct a separate batch per routine.

From the above example, note the need for variable types to align with the column type when appending rows. While the mapping is usually obvious, this interface tries to be flexible, and types will be converted provided no precision loss is incurred. For example, the following demonstrates inserting a string into a datetime64.

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1000; i++ {
    err := batch.Append(
        "2006-01-02 15:04:05.999",
    )
    if err != nil {
        return err
    }
}

return batch.Send()
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)

For a full summary of supported go types for each column type, see [Type Conversions](#type-conversions).

### Ephemeral columns {#ephemeral-columns}

[Ephemeral columns](https://clickhouse.com/docs/sql-reference/statements/create/table#ephemeral) are write-only columns that exist only during insertion — they are not stored and cannot be selected. They are useful for computing derived column values at insert time.

```go
ctx := context.Background()
ddl := `
CREATE OR REPLACE TABLE test
(
    id UInt64,
    unhexed String EPHEMERAL,
    hexed FixedString(4) DEFAULT unhex(unhexed)
)
ENGINE = MergeTree
ORDER BY id`

if err := conn.Exec(ctx, ddl); err != nil {
    return err
}

// Insert by providing the ephemeral column value
if err := conn.Exec(ctx, "INSERT INTO test (id, unhexed) VALUES (1, '5a90b714')"); err != nil {
    return err
}

// Only non-ephemeral columns can be queried
rows, err := conn.Query(ctx, "SELECT id, hexed, hex(hexed) FROM test")
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ephemeral_native.go)

### Querying rows {#querying-rows}

You can either query for a single row using the `QueryRow` method or obtain a cursor for iteration over a result set via `Query`. While the former accepts a destination for the data to be serialized into, the latter requires the call to `Scan` on each row.

```go
row := conn.QueryRow(context.Background(), "SELECT * FROM example")
var (
    col1             uint8
    col2, col3, col4 string
    col5             map[string]uint8
    col6             []string
    col7             []interface{}
    col8             time.Time
)
if err := row.Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7, &col8); err != nil {
    return err
}
fmt.Printf("row: col1=%d, col2=%s, col3=%s, col4=%s, col5=%v, col6=%v, col7=%v, col8=%v\n", col1, col2, col3, col4, col5, col6, col7, col8)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_row.go)

```go
rows, err := conn.Query(ctx, "SELECT Col1, Col2, Col3 FROM example WHERE Col1 >= 2")
if err != nil {
    return err
}
for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    if err := rows.Scan(&col1, &col2, &col3); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d, col2=%s, col3=%s\n", col1, col2, col3)
}
rows.Close()
return rows.Err()
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_rows.go)

Note in both cases, we're required to pass a pointer to the variables we wish to serialize the respective column values into. These must be passed in the order specified in the `SELECT` statement - by default, the order of column declaration will be used in the event of a `SELECT *` as shown above.

Similar to insertion, the Scan method requires the target variables to be of an appropriate type. This again aims to be flexible, with types converted where possible, provided no precision loss is possible, e.g., the above example shows a UUID column being read into a string variable. For a full list of supported go types for each Column type, see [Type Conversions](#type-conversions).

Finally, note the ability to pass a `Context` to the `Query` and `QueryRow` methods. This can be used for query level settings - see [Using Context](#using-context) for further details.

### Async insert {#async-insert}

Asynchronous inserts are supported through the Async method. This allows the user to specify whether the client should wait for the server to complete the insert or respond once the data has been received. This effectively controls the parameter [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert).

```go
conn, err := GetNativeConnection(nil, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
if err := clickhouse_tests.CheckMinServerServerVersion(conn, 21, 12, 0); err != nil {
    return nil
}
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(ctx, `DROP TABLE IF EXISTS example`)
const ddl = `
    CREATE TABLE example (
            Col1 UInt64
        , Col2 String
        , Col3 Array(UInt8)
        , Col4 DateTime
    ) ENGINE = Memory
`
if err := conn.Exec(ctx, ddl); err != nil {
    return err
}
for i := 0; i < 100; i++ {
    if err := conn.AsyncInsert(ctx, fmt.Sprintf(`INSERT INTO example VALUES (
        %d, '%s', [1, 2, 3, 4, 5, 6, 7, 8, 9], now()
    )`, i, "Golang SQL database driver"), false); err != nil {
        return err
    }
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)

### Columnar insert {#columnar-insert}

Inserts can be inserted in column format. This can provide performance benefits if the data is already orientated in this structure by avoiding the need to pivot to rows.

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var (
    col1 []uint64
    col2 []string
    col3 [][]uint8
    col4 []time.Time
)
for i := 0; i < 1_000; i++ {
    col1 = append(col1, uint64(i))
    col2 = append(col2, "Golang SQL database driver")
    col3 = append(col3, []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9})
    col4 = append(col4, time.Now())
}
if err := batch.Column(0).Append(col1); err != nil {
    return err
}
if err := batch.Column(1).Append(col2); err != nil {
    return err
}
if err := batch.Column(2).Append(col3); err != nil {
    return err
}
if err := batch.Column(3).Append(col4); err != nil {
    return err
}

return batch.Send()
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)

### Using structs {#using-structs}

For users, Golang structs provide a logical representation of a row of data in ClickHouse. To assist with this, the native interface provides several convenient functions.

#### Select with serialize {#select-with-serialize}

The Select method allows a set of response rows to be marshaled into a slice of structs with a single invocation.

```go
var result []struct {
    Col1           uint8
    Col2           string
    ColumnWithName time.Time `ch:"Col3"`
}

if err = conn.Select(ctx, &result, "SELECT Col1, Col2, Col3 FROM example"); err != nil {
    return err
}

for _, v := range result {
    fmt.Printf("row: col1=%d, col2=%s, col3=%s\n", v.Col1, v.Col2, v.ColumnWithName)
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)

#### Scan struct {#scan-struct}

`ScanStruct` allows the marshaling of a single Row from a query into a struct.

```go
var result struct {
    Col1  int64
    Count uint64 `ch:"count"`
}
if err := conn.QueryRow(context.Background(), "SELECT Col1, COUNT() AS count FROM example WHERE Col1 = 5 GROUP BY Col1").ScanStruct(&result); err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/scan_struct.go)

#### Append struct {#append-struct}

`AppendStruct` allows a struct to be appended to an existing [batch](#batch-insert) and interpreted as a complete row. This requires the columns of the struct to align in both name and type with the table. While all columns must have an equivalent struct field, some struct fields may not have an equivalent column representation. These will simply be ignored.

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1_000; i++ {
    err := batch.AppendStruct(&row{
        Col1:       uint64(i),
        Col2:       "Golang SQL database driver",
        Col3:       []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9},
        Col4:       time.Now(),
        ColIgnored: "this will be ignored",
    })
    if err != nil {
        return err
    }
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)

### Parameter binding {#parameter-binding}

The client supports parameter binding for the `Exec`, `Query`, and `QueryRow` methods. As shown in the example below, this is supported using named, numbered, and positional parameters. We provide examples of these below.

```go
var count uint64
// positional bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("Positional bind count: %d\n", count)
// numeric bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("Numeric bind count: %d\n", count)
// named bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("Named bind count: %d\n", count)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)

#### Special cases {#special-cases}

By default, slices will be unfolded into a comma-separated list of values if passed as a parameter to a query. If you require a set of values to be injected with wrapping `[ ]`, `ArraySet` should be used.

If groups/tuples are required, with wrapping `( )` e.g., for use with IN operators, you can use a `GroupSet`. This is particularly useful for cases where multiple groups are required, as shown in the example below.

Finally, DateTime64 fields require precision in order to ensure parameters are rendered appropriately. The precision level for the field is unknown by the client, however, so the user must provide it. To facilitate this, we provide the `DateNamed` parameter.

```go
var count uint64
// arrays will be unfolded
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Array unfolded count: %d\n", count)
// arrays will be preserved with []
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Array count: %d\n", count)
// Group sets allow us to form ( ) lists
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Group count: %d\n", count)
// More useful when we need nesting
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Group count: %d\n", count)
// Use DateNamed when you need a precision in your time#
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("NamedDate count: %d\n", count)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

### Using context {#using-context}

Go contexts provide a means of passing deadlines, cancellation signals, and other request-scoped values across API boundaries. All methods on a connection accept a context as their first variable. While previous examples used context.Background(), you can use this capability to pass settings and deadlines and to cancel queries.

Passing a context created `withDeadline` allows execution time limits to be placed on queries. Note this is an absolute time and expiry will only release the connection and send a cancel signal to ClickHouse. `WithCancel` can alternatively be used to cancel a query explicitly.

The helpers  `clickhouse.WithQueryID` and `clickhouse.WithQuotaKey` allow a query id and quota key to be specified. Query ids can be useful for tracking queries in logs and for cancellation purposes. A quota key can be used to impose limits on ClickHouse usage based on a unique key value - see [Quotas Management](/operations/access-rights#quotas-management) for further details.

You can also use the context to ensure a setting is only applied for a specific query - rather than for the entire connection, as shown in [Connection Settings](#connection-settings).

Finally, you can control the size of the block buffer via the `clickhouse.WithBlockSize`. This overrides the connection level setting `BlockBufferSize` and controls the maximum number of blocks that are decoded and held in memory at any time. Larger values potentially mean more parallelization at the expense of memory.

Examples of the above are shown below.

```go
dialCount := 0
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    DialContext: func(ctx context.Context, addr string) (net.Conn, error) {
        dialCount++
        var d net.Dialer
        return d.DialContext(ctx, "tcp", addr)
    },
})
if err != nil {
    return err
}
if err := clickhouse_tests.CheckMinServerServerVersion(conn, 22, 6, 1); err != nil {
    return nil
}
// we can use context to pass settings to a specific API call
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "async_insert": "1",
}))

// queries can be cancelled using the context
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// set a deadline for a query - this will cancel the query after the absolute time is reached.
// queries will continue to completion in ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

// set a query id to assist tracing queries in logs e.g. see system.query_log
var one uint8
queryId, _ := uuid.NewUUID()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQueryID(queryId.String()))
if err = conn.QueryRow(ctx, "SELECT 1").Scan(&one); err != nil {
    return err
}

conn.Exec(context.Background(), "DROP QUOTA IF EXISTS foobar")
defer func() {
    conn.Exec(context.Background(), "DROP QUOTA IF EXISTS foobar")
}()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQuotaKey("abcde"))
// set a quota key - first create the quota
if err = conn.Exec(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

type Number struct {
    Number uint64 `ch:"number"`
}
for i := 1; i <= 6; i++ {
    var result []Number
    if err = conn.Select(ctx, &result, "SELECT number FROM numbers(10)"); err != nil {
        return err
    }
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)

### Progress, profile and log information {#progress-profile-log}

Progress, Profile, and Log information can be requested on queries. Progress information will report statistics on the number of rows and bytes that have been read and processed in ClickHouse. Conversely, Profile information provides a summary of data returned to the client, including totals of bytes (uncompressed), rows, and blocks. Finally, log information provides statistics on threads, e.g., memory usage and data speed.

Obtaining this information requires the user to use [Context](#using-context), to which the user can pass call-back functions.

```go
totalRows := uint64(0)
// use context to pass a call back for progress and profile info
ctx := clickhouse.Context(context.Background(), clickhouse.WithProgress(func(p *clickhouse.Progress) {
    fmt.Println("progress: ", p)
    totalRows += p.Rows
}), clickhouse.WithProfileInfo(func(p *clickhouse.ProfileInfo) {
    fmt.Println("profile info: ", p)
}), clickhouse.WithLogs(func(log *clickhouse.Log) {
    fmt.Println("log info: ", log)
}))

rows, err := conn.Query(ctx, "SELECT number from numbers(1000000) LIMIT 1000000")
if err != nil {
    return err
}
for rows.Next() {
}

// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

fmt.Printf("Total Rows: %d\n", totalRows)
rows.Close()
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)

### Dynamic scanning {#dynamic-scanning}

You may need to read tables for which they don't know the schema or type of the fields being returned. This is common in cases where ad-hoc data analysis is performed or generic tooling is written. To achieve this, column-type information is available on query responses. This can be used with Go reflection to create runtime instances of correctly typed variables which can be passed to Scan.

```go
const query = `
SELECT
        1     AS Col1
    , 'Text' AS Col2
`
rows, err := conn.Query(context.Background(), query)
if err != nil {
    return err
}
defer rows.Close()
var (
    columnTypes = rows.ColumnTypes()
    vars        = make([]interface{}, len(columnTypes))
)
for i := range columnTypes {
    vars[i] = reflect.New(columnTypes[i].ScanType()).Interface()
}
for rows.Next() {
    if err := rows.Scan(vars...); err != nil {
        return err
    }
    for _, v := range vars {
        switch v := v.(type) {
        case *string:
            fmt.Println(*v)
        case *uint8:
            fmt.Println(*v)
        }
    }
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)

### External tables {#external-tables}

[External tables](/engines/table-engines/special/external-data/) allow the client to send data to ClickHouse, with a SELECT query. This data is put in a temporary table and can be used in the query itself for evaluation.

To send external data to the client with a query, the user must build an external table via `ext.NewTable` before passing this via the context.

```go
table1, err := ext.NewTable("external_table_1",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)
if err != nil {
    return err
}

for i := 0; i < 10; i++ {
    if err = table1.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now()); err != nil {
        return err
    }
}

table2, err := ext.NewTable("external_table_2",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)

for i := 0; i < 10; i++ {
    table2.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now())
}
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithExternalTable(table1, table2),
)
rows, err := conn.Query(ctx, "SELECT * FROM external_table_1")
if err != nil {
    return err
}
for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    rows.Scan(&col1, &col2, &col3)
    fmt.Printf("col1=%d, col2=%s, col3=%v\n", col1, col2, col3)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
rows.Close()

var count uint64
if err := conn.QueryRow(ctx, "SELECT COUNT(*) FROM external_table_1").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1: %d\n", count)
if err := conn.QueryRow(ctx, "SELECT COUNT(*) FROM external_table_2").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_2: %d\n", count)
if err := conn.QueryRow(ctx, "SELECT COUNT(*) FROM (SELECT * FROM external_table_1 UNION ALL SELECT * FROM external_table_2)").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1 UNION external_table_2: %d\n", count)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)

### Open telemetry {#open-telemetry}

ClickHouse supports [trace context propagation](/operations/opentelemetry/) on both TCP and HTTP transports. When using TCP, the client serializes the span into the native binary protocol. Use `clickhouse.WithSpan` to attach a span to a query via the context.

:::note HTTP transport limitation
While ClickHouse server accepts the standard `traceparent` / `tracestate` HTTP headers, the clickhouse-go HTTP transport does not currently send them — `WithSpan` has no effect over HTTP. As a workaround, you can set the header manually via `HttpHeaders` in the connection options.
:::

```go
var count uint64
rows := conn.QueryRow(clickhouse.Context(context.Background(), clickhouse.WithSpan(
    trace.NewSpanContext(trace.SpanContextConfig{
        SpanID:  trace.SpanID{1, 2, 3, 4, 5},
        TraceID: trace.TraceID{5, 4, 3, 2, 1},
    }),
)), "SELECT COUNT() FROM (SELECT number FROM system.numbers LIMIT 5)")
if err := rows.Scan(&count); err != nil {
    return err
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
fmt.Printf("count: %d\n", count)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

Full details on exploiting tracing can be found under [OpenTelemetry support](/operations/opentelemetry/).

## Database/SQL API {#database-sql-api}

The `database/sql` or "standard" API allows you to use the client in scenarios where application code should be agnostic of the underlying databases by conforming to a standard interface. This comes at some expense - additional layers of abstraction and indirection and primitives which aren't necessarily aligned with ClickHouse. These costs are, however, typically acceptable in scenarios where tooling needs to connect to multiple databases.

Additionally, this client supports using HTTP as the transport layer - data will still be encoded in the native format for optimal performance.

Full code examples for the standard API can be found [here](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std).

For supported data types and Go type mappings, see [Data types](#data-types).

### Connecting {#connecting-sql}

Connection can be achieved either via a DSN string with the format `clickhouse://<host>:<port>?<query_option>=<value>` and `Open` method or via the `clickhouse.OpenDB` method. The latter isn't part of the `database/sql` specification but returns a `sql.DB` instance. This method provides functionality such as profiling, for which there are no obvious means of exposing through the `database/sql` specification.

```go
func Connect() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
        })
        return conn.Ping()
}

func ConnectDSN() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("clickhouse://%s:%d?username=%s&password=%s", env.Host, env.Port, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect.go)

**For all subsequent examples, unless explicitly shown, we assume the use of the ClickHouse `conn` variable has been created and is available.**

#### Connection settings {#connection-settings-sql}

Most configuration options are shared with the ClickHouse API. See [Configuration](#configuration) for shared settings. The following SQL-specific DSN parameters are available:

* `hosts` - comma-separated list of single address hosts for load-balancing and failover - see [Connecting to Multiple Nodes](#connecting-to-multiple-nodes).
* `username/password` - auth credentials - see [Authentication](#authentication)
* `database` - select the current default database
* `dial_timeout` - a duration string is a possibly signed sequence of decimal numbers, each with optional fraction and a unit suffix such as `300ms`, `1s`. Valid time units are `ms`, `s`, `m`.
* `connection_open_strategy` - `random/in_order` (default `random`) - see [Connecting to Multiple Nodes](#connecting-to-multiple-nodes)
  - `round_robin` - choose a round-robin server from the set
  - `in_order` - first live server is chosen in specified order
* `debug` - enable debug output (boolean value)
* `compress` - specify the compression algorithm - `none` (default), `zstd`, `lz4`, `gzip`, `deflate`, `br`. If set to `true`, `lz4` will be used. Only `lz4` and `zstd` are supported for native communication.
* `compress_level` - Level of compression (default is `0`). See Compression. This is algorithm specific:
  - `gzip` - `-2` (Best Speed) to `9` (Best Compression)
  - `deflate` - `-2` (Best Speed) to `9` (Best Compression)
  - `br` - `0` (Best Speed) to `11` (Best Compression)
  - `zstd`, `lz4` - ignored
* `secure` - establish secure SSL connection (default is `false`)
* `skip_verify` - skip certificate verification (default is `false`)
* `block_buffer_size` - allows you to control the block buffer size. See [`BlockBufferSize`](#connection-settings). (default is `2`)

```go
func ConnectSettings() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("clickhouse://127.0.0.1:9001,127.0.0.1:9002,%s:%d/%s?username=%s&password=%s&dial_timeout=10s&connection_open_strategy=round_robin&debug=true&compress=lz4", env.Host, env.Port, env.Database, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```
[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)

#### Connecting over HTTP {#connecting-over-http}

By default, connections are established over the native protocol. For users needing HTTP, this can be enabled by either modifying the DSN to include the HTTP protocol or by specifying the Protocol in the connection options.

```go
func ConnectHTTP() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
                Protocol: clickhouse.HTTP,
        })
        return conn.Ping()
}

func ConnectDSNHTTP() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s", env.Host, env.HttpPort, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)

#### Sessions {#sessions}

:::note HTTP only
Sessions are only needed when using the HTTP transport. Native TCP connections have a built-in session automatically.
:::

When using HTTP, pass a `session_id` as a setting to enable session-bound features such as temporary tables.

```go
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Protocol: clickhouse.HTTP,
    Settings: clickhouse.Settings{
        "session_id": uuid.NewString(),
    },
})
if _, err := conn.Exec(`DROP TABLE IF EXISTS example`); err != nil {
    return err
}
_, err = conn.Exec(`
    CREATE TEMPORARY TABLE IF NOT EXISTS example (
            Col1 UInt8
    )
`)
if err != nil {
    return err
}
scope, err := conn.Begin()
if err != nil {
    return err
}
batch, err := scope.Prepare("INSERT INTO example")
if err != nil {
    return err
}
for i := 0; i < 10; i++ {
    _, err := batch.Exec(
        uint8(i),
    )
    if err != nil {
        return err
    }
}
rows, err := conn.Query("SELECT * FROM example")
if err != nil {
    return err
}
defer rows.Close()

var (
    col1 uint8
)
for rows.Next() {
    if err := rows.Scan(&col1); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d\n", col1)
}

// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

### Execution {#execution-sql}

Once a connection has been obtained, you can issue `sql` statements for execution via the Exec method.

```go
conn.Exec(`DROP TABLE IF EXISTS example`)
_, err = conn.Exec(`
    CREATE TABLE IF NOT EXISTS example (
        Col1 UInt8,
        Col2 String
    ) engine=Memory
`)
if err != nil {
    return err
}
_, err = conn.Exec("INSERT INTO example VALUES (1, 'test-1')")
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/exec.go)

This method doesn't support receiving a context - by default, it executes with the background context. You can use `ExecContext` if this is needed - see [Using Context](#using-context-sql).

### Batch insert {#batch-insert-sql}

Batch semantics can be achieved by creating a `sql.Tx` via the `Being` method. From this, a batch can be obtained using the `Prepare` method with the `INSERT` statement. This returns a `sql.Stmt` to which rows can be appended using the `Exec` method. The batch will be accumulated in memory until `Commit` is executed on the original `sql.Tx`.

```go
batch, err := scope.Prepare("INSERT INTO example")
if err != nil {
    return err
}
for i := 0; i < 1000; i++ {
    _, err := batch.Exec(
        uint8(42),
        "ClickHouse", "Inc",
        uuid.New(),
        map[string]uint8{"key": 1},             // Map(String, UInt8)
        []string{"Q", "W", "E", "R", "T", "Y"}, // Array(String)
        []interface{}{ // Tuple(String, UInt8, Array(Map(String, String)))
            "String Value", uint8(5), []map[string]string{
                map[string]string{"key": "value"},
                map[string]string{"key": "value"},
                map[string]string{"key": "value"},
            },
        },
        time.Now(),
    )
    if err != nil {
        return err
    }
}
return scope.Commit()
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)

### Querying rows {#querying-rows-sql}

Querying a single row can be achieved using the `QueryRow` method. This returns a  *sql.Row, on which Scan can be invoked with pointers to variables into which the columns should be marshaled. A `QueryRowContext` variant allows a context to be passed other than background - see [Using Context](#using-context-sql).

```go
row := conn.QueryRow("SELECT * FROM example")
var (
    col1             uint8
    col2, col3, col4 string
    col5             map[string]uint8
    col6             []string
    col7             interface{}
    col8             time.Time
)
if err := row.Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7, &col8); err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_row.go)

Iterating multiple rows requires the `Query` method. This returns a `*sql.Rows` struct on which Next can be invoked to iterate through the rows. `QueryContext` equivalent allows passing of a context.

```go
rows, err := conn.Query("SELECT * FROM example")
if err != nil {
    return err
}
defer rows.Close()

var (
    col1             uint8
    col2, col3, col4 string
    col5             map[string]uint8
    col6             []string
    col7             interface{}
    col8             time.Time
)
for rows.Next() {
    if err := rows.Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7, &col8); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d, col2=%s, col3=%s, col4=%s, col5=%v, col6=%v, col7=%v, col8=%v\n", col1, col2, col3, col4, col5, col6, col7, col8)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

### Async insert {#async-insert-sql}

Asynchronous inserts can be achieved by executing an insert via the `ExecContext` method. This should be passed a context with asynchronous mode enabled, as shown below. This allows the user to specify whether the client should wait for the server to complete the insert or respond once the data has been received. This effectively controls the parameter [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert).

```go
const ddl = `
    CREATE TABLE example (
            Col1 UInt64
        , Col2 String
        , Col3 Array(UInt8)
        , Col4 DateTime
    ) ENGINE = Memory
    `
if _, err := conn.Exec(ddl); err != nil {
    return err
}
ctx := clickhouse.Context(context.Background(), clickhouse.WithStdAsync(false))
{
    for i := 0; i < 100; i++ {
        _, err := conn.ExecContext(ctx, fmt.Sprintf(`INSERT INTO example VALUES (
            %d, '%s', [1, 2, 3, 4, 5, 6, 7, 8, 9], now()
        )`, i, "Golang SQL database driver"))
        if err != nil {
            return err
        }
    }
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)

### Parameter binding {#parameter-binding-sql}

The standard API supports the same parameter binding capabilities as the [ClickHouse API](#parameter-binding), allowing parameters to be passed to the `Exec`, `Query` and `QueryRow` methods (and their equivalent [Context](#using-context-sql) variants). Positional, named and numbered parameters are supported.

```go
var count uint64
// positional bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("Positional bind count: %d\n", count)
// numeric bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("Numeric bind count: %d\n", count)
// named bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("Named bind count: %d\n", count)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

Note [special cases](#special-cases) still apply.

### Using context {#using-context-sql}

The standard API supports the same ability to pass deadlines, cancellation signals, and other request-scoped values via the context as the [ClickHouse API](#using-context). Unlike the ClickHouse API, this is achieved by using `Context` variants of the methods i.e. methods such as `Exec`, which use the background context by default, have a variant `ExecContext` to which a context can be passed as the first parameter. This allows a context to be passed at any stage of an application flow. For example, you can pass a context when establishing a connection via `ConnContext` or when requesting a query row via `QueryRowContext`. Examples of all available methods are shown below.

For more detail on using the context to pass deadlines, cancellation signals, query ids, quota keys and connection settings see Using Context for the [ClickHouse API](#using-context).

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "async_insert": "1",
}))

// queries can be cancelled using the context
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// set a deadline for a query - this will cancel the query after the absolute time is reached. Again terminates the connection only,
// queries will continue to completion in ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

// set a query id to assist tracing queries in logs e.g. see system.query_log
var one uint8
ctx = clickhouse.Context(context.Background(), clickhouse.WithQueryID(uuid.NewString()))
if err = conn.QueryRowContext(ctx, "SELECT 1").Scan(&one); err != nil {
    return err
}

conn.ExecContext(context.Background(), "DROP QUOTA IF EXISTS foobar")
defer func() {
    conn.ExecContext(context.Background(), "DROP QUOTA IF EXISTS foobar")
}()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQuotaKey("abcde"))
// set a quota key - first create the quota
if _, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

// queries can be cancelled using the context
ctx, cancel = context.WithCancel(context.Background())
// we will get some results before cancel
ctx = clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
    "max_block_size": "1",
}))
rows, err := conn.QueryContext(ctx, "SELECT sleepEachRow(1), number FROM numbers(100);")
if err != nil {
    return err
}
defer rows.Close()

var (
    col1 uint8
    col2 uint8
)

for rows.Next() {
    if err := rows.Scan(&col1, &col2); err != nil {
        if col2 > 3 {
            fmt.Println("expected cancel")
            return nil
        }
        return err
    }
    fmt.Printf("row: col2=%d\n", col2)
    if col2 == 3 {
        cancel()
    }
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

### Dynamic scanning {#dynamic-scanning-sql}

Similar to the [ClickHouse API](#dynamic-scanning), column type information is available to allow you to create runtime instances of correctly typed variables which can be passed to Scan. This allows columns to be read where the type isn't known.

```go
const query = `
SELECT
        1     AS Col1
    , 'Text' AS Col2
`
rows, err := conn.QueryContext(context.Background(), query)
if err != nil {
    return err
}
defer rows.Close()

columnTypes, err := rows.ColumnTypes()
if err != nil {
    return err
}
vars := make([]interface{}, len(columnTypes))
for i := range columnTypes {
    vars[i] = reflect.New(columnTypes[i].ScanType()).Interface()
}
for rows.Next() {
    if err := rows.Scan(vars...); err != nil {
        return err
    }
    for _, v := range vars {
        switch v := v.(type) {
        case *string:
            fmt.Println(*v)
        case *uint8:
            fmt.Println(*v)
        }
    }
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)

### External tables {#external-tables-sql}

[External tables](/engines/table-engines/special/external-data/) allow the client to send data to ClickHouse, with a `SELECT` query. This data is put in a temporary table and can be used in the query itself for evaluation.

To send external data to the client with a query, the user must build an external table via `ext.NewTable` before passing this via the context.

```go
table1, err := ext.NewTable("external_table_1",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)
if err != nil {
    return err
}

for i := 0; i < 10; i++ {
    if err = table1.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now()); err != nil {
        return err
    }
}

table2, err := ext.NewTable("external_table_2",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)

for i := 0; i < 10; i++ {
    table2.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now())
}
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithExternalTable(table1, table2),
)
rows, err := conn.QueryContext(ctx, "SELECT * FROM external_table_1")
if err != nil {
    return err
}
defer rows.Close()

for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    rows.Scan(&col1, &col2, &col3)
    fmt.Printf("col1=%d, col2=%s, col3=%v\n", col1, col2, col3)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

var count uint64
if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM external_table_1").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1: %d\n", count)
if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM external_table_2").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_2: %d\n", count)
if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM (SELECT * FROM external_table_1 UNION ALL SELECT * FROM external_table_2)").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1 UNION external_table_2: %d\n", count)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)

### Open telemetry {#open-telemetry-sql}

ClickHouse supports [trace context propagation](/operations/opentelemetry/) on both TCP and HTTP transports. Use `clickhouse.WithSpan` to attach a span to a query via the context.

:::note HTTP transport limitation
While ClickHouse server accepts the standard `traceparent` / `tracestate` HTTP headers, the clickhouse-go HTTP transport does not currently send them — `WithSpan` has no effect over HTTP. As a workaround, you can set the header manually via `HttpHeaders` in the connection options.
:::

```go
var count uint64
rows := conn.QueryRowContext(clickhouse.Context(context.Background(), clickhouse.WithSpan(
    trace.NewSpanContext(trace.SpanContextConfig{
        SpanID:  trace.SpanID{1, 2, 3, 4, 5},
        TraceID: trace.TraceID{5, 4, 3, 2, 1},
    }),
)), "SELECT COUNT() FROM (SELECT number FROM system.numbers LIMIT 5)")
if err := rows.Scan(&count); err != nil {
    return err
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
fmt.Printf("count: %d\n", count)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)

### Compression {#compression-sql}

The standard API supports the same compression algorithms as native [ClickHouse API](#compression) i.e. `lz4` and `zstd` compression at a block level. In addition, gzip, deflate and br compression are supported for HTTP connections. If any of these are enabled, compression is performed on blocks during insertion and for query responses. Other requests e.g. pings or query requests, will remain uncompressed. This is consistent with `lz4` and `zstd` options.

If using the `OpenDB` method to establish a connection, a Compression configuration can be passed. This includes the ability to specify the compression level (see below). If connecting via `sql.Open` with DSN, utilize the parameter `compress`. This can either be a specific compression algorithm i.e. `gzip`, `deflate`, `br`, `zstd` or `lz4` or a boolean flag. If set to true, `lz4` will be used. The default is `none` i.e. compression disabled.

```go
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Compression: &clickhouse.Compression{
        Method: clickhouse.CompressionBrotli,
        Level:  5,
    },
    Protocol: clickhouse.HTTP,
})
```
[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)

```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

The level of applied compression can be controlled by the DSN parameter compress_level or the Level field of the Compression option. This defaults to 0 but is algorithm specific:

* `gzip` - `-2` (Best Speed) to `9` (Best Compression)
* `deflate` - `-2` (Best Speed) to `9` (Best Compression)
* `br` - `0` (Best Speed) to `11` (Best Compression)
* `zstd`, `lz4` - ignored

## Data types {#data-types}

### Type conversions {#type-conversions}

The client aims to be as flexible as possible concerning accepting variable types for both insertion and marshaling of responses. In most cases, an equivalent Golang type exists for a ClickHouse column type, e.g., [UInt64](/sql-reference/data-types/int-uint/) to [uint64](https://pkg.go.dev/builtin#uint64). These logical mappings should always be supported. You may wish to utilize variable types that can be inserted into columns or used to receive a response if the conversion of either the variable or received data takes place first. The client aims to support these conversions transparently, so users don't need to convert their data to align precisely before insertion and to provide flexible marshaling at query time. This transparent conversion doesn't allow for precision loss. For example, a uint32 can't be used to receive data from a UInt64 column. Conversely, a string can be inserted into a datetime64 field provided it meets the format requirements.

The type conversions currently supported for primitive types are captured [here](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md).

This effort is ongoing and can be separated into insertion (`Append`/`AppendRow`) and read time (via a `Scan`). Should you need support for a specific conversion, please raise an issue.

The standard `database/sql` interface should support the same types as the ClickHouse API. There are a few exceptions, primarily for complex types, that are documented in the sections below. Similar to the ClickHouse API, the client aims to be as flexible as possible concerning accepting variable types for both insertion and marshaling of responses.

### Complex types {#complex-types}

#### Date/DateTime {#datedatetime}

The ClickHouse go client supports the `Date`, `Date32`, `DateTime`, and `DateTime64` date/datetime types. Dates can be inserted as a string in the format `2006-01-02` or using the native go `time.Time{}` or `sql.NullTime`. DateTimes also support the latter types but require strings to be passed in the format `2006-01-02 15:04:05` with an optional timezone offset e.g. `2006-01-02 15:04:05 +08:00`. `time.Time{}` and `sql.NullTime` are both supported at read time as well as any implementation of of the `sql.Scanner` interface.

Handling of timezone information depends on the ClickHouse type and whether the value is being inserted or read:

* **DateTime/DateTime64**
  * At **insert** time the value is sent to ClickHouse in UNIX timestamp format. If no time zone is provided, the client will assume the client's local time zone. `time.Time{}` or `sql.NullTime` will be converted to epoch accordingly.
  * At **select** time the timezone of the column will be used if set when returning a `time.Time` value. If not, the timezone of the server will be used.
* **Date/Date32**
  * At **insert** time, the timezone of any date is considered when converting the date to a unix timestamp, i.e., it will be offset by the timezone prior to storage as a date, as Date types have no locale in ClickHouse. If this isn't specified in a string value, the local timezone will be used.
  * At **select** time, dates are scanned into `time.Time{}` or `sql.NullTime{}` instances will be returned without timezone information.

#### Time/Time64 types {#timetime64-types}

The `Time` and `Time64` column types store time-of-day values without a date component. Both are mapped to Go's `time.Duration`.

* `Time` stores the time with second precision.
* `Time64(precision)` supports sub-second precision (like `DateTime64`), where precision is 0–9.

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
        col1 Time,
        col2 Time64(3)
    ) Engine Memory
`); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    14*time.Hour+30*time.Minute+15*time.Second,
    14*time.Hour+30*time.Minute+15*time.Second+500*time.Millisecond,
); err != nil {
    return err
}
if err = batch.Send(); err != nil {
    return err
}

var col1, col2 time.Duration
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v\n", col1, col2)
```

#### Array {#array}

Arrays should be inserted as slices. Typing rules for the elements are consistent with those for the [primitive type](#type-conversions), i.e., where possible elements will be converted.

A pointer to a slice should be provided at Scan time.

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i int64
for i = 0; i < 10; i++ {
    err := batch.Append(
        []string{strconv.Itoa(int(i)), strconv.Itoa(int(i + 1)), strconv.Itoa(int(i + 2)), strconv.Itoa(int(i + 3))},
        [][]int64{{i, i + 1}, {i + 2, i + 3}, {i + 4, i + 5}},
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
var (
    col1 []string
    col2 [][]int64
)
rows, err := conn.Query(ctx, "SELECT * FROM example")
if err != nil {
    return err
}
for rows.Next() {
    if err := rows.Scan(&col1, &col2); err != nil {
        return err
    }
    fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}

// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

rows.Close()
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)

#### Map {#map}

Maps should be inserted as Golang maps with keys and values conforming to the type rules defined [earlier](#type-conversions).

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i int64
for i = 0; i < 10; i++ {
    err := batch.Append(
        map[string]uint64{strconv.Itoa(int(i)): uint64(i)},
        map[string][]string{strconv.Itoa(int(i)): {strconv.Itoa(int(i)), strconv.Itoa(int(i + 1)), strconv.Itoa(int(i + 2)), strconv.Itoa(int(i + 3))}},
        map[string]map[string]uint64{strconv.Itoa(int(i)): {strconv.Itoa(int(i)): uint64(i)}},
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
var (
    col1 map[string]uint64
    col2 map[string][]string
    col3 map[string]map[string]uint64
)
rows, err := conn.Query(ctx, "SELECT * FROM example")
if err != nil {
    return err
}
for rows.Next() {
    if err := rows.Scan(&col1, &col2, &col3); err != nil {
        return err
    }
    fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

rows.Close()
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)

:::note
When using the database/sql API, Map values require strict typing - you cannot use `interface{}` as the value type. For example, you cannot pass a `map[string]interface{}` for a `Map(String,String)` field and must use a `map[string]string` instead. An `interface{}` variable will always be compatible and can be used for more complex structures.

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)
:::

#### Tuples {#tuples}

Tuples represent a group of Columns of arbitrary length. The columns can either be explicitly named or only specify a type e.g.

```sql
//unnamed
Col1 Tuple(String, Int64)

//named
Col2 Tuple(name String, id Int64, age uint8)
```

Of these approaches, named tuples offer greater flexibility. While unnamed tuples must be inserted and read using slices, named tuples are also compatible with maps.

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 Tuple(name String, age UInt8),
            Col2 Tuple(String, UInt8),
            Col3 Tuple(name String, id String)
        )
        Engine Memory
    `); err != nil {
    return err
}

defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

// both named and unnamed can be added with slices. Note we can use strongly typed lists and maps if all elements are the same type
if err = batch.Append([]interface{}{"Clicky McClickHouse", uint8(42)}, []interface{}{"Clicky McClickHouse Snr", uint8(78)}, []string{"Dale", "521211"}); err != nil {
    return err
}
if err = batch.Append(map[string]interface{}{"name": "Clicky McClickHouse Jnr", "age": uint8(20)}, []interface{}{"Baby Clicky McClickHouse", uint8(1)}, map[string]string{"name": "Geoff", "id": "12123"}); err != nil {
    return err
}
if err = batch.Send(); err != nil {
    return err
}
var (
    col1 map[string]interface{}
    col2 []interface{}
    col3 map[string]string
)
// named tuples can be retrieved into a map or slices, unnamed just slices
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

Note: typed slices and maps are supported, provide the sub-columns in the named tuple are all of the same types.

#### Nested {#nested}

A Nested field is equivalent to an Array of named Tuples. Usage depends on whether the user has set [flatten_nested](/operations/settings/settings#flatten_nested) to 1 or 0.

By setting flatten_nested to 0, Nested columns stay as a single array of tuples. This allows you to use slices of maps for insertion and retrieval and arbitrary levels of nesting. The map's key must equal the column's name, as shown in the example below.

Note: since the maps represent a tuple, they must be of the type `map[string]interface{}`. The values are currently not strongly typed.

```go
conn, err := GetNativeConnection(clickhouse.Settings{
    "flatten_nested": 0,
}, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(context.Background(), "DROP TABLE IF EXISTS example")
err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Nested(Col1_1 String, Col1_2 UInt8),
        Col2 Nested(
            Col2_1 UInt8,
            Col2_2 Nested(
                Col2_2_1 UInt8,
                Col2_2_2 UInt8
            )
        )
    ) Engine Memory
`)
if err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i int64
for i = 0; i < 10; i++ {
    err := batch.Append(
        []map[string]interface{}{
            {
                "Col1_1": strconv.Itoa(int(i)),
                "Col1_2": uint8(i),
            },
            {
                "Col1_1": strconv.Itoa(int(i + 1)),
                "Col1_2": uint8(i + 1),
            },
            {
                "Col1_1": strconv.Itoa(int(i + 2)),
                "Col1_2": uint8(i + 2),
            },
        },
        []map[string]interface{}{
            {
                "Col2_2": []map[string]interface{}{
                    {
                        "Col2_2_1": uint8(i),
                        "Col2_2_2": uint8(i + 1),
                    },
                },
                "Col2_1": uint8(i),
            },
            {
                "Col2_2": []map[string]interface{}{
                    {
                        "Col2_2_1": uint8(i + 2),
                        "Col2_2_2": uint8(i + 3),
                    },
                },
                "Col2_1": uint8(i + 1),
            },
        },
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
var (
    col1 []map[string]interface{}
    col2 []map[string]interface{}
)
rows, err := conn.Query(ctx, "SELECT * FROM example")
if err != nil {
    return err
}
for rows.Next() {
    if err := rows.Scan(&col1, &col2); err != nil {
        return err
    }
    fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

rows.Close()
```

[Full Example - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

If the default value of 1 is used for `flatten_nested`, nested columns are flattened to separate arrays. This requires using nested slices for insertion and retrieval. While arbitrary levels of nesting may work, this isn't officially supported.

```go
conn, err := GetNativeConnection(nil, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(ctx, "DROP TABLE IF EXISTS example")
err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Nested(Col1_1 String, Col1_2 UInt8),
        Col2 Nested(
            Col2_1 UInt8,
            Col2_2 Nested(
                Col2_2_1 UInt8,
                Col2_2_2 UInt8
            )
        )
    ) Engine Memory
`)
if err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i uint8
for i = 0; i < 10; i++ {
    col1_1_data := []string{strconv.Itoa(int(i)), strconv.Itoa(int(i + 1)), strconv.Itoa(int(i + 2))}
    col1_2_data := []uint8{i, i + 1, i + 2}
    col2_1_data := []uint8{i, i + 1, i + 2}
    col2_2_data := [][][]interface{}{
        {
            {i, i + 1},
        },
        {
            {i + 2, i + 3},
        },
        {
            {i + 4, i + 5},
        },
    }
    err := batch.Append(
        col1_1_data,
        col1_2_data,
        col2_1_data,
        col2_2_data,
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
```

[Full Example - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

Note: Nested columns must have the same dimensions. For example, in the above example, `Col_2_2` and `Col_2_1` must have the same number of elements.

Due to a more straightforward interface and official support for nesting, we recommend `flatten_nested=0`.

#### Geo types {#geo-types}

The client supports the geo types Point, Ring, LineString, Polygon, MultiPolygon, and MultiLineString. These types are represented in Go using the [github.com/paulmach/orb](https://github.com/paulmach/orb) package.

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            point Point,
            ring Ring,
            lineString LineString,
            polygon Polygon,
            mPolygon MultiPolygon,
            mLineString MultiLineString
        )
        Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    orb.Point{11, 22},
    orb.Ring{
        orb.Point{1, 2},
        orb.Point{1, 2},
    },
    orb.LineString{
        orb.Point{1, 2},
        orb.Point{3, 4},
        orb.Point{5, 6},
    },
    orb.Polygon{
        orb.Ring{
            orb.Point{1, 2},
            orb.Point{12, 2},
        },
        orb.Ring{
            orb.Point{11, 2},
            orb.Point{1, 12},
        },
    },
    orb.MultiPolygon{
        orb.Polygon{
            orb.Ring{
                orb.Point{1, 2},
                orb.Point{12, 2},
            },
            orb.Ring{
                orb.Point{11, 2},
                orb.Point{1, 12},
            },
        },
        orb.Polygon{
            orb.Ring{
                orb.Point{1, 2},
                orb.Point{12, 2},
            },
            orb.Ring{
                orb.Point{11, 2},
                orb.Point{1, 12},
            },
        },
    },
    orb.MultiLineString{
        orb.LineString{
            orb.Point{1, 2},
            orb.Point{3, 4},
        },
        orb.LineString{
            orb.Point{5, 6},
            orb.Point{7, 8},
        },
    },
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    point       orb.Point
    ring        orb.Ring
    lineString  orb.LineString
    polygon     orb.Polygon
    mPolygon    orb.MultiPolygon
    mLineString orb.MultiLineString
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&point, &ring, &lineString, &polygon, &mPolygon, &mLineString); err != nil {
    return err
}
fmt.Printf("point=%v, ring=%v, lineString=%v, polygon=%v, mPolygon=%v, mLineString=%v\n", point, ring, lineString, polygon, mPolygon, mLineString)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)

#### UUID {#uuid}

The UUID type is supported by the [github.com/google/uuid](https://github.com/google/uuid) package. You can also send and marshal a UUID as a string or any type which implements `sql.Scanner` or `Stringify`.

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            col1 UUID,
            col2 UUID
        )
        Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

col1Data, _ := uuid.NewUUID()
if err = batch.Append(
    col1Data,
    "603966d6-ed93-11ec-8ea0-0242ac120002",
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 uuid.UUID
    col2 uuid.UUID
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2); err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/uuid.go)

#### Decimal {#decimal}

Due to Go's lack of a built-in Decimal type, we recommend using the third-party package [github.com/shopspring/decimal](https://github.com/shopspring/decimal) to work with Decimal types natively without modifying your original queries.

:::note
You may be tempted to use Float instead to avoid third-party dependencies. However, be aware that [Float types in ClickHouse aren't recommended when accurate values are required](https://clickhouse.com/docs/sql-reference/data-types/float).

If you still choose to use Go's built-in Float type on the client side, you must explicitly convert Decimal to Float using the [toFloat64() function](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64) or [its variants](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64OrZero) in your ClickHouse queries. Be aware that this conversion may result in loss of precision.
:::

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Decimal32(3),
        Col2 Decimal(18,6),
        Col3 Decimal(15,7),
        Col4 Decimal128(8),
        Col5 Decimal256(9)
    ) Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    decimal.New(25, 4),
    decimal.New(30, 5),
    decimal.New(35, 6),
    decimal.New(135, 7),
    decimal.New(256, 8),
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 decimal.Decimal
    col2 decimal.Decimal
    col3 decimal.Decimal
    col4 decimal.Decimal
    col5 decimal.Decimal
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4, &col5); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v\n", col1, col2, col3, col4, col5)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)

#### Nullable {#nullable}

The go value of Nil represents a ClickHouse NULL. This can be used if a field is declared Nullable. At insert time, Nil can be passed for both the normal and Nullable version of a column. For the former, the default value for the type will be persisted, e.g., an empty string for string. For the nullable version, a NULL value will be stored in ClickHouse.

At scan time, the user must pass a pointer to a type that supports nil, e.g., *string, in order to represent the nil value for a Nullable field. In the example below, col1, which is a Nullable(String), thus receives a **string. This allows nil to be represented.

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            col1 Nullable(String),
            col2 String,
            col3 Nullable(Int8),
            col4 Nullable(Int64)
        )
        Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    nil,
    nil,
    nil,
    sql.NullInt64{Int64: 0, Valid: false},
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 *string
    col2 string
    col3 *int8
    col4 sql.NullInt64
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4); err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

The client additionally supports the `sql.Null*` types e.g. `sql.NullInt64`. These are compatible with their equivalent ClickHouse types.

#### Big Ints {#big-ints}

Number types larger than 64 bits are represented using the native go [big](https://pkg.go.dev/math/big) package.

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Int128,
        Col2 UInt128,
        Col3 Array(Int128),
        Col4 Int256,
        Col5 Array(Int256),
        Col6 UInt256,
        Col7 Array(UInt256)
    ) Engine Memory`); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

col1Data, _ := new(big.Int).SetString("170141183460469231731687303715884105727", 10)
col2Data := big.NewInt(128)
col3Data := []*big.Int{
    big.NewInt(-128),
    big.NewInt(128128),
    big.NewInt(128128128),
}
col4Data := big.NewInt(256)
col5Data := []*big.Int{
    big.NewInt(256),
    big.NewInt(256256),
    big.NewInt(256256256256),
}
col6Data := big.NewInt(256)
col7Data := []*big.Int{
    big.NewInt(256),
    big.NewInt(256256),
    big.NewInt(256256256256),
}

if err = batch.Append(col1Data, col2Data, col3Data, col4Data, col5Data, col6Data, col7Data); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 big.Int
    col2 big.Int
    col3 []*big.Int
    col4 big.Int
    col5 []*big.Int
    col6 big.Int
    col7 []*big.Int
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v, col6=%v, col7=%v\n", col1, col2, col3, col4, col5, col6, col7)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)

#### BFloat16 {#bfloat16}

`BFloat16` is a 16-bit brain float type used in machine learning workloads. In Go, `BFloat16` values are inserted and scanned as `float32`. Nullable variants use `sql.NullFloat64`.

```go
if err := conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 BFloat16,
        Col2 Nullable(BFloat16)
    ) Engine MergeTree() ORDER BY tuple()
`); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
batch.Append(float32(33.125), sql.NullFloat64{Float64: 34.25, Valid: true})
if err := batch.Send(); err != nil {
    return err
}

var col1 float32
var col2 sql.NullFloat64
if err := conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2); err != nil {
    return err
}
fmt.Printf("Col1: %v, Col2: %v\n", col1, col2)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bfloat16.go)

#### QBit {#qbit}

`QBit` is an experimental column type for storing vector embeddings in bit-sliced format, optimized for vector similarity search. It requires the `allow_experimental_qbit_type` setting to be enabled.

In Go, a `QBit(Float32, N)` column is inserted and scanned as `[]float32` where N is the vector dimension.

```go
ctx = clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_qbit_type": 1,
}))

if err := conn.Exec(ctx, `
    CREATE TABLE example (
        id   UInt32,
        embedding QBit(Float32, 128)
    ) Engine MergeTree() ORDER BY id
`); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}

vector := make([]float32, 128)
// populate vector values...
if err := batch.Append(uint32(1), vector); err != nil {
    return err
}
if err := batch.Send(); err != nil {
    return err
}

rows, err := conn.Query(ctx, "SELECT id, embedding FROM example")
if err != nil {
    return err
}
defer rows.Close()
for rows.Next() {
    var id uint32
    var embedding []float32
    rows.Scan(&id, &embedding)
    fmt.Printf("ID: %d, Vector dim: %d\n", id, len(embedding))
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/qbit.go)

## Best practices {#best-practices}

* Utilize the ClickHouse API where possible, especially for primitive types. This avoids significant reflection and indirection.
* If reading large datasets, consider modifying the [`BlockBufferSize`](#connection-settings). This will increase the memory footprint but will mean more blocks can be decoded in parallel during row iteration. The default value of 2 is conservative and minimizes memory overhead. Higher values will mean more blocks in memory. This requires testing since different queries can produce different block sizes. It can therefore be set on a [query level](#using-context) via the Context.
* Be specific with your types when inserting data. While the client aims to be flexible, e.g., allowing strings to be parsed for UUIDs or IPs, this requires data validation and incurs a cost at insert time.
* Use column-oriented inserts where possible. Again these should be strongly typed, avoiding the need for the client to convert your values.
* Follow ClickHouse [recommendations](/sql-reference/statements/insert-into/#performance-considerations) for optimal insert performance.
