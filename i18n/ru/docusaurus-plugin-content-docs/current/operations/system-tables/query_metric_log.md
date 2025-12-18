---
description: 'Системная таблица, содержащая историю значений использования памяти и метрик из таблицы `system.events` для отдельных запросов, периодически записываемую на диск.'
keywords: ['системная таблица', 'query_metric_log']
slug: /operations/system-tables/query_metric_log
title: 'system.query_metric_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.query&#95;metric&#95;log {#systemquery&#95;metric&#95;log}

<SystemTableCloud />

Содержит историю значений использования памяти и метрик из таблицы `system.events` для отдельных запросов, периодически сбрасываемую на диск.

После запуска запроса данные собираются с периодичностью `query_metric_log_interval` миллисекунд (по умолчанию — 1000). Данные также собираются при завершении запроса, если он выполняется дольше, чем `query_metric_log_interval`.

Столбцы:

* `query_id` ([String](../../sql-reference/data-types/string.md)) — идентификатор запроса.
* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя хоста сервера, выполняющего запрос.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — дата события.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — время события.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — время события с точностью до микросекунд.

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

* [параметр query&#95;metric&#95;log](../../operations/server-configuration-parameters/settings.md#query_metric_log) — включение и выключение параметра.
* [query&#95;metric&#95;log&#95;interval](../../operations/settings/settings.md#query_metric_log_interval)
* [system.asynchronous&#95;metrics](../../operations/system-tables/asynchronous_metrics.md) — содержит периодически вычисляемые метрики.
* [system.events](/operations/system-tables/events) — содержит ряд произошедших событий.
* [system.metrics](../../operations/system-tables/metrics.md) — содержит мгновенно вычисляемые метрики.
* [Мониторинг](../../operations/monitoring.md) — основные принципы мониторинга ClickHouse.
