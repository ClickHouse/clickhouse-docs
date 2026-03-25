---
sidebar_label: 'ClickHouse API'
sidebar_position: 3
keywords: ['clickhouse', 'go', 'golang', 'api', '查询', 'insert', '批次']
description: '使用 clickhouse-go 调用原生 ClickHouse API：执行查询、按批次插入、异步插入等。'
slug: /integrations/language-clients/go/clickhouse-api
title: 'ClickHouse API'
doc_type: 'reference'
---

# ClickHouse API \{#clickhouse-api\}

ClickHouse API 的所有代码示例均可在[此处](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/clickhouse_api)找到。

有关连接配置，参阅 [Configuration](/integrations/language-clients/go/configuration)。
有关受支持的数据类型和 Go 类型映射，参阅 [Data Types](/integrations/language-clients/go/data-types)。

## 连接 \{#connecting\}

下面的示例会返回服务器版本，用于演示如何连接到 ClickHouse——前提是 ClickHouse 未启用安全防护，且可使用默认用户访问。

请注意，这里使用默认的原生端口进行连接。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect.go)

**在后续所有示例中，除非另有明确说明，否则均假定已创建并可使用 ClickHouse 的 `conn` 变量。**

## 执行 \{#execution\}

可通过 `Exec` 方法执行任意语句。这对于 DDL 和简单语句非常有用。但不应用于较大的插入操作或查询迭代。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/exec.go)

请注意，查询支持传入 Context。这可用于传递特定的查询级设置——参阅[使用 context](#using-context)。

## 批次插入 \{#batch-insert\}

要插入大量行时，客户端提供了批次处理机制。这需要先准备一个批次，之后可以持续向其中追加行，最后通过 `Send()` 方法发送出去。在执行 `Send` 之前，批次数据会一直保留在内存中。

建议对批次调用 `Close`，以避免连接泄漏。这可以在准备完批次后通过 `defer` 关键字实现。如果始终未调用 `Send`，这样也能清理该连接。请注意，如果没有追加任何行，查询日志中会显示插入了 0 行。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

ClickHouse 的相关建议同样适用于[此处](/guides/inserting-data#best-practices-for-inserts)。不要在多个 goroutine 之间共享批次——应为每个 goroutine 分别创建单独的批次。

从上述示例可以看出，在追加行数据时，变量类型需要与列类型一致。虽然这种映射关系通常很直观，但该接口尽量保持灵活性，只要不会造成精度损失，就会进行类型转换。例如，下面演示了将字符串插入到 datetime64 中。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)

有关各列类型支持的 Go 类型的完整汇总，参阅[类型转换](/integrations/language-clients/go/data-types#type-conversions)。

## 临时列 \{#ephemeral-columns\}

[临时列](https://clickhouse.com/docs/sql-reference/statements/create/table#ephemeral)是只写列，仅在插入过程中存在——不会被存储，也无法被查询。它们适合用于在插入时计算派生列的值。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ephemeral_native.go)

## 查询行 \{#querying-rows\}

你既可以使用 `QueryRow` 方法查询单行，也可以通过 `Query` 获取一个游标来迭代结果集。前者接收一个用于写入序列化数据的目标变量，而后者则需要对每一行调用 `Scan`。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_row.go)

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_rows.go)

请注意，在这两种情况下，都需要传入变量指针，以便将对应列的值序列化到这些变量中。这些变量必须按 `SELECT` 语句中指定的顺序传入——如果使用 `SELECT *`，则默认采用列声明顺序，如上所示。

与插入类似，`Scan` 方法要求目标变量具有合适的类型。这里同样尽量保持灵活性：只要不会造成精度损失，就会尽可能进行类型转换。例如，上述示例展示了将 UUID 列读取到字符串变量中。有关每种列类型所支持的完整 Go 类型列表，请参阅 [类型转换](/integrations/language-clients/go/data-types#type-conversions)。

最后，请注意，`Query` 和 `QueryRow` 方法都支持传入 `Context`。这可用于设置查询级别的 settings——更多详情，请参阅 [使用 context](#using-context)。

## 异步插入 \{#async-insert\}

异步插入支持通过 Async 方法实现。这使用户可以指定客户端是等待服务器完成插入，还是在收到数据后立即返回响应。这实际上控制了参数 [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert)。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)

## 列式插入 \{#columnar-insert\}

数据也可以按列格式插入。如果数据本身已经按这种结构组织，则可避免再转换为行，从而提升性能。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)

## 使用结构体 \{#using-structs\}

对于用户来说，Golang 结构体是 ClickHouse 中一行数据的逻辑表示。为便于此，原生接口提供了若干便捷函数。

### 使用 serialize 的 Select \{#select-with-serialize\}

Select 方法允许通过一次调用将一组返回行封送到一个 struct 切片中。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)

### 扫描结构体 \{#scan-struct\}

`ScanStruct` 可将查询结果中的单行数据封送到结构体中。

