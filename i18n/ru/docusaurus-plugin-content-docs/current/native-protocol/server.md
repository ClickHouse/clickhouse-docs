---
slug: /native-protocol/server
sidebar_position: 3
title: 'Пакеты сервера'
description: 'Сервер нативного протокола'
---


# Пакеты сервера

| значение | название                        | описание                                                       |
|----------|---------------------------------|---------------------------------------------------------------|
| 0        | [Hello](#hello)                | Ответ на рукопожатие сервера                                 |
| 1        | Data                            | То же самое, что и [данные клиента](./client.md#data)           |
| 2        | [Exception](#exception)         | Исключение при обработке запроса                             |
| 3        | [Progress](#progress)           | Прогресс запроса                                             |
| 4        | [Pong](#pong)                   | Ответ на ping                                               |
| 5        | [EndOfStream](#end-of-stream)  | Все пакеты были переданы                                     |
| 6        | [ProfileInfo](#profile-info)    | Данные профилирования                                        |
| 7        | Totals                          | Общие значения                                              |
| 8        | Extremes                        | Экстремальные значения (минимум, максимум)                   |
| 9        | TablesStatusResponse            | Ответ на запрос TableStatus                                  |
| 10       | [Log](#log)                     | Системный журнал запросов                                    |
| 11       | TableColumns                    | Описание столбцов                                           |
| 12       | UUIDs                           | Список уникальных идентификаторов частей                     |
| 13       | ReadTaskRequest                 | Строка (UUID), описывающая запрос, для которого требуется следующая задача |
| 14       | [ProfileEvents](#profile-events)| Пакет с событиями профилирования от сервера                 |

Пакеты `Data`, `Totals` и `Extremes` могут быть сжаты.

## Hello {#hello}

Ответ на [hello клиента](./client.md#hello).

| поле          | тип      | значение        | описание               |
|---------------|----------|-----------------|-----------------------|
| name          | String   | `Clickhouse`    | Имя сервера           |
| version_major | UVarInt  | `21`            | Основная версия сервера|
| version_minor | UVarInt  | `12`            | Минорная версия сервера|
| revision      | UVarInt  | `54452`         | Ревизия сервера       |
| tz            | String   | `Europe/Moscow` | Часовой пояс сервера  |
| display_name  | String   | `Clickhouse`    | Имя сервера для интерфейса |
| version_patch | UVarInt  | `3`             | Версия патча сервера  |

## Exception {#exception}

Исключение сервера во время обработки запроса.

| поле        | тип     | значение                                   | описание                 |
|-------------|---------|-------------------------------------------|-------------------------|
| code        | Int32   | `60`                                      | См. [ErrorCodes.cpp][codes]. |
| name        | String  | `DB::Exception`                           | Основная версия сервера |
| message     | String  | `DB::Exception: Таблица X не существует` | Минорная версия сервера |
| stack_trace | String  | ~                                         | C++ стек вызовов       |
| nested      | Bool    | `true`                                    | Более подробная ошибка  |

Может быть непрерывный список исключений до тех пор, пока `nested` равно `false`.

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "Список кодов ошибок"

## Progress {#progress}

Прогресс выполнения запроса, периодически сообщаемый сервером.

:::tip
Прогресс сообщается в **дельтах**. Для итогов накапливайте их на клиенте.
:::

| поле        | тип     | значение   | описание          |
|-------------|---------|------------|-------------------|
| rows        | UVarInt | `65535`    | Количество строк   |
| bytes       | UVarInt | `871799`   | Количество байт    |
| total_rows  | UVarInt | `0`        | Всего строк       |
| wrote_rows  | UVarInt | `0`        | Строки от клиента |
| wrote_bytes | UVarInt | `0`        | Байты от клиента  |

## Pong {#pong}

Ответ на [ping клиента](./client.md#ping), без тела пакета.

## Конец потока {#end-of-stream}

Больше ни один **Data** пакет не будет отправлен, результат запроса полностью передан от сервера к клиенту.

Без тела пакета.

## Информация о профиле {#profile-info}

| поле                         | тип     |
|------------------------------|---------|
| rows                         | UVarInt |
| blocks                       | UVarInt |
| bytes                        | UVarInt |
| applied_limit                | Bool    |
| rows_before_limit            | UVarInt |
| calculated_rows_before_limit | Bool    |

## Журнал {#log}

**Блок данных** с журналом сервера.

:::tip
Закодирован как **блок данных** столбцов, но никогда не сжимается.
:::

| столбец    | тип      |
|------------|----------|
| time       | DateTime |
| time_micro | UInt32   |
| host_name  | String   |
| query_id   | String   |
| thread_id  | UInt64   |
| priority   | Int8     |
| source     | String   |
| text       | String   |

## События профиля {#profile-events}

**Блок данных** с событиями профилирования.

:::tip
Закодирован как **блок данных** столбцов, но никогда не сжимается.

Тип `value` - это `UInt64` или `Int64`, в зависимости от ревизии сервера.
:::

| столбец       | тип              |
|---------------|------------------|
| host_name     | String           |
| current_time  | DateTime         |
| thread_id     | UInt64           |
| type          | Int8             |
| name          | String           |
| value         | UInt64 или Int64 |
