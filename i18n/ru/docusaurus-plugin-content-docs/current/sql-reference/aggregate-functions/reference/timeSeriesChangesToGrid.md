---
description: 'Агрегатная функция, которая вычисляет PromQL-подобные изменения во временных рядах на заданной сетке.'
sidebar_position: 229
slug: /sql-reference/aggregate-functions/reference/timeSeriesChangesToGrid
title: 'timeSeriesChangesToGrid'
doc_type: 'reference'
---

Агрегатная функция, которая принимает данные временного ряда в виде пар меток времени и значений и вычисляет [PromQL-подобные изменения](https://prometheus.io/docs/prometheus/latest/querying/functions/#changes) на их основе на регулярной временной сетке, задаваемой начальной меткой времени, конечной меткой времени и шагом. Для каждой точки сетки образцы для вычисления `changes` рассматриваются в пределах указанного временного окна.

Параметры:

* `start timestamp` — задаёт начало сетки
* `end timestamp` — задаёт конец сетки
* `grid step` — задаёт шаг сетки в секундах
* `staleness` — задаёт максимальную допустимую «устарелость» рассматриваемых образцов в секундах

Аргументы:

* `timestamp` — метка времени образца
* `value` — значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
значения `changes` на указанной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение равно `NULL`, если в окне нет образцов, по которым можно вычислить значение `changes` для данной точки сетки.

Пример:
Следующий запрос вычисляет значения `changes` на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210, 225]:

```sql
WITH
    -- ПРИМЕЧАНИЕ: разрыв между 130 и 190 демонстрирует, как заполняются значения для ts = 180 согласно параметру окна
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- массив значений, соответствующих временным меткам выше
    90 AS start_ts,       -- начало временной сетки
    90 + 135 AS end_ts,   -- конец временной сетки
    15 AS step_seconds,   -- шаг временной сетки
    45 AS window_seconds  -- окно "устаревания"
SELECT timeSeriesChangesToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM
(
    -- Этот подзапрос преобразует массивы временных меток и значений в строки с полями `timestamp`, `value`
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

Также можно передать несколько наборов временных меток и значений в виде массивов одинаковой длины. Тот же запрос с аргументами-массивами:

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
Эта функция является экспериментальной, включите её, установив параметр `allow_experimental_ts_to_grid_aggregate_function=true`.
:::
