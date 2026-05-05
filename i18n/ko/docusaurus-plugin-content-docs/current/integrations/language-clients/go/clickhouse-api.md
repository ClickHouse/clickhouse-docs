---
sidebar_label: 'ClickHouse API'
sidebar_position: 3
keywords: ['clickhouse', 'go', 'golang', 'api', '쿼리', '삽입', '배치']
description: 'clickhouse-go로 네이티브 ClickHouse API를 사용해 쿼리 실행, 배치 삽입, 비동기 삽입 등을 수행합니다.'
slug: /integrations/language-clients/go/clickhouse-api
title: 'ClickHouse API'
doc_type: '참조'
---

# ClickHouse API \{#clickhouse-api\}

ClickHouse API의 모든 코드 예시는 [여기](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/clickhouse_api)에서 확인할 수 있습니다.

연결 구성은 [구성](/integrations/language-clients/go/configuration)을 참조하십시오.
지원되는 데이터 타입과 Go 타입 매핑은 [데이터 타입](/integrations/language-clients/go/data-types)을 참조하십시오.

## 연결 \{#connecting\}

다음 예시는 서버 버전을 반환하며, ClickHouse가 보안으로 보호되지 않고 default 사용자로 접근 가능하다고 가정했을 때 ClickHouse에 연결하는 방법을 보여줍니다.

연결에는 기본 네이티브 포트를 사용합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect.go)

**다음의 모든 예시에서는, 별도로 명시하지 않는 한 ClickHouse `conn` 변수가 이미 생성되어 사용 가능하다고 가정합니다.**

## 실행 \{#execution\}

`Exec` 메서드를 통해 임의의 SQL 문을 실행할 수 있습니다. 이는 DDL 및 단순한 SQL 문에 유용합니다. 대량 삽입이나 쿼리 반복 처리에는 사용하지 마십시오.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/exec.go)

쿼리에 Context를 전달할 수 있습니다. 이를 사용해 쿼리별 설정을 전달할 수 있습니다. 자세한 내용은 [Context 사용](#using-context)을 참조하십시오.

## 배치 삽입 \{#batch-insert\}

많은 수의 행을 삽입하려면 클라이언트는 배치 처리를 지원합니다. 이를 위해 행을 추가할 수 있는 배치를 준비해야 합니다. 마지막으로 `Send()` 메서드를 통해 이를 전송합니다. 배치는 `Send`가 호출될 때까지 메모리에 유지됩니다.

연결 누수를 방지하려면 배치에 `Close`를 호출하는 것이 좋습니다. 이는 배치를 준비한 직후 `defer` 키워드를 사용해 처리할 수 있습니다. 이렇게 하면 `Send`가 호출되지 않더라도 연결이 정리됩니다. 단, 행이 하나도 추가되지 않은 경우 쿼리 로그에는 0개 행이 삽입된 것으로 표시됩니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

ClickHouse에 대한 권장 사항은 [여기](/guides/inserting-data#best-practices-for-inserts)에도 적용됩니다. 배치는 goroutine 간에 공유해서는 안 되며, 각 루틴마다 별도의 배치를 생성해야 합니다.

위 예시에서 알 수 있듯이, 행을 추가할 때는 변수 타입이 컬럼 타입과 일치해야 합니다. 매핑은 대체로 명확하지만, 이 인터페이스는 유연하게 동작하도록 설계되어 있어 정밀도 손실이 없는 경우 타입 변환이 수행됩니다. 예를 들어, 다음은 datetime64에 string을 삽입하는 예를 보여줍니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)

각 컬럼 타입에서 지원되는 Go 타입의 전체 요약은 [타입 변환](/integrations/language-clients/go/data-types#type-conversions)을 참조하십시오.

## 임시 컬럼 \{#ephemeral-columns\}

[임시 컬럼](https://clickhouse.com/docs/sql-reference/statements/create/table#ephemeral)은 삽입 중에만 존재하는 쓰기 전용 컬럼입니다. 저장되지 않으며 조회할 수 없습니다. 삽입 시점에 파생 컬럼 값을 계산하는 데 유용합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ephemeral_native.go)

## 행 쿼리하기 \{#querying-rows\}

`QueryRow` 메서드를 사용해 단일 행을 쿼리하거나, `Query`를 통해 결과 집합을 순회하기 위한 커서를 가져올 수 있습니다. 전자는 데이터를 직렬화해 저장할 대상을 받는 반면, 후자는 각 행에서 `Scan`을 호출해야 합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_row.go)

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_rows.go)

두 경우 모두, 각 컬럼 값을 저장할 변수의 포인터를 전달해야 합니다. 이 포인터는 `SELECT` 문에 지정된 순서대로 전달해야 합니다. 위에 표시된 것처럼 `SELECT *`를 사용하는 경우에는 기본적으로 컬럼 선언 순서가 사용됩니다.

삽입과 마찬가지로, Scan 메서드에서는 대상 변수가 적절한 타입이어야 합니다. 이 역시 가능한 경우 타입 변환을 수행해 유연성을 제공하지만, 정밀도 손실이 없어야 합니다. 예를 들어, 위 예시에서는 UUID 컬럼을 string 변수로 읽어옵니다. 각 컬럼 타입에 대해 지원되는 Go 타입의 전체 목록은 [타입 변환](/integrations/language-clients/go/data-types#type-conversions)을 참조하십시오.

마지막으로, `Query` 및 `QueryRow` 메서드에 `Context`를 전달할 수 있다는 점에 유의하십시오. 이는 쿼리별 설정에 사용할 수 있습니다. 자세한 내용은 [Context 사용](#using-context)을 참조하십시오.

## 비동기 삽입 \{#async-insert\}

비동기 삽입은 Async 메서드를 통해 지원됩니다. 이 메서드를 사용하면 클라이언트가 서버에서 삽입이 완료될 때까지 대기할지, 아니면 데이터가 수신되는 즉시 응답할지를 지정할 수 있습니다. 즉, [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert) 매개변수를 제어합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)

## 열 지향 삽입 \{#columnar-insert\}

데이터는 컬럼 형식으로 삽입할 수 있습니다. 이렇게 하면 데이터를 행으로 변환할 필요가 없으므로, 데이터가 이미 이러한 구조로 되어 있는 경우 성능상 이점을 얻을 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)

## 구조체 사용하기 \{#using-structs\}

Golang 구조체는 사용자에게 ClickHouse의 데이터 행을 논리적으로 표현하는 방법을 제공합니다. 이를 위해 네이티브 인터페이스는 여러 가지 편리한 함수를 제공합니다.

### serialize를 사용한 Select \{#select-with-serialize\}

Select 메서드를 사용하면 단일 호출만으로 응답 행 집합을 구조체 슬라이스로 마샬링할 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)

