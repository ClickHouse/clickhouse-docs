---
description: 'Системная таблица, содержащая информацию о обновляемых материализованных представлениях.'
keywords: ['системная таблица', 'view_refreshes']
slug: /operations/system-tables/view_refreshes
title: 'system.view_refreshes'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.view_refreshes

<SystemTableCloud/>

Информация о [обновляемых материализованных представлениях](../../sql-reference/statements/create/view.md#refreshable-materialized-view). Содержит все обновляемые материализованные представления, независимо от того, происходит ли в данный момент обновление или нет.

Столбцы:

- `database` ([String](../../sql-reference/data-types/string.md)) — Название базы данных, в которой находится таблица.
- `view` ([String](../../sql-reference/data-types/string.md)) — Название таблицы.
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID таблицы (атомарная база данных).
- `status` ([String](../../sql-reference/data-types/string.md)) — Текущая состояние обновления.
- `last_success_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Время, когда началось последнее успешное обновление. NULL, если успешных обновлений не было с момента старта сервера или создания таблицы.
- `last_success_duration_ms` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Как долго длилось последнее обновление.
- `last_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Время, когда завершилась последняя попытка обновления (если известно) или началась (если неизвестно или всё ещё выполняется). NULL, если попытки обновления не происходили с момента старта сервера или создания таблицы.
- `last_refresh_replica` ([String](../../sql-reference/data-types/string.md)) — Если включена координация, имя реплики, которая сделала текущее (если выполняется) или предыдущее (если не выполняется) обновление.
- `next_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Время, в которое запланировано следующее обновление, если статус = Запланировано.
- `exception` ([String](../../sql-reference/data-types/string.md)) — Сообщение об ошибке от предыдущей попытки, если она завершилась неудачей.
- `retry` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Какое количество неудачных попыток было до сих пор, для текущего обновления.
- `progress` ([Float64](../../sql-reference/data-types/float.md)) — Процесс текущего обновления, от 0 до 1. Не доступен, если статус `RunningOnAnotherReplica`.
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк, прочитанных текущим обновлением на данный момент. Не доступно, если статус `RunningOnAnotherReplica`.
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество байтов, прочитанных во время текущего обновления. Не доступно, если статус `RunningOnAnotherReplica`.
- `total_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Оценочное общее количество строк, которые необходимо прочитать текущему обновлению. Не доступно, если статус `RunningOnAnotherReplica`.
- `written_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк, записанных во время текущего обновления. Не доступно, если статус `RunningOnAnotherReplica`.
- `written_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество байтов, записанных во время текущего обновления. Не доступно, если статус `RunningOnAnotherReplica`.

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
│ default  │ hello_documentation_reader │ Запланировано │ Завершено            │ 2023-12-01 01:24:00 │ 2023-12-01 01:25:00 │
└──────────┴────────────────────────────┴───────────┴─────────────────────┴─────────────────────┴─────────────────────┘
```
