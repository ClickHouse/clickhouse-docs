---
description: 'Системная таблица, содержащая информацию об обновляемых материализованных представлениях.'
keywords: ['системная таблица', 'view_refreshes']
slug: /operations/system-tables/view_refreshes
title: 'system.view_refreshes'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.view_refreshes

<SystemTableCloud/>

Информация об [обновляемых материализованных представлениях](../../sql-reference/statements/create/view.md#refreshable-materialized-view). Содержит все обновляемые материализованные представления, независимо от того, идет ли в данный момент обновление или нет.

Столбцы:

- `database` ([String](../../sql-reference/data-types/string.md)) — Название базы данных, в которой находится таблица.
- `view` ([String](../../sql-reference/data-types/string.md)) — Название таблицы.
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID таблицы (атомарная база данных).
- `status` ([String](../../sql-reference/data-types/string.md)) — Текущая состояние обновления.
- `last_success_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Время начала последнего успешного обновления. NULL, если с момента старта сервера или создания таблицы успешных обновлений не было.
- `last_success_duration_ms` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Сколько времени заняло последнее обновление.
- `last_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Время окончания последней попытки обновления (если известно) или начала (если неизвестно или все еще выполняется). NULL, если с момента старта сервера или создания таблицы обновлений не было.
- `last_refresh_replica` ([String](../../sql-reference/data-types/string.md)) — Если координация включена, имя реплики, которая сделала текущую (если выполняется) или предыдущую (если не выполняется) попытку обновления.
- `next_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Время, когда запланировано следующее обновление, если статус = Запланировано.
- `exception` ([String](../../sql-reference/data-types/string.md)) — Сообщение об ошибке из предыдущей попытки, если она не удалась.
- `retry` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Сколько неудачных попыток было до сих пор для текущего обновления.
- `progress` ([Float64](../../sql-reference/data-types/float.md)) — Прогресс текущего обновления, от 0 до 1. Не доступен, если статус `РаботаетНаДругойРеплике`.
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк, прочитанных в текущем обновлении на данный момент. Не доступно, если статус `РаботаетНаДругойРеплике`.
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество байт, прочитанных во время текущего обновления. Не доступно, если статус `РаботаетНаДругойРеплике`.
- `total_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Оценочное общее количество строк, которые нужно прочитать для текущего обновления. Не доступно, если статус `РаботаетНаДругойРеплике`.
- `written_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк, записанных во время текущего обновления. Не доступно, если статус `РаботаетНаДругойРеплике`.
- `written_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество байт, записанных во время текущего обновления. Не доступно, если статус `РаботаетНаДругойРеплике`.

**Пример**

```sql
SELECT
    database,
    view,
    status,
    last_refresh_result,
    last_refresh_time,
    next_refresh_time
FROM system.view_refreshes

┌─database─┬─view───────────────────────┬─status────┬─last_refresh_result─┬───last_refresh_time─┬───next_refresh_time─┐
│ default  │ hello_documentation_reader │ Scheduled │ Finished            │ 2023-12-01 01:24:00 │ 2023-12-01 01:25:00 │
└──────────┴────────────────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```
