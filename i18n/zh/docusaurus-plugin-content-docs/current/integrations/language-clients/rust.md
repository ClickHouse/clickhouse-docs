---
sidebar_label: 'Rust'
sidebar_position: 5
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: '用于连接 ClickHouse 的官方 Rust 客户端。'
title: 'ClickHouse Rust 客户端'
doc_type: 'reference'
---



# ClickHouse Rust 客户端

用于连接 ClickHouse 的官方 Rust 客户端，最初由 [Paul Loyd](https://github.com/loyd) 开发。该客户端的源代码托管在 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-rs) 中。



## 概述 {#overview}

- 使用 `serde` 进行行编码/解码。
- 支持 `serde` 属性：`skip_serializing`、`skip_deserializing`、`rename`。
- 通过 HTTP 传输使用 [`RowBinary`](/interfaces/formats/RowBinary) 格式。
  - 计划切换为通过 TCP 使用 [`Native`](/interfaces/formats/Native) 格式。
- 支持 TLS(通过 `native-tls` 和 `rustls-tls` 特性)。
- 支持压缩和解压缩(LZ4)。
- 提供用于数据查询或插入、执行 DDL 以及客户端批处理的 API。
- 提供便捷的模拟对象用于单元测试。


## 安装 {#installation}

要使用此 crate,请在 `Cargo.toml` 中添加以下内容:

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

另请参阅:[crates.io 页面](https://crates.io/crates/clickhouse)。


## Cargo 特性 {#cargo-features}

- `lz4`(默认启用)— 启用 `Compression::Lz4` 和 `Compression::Lz4Hc(_)` 变体。启用后,除 `WATCH` 查询外,所有查询默认使用 `Compression::Lz4` 压缩。
- `native-tls` — 通过 `hyper-tls` 支持使用 `HTTPS` 协议的 URL,该库链接 OpenSSL。
- `rustls-tls` — 通过 `hyper-rustls` 支持使用 `HTTPS` 协议的 URL,该库不链接 OpenSSL。
- `inserter` — 启用 `client.inserter()` 方法。
- `test-util` — 添加模拟(mock)功能。参见[示例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)。仅应在 `dev-dependencies` 中使用。
- `watch` — 启用 `client.watch` 功能。详情请参见相应章节。
- `uuid` — 添加 `serde::uuid` 以支持 [uuid](https://docs.rs/uuid) crate。
- `time` — 添加 `serde::time` 以支持 [time](https://docs.rs/time) crate。

:::important
通过 `HTTPS` URL 连接 ClickHouse 时,需启用 `native-tls` 或 `rustls-tls` 特性之一。
如果同时启用两者,`rustls-tls` 特性将优先生效。
:::


## ClickHouse 版本兼容性 {#clickhouse-versions-compatibility}

该客户端与 ClickHouse 的 LTS 版本及更新版本兼容,同时也支持 ClickHouse Cloud。

v22.6 之前的 ClickHouse 服务器在[某些罕见情况下会错误地处理 RowBinary](https://github.com/ClickHouse/ClickHouse/issues/37420)。
您可以使用 v0.11+ 版本并启用 `wa-37420` 特性来解决此问题。注意:该特性不应与更新版本的 ClickHouse 一起使用。


## 示例 {#examples}

我们致力于通过客户端代码库中的[示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples)涵盖客户端使用的各种场景。概述信息请参阅[示例 README](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview)。

如果示例或后续文档中存在不清楚或缺失的内容,欢迎[联系我们](./rust.md#contact-us)。


## 使用方法 {#usage}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs) crate 可用于从 ClickHouse 生成行类型。
:::

### 创建客户端实例 {#creating-a-client-instance}

:::tip
重用已创建的客户端或克隆它们,以便重用底层的 hyper 连接池。
:::

```rust
use clickhouse::Client;

let client = Client::default()
    // 应包含协议和端口
    .with_url("http://localhost:8123")
    .with_user("name")
    .with_password("123")
    .with_database("test");
```

### HTTPS 或 ClickHouse Cloud 连接 {#https-or-clickhouse-cloud-connection}

HTTPS 可与 `rustls-tls` 或 `native-tls` cargo 特性配合使用。

然后,按常规方式创建客户端。在此示例中,使用环境变量存储连接详细信息:

:::important
URL 应包含协议和端口,例如 `https://instance.clickhouse.cloud:8443`。
:::

```rust
fn read_env_var(key: &str) -> String {
    env::var(key).unwrap_or_else(|_| panic!("{key} 环境变量应被设置"))
}

let client = Client::default()
    .with_url(read_env_var("CLICKHOUSE_URL"))
    .with_user(read_env_var("CLICKHOUSE_USER"))
    .with_password(read_env_var("CLICKHOUSE_PASSWORD"));
```

另请参阅:

- 客户端仓库中的 [HTTPS with ClickHouse Cloud 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs)。这也适用于本地部署的 HTTPS 连接。

### 查询行 {#selecting-rows}

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

- 占位符 `?fields` 被替换为 `no, name`(`Row` 的字段)。
- 占位符 `?` 被替换为后续 `bind()` 调用中的值。
- 可以使用便捷的 `fetch_one::<Row>()` 和 `fetch_all::<Row>()` 方法分别获取第一行或所有行。
- `sql::Identifier` 可用于绑定表名。

注意:由于整个响应是流式传输的,游标即使在产生一些行之后也可能返回错误。如果在您的使用场景中发生这种情况,您可以尝试使用 `query(...).with_option("wait_end_of_query", "1")` 以在服务器端启用响应缓冲。[更多详情](/interfaces/http/#response-buffering)。`buffer_size` 选项也可能有用。

:::warning
在查询行时谨慎使用 `wait_end_of_query`,因为它会导致服务器端更高的内存消耗,并可能降低整体性能。
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

- 如果未调用 `end()`,则 `INSERT` 将被中止。
- 行以流的方式逐步发送,以分散网络负载。
- 只有当所有行都位于同一分区且其数量小于 [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size) 时,ClickHouse 才会原子性地插入批次。

### 异步插入(服务器端批处理) {#async-insert-server-side-batching}

您可以使用 [ClickHouse 异步插入](/optimize/asynchronous-inserts)来避免对传入数据进行客户端批处理。只需向 `insert` 方法提供 `async_insert` 选项即可实现(甚至可以提供给 `Client` 实例本身,这样它将影响所有 `insert` 调用)。


```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

另请参阅：

- 客户端代码库中的[异步插入示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs)。

### Inserter 功能（客户端批处理）{#inserter-feature-client-side-batching}

需要启用 `inserter` cargo 功能。

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

- 当达到任何阈值（`max_bytes`、`max_rows`、`period`）时，`Inserter` 会在 `commit()` 中结束当前活动的插入操作。
- 可以使用 `with_period_bias` 调整结束活动 `INSERT` 之间的间隔，以避免并行插入器造成的负载峰值。
- `Inserter::time_left()` 可用于检测当前周期何时结束。如果您的数据流很少发出数据项，请再次调用 `Inserter::commit()` 以检查限制。
- 时间阈值通过使用 [quanta](https://docs.rs/quanta) crate 实现，以加速 `inserter`。如果启用了 `test-util`，则不使用此功能（因此，在自定义测试中可以通过 `tokio::time::advance()` 管理时间）。
- `commit()` 调用之间的所有行都在同一个 `INSERT` 语句中插入。

:::warning
如果要终止/完成插入操作，请不要忘记刷新：

```rust
inserter.end().await?;
```

:::

### 执行 DDL 语句 {#executing-ddls}

对于单节点部署，像这样执行 DDL 语句就足够了：

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

但是，在使用负载均衡器的集群部署或 ClickHouse Cloud 上，建议使用 `wait_end_of_query` 选项等待 DDL 在所有副本上应用完成。可以这样做：

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
    // 此设置仅应用于此特定查询；
    // 它将覆盖全局客户端设置。
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

除了 `query` 之外，它与 `insert` 和 `inserter` 方法的工作方式类似；此外，可以在 `Client` 实例上调用相同的方法来为所有查询设置全局设置。

### 查询 ID {#query-id}

使用 `.with_option`，您可以设置 `query_id` 选项以在 ClickHouse 查询日志中标识查询。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

Besides `query`, it works similarly with `insert` and `inserter` methods.

:::danger
如果您手动设置 `query_id`，请确保它是唯一的。UUID 是一个不错的选择。
:::

另请参阅：客户端代码库中的 [query_id 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs)。

### 会话 ID {#session-id}


与 `query_id` 类似,您可以设置 `session_id` 以在同一会话中执行语句。`session_id` 可以在客户端级别全局设置,也可以针对每个 `query`、`insert` 或 `inserter` 调用单独设置。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
在集群部署中,由于缺少"粘性会话"机制,您需要连接到_特定的集群节点_才能正确使用此功能,因为例如轮询负载均衡器无法保证后续请求会由同一个 ClickHouse 节点处理。
:::

另请参阅:客户端代码库中的 [session_id 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs)。

### 自定义 HTTP 头 {#custom-http-headers}

如果您使用代理身份验证或需要传递自定义头,可以按如下方式操作:

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

另请参阅:客户端代码库中的[自定义 HTTP 头示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs)。

### 自定义 HTTP 客户端 {#custom-http-client}

这对于调整底层 HTTP 连接池设置很有用。

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // 或 HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // 在客户端保持特定空闲套接字存活的时长(以毫秒为单位)。
    // 该值应当明显小于 ClickHouse 服务器的 KeepAlive 超时时间,
    // 23.11 之前的版本默认为 3 秒,之后的版本为 10 秒。
    .pool_idle_timeout(Duration::from_millis(2_500))
    // 设置连接池中允许的最大空闲 Keep-Alive 连接数。
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
此示例依赖于旧版 Hyper API,未来可能会发生变化。
:::

另请参阅:客户端代码库中的[自定义 HTTP 客户端示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs)。


## 数据类型 {#data-types}

:::info
另请参阅以下示例:

- [简单的 ClickHouse 数据类型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
- [容器类 ClickHouse 数据类型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
  :::

- `(U)Int(8|16|32|64|128)` 映射到相应的 `(u|i)(8|16|32|64|128)` 类型或其封装的新类型。
- `(U)Int256` 不直接支持,但有[相应的解决方法](https://github.com/ClickHouse/clickhouse-rs/issues/48)。
- `Float(32|64)` 映射到相应的 `f(32|64)` 或其封装的新类型。
- `Decimal(32|64|128)` 映射到相应的 `i(32|64|128)` 或其封装的新类型。建议使用 [`fixnum`](https://github.com/loyd/fixnum) 或其他有符号定点数实现,这样更方便。
- `Boolean` 映射到 `bool` 或其封装的新类型。
- `String` 映射到任何字符串或字节类型,例如 `&str`、`&[u8]`、`String`、`Vec<u8>` 或 [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html)。也支持新类型。要存储字节,建议使用 [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/),因为它更高效。

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

- `FixedString(N)` 支持字节数组形式,例如 `[u8; N]`。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```

- `Enum(8|16)` 通过 [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/) 支持。

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

- `UUID` 通过 `serde::uuid` 映射到 [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html)。需要启用 `uuid` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```

- `IPv6` 映射到 [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html)。
- `IPv4` 通过 `serde::ipv4` 映射到 [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html)。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```

- `Date` 映射到 `u16` 或其封装的新类型,表示自 `1970-01-01` 以来经过的天数。此外,通过 `serde::time::date` 支持 [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html),需要启用 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

- `Date32` 映射到 `i32` 或其封装的新类型,表示自 `1970-01-01` 以来经过的天数。此外,通过 `serde::time::date32` 支持 [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html),需要启用 `time` 特性。


```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```

* `DateTime` 在 `u32` 或其对应的 newtype 之间进行映射，并表示自 UNIX 纪元以来经过的秒数。同时，通过使用 `serde::time::datetime` 也支持 [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)，这需要启用 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` 可与 `i32` 或其新类型封装相互映射，并表示自 UNIX 纪元以来经过的时间。此外，还可以通过 `serde::time::datetime64::*` 来支持使用 [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)，这需要启用 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // 根据 `DateTime64(X)` 的精度,表示经过的秒/微秒/毫秒/纳秒
    #[serde(with = "clickhouse::serde::time::datetime64::secs")]
    dt64s: OffsetDateTime,  // `DateTime64(0)` (秒精度)
    #[serde(with = "clickhouse::serde::time::datetime64::millis")]
    dt64ms: OffsetDateTime, // `DateTime64(3)` (毫秒精度)
    #[serde(with = "clickhouse::serde::time::datetime64::micros")]
    dt64us: OffsetDateTime, // `DateTime64(6)` (微秒精度)
    #[serde(with = "clickhouse::serde::time::datetime64::nanos")]
    dt64ns: OffsetDateTime, // `DateTime64(9)` (纳秒精度)
}
```

* `Tuple(A, B, ...)` 映射到/从 `(A, B, ...)` 或对其进行封装的新类型进行转换。
* `Array(_)` 映射到/从任意切片进行转换，例如 `Vec<_>`、`&[_]`。也支持新类型。
* `Map(K, V)` 的行为类似于 `Array((K, V))`。
* `LowCardinality(_)` 可无缝使用。
* `Nullable(_)` 映射到/从 `Option<_>` 进行转换。对于 `clickhouse::serde::*` 辅助函数，添加 `::option`。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```

* 对 `Nested` 的支持是通过提供多个数组并进行重命名来实现的。

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

* 支持 `Geo` 类型。`Point` 与元组 `(f64, f64)` 类似，其余类型则只是由点构成的切片。

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

* 目前尚不支持 `Variant`、`Dynamic` 和（新的）`JSON` 数据类型。


## 模拟测试 {#mocking}

该 crate 提供了用于模拟 ClickHouse 服务器以及测试 DDL、`SELECT`、`INSERT` 和 `WATCH` 查询的工具。可通过 `test-util` 特性启用此功能。请**仅**将其作为开发依赖项使用。

参见[示例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)。


## 故障排查 {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

`CANNOT_READ_ALL_DATA` 错误最常见的原因是应用程序端的行定义与 ClickHouse 中的定义不匹配。

以下表为例:

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

如果在应用程序端定义 `EventLog` 时类型不匹配,例如:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- 应该是 u32 类型!
}
```

插入数据时可能会出现以下错误:

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

在此示例中,通过正确定义 `EventLog` 结构体即可解决该问题:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```


## 已知限制 {#known-limitations}

- 暂不支持 `Variant`、`Dynamic`、（新）`JSON` 数据类型。
- 暂不支持服务器端参数绑定；请参阅[此问题](https://github.com/ClickHouse/clickhouse-rs/issues/142)了解跟踪信息。


## 联系我们 {#contact-us}

如果您有任何问题或需要帮助,请随时通过 [Community Slack](https://clickhouse.com/slack) 或 [GitHub issues](https://github.com/ClickHouse/clickhouse-rs/issues) 与我们联系。
