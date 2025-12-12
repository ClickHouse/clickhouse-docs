---
description: 'Агрегатная функция, которая вычисляет похожую на PromQL скорость изменения (rate) по данным временных рядов на заданной сетке.'
sidebar_position: 225
slug: /sql-reference/aggregate-functions/reference/timeSeriesRateToGrid
title: 'timeSeriesRateToGrid'
doc_type: 'reference'
---

Агрегатная функция, которая принимает данные временных рядов в виде пар меток времени и значений и вычисляет [похожий на PromQL rate](https://prometheus.io/docs/prometheus/latest/querying/functions/#rate) по этим данным на регулярной временной сетке, задаваемой начальной меткой времени, конечной меткой времени и шагом. Для каждой точки сетки сэмплы для вычисления `rate` рассматриваются в указанном временном окне.

Параметры:

* `start timestamp` — задаёт начало сетки.
* `end timestamp` — задаёт конец сетки.
* `grid step` — задаёт шаг сетки в секундах.
* `staleness` — задаёт максимальную «устарелость» в секундах для учитываемых сэмплов. Окно устарелости — левооткрытый, право-замкнутый интервал.

Аргументы:

* `timestamp` — метка времени сэмпла
* `value` — значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
Значения `rate` на указанной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение равно NULL, если в окне недостаточно сэмплов для вычисления значения скорости для конкретной точки сетки.

Пример:
Следующий запрос вычисляет значения `rate` на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210]:

```sql
WITH
    -- ПРИМЕЧАНИЕ: промежуток между 140 и 190 демонстрирует заполнение значений для ts = 150, 165, 180 согласно параметру окна
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- массив значений, соответствующих временным меткам выше
    90 AS start_ts,       -- начало временной сетки
    90 + 120 AS end_ts,   -- конец временной сетки
    15 AS step_seconds,   -- шаг временной сетки
    45 AS window_seconds  -- окно "устаревания"
SELECT timeSeriesRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM
(
    -- Данный подзапрос преобразует массивы временных меток и значений в строки `timestamp`, `value`
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

Ответ:

```response
   ┌─timeSeriesRateToGrid(start_ts, ⋯w_seconds)(timestamps, values)─┐
1. │ [NULL,NULL,0,0.06666667,0.1,0.083333336,NULL,NULL,0.083333336] │
   └────────────────────────────────────────────────────────────────┘
```

Также можно передавать несколько наборов меток времени и значений в виде массивов одинакового размера. Тот же запрос с аргументами-массивами:

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
Эта функция экспериментальная; включите её, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::
