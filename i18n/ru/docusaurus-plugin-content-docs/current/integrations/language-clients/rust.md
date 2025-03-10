---
sidebar_label: Rust
sidebar_position: 4
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: 'Официальный клиент Rust для подключения к ClickHouse.'
---


# Клиент ClickHouse на Rust

Официальный клиент Rust для подключения к ClickHouse, изначально разработанный [Paul Loyd](https://github.com/loyd). Исходный код клиента доступен в [репозитории GitHub](https://github.com/ClickHouse/clickhouse-rs).

## Обзор {#overview}

* Использует `serde` для кодирования/декодирования строк.
* Поддерживает атрибуты `serde`: `skip_serializing`, `skip_deserializing`, `rename`.
* Использует формат [`RowBinary`](/interfaces/formats#rowbinary) по транспортному протоколу HTTP.
    * Планируется переход на [`Native`](/interfaces/formats#native) через TCP.
* Поддерживает TLS (через функции `native-tls` и `rustls-tls`).
* Поддерживает сжатие и распаковку (LZ4).
* Предоставляет API для выбора или вставки данных, выполнения DDL и пакетирования на стороне клиента.
* Предоставляет удобные моки для юнит-тестирования.

## Установка {#installation}

Чтобы использовать crate, добавьте следующее в ваш `Cargo.toml`:

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

Смотрите также: [страница на crates.io](https://crates.io/crates/clickhouse).

## Особенности Cargo {#cargo-features}

* `lz4` (включено по умолчанию) — включает варианты `Compression::Lz4` и `Compression::Lz4Hc(_)`. Если включено, `Compression::Lz4` используется по умолчанию для всех запросов, кроме `WATCH`.
* `native-tls` — поддерживает URL-адреса со схемой `HTTPS` через `hyper-tls`, который ссылается на OpenSSL.
* `rustls-tls` — поддерживает URL-адреса со схемой `HTTPS` через `hyper-rustls`, который не ссылается на OpenSSL.
* `inserter` — включает `client.inserter()`.
* `test-util` — добавляет моки. Смотрите [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs). Используйте его только в `dev-dependencies`.
* `watch` — включает функциональность `client.watch`. Смотрите соответствующий раздел для подробностей.
* `uuid` — добавляет `serde::uuid` для работы с crate [uuid](https://docs.rs/uuid).
* `time` — добавляет `serde::time` для работы с crate [time](https://docs.rs/time).

:::important
При подключении к ClickHouse через URL-адрес `HTTPS` должна быть включена либо функция `native-tls`, либо `rustls-tls`. Если обе включены, функция `rustls-tls` будет иметь приоритет.
:::

## Совместимость версий ClickHouse {#clickhouse-versions-compatibility}

Клиент совместим с LTS или более новыми версиями ClickHouse, а также с ClickHouse Cloud.

Сервер ClickHouse старше v22.6 неправильно обрабатывает RowBinary [в некоторых редких случаях](https://github.com/ClickHouse/ClickHouse/issues/37420). Вы можете использовать v0.11+ и включить функцию `wa-37420`, чтобы решить эту проблему. Примечание: эта функция не должна использоваться с более новыми версиями ClickHouse.

## Примеры {#examples}

Мы стремимся охватить различные сценарии использования клиента в [примерах](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples) в репозитории клиента. Обзор доступен в [README примеров](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview).

Если что-то непонятно или отсутствует в примерах или в следующей документации, не стесняйтесь [связаться с нами](./rust.md#contact-us).

## Использование {#usage}

:::note
crate [ch2rs](https://github.com/ClickHouse/ch2rs) полезен для генерации типа строки из ClickHouse.
:::

### Создание экземпляра клиента {#creating-a-client-instance}

:::tip
Повторно используйте созданные клиенты или копируйте их, чтобы повторно использовать базовый пул соединений hyper.
:::

```rust
use clickhouse::Client;

let client = Client::default()
    // должен включать и протокол, и порт
    .with_url("http://localhost:8123")
    .with_user("name")
    .with_password("123")
    .with_database("test");
```

### Подключение по HTTPS или к ClickHouse Cloud {#https-or-clickhouse-cloud-connection}

HTTPS работает с любыми из особенностей cargo, `rustls-tls` или `native-tls`.

Затем создайте клиента, как обычно. В этом примере используются переменные окружения для хранения данных соединения:

:::important
URL-адрес должен включать и протокол, и порт, например `https://instance.clickhouse.cloud:8443`.
:::

```rust
fn read_env_var(key: &str) -> String {
    env::var(key).unwrap_or_else(|_| panic!("{key} переменная окружения должна быть установлена"))
}

let client = Client::default()
    .with_url(read_env_var("CLICKHOUSE_URL"))
    .with_user(read_env_var("CLICKHOUSE_USER"))
    .with_password(read_env_var("CLICKHOUSE_PASSWORD"));
```

Смотрите также:
- [Пример HTTPS с ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs) в репозитории клиента. Это также должно быть применимо к внутренним HTTPS соединениям.

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

* Плейсхолдер `?fields` заменяется на `no, name` (поля `Row`).
* Плейсхолдер `?` заменяется на значения в следующих вызовах `bind()`.
* Удобные методы `fetch_one::<Row>()` и `fetch_all::<Row>()` могут использоваться для получения первой строки или всех строк соответственно.
* `sql::Identifier` можно использовать для связывания имен таблиц.

Примечание: поскольку весь ответ передается в потоковом режиме, курсоры могут возвращать ошибки даже после того, как были получены некоторые строки. Если это произойдет в вашем случае использования, вы можете попробовать `query(...).with_option("wait_end_of_query", "1")`, чтобы включить буферизацию ответа на стороне сервера. [Более подробная информация](/interfaces/http/#response-buffering). Параметр `buffer_size` также может быть полезен.

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
* Строки отправляются постепенно в виде потока для распределения сетевой нагрузки.
* ClickHouse вставляет партии атомарно только в том случае, если все строки помещаются в одну и ту же партицию и их количество не превышает [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size).

### Асинхронная вставка (пакетирование на стороне сервера) {#async-insert-server-side-batching}

Вы можете использовать [асинхронные вставки ClickHouse](/optimize/asynchronous-inserts), чтобы избежать пакетирования входящих данных на стороне клиента. Это можно сделать, просто предоставив параметр `async_insert` в методе `insert` (или даже в самом экземпляре `Client`, чтобы он повлиял на все вызовы `insert`).

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

Смотрите также:
- [Пример асинхронной вставки](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs) в репозитории клиента.

### Функция вставки (пакетирование на стороне клиента) {#inserter-feature-client-side-batching}

Требует активации функции cargo `inserter`.

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
        "{} байт, {} строк, {} транзакций были вставлены",
        stats.bytes, stats.rows, stats.transactions,
    );
}

// не забудьте завершить вставщик во время завершения приложения
// и подтвердить оставшиеся строки. `.end()` также предоставит статистику.
inserter.end().await?;
```

* `Inserter` завершает активную вставку в `commit()`, если один из пределов (`max_bytes`, `max_rows`, `period`) достигнут.
* Интервал между завершением активных `INSERT` можно изменять с помощью `with_period_bias`, чтобы избежать пиковых нагрузок от параллельных вставщиков.
* `Inserter::time_left()` можно использовать для определения, когда текущий период закончится. Вызывайте `Inserter::commit()` снова, чтобы проверить лимиты, если ваш поток выводит элементы редко.
* Пороговые значения времени реализуются с помощью crate [quanta](https://docs.rs/quanta) для ускорения `inserter`. Не используется, если активирована функция `test-util` (поэтому время может управляться `tokio::time::advance()` в пользовательских тестах).
* Все строки между вызовами `commit()` вставляются в одном запросе `INSERT`.

:::warning
Не забудьте очистить, если вы хотите завершить/завершить вставку:
```rust
inserter.end().await?;
```
:::

### Выполнение DDL {#executing-ddls}

При развертывании на одном узле достаточно выполнить DDL следующим образом:

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

Однако, при развертывании в кластере с балансировщиком нагрузки или ClickHouse Cloud, рекомендуется дождаться, пока DDL будет применено ко всем репликам, используя опцию `wait_end_of_query`. Это можно сделать так:

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```

### Настройки ClickHouse {#clickhouse-settings}

Вы можете применять различные [настройки ClickHouse](/operations/settings/settings) с помощью метода `with_option`. Например:

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // Эта настройка будет применена только к этому конкретному запросу;
    // она заменит глобальную настройку клиента.
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

Кроме `query`, это также работает аналогично с методами `insert` и `inserter`; дополнительно, тот же метод можно вызывать на экземпляре `Client`, чтобы задать глобальные настройки для всех запросов.

### Идентификатор запроса {#query-id}

Используя `.with_option`, вы можете установить опцию `query_id`, чтобы идентифицировать запросы в журнале запросов ClickHouse.

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

Кроме `query`, это также работает аналогично с методами `insert` и `inserter`.

:::danger
Если вы задаете `query_id` вручную, убедитесь, что он уникален. UUID являются хорошим выбором для этого.
:::

Смотрите также: [пример query_id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) в репозитории клиента.

### Идентификатор сессии {#session-id}

Аналогично `query_id`, вы можете установить `session_id`, чтобы выполнять операторы в одной сессии. `session_id` может быть установлен либо глобально на уровне клиента, либо для каждого вызова `query`, `insert` или `inserter`.

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
При развертывании в кластере, из-за отсутствия "липких сессий", вам необходимо подключиться к _определенному узлу кластера_, чтобы правильно использовать эту функцию, так как, например, балансировщик нагрузки "кругом" не гарантирует, что последующие запросы будут обрабатываться тем же узлом ClickHouse.
:::

Смотрите также: [пример session_id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) в репозитории клиента.

### Пользовательские HTTP заголовки {#custom-http-headers}

Если вы используете прокси-аутентификацию или необходимость передать пользовательские заголовки, вы можете сделать это так:

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

let connector = HttpConnector::new(); // или HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // Насколько долго хранить конкретный неактивный сокет на стороне клиента (в миллисекундах).
    // Он должен быть значительно меньшим, чем тайм-аут KeepAlive сервера ClickHouse,
    // который по умолчанию был 3 секунды для версий до 23.11 и 10 секунд после этого.
    .pool_idle_timeout(Duration::from_millis(2_500))
    // Устанавливает максимальное количество неактивных соединений Keep-Alive, разрешенных в пуле.
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
Этот пример основывается на устаревшем API Hyper и подлежит изменению в будущем.
:::

Смотрите также: [пример пользовательского HTTP клиента](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) в репозитории клиента.

## Типы данных {#data-types}

:::info
Смотрите также дополнительные примеры:
* [Упрощенные типы данных ClickHouse](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
* [Контейнероподобные типы данных ClickHouse](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
:::

* `(U)Int(8|16|32|64|128)` сопоставляются с/из соответствующих `(u|i)(8|16|32|64|128)` типов или новых типов вокруг них.
* `(U)Int256` не поддерживаются напрямую, но есть [обходной путь для этого](https://github.com/ClickHouse/clickhouse-rs/issues/48).
* `Float(32|64)` сопоставляются с/из соответствующих `f(32|64)` типов или новых типов вокруг них.
* `Decimal(32|64|128)` сопоставляются с/из соответствующих `i(32|64|128)` типов или новых типов вокруг них. Удобнее использовать [`fixnum`](https://github.com/loyd/fixnum) или другую реализацию фиксированных знаковых чисел с плавающей запятой.
* `Boolean` сопоставляется с/из `bool` или новых типов вокруг него.
* `String` сопоставляется с/из любых строковых или байтовых типов, например, `&str`, `&[u8]`, `String`, `Vec<u8>` или [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html). Новые типы также поддерживаются. Для хранения байтов рассмотрите возможность использования [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/), так как это более эффективно.

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
* `Enum(8|16)` поддерживаются с помощью [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/).

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
* `UUID` сопоставляется с/из [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) с помощью `serde::uuid`. Требует активации функции `uuid`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```
* `IPv6` сопоставляется с/из [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html).
* `IPv4` сопоставляется с/из [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) с помощью `serde::ipv4`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```
* `Date` сопоставляется с/из `u16` или нового типа вокруг него и представляет собой количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) с использованием `serde::time::date`, что требует активации функции `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```
* `Date32` сопоставляется с/из `i32` или нового типа вокруг него и представляет собой количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) с помощью `serde::time::date32`, что требует активации функции `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```
* `DateTime` сопоставляется с/из `u32` или нового типа вокруг него и представляет собой количество секунд, прошедших с эпохи UNIX. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) с помощью `serde::time::datetime`, что требует активации функции `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` сопоставляется с/из `i32` или нового типа вокруг него и представляет собой время, прошедшее с эпохи UNIX. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) с помощью `serde::time::datetime64::*`, что требует активации функции `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // прошедшие s/us/ms/ns в зависимости от `DateTime64(X)`
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

* `Tuple(A, B, ...)` сопоставляется с/из `(A, B, ...)` или нового типа вокруг него.
* `Array(_)` сопоставляется с/из любого среза, например, `Vec<_>`, `&[_]`. Новые типы также поддерживаются.
* `Map(K, V)` ведет себя как `Array((K, V))`.
* `LowCardinality(_)` поддерживается без проблем.
* `Nullable(_)` сопоставляется с/из `Option<_>`. Для вспомогательных функций `clickhouse::serde::*` добавляйте `::option`.

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
* Типы `Geo` поддерживаются. `Point` ведет себя как кортеж `(f64, f64)`, а остальные типы являются просто срезами точек.
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

* Типы `Variant`, `Dynamic`, (новые) `JSON` еще не поддерживаются.

## Мокирование {#mocking}
crate предоставляет утилиты для мокирования сервера CH и тестирования DDL, `SELECT`, `INSERT` и `WATCH` запросов. Эта функциональность может быть включена с помощью функции `test-util`. Используйте ее **только** как зависимость для разработки.

Смотрите [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs).

## Устранение неполадок {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

Наиболее распространенной причиной ошибки `CANNOT_READ_ALL_DATA` является то, что определение строки на стороне приложения не соответствует тому, что в ClickHouse.

Рассмотрим следующую таблицу:

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

Затем, если `EventLog` определяется на стороне приложения с несовпадающими типами, например:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- должно быть u32 вместо!
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

* Типы `Variant`, `Dynamic`, (новые) `JSON` еще не поддерживаются.
* Связывание параметров на стороне сервера еще не поддерживается; смотрите [эту проблему](https://github.com/ClickHouse/clickhouse-rs/issues/142) для отслеживания.

## Связаться с нами {#contact-us}

Если у вас есть какие-либо вопросы или нужна помощь, не стесняйтесь обратиться к нам в [Community Slack](https://clickhouse.com/slack) или через [GitHub issues](https://github.com/ClickHouse/clickhouse-rs/issues).
