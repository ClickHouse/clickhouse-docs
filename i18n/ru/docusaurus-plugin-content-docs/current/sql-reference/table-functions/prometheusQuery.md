---
description: 'Выполняет запрос Prometheus над данными таблицы TimeSeries.'
sidebar_label: 'prometheusQuery'
sidebar_position: 145
slug: /sql-reference/table-functions/prometheusQuery
title: 'prometheusQuery'
doc_type: 'reference'
---



# Табличная функция prometheusQuery

Выполняет запрос Prometheus на основе данных таблицы TimeSeries.



## Синтаксис {#syntax}

```sql
prometheusQuery('db_name', 'time_series_table', 'promql_query', evaluation_time)
prometheusQuery(db_name.time_series_table, 'promql_query', evaluation_time)
prometheusQuery('time_series_table', 'promql_query', evaluation_time)
```


## Аргументы {#arguments}

- `db_name` — имя базы данных, в которой находится таблица TimeSeries.
- `time_series_table` — имя таблицы TimeSeries.
- `promql_query` — запрос, написанный в [синтаксисе PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/).
- `evaluation_time` — временная метка вычисления. Чтобы вычислить запрос в текущий момент времени, используйте `now()` в качестве `evaluation_time`.


## Возвращаемое значение {#returned_value}

Функция возвращает различные столбцы в зависимости от типа результата запроса, переданного в параметр `promql_query`:

| Тип результата | Столбцы результата                                                                        | Пример                            |
| ----------- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| vector      | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType           | prometheusQuery(mytable, 'up')     |
| matrix      | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| scalar      | scalar ValueType                                                                      | prometheusQuery(mytable, '1h30m')  |
| string      | string String                                                                         | prometheusQuery(mytable, '"abc"')  |


## Пример {#example}

```sql
SELECT * FROM prometheusQuery(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now())
```
