---
description: 'Системная таблица, содержащая историю значений метрик таблиц `system.metrics`
  и `system.events`, которые периодически сбрасываются на диск.'
keywords: ['системная таблица', 'metric_log']
slug: /operations/system-tables/metric_log
title: 'system.metric_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.metric&#95;log {#systemmetric&#95;log}

<SystemTableCloud />

Содержит историю значений метрик из таблиц `system.metrics` и `system.events`, которые периодически сбрасываются на диск.

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
Эта таблица может быть настроена с разными типами схем с помощью XML-тега `<schema_type>`. Тип схемы по умолчанию — `wide`, при котором каждая метрика или событие профилирования хранятся в отдельном столбце. Такая схема является наиболее производительной и эффективной для операций чтения отдельных столбцов.

Схема `transposed` хранит данные в формате, аналогичном `system.asynchronous_metric_log`, где метрики и события хранятся в строках. Эта схема полезна для конфигураций с ограниченными ресурсами, так как снижает потребление ресурсов во время слияний.

**См. также**

* [настройка metric&#95;log](../../operations/server-configuration-parameters/settings.md#metric_log) — Включение и отключение настройки.
* [system.asynchronous&#95;metrics](../../operations/system-tables/asynchronous_metrics.md) — Содержит периодически вычисляемые метрики.
* [system.events](/operations/system-tables/events) — Содержит счетчики произошедших событий.
* [system.metrics](../../operations/system-tables/metrics.md) — Содержит моментально вычисляемые метрики.
* [Мониторинг](../../operations/monitoring.md) — Базовые концепции мониторинга ClickHouse.
