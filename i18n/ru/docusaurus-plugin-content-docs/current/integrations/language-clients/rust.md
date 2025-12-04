---
sidebar_label: 'Rust'
sidebar_position: 5
keywords: ['clickhouse', 'rs', 'rust', 'cargo', 'crate', 'http', 'client', 'connect', 'integrate']
slug: /integrations/rust
description: 'Официальный Rust-клиент ClickHouse.'
title: 'Rust-клиент ClickHouse'
doc_type: 'reference'
---

# Rust-клиент ClickHouse {#clickhouse-rust-client}

Официальный Rust-клиент для подключения к ClickHouse, изначально разработанный [Paul Loyd](https://github.com/loyd). Исходный код клиента доступен в [репозитории на GitHub](https://github.com/ClickHouse/clickhouse-rs).

## Обзор {#overview}

* Использует `serde` для кодирования и декодирования строк.
* Поддерживает атрибуты `serde`: `skip_serializing`, `skip_deserializing`, `rename`.
* Использует формат [`RowBinary`](/interfaces/formats/RowBinary) поверх HTTP-транспорта.
  * Планируется переход на [`Native`](/interfaces/formats/Native) поверх TCP.
* Поддерживает TLS (через фичи `native-tls` и `rustls-tls`).
* Поддерживает сжатие и разжатие (LZ4).
* Предоставляет API для выборки и вставки данных, выполнения DDL-операций и пакетной отправки на стороне клиента.
* Предоставляет удобные моки для модульного тестирования.

## Установка {#installation}

Чтобы использовать этот крейт, добавьте следующее в `Cargo.toml`:

```toml
[dependencies]
clickhouse = "0.12.2"

[dev-dependencies]
clickhouse = { version = "0.12.2", features = ["test-util"] }
```

См. также [страницу crates.io](https://crates.io/crates/clickhouse).

## Возможности Cargo {#cargo-features}

* `lz4` (включена по умолчанию) — включает варианты `Compression::Lz4` и `Compression::Lz4Hc(_)`. Если она включена, `Compression::Lz4` используется по умолчанию для всех запросов, кроме `WATCH`.
* `native-tls` — добавляет поддержку URL со схемой `HTTPS` через `hyper-tls`, который линкуется с OpenSSL.
* `rustls-tls` — добавляет поддержку URL со схемой `HTTPS` через `hyper-rustls`, который не линкуется с OpenSSL.
* `inserter` — включает `client.inserter()`.
* `test-util` — добавляет моки. См. [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs). Используйте только в `dev-dependencies`.
* `watch` — включает функциональность `client.watch`. Подробности см. в соответствующем разделе.
* `uuid` — добавляет `serde::uuid` для работы с крейтом [uuid](https://docs.rs/uuid).
* `time` — добавляет `serde::time` для работы с крейтом [time](https://docs.rs/time).

:::important
При подключении к ClickHouse по `HTTPS` URL должна быть включена одна из возможностей: `native-tls` или `rustls-tls`.
Если включены обе, приоритет будет у возможности `rustls-tls`.
:::

## Совместимость с версиями ClickHouse {#clickhouse-versions-compatibility}

Клиент совместим с LTS-версией и более новыми версиями ClickHouse, а также с ClickHouse Cloud.

Серверы ClickHouse версий ниже v22.6 обрабатывают RowBinary [некорректно в некоторых редких случаях](https://github.com/ClickHouse/ClickHouse/issues/37420). 
Вы можете использовать версию клиента v0.11+ и включить функцию `wa-37420`, чтобы устранить эту проблему. Примечание: эту функцию не следует использовать с более новыми версиями ClickHouse.

## Примеры {#examples}

Мы стремимся охватить различные сценарии использования клиента с помощью [примеров](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples) в клиентском репозитории. Обзор приведён в файле [README для примеров](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/README.md#overview).

Если в примерах или в приведённой ниже документации что-то непонятно или чего-то не хватает, вы можете [связаться с нами](./rust.md#contact-us).

## Использование {#usage}

:::note
Crate [ch2rs](https://github.com/ClickHouse/ch2rs) полезен для генерации типа строки на основе схемы ClickHouse.
:::

### Создание экземпляра клиента {#creating-a-client-instance}

:::tip
Повторно используйте уже созданные экземпляры клиента или клонируйте их, чтобы использовать общий пул соединений hyper.
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

HTTPS работает как с функциями (features) Cargo `rustls-tls`, так и с `native-tls`.

Затем создайте клиент обычным образом. В этом примере переменные окружения используются для хранения параметров подключения:

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

* [Пример HTTPS с ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/clickhouse_cloud.rs) в репозитории клиента. Его также можно использовать для HTTPS-подключений к on-premise‑инстансам.

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
* Заполнитель `?` заменяется значениями в последующих вызовах `bind()`.
* Удобные методы `fetch_one::<Row>()` и `fetch_all::<Row>()` можно использовать для получения, соответственно, первой строки или всех строк.
* `sql::Identifier` можно использовать для привязки имён таблиц.

NB: так как весь ответ передаётся в потоке, курсоры могут вернуть ошибку даже после того, как уже были отданы некоторые строки. Если в вашем случае это происходит, вы можете попробовать `query(...).with_option("wait_end_of_query", "1")`, чтобы включить буферизацию ответа на стороне сервера. [Подробнее](/interfaces/http/#response-buffering). Опция `buffer_size` также может быть полезна.

:::warning
Используйте `wait_end_of_query` с осторожностью при выборке строк, так как это может привести к более высокому потреблению памяти на стороне сервера и, вероятно, снизит общую производительность.
:::

### Добавление строк {#inserting-rows}

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

* Если `end()` не вызывается, `INSERT` отменяется.
* Строки отправляются постепенно в виде потока, чтобы распределить нагрузку на сеть.
* ClickHouse вставляет пакеты строк атомарно, только если все строки попадают в один и тот же раздел и их количество меньше [`max_insert_block_size`](https://clickhouse.tech/docs/operations/settings/settings/#settings-max_insert_block_size).

### Асинхронная вставка (пакетирование на стороне сервера) {#async-insert-server-side-batching}

Вы можете использовать [асинхронные вставки ClickHouse](/optimize/asynchronous-inserts), чтобы избежать пакетирования входящих данных на стороне клиента. Это можно сделать, просто указав параметр `async_insert` в методе `insert` (или даже в экземпляре `Client`, чтобы он влиял на все вызовы `insert`).

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("async_insert", "1")
    .with_option("wait_for_async_insert", "0");
```

См. также:

* [Пример асинхронной вставки](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/async_insert.rs) в репозитории клиента.

### Возможность inserter (клиентская пакетная запись) {#inserter-feature-client-side-batching}

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

// не забудьте завершить работу inserter при остановке приложения
// и зафиксировать оставшиеся строки. `.end()` также вернёт статистику.
inserter.end().await?;
```

* `Inserter` завершает активную вставку в `commit()`, если достигнут любой из порогов (`max_bytes`, `max_rows`, `period`).
* Интервал между завершениями активных `INSERT` можно скорректировать с помощью `with_period_bias`, чтобы избежать всплесков нагрузки при параллельных вставках.
* `Inserter::time_left()` можно использовать для определения момента окончания текущего периода. Вызовите `Inserter::commit()` ещё раз, чтобы проверить лимиты, если ваш поток редко выдаёт элементы.
* Пороговые значения по времени реализованы с использованием крейта [quanta](https://docs.rs/quanta) для ускорения работы `inserter`. Не используется, если включён `test-util` (таким образом, временем можно управлять через `tokio::time::advance()` в пользовательских тестах).
* Все строки между вызовами `commit()` вставляются одним и тем же оператором `INSERT`.

:::warning
Не забудьте выполнить flush, если вы хотите завершить/финализировать вставку:

```rust
inserter.end().await?;
```

:::

### Выполнение операторов DDL {#executing-ddls}

В случае одноузлового развертывания достаточно выполнить операторы DDL следующим образом:

```rust
client.query("DROP TABLE IF EXISTS some").execute().await?;
```

Однако в кластерных развертываниях, использующих балансировщик нагрузки, или в ClickHouse Cloud рекомендуется дождаться применения DDL на всех репликах, используя опцию `wait_end_of_query`. Это можно сделать следующим образом:

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
    // Эта настройка применяется только к данному запросу;
    // она переопределяет глобальную настройку клиента.
    .with_option("limit", "3")
    .fetch_all::<u64>()
    .await?;
```

Помимо `query`, аналогичным образом работают методы `insert` и `inserter`; кроме того, тот же метод можно вызвать у экземпляра `Client`, чтобы задать глобальные настройки для всех запросов.

### Идентификатор запроса {#query-id}

С помощью `.with_option` вы можете задать опцию `query_id`, чтобы идентифицировать запросы в журнале запросов ClickHouse.

```rust
let numbers = client
    .query("SELECT number FROM system.numbers LIMIT 1")
    .with_option("query_id", "some-query-id")
    .fetch_all::<u64>()
    .await?;
```

Помимо `query`, аналогичным образом работают методы `insert` и `inserter`.

:::danger
Если вы вручную задаёте `query_id`, убедитесь, что он уникален. Для этого хорошо подходят UUID.
:::

См. также: [пример query&#95;id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/query_id.rs) в репозитории клиента.

### Идентификатор сессии {#session-id}

Аналогично `query_id`, вы можете задать `session_id`, чтобы выполнять запросы в одной и той же сессии. `session_id` можно задать либо глобально на уровне клиента, либо для каждого отдельного вызова `query`, `insert` или `inserter`.

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_option("session_id", "my-session");
```

:::danger
В случае кластерных развертываний из‑за отсутствия «sticky sessions» необходимо подключаться к *конкретному узлу кластера*, чтобы корректно использовать эту возможность, поскольку, например, балансировщик нагрузки с алгоритмом round-robin не гарантирует, что последующие запросы будут обрабатываться тем же узлом ClickHouse.
:::

См. также: пример [session&#95;id](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/session_id.rs) в репозитории клиента.

### Пользовательские HTTP‑заголовки {#custom-http-headers}

Если вы используете аутентификацию через прокси или вам нужно передавать пользовательские заголовки, вы можете сделать это следующим образом:

```rust
let client = Client::default()
    .with_url("http://localhost:8123")
    .with_header("X-My-Header", "hello");
```

См. также: [пример использования пользовательских HTTP-заголовков](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_headers.rs) в репозитории клиента.

### Пользовательский HTTP‑клиент {#custom-http-client}

Это может быть полезно для тонкой настройки параметров лежащего в основе пула HTTP‑соединений.

```rust
use hyper_util::client::legacy::connect::HttpConnector;
use hyper_util::client::legacy::Client as HyperClient;
use hyper_util::rt::TokioExecutor;

let connector = HttpConnector::new(); // or HttpsConnectorBuilder
let hyper_client = HyperClient::builder(TokioExecutor::new())
    // Как долго поддерживать конкретное неактивное соединение на стороне клиента (в миллисекундах).
    // Это значение должно быть заметно меньше таймаута KeepAlive сервера ClickHouse,
    // который по умолчанию составлял 3 секунды для версий до 23.11 и 10 секунд для последующих версий.
    .pool_idle_timeout(Duration::from_millis(2_500))
    // Устанавливает максимальное количество неактивных Keep-Alive соединений, допустимых в пуле.
    .pool_max_idle_per_host(4)
    .build(connector);

let client = Client::with_http_client(hyper_client).with_url("http://localhost:8123");
```

:::warning
Этот пример основан на устаревшем API Hyper и может измениться в будущем.
:::

См. также: [пример с пользовательским HTTP‑клиентом](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/custom_http_client.rs) в репозитории клиента.

## Типы данных {#data-types}

:::info
См. также дополнительные примеры:

* [Более простые типы данных ClickHouse](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_simple.rs)

* [Типы данных ClickHouse, похожие на контейнеры](https://github.com/ClickHouse/clickhouse-rs/blob/main/examples/data_types_derive_containers.rs)
  :::

* `(U)Int(8|16|32|64|128)` сопоставляется с соответствующими типами `(u|i)(8|16|32|64|128)` или newtype-обёртками вокруг них.

* `(U)Int256` не поддерживаются напрямую, но существует [обходной путь](https://github.com/ClickHouse/clickhouse-rs/issues/48).

* `Float(32|64)` сопоставляется с соответствующими `f(32|64)` или newtype-обёртками вокруг них.

* `Decimal(32|64|128)` сопоставляется с соответствующими `i(32|64|128)` или newtype-обёртками вокруг них. Удобнее использовать [`fixnum`](https://github.com/loyd/fixnum) или другую реализацию знаковых чисел с фиксированной запятой.

* `Boolean` сопоставляется с `bool` или newtype-обёртками вокруг него.

* `String` сопоставляется с любыми строковыми или байтовыми типами, например `&str`, `&[u8]`, `String`, `Vec<u8>` или [`SmartString`](https://docs.rs/smartstring/latest/smartstring/struct.SmartString.html). Также поддерживаются новые типы. Для хранения байтов рекомендуется использовать [`serde_bytes`](https://docs.rs/serde_bytes/latest/serde_bytes/), поскольку это эффективнее.

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

* `FixedString(N)` поддерживает представление в виде массива байтов, например `[u8; N]`.

```rust
#[derive(Row, Debug, Serialize, Deserialize)]
struct MyRow {
    fixed_str: [u8; 16], // FixedString(16)
}
```

* Перечисления `Enum(8|16)` поддерживаются с использованием [`serde_repr`](https://docs.rs/serde_repr/latest/serde_repr/).

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

* `UUID` сопоставляется с [`uuid::Uuid`](https://docs.rs/uuid/latest/uuid/struct.Uuid.html) и обратно с помощью `serde::uuid`. Требует включения feature `uuid`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::uuid")]
    uuid: uuid::Uuid,
}
```

* `IPv6` сопоставляется с [`std::net::Ipv6Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv6Addr.html) и обратно.
* `IPv4` сопоставляется с [`std::net::Ipv4Addr`](https://doc.rust-lang.org/stable/std/net/struct.Ipv4Addr.html) и обратно с помощью `serde::ipv4`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    #[serde(with = "clickhouse::serde::ipv4")]
    ipv4: std::net::Ipv4Addr,
}
```

* `Date` сопоставляется с `u16` (или newtype-обёрткой вокруг него) и представляет количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) при использовании `serde::time::date`, что требует включённой фичи `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: u16,
    #[serde(with = "clickhouse::serde::time::date")]
    date: Date,
}
```

* `Date32` маппится из/в `i32` или newtype-обёртку вокруг него и представляет количество дней, прошедших с `1970-01-01`. Также поддерживается [`time::Date`](https://docs.rs/time/latest/time/struct.Date.html) при использовании `serde::time::date32`, для чего требуется включённая фича `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    days: i32,
    #[serde(with = "clickhouse::serde::time::date32")]
    date: Date,
}
```

* `DateTime` сопоставляется с `u32` или newtype-обёрткой вокруг него и представляет количество секунд, прошедших с эпохи UNIX. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) при использовании `serde::time::datetime`, для чего требуется фича `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: u32,
    #[serde(with = "clickhouse::serde::time::datetime")]
    dt: OffsetDateTime,
}
```

* `DateTime64(_)` сопоставляется с `i32` или newtype-обёрткой вокруг него и представляет количество времени, прошедшее с эпохи UNIX. Также поддерживается [`time::OffsetDateTime`](https://docs.rs/time/latest/time/struct.OffsetDateTime.html) при использовании `serde::time::datetime64::*`, для чего требуется фича `time`.

```rust
#[derive(Row, Serialize, Deserialize)]
struct MyRow {
    ts: i64, // прошедшее время в с/мкс/мс/нс в зависимости от `DateTime64(X)`
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

* `Tuple(A, B, ...)` сопоставляется с `(A, B, ...)` или обёрткой newtype вокруг него.
* `Array(_)` сопоставляется с любым срезом, например `Vec<_>`, `&[_]`. Также поддерживаются пользовательские типы.
* `Map(K, V)` ведёт себя как `Array((K, V))`.
* `LowCardinality(_)` поддерживается прозрачно.
* `Nullable(_)` сопоставляется с `Option<_>`. Для вспомогательных средств `clickhouse::serde::*` добавьте `::option`.

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

* Поддерживаются типы `Geo`. Тип `Point` ведёт себя как кортеж `(f64, f64)`, а остальные типы представляют собой просто срезы из точек.

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

* Типы данных `Variant`, `Dynamic` и новый тип данных `JSON` пока не поддерживаются.

## Мокирование {#mocking}

Крейт предоставляет утилиты для мокирования сервера CH и тестирования DDL, а также запросов `SELECT`, `INSERT` и `WATCH`. Функциональность может быть включена с помощью feature `test-util`. Используйте её **только** как dev-зависимость.

См. [пример](https://github.com/ClickHouse/clickhouse-rs/tree/main/examples/mock.rs).

## Устранение неполадок {#troubleshooting}

### CANNOT&#95;READ&#95;ALL&#95;DATA {#cannot_read_all_data}

Наиболее распространённой причиной ошибки `CANNOT_READ_ALL_DATA` является то, что описание строки на стороне приложения не соответствует описанию строки в ClickHouse.

Рассмотрим следующую таблицу:

```sql
CREATE OR REPLACE TABLE event_log (id UInt32)
ENGINE = MergeTree
ORDER BY timestamp
```

Затем, если `EventLog` определён в приложении с несовместимыми типами, например:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: String, // <- должно быть u32!
}
```

При вставке данных может возникнуть следующая ошибка:

```response
Ошибка: BadResponse("Код: 33. DB::Exception: Невозможно прочитать все данные. Прочитано байт: 5. Ожидалось байт: 23.: (в строке 1)\n: При выполнении BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)")
```

В этом примере это устраняется правильным определением структуры `EventLog`:

```rust
#[derive(Debug, Serialize, Deserialize, Row)]
struct EventLog {
    id: u32
}
```

## Известные ограничения {#known-limitations}

* Типы данных `Variant`, `Dynamic` и (новый) `JSON` пока не поддерживаются.
* Привязка параметров на стороне сервера пока не поддерживается; для отслеживания см. [эту задачу](https://github.com/ClickHouse/clickhouse-rs/issues/142).

## Свяжитесь с нами {#contact-us}

Если у вас есть вопросы или нужна помощь, вы можете написать нам в [Community Slack](https://clickhouse.com/slack) или создать обращение в разделе [Issues на GitHub](https://github.com/ClickHouse/clickhouse-rs/issues).