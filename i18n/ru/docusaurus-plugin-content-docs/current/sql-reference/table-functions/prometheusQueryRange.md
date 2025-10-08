---
'description': 'Оценивает запрос prometheus, используя данные из таблицы TimeSeries.'
'sidebar_label': 'prometheusQueryRange'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/prometheusQueryRange'
'title': 'prometheusQueryRange'
'doc_type': 'reference'
---
# prometheusQuery Табличная Функция

Оценивает запрос prometheus, используя данные из таблицы TimeSeries за диапазон времени оценки.

## Синтаксис {#syntax}

```sql
prometheusQueryRange('db_name', 'time_series_table', 'promql_query', start_time, end_time, step)
prometheusQueryRange(db_name.time_series_table, 'promql_query', start_time, end_time, step)
prometheusQueryRange('time_series_table', 'promql_query', start_time, end_time, step)
```

## Аргументы {#arguments}

- `db_name` - Имя базы данных, где находится таблица TimeSeries.
- `time_series_table` - Имя таблицы TimeSeries.
- `promql_query` - Запрос, написанный в [синтаксисе PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/).
- `start_time` - Начальное время диапазона оценки.
- `end_time` - Конечное время диапазона оценки.
- `step` - Шаг, используемый для перебора времени оценки от `start_time` до `end_time` (включительно).

## Возвращаемое значение {#returned_value}

Функция может возвращать различные колонки в зависимости от типа результата запроса, переданного параметру `promql_query`:

| Тип результата | Столбцы результата | Пример |
|----------------|--------------------|--------|
| вектор         | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType | prometheusQuery(mytable, 'up') |
| матрица        | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| скаляр         | scalar ValueType | prometheusQuery(mytable, '1h30m') |
| строка         | string String | prometheusQuery(mytable, '"abc"') |

## Пример {#example}

```sql
SELECT * FROM prometheusQueryRange(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now() - INTERVAL 10 MINUTES, now(), INTERVAL 1 MINUTE)
```