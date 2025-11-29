---
description: 'Считывает временные ряды из таблицы TimeSeries, отфильтрованные селектором и с временными метками, попадающими в заданный интервал.'
sidebar_label: 'timeSeriesSelector'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesSelector
title: 'timeSeriesSelector'
doc_type: 'reference'
---



# Табличная функция timeSeriesSelector {#timeseriesselector-table-function}

Считывает временные ряды из таблицы TimeSeries, отфильтрованные селектором и ограниченные временными метками указанного интервала.
Эта функция аналогична [range selectors](https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors), но также используется для реализации [instant selectors](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors).



## Синтаксис {#syntax}

```sql
timeSeriesSelector('db_name', 'time_series_table', 'instant_query', min_time, max_time)
timeSeriesSelector(db_name.time_series_table, 'instant_query', min_time, max_time)
timeSeriesSelector('time_series_table', 'instant_query', min_time, max_time)
```


## Аргументы {#arguments}

- `db_name` — имя базы данных, в которой находится таблица TimeSeries.
- `time_series_table` — имя таблицы TimeSeries.
- `instant_query` — мгновенный селектор, записанный в [синтаксисе PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors), без модификаторов `@` или `offset`.
- `min_time` — начальная метка времени (включительно).
- `max_time` — конечная метка времени (включительно).



## Возвращаемое значение {#returned_value}

Функция возвращает три столбца:
- `id` — содержит идентификаторы временных рядов, соответствующих указанному селектору.
- `timestamp` — содержит метки времени.
- `value` — содержит значения.

Порядок возвращаемых данных не гарантируется.



## Пример {#example}

```sql
SELECT * FROM timeSeriesSelector(mytable, 'http_requests{job="prometheus"}', now() - INTERVAL 10 MINUTES, now())
```