### 구조체 스캔 \{#scan-struct\}

`ScanStruct`를 사용하면 쿼리 결과의 단일 행을 구조체로 마샬링할 수 있습니다.

```go
var result struct {
    Col1  int64
    Count uint64 `ch:"count"`
}
if err := conn.QueryRow(context.Background(), "SELECT Col1, COUNT() AS count FROM example WHERE Col1 = 5 GROUP BY Col1").ScanStruct(&result); err != nil {
    return err
}
```

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/scan_struct.go)

### 구조체 추가 \{#append-struct\}

`AppendStruct`를 사용하면 구조체를 기존 [배치](#batch-insert)에 추가하여 완전한 한 개의 행으로 해석할 수 있습니다. 이를 위해서는 구조체의 컬럼이 이름과 타입 모두 테이블과 일치해야 합니다. 모든 컬럼에는 이에 해당하는 구조체 필드가 있어야 하지만, 일부 구조체 필드에는 대응되는 컬럼이 없을 수 있습니다. 이러한 필드는 단순히 무시됩니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)

## 매개변수 바인딩 \{#parameter-binding\}

클라이언트는 `Exec`, `Query`, `QueryRow` 메서드에서 매개변수 바인딩을 지원합니다. 아래 예시와 같이 이름 지정 매개변수, 번호 지정 매개변수, 위치 기반 매개변수를 사용할 수 있습니다. 각각의 예시는 아래에 나와 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)

### 특수한 경우 \{#special-cases\}

기본적으로 슬라이스가 쿼리 매개변수로 전달되면 쉼표로 구분된 값 목록으로 펼쳐집니다. `[ ]`로 감싼 값 집합을 주입해야 한다면 `ArraySet`을 사용해야 합니다.

그룹/Tuple이 필요하고, 예를 들어 IN 오퍼레이터와 함께 사용하기 위해 `( )`로 감싸야 한다면 `GroupSet`을 사용할 수 있습니다. 이는 아래 예시와 같이 여러 그룹이 필요한 경우 특히 유용합니다.

마지막으로, DateTime64 필드는 매개변수가 올바르게 렌더링되도록 정밀도 지정이 필요합니다. 하지만 필드의 정밀도 수준은 클라이언트가 알 수 없으므로 사용자가 직접 제공해야 합니다. 이를 위해 `DateNamed` 매개변수를 제공합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

## context 사용 \{#using-context\}

Go의 context는 기한, 취소 신호, 그 밖의 요청 스코프 값을 API 경계를 넘어 전달하는 수단을 제공합니다. 연결의 모든 메서드는 첫 번째 인수로 context를 받습니다. 이전 예시에서는 `context.Background()`를 사용했지만, 이 기능을 사용하면 설정과 기한을 전달하고 쿼리를 취소할 수 있습니다.

