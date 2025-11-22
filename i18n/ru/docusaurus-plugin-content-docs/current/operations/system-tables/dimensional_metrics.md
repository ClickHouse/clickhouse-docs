---
description: 'Эта таблица содержит многомерные метрики, которые могут быть мгновенно вычислены и экспортированы в формате Prometheus. Данные в ней всегда актуальны.'
keywords: ['системная таблица', 'dimensional_metrics']
slug: /operations/system-tables/dimensional_metrics
title: 'system.dimensional_metrics'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# dimensional_metrics {#dimensional_metrics}

<SystemTableCloud />

Эта таблица содержит многомерные метрики, которые могут быть вычислены мгновенно и экспортированы в формате Prometheus. Данные в таблице всегда актуальны.

Столбцы:

- `metric` ([String](../../sql-reference/data-types/string.md)) — Название метрики.
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — Значение метрики.
- `description` ([String](../../sql-reference/data-types/string.md)) — Описание метрики.
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — Метки метрики.
- `name` ([String](../../sql-reference/data-types/string.md)) — Псевдоним для `metric`.

**Пример**

Для экспорта всех многомерных метрик в формате Prometheus можно использовать следующий запрос:

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


## Описания метрик {#metric_descriptions}

### merge_failures {#merge_failures}

Количество всех неудачных слияний с момента запуска.

### startup_scripts_failure_reason {#startup_scripts_failure_reason}

Указывает на сбои скриптов запуска по типу ошибки. Устанавливается в 1 при сбое скрипта запуска, с меткой имени ошибки.

### merge_tree_parts {#merge_tree_parts}

Количество частей данных merge tree с метками состояния части, типа части и признака того, является ли она проекционной частью.

**См. также**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — Содержит периодически вычисляемые метрики.
- [system.events](/operations/system-tables/events) — Содержит количество произошедших событий.
- [system.metric_log](/operations/system-tables/metric_log) — Содержит историю значений метрик из таблиц `system.metrics` и `system.events`.
- [Мониторинг](../../operations/monitoring.md) — Базовые концепции мониторинга ClickHouse.