```go
var result struct {
    Col1  int64
    Count uint64 `ch:"count"`
}
if err := conn.QueryRow(context.Background(), "SELECT Col1, COUNT() AS count FROM example WHERE Col1 = 5 GROUP BY Col1").ScanStruct(&result); err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/scan_struct.go)

### 追加结构体 \{#append-struct\}

`AppendStruct` 允许将结构体追加到现有[批次](#batch-insert)中，并将其视为完整的一行。这要求结构体的字段在名称和类型上都与表的列对应。虽然所有列都必须有等效的结构体字段，但某些结构体字段可能没有对应的列表示。这些字段会被直接忽略。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)

## 参数绑定 \{#parameter-binding\}

客户端支持在 `Exec`、`Query` 和 `QueryRow` 方法中绑定参数。如下面的示例所示，可通过命名参数、编号参数和位置参数来实现。下方提供了相应示例。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)

### 特殊情况 \{#special-cases\}

默认情况下，如果将 slice 作为查询参数传递，它会被展开为以逗号分隔的值列表。如果需要注入一组带有 `[ ]` 包裹的值，应使用 `ArraySet`。

如果需要组/元组，并用 `( )` 包裹，例如用于 IN 运算符，则可以使用 `GroupSet`。如下方示例所示，这在需要多个组的场景中特别有用。

最后，DateTime64 字段需要指定精度，以确保参数能够被正确渲染。不过，客户端并不知道该字段的精度级别，因此必须由用户提供。为此，我们提供了 `DateNamed` 参数。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

## 使用 context \{#using-context\}

Go 的 context 提供了一种在 API 边界之间传递截止时间、取消信号以及其他请求范围值的机制。连接上的所有方法都将 context 作为第一个参数。尽管前面的示例使用了 context.Background()，你也可以利用这一能力传递设置和截止时间，并取消查询。

传递通过 `withDeadline` 创建的 context，可以为查询设置执行时间限制。请注意，这是一个绝对时间；到期后只会释放连接并向 ClickHouse 发送取消信号。或者，也可以使用 `WithCancel` 来显式取消查询。

辅助函数 `clickhouse.WithQueryID` 和 `clickhouse.WithQuotaKey` 允许指定查询 id 和 quota key。查询 id 可用于在日志中跟踪查询，也可用于取消操作。quota key 可用于基于唯一键值对 ClickHouse 使用量施加限制，更多详情请参阅 [Quotas Management](/operations/access-rights#quotas-management)。

你还可以使用 context 来确保某个设置仅应用于特定查询，而不是像 [Connection Settings](/integrations/language-clients/go/configuration#connection-settings) 中所示那样应用于整个连接。

最后，你可以通过 `clickhouse.WithBlockSize` 控制数据块缓冲区的大小。这会覆盖连接级别的设置 `BlockBufferSize`，并控制任意时刻解码并保存在内存中的最大数据块数。更大的值可能意味着更高的并行度，但代价是占用更多内存。

上述内容的示例如下所示。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)

## 进度、profile 和日志信息 \{#progress-profile-log\}

可以针对查询获取进度、Profile 和日志信息。进度信息会报告 ClickHouse 中已读取和已处理的行数与字节数统计。相应地，Profile 信息则提供返回给客户端的数据摘要，包括总字节数 (未压缩) 、行数和数据块数。最后，日志信息会提供线程数量等统计信息，例如内存使用情况和数据处理速度。

要获取这些信息，用户需要使用 [Context](#using-context)，并可向其传递回调函数。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)

## 动态扫描 \{#dynamic-scanning\}

你可能需要读取某些表，但并不清楚其 schema，或返回字段的类型。这种情况常见于进行临时数据分析或编写通用工具时。为此，查询响应中会提供列类型信息。可将其与 Go 反射结合使用，在运行时创建类型正确的变量实例，并将其传递给 Scan。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)

## external table \{#external-tables\}

[External tables](/engines/table-engines/special/external-data/) 允许客户端在执行 SELECT 查询时将数据发送到 ClickHouse。这些数据会被放入临时表中，并可在查询中用于求值。

要在查询中通过客户端发送外部数据，用户必须先使用 `ext.NewTable` 构建一个 external table，然后再通过上下文将其传入。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)

## OpenTelemetry \{#open-telemetry\}

ClickHouse 在 TCP 和 HTTP 两种传输方式下都支持[追踪上下文传播](/operations/opentelemetry/)。使用 TCP 时，客户端会将 span 序列化到原生二进制协议中。使用 `clickhouse.WithSpan` 可通过上下文将 span 附加到查询上。

:::note HTTP 传输限制
虽然 ClickHouse 服务器接受标准的 `traceparent` / `tracestate` HTTP 头，但 clickhouse-go 的 HTTP 传输当前不会发送这些头，因此 `WithSpan` 在 HTTP 下不起作用。作为一种变通方案，你可以通过连接选项中的 `HttpHeaders` 手动设置这些头。
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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

有关如何使用追踪功能的完整说明，请参阅 [OpenTelemetry 支持](/operations/opentelemetry/)。
