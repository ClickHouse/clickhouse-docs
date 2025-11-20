---
sidebar_label: 'Rust'
sidebar_position: 5
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: 'Официальный клиент ClickHouse для Rust.'
title: 'Официальный клиент ClickHouse для Rust'
doc_type: 'reference'
---



# Rust‑клиент ClickHouse

Официальный Rust‑клиент для подключения к ClickHouse, изначально разработанный [Paul Loyd](https://github.com/loyd). Исходный код клиента доступен в [репозитории GitHub](https://github.com/ClickHouse/clickhouse-rs).



## Обзор {#overview}

- Использует `serde` для кодирования/декодирования строк.
- Поддерживает атрибуты `serde`: `skip_serializing`, `skip_deserializing`, `rename`.
- Использует формат [`RowBinary`](/interfaces/formats/RowBinary) поверх HTTP-транспорта.
  - Планируется переход на [`Native`](/interfaces/formats/Native) поверх TCP.
- Поддерживает TLS (через возможности `native-tls` и `rustls-tls`).
- Поддерживает сжатие и декомпрессию (LZ4).
- Предоставляет API для выборки и вставки данных, выполнения DDL-команд и пакетной обработки на стороне клиента.
- Предоставляет удобные заглушки для модульного тестирования.


## Установка {#installation}

Чтобы использовать этот крейт, добавьте следующее в ваш файл `Cargo.toml`:

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

См. также: [страница на crates.io](https://crates.io/crates/clickhouse).


## Возможности Cargo {#cargo-features}

- `lz4` (включена по умолчанию) — включает варианты `Compression::Lz4` и `Compression::Lz4Hc(_)`. Если включена, `Compression::Lz4` используется по умолчанию для всех запросов, кроме `WATCH`.
- `native-tls` — поддерживает URL со схемой `HTTPS` через `hyper-tls`, который использует OpenSSL.
- `rustls-tls` — поддерживает URL со схемой `HTTPS` через `hyper-rustls`, который не использует OpenSSL.
- `inserter` — включает `client.inserter()`.
- `test-util` — добавляет моки. См. [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs). Используйте только в `dev-dependencies`.
- `watch` — включает функциональность `client.watch`. Подробности см. в соответствующем разделе.
- `uuid` — добавляет `serde::uuid` для работы с крейтом [uuid](https://docs.rs/uuid).
- `time` — добавляет `serde::time` для работы с крейтом [time](https://docs.rs/time).

:::important
При подключении к ClickHouse через URL `HTTPS` должна быть включена возможность `native-tls` или `rustls-tls`.
Если включены обе, приоритет будет иметь `rustls-tls`.
:::


## Совместимость версий ClickHouse {#clickhouse-versions-compatibility}

Клиент совместим с LTS и более новыми версиями ClickHouse, а также с ClickHouse Cloud.

Сервер ClickHouse версий старше v22.6 обрабатывает RowBinary [некорректно в некоторых редких случаях](https://github.com/ClickHouse/ClickHouse/issues/37420).
Для решения этой проблемы можно использовать версию v0.11+ и включить функцию `wa-37420`. Примечание: эту функцию не следует использовать с более новыми версиями ClickHouse.


## Примеры {#examples}

Мы стремимся охватить различные сценарии использования клиента с помощью [примеров](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples) в репозитории клиента. Обзор доступен в [README с примерами](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview).

Если что-то непонятно или отсутствует в примерах или в данной документации, обращайтесь к нам через раздел [связаться с нами](./rust.md#contact-us).


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
    // должен включать протокол и порт
    .with_url("http://localhost:8123")
    .with_user("name")
    .with_password("123")
    .with_database("test");
```

### Подключение по HTTPS или к ClickHouse Cloud {#https-or-clickhouse-cloud-connection}

HTTPS работает с cargo-функциями `rustls-tls` или `native-tls`.

Затем создайте клиент как обычно. В этом примере переменные окружения используются для хранения параметров подключения:

:::important
URL должен включать протокол и порт, например `https://instance.clickhouse.cloud:8443`.
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

- [Пример HTTPS с ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs) в репозитории клиента. Это также применимо к HTTPS-подключениям on-premise.

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

Примечание: поскольку весь ответ передаётся потоком, курсоры могут вернуть ошибку даже после получения некоторых строк. Если это происходит в вашем случае, вы можете попробовать `query(...).with_option("wait_end_of_query", "1")` для включения буферизации ответа на стороне сервера. [Подробнее](/interfaces/http/#response-buffering). Опция `buffer_size` также может быть полезна.

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
- Строки отправляются последовательно в виде потока для распределения сетевой нагрузки.
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

### Функция Inserter (пакетная обработка на стороне клиента) {#inserter-feature-client-side-batching}

Требуется cargo-функция `inserter`.

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

- `Inserter` завершает активную вставку в `commit()`, если достигнут любой из пороговых значений (`max_bytes`, `max_rows`, `period`).
- Интервал между завершением активных `INSERT` может быть смещён с помощью `with_period_bias`, чтобы избежать пиковых нагрузок от параллельных inserter'ов.
- `Inserter::time_left()` можно использовать для определения момента окончания текущего периода. Вызовите `Inserter::commit()` снова для проверки лимитов, если ваш поток редко генерирует элементы.
- Временные пороги реализованы с использованием крейта [quanta](https://docs.rs/quanta) для ускорения работы `inserter`. Не используется, если включён `test-util` (в этом случае временем можно управлять через `tokio::time::advance()` в пользовательских тестах).
- Все строки между вызовами `commit()` вставляются в одном операторе `INSERT`.

:::warning
Не забудьте выполнить сброс, если хотите завершить вставку:

```rust
inserter.end().await?;
```

:::

### Выполнение DDL {#executing-ddls}

При развёртывании на одном узле достаточно выполнять DDL следующим образом:

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

Однако при кластерных развёртываниях с балансировщиком нагрузки или в ClickHouse Cloud рекомендуется дождаться применения DDL на всех репликах, используя опцию `wait_end_of_query`. Это можно сделать следующим образом:

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

Помимо `query`, это работает аналогично с методами `insert` и `inserter`; кроме того, тот же метод можно вызвать на экземпляре `Client` для установки глобальных настроек для всех запросов.

### Идентификатор запроса {#query-id}

Используя `.with_option`, вы можете установить опцию `query_id` для идентификации запросов в журнале запросов ClickHouse.

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

Помимо `query`, это работает аналогично с методами `insert` и `inserter`.

:::danger
Если вы устанавливаете `query_id` вручную, убедитесь, что он уникален. UUID являются хорошим выбором для этого.
:::

См. также: [пример query_id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) в репозитории клиента.

### Идентификатор сессии {#session-id}


Аналогично `query_id`, вы можете установить `session_id` для выполнения операторов в рамках одной сессии. `session_id` можно задать глобально на уровне клиента или для каждого вызова `query`, `insert` или `inserter`.

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
При работе с кластерными развертываниями из-за отсутствия «липких сессий» необходимо подключаться к _конкретному узлу кластера_ для корректного использования этой функции, поскольку, например, балансировщик нагрузки с алгоритмом round-robin не гарантирует, что последовательные запросы будут обработаны одним и тем же узлом ClickHouse.
:::

См. также: [пример использования session_id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) в репозитории клиента.

### Пользовательские HTTP-заголовки {#custom-http-headers}

Если вы используете аутентификацию через прокси или вам необходимо передать пользовательские заголовки, это можно сделать следующим образом:

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

См. также: [пример использования пользовательских HTTP-заголовков](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) в репозитории клиента.

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
    // который по умолчанию составлял 3 секунды для версий до 23.11 и 10 секунд в последующих версиях.
    .pool_idle_timeout(Duration::from_millis(2_500))
    // Устанавливает максимальное количество неактивных Keep-Alive соединений, разрешенных в пуле.
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
Этот пример использует устаревший API Hyper и может измениться в будущем.
:::

См. также: [пример использования пользовательского HTTP-клиента](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) в репозитории клиента.


## Типы данных {#data-types}

:::info
См. также дополнительные примеры:

- [Простые типы данных ClickHouse](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)
- [Контейнерные типы данных ClickHouse](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
  :::

- `(U)Int(8|16|32|64|128)` сопоставляется с соответствующими типами `(u|i)(8|16|32|64|128)` или обёртками вокруг них.
- `(U)Int256` не поддерживаются напрямую, но существует [обходное решение](https://github.com/ClickHouse/clickhouse-rs/issues/48).
- `Float(32|64)` сопоставляется с соответствующими типами `f(32|64)` или обёртками вокруг них.
- `Decimal(32|64|128)` сопоставляется с соответствующими типами `i(32|64|128)` или обёртками вокруг них. Удобнее использовать [`fixnum`](https://github.com/loyd/fixnum) или другую реализацию знаковых чисел с фиксированной точкой.
- `Boolean` сопоставляется с типом `bool` или обёртками вокруг него.
- `String` сопоставляется с любыми строковыми типами или типами байтов, например `&str`, `&[u8]`, `String`, `Vec<u8>` или [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html). Также поддерживаются пользовательские типы. Для хранения байтов рекомендуется использовать [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/), так как это более эффективно.

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

- `UUID` сопоставляется с [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) с использованием `serde::uuid`. Требуется feature `uuid`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```

- `IPv6` сопоставляется с [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html).
- `IPv4` сопоставляется с [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) с использованием `serde::ipv4`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```

- `Date` сопоставляется с типом `u16` или обёрткой вокруг него и представляет количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) с использованием `serde::time::date`, что требует feature `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

- `Date32` сопоставляется с типом `i32` или обёрткой вокруг него и представляет количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) с использованием `serde::time::date32`, что требует feature `time`.


```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```

* `DateTime` сопоставляется с/из `u32` или newtype-обёрткой вокруг него и представляет собой количество секунд, прошедших с момента UNIX-эпохи. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) с использованием `serde::time::datetime`, что требует активации фича-флага `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` сопоставляется с/из `i32` или с newtype-обёрткой вокруг него и представляет время, прошедшее с UNIX-эпохи. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) с использованием `serde::time::datetime64::*`, что требует включённой функциональности `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // прошедшие с/мкс/мс/нс в зависимости от `DateTime64(X)`
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

* `Tuple(A, B, ...)` сопоставляется с `(A, B, ...)` и обратно либо с newtype-обёрткой вокруг него.
* `Array(_)` сопоставляется с любым срезом и обратно, например `Vec<_>`, `&[_]`. Также поддерживаются newtype-типы.
* `Map(K, V)` ведёт себя как `Array((K, V))`.
* `LowCardinality(_)` поддерживается прозрачно.
* `Nullable(_)` сопоставляется с `Option<_>` и обратно. Для хелперов `clickhouse::serde::*` добавьте `::option`.

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

* Поддерживаются типы `Geo`. `Point` ведёт себя как кортеж `(f64, f64)`, а остальные типы представляют собой срезы точек.

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

Наиболее распространённая причина ошибки `CANNOT_READ_ALL_DATA` — несоответствие определения строки на стороне приложения определению в ClickHouse.

Рассмотрим следующую таблицу:

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

Если `EventLog` определён на стороне приложения с несовпадающими типами, например:

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

Если у вас возникли вопросы или вам нужна помощь, обращайтесь к нам в [Community Slack](https://clickhouse.com/slack) или через [GitHub issues](https://github.com/ClickHouse/clickhouse-rs/issues).
