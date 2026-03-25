---
sidebar_label: '数据类型'
sidebar_position: 5
keywords: ['clickhouse', 'go', 'golang', '类型', '数据类型', '复杂类型']
description: 'Go 类型映射以及 clickhouse-go 对复杂类型的支持。'
slug: /integrations/language-clients/go/data-types
title: '数据类型'
doc_type: 'reference'
---

# 数据类型 \{#data-types\}

## 类型转换 \{#type-conversions\}

客户端力求在接受用于插入和响应编组的变量类型时尽可能灵活。在大多数情况下，ClickHouse 列类型都存在对应的 Golang 类型，例如，[UInt64](/sql-reference/data-types/int-uint/) 对应 [uint64](https://pkg.go.dev/builtin#uint64)。这类逻辑映射应始终受到支持。如果变量或接收到的数据能够先完成转换，你也可以使用可插入列中或可用于接收响应的变量类型。客户端致力于透明地支持这些转换，使用户在插入前无需严格调整数据类型，并在查询时提供灵活的编组能力。这种透明转换不允许精度损失。例如，不能使用 uint32 来接收 UInt64 列中的数据。相反，只要满足格式要求，就可以将 string 插入 datetime64 字段。

当前支持的原始类型转换汇总见[此处](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)。

这项工作仍在持续推进，目前可分为插入时 (`Append`/`AppendRow`) 和读取时 (通过 `Scan`) 两部分。如果你需要支持某种特定转换，请提交 issue。

标准 `database/sql` 接口应支持与 ClickHouse API 相同的类型。也有少数例外，主要涉及复杂类型，这些内容将在下方各节中说明。与 ClickHouse API 类似，客户端力求在接受用于插入和响应编组的变量类型时尽可能灵活。

## 复杂类型 \{#complex-types\}

### Date/DateTime \{#datedatetime\}

ClickHouse Go 客户端支持 `Date`、`Date32`、`DateTime` 和 `DateTime64` 日期/日期时间类型。插入日期时，可以使用 `2006-01-02` 格式的字符串，也可以使用原生 Go 类型 `time.Time{}` 或 `sql.NullTime`。DateTime 同样支持后两种类型，但字符串必须采用 `2006-01-02 15:04:05` 格式，也可选择附带时区偏移，例如 `2006-01-02 15:04:05 +08:00`。读取时也支持 `time.Time{}` 和 `sql.NullTime`，以及任何实现了 `sql.Scanner` 接口的类型。

时区信息的处理方式取决于 ClickHouse 类型，以及该值是在插入时还是读取时处理：

* **DateTime/DateTime64**
  * 在 **insert** 时，值会以 UNIX 时间戳格式发送到 ClickHouse。如果未提供时区，客户端会假定使用客户端所在的本地时区。`time.Time{}` 或 `sql.NullTime` 也会据此转换为 epoch。
  * 在 **select** 时，如果返回的是 `time.Time` 值且列设置了时区，则使用该列的时区；否则使用服务器的时区。
* **Date/Date32**
  * 在 **insert** 时，将日期转换为 unix 时间戳时会考虑其时区。也就是说，由于 Date 类型在 ClickHouse 中不包含 locale 信息，因此在按日期存储之前会先根据时区进行偏移。如果字符串值中未指定时区，则使用本地时区。
  * 在 **select** 时，扫描到 `time.Time{}` 或 `sql.NullTime{}` 实例中的日期，返回时将不包含时区信息。

### Time/Time64 类型 \{#timetime64-types\}

`Time` 和 `Time64` 列类型用于存储不包含日期部分的时间值。两者都映射到 Go 的 `time.Duration`。

* `Time` 以秒级精度存储时间。
* `Time64(precision)` 支持子秒级精度 (类似于 `DateTime64`) ，其中 `precision` 的取值范围为 0–9。

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

### 数组 \{#array\}

数组应以 切片 的形式插入。元素的类型规则与[原始类型](#type-conversions)一致，也就是说，在可能的情况下会自动进行类型转换。

在 Scan 时，应传入指向 切片 的指针。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)

### Map \{#map\}

应以 Golang map 的形式插入 Map，其中键和值都必须符合[前文](#type-conversions)定义的类型规则。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)

:::note
使用 database/sql API 时，Map 值必须严格指定类型，不能使用 `interface{}` 作为值类型。例如，对于 `Map(String,String)` 字段，不能传入 `map[string]interface{}`，而必须使用 `map[string]string`。不过，`interface{}` 类型的变量本身始终兼容，因此可用于更复杂的结构。

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)
:::

### 元组 \{#tuples\}

元组 表示一组长度任意的列。这些列既可以显式命名，也可以仅指定类型，例如

```sql
//unnamed
Col1 Tuple(String, Int64)

//named
Col2 Tuple(name String, id Int64, age uint8)
```

在这些方法中，具名元组的灵活性更高。虽然未命名元组必须使用 切片 进行 insert 和读取，但具名元组也兼容 map。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注：支持类型化的 切片 和 map，前提是具名元组中的所有子列类型都相同。

### Nested \{#nested\}

Nested 字段等同于由具名元组构成的 数组。具体用法取决于用户是否将 [flatten&#95;nested](/operations/settings/settings#flatten_nested) 设置为 1 或 0。

将 flatten&#95;nested 设置为 0 后，Nested 列会保持为单个元组数组。这样，您就可以使用 map 切片进行插入和读取，并支持任意层级的嵌套。map 的键必须与列名一致，如下例所示。

注意：由于这些 map 表示的是元组，因此它们必须为 `map[string]interface{}` 类型。目前这些值还不是强类型的。

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

[完整示例 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

如果 `flatten_nested` 使用默认值 1，嵌套列会被展平为独立的数组。这要求在插入和读取时使用嵌套切片。虽然任意层级的嵌套可能也能工作，但这并未获得官方支持。

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

[完整示例 - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

注意：Nested 列的各个维度必须一致。例如，在上述示例中，`Col_2_2` 和 `Col_2_1` 必须包含相同数量的元素。

由于接口更简洁，并且官方支持嵌套，我们建议使用 `flatten_nested=0`。

### 地理空间类型 \{#geo-types\}

客户端支持 Point、Ring、LineString、Polygon、MultiPolygon 和 MultiLineString 等地理空间类型。这些类型在 Go 中通过 [github.com/paulmach/orb](https://github.com/paulmach/orb) 包表示。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)

### UUID \{#uuid\}

[github.com/google/uuid](https://github.com/google/uuid) 包支持 UUID 类型。你也可以将 UUID 作为字符串进行发送和编组，或者使用任何实现了 `sql.Scanner` 或 `Stringify` 的类型来发送和编组 UUID。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/uuid.go)

### Decimal \{#decimal\}

由于 Go 没有内置的 Decimal 类型，我们建议使用第三方包 [github.com/shopspring/decimal](https://github.com/shopspring/decimal)，以便在不修改原始查询的情况下，原生处理 Decimal 类型。

:::note
你可能会想改用 Float 来避免引入第三方依赖。不过请注意，当需要精确值时，[不建议在 ClickHouse 中使用 Float 类型](https://clickhouse.com/docs/sql-reference/data-types/float)。

如果你仍决定在客户端使用 Go 的内置 Float 类型，则必须在 ClickHouse 查询中使用 [toFloat64() 函数](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64) 或其[变体](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64OrZero)，将 Decimal 显式转换为 Float。请注意，这种转换可能会导致精度损失。
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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)

### Nullable \{#nullable\}

Go 中的 Nil 值表示 ClickHouse 中的 NULL。如果字段被声明为 Nullable，则可以使用它。插入时，对于某列的普通版本和 Nullable 版本，都可以传入 Nil。对于前者，将持久化该类型的默认值，例如 string 类型的默认值是空字符串。对于 Nullable 版本，则会在 ClickHouse 中存储 NULL 值。

扫描时，用户必须传入一个支持 nil 的类型指针，例如 *string，以表示 Nullable 字段的 nil 值。在下面的示例中，col1 是 Nullable(String)，因此接收一个 **string。这样即可表示 nil。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

客户端还额外支持 `sql.Null*` 类型，例如 `sql.NullInt64`。这些类型与对应的 ClickHouse 类型兼容。

### 大整数 \{#big-ints\}

超过 64 位的数值类型使用 Go 原生的 [big](https://pkg.go.dev/math/big) 包表示。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)

### BFloat16 \{#bfloat16\}

`BFloat16` 是一种 16 位 brain float 类型，用于机器学习工作负载。在 Go 中，`BFloat16` 值以 `float32` 类型进行插入和扫描。Nullable 变体使用 `sql.NullFloat64`。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bfloat16.go)

### QBit \{#qbit\}

`QBit` 是一种实验性列类型，用于以位切片格式存储向量嵌入，并针对向量相似性搜索进行了优化。它要求启用 `allow_experimental_qbit_type` 设置。

在 Go 中，`QBit(Float32, N)` 列以 `[]float32` 的形式插入和扫描，其中 N 表示向量维度。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/qbit.go)
