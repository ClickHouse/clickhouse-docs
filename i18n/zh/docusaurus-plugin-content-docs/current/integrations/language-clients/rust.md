---
sidebar_label: 'Rust'
sidebar_position: 5
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: 'ClickHouse 官方 Rust 连接客户端。'
title: 'ClickHouse Rust 客户端'
doc_type: 'reference'
---



# ClickHouse Rust 客户端

用于连接 ClickHouse 的官方 Rust 客户端，最初由 [Paul Loyd](https://github.com/loyd) 开发。该客户端的源代码可在 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-rs) 中查看。



## 概述 {#overview}

* 使用 `serde` 对行进行编码/解码。
* 支持 `serde` 属性：`skip_serializing`、`skip_deserializing`、`rename`。
* 通过 HTTP 传输使用 [`RowBinary`](/interfaces/formats/RowBinary) 格式。
  * 计划改为通过 TCP 使用 [`Native`](/interfaces/formats/Native) 格式。
* 支持 TLS（通过 `native-tls` 和 `rustls-tls` 特性）。
* 支持压缩和解压缩（LZ4）。
* 提供用于查询或插入数据、执行 DDL 以及客户端批处理的 API。
* 为单元测试提供便捷的 mock 支持。



## 安装

要使用此 crate，请在你的 `Cargo.toml` 中添加以下内容：

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

另请参阅：[crates.io 页面](https://crates.io/crates/clickhouse)。


## Cargo 特性 {#cargo-features}

* `lz4`（默认启用）— 启用 `Compression::Lz4` 和 `Compression::Lz4Hc(_)` 变体。启用后，除 `WATCH` 外的所有查询默认使用 `Compression::Lz4`。
* `native-tls` — 通过 `hyper-tls` 支持使用 `HTTPS` scheme 的 URL，并依赖 OpenSSL 进行链接。
* `rustls-tls` — 通过 `hyper-rustls` 支持使用 `HTTPS` scheme 的 URL，且不依赖 OpenSSL 进行链接。
* `inserter` — 启用 `client.inserter()`。
* `test-util` — 添加 mock 支持。参见[示例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)。仅在 `dev-dependencies` 中使用。
* `watch` — 启用 `client.watch` 功能。详情参见相应章节。
* `uuid` — 添加 `serde::uuid` 以配合 [uuid](https://docs.rs/uuid) crate 使用。
* `time` — 添加 `serde::time` 以配合 [time](https://docs.rs/time) crate 使用。

:::important
当通过 `HTTPS` URL 连接到 ClickHouse 时，应启用 `native-tls` 或 `rustls-tls` 其中之一。
如果两者都启用，则 `rustls-tls` 特性将具有更高优先级。
:::



## ClickHouse 版本兼容性 {#clickhouse-versions-compatibility}

该客户端兼容 ClickHouse 的 LTS 或更高版本，以及 ClickHouse Cloud。

版本低于 v22.6 的 ClickHouse 服务器在极少数情况下可能会[错误处理 RowBinary](https://github.com/ClickHouse/ClickHouse/issues/37420)。  
可以使用 v0.11+ 并启用 `wa-37420` 功能来解决此问题。注意：不应在较新版本的 ClickHouse 中使用此功能。



## 示例 {#examples}

我们在客户端仓库中的[示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples)中，力求涵盖各种客户端使用场景。你可以在[示例 README](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview)中查看概览。

如果示例或下文中的内容有任何不清楚或缺失之处，欢迎[联系我们](./rust.md#contact-us)。



## 用法

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs) crate 可用于从 ClickHouse 生成行类型。
:::

### 创建客户端实例

:::tip
请复用已创建的客户端，或对其进行克隆，以复用底层的 hyper 连接池。
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

### HTTPS 或 ClickHouse Cloud 连接

HTTPS 可以配合 `rustls-tls` 或 `native-tls` Cargo 特性一起使用。

然后，按常规方式创建客户端。在本例中，使用环境变量来存储连接信息：

:::important
URL 应同时包含协议和端口，例如 `https://instance.clickhouse.cloud:8443`。
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

* 客户端仓库中的 [使用 ClickHouse Cloud 的 HTTPS 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs)。该示例同样适用于本地部署环境中的 HTTPS 连接。

### 选择行

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

* 占位符 `?fields` 会被替换为 `no, name`（`Row` 的字段）。
* 占位符 `?` 会被替换为后续 `bind()` 调用中提供的值。
* 可以使用便捷方法 `fetch_one::<Row>()` 和 `fetch_all::<Row>()` 分别获取第一行或所有行。
* 可以使用 `sql::Identifier` 来绑定表名。

注意：由于整个响应是以流式方式返回的，游标即使在已经返回了一些行之后仍有可能报错。如果在你的使用场景中出现这种情况，可以尝试在查询中使用 `query(...).with_option("wait_end_of_query", "1")`，以在服务端启用响应缓冲。[更多细节](/interfaces/http/#response-buffering)。`buffer_size` 选项也可能会有所帮助。

:::warning
在查询行数据时谨慎使用 `wait_end_of_query`，因为它可能会导致服务端更高的内存消耗，并且很可能会降低整体性能。
:::

### 插入行

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

* 如果未调用 `end()`，则会中止 `INSERT`。
* 行会以流式方式逐步发送，以分散网络负载。
* 只有在所有行都落入同一个分区且行数小于 [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size) 时，ClickHouse 才会以原子方式插入整个批次。

### 异步插入（服务端批处理）

可以使用 [ClickHouse 异步插入](/optimize/asynchronous-inserts) 来避免在客户端对传入数据进行批处理。只需在 `insert` 方法中提供 `async_insert` 选项即可（也可以在 `Client` 实例上指定，从而影响所有 `insert` 调用）。


```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

另请参阅：

* 客户端代码仓库中的[异步插入示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs)。

### Inserter 特性（客户端批量插入）

需要启用 `inserter` Cargo feature。

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
        "已插入 {} 字节、{} 行、{} 个事务",
        stats.bytes, stats.rows, stats.transactions,
    );
}

// 请勿忘记在应用程序关闭时完成 inserter 的终结操作
// 并提交剩余行。`.end()` 同样会返回统计信息。
inserter.end().await?;
```

* 如果达到任一阈值（`max_bytes`、`max_rows`、`period`），`Inserter` 会在 `commit()` 中结束当前正在进行的插入操作。
* 可以使用 `with_period_bias` 来调整结束活动 `INSERT` 之间的时间间隔，以避免并行插入器导致的负载峰值。
* 可以使用 `Inserter::time_left()` 来检测当前周期何时结束。如果你的流很少产生数据，请再次调用 `Inserter::commit()` 来检查是否达到限制。
* 时间阈值通过使用 [quanta](https://docs.rs/quanta) crate 来实现，以加速 `inserter`。如果启用了 `test-util`，则不会使用它（因此在自定义测试中可以通过 `tokio::time::advance()` 来控制时间）。
* 在两次 `commit()` 调用之间的所有行都会通过同一个 `INSERT` 语句插入。

:::warning
如果你想终止/完成插入操作，请不要忘记执行 flush：

```rust
inserter.end().await?;
```

:::

### 执行 DDL

对于单节点部署，只需像这样执行 DDL 语句即可：

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

但是，在带有负载均衡器或 ClickHouse Cloud 的集群部署中，建议使用 `wait_end_of_query` 选项，等待 DDL 在所有副本上生效。可以按如下方式进行：

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```

### ClickHouse 设置

可以使用 `with_option` 方法配置各种 [ClickHouse 设置](/operations/settings/settings)。例如：

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // 此设置仅应用于当前查询；
    // 它将覆盖全局客户端设置。
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

除了 `query` 以外，它对 `insert` 和 `inserter` 方法也以类似方式工作；另外，还可以在 `Client` 实例上调用同样的方法，为所有查询设置全局设置。

### Query ID

使用 `.with_option`，可以设置 `query_id` 选项，以便在 ClickHouse 查询日志中标识查询。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

除了 `query` 之外，它在 `insert` 和 `inserter` 方法中也以类似的方式工作。

:::danger
如果你手动设置 `query_id`，请确保其唯一。UUID 是一个不错的选择。
:::

另请参阅：客户端仓库中的 [query&#95;id 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs)。

### 会话 ID


与 `query_id` 类似，你可以设置 `session_id`，以在同一个会话中执行语句。`session_id` 可以在客户端级别全局设置，也可以在每次 `query`、`insert` 或 `inserter` 调用时单独设置。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
在集群部署场景下，由于缺少“粘性会话”（sticky sessions）机制，你需要连接到*特定的集群节点*才能正确使用此功能，因为例如轮询负载均衡器并不能保证后续请求会由同一个 ClickHouse 节点处理。
:::

另见：客户端仓库中的 [session&#95;id 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs)。

### 自定义 HTTP 头部

如果你在使用代理认证，或者需要传递自定义头部，可以按如下方式进行：

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

另请参阅：客户端仓库中的[自定义 HTTP 请求头示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs)。

### 自定义 HTTP 客户端

这对于调整底层 HTTP 连接池的设置很有帮助。

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // or HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // 客户端保持特定空闲套接字存活的时长(以毫秒为单位)。
    // 该值应明显小于 ClickHouse 服务器的 KeepAlive 超时时间,
    // 23.11 之前的版本默认为 3 秒,之后版本为 10 秒。
    .pool_idle_timeout(Duration::from_millis(2_500))
    // 设置连接池允许的最大空闲 Keep-Alive 连接数。
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
此示例依赖于旧版 Hyper API，将来可能会发生变更。
:::

另请参见：客户端存储库中的 [自定义 HTTP 客户端示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs)。


## 数据类型

:::info
另请参阅以下补充示例：

* [更简单的 ClickHouse 数据类型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)

* [类似容器的 ClickHouse 数据类型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
  :::

* `(U)Int(8|16|32|64|128)` 可与对应的 `(u|i)(8|16|32|64|128)` 类型或其外层的 newtype 互相映射。

* `(U)Int256` 暂不直接支持，但有[对应的变通方案](https://github.com/ClickHouse/clickhouse-rs/issues/48)。

* `Float(32|64)` 可与对应的 `f(32|64)` 或其外层的 newtype 互相映射。

* `Decimal(32|64|128)` 可与对应的 `i(32|64|128)` 或其外层的 newtype 互相映射。使用 [`fixnum`](https://github.com/loyd/fixnum) 或其他有符号定点数实现会更方便。

* `Boolean` 可与 `bool` 或其外层的 newtype 互相映射。

* `String` 可与任意字符串或字节类型互相映射，例如 `&str`、`&[u8]`、`String`、`Vec<u8>` 或 [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html)。自定义 newtype 也受支持。要存储字节时，建议使用 [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/)，因为它更高效。

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

* 支持将 `FixedString(N)` 作为字节数组使用，例如 `[u8; N]`。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16) 固定长度字符串(16)
}
```

* 通过 [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/) 支持 `Enum(8|16)`。

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

* `UUID` 使用 `serde::uuid` 与 [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) 进行互相映射。需要启用 `uuid` 功能特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```

* `IPv6` 映射到 / 从 [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html) 映射回来。
* `IPv4` 使用 `serde::ipv4` 映射到 / 从 [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) 映射回来。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```

* `Date` 会与 `u16`（或包裹它的 newtype）相互映射，并表示自 `1970-01-01` 起经过的天数。同时，通过使用 `serde::time::date` 也支持 [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)，这需要启用 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

* `Date32` 可与 `i32` 或其 newtype 包装类型相互映射，表示自 `1970-01-01` 起经过的天数。同时，也可以通过 `serde::time::date32` 支持 [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)，这需要启用 `time` 特性。


```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```

* `DateTime` 会与 `u32` 或其包装的 newtype 类型之间进行映射，并表示自 UNIX 纪元以来经过的秒数。同时，也支持通过使用 `serde::time::datetime` 来处理 [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)，这需要启用 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` 会映射到 / 从 `i32` 或其 newtype 封装类型进行映射，用于表示自 UNIX 纪元以来经过的时间。同时也支持通过 `serde::time::datetime64::*` 使用 [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)，该功能需要启用 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // 根据 `DateTime64(X)` 的精度表示经过的秒/微秒/毫秒/纳秒
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

* `Tuple(A, B, ...)` 可以与 `(A, B, ...)` 或其对应的 newtype 相互映射。
* `Array(_)` 可以与任意切片（slice）相互映射，例如 `Vec<_>`、`&[_]`。也支持自定义新类型。
* `Map(K, V)` 的行为类似于 `Array((K, V))`。
* `LowCardinality(_)` 可无缝使用。
* `Nullable(_)` 可以与 `Option<_>` 相互映射。对于 `clickhouse::serde::*` 帮助函数，请添加 `::option`。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```

* 通过提供多个数组并进行重命名来支持 `Nested`。

```rust
// 创建表 test(items Nested(name String, count UInt32))
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(rename = "items.name")]
    items_name: Vec<String>,
    #[serde(rename = "items.count")]
    items_count: Vec<u32>,
}
```

* 支持 `Geo` 类型。`Point` 的行为类似于元组 `(f64, f64)`，其余类型则是由 `Point` 组成的切片。

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

* `Variant`、`Dynamic` 和（新的）`JSON` 数据类型目前尚不支持。


## Mocking {#mocking}
该 crate 提供了用于模拟 ClickHouse 服务器并测试 DDL、`SELECT`、`INSERT` 和 `WATCH` 查询的实用工具。可以通过启用 `test-util` 功能来开启此功能。**仅**将其用作开发依赖（dev-dependency）。

参见[示例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)。



## 故障排查

### CANNOT&#95;READ&#95;ALL&#95;DATA

导致 `CANNOT_READ_ALL_DATA` 错误的最常见原因，是应用程序端的行定义与 ClickHouse 中的行定义不匹配。

请看如下表：

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

然后，如果在应用程序中定义的 `EventLog` 使用了不匹配的类型，例如：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- 应改为 u32 类型！
}
```

在插入数据时，可能会遇到以下错误：

```response
错误: BadResponse("Code: 33. DB::Exception: 无法读取全部数据。已读取字节: 5。预期字节: 23.: (at row 1)\n: 执行 BinaryRowInputFormat 时。(CANNOT_READ_ALL_DATA)")
```

在本示例中，通过正确定义 `EventLog` 结构体即可修复该问题：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```


## 已知限制 {#known-limitations}

* 暂不支持 `Variant`、`Dynamic` 和（新的）`JSON` 数据类型。
* 目前尚不支持服务端参数绑定；跟踪进展请参阅[该 issue](https://github.com/ClickHouse/clickhouse-rs/issues/142)。



## 联系我们 {#contact-us}

如有任何问题或需要帮助，可在 [Community Slack](https://clickhouse.com/slack) 上联系我们，或通过 [GitHub issues](https://github.com/ClickHouse/clickhouse-rs/issues) 与我们取得联系。
