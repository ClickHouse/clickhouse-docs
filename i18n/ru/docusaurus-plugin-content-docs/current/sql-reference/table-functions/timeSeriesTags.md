---
description: 'табличная функция timeSeriesTags возвращает таблицу тегов, используемую таблицей `db_name.time_series_table`,
  у которой в качестве движка используется TimeSeries.'
sidebar_label: 'timeSeriesTags'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesTags
title: 'timeSeriesTags'
doc_type: 'reference'
---

# Табличная функция timeSeriesTags

`timeSeriesTags(db_name.time_series_table)` — возвращает таблицу [tags](../../engines/table-engines/integrations/time-series.md#tags-table),
используемую таблицей `db_name.time_series_table`, которая использует движок [TimeSeries](../../engines/table-engines/integrations/time-series.md).

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS tags_table
```

Функция также работает, если таблица *tags* является внутренней таблицей:

```sql
CREATE TABLE db_name.time_series_table ENGINE=TimeSeries TAGS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

Следующие запросы эквивалентны:

```sql
SELECT * FROM timeSeriesTags(db_name.time_series_table);
SELECT * FROM timeSeriesTags('db_name.time_series_table');
SELECT * FROM timeSeriesTags('db_name', 'time_series_table');
```
