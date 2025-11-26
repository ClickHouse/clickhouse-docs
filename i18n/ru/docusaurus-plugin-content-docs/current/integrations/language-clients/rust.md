---
sidebar_label: 'Rust'
sidebar_position: 5
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: 'Официальный клиент Rust для подключения к ClickHouse.'
title: 'Клиент Rust для ClickHouse'
doc_type: 'reference'
---



# Клиент ClickHouse на Rust

Официальный клиент на Rust для подключения к ClickHouse, изначально разработанный [Paul Loyd](https://github.com/loyd). Исходный код клиента доступен в [репозитории GitHub](https://github.com/ClickHouse/clickhouse-rs).



## Обзор {#overview}

* Использует `serde` для кодирования/декодирования строк.
* Поддерживает атрибуты `serde`: `skip_serializing`, `skip_deserializing`, `rename`.
* Использует формат [`RowBinary`](/interfaces/formats/RowBinary) поверх HTTP-транспорта.
  * Планируется переход на [`Native`](/interfaces/formats/Native) поверх TCP.
* Поддерживает TLS (через возможности `native-tls` и `rustls-tls`).
* Поддерживает сжатие и разжатие (LZ4).
* Предоставляет API для выборки и вставки данных, выполнения DDL и пакетной отправки на стороне клиента.
* Предоставляет удобные моки для модульного тестирования.



## Установка

Чтобы использовать этот крейт, добавьте следующее в ваш `Cargo.toml`:

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

См. также: [страница на crates.io](https://crates.io/crates/clickhouse).


## Возможности Cargo {#cargo-features}

* `lz4` (включена по умолчанию) — включает варианты `Compression::Lz4` и `Compression::Lz4Hc(_)`. Если включена, `Compression::Lz4` используется по умолчанию для всех запросов, кроме `WATCH`.
* `native-tls` — поддерживает URL со схемой `HTTPS` через `hyper-tls`, который собирается с OpenSSL.
* `rustls-tls` — поддерживает URL со схемой `HTTPS` через `hyper-rustls`, который не зависит от OpenSSL.
* `inserter` — включает `client.inserter()`.
* `test-util` — добавляет моки. См. [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs). Используйте только в `dev-dependencies`.
* `watch` — включает функциональность `client.watch`. Дополнительные сведения см. в соответствующем разделе.
* `uuid` — добавляет `serde::uuid` для работы с крейтом [uuid](https://docs.rs/uuid).
* `time` — добавляет `serde::time` для работы с крейтом [time](https://docs.rs/time).

:::important
При подключении к ClickHouse по `HTTPS`‑URL должна быть включена одна из возможностей: `native-tls` или `rustls-tls`.
Если включены обе, приоритет будет у возможности `rustls-tls`.
:::



## Совместимость версий ClickHouse {#clickhouse-versions-compatibility}

Клиент совместим с LTS-версией и более новыми версиями ClickHouse, а также с ClickHouse Cloud.

Сервер ClickHouse версий до v22.6 обрабатывает RowBinary [некорректно в некоторых редких случаях](https://github.com/ClickHouse/ClickHouse/issues/37420). 
Вы можете использовать версию v0.11+ и включить функцию `wa-37420`, чтобы решить эту проблему. Примечание: эту функцию не следует использовать с более новыми версиями ClickHouse.



## Примеры {#examples}

Мы стремимся охватить различные сценарии использования клиента с помощью [примеров](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples) в клиентском репозитории. Обзор доступен в [README с примерами](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview).

Если что-то непонятно или отсутствует в примерах или в приведённой ниже документации, вы можете [связаться с нами](./rust.md#contact-us).



## Использование

:::note
Crate [ch2rs](https://github.com/ClickHouse/ch2rs) полезен для генерации типа записи (row) из ClickHouse.
:::

### Создание экземпляра клиента

:::tip
Повторно используйте уже созданные клиенты или клонируйте их, чтобы использовать общий пул соединений Hyper.
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

### Подключение по HTTPS или к ClickHouse Cloud

HTTPS работает как с фичами Cargo `rustls-tls`, так и с `native-tls`.

Затем создайте клиент как обычно. В этом примере для хранения параметров подключения используются переменные окружения:

:::important
URL должен включать и протокол, и порт, например `https://instance.clickhouse.cloud:8443`.
:::

```rust
fn read_env_var(key: &str) -> String {
    env::var(key).unwrap_or_else(|_| panic!("Переменная окружения {key} должна быть установлена"))
}

let client = Client::default()
    .with_url(read_env_var("CLICKHOUSE_URL"))
    .with_user(read_env_var("CLICKHOUSE_USER"))
    .with_password(read_env_var("CLICKHOUSE_PASSWORD"));
```

См. также:

* [Пример HTTPS с ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs) в репозитории клиента. Он также подходит для HTTPS-подключений к on-premise-инсталляциям.

### Выбор строк

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
* Плейсхолдер `?` заменяется значениями в последующих вызовах метода `bind()`.
* Удобные методы `fetch_one::<Row>()` и `fetch_all::<Row>()` можно использовать, чтобы получить первую строку или все строки соответственно.
* `sql::Identifier` можно использовать для привязки имён таблиц.

Примечание: так как весь ответ передаётся потоково, курсоры могут вернуть ошибку даже после выдачи части строк. Если в вашем случае это происходит, вы можете попробовать `query(...).with_option("wait_end_of_query", "1")`, чтобы включить буферизацию ответа на стороне сервера. [Подробности](/interfaces/http/#response-buffering). Опция `buffer_size` также может быть полезна.

:::warning
Используйте `wait_end_of_query` с осторожностью при выборке строк, так как это может привести к повышенному потреблению памяти на стороне сервера и, вероятнее всего, снизит общую производительность.
:::

### Вставка строк

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

* Если `end()` не был вызван, операция `INSERT` отменяется.
* Строки отправляются постепенно в виде потока, чтобы равномернее распределить сетевую нагрузку.
* ClickHouse выполняет вставку пакетов атомарно только в том случае, если все строки попадают в один и тот же раздел, а их количество меньше значения [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size).

### Асинхронная вставка (пакетирование на стороне сервера)

Вы можете использовать [асинхронные вставки ClickHouse](/optimize/asynchronous-inserts), чтобы избежать пакетирования входящих данных на стороне клиента. Это можно сделать, просто указав опцию `async_insert` в методе `insert` (или даже в самом экземпляре `Client`, чтобы она применялась ко всем вызовам `insert`).


```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

См. также:

* [Пример асинхронной вставки](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs) в репозитории клиента.

### Возможность Inserter (пакетная вставка на стороне клиента)

Требуется фича Cargo `inserter`.

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

// не забудьте финализировать inserter при завершении работы приложения
// и зафиксировать оставшиеся строки. `.end()` также вернёт статистику.
inserter.end().await?;
```

* `Inserter` завершает активную вставку в `commit()`, если достигнут любой из порогов (`max_bytes`, `max_rows`, `period`).
* Интервал между завершениями активных `INSERT` можно регулировать с помощью `with_period_bias`, чтобы избежать пиков нагрузки из‑за параллельных вставок.
* `Inserter::time_left()` можно использовать, чтобы определить, когда заканчивается текущий период. Вызовите `Inserter::commit()` ещё раз, чтобы проверить лимиты, если ваш поток редко выдаёт элементы.
* Временные пороги реализованы с использованием крейта [quanta](https://docs.rs/quanta) для ускорения работы `inserter`. Не используется, если включён `test-util` (таким образом, временем можно управлять через `tokio::time::advance()` в пользовательских тестах).
* Все строки между вызовами `commit()` вставляются в одном операторе `INSERT`.

:::warning
Не забудьте выполнить `flush`, если вы хотите завершить/финализировать вставку:

```rust
inserter.end().await?;
```

:::

### Выполнение DDL-операторов

В случае одноузлового развертывания достаточно выполнить операторы DDL следующим образом:

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

Однако в кластерных развертываниях с балансировщиком нагрузки или в ClickHouse Cloud рекомендуется дождаться применения DDL на всех репликах, используя параметр `wait_end_of_query`. Это можно сделать следующим образом:

```rust
client
    .query("DROP TABLE IF EXISTS some")
    .with_option("wait_end_of_query", "1")
    .execute()
    .await?;
```

### Настройки ClickHouse

Вы можете применить различные [настройки ClickHouse](/operations/settings/settings) с помощью метода `with_option`. Например:

```rust
let numbers = client
    .query("SELECT number FROM system.numbers")
    // Эта настройка применяется только к данному запросу;
    // она переопределяет глобальную настройку клиента.
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

Помимо `query`, аналогично работают методы `insert` и `inserter`; кроме того, тот же метод может быть вызван у экземпляра `Client` для установки глобальных настроек для всех запросов.

### Идентификатор запроса (Query ID)

С помощью `.with_option` вы можете задать опцию `query_id`, чтобы идентифицировать запросы в журнале запросов ClickHouse.

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

Помимо `query`, аналогично работает и с методами `insert` и `inserter`.

:::danger
Если вы задаёте `query_id` вручную, убедитесь, что он уникален. Для этого хорошо подходят UUID.
:::

См. также: [пример query&#95;id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) в репозитории клиента.

### Идентификатор сессии


Аналогично `query_id`, вы можете задать `session_id`, чтобы выполнять запросы в одной и той же сессии. `session_id` можно задать либо глобально на уровне клиента, либо для отдельных вызовов `query`, `insert` или `inserter`.

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
В кластерных развертываниях из‑за отсутствия «липких сессий» (sticky sessions) вам необходимо подключаться к *конкретному узлу кластера*, чтобы корректно использовать эту функцию, поскольку, например, балансировщик нагрузки с круговым перебором (round-robin) не гарантирует, что последующие запросы будут обрабатываться тем же узлом ClickHouse.
:::

См. также: [пример с session&#95;id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) в репозитории клиента.

### Пользовательские HTTP‑заголовки

Если вы используете прокси‑аутентификацию или вам нужно передавать пользовательские заголовки, вы можете сделать это следующим образом:

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

См. также: [пример пользовательских HTTP-заголовков](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) в репозитории клиента.

### Пользовательский HTTP-клиент

Это может быть полезно для тонкой настройки параметров нижележащего пула HTTP-соединений.

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // or HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // Как долго поддерживать конкретный неактивный сокет на стороне клиента (в миллисекундах).
    // Это значение должно быть заметно меньше таймаута KeepAlive сервера ClickHouse,
    // который по умолчанию составлял 3 секунды для версий до 23.11 и 10 секунд для последующих версий.
    .pool_idle_timeout(Duration::from_millis(2_500))
    // Устанавливает максимальное количество неактивных Keep-Alive соединений, разрешённых в пуле.
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
Этот пример основан на устаревшем Hyper API и в будущем может измениться.
:::

См. также: [пример пользовательского HTTP‑клиента](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) в репозитории клиента.


## Типы данных

:::info
См. также дополнительные примеры:

* [Более простые типы данных ClickHouse](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)

* [Контейнерные типы данных ClickHouse](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
  :::

* `(U)Int(8|16|32|64|128)` сопоставляется с соответствующими типами `(u|i)(8|16|32|64|128)` или с newtype-обёртками вокруг них.

* `(U)Int256` не поддерживаются напрямую, но существует [обходной путь](https://github.com/ClickHouse/clickhouse-rs/issues/48).

* `Float(32|64)` сопоставляется с соответствующими типами `f(32|64)` или с newtype-обёртками вокруг них.

* `Decimal(32|64|128)` сопоставляется с соответствующими типами `i(32|64|128)` или с newtype-обёртками вокруг них. Удобнее всего использовать [`fixnum`](https://github.com/loyd/fixnum) или другую реализацию знаковых чисел с фиксированной запятой.

* `Boolean` сопоставляется с `bool` или с newtype-обёртками вокруг него.

* `String` сопоставляется с любыми строковыми или байтовыми типами, например `&str`, `&[u8]`, `String`, `Vec<u8>` или [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html). Пользовательские типы также поддерживаются. Для хранения байтов рассмотрите возможность использования [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/), поскольку это более эффективно.

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

* `UUID` сопоставляется с [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) с помощью `serde::uuid`. Требуется включённая фича `uuid`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```

* `IPv6` отображается в/из [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html).
* `IPv4` отображается в/из [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) с помощью `serde::ipv4`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```

* `Date` конвертируется в/из `u16` или newtype-обёртки вокруг него и представляет количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) при использовании `serde::time::date`, для чего требуется фича `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

* `Date32` сопоставляется с `i32` или newtype-обёрткой вокруг него и представляет количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) при использовании `serde::time::date32`, что требует включённой фичи `time`.


```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```

* `DateTime` сопоставляется с `u32` или newtype-обёрткой над ним и представляет количество секунд, прошедших с эпохи Unix. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) при использовании `serde::time::datetime`, что требует активации фичи `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` отображается в `i32` или newtype-обёртку вокруг него и обратно и представляет время, прошедшее с начала эпохи Unix. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) при использовании `serde::time::datetime64::*`, для чего требуется фича `time`.

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

* `Tuple(A, B, ...)` отображается в/из `(A, B, ...)` или обёртку newtype вокруг него.
* `Array(_)` отображается в/из любого среза, например `Vec<_>`, `&[_]`. Также поддерживаются собственные типы.
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

* Поддерживаются типы `Geo`. `Point` ведёт себя как кортеж `(f64, f64)`, а остальные типы — просто срезы точек.

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

* Типы данных `Variant`, `Dynamic` и (новый тип данных) `JSON` пока не поддерживаются.


## Мокирование {#mocking}
Этот crate предоставляет утилиты для мокирования сервера ClickHouse и тестирования запросов DDL, `SELECT`, `INSERT` и `WATCH`. Функциональность можно включить с помощью feature `test-util`. Используйте её **только** как dev-зависимость.

См. [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs).



## Устранение неполадок

### CANNOT&#95;READ&#95;ALL&#95;DATA

Наиболее распространённая причина ошибки `CANNOT_READ_ALL_DATA` — несоответствие определения строки на стороне приложения определению строки в ClickHouse.

Рассмотрим следующую таблицу:

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

Затем, если `EventLog` определён на стороне приложения с несоответствующими типами, например:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- должно быть u32!
}
```

При вставке данных может возникнуть следующая ошибка:

```response
Error: BadResponse("Code: 33. DB::Exception: Не удалось прочитать все данные. Прочитано байтов: 5. Ожидалось байтов: 23.: (в строке 1)\n: При выполнении BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

В этом примере это исправляется за счёт корректного определения структуры `EventLog`:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```


## Известные ограничения {#known-limitations}

* Типы данных `Variant`, `Dynamic` и (новый) `JSON` пока не поддерживаются.
* Привязка параметров на стороне сервера пока не поддерживается; см. [эту задачу](https://github.com/ClickHouse/clickhouse-rs/issues/142) для отслеживания.



## Свяжитесь с нами {#contact-us}

Если у вас есть вопросы или нужна помощь, свяжитесь с нами в [нашем Community Slack](https://clickhouse.com/slack) или через раздел [Issues на GitHub](https://github.com/ClickHouse/clickhouse-rs/issues).
