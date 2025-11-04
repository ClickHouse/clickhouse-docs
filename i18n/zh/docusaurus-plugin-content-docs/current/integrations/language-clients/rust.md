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
'description': '官方 Rust 客户端，用于连接到 ClickHouse。'
'title': 'ClickHouse Rust 客户端'
'doc_type': 'reference'
---


# ClickHouse Rust 客户端

用于连接 ClickHouse 的官方 Rust 客户端，最初由 [Paul Loyd](https://github.com/loyd) 开发。客户端源代码可在 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-rs) 中获取。

## 概述 {#overview}

* 使用 `serde` 进行行的编码/解码。
* 支持 `serde` 属性：`skip_serializing`、`skip_deserializing`、`rename`。
* 在 HTTP 传输中使用 [`RowBinary`](/interfaces/formats#rowbinary) 格式。
  * 有计划切换到通过 TCP 的 [`Native`](/interfaces/formats#native)。
* 支持 TLS（通过 `native-tls` 和 `rustls-tls` 特性）。
* 支持压缩和解压（LZ4）。
* 提供用于选择或插入数据、执行 DDL 和客户端批处理的 API。
* 提供便利的 Mock 用于单元测试。

## 安装 {#installation}

要使用该库，请将以下内容添加到您的 `Cargo.toml`：

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

另请参阅：[crates.io 页面](https://crates.io/crates/clickhouse)。

## Cargo 特性 {#cargo-features}

* `lz4`（默认启用）- 启用 `Compression::Lz4` 和 `Compression::Lz4Hc(_)` 变体。如果启用，默认情况下所有查询将使用 `Compression::Lz4`，但 `WATCH` 除外。
* `native-tls` - 通过 `hyper-tls` 支持使用 `HTTPS` 协议的 URL，该链接与 OpenSSL。
* `rustls-tls` - 通过 `hyper-rustls` 支持使用 `HTTPS` 协议的 URL，该链接不与 OpenSSL。
* `inserter` - 启用 `client.inserter()`。
* `test-util` - 添加 Mock。请参见 [示例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)。仅在 `dev-dependencies` 中使用。
* `watch` - 启用 `client.watch` 功能。有关详细信息，请参阅相应部分。
* `uuid` - 添加 `serde::uuid` 以处理 [uuid](https://docs.rs/uuid) crate。
* `time` - 添加 `serde::time` 以处理 [time](https://docs.rs/time) crate。

:::important
通过 `HTTPS` URL 连接到 ClickHouse 时，应启用 `native-tls` 或 `rustls-tls` 特性。
如果同时启用两者，则 `rustls-tls` 特性将优先。
:::

## ClickHouse 版本兼容性 {#clickhouse-versions-compatibility}

该客户端与 LTS 或更新版本的 ClickHouse 以及 ClickHouse Cloud 兼容。

版本低于 v22.6 的 ClickHouse 服务器在某些罕见情况下错误处理 RowBinary [相关问题](https://github.com/ClickHouse/ClickHouse/issues/37420)。
您可以使用 v0.11+ 并启用 `wa-37420` 特性来解决此问题。注意：此特性不应与更新的 ClickHouse 版本一起使用。

## 示例 {#examples}

我们旨在通过客户端仓库中的 [示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples) 涵盖客户端使用的各种场景。概述可在 [示例 README](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview) 中找到。

如果示例或以下文档中有任何不清楚或缺失的内容，请随时 [联系我们](./rust.md#contact-us)。

## 使用方法 {#usage}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs) crate 对于从 ClickHouse 生成行类型非常有用。
:::

### 创建客户端实例 {#creating-a-client-instance}

:::tip
重用已创建的客户端或克隆它们以重用底层的 hyper 连接池。
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

### HTTPS 或 ClickHouse Cloud 连接 {#https-or-clickhouse-cloud-connection}

HTTPS 与 `rustls-tls` 或 `native-tls` Cargo 特性均可用。

然后，像往常一样创建客户端。在此示例中，使用环境变量存储连接详细信息：

:::important
URL 必须同时包含协议和端口，例如 `https://instance.clickhouse.cloud:8443`。
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

另请参阅：
- [ClickHouse Cloud 示例的 HTTPS](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs) 在客户端仓库中。这同样适用于本地 HTTPS 连接。

### 选择行 {#selecting-rows}

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

* 占位符 `?fields` 被替换为 `no, name`（`Row` 的字段）。
* 占位符 `?` 被下一个 `bind()` 调用中的值替换。
* 可以使用便利的 `fetch_one::<Row>()` 和 `fetch_all::<Row>()` 方法分别获取第一行或所有行。
* `sql::Identifier` 可用于绑定表名。

注意：由于整个响应是以流方式发送的，游标即使在产生一些行之后也可能会返回错误。如果在您的用例中发生这种情况，您可以尝试 `query(...).with_option("wait_end_of_query", "1")` 以启用服务器端的响应缓冲。 [更多细节](/interfaces/http/#response-buffering)。`buffer_size` 选项也可能有用。

:::warning
在选择行时谨慎使用 `wait_end_of_query`，因为这可能会导致服务器端内存使用量增加，并可能降低整体性能。
:::

### 插入行 {#inserting-rows}

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

* 如果未调用 `end()`，则 `INSERT` 会被中止。
* 行会逐步以流的形式发送，以分散网络负载。
* ClickHouse 仅在所有行都适合同一分区且行数小于 [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size) 时以原子方式插入批次。

### 异步插入（服务器端批处理） {#async-insert-server-side-batching}

您可以使用 [ClickHouse 异步插入](/optimize/asynchronous-inserts) 来避免客户端对传入数据的批处理。这可以通过简单地向 `insert` 方法提供 `async_insert` 选项（甚至对 `Client` 实例本身，这样它会影响所有的 `insert` 调用）来实现。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

另请参阅：
- [异步插入示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs) 在客户端仓库中。

### 插入器特性（客户端批处理） {#inserter-feature-client-side-batching}

需要 `inserter` Cargo 特性。

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

* 如果达到任何阈值（`max_bytes`、`max_rows`、`period`），`Inserter` 会在 `commit()` 中结束活动插入。
* 结束活动 `INSERT` 的间隔可以通过使用 `with_period_bias` 加以调整，以避免并行插入器带来的负载突发。
* `Inserter::time_left()` 可用于检测当前周期的结束时间。如果您的流少量发出项，可以再次调用 `Inserter::commit()` 来检查限制。
* 使用 [quanta](https://docs.rs/quanta) crate 实现时间阈值，以加速 `inserter`。如果启用 `test-util`，则不使用此功能（因此，在自定义测试中可以通过 `tokio::time::advance()` 来管理时间）。
* 所有在 `commit()` 调用之间的行都会插入到同一个 `INSERT` 语句中。

:::warning
如果要终止/完成插入，请不要忘记刷新：
```rust
inserter.end().await?;
```
:::

### 执行 DDL {#executing-ddls}

在单节点部署中，只需执行如下 DDL：

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

然而，在具有负载均衡器或 ClickHouse Cloud 的集群部署中，建议使用 `wait_end_of_query` 选项等待 DDL 在所有副本上应用。这可以按如下方式完成：

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```

### ClickHouse 设置 {#clickhouse-settings}

您可以使用 `with_option` 方法应用各种 [ClickHouse 设置](/operations/settings/settings)。例如：

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // This setting will be applied to this particular query only;
    // it will override the global client setting.
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

除了 `query`，它在 `insert` 和 `inserter` 方法中也工作相似；此外，还可以在 `Client` 实例上调用相同的方法，以为所有查询设置全局设置。

### 查询 ID {#query-id}

使用 `.with_option`，您可以设置 `query_id` 选项以标识 ClickHouse 查询日志中的查询。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

除了 `query`，它在 `insert` 和 `inserter` 方法中也工作相似。

:::danger
如果手动设置 `query_id`，确保它是唯一的。UUID 是一个不错的选择。
:::

另请参阅：[query_id 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) 在客户端仓库中。

### 会话 ID {#session-id}

与 `query_id` 类似，您可以设置 `session_id` 以在同一会话中执行语句。`session_id` 可以在客户端级别全局设置，或在每个 `query`、`insert` 或 `inserter` 调用中设置。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
在集群部署中，由于缺乏“粘性会话”，您需要连接到 _特定集群节点_ 以正确利用此功能，因为例如，轮询负载均衡器不能保证后续的请求将由同一 ClickHouse 节点处理。
:::

另请参阅：[session_id 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) 在客户端仓库中。

### 自定义 HTTP 头 {#custom-http-headers}

如果您使用代理身份验证或需要传递自定义头，可以按如下方式进行：

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

另请参阅：[自定义 HTTP 头示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) 在客户端仓库中。

### 自定义 HTTP 客户端 {#custom-http-client}

这对于调整底层 HTTP 连接池设置可能很有用。

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
该示例依赖于过时的 Hyper API，并可能在未来更改。
:::

另请参阅：[自定义 HTTP 客户端示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) 在客户端仓库中。

## 数据类型 {#data-types}

:::info
另请参阅其他示例：
* [更简单的 ClickHouse 数据类型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
* [容器式 ClickHouse 数据类型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
:::

* `(U)Int(8|16|32|64|128)` 映射到/从相应的 `(u|i)(8|16|32|64|128)` 类型或围绕它们的新类型。
* `(U)Int256` 没有直接支持，但有 [解决方法](https://github.com/ClickHouse/clickhouse-rs/issues/48)。
* `Float(32|64)` 映射到/从相应的 `f(32|64)` 或围绕它们的新类型。
* `Decimal(32|64|128)` 映射到/从相应的 `i(32|64|128)` 或围绕它们的新类型。使用 [`fixnum`](https://github.com/loyd/fixnum) 或其他签名定点数的实现会更方便。
* `Boolean` 映射到/从 `bool` 或围绕它的新类型。
* `String` 映射到/从任何字符串或字节类型，例如 `&str`、`&[u8]`、`String`、`Vec<u8>` 或 [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html)。也支持新类型。要存储字节，请考虑使用 [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/)，因为它更高效。

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

* `FixedString(N)` 被支持为字节数组，例如 `[u8; N]`。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```
* `Enum(8|16)` 通过 [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/) 支持。

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
* `UUID` 映射到/从 [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html)，通过 `serde::uuid` 实现。需要 `uuid` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```
* `IPv6` 映射到/从 [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html)。
* `IPv4` 映射到/从 [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html)，通过 `serde::ipv4` 实现。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```
* `Date` 映射到/从 `u16` 或围绕它的新类型，表示自 `1970-01-01` 以来经过的天数。此外，通过使用 `serde::time::date` 来支持 [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)，这需要 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```
* `Date32` 映射到/从 `i32` 或围绕它的新类型，表示自 `1970-01-01` 以来经过的天数。此外，通过使用 `serde::time::date32` 来支持 [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)，这需要 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```
* `DateTime` 映射到/从 `u32` 或围绕它的新类型，表示自 UNIX 纪元以来经过的秒数。此外，通过使用 `serde::time::datetime` 来支持 [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)，这需要 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` 映射到/从 `i32` 或围绕它的新类型，表示自 UNIX 纪元以来经过的时间。此外，通过使用 `serde::time::datetime64::*` 来支持 [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)，这需要 `time` 特性。

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

* `Tuple(A, B, ...)` 映射到/从 `(A, B, ...)` 或围绕它的新类型。
* `Array(_)` 映射到/从任何切片，例如 `Vec<_>`、`&[_]`。也支持新类型。
* `Map(K, V)` 的行为类似于 `Array((K, V))`。
* `LowCardinality(_)` 平滑地支持。
* `Nullable(_)` 映射到/从 `Option<_>`。对于 `clickhouse::serde::*` 辅助程序，请添加 `::option`。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```
* `Nested` 通过提供多个数组并重命名来支持。
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
* `Geo` 类型获得支持。`Point` 的行为类似于元组 `(f64, f64)`，而其他类型仅为点的切片。
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

* `Variant`、`Dynamic` 和（新）`JSON` 数据类型尚不支持。

## Mocking {#mocking}
该 crate 提供用于模拟 CH 服务器和测试 DDL、`SELECT`、`INSERT` 和 `WATCH` 查询的工具。可以通过 `test-util` 特性启用此功能。请仅将其用作开发依赖。

请参见 [示例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)。

## 故障排除 {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

`CANNOT_READ_ALL_DATA` 错误的最常见原因是应用程序端的行定义与 ClickHouse 中的行定义不匹配。

考虑以下表：

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

然后，如果在应用程序端以不匹配的类型定义 `EventLog`，例如：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- should be u32 instead!
}
```

插入数据时可能会出现以下错误：

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

在此示例中，通过正确的 `EventLog` 结构定义来解决：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```

## 已知限制 {#known-limitations}

* `Variant`、`Dynamic` 和（新）`JSON` 数据类型尚不支持。
* 服务器端参数绑定尚不支持；有关跟踪，请参见 [此问题](https://github.com/ClickHouse/clickhouse-rs/issues/142)。

## 联系我们 {#contact-us}

如果您有任何问题或需要帮助，请随时在 [Community Slack](https://clickhouse.com/slack) 或通过 [GitHub issues](https://github.com/ClickHouse/clickhouse-rs/issues) 联系我们。
