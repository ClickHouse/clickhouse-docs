---
sidebar_label: '데이터 타입'
sidebar_position: 5
keywords: ['clickhouse', 'go', 'golang', 'types', 'data types', 'complex types']
description: 'clickhouse-go의 Go 타입 매핑 및 복합 타입 지원.'
slug: /integrations/language-clients/go/data-types
title: '데이터 타입'
doc_type: 'reference'
---

# 데이터 타입 \{#data-types\}

## 타입 변환 \{#type-conversions\}

클라이언트는 삽입과 응답 마샬링 모두에서 변수 타입을 최대한 유연하게 허용하는 것을 목표로 합니다. 대부분의 경우 ClickHouse 컬럼 타입에 대응하는 동등한 Golang 타입이 존재합니다. 예를 들어 [UInt64](/sql-reference/data-types/int-uint/)는 [uint64](https://pkg.go.dev/builtin#uint64)에 대응합니다. 이러한 논리적 매핑은 항상 지원되어야 합니다. 변수 또는 수신한 데이터의 변환이 먼저 수행된다면, 컬럼에 삽입하거나 응답을 받는 데 사용할 수 있는 변수 타입을 활용할 수 있습니다. 클라이언트는 이러한 변환을 투명하게 지원하여, 사용자가 삽입 전에 데이터 타입을 정확히 맞추기 위해 직접 변환할 필요가 없도록 하고, 쿼리 시점에도 유연한 마샬링을 제공하는 것을 목표로 합니다. 이러한 투명한 변환에서는 정밀도 손실이 허용되지 않습니다. 예를 들어 uint32는 UInt64 컬럼의 데이터를 받는 데 사용할 수 없습니다. 반대로 string은 형식 요구 사항을 충족하면 datetime64 필드에 삽입할 수 있습니다.

기본 타입에 대해 현재 지원되는 타입 변환은 [여기](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)에 정리되어 있습니다.

이 작업은 현재도 진행 중이며, 삽입 시점(`Append`/`AppendRow`)과 읽기 시점(`Scan`을 통해)으로 나누어 볼 수 있습니다. 특정 변환에 대한 지원이 필요하면 이슈를 등록해 주십시오.

표준 `database/sql` 인터페이스는 ClickHouse API와 동일한 타입을 지원해야 합니다. 몇 가지 예외가 있으며, 주로 복합 타입과 관련된 내용으로 아래 섹션에 설명되어 있습니다. ClickHouse API와 마찬가지로, 클라이언트는 삽입과 응답 마샬링 모두에서 변수 타입을 최대한 유연하게 허용하는 것을 목표로 합니다.

## 복합 타입 \{#complex-types\}

### Date/DateTime \{#datedatetime\}

ClickHouse Go 클라이언트는 `Date`, `Date32`, `DateTime`, `DateTime64` 날짜/날짜-시간 타입을 지원합니다. 날짜는 `2006-01-02` 형식의 문자열로 삽입하거나 네이티브 Go `time.Time{}` 또는 `sql.NullTime`을 사용해 삽입할 수 있습니다. DateTime도 후자의 타입을 지원하지만, 문자열은 `2006-01-02 15:04:05` 형식으로 전달해야 하며 선택적으로 타임존 오프셋(예: `2006-01-02 15:04:05 +08:00`)을 포함할 수 있습니다. `time.Time{}`와 `sql.NullTime`은 읽을 때도 모두 지원되며, `sql.Scanner` 인터페이스를 구현한 모든 타입도 지원됩니다.

타임존 정보 처리 방식은 ClickHouse 타입과 값이 삽입되는지 또는 조회되는지에 따라 달라집니다.

* **DateTime/DateTime64**
  * **삽입** 시점에는 값이 UNIX 타임스탬프 형식으로 ClickHouse에 전송됩니다. 타임존이 제공되지 않으면 클라이언트는 로컬 타임존을 사용한다고 가정합니다. `time.Time{}` 또는 `sql.NullTime`은 이에 맞춰 epoch로 변환됩니다.
  * **조회** 시점에는 `time.Time` 값을 반환할 때 컬럼에 타임존이 설정되어 있으면 해당 타임존이 사용됩니다. 그렇지 않으면 서버의 타임존이 사용됩니다.
* **Date/Date32**
  * **삽입** 시점에는 날짜를 unix 타임스탬프로 변환할 때 날짜의 타임존이 고려됩니다. 즉, Date 타입은 ClickHouse에서 로캘 정보를 갖지 않으므로 날짜로 저장되기 전에 타임존만큼 오프셋이 적용됩니다. 문자열 값에 타임존이 지정되지 않으면 로컬 타임존이 사용됩니다.
  * **조회** 시점에는 `time.Time{}` 또는 `sql.NullTime{}` 인스턴스로 스캔된 날짜가 타임존 정보 없이 반환됩니다.

### Time/Time64 타입 \{#timetime64-types\}

`Time` 및 `Time64` 컬럼 타입은 날짜 구성 요소 없이 하루 중 시간을 저장합니다. 둘 다 Go의 `time.Duration`에 매핑됩니다.

* `Time`은 초 단위 정밀도로 시간을 저장합니다.
* `Time64(precision)`은 `DateTime64`와 마찬가지로 초 미만 정밀도를 지원하며, precision은 0–9입니다.

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

### 배열 \{#array\}

배열은 슬라이스로 삽입해야 합니다. 요소의 타입 지정 규칙은 [기본 타입](#type-conversions)과 동일하며, 가능한 경우 요소가 변환됩니다.

Scan 시점에는 슬라이스에 대한 포인터를 제공해야 합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)

### 맵 \{#map\}

맵은 키와 값이 [앞서](#type-conversions) 정의한 타입 규칙을 따르는 Golang 맵으로 삽입해야 합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)

:::note
`database/sql` API를 사용할 때 맵 값은 엄격하게 타입을 지정해야 합니다. 값 타입으로 `interface{}`는 사용할 수 없습니다. 예를 들어 `Map(String,String)` 필드에는 `map[string]interface{}`를 전달할 수 없고, 대신 `map[string]string`을 사용해야 합니다. 반면 `interface{}` 타입 변수는 항상 호환되므로 더 복잡한 구조에 사용할 수 있습니다.

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)
:::

### Tuples \{#tuples\}

Tuple은 임의 길이의 컬럼 그룹을 나타냅니다. 컬럼은 이름을 명시적으로 지정할 수도 있고, 타입만 지정할 수도 있습니다. 예:

```sql
//unnamed
Col1 Tuple(String, Int64)

//named
Col2 Tuple(name String, id Int64, age uint8)
```

이러한 방식 중에서는 named tuple이 더 유연합니다. 이름 없는 Tuple은 슬라이스를 사용해 삽입하고 읽어야 하지만, named tuple은 맵과도 호환됩니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

참고: 타입이 지정된 슬라이스와 맵은 지원됩니다. 단, named tuple의 하위 컬럼은 모두 동일한 타입이어야 합니다.

### Nested \{#nested\}

Nested 필드는 named tuple의 Array와 동일합니다. 사용 방식은 사용자가 [flatten&#95;nested](/operations/settings/settings#flatten_nested)를 1로 설정했는지 0으로 설정했는지에 따라 달라집니다.

flatten&#95;nested를 0으로 설정하면 Nested 컬럼은 하나의 tuple 배열로 유지됩니다. 이렇게 하면 맵의 슬라이스를 사용해 값을 삽입하고 조회할 수 있으며, 임의 수준의 중첩도 사용할 수 있습니다. 아래 예시와 같이 맵의 키는 컬럼 이름과 같아야 합니다.

참고: 맵은 tuple을 나타내므로 `map[string]interface{}` 타입이어야 합니다. 현재 값의 타입은 엄격하게 지정되지 않습니다.

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

[전체 예시 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

`flatten_nested`의 기본값인 1을 사용하면 중첩 컬럼이 각각의 배열로 평탄화됩니다. 이 경우 삽입 및 조회 시 중첩 슬라이스를 사용해야 합니다. 임의 수준의 중첩도 동작할 수 있지만, 공식적으로 지원되지는 않습니다.

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

[전체 예시 - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

참고: Nested 컬럼은 동일한 차원을 가져야 합니다. 예를 들어, 위 예시에서 `Col_2_2`와 `Col_2_1`은 요소 수가 같아야 합니다.

인터페이스가 더 단순하고 중첩에 대한 공식 지원도 제공되므로 `flatten_nested=0`을 권장합니다.

### Geo 타입 \{#geo-types\}

클라이언트는 Point, Ring, LineString, Polygon, MultiPolygon, MultiLineString Geo 타입을 지원합니다. 이러한 타입은 Go에서 [github.com/paulmach/orb](https://github.com/paulmach/orb) 패키지를 사용해 표현합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)

### UUID \{#uuid\}

UUID 타입은 [github.com/google/uuid](https://github.com/google/uuid) 패키지에서 지원됩니다. UUID는 문자열이나 `sql.Scanner` 또는 `Stringify`를 구현하는 모든 타입으로도 전송하고 마샬링할 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/uuid.go)

### Decimal \{#decimal\}

Go에는 내장 Decimal 타입이 없으므로, 원래 쿼리를 수정하지 않고 Decimal 타입을 네이티브하게 처리하려면 서드파티 패키지 [github.com/shopspring/decimal](https://github.com/shopspring/decimal)을 사용하는 것이 좋습니다.

:::note
서드파티 의존성을 피하기 위해 Float를 대신 사용하고 싶을 수 있습니다. 하지만 정확한 값이 필요한 경우 [ClickHouse에서 Float 타입은 권장되지 않는다](https://clickhouse.com/docs/sql-reference/data-types/float)는 점에 유의하십시오.

그래도 클라이언트 측에서 Go의 내장 Float 타입을 사용하기로 했다면, ClickHouse 쿼리에서 [toFloat64() 함수](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64) 또는 [그 변형 함수](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64OrZero)를 사용해 Decimal을 Float로 명시적으로 변환해야 합니다. 이 변환으로 인해 정밀도가 손실될 수 있다는 점에 유의하십시오.
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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)

### 널 허용 \{#nullable\}

Go의 `Nil` 값은 ClickHouse의 NULL을 나타냅니다. 필드가 널 허용으로 선언된 경우 이를 사용할 수 있습니다. 삽입 시점에는 컬럼의 일반 버전과 널 허용 버전 모두에 `Nil`을 전달할 수 있습니다. 일반 버전의 경우 타입의 기본값이 저장됩니다. 예를 들어 string에는 빈 문자열이 저장됩니다. 널 허용 버전의 경우 ClickHouse에 NULL 값이 저장됩니다.

스캔 시에는 널 허용 필드의 nil 값을 표현하기 위해 nil을 지원하는 타입의 포인터(예: `*string`)를 전달해야 합니다. 아래 예시에서 널 허용(String)인 col1은 따라서 `**string`을 받습니다. 이렇게 하면 nil을 표현할 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

클라이언트는 `sql.NullInt64`와 같은 `sql.Null*` 타입도 추가로 지원합니다. 이러한 타입은 대응되는 ClickHouse 타입과 호환됩니다.

### 큰 정수 \{#big-ints\}

64비트보다 큰 숫자 타입은 Go의 네이티브 [big](https://pkg.go.dev/math/big) 패키지를 사용해 표현합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)

### BFloat16 \{#bfloat16\}

`BFloat16`은 머신 러닝 워크로드에 사용되는 16비트 브레인 플로트 타입입니다. Go에서는 `BFloat16` 값이 `float32`로 삽입 및 스캔됩니다. 널 허용 변형에는 `sql.NullFloat64`를 사용합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bfloat16.go)

### QBit \{#qbit\}

`QBit`은 벡터 유사도 검색에 최적화된 비트 슬라이스 형식으로 벡터 임베딩을 저장하는 실험적 컬럼 타입입니다. 사용하려면 `allow_experimental_qbit_type` 설정을 활성화해야 합니다.

Go에서는 `QBit(Float32, N)` 컬럼을 `[]float32`로 삽입하고 스캔하며, 여기서 N은 벡터 차원입니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/qbit.go)
