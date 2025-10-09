---
slug: '/operations/system-tables/view_refreshes'
description: 'Системная таблица, содержащая информацию об обновляемых материализованных'
title: system.view_refreshes
keywords: ['системная таблица', 'view_refreshes']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.view_refreshes

<SystemTableCloud/>

Информация о [Обновляемых Материализованных Представлениях](../../sql-reference/statements/create/view.md#refreshable-materialized-view). Содержит все обновляемые материализованные представления, независимо от того, находится ли в данный момент в процессе обновления.

Столбцы:

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя базы данных, в которой находится таблица.
- `view` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы.
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — UUID таблицы (атомарная база данных).
- `status` ([String](../../sql-reference/data-types/string.md)) — Текущий статус обновления.
- `last_success_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Время, когда началось последнее успешное обновление. NULL, если обновления не проводились с момента запуска сервера или создания таблицы.
- `last_success_duration_ms` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Время, затраченное на последнее обновление.
- `last_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Время, когда завершилась последняя попытка обновления (если известно) или когда началась (если неизвестно или все еще выполняется). NULL, если попытки обновления не проводились с момента запуска сервера или создания таблицы.
- `last_refresh_replica` ([String](../../sql-reference/data-types/string.md)) — Если включена координация, имя реплики, которая сделала текущую (если выполняется) или предыдущую (если не выполняется) попытку обновления.
- `next_refresh_time` ([Nullable](../../sql-reference/data-types/nullable.md)([DateTime](../../sql-reference/data-types/datetime.md))) — Время, в которое запланировано начало следующего обновления, если статус = Запланировано.
- `exception` ([String](../../sql-reference/data-types/string.md)) — Сообщение об ошибке из предыдущей попытки, если она завершилась неудачей.
- `retry` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество неудачных попыток до сих пор для текущего обновления.
- `progress` ([Float64](../../sql-reference/data-types/float.md)) — Прогресс текущего обновления, от 0 до 1. Недоступно, если статус `RunningOnAnotherReplica`.
- `read_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк, прочитанных текущим обновлением на данный момент. Недоступно, если статус `RunningOnAnotherReplica`.
- `read_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество байт, прочитанных во время текущего обновления. Недоступно, если статус `RunningOnAnotherReplica`.
- `total_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Ориентировочное общее количество строк, которые необходимо прочитать для текущего обновления. Недоступно, если статус `RunningOnAnotherReplica`.
- `written_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество строк, записанных во время текущего обновления. Недоступно, если статус `RunningOnAnotherReplica`.
- `written_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество байт, записанных во время текущего обновления. Недоступно, если статус `RunningOnAnotherReplica`.

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