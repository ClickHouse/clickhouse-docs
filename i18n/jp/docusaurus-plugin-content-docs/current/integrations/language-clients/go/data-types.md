---
sidebar_label: 'データ型'
sidebar_position: 5
keywords: ['clickhouse', 'go', 'golang', 'types', 'data types', 'complex types']
description: 'clickhouse-go における Go の型マッピングと複合型のサポート。'
slug: /integrations/language-clients/go/data-types
title: 'データ型'
doc_type: 'reference'
---

# データ型 \{#data-types\}

## 型変換 \{#type-conversions\}

クライアントは、挿入時とレスポンスのマーシャリング時の両方で、受け付ける変数の型について可能な限り柔軟であることを目指しています。ほとんどの場合、ClickHouseのカラム型には対応するGolangの型が存在します。たとえば、[UInt64](/sql-reference/data-types/int-uint/) には [uint64](https://pkg.go.dev/builtin#uint64) が対応します。こうした論理的な対応関係は、常にサポートされるべきです。変数または受信したデータに対して先に変換が行われるのであれば、カラムに挿入可能な変数型や、レスポンスの受信に使える変数型を利用したい場合があるでしょう。クライアントはこうした変換を透過的にサポートすることを目指しているため、ユーザーは挿入前にデータの型を厳密に合わせるための変換を行う必要がなく、クエリ時にも柔軟にマーシャリングできます。この透過的な変換では、精度の損失は許容されません。たとえば、UInt64カラムからデータを受け取るために uint32 を使うことはできません。逆に、フォーマット要件を満たしていれば、datetime64 フィールドには文字列を挿入できます。

現在、プリミティブ型でサポートされている型変換は、[こちら](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)にまとめられています。

この取り組みは現在も進行中で、挿入時 (`Append`/`AppendRow`) と読み取り時 (`Scan` 経由) に分けられます。特定の変換のサポートが必要な場合は、issue を作成してください。

標準の `database/sql` インターフェースは、ClickHouse API と同じ型をサポートするはずです。いくつか例外があり、主に複雑な型に関するものですが、それらは以下のセクションで説明しています。ClickHouse API と同様に、クライアントは挿入時とレスポンスのマーシャリング時の両方で、受け付ける変数の型について可能な限り柔軟であることを目指しています。

## 複合型 \{#complex-types\}

### Date/DateTime \{#datedatetime\}

ClickHouse Go クライアント は、`Date`、`Date32`、`DateTime`、`DateTime64` の日付/日時型をサポートします。日付は、`2006-01-02` 形式の文字列として insert することも、Go ネイティブの `time.Time{}` または `sql.NullTime` を使って insert することもできます。DateTime でもこれらの型をサポートしますが、文字列を渡す場合は `2006-01-02 15:04:05` 形式である必要があり、必要に応じてタイムゾーンオフセットも指定できます。たとえば `2006-01-02 15:04:05 +08:00` です。`time.Time{}` と `sql.NullTime` は読み取り時にもサポートされ、`sql.Scanner` インターフェースを実装した任意の型も利用できます。

タイムゾーン情報の扱いは、ClickHouse 型と、その値を insert するのか読み取るのかによって異なります。

* **DateTime/DateTime64**
  * **insert** 時には、値は UNIX タイムスタンプ形式で ClickHouse に送信されます。タイムゾーンが指定されていない場合、クライアント は クライアント のローカルタイムゾーンを前提とします。`time.Time{}` または `sql.NullTime` は、それに応じてエポックに変換されます。
  * **select** 時には、`time.Time` 値を返す際、設定されていればそのカラムのタイムゾーンが使われます。設定されていない場合は、サーバーのタイムゾーンが使われます。
* **Date/Date32**
  * **insert** 時には、Date 型は ClickHouse でロケールを持たないため、日付を unix タイムスタンプに変換する際にその日付のタイムゾーンが考慮されます。つまり、日付として格納される前にタイムゾーン分のオフセットが適用されます。文字列値でこれが指定されていない場合は、ローカルタイムゾーンが使われます。
  * **select** 時には、`time.Time{}` または `sql.NullTime{}` のインスタンスに スキャンされた日付は、タイムゾーン情報なしで返されます。

### Time/Time64 型 \{#timetime64-types\}

`Time` および `Time64` のカラム型は、日付要素を含まない時刻値を格納します。どちらも Go の `time.Duration` に対応します。

* `Time` は、時刻を秒精度で格納します。
* `Time64(precision)` は、`DateTime64` と同様に秒未満の精度をサポートし、precision は 0～9 です。

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

### Array \{#array\}

配列はスライスとしてinsertする必要があります。要素の型付け規則は[基本型](#type-conversions)の場合と同様で、可能な場合は要素が変換されます。

Scan時には、スライスへのポインタを渡す必要があります。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)

### マップ \{#map\}

マップは、キーと値が[前述](#type-conversions)の型規則に従うGolangのマップとしてinsertする必要があります。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)

:::note
`database/sql` API を使う場合、Map の値は厳密に型指定する必要があり、値の型として `interface{}` は使えません。たとえば、`Map(String,String)` フィールドに `map[string]interface{}` を渡すことはできないため、代わりに `map[string]string` を使う必要があります。一方、`interface{}` 型の変数であれば常に互換性があり、より複雑な構造にも使えます。

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)
:::

### タプル \{#tuples\}

タプルは、任意の長さのカラムをまとめたものです。カラムには明示的に名前を付けることも、型だけを指定することもできます。例:

```sql
//unnamed
Col1 Tuple(String, Int64)

//named
Col2 Tuple(name String, id Int64, age uint8)
```

これらの方法のうち、名前付きタプルのほうが柔軟性に優れています。名前なしタプルはスライスを使って insert および読み取りを行う必要がありますが、名前付きタプルはマップにも対応しています。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注: 型付きスライスとマップは、名前付きタプル 内のサブカラムがすべて同じ型である場合にサポートされます。

### Nested \{#nested\}

Nested フィールドは、名前付き タプル の Array と同等です。使用方法は、ユーザーが [flatten&#95;nested](/operations/settings/settings#flatten_nested) を 1 に設定しているか 0 に設定しているかによって異なります。

flatten&#95;nested を 0 に設定すると、Nested カラムは タプル の単一の配列として保持されます。これにより、挿入と取得にマップのスライスを使うことができ、任意のレベルのネストも可能になります。以下の例に示すように、マップのキーはカラム名と一致している必要があります。

注: マップは タプル を表すため、型は `map[string]interface{}` でなければなりません。現在、値は厳密に型付けされていません。

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

[完全な例 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

`flatten_nested` にデフォルト値の 1 を使う場合、ネストされたカラムは個別の配列へフラット化されます。そのため、挿入時と取得時にはネストされたスライスを使う必要があります。任意のレベルのネストでも動作する可能性はありますが、公式にはサポートされていません。

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

[完全な例 - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

注: Nested カラムは同じサイズでなければなりません。たとえば、上記の例では、`Col_2_2` と `Col_2_1` は同じ数の要素を持つ必要があります。

インターフェースがよりシンプルで、ネストに対する公式サポートもあるため、`flatten_nested=0` を推奨します。

### Geo 型 \{#geo-types\}

クライアント は、Point、Ring、LineString、Polygon、MultiPolygon、MultiLineString の各 Geo 型をサポートします。これらの型は、Go では [github.com/paulmach/orb](https://github.com/paulmach/orb) パッケージで表現されます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)

### UUID \{#uuid\}

UUID 型は、[github.com/google/uuid](https://github.com/google/uuid) パッケージでサポートされています。UUID は、文字列として、または `sql.Scanner` もしくは `Stringify` を実装した任意の型として送信およびマーシャリングすることもできます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/uuid.go)

### Decimal \{#decimal\}

Go には組み込みの Decimal 型がないため、元のクエリを変更せずに Decimal 型をネイティブに扱うには、サードパーティーのパッケージ [github.com/shopspring/decimal](https://github.com/shopspring/decimal) を使うことを推奨します。

:::note
サードパーティーへの依存を避けるため、代わりに Float を使いたくなるかもしれません。ただし、[正確な値が必要な場合、ClickHouse では Float 型の使用は推奨されません](https://clickhouse.com/docs/sql-reference/data-types/float)。

それでもクライアント側で Go の組み込み Float 型を使う場合は、ClickHouse クエリ内で [toFloat64() 関数](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64) または [その派生関数](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64OrZero) を使って、Decimal を明示的に Float に変換する必要があります。この変換により、精度が失われる可能性があることに注意してください。
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)

### Nullable \{#nullable\}

Go の値 `Nil` は、ClickHouse の NULL を表します。これは、フィールドが Nullable として宣言されている場合に使えます。insert 時には、通常のカラムと Nullable なカラムの両方に `Nil` を渡せます。前者では、その型のデフォルト値が保存されます。たとえば、string なら空の文字列です。Nullable の場合は、NULL 値が ClickHouse に格納されます。

scan 時には、ユーザーは Nullable フィールドの nil 値を表現するために、nil をサポートする型へのポインタ (たとえば `*string`) を渡す必要があります。以下の例では、Nullable(String) である col1 は、そのため `**string` を受け取ります。これにより nil を表現できます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

クライアントは、`sql.NullInt64` などの `sql.Null*` 型もサポートしています。これらは対応する ClickHouse 型と互換性があります。

### 大きな整数 \{#big-ints\}

64 ビットを超える数値型は、Go 標準の [big](https://pkg.go.dev/math/big) パッケージを使用して表現されます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)

### BFloat16 \{#bfloat16\}

`BFloat16` は、機械学習ワークロードで使われる 16 ビットの brain float 型です。Go では、`BFloat16` の値は `float32` として insert および スキャンします。Nullable 型では `sql.NullFloat64` を使います。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bfloat16.go)

### QBit \{#qbit\}

`QBit` は、ビットスライス形式でベクトル埋め込みを格納するための実験的なカラム型で、ベクトル類似度検索向けに最適化されています。使用するには、`allow_experimental_qbit_type` 設定を有効にする必要があります。

Go では、`QBit(Float32, N)` カラムは、N をベクトル次元として `[]float32` として insert およびスキャンされます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/qbit.go)
