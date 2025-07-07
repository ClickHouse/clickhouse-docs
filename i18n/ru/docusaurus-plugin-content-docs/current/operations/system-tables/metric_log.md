---
description: 'Системная таблица, содержащая историю значений метрик из таблиц `system.metrics` и `system.events`, периодически записываемых на диск.'
keywords: ['system table', 'metric_log']
slug: /operations/system-tables/metric_log
title: 'system.metric_log'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.metric_log

<SystemTableCloud/>

Содержит историю значений метрик из таблиц `system.metrics` и `system.events`, периодически записываемых на диск.

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

**Схема**
Эта таблица может быть настроена с использованием различных типов схем с помощью XML-тега `<schema_type>`. Тип схемы по умолчанию — `wide`, где каждая метрика или событие профиля хранятся в отдельной колонке. Эта схема является наиболее производительной и эффективной для чтений из одной колонки.

Схема `transposed` хранит данные в формате, аналогичном `system.asynchronous_metric_log`, где метрики и события хранятся как строки. Эта схема полезна для малоресурсных конфигураций, поскольку снижает потребление ресурсов во время слияний.

Существует также схема совместимости, `transposed_with_wide_view`, которая хранит фактические данные в таблице с транспонированной схемой (`system.transposed_metric_log`) и создает представление на ее основе с использованием широкой схемы. Это представление выполняет запросы к транспонированной таблице, что делает его полезным для миграции от широкой схемы к транспонированной.

**См. также**

- [metric_log setting](../../operations/server-configuration-parameters/settings.md#metric_log) — Включение и отключение настройки.
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — Содержит периодически рассчитываемые метрики.
- [system.events](/operations/system-tables/events) — Содержит ряд произошедших событий.
- [system.metrics](../../operations/system-tables/metrics.md) — Содержит мгновенно рассчитанные метрики.
- [Monitoring](../../operations/monitoring.md) — Основные концепции мониторинга ClickHouse.
