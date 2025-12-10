---
description: 'Системная таблица, содержащая исторические значения для `system.asynchronous_metrics`,
  которые сохраняются один раз за временной интервал (по умолчанию — одну секунду)'
keywords: ['системная таблица', 'asynchronous_metric_log']
slug: /operations/system-tables/asynchronous_metric_log
title: 'system.asynchronous_metric_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud />

Содержит исторические значения таблицы `system.asynchronous_metrics`, которые сохраняются один раз за интервал времени (по умолчанию — каждую секунду). Включена по умолчанию.

Столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя хоста сервера, на котором выполняется запрос.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — дата события.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — время события.
* `metric` ([String](../../sql-reference/data-types/string.md)) — имя метрики.
* `value` ([Float64](../../sql-reference/data-types/float.md)) — значение метрики.

**Пример**

```sql
SELECT * FROM system.asynchronous_metric_log LIMIT 3 \G
```

```text
Row 1:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2023-11-14
event_time: 2023-11-14 14:39:07
metric:     AsynchronousHeavyMetricsCalculationTimeSpent
value:      0.001

Row 2:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2023-11-14
event_time: 2023-11-14 14:39:08
metric:     AsynchronousHeavyMetricsCalculationTimeSpent
value:      0

Row 3:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2023-11-14
event_time: 2023-11-14 14:39:09
metric:     AsynchronousHeavyMetricsCalculationTimeSpent
value:      0
```

**См. также**

* [параметр asynchronous&#95;metric&#95;log](../../operations/server-configuration-parameters/settings.md#asynchronous_metric_log) — включение и отключение параметра.
* [system.asynchronous&#95;metrics](../system-tables/asynchronous_metrics.md) — содержит метрики, периодически вычисляемые в фоновом режиме.
* [system.metric&#95;log](../system-tables/metric_log.md) — содержит историю значений метрик из таблиц `system.metrics` и `system.events`, которая периодически сбрасывается на диск.
