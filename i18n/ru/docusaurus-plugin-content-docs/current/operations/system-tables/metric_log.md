---
description: 'Системная таблица, содержащая историю значений метрик из таблиц `system.metrics` и `system.events`, периодически сбрасываемая на диск.'
keywords: ['системная таблица', 'metric_log']
slug: /operations/system-tables/metric_log
title: 'system.metric_log'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.metric_log

<SystemTableCloud/>

Содержит историю значений метрик из таблиц `system.metrics` и `system.events`, периодически сбрасываемую на диск.

Колонки:
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата события.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время события.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время события с разрешением в микросекундах.

**Пример**

```sql
SELECT * FROM system.metric_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                                                        clickhouse.eu-central1.internal
event_date:                                                      2020-09-05
event_time:                                                      2020-09-05 16:22:33
event_time_microseconds:                                         2020-09-05 16:22:33.196807
milliseconds:                                                    196
ProfileEvent_Query:                                              0
ProfileEvent_SelectQuery:                                        0
ProfileEvent_InsertQuery:                                        0
ProfileEvent_FailedQuery:                                        0
ProfileEvent_FailedSelectQuery:                                  0
...
...
CurrentMetric_Revision:                                          54439
CurrentMetric_VersionInteger:                                    20009001
CurrentMetric_RWLockWaitingReaders:                              0
CurrentMetric_RWLockWaitingWriters:                              0
CurrentMetric_RWLockActiveReaders:                               0
CurrentMetric_RWLockActiveWriters:                               0
CurrentMetric_GlobalThread:                                      74
CurrentMetric_GlobalThreadActive:                                26
CurrentMetric_LocalThread:                                       0
CurrentMetric_LocalThreadActive:                                 0
CurrentMetric_DistributedFilesToInsert:                          0
```

**Смотрите также**

- [metric_log setting](../../operations/server-configuration-parameters/settings.md#metric_log) — Включение и отключение параметра.
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — Содержит периодически вычисляемые метрики.
- [system.events](/operations/system-tables/events) — Содержит ряд произошедших событий.
- [system.metrics](../../operations/system-tables/metrics.md) — Содержит мгновенно вычисляемые метрики.
- [Мониторинг](../../operations/monitoring.md) — Основные концепции мониторинга ClickHouse.
