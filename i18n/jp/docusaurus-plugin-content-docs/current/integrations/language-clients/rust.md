---
sidebar_label: 'Rust'
sidebar_position: 5
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: 'ClickHouseに接続するための公式 Rust クライアント。'
title: 'ClickHouse Rust クライアント'
doc_type: 'reference'
---



# ClickHouse Rust クライアント

もともと [Paul Loyd](https://github.com/loyd) によって開発された、ClickHouse に接続するための公式 Rust クライアントです。クライアントのソースコードは [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-rs) で入手できます。



## 概要 {#overview}

- 行のエンコード/デコードに`serde`を使用します。
- `serde`属性（`skip_serializing`、`skip_deserializing`、`rename`）をサポートします。
- HTTPトランスポート上で[`RowBinary`](/interfaces/formats/RowBinary)形式を使用します。
  - TCP上で[`Native`](/interfaces/formats/Native)に切り替える計画があります。
- TLSをサポートします（`native-tls`および`rustls-tls`機能を使用）。
- 圧縮と解凍（LZ4）をサポートします。
- データの選択または挿入、DDLの実行、クライアント側バッチ処理のためのAPIを提供します。
- ユニットテスト用の便利なモックを提供します。


## インストール {#installation}

このクレートを使用するには、`Cargo.toml`に以下を追加してください：

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

参照：[crates.ioページ](https://crates.io/crates/clickhouse)


## Cargoフィーチャー {#cargo-features}

- `lz4`(デフォルトで有効) — `Compression::Lz4`および`Compression::Lz4Hc(_)`バリアントを有効にします。有効にすると、`WATCH`を除くすべてのクエリに対してデフォルトで`Compression::Lz4`が使用されます。
- `native-tls` — `hyper-tls`を介して`HTTPS`スキーマのURLをサポートします。OpenSSLに対してリンクします。
- `rustls-tls` — `hyper-rustls`を介して`HTTPS`スキーマのURLをサポートします。OpenSSLに対してリンクしません。
- `inserter` — `client.inserter()`を有効にします。
- `test-util` — モックを追加します。[サンプル](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)を参照してください。`dev-dependencies`でのみ使用してください。
- `watch` — `client.watch`機能を有効にします。詳細については該当するセクションを参照してください。
- `uuid` — [uuid](https://docs.rs/uuid)クレートと連携するために`serde::uuid`を追加します。
- `time` — [time](https://docs.rs/time)クレートと連携するために`serde::time`を追加します。

:::important
`HTTPS` URLを介してClickHouseに接続する場合、`native-tls`または`rustls-tls`フィーチャーのいずれかを有効にする必要があります。
両方が有効になっている場合、`rustls-tls`フィーチャーが優先されます。
:::


## ClickHouse versions compatibility {#clickhouse-versions-compatibility}

このクライアントは、ClickHouseのLTSバージョン以降、およびClickHouse Cloudと互換性があります。

v22.6より前のClickHouseサーバーでは、[まれなケースでRowBinaryが正しく処理されません](https://github.com/ClickHouse/ClickHouse/issues/37420)。
この問題を解決するには、v0.11以降を使用し、`wa-37420`機能を有効にしてください。注意:この機能は新しいバージョンのClickHouseでは使用しないでください。


## 例 {#examples}

クライアントリポジトリの[examples](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples)では、クライアントの様々な使用シナリオをカバーしています。概要は[examples README](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview)でご確認いただけます。

例や以下のドキュメントで不明な点や不足している内容がございましたら、お気軽に[お問い合わせください](./rust.md#contact-us)。


## 使用方法 {#usage}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs) クレートは、ClickHouseから行型を生成するのに便利です。
:::

### クライアントインスタンスの作成 {#creating-a-client-instance}

:::tip
基盤となるhyper接続プールを再利用するために、作成したクライアントを再利用するか、クローンしてください。
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

HTTPSは`rustls-tls`または`native-tls`のいずれかのcargoフィーチャーで動作します。

次に、通常通りクライアントを作成します。この例では、環境変数を使用して接続の詳細を保存しています:

:::important
URLにはプロトコルとポートの両方を含める必要があります。例: `https://instance.clickhouse.cloud:8443`
:::

```rust
fn read_env_var(key: &str) -> String {
    env::var(key).unwrap_or_else(|_| panic!("{key}環境変数を設定する必要があります"))
}

let client = Client::default()
    .with_url(read_env_var("CLICKHOUSE_URL"))
    .with_user(read_env_var("CLICKHOUSE_USER"))
    .with_password(read_env_var("CLICKHOUSE_PASSWORD"));
```

参照:

- クライアントリポジトリの[ClickHouse CloudでのHTTPSの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs)。これはオンプレミスのHTTPS接続にも適用できます。

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

- プレースホルダー`?fields`は`no, name`(`Row`のフィールド)に置き換えられます。
- プレースホルダー`?`は、後続の`bind()`呼び出しの値に置き換えられます。
- 便利な`fetch_one::<Row>()`および`fetch_all::<Row>()`メソッドを使用して、それぞれ最初の行またはすべての行を取得できます。
- `sql::Identifier`はテーブル名をバインドするために使用できます。

注意: レスポンス全体がストリーミングされるため、カーソルは一部の行を生成した後でもエラーを返す可能性があります。このような状況が発生した場合は、サーバー側でレスポンスバッファリングを有効にするために`query(...).with_option("wait_end_of_query", "1")`を試すことができます。[詳細](/interfaces/http/#response-buffering)。`buffer_size`オプションも有用です。

:::warning
行を選択する際は`wait_end_of_query`を慎重に使用してください。サーバー側でのメモリ消費量が増加し、全体的なパフォーマンスが低下する可能性があります。
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

- `end()`が呼び出されない場合、`INSERT`は中止されます。
- 行はネットワーク負荷を分散するためにストリームとして段階的に送信されます。
- ClickHouseは、すべての行が同じパーティションに収まり、その数が[`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size)未満の場合にのみ、バッチをアトミックに挿入します。

### 非同期挿入(サーバー側バッチ処理) {#async-insert-server-side-batching}

[ClickHouseの非同期挿入](/optimize/asynchronous-inserts)を使用して、受信データのクライアント側バッチ処理を回避できます。これは、`insert`メソッド(または`Client`インスタンス自体)に`async_insert`オプションを指定するだけで実現でき、すべての`insert`呼び出しに影響します。


```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

参照:

- クライアントリポジトリの[非同期挿入の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs)

### Inserter機能（クライアント側バッチ処理） {#inserter-feature-client-side-batching}

`inserter` cargoフィーチャーが必要です。

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

// アプリケーションのシャットダウン時にinserterを終了し、
// 残りの行をコミットすることを忘れないでください。`.end()`は統計情報も提供します。
inserter.end().await?;
```

- `Inserter`は、いずれかの閾値（`max_bytes`、`max_rows`、`period`）に達した場合、`commit()`でアクティブな挿入を終了します。
- アクティブな`INSERT`の終了間隔は、`with_period_bias`を使用して調整することで、並列inserterによる負荷スパイクを回避できます。
- `Inserter::time_left()`を使用して、現在の期間がいつ終了するかを検出できます。ストリームがまれにアイテムを発行する場合は、`Inserter::commit()`を再度呼び出して制限を確認してください。
- 時間閾値は[quanta](https://docs.rs/quanta)クレートを使用して実装され、`inserter`を高速化します。`test-util`が有効な場合は使用されません（したがって、カスタムテストでは`tokio::time::advance()`で時間を管理できます）。
- `commit()`呼び出し間のすべての行は、同じ`INSERT`ステートメントで挿入されます。

:::warning
挿入を終了する場合は、フラッシュを忘れないでください:

```rust
inserter.end().await?;
```

:::

### DDLの実行 {#executing-ddls}

単一ノードのデプロイメントでは、次のようにDDLを実行するだけで十分です:

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

ただし、ロードバランサーを使用したクラスター化されたデプロイメントやClickHouse Cloudでは、`wait_end_of_query`オプションを使用して、DDLがすべてのレプリカに適用されるまで待機することを推奨します。これは次のように実行できます:

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```

### ClickHouse設定 {#clickhouse-settings}

`with_option`メソッドを使用して、さまざまな[ClickHouse設定](/operations/settings/settings)を適用できます。例:

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // この設定は、この特定のクエリにのみ適用されます。
    // グローバルなクライアント設定を上書きします。
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

`query`に加えて、`insert`および`inserter`メソッドでも同様に機能します。さらに、`Client`インスタンスで同じメソッドを呼び出して、すべてのクエリのグローバル設定を設定できます。

### クエリID {#query-id}

`.with_option`を使用して、`query_id`オプションを設定し、ClickHouseクエリログでクエリを識別できます。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

`query`に加えて、`insert`および`inserter`メソッドでも同様に機能します。

:::danger
`query_id`を手動で設定する場合は、一意であることを確認してください。UUIDはこの目的に適しています。
:::

参照: クライアントリポジトリの[query_idの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs)

### セッションID {#session-id}


`query_id`と同様に、`session_id`を設定することで、同一セッション内でステートメントを実行できます。`session_id`は、クライアントレベルでグローバルに設定するか、`query`、`insert`、または`inserter`の各呼び出しごとに設定できます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
クラスタ構成の環境では、「スティッキーセッション」が存在しないため、この機能を適切に利用するには_特定のクラスタノード_に接続する必要があります。例えば、ラウンドロビン方式のロードバランサーでは、連続するリクエストが同じClickHouseノードで処理されることが保証されません。
:::

参照: クライアントリポジトリの[session_idの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs)

### カスタムHTTPヘッダー {#custom-http-headers}

プロキシ認証を使用している場合や、カスタムヘッダーを渡す必要がある場合は、次のように設定できます:

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

参照: クライアントリポジトリの[カスタムHTTPヘッダーの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs)

### カスタムHTTPクライアント {#custom-http-client}

これは、基盤となるHTTP接続プールの設定を調整する際に有用です。

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // or HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // クライアント側で特定のアイドルソケットを維持する時間(ミリ秒単位)。
    // ClickHouseサーバーのKeepAliveタイムアウトよりもかなり短く設定することが推奨されます。
    // デフォルトでは、23.11以前のバージョンでは3秒、それ以降のバージョンでは10秒です。
    .pool_idle_timeout(Duration::from_millis(2_500))
    // プール内で許可されるアイドル状態のKeepAlive接続の最大数を設定します。
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
この例はレガシーのHyper APIに依存しており、将来変更される可能性があります。
:::

参照: クライアントリポジトリの[カスタムHTTPクライアントの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs)


## データ型 {#data-types}

:::info
追加の例も参照してください：

- [シンプルなClickHouseデータ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
- [コンテナ型のClickHouseデータ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
  :::

- `(U)Int(8|16|32|64|128)` は対応する `(u|i)(8|16|32|64|128)` 型またはそれらを囲むニュータイプとの間でマッピングされます。
- `(U)Int256` は直接サポートされていませんが、[回避策](https://github.com/ClickHouse/clickhouse-rs/issues/48)があります。
- `Float(32|64)` は対応する `f(32|64)` またはそれらを囲むニュータイプとの間でマッピングされます。
- `Decimal(32|64|128)` は対応する `i(32|64|128)` またはそれらを囲むニュータイプとの間でマッピングされます。[`fixnum`](https://github.com/loyd/fixnum) または符号付き固定小数点数の他の実装を使用する方が便利です。
- `Boolean` は `bool` またはそれを囲むニュータイプとの間でマッピングされます。
- `String` は任意の文字列型またはバイト型（例：`&str`、`&[u8]`、`String`、`Vec<u8>`、[`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html)）との間でマッピングされます。ニュータイプもサポートされています。バイトを格納する場合は、より効率的な [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/) の使用を検討してください。

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

- `FixedString(N)` はバイト配列（例：`[u8; N]`）としてサポートされています。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```

- `Enum(8|16)` は [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/) を使用してサポートされています。

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

- `UUID` は `serde::uuid` を使用して [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) との間でマッピングされます。`uuid` 機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```

- `IPv6` は [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html) との間でマッピングされます。
- `IPv4` は `serde::ipv4` を使用して [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) との間でマッピングされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```

- `Date` は `u16` またはそれを囲むニュータイプとの間でマッピングされ、`1970-01-01` からの経過日数を表します。また、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) は `serde::time::date` を使用してサポートされており、`time` 機能が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

- `Date32` は `i32` またはそれを囲むニュータイプとの間でマッピングされ、`1970-01-01` からの経過日数を表します。また、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) は `serde::time::date32` を使用してサポートされており、`time` 機能が必要です。


```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```

* `DateTime` は `u32` またはそれを包む newtype との間でマッピングされ、UNIX エポックからの経過秒数を表します。 また、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) も、`time` フィーチャーを有効にすることで利用可能な `serde::time::datetime` を使用してサポートされています。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` は `i32` またはそれをラップした newtype にマップされ、UNIX エポック以降の経過時間を表します。加えて、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) も、`time` フィーチャーを有効にしたうえで `serde::time::datetime64::*` を利用することでサポートされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // `DateTime64(X)` に応じて経過秒/マイクロ秒/ミリ秒/ナノ秒
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

* `Tuple(A, B, ...)` は `(A, B, ...)` またはそれを包む newtype との相互変換に対応します。
* `Array(_)` は任意のスライス（例: `Vec<_>`, `&[_]`）との相互変換に対応します。newtype もサポートされています。
* `Map(K, V)` は `Array((K, V))` のように振る舞います。
* `LowCardinality(_)` はシームレスにサポートされています。
* `Nullable(_)` は `Option<_>` との相互変換に対応します。`clickhouse::serde::*` ヘルパーを利用する場合は `::option` を追加してください。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```

* `Nested` は、名称を付け直した複数の配列を指定することでサポートされます。

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

* `Geo` 型がサポートされています。`Point` はタプル `(f64, f64)` のように振る舞い、残りの型はすべて `Point` のスライスです。

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

* `Variant`、`Dynamic`、新しい `JSON` データ型はまだサポートされていません。


## モック {#mocking}

このクレートは、ClickHouseサーバーをモック化し、DDL、`SELECT`、`INSERT`、`WATCH`クエリをテストするためのユーティリティを提供します。この機能は`test-util`フィーチャーで有効にできます。開発依存関係として**のみ**使用してください。

[サンプル](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)を参照してください。


## トラブルシューティング {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

`CANNOT_READ_ALL_DATA` エラーの最も一般的な原因は、アプリケーション側の行定義がClickHouseの定義と一致していないことです。

以下のテーブルを例として考えます:

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

次に、アプリケーション側で `EventLog` が型不一致で定義されている場合、例えば:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- u32であるべきです!
}
```

データを挿入する際に、以下のエラーが発生する可能性があります:

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

この例では、`EventLog` 構造体を正しく定義することで修正できます:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```


## 既知の制限事項 {#known-limitations}

- `Variant`、`Dynamic`、(新しい) `JSON` データ型は現在サポートされていません。
- サーバーサイドのパラメータバインディングは現在サポートされていません。進捗状況については[この issue](https://github.com/ClickHouse/clickhouse-rs/issues/142) を参照してください。


## お問い合わせ {#contact-us}

ご質問やサポートが必要な場合は、[Community Slack](https://clickhouse.com/slack)または[GitHub issues](https://github.com/ClickHouse/clickhouse-rs/issues)よりお気軽にお問い合わせください。
