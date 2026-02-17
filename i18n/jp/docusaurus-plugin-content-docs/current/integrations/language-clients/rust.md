---
sidebar_label: 'Rust'
sidebar_position: 5
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: 'ClickHouse 用公式 Rust クライアント。'
title: 'ClickHouse Rust クライアント'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

# ClickHouse Rust クライアント \{#clickhouse-rust-client\}

Rust 用の ClickHouse 公式クライアントであり、元々は [Paul Loyd](https://github.com/loyd) によって開発されました。クライアントのソースコードは [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-rs) で公開されています。

## 概要 \{#overview\}

* 行のエンコード／デコードに `serde` を使用します。
* `serde` の属性 `skip_serializing`、`skip_deserializing`、`rename` をサポートします。
* HTTP トランスポート経由で [`RowBinary`](/interfaces/formats/RowBinary) フォーマットを使用します。
  * TCP 経由の [`Native`](/interfaces/formats/Native) への移行が計画されています。
* TLS（`native-tls` および `rustls-tls` 機能経由）をサポートします。
* 圧縮および伸長（LZ4）をサポートします。
* データの SELECT／INSERT、DDL の実行、クライアント側でのバッチ処理のための API を提供します。
* ユニットテスト用の便利なモックを提供します。

## インストール \{#installation\}

このクレートを使用するには、`Cargo.toml` に以下を追加します。

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

関連情報: [crates.io のページ](https://crates.io/crates/clickhouse)。


## Cargo features \{#cargo-features\}

* `lz4` (デフォルトで有効) — `Compression::Lz4` および `Compression::Lz4Hc(_)` バリアントを有効にします。有効になっている場合、`WATCH` を除くすべてのクエリで、デフォルトとして `Compression::Lz4` が使用されます。
* `native-tls` — OpenSSL にリンクする `hyper-tls` を介して、`HTTPS` スキームを持つ URL をサポートします。
* `rustls-tls` — OpenSSL にリンクしない `hyper-rustls` を介して、`HTTPS` スキームを持つ URL をサポートします。
* `inserter` — `client.inserter()` を有効にします。
* `test-util` — モックを追加します。[例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs) を参照してください。`dev-dependencies` でのみ使用してください。
* `watch` — `client.watch` 機能を有効にします。詳細は該当セクションを参照してください。
* `uuid` — [uuid](https://docs.rs/uuid) クレートと連携するために `serde::uuid` を追加します。
* `time` — [time](https://docs.rs/time) クレートと連携するために `serde::time` を追加します。

:::important
`HTTPS` URL 経由で ClickHouse に接続する場合は、`native-tls` または `rustls-tls` のいずれかの feature を有効にする必要があります。
両方を有効にした場合は、`rustls-tls` feature が優先されます。
:::

## ClickHouse バージョン互換性 \{#clickhouse-versions-compatibility\}

このクライアントは、ClickHouse の LTS 以降のバージョンおよび ClickHouse Cloud と互換性があります。

v22.6 より古い ClickHouse サーバーは、RowBinary を[まれなケースで誤って処理します](https://github.com/ClickHouse/ClickHouse/issues/37420)。
この問題を解決するには、v0.11 以降を使用し、`wa-37420` 機能を有効にしてください。注意：この機能は新しい ClickHouse バージョンでは使用すべきではありません。

## Examples \{#examples\}

クライアントリポジトリ内の[examples](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples)では、クライアントのさまざまな利用シナリオを網羅することを目的としています。概要は [examples README](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview) で確認できます。

examples や以下のドキュメントに不明点や不足がある場合は、遠慮なく[お問い合わせください](./rust.md#contact-us)。

## 使用方法 \{#usage\}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs) クレートは、ClickHouse の行を表す型を生成するのに便利です。
:::

### クライアントインスタンスの作成 \{#creating-a-client-instance\}

:::tip
既存のクライアントを再利用するか、クローンして、基盤となる hyper の接続プールを再利用してください。
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


### HTTPS または ClickHouse Cloud への接続 \{#https-or-clickhouse-cloud-connection\}

HTTPS は `rustls-tls` または `native-tls` のいずれかの Cargo feature で動作します。

その後、通常どおりクライアントを作成します。次の例では、環境変数を使用して接続情報を保持します。

:::important
URL にはプロトコルとポートの両方を含める必要があります。例: `https://instance.clickhouse.cloud:8443`
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

参照:

* クライアントリポジトリ内の [ClickHouse Cloud を用いた HTTPS の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs)。これはオンプレミス環境で HTTPS 接続を行う場合にも適用できます。


### 行の取得 \{#selecting-rows\}

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

* プレースホルダー `?fields` は、`Row` のフィールドである `no, name` に置き換えられます。
* プレースホルダー `?` は、後続の `bind()` 呼び出しで指定された値に置き換えられます。
* 先頭の行またはすべての行を取得するには、それぞれ `fetch_one::<Row>()` および `fetch_all::<Row>()` という便利なメソッドを使用できます。
* テーブル名のバインドには `sql::Identifier` を使用できます。

補足: レスポンス全体がストリーミングされるため、カーソルは一部の行を生成した後でもエラーを返す可能性があります。これがご利用のユースケースで問題になる場合は、サーバー側でレスポンスのバッファリングを有効にするために `query(...).with_option("wait_end_of_query", "1")` を試してみてください。詳細は[こちら](/interfaces/http/#response-buffering)を参照してください。`buffer_size` オプションも有用な場合があります。

:::warning
行を選択する際に `wait_end_of_query` を使用する場合は注意してください。サーバー側でのメモリ消費量が増加し、全体的なパフォーマンスが低下する可能性が高くなります。
:::


### 行の挿入 \{#inserting-rows\}

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

* `end()` が呼び出されない場合、`INSERT` は中止されます。
* 行はネットワーク負荷を分散するため、ストリームとして順次送信されます。
* ClickHouse は、すべての行が同じパーティションに収まり、かつ行数が [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size) 未満である場合にのみ、バッチ挿入をアトミックに行います。


### 非同期インサート（サーバーサイドでのバッチ処理） \{#async-insert-server-side-batching\}

受信データをクライアントサイドでバッチ処理する必要がないようにするには、[ClickHouse asynchronous inserts](/optimize/asynchronous-inserts) 機能を利用できます。これは、`insert` メソッドに `async_insert` オプションを指定するだけで有効化できます（または `Client` インスタンス自体に指定して、すべての `insert` 呼び出しに適用させることもできます）。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

関連情報:

* クライアントリポジトリの [非同期インサートの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs)。


### Inserter 機能（クライアント側バッチ処理） \{#inserter-feature-client-side-batching\}

Cargo の `inserter` フィーチャが必要です。

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

* `Inserter` は、いずれかのしきい値（`max_bytes`、`max_rows`、`period`）に達した場合、`commit()` 内でアクティブな `INSERT` を終了します。
* 並列 inserter による負荷スパイクを避けるため、`with_period_bias` を使用してアクティブな `INSERT` を終了する間隔にバイアスをかけることができます。
* 現在の period がいつ終了するかを検出するには `Inserter::time_left()` を使用できます。ストリームがまれにしか要素を出力しない場合は、`Inserter::commit()` を再度呼び出してしきい値を再確認してください。
* 時間のしきい値は [quanta](https://docs.rs/quanta) クレートを使用して実装されており、`inserter` の高速化に役立ちます。`test-util` が有効な場合には使用されません（この場合、カスタムテストでは `tokio::time::advance()` によって時間を制御できます）。
* `commit()` 呼び出しの間にあるすべての行は、同じ `INSERT` ステートメントで挿入されます。

:::warning
挿入処理を終了／完了させたい場合は、`flush` を忘れないでください：

```rust
inserter.end().await?;
```

:::


### DDL の実行 \{#executing-ddls\}

シングルノードのデプロイメントの場合、DDL は次のように実行すれば十分です。

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

しかし、ロードバランサー経由の構成や ClickHouse Cloud を利用したクラスターデプロイメントでは、`wait_end_of_query` オプションを使用して、DDL がすべてのレプリカに適用されるまで待機することを推奨します。これは次のように行います。

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```


### ClickHouse の設定 \{#clickhouse-settings\}

`with_option` メソッドを使用して、さまざまな [ClickHouse settings](/operations/settings/settings) を適用できます。例えば：

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // This setting will be applied to this particular query only;
    // it will override the global client setting.
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

`query` のほか、`insert` および `inserter` メソッドでも同様に動作します。さらに、同じメソッドを `Client` インスタンスに対して呼び出すことで、すべてのクエリに適用されるグローバルな設定を行うこともできます。


### クエリ ID \{#query-id\}

`.with_option` を使用すると、ClickHouse のクエリログでクエリを特定できるように、`query_id` オプションを設定できます。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

`query` 以外にも、`insert` および `inserter` メソッドでも同様に動作します。

:::danger
`query_id` を手動で設定する場合は、必ず一意になるようにしてください。そのためには UUID を使用するのがよい選択です。
:::

関連項目: クライアントリポジトリ内の [query&#95;id example](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs)


### セッション ID \{#session-id\}

`query_id` と同様に、同じセッション内で文を実行するために `session_id` を設定できます。`session_id` は、クライアントレベルでグローバルに、または `query`、`insert`、`inserter` の各呼び出しごとに設定できます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
クラスタ構成のデプロイメントでは、&quot;sticky sessions&quot; がないため、この機能を正しく利用するには *特定のクラスタノード* に接続されている必要があります。例えば、ラウンドロビン方式のロードバランサーでは、後続のリクエストが常に同じ ClickHouse ノードで処理されることは保証されません。
:::

クライアントリポジトリ内の [session&#95;id の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs)も参照してください。


### カスタム HTTP ヘッダー \{#custom-http-headers\}

プロキシ認証を使用している場合やカスタムヘッダーを渡す必要がある場合は、次のように指定できます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

関連項目: クライアントリポジトリ内の [custom HTTP headers のサンプル](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) を参照してください。


### カスタム HTTP クライアント \{#custom-http-client\}

これは、基盤となる HTTP コネクションプールの設定を調整する際に役立ちます。

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
このサンプルコードはレガシー Hyper API に依存しており、将来的に変更される可能性があります。
:::

関連情報: クライアントリポジトリ内の [custom HTTP client example](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) を参照してください。


## データ型 \{#data-types\}

:::info
追加のサンプルも参照してください:

* [よりシンプルな ClickHouse データ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)

* [コンテナ風の ClickHouse データ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
  :::

* `(U)Int(8|16|32|64|128)` は、対応する `(u|i)(8|16|32|64|128)` 型、またはそれらをラップする newtype で定義した型にマップされます。

* `(U)Int256` は直接のサポートはありませんが、[回避策があります](https://github.com/ClickHouse/clickhouse-rs/issues/48)。

* `Float(32|64)` は、対応する `f(32|64)` またはそれらをラップする newtype で定義した型にマップされます。

* `Decimal(32|64|128)` は、対応する `i(32|64|128)` またはそれらをラップする newtype で定義した型にマップされます。符号付き固定小数点数の実装としては、[`fixnum`](https://github.com/loyd/fixnum) などを使用するほうが便利です。

* `Boolean` は `bool` またはそれをラップする newtype で定義した型にマップされます。

* `String` は、任意の文字列またはバイト列型、たとえば `&str`、`&[u8]`、`String`、`Vec<u8>`、[`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html) などにマップされます。独自定義の型もサポートされます。バイト列を保存するには、[`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/) の利用を検討してください。より効率的です。

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

* `FixedString(N)` は、バイト配列（例えば `[u8; N]`）としてサポートされています。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```

* `Enum(8|16)` は [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/) を使用することでサポートされています。

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

* `UUID` は `serde::uuid` を使用して [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) との相互変換に対応しています。`uuid` feature フラグが必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```

* `IPv6` は [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html) と相互変換されます。
* `IPv4` は `serde::ipv4` を使用して [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) と相互変換されます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```

* `Date` は `u16` またはそれを包む newtype との相互変換を行い、`1970-01-01` からの経過日数を表します。さらに、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) も、`time` feature を有効にした上で `serde::time::date` を使用することでサポートされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

* `Date32` は `i32` またはそれをラップした newtype との相互変換に対応しており、`1970-01-01` からの経過日数を表します。また、`time` フィーチャが有効であれば、`serde::time::date32` を利用して [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) もサポートされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```


* `DateTime` は `u32` またはそれを包んだ newtype と相互にマッピングされ、UNIX エポックからの経過秒数を表します。また、`time` feature を有効にすることで利用可能になる `serde::time::datetime` を用いることで、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) もサポートされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` は `i32` またはそれをラップした newtype にマッピングされ、UNIX エポックからの経過時間を表します。また、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) も、`time` feature を有効にしたうえで `serde::time::datetime64::*` を利用することでサポートされます。

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

* `Tuple(A, B, ...)` は `(A, B, ...)` またはそれをラップした newtype との相互変換になります。
* `Array(_)` は任意のスライス（例: `Vec<_>`、`&[_]`）との相互変換になります。newtype もサポートされています。
* `Map(K, V)` は `Array((K, V))` と同様に動作します。
* `LowCardinality(_)` はシームレスにサポートされています。
* `Nullable(_)` は `Option<_>` との相互変換になります。`clickhouse::serde::*` ヘルパーに対しては `::option` を追加してください。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```

* `Nested` は、複数の配列を指定してそれらに別名を付けることでサポートされます。

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

* `Geo` 型がサポートされています。`Point` はタプル `(f64, f64)` のように振る舞い、それ以外の型はすべて `Point` のスライスにすぎません。

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

* `Variant`、`Dynamic`、および（新しい）`JSON` データ型は、まだサポートされていません。


## モック化 \{#mocking\}

このクレートは、ClickHouse サーバーのモックや DDL、`SELECT`、`INSERT`、`WATCH` クエリのテストのためのユーティリティを提供します。この機能は `test-util` フィーチャーを有効にすることで使用できます。Cargo の `dev-dependencies` として**のみ**使用してください。

[例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)を参照してください。

## トラブルシューティング \{#troubleshooting\}

### CANNOT_READ_ALL_DATA \{#cannot_read_all_data\}

`CANNOT_READ_ALL_DATA` エラーの最も一般的な原因は、アプリケーション側の行定義が ClickHouse 側の定義と一致していないことです。

次のテーブルを考えてみましょう。

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

次に、アプリケーション側で `EventLog` が型の不一致を起こす形で定義されている場合、例えば次のようになります。

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- should be u32 instead!
}
```

データの挿入時に、次のエラーが発生することがあります。

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

この例では、`EventLog` 構造体を正しく定義することで修正されます。

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```


## 既知の制限事項 \{#known-limitations\}

* `Variant`、`Dynamic`、（新しい）`JSON` データ型にはまだ対応していません。
* サーバーサイドのパラメータバインディングにはまだ対応していません。進捗の追跡については [this issue](https://github.com/ClickHouse/clickhouse-rs/issues/142) を参照してください。

## お問い合わせ \{#contact-us\}

ご質問やサポートが必要な場合は、[Community Slack](https://clickhouse.com/slack) または [GitHub の issue](https://github.com/ClickHouse/clickhouse-rs/issues) からお気軽にご連絡ください。