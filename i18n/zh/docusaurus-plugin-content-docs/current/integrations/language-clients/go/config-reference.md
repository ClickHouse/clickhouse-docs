---
sidebar_label: '配置参考'
sidebar_position: 3
keywords: ['clickhouse', 'go', 'golang', 'configuration', 'options', 'reference', 'DSN', 'connection pool', 'TLS', 'compression', 'timeout']
description: 'clickhouse-go 客户端的完整逐项配置参考，涵盖连接级别、上下文级别和批处理选项。'
slug: /integrations/language-clients/go/config-reference
title: 'Go 客户端配置参考'
doc_type: '参考'
---

本页介绍 `clickhouse-go` v2.x 中的所有可配置选项。有关包含代码示例的指南，请参见[配置](/integrations/language-clients/go/configuration)。

:::note[版本标注]
在 `clickhouse-go` v2.35.0 或更高版本中新增的选项，会在其说明旁标注 *(自 vX.Y.Z 起)*。没有“Since”标记的选项自 v2.0 起即已可用，并在所有受支持的版本中提供。
:::

## 如何设置选项 \{#how-options-are-set\}

选项可在三个作用域中设置：

| 作用域     | 设置方式                                   | 生效范围      |
| ------- | -------------------------------------- | --------- |
| **连接**  | `clickhouse.Options` 结构体或 DSN 字符串      | 该连接上的所有查询 |
| **查询**  | 带 `WithXxx` 函数的 `clickhouse.Context()` | 单次查询执行    |
| **批次** | `PrepareBatch()` 选项函数                  | 单次批次操作   |

当作用域重叠时，粒度更细的作用域优先：**批次 &gt; 查询 &gt; 连接**。对于 `Settings`，查询级别的键会与连接级别的键合并；如果发生冲突，则以查询级别为准。

**通过 Options 结构体：**

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr:        []string{"localhost:9000"},
    Auth:        clickhouse.Auth{Database: "default", Username: "default", Password: ""},
    DialTimeout: 10 * time.Second,
    Compression: &clickhouse.Compression{Method: clickhouse.CompressionLZ4},
})
```

**使用 DSN 字符串：**

```go
db, err := sql.Open("clickhouse", "clickhouse://user:pass@localhost:9000/default?dial_timeout=10s&compress=lz4")
```

**通过连接器 (`database/sql` 搭配 `Options` 结构体) ：**

```go
db := sql.OpenDB(clickhouse.Connector(&clickhouse.Options{
    Addr:        []string{"localhost:9000"},
    Auth:        clickhouse.Auth{Database: "default", Username: "default"},
    DialTimeout: 10 * time.Second,
}))
// Set database/sql-only pool settings after creation
db.SetConnMaxIdleTime(5 * time.Minute)
```

**通过上下文 (每次查询) ：**

```go
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithQueryID("my-query-123"),
    clickhouse.WithSettings(clickhouse.Settings{"max_execution_time": 60}),
)
rows, err := conn.Query(ctx, "SELECT ...")
```

***

## 连接选项 \{#connection-options\}

### 协议和连接 \{#protocol-and-connection\}

| 选项                 | 类型                         | 默认值                                                       | DSN 参数                                                           | 说明                                                                           | 最佳实践                                                                                                                                                                     | 配置错误时                                                                          |
| ------------------ | -------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `Protocol`         | `Protocol` (int)           | `Native`                                                  | 协议：`clickhouse://`=Native，`http://`=HTTP                         | 通信协议：`Native` (0) 用于 TCP，`HTTP` (1) 用于 HTTP                                  | 使用 Native 可获得约 30% 的性能提升。若需要代理支持、穿越防火墙 (端口 80/443) ，或使用仅限 HTTP 的压缩 (`gzip`/`br`) ，请使用 HTTP。参见 [TCP 与 HTTP](/integrations/language-clients/go/configuration#tcp-vs-http)。 | 使用 HTTP 协议却连接 Native 端口 (9000)：connection refused。Native 被防火墙拦截：超时。            |
| `Addr`             | `[]string`                 | `["localhost:9000"]` (Native) `["localhost:8123"]` (HTTP) | URL 中以逗号分隔的主机                                                    | 用于连接和故障转移的 `"host:port"` 地址列表                                                | 在生产环境中指定多个地址以实现高可用。正确端口：9000 (Native)、8123 (HTTP)、9440 (Native+TLS)、8443 (HTTP+TLS)。                                                                                     | 单个地址：无法故障转移。端口错误：`"connection refused"`。空值/nil：默认回退到 localhost，在分布式部署中会失败。     |
| `ConnOpenStrategy` | `ConnOpenStrategy` (uint8) | `ConnOpenInOrder` (0)                                     | `connection_open_strategy` (`in_order`, `round_robin`, `random`) | 从 `Addr` 中选择服务器的策略。`InOrder` (0)=故障转移，`RoundRobin` (1)=负载均衡，`Random` (2)=随机。 | `InOrder` 适用于主备。`RoundRobin` 适用于双活/K8s。`Random` 可避免惊群。                                                                                                                   | 在双活场景中使用 `InOrder`：第一台服务器会承载全部流量，其余服务器处于空闲状态。所有策略在失败时都会尝试所有服务器——只会影响*首先*尝试哪一台。 |

