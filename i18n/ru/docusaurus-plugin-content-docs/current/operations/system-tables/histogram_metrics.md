---
slug: '/operations/system-tables/histogram_metrics'
description: 'Эта таблица содержит гистограммы, которые могут быть рассчитаны мгновенно'
title: system.histogram_metrics
keywords: ['системная таблица', 'метрики_гистограммы']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# histogram_metrics {#histogram_metrics}

<SystemTableCloud/>

Эта таблица содержит гистограммы метрик, которые могут быть рассчитаны мгновенно и экспортированы в формате Prometheus. Она всегда актуальна. Заменяет устаревший `system.latency_log`.

Колонки:

- `metric` ([String](../../sql-reference/data-types/string.md)) — Название метрики.
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — Значение метрики.
- `description` ([String](../../sql-reference/data-types/string.md)) — Описание метрики.
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — Метки метрики.
- `name` ([String](../../sql-reference/data-types/string.md)) — Псевдоним для `metric`.

**Пример**

Вы можете использовать запрос, подобный этому, чтобы экспортировать все гистограммы метрик в формате Prometheus.
```sql
SELECT
  metric AS name,
  toFloat64(value) AS value,
  description AS help,
  labels,
  'histogram' AS type
FROM system.histogram_metrics
FORMAT Prometheus
```

## Metric descriptions {#metric_descriptions}

### keeper_response_time_ms_bucket {#keeper_response_time_ms_bucket}
Время отклика Keeper в миллисекундах.

**См. также**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — Содержит периодически рассчитываемые метрики.
- [system.events](/operations/system-tables/events) — Содержит ряд событий, которые произошли.
- [system.metric_log](/operations/system-tables/metric_log) — Содержит историю значений метрик из таблиц `system.metrics` и `system.events`.
- [Monitoring](../../operations/monitoring.md) — Основные концепции мониторинга ClickHouse.