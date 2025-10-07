---
'slug': '/native-protocol/server'
'sidebar_position': 3
'title': 'Серверные пакеты'
'description': 'Нативный протокол сервера'
'doc_type': 'reference'
---


# Пакеты сервера

| значение | название                         | описание                                                     |
|----------|----------------------------------|-------------------------------------------------------------|
| 0        | [Hello](#hello)                 | Ответ на рукопожатие сервера                               |
| 1        | Data                             | То же самое, что и [client data](./client.md#data)           |
| 2        | [Exception](#exception)          | Исключение при обработке запроса                            |
| 3        | [Progress](#progress)            | Прогресс выполнения запроса                                  |
| 4        | [Pong](#pong)                    | Ответ на Ping                                              |
| 5        | [EndOfStream](#end-of-stream)    | Все пакеты были переданы                                   |
| 6        | [ProfileInfo](#profile-info)     | Данные профилирования                                      |
| 7        | Totals                           | Общие значения                                            |
| 8        | Extremes                         | Крайние значения (min, max)                               |
| 9        | TablesStatusResponse             | Ответ на запрос TableStatus                                |
| 10       | [Log](#log)                      | Лог системы запросов                                       |
| 11       | TableColumns                     | Описание колонок                                          |
| 12       | UUIDs                            | Список уникальных идентификаторов частей                   |
| 13       | ReadTaskRequest                  | Строка (UUID) описывает запрос, для которого нужна следующая задача |
| 14       | [ProfileEvents](#profile-events) | Пакет с событиями профилирования от сервера               |

`Data`, `Totals` и `Extremes` могут быть сжаты.

## Hello {#hello}

Ответ на [client hello](./client.md#hello).

| поле          | тип     | значение        | описание               |
|---------------|---------|-----------------|-----------------------|
| name          | String  | `Clickhouse`    | Имя сервера           |
| version_major | UVarInt | `21`            | Основная версия сервера|
| version_minor | UVarInt | `12`            | Второстепенная версия сервера|
| revision      | UVarInt | `54452`         | Ревизия сервера       |
| tz            | String  | `Europe/Moscow` | Часовой пояс сервера   |
| display_name  | String  | `Clickhouse`    | Имя сервера для UI    |
| version_patch | UVarInt | `3`             | Версия патча сервера  |

## Exception {#exception}

Исключение сервера во время обработки запроса.

| поле        | тип    | значение                                       | описание                  |
|-------------|--------|-----------------------------------------------|---------------------------|
| code        | Int32  | `60`                                          | См. [ErrorCodes.cpp][codes]. |
| name        | String | `DB::Exception`                               | Основная версия сервера   |
| message     | String | `DB::Exception: Table X doesn't exist`       | Второстепенная версия сервера|
| stack_trace | String | ~                                             | Стек вызовов C++         |
| nested      | Bool   | `true`                                       | Больше ошибок            |

Может быть непрерывным списком исключений, пока поле `nested` равно `false`.

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "Список кодов ошибок"

## Progress {#progress}

Прогресс выполнения запроса, периодически сообщаемый сервером.

:::tip
Прогресс сообщается в **дельтах**. Для итогов накапливайте на клиенте.
:::

| поле       | тип     | значение   | описание             |
|------------|---------|------------|----------------------|
| rows       | UVarInt | `65535`    | Количество строк      |
| bytes      | UVarInt | `871799`   | Количество байт      |
| total_rows | UVarInt | `0`        | Всего строк          |
| wrote_rows | UVarInt | `0`        | Строки от клиента    |
| wrote_bytes| UVarInt | `0`        | Байты от клиента     |

## Pong {#pong}

Ответ на [client ping](./client.md#ping), без тела пакета.

## End of stream {#end-of-stream}

Больше не будут отправляться пакеты **Data**, результат запроса полностью передан от сервера к клиенту.

Нет тела пакета.

## Profile info {#profile-info}

| поле                        | тип     |
|------------------------------|---------|
| rows                         | UVarInt |
| blocks                       | UVarInt |
| bytes                        | UVarInt |
| applied_limit                | Bool    |
| rows_before_limit            | UVarInt |
| calculated_rows_before_limit | Bool    |

## Log {#log}

**Блок данных** с логом сервера.

:::tip
Закодирован как **блок данных** колонок, но никогда не сжимается.
:::

| колонка    | тип      |
|------------|----------|
| time       | DateTime |
| time_micro | UInt32   |
| host_name  | String   |
| query_id   | String   |
| thread_id  | UInt64   |
| priority   | Int8     |
| source     | String   |
| text       | String   |

## Profile events {#profile-events}

**Блок данных** с событиями профилирования.

:::tip
Закодирован как **блок данных** колонок, но никогда не сжимается.

Тип `value` — `UInt64` или `Int64`, в зависимости от ревизии сервера.
:::

| колонка       | тип              |
|---------------|-------------------|
| host_name     | String            |
| current_time  | DateTime          |
| thread_id     | UInt64            |
| type          | Int8              |
| name          | String            |
| value         | UInt64 или Int64  |
