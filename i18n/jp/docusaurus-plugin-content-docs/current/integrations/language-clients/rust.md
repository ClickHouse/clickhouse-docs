---
sidebar_label: Rust
sidebar_position: 4
keywords: [clickhouse, rs, rust, cargo, crate, http, client, connect, integrate]
slug: /integrations/rust
description: ClickHouseに接続するための公式Rustクライアントです。
---


# ClickHouse Rust Client

ClickHouseに接続するための公式Rustクライアントで、元々は[Paul Loyd](https://github.com/loyd)によって開発されました。クライアントのソースコードは[GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-rs)で入手できます。

## 概要 {#overview}

* 行のエンコーディング/デコーディングに `serde` を使用します。
* `serde` 属性をサポートしています: `skip_serializing`, `skip_deserializing`, `rename`。
* HTTPトランスポート上で[`RowBinary`](/interfaces/formats#rowbinary)フォーマットを使用します。
    * TCP経由で[`Native`](/interfaces/formats#native)へ切り替える計画があります。
* TLSをサポートしています（`native-tls` および `rustls-tls` 機能を介して）。
* 圧縮と解凍をサポートしています（LZ4）。
* データの選択または挿入、DDLの実行、クライアント側のバッチ処理のためのAPIを提供します。
* 単体テスト用の便利なモックを提供します。

## インストール {#installation}

クレートを使用するには、`Cargo.toml`に以下を追加します：

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

詳細は：[crates.ioページ](https://crates.io/crates/clickhouse)を参照してください。

## Cargo機能 {#cargo-features}

* `lz4`（デフォルトで有効） — `Compression::Lz4` および `Compression::Lz4Hc(_)` バリアントを有効にします。これが有効のときは、デフォルトで `Compression::Lz4` が `WATCH` を除くすべてのクエリに使用されます。
* `native-tls` — `HTTPS` スキーマを持つURLを `hyper-tls` を介してサポートし、OpenSSLにリンクします。
* `rustls-tls` — `HTTPS` スキーマを持つURLを `hyper-rustls` を介してサポートし、OpenSSLにリンクしません。
* `inserter` — `client.inserter()` を有効にします。
* `test-util` — モックを追加します。詳細は[例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)を参照してください。これは`dev-dependencies`でのみ使用してください。
* `watch` — `client.watch` 機能を有効にします。詳細は該当するセクションを参照してください。
* `uuid` — [uuid](https://docs.rs/uuid)クレートと連携するための `serde::uuid` を追加します。
* `time` — [time](https://docs.rs/time)クレートと連携するための `serde::time` を追加します。

:::important
`HTTPS` URLを介してClickHouseに接続する場合は、`native-tls` または `rustls-tls` 機能のいずれかを有効にする必要があります。
両方が有効な場合、`rustls-tls` 機能が優先されます。
:::

## ClickHouseバージョンの互換性 {#clickhouse-versions-compatibility}

クライアントは、LTSまたはそれ以降のバージョンのClickHouse、及びClickHouse Cloudと互換性があります。

ClickHouseサーバーがv22.6以前の場合、RowBinaryは[一部の稀なケースで不正に処理されます](https://github.com/ClickHouse/ClickHouse/issues/37420)。
v0.11以上を使用し、`wa-37420`機能を有効にすることでこの問題を解決することができます。注意：この機能は新しいClickHouseバージョンでは使用しないでください。

## 例 {#examples}

クライアントの使用法に関するさまざまなシナリオをカバーすることを目指して、クライアントリポジトリに[例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples)を用意しています。概要は[例のREADME](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview)にあります。

例や以下のドキュメントに不明点や不足があれば、遠慮なく[お問い合わせください](./rust.md#contact-us)。

## 使用法 {#usage}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs)クレートは、ClickHouseから行タイプを生成するのに便利です。
:::

### クライアントインスタンスの作成 {#creating-a-client-instance}

:::tip
作成したクライアントを再利用するか、それらをクローンして、基盤のhyper接続プールを再利用してください。
:::

```rust
use clickhouse::Client;

let client = Client::default()
    // プロトコルとポートの両方が含まれている必要があります
    .with_url("http://localhost:8123")
    .with_user("name")
    .with_password("123")
    .with_database("test");
```

### HTTPSまたはClickHouse Cloud接続 {#https-or-clickhouse-cloud-connection}

HTTPSは `rustls-tls` または `native-tls` Cargo機能のいずれかで機能します。

次に、通常通りクライアントを作成します。この例では、環境変数を使用して接続の詳細を格納します：

:::important
URLはプロトコルとポートの両方を含む必要があります。例： `https://instance.clickhouse.cloud:8443`。
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

詳細は以下もご覧ください：
- [ClickHouse CloudのHTTPS使用例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs)は、オンプレミスのHTTPS接続にも適用されるはずです。

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

* プレースホルダー `?fields` は `no, name`（`Row` のフィールド）に置き換えられます。
* プレースホルダー `?` は、次の `bind()` 呼び出しでの値に置き換えられます。
* 一番最初の行またはすべての行を取得するために、便利な `fetch_one::<Row>()` および `fetch_all::<Row>()` メソッドを使用できます。
* テーブル名をバインドするには、`sql::Identifier` を使用できます。

注意：レスポンス全体がストリームされるため、カーソルは一部の行を生成した後でエラーを返す可能性があります。これが発生した場合は、サーバー側でレスポンスバッファリングを有効にするために`query(...).with_option("wait_end_of_query", "1")`を試してみてください。[詳細はこちら](/interfaces/http/#response-buffering)。`buffer_size`オプションも役立ちます。

:::warning
行を選択する際に `wait_end_of_query` を使用する場合は注意が必要です。サーバー側のメモリ消費が増加し、全体のパフォーマンスが低下する可能性があります。
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

* `end()` が呼ばれない場合、`INSERT` は中止されます。
* 行は進行状況に応じてストリームとして送信されて、ネットワーク負荷を分散させます。
* ClickHouseは、すべての行が同じパーティションに収まり、その数が[`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size)より少ない場合にのみバッチを原子性で挿入します。

### 非同期挿入（サーバー側のバッチ処理） {#async-insert-server-side-batching}

[ClickHouseの非同期挿入](/optimize/asynchronous-inserts)を使用して、着信データのクライアント側のバッチ処理を避けることができます。これには、`insert`メソッド（またはクライアントインスタンス自体）に`async_insert`オプションを提供するだけで済みます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

詳細は：
- [非同期挿入の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs)をクライアントリポジトリで確認してください。

### インサーター機能（クライアント側のバッチ処理） {#inserter-feature-client-side-batching}

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
        "{} bytes, {} rows, {} transactions have been inserted",
        stats.bytes, stats.rows, stats.transactions,
    );
}

// アプリケーションのシャットダウン時にインサーターを終了し、残りの行をコミットするのを忘れないでください。 `.end()` も統計を提供します。
inserter.end().await?;
```

* `Inserter` は、いずれかの閾値（`max_bytes`, `max_rows`, `period`）に達した場合、`commit()` でアクティブな挿入を終了します。
* アクティブな `INSERT` の終了間隔は、並列インサーターによる負荷スパイクを回避するために `with_period_bias` を使用して調整できます。
* `Inserter::time_left()` を使用して現在の期間の終了時刻を検出できます。ストリームがアイテムをほとんど発生させない場合は、制限を確認するために `Inserter::commit()` を再度呼び出してください。
* 時間の閾値は、[`quanta`](https://docs.rs/quanta)クレートを利用して `inserter` を高速化します。`test-util` が有効な場合は使用されません（この場合、カスタムテストで `tokio::time::advance()` で時間を管理できます）。
* `commit()` 呼び出しの間にあるすべての行は、同じ `INSERT` ステートメントに挿入されます。

:::warning
挿入を終了/完了したい場合はフラッシュするのを忘れないでください：
```rust
inserter.end().await?;
```
:::

### DDLの実行 {#executing-ddls}

単一ノードのデプロイメントでは、次のようにDDLを実行するだけで十分です：

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

ただし、ロードバランサーやClickHouse Cloudと共に使用されるクラスター配置では、すべてのレプリカにDDLが適用されるのを待つことをお勧めします。これは次のように実行できます：

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
    // この設定は、この特定のクエリにのみ適用されます。
    // グローバルクライアント設定をオーバーライドします。
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

`query`に加えて、`insert`や`inserter`メソッドでも同様に機能します。また、グローバル設定をすべてのクエリに適用するために`Client`インスタンスでも同じメソッドを呼び出すことができます。

### クエリID {#query-id}

`.with_option`を使用して、ClickHouseクエリログ内のクエリを識別するための`query_id`オプションを設定できます。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

`query`の他、`insert`および`inserter`メソッドでも同様に機能します。

:::danger
`query_id`を手動で設定する場合は、それがユニークであることを確認してください。UUIDが良い選択です。
:::

詳細は、[query_idの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs)をクライアントリポジトリで見てください。

### セッションID {#session-id}

`query_id`と同様に、同じセッションでステートメントを実行するために`session_id`を設定できます。`session_id`はクライアントレベルでグローバルに設定することも、`query`、`insert`、または`inserter`の呼び出しごとに設定することもできます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
クラスター配置では「スティッキーセッション」がないため、特定のクラスターノードに接続してこの機能を適切に利用する必要があります。ラウンドロビンのロードバランサーは、連続するリクエストが同じClickHouseノードによって処理されることを保証しません。
:::

詳細は、[session_idの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs)をクライアントリポジトリで見てください。

### カスタムHTTPヘッダー {#custom-http-headers}

プロキシ認証を使用する場合やカスタムヘッダーを渡す必要がある場合は、次のようにします：

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

詳細は、[カスタムHTTPヘッダーの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs)をクライアントリポジトリで見てください。

### カスタムHTTPクライアント {#custom-http-client}

これは、基盤のHTTP接続プール設定を調整するのに役立ちます。

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // もしくは HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // 特定のアイドルソケットをクライアント側に保持する時間（ミリ秒）。
    // これはClickHouseサーバーのKeepAliveタイムアウトのかなり低い値である必要があります。
    // デフォルトでは、23.11以前は3秒、以降は10秒。
    .pool_idle_timeout(Duration::from_millis(2_500))
    // プール内の最大アイドルKeep-Alive接続数を設定します。
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
この例は古典的なHyper APIに依存しており、将来変更される可能性があります。
:::

詳細は、[カスタムHTTPクライアントの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs)をクライアントリポジトリで見てください。

## データ型 {#data-types}

:::info
追加の例については、次をご覧ください：
* [シンプルなClickHouseデータ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
* [コンテナのようなClickHouseデータ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
:::

* `(U)Int(8|16|32|64|128)`は、対応する `(u|i)(8|16|32|64|128)`型またはそれらの新タイプにマップされます。
* `(U)Int256`は直接はサポートされませんが、[回避策](https://github.com/ClickHouse/clickhouse-rs/issues/48)があります。
* `Float(32|64)`は、対応する `f(32|64)`型またはそれらの新タイプにマップされます。
* `Decimal(32|64|128)`は、対応する `i(32|64|128)`型またはそれらの新タイプにマップされます。符号付き固定小数点数の実装には、[`fixnum`](https://github.com/loyd/fixnum)を使用すると便利です。
* `Boolean`は、`bool`またはそれに関する新タイプにマップされます。
* `String`は、任意の文字列またはバイト型（例：`&str`, `&[u8]`, `String`, `Vec<u8>`または[`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html)）にマップされます。新タイプもサポートされています。バイトを保存するには、`serde_bytes`を使用することを考慮してください。これはより効率的です。

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

* `FixedString(N)`はバイトの配列としてサポートされます。例：`[u8; N]`。

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
* `UUID`は、[`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html)に`serde::uuid`を使用してマップされます。`uuid`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```
* `IPv6`は、[`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html)にマップされます。
* `IPv4`は、[`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html)に`serde::ipv4`を使用してマップされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```
* `Date`は、`u16`またはそれに関する新タイプにマップされ、`1970-01-01`から経過した日数を表します。また、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)も`serde::time::date`を使用してサポートされています。このためには`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```
* `Date32`は、`i32`またはそれに関する新タイプにマップされ、`1970-01-01`から経過した日数を表します。また、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)も`serde::time::date32`を使用してサポートされています。このためには`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```
* `DateTime`は、`u32`またはそれに関する新タイプにマップされ、UNIXエポックから経過した秒数を表します。また、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)も`serde::time::datetime`を使用してサポートされています。このためには`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)`は、`i32`またはそれに関する新タイプにマップされ、UNIXエポックから経過した時間を表します。また、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)も`serde::time::datetime64::*`を使用してサポートされます。このためには`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // `DateTime64(X)`に応じて経過したs/us/ms/ns
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

* `Tuple(A, B, ...)`は、`(A, B, ...)`またはそれに関する新タイプにマップされます。
* `Array(_)`は、任意のスライス（例：`Vec<_>`、`&[_]`）にマップされます。新タイプもサポートされています。
* `Map(K, V)`は`Array((K, V))`のように振る舞います。
* `LowCardinality(_)`はシームレスにサポートされています。
* `Nullable(_)`は、`Option<_>`にマップされます。`clickhouse::serde::*`ヘルパーのためには`::option`を追加してください。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```
* `Nested`は、複数の配列を提供してリネームすることでサポートされています。
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
* `Geo` 型はサポートされます。`Point`はタプル`(f64, f64)`のように振る舞い、他の型は点のスライスです。
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

* `Variant`、`Dynamic`、(新しい) `JSON` データ型はまだサポートされていません。

## モック {#mocking}
このクレートは、CHサーバーのモック作成とDDL、`SELECT`、`INSERT`、`WATCH`クエリのテストのためのユーティリティを提供します。この機能は`test-util`機能を通じて有効にできます。**dev-dependencyとしてのみ使用してください。**

[例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)を参照してください。

## トラブルシューティング {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

`CANNOT_READ_ALL_DATA`エラーの最も一般的な原因は、アプリケーション側の行定義がClickHouseのそれに一致しないことです。

以下のテーブルを考えてみましょう：

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

その後、`EventLog`がアプリケーション側で型が一致しないように定義されている場合（例）：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- 正しくはu32でなければなりません！
}
```

データを挿入すると、次のエラーが発生することがあります：

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

この例では、`EventLog`構造体の正しい定義で解決できます：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```

## 知られている制限 {#known-limitations}

* `Variant`、`Dynamic`、(新しい) `JSON`データ型はまだサポートされていません。
* サーバー側のパラメータバインディングはまだサポートされていません。この件に関しては[この問題](https://github.com/ClickHouse/clickhouse-rs/issues/142)で追跡しています。

## お問い合わせ {#contact-us}

質問がある場合や支援が必要な場合は、[Community Slack](https://clickhouse.com/slack)または[GitHubの問題](https://github.com/ClickHouse/clickhouse-rs/issues)を通じてお気軽にお問い合わせください。
