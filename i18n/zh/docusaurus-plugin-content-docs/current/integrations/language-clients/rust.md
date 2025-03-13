---
sidebar_label: Rust
sidebar_position: 4
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: '用于连接 ClickHouse 的官方 Rust 客户端。'
---


# ClickHouse Rust 客户端

官方 Rust 客户端，用于连接 ClickHouse，最初由 [Paul Loyd](https://github.com/loyd) 开发。客户端源代码可在 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-rs) 中找到。

## 概述 {#overview}

* 使用 `serde` 进行行的编码/解码。
* 支持 `serde` 属性：`skip_serializing`，`skip_deserializing`，`rename`。
* 通过 HTTP 传输使用 [`RowBinary`](/interfaces/formats#rowbinary) 格式。
    * 计划在 TCP 上切换到 [`Native`](/interfaces/formats#native)。
* 支持 TLS（通过 `native-tls` 和 `rustls-tls` 特性）。
* 支持压缩和解压缩（LZ4）。
* 提供用于选择或插入数据、执行 DDL 和客户端批处理的 API。
* 提供方便的单元测试模拟。

## 安装 {#installation}

要使用该 crate，请将以下内容添加到 `Cargo.toml` 中：

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

另请参见：[crates.io 页面](https://crates.io/crates/clickhouse)。

## Cargo 特性 {#cargo-features}

* `lz4`（默认启用）— 启用 `Compression::Lz4` 和 `Compression::Lz4Hc(_)` 变体。如果启用，则默认情况下所有查询都将使用 `Compression::Lz4`，除非是 `WATCH`。
* `native-tls` — 通过 `hyper-tls` 支持带有 `HTTPS` 架构的 URL，该架构链接到 OpenSSL。
* `rustls-tls` — 通过 `hyper-rustls` 支持带有 `HTTPS` 架构的 URL，该架构不链接到 OpenSSL。
* `inserter` — 启用 `client.inserter()`。
* `test-util` — 添加模拟。请参见 [示例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)。仅在 `dev-dependencies` 中使用。
* `watch` — 启用 `client.watch` 功能。详情请参见相应部分。
* `uuid` — 添加 `serde::uuid` 用于处理 [uuid](https://docs.rs/uuid) crate。
* `time` — 添加 `serde::time` 用于处理 [time](https://docs.rs/time) crate。

:::important
通过 `HTTPS` URL 连接到 ClickHouse 时，应启用 `native-tls` 或 `rustls-tls` 特性。
如果同时启用了两个特性，则 `rustls-tls` 特性将优先。
:::

## ClickHouse 版本兼容性 {#clickhouse-versions-compatibility}

该客户端与 LTS 或更高版本的 ClickHouse 以及 ClickHouse Cloud 兼容。

较早于 v22.6 的 ClickHouse 服务器在某些罕见情况下处理 RowBinary [不正确](https://github.com/ClickHouse/ClickHouse/issues/37420)。
您可以使用 v0.11+ 并启用 `wa-37420` 特性来解决此问题。注意：此特性不应与更新的 ClickHouse 版本一起使用。

## 示例 {#examples}

我们旨在通过客户端代码库中的 [示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples) 来覆盖客户端使用的各种场景。概述可在 [examples README](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview) 中找到。

如果示例或以下文档中有不清楚或缺失的信息，请随时 [联系我们](./rust.md#contact-us)。

## 使用 {#usage}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs) crate 对于从 ClickHouse 生成行类型非常有用。
:::

### 创建客户端实例 {#creating-a-client-instance}

:::tip
重用创建的客户端或克隆它们以重用底层的 hyper 连接池。
:::

```rust
use clickhouse::Client;

let client = Client::default()
    // 应包括协议和端口
    .with_url("http://localhost:8123")
    .with_user("name")
    .with_password("123")
    .with_database("test");
```

### HTTPS 或 ClickHouse Cloud 连接 {#https-or-clickhouse-cloud-connection}

HTTPS 可与 `rustls-tls` 或 `native-tls` cargo 特性一起使用。

然后，像往常一样创建客户端。在这个示例中，使用环境变量来存储连接详细信息：

:::important
URL 应包括协议和端口，例如 `https://instance.clickhouse.cloud:8443`。
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

另请参见：
- [HTTPS with ClickHouse Cloud 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs) 在客户端库中。这也适用于本地的 HTTPS 连接。

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
* 占位符 `?` 被后续的 `bind()` 调用中的值替换。
* 方便的 `fetch_one::<Row>()` 和 `fetch_all::<Row>()` 方法可用于获取第一行或所有行。
* `sql::Identifier` 可用于绑定表名。

注意：由于整个响应是流式传输的，因此游标即使在产生一些行之后也可能返回错误。如果您的用例发生这种情况，可以尝试 `query(...).with_option("wait_end_of_query", "1")` 以启用服务器端的响应缓冲。[更多细节](/interfaces/http/#response-buffering)。`buffer_size` 选项也可能很有用。

:::warning
在选择行时小心使用 `wait_end_of_query`，因为这可能会导致服务器端的更高内存消耗，并可能减少整体性能。
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

* 如果未调用 `end()`，则 `INSERT` 将被中止。
* 行作为流逐步发送以分散网络负载。
* ClickHouse 仅在所有行适合同一分区且其数量小于 [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size) 时原子插入批处理。

### 异步插入（服务器端批处理） {#async-insert-server-side-batching}

您可以使用 [ClickHouse 异步插入](/optimize/asynchronous-inserts) 来避免客户端对传入数据的批处理。这可以通过简单地将 `async_insert` 选项提供给 `insert` 方法（甚至可以提供给 `Client` 实例本身，从而影响所有 `insert` 调用）来完成。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

另请参见：
- [Async insert 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs) 在客户端库中。

### Inserter 特性（客户端批处理） {#inserter-feature-client-side-batching}

需要 `inserter` cargo 特性。

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

// 在应用程序关闭期间不要忘记终止 inserter
// 并提交剩余的行。`.end()` 也将提供统计信息。
inserter.end().await?;
```

* `Inserter` 在达到任何阈值（`max_bytes`、`max_rows`、`period`）时会在 `commit()` 中结束活动插入。
* 结束活动 `INSERT` 之间的间隔可以通过使用 `with_period_bias` 来偏置，以避免通过并行 inserters 引起的负载峰值。
* `Inserter::time_left()` 可用于检测当前周期何时结束。如果您的流偶尔发出项，请再次调用 `Inserter::commit()` 以检查限制。
* 通过使用 [quanta](https://docs.rs/quanta) crate 实现的时间阈值加速 `inserter`。如果启用了 `test-util`，则不使用（因此，可以通过 `tokio::time::advance()` 在自定义测试中管理时间）。
* 在 `commit()` 调用之间的所有行都插入在同一 `INSERT` 语句中。

:::warning
如果您想终止/结束插入，请不要忘记刷新：
```rust
inserter.end().await?;
```
:::

### 执行 DDL {#executing-ddls}

在单节点部署中，执行 DDL 如下：

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

但是，在具有负载均衡器或 ClickHouse Cloud 的集群部署中，建议等待 DDL 在所有副本上应用，使用 `wait_end_of_query` 选项。这可以这样完成：

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
    // 此设置将仅应用于该特定查询；
    // 它将覆盖全局客户端设置。
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

除了 `query`，它在 `insert` 和 `inserter` 方法中也类似工作；此外，还可以在 `Client` 实例上调用相同的方法，以设置所有查询的全局设置。

### 查询 ID {#query-id}

使用 `.with_option`，您可以设置 `query_id` 选项以在 ClickHouse 查询日志中识别查询。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

除了 `query`，它在 `insert` 和 `inserter` 方法中也类似工作。

:::danger
如果您手动设置 `query_id`，请确保它是唯一的。UUID 是一个不错的选择。
:::

另请参见：[query_id 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) 在客户端库中。

### 会话 ID {#session-id}

与 `query_id` 类似，您可以设置 `session_id` 以在同一会话中执行语句。`session_id` 可以在客户端级别全局设置，也可以在每个 `query`、`insert` 或 `inserter` 调用中设置。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
对于集群部署，由于缺乏“粘性会话”，您需要连接到 _特定的集群节点_ 以正确利用此特性，因为例如，轮询负载均衡器不会保证后续请求由同一 ClickHouse 节点处理。
:::

另请参见：[session_id 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) 在客户端库中。

### 自定义 HTTP 头 {#custom-http-headers}

如果您使用代理身份验证或需要传递自定义头，可以这样做：

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

另请参见：[自定义 HTTP 头示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) 在客户端库中。

### 自定义 HTTP 客户端 {#custom-http-client}

这对于调整底层 HTTP 连接池的设置可能很有用。

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // 或 HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // 客户端保持特定空闲套接字存活多长时间（以毫秒为单位）。
    // 这应该远低于 ClickHouse 服务器的 KeepAlive 超时，
    // 在 23.11 版本之前，默认值为 3 秒，此后的版本为 10 秒。
    .pool_idle_timeout(Duration::from_millis(2_500))
    // 设置池中允许的最大空闲 Keep-Alive 连接数量。
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
此示例依赖于遗留的 Hyper API，未来可能会发生变化。
:::

另请参见：[自定义 HTTP 客户端示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) 在客户端库中。

## 数据类型 {#data-types}

:::info
另请参见附加示例：
* [更简单的 ClickHouse 数据类型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
* [类似容器的 ClickHouse 数据类型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
:::

* `(U)Int(8|16|32|64|128)` 映射到相应的 `(u|i)(8|16|32|64|128)` 类型或其周围的新类型。
* `(U)Int256` 目前不直接支持，但有 [一个 workaround](https://github.com/ClickHouse/clickhouse-rs/issues/48)。
* `Float(32|64)` 映射到相应的 `f(32|64)` 或其周围的新类型。
* `Decimal(32|64|128)` 映射到相应的 `i(32|64|128)` 或其周围的新类型。使用 [`fixnum`](https://github.com/loyd/fixnum) 或其他签名定点数实现会更方便。
* `Boolean` 映射到 `bool` 或其周围的新类型。
* `String` 映射到任何字符串或字节类型，例如 `&str`、`&[u8]`、`String`、`Vec<u8>` 或 [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html)。新类型也受支持。要存储字节，可以考虑使用 [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/)，因为它更高效。

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

* `FixedString(N)` 作为字节数组支持，例如 `[u8; N]`。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```
* `Enum(8|16)` 使用 [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/) 支持。

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
* `UUID` 映射到 [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) 使用 `serde::uuid`。需要启用 `uuid` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```
* `IPv6` 映射到 [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html)。
* `IPv4` 映射到 [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) 使用 `serde::ipv4`。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```
* `Date` 映射到 `u16` 或其周围的新类型，表示自 `1970-01-01` 起经过的天数。此外，[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) 也通过 `serde::time::date` 支持，需要启用 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```
* `Date32` 映射到 `i32` 或其周围的新类型，表示自 `1970-01-01` 起经过的天数。此外，[`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) 也通过 `serde::time::date32` 支持，需要启用 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```
* `DateTime` 映射到 `u32` 或其周围的新类型，表示自 UNIX 纪元起经过的秒数。此外，[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) 也通过 `serde::time::datetime` 支持，需要启用 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` 映射到 `i32` 或其周围的新类型，表示自 UNIX 纪元起经过的时间。此外，[`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) 也通过 `serde::time::datetime64::*` 支持，需要启用 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // 根据 `DateTime64(X)` 的不同，表示经过的秒/微秒/毫秒/纳秒
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

* `Tuple(A, B, ...)` 映射到 `(A, B, ...)` 或其周围的新类型。
* `Array(_)` 映射到任何切片，例如 `Vec<_>`、`&[_]`。新类型也受支持。
* `Map(K, V)` 像 `Array((K, V))` 一样工作。
* `LowCardinality(_)` 被无缝支持。
* `Nullable(_)` 映射到 `Option<_>`。为 `clickhouse::serde::*` 辅助函数添加 `::option`。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```
* `Nested` 通过提供多个数组并重命名进行支持。
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
* `Geo` 类型得到支持。`Point` 像一个元组 `(f64, f64)`，其他类型只是点的切片。
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

* `Variant`、`Dynamic`、(新) `JSON` 数据类型尚未得到支持。

## 模拟 {#mocking}
该 crate 提供了模拟 CH 服务器和测试 DDL、`SELECT`、`INSERT` 和 `WATCH` 查询的工具。可以通过启用 `test-util` 特性来启用此功能。仅作为开发依赖使用。

请参见 [示例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)。

## 故障排除 {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

`CANNOT_READ_ALL_DATA` 错误最常见的原因是应用程序端的行定义与 ClickHouse 中不匹配。

考虑以下表：

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

然后，如果在应用程序端的 `EventLog` 定义中的类型不匹配，例如：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- 应该是 u32 而不是！
}
```

插入数据时可能会发生以下错误：

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

在这种情况下，通过正确的 `EventLog` 结构定义修复：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```

## 已知限制 {#known-limitations}

* `Variant`、`Dynamic`、 (新) `JSON` 数据类型尚未得到支持。
* 服务器端参数绑定尚不支持；请参见 [这个问题](https://github.com/ClickHouse/clickhouse-rs/issues/142) 进行跟踪。

## 联系我们 {#contact-us}

如果您有任何问题或需要帮助，请随时通过 [Community Slack](https://clickhouse.com/slack) 或 [GitHub issues](https://github.com/ClickHouse/clickhouse-rs/issues) 与我们联系。
