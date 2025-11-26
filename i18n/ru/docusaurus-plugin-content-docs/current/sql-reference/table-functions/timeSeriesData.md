---
description: 'timeSeriesData возвращает таблицу данных, используемую таблицей `db_name.time_series_table` с движком TimeSeries.'
sidebar_label: 'timeSeriesData'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesData
title: 'timeSeriesData'
doc_type: 'reference'
---

# Табличная функция timeSeriesData

`timeSeriesData(db_name.time_series_table)` — возвращает таблицу [data](../../engines/table-engines/integrations/time-series.md#data-table),
используемую таблицей `db_name.time_series_table`, которая использует движок таблицы [TimeSeries](../../engines/table-engines/integrations/time-series.md):

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA data_table
```

Функция также работает, если таблица *data* является внутренней:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

Следующие запросы эквивалентны:

```sql
SELECT * FROM timeSeriesData(db_name.time_series_table);
SELECT * FROM timeSeriesData('db_name.time_series_table');
SELECT * FROM timeSeriesData('db_name', 'time_series_table');
```
