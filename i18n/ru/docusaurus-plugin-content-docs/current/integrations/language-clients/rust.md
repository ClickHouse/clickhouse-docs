---
sidebar_label: 'Rust'
sidebar_position: 5
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: 'Официальный клиент на Rust для подключения к ClickHouse.'
title: 'Rust-клиент ClickHouse'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

# Клиент ClickHouse на Rust \{#clickhouse-rust-client\}

Официальный клиент на Rust для подключения к ClickHouse, первоначально разработанный [Paul Loyd](https://github.com/loyd). Исходный код клиента доступен в [репозитории GitHub](https://github.com/ClickHouse/clickhouse-rs).

## Обзор \{#overview\}

* Использует `serde` для кодирования/декодирования строк.
* Поддерживает атрибуты `serde`: `skip_serializing`, `skip_deserializing`, `rename`.
* Использует формат [`RowBinary`](/interfaces/formats/RowBinary) поверх HTTP-транспорта.
  * Планируется переход на [`Native`](/interfaces/formats/Native) поверх TCP.
* Поддерживает TLS (через функции `native-tls` и `rustls-tls`).
* Поддерживает сжатие и разжатие (LZ4).
* Предоставляет API для выборки или вставки данных, выполнения операторов DDL и пакетной отправки на стороне клиента.
* Предоставляет удобные заглушки (mocks) для модульного тестирования.

## Установка \{#installation\}

Чтобы использовать этот крейт, добавьте следующее в свой `Cargo.toml`:

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

См. также страницу пакета на crates.io: [clickhouse](https://crates.io/crates/clickhouse).


## Возможности Cargo \{#cargo-features\}

* `lz4` (включена по умолчанию) — включает варианты `Compression::Lz4` и `Compression::Lz4Hc(_)`. При включённой опции `Compression::Lz4` используется по умолчанию для всех запросов, кроме `WATCH`.
* `native-tls` — поддерживает URL со схемой `HTTPS` через `hyper-tls`, который линкуется с OpenSSL.
* `rustls-tls` — поддерживает URL со схемой `HTTPS` через `hyper-rustls`, который не линкуется с OpenSSL.
* `inserter` — включает `client.inserter()`.
* `test-util` — добавляет моки. См. [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs). Используйте только в `dev-dependencies`.
* `watch` — включает функциональность `client.watch`. См. соответствующий раздел для подробностей.
* `uuid` — добавляет `serde::uuid` для работы с крейтом [uuid](https://docs.rs/uuid).
* `time` — добавляет `serde::time` для работы с крейтом [time](https://docs.rs/time).

:::important
При подключении к ClickHouse по URL со схемой `HTTPS` должна быть включена одна из возможностей: `native-tls` или `rustls-tls`.
Если включены обе, приоритет будет у `rustls-tls`.
:::

## Совместимость с версиями ClickHouse \{#clickhouse-versions-compatibility\}

Клиент совместим с LTS-версиями и более новыми версиями ClickHouse, а также с ClickHouse Cloud.

Сервер ClickHouse версии ниже v22.6 обрабатывает RowBinary [некорректно в некоторых редких случаях](https://github.com/ClickHouse/ClickHouse/issues/37420). 
Вы можете использовать v0.11+ и включить флаг функции `wa-37420`, чтобы решить эту проблему. Примечание: этот флаг не следует использовать с более новыми версиями ClickHouse.

## Примеры \{#examples\}

Мы стремимся охватить различные сценарии использования клиента с помощью [примеров](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples) в репозитории клиента. Обзор приведён в файле [README для examples](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview).

Если что‑то остаётся непонятным или чего‑то не хватает в примерах или в приведённой ниже документации, вы можете [связаться с нами](./rust.md#contact-us).

## Использование \{#usage\}

:::note
Crate [ch2rs](https://github.com/ClickHouse/ch2rs) полезен для генерации типа строки из ClickHouse.
:::

### Создание экземпляра клиента \{#creating-a-client-instance\}

:::tip
Повторно используйте созданные клиенты или клонируйте их, чтобы повторно использовать базовый пул соединений hyper.
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


### Подключение по HTTPS или к ClickHouse Cloud \{#https-or-clickhouse-cloud-connection\}

HTTPS поддерживается при использовании cargo-фич `rustls-tls` или `native-tls`.

Далее создайте клиент как обычно. В этом примере переменные окружения используются для хранения параметров подключения:

:::important
URL-адрес должен включать и протокол, и порт, например `https://instance.clickhouse.cloud:8443`.
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

См. также:

* [Пример HTTPS с ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs) в репозитории клиента. Он должен подойти и для HTTPS-подключений к on-premise-инсталляциям.


### Выборка строк \{#selecting-rows\}

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
* Заполнитель `?` заменяется значениями в последующих вызовах `bind()`.
* Удобные методы `fetch_one::<Row>()` и `fetch_all::<Row>()` можно использовать, чтобы получить первую строку или все строки соответственно.
* `sql::Identifier` можно использовать для привязки имен таблиц.

NB: так как весь ответ передается потоком, курсоры могут вернуть ошибку даже после того, как выдали некоторые строки. Если это происходит в вашем сценарии, вы можете попробовать `query(...).with_option("wait_end_of_query", "1")`, чтобы включить буферизацию ответа на стороне сервера. [Подробнее](/interfaces/http/#response-buffering). Опция `buffer_size` также может быть полезной.

:::warning
Используйте `wait_end_of_query` с осторожностью при выборке строк, так как это может привести к повышенному потреблению памяти на стороне сервера и, скорее всего, снизит общую производительность.
:::


### Добавление строк \{#inserting-rows\}

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

* Если `end()` не был вызван, `INSERT` прерывается.
* Строки отправляются постепенно, потоком, чтобы распределить сетевую нагрузку.
* ClickHouse выполняет вставку батчей атомарно только в том случае, если все строки попадают в одну и ту же партицию и их количество меньше [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size).


### Асинхронная вставка (серверное формирование батчей) \{#async-insert-server-side-batching\}

Вы можете использовать [асинхронные вставки ClickHouse](/optimize/asynchronous-inserts), чтобы избежать формирования батчей входящих данных на стороне клиента. Это можно сделать, просто указав опцию `async_insert` в методе `insert` (или даже в экземпляре `Client`, чтобы она применялась ко всем вызовам `insert`).

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

См. также:

* [Пример асинхронной вставки](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs) в клиентском репозитории.


### Возможность Inserter (клиентская пакетная вставка) \{#inserter-feature-client-side-batching\}

Требуется включить функцию Cargo `inserter`.

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

* `Inserter` завершает активную вставку в `commit()`, если достигнут любой из порогов (`max_bytes`, `max_rows`, `period`).
* Интервал между завершениями активных `INSERT` может быть скорректирован с помощью `with_period_bias`, чтобы избежать пиков нагрузки при параллельных вставках.
* `Inserter::time_left()` можно использовать, чтобы определить, когда закончится текущий период. Вызовите `Inserter::commit()` ещё раз, чтобы проверить лимиты, если ваш поток редко эмитирует элементы.
* Временные пороги реализованы с использованием крейта [quanta](https://docs.rs/quanta), чтобы ускорить работу `inserter`. Не используется, если включён `test-util` (таким образом, временем можно управлять через `tokio::time::advance()` в пользовательских тестах).
* Все строки между вызовами `commit()` вставляются в одном операторе `INSERT`.

:::warning
Не забудьте выполнить flush, если вы хотите завершить/финализировать вставку:

```rust
inserter.end().await?;
```

:::


### Выполнение DDL-операций \{#executing-ddls\}

При одноузловом развертывании достаточно выполнить DDL-операции следующим образом:

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

Однако в кластерных развертываниях с балансировщиком нагрузки или в ClickHouse Cloud рекомендуется дожидаться, пока DDL не будет применена на всех репликах, используя опцию `wait_end_of_query`. Это можно сделать следующим образом:

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```


### Настройки ClickHouse \{#clickhouse-settings\}

Вы можете применять различные [настройки ClickHouse](/operations/settings/settings) с помощью метода `with_option`. Например:

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // This setting will be applied to this particular query only;
    // it will override the global client setting.
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

Помимо `query`, аналогично работают методы `insert` и `inserter`; также тот же метод можно вызвать у экземпляра `Client`, чтобы задать глобальные настройки, применяемые ко всем запросам.


### Идентификатор запроса \{#query-id\}

С помощью `.with_option` вы можете установить параметр `query_id`, чтобы идентифицировать запросы в журнале запросов ClickHouse.

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

Помимо `query`, этот метод аналогичным образом работает с методами `insert` и `inserter`.

:::danger
Если вы задаёте `query_id` вручную, убедитесь, что он уникален. Для этого хорошо подходят идентификаторы UUID.
:::

См. также: [пример query&#95;id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) в репозитории клиента.


### ID сессии \{#session-id\}

Аналогично `query_id`, вы можете задать `session_id`, чтобы выполнять команды в одной и той же сессии. `session_id` можно задать либо глобально на уровне клиента, либо для каждого вызова `query`, `insert` или `inserter`.

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
В кластерных развертываниях из‑за отсутствия «липких сессий» необходимо оставаться подключённым к *конкретному узлу кластера*, чтобы корректно использовать эту возможность, поскольку, например, балансировщик нагрузки с алгоритмом round-robin не гарантирует, что последующие запросы будут обрабатываться тем же самым узлом ClickHouse.
:::

См. также: [пример session&#95;id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) в репозитории клиента.


### Пользовательские HTTP-заголовки \{#custom-http-headers\}

Если вы используете аутентификацию на прокси-сервере или вам нужно передать дополнительные заголовки, вы можете сделать это так:

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

См. также: [пример пользовательских HTTP-заголовков](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) в репозитории клиента.


### Пользовательский HTTP‑клиент \{#custom-http-client\}

Это может быть полезно для тонкой настройки параметров нижележащего пула HTTP‑соединений.

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
Этот пример основан на устаревшем Hyper API и в будущем может быть изменён.
:::

См. также: [пример с пользовательским HTTP‑клиентом](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) в репозитории клиента.


## Типы данных \{#data-types\}

:::info
См. также дополнительные примеры:

* [Более простые типы данных ClickHouse](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)

* [Типы данных ClickHouse, похожие на контейнеры](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
  :::

* `(U)Int(8|16|32|64|128)` сопоставляется с соответствующими типами `(u|i)(8|16|32|64|128)` или newtype-обёртками над ними.

* `(U)Int256` не поддерживается напрямую, но существует [обходной путь](https://github.com/ClickHouse/clickhouse-rs/issues/48).

* `Float(32|64)` сопоставляется с соответствующими типами `f(32|64)` или newtype-обёртками над ними.

* `Decimal(32|64|128)` сопоставляется с соответствующими типами `i(32|64|128)` или newtype-обёртками над ними. Удобнее использовать [`fixnum`](https://github.com/loyd/fixnum) или другую реализацию знаковых чисел с фиксированной запятой.

* `Boolean` сопоставляется с `bool` или newtype-обёртками над ним.

* `String` сопоставляется с любыми строковыми или байтовыми типами, например `&str`, `&[u8]`, `String`, `Vec<u8>` или [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html). Также поддерживаются новые типы. Для хранения байтов рассмотрите использование [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/), так как это более эффективно.

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

* `FixedString(N)` поддерживается в виде массива байтов, например `[u8; N]`.

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```

* Типы `Enum(8|16)` поддерживаются с помощью [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/).

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

* `UUID` сопоставляется с [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) и обратно с помощью `serde::uuid`. Требуется фича `uuid`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```

* `IPv6` сопоставляется с [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html).
* `IPv4` сопоставляется с [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) с использованием `serde::ipv4`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```

* `Date` сопоставляется с `u16` или newtype-обёрткой вокруг него и представляет количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) при использовании `serde::time::date`, для чего требуется включённая фича `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

* `Date32` отображается в/из `i32` или newtype-обёртки вокруг него и представляет количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) при использовании `serde::time::date32`, что требует включения фичи `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```


* `DateTime` сопоставляется с типом `u32` или newtype-обёрткой над ним и представляет собой число секунд, прошедших с начала эпохи UNIX. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) при использовании `serde::time::datetime`, для чего требуется включить функциональность `time` (feature `time`).

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` маппится в/из `i32` или newtype-обёртку вокруг него и представляет время, прошедшее с момента начала эпохи Unix. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) при использовании `serde::time::datetime64::*`, для чего требуется включить feature `time`.

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

* `Tuple(A, B, ...)` отображается в/из `(A, B, ...)` или обёртки newtype вокруг него.
* `Array(_)` отображается в/из любого среза, например `Vec<_>`, `&[_]`. Также поддерживаются пользовательские типы.
* `Map(K, V)` ведёт себя как `Array((K, V))`.
* `LowCardinality(_)` поддерживается прозрачно.
* `Nullable(_)` отображается в/из `Option<_>`. Для вспомогательных функций `clickhouse::serde::*` добавьте `::option`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```

* `Nested` поддерживается с помощью нескольких массивов с переименованием.

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

* Типы `Geo` поддерживаются. `Point` ведёт себя как кортеж `(f64, f64)`, а остальные типы — это просто срезы точек.

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

* типы данных `Variant`, `Dynamic` и новый тип данных `JSON` пока не поддерживаются.


## Мокирование \{#mocking\}

Crate предоставляет утилиты для мокирования сервера ClickHouse и тестирования DDL-, `SELECT`-, `INSERT`- и `WATCH`-запросов. Эту функциональность можно включить с помощью опции `test-util`. Используйте её **только** как зависимость для разработки.

См. [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs).

## Устранение неполадок \{#troubleshooting\}

### CANNOT_READ_ALL_DATA \{#cannot_read_all_data\}

Наиболее распространённая причина ошибки `CANNOT_READ_ALL_DATA` заключается в том, что определение строки на стороне приложения не совпадает с определением строки в ClickHouse.

Рассмотрим следующую таблицу:

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

Затем, если `EventLog` определён на стороне приложения с несовместимыми типами, например:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- should be u32 instead!
}
```

При вставке данных может произойти следующая ошибка:

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

В этом примере это исправляется за счет корректного определения структуры `EventLog`:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```


## Известные ограничения \{#known-limitations\}

* Типы данных `Variant`, `Dynamic` и (новый) `JSON` пока не поддерживаются.
* Привязка параметров на стороне сервера пока не поддерживается; см. [эту задачу](https://github.com/ClickHouse/clickhouse-rs/issues/142) для отслеживания прогресса.

## Свяжитесь с нами \{#contact-us\}

Если у вас есть вопросы или нужна помощь, свяжитесь с нами в нашем [Community Slack](https://clickhouse.com/slack) или через раздел [issues на GitHub](https://github.com/ClickHouse/clickhouse-rs/issues).