---
slug: /native-protocol/server
sidebar_position: 3
title: 'Пакеты сервера'
description: 'Сервер нативного протокола'
---


# Пакеты сервера

| value | name                             | description                                                     |
|-------|----------------------------------|-----------------------------------------------------------------|
| 0     | [Hello](#hello)                  | Ответ на рукопожатие сервера                                   |
| 1     | Data                             | То же самое, что и [данные клиента](./client.md#data)             |
| 2     | [Exception](#exception)          | Исключение при обработке запроса                               |
| 3     | [Progress](#progress)            | Прогресс запроса                                               |
| 4     | [Pong](#pong)                    | Ответ на ping                                                  |
| 5     | [EndOfStream](#end-of-stream)    | Все пакеты были переданы                                       |
| 6     | [ProfileInfo](#profile-info)     | Данные профилирования                                          |
| 7     | Totals                           | Итоговые значения                                             |
| 8     | Extremes                         | Экстремальные значения (мин, макс)                             |
| 9     | TablesStatusResponse             | Ответ на запрос TableStatus                                   |
| 10    | [Log](#log)                      | Журнал системных запросов                                     |
| 11    | TableColumns                     | Описание колонок                                             |
| 12    | UUIDs                            | Список уникальных идентификаторов частей                      |
| 13    | ReadTaskRequest                  | Строка (UUID) описывает запрос, для которого требуется следующая задача |
| 14    | [ProfileEvents](#profile-events) | Пакет с профилирующими событиями от сервера                  |

Пакеты `Data`, `Totals` и `Extremes` могут быть сжаты.

## Hello {#hello}

Ответ на [приветствие клиента](./client.md#hello).

| field         | type    | value           | description          |
|---------------|---------|-----------------|----------------------|
| name          | String  | `Clickhouse`    | Имя сервера          |
| version_major | UVarInt | `21`            | Основная версия сервера |
| version_minor | UVarInt | `12`            | Минорная версия сервера  |
| revision      | UVarInt | `54452`         | Ревизия сервера      |
| tz            | String  | `Europe/Moscow` | Часовой пояс сервера |
| display_name  | String  | `Clickhouse`    | Имя сервера в UI     |
| version_patch | UVarInt | `3`             | Версия патча сервера |

## Exception {#exception}

Исключение сервера во время обработки запроса.

| field       | type   | value                                  | description                  |
|-------------|--------|----------------------------------------|------------------------------|
| code        | Int32  | `60`                                   | Смотрите [ErrorCodes.cpp][codes]. |
| name        | String | `DB::Exception`                        | Основная версия сервера      |
| message     | String | `DB::Exception: Таблица X не существует` | Минорная версия сервера      |
| stack_trace | String | ~                                      | Стек вызовов C++            |
| nested      | Bool   | `true`                                 | Больше ошибок                |

Может быть непрерывный список исключений до тех пор, пока `nested` не будет `false`.

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "Список кодов ошибок"

## Progress {#progress}

Прогресс выполнения запроса, периодически сообщаемый сервером.

:::tip
Прогресс сообщается в **дельтах**. Для итогов накапливайте его на клиенте.
:::

| field       | type    | value    | description       |
|-------------|---------|----------|-------------------|
| rows        | UVarInt | `65535`  | Количество строк   |
| bytes       | UVarInt | `871799` | Количество байт    |
| total_rows  | UVarInt | `0`      | Всего строк        |
| wrote_rows  | UVarInt | `0`      | Строки от клиента  |
| wrote_bytes | UVarInt | `0`      | Байты от клиента   |

## Pong {#pong}

Ответ на [ping клиента](./client.md#ping), без тела пакета.

## End of stream {#end-of-stream}

Больше пакетов **Data** не будет отправлено, результат запроса полностью передан от сервера к клиенту.

Нет тела пакета.

## Profile info {#profile-info}

| field                        | type    |
|------------------------------|---------|
| rows                         | UVarInt |
| blocks                       | UVarInt |
| bytes                        | UVarInt |
| applied_limit                | Bool    |
| rows_before_limit            | UVarInt |
| calculated_rows_before_limit | Bool    |

## Log {#log}

**Блок данных** с журналом сервера.

:::tip
Закодирован как **блок данных** колонок, но никогда не сжимается.
:::

| column     | type     |
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

**Блок данных** с профилирующими событиями.

:::tip
Закодирован как **блок данных** колонок, но никогда не сжимается.

Тип `value` - это `UInt64` или `Int64`, в зависимости от ревизии сервера.
:::


| column       | type            |
|--------------|-----------------|
| host_name    | String          |
| current_time | DateTime        |
| thread_id    | UInt64          |
| type         | Int8            |
| name         | String          |
| value        | UInt64 or Int64 |
