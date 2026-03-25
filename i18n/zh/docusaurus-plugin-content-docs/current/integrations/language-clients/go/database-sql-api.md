---
sidebar_label: '数据库/SQL API'
sidebar_position: 4
keywords: ['clickhouse', 'go', 'golang', '数据库', 'sql', '标准']
description: '使用 database/sql 标准接口对接 clickhouse-go。'
slug: /integrations/language-clients/go/database-sql-api
title: '数据库/SQL API'
doc_type: '参考'
---

# 数据库/SQL API \{#database-sql-api\}

标准 API 的完整代码示例可在[此处](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)找到。

有关连接配置，请参阅 [Configuration](/integrations/language-clients/go/configuration)。
有关支持的数据类型和 Go 类型映射，请参阅 [Data Types](/integrations/language-clients/go/data-types)。

`database/sql` 或“标准”API 允许您在应用代码需要通过统一的标准接口屏蔽底层数据库差异的场景中使用客户端。这样做会带来一定代价——会增加额外的抽象层和间接层，以及一些未必与 ClickHouse 完全契合的基础机制。不过，在工具需要连接多个数据库的场景下，这些成本通常是可以接受的。

此外，该客户端还支持使用 HTTP 作为传输层——数据仍会采用 原生 格式编码，以获得最佳性能。

## 连接 \{#connecting\}

既可以使用格式为 `clickhouse://<host>:<port>?<query_option>=<value>` 的 DSN 字符串并调用 `Open` 方法来创建连接，也可以通过 `clickhouse.OpenDB` 方法创建连接。后者不属于 `database/sql` 规范的一部分，但会返回一个 `sql.DB` 实例。该方法提供了诸如性能分析之类的功能，而这些功能显然无法通过 `database/sql` 规范直接暴露。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect.go)

**在后续所有示例中，除非另有明确说明，否则均假定 ClickHouse `conn` 变量已创建并可用。**

### 连接设置 \{#connection-settings\}

大多数配置选项与 ClickHouse API 通用。有关这些共享设置，请参阅 [Configuration](/integrations/language-clients/go/configuration)。以下是可用的 SQL 专用 DSN 参数：

