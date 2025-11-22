---
description: 'Вычисляет запрос Prometheus на основе данных из таблицы TimeSeries.'
sidebar_label: 'prometheusQueryRange'
sidebar_position: 145
slug: /sql-reference/table-functions/prometheusQueryRange
title: 'prometheusQueryRange'
doc_type: 'reference'
---



# Табличная функция prometheusQuery

Выполняет запрос Prometheus, используя данные таблицы TimeSeries в заданном диапазоне моментов времени вычисления.



## Синтаксис {#syntax}

```sql
prometheusQueryRange('db_name', 'time_series_table', 'promql_query', start_time, end_time, step)
prometheusQueryRange(db_name.time_series_table, 'promql_query', start_time, end_time, step)
prometheusQueryRange('time_series_table', 'promql_query', start_time, end_time, step)
```


## Аргументы {#arguments}

- `db_name` — имя базы данных, в которой находится таблица TimeSeries.
- `time_series_table` — имя таблицы TimeSeries.
- `promql_query` — запрос, написанный в [синтаксисе PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/).
- `start_time` — начальное время диапазона вычислений.
- `end_time` — конечное время диапазона вычислений.
- `step` — шаг, используемый для итерации времени вычислений от `start_time` до `end_time` (включительно).


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
SELECT * FROM prometheusQueryRange(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now() - INTERVAL 10 MINUTES, now(), INTERVAL 1 MINUTE)
```
