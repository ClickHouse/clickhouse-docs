---
sidebar_label: 'ClickHouse API'
sidebar_position: 3
keywords: ['clickhouse', 'go', 'golang', 'api', 'クエリ', 'insert', 'バッチ']
description: 'clickhouse-go を使用したネイティブ ClickHouse API の利用: クエリの実行、バッチinsert、非同期insert など。'
slug: /integrations/language-clients/go/clickhouse-api
title: 'ClickHouse API'
doc_type: 'reference'
---

# ClickHouse API \{#clickhouse-api\}

ClickHouse API のコード例はすべて、[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/clickhouse_api)にあります。

接続設定については、[設定](/integrations/language-clients/go/configuration)を参照してください。
サポートされているデータ型と Go の型マッピングについては、[データ型](/integrations/language-clients/go/data-types)を参照してください。

## 接続 \{#connecting\}

次の例では、サーバーのバージョンを返すことで、ClickHouse への接続方法を示します。ここでは、ClickHouse が保護されておらず、デフォルトユーザーでアクセスできることを前提としています。

接続にはデフォルトの native ポートを使用します。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect.go)

**以降のすべての例では、明示的に示していない限り、ClickHouse の `conn` 変数は作成済みで使用可能であるものとします。**

## 実行 \{#execution\}

任意の文は、`Exec` メソッドを使用して実行できます。これは、DDL やシンプルな文の実行に適しています。大規模な insert やクエリの反復処理には使用しないでください。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/exec.go)

クエリに Context を渡せる点に注意してください。これにより、クエリレベルの特定の設定を渡せます。詳しくは [Context の使用](#using-context) を参照してください。

## バッチinsert \{#batch-insert\}

大量の行を insert する場合、クライアントはバッチ処理の仕組みを提供しています。そのためには、行を付加できるバッチをあらかじめ準備する必要があります。最後に、それを `Send()` メソッドで送信します。バッチは `Send` が実行されるまでメモリ上に保持されます。

接続リークを防ぐため、バッチに対して `Close` を呼び出すことを推奨します。これは、バッチの準備後に `defer` キーワードを使って行えます。これにより、`Send` が一度も呼び出されなかった場合でも接続がクリーンアップされます。なお、行が1つも付加されなかった場合、クエリログには 0 行の insert として記録されます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

ClickHouse の推奨事項は[こちら](/guides/inserting-data#best-practices-for-inserts)にも当てはまります。バッチを go-routine 間で共有しないでください。go-routine ごとに別々のバッチを作成してください。

上記の例からわかるように、行を追加する際は、変数の型をカラム型に合わせる必要があります。通常、この対応は明らかですが、このインターフェースは柔軟性を持たせているため、精度が失われない限り型変換が行われます。たとえば、以下は datetime64 に文字列を insert する例です。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)

各カラム型でサポートされる Go の型の一覧は、[型変換](/integrations/language-clients/go/data-types#type-conversions)を参照してください。

## 一時的なカラム \{#ephemeral-columns\}

[一時的なカラム](https://clickhouse.com/docs/sql-reference/statements/create/table#ephemeral)は、挿入時にのみ存在する書き込み専用のカラムです。保存されず、SELECTで取得することもできません。挿入時に派生カラムの値を計算する場合に便利です。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ephemeral_native.go)

## 行のクエリ \{#querying-rows\}

単一の行をクエリするには `QueryRow` メソッドを使用するか、`Query` で結果セットを反復処理するためのカーソルを取得できます。前者はデータのシリアル化先となる宛先を受け取りますが、後者では各行に対して `Scan` を呼び出す必要があります。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_row.go)

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_rows.go)

どちらの場合も、それぞれのカラム値を格納する変数にはポインタを渡す必要がある点に注意してください。これらは `SELECT` 文 で指定した順序で渡す必要があります。上記のように `SELECT *` の場合は、デフォルトではカラムの宣言順が使われます。

挿入と同様に、Scan メソッドでも対象の変数は適切な型である必要があります。ここでも可能な限り柔軟に扱えるようになっており、精度の損失が発生しない限り、可能であれば型変換が行われます。たとえば上記の例では、UUID カラムを文字列変数として読み込んでいます。各カラム型に対してサポートされる Go の型の一覧については、[型変換](/integrations/language-clients/go/data-types#type-conversions)を参照してください。

最後に、`Query` および `QueryRow` メソッドに `Context` を渡せる点にも注意してください。これはクエリレベルの設定に使用できます。詳細については、[Context の使用](#using-context)を参照してください。

## 非同期 insert \{#async-insert\}

非同期 insert は、Async メソッドでサポートされています。これにより、クライアント が server による insert の完了を待機するか、データを受信した時点で応答するかをユーザーが指定できます。これは実質的に [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert) パラメータを制御します。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)

## 列指向 insert \{#columnar-insert\}

insert はカラム format で行えます。これにより、データがすでにこの構造になっている場合は、行への変換が不要になるため、パフォーマンス上の利点が得られることがあります。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)

## 構造体の使用 \{#using-structs\}

ユーザーにとって、Go の構造体は ClickHouse のデータの1行を論理的に表現する手段です。これを支援するために、ネイティブインターフェースには便利な関数がいくつか用意されています。

### serialize を使用した Select \{#select-with-serialize\}

Select メソッドを使用すると、1 回の呼び出しでレスポンスの複数の行を構造体のスライスにマーシャリングできる。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)

### 構造体のスキャン \{#scan-struct\}

`ScanStruct` では、クエリ結果の単一の行を構造体にマーシャリングできます。

