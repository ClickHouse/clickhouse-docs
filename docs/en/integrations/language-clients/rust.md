---
sidebar_label: Rust
sidebar_position: 4
keywords: [clickhouse, rs, rust, cargo, crate, http, client, connect, integrate]
slug: /en/integrations/rust
description: The official Rust client for connecting to ClickHouse.
---

# ClickHouse Rust Client

The official Rust client for connecting to ClickHouse, originally developed by [Paul Loyd](https://github.com/loyd). The client source code is available in the [GitHub repository](https://github.com/ClickHouse/clickhouse-rs).

## Overview

* Uses `serde` for encoding/decoding rows.
* Supports `serde` attributes: `skip_serializing`, `skip_deserializing`, `rename`.
* Uses [`RowBinary`](https://clickhouse.com/docs/en/interfaces/formats#rowbinary) format over the HTTP transport.
    * There are plans to switch to [`Native`](https://clickhouse.com/docs/en/interfaces/formats#native) over TCP.
* Supports TLS (via `native-tls` and `rustls-tls` features).
* Supports compression and decompression (LZ4).
* Provides APIs for selecting or inserting data, executing DDLs, and client-side batching.
* Provides convenient mocks for unit testing.

## Installation

To use the crate, add the following to your `Cargo.toml`:

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

See also: [crates.io page](https://crates.io/crates/clickhouse).

## Cargo features

* `lz4` (enabled by default) — enables `Compression::Lz4` and `Compression::Lz4Hc(_)` variants. If enabled, `Compression::Lz4` is used by default for all queries except for `WATCH`.
* `native-tls` — supports urls with the `HTTPS` schema via `hyper-tls`, which links against OpenSSL.
* `rustls-tls` — supports urls with the `HTTPS` schema via `hyper-rustls`, which does not link against OpenSSL.
* `inserter` — enables `client.inserter()`.
* `test-util` — adds mocks. See [the example](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs). Use it only in `dev-dependencies`.
* `watch` — enables `client.watch` functionality. See the corresponding section for details.
* `uuid` — adds `serde::uuid` to work with [uuid](https://docs.rs/uuid) crate.
* `time` — adds `serde::time` to work with [time](https://docs.rs/time) crate.

:::important
When connecting to ClickHouse via an `HTTPS` url, either the `native-tls` or `rustls-tls` feature should be enabled.
If both are enabled, the `rustls-tls` feature will take precedence.
:::

## ClickHouse versions compatibility

The client is compatible with the LTS or newer versions of ClickHouse, as well as ClickHouse Cloud.

ClickHouse server older than v22.6 handles RowBinary [incorrectly in some rare cases](https://github.com/ClickHouse/ClickHouse/issues/37420). 
You could use v0.11+ and enable `wa-37420` feature to solve this problem. Note: this feature should not be used with newer ClickHouse versions.

## Examples

We aim to cover various scenarios of client usage with the [examples](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples) in the client repository. The overview is available in the [examples README](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview).

If something is unclear or missing from the examples or from the following documentation, feel free to [contact us](./rust.md#contact-us).

## Usage

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs) crate is useful to generate a row type from ClickHouse.
:::

### Creating a client instance

:::tip
Reuse created clients or clone them in order to reuse the underlying hyper connection pool.
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

### HTTPS or ClickHouse Cloud connection

HTTPS works with either `rustls-tls` or `native-tls` cargo features.

Then, create client as usual. In this example, the environment variables are used to store the connection details:

:::important
The URL should include both protocol and port, e.g. `https://instance.clickhouse.cloud:8443`.
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

See also: 
- [HTTPS with ClickHouse Cloud example](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs) in the client repo. This should be applicable to on-premise HTTPS connections as well.

### Selecting rows

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

* Placeholder `?fields` is replaced with `no, name` (fields of `Row`).
* Placeholder `?` is replaced with values in following `bind()` calls.
* Convenient `fetch_one::<Row>()` and `fetch_all::<Row>()` methods can be used to get a first row or all rows, correspondingly.
* `sql::Identifier` can be used to bind table names.

NB: as the entire response is streamed, cursors can return an error even after producing some rows. If this happens in your use case, you could try `query(...).with_option("wait_end_of_query", "1")` in order to enable response buffering on the server-side. [More details](https://clickhouse.com/docs/en/interfaces/http/#response-buffering). The `buffer_size` option can be useful, too.

:::warning
Use `wait_end_of_query` with caution when selecting rows, as it can will to higher memory consumption on the server side and will likely decrease the overall performance.
:::

### Inserting rows

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

* If `end()` isn't called, the `INSERT` is aborted.
* Rows are being sent progressively as a stream to spread the network load.
* ClickHouse inserts batches atomically only if all rows fit in the same partition and their number is less [`max_insert_block_size`](https://clickhouse.tech/docs/en/operations/settings/settings/#settings-max_insert_block_size).

### Async insert (server-side batching)

You could use [ClickHouse asynchronous inserts](https://clickhouse.com/docs/en/optimize/asynchronous-inserts) to avoid client-side batching of the incoming data. This can be done by simply providing the `async_insert` option to the `insert` method (or even to the `Client` instance itself, so that it will affect all the `insert` calls).

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

See also:
- [Async insert example](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs) in the client repo.

### Inserter feature (client-side batching)

Requires the `inserter` cargo feature.

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

* `Inserter` ends the active insert in `commit()` if any of the thresholds (`max_bytes`, `max_rows`, `period`) are reached.
* The interval between ending active `INSERT`s can be biased by using `with_period_bias` to avoid load spikes by parallel inserters.
* `Inserter::time_left()` can be used to detect when the current period ends. Call `Inserter::commit()` again to check limits if your stream emits items rarely.
* Time thresholds implemented by using [quanta](https://docs.rs/quanta) crate to speed the inserter up. Not used if `test-util` is enabled (thus, time can be managed by `tokio::time::advance()` in custom tests).
* All rows between `commit()` calls are inserted in the same `INSERT` statement.

:::warning
Do not forget to flush if you want to terminate/finalize inserting:
```rust
inserter.end().await?;
```
:::

### Executing DDLs

With a single-node deployment, it is enough to execute DDLs like this:

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

However, on clustered deployments with a load-balancer or ClickHouse Cloud, it is recommended to wait for the DDL to be applied on all the replicas, using the `wait_end_of_query` option. This can be done like this:

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```

### ClickHouse settings

You can apply various [ClickHouse settings](https://clickhouse.com/docs/en/operations/settings/settings) using the `with_option` method. For example:

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // This setting will be applied to this particular query only;
    // it will override the global client setting.
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

Besides `query`, it works similarly with `insert` and `inserter` methods; additionally, the same method can be called on the `Client` instance to set global settings for all queries.

### Query ID

Using `.with_option`, you can set the `query_id` option to identify queries in the ClickHouse query log.

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

Besides `query`, it works similarly with `insert` and `inserter` methods.

:::danger
If you set `query_id` manually, make sure that it is unique. UUIDs are a good choice for this.
:::

See also: [query_id example](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) in the client repo.

### Session ID

Similarly to `query_id`, you can set the `session_id` to execute the statements in the same session. `session_id` can be set either globally on the client level, or per `query`, `insert`, or `inserter` call.

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
With clustered deployments, due to lack of "sticky sessions", you need to be connected to a _particular cluster node_ in order to properly utilize this feature, cause, for example, a round-robin load-balancer will not guarantee that the consequent requests will be processed by the same ClickHouse node.
:::

See also: [session_id example](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) in the client repo.

### Custom HTTP headers

If you are using proxy authentication or need to pass custom headers, you can do it like this:

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

See also: [custom HTTP headers example](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) in the client repo.

### Custom HTTP client

This could be useful for tweaking the underlying HTTP connection pool settings.

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
This example relies on the legacy Hyper API and is a subject to change in the future.
:::

See also: [custom HTTP client example](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) in the client repo.

## Data Types
* `(U)Int(8|16|32|64|128)` maps to/from corresponding `(u|i)(8|16|32|64|128)` types or newtypes around them.
* `(U)Int256` are not supported directly, but there is [a workaround for it](https://github.com/ClickHouse/clickhouse-rs/issues/48).
* `Float(32|64)` maps to/from corresponding `f(32|64)` or newtypes around them.
* `Decimal(32|64|128)` maps to/from corresponding `i(32|64|128)` or newtypes around them. It's more convenient to use [fixnum](https://github.com/loyd/fixnum) or another implementation of signed fixed-point numbers.
* `Boolean` maps to/from `bool` or newtypes around it.
* `String` maps to/from any string or bytes types, e.g. `&str`, `&[u8]`, `String`, `Vec<u8>` or [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html). Newtypes are also supported. To store bytes, consider using [serde_bytes](https://docs.rs/serde_bytes/latest/serde_bytes/), because it's more efficient.

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

* `FixedString(N)` is supported as an array of bytes, e.g. `[u8; N]`.

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```
* `Enum(8|16)` are supported using [serde_repr](https://docs.rs/serde_repr/latest/serde_repr/).

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
* `UUID` maps to/from [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) by using `serde::uuid`. Requires the `uuid` feature.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```
* `IPv6` maps to/from [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html).
* `IPv4` maps to/from [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) by using `serde::ipv4`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```
* `Date` maps to/from `u16` or a newtype around it and represents a number of days elapsed since `1970-01-01`. Also, [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) is supported by using `serde::time::date`, that requires the `time` feature.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```
* `Date32` maps to/from `i32` or a newtype around it and represents a number of days elapsed since `1970-01-01`. Also, [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) is supported by using `serde::time::date32`, that requires the `time` feature.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```
* `DateTime` maps to/from `u32` or a newtype around it and represents a number of seconds elapsed since UNIX epoch. Also, [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) is supported by using `serde::time::datetime`, that requires the `time` feature.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` maps to/from `i32` or a newtype around it and represents a time elapsed since UNIX epoch. Also, [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) is supported by using `serde::time::datetime64::*`, that requires the `time` feature.

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

* `Tuple(A, B, ...)` maps to/from `(A, B, ...)` or a newtype around it.
* `Array(_)` maps to/from any slice, e.g. `Vec<_>`, `&[_]`. Newtypes are also supported.
* `Map(K, V)` behaves like `Array((K, V))`.
* `LowCardinality(_)` is supported seamlessly.
* `Nullable(_)` maps to/from `Option<_>`. For `clickhouse::serde::*` helpers add `::option`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```
* `Nested` is supported by providing multiple arrays with renaming.
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
* `Variant`, `Dynamic`, (new) `JSON` and `Geo` aren't supported yet.

## Mocking
The crate provides utils for mocking CH server and testing DDL, `SELECT`, `INSERT` and `WATCH` queries. The functionality can be enabled with the `test-util` feature. Use it **only** as a dev-dependency.

See [the example](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs).

## Troubleshooting

### CANNOT_READ_ALL_DATA

The most common cause for the `CANNOT_READ_ALL_DATA` error is that the row definition on the application side does match that in ClickHouse. 

Consider the following table:

```
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

Then, if `EventLog` is defined on the application side with mismatching types, e.g.:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- should be u32 instead!
}
```

When inserting the data, the following error can occur:

```
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

In this example, this is fixed by the correct definition of the `EventLog` struct:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```

## Known limitations

* `Variant`, `Dynamic`, (new) `JSON` and `Geo` aren't supported yet.
* Server-side parameter binding is not supported yet; see [this issue](https://github.com/ClickHouse/clickhouse-rs/issues/142) for tracking.

## Contact us

If you have any questions or need help, feel free to reach out to us in the [Community Slack](https://clickhouse.com/slack) or via [GitHub issues](https://github.com/ClickHouse/clickhouse-rs/issues).
