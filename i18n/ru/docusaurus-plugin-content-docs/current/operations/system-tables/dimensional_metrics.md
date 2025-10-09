---
'description': 'Эта таблица содержит размерные метрики, которые могут быть рассчитаны
  мгновенно и экспортированы в формате Prometheus. Она всегда актуальна.'
'keywords':
- 'system table'
- 'dimensional_metrics'
'slug': '/operations/system-tables/dimensional_metrics'
'title': 'system.dimensional_metrics'
'doc_type': 'reference'
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# dimensional_metrics {#dimensional_metrics}

<SystemTableCloud/>

Эта таблица содержит размерные метрики, которые могут быть рассчитаны мгновенно и экспортированы в формате Prometheus. Она всегда актуальна.

Столбцы:

- `metric` ([String](../../sql-reference/data-types/string.md)) — Имя метрики.
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — Значение метрики.
- `description` ([String](../../sql-reference/data-types/string.md)) — Описание метрики.
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — Метки метрики.
- `name` ([String](../../sql-reference/data-types/string.md)) — Псевдоним для `metric`.

**Пример**

Вы можете использовать запрос, аналогичный этому, чтобы экспортировать все размерные метрики в формате Prometheus.
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

## Metric descriptions {#metric_descriptions}

### merge_failures {#merge_failures}
Количество всех неудачных слияний с момента запуска.

### startup_scripts_failure_reason {#startup_scripts_failure_reason}
Указывает на ошибки выполнения скриптов при запуске по типу ошибки. Устанавливается в 1, когда скрипт при запуске завершается неудачно, помечается именем ошибки.

### merge_tree_parts {#merge_tree_parts}
Количество частей данных в MergeTree, помеченных по состоянию части, типу части и является ли она частью проекции.

**См. также**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — Содержит периодически рассчитываемые метрики.
- [system.events](/operations/system-tables/events) — Содержит ряд событий, которые произошли.
- [system.metric_log](/operations/system-tables/metric_log) — Содержит историю значений метрик из таблиц `system.metrics` и `system.events`.
- [Monitoring](../../operations/monitoring.md) — Основные концепции мониторинга ClickHouse.