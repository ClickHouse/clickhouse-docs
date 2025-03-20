---
slug: /sql-reference/table-functions/timeSeriesData
sidebar_position: 145
sidebar_label: timeSeriesData
title: "timeSeriesData"
description: "timeSeriesData возвращает таблицу данных, используемую таблицей `db_name.time_series_table`, чей движок таблицы - TimeSeries."
---


# Функция таблицы timeSeriesData

`timeSeriesData(db_name.time_series_table)` - Возвращает [таблицу данных](../../engines/table-engines/integrations/time-series.md#data-table), используемую таблицей `db_name.time_series_table`, чей движок таблицы - [TimeSeries](../../engines/table-engines/integrations/time-series.md):

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA data_table
```

Функция также работает, если таблица _data_ является внутренней:

``` sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

Следующие запросы эквивалентны:

``` sql
SELECT * FROM timeSeriesData(db_name.time_series_table);
SELECT * FROM timeSeriesData('db_name.time_series_table');
SELECT * FROM timeSeriesData('db_name', 'time_series_table');
```