```go
var result struct {
    Col1  int64
    Count uint64 `ch:"count"`
}
if err := conn.QueryRow(context.Background(), "SELECT Col1, COUNT() AS count FROM example WHERE Col1 = 5 GROUP BY Col1").ScanStruct(&result); err != nil {
    return err
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/scan_struct.go)

### struct の追加 \{#append-struct\}

`AppendStruct` を使用すると、struct を既存の[バッチ](#batch-insert)に追加し、完全な 1 行として解釈できます。そのためには、struct のカラム名と型がテーブルと一致している必要があります。すべてのカラムに対応する struct フィールドが必要ですが、struct フィールドの中には対応するカラムが存在しないものがあっても問題ありません。それらは単に無視されます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)

## パラメータバインディング \{#parameter-binding\}

クライアント は、`Exec`、`Query`、`QueryRow` の各メソッドでパラメータバインディングをサポートしています。以下の例のとおり、名前付き、番号付き、位置指定の各パラメータを使用できます。それぞれの例を以下に示します。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)

### 特殊なケース \{#special-cases\}

デフォルトでは、スライスをクエリのパラメータとして渡すと、カンマ区切りの値のリストに展開されます。`[ ]` で囲まれた値のセットを挿入する必要がある場合は、`ArraySet` を使用してください。

グループ/タプルが必要な場合は、たとえば IN Operator で使用する `( )` 付きの形式として、`GroupSet` を使うことができます。これは、以下の例に示すように、複数のグループが必要なケースで特に有用です。

最後に、DateTime64 フィールドでは、パラメータが適切にレンダリングされるよう、精度の指定が必要です。ただし、フィールドの精度レベルはクライアント側ではわからないため、ユーザーが指定する必要があります。これを簡単にするために、`DateNamed` パラメータを提供しています。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

## Context の使用 \{#using-context\}

Go の context は、期限、キャンセルシグナル、その他のリクエストスコープの値を API 境界をまたいで受け渡すための仕組みです。接続 のすべてのメソッドは、最初の引数として context を受け取ります。これまでの例では context.Background() を使っていましたが、この仕組みを使うと、設定や期限を渡したり、クエリをキャンセルしたりできます。

`withDeadline` で作成した context を渡すと、クエリの実行時間に制限を設定できます。これは絶対時刻であり、期限切れになると 接続 が解放され、ClickHouse にキャンセルシグナルが送信されるだけである点に注意してください。`WithCancel` を使えば、クエリを明示的にキャンセルすることもできます。

ヘルパーの `clickhouse.WithQueryID` と `clickhouse.WithQuotaKey` を使うと、クエリ ID と quota key を指定できます。クエリ ID は、logs でのクエリの追跡やキャンセルに役立ちます。quota key は、一意のキー値に基づいて ClickHouse の使用量に制限を課すために使えます。詳細は [Quotas Management](/operations/access-rights#quotas-management) を参照してください。

また、context を使うことで、[Connection Settings](/integrations/language-clients/go/configuration#connection-settings) にあるように 接続 全体ではなく、特定のクエリに対してのみ設定を適用できます。

最後に、`clickhouse.WithBlockSize` を使って block buffer の size を制御できます。これは 接続 レベルの設定 `BlockBufferSize` を上書きし、任意の時点でデコードされてメモリに保持される block の最大数を制御します。値を大きくすると、メモリ消費は増えるものの、並列化が向上する可能性があります。

上記の例を以下に示します。

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
if err = conn.Exec(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY クライアント_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)

## 進捗、プロファイル、ログ情報 \{#progress-profile-log\}

クエリでは、進捗、プロファイル、ログ情報を取得できます。進捗情報では、ClickHouse で読み取られ、処理された行数とバイト数に関する統計値が報告されます。一方、プロファイル情報では、クライアントに返されたデータの要約が提供され、バイト数 (非圧縮) 、行数、ブロック数の合計が含まれます。最後に、ログ情報では、メモリ使用量やデータ速度など、スレッドに関する統計値が提供されます。

この情報を取得するには、ユーザーは [Context](#using-context) を使う必要があり、そこにコールバック関数を渡すことができます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)

## 動的スキャン \{#dynamic-scanning\}

返されるフィールドのスキーマや型が不明なテーブルを読み取る必要が生じることがあります。これは、アドホックなデータ分析を行う場合や、汎用的なツールを作成する場合によくあります。これを実現するために、クエリのレスポンスではカラムの型情報を利用できます。これを Go のリフレクションと組み合わせることで、正しい型を持つ変数のランタイムインスタンスを作成し、`Scan` に渡すことができます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)

## 外部テーブル \{#external-tables\}

[外部テーブル](/engines/table-engines/special/external-data/)を使うと、クライアントは `SELECT` クエリとともにデータを ClickHouse に送信できます。このデータは一時テーブルに格納され、クエリ内で評価に使用できます。

クエリとともに外部データを送信するには、context 経由で渡す前に、ユーザーが `ext.NewTable` を使って外部テーブルを作成する必要があります。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)

## Open telemetry \{#open-telemetry\}

ClickHouse は、TCP と HTTP の両方のトランスポートで [トレース Context の伝播](/operations/opentelemetry/) をサポートしています。TCP を使う場合、クライアント は span をネイティブのバイナリプロトコルにシリアライズします。`clickhouse.WithSpan` を使うと、context 経由で span をクエリに関連付けることができます。

:::note HTTP トランスポートの制限
ClickHouse server は標準の `traceparent` / `tracestate` HTTP header を受け付けますが、clickhouse-go の HTTP トランスポートは現時点ではこれらを送信しません。そのため、`WithSpan` は HTTP では効果がありません。回避策として、接続 option の `HttpHeaders` を使って header を手動で設定できます。
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

トレーシングの活用方法の詳細については、[OpenTelemetry サポート](/operations/opentelemetry/) を参照してください。
