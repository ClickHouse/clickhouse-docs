---
'sidebar_label': 'Rust'
'sidebar_position': 5
'keywords':
- 'clickhouse'
- 'rs'
- 'rust'
- 'cargo'
- 'crate'
- 'http'
- 'client'
- 'connect'
- 'integrate'
'slug': '/integrations/rust'
'description': 'ClickHouse に接続するための公式 Rust クライアント。'
'title': 'ClickHouse Rust クライアント'
'doc_type': 'reference'
---


# ClickHouse Rustクライアント

ClickHouseに接続するための公式のRustクライアントで、元々は[Paul Loyd](https://github.com/loyd)によって開発されました。クライアントのソースコードは[GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-rs)で入手可能です。

## 概要 {#overview}

* 行のエンコード/デコードには`serde`を使用しています。
* `serde`属性をサポートしています：`skip_serializing`、`skip_deserializing`、`rename`。
* HTTPトランスポートでは[`RowBinary`](/interfaces/formats#rowbinary)フォーマットを使用します。
  * TCP経由で[`Native`](/interfaces/formats#native)に切り替える計画があります。
* TLSをサポートしています（`native-tls`および`rustls-tls`機能を通じて）。
* 圧縮と解凍をサポートしています（LZ4）。
* データの選択や挿入、DDLの実行、およびクライアント側のバッチ処理のためのAPIを提供しています。
* ユニットテスト用の便利なモックを提供しています。

## インストール {#installation}

クレートを使用するには、`Cargo.toml`に以下を追加してください：

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

詳細は、[crates.ioページ](https://crates.io/crates/clickhouse)もご覧ください。

## Cargo機能 {#cargo-features}

* `lz4`（デフォルトで有効）— `Compression::Lz4`および`Compression::Lz4Hc(_)`バリアントを有効にします。有効にされた場合、デフォルトで全てのクエリに`Compression::Lz4`が使用されますが、`WATCH`を除きます。
* `native-tls` — `hyper-tls`を通じて`HTTPS`スキーマのURLをサポートし、OpenSSLにリンクします。
* `rustls-tls` — `hyper-rustls`を通じて`HTTPS`スキーマのURLをサポートし、OpenSSLにリンクしません。
* `inserter` — `client.inserter()`を有効にします。
* `test-util` — モックを追加します。詳細は[こちらの例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)をご覧ください。これは`dev-dependencies`でのみ使用してください。
* `watch` — `client.watch`機能を有効にします。詳細は対応するセクションを参照してください。
* `uuid` — [uuid](https://docs.rs/uuid)クレートで作業するために`serde::uuid`を追加します。
* `time` — [time](https://docs.rs/time)クレートで作業するために`serde::time`を追加します。

:::important
ClickHouseに`HTTPS` URLを介して接続する場合、`native-tls`または`rustls-tls`のいずれかの機能を有効にする必要があります。両方が有効にされている場合は、`rustls-tls`機能が優先されます。
:::

## ClickHouseバージョンの互換性 {#clickhouse-versions-compatibility}

このクライアントはLTSまたはそれ以降のバージョンのClickHouseと、ClickHouse Cloudに対応しています。

v22.6より古いClickHouseサーバーは、行バイナリを[一部の稀なケースで不正確に処理します](https://github.com/ClickHouse/ClickHouse/issues/37420)。 v0.11以上を使用し、`wa-37420`機能を有効にすることでこの問題を解決できます。ただし注意：この機能は新しいClickHouseバージョンでは使用しないでください。

## 例 {#examples}

クライアントのさまざまな使用シナリオをカバーすることを目指しており、[例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples)はクライアントリポジトリでご覧いただけます。概要は[例のREADME](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview)で入手可能です。

例や以下の文書に不明な点や欠落がある場合は、[お問い合わせ](./rust.md#contact-us)ください。

## 使用法 {#usage}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs)クレートは、ClickHouseから行タイプを生成するのに役立ちます。
:::

### クライアントインスタンスの作成 {#creating-a-client-instance}

:::tip
作成したクライアントを再利用するか、クローンして基盤となるhyper接続プールを再利用してください。
:::

```rust
use clickhouse::Client;

let client = Client::default()
    // should include both protocol and port
    .with_url("http://localhost:8123")
    .with_user("name")
    .with_password("123")
    .with_database("test");
```

### HTTPSまたはClickHouse Cloud接続 {#https-or-clickhouse-cloud-connection}

HTTPSは`rustls-tls`または`native-tls`のCargo機能のいずれかで動作します。

通常通りにクライアントを作成してください。この例では、環境変数を使用して接続詳細を保存しています：

:::important
URLにはプロトコルとポートの両方を含める必要があります。例：`https://instance.clickhouse.cloud:8443`。
:::

```rust
fn read_env_var(key: &str) -> String {
    env::var(key).unwrap_or_else(|_| panic!("{key} env variable should be set"))
}

let client = Client::default()
    .with_url(read_env_var("CLICKHOUSE_URL"))
    .with_user(read_env_var("CLICKHOUSE_USER"))
    .with_password(read_env_var("CLICKHOUSE_PASSWORD"));
```

詳細は次の通りです：
- クライアントリポジトリの[ClickHouse Cloudの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs)は、オンプレミスのHTTPS接続にも適用可能です。

### 行の選択 {#selecting-rows}

```rust
use serde::Deserialize;
use clickhouse::Row;
use clickhouse::sql::Identifier;

#[derive(Row, Deserialize)]
struct MyRow<'a> {
    no: u32,
    name: &'a str,
}

let table_name = "some";
let mut cursor = client
    .query("SELECT ?fields FROM ? WHERE no BETWEEN ? AND ?")
    .bind(Identifier(table_name))
    .bind(500)
    .bind(504)
    .fetch::<MyRow<'_>>()?;

while let Some(row) = cursor.next().await? { .. }
```

* プレースホルダー`?fields`は`no, name`（`Row`のフィールド）に置き換えられます。
* プレースホルダー`?`は以下の`bind()`呼び出しの値に置き換えられます。
* 最初の行またはすべての行を取得するために便利な`fetch_one::<Row>()`および`fetch_all::<Row>()`メソッドが使用できます。
* テーブル名をバインドするために`sql::Identifier`を使用できます。

注意：レスポンス全体がストリームされるため、カーソルは行を生成した後でもエラーを返すことがあります。この場合、`query(...).with_option("wait_end_of_query", "1")`を試して、サーバー側でのレスポンスバッファリングを有効にしてください。[詳細](/interfaces/http/#response-buffering)もご覧ください。`buffer_size`オプションも便利です。

:::warning
行を選択する際に`wait_end_of_query`を使用する際は注意してください。サーバー側でのメモリ消費が増加し、全体のパフォーマンスが低下する可能性があります。
:::

### 行の挿入 {#inserting-rows}

```rust
use serde::Serialize;
use clickhouse::Row;

#[derive(Row, Serialize)]
struct MyRow {
    no: u32,
    name: String,
}

let mut insert = client.insert("some")?;
insert.write(&MyRow { no: 0, name: "foo".into() }).await?;
insert.write(&MyRow { no: 1, name: "bar".into() }).await?;
insert.end().await?;
```

* `end()`が呼び出されない場合、`INSERT`は中止されます。
* 行はストリームとして徐々に送信され、ネットワーク負荷を分散します。
* ClickHouseは、すべての行が同じパーティションに収まる場合にのみバッチを原子的に挿入します。この際、行の数は[`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size)よりも少ない必要があります。

### 非同期挿入（サーバー側バッチ処理） {#async-insert-server-side-batching}

[ClickHouseの非同期挿入](/optimize/asynchronous-inserts)を使用して、クライアント側のデータバッチ処理を回避できます。これは、単に`insert`メソッド（またはクライアントインスタンス自体に）に`async_insert`オプションを提供することで行えます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

詳細は次の通りです：
- クライアントリポジトリの[非同期挿入の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs)をご覧ください。

### Inserter機能（クライアント側バッチ処理） {#inserter-feature-client-side-batching}

`inserter`のCargo機能が必要です。

```rust
let mut inserter = client.inserter("some")?
    .with_timeouts(Some(Duration::from_secs(5)), Some(Duration::from_secs(20)))
    .with_max_bytes(50_000_000)
    .with_max_rows(750_000)
    .with_period(Some(Duration::from_secs(15)));

inserter.write(&MyRow { no: 0, name: "foo".into() })?;
inserter.write(&MyRow { no: 1, name: "bar".into() })?;
let stats = inserter.commit().await?;
if stats.rows > 0 {
    println!(
        "{} bytes, {} rows, {} transactions have been inserted",
        stats.bytes, stats.rows, stats.transactions,
    );
}

// don't forget to finalize the inserter during the application shutdown
// and commit the remaining rows. `.end()` will provide stats as well.
inserter.end().await?;
```

* `Inserter`は、いずれかのしきい値（`max_bytes`、`max_rows`、`period`）に達した場合、`commit()`内でアクティブな挿入を終了します。
* アクティブな`INSERT`を終了する間隔は、並行する挿入者による負荷のスパイクを避けるために`with_period_bias`を使用して調整できます。
* `Inserter::time_left()`は、現在の期間が終了する時を検出するために使用できます。ストリームがアイテムをまれに発生する場合は、制限を再確認するために`Inserter::commit()`を再度呼び出してください。
* 時間のしきい値は、[quanta](https://docs.rs/quanta)クレートを使用して`inserter`を高速化します。`test-util`が有効な場合は使用されません（したがって、カスタムテストで`tokio::time::advance()`による時間管理が可能です）。
* `commit()`コール間のすべての行は、同じ`INSERT`文で挿入されます。

:::warning
挿入を終了/確定する場合は、フラッシュを忘れないでください：
```rust
inserter.end().await?;
```
:::

### DDLの実行 {#executing-ddls}

単一ノードの展開では、次のようにDDLを実行するだけで十分です。

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

ただし、負荷分散装置またはClickHouse Cloudを使用したクラスター展開では、`wait_end_of_query`オプションを使用して、すべてのレプリカでDDLが適用されるのを待つことをお勧めします。これは次のように行うことができます。

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```

### ClickHouse設定 {#clickhouse-settings}

`with_option`メソッドを使用して、さまざまな[ClickHouse設定](/operations/settings/settings)を適用できます。例として：

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // This setting will be applied to this particular query only;
    // it will override the global client setting.
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

`query`に加えて、`insert`および`inserter`メソッドでも同様に機能します。また、クライアントインスタンス上で同じメソッドを呼び出すことで、すべてのクエリに対してグローバル設定を設定できます。

### クエリID {#query-id}

`.with_option`を使用することで、クエリをClickHouseのクエリログで識別するための`query_id`オプションを設定できます。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

`query`に加えて、`insert`および`inserter`メソッドでも同様に機能します。

:::danger
`query_id`を手動で設定する場合は、一意であることを確認してください。UUIDは良い選択です。
:::

詳細は、クライアントリポジトリの[query_id例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs)をご覧ください。

### セッションID {#session-id}

`query_id`と同様に、`session_id`を設定して同一のセッション内でステートメントを実行できます。`session_id`は、クライアントレベルでグローバルに設定することも、`query`、`insert`、または`inserter`呼び出しごとに設定することもできます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
クラスター展開の場合、「スティッキーセッション」がないため、特定のクラスターノードに接続してこの機能を適切に利用する必要があります。たとえば、ラウンドロビン負荷分散装置は、後続のリクエストが同じClickHouseノードで処理されることを保証しません。
:::

詳細は、クライアントリポジトリの[session_id例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs)をご覧ください。

### カスタムHTTPヘッダー {#custom-http-headers}

プロキシ認証を使用している場合やカスタムヘッダーを渡す必要がある場合は、次のようにできます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

詳細は、クライアントリポジトリの[カスタムHTTPヘッダーの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs)をご覧ください。

### カスタムHTTPクライアント {#custom-http-client}

これは、基盤となるHTTP接続プール設定を微調整するのに役立ちます。

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // or HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // For how long keep a particular idle socket alive on the client side (in milliseconds).
    // It is supposed to be a fair bit less that the ClickHouse server KeepAlive timeout,
    // which was by default 3 seconds for pre-23.11 versions, and 10 seconds after that.
    .pool_idle_timeout(Duration::from_millis(2_500))
    // Sets the maximum idle Keep-Alive connections allowed in the pool.
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
この例はレガシーHyper APIに依存しており、将来的に変更される可能性があります。
:::

詳細は、クライアントリポジトリの[カスタムHTTPクライアントの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs)をご覧ください。

## データ型 {#data-types}

:::info
追加の例もご覧ください：
* [よりシンプルなClickHouseデータ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
* [コンテナのようなClickHouseデータ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
:::

* `(U)Int(8|16|32|64|128)`は、対応する`(u|i)(8|16|32|64|128)`型またはそれを囲む新しい型にマッピングされます。
* `(U)Int256`は直接サポートされていませんが、[回避策](https://github.com/ClickHouse/clickhouse-rs/issues/48)があります。
* `Float(32|64)`は、対応する`f(32|64)`型またはそれを囲む新しい型にマッピングされます。
* `Decimal(32|64|128)`は、対応する`i(32|64|128)`型またはそれを囲む新しい型にマッピングされます。符号付き小数点数の実装には、[`fixnum`](https://github.com/loyd/fixnum)を使用するのが便利です。
* `Boolean`は、`bool`またはそれを囲む新しい型にマッピングされます。
* `String`は、`&str`、`&[u8]`、`String`、`Vec<u8>`、または[`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html)などの任意の文字列またはバイト型にマッピングされます。新しい型もサポートされています。バイトを格納するためには、[`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/)を使用することを検討してください。こちらの方が効率的です。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow<'a> {
    str: &'a str,
    string: String,
    #[serde(with = "serde_bytes")]
    bytes: Vec<u8>,
    #[serde(with = "serde_bytes")]
    byte_slice: &'a [u8],
}
```

* `FixedString(N)`は、バイトの配列としてサポートされています。例：`[u8; N]`。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```

* `Enum(8|16)`は、[`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/)を使用してサポートされています。

```rust
use serde_repr::{Deserialize_repr, Serialize_repr};

#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    level: Level,
}

#[derive(Debug, Serialize_repr, Deserialize_repr)]
#[repr(u8)]
enum Level {
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
}
```

* `UUID`は、`serde::uuid`を使用して[`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html)にマッピングされます。`uuid`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```

* `IPv6`は、[`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html)にマッピングされます。
* `IPv4`は、[`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html)を使用して、`serde::ipv4`でマッピングされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```

* `Date`は、`u16`またはそれを囲む新しい型にマッピングされ、`1970-01-01`以降の日数を表します。また、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)は、`serde::time::date`を使用してサポートされており、`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

* `Date32`は、`i32`またはそれを囲む新しい型にマッピングされ、`1970-01-01`以降の日数を表します。また、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)は、`serde::time::date32`を使用してサポートされており、`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```

* `DateTime`は、`u32`またはそれを囲む新しい型にマッピングされ、UNIXエポック以降の経過秒数を表します。また、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)は、`serde::time::datetime`を使用してサポートされており、`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)`は、`i32`またはそれを囲む新しい型にマッピングされ、UNIXエポック以降の経過時間を表します。また、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)は、`serde::time::datetime64::*`を使用してサポートされており、`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // elapsed s/us/ms/ns depending on `DateTime64(X)`
    #[serde(with = "clickhouse::serde::time::datetime64::secs")]
    dt64s: OffsetDateTime,  // `DateTime64(0)`
    #[serde(with = "clickhouse::serde::time::datetime64::millis")]
    dt64ms: OffsetDateTime, // `DateTime64(3)`
    #[serde(with = "clickhouse::serde::time::datetime64::micros")]
    dt64us: OffsetDateTime, // `DateTime64(6)`
    #[serde(with = "clickhouse::serde::time::datetime64::nanos")]
    dt64ns: OffsetDateTime, // `DateTime64(9)`
}
```

* `Tuple(A, B, ...)`は、`(A, B, ...)`またはそれを囲む新しい型にマッピングされます。
* `Array(_)`は、任意のスライス（例：`Vec<_>`、`&[_]`）にマッピングされます。新しい型もサポートされています。
* `Map(K, V)`は`Array((K, V))`のように振る舞います。
* `LowCardinality(_)`はシームレスにサポートされています。
* `Nullable(_)`は、`Option<_>`にマッピングされます。`clickhouse::serde::*`ヘルパーには`::option`を追加してください。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```

* `Nested`は、名前の付け替えを使って複数の配列を提供することでサポートされています。
```rust
// CREATE TABLE test(items Nested(name String, count UInt32))
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(rename = "items.name")]
    items_name: Vec<String>,
    #[serde(rename = "items.count")]
    items_count: Vec<u32>,
}
```

* `Geo`型がサポートされています。`Point`はタプル`(f64, f64)`のように振る舞い、他の型はポイントのスライスです。
```rust
type Point = (f64, f64);
type Ring = Vec<Point>;
type Polygon = Vec<Ring>;
type MultiPolygon = Vec<Polygon>;
type LineString = Vec<Point>;
type MultiLineString = Vec<LineString>;

#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    point: Point,
    ring: Ring,
    polygon: Polygon,
    multi_polygon: MultiPolygon,
    line_string: LineString,
    multi_line_string: MultiLineString,
}
```

* `Variant`、 `Dynamic`、(新しい)`JSON`データ型はまだサポートされていません。

## モッキング {#mocking}
このクレートは、CHサーバーのモックを作成し、DDL、`SELECT`、`INSERT`、および`WATCH`クエリをテストするためのユーティリティを提供します。この機能は、`test-util`機能を使用して有効化できます。これは**開発依存性**としてのみ使用してください。

[例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)をご覧ください。

## トラブルシューティング {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

`CANNOT_READ_ALL_DATA`エラーの最も一般的な原因は、アプリケーション側の行定義がClickHouseの定義と一致しないことです。

以下のテーブルを考慮してください：

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

次に、アプリケーション側で`EventLog`が不一致の型で定義されていると、例えば以下のようになります：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- should be u32 instead!
}
```

データを挿入すると、次のエラーが発生することがあります：

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

この例では、`EventLog`構造体の正しい定義によって解決されます：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```

## 既知の制限 {#known-limitations}

* `Variant`、 `Dynamic`、(新しい)`JSON`データ型はまだサポートされていません。
* サーバー側のパラメータバインディングはまだサポートされていません。これに関しては[この問題](https://github.com/ClickHouse/clickhouse-rs/issues/142)で進捗を追跡できます。

## お問い合わせ {#contact-us}

質問や支援が必要な場合は、[Community Slack](https://clickhouse.com/slack)または[GitHub issues](https://github.com/ClickHouse/clickhouse-rs/issues)を通じてお気軽にお問い合わせください。