***

### 身份验证 \{#authentication\}

| Option          | Type                        | Default               | DSN param                          | Description                                                                      | Best practice                             | When misconfigured                                                                    |
| --------------- | --------------------------- | --------------------- | ---------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| `Auth.Username` | `string`                    | `"default"`           | `username` or URL user portion     | 用于 ClickHouse 身份验证的用户名                                                           | 切勿在生产环境中使用 `default`。请创建权限最小化的专用用户。       | 用户名错误：`"Code: 516. DB::Exception: Authentication failed"`。空字符串：会静默地使用 `"default"`。    |
| `Auth.Password` | `string`                    | `""`                  | `password` or URL password portion | 用于 ClickHouse 身份验证的密码                                                            | 在生产环境中使用环境变量或密钥管理器。在 DSN 中对特殊字符进行 URL 编码。 | 密码错误：`"Code: 516. DB::Exception: Authentication failed"`。特殊字符未进行 URL 编码：会导致解析错误。      |
| `Auth.Database` | `string`                    | `""` (server default) | `database` or URL path (`/mydb`)   | connection 的默认数据库                                                                | 始终显式指定。生产环境中每个应用都应使用专用数据库。                | 数据库不存在：`"Code: 81. DB::Exception: Database xyz doesn't exist"`。在多租户环境中留空：查询会落到错误的数据库。 |
| `GetJWT`        | `func(ctx) (string, error)` | `nil`                 | (programmatic only)                | 返回用于 ClickHouse Cloud 身份验证的 JWT 的回调。可通过 `WithJWT(token)` 为单个查询覆盖。*(自 v2.35.0 起)* | 实现令牌缓存/refresh——每次 connection/请求都会调用。     | 令牌过期：会出现身份验证错误。阻塞式回调：会导致超时。JWT 的优先级高于用户名/密码。需要 TLS——否则会静默回退到用户名/密码。                   |

```go
GetJWT: func(ctx context.Context) (string, error) {
    return getTokenFromVault(ctx)
}
```

***

### 超时 \{#timeouts\}

| 选项            | 类型              | 默认值         | DSN 参数         | 描述                                                     | 最佳实践                                            | 配置不当时                                                                                 |
| ------------- | --------------- | ----------- | -------------- | ------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| `DialTimeout` | `time.Duration` | `30s`       | `dial_timeout` | 建立新连接的最长等待时间。达到 `MaxOpenConns` 时，也控制从连接池获取连接的等待时间。     | 在 LAN 上设为 5-10s，在 WAN/Cloud 上设为 15-30s。切勿低于 1s。 | 过短：拥塞期间出现 `"clickhouse: acquire conn timeout"`。过长 (&gt; 60s) ：故障期间应用会卡死。              |
| `ReadTimeout` | `time.Duration` | `5m` (300s) | `read_timeout` | 单次读取调用等待服务器响应的最长时间。按每个块生效，而不是针对整个查询。`Context` 的截止时间优先。 | 短时交互式查询设为 10-30s；长时间分析型查询设为 5-30m。              | 过短：查询过程中出现 `"i/o timeout"` 或 `"read: connection reset by peer"`；服务器会继续执行。过长：无法检测失效连接。 |

***

### 连接池 \{#connection-pool\}

| Option            | Type            | Default                    | DSN param           | API              | Description                                                               | Best practice                                                                                                | When misconfigured                                                                                                             |
| ----------------- | --------------- | -------------------------- | ------------------- | ---------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `MaxIdleConns`    | `int`           | `5`                        | `max_idle_conns`    | 两者               | 池中允许保留的最大空闲 (未使用但仍存活) 连接数                                                 | 建议设为预期并发查询数的 50-80%。低：2-5，中：10-20，高：20-50。                                                                   | 过低：连接频繁创建和销毁，延迟升高。过高：浪费内存。会自动限制为不超过 `MaxOpenConns`。                                                                            |
| `MaxOpenConns`    | `int`           | `MaxIdleConns + 5` (默认：10) | `max_open_conns`    | 两者               | 最大连接总数 (空闲 + 活跃)                                                          | 低：10-20，中：20-50，高：50-100。公式：并发查询数 + 突发量 + 缓冲。监控：`SELECT * FROM system.metrics WHERE metric='TCPConnection'`。 | 过低：`"clickhouse: acquire conn timeout"`。过高：服务端出现 `"Too many connections"`，超出 FD 限制。ClickHouse 默认 `max_connections`：1024 (共享) 。 |
| `ConnMaxLifetime` | `time.Duration` | `1h`                       | `conn_max_lifetime` | 两者               | 连接可复用的最长时长。连接归还到池中时会检查。                                                   | 稳定环境建议设为 1-5h。K8s/滚动部署建议设为 5-15m。切勿设为无限。                                                                     | 过短 (&lt; 1m) ：连接频繁创建和销毁，延迟升高。过长/无限：连接陈旧、无法感知 DNS 变更、流量始终不会重新均衡。                                                                |
| `ConnMaxIdleTime` | `time.Duration` | `0` (无)                    | —                   | 仅 `database/sql` | 连接在关闭前可保持*空闲*状态的最长时间。不在 `Options` 结构体中——请通过 `db.SetConnMaxIdleTime()` 设置。 | 对于 K8s/突发型 workload，建议设为 5-10m，以便在流量峰值过后回收空闲连接。                                                              | 未设置：空闲连接会一直保留到 `ConnMaxLifetime`。过短 (&lt; 30s) ：即使是正常间隔也会重新创建连接。                                                               |

