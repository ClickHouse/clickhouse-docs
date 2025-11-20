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
'description': 'ClickHouse에 연결하기 위한 공식 Rust 클라이언트.'
'title': 'ClickHouse Rust 클라이언트'
'doc_type': 'reference'
---



# ClickHouse Rust 클라이언트

ClickHouse에 연결하기 위한 공식 Rust 클라이언트로, 원래 [Paul Loyd](https://github.com/loyd)가 개발했습니다. 클라이언트 소스 코드는 [GitHub 리포지토리](https://github.com/ClickHouse/clickhouse-rs)에서 확인할 수 있습니다.

## 개요 {#overview}

* `serde`를 사용하여 행을 인코딩/디코딩합니다.
* `serde` 속성 지원: `skip_serializing`, `skip_deserializing`, `rename`.
* HTTP 전송을 통해 [`RowBinary`](/interfaces/formats/RowBinary) 형식을 사용합니다.
  * TCP를 통해 [`Native`](/interfaces/formats/Native)로 전환할 계획이 있습니다.
* TLS를 지원합니다 (via `native-tls` 및 `rustls-tls` 기능).
* 압축 및 압축 해제를 지원합니다 (LZ4).
* 데이터 선택 또는 삽입, DDL 실행 및 클라이언트 측 배치 처리를 위한 API를 제공합니다.
* 단위 테스트를 위한 편리한 모의를 제공합니다.

## 설치 {#installation}

크레이트를 사용하려면 `Cargo.toml`에 다음을 추가하세요:

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

또한 참조: [crates.io 페이지](https://crates.io/crates/clickhouse).

## Cargo 기능 {#cargo-features}

* `lz4` (기본으로 활성화됨) — `Compression::Lz4` 및 `Compression::Lz4Hc(_)` 변형을 활성화합니다. 활성화되면 기본적으로 `Compression::Lz4`가 모든 쿼리에 사용됩니다, `WATCH`를 제외하고.
* `native-tls` — OpenSSL과 링크된 `hyper-tls`를 통해 `HTTPS` 스키마가 있는 URL을 지원합니다.
* `rustls-tls` — OpenSSL과 링크되지 않은 `hyper-rustls`를 통해 `HTTPS` 스키마가 있는 URL을 지원합니다.
* `inserter` — `client.inserter()`를 활성화합니다.
* `test-util` — 모의를 추가합니다. [예시](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)를 참조하세요. dev-dependencies에서만 사용하세요.
* `watch` — `client.watch` 기능을 활성화합니다. 세부 사항은 해당 섹션을 참조하세요.
* `uuid` — [uuid](https://docs.rs/uuid) 크레이트에서 `serde::uuid`를 사용합니다.
* `time` — [time](https://docs.rs/time) 크레이트에서 `serde::time`을 사용합니다.

:::important
`HTTPS` URL로 ClickHouse에 연결할 때는 `native-tls` 또는 `rustls-tls` 기능이 활성화되어야 합니다.
둘 다 활성화된 경우 `rustls-tls` 기능이 우선합니다.
:::

## ClickHouse 버전 호환성 {#clickhouse-versions-compatibility}

클라이언트는 LTS 또는 최신 버전의 ClickHouse 및 ClickHouse Cloud와 호환됩니다.

ClickHouse 서버 v22.6보다 이전 버전은 RowBinary를 [드물게 잘못 처리](https://github.com/ClickHouse/ClickHouse/issues/37420)합니다.
이 문제를 해결하기 위해 v0.11+를 사용하고 `wa-37420` 기능을 활성화할 수 있습니다. 주의: 이 기능은 최신 ClickHouse 버전과 함께 사용하면 안 됩니다.

## 예제 {#examples}

우리는 클라이언트 사용의 다양한 시나리오를 [예제](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples)로 다루고자 합니다. 개요는 [예제 README](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview)에서 확인할 수 있습니다.

예제 또는 이하의 문서에서 불분명하거나 누락된 내용이 있으면 [문의해 주세요](./rust.md#contact-us).

## 사용법 {#usage}

:::note
[ch2rs](https://github.com/ClickHouse/ch2rs) 크레이트는 ClickHouse에서 행 유형을 생성하는 데 유용합니다.
:::

### 클라이언트 인스턴스 생성 {#creating-a-client-instance}

:::tip
생성된 클라이언트를 재사용하거나 복제하여 기본 하이퍼 연결 풀을 재사용하세요.
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

### HTTPS 또는 ClickHouse Cloud 연결 {#https-or-clickhouse-cloud-connection}

HTTPS는 `rustls-tls` 또는 `native-tls` cargo 기능 중 하나로 작동합니다.

그러면, 클라이언트를 평소와 같이 생성합니다. 이 예제에서는 환경 변수를 사용하여 연결 세부 정보를 저장합니다:

:::important
URL에는 프로토콜과 포트 둘 다 포함되어야 합니다, 예: `https://instance.clickhouse.cloud:8443`.
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

또한 참조: 
- 클라이언트 리포지토리의 [ClickHouse Cloud의 HTTPS 예제](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs). 이는 온프레미스 HTTPS 연결에도 적용될 수 있습니다.

### 행 선택 {#selecting-rows}

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

* 자리 표시자 `?fields`는 `no, name` (Row의 필드)로 대체됩니다.
* 자리 표시자 `?`는 다음 `bind()` 호출의 값으로 대체됩니다.
* 편리한 `fetch_one::<Row>()` 및 `fetch_all::<Row>()` 메서드를 사용하여 첫 번째 행 또는 모든 행을 얻을 수 있습니다.
* 테이블 이름을 바인딩하는 데 `sql::Identifier`를 사용할 수 있습니다.

참고: 전체 응답이 스트리밍되므로 커서는 일부 행을 생성한 후에도 오류를 반환할 수 있습니다. 이 경우, 서버 측에서 응답 버퍼링을 활성화하기 위해 `query(...).with_option("wait_end_of_query", "1")`를 시도할 수 있습니다. [자세한 내용](/interfaces/http/#response-buffering). `buffer_size` 옵션도 유용할 수 있습니다.

:::warning
행을 선택할 때는 `wait_end_of_query`를 조심해서 사용하세요. 이는 서버 측에서 메모리 소비를 증가시킬 수 있으며 전체 성능을 감소시킬 가능성이 큽니다.
:::

### 행 삽입 {#inserting-rows}

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

* `end()`가 호출되지 않으면 `INSERT`가 중단됩니다.
* 행은 네트워크 부하를 분산하기 위해 스트림으로 점진적으로 전송됩니다.
* ClickHouse는 모든 행이 동일한 파티션에 맞고 그 수가 [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size)보다 작을 경우에만 배치를 원자적으로 삽입합니다.

### 비동기 삽입 (서버 측 배치 처리) {#async-insert-server-side-batching}

클라이언트 측 데이터 배치를 피하기 위해 [ClickHouse 비동기 삽입](/optimize/asynchronous-inserts)을 사용할 수 있습니다. 이는 `insert` 메서드에 `async_insert` 옵션을 제공하면 가능합니다 (또는 모든 `insert` 호출에 영향을 주도록 `Client` 인스턴스 자체에 제공할 수도 있습니다).

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

또한 참조:
- 클라이언트 리포지토리의 [비동기 삽입 예제](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs).

### 삽입기 기능 (클라이언트 측 배치 처리) {#inserter-feature-client-side-batching}

`inserter` cargo 기능이 필요합니다.

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

* `Inserter`는 현재 진행 중인 `INSERT`가 `max_bytes`, `max_rows`, `period`의 임계값에 도달하면 `commit()`에서 종료합니다.
* 활성 `INSERT` 종료 간격은 `with_period_bias`를 사용하여 평행 삽입기로 인한 부하 급증을 피할 수 있습니다.
* `Inserter::time_left()`는 현재 기간이 종료되는 시점을 감지하는 데 사용할 수 있습니다. 스트림에서 항목이 드물게 방출되는 경우 한계 확인을 위해 `Inserter::commit()`을 다시 호출하세요.
* 시간 임계값은 `inserter`를 가속화하기 위해 [quanta](https://docs.rs/quanta) 크레이트를 사용하여 구현되었습니다. `test-util`이 활성화된 경우에는 사용되지 않습니다 (따라서, 사용자 정의 테스트에서 `tokio::time::advance()`로 시간을 관리할 수 있습니다).
* `commit()` 호출 간 모든 행은 동일한 `INSERT` 문으로 삽입됩니다.

:::warning
삽입을 종료/마무리하려면 플러시하는 것을 잊지 마세요:
```rust
inserter.end().await?;
```
:::

### DDL 실행 {#executing-ddls}

단일 노드 배포의 경우, DDL은 다음과 같이 실행하기에 충분합니다:

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

그러나 로드 밸런서나 ClickHouse Cloud가 있는 클러스터화된 배포에서는 `wait_end_of_query` 옵션을 사용하여 모든 복제본에서 DDL이 적용될 때까지 기다리는 것이 좋습니다. 이는 다음과 같이 수행할 수 있습니다:

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```

### ClickHouse 설정 {#clickhouse-settings}

`with_option` 메서드를 사용하여 다양한 [ClickHouse 설정](/operations/settings/settings)을 적용할 수 있습니다. 예를 들어:

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // This setting will be applied to this particular query only;
    // it will override the global client setting.
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

`query` 외에도 삽입 및 삽입기 메서드와 유사하게 작동합니다; 추가로, 클라이언트 인스턴스에서 동일한 메서드를 호출하여 모든 쿼리에 대한 전역 설정을 설정할 수 있습니다.

### 쿼리 ID {#query-id}

`.with_option`를 사용하여 ClickHouse 쿼리 로그에서 쿼리를 식별하기 위해 `query_id` 옵션을 설정할 수 있습니다.

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

`query` 외에도 삽입 및 삽입기 메서드와 유사하게 작동합니다.

:::danger
`query_id`를 수동으로 설정하는 경우, 고유한지 확인하세요. UUID가 좋은 선택입니다.
:::

또한 참조: 클라이언트 리포지토리의 [query_id 예제](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs).

### 세션 ID {#session-id}

`query_id`와 유사하게, 동일한 세션에서 문을 실행하기 위해 `session_id`를 설정할 수 있습니다. `session_id`는 전역적으로 클라이언트 수준에서 또는 쿼리, 삽입 또는 삽입기 호출당 각기 다르게 설정할 수 있습니다.

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
클러스터화된 배포의 경우, "스틱 세션"이 없기 때문에 이 기능을 제대로 사용하려면 특정 클러스터 노드에 연결되어 있어야 합니다. 예를 들어, 라운드로빈 로드 밸런서는 후속 요청이 동일한 ClickHouse 노드에 의해 처리된다는 것을 보장하지 않습니다.
:::

또한 참조: 클라이언트 리포지토리의 [session_id 예제](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs).

### 사용자 정의 HTTP 헤더 {#custom-http-headers}

프록시 인증을 사용하거나 사용자 정의 헤더를 전송해야 하는 경우, 다음과 같이 수행할 수 있습니다:

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

또한 참조: 클라이언트 리포지토리의 [사용자 정의 HTTP 헤더 예제](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs).

### 사용자 정의 HTTP 클라이언트 {#custom-http-client}

이는 기본 HTTP 연결 풀 설정을 조정하는 데 유용할 수 있습니다.

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
이 예제는 레거시 Hyper API에 의존하며 앞으로 변경될 수 있습니다.
:::

또한 참조: 클라이언트 리포지토리의 [사용자 정의 HTTP 클라이언트 예제](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs).

## 데이터 유형 {#data-types}

:::info
추가 예제도 참조하세요:
* [간단한 ClickHouse 데이터 유형](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
* [컨테이너형 ClickHouse 데이터 유형](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
:::

* `(U)Int(8|16|32|64|128)`은 해당 `(u|i)(8|16|32|64|128)` 유형 또는 그에 대한 새로운 유형으로 매핑됩니다.
* `(U)Int256`은 직접 지원되지 않지만, [우회 방법이 있습니다](https://github.com/ClickHouse/clickhouse-rs/issues/48).
* `Float(32|64)`는 해당 `f(32|64)` 또는 그에 대한 새로운 유형으로 매핑됩니다.
* `Decimal(32|64|128)`은 해당 `i(32|64|128)` 또는 그에 대한 새로운 유형으로 매핑됩니다. 서명된 고정 소수점 수의 구현체로 [`fixnum`](https://github.com/loyd/fixnum) 또는 다른 것을 사용하는 것이 더 편리합니다.
* `Boolean`은 `bool` 또는 그 주위의 새로운 유형으로 매핑됩니다.
* `String`은 모든 문자열 또는 바이트 유형에서 매핑됩니다. 예: `&str`, `&[u8]`, `String`, `Vec<u8>` 또는 [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html). 새로운 유형도 지원됩니다. 바이트를 저장하려면 [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/)를 사용하는 것이 더 효율적입니다.

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

* `FixedString(N)`은 바이트 배열로 지원됩니다. 예: `[u8; N]`.

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```
* `Enum(8|16)`은 [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/)를 사용하여 지원됩니다.

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
* `UUID`는 `serde::uuid`를 사용하여 [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html)로 매핑됩니다. `uuid` 기능이 필요합니다.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```
* `IPv6`는 [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html)로 매핑됩니다.
* `IPv4`는 [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html)로 매핑되며, `serde::ipv4`를 사용합니다.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```
* `Date`는 `u16` 또는 그 주위의 새로운 유형으로 매핑되며, `1970-01-01` 이후 경과된 일수를 나타냅니다. 또한, [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)는 `serde::time::date`를 사용하여 지원됩니다. 이 기능은 `time` 기능이 필요합니다.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```
* `Date32`는 `i32` 또는 그 주위의 새로운 유형으로 매핑되며, `1970-01-01` 이후 경과된 일수를 나타냅니다. 또한, [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html)는 `serde::time::date32`를 사용하여 지원됩니다. 이 기능은 `time` 기능이 필요합니다.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```
* `DateTime`은 `u32` 또는 그 주위의 새로운 유형으로 매핑되며, UNIX epoch 이후 경과된 초를 나타냅니다. 또한, [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)는 `serde::time::datetime`을 사용하여 지원됩니다. 이 기능은 `time` 기능이 필요합니다.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)`는 `i32` 또는 그 주위의 새로운 유형으로 매핑되며, UNIX epoch 이후 경과된 시간을 나타냅니다. 또한, [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html)는 `serde::time::datetime64::*`를 사용하여 지원됩니다. 이 기능은 `time` 기능이 필요합니다.

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

* `Tuple(A, B, ...)`는 `(A, B, ...)` 또는 그 주위의 새로운 유형으로 매핑됩니다.
* `Array(_)`는 모든 슬라이스에 매핑됩니다. 예: `Vec<_>`, `&[_]`. 새로운 유형도 지원됩니다.
* `Map(K, V)`는 `Array((K, V))`처럼 작동합니다.
* `LowCardinality(_)`는 매끄럽게 지원됩니다.
* `Nullable(_)`는 `Option<_>`로 매핑됩니다. `clickhouse::serde::*` 헬퍼를 위해 `::option`을 추가하세요.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```
* `Nested`는 여러 배열을 제공하여 지원됩니다.
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
* `Geo` 유형이 지원됩니다. `Point`는 튜플 `(f64, f64)`처럼 작동하며, 나머지 유형은 점의 슬라이스입니다.
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

* `Variant`, `Dynamic`, (신규) `JSON` 데이터 유형은 아직 지원되지 않습니다.

## 모의 {#mocking}
이 크레이트는 CH 서버를 모의하고 DDL, `SELECT`, `INSERT` 및 `WATCH` 쿼리 테스트를 위한 유틸리티를 제공합니다. 이 기능은 `test-util` 기능으로 활성화할 수 있습니다. **오직** 개발 종속성으로만 사용하세요.

[예시](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs)를 참조하세요.

## 문제 해결 {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

`CANNOT_READ_ALL_DATA` 오류의 가장 일반적인 원인은 애플리케이션 측의 행 정의가 ClickHouse의 정의와 일치하지 않는 것입니다.

다음 테이블을 고려하세요:

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

그런 후에, 예를 들어 애플리케이션 측에서 `EventLog`를 잘못된 유형으로 정의한 경우:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- should be u32 instead!
}
```

데이터를 삽입할 때 다음과 같은 오류가 발생할 수 있습니다:

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

이 예제에서는 `EventLog` 구조체의 올바른 정의로 수정됩니다:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```

## 알려진 제한 사항 {#known-limitations}

* `Variant`, `Dynamic`, (신규) `JSON` 데이터 유형은 아직 지원되지 않습니다.
* 서버 측 파라미터 바인딩은 아직 지원되지 않습니다; [이 문제](https://github.com/ClickHouse/clickhouse-rs/issues/142)를 참조하여 확인하세요.

## 문의하기 {#contact-us}

질문이 있거나 도움이 필요하시면 [Community Slack](https://clickhouse.com/slack) 또는 [GitHub 이슈](https://github.com/ClickHouse/clickhouse-rs/issues)를 통해 저희에게 연락해 주세요.
