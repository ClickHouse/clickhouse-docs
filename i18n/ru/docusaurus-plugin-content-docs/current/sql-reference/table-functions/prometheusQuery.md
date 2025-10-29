---
'description': 'Оценивает запрос prometheus, используя данные из таблицы TimeSeries.'
'sidebar_label': 'prometheusQuery'
'sidebar_position': 145
'slug': '/sql-reference/table-functions/prometheusQuery'
'title': 'prometheusQuery'
'doc_type': 'reference'
---
# prometheusQuery Табличная Функция

Оценивает запрос prometheus, используя данные из таблицы TimeSeries.

## Синтаксис {#syntax}

```sql
prometheusQuery('db_name', 'time_series_table', 'promql_query', evaluation_time)
prometheusQuery(db_name.time_series_table, 'promql_query', evaluation_time)
prometheusQuery('time_series_table', 'promql_query', evaluation_time)
```

## Аргументы {#arguments}

- `db_name` - Имя базы данных, в которой расположена таблица TimeSeries.
- `time_series_table` - Имя таблицы TimeSeries.
- `promql_query` - Запрос, написанный в [синтаксисе PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/).
- `evaluation_time` - Временная метка оценки. Для оценки запроса на текущее время используйте `now()` в качестве `evaluation_time`.

## Возвращаемое значение {#returned_value}

Функция может возвращать разные колонки в зависимости от типа результата запроса, переданного в параметр `promql_query`:

| Тип Результата | Столбцы Результата | Пример |
|----------------|---------------------|--------|
| vector         | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType | prometheusQuery(mytable, 'up') |
| matrix         | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| scalar         | scalar ValueType     | prometheusQuery(mytable, '1h30m') |
| string         | string String        | prometheusQuery(mytable, '"abc"') |

## Пример {#example}

```sql
SELECT * FROM prometheusQuery(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now())
```