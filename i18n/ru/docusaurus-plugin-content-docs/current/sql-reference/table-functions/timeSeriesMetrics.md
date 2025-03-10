---
slug: /sql-reference/table-functions/timeSeriesMetrics
sidebar_position: 145
sidebar_label: timeSeriesMetrics
title: "timeSeriesMetrics"
description: "timeSeriesMetrics возвращает таблицу метрик, используемую таблицей `db_name.time_series_table`, чей тип таблицы - TimeSeries."
---


# Функция Таблицы timeSeriesMetrics

`timeSeriesMetrics(db_name.time_series_table)` - Возвращает [таблицу метрик](../../engines/table-engines/integrations/time-series.md#metrics-table), используемую таблицей `db_name.time_series_table`, чей тип таблицы - [TimeSeries](../../engines/table-engines/integrations/time-series.md):

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS metrics_table
```

Функция также работает, если таблица _metrics_ является внутренней:

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

Следующие запросы эквивалентны:

``` sql
SELECT * FROM timeSeriesMetrics(db_name.time_series_table);
SELECT * FROM timeSeriesMetrics('db_name.time_series_table');
SELECT * FROM timeSeriesMetrics('db_name', 'time_series_table');
```
