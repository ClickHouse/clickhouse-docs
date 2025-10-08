---
slug: '/operations/system-tables/events'
description: 'Системная таблица, содержащая информацию о количестве событий, которые'
title: system.events
keywords: ['системная таблица', 'события']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о количестве событий, произошедших в системе. Например, в таблице вы можете найти, сколько `SELECT` запросов было обработано с момента запуска сервера ClickHouse.

Столбцы:

- `event` ([String](../../sql-reference/data-types/string.md)) — имя события.
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — количество произошедших событий.
- `description` ([String](../../sql-reference/data-types/string.md)) — описание события.
- `name` ([String](../../sql-reference/data-types/string.md)) — псевдоним для `event`.

Вы можете найти все поддерживаемые события в исходном файле [src/Common/ProfileEvents.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/ProfileEvents.cpp).

**Пример**

```sql
SELECT * FROM system.events LIMIT 5
```

```text
┌─event─────────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Query                                 │    12 │ Number of queries to be interpreted and potentially executed. Does not include queries that failed to parse or were rejected due to AST size limits, quota limits or limits on the number of simultaneously running queries. May include internal queries initiated by ClickHouse itself. Does not count subqueries.                  │
│ SelectQuery                           │     8 │ Same as Query, but only for SELECT queries.                                                                                                                                                                                                                │
│ FileOpen                              │    73 │ Number of files opened.                                                                                                                                                                                                                                    │
│ ReadBufferFromFileDescriptorRead      │   155 │ Number of reads (read/pread) from a file descriptor. Does not include sockets.                                                                                                                                                                             │
│ ReadBufferFromFileDescriptorReadBytes │  9931 │ Number of bytes read from file descriptors. If the file is compressed, this will show the compressed data size.                                                                                                                                              │
└───────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**См. также**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — Содержит периодически рассчитываемые метрики.
- [system.metrics](/operations/system-tables/metrics) — Содержит мгновенно рассчитываемые метрики.
- [system.metric_log](/operations/system-tables/metric_log) — Содержит историю значений метрик из таблиц `system.metrics` и `system.events`.
- [Monitoring](../../operations/monitoring.md) — Основные концепции мониторинга ClickHouse.