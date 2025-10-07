---
'description': 'Читает временные ряды из таблицы TimeSeries, отфильтрованные по селектору
  и с временными метками в заданном интервале.'
'sidebar_label': 'timeSeriesSelector'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/timeSeriesSelector'
'title': 'timeSeriesSelector'
'doc_type': 'reference'
---
# Функция Таблицы timeSeriesSelector

Читает временные ряды из таблицы TimeSeries, отфильтрованные по селектору и с временными метками в указанном интервале. Эта функция аналогична [селекторам диапазона](https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors), но также используется для реализации [мгновенных селекторов](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors).

## Синтаксис {#syntax}

```sql
timeSeriesSelector('db_name', 'time_series_table', 'instant_query', min_time, max_time)
timeSeriesSelector(db_name.time_series_table, 'instant_query', min_time, max_time)
timeSeriesSelector('time_series_table', 'instant_query', min_time, max_time)
```

## Аргументы {#arguments}

- `db_name` - Имя базы данных, где расположена таблица TimeSeries.
- `time_series_table` - Имя таблицы TimeSeries.
- `instant_query` - Мгновенный селектор, написанный на синтаксисе [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors), без модификаторов `@` или `offset`.
- `min_time` - Начальная временная метка, включительно.
- `max_time` - Конечная временная метка, включительно.

## Возвращаемое значение {#returned_value}

Функция возвращает три колонки:
- `id` - Содержит идентификаторы временных рядов, соответствующих указанному селектору.
- `timestamp` - Содержит временные метки.
- `value` - Содержит значения.

Нет конкретного порядка для возвращаемых данных.

## Пример {#example}

```sql
SELECT * FROM timeSeriesSelector(mytable, 'http_requests{job="prometheus"}', now() - INTERVAL 10 MINUTES, now())
```