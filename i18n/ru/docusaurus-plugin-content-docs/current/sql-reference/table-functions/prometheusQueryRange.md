---
description: 'Вычисляет запрос Prometheus, используя данные из таблицы TimeSeries.'
sidebar_label: 'prometheusQueryRange'
sidebar_position: 145
slug: /sql-reference/table-functions/prometheusQueryRange
title: 'prometheusQueryRange'
doc_type: 'reference'
---

# Табличная функция prometheusQuery \\{#prometheusquery-table-function\\}

Вычисляет запрос Prometheus, используя данные из таблицы TimeSeries в заданном интервале времени оценки.

## Синтаксис \\{#syntax\\}

```sql
prometheusQueryRange('db_name', 'time_series_table', 'promql_query', start_time, end_time, step)
prometheusQueryRange(db_name.time_series_table, 'promql_query', start_time, end_time, step)
prometheusQueryRange('time_series_table', 'promql_query', start_time, end_time, step)
```

## Аргументы \\{#arguments\\}

- `db_name` - имя базы данных, в которой находится таблица TimeSeries.
- `time_series_table` - имя таблицы TimeSeries.
- `promql_query` - запрос на языке [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/).
- `start_time` - время начала диапазона вычисления.
- `end_time` - время окончания диапазона вычисления.
- `step` - шаг, используемый для перебора времени вычисления от `start_time` до `end_time` (включительно).

## Возвращаемое значение \\{#returned_value\\}

Функция может возвращать различные столбцы в зависимости от типа результата запроса, переданного в параметре `promql_query`:

| Тип результата | Столбцы результата | Пример |
|-------------|----------------|---------|
| vector      | tags Array(Tuple(String, String)), timestamp TimestampType, value ValueType | prometheusQuery(mytable, 'up') |
| matrix      | tags Array(Tuple(String, String)), time_series Array(Tuple(TimestampType, ValueType)) | prometheusQuery(mytable, 'up[1m]') |
| scalar      | scalar ValueType | prometheusQuery(mytable, '1h30m') |
| string      | string String | prometheusQuery(mytable, '"abc"') |

## Пример \\{#example\\}

```sql
SELECT * FROM prometheusQueryRange(mytable, 'rate(http_requests{job="prometheus"}[10m])[1h:10m]', now() - INTERVAL 10 MINUTES, now(), INTERVAL 1 MINUTE)
```
