---
description: 'Системная таблица, содержащая историю значений метрик из таблиц `system.metrics`
  и `system.events` и периодически записываемая на диск.'
keywords: ['системная таблица', 'metric_log']
slug: /operations/system-tables/metric_log
title: 'system.metric_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.metric&#95;log

<SystemTableCloud />

Содержит историю значений метрик из таблиц `system.metrics` и `system.events`, которая периодически записывается на диск.

Столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя хоста сервера, на котором выполняется запрос.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — дата события.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — время события.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — время события с точностью до микросекунд.

**Пример**

```sql
SELECT * FROM system.metric_log LIMIT 1 FORMAT Vertical;
```

```text
Строка 1:
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
Эта таблица может быть настроена с различными типами схем с использованием XML-тега `<schema_type>`. Тип схемы по умолчанию — `wide`, при котором каждая метрика или событие профиля хранится в отдельном столбце. Эта схема обеспечивает наилучшую производительность и эффективность при чтении отдельных столбцов.

Схема `transposed` хранит данные в формате, аналогичном `system.asynchronous_metric_log`, где метрики и события хранятся в строках. Эта схема полезна для конфигураций с ограниченными ресурсами, поскольку снижает потребление ресурсов при слияниях.

Также существует схема совместимости `transposed_with_wide_view`, которая хранит фактические данные в таблице с транспонированной схемой (`system.transposed_metric_log`) и создаёт поверх неё представление, использующее широкую схему. Это представление запрашивает транспонированную таблицу, что полезно при миграции со схемы `wide` на схему `transposed`.

**См. также**

* [настройка metric&#95;log](../../operations/server-configuration-parameters/settings.md#metric_log) — Включение и отключение настройки.
* [system.asynchronous&#95;metrics](../../operations/system-tables/asynchronous_metrics.md) — Содержит периодически вычисляемые метрики.
* [system.events](/operations/system-tables/events) — Содержит количество произошедших событий.
* [system.metrics](../../operations/system-tables/metrics.md) — Содержит мгновенно вычисляемые метрики.
* [Мониторинг](../../operations/monitoring.md) — Базовые концепции мониторинга ClickHouse.
