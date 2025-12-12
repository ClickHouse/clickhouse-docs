---
description: 'Эта таблица содержит многомерные метрики, которые могут быть мгновенно вычислены и экспортированы в формате Prometheus. Она всегда содержит актуальные данные.'
keywords: ['system table', 'dimensional_metrics']
slug: /operations/system-tables/dimensional_metrics
title: 'system.dimensional_metrics'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# dimensional&#95;metrics {#dimensional_metrics}

<SystemTableCloud />

Эта таблица содержит размерные метрики, которые могут быть мгновенно вычислены и экспортированы в формате Prometheus. Она всегда содержит актуальные данные.

Столбцы:

* `metric` ([String](../../sql-reference/data-types/string.md)) — Имя метрики.
* `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — Значение метрики.
* `description` ([String](../../sql-reference/data-types/string.md)) — Описание метрики.
* `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — Метки метрики.
* `name` ([String](../../sql-reference/data-types/string.md)) — Псевдоним для `metric`.

**Пример**

Вы можете использовать следующий запрос, чтобы экспортировать все размерные метрики в формате Prometheus.

```sql
SELECT
  metric AS name,
  toFloat64(value) AS value,
  description AS help,
  labels,
  'gauge' AS type
FROM system.dimensional_metrics
FORMAT Prometheus
```

## Описание метрик {#metric_descriptions}

### merge_failures {#merge_failures}
Общее количество неудачных слияний с момента запуска.

### startup_scripts_failure_reason {#startup_scripts_failure_reason}
Отражает причины ошибок стартовых скриптов по типу ошибки. При неудачном выполнении стартового скрипта устанавливается в 1, при этом в метке указывается имя ошибки.

### merge_tree_parts {#merge_tree_parts}
Количество частей данных MergeTree с метками, указывающими состояние части, тип части и то, является ли она частью проекции.

**См. также**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — Содержит периодически вычисляемые метрики.
- [system.events](/operations/system-tables/events) — Содержит количество произошедших событий.
- [system.metric_log](/operations/system-tables/metric_log) — Содержит историю значений метрик таблиц `system.metrics` и `system.events`.
- [Monitoring](../../operations/monitoring.md) — Основные концепции мониторинга ClickHouse.
