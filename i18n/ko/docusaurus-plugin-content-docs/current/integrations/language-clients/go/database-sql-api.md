---
sidebar_label: '데이터베이스/SQL API'
sidebar_position: 4
keywords: ['clickhouse', 'go', 'golang', 'database', 'sql', 'standard']
description: 'clickhouse-go와 함께 database/sql 표준 인터페이스를 사용하는 방법입니다.'
slug: /integrations/language-clients/go/database-sql-api
title: '데이터베이스/SQL API'
doc_type: 'reference'
---

# 데이터베이스/SQL API \{#database-sql-api\}

표준 API의 전체 코드 예시는 [여기](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)에서 확인할 수 있습니다.

연결 구성은 [구성](/integrations/language-clients/go/configuration)을 참조하십시오.
지원되는 데이터 타입 및 Go 타입 매핑은 [데이터 타입](/integrations/language-clients/go/data-types)을 참조하십시오.

`database/sql` 또는 &quot;표준&quot; API를 사용하면 표준 인터페이스를 준수하여 기본 데이터베이스에 구애받지 않도록 작성된 애플리케이션 코드에서도 클라이언트를 사용할 수 있습니다. 다만 이에 따른 대가가 있습니다. ClickHouse와 반드시 잘 맞지는 않는 추가 추상화 계층, 간접 계층, 기본 구성 요소를 감수해야 합니다. 그러나 여러 데이터베이스에 연결해야 하는 도구가 필요한 경우에는 이러한 비용이 일반적으로 수용 가능한 수준입니다.

또한 이 클라이언트는 전송 계층으로 HTTP를 사용하는 것도 지원합니다. 이 경우에도 최적의 성능을 위해 데이터는 계속 네이티브 형식으로 인코딩됩니다.

## 연결 \{#connecting\}

연결은 `clickhouse://<host>:<port>?<query_option>=<value>` 형식의 DSN 문자열과 `Open` 메서드를 사용하거나 `clickhouse.OpenDB` 메서드를 통해 설정할 수 있습니다. 후자는 `database/sql` 사양의 일부는 아니지만 `sql.DB` 인스턴스를 반환합니다. 이 메서드는 프로파일링과 같은 기능을 제공하며, 이러한 기능은 `database/sql` 사양만으로는 명확하게 노출하기 어렵습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect.go)

**이후의 모든 예시에서는 명시적으로 표시하지 않는 한, ClickHouse `conn` 변수가 이미 생성되어 사용 가능한 상태라고 가정합니다.**

### 연결 설정 \{#connection-settings\}

대부분의 구성 옵션은 ClickHouse API와 공유됩니다. 공통 설정은 [구성](/integrations/language-clients/go/configuration)을 참조하십시오. 다음과 같은 SQL 전용 DSN 매개변수를 사용할 수 있습니다.