* `hosts` - 用于负载均衡和故障切换的单个地址主机列表，以逗号分隔 - 参阅 [Connecting to Multiple Nodes](/integrations/language-clients/go/configuration#connecting-to-multiple-nodes)。
* `username/password` - 认证凭据 - 参阅 [Authentication](/integrations/language-clients/go/configuration#authentication)
* `database` - 选择当前默认数据库
* `dial_timeout` - 时长字符串是一个可带正负号的十进制数字序列，每个数字都可带可选的小数部分和单位后缀，例如 `300ms`、`1s`。有效的时间单位为 `ms`、`s`、`m`。
* `connection_open_strategy` - `random/in_order` (默认值为 `random`) - 参阅 [Connecting to Multiple Nodes](/integrations/language-clients/go/configuration#connecting-to-multiple-nodes)
  * `round_robin` - 从集合中以轮询方式选择服务器
  * `in_order` - 按指定顺序选择第一个可用服务器
* `debug` - 启用调试输出 (布尔值)
* `compress` - 指定压缩算法 - `none` (默认值) 、`zstd`、`lz4`、`gzip`、`deflate`、`br`。如果设为 `true`，将使用 `lz4`。原生 通信仅支持 `lz4` 和 `zstd`。
* `compress_level` - 压缩级别 (默认值为 `0`) 。参阅 Compression。这取决于具体算法：
  * `gzip` - `-2` (最快速度) 到 `9` (最佳压缩)
  * `deflate` - `-2` (最快速度) 到 `9` (最佳压缩)
  * `br` - `0` (最快速度) 到 `11` (最佳压缩)
  * `zstd`, `lz4` - 将被忽略
* `secure` - 建立安全的 SSL 连接 (默认值为 `false`)
* `skip_verify` - 跳过证书验证 (默认值为 `false`)
* `block_buffer_size` - 允许您控制数据块缓冲区大小。参阅 [`BlockBufferSize`](/integrations/language-clients/go/configuration#connection-settings)。 (默认值为 `2`)

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)

### 通过 HTTP 连接 \{#connecting-over-http\}

默认情况下，连接通过原生协议建立。对于需要使用 HTTP 的用户，可以通过修改 DSN 以包含 HTTP 协议，或在连接选项中指定 Protocol 来启用 HTTP 连接。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)

### 会话 \{#sessions\}

:::note 仅限 HTTP
仅在使用 HTTP 传输时才需要会话。原生 TCP 连接会自动内置会话。
:::

使用 HTTP 时，请将 `session_id` 作为设置传入，以启用与会话绑定的功能，例如临时表。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

## 执行 \{#execution\}

获得连接后，您可以通过 Exec 方法发出 `sql` 语句并执行。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/exec.go)

此方法不支持传入上下文；默认值是使用后台上下文执行。如有需要，可以使用 `ExecContext`——参阅[使用 Context](#using-context)。

## 批次插入 \{#batch-insert\}

可通过 `Being` 方法创建 `sql.Tx` 以实现批次语义。之后，可使用包含 `INSERT` 语句的 `Prepare` 方法获取一个批次。这会返回一个 `sql.Stmt`，可通过 `Exec` 方法向其中追加行。在对原始 `sql.Tx` 执行 `Commit` 之前，该批次会一直在内存中累积。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)

## 查询行 \{#querying-rows\}

可以使用 `QueryRow` 方法查询单行数据。该方法会返回一个 *sql.Row，可在其上调用 Scan，并传入变量指针，将各列的值写入这些变量。`QueryRowContext` 变体支持传入非 后台 的上下文——参阅 [使用 Context](#using-context)。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_row.go)

遍历多行需要使用 `Query` 方法。该方法会返回一个 `*sql.Rows` 结构体，可在其上调用 Next 来逐行迭代。对应的 `QueryContext` 方法则允许传入上下文。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

## 异步 插入 \{#async-insert\}

可以通过 `ExecContext` 方法执行 插入 来实现异步 插入。应向其传递一个已启用异步模式的 context，如下所示。这样，用户便可以指定客户端是等待服务器完成 插入，还是在数据已接收后立即返回响应。这实际上控制了参数 [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert)。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)

## 参数绑定 \{#parameter-binding\}

标准 API 提供与 [ClickHouse API](/integrations/language-clients/go/clickhouse-api#parameter-binding) 相同的参数绑定功能，允许将参数传递给 `Exec`、`Query` 和 `QueryRow` 方法 (以及它们对应的 [Context](#using-context) 版本) 。支持位置参数、命名参数和编号参数。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

注意，[特殊情况](/integrations/language-clients/go/clickhouse-api#special-cases) 仍然适用。

## 使用上下文 \{#using-context\}

标准 API 同样支持像 [ClickHouse API](/integrations/language-clients/go/clickhouse-api#using-context) 那样，通过上下文传递截止时间、取消信号以及其他请求作用域的值。与 ClickHouse API 不同，这里是通过使用各个方法的 `Context` 版本来实现的。也就是说，像 `Exec` 这类默认使用后台上下文的方法，都有对应的 `ExecContext` 版本，可将上下文作为第一个参数传入。这样就可以在应用流程的任何阶段传递上下文。例如，可以在通过 `ConnContext` 建立连接时传递上下文，或在通过 `QueryRowContext` 请求单行查询结果时传递上下文。下面展示了所有可用方法的示例。

有关使用上下文传递截止时间、取消信号、查询 id、配额键和连接设置的更多详细信息，请参阅 ClickHouse API 的 [Using Context](/integrations/language-clients/go/clickhouse-api#using-context)。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

## 动态扫描 \{#dynamic-scanning\}

与 [ClickHouse API](/integrations/language-clients/go/clickhouse-api#dynamic-scanning) 类似，此处提供列类型信息，以便您在运行时创建类型正确的变量实例，并将其传递给 Scan。这样即可读取类型事先未知的列。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)

## external table \{#external-tables\}

[external table](/engines/table-engines/special/external-data/) 允许客户端在执行 `SELECT` 查询时向 ClickHouse 发送数据。这些数据会被放入临时表中，并可在查询中用于求值。

要让客户端随查询发送外部数据，用户必须先通过 `ext.NewTable` 构建一个 external table，然后通过 context 传递它。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)

## OpenTelemetry \{#open-telemetry\}

ClickHouse 在 TCP 和 HTTP 传输方式下均支持[链路追踪上下文传播](/operations/opentelemetry/)。使用 `clickhouse.WithSpan` 可通过上下文将 span 附加到查询上。

:::note HTTP 传输限制
虽然 ClickHouse 服务器接受标准的 `traceparent` / `tracestate` HTTP 头，但 clickhouse-go 的 HTTP 传输目前不会发送这些头——`WithSpan` 在 HTTP 下不起作用。作为一种变通方法，你可以通过连接选项中的 `HttpHeaders` 手动设置这些头。
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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)

## 压缩 \{#compression\}

标准 API 支持与原生 [ClickHouse API](/integrations/language-clients/go/configuration#compression) 相同的压缩算法，即在数据块级别支持 `lz4` 和 `zstd` 压缩。此外，HTTP 连接还支持 `gzip`、`deflate` 和 `br` 压缩。如果启用了其中任意一种压缩方式，则会在插入期间和返回查询响应时按数据块进行压缩。其他请求 (例如 ping 或查询请求) 将保持未压缩状态。这与 `lz4` 和 `zstd` 选项的行为一致。

如果使用 `OpenDB` 方法建立连接，则可以传入 Compression 配置。其中还可以指定压缩级别 (参阅下文) 。如果通过带 DSN 的 `sql.Open` 进行连接，请使用参数 `compress`。该参数既可以是特定的压缩算法，即 `gzip`、`deflate`、`br`、`zstd` 或 `lz4`，也可以是一个布尔标志。如果设为 true，将使用 `lz4`。默认值为 `none`，即禁用压缩。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)

```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

可通过 DSN 参数 compress&#95;level 或 Compression 选项中的 Level 字段来控制压缩级别。默认值为 0，但具体范围因算法而异：

* `gzip` - `-2` (最快速度) 到 `9` (最高压缩率)
* `deflate` - `-2` (最快速度) 到 `9` (最高压缩率)
* `br` - `0` (最快速度) 到 `11` (最高压缩率)
* `zstd`, `lz4` - 会被忽略
