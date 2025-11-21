---
slug: /native-protocol/server
sidebar_position: 3
title: 'Пакеты сервера'
description: 'Сервер нативного протокола'
doc_type: 'reference'
keywords: ['нативный протокол', 'протокол TCP', 'клиент-сервер', 'спецификация протокола', 'сетевое взаимодействие']
---



# Пакеты сервера

| value | name                             | description                                                     |
|-------|----------------------------------|-----------------------------------------------------------------|
| 0     | [Hello](#hello)                  | Ответ сервера при установлении соединения                       |
| 1     | Data                             | То же, что и [клиентские данные](./client.md#data)              |
| 2     | [Exception](#exception)          | Исключение при обработке запроса                               |
| 3     | [Progress](#progress)            | Прогресс выполнения запроса                                    |
| 4     | [Pong](#pong)                    | Ответ на ping-запрос                                            |
| 5     | [EndOfStream](#end-of-stream)    | Все пакеты были переданы                                        |
| 6     | [ProfileInfo](#profile-info)     | Данные профилирования                                           |
| 7     | Totals                           | Итоговые значения                                               |
| 8     | Extremes                         | Экстремальные значения (min, max)                              |
| 9     | TablesStatusResponse             | Ответ на запрос TableStatus                                     |
| 10    | [Log](#log)                      | Системный журнал запросов                                      |
| 11    | TableColumns                     | Описание столбцов                                               |
| 12    | UUIDs                            | Список уникальных идентификаторов частей                        |
| 13    | ReadTaskRequest                  | Строка (UUID), описывающая запрос, для которого требуется следующая задача |
| 14    | [ProfileEvents](#profile-events) | Пакет с событиями профилирования от сервера                     |

Пакеты `Data`, `Totals` и `Extremes` могут быть сжаты.



## Hello {#hello}

Ответ на [client hello](./client.md#hello).

| field         | type    | value           | description                |
| ------------- | ------- | --------------- | -------------------------- |
| name          | String  | `Clickhouse`    | Имя сервера                |
| version_major | UVarInt | `21`            | Основная версия сервера    |
| version_minor | UVarInt | `12`            | Дополнительная версия сервера    |
| revision      | UVarInt | `54452`         | Ревизия сервера            |
| tz            | String  | `Europe/Moscow` | Часовой пояс сервера       |
| display_name  | String  | `Clickhouse`    | Отображаемое имя сервера   |
| version_patch | UVarInt | `3`             | Версия патча сервера       |


## Exception {#exception}

Исключение сервера при обработке запроса.

| field       | type   | value                                  | description                  |
| ----------- | ------ | -------------------------------------- | ---------------------------- |
| code        | Int32  | `60`                                   | См. [ErrorCodes.cpp][codes]. |
| name        | String | `DB::Exception`                        | Основная версия сервера      |
| message     | String | `DB::Exception: Table X doesn't exist` | Дополнительная версия сервера |
| stack_trace | String | ~                                      | Трассировка стека C++        |
| nested      | Bool   | `true`                                 | Вложенные ошибки             |

Может содержать непрерывный список исключений, пока значение `nested` не станет `false`.

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "Список кодов ошибок"


## Прогресс {#progress}

Прогресс выполнения запроса периодически сообщается сервером.

:::tip
Прогресс сообщается в виде **дельт**. Для получения итоговых значений накапливайте их на клиенте.
:::

| поле        | тип     | значение | описание          |
| ----------- | ------- | -------- | ----------------- |
| rows        | UVarInt | `65535`  | Количество строк  |
| bytes       | UVarInt | `871799` | Количество байтов |
| total_rows  | UVarInt | `0`      | Всего строк       |
| wrote_rows  | UVarInt | `0`      | Строк от клиента  |
| wrote_bytes | UVarInt | `0`      | Байтов от клиента |


## Pong {#pong}

Ответ на [ping клиента](./client.md#ping), без тела пакета.


## Конец потока {#end-of-stream}

Больше не будет отправлено пакетов **Data**, результат запроса полностью передан с сервера клиенту.

Тело пакета отсутствует.


## Информация профиля {#profile-info}

| поле                         | тип     |
| ---------------------------- | ------- |
| rows                         | UVarInt |
| blocks                       | UVarInt |
| bytes                        | UVarInt |
| applied_limit                | Bool    |
| rows_before_limit            | UVarInt |
| calculated_rows_before_limit | Bool    |


## Log {#log}

**Блок данных** с журналом сервера.

:::tip
Кодируется как **блок данных** из столбцов, но никогда не сжимается.
:::

| столбец    | тип      |
| ---------- | -------- |
| time       | DateTime |
| time_micro | UInt32   |
| host_name  | String   |
| query_id   | String   |
| thread_id  | UInt64   |
| priority   | Int8     |
| source     | String   |
| text       | String   |


## События профилирования {#profile-events}

**Блок данных** с событиями профилирования.

:::tip
Кодируется как **блок данных** из столбцов, но никогда не сжимается.

Тип `value` — `UInt64` или `Int64`, в зависимости от ревизии сервера.
:::

| столбец      | тип             |
| ------------ | --------------- |
| host_name    | String          |
| current_time | DateTime        |
| thread_id    | UInt64          |
| type         | Int8            |
| name         | String          |
| value        | UInt64 или Int64 |
