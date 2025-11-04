---
slug: '/sql-reference/table-functions/timeSeriesData'
sidebar_label: timeSeriesData
sidebar_position: 145
description: 'данные временных рядов возвращает таблицу данных, используемую таблицей'
title: timeSeriesData
doc_type: reference
---
# Функция таблицы timeSeriesData

`timeSeriesData(db_name.time_series_table)` - Возвращает таблицу [data](../../engines/table-engines/integrations/time-series.md#data-table), используемую таблицей `db_name.time_series_table`, движок которой - [TimeSeries](../../engines/table-engines/integrations/time-series.md):

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA data_table
```

Функция также работает, если таблица _data_ является внутренней:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

Следующие запросы эквивалентны:

```sql
SELECT * FROM timeSeriesData(db_name.time_series_table);
SELECT * FROM timeSeriesData('db_name.time_series_table');
SELECT * FROM timeSeriesData('db_name', 'time_series_table');
```