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
'description': 'Официальный Rust клиент для подключения к ClickHouse.'
'title': 'ClickHouse Rust Client'
'doc_type': 'reference'
---


# ClickHouse клиент на Rust

Официальный клиент Rust для подключения к ClickHouse, первоначально разработанный [Paul Loyd](https://github.com/loyd). Исходный код клиента доступен в [репозитории GitHub](https://github.com/ClickHouse/clickhouse-rs).

## Обзор {#overview}

* Использует `serde` для кодирования/декодирования строк.
* Поддерживает атрибуты `serde`: `skip_serializing`, `skip_deserializing`, `rename`.
* Использует [`RowBinary`](/interfaces/formats#rowbinary) формат по HTTP транспорту.
  * Планируется переход на [`Native`](/interfaces/formats#native) по TCP.
* Поддерживает TLS (через `native-tls` и `rustls-tls` функции).
* Поддерживает сжатие и декомпрессию (LZ4).
* Предоставляет API для выборки или вставки данных, выполнения DDL, и клиентской пакетной обработки.
* Предоставляет удобные моки для юнит-тестирования.

## Установка {#installation}

Чтобы использовать пакет, добавьте следующее в ваш `Cargo.toml`:

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

Смотрите также: [страница crates.io](https://crates.io/crates/clickhouse).

## Особенности Cargo {#cargo-features}

* `lz4` (включено по умолчанию) — включает варианты `Compression::Lz4` и `Compression::Lz4Hc(_)`. Если включено, `Compression::Lz4` используется по умолчанию для всех запросов, кроме `WATCH`.
* `native-tls` — поддерживает URL с схемой `HTTPS` через `hyper-tls`, который ссылается на OpenSSL.
* `rustls-tls` — поддерживает URL с схемой `HTTPS` через `hyper-rustls`, который не ссылается на OpenSSL.
* `inserter` — включает `client.inserter()`.
* `test-util` — добавляет моки. Смотрите [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs). Используйте это только в `dev-dependencies`.
* `watch` — включает функциональность `client.watch`. Смотрите соответствующий раздел для деталей.
* `uuid` — добавляет `serde::uuid` для работы с [uuid](https://docs.rs/uuid) пакетом.
* `time` — добавляет `serde::time` для работы с [time](https://docs.rs/time) пакетом.

:::important
При подключении к ClickHouse по `HTTPS` URL либо функция `native-tls`, либо `rustls-tls` должна быть активирована.
Если обе функции включены, приоритет будет у функции `rustls-tls`.
:::

## Совместимость версий ClickHouse {#clickhouse-versions-compatibility}

Клиент совместим с LTS версиями или новее ClickHouse, а также с ClickHouse Cloud.

Сервер ClickHouse версии ниже v22.6 обрабатывает RowBinary [некорректно в некоторых редких случаях](https://github.com/ClickHouse/ClickHouse/issues/37420).
Вы можете использовать v0.11+ и включить функцию `wa-37420`, чтобы решить эту проблему. Примечание: эту функцию не следует использовать с новыми версиями ClickHouse.

## Примеры {#examples}

Мы стремимся охватить различные сценарии использования клиента в [примерях](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples) в репозитории клиента. Обзор доступен в [README примеров](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview).

Если что-то неясно или отсутствует в примерах или в следующей документации, не стесняйтесь [связаться с нами](./rust.md#contact-us).

## Использование {#usage}

:::note
Пакет [ch2rs](https://github.com/ClickHouse/ch2rs) полезен для генерации типа строки из ClickHouse.
:::

### Создание экземпляра клиента {#creating-a-client-instance}

:::tip
Повторно используйте созданные клиенты или клонируйте их, чтобы повторно использовать пул соединений hyper.
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

### Подключение через HTTPS или ClickHouse Cloud {#https-or-clickhouse-cloud-connection}

HTTPS работает либо с функцией `rustls-tls`, либо с `native-tls`.

Затем создайте клиента, как обычно. В этом примере используются переменные окружения для хранения деталей подключения:

:::important
URL должен включать как протокол, так и порт, например, `https://instance.clickhouse.cloud:8443`.
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

Смотрите также:
- [Пример HTTPS с ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs) в репозитории клиента. Это также должно применяться к локальным HTTPS соединениям.

### Выбор строк {#selecting-rows}

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

* Заполнитель `?fields` заменяется на `no, name` (поля `Row`).
* Заполнитель `?` заменяется на значения в следующих вызовах `bind()`.
* Удобные методы `fetch_one::<Row>()` и `fetch_all::<Row>()` могут использоваться для получения первой строки или всех строк соответственно.
* `sql::Identifier` может использоваться для привязки имен таблиц.

Обратите внимание: поскольку весь ответ потоковый, курсоры могут вернуть ошибку даже после генерации некоторых строк. Если это происходит в вашем случае, вы можете попробовать `query(...).with_option("wait_end_of_query", "1")`, чтобы включить буферизацию ответа на стороне сервера. [Больше деталей](/interfaces/http/#response-buffering). Опция `buffer_size` также может быть полезной.

:::warning
Используйте `wait_end_of_query` с осторожностью при выборе строк, так как это может привести к повышенному потреблению памяти на стороне сервера и, вероятно, снизит общую производительность.
:::

### Вставка строк {#inserting-rows}

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

* Если `end()` не вызывается, `INSERT` прерывается.
* Строки отправляются постепенно как поток, чтобы распределить сетевую нагрузку.
* ClickHouse вставляет пакеты атомарно только если все строки помещаются в ту же партицию и их количество меньше [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size).

### Асинхронная вставка (пакетная обработка на стороне сервера) {#async-insert-server-side-batching}

Вы можете использовать [асинхронные вставки ClickHouse](/optimize/asynchronous-inserts), чтобы избежать пакетной обработки входящих данных на стороне клиента. Это можно сделать, просто передав опцию `async_insert` в метод `insert` (или даже в экземпляр `Client`, чтобы это влияло на все вызовы `insert`).

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

Смотрите также:
- [Пример асинхронной вставки](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs) в репозитории клиента.

### Функция inserter (пакетная обработка на стороне клиента) {#inserter-feature-client-side-batching}

Требуется функция `inserter` в Cargo.

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

* `Inserter` завершает активную вставку в `commit()`, если некоторые из пределов (`max_bytes`, `max_rows`, `period`) достигаются.
* Интервал между завершениями активных `INSERT` может быть скорректирован с помощью `with_period_bias`, чтобы избежать всплесков нагрузки параллельными вставщиками.
* `Inserter::time_left()` может использоваться для определения, когда заканчивается текущий период. Повторно вызывайте `Inserter::commit()`, чтобы проверить лимиты, если ваша последовательность редко генерирует элементы.
* Пороговые значения времени реализованы с помощью пакета [quanta](https://docs.rs/quanta) для ускорения работы `inserter`. Не используются, если включен `test-util` (таким образом, время может управляться с помощью `tokio::time::advance()` в пользовательских тестах).
* Все строки между вызовами `commit()` вставляются в одном `INSERT` выражении.

:::warning
Не забудьте выполнить сброс, если хотите завершить/закончить вставку:
```rust
inserter.end().await?;
```
:::

### Выполнение DDL {#executing-ddls}

Для одноузлового развертывания достаточно выполнять DDL следующим образом:

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

Однако, в кластерных развертываниях с балансировщиком нагрузки или ClickHouse Cloud рекомендуется дождаться применения DDL на всех репликах, используя опцию `wait_end_of_query`. Это можно сделать следующим образом:

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```

### Настройки ClickHouse {#clickhouse-settings}

Вы можете применять различные [настройки ClickHouse](/operations/settings/settings), используя метод `with_option`. Например:

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // This setting will be applied to this particular query only;
    // it will override the global client setting.
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

Кроме `query`, он работает аналогично с методами `insert` и `inserter`; кроме того, тот же метод может быть вызван на экземпляре `Client`, чтобы задать общие настройки для всех запросов.

### ID запроса {#query-id}

Используя `.with_option`, вы можете задать опцию `query_id`, чтобы идентифицировать запросы в журнале запросов ClickHouse.

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

Кроме `query`, он работает аналогично с методами `insert` и `inserter`.

:::danger
Если вы задаете `query_id` вручную, убедитесь, что он уникален. UUID являются хорошим выбором для этого.
:::

Смотрите также: [пример query_id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) в репозитории клиента.

### ID сессии {#session-id}

Аналогично `query_id`, вы можете установить `session_id`, чтобы выполнять операторы в одной сессии. `session_id` может быть установлен либо глобально на уровне клиента, либо для вызова `query`, `insert` или `inserter`.

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
При кластерных развертываниях, из-за отсутствия "липких сессий", вам нужно быть подключенным к _определенному узлу кластера_, чтобы правильно использовать эту функцию, так как, например, балансировщик нагрузки типа round-robin не гарантирует, что последующие запросы будут обработаны тем же узлом ClickHouse.
:::

Смотрите также: [пример session_id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) в репозитории клиента.

### Пользовательские HTTP заголовки {#custom-http-headers}

Если вы используете аутентификацию прокси или необходимо передать пользовательские заголовки, вы можете сделать это следующим образом:

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

Смотрите также: [пример пользовательских HTTP заголовков](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) в репозитории клиента.

### Пользовательский HTTP клиент {#custom-http-client}

Это может быть полезно для настройки параметров пула соединений HTTP.

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
Этот пример основывается на устаревшем API Hyper и может измениться в будущем.
:::

Смотрите также: [пример пользовательского HTTP клиента](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) в репозитории клиента.

## Типы данных {#data-types}

:::info
Смотрите также дополнительные примеры:
* [Упрощенные типы данных ClickHouse](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
* [Типы данных ClickHouse, похожие на контейнеры](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
:::

* `(U)Int(8|16|32|64|128)` преобразуется из/в соответствующие `(u|i)(8|16|32|64|128)` типы или новые типы вокруг них.
* `(U)Int256` не поддерживаются напрямую, но существует [обходное решение](https://github.com/ClickHouse/clickhouse-rs/issues/48).
* `Float(32|64)` преобразуется из/в соответствующие `f(32|64)` или новые типы вокруг них.
* `Decimal(32|64|128)` преобразуется из/в соответствующие `i(32|64|128)` или новые типы вокруг них. Удобнее использовать [`fixnum`](https://github.com/loyd/fixnum) или другую реализацию знаковых фиксированных чисел.
* `Boolean` преобразуется из/в `bool` или новые типы вокруг него.
* `String` преобразуется из/в любые строковые или байтовые типы, например, `&str`, `&[u8]`, `String`, `Vec<u8>` или [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html). Поддерживаются также новые типы. Для хранения байтов рассмотрите использование [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/), так как это более эффективно.

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

* `FixedString(N)` поддерживается как массив байтов, например, `[u8; N]`.

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```
* `Enum(8|16)` поддерживаются с использованием [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/).

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
* `UUID` преобразуется из/в [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) с использованием `serde::uuid`. Требуется функция `uuid`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```
* `IPv6` преобразуется из/в [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html).
* `IPv4` преобразуется из/в [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) с использованием `serde::ipv4`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```
* `Date` преобразуется из/в `u16` или новый тип вокруг него и представляет собой количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) с использованием `serde::time::date`, что требует функции `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```
* `Date32` преобразуется из/в `i32` или новый тип вокруг него и представляет собой количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) с использованием `serde::time::date32`, что требует функции `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```
* `DateTime` преобразуется из/в `u32` или новый тип вокруг него и представляет собой количество секунд, прошедших с эпохи UNIX. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) с использованием `serde::time::datetime`, что требует функции `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` преобразуется из/в `i32` или новый тип вокруг него и представляет собой время, прошедшее с эпохи UNIX. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) с использованием `serde::time::datetime64::*`, что требует функции `time`.

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

* `Tuple(A, B, ...)` преобразуется из/в `(A, B, ...)` или новый тип вокруг него.
* `Array(_)` преобразуется из/в любой срез, например, `Vec<_>`, `&[_]`. Поддерживаются также новые типы.
* `Map(K, V)` ведет себя как `Array((K, V))`.
* `LowCardinality(_)` поддерживается без проблем.
* `Nullable(_)` преобразуется из/в `Option<_>`. Для помощников `clickhouse::serde::*` добавьте `::option`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```
* `Nested` поддерживается путем предоставления нескольких массивов с переименованием.
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
* Типы `Geo` поддерживаются. `Point` ведет себя как кортеж `(f64, f64)`, а остальные типы представляют собой просто срезы точек.
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

* Типы данных `Variant`, `Dynamic`, (новый) `JSON` еще не поддерживаются.

## Мокирование {#mocking}
Пакет предоставляет утилиты для мокирования сервера CH и тестирования DDL, `SELECT`, `INSERT` и `WATCH` запросов. Функциональность может быть включена с помощью функции `test-util`. Используйте это **только** как зависимость для разработки.

Смотрите [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs).

## Устранение неполадок {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

Наиболее частой причиной ошибки `CANNOT_READ_ALL_DATA` является то, что определение строки на стороне приложения не совпадает с тем, что в ClickHouse.

Рассмотрим следующую таблицу:

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

Затем, если `EventLog` определен на стороне приложения с несовпадающими типами, например:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- should be u32 instead!
}
```

При вставке данных может возникнуть следующая ошибка:

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

В этом примере это исправляется правильным определением структуры `EventLog`:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```

## Известные ограничения {#known-limitations}

* Типы данных `Variant`, `Dynamic`, (новый) `JSON` еще не поддерживаются.
* Привязка параметров на стороне сервера еще не поддерживается; смотрите [эту проблему](https://github.com/ClickHouse/clickhouse-rs/issues/142) для отслеживания.

## Связаться с нами {#contact-us}

Если у вас есть вопросы или нужна помощь, не стесняйтесь обращаться к нам в [Community Slack](https://clickhouse.com/slack) или через [GitHub issues](https://github.com/ClickHouse/clickhouse-rs/issues).
