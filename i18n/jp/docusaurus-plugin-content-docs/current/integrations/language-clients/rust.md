---
sidebar_label: 'Rust'
sidebar_position: 5
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: 'ClickHouse 用公式 Rust クライアント。'
title: 'ClickHouse Rust クライアント'
doc_type: 'reference'
---

# ClickHouse Rust クライアント

[Paul Loyd](https://github.com/loyd) によって当初開発された、ClickHouse に接続するための公式の Rust クライアントです。クライアントのソースコードは [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-rs) で公開されています。

## 概要 {#overview}

* 行のエンコード／デコードには `serde` を使用します。
* `serde` 属性 `skip_serializing`、`skip_deserializing`、`rename` をサポートします。
* HTTP トランスポート上で [`RowBinary`](/interfaces/formats/RowBinary) フォーマットを使用します。
  * TCP 上の [`Native`](/interfaces/formats/Native) への切り替えを計画しています。
* TLS（`native-tls` および `rustls-tls` 機能）をサポートします。
* 圧縮および展開（LZ4）をサポートします。
* データの SELECT／INSERT、DDL の実行、およびクライアント側のバッチ処理用 API を提供します。
* ユニットテスト用の便利なモック機能を提供します。

## インストール

このクレートを使用するには、`Cargo.toml` に以下を追加してください:

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

あわせて [crates.io のページ](https://crates.io/crates/clickhouse) も参照してください。


## Cargo features {#cargo-features}

* `lz4`（デフォルトで有効） — `Compression::Lz4` と `Compression::Lz4Hc(_)` バリアントを有効にします。有効な場合、`Compression::Lz4` は `WATCH` を除くすべてのクエリでデフォルトとして使用されます。
* `native-tls` — OpenSSL にリンクする `hyper-tls` を通じて、`HTTPS` スキームの URL をサポートします。
* `rustls-tls` — OpenSSL にリンクしない `hyper-rustls` を通じて、`HTTPS` スキームの URL をサポートします。
* `inserter` — `client.inserter()` を有効にします。
* `test-util` — モックを追加します。[このサンプル](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs) を参照してください。`dev-dependencies` でのみ使用してください。
* `watch` — `client.watch` 機能を有効にします。詳細は該当セクションを参照してください。
* `uuid` — [uuid](https://docs.rs/uuid) クレートを扱うために `serde::uuid` を追加します。
* `time` — [time](https://docs.rs/time) クレートを扱うために `serde::time` を追加します。

:::important
`HTTPS` URL 経由で ClickHouse に接続する場合は、`native-tls` か `rustls-tls` のいずれかの feature を有効にする必要があります。
両方が有効な場合は、`rustls-tls` feature が優先されます。
:::

## ClickHouse のバージョン互換性 {#clickhouse-versions-compatibility}

このクライアントは、LTS もしくはそれ以降のバージョンの ClickHouse および ClickHouse Cloud と互換性があります。

v22.6 より古い ClickHouse サーバーは、RowBinary を[まれなケースで誤って処理します](https://github.com/ClickHouse/ClickHouse/issues/37420)。 
この問題を解決するには、v0.11 以降を使用し、`wa-37420` 機能を有効にしてください。なお、この機能は新しいバージョンの ClickHouse では使用しないでください。

## 例 {#examples}

クライアントリポジトリ内の [examples](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples) で、クライアント利用のさまざまなシナリオをカバーすることを目指しています。概要は [examples README](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview) で確認できます。

examples や以下のドキュメントに不明な点や不足している点がある場合は、遠慮なく[お問い合わせ](./rust.md#contact-us)ください。

## 使い方 {#usage}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs) クレートは、ClickHouse から行の型を生成するのに役立ちます。
:::

### クライアントインスタンスの作成

:::tip
作成済みのクライアントを再利用するか、クローンして、基盤となる hyper のコネクションプールを共有するようにしてください。
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

HTTPS 接続は、`rustls-tls` または `native-tls` のいずれかの Cargo 機能で動作します。

その後は、通常どおりクライアントを作成します。次の例では、環境変数を使用して接続情報を保持します。

:::important
URL にはプロトコルとポートの両方を含める必要があります（例: `https://instance.clickhouse.cloud:8443`）。
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

関連情報:

* クライアントリポジトリにある [ClickHouse Cloud を利用した HTTPS のサンプル](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs)。これはオンプレミス環境での HTTPS 接続にも利用できます。


### 行を選択する

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

* プレースホルダ `?fields` は、`Row` のフィールドである `no, name` に置き換えられます。
* プレースホルダ `?` は、後続の `bind()` 呼び出しで指定した値に置き換えられます。
* 先頭の 1 行またはすべての行を取得するには、`fetch_one::<Row>()` および `fetch_all::<Row>()` という便利なメソッドをそれぞれ使用できます。
* テーブル名をバインドするには、`sql::Identifier` を使用できます。

注意: 応答全体がストリーミングされるため、カーソルは一部の行を返した後でもエラーを返す可能性があります。このようなケースが発生する場合は、サーバー側でレスポンスバッファリングを有効にするために、`query(...).with_option("wait_end_of_query", "1")` を試してみてください。詳しくは[こちら](/interfaces/http/#response-buffering)を参照してください。`buffer_size` オプションも有用な場合があります。

:::warning
行を選択する際に `wait_end_of_query` を使用する場合は注意してください。サーバー側でのメモリ使用量が増加し、全体的なパフォーマンスが低下する可能性が高くなります。
:::


### 行を挿入する

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
* 行はネットワーク負荷を分散するために、ストリームとして順次送信されます。
* ClickHouse は、すべての行が同じパーティションに収まり、かつ行数が [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size) 未満である場合にのみ、バッチをアトミックに挿入します。


### 非同期挿入（サーバー側バッチ処理）

受信データをクライアント側でバッチ処理しないようにするには、[ClickHouse asynchronous inserts](/optimize/asynchronous-inserts) を利用できます。これは、`insert` メソッドに `async_insert` オプションを指定する（あるいは `Client` インスタンス自体に指定して、すべての `insert` 呼び出しに適用する）だけで実現できます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

こちらも参照してください：

* クライアントリポジトリの [非同期インサートの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs)。


### Inserter 機能（クライアント側バッチ処理）

`inserter` Cargo フィーチャが必要です。

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
* 並列インサータによる負荷スパイクを回避するために、`with_period_bias` を使用してアクティブな `INSERT` を終了する間隔にバイアス（ばらつき）を持たせることができます。
* 現在の期間がいつ終了するかを検出するには `Inserter::time_left()` を使用できます。ストリームがまれにしかアイテムを出力しない場合は、`Inserter::commit()` を再度呼び出して制限を再チェックしてください。
* 時間しきい値は [quanta](https://docs.rs/quanta) クレートを使って実装されており、`inserter` の高速化を行います。`test-util` が有効な場合は使用されません（そのため、カスタムテストでは `tokio::time::advance()` によって時間を制御できます）。
* `commit()` 呼び出し間のすべての行は、同じ `INSERT` 文として挿入されます。

:::warning
挿入を終了／確定したい場合は、フラッシュするのを忘れないでください：

```rust
inserter.end().await?;
```

:::


### DDL の実行

シングルノードデプロイメント環境では、DDL は次のように実行するだけで十分です。

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

ただし、ロードバランサーを備えたクラスターデプロイメントや ClickHouse Cloud を利用している場合は、`wait_end_of_query` オプションを使用して、DDL がすべてのレプリカに適用されるまで待つことを推奨します。これは次のように実行できます。

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```


### ClickHouse の設定

`with_option` メソッドを使用して、さまざまな [ClickHouse の設定](/operations/settings/settings) を適用できます。例:

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // この設定はこの特定のクエリにのみ適用されます。
    // グローバルクライアント設定を上書きします。
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

`query` だけでなく、`insert` および `inserter` メソッドでも同様に動作します。さらに、同じメソッドを `Client` インスタンスに対して呼び出すことで、すべてのクエリに適用されるグローバル設定を行うことができます。


### クエリ ID

`.with_option` を使用すると、ClickHouse のクエリログでクエリを識別するための `query_id` オプションを設定できます。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

`query` のほかに、`insert` および `inserter` メソッドでも同様に利用できます。

:::danger
`query_id` を手動で設定する場合は、一意であることを確認してください。そのためには UUID を使用するのが適しています。
:::

参考: クライアントリポジトリ内の [query&#95;id のサンプル](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) も参照してください。


### セッション ID

`query_id` と同様に、同じセッションでステートメントを実行するために `session_id` を設定できます。`session_id` はクライアントレベルでグローバルに設定することも、`query`、`insert`、`inserter` の各呼び出しごとに個別に設定することもできます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
クラスタ構成のデプロイメントでは「スティッキーセッション」がないため、この機能を正しく利用するには *特定のクラスタノード* に接続する必要があります。たとえばラウンドロビン方式のロードバランサーでは、後続のリクエストが同じ ClickHouse ノードで処理されることは保証されません。
:::

関連項目: クライアントリポジトリ内の [session&#95;id の例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) を参照してください。


### カスタム HTTP ヘッダー

プロキシ認証を使用している場合やカスタムヘッダーを渡す必要がある場合は、次のように指定できます。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

参考: クライアントリポジトリ内の [カスタム HTTP ヘッダーの例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) も参照してください。


### カスタム HTTP クライアント

これは、内部の HTTP 接続プールの設定を調整する際に役立ちます。

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // or HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // クライアント側で特定のアイドルソケットを生存させる時間（ミリ秒単位）。
    // ClickHouseサーバーのKeepAliveタイムアウトよりもかなり短く設定することが推奨されます。
    // デフォルトでは23.11以前のバージョンでは3秒、それ以降のバージョンでは10秒です。
    .pool_idle_timeout(Duration::from_millis(2_500))
    // プール内で許可されるアイドル状態のKeep-Alive接続の最大数を設定します。
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
この例はレガシーな Hyper API に依存しており、今後変更される可能性があります。
:::

あわせて、クライアントリポジトリ内の [custom HTTP client example](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) も参照してください。


## データ型

:::info
追加のサンプルも参照してください:

* [よりシンプルな ClickHouse データ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)

* [コンテナ風の ClickHouse データ型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
  :::

* `(U)Int(8|16|32|64|128)` は、対応する `(u|i)(8|16|32|64|128)` 型またはそれらをラップした newtype にマップされます。

* `(U)Int256` は直接はサポートされていませんが、[回避策があります](https://github.com/ClickHouse/clickhouse-rs/issues/48)。

* `Float(32|64)` は、対応する `f(32|64)` またはそれらをラップした newtype にマップされます。

* `Decimal(32|64|128)` は、対応する `i(32|64|128)` またはそれらをラップした newtype にマップされます。符号付き固定小数点数の実装としては、[`fixnum`](https://github.com/loyd/fixnum) などを利用するとより便利です。

* `Boolean` は `bool` またはそれをラップした newtype にマップされます。

* `String` は、任意の文字列型またはバイト列型（例: `&str`, `&[u8]`, `String`, `Vec<u8>`、[`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html)）にマップされます。独自定義の型もサポートされます。バイト列を保存する場合は、より効率的であるため [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/) の使用を検討してください。

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

* `FixedString(N)` は `[u8; N]` のようなバイト配列としてサポートされます。

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

* `UUID` は、`serde::uuid` を使用して [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) と相互マッピングされます。`uuid` フィーチャ（feature）が必要です。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```

* `IPv6` は [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html) と相互に対応します。
* `IPv4` は `serde::ipv4` を使用して [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) と相互に対応します。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```

* `Date` は `u16` またはそれを包む newtype にマッピングされ、`1970-01-01` からの経過日数を表します。さらに、`time` フィーチャを有効にしたうえで `serde::time::date` を使用することで、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) もサポートされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

* `Date32` は `i32` またはそれをラップした newtype 型との相互変換に対応しており、`1970-01-01` からの経過日数を表します。また、`time` フィーチャーを有効にした上で `serde::time::date32` を使用することで、[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) もサポートされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```


* `DateTime` は `u32` またはそれを包む newtype との間でマッピングされ、UNIX エポックからの経過秒数を表します。加えて、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) も、`time` feature を必要とする `serde::time::datetime` を使用することでサポートされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` は `i32` またはそれを包む newtype 型との間でマッピングされ、UNIX エポックからの経過時間を表します。 また、`time` フィーチャが必要な `serde::time::datetime64::*` を使用することで、[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) もサポートされます。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // `DateTime64(X)` に応じた経過時間 (秒/マイクロ秒/ミリ秒/ナノ秒)
    #[serde(with = "clickhouse::serde::time::datetime64::secs")]
    dt64s: OffsetDateTime,  // `DateTime64(0)` (秒単位)
    #[serde(with = "clickhouse::serde::time::datetime64::millis")]
    dt64ms: OffsetDateTime, // `DateTime64(3)` (ミリ秒単位)
    #[serde(with = "clickhouse::serde::time::datetime64::micros")]
    dt64us: OffsetDateTime, // `DateTime64(6)` (マイクロ秒単位)
    #[serde(with = "clickhouse::serde::time::datetime64::nanos")]
    dt64ns: OffsetDateTime, // `DateTime64(9)` (ナノ秒単位)
}
```

* `Tuple(A, B, ...)` は `(A, B, ...)` またはそれをラップする newtype 型との間でマッピングされます。
* `Array(_)` は任意のスライス（例: `Vec<_>`、`&[_]`）との間でマッピングされます。ユーザー定義の新しい型もサポートされています。
* `Map(K, V)` は `Array((K, V))` と同様に動作します。
* `LowCardinality(_)` は透過的にサポートされています。
* `Nullable(_)` は `Option<_>` と相互にマッピングされます。`clickhouse::serde::*` ヘルパーを利用する場合は `::option` を追加してください。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```

* `Nested` は、名前を付け替えた複数の配列として指定することでサポートされます。

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

* `Geo` 型がサポートされています。`Point` はタプル `(f64, f64)` のように振る舞い、その他の型は `Point` のスライスにすぎません。

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

* `Variant`、`Dynamic`、（新しい）`JSON` データ型は現在まだサポートされていません。


## モック機能 {#mocking}

このクレートは、ClickHouse サーバーのモックや DDL、`SELECT`、`INSERT`、`WATCH` クエリのテスト用ユーティリティを提供します。この機能は `test-util` フィーチャーを有効にすると利用できます。**開発時の依存関係（dev-dependency）としてのみ**使用してください。

[サンプルコード](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)を参照してください。

## トラブルシューティング {#troubleshooting}

### CANNOT&#95;READ&#95;ALL&#95;DATA

`CANNOT_READ_ALL_DATA` エラーの最も一般的な原因は、アプリケーション側の行定義が ClickHouse の定義と一致していないことです。

次のテーブルを考えてみます:

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

次に、アプリケーション側で `EventLog` が次のように型の不一致を伴って定義されている場合、例えば：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- 本来は u32 型にすべきです！
}
```

データを挿入する際、次のエラーが発生することがあります:

```response
エラー: BadResponse("Code: 33. DB::Exception: すべてのデータを読み取れません。読み取ったバイト数: 5。期待されるバイト数: 23.: (行 1)\n: BinaryRowInputFormat の実行中。 (CANNOT_READ_ALL_DATA)")
```

この例では、`EventLog` 構造体を正しく定義することで、この問題は解決されます。

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```


## 既知の制限事項 {#known-limitations}

* `Variant`、`Dynamic`、（新しい）`JSON` データ型にはまだ対応していません。
* サーバーサイドでのパラメータバインディングにはまだ対応していません。進捗は [この Issue](https://github.com/ClickHouse/clickhouse-rs/issues/142) を参照してください。

## お問い合わせ {#contact-us}

ご質問やサポートが必要な場合は、[Community Slack](https://clickhouse.com/slack) または [GitHub の issue](https://github.com/ClickHouse/clickhouse-rs/issues) からお気軽にお問い合わせください。