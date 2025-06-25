---
description: 'Системная таблица, содержащая информацию о количестве событий, произошедших в системе.'
keywords: ['системная таблица', 'события']
slug: /operations/system-tables/events
title: 'system.events'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о количестве событий, произошедших в системе. Например, в таблице вы можете узнать, сколько `SELECT` запросов было обработано с момента запуска сервера ClickHouse.

Столбцы:

- `event` ([String](../../sql-reference/data-types/string.md)) — Имя события.
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Количество произошедших событий.
- `description` ([String](../../sql-reference/data-types/string.md)) — Описание события.
- `name` ([String](../../sql-reference/data-types/string.md)) — Псевдоним для `event`.

Вы можете найти все поддерживаемые события в исходном файле [src/Common/ProfileEvents.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/ProfileEvents.cpp).

**Пример**

```sql
SELECT * FROM system.events LIMIT 5
```

```text
┌─event─────────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Query                                 │    12 │ Количество запросов, которые должны быть интерпретированы и потенциально выполнены. Не включает запросы, которые не удалось разобрать или которые были отклонены из-за ограничений по размеру AST, по квотам или по количеству одновременно выполняемых запросов. Может включать внутренние запросы, инициированные самим ClickHouse. Не учитывает подзапросы.                  │
│ SelectQuery                           │     8 │ То же, что и Query, но только для SELECT запросов.                                                                                                                                                                                                                │
│ FileOpen                              │    73 │ Количество открытых файлов.                                                                                                                                                                                                                                    │
│ ReadBufferFromFileDescriptorRead      │   155 │ Количество чтений (read/pread) из дескриптора файла. Не включает сокеты.                                                                                                                                                                             │
│ ReadBufferFromFileDescriptorReadBytes │  9931 │ Количество байт, прочитанных из дескрипторов файлов. Если файл сжат, это будет показывать размер сжатых данных.                                                                                                                                              │
└───────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Смотрите также**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — Содержит периодически вычисляемые метрики.
- [system.metrics](/operations/system-tables/metrics) — Содержит мгновенно вычисляемые метрики.
- [system.metric_log](/operations/system-tables/metric_log) — Содержит историю значений метрик из таблиц `system.metrics` и `system.events`.
- [Мониторинг](../../operations/monitoring.md) — Основные концепции мониторинга ClickHouse.