`withDeadline`으로 생성한 context를 전달하면 쿼리에 실행 시간 제한을 둘 수 있습니다. 이는 절대 시간을 기준으로 하며, 만료되더라도 연결만 해제되고 ClickHouse에는 취소 신호만 전송된다는 점에 유의하십시오. 또는 `WithCancel`을 사용하여 쿼리를 명시적으로 취소할 수도 있습니다.

도우미 함수 `clickhouse.WithQueryID`와 `clickhouse.WithQuotaKey`를 사용하면 쿼리 ID와 quota key를 지정할 수 있습니다. 쿼리 ID는 로그에서 쿼리를 추적하거나 취소할 때 유용할 수 있습니다. quota key는 고유한 key 값을 기준으로 ClickHouse 사용량에 제한을 적용하는 데 사용할 수 있습니다. 자세한 내용은 [Quotas Management](/operations/access-rights#quotas-management)를 참조하십시오.

또한 context를 사용하면 [Connection Settings](/integrations/language-clients/go/configuration#connection-settings)에 설명된 것처럼 전체 연결이 아니라 특정 쿼리에만 설정이 적용되도록 할 수 있습니다.

마지막으로 `clickhouse.WithBlockSize`를 통해 블록 버퍼의 크기를 제어할 수 있습니다. 이 값은 연결 수준 설정인 `BlockBufferSize`를 재정의하며, 특정 시점에 디코딩되어 메모리에 유지되는 최대 블록 수를 제어합니다. 값이 클수록 메모리 사용량이 늘어나는 대신 병렬성이 높아질 수 있습니다.

위 내용의 예시는 아래에 나와 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)

## 진행률, 프로필 및 로그 정보 \{#progress-profile-log\}

쿼리에 대해 진행률, 프로필, 로그 정보를 요청할 수 있습니다. 진행률 정보는 ClickHouse에서 읽고 처리한 행 수와 바이트 수에 대한 통계를 제공합니다. 한편, 프로필 정보는 클라이언트에 반환된 데이터의 요약을 제공하며, 여기에는 비압축 바이트 수, 행 수, 블록 수의 총계가 포함됩니다. 마지막으로, 로그 정보는 스레드 관련 통계(예: 메모리 사용량 및 데이터 속도)를 제공합니다.

이 정보를 얻으려면 [Context](#using-context)를 사용해야 하며, 여기에 콜백 함수를 전달할 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)

## 동적 스캐닝 \{#dynamic-scanning\}

반환되는 필드의 schema 또는 타입을 알 수 없는 테이블을 읽어야 하는 경우가 있을 수 있습니다. 이는 애드혹 데이터 분석을 수행하거나 범용 도구를 작성할 때 흔히 발생합니다. 이를 위해 쿼리 응답에서 컬럼 타입 정보를 확인할 수 있습니다. 이 정보는 Go reflection과 함께 사용하여 올바른 타입의 변수에 대한 런타임 인스턴스를 생성하고, 이를 Scan에 전달하는 데 사용할 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)

## 외부 테이블 \{#external-tables\}

[외부 테이블(External Table)](/engines/table-engines/special/external-data/)을 사용하면 클라이언트가 SELECT 쿼리와 함께 데이터를 ClickHouse로 전송할 수 있습니다. 이 데이터는 임시 테이블(Temporary Table)에 저장되며, 쿼리 실행 시 쿼리 내에서 사용할 수 있습니다.

쿼리와 함께 외부 데이터를 클라이언트로 전송하려면, 먼저 `ext.NewTable`로 외부 테이블을 생성한 다음 context를 통해 전달해야 합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)

## Open telemetry \{#open-telemetry\}

ClickHouse는 TCP 및 HTTP 전송 모두에서 [트레이스 컨텍스트 전파](/operations/opentelemetry/)를 지원합니다. TCP를 사용할 경우 클라이언트는 span을 네이티브 바이너리 프로토콜로 직렬화합니다. 컨텍스트를 통해 쿼리에 span을 연결하려면 `clickhouse.WithSpan`을 사용하세요.

:::note HTTP 전송 제한
ClickHouse 서버는 표준 `traceparent` / `tracestate` HTTP 헤더를 수신하지만, clickhouse-go의 HTTP 전송은 현재 이를 전송하지 않으므로 HTTP에서는 `WithSpan`이 적용되지 않습니다. 우회 방법으로 연결 옵션의 `HttpHeaders`를 사용해 헤더를 수동으로 설정할 수 있습니다.
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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

트레이싱 활용에 대한 자세한 내용은 [OpenTelemetry 지원](/operations/opentelemetry/)을 참고하십시오.
