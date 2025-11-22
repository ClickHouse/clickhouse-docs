---
description: 'timeSeriesMetrics возвращает таблицу метрик, используемую таблицей `db_name.time_series_table`
  с движком TimeSeries.'
sidebar_label: 'timeSeriesMetrics'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesMetrics
title: 'timeSeriesMetrics'
doc_type: 'reference'
---

# Табличная функция timeSeriesMetrics

`timeSeriesMetrics(db_name.time_series_table)` — возвращает таблицу [metrics](../../engines/table-engines/integrations/time-series.md#metrics-table),
используемую таблицей `db_name.time_series_table` с движком [TimeSeries](../../engines/table-engines/integrations/time-series.md).

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS metrics_table
```

Функция также работает, если *metrics* — внутренняя таблица:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

Следующие запросы эквивалентны:

```sql
SELECT * FROM timeSeriesMetrics(db_name.time_series_table);
SELECT * FROM timeSeriesMetrics('db_name.time_series_table');
SELECT * FROM timeSeriesMetrics('db_name', 'time_series_table');
```
