---
sidebar_label: 'データベース/SQL API'
sidebar_position: 4
keywords: ['clickhouse', 'go', 'golang', 'database', 'sql', 'standard']
description: 'clickhouse-go で database/sql の標準インターフェースを使う。'
slug: /integrations/language-clients/go/database-sql-api
title: 'データベース/SQL API'
doc_type: 'reference'
---

# データベース/SQL API \{#database-sql-api\}

標準APIの完全なコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)で確認できます。

接続設定については、[設定](/integrations/language-clients/go/configuration)を参照してください。
サポートされるデータ型とGoの型マッピングについては、[データ型](/integrations/language-clients/go/data-types)を参照してください。

`database/sql`、つまり「標準」APIを使うと、標準インターフェースに準拠することで、アプリケーションコードが基盤となるデータベースを意識しないようにする必要がある場面でも、このクライアントを使用できます。ただし、その代償として、抽象化や間接参照のための追加レイヤーや、必ずしもClickHouseに適していないプリミティブが入ることになります。とはいえ、ツールが複数のデータベースに接続する必要がある場面では、こうしたコストは通常許容範囲です。

さらに、このクライアントはトランスポート層としてHTTPの使用もサポートしており、最適なパフォーマンスを得るために、データは引き続きネイティブ形式でエンコードされます。

## 接続 \{#connecting\}

接続には、`clickhouse://<host>:<port>?<query_option>=<value>` 形式のDSN文字列と `Open` メソッドを使う方法、または `clickhouse.OpenDB` メソッドを使う方法があります。後者は `database/sql` 仕様の一部ではありませんが、`sql.DB` インスタンスを返します。このメソッドでは、プロファイリングなど、`database/sql` 仕様経由では明確に公開できない機能を利用できます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect.go)

**以降のすべての例では、明示的に示す場合を除き、ClickHouse の `conn` 変数は作成済みで使用可能であるものとします。**

### 接続設定 \{#connection-settings\}

ほとんどの設定オプションは ClickHouse API と共通です。共通の設定については [設定](/integrations/language-clients/go/configuration) を参照してください。以下の SQL 固有の DSN パラメータを利用できます。

