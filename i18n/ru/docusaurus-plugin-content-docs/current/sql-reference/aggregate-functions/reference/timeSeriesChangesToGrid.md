---
description: 'Агрегатная функция, которая вычисляет изменения во временных рядах в стиле PromQL на указанной временной сетке.'
sidebar_position: 229
slug: /sql-reference/aggregate-functions/reference/timeSeriesChangesToGrid
title: 'timeSeriesChangesToGrid'
doc_type: 'reference'
---

Агрегатная функция, которая принимает данные временного ряда в виде пар меток времени и значений и вычисляет [изменения в стиле PromQL](https://prometheus.io/docs/prometheus/latest/querying/functions/#changes) для этих данных на регулярной временной сетке, задаваемой начальной меткой времени, конечной меткой времени и шагом. Для каждой точки сетки выборки для вычисления `changes` рассматриваются в пределах заданного временного окна.

Параметры:

* `start timestamp` — задаёт начало сетки
* `end timestamp` — задаёт конец сетки
* `grid step` — задаёт шаг сетки в секундах
* `staleness` — задаёт максимально допустимую «устарелость» в секундах для учитываемых выборок

Аргументы:

* `timestamp` — метка времени выборки
* `value` — значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
значения `changes` на указанной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение равно NULL, если в окне отсутствуют выборки, позволяющие вычислить значение изменений для конкретной точки сетки.

Пример:
Следующий запрос вычисляет значения `changes` на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210, 225]:

```sql
WITH
    -- NOTE: the gap between 130 and 190 is to show how values are filled for ts = 180 according to window parameter
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 135 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesChangesToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM
(
    -- This subquery converts arrays of timestamps and values into rows of `timestamp`, `value`
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

Ответ:

```response
   ┌─timeSeriesChangesToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)─┐
1. │ [NULL,NULL,0,1,1,1,NULL,0,1,2]                                                            │
   └───────────────────────────────────────────────────────────────────────────────────────────┘
```

Также можно передавать несколько наборов меток времени и значений в виде массивов одинаковой длины. Тот же запрос, но с аргументами-массивами:

```sql
WITH
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 135 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesChangesToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
Эта функция экспериментальная. Для её включения установите `allow_experimental_ts_to_grid_aggregate_function=true`.
:::
