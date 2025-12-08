---
description: 'timeSeriesMetrics возвращает таблицу метрик, которую использует таблица `db_name.time_series_table` с движком TimeSeries.'
sidebar_label: 'timeSeriesMetrics'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesMetrics
title: 'timeSeriesMetrics'
doc_type: 'reference'
---

# Табличная функция timeSeriesMetrics {#timeseriesmetrics-table-function}

`timeSeriesMetrics(db_name.time_series_table)` — возвращает таблицу [metrics](../../engines/table-engines/integrations/time-series.md#metrics-table),
используемую таблицей `db_name.time_series_table`, которая использует движок [TimeSeries](../../engines/table-engines/integrations/time-series.md):

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS metrics_table
```

Функция также работает, если таблица *metrics* — внутренняя:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

Далее приведены эквивалентные запросы:

```sql
SELECT * FROM timeSeriesMetrics(db_name.time_series_table);
SELECT * FROM timeSeriesMetrics('db_name.time_series_table');
SELECT * FROM timeSeriesMetrics('db_name', 'time_series_table');
```