:::note 仅 `database/sql`
`ConnMaxIdleTime` 是 Go 标准 `database/sql` 连接池设置。它不在 `clickhouse.Options` 结构体中，也不能通过 `clickhouse.Open()` 使用。请在 `OpenDB()` 之后设置：

```go
db := clickhouse.OpenDB(&clickhouse.Options{...})
db.SetConnMaxIdleTime(5 * time.Minute)
```

:::

有关具体用法，请参见[连接池](/integrations/language-clients/go/configuration#connection-pooling)。

***

### 标准 database/sql 连接池设置 \{#sql-db-settings\}

使用 `clickhouse.OpenDB()` 或 `sql.Open("clickhouse", dsn)` 时，返回的 `*sql.DB` 支持 Go 标准的连接池方法。`OpenDB()` 会自动将 `Options` 中前三项设置应用到连接池：

| Method                     | Options equivalent | Notes            |
| -------------------------- | ------------------ | ---------------- |
| `db.SetMaxIdleConns(n)`    | `MaxIdleConns`     | `OpenDB()` 会自动应用 |
| `db.SetMaxOpenConns(n)`    | `MaxOpenConns`     | `OpenDB()` 会自动应用 |
| `db.SetConnMaxLifetime(d)` | `ConnMaxLifetime`  | `OpenDB()` 会自动应用 |
| `db.SetConnMaxIdleTime(d)` | *无*                | 创建后必须手动设置        |

:::note[ClickHouse API (clickhouse.Open)]
这些方法**不**适用于 `clickhouse.Open()` 返回的连接。ClickHouse API 会直接使用 `Options` 结构体字段，在内部管理自己的连接池。
:::

***

### 压缩 \{#compression\}

| 选项                     | 类型                         | 默认值                  | DSN 参数                                                                     | 描述                                                          | 最佳实践                                                                                               | 配置不当时                                                                              |
| ---------------------- | -------------------------- | -------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Compression.Method`   | `CompressionMethod` (byte) | 无                    | `compress` (`lz4`、`zstd`、`lz4hc`、`gzip`、`deflate`、`br`，或使用 `true` 表示 LZ4)  | 用于数据传输的压缩算法。请参见下方的协议支持矩阵。                                   | 局域网：无或 LZ4。广域网：ZSTD 或 LZ4。CPU 受限：LZ4。追求最高压缩率：ZSTD (Native) 或 Brotli (HTTP) 。对于小于 &lt; 1 MB 的插入可跳过。 | 在 Native 上使用 GZIP/Brotli：握手失败。在 HTTP 上使用 LZ4HC：报错或静默回退。慢速网络上不启用压缩：插入速度会慢 10-100 倍。 |
| `Compression.Level`    | `int`                      | `3`                  | `compress_level`                                                           | 特定于算法的压缩级别。GZIP/Deflate：-2 到 9。Brotli：0 到 11。LZ4/ZSTD：会被忽略。 | GZIP 的平衡设置：3-6。Brotli 的平衡设置：4-6。                                                                   | 级别过高：CPU 开销极大，但收益很小。为 LZ4/ZSTD 设置非零值：会被静默忽略。未启用压缩却设置级别：无效果。                        |
| `MaxCompressionBuffer` | `int` (字节)                 | `10485760` (10 MiB)  | `max_compression_buffer`                                                   | 刷写前允许的最大压缩缓冲区大小。每个连接都有自己的缓冲区。                               | 默认的 10 MiB 已足够。对于宽行可设为 20-50 MiB。总内存 = buffer x `MaxOpenConns`。                                    | 过小 (&lt; 1 MiB) ：频繁刷写，效率低。过大 (&gt; 100 MiB) ：连接较多时会导致 OOM。                         |

**按协议划分的压缩方法支持情况：**

| 方法                   | Native | HTTP |
| -------------------- | ------ | ---- |
| `CompressionLZ4`     | 是      | 是    |
| `CompressionLZ4HC`   | 是      | 否    |
| `CompressionZSTD`    | 是      | 是    |
| `CompressionGZIP`    | 否      | 是    |
| `CompressionDeflate` | 否      | 是    |
| `CompressionBrotli`  | 否      | 是    |

***

### TLS \{#tls\}

| 选项    | 类型            | 默认值         | DSN 参数                            | 描述                                                             | 最佳实践                                                                                            | 配置错误时                                                                                                                                                                                                                                                                      |
| ----- | ------------- | ----------- | --------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TLS` | `*tls.Config` | `nil` (明文)  | `secure=true`, `skip_verify=true` | TLS/SSL 配置。非 `nil` 时启用 TLS。端口：Native 9000/9440，HTTP 8123/8443。 | 在生产环境和 ClickHouse Cloud 中务必启用 (必需) 。生产环境中应设置 `InsecureSkipVerify: false`。通过 `RootCAs` 添加自定义 CA。 | 端口错误：`"connection reset by peer"`。在生产环境中使用 `skip_verify=true`：存在 MITM 攻击风险。证书过期：`"x509: certificate has expired"`。主机名错误：`"x509: certificate is valid for X, not Y"`。CA 不受信任：`"x509: certificate signed by unknown authority"`。HTTP DSN 使用 `secure=true`：请改用 `https://` 方案。 |

代码示例请参见 [TLS](/integrations/language-clients/go/configuration#using-tls)。

***

### 日志 \{#logging\}

| 选项                    | 类型                     | 默认值            | DSN 参数  | 描述                                                                                                    | 最佳实践                                                      | 配置错误时                                  |
| --------------------- | ---------------------- | -------------- | ------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------- |
| `Logger`              | `*slog.Logger`         | `nil` (不记录日志)  | —       | 通过 Go 的 `log/slog` 提供结构化日志记录器。优先级：`Debug`+`Debugf` &gt; `Logger` &gt; 空操作。*&#x20;(自 v2.43.0 起)&#x20;*&#x20;| 在生产环境中使用带 JSON 处理器的 `slog`。使用 `logger.With(...)` 添加应用上下文。 | —                                      |
| `Debug` (deprecated)  | `bool`                 | `false`        | `debug` | 旧版调试开关。请改用 `Logger`。除非设置了 `Debugf`，否则日志会输出到 stdout。                                                   | —                                                         | 在生产环境中启用：会带来性能开销、产生冗长日志，并可能在输出中包含敏感数据。 |
| `Debugf` (deprecated) | `func(string, ...any)` | `nil`          | —       | 自定义调试日志函数。请改用 `Logger`。需将 `Debug` 设为 `true`。                                                          | —                                                         | —                                      |

```go
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
conn, err := clickhouse.Open(&clickhouse.Options{
    Logger: logger,
    // ...
})
```

请参阅[日志](/integrations/language-clients/go/configuration#logging)部分，查看完整示例。

***

### 缓冲区与内存 \{#buffers-and-memory\}

| 选项                     | 类型      | 默认值     | DSN 参数              | 每个查询                       | 说明                        | 最佳实践                                               | 配置不当时                                                                       |
| ---------------------- | ------- | ------- | ------------------- | -------------------------- | ------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| `BlockBufferSize`      | `uint8` | `2`     | `block_buffer_size` | 是 (`WithBlockBufferSize`)  | 读取结果时缓冲的已解码块数量。支持并发读取和解码。 | 默认值 2 即可。对于大型流式结果，可设为 5–10。内存 = 缓冲区 × 块大小 × 并发查询数。 | 过小 (1) ：会阻塞块读取器，增加延迟。过大 (&gt; 50) ：内存占用高，收益递减。                              |
| `FreeBufOnConnRelease` | `bool`  | `false` | —                   | 否                          | 每次查询后释放连接的内存缓冲区，而不是复用。    | 查询速率高时使用 `false`。在内存受限的容器中，或不频繁处理大批次时，使用 `true`。   | `false` + 内存有限：缓冲区会累积 (内存 = 缓冲区 × 空闲连接数) 。`true` + 高速率：会增加 GC 压力并提高 CPU 占用。 |

***

### HTTP 特定选项 \{#http-specific\}

:::warning[在 Native 协议下会被静默忽略]
这些选项仅对 `Protocol: clickhouse.HTTP` 生效。使用 Native 协议时，它们会被静默忽略，不会产生任何错误或警告。
:::

| 选项                    | 类型                                                 | 默认值             | DSN 参数                 | 说明                                                       | 最佳实践                                                    | 配置错误时                                                          |
| --------------------- | -------------------------------------------------- | --------------- | ---------------------- | -------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| `HttpHeaders`         | `map[string]string`                                | `nil`           | —                      | 为每个请求附加额外的 HTTP 请求头                                      | 用于 tracing (`X-Request-ID`) 或认证代理请求头。尽量保持精简。            | 覆盖内部请求头 (`Content-Type`、`Authorization`) ：行为不可预测。              |
| `HttpUrlPath`         | `string`                                           | `""`            | `http_path`            | 追加到请求中的 URL 路径。会自动添加前导 `/`。                              | 在通过带路径路由的反向代理访问时使用。                                     | 路径错误：代理/LB 返回 HTTP 404。                                        |
| `HttpMaxConnsPerHost` | `int`                                              | `0` (无限制)       | —                      | 传输层中每个主机的 TCP 连接数 (`http.Transport.MaxConnsPerHost`) 。   | 对大多数应用保持为 0。仅当服务器有严格的连接数限制时才设置。                         | 设置过低 (例如 `MaxOpenConns`=50 时设为 10) ：传输层成为瓶颈，即使服务器负载较低，查询仍会变慢。  |
| `HTTPProxyURL`        | `*url.URL`                                         | `nil` (使用环境变量)  | `http_proxy` (URL 编码)  | 用于路由请求的 HTTP 代理                                          | 如果需要代理，请显式设置。它会覆盖 `HTTP_PROXY`/`HTTPS_PROXY` 环境变量。      | 地址错误：`"dial tcp: lookup proxy: no such host"`。代理需要认证：HTTP 407。 |
| `TransportFunc`       | `func(*http.Transport) (http.RoundTripper, error)` | `nil`           | —                      | 自定义 HTTP 传输工厂。接收默认传输对象以便进行包装。*&#x20;(自 v2.41.0 起)&#x20;*&#x20;| 用于可观测性中间件。不要覆盖 `Proxy`、`DialContext`、`TLSClientConfig`。 | 返回 `nil`：panic。覆盖客户端字段：TLS/代理会被静默忽略。阻塞 `RoundTripper`：会导致死锁。   |

:::note[双层 HTTP 连接池]
使用 HTTP 时，存在两个连接池：

* **第 1 层 (应用层) ：** `MaxIdleConns` / `MaxOpenConns` -- 控制 `httpConnect` 对象
* **第 2 层 (传输层) ：** `HttpMaxConnsPerHost` -- 控制底层 TCP 连接

Native 协议采用简单的 1:1 映射，并忽略 `HttpMaxConnsPerHost`。
:::

```go
TransportFunc: func(t *http.Transport) (http.RoundTripper, error) {
    return &loggingRoundTripper{transport: t}, nil
}
```

***

### 高级连接 \{#advanced-connection\}

| 选项             | 类型                                                     | 默认值                   | DSN 参数 | 描述                                    | 最佳实践                                            | 配置不当时                                                               |
| -------------- | ------------------------------------------------------ | --------------------- | ------ | ------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------- |
| `DialContext`  | `func(ctx, addr) (net.Conn, error)`                    | `nil` (标准拨号器)         | —      | 用于 TCP 连接的自定义拨号函数。适用于 Native 和 HTTP。  | 99% 的情况下保持为 `nil`。用于 Unix 套接字、SOCKS 代理或自定义 DNS。 | 不遵循上下文：会导致挂起、资源泄漏。设置了 `TLS` 时：自定义拨号器必须自行处理 TLS。`net.Conn` 无效：会导致崩溃。 |
| `DialStrategy` | `func(ctx, connID, options, dial) (DialResult, error)` | `DefaultDialStrategy` | —      | 自定义服务器选择与连接策略。会覆盖 `ConnOpenStrategy`。 | 99.9% 的情况下使用默认值。仅在需要按地理位置感知路由、加权选择或健康检查时自定义。    | 未尝试所有服务器：即使有健康服务器可用也会失败。在内部执行高开销操作：每次建立连接都会阻塞连接池获取。                 |

***

### 客户端信息 \{#client-information\}

| 选项           | 类型               | 默认值                              | DSN 参数                          | 按查询                      | 说明                                                                                                                   | 最佳实践                                                                                             | 配置不当时                        |
| ------------ | ---------------- | -------------------------------- | ------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------- |
| `ClientInfo` | `ClientInfo` 结构体 | 自动：`clickhouse-go` 版本 + Go 运行时信息 | `client_info_product=myapp/1.0` | 是 (`WithClientInfo`，追加)  | 发送给 ClickHouse 的应用标识信息。包含 `Products` (`[]struct{Name,Version}`) 和 `Comment` (`[]string`) 。可在 `system.query_log` 中看到。 | 始终设置应用名称和版本。用于查询归属分析：`SELECT client_name FROM system.query_log WHERE client_name LIKE '%myapp%'` | 未设置时：在多服务环境中，无法识别是哪个服务发起了查询。 |

```go
ClientInfo: clickhouse.ClientInfo{
    Products: []struct{ Name, Version string }{
        {Name: "my-service", Version: "1.0.0"},
    },
}
// Appears as: clickhouse-go/2.x my-service/1.0.0 (lv:go/1.23; os:linux)
```

***

### ClickHouse 服务器设置 \{#server-settings\}

| 选项              | 类型                            | 默认值   | DSN 参数                                  | 按查询设置                               | 说明                                                                                               | 最佳实践                           | 配置错误时                                                                                                            |
| --------------- | ----------------------------- | ----- | --------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `Settings`      | `map[string]any`              | `nil` | 任何未识别的参数 (例如 `?max_execution_time=60`)  | 是 (`WithSettings`，冲突时以上下文为准)  | 应用于每个查询的 ClickHouse 服务器设置。DSN 转换：`"true"`→`1`、`"false"`→`0`、数值→`int`。                            | 在连接级别设置通用限制，并通过上下文按查询覆盖。 | 拼写错误：可能被静默忽略，或因版本不同而报错。类型错误：`"Cannot parse string 'abc' as Int64"`。`max_execution_time=0` 且未设置 deadline：查询将一直运行。 |
| `CustomSetting` | `CustomSetting{Value string}` | —     | —                                       | 是 (通过 `WithSettings`)               | 将某个设置标记为 &quot;custom&quot; (非重要) 以用于 native protocol。如果服务器无法识别该设置，也不会报错。HTTP 默认将所有设置都视为 custom。 | 用于 Experimental 或特定版本的设置。      | 将重要设置标记为 custom：如果服务器不支持，该设置会被静默忽略。                                                                              |

**常见设置：**

| 设置                   | 类型  | 说明                     |
| -------------------- | --- | ---------------------- |
| `max_execution_time` | int | 查询超时时间 (秒)             |
| `max_memory_usage`   | int | 每个查询的内存限制 (字节)         |
| `max_block_size`     | int | 处理时的块大小                |
| `readonly`           | int | 1 = 只读，2 = 只读 + 允许修改设置 |

```go
Settings: clickhouse.Settings{
    "max_execution_time":  60,                                        // important -- errors if unknown
    "my_custom_setting":   clickhouse.CustomSetting{Value: "value"},  // custom -- ignored if unknown
}
```

***

## 上下文级别的查询选项 \{#context-options\}

使用 `clickhouse.Context()` 为每个查询单独设置：

```go
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithQueryID("my-query"),
    clickhouse.WithSettings(clickhouse.Settings{"max_execution_time": 60}),
)
```

:::note[上下文截止时间的行为]
如果上下文的截止时间 &gt; 1s，`max_execution_time` 会自动设置为 `seconds_remaining + 5`。这会覆盖任何手动设置的值。
:::

| 选项                        | 类型                                 | 默认值                  | 协议             | 说明                                                                                                                                 | 最佳实践                                                                                 | 配置不当时                                                                                                               |
| ------------------------- | ---------------------------------- | -------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `WithQueryID`             | `string`                           | 自动生成                 | 两者均可           | 自定义查询标识符。在 `system.query_log` 和 `system.processes` 中可见。                                                                            | 使用 UUID。便于执行 `KILL QUERY WHERE query_id='...'`。                                      | ID 重复：会导致 `system.query_log` 中出现混淆。                                                                                 |
| `WithQuotaKey`            | `string`                           | `""`                 | 两者均可           | 用于多租户资源限制的配额键，需要在服务器端配置配额。                                                                                                         | 用于按客户/按用户实施限制。                                                                       | 未配置配额：将被静默忽略。                                                                                                       |
| `WithJWT`                 | `string`                           | `""`                 | 仅限 HTTPS       | ClickHouse Cloud 的单次查询 JWT 覆盖设置。 *(自 v2.35.0 起)*                                                                                   | 用于多租户代理中的按请求认证。                                                                      | 未启用 TLS：将被忽略，并回退为使用连接认证。已过期：`"Token has expired"`。                                                                  |
| `WithSettings`            | `Settings`                         | 继承连接配置               | 两者皆可           | 按查询设置的服务器级配置。会与连接配置合并；发生冲突时，以上下文为准。                                                                                                | 按查询类型分别覆盖 `max_execution_time` 或 `max_rows_to_read`。                                 | 与连接级 `Settings` 相同。                                                                                                 |
| `WithParameters`          | `Parameters` (`map[string]string`) | `nil`                | 两者皆可           | 服务器端参数化查询的值。查询语法：`{param_name:Type}`。                                                                                              | 为防止 SQL 注入，请使用此方式，不要进行字符串拼接。                                                         | 缺少参数：`"Substitution {param_name:Type} isn't set"`。类型不匹配：`"Cannot parse string 'abc' as UInt64"`。                    |
| `WithAsync`               | `bool` (wait)                      | 同步                   | 两者均可           | 异步插入模式。设置 `async_insert=1`。`wait=true` 时会额外设置 `wait_for_async_insert=1`。要求 ClickHouse 21.11+。*(自 v2.41.0 起；取代了旧版 `WithStdAsync`。)* | 适用于高吞吐量插入场景。                                                                         | `wait=false`：错误可能会异步返回——请检查 `system.asynchronous_insert_log`。对于 SELECT：会被忽略。旧版服务器：`"Unknown setting async_insert"`。 |
| `WithLogs`                | `func(*Log)`                       | `nil`                | 仅支持原生协议        | 查询执行期间接收服务器日志条目的回调。                                                                                                                | 保持回调轻量且快速——否则会阻塞执行。较重的处理请使用 goroutine。                                               | 在 HTTP 下：不会被调用，且不会有任何提示。                                                                                            |
| `WithProgress`            | `func(*Progress)`                  | `nil`                | 仅支持 Native 协议  | 查询进度更新 (已处理的行数/字节数) 。                                                                                                              | 保持轻量快速——否则会阻塞执行。                                                                     | 在 HTTP 下：不会被调用，且不会有任何提示。                                                                                            |
| `WithProfileInfo`         | `func(*ProfileInfo)`               | `nil`                | 仅适用于 Native 协议 | 查询执行统计信息回调。                                                                                                                        | 保持快速——否则会阻塞执行。                                                                       | 在 HTTP 下：不会被调用，且无任何提示。                                                                                              |
| `WithProfileEvents`       | `func([]ProfileEvent)`             | `nil`                | 仅适用于 Native 协议 | 性能计数器回调。                                                                                                                           | 保持高效——会阻塞执行。                                                                         | 在 HTTP 上：不会被调用，且无任何提示。                                                                                              |
| `WithoutProfileEvents`    | —                                  | 已发送事件                | 仅支持原生协议        | 禁用 profile events。可用于 ≥ 25.11 服务器的性能优化。*(自 v2.44.0 起)*                                                                             | 不需要 profile events 时使用。                                                              | 在较旧的服务器上：会因设置未知而报错。                                                                                                 |
| `WithExternalTable`       | `...*ext.Table`                    | `nil`                | 两者都支持          | 将临时查找表附加到查询中。数据按每次查询传输。                                                                                                            | 将表控制在 &lt; 10 MB。原生方式比 HTTP (multipart) 更高效。                                         | 大表：每次查询的网络开销较高。                                                                                                     |
| `WithUserLocation`        | `*time.Location`                   | 服务器时区                | 两者             | 覆盖 DateTime 解析时使用的时区。                                                                                                              | 当客户端与服务器的时区不一致时，请显式设置。                                                               | 时区错误：DateTime 值会在无提示的情况下偏差数小时，并可能导致数据损坏。                                                                            |
| `WithColumnNamesAndTypes` | `[]ColumnNameAndType`              | `nil` (会执行 DESCRIBE) | 仅支持 HTTP       | 通过预先提供列信息，跳过 HTTP 插入时的 `DESCRIBE TABLE` 往返请求。*(自 v2.37.0 起)*                                                                       | 在已知且 schema 为稳定版本时使用。                                                                | 类型不匹配：`"Cannot convert String to UInt64"`。迁移后发生 schema 漂移：信息陈旧。                                                     |
| `WithBlockBufferSize`     | `uint8`                            | 连接级别 (2)             | 两者均支持          | 针对单个查询覆盖连接级 `BlockBufferSize` 设置。                                                                                                  | 对于特定查询产生的大型结果集，可增大该值。                                                                | —                                                                                                                   |
| `WithClientInfo`          | `ClientInfo`                       | 连接级                  | 两者均支持          | 为单次查询追加额外的客户端信息。不会替换，而是附加。*(自 v2.42.0 起)*                                                                                          | 为每次请求添加上下文信息 (例如端点名称) 。                                                              | —                                                                                                                   |
| `WithSpan`                | `trace.SpanContext`                | 空                    | 仅限原生协议         | 用于分布式追踪的 OpenTelemetry span 上下文。                                                                                                   | 参见 [OpenTelemetry](/integrations/language-clients/go/clickhouse-api#open-telemetry)。 | —                                                                                                                   |

```go
ctx := clickhouse.Context(ctx,
    clickhouse.WithQueryID("query-123"),
    clickhouse.WithParameters(clickhouse.Parameters{
        "user_id": "12345",
    }),
    clickhouse.WithProgress(func(p *clickhouse.Progress) {
        log.Printf("Progress: %d rows, %d bytes", p.Rows, p.Bytes)
    }),
)
rows, err := conn.Query(ctx, "SELECT * FROM users WHERE id = {user_id:String}")
```

***

## 批次选项 \{#batch-options\}

传递给 `PrepareBatch()`。导入：`github.com/ClickHouse/clickhouse-go/v2/lib/driver`。

| 选项                      | 默认值               | 说明                                                           | 最佳实践                                  | 配置不当时                                                  |
| ----------------------- | ----------------- | ------------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------ |
| `WithReleaseConnection` | 连接会一直保留到 `Send()` | 在 `PrepareBatch()` 后立即将连接释放回连接池，并在 `Send()`/`Flush()` 时重新获取。 | 对于生命周期较长的批次 (数分钟到数小时) ，使用此选项可避免连接池耗尽。 | 长时间运行的批次未使用此选项时：若活动批次较多，可能出现 `"acquire conn timeout"`。 |
| `WithCloseOnFlush`      | 批次保持打开状态          | 调用 `Flush()` 时自动关闭批次。                                        | 适用于一次性批次，可省去显式调用 `Close()`。           | 若配合多次 `Flush()` 调用使用：首次 flush 会关闭批次，后续操作会失败。           |

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO table",
    driver.WithReleaseConnection(),
    driver.WithCloseOnFlush(),
)
```

***

## 速查表 \{#quick-reference-tables\}

### 连接池容量建议 \{#pool-sizing\}

| 应用类型           | MaxIdleConns | MaxOpenConns | ConnMaxLifetime |
| -------------- | ------------ | ------------ | --------------- |
| 低流量 Web 应用     | 5            | 10           | 1h              |
| 中等流量 API       | 20           | 50           | 30m             |
| 高流量服务          | 50           | 100          | 15m             |
| 后台批处理任务        | 10           | 20           | 2h              |
| Kubernetes 部署  | 10           | 20           | 10m             |
| 无服务器 (Lambda)  | 1            | 5            | 5m              |

### 超时建议 \{#timeout-recommendations\}

| 环境         | DialTimeout | ReadTimeout |
| ---------- | ----------- | ----------- |
| 本地 / 局域网   | 5s          | 30s         |
| Cloud，同一区域 | 10s         | 2m          |
| Cloud，跨区域  | 30s         | 5m          |
| OLAP 工作负载  | 10s         | 30m         |
| 实时 / OLTP  | 5s          | 10s         |

### DSN 参数速查 \{#dsn-parameters\}

| DSN 参数                     | 选项字段                     | 示例                                      |
| -------------------------- | ------------------------ | --------------------------------------- |
| `username`                 | `Auth.Username`          | `?username=admin`                       |
| `password`                 | `Auth.Password`          | `?password=secret`                      |
| `database`                 | `Auth.Database`          | `?database=mydb` 或路径中的 `/mydb`          |
| `dial_timeout`             | `DialTimeout`            | `?dial_timeout=10s`                     |
| `read_timeout`             | `ReadTimeout`            | `?read_timeout=5m`                      |
| `max_open_conns`           | `MaxOpenConns`           | `?max_open_conns=50`                    |
| `max_idle_conns`           | `MaxIdleConns`           | `?max_idle_conns=20`                    |
| `conn_max_lifetime`        | `ConnMaxLifetime`        | `?conn_max_lifetime=30m`                |
| `connection_open_strategy` | `ConnOpenStrategy`       | `?connection_open_strategy=round_robin` |
| `block_buffer_size`        | `BlockBufferSize`        | `?block_buffer_size=10`                 |
| `compress`                 | `Compression.Method`     | `?compress=lz4`                         |
| `compress_level`           | `Compression.Level`      | `?compress_level=6`                     |
| `max_compression_buffer`   | `MaxCompressionBuffer`   | `?max_compression_buffer=20971520`      |
| `secure`                   | `TLS`                    | `?secure=true`                          |
| `skip_verify`              | `TLS.InsecureSkipVerify` | `?skip_verify=true`                     |
| `debug`                    | `Debug`                  | `?debug=true`                           |
| `client_info_product`      | `ClientInfo.Products`    | `?client_info_product=myapp/1.0`        |
| `http_proxy`               | `HTTPProxyURL`           | `?http_proxy=http%3A%2F%2Fproxy%3A8080` |
| `http_path`                | `HttpUrlPath`            | `?http_path=/clickhouse`                |
| *(其他任意参数)*                 | `Settings[key]`          | `?max_execution_time=60`                |

***

## 故障排查 \{#troubleshooting\}

### 连接池耗尽：“acquire conn timeout” \{#acquire-conn-timeout\}

**原因：**连接池已耗尽——所有 `MaxOpenConns` 连接都在使用中，且在 `DialTimeout` 时间内没有任何连接可用。

**修复**

请按顺序尝试以下步骤，并在调整参数前先诊断根本原因：

1. 检查是否有长时间运行的查询占用连接：`SELECT query_id, elapsed FROM system.processes ORDER BY elapsed DESC`。如果有，请先处理这些慢查询。
2. 如果你运行的是长时间保持打开的批次 (在 `PrepareBatch()` 和 `Send()` 之间相隔数分钟或数小时) ，请使用 `WithReleaseConnection()`，以便在批次仍处于打开状态时将连接归还到连接池。
3. 增加 `MaxOpenConns`，使其与实际观测到的并发度相匹配。
4. 仅在预期会出现突发流量，且获取连接的等待时间确实是瓶颈时，才增加 `DialTimeout`。

### 读取超时和连接重置错误 \{#io-timeout\}

**原因：** 等待服务器响应时超出了 `ReadTimeout`，或者连接被服务器或网络关闭。

**解决方法：**

* 对长时间运行的查询增大 `ReadTimeout`
* 使用上下文截止时间控制单个查询的超时
* 检查 ClickHouse 服务端的 `max_execution_time` 限制

### &quot;Code: 516. 身份验证失败&quot; \{#auth-failed\}

**原因：** 用户名或密码错误，或者该用户不存在。

**修复方法：**

* 对照 `system.users` 表核对凭据
* 检查 DSN 密码中的特殊字符是否存在 URL 编码问题
* 确认该用户有权访问指定的数据库

### TLS 证书错误 \{#tls-errors\}

| 错误                                              | 原因         | 解决方法                                   |
| ----------------------------------------------- | ---------- | -------------------------------------- |
| `x509: certificate has expired`                 | 服务器证书已过期   | 更新服务器证书                                |
| `x509: certificate is valid for X, not Y`       | 主机名不匹配     | 使用正确的主机名，或将其添加到 SANs                   |
| `x509: certificate signed by unknown authority` | CA 不受信任    | 将 CA 添加到 `tls.Config.RootCAs`          |
| `connection reset by peer`                      | TLS 与端口不匹配 | TLS 请使用 9440 (Native) 或 8443 (HTTP) 端口 |

### 内存逐渐增长 \{#memory-growth\}

**原因：** 大量空闲连接的缓冲区持续累积。

**修复方法：**

* 在内存受限的环境中，将 `FreeBufOnConnRelease` 设置为 `true`
* 降低 `MaxIdleConns` 以限制空闲连接数
* 如果使用压缩，减小 `MaxCompressionBuffer`
* 降低 `ConnMaxLifetime`，以更频繁地轮换连接