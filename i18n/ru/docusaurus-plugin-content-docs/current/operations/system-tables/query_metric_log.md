---
description: 'Системная таблица, содержащая историю значений памяти и метрик из таблицы
  `system.events` для отдельных запросов, периодически сбрасываемая на диск.'
keywords: ['системная таблица', 'query_metric_log']
slug: /operations/system-tables/query_metric_log
title: 'system.query_metric_log'
---

import SystemTableCloud from '@site/i18n/ru/current/_snippets/_system_table_cloud.md';


# system.query_metric_log

<SystemTableCloud/>

Содержит историю значений памяти и метрик из таблицы `system.events` для отдельных запросов, периодически сбрасываемую на диск.

После того как запрос начинается, данные собираются через определённые интервалы времени в миллисекундах `query_metric_log_interval` (по умолчанию установлено значение 1000). Данные также собираются, когда запрос завершается, если он занимает больше времени, чем `query_metric_log_interval`.

Столбцы:
- `query_id` ([String](../../sql-reference/data-types/string.md)) — ID запроса.
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата события.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время события.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время события с разрешением в микросекундах.

**Пример**

```sql
SELECT * FROM system.query_metric_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
query_id:                                                        97c8ba04-b6d4-4bd7-b13e-6201c5c6e49d
hostname:                                                        clickhouse.eu-central1.internal
event_date:                                                      2020-09-05
event_time:                                                      2020-09-05 16:22:33
event_time_microseconds:                                         2020-09-05 16:22:33.196807
memory_usage:                                                    313434219
peak_memory_usage:                                               598951986
ProfileEvent_Query:                                              0
ProfileEvent_SelectQuery:                                        0
ProfileEvent_InsertQuery:                                        0
ProfileEvent_FailedQuery:                                        0
ProfileEvent_FailedSelectQuery:                                  0
...
```

**См. также**

- [query_metric_log setting](../../operations/server-configuration-parameters/settings.md#query_metric_log) — Включение и отключение настройки.
- [query_metric_log_interval](../../operations/settings/settings.md#query_metric_log_interval)
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — Содержит периодически рассчитываемые метрики.
- [system.events](/operations/system-tables/events) — Содержит ряд произошедших событий.
- [system.metrics](../../operations/system-tables/metrics.md) — Содержит мгновенно рассчитываемые метрики.
- [Monitoring](../../operations/monitoring.md) — Основные концепции мониторинга ClickHouse.
