---
'sidebar_label': 'Rust'
'sidebar_position': 4
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
'description': 'The official Rust client for connecting to ClickHouse.'
'title': 'ClickHouse Rust Client'
---





# ClickHouse Rust Client

ClickHouseへの接続のための公式Rustクライアントで、元々は[Paul Loyd](https://github.com/loyd)によって開発されました。クライアントのソースコードは[GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-rs)にあります。

## 概要 {#overview}

* 行のエンコーディング/デコーディングに`serde`を使用。
* `serde`属性をサポート：`skip_serializing`、`skip_deserializing`、`rename`。
* [`RowBinary`](/interfaces/formats#rowbinary)形式をHTTPトランスポート上で使用。
    * TCP経由で[`Native`](/interfaces/formats#native)に切り替える計画があります。
* TLS（`native-tls`および`rustls-tls`機能を通じて）をサポート。
* 圧縮および解凍（LZ4）をサポート。
* データの選択または挿入、DDLの実行、およびクライアントサイドのバッチ処理用のAPIを提供。
* ユニットテスト用の便利なモックを提供。

## インストール {#installation}

クレートを使用するには、`Cargo.toml`に以下を追加します。

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

他の情報： [crates.ioページ](https://crates.io/crates/clickhouse)。

## Cargo機能 {#cargo-features}

* `lz4`（デフォルトで有効） — `Compression::Lz4`と`Compression::Lz4Hc(_)`バリアントを有効にします。これが有効な場合、`WATCH`を除くすべてのクエリに対してデフォルトで`Compression::Lz4`が使用されます。
* `native-tls` — OpenSSLにリンクして、`HTTPS`スキーマのURLをサポートします。
* `rustls-tls` — OpenSSLにリンクせず、`hyper-rustls`を介して`HTTPS`スキーマのURLをサポートします。
* `inserter` — `client.inserter()`を有効にします。
* `test-util` — モックを追加します。[例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)を参照。開発依存関係でのみ使用してください。
* `watch` — `client.watch`機能を有効にします。詳細は該当するセクションを参照してください。
* `uuid` — [uuid](https://docs.rs/uuid)クレートと連携するために`serde::uuid`を追加します。
* `time` — [time](https://docs.rs/time)クレートと連携するために`serde::time`を追加します。

:::important
`HTTPS` URL経由でClickHouseに接続する際は、`native-tls`または`rustls-tls`機能のいずれかを有効にする必要があります。
両方が有効な場合は、`rustls-tls`機能が優先されます。
:::

## ClickHouseバージョンの互換性 {#clickhouse-versions-compatibility}

このクライアントは、LTSまたはそれ以降のClickHouseバージョン、ならびにClickHouse Cloudに対応しています。

ClickHouseサーバーがv22.6未満の場合、RowBinaryを[奇妙に処理](https://github.com/ClickHouse/ClickHouse/issues/37420)します。この問題を解決するには、v0.11以上を使用し、`wa-37420`機能を有効にすることができます。注：この機能は新しいClickHouseバージョンでは使用しないでください。

## 例 {#examples}

クライアントの使用に関するさまざまなシナリオをカバーすることを目指して、クライアントリポジトリの[例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples)に提供しています。概要は[例のREADME](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview)にあります。

例や次のドキュメントに不明点や不足があれば、[お問い合わせ](./rust.md#contact-us)ください。

## 使用法 {#usage}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs)クレートは、ClickHouseから行型を生成するのに便利です。
:::

### クライアントインスタンスの作成 {#creating-a-client-instance}

:::tip
作成したクライアントを再利用するか、それらをクローンして、基盤となるhyper接続プールを再利用してください。
:::

```rust
use clickhouse::Client;

let client = Client::default()
    // プロトコルとポートの両方を含める必要があります
    .with_url("http://localhost:8123")
    .with_user("name")
    .with_password("123")
    .with_database("test");
```

### HTTPSまたはClickHouse Cloud接続 {#https-or-clickhouse-cloud-connection}

HTTPSは、`rustls-tls`または`native-tls`のCargo機能のいずれかで動作します。

その後、通常通りクライアントを作成します。この例では、環境変数を使用して接続の詳細を格納しています：

:::important
URLには、プロトコルとポートの両方を含める必要があります。例：`https://instance.clickhouse.cloud:8443`。
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

他にも：
- [ClickHouse CloudのHTTPS例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs)。これはオンプレミスのHTTPS接続にも適用可能です。

### 行を選択 {#selecting-rows}

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

* プレースホルダ`?fields`は`no, name`（`Row`のフィールド）に置き換えられます。
* プレースホルダ`?`は次の`bind()`呼び出しで値に置き換えられます。
* 最初の行またはすべての行を取得するために、便利な`fetch_one::<Row>()`および`fetch_all::<Row>()`メソッドが使用できます。
* `sql::Identifier`を使用してテーブル名をバインドできます。

注意：応答全体がストリーミングされるため、カーソルは数行を生成した後でもエラーを返す可能性があります。この場合、クエリを`query(...).with_option("wait_end_of_query", "1")`を使用して、サーバー側での応答バッファリングを有効にしてください。[詳細](/interfaces/http/#response-buffering)。`buffer_size`オプションも便利です。

:::warning
行を選択する際は`wait_end_of_query`を慎重に使用してください。サーバー側でのメモリ消費が増加し、全体的なパフォーマンスが低下する可能性があります。
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
* 行はストリームとして段階的に送信され、ネットワーク負荷を分散します。
* ClickHouseは、すべての行が同じパーティションに収まる場合にのみバッチを原子的に挿入します。また、その数は[`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size)より少なくなければなりません。

### 非同期挿入（サーバーサイドバッチ処理） {#async-insert-server-side-batching}

[ClickHouseの非同期挿入](/optimize/asynchronous-inserts)を使用して、クライアントサイドのバッチ処理を回避できます。これは、`insert`メソッド（または、`Client`インスタンス自体）に`async_insert`オプションを提供することで行えます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

他に：
- [非同期挿入の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs)をクライアントリポジトリで確認してください。

### Inserter機能（クライアントサイドバッチ処理） {#inserter-feature-client-side-batching}

`inserter` Cargo機能が必要です。

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
        "{}バイト、{}行、{}トランザクションが挿入されました",
        stats.bytes, stats.rows, stats.transactions,
    );
}

// アプリケーションのシャットダウン時にInserterを最終化し、残りの行をコミットするのを忘れないでください。
// `.end()`も統計を提供します。
inserter.end().await?;
```

* `Inserter`は、任意の閾値（`max_bytes`、`max_rows`、`period`）に達した場合に`commit()`でアクティブな挿入を終了します。
* アクティブな`INSERT`を終了させる間隔は、`with_period_bias`を使用してバイアスをかけることができ、並列挿入による負荷のスパイクを回避します。
* `Inserter::time_left()`を使用して、現在の期間が終了するタイミングを検出できます。アイテムが稀にしか発生しない場合は、`Inserter::commit()`を再度呼び出して制限を確認します。
* 時間閾値は、`inserter`を高速化するために[quanta](https://docs.rs/quanta)クレートを使用して実装されます。`test-util`が有効な場合は使用されません（したがって、カスタムテストでは`tokio::time::advance()`で時間を管理できます）。
* `commit()`呼び出しの間のすべての行は、同じ`INSERT`ステートメントで挿入されます。

:::warning
挿入を終了/最終化したい場合は、フラッシュを忘れないでください：
```rust
inserter.end().await?;
```
:::

### DDLの実行 {#executing-ddls}

単一ノードのデプロイメントでは、次のようにしてDDLを実行するだけで済みます：

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

しかし、ロードバランサーまたはClickHouse Cloudでのクラスターデプロイメントでは、すべてのレプリカにDDLが適用されるのを待つことをお勧めします。これには`wait_end_of_query`オプションを使用します。次のように行うことができます：

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```

### ClickHouse設定 {#clickhouse-settings}

`with_option`メソッドを使用して、さまざまな[ClickHouse設定](/operations/settings/settings)を適用できます。例えば：

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // この設定はこの特定のクエリにのみ適用されます。
    // グローバルクライアント設定を上書きします。
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

`query`に加え、`insert`および`inserter`メソッドでも同様に機能します。さらに、同じメソッドを`Client`インスタンスで呼び出して、すべてのクエリに対するグローバル設定を設定できます。

### クエリID {#query-id}

`.with_option`を使用して、ClickHouseのクエリログでクエリを識別するために`query_id`オプションを設定できます。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

`query`に加え、`insert`および`inserter`メソッドでも同様に機能します。

:::danger
`query_id`を手動で設定する場合は、それがユニークであることを確認してください。UUIDが良い選択です。
:::

他にも：[query_idの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs)をクライアントリポジトリで確認してください。

### セッションID {#session-id}

`query_id`と同様に、同じセッション内でステートメントを実行するために`session_id`を設定できます。`session_id`は、クライアントレベルでグローバルに設定するか、`query`、`insert`、または`inserter`呼び出しごとに設定することができます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
クラスターデプロイメントでは、"sticky sessions"がないため、この機能を適切に利用するには、_特定のクラスターノード_に接続する必要があります。例えば、ラウンドロビンロードバランサーは、次のリクエストが同じClickHouseノードによって処理されることを保証しません。
:::

他にも：[session_idの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs)をクライアントリポジトリで確認してください。

### カスタムHTTPヘッダー {#custom-http-headers}

プロキシ認証を使用している場合やカスタムヘッダーを渡す必要がある場合、次のように行うことができます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

他にも：[カスタムHTTPヘッダーの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs)をクライアントリポジトリで確認してください。

### カスタムHTTPクライアント {#custom-http-client}

これは、基盤となるHTTP接続プールの設定を微調整するのに便利です。

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // またはHttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // クライアント側で特定のアイドルソケットをどれくらい保持するか（ミリ秒）。
    // ClickHouseサーバーのKeepAliveタイムアウトよりかなり小さいことが想定されています。
    // これは、前の23.11バージョンではデフォルトで3秒、以降は10秒でした。
    .pool_idle_timeout(Duration::from_millis(2_500))
    // プール内で保持される最大アイドルKeep-Alive接続を設定します。
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
この例は古いHyper APIに依存しており、今後変更される可能性があります。
:::

他にも：[カスタムHTTPクライアントの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs)をクライアントリポジトリで確認してください。

## データ型 {#data-types}

:::info
追加の例も見てください：
* [簡単なClickHouseデータ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
* [コンテナのようなClickHouseデータ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
:::

* `(U)Int(8|16|32|64|128)`は、対応する`(u|i)(8|16|32|64|128)`型またはそれに基づく新しい型にマッピングされます。
* `(U)Int256`は直接サポートされていませんが、[回避策があります](https://github.com/ClickHouse/clickhouse-rs/issues/48)。
* `Float(32|64)`は、対応する`f(32|64)`型またはそれに基づく新しい型にマッピングされます。
* `Decimal(32|64|128)`は、対応する`i(32|64|128)`型またはそれに基づく新しい型にマッピングされます。符号付き固定小数点数の[`fixnum`](https://github.com/loyd/fixnum)や他の実装を使用する方が便利です。
* `Boolean`は、`bool`型またはその周りの新しい型にマッピングされます。
* `String`は、任意の文字列またはバイト型にマッピングされます。例えば、`&str`、`&[u8]`、`String`、`Vec<u8>`、または[`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html)。新しい型もサポートされています。バイトを格納する場合は、より効率的な[`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/)を使用することを検討してください。

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

* `FixedString(N)`は、バイトの配列としてサポートされています。例えば、`[u8; N]`。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```
* `Enum(8|16)`は、[`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/)を使用してサポートされます。

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
* `UUID`は、[`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html)にマッピングされ、`serde::uuid`を使用します。`uuid`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```
* `IPv6`は、[`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html)にマッピングされます。
* `IPv4`は、[`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html)にマッピングされ、`serde::ipv4`を使用します。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```
* `Date`は、`u16`またはそれに基づく新しい型にマッピングされ、`1970-01-01`以来の経過日数を表します。また、`serde::time::date`を使用して、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)もサポートされています。これには`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```
* `Date32`は、`i32`またはそれに基づく新しい型にマッピングされ、`1970-01-01`以来の経過日数を表します。また、`serde::time::date32`を使用して、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)もサポートされています。これには`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```
* `DateTime`は、`u32`またはそれに基づく新しい型にマッピングされ、UNIXエポックからの経過秒数を表します。また、`serde::time::datetime`を使用して、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)もサポートされています。これには`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)`は、`i32`またはそれに基づく新しい型にマッピングされ、UNIXエポックからの経過時間を表します。また、`serde::time::datetime64::*`を使用して、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)もサポートされています。これには`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // `DateTime64(X)`に応じて秒/µs/ms/nsの経過時間
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

* `Tuple(A, B, ...)`は`(A, B, ...)`またはそれに基づく新しい型にマッピングされます。
* `Array(_)`は任意のスライスにマッピングされます。例えば`Vec<_>`、`&[_]`。新しい型もサポートされています。
* `Map(K, V)`は`Array((K, V))`のように動作します。
* `LowCardinality(_)`はシームレスにサポートされます。
* `Nullable(_)`は`Option<_>`にマッピングされます。`clickhouse::serde::*`ヘルパーには`::option`を追加します。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```
* `Nested`は、リネーミングを伴う複数の配列を提供することでサポートされます。
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
* `Geo`タイプがサポートされています。`Point`はタプル`(f64, f64)`のように振る舞い、他のタイプは単なるポイントのスライスです。
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

* `Variant`、`Dynamic`、(新しい) `JSON`データ型はまだサポートされていません。

## モック {#mocking}
このクレートは、CHサーバーをモックし、DDL、`SELECT`、`INSERT`および`WATCH`クエリをテストするためのユーティリティを提供します。この機能は`test-util`機能で有効にできます。**開発依存関係としてのみ使用してください**。

[例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)を参照してください。

## トラブルシューティング {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

`CANNOT_READ_ALL_DATA`エラーの最も一般的な原因は、アプリケーション側の行定義がClickHouseのものと一致しないことです。

次のテーブルを考えてみてください：

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

その後、`EventLog`がアプリケーション側で不一致な型とともに定義されている場合、例えば：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- 代わりにu32にする必要があります！
}
```

データを挿入する際に、次のようなエラーが発生する可能性があります：

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

この例では、`EventLog`構造体の定義を正しく修正することで解決されます：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```

## 既知の制限 {#known-limitations}

* `Variant`、`Dynamic`、(新しい) `JSON`データ型はまだサポートされていません。
* サーバーサイドのパラメータバインディングはまだサポートされていません。詳細は[this issue](https://github.com/ClickHouse/clickhouse-rs/issues/142)を参照してください。

## お問い合わせ {#contact-us}

質問や支援が必要な場合は、[コミュニティSlack](https://clickhouse.com/slack)または[GitHubのIssues](https://github.com/ClickHouse/clickhouse-rs/issues)を通じて気軽にご連絡ください。