* `hosts` - 부하 분산 및 장애 조치를 위한 단일 주소 host 목록으로, 쉼표로 구분합니다. [여러 노드에 연결](/integrations/language-clients/go/configuration#connecting-to-multiple-nodes)을 참조하십시오.
* `username/password` - 인증 자격 증명 - [인증](/integrations/language-clients/go/configuration#authentication)을 참조하십시오.
* `database` - 현재 기본 데이터베이스를 선택합니다.
* `dial_timeout` - 기간 문자열은 부호가 있을 수도 있는 10진수 숫자의 연속으로, 각 숫자에는 선택적 소수 부분과 `300ms`, `1s` 같은 단위 suffix를 붙일 수 있습니다. 유효한 시간 단위는 `ms`, `s`, `m`입니다.
* `connection_open_strategy` - `random/in_order` (기본값 `random`) - [여러 노드에 연결](/integrations/language-clients/go/configuration#connecting-to-multiple-nodes)을 참조하십시오.
  * `round_robin` - Set에서 round-robin 방식으로 서버를 선택합니다.
  * `in_order` - 지정된 순서대로 먼저 사용 가능한 서버를 선택합니다.
* `debug` - 디버그 출력을 활성화합니다(boolean 값).
* `compress` - 압축 알고리즘을 지정합니다 - `none` (기본값), `zstd`, `lz4`, `gzip`, `deflate`, `br`. `true`로 설정하면 `lz4`를 사용합니다. 네이티브 통신에서는 `lz4`와 `zstd`만 지원됩니다.
* `compress_level` - 압축 수준입니다(기본값은 `0`). 압축을 참조하십시오. 이 값은 알고리즘에 따라 다릅니다.
  * `gzip` - `-2` (최고 속도) ~ `9` (최고 압축)
  * `deflate` - `-2` (최고 속도) ~ `9` (최고 압축)
  * `br` - `0` (최고 속도) ~ `11` (최고 압축)
  * `zstd`, `lz4` - 무시됩니다.
* `secure` - 보안 SSL 연결을 설정합니다(기본값은 `false`).
* `skip_verify` - 인증서 검증을 건너뜁니다(기본값은 `false`).
* `block_buffer_size` - 블록 버퍼 크기를 제어할 수 있습니다. [`BlockBufferSize`](/integrations/language-clients/go/configuration#connection-settings)를 참조하십시오. (기본값은 `2`)

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)

### HTTP를 통한 연결 \{#connecting-over-http\}

기본적으로 연결은 네이티브 프로토콜을 통해 이루어집니다. HTTP가 필요한 경우, DSN에 HTTP 프로토콜을 포함하도록 수정하거나 연결 옵션에서 Protocol을 지정하여 HTTP를 활성화할 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)

### 세션 \{#sessions\}

:::note HTTP 전용
세션은 HTTP 전송을 사용할 때만 필요합니다. 네이티브 TCP 연결은 세션이 자동으로 내장되어 있습니다.
:::

HTTP를 사용할 때는 임시 테이블(temporary table)과 같은 세션 기반 기능을 사용하려면 설정으로 `session_id`를 전달하십시오.

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
배치, err := scope.Prepare("INSERT INTO example")
if err != nil {
    return err
}
for i := 0; i < 10; i++ {
    _, err := 배치.Exec(
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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

## 실행 \{#execution\}

연결이 설정되면 Exec 메서드를 통해 `sql` 문을 실행할 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/exec.go)

이 메서드는 컨텍스트를 전달받는 기능을 지원하지 않으며, 기본적으로 background 컨텍스트에서 실행됩니다. 필요하면 `ExecContext`를 사용하십시오. 자세한 내용은 [컨텍스트 사용](#using-context)을 참조하십시오.

## 배치 삽입 \{#batch-insert\}

배치 semantics는 `Being` 메서드로 `sql.Tx`를 생성하여 구현할 수 있습니다. 여기에서 `INSERT` statement와 함께 `Prepare` 메서드를 사용하면 배치를 얻을 수 있습니다. 그러면 `Exec` 메서드로 행을 추가할 수 있는 `sql.Stmt`가 반환됩니다. 배치는 원래 `sql.Tx`에서 `Commit`이 실행될 때까지 메모리에 누적됩니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)

## 행 조회 \{#querying-rows\}

단일 행은 `QueryRow` 메서드를 사용하여 조회할 수 있습니다. 이 메서드는 *sql.Row를 반환하며, 여기에 Scan을 호출할 때 컬럼 값이 저장될 변수의 포인터를 전달합니다. `QueryRowContext` 변형을 사용하면 background가 아닌 다른 컨텍스트를 전달할 수 있습니다. 자세한 내용은 [컨텍스트 사용](#using-context)을 참조하십시오.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_row.go)

여러 행을 순회하려면 `Query` 메서드를 사용해야 합니다. 이 메서드는 `*sql.Rows` 구조체를 반환하며, 행을 순회할 때 Next를 호출할 수 있습니다. 이에 해당하는 `QueryContext`를 사용하면 `context`를 전달할 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

## 비동기 삽입 \{#async-insert\}

비동기 삽입은 `ExecContext` 메서드를 통해 삽입을 실행하여 구현할 수 있습니다. 아래와 같이 비동기 모드가 활성화된 컨텍스트를 전달해야 합니다. 이 절을 사용하면 클라이언트가 서버에서 삽입을 완료할 때까지 대기할지, 아니면 데이터가 수신되는 즉시 응답할지를 지정할 수 있습니다. 이는 사실상 [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert) 매개변수를 제어합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)

## 매개변수 바인딩 \{#parameter-binding\}

표준 API는 [ClickHouse API](/integrations/language-clients/go/clickhouse-api#parameter-binding)와 동일한 매개변수 바인딩 기능을 지원하며, `Exec`, `Query`, `QueryRow` 메서드와 해당 [컨텍스트](#using-context) 버전에도 매개변수를 전달할 수 있습니다. 위치 기반, 이름 지정, 번호 지정 매개변수를 지원합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

참고: [특수 사례](/integrations/language-clients/go/clickhouse-api#special-cases)는 여전히 적용됩니다.

## 컨텍스트 사용 \{#using-context\}

표준 API는 [ClickHouse API](/integrations/language-clients/go/clickhouse-api#using-context)와 마찬가지로 `context`를 통해 데드라인, 취소 신호, 기타 요청 스코프 값을 전달하는 기능을 지원합니다. ClickHouse API와 달리, 여기서는 메서드의 `Context` 변형을 사용해 이를 구현합니다. 즉, 기본적으로 백그라운드 컨텍스트를 사용하는 `Exec` 같은 메서드에는 첫 번째 매개변수로 컨텍스트를 전달할 수 있는 `ExecContext` 변형이 있습니다. 이 방식을 사용하면 애플리케이션 흐름의 어느 단계에서든 컨텍스트를 전달할 수 있습니다. 예를 들어, `ConnContext`를 사용해 연결을 설정할 때나 `QueryRowContext`로 쿼리 행을 요청할 때 컨텍스트를 전달할 수 있습니다. 사용 가능한 모든 메서드의 예시는 아래에 나와 있습니다.

컨텍스트를 사용해 데드라인, 취소 신호, 쿼리 ID, quota key, 연결 settings를 전달하는 방법에 대한 자세한 내용은 ClickHouse API의 [컨텍스트 사용](/integrations/language-clients/go/clickhouse-api#using-context)를 참조하십시오.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

## 동적 스캐닝 \{#dynamic-scanning\}

[ClickHouse API](/integrations/language-clients/go/clickhouse-api#dynamic-scanning)와 마찬가지로, 컬럼 타입 정보가 제공되므로 `Scan`에 전달할 올바른 타입의 변수 인스턴스를 런타임에 생성할 수 있습니다. 이를 통해 타입을 미리 알 수 없는 컬럼도 읽을 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)

## 외부 테이블 \{#external-tables\}

[외부 테이블](/engines/table-engines/special/external-data/)을 사용하면 클라이언트가 `SELECT` 쿼리와 함께 데이터를 ClickHouse로 전송할 수 있습니다. 이 데이터는 임시 테이블에 저장되며, 쿼리 실행 시 쿼리 내에서 사용할 수 있습니다.

쿼리와 함께 외부 데이터를 전송하려면, 사용자는 `ext.NewTable`로 외부 테이블을 생성한 뒤 이를 context를 통해 전달해야 합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)

## OpenTelemetry \{#open-telemetry\}

ClickHouse는 TCP 및 HTTP 전송 모두에서 [트레이스 컨텍스트 전파](/operations/opentelemetry/)를 지원합니다. context를 통해 쿼리에 span을 연결하려면 `clickhouse.WithSpan`을 사용하세요.

:::note HTTP 전송 제한
ClickHouse 서버는 표준 `traceparent` / `tracestate` HTTP 헤더를 수신할 수 있지만, clickhouse-go의 HTTP 전송에서는 현재 이를 보내지 않으므로 HTTP에서는 `WithSpan`이 적용되지 않습니다. 우회 방법으로, 연결 옵션의 `HttpHeaders`를 통해 헤더를 수동으로 설정할 수 있습니다.
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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)

## 압축 \{#compression\}

표준 API는 네이티브 [ClickHouse API](/integrations/language-clients/go/configuration#compression)와 동일한 압축 알고리즘, 즉 블록 수준의 `lz4` 및 `zstd` 압축을 지원합니다. 또한 HTTP 연결에서는 gzip, deflate, br 압축도 지원합니다. 이들 중 하나라도 활성화하면 삽입 시 블록과 쿼리 응답에 압축이 적용됩니다. ping 또는 쿼리 요청과 같은 기타 요청은 압축되지 않은 상태로 유지됩니다. 이는 `lz4` 및 `zstd` 옵션과 일치합니다.

연결을 설정할 때 `OpenDB` 메서드를 사용하는 경우 Compression 구성을 전달할 수 있습니다. 여기에는 압축 수준을 지정하는 기능도 포함됩니다(아래 참조). DSN과 함께 `sql.Open`을 통해 연결하는 경우 `compress` 매개변수를 사용하십시오. 이는 `gzip`, `deflate`, `br`, `zstd`, `lz4`와 같은 특정 압축 알고리즘이거나 불리언 플래그일 수 있습니다. true로 설정하면 `lz4`가 사용됩니다. 기본값은 `none`, 즉 압축 비활성화입니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)

```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

적용할 압축 수준은 DSN 매개변수 `compress&#95;level` 또는 Compression 옵션의 Level 필드로 지정할 수 있습니다. 기본값은 0이지만 알고리즘에 따라 다릅니다:

* `gzip` - `-2` (최고 속도) ~ `9` (최고 압축)
* `deflate` - `-2` (최고 속도) ~ `9` (최고 압축)
* `br` - `0` (최고 속도) ~ `11` (최고 압축)
* `zstd`, `lz4` - 무시됩니다
