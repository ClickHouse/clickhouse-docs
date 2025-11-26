---
sidebar_label: 'Rust'
sidebar_position: 5
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: 'ClickHouseに接続するための公式 Rust クライアントです。'
title: 'ClickHouse Rust クライアント'
doc_type: 'reference'
---



# ClickHouse Rust クライアント

[Paul Loyd](https://github.com/loyd) によって最初に開発された、ClickHouse への接続に使用する公式の Rust クライアントです。クライアントのソースコードは [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-rs) で公開されています。



## 概要 {#overview}

* 行のエンコード/デコードに `serde` を使用します。
* `serde` の属性 `skip_serializing`、`skip_deserializing`、`rename` をサポートします。
* HTTP 経由で [`RowBinary`](/interfaces/formats/RowBinary) 形式を使用します。
  * TCP 上の [`Native`](/interfaces/formats/Native) への切り替えを計画しています。
* TLS（`native-tls` および `rustls-tls` 機能経由）をサポートします。
* 圧縮および解凍（LZ4）をサポートします。
* データの SELECT/INSERT、DDL の実行、クライアント側でのバッチ処理のための API を提供します。
* 単体テスト用の便利なモックを提供します。



## インストール

このクレートを使用するには、`Cargo.toml` に次を追加してください。

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

あわせて [crates.io のページ](https://crates.io/crates/clickhouse) も参照してください。


## Cargo features {#cargo-features}

* `lz4` (デフォルトで有効) — `Compression::Lz4` および `Compression::Lz4Hc(_)` バリアントを有効にします。有効になっている場合、`WATCH` を除くすべてのクエリで `Compression::Lz4` がデフォルトで使用されます。
* `native-tls` — OpenSSL にリンクする `hyper-tls` を介して、スキームが `HTTPS` の URL をサポートします。
* `rustls-tls` — OpenSSL にリンクしない `hyper-rustls` を介して、スキームが `HTTPS` の URL をサポートします。
* `inserter` — `client.inserter()` を有効にします。
* `test-util` — モックを追加します。[サンプル](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)を参照してください。`dev-dependencies` でのみ使用してください。
* `watch` — `client.watch` の機能を有効にします。詳細は該当セクションを参照してください。
* `uuid` — [uuid](https://docs.rs/uuid) クレートと連携するために `serde::uuid` を追加します。
* `time` — [time](https://docs.rs/time) クレートと連携するために `serde::time` を追加します。

:::important
`HTTPS` の URL 経由で ClickHouse に接続する場合は、`native-tls` または `rustls-tls` のいずれかの feature を有効にする必要があります。
両方が有効な場合は、`rustls-tls` feature が優先されます。
:::



## ClickHouse バージョン互換性 {#clickhouse-versions-compatibility}

このクライアントは、LTS 以降のバージョンの ClickHouse および ClickHouse Cloud と互換性があります。

v22.6 より古い ClickHouse サーバーは、まれなケースで RowBinary を[誤って処理することがあります](https://github.com/ClickHouse/ClickHouse/issues/37420)。 
この問題を解決するには、v0.11 以上を使用し、`wa-37420` 機能を有効にしてください。なお、この機能は新しい ClickHouse バージョンでは使用しないでください。



## 例 {#examples}

クライアントリポジトリ内の[examples](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples)で、クライアントのさまざまな利用シナリオをカバーすることを目指しています。概要は [examples README](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview) で確認できます。

examples や以下のドキュメントに不明点や不足している点があれば、お気軽に[お問い合わせください](./rust.md#contact-us)。



## 使用方法

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs) crate は、ClickHouse から行型を生成するのに便利です。
:::

### クライアントインスタンスの作成

:::tip
作成したクライアントは再利用するか、クローンして基盤となる hyper のコネクションプールを共有するようにしてください。
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

### HTTPS または ClickHouse Cloud への接続

HTTPS は Cargo の `rustls-tls` または `native-tls` フィーチャーのどちらでも動作します。

その後、通常どおりクライアントを作成します。次の例では、接続情報を保存するために環境変数を使用しています。

:::important
URL にはプロトコルとポートの両方を含める必要があります。たとえば、`https://instance.clickhouse.cloud:8443` のように指定します。
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

こちらも参照してください:

* クライアントリポジトリにある [ClickHouse Cloud を用いた HTTPS の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs)。これはオンプレミス環境での HTTPS 接続にも適用可能です。

### 行の選択

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
* 先頭行または全行を取得するには、便利なメソッドである `fetch_one::<Row>()` および `fetch_all::<Row>()` をそれぞれ利用できます。
* テーブル名をバインドするには、`sql::Identifier` を使用できます。

注意: レスポンス全体がストリーミングされるため、カーソルは一部の行を返した後でもエラーを返す場合があります。このようなケースが想定される場合は、サーバー側でレスポンスのバッファリングを有効にするために、`query(...).with_option("wait_end_of_query", "1")` を試すことができます。詳細については、[こちら](/interfaces/http/#response-buffering) を参照してください。`buffer_size` オプションも有用な場合があります。

:::warning
行を選択する際に `wait_end_of_query` を使用する場合は注意してください。サーバー側でのメモリ消費が増加し、全体的なパフォーマンスが低下する可能性が高くなります。
:::

### 行の挿入

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
* 行はネットワーク負荷を分散するために、ストリームとして逐次送信されます。
* ClickHouse は、すべての行が同じパーティションに収まり、その行数が [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size) 未満である場合に限り、バッチをアトミックに挿入します。

### 非同期インサート（サーバーサイドでのバッチ処理）

受信データをクライアントサイドでバッチ処理しないようにするには、[ClickHouse asynchronous inserts](/optimize/asynchronous-inserts) を使用できます。これは、`insert` メソッドに `async_insert` オプションを指定するだけで有効化できます（あるいは `Client` インスタンス自体に指定して、すべての `insert` 呼び出しに適用させることもできます）。


```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

関連項目:

* クライアントリポジトリ内の [非同期インサートの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs)

### Inserter 機能（クライアント側バッチ処理）

Cargo フィーチャ `inserter` が必要です。

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

// アプリケーションのシャットダウン時には、inserterを終了して
// 残りの行をコミットすることを忘れないでください。`.end()`も統計情報を返します。
inserter.end().await?;
```

* `Inserter` は、いずれかのしきい値（`max_bytes`、`max_rows`、`period`）に達した場合、`commit()` 内で進行中の挿入処理を終了します。
* 進行中の `INSERT` を終了する間隔は、`with_period_bias` を使用してバイアスをかけることで調整でき、並列インサータによる負荷スパイクを回避できます。
* 現在の期間がいつ終了するかを検出するには `Inserter::time_left()` を使用できます。ストリームがまれにしかアイテムを出力しない場合は、`Inserter::commit()` を再度呼び出して、しきい値に達していないかを確認してください。
* 時間しきい値は、`inserter` を高速化するために [quanta](https://docs.rs/quanta) クレートを使用して実装されています。`test-util` が有効な場合は使用されません（この場合、カスタムテストでは `tokio::time::advance()` によって時間を制御できます）。
* `commit()` 呼び出しの間にあるすべての行は、同じ `INSERT` ステートメントで挿入されます。

:::warning
挿入処理を終了／確定したい場合は、フラッシュするのを忘れないでください：

```rust
inserter.end().await?;
```

:::

### DDL の実行

シングルノードのデプロイメントの場合、次のように DDL を実行するだけで問題ありません。

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

ただし、ロードバランサーを備えたクラスターデプロイメント環境や ClickHouse Cloud を利用している場合は、`wait_end_of_query` オプションを使用し、DDL がすべてのレプリカに適用されるまで待機することを推奨します。これは次のように実行できます。

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```

### ClickHouse の設定

`with_option` メソッドを使用して、さまざまな [ClickHouse の設定](/operations/settings/settings) を適用できます。たとえば、次のようにします：

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // この設定はこの特定のクエリにのみ適用されます。
    // グローバルクライアント設定を上書きします。
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

`query` 以外にも、`insert` および `inserter` メソッドでも同様に動作します。さらに、同じメソッドを `Client` インスタンスに対して呼び出すことで、すべてのクエリに適用されるグローバル設定を行うことができます。

### Query ID

`.with_option` を使用すると、ClickHouse のクエリログ内でクエリを識別するための `query_id` オプションを設定できます。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

`query` 以外でも、`insert` や `inserter` メソッドで同様に動作します。

:::danger
`query_id` を手動で設定する場合は、必ず一意になるようにしてください。その用途には UUID を使用するのが適しています。
:::

クライアントのリポジトリ内にある [query&#95;id example](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) も参照してください。

### セッション ID


`query_id` と同様に、同じセッション内でステートメントを実行するために `session_id` を設定できます。`session_id` は、クライアントレベルでグローバルに設定することも、`query`、`insert`、`inserter` の各呼び出しごとに設定することもできます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
クラスターデプロイメントの場合、「スティッキーセッション」がないため、この機能を正しく利用するには、*特定のクラスターノード* に接続する必要があります。たとえばラウンドロビン方式のロードバランサーでは、連続するリクエストが同じ ClickHouse ノードによって処理されることが保証されないからです。
:::

関連項目: クライアントリポジトリ内の [session&#95;id の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs)。

### カスタム HTTP ヘッダー

プロキシ認証を使用している場合、またはカスタムヘッダーを渡す必要がある場合は、次のように指定できます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

関連情報: クライアントのリポジトリ内にある [カスタム HTTP ヘッダーの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) も参照してください。

### カスタム HTTP クライアント

これは、HTTP 接続プールの設定を細かく調整する際に役立ちます。

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // or HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // クライアント側で特定のアイドルソケットを維持する時間（ミリ秒単位）。
    // ClickHouseサーバーのKeepAliveタイムアウトよりもかなり短く設定する必要があります。
    // デフォルトのタイムアウトは、バージョン23.11以前では3秒、それ以降は10秒です。
    .pool_idle_timeout(Duration::from_millis(2_500))
    // プール内で許可されるアイドルKeep-Alive接続の最大数を設定します。
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
このサンプルはレガシーな Hyper API に依存しており、将来変更される可能性があります。
:::

参考として、クライアントリポジトリ内の [カスタム HTTP クライアントのサンプル](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) も参照してください。


## データ型

:::info
追加のサンプルコードも参照してください:

* [よりシンプルな ClickHouse のデータ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)

* [コンテナ風の ClickHouse のデータ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
  :::

* `(U)Int(8|16|32|64|128)` は、対応する `(u|i)(8|16|32|64|128)` 型、またはそれらをラップした newtype にマッピングされます。

* `(U)Int256` は直接的にはサポートされていませんが、[回避策があります](https://github.com/ClickHouse/clickhouse-rs/issues/48)。

* `Float(32|64)` は、対応する `f(32|64)` 型、またはそれをラップした newtype にマッピングされます。

* `Decimal(32|64|128)` は、対応する `i(32|64|128)` 型、またはそれをラップした newtype にマッピングされます。符号付き固定小数点数の実装としては、[`fixnum`](https://github.com/loyd/fixnum) などを使うとより便利です。

* `Boolean` は `bool` 型、またはそれをラップした newtype にマッピングされます。

* `String` は任意の文字列またはバイト列型、例えば `&str`、`&[u8]`、`String`、`Vec<u8>`、あるいは [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html) にマッピングされます。独自の新しい型もサポートされます。バイト列を保存する場合は、より効率的な [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/) の使用を検討してください。

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

* `FixedString(N)` はバイト配列としてサポートされています（例: `[u8; N]`）。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```

* `Enum(8|16)` は [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/) によってサポートされています。

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

* `UUID` は `serde::uuid` を使用して [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) と相互に対応付けられます。`uuid` フィーチャーが有効である必要があります。

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

* `Date` は `u16` またはそれを包む newtype との間で相互にマッピングされ、`1970-01-01` からの経過日数を表します。また、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) も、`time` フィーチャを有効にしたうえで `serde::time::date` を使用することでサポートされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

* `Date32` は `i32` またはそれを包む newtype との相互変換が可能で、`1970-01-01` からの経過日数を表します。また、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) も、`time` 機能を有効にした上で `serde::time::date32` を使用することでサポートされます。


```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```

* `DateTime` は `u32` またはそれをラップした newtype と相互にマッピングされ、UNIX エポックからの経過秒数を表します。 また、`time` フィーチャを必要とする `serde::time::datetime` を使用することで、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) もサポートされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` は `i32` またはその newtype ラッパーとの相互変換に対応しており、UNIX エポックからの経過時間を表します。また、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) も、`serde::time::datetime64::*` を使用することでサポートされており、その際には `time` フィーチャを有効化しておく必要があります。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // `DateTime64(X)` に応じて経過秒/ミリ秒/マイクロ秒/ナノ秒
    #[serde(with = "clickhouse::serde::time::datetime64::secs")]
    dt64s: OffsetDateTime,  // `DateTime64(0)` (秒)
    #[serde(with = "clickhouse::serde::time::datetime64::millis")]
    dt64ms: OffsetDateTime, // `DateTime64(3)` (ミリ秒)
    #[serde(with = "clickhouse::serde::time::datetime64::micros")]
    dt64us: OffsetDateTime, // `DateTime64(6)` (マイクロ秒)
    #[serde(with = "clickhouse::serde::time::datetime64::nanos")]
    dt64ns: OffsetDateTime, // `DateTime64(9)` (ナノ秒)
}
```

* `Tuple(A, B, ...)` は `(A, B, ...)` またはそれを包んだ newtype との相互変換に対応します。
* `Array(_)` は任意のスライス（例: `Vec<_>`, `&[_]`）との相互変換に対応します。newtype もサポートされています。
* `Map(K, V)` は `Array((K, V))` と同様に振る舞います。
* `LowCardinality(_)` はシームレスにサポートされています。
* `Nullable(_)` は `Option<_>` との相互変換に対応します。`clickhouse::serde::*` のヘルパーでは `::option` を追加してください。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```

* `Nested` は、名前を付け替えた複数の配列を指定することで表現できます。

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

* `Geo` 型がサポートされています。`Point` はタプル `(f64, f64)` と同様に動作し、その他の型は単に `Point` のスライスです。

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

* `Variant`、`Dynamic`、（新しい）`JSON` データ型はまだサポートされていません。


## モック {#mocking}
このクレートは、CH サーバーをモックし、DDL や `SELECT`、`INSERT`、`WATCH` クエリをテストするためのユーティリティを提供します。この機能は `test-util` フィーチャで有効化できます。**開発時の依存関係 (dev-dependency)** としてのみ使用してください。

[サンプル](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)を参照してください。



## トラブルシューティング

### CANNOT&#95;READ&#95;ALL&#95;DATA

`CANNOT_READ_ALL_DATA` エラーの最も一般的な原因は、アプリケーション側の行定義が ClickHouse の定義と一致していないことです。

次のテーブルを考えてみましょう。

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

次に、`EventLog` がアプリケーション側で異なる型で定義されている場合、例えば次のようになります。

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- u32 型にすべきです
}
```

データを挿入する際に、次のエラーが発生することがあります。

```response
Error: BadResponse("Code: 33. DB::Exception: すべてのデータを読み取れません。読み取りバイト数: 5。想定バイト数: 23.: (at row 1)\n: BinaryRowInputFormat実行中。 (CANNOT_READ_ALL_DATA)")
```

この例では、`EventLog` 構造体を正しく定義することで修正されます。

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```


## 既知の制限事項 {#known-limitations}

* `Variant`、`Dynamic`、（新しい）`JSON` データ型はまだサポートされていません。
* サーバーサイドでのパラメータバインディングはまだサポートされていません。進捗状況については [この issue](https://github.com/ClickHouse/clickhouse-rs/issues/142) を参照してください。



## お問い合わせ {#contact-us}

ご不明な点がある場合やサポートが必要な場合は、[Community Slack](https://clickhouse.com/slack) または [GitHub Issues](https://github.com/ClickHouse/clickhouse-rs/issues) からお気軽にご連絡ください。
