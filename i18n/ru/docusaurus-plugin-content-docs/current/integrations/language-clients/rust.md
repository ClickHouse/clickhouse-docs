---
sidebar_label: 'Rust'
sidebar_position: 5
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: 'Официальный клиент ClickHouse для Rust.'
title: 'Официальный клиент ClickHouse для Rust'
doc_type: 'reference'
---



# Официальный Rust‑клиент ClickHouse

Официальный клиент на Rust для подключения к ClickHouse, изначально разработанный [Paul Loyd](https://github.com/loyd). Исходный код клиента доступен в [репозитории GitHub](https://github.com/ClickHouse/clickhouse-rs).



## Обзор {#overview}

- Использует `serde` для кодирования и декодирования строк.
- Поддерживает атрибуты `serde`: `skip_serializing`, `skip_deserializing`, `rename`.
- Использует формат [`RowBinary`](/interfaces/formats/RowBinary) поверх HTTP-транспорта.
  - Планируется переход на формат [`Native`](/interfaces/formats/Native) поверх TCP.
- Поддерживает TLS (через возможности `native-tls` и `rustls-tls`).
- Поддерживает сжатие и декомпрессию (LZ4).
- Предоставляет API для выборки и вставки данных, выполнения DDL-команд и пакетной обработки на стороне клиента.
- Предоставляет удобные mock-объекты для модульного тестирования.


## Установка {#installation}

Чтобы использовать этот crate, добавьте следующее в ваш `Cargo.toml`:

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

См. также: [страница на crates.io](https://crates.io/crates/clickhouse).


## Возможности Cargo {#cargo-features}

- `lz4` (включена по умолчанию) — включает варианты `Compression::Lz4` и `Compression::Lz4Hc(_)`. Если включена, `Compression::Lz4` используется по умолчанию для всех запросов, кроме `WATCH`.
- `native-tls` — поддерживает URL-адреса со схемой `HTTPS` через `hyper-tls`, который использует OpenSSL.
- `rustls-tls` — поддерживает URL-адреса со схемой `HTTPS` через `hyper-rustls`, который не использует OpenSSL.
- `inserter` — включает `client.inserter()`.
- `test-util` — добавляет моки. См. [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs). Используйте только в `dev-dependencies`.
- `watch` — включает функциональность `client.watch`. Подробности см. в соответствующем разделе.
- `uuid` — добавляет `serde::uuid` для работы с крейтом [uuid](https://docs.rs/uuid).
- `time` — добавляет `serde::time` для работы с крейтом [time](https://docs.rs/time).

:::important
При подключении к ClickHouse через URL-адрес `HTTPS` должна быть включена либо возможность `native-tls`, либо `rustls-tls`.
Если включены обе, приоритет будет иметь возможность `rustls-tls`.
:::


## Совместимость версий ClickHouse {#clickhouse-versions-compatibility}

Клиент совместим с LTS и более новыми версиями ClickHouse, а также с ClickHouse Cloud.

Сервер ClickHouse версий старше v22.6 обрабатывает RowBinary [некорректно в некоторых редких случаях](https://github.com/ClickHouse/ClickHouse/issues/37420).
Для решения этой проблемы можно использовать версию v0.11+ и включить функцию `wa-37420`. Примечание: эту функцию не следует использовать с более новыми версиями ClickHouse.


## Примеры {#examples}

Мы стремимся охватить различные сценарии использования клиента с помощью [примеров](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples) в репозитории клиента. Обзор доступен в [README с примерами](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview).

Если что-то непонятно или отсутствует в примерах или в данной документации, обращайтесь к нам через раздел [контакты](./rust.md#contact-us).


## Использование {#usage}

:::note
Крейт [ch2rs](https://github.com/ClickHouse/ch2rs) полезен для генерации типа строки из ClickHouse.
:::

### Создание экземпляра клиента {#creating-a-client-instance}

:::tip
Переиспользуйте созданные клиенты или клонируйте их для повторного использования базового пула соединений hyper.
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

### Подключение через HTTPS или ClickHouse Cloud {#https-or-clickhouse-cloud-connection}

HTTPS работает с cargo-функциями `rustls-tls` или `native-tls`.

Затем создайте клиент как обычно. В этом примере переменные окружения используются для хранения параметров подключения:

:::important
URL должен включать и протокол, и порт, например `https://instance.clickhouse.cloud:8443`.
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

См. также:

- [Пример HTTPS с ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs) в репозитории клиента. Это также применимо к локальным HTTPS-подключениям.

### Выборка строк {#selecting-rows}

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

- Заполнитель `?fields` заменяется на `no, name` (поля `Row`).
- Заполнитель `?` заменяется значениями в последующих вызовах `bind()`.
- Удобные методы `fetch_one::<Row>()` и `fetch_all::<Row>()` можно использовать для получения первой строки или всех строк соответственно.
- `sql::Identifier` можно использовать для привязки имён таблиц.

Примечание: поскольку весь ответ передаётся потоком, курсоры могут вернуть ошибку даже после получения некоторых строк. Если это происходит в вашем случае, попробуйте `query(...).with_option("wait_end_of_query", "1")` для включения буферизации ответа на стороне сервера. [Подробнее](/interfaces/http/#response-buffering). Опция `buffer_size` также может быть полезна.

:::warning
Используйте `wait_end_of_query` с осторожностью при выборке строк, так как это может привести к повышенному потреблению памяти на стороне сервера и, вероятно, снизит общую производительность.
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

- Если `end()` не вызван, `INSERT` прерывается.
- Строки отправляются постепенно в виде потока для распределения сетевой нагрузки.
- ClickHouse вставляет пакеты атомарно только если все строки помещаются в одну партицию и их количество меньше [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size).

### Асинхронная вставка (пакетирование на стороне сервера) {#async-insert-server-side-batching}

Вы можете использовать [асинхронные вставки ClickHouse](/optimize/asynchronous-inserts), чтобы избежать пакетирования входящих данных на стороне клиента. Это можно сделать, просто передав опцию `async_insert` методу `insert` (или даже самому экземпляру `Client`, чтобы это влияло на все вызовы `insert`).


```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

См. также:

- [Пример асинхронной вставки](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs) в репозитории клиента.

### Возможности Inserter (пакетная вставка на стороне клиента) {#inserter-feature-client-side-batching}

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

// не забудьте завершить работу inserter при остановке приложения
// и зафиксировать оставшиеся строки. `.end()` также вернёт статистику.
inserter.end().await?;
```

- `Inserter` завершает активную вставку в `commit()`, если достигнут любой из порогов (`max_bytes`, `max_rows`, `period`).
- Интервал между завершениями активных `INSERT` можно смещать с помощью `with_period_bias`, чтобы избежать пиков нагрузки при работе нескольких inserter.
- `Inserter::time_left()` можно использовать, чтобы определить, когда закончится текущий период. Вызовите `Inserter::commit()` ещё раз, чтобы проверить лимиты, если ваш поток редко выдаёт элементы.
- Пороговые значения по времени реализованы с использованием библиотеки [quanta](https://docs.rs/quanta) для ускорения работы `inserter`. Не используется, если включён `test-util` (в этом случае временем можно управлять через `tokio::time::advance()` в пользовательских тестах).
- Все строки между вызовами `commit()` вставляются одним оператором `INSERT`.

:::warning
Не забудьте выполнить сброс (flush), если вы хотите завершить вставку:

```rust
inserter.end().await?;
```

:::

### Выполнение DDL {#executing-ddls}

Для одновузлового развёртывания достаточно выполнять DDL следующим образом:

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

Однако в кластерных развёртываниях с балансировщиком нагрузки или в ClickHouse Cloud рекомендуется дожидаться применения DDL на всех репликах, используя опцию `wait_end_of_query`. Это можно сделать так:

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
    // Эта настройка будет применена только к данному запросу;
    // она переопределит глобальную настройку клиента.
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

Помимо `query`, это аналогично работает с методами `insert` и `inserter`; дополнительно тот же метод можно вызвать у экземпляра `Client`, чтобы задать глобальные настройки для всех запросов.

### Идентификатор запроса (Query ID) {#query-id}

С помощью `.with_option` вы можете задать опцию `query_id`, чтобы идентифицировать запросы в журнале запросов ClickHouse.

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

Помимо `query`, это аналогично работает с методами `insert` и `inserter`.

:::danger
Если вы задаёте `query_id` вручную, убедитесь, что он уникален. Для этого хорошо подходят UUID.
:::

См. также: [пример с query_id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) в репозитории клиента.

### Идентификатор сессии (Session ID) {#session-id}


Аналогично `query_id`, вы можете установить `session_id` для выполнения операторов в рамках одной сессии. `session_id` можно задать глобально на уровне клиента или для каждого вызова `query`, `insert` или `inserter`.

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
При работе с кластерными развертываниями из-за отсутствия «липких сессий» необходимо подключаться к _конкретному узлу кластера_ для корректного использования этой функции, поскольку, например, балансировщик нагрузки с алгоритмом round-robin не гарантирует, что последовательные запросы будут обработаны одним и тем же узлом ClickHouse.
:::

См. также: [пример session_id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) в репозитории клиента.

### Пользовательские HTTP-заголовки {#custom-http-headers}

Если вы используете аутентификацию через прокси или необходимо передать пользовательские заголовки, это можно сделать следующим образом:

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

См. также: [пример пользовательских HTTP-заголовков](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) в репозитории клиента.

### Пользовательский HTTP-клиент {#custom-http-client}

Это может быть полезно для настройки параметров базового пула HTTP-соединений.

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // или HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // Как долго поддерживать конкретный неактивный сокет на стороне клиента (в миллисекундах).
    // Это значение должно быть заметно меньше таймаута KeepAlive сервера ClickHouse,
    // который по умолчанию составлял 3 секунды для версий до 23.11 и 10 секунд после этого.
    .pool_idle_timeout(Duration::from_millis(2_500))
    // Устанавливает максимальное количество неактивных Keep-Alive соединений в пуле.
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
Этот пример использует устаревший API Hyper и может измениться в будущем.
:::

См. также: [пример пользовательского HTTP-клиента](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) в репозитории клиента.


## Типы данных {#data-types}

:::info
См. также дополнительные примеры:

- [Простые типы данных ClickHouse](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
- [Контейнерные типы данных ClickHouse](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
  :::

- `(U)Int(8|16|32|64|128)` соответствует типам `(u|i)(8|16|32|64|128)` или newtype-обёрткам вокруг них.
- `(U)Int256` не поддерживаются напрямую, но существует [обходное решение](https://github.com/ClickHouse/clickhouse-rs/issues/48).
- `Float(32|64)` соответствует типам `f(32|64)` или newtype-обёрткам вокруг них.
- `Decimal(32|64|128)` соответствует типам `i(32|64|128)` или newtype-обёрткам вокруг них. Удобнее использовать [`fixnum`](https://github.com/loyd/fixnum) или другую реализацию знаковых чисел с фиксированной точкой.
- `Boolean` соответствует типу `bool` или newtype-обёрткам вокруг него.
- `String` соответствует любым строковым типам или типам байтов, например `&str`, `&[u8]`, `String`, `Vec<u8>` или [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html). Также поддерживаются новые типы. Для хранения байтов рекомендуется использовать [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/), так как это более эффективно.

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

- `FixedString(N)` поддерживается как массив байтов, например `[u8; N]`.

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```

- `Enum(8|16)` поддерживаются с использованием [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/).

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

- `UUID` соответствует типу [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) при использовании `serde::uuid`. Требуется feature `uuid`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```

- `IPv6` соответствует типу [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html).
- `IPv4` соответствует типу [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) при использовании `serde::ipv4`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```

- `Date` соответствует типу `u16` или newtype-обёртке вокруг него и представляет количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) при использовании `serde::time::date`, что требует feature `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

- `Date32` соответствует типу `i32` или newtype-обёртке вокруг него и представляет количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) при использовании `serde::time::date32`, что требует feature `time`.


```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```

* `DateTime` сопоставляется с `u32`/`u32` в обёртке newtype и представляет количество секунд, прошедших с начала эпохи UNIX. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) при использовании `serde::time::datetime`, для чего требуется функция (`feature`) `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` сопоставляется с типом `i32` (или обёрткой newtype вокруг него) и представляет собой время, прошедшее с UNIX-эпохи. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) при использовании `serde::time::datetime64::*`, для чего требуется включённая возможность `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // прошедшее время в с/мкс/мс/нс в зависимости от `DateTime64(X)`
    #[serde(with = "clickhouse::serde::time::datetime64::secs")]
    dt64s: OffsetDateTime,  // `DateTime64(0)` (секунды)
    #[serde(with = "clickhouse::serde::time::datetime64::millis")]
    dt64ms: OffsetDateTime, // `DateTime64(3)` (миллисекунды)
    #[serde(with = "clickhouse::serde::time::datetime64::micros")]
    dt64us: OffsetDateTime, // `DateTime64(6)` (микросекунды)
    #[serde(with = "clickhouse::serde::time::datetime64::nanos")]
    dt64ns: OffsetDateTime, // `DateTime64(9)` (наносекунды)
}
```

* `Tuple(A, B, ...)` отображается в/из `(A, B, ...)` или newtype поверх него.
* `Array(_)` отображается в/из любого среза, например `Vec<_>`, `&[_]`. Также поддерживаются новые типы.
* `Map(K, V)` ведёт себя как `Array((K, V))`.
* `LowCardinality(_)` поддерживается без дополнительных усилий.
* `Nullable(_)` отображается в/из `Option<_>`. Для хелперов `clickhouse::serde::*` добавьте `::option`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4::option")]
    ipv4_opt: Option<Ipv4Addr>,
}
```

* `Nested` поддерживается за счёт использования нескольких массивов с переименованием.

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

* Типы данных `Variant`, `Dynamic` и новый `JSON` пока не поддерживаются.


## Имитация {#mocking}

Крейт предоставляет утилиты для имитации сервера ClickHouse и тестирования DDL-запросов, а также запросов `SELECT`, `INSERT` и `WATCH`. Функциональность можно включить с помощью фичи `test-util`. Используйте её **только** в качестве dev-зависимости.

См. [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs).


## Устранение неполадок {#troubleshooting}

### CANNOT_READ_ALL_DATA {#cannot_read_all_data}

Наиболее распространённой причиной ошибки `CANNOT_READ_ALL_DATA` является несоответствие определения строки на стороне приложения и определения в ClickHouse.

Рассмотрим следующую таблицу:

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

Затем, если `EventLog` определён на стороне приложения с несовпадающими типами, например:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- должно быть u32!
}
```

При вставке данных может возникнуть следующая ошибка:

```response
Error: BadResponse("Code: 33. DB::Exception: Cannot read all data. Bytes read: 5. Bytes expected: 23.: (at row 1)\n: While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

В этом примере проблема решается правильным определением структуры `EventLog`:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```


## Известные ограничения {#known-limitations}

- Типы данных `Variant`, `Dynamic`, (новый) `JSON` пока не поддерживаются.
- Привязка параметров на стороне сервера пока не поддерживается; см. [этот issue](https://github.com/ClickHouse/clickhouse-rs/issues/142) для отслеживания.


## Свяжитесь с нами {#contact-us}

Если у вас возникли вопросы или вам нужна помощь, свяжитесь с нами в [Community Slack](https://clickhouse.com/slack) или через [GitHub issues](https://github.com/ClickHouse/clickhouse-rs/issues).
