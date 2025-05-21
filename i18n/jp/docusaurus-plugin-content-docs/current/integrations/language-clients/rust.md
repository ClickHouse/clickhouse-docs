---
sidebar_label: 'Rust'
sidebar_position: 4
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: 'ClickHouse に接続するための公式 Rust クライアント。'
title: 'ClickHouse Rust クライアント'
---


# ClickHouse Rust クライアント

ClickHouse に接続するための公式 Rust クライアントで、元々は [Paul Loyd](https://github.com/loyd) によって開発されました。クライアントのソースコードは [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-rs) で入手できます。

## 概要 {#overview}

* 行のエンコーディング/デコーディングに `serde` を使用。
* `serde` 属性をサポート: `skip_serializing`, `skip_deserializing`, `rename`。
* HTTP トランスポートを介して [`RowBinary`](/interfaces/formats#rowbinary) 形式を使用。
    * TCP の [`Native`](/interfaces/formats#native) への移行計画があります。
* TLS をサポート (`native-tls` および `rustls-tls` 機能を介して)。
* 圧縮と解凍 (LZ4) をサポート。
* データの選択、挿入、DDL の実行、クライアント側バッチ処理のための API を提供。
* ユニットテスト用の便利なモックを提供。

## インストール {#installation}

クレートを使用するには、`Cargo.toml` に以下を追加します:

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

詳細は [crates.io ページ](https://crates.io/crates/clickhouse) を参照してください。

## Cargo 機能 {#cargo-features}

* `lz4` (デフォルトで有効) — `Compression::Lz4` および `Compression::Lz4Hc(_)` バリアントを有効にします。 有効にすると、`Compression::Lz4` がデフォルトで使用され、`WATCH` だけが例外です。
* `native-tls` — `hyper-tls` を介して OpenSSL にリンクされた `HTTPS` スキーマを持つ URL をサポートします。
* `rustls-tls` — OpenSSL にリンクされない `hyper-rustls` を介して `HTTPS` スキーマを持つ URL をサポートします。
* `inserter` — `client.inserter()` を有効にします。
* `test-util` — モックを追加します。 [例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs) を参照してください。 `dev-dependencies` にのみ使用してください。
* `watch` — `client.watch` 機能を有効にします。 詳細は該当セクションを参照してください。
* `uuid` — [uuid](https://docs.rs/uuid) クレートを操作するために `serde::uuid` を追加します。
* `time` — [time](https://docs.rs/time) クレートを操作するために `serde::time` を追加します。

:::important
`HTTPS` URL を介して ClickHouse に接続する場合、`native-tls` または `rustls-tls` 機能のいずれかを有効にする必要があります。
どちらも有効にすると、`rustls-tls` 機能が優先されます。
:::

## ClickHouse バージョンの互換性 {#clickhouse-versions-compatibility}

クライアントは、LTS またはそれ以降の ClickHouse バージョン、および ClickHouse Cloud で互換性があります。

ClickHouse サーバーが v22.6 より古いと、RowBinary を [いくつかの稀なケースで不正に処理します](https://github.com/ClickHouse/ClickHouse/issues/37420)。 
v0.11+ を使用し、`wa-37420` 機能を有効にしてこの問題を解決できます。 注意: この機能は、新しい ClickHouse バージョンでは使用しないでください。

## 例 {#examples}

クライアントの使用に関するさまざまなシナリオを、クライアントリポジトリの [例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples) でカバーすることを目指しています。 概要は [例の README](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview) で確認できます。

もし例や以下のドキュメントに不明な点や不足があれば、[お問い合わせ](./rust.md#contact-us)ください。

## 使用方法 {#usage}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs) クレートは、ClickHouse から行型を生成するのに便利です。
:::

### クライアントインスタンスの作成 {#creating-a-client-instance}

:::tip
作成したクライアントを再利用するか、クローンして基盤のハイパー接続プールを再利用してください。
:::

```rust
use clickhouse::Client;

let client = Client::default()
    // プロトコルとポートの両方を含む必要があります。
    .with_url("http://localhost:8123")
    .with_user("name")
    .with_password("123")
    .with_database("test");
```

### HTTPS または ClickHouse Cloud 接続 {#https-or-clickhouse-cloud-connection}

HTTPS は `rustls-tls` または `native-tls` Cargo 機能のいずれかで機能します。

その後、通常通りクライアントを作成します。この例では、環境変数を使用して接続の詳細を保存しています:

:::important
URL はプロトコルとポートの両方を含む必要があります。例: `https://instance.clickhouse.cloud:8443`。
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

詳細は以下を参照してください:
- [ClickHouse Cloud の HTTPS 使用例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs) クライアントのリポジトリにあります。 これはオンプレミスの HTTPS 接続にも適用可能です。

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

* プレースホルダー `?fields` は `no, name` (Row のフィールド) に置き換えられます。
* プレースホルダー `?` は次の `bind()` コールでの値に置き換えられます。
* 最初の行またはすべての行を取得するために便利な `fetch_one::<Row>()` と `fetch_all::<Row>()` メソッドが使用できます。
* `sql::Identifier` はテーブル名をバインドするために使用できます。

注意: レスポンス全体がストリーミングされるため、カーソルは一部の行が生成された後でもエラーを返すことがあります。この場合、`query(...).with_option("wait_end_of_query", "1")` を試して、サーバー側でのレスポンスバッファリングを有効にすることができるかもしれません。[詳細](/interfaces/http/#response-buffering)。 `buffer_size` オプションも有用です。

:::warning
行を選択する際に `wait_end_of_query` を使用する場合は注意してください。これはサーバー側のメモリ消費を増加させ、全体的なパフォーマンスを低下させる可能性があります。
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

* `end()` が呼ばれないと、`INSERT` は中止されます。
* 行はネットワーク負荷を分散するためにストリームとして段階的に送信されます。
* ClickHouse は、すべての行が同じパーティションに収まる場合のみ、バッチを原子的に挿入します。その数は [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size) より少なければなりません。

### 非同期挿入 (サーバー側バッチ処理) {#async-insert-server-side-batching}

[ClickHouse の非同期挿入](/optimize/asynchronous-inserts) を使用して、受信データのクライアント側バッチ処理を避けることができます。 これは、`insert` メソッド (またはクライアント インスタンス自体) に `async_insert` オプションを提供するだけで実行できます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

詳細は:
- [非同期挿入の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs) クライアントリポジトリにあります。

### Inserter 機能 (クライアント側バッチ処理) {#inserter-feature-client-side-batching}

`inserter` Cargo 機能が必要です。

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
        "{} バイト, {} 行, {} トランザクションが挿入されました",
        stats.bytes, stats.rows, stats.transactions,
    );
}

// アプリケーションのシャットダウン時に inserter を最終化し、残りの行をコミットすることを忘れないでください。
// `.end()` も統計を提供します。
inserter.end().await?;
```

* `Inserter` は、いずれかの閾値 (`max_bytes`, `max_rows`, `period`) が達成された場合に `commit()` でアクティブな挿入を終了します。
* アクティブな `INSERT` を終了する間隔は、`with_period_bias` を使用してバイアスをかけることができ、並行する inserter による負荷のスパイクを回避します。
* `Inserter::time_left()` を使用して、現在の期間の終了を検出できます。 稀にアイテムを発生させるストリームの場合、再度 `Inserter::commit()` を呼び出して制限を確認します。
* 時間の閾値は、[quanta](https://docs.rs/quanta) クレートを使用して `inserter` の速度を向上させることによって実装されています。 これは `test-util` が有効な場合は使用されません (したがって、独自のテストでは `tokio::time::advance()` によって時間を管理できます)。
* `commit()` コールの間のすべての行は、同じ `INSERT` 文で挿入されます。

:::warning
挿入を終了/最終化したい場合は、忘れずにフラッシュしてください:
```rust
inserter.end().await?;
```
:::

### DDL の実行 {#executing-ddls}

単一ノードデプロイメントでは、次のように DDL を実行するだけで十分です:

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

ただし、ロードバランサーまたは ClickHouse Cloud を使用したクラスターデプロイメントでは、DDL がすべてのレプリカに適用されるのを待つことをお勧めします。これは次のように実行できます:

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```

### ClickHouse 設定 {#clickhouse-settings}

さまざまな [ClickHouse 設定](/operations/settings/settings) を `with_option` メソッドを使用して適用できます。 例えば:

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // この設定はこの特定のクエリに対してのみ適用されます。
    // それはグローバルクライアント設定をオーバーライドします。
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

`query` に加えて、`insert` および `inserter` メソッドでも同様に機能します。 さらに、`Client` インスタンスに対して同じメソッドを呼び出して、すべてのクエリのグローバル設定を設定することもできます。

### クエリ ID {#query-id}

`.with_option` を使用して、ClickHouse のクエリログにクエリを識別するための `query_id` オプションを設定できます。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

`query` だけでなく、`insert` と `inserter` メソッドでも同様に機能します。

:::danger
`query_id` を手動で設定する場合は、一意であることを確認してください。 UUID は良い選択肢です。
:::

詳細は: [query_id の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) クライアントリポジトリにあります。

### セッション ID {#session-id}

`query_id` と同様に、同じセッション内でステートメントを実行するために `session_id` を設定できます。 `session_id` は、クライアントレベルでグローバルに設定することも、`query`、`insert`、または `inserter` コールごとに設定することもできます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
クラスターデプロイメントの場合、「スティッキーセッション」が欠如しているため、この機能を適切に利用するには特定のクラスターノードに接続する必要があります。 例えば、ラウンドロビンのロードバランサーが後続のリクエストを同じ ClickHouse ノードによって処理することを保証することはありません。
:::

詳細は: [session_id の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) クライアントリポジトリにあります。

### カスタム HTTP ヘッダー {#custom-http-headers}

プロキシ認証を使用している場合やカスタムヘッダーを渡す必要がある場合は、次のように行います:

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

詳細は: [カスタム HTTP ヘッダーの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) クライアントリポジトリにあります。

### カスタム HTTP クライアント {#custom-http-client}

これは、基盤となる HTTP 接続プール設定を調整するのに便利です。

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // または HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // クライアント側で特定のアイドルソケットをどれくらいの時間（ミリ秒単位）保持するか。
    // これは ClickHouse サーバーの KeepAlive タイムアウトよりも大幅に短くすることを想定しています。
    // これは、23.11 以前のバージョンでデフォルトが 3 秒で、以降は 10 秒です。
    .pool_idle_timeout(Duration::from_millis(2_500))
    // プール内で許可される最大アイドル Keep-Alive 接続数を設定します。
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
この例はレガシー Hyper API に依存しており、将来的に変更される可能性があります。
:::

詳細は: [カスタム HTTP クライアントの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) クライアントリポジトリにあります。

## データ型 {#data-types}

:::info
追加の例も参照してください:
* [シンプルな ClickHouse データ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
* [コンテナのような ClickHouse データ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
:::

* `(U)Int(8|16|32|64|128)` は対応する `(u|i)(8|16|32|64|128)` 型またはそれに基づく新しい型をマッピングします。
* `(U)Int256` は直接サポートされていませんが、[回避策があります](https://github.com/ClickHouse/clickhouse-rs/issues/48)。
* `Float(32|64)` は対応する `f(32|64)` またはそれに基づく新しい型をマッピングします。
* `Decimal(32|64|128)` は対応する `i(32|64|128)` またはそれに基づく新しい型をマッピングします。 `fixnum` より便利な実装などの有符号固定小数点数を使用することをお勧めします。
* `Boolean` は `bool` またはそれに基づく新しい型をマッピングします。
* `String` は任意の文字列またはバイト型（例: `&str`, `&[u8]`, `String`, `Vec<u8>` または [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html)）にマッピングします。 新しい型もサポートされます。 バイトを保存するには、[`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/) を使用することを検討してください。これはより効率的です。

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

* `FixedString(N)` はバイトの配列としてサポートされています。例: `[u8; N]`。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```
* `Enum(8|16)` は [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/) を使用してサポートされています。

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
* `UUID` は [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) にマッピングされ、`serde::uuid` を使用します。 `uuid` 機能を必要とします。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```
* `IPv6` は [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html) にマッピングされます。
* `IPv4` は [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) にマッピングされ、`serde::ipv4` を使用します。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```
* `Date` は `u16` またはそれの新しい型にマッピングされ、`1970-01-01` から経過した日数を表します。 また、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) が `serde::time::date` を使用してサポートされており、`time` 機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```
* `Date32` は `i32` またはそれの新しい型にマッピングされ、`1970-01-01` から経過した日数を表します。また、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) が `serde::time::date32` を使用してサポートされており、`time` 機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```
* `DateTime` は `u32` またはそれの新しい型にマッピングされ、UNIX エポックから経過した秒数を表します。 また、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) が `serde::time::datetime` を使用してサポートされており、`time` 機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` は `i32` またはそれの新しい型にマッピングされ、UNIX エポックからの経過時間を表します。 また、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) が `serde::time::datetime64::*` を使用してサポートされており、`time` 機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // `DateTime64(X)` に応じて経過した s/us/ms/ns
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

* `Tuple(A, B, ...)` は `(A, B, ...)` またはそれに基づく新しい型にマッピングされます。
* `Array(_)` は任意のスライス (例: `Vec<_>`, `&[_]`) にマッピングされます。 新しい型もサポートされます。
* `Map(K, V)` は `Array((K, V))` のように振る舞います。
* `LowCardinality(_)` はシームレスにサポートされています。
* `Nullable(_)` は `Option<_>` にマッピングされます。 `clickhouse::serde::*` ヘルパーを追加するには `::option` を使用します。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```
* `Nested` は複数の配列を提供してリネームすることによってサポートされています。
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
* `Geo` 型はサポートされています。 `Point` はタプル `(f64, f64)` のように振る舞い、残りの型はポイントのスライスです。
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

* `Variant`, `Dynamic`, (新しい) `JSON` データ型はまだサポートされていません。

## モッキング {#mocking}
このクレートは、CH サーバーをモックし、DDL、`SELECT`、`INSERT` および `WATCH` クエリをテストするためのユーティリティを提供します。 機能は `test-util` 機能を有効にすることで利用できます。 **dev-dependency にのみ使用してください**。

[例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs) を参照してください。

## トラブルシューティング {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

`CANNOT_READ_ALL_DATA` エラーの最も一般的な原因は、アプリケーション側の行定義が ClickHouse のそれと一致しないことです。

次のテーブルを考えてみましょう:

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

その後、`EventLog` がアプリケーション側で不一致な型で定義されている場合、例えば:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- u32 であるべきです！
}
```

データを挿入する際に、次のようなエラーが発生することがあります:

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

この例では、`EventLog` 構造体の正しい定義によって修正されます:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```

## 既知の制限 {#known-limitations}

* `Variant`, `Dynamic`, (新しい) `JSON` データ型はまだサポートされていません。
* サーバー側のパラメータバインディングはまだサポートされていません; [この問題](https://github.com/ClickHouse/clickhouse-rs/issues/142) を参照してください。

## お問い合わせ {#contact-us}

質問がある場合やヘルプが必要な場合は、[Community Slack](https://clickhouse.com/slack) または [GitHub のイシュー](https://github.com/ClickHouse/clickhouse-rs/issues) でお気軽にお問い合わせください。
