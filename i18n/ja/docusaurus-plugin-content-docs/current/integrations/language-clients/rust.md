---
sidebar_label: Rust
sidebar_position: 4
keywords: [clickhouse, rs, rust, cargo, crate, http, client, connect, integrate]
slug: /integrations/rust
description: ClickHouseに接続するための公式Rustクライアント。
---

# ClickHouse Rust クライアント

ClickHouseに接続するための公式Rustクライアントで、もともとは[Paul Loyd](https://github.com/loyd)によって開発されました。クライアントのソースコードは[GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-rs)で入手可能です。

## 概要 {#overview}

* 行のエンコード/デコードに`serde`を使用。
* `serde`の属性をサポート：`skip_serializing`、`skip_deserializing`、`rename`。
* HTTPトランスポート上で[`RowBinary`](/interfaces/formats#rowbinary)フォーマットを使用。
    * 将来的にTCP経由で[`Native`](/interfaces/formats#native)に切り替える予定。
* TLSをサポート（`native-tls`および`rustls-tls`機能を介して）。
* 圧縮および解凍をサポート（LZ4）。
* データの選択や挿入、DDLの実行、およびクライアント側のバッチ処理のためのAPIを提供。
* ユニットテスト用の便利なモックを提供。

## インストール {#installation}

クレートを使用するには、`Cargo.toml`に以下を追加します：

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

さらに、[crates.ioのページ](https://crates.io/crates/clickhouse)も参照してください。

## Cargo機能 {#cargo-features}

* `lz4`（デフォルトで有効）— `Compression::Lz4`および`Compression::Lz4Hc(_)`バリアントを有効にします。 有効な場合、デフォルトで全てのクエリには`Compression::Lz4`が使用されます（`WATCH`を除く）。
* `native-tls` — OpenSSLをリンクしている`hyper-tls`を介して、`HTTPS`スキーマのURLをサポートします。
* `rustls-tls` — OpenSSLをリンクしていない`hyper-rustls`を介して、`HTTPS`スキーマのURLをサポートします。
* `inserter` — `client.inserter()`を有効にします。
* `test-util` — モックを追加します。[こちらの例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)を参照してください。 `dev-dependencies`内でのみ使用してください。
* `watch` — `client.watch`機能を有効にします。詳細は該当セクションを参照してください。
* `uuid` — [uuid](https://docs.rs/uuid)クレートと連携するための`serde::uuid`を追加します。
* `time` — [time](https://docs.rs/time)クレートと連携するための`serde::time`を追加します。

:::important
`HTTPS` URLを介してClickHouseに接続する際は、`native-tls`または`rustls-tls`機能のいずれかを有効にする必要があります。
両方が有効な場合、`rustls-tls`機能が優先されます。
:::

## ClickHouseバージョンの互換性 {#clickhouse-versions-compatibility}

クライアントは、LTSまたはそれ以降のバージョンのClickHouse、およびClickHouse Cloudと互換性があります。

v22.6より古いClickHouseサーバーは、RowBinaryを[稀なケースで不正に処理します](https://github.com/ClickHouse/ClickHouse/issues/37420)。
v0.11以降を使用し、`wa-37420`機能を有効にしてこの問題を解決できます。注意：この機能は新しいClickHouseバージョンには使用しないでください。

## 例 {#examples}

クライアントの使用のさまざまなシナリオを、[クライアントリポジトリの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples)でカバーすることを目指しています。概要は[例のREADME](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview)で確認できます。

例や以下のドキュメントに不明点や不足がある場合は、気軽に[お問い合わせください](./rust.md#contact-us)。

## 使用法 {#usage}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs)クレートは、ClickHouseから行タイプを生成するために便利です。
:::

### クライアントインスタンスの作成 {#creating-a-client-instance}

:::tip
作成したクライアントを再利用するか、クローンして基礎となるhyper接続プールを再利用します。
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

通常通りクライアントを作成します。この例では、環境変数を使用して接続情報を格納します：

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

参照：
- [ClickHouse CloudでのHTTPSの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs)この例は、オンプレミスのHTTPS接続にも適用できます。

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
* プレースホルダー`?`は、次の`bind()`呼び出しにおける値に置き換えられます。
* `fetch_one::<Row>()`および`fetch_all::<Row>()`メソッドを使って、最初の行または全ての行を取得することもできます。
* `sql::Identifier`を使用してテーブル名をバインドできます。

NB: 応答全体がストリームであるため、カーソルは行を生成した後でもエラーを返すことがあります。このような場合は、`query(...).with_option("wait_end_of_query", "1")`を使ってサーバー側での応答バッファリングを有効化することができます。[詳細はこちら](/interfaces/http/#response-buffering)。`buffer_size`オプションも役立ちます。

:::warning
行を選択する際に`wait_end_of_query`を使用する際は注意してください。サーバー側のメモリ消費が増大し、おそらく全体的なパフォーマンスが低下する可能性があります。
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

* `end()`が呼ばれない場合、`INSERT`は中止されます。
* 行はネットワークの負荷を分散するためにストリームとして逐次送信されます。
* ClickHouseは、すべての行が同じパーティションに収まり、その数が[`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size)未満の場合にのみ、バッチを原子トランザクションとして挿入します。

### 非同期挿入（サーバーサイドバッチ処理） {#async-insert-server-side-batching}

[ClickHouseの非同期挿入](/optimize/asynchronous-inserts)を使用して、受信データのクライアント側バッチ処理を避けることができます。これは、`insert`メソッド（または`Client`インスタンス自体）に`async_insert`オプションを提供することで行えます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

参照：
- [非同期挿入の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs)はクライアントリポジトリにあります。

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

// アプリケーションのシャットダウン時にInserterを終了し
// 残りの行をコミットするのを忘れないでください。`.end()`も統計を提供します。
inserter.end().await?;
```

* `Inserter`は、`commit()`でアクティブな挿入を終了し、任意のしきい値（`max_bytes`、`max_rows`、`period`）に達した場合に処理を行います。
* アクティブな`INSERT`の終了間隔は、`with_period_bias`を使用することで偏りを持たせることができ、並行するInserterによる負荷のスパイクを避けることができます。
* `Inserter::time_left()`を使用して、現在の期間が終了する時刻を検出できます。ストリームがまれに項目を発生させる場合、しきい値を再確認するために`Inserter::commit()`を再度呼び出すことができます。
* 時間しきい値は、[quanta](https://docs.rs/quanta)クレートを使用して`inserter`を迅速化します。`test-util`が有効な場合、使用しません（したがって、カスタムテストでは`tokio::time::advance()`によって時間を管理できます）。
* `commit()`呼び出しの間のすべての行は、同じ`INSERT`ステートメントに挿入されます。

:::warning
挿入を終了/確定する場合はフラッシュを忘れないでください：
```rust
inserter.end().await?;
```
:::

### DDLの実行 {#executing-ddls}

単一ノードのデプロイメントでは、以下のようにDDLを実行するだけで済みます：

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

しかし、ロードバランサーまたはClickHouse Cloudを使用したクラスターのデプロイメントでは、DDLがすべてのレプリカで適用されるのを待つことをお勧めします。次のようにできます：

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
    // この設定は、このクエリのみに適用されます；
    // グローバルクライアント設定を上書きします。
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

`query`の他に、同じように`insert`および`inserter`メソッドにも機能します。また、同じメソッドを`Client`インスタンス上で呼び出して、すべてのクエリのグローバル設定を設定することもできます。

### クエリID {#query-id}

`.with_option`を使用して、ClickHouseのクエリログでクエリを識別するために`query_id`オプションを設定できます。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

`query`の他に、同じように`insert`および`inserter`メソッドにも機能します。

:::danger
`query_id`を手動で設定する場合は、ユニークであることを確認してください。UUIDが良い選択です。
:::

参照： [query_idの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) クライアントリポジトリにあります。

### セッションID {#session-id}

`query_id`と同様に、`session_id`を設定して、同じセッション内でステートメントを実行できます。`session_id`は、クライアントレベルでグローバルに設定することも、`query`、`insert`、または`inserter`呼び出しごとに設定することもできます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
クラスターのデプロイメントでは、「スティッキセッション」が欠如しているため、この機能を正しく利用するには特定のクラスターノードに接続する必要があります。たとえば、ラウンドロビンのロードバランサーはその後のリクエストが同じClickHouseノードによって処理されることを保証しません。
:::

参照： [session_idの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) クライアントリポジトリにあります。

### カスタムHTTPヘッダー {#custom-http-headers}

プロキシ認証を使用する場合やカスタムヘッダーを渡す必要がある場合は、次のようにできます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

参照： [カスタムHTTPヘッダーの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) クライアントリポジトリにあります。

### カスタムHTTPクライアント {#custom-http-client}

これは、基盤となるHTTP接続プールの設定を調整するために役立ちます。

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // またはHttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // クライアント側で特定のアイドルソケットをどのくらいの間生かすか（ミリ秒単位）。
    // ClickHouseサーバーのKeepAliveタイムアウトよりもかなり短い必要があり、
    // デフォルトでは23.11以前では3秒、以降では10秒でした。
    .pool_idle_timeout(Duration::from_millis(2_500))
    // プール内で許可されるアイドルKeep-Alive接続の最大数を設定します。
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
この例は古いHyper APIに依存しており、今後変更される可能性があります。
:::

参照： [カスタムHTTPクライアントの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) クライアントリポジトリにあります。

## データ型 {#data-types}

:::info
追加の例も参照してください：
* [単純なClickHouseデータ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
* [コンテナのようなClickHouseデータ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
:::

* `(U)Int(8|16|32|64|128)`は対応する`(u|i)(8|16|32|64|128)`タイプまたはその周囲の新しい型にマッピングされます。
* `(U)Int256`は直接サポートされていませんが、[ワークアラウンド](https://github.com/ClickHouse/clickhouse-rs/issues/48)があります。
* `Float(32|64)`は対応する`f(32|64)`タイプまたはその周囲の新しい型にマッピングされます。
* `Decimal(32|64|128)`は対応する`i(32|64|128)`タイプまたはその周囲の新しい型にマッピングされます。符号付き固定小数点数の実装は[`fixnum`](https://github.com/loyd/fixnum)を使用するのが便利です。
* `Boolean`は`bool`またはその周囲の新しい型にマッピングされます。
* `String`は任意の文字列やバイト型（例：`&str`、`&[u8]`、`String`、`Vec<u8>`、または[`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html)）にマッピングされます。新しい型もサポートされています。バイトを格納する場合は、[`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/)の使用を検討してください。効率が良いためです。

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

* `FixedString(N)`はバイトの配列としてサポートされています。例：`[u8; N]`。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```
* `Enum(8|16)`は[`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/)を使用してサポートされています。

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
* `UUID`は、[`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html)にマッピングされます。`serde::uuid`を使用します。`uuid`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```
* `IPv6`は[`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html)にマッピングされます。
* `IPv4`は[`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html)に`serde::ipv4`を使用してマッピングされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```
* `Date`は`u16`またはその周囲の新しい型にマッピングされ、`1970-01-01`から経過した日数を表します。また、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)は、`serde::time::date`を使用してサポートされています。`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```
* `Date32`は`i32`またはその周囲の新しい型にマッピングされ、`1970-01-01`から経過した日数を表します。また、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)は、`serde::time::date32`を使用してサポートされています。`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```
* `DateTime`は`u32`またはその周囲の新しい型にマッピングされ、UNIXエポックから経過した時間を表します。また、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)は、`serde::time::datetime`を使用してサポートされています。`time`機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)`は`i32`またはその周囲の新しい型にマッピングされ、UNIXエポックから経過した時間を表します。また、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)は、`serde::time::datetime64::*`を使用してサポートされています。`time`機能が必要です。

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

* `Tuple(A, B, ...)`は`(A, B, ...)`またはその周囲の新しい型にマッピングされます。
* `Array(_)`は任意のスライス（例：`Vec<_>`、`&[_]`）にマッピングされます。新しい型もサポートされています。
* `Map(K, V)`は`Array((K, V))`と同様に機能します。
* `LowCardinality(_)`はシームレスにサポートされています。
* `Nullable(_)`は`Option<_>`にマッピングされます。`clickhouse::serde::*`ヘルパーを追加するには`::option`を使用します。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```
* `Nested`は、リネームされた複数の配列を提供することでサポートされています。
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
* `Geo`型はサポートされています。`Point`はタプル`(f64, f64)`のように機能し、他の型は点のスライスです。
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

* `Variant`、`Dynamic`、（新しい）`JSON`データ型はまだサポートされていません。

## モッキング {#mocking}
このクレートは、CHサーバーをモックおよびDDL、`SELECT`、`INSERT`、`WATCH`クエリをテストするためのユーティリティを提供します。機能は`test-util`機能で有効にできます。**開発依存関係としてのみ使用してください**。

[こちらの例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)を参照してください。

## トラブルシューティング {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

`CANNOT_READ_ALL_DATA`エラーの最も一般的な原因は、アプリケーション側の行定義がClickHouseのそれに一致しないことです。

次のテーブルを考えてみてください：

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

次に、`EventLog`がアプリケーション側に異なる型で定義されている場合を考えてみましょう。例えば：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- ここはu32である必要があります！
}
```

データを挿入する際に次のエラーが発生する可能性があります：

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

この例では、`EventLog`構造体の正しい定義で修正できます：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```

## 知られている制限 {#known-limitations}

* `Variant`、`Dynamic`、（新しい）`JSON`データ型はまだサポートされていません。
* サーバー側パラメータバインディングはまだサポートされていません。参照：[この問題](https://github.com/ClickHouse/clickhouse-rs/issues/142)を追跡してください。

## お問い合わせ {#contact-us}

質問があったり、ヘルプが必要な場合は、[コミュニティSlack](https://clickhouse.com/slack)や[GitHubの問題](https://github.com/ClickHouse/clickhouse-rs/issues)を通じてお気軽にご連絡ください。
