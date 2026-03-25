---
sidebar_label: '配置'
sidebar_position: 2
keywords: ['clickhouse', 'go', 'golang', '配置', '连接', 'tls', '身份验证']
description: '配置 clickhouse-go 客户端：连接设置、TLS、身份验证、连接池、日志记录和压缩。'
slug: /integrations/language-clients/go/configuration
title: '配置'
doc_type: 'reference'
---

# 配置 \{#configuration\}

## 连接设置 \{#connection-settings\}

打开连接时，可使用 `Options` 结构体控制客户端行为。可用设置如下：

| Parameter              | Type                                               | Default            | Description                                                                                                            |
| ---------------------- | -------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `Protocol`             | `Protocol`                                         | `Native`           | 传输协议：`Native` (TCP) 或 `HTTP`。参阅 [TCP vs HTTP](#tcp-vs-http)。                                                           |
| `Addr`                 | `[]string`                                         | —                  | `host:port` 地址切片。有关连接多个节点，请参阅 [连接到多个节点](#connecting-to-multiple-nodes)。                           |
| `Auth`                 | `Auth`                                             | —                  | 身份验证凭据 (`Database`、`Username`、`Password`) 。参阅 [身份验证](#authentication)。                                       |
| `TLS`                  | `*tls.Config`                                      | `nil`              | TLS 配置。非 `nil` 值将启用 TLS。参阅 [TLS](#using-tls)。                                                                          |
| `DialContext`          | `func(ctx, addr) (net.Conn, error)`                | —                  | 自定义拨号函数，用于控制 TCP 连接的建立方式。                                                                                              |
| `DialTimeout`          | `time.Duration`                                    | `30s`              | 打开新连接时的最大等待时间。                                                                                                         |
| `MaxOpenConns`         | `int`                                              | `MaxIdleConns + 5` | 任意时刻可打开的最大连接数。                                                                                                         |
| `MaxIdleConns`         | `int`                                              | `5`                | 连接池中保留的空闲连接数。                                                                                                          |
| `ConnMaxLifetime`      | `time.Duration`                                    | `1h`               | 连接池中连接的最大生存时间。参阅 [连接池](#connection-pooling)。                                                            |
| `ConnOpenStrategy`     | `ConnOpenStrategy`                                 | `ConnOpenInOrder`  | 从 `Addr` 中选择节点的策略。参阅 [连接到多个节点](#connecting-to-multiple-nodes)。                                    |
| `BlockBufferSize`      | `uint8`                                            | `2`                | 并行解码的数据块数量。值越大，吞吐量越高，但内存开销也越大。可通过 context 按查询覆盖。                                                                       |
| `Settings`             | `Settings`                                         | —                  | 应用于每个查询的 ClickHouse settings map。单个查询可通过 [context](/integrations/language-clients/go/clickhouse-api#using-context) 覆盖。 |
| `Compression`          | `*Compression`                                     | `nil`              | 数据块级压缩。参阅 [压缩](#compression)。                                                                                 |
| `ReadTimeout`          | `time.Duration`                                    | —                  | 单次调用中，从服务器读取数据时的最大等待时间。                                                                                                |
| `FreeBufOnConnRelease` | `bool`                                             | `false`            | 如果为 true，则每次查询时都会将连接的内存缓冲区释放回池中。可减少内存占用，但会带来少量 CPU 开销。                                                                 |
| `Logger`               | `*slog.Logger`                                     | `nil`              | 结构化日志记录器 (Go `log/slog`) 。参阅 [日志配置](#logging)。                                                                      |
| `Debug`                | `bool`                                             | `false`            | **已弃用。** 请改用 `Logger`。启用输出到 stdout 的旧式调试信息。                                                                            |
| `Debugf`               | `func(string, ...any)`                             | —                  | **已弃用。** 请改用 `Logger`。自定义调试日志函数。需设置 `Debug: true`。                                                                     |
| `GetJWT`               | `GetJWTFunc`                                       | —                  | 返回用于 ClickHouse Cloud 身份验证的 JWT token 的回调函数 (仅 HTTPS) 。                                                                |
| `HttpHeaders`          | `map[string]string`                                | —                  | 每个请求都会发送的附加 HTTP 头 (仅 HTTP 传输) 。                                                                                       |
| `HttpUrlPath`          | `string`                                           | —                  | 追加到 HTTP 请求的额外 URL 路径 (仅 HTTP 传输) 。                                                                                    |
| `HttpMaxConnsPerHost`  | `int`                                              | —                  | 覆盖底层 `http.Transport` 中的 `MaxConnsPerHost` (仅 HTTP 传输) 。                                                               |
| `TransportFunc`        | `func(*http.Transport) (http.RoundTripper, error)` | —                  | 自定义 HTTP 传输工厂。会传入默认传输对象，以便按需覆盖 (仅 HTTP 传输) 。                                                                           |
| `HTTPProxyURL`         | `*url.URL`                                         | —                  | 用于所有请求的 HTTP 代理 URL (仅 HTTP 传输) 。                                                                                      |

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect_settings.go)

## TLS \{#using-tls\}

在底层，所有客户端连接方法 (`DSN/OpenDB/Open`) 都会使用 [Go tls package](https://pkg.go.dev/crypto/tls) 建立安全连接。如果 `Options` 结构体中包含一个非 nil 的 `tls.Config` 指针，客户端就会使用 TLS。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl.go)

这个最小化的 `TLS.Config` 通常足以连接到 ClickHouse 服务器的安全原生端口 (通常为 9440) 。如果 ClickHouse 服务器没有有效证书 (证书已过期、主机名不匹配，或并非由公开认可的根证书颁发机构签发) ，可以将 `InsecureSkipVerify` 设为 true，但强烈不建议这样做。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl_no_verify.go)

如果需要额外的 TLS 参数，应在应用代码中的 `tls.Config` 结构体里设置相应字段。这些参数可能包括：指定特定的密码套件、强制使用某个 TLS 版本 (如 1.2 或 1.3) 、添加内部 CA 证书链，以及在 ClickHouse 服务器要求时添加客户端证书 (及其私钥) ，以及其他更专业的安全配置所需的选项。

## 身份验证 \{#authentication\}

在连接信息中指定 Auth 结构体，以设置用户名和密码。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)

## 连接到多个节点 \{#connecting-to-multiple-nodes\}

可通过 `Addr` 结构体指定多个地址。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)

提供三种连接策略：

* `ConnOpenInOrder` (默认) - 按顺序依次使用各个地址。只有当前面地址连接失败时，才会使用后面的地址。本质上，这是一种故障转移策略。
* `ConnOpenRoundRobin` - 采用轮询策略在各个地址之间均衡分配负载。
* `ConnOpenRandom` - 从地址列表中随机选择一个节点。

可通过选项 `ConnOpenStrategy` 控制该行为

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L50-L67)

## 连接池 \{#connection-pooling\}

客户端会维护一个连接池，并在需要时跨多个查询复用连接。在任意时刻，最多会使用 `MaxOpenConns` 个连接，而连接池的最大空闲连接数由 `MaxIdleConns` 控制。客户端会在每次执行查询时从池中获取一个连接，并在使用后将其返回池中以供复用。一个连接会在整个批次的生命周期内持续使用，并在 `Send()` 时释放。

除非用户设置 `MaxOpenConns=1`，否则无法保证后续查询会使用池中的同一个连接。这种需求很少见，但在使用临时表时可能是必需的。

另外，请注意，`ConnMaxLifetime` 的默认值为 1 小时。如果有节点离开集群，这可能会导致 ClickHouse 的负载变得不均衡。当某个节点不可用时，连接会被重新分配到其他节点。即使出现问题的节点重新加入集群，这些连接默认仍会持续保留，并且 1 小时内不会刷新。在高负载场景下，建议适当调低该值。

连接池对 Native (TCP) 和 HTTP 协议均启用。

## 日志配置 \{#logging\}

客户端可通过 `Options` 中的 `Logger` 字段，使用 Go 标准库的 `log/slog` 包进行结构化日志记录。较早的 `Debug` 和 `Debugf` 字段已弃用，但出于向后兼容考虑仍然可用 (优先级：`Debugf` &gt; `Logger` &gt; 不执行任何操作) 。

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

你还可以为日志记录器添加应用级上下文：

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/logger_test.go)

## 压缩 \{#compression\}

支持哪些压缩方法取决于所使用的底层协议。对于原生协议，客户端支持 `LZ4` 和 `ZSTD` 压缩，且仅在数据块级别执行压缩。可通过在创建连接时加入 `Compression` 配置来启用压缩。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

使用 HTTP 传输时，还支持其他压缩方式：`gzip`、`deflate` 和 `br`。有关详情，请参阅 [Database/SQL API - Compression](/integrations/language-clients/go/database-sql-api#compression)。

## TCP 与 HTTP \{#tcp-vs-http\}

传输方式只需切换一个配置项——本指南中的其余内容对两者都适用。差异如下：

|                                | TCP (原生协议)             | HTTP                                              |
| :----------------------------- | :--------------------- | :------------------------------------------------ |
| **默认端口**                       | 9000 (明文) ，9440 (TLS)  | 8123 (明文) ，8443 (TLS)                             |
| **启用**                         | 默认——省略 `Protocol`      | `Protocol: clickhouse.HTTP` 或使用 `http://` DSN     |
| **压缩**                         | `lz4`、`zstd`           | `lz4`、`zstd`、`gzip`、`deflate`、`br`                |
| **会话**                         | 内置 (始终活跃)              | 显式——将 `session_id` 作为设置项传入                        |
| **HTTP 头**                     | —                      | `HttpHeaders`、`HttpUrlPath`、`HttpMaxConnsPerHost` |
| **自定义传输**                      | —                      | `TransportFunc`                                   |
| **JWT 身份验证**                   | —                      | `GetJWT` (ClickHouse Cloud HTTPS)                 |
| **OpenTelemetry (`WithSpan`)** | ✅                      | 服务端支持；客户端尚未发送 `traceparent` 头                     |

要将任一 API 切换为 HTTP：

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
