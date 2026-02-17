---
sidebar_label: 'Rust'
sidebar_position: 5
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: '官方 Rust 客户端，用于连接 ClickHouse。'
title: 'ClickHouse Rust 客户端'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

# ClickHouse Rust 客户端 \{#clickhouse-rust-client\}

用于连接 ClickHouse 的官方 Rust 客户端，最初由 [Paul Loyd](https://github.com/loyd) 开发。客户端源代码可在 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-rs) 中获取。

## 概述 \{#overview\}

* 使用 `serde` 对行进行编码/解码。
* 支持 `serde` 属性：`skip_serializing`、`skip_deserializing`、`rename`。
* 在 HTTP 传输上使用 [`RowBinary`](/interfaces/formats/RowBinary) 格式。
  * 计划在 TCP 上切换为使用 [`Native`](/interfaces/formats/Native)。
* 支持 TLS（通过 `native-tls` 和 `rustls-tls` 特性）。
* 支持压缩和解压缩（LZ4）。
* 提供用于查询或插入数据、执行 DDL，以及客户端批量处理的 API。
* 为单元测试提供便捷的 mock 支持。

## 安装 \{#installation\}

要使用此 crate，请在您的 `Cargo.toml` 中添加以下内容：

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

另请参阅：[crates.io 页面](https://crates.io/crates/clickhouse)。


## Cargo 特性 \{#cargo-features\}

* `lz4`（默认启用）— 启用 `Compression::Lz4` 和 `Compression::Lz4Hc(_)` 变体。启用后，除 `WATCH` 之外的所有查询默认使用 `Compression::Lz4`。
* `native-tls` — 通过 `hyper-tls` 支持使用 `HTTPS` scheme 的 URL，并链接到 OpenSSL。
* `rustls-tls` — 通过 `hyper-rustls` 支持使用 `HTTPS` scheme 的 URL，且不会链接到 OpenSSL。
* `inserter` — 启用 `client.inserter()`。
* `test-util` — 添加用于测试的 mock。参见[示例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)。仅在 `dev-dependencies` 中使用。
* `watch` — 启用 `client.watch` 功能。详情参见相应章节。
* `uuid` — 添加 `serde::uuid` 以配合 [uuid](https://docs.rs/uuid) crate 使用。
* `time` — 添加 `serde::time` 以配合 [time](https://docs.rs/time) crate 使用。

:::important
通过 `HTTPS` URL 连接 ClickHouse 时，必须启用 `native-tls` 或 `rustls-tls` 特性之一。
如果两者都启用，将优先使用 `rustls-tls` 特性。
:::

## ClickHouse 版本兼容性 \{#clickhouse-versions-compatibility\}

该客户端兼容 ClickHouse 的 LTS 或更新版本，以及 ClickHouse Cloud。

版本低于 v22.6 的 ClickHouse 服务端在某些罕见情况下会[错误处理 RowBinary](https://github.com/ClickHouse/ClickHouse/issues/37420)。  
可以通过使用 v0.11+ 并启用 `wa-37420` 功能来解决该问题。注意：在较新的 ClickHouse 版本中不应启用该功能。

## 示例 \{#examples\}

我们致力于通过客户端仓库中的[示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples)覆盖各种客户端使用场景。其概览可在[示例 README](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview)中查看。

如果示例或后续文档中有任何不清楚或缺失的内容，欢迎[联系我们](./rust.md#contact-us)。

## 用法 \{#usage\}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs) crate 对于从 ClickHouse 生成行类型非常有用。
:::

### 创建客户端实例 \{#creating-a-client-instance\}

:::tip
请复用已创建的客户端，或通过克隆客户端来复用底层的 hyper 连接池。
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


### HTTPS 或 ClickHouse Cloud 连接 \{#https-or-clickhouse-cloud-connection\}

HTTPS 可与 `rustls-tls` 或 `native-tls` Cargo 特性一起使用。

然后像平常一样创建客户端。在此示例中，使用环境变量来存储连接信息：

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

* 客户端仓库中的 [ClickHouse Cloud HTTPS 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs)。这同样适用于本地部署环境中的 HTTPS 连接。


### 查询行 \{#selecting-rows\}

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
* 占位符 `?` 会被后续的 `bind()` 调用中的值替换。
* 可以方便地使用 `fetch_one::<Row>()` 和 `fetch_all::<Row>()` 方法，分别获取首行或全部行。
* 可以使用 `sql::Identifier` 来绑定表名。

注意：由于整个响应是以流式方式返回的，即使已经返回了一些行之后，游标仍可能返回错误。如果在你的使用场景中发生这种情况，可以尝试使用 `query(...).with_option("wait_end_of_query", "1")` 来启用服务器端的响应缓冲。[更多细节](/interfaces/http/#response-buffering)。`buffer_size` 选项也可能会有帮助。

:::warning
在选择行（执行 SELECT 查询）时谨慎使用 `wait_end_of_query`，因为它可能会导致服务器端更高的内存消耗，并且很可能降低整体性能。
:::


### 插入数据行 \{#inserting-rows\}

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
* 行会以流式方式逐步发送，以分摊网络负载。
* 仅当所有行都位于同一分区且其数量小于 [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size) 时，ClickHouse 才会以原子方式插入批次。


### 异步插入（服务端批处理） \{#async-insert-server-side-batching\}

可以使用 [ClickHouse 异步插入](/optimize/asynchronous-inserts) 来避免在客户端对传入数据进行批处理。只需在 `insert` 方法中传入 `async_insert` 选项即可完成此操作（也可以在 `Client` 实例本身上设置该选项，从而影响所有的 `insert` 调用）。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

另请参阅：

* 客户端代码仓库中的[异步插入示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs)。


### Inserter 功能（客户端批处理） \{#inserter-feature-client-side-batching\}

需要启用 Cargo 的 `inserter` 特性。

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

* 如果达到任一阈值（`max_bytes`、`max_rows`、`period`），`Inserter` 会在 `commit()` 中结束当前活动的 `INSERT` 操作。
* 可以使用 `with_period_bias` 来调整结束活动 `INSERT` 之间的时间间隔，从而避免多个并行 inserter 导致的负载峰值。
* 可以使用 `Inserter::time_left()` 来判断当前周期何时结束。如果你的流式数据很少产生元素，请再次调用 `Inserter::commit()` 以检查是否触及限制。
* 时间阈值通过使用 [quanta](https://docs.rs/quanta) crate 实现，以加速 `inserter`。如果启用了 `test-util`，则不会使用该机制（因此在自定义测试中可以通过 `tokio::time::advance()` 来控制时间）。
* 在两次 `commit()` 调用之间的所有行都会被插入到同一个 `INSERT` 语句中。

:::warning
如果你想终止/完成插入操作，不要忘记进行 flush：

```rust
inserter.end().await?;
```

:::


### 执行 DDL \{#executing-ddls\}

对于单节点部署，只需按如下方式执行 DDL 即可：

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

但是，在使用负载均衡器或 ClickHouse Cloud 的集群部署中，建议使用 `wait_end_of_query` 选项等待 DDL 在所有副本上生效。可以按如下方式进行：

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```


### ClickHouse 设置 \{#clickhouse-settings\}

可以使用 `with_option` 方法来应用各种 [ClickHouse 设置](/operations/settings/settings)。例如：

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // This setting will be applied to this particular query only;
    // it will override the global client setting.
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

除了 `query` 之外，`insert` 和 `inserter` 方法的用法也类似；此外，还可以在 `Client` 实例上调用相同的方法，为所有查询设置全局配置。


### Query ID \{#query-id\}

使用 `.with_option` 可以设置 `query_id` 选项，用于在 ClickHouse 查询日志中标识查询。

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

除了 `query` 之外，`insert` 和 `inserter` 方法的行为也类似。

:::danger
如果你手动设置 `query_id`，请确保其唯一性。UUID 是一个不错的选择。
:::

另请参见客户端仓库中的 [query&#95;id 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs)。


### 会话 ID \{#session-id\}

与 `query_id` 类似，你可以设置 `session_id`，以在同一会话中执行语句。`session_id` 可以在客户端级别进行全局设置，也可以在每次调用 `query`、`insert` 或 `inserter` 时单独设置。

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
在集群部署中，由于缺少“sticky sessions”，你需要连接到*特定的集群节点*才能正确使用此功能，因为例如轮询式负载均衡器无法保证后续请求始终由同一个 ClickHouse 节点处理。
:::

另请参阅客户端仓库中的：[session&#95;id 示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs)。


### 自定义 HTTP 请求头 \{#custom-http-headers\}

如果你使用代理认证，或需要传递自定义请求头，可以按如下方式进行：

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

另请参阅客户端代码仓库中的 [自定义 HTTP 标头示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs)。


### 自定义 HTTP 客户端 \{#custom-http-client\}

在需要调整底层 HTTP 连接池配置时，这会非常有用。

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
此示例依赖于旧版 Hyper API，未来可能会发生变更。
:::

另请参阅客户端仓库中的 [自定义 HTTP 客户端示例](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs)。


## 数据类型 \{#data-types\}

:::info
另请参阅以下示例：

* [更简单的 ClickHouse 数据类型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)

* [类似容器的 ClickHouse 数据类型](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
  :::

* `(U)Int(8|16|32|64|128)` 映射自/映射到相应的 `(u|i)(8|16|32|64|128)` 类型或基于它们封装的 newtype。

* `(U)Int256` 目前尚不直接支持，但可以使用[相应的变通方案](https://github.com/ClickHouse/clickhouse-rs/issues/48)。

* `Float(32|64)` 映射自/映射到相应的 `f(32|64)` 类型或基于它封装的 newtype。

* `Decimal(32|64|128)` 映射自/映射到相应的 `i(32|64|128)` 类型或基于它封装的 newtype。使用 [`fixnum`](https://github.com/loyd/fixnum) 或其他有符号定点数实现会更方便。

* `Boolean` 映射自/映射到 `bool` 或基于它封装的 newtype。

* `String` 映射自/映射到任意字符串或字节类型，例如 `&str`、`&[u8]`、`String`、`Vec<u8>` 或 [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html)。也支持 newtype。要存储字节时，建议使用 [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/)，因为这样更高效。

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

* `FixedString(N)` 可以表示为字节数组，例如 `[u8; N]`。

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```

* 可通过 [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/) 支持 `Enum(8|16)`。

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

* `UUID` 使用 `serde::uuid` 与 [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) 进行相互映射。需要启用 `uuid` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```

* `IPv6` 可与 [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html) 互相映射。
* `IPv4` 通过使用 `serde::ipv4` 可与 [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) 互相映射。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```

* `Date` 会映射为 `u16`（或其 newtype 封装类型），表示自 `1970-01-01` 起经过的天数。此外，也支持使用 [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)，需通过 `serde::time::date` 使用，并要求启用 `time` feature。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

* `Date32` 映射为/自 `i32` 或基于它的 newtype，并表示自 `1970-01-01` 起经过的天数。同时，通过使用 `serde::time::date32` 也支持 [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)，这需要启用 `time` 特性。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```


* `DateTime` 会映射为/自 `u32` 或其 newtype 封装类型，表示自 UNIX 纪元以来经过的秒数。另还支持 [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)，需通过 `serde::time::datetime`（并启用 `time` feature）来使用。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` 会与 `i32` 或基于它的 newtype 互相映射，并表示自 UNIX 纪元起经过的时间。另外，通过使用 `serde::time::datetime64::*` 也支持 [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)，这需要启用 `time` 特性。

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

* `Tuple(A, B, ...)` 映射到/从 `(A, B, ...)` 或其 newtype 封装。
* `Array(_)` 映射到/从任意切片，例如 `Vec<_>`、`&[_]`。也支持自定义 newtype。
* `Map(K, V)` 的行为类似于 `Array((K, V))`。
* `LowCardinality(_)` 会得到无缝支持。
* `Nullable(_)` 映射到/从 `Option<_>`。对于 `clickhouse::serde::*` 辅助函数，请添加 `::option`。

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```

* 通过提供多个数组并进行重命名来支持 `Nested`。

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

* 支持 `Geo` 类型。`Point` 的行为类似于元组 `(f64, f64)`，其余类型则只是点的切片。

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

* 目前尚不支持 `Variant`、`Dynamic` 以及新的 `JSON` 数据类型。


## 模拟 \{#mocking\}

该 crate 提供了一些用于模拟 ClickHouse 服务器并测试 DDL、`SELECT`、`INSERT` 和 `WATCH` 查询的工具。通过启用 `test-util` 特性即可使用此功能。请**仅**将其作为开发依赖（dev-dependency）使用。

参见[示例](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)。

## 故障排查 \{#troubleshooting\}

### CANNOT_READ_ALL_DATA \{#cannot_read_all_data\}

`CANNOT_READ_ALL_DATA` 错误最常见的原因是：应用侧的行定义与 ClickHouse 中的不一致。

请看如下表：

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

然后，如果在应用程序侧将 `EventLog` 定义为使用不匹配的类型，例如：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- should be u32 instead!
}
```

在插入数据时，可能会出现以下错误：

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

在本示例中，通过正确定义 `EventLog` 结构体可以解决该问题：

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```


## 已知限制 \{#known-limitations\}

* 尚未支持 `Variant`、`Dynamic` 和（新的）`JSON` 数据类型。
* 尚未支持服务端参数绑定；跟踪进展请参阅 [此 issue](https://github.com/ClickHouse/clickhouse-rs/issues/142)。

## 联系我们 \{#contact-us\}

如果您有任何问题或需要帮助，欢迎通过 [社区 Slack](https://clickhouse.com/slack) 或在 [GitHub issues](https://github.com/ClickHouse/clickhouse-rs/issues) 中与我们联系。