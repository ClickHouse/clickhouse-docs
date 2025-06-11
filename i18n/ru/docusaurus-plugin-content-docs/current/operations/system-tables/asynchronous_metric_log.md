---
description: 'Системная таблица, содержащая исторические значения для `system.asynchronous_metrics`,
  которые сохраняются один раз за временной интервал (по умолчанию одна секунда)'
keywords: ['системная таблица', 'asynchronous_metric_log']
slug: /operations/system-tables/asynchronous_metric_log
title: 'system.asynchronous_metric_log'
---

import SystemTableCloud from '@site/i18n/ru/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит исторические значения для `system.asynchronous_metrics`, которые сохраняются один раз за временной интервал (по умолчанию одна секунда). Включено по умолчанию.

Колонки:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата события.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время события.
- `metric` ([String](../../sql-reference/data-types/string.md)) — Имя метрики.
- `value` ([Float64](../../sql-reference/data-types/float.md)) — Значение метрики.

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

**Смотрите также**

- [Настройка asynchronous_metric_log](../../operations/server-configuration-parameters/settings.md#asynchronous_metric_log) — Включение и отключение настройки.
- [system.asynchronous_metrics](../system-tables/asynchronous_metrics.md) — Содержит метрики, рассчитываемые периодически в фоновом режиме.
- [system.metric_log](../system-tables/metric_log.md) — Содержит историю значений метрик из таблиц `system.metrics` и `system.events`, периодически сбрасываемых на диск.
