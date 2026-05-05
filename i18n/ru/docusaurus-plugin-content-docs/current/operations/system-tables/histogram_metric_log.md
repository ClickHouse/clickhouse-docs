---
description: 'Системная таблица, содержащая периодические снимки метрик гистограммы, сбрасываемые на диск.'
keywords: ['system table', 'histogram_metric_log']
sidebar_label: 'histogram_metric_log'
sidebar_position: 65
slug: /operations/system-tables/histogram_metric_log
title: 'system.histogram_metric_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud />

## Описание \{#description\}

История `system.histogram_metrics`. Снимок создается каждые `collect_interval_milliseconds`, после чего данные сбрасываются на диск.

## Столбцы \{#columns\}

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата события.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время события.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время события с точностью до микросекунд.
* `metric` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя метрики.
* `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — Метки метрики.
* `histogram` ([Map(Float64, UInt64)](../../sql-reference/data-types/map.md)) — Верхняя граница бакета и соответствующее ей накопительное количество. `+inf` — последний бакет.
* `count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Общее число наблюдений. Равно `histogram[+inf]`.
* `sum` ([Float64](../../sql-reference/data-types/float.md)) — Сумма наблюдаемых значений.

## Пример \{#example\}

```sql
SELECT event_time, metric, labels, histogram
FROM system.histogram_metric_log
WHERE metric = 'keeper_response_time_ms'
ORDER BY event_time DESC
LIMIT 1
FORMAT Vertical;
```

## См. также \{#see-also\}

* [system.histogram&#95;metrics](/operations/system-tables/histogram_metrics) — Метрики гистограммы в реальном времени.
* [system.metric&#95;log](/operations/system-tables/metric_log) — История `system.metrics` и `system.events`.