* `hosts` - ロードバランシングおよびフェイルオーバーのための、単一アドレス host のカンマ区切りリスト - [Connecting to Multiple Nodes](/integrations/language-clients/go/configuration#connecting-to-multiple-nodes) を参照してください。
* `username/password` - 認証情報 - [Authentication](/integrations/language-clients/go/configuration#authentication) を参照してください
* `database` - 現在のデフォルトデータベースを選択します
* `dial_timeout` - 期間を表す文字列です。符号付きの場合もある 10 進数の並びで、各数値には省略可能な小数部と、`300ms`、`1s` のような単位サフィックスを付けられます。有効な時間単位は `ms`、`s`、`m` です。
* `connection_open_strategy` - `random/in_order` (デフォルトは `random`)  - [Connecting to Multiple Nodes](/integrations/language-clients/go/configuration#connecting-to-multiple-nodes) を参照してください
  * `round_robin` - 一連のサーバーからラウンドロビン方式でサーバーを選択します
  * `in_order` - 指定された順序で最初に利用可能なサーバーを選択します
* `debug` - デバッグ出力を有効にします (真偽値)
* `compress` - 圧縮アルゴリズムを指定します - `none` (デフォルト) 、`zstd`、`lz4`、`gzip`、`deflate`、`br`。`true` に設定した場合は `lz4` が使われます。native 通信でサポートされるのは `lz4` と `zstd` のみです。
* `compress_level` - 圧縮レベル (デフォルトは `0`) です。Compression を参照してください。これはアルゴリズムごとに異なります。
  * `gzip` - `-2` (最高速度) から `9` (最高圧縮率)
  * `deflate` - `-2` (最高速度) から `9` (最高圧縮率)
  * `br` - `0` (最高速度) から `11` (最高圧縮率)
  * `zstd`、`lz4` - 無視されます
* `secure` - セキュアな SSL 接続を確立します (デフォルトは `false`)
* `skip_verify` - 証明書の検証をスキップします (デフォルトは `false`)
* `block_buffer_size` - block バッファサイズを制御できます。[`BlockBufferSize`](/integrations/language-clients/go/configuration#connection-settings) を参照してください。 (デフォルトは `2`)

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)

### HTTP で接続する \{#connecting-over-http\}

デフォルトでは、接続はネイティブプロトコルで確立されます。HTTP が必要なユーザーは、DSN を変更して HTTP プロトコルを含めるか、接続オプションで Protocol を指定することで有効化できます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)

### セッション \{#sessions\}

:::note HTTP のみ
セッションが必要なのは、HTTP トランスポートを使用する場合のみです。ネイティブ TCP 接続では、セッションが自動的に組み込まれています。
:::

HTTP を使用する場合は、`session_id` を設定として渡し、一時テーブルなどのセッションに紐づく機能を有効にします。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

## 実行 \{#execution\}

接続を確立したら、Exec メソッドを使用して `sql` 文を実行できます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/exec.go)

このメソッドはContextの受け取りをサポートしていません。デフォルトでは、バックグラウンドContextで実行されます。必要な場合は`ExecContext`を使用してください。詳しくは[Contextの使用](#using-context)を参照してください。

## バッチ insert \{#batch-insert\}

`Being` メソッドで `sql.Tx` を作成することで、バッチ処理を実現できます。ここから、`INSERT` 文 を指定して `Prepare` メソッドを使用すると、batch を取得できます。これにより `sql.Stmt` が返され、`Exec` メソッドを使ってそこに行を付加できます。batch は、元の `sql.Tx` に対して `Commit` が executed されるまでメモリ内に蓄積されます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)

## 行のクエリ \{#querying-rows\}

単一の行をクエリするには、`QueryRow` メソッドを使用します。これは `*sql.Row` を返し、このオブジェクトに対して Scan を呼び出す際に、各カラムの値を格納する変数へのポインタを渡します。`QueryRowContext` バリアントでは、background 以外の Context を渡すことができます。[Context の使用](#using-context) を参照してください。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_row.go)

複数の行を反復処理するには、`Query` メソッドを使います。これは `*sql.Rows` 構造体を返し、`Next` を呼び出して各行を順に処理できます。対応する `QueryContext` では、Context を渡すことができます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

## Async insert \{#async-insert\}

非同期 insert は、`ExecContext` メソッドで insert を実行することで実現できます。以下に示すように、非同期モードを有効にした Context を渡す必要があります。これにより、クライアントがサーバーによる insert の完了を待機するか、それともデータが受信された時点で応答するかをユーザーが指定できます。これは実質的に、パラメータ [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert) を制御します。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)

## パラメータバインディング \{#parameter-binding\}

標準APIは、[ClickHouse API](/integrations/language-clients/go/clickhouse-api#parameter-binding)と同じパラメータバインディング機能をサポートしており、`Exec`、`Query`、`QueryRow` メソッド (および対応する [Context](#using-context) 版) にパラメータを渡せます。位置指定、名前付き、番号付きのパラメータをサポートしています。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

なお、[特別なケース](/integrations/language-clients/go/clickhouse-api#special-cases)に関する注意事項は、引き続き適用されます。

## Context の使用 \{#using-context\}

標準 API では、[ClickHouse API](/integrations/language-clients/go/clickhouse-api#using-context) と同様に、Context を介して期限、キャンセルシグナル、そのほかのリクエストスコープの値を渡すことができます。ClickHouse API と異なり、これはメソッドの `Context` バリアントを使って実現します。つまり、デフォルトではバックグラウンド Context を使用する `Exec` のようなメソッドには、先頭のパラメータとして Context を渡せる `ExecContext` というバリアントがあります。これにより、アプリケーションフローの任意のステージで Context を渡せます。たとえば、`ConnContext` を使って接続を確立する際や、`QueryRowContext` を使ってクエリ結果の行を取得する際に Context を渡せます。使用可能なすべてのメソッドの例を以下に示します。

Context を使って期限、キャンセルシグナル、クエリ ID、QUOTA キー、接続設定を渡す方法の詳細については、ClickHouse API の [Context の使用](/integrations/language-clients/go/clickhouse-api#using-context) を参照してください。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

## 動的スキャン \{#dynamic-scanning\}

[ClickHouse API](/integrations/language-clients/go/clickhouse-api#dynamic-scanning) と同様に、カラム型の情報を利用して、Scan に渡せる適切な型の変数インスタンスを実行時に作成できます。これにより、型が不明なカラムでも読み取ることができます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)

## 外部テーブル \{#external-tables\}

[外部テーブル](/engines/table-engines/special/external-data/)を使うと、クライアントは`SELECT`クエリとともに ClickHouse にデータを送信できます。このデータは一時テーブルに格納され、評価のためにクエリ内で使用できます。

クエリとともにクライアントから外部データを送信するには、ユーザーは `ext.NewTable` を使って外部テーブルを作成し、これを Context 経由で渡す前に構築する必要があります。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)

## OpenTelemetry \{#open-telemetry\}

ClickHouse は、TCP と HTTP の両方のトランスポートで [トレースコンテキスト伝播](/operations/opentelemetry/) をサポートしています。`clickhouse.WithSpan` を使うと、Context 経由でスパンをクエリに関連付けることができます。

:::note HTTP トランスポートの制限
ClickHouse サーバーは標準の `traceparent` / `tracestate` HTTP ヘッダーを受け入れますが、clickhouse-go の HTTP トランスポートは現時点ではそれらを送信しないため、HTTP 経由では `WithSpan` は効果がありません。回避策として、接続オプションの `HttpHeaders` を使ってヘッダーを手動で設定できます。
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)

## 圧縮 \{#compression\}

標準 API は、ネイティブの [ClickHouse API](/integrations/language-clients/go/configuration#compression) と同じ圧縮アルゴリズム、つまりブロックレベルの `lz4` および `zstd` 圧縮をサポートします。これに加えて、HTTP 接続では `gzip`、`deflate`、`br` による圧縮もサポートされます。これらのいずれかが有効な場合、挿入時およびクエリ応答ではブロック単位で圧縮が行われます。一方、ping やクエリリクエストなどのその他のリクエストは圧縮されません。これは `lz4` および `zstd` のオプションと同様です。

接続の確立に `OpenDB` メソッドを使う場合は、Compression 設定を渡すことができます。これには、圧縮レベルを指定する機能も含まれます (以下を参照) 。DSN を使用して `sql.Open` 経由で接続する場合は、`compress` パラメータを使います。指定できる値は、`gzip`、`deflate`、`br`、`zstd`、`lz4` などの特定の圧縮アルゴリズム、またはブールフラグです。true に設定する と、`lz4` が使用されます。デフォルト は `none`、つまり圧縮は無効です。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)

```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

適用する圧縮レベルは、DSN パラメータ `compress&#95;level` または Compression オプションの Level フィールドで制御できます。デフォルトは `0` ですが、アルゴリズムによって異なります。

* `gzip` - `-2` (最高速度) ～ `9` (最高圧縮率)
* `deflate` - `-2` (最高速度) ～ `9` (最高圧縮率)
* `br` - `0` (最高速度) ～ `11` (最高圧縮率)
* `zstd`, `lz4` - 無視されます
