---
description: 'Документация по интерфейсу Apache Arrow Flight в ClickHouse, который позволяет клиентам Flight SQL подключаться к ClickHouse'
sidebar_label: 'Интерфейс Arrow Flight'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Интерфейс Arrow Flight'
doc_type: 'reference'
---

# Интерфейс Apache Arrow Flight \{#apache-arrow-flight-interface\}

## Обзор \{#overview\}

ClickHouse поддерживает протокол [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) — высокопроизводительный RPC-фреймворк для эффективной передачи столбцовых данных с использованием формата [Arrow IPC](https://arrow.apache.org/docs/format/Columnar.html#serialization-and-interprocess-communication-ipc) поверх [gRPC](https://grpc.io/).

Реализация также включает поддержку [Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html), что позволяет BI-инструментам и приложениям, работающим по протоколу Flight SQL, напрямую выполнять запросы к ClickHouse.

Ключевые возможности:

* Выполнение SQL-запросов и получение результатов в формате Apache Arrow.
* Вставка данных в таблицы с использованием формата Arrow.
* Запрос метаданных (каталогов, schema, таблиц, первичных ключей) с помощью команд Flight SQL.
* Управление сессиями и настройками с помощью действий Flight SQL.
* Шифрование TLS и аутентификация по имени пользователя и паролю.
* Инкрементальное получение результатов через `PollFlightInfo`.
* Отмена запросов через `CancelFlightInfo`.

## Включение сервера Arrow Flight \{#enabling-server\}

Чтобы включить сервер Arrow Flight, добавьте параметр `arrowflight_port` в конфигурацию сервера ClickHouse:

```xml
<clickhouse>
    <arrowflight_port>9090</arrowflight_port>
</clickhouse>
```

При запуске в журнале появляется сообщение, подтверждающее, что интерфейс активен:

```text
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9090
```

## Настройка TLS \{#tls-configuration\}

Чтобы включить TLS для интерфейса Arrow Flight, настройте следующие параметры:

```xml
<clickhouse>
    <arrowflight_port>9090</arrowflight_port>
    <arrowflight>
        <enable_ssl>true</enable_ssl>
        <ssl_cert_file>/path/to/server-cert.pem</ssl_cert_file>
        <ssl_key_file>/path/to/server-key.pem</ssl_key_file>
    </arrowflight>
</clickhouse>
```

При включённом TLS клиенты должны подключаться по схеме `grpc+tls://` вместо `grpc://`.

## Аутентификация \{#authentication\}

В интерфейсе Arrow Flight поддерживаются два метода аутентификации:

### Базовая аутентификация \{#basic-auth\}

Клиенты проходят аутентификацию по имени пользователя и паролю с использованием стандартного HTTP-заголовка `Authorization: Basic`. При успешной аутентификации сервер возвращает Bearer-токен в заголовке ответа.

### Аутентификация с помощью Bearer-токена \{#bearer-auth\}

В последующих запросах можно использовать Bearer-токен, полученный при базовой аутентификации, передавая его в заголовке `Authorization: Bearer <token>`. Токен автоматически обновляется при каждом использовании и истекает в соответствии с настройкой сервера `default_session_timeout` (по умолчанию: 60 секунд).

### Пример Python \{#auth-python-example\}

```python
import pyarrow.flight as flight

client = flight.FlightClient("grpc://localhost:9090")

# Basic auth returns a bearer token for subsequent calls
token_pair = client.authenticate_basic_token("default", "")
options = flight.FlightCallOptions(headers=[token_pair])
```

При использовании TLS:

```python
import pyarrow.flight as flight

with open("ca-cert.pem", "rb") as f:
    tls_root_certs = f.read()

client = flight.FlightClient(
    "grpc+tls://localhost:9090",
    tls_root_certs=tls_root_certs,
)

token_pair = client.authenticate_basic_token("default", "password")
options = flight.FlightCallOptions(headers=[token_pair])
```

## Управление сеансами \{#session-management\}

Интерфейс Arrow Flight поддерживает сеансы ClickHouse через пользовательские заголовки метаданных gRPC:

| Заголовок                      | Описание                                                                                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `x-clickhouse-session-id`      | Идентификатор сеанса. Если указан, несколько запросов используют одно и то же состояние сеанса (временные таблицы, настройки).                                        |
| `x-clickhouse-session-timeout` | Таймаут сеанса в секундах. Не должен превышать `max_session_timeout`.                                                                                                 |
| `x-clickhouse-session-check`   | Установите `1`, чтобы проверить, существует ли сеанс, не создавая его.                                                                                                |
| `x-clickhouse-session-close`   | Установите `1`, чтобы закрыть сеанс после завершения запроса. Для этого в конфигурации сервера параметр `enable_arrow_close_session` должен быть установлен в `true`. |

:::note
Поскольку Arrow Flight использует gRPC поверх HTTP/2, имена заголовков метаданных чувствительны к регистру и должны указываться в нижнем регистре точно так, как показано (например, `x-clickhouse-session-id`, а не `X-ClickHouse-Session-Id`). Это требуется [RFC 9113, разделом 8.2](https://www.rfc-editor.org/rfc/rfc9113#section-8.2), который предписывает, чтобы имена полей HTTP/2 содержали только символы нижнего регистра. Это отличается от HTTP/1.1, где имена заголовков регистронезависимы.
:::

Сеансы позволяют задавать сохраняемые настройки ClickHouse через действие `SetSessionOptions` (см. [DoAction](#doaction)).

## Справочник по конфигурации сервера \{#configuration-reference\}

| Параметр                                                      | По умолчанию | Описание                                                                                                                               |
| ------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `arrowflight_port`                                            | —            | Порт сервера Arrow Flight. Сервер запускается только в том случае, если указан этот параметр.                                          |
| `arrowflight.enable_ssl`                                      | `false`      | Включает шифрование TLS.                                                                                                               |
| `arrowflight.ssl_cert_file`                                   | —            | Путь к файлу сертификата TLS. Обязателен, если включен TLS.                                                                            |
| `arrowflight.ssl_key_file`                                    | —            | Путь к файлу частного ключа TLS. Обязателен, если включен TLS.                                                                         |
| `arrowflight.tickets_lifetime_seconds`                        | `600`        | Время в секундах до истечения срока действия ticket&#39;ов и их удаления. Установите `0`, чтобы отключить их автоматическое истечение. |
| `arrowflight.cancel_ticket_after_do_get`                      | `false`      | Если `true`, ticket&#39;ы отменяются сразу после обработки через `DoGet`, что освобождает память.                                      |
| `arrowflight.poll_descriptors_lifetime_seconds`               | `600`        | Время в секундах до истечения срока действия дескрипторов опроса. Установите `0`, чтобы отключить автоматическое истечение.            |
| `arrowflight.cancel_flight_descriptor_after_poll_flight_info` | `false`      | Если `true`, дескрипторы опроса отменяются после обработки через `PollFlightInfo`.                                                     |
| `enable_arrow_close_session`                                  | `true`       | Разрешает клиентам закрывать сеансы через заголовок `x-clickhouse-session-close`.                                                      |
| `default_session_timeout`                                     | `60`         | Таймаут сеанса по умолчанию в секундах. Также управляет сроком действия Bearer-токена.                                                 |
| `max_session_timeout`                                         | `3600`       | Максимально допустимый таймаут сеанса в секундах.                                                                                      |

## Поддерживаемые методы RPC \{#rpc-methods\}

### GetFlightInfo \{#getflightinfo\}

Выполняет запрос и возвращает `FlightInfo`, содержащий schema результата, конечные точки с тикетами для получения данных, количество строк и байт.

Принимает `FlightDescriptor`, который может быть одним из следующих:

* **Дескриптор PATH**: Однокомпонентный путь, интерпретируемый как имя таблицы. Генерирует `SELECT * FROM <table>`.
* **Дескриптор CMD**: Либо строка сырого SQL-запроса, либо сериализованная protobuf-команда Flight SQL (см. [Команды Flight SQL](#flight-sql-commands)).

Запрос выполняется полностью, а результаты сохраняются в тикетах на стороне сервера. Каждый блок данных создает отдельную конечную точку/тикет, что позволяет клиентам получать данные параллельно.

```python
# Query by table name
descriptor = flight.FlightDescriptor.for_path("my_table")
info = client.get_flight_info(descriptor, options)

# Query by SQL
descriptor = flight.FlightDescriptor.for_command(
    "SELECT * FROM my_table WHERE id > 100"
)
info = client.get_flight_info(descriptor, options)

# Retrieve results
for endpoint in info.endpoints:
    reader = client.do_get(endpoint.ticket, options)
    table = reader.read_all()
    print(table.to_pandas())
```

### PollFlightInfo \{#pollflightinfo\}

Позволяет поэтапно получать результаты для длительно выполняющихся запросов. Вместо того чтобы ждать завершения всего запроса (как это делает `GetFlightInfo`), `PollFlightInfo` возвращает результаты по блокам.

При первом вызове запрос начинает выполняться. Ответ включает:

* `FlightInfo` с конечными точками для всех блоков данных, доступных на данный момент.
* `FlightDescriptor` для следующего опроса (если ожидаются дополнительные результаты).

Последующие вызовы с возвращённым дескриптором позволяют получить дополнительные блоки. Когда данных больше нет, ответ не содержит дескриптора для следующего опроса.

:::note
Текущая реализация блокирует выполнение до тех пор, пока не станет доступен блок данных, вместо того чтобы сразу возвращать управление при отсутствии данных.
:::

### GetSchema \{#getschema\}

Возвращает schema Arrow для результата запроса без выполнения всего запроса. Принимает те же типы дескрипторов, что и `GetFlightInfo`.

```python
descriptor = flight.FlightDescriptor.for_command(
    "SELECT 1 AS x, 'hello' AS y"
)
schema_result = client.get_schema(descriptor, options)
schema = schema_result.schema
print(schema)  # x: int32, y: string
```

### DoGet \{#doget\}

Извлекает данные по указанному тикету. Принимает одно из следующего:

* Тикет, возвращённый `GetFlightInfo` или `PollFlightInfo`.
* Строку сырого SQL-запроса в качестве значения тикета.

```python
# Using a ticket from GetFlightInfo
reader = client.do_get(endpoint.ticket, options)
table = reader.read_all()

# Using a raw SQL query as ticket
ticket = flight.Ticket("SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket, options)
table = reader.read_all()
```

### DoPut \{#doput\}

Отправляет данные в ClickHouse. Принимает `FlightDescriptor` и поток пакетов записей Arrow.

**Вставка по имени таблицы** (дескриптор PATH):

```python
schema = pa.schema([("id", pa.int64()), ("name", pa.string())])
batch = pa.record_batch(
    [pa.array([1, 2, 3]), pa.array(["Alice", "Bob", "Charlie"])],
    schema=schema,
)

descriptor = flight.FlightDescriptor.for_path("my_table")
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()
```

**Вставка через SQL** (дескриптор CMD):

```python
descriptor = flight.FlightDescriptor.for_command(
    "INSERT INTO my_table FORMAT Arrow"
)
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()
```

**Выполнение DDL/DML через Flight SQL `CommandStatementUpdate`:**

Клиенты Flight SQL используют `CommandStatementUpdate` для выполнения операторов DDL/DML (CREATE, INSERT, ALTER и т. д.). В ответе возвращается количество затронутых строк.

**Массовый приём данных через Flight SQL `CommandStatementIngest`:**

Поддерживается только добавление данных в существующие таблицы (`TABLE_NOT_EXIST_OPTION_FAIL` + `TABLE_EXISTS_OPTION_APPEND`). Каталоги и временные таблицы для этой команды не поддерживаются.

:::note
Для передачи данных поддерживается только формат `Arrow`. Указание других форматов в SQL (например, `FORMAT JSON`) приводит к ошибке.
:::

### DoAction \{#doaction\}

Выполняет именованные действия. Поддерживаются следующие действия:

#### CancelFlightInfo \{#cancelflightinfo\}

Отменяет выполняемый запрос, связанный с `FlightInfo`. Идентификатор запроса извлекается из поля `app_metadata` объекта `FlightInfo`. Также отменяет все дескрипторы опроса, связанные с этим запросом.

```python
# Start a long-running query via PollFlightInfo, then cancel it
cancel_request = flight.CancelFlightInfoRequest(info)
result = client.cancel_flight_info(cancel_request, options)
# result.status is CancelStatus.CANCELLED if successful
```

#### SetSessionOptions \{#setsessionoptions\}

Устанавливает настройки сервера ClickHouse для текущего сеанса. Для этого требуется идентификатор сеанса, заданный в заголовке `x-clickhouse-session-id`.

Поддерживаемые типы значений: string, boolean, integer, double и списки строк.

Если имя настройки неизвестно, возвращается ошибка `INVALID_NAME`. Если значение не удаётся обработать, возвращается ошибка `INVALID_VALUE`.

#### GetSessionOptions \{#getsessionoptions\}

Возвращает все текущие настройки ClickHouse и их значения для текущего сеанса. Возвращает отображение, где ключи — имена настроек, а значения — строки (внутренне выполняет запрос к `system.settings`).

## Команды Flight SQL \{#flight-sql-commands\}

Когда дескриптор `CMD` содержит сериализованное protobuf-сообщение [Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html), ClickHouse обрабатывает следующие команды:

### Поддерживается через GetFlightInfo / GetSchema \{#flightsql-getflightinfo\}

| Command                 | Description                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `CommandStatementQuery` | Выполнить произвольный SQL-запрос.                                                                                    |
| `CommandGetSqlInfo`     | Получить метаданные сервера (имя, версия, версия Arrow, поддерживаемые возможности).                                  |
| `CommandGetCatalogs`    | Вывести список каталогов. Возвращает пустой результат (ClickHouse не использует каталоги).                            |
| `CommandGetDbSchemas`   | Вывести список баз данных. Поддерживает необязательный параметр `db_schema_filter_pattern` (шаблон SQL `LIKE`).       |
| `CommandGetTables`      | Вывести список таблиц. Поддерживает фильтры по schema, имени таблицы, типам таблиц и необязательное включение schema. |
| `CommandGetTableTypes`  | Вывести список типов движков таблиц (из `system.table_engines`).                                                      |
| `CommandGetPrimaryKeys` | Получить столбцы первичного ключа для указанной таблицы.                                                              |

### Поддерживается через DoPut \{#flightsql-doput\}

| Команда                  | Описание                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `CommandStatementUpdate` | Выполняет DDL/DML-оператор (CREATE, INSERT, ALTER и т. д.). Возвращает количество затронутых строк.     |
| `CommandStatementIngest` | Выполняет массовую вставку данных Arrow в существующую таблицу. Поддерживается только режим добавления. |

### Пока не реализовано \{#flightsql-not-implemented\}

| Команда                          | Статус                                              |
| -------------------------------- | --------------------------------------------------- |
| `CommandGetCrossReference`       | Не реализовано                                      |
| `CommandGetExportedKeys`         | Не реализовано                                      |
| `CommandGetImportedKeys`         | Не реализовано                                      |
| `CommandStatementSubstraitPlan`  | Не поддерживается (поддержка Substrait отсутствует) |
| `CommandPreparedStatementQuery`  | Не реализовано                                      |
| `CommandPreparedStatementUpdate` | Не реализовано                                      |

## Полный пример \{#complete-example\}

```python
import pyarrow as pa
import pyarrow.flight as flight

# Connect and authenticate
client = flight.FlightClient("grpc://localhost:9090")
token = client.authenticate_basic_token("default", "")
options = flight.FlightCallOptions(headers=[token])

# Insert data using DoPut with a PATH descriptor
schema = pa.schema([("id", pa.uint32()), ("value", pa.string())])
batch = pa.record_batch(
    [pa.array([1, 2, 3], type=pa.uint32()), pa.array(["a", "b", "c"])],
    schema=schema,
)
descriptor = flight.FlightDescriptor.for_path("test")
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()

# Query data using GetFlightInfo + DoGet
descriptor = flight.FlightDescriptor.for_command(
    "SELECT * FROM test ORDER BY id"
)
info = client.get_flight_info(descriptor, options)
for endpoint in info.endpoints:
    reader = client.do_get(endpoint.ticket, options)
    table = reader.read_all()
    print(table.to_pandas())
```

Вывод:

```text
   id value
0   1     a
1   2     b
2   3     c
```

## Формат данных \{#data-format\}

Все данные передаются в формате Apache Arrow IPC. Поддерживается только формат `Arrow` — при указании других форматов ClickHouse (например, `FORMAT JSON`, `FORMAT CSV`) возникает ошибка.

Во время сериализации типы данных ClickHouse сопоставляются с типами Arrow. Параметр `output_format_arrow_unsupported_types_as_binary` определяет, будут ли неподдерживаемые типы ClickHouse сериализоваться как бинарные объекты BLOB.

## Совместимость \{#compatibility\}

Интерфейс Arrow Flight совместим с любым клиентом или инструментом, поддерживающим протокол Arrow Flight или Arrow Flight SQL, включая:

* Python (`pyarrow`)
* Java (`org.apache.arrow.flight`)
* C++ (`arrow::flight`)
* Go (`apache/arrow/go`)
* драйверы ADBC (Arrow Database Connectivity)
* DBeaver и другие инструменты с поддержкой Flight SQL

Если для вашего инструмента доступен нативный коннектор ClickHouse (например, JDBC, ODBC или нативный протокол), предпочтительно использовать его, если только Arrow Flight не требуется именно из-за производительности или совместимости форматов.

## Возможности ArrowFlight на стороне клиента \{#client-side\}

ClickHouse также может выступать в роли клиента Arrow Flight для чтения данных с внешних серверов Arrow Flight. См.:

* [движок таблицы ArrowFlight](/engines/table-engines/integrations/arrowflight)
* [табличная функция arrowFlight](/sql-reference/table-functions/arrowflight)

## См. также \{#see-also\}

* [Спецификация Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html)
* [Спецификация Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
* [Формат Arrow в ClickHouse](/interfaces/formats/Arrow)