---
description: 'Считывает временные ряды из таблицы TimeSeries, отфильтрованные по селектору и с метками времени, попадающими в указанный интервал.'
sidebar_label: 'timeSeriesSelector'
sidebar_position: 145
slug: /sql-reference/table-functions/timeSeriesSelector
title: 'timeSeriesSelector'
doc_type: 'reference'
---



# Табличная функция timeSeriesSelector

Считывает временные ряды из таблицы TimeSeries, отфильтрованные по селектору и с метками времени в заданном интервале.
Эта функция похожа на [селекторы диапазона](https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors), но также используется для реализации [мгновенных селекторов](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors).



## Синтаксис {#syntax}

```sql
timeSeriesSelector('db_name', 'time_series_table', 'instant_query', min_time, max_time)
timeSeriesSelector(db_name.time_series_table, 'instant_query', min_time, max_time)
timeSeriesSelector('time_series_table', 'instant_query', min_time, max_time)
```


## Аргументы {#arguments}

- `db_name` — имя базы данных, в которой находится таблица TimeSeries.
- `time_series_table` — имя таблицы TimeSeries.
- `instant_query` — мгновенный селектор, записанный в [синтаксисе PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors), без модификаторов `@` и `offset`.
- `min_time` — начальная временная метка, включительно.
- `max_time` — конечная временная метка, включительно.


## Возвращаемое значение {#returned_value}

Функция возвращает три столбца:

- `id` — содержит идентификаторы временных рядов, соответствующих указанному селектору.
- `timestamp` — содержит временные метки.
- `value` — содержит значения.

Порядок возвращаемых данных не определён.


## Пример {#example}

```sql
SELECT * FROM timeSeriesSelector(mytable, 'http_requests{job="prometheus"}', now() - INTERVAL 10 MINUTES, now())
```
