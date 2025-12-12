---
description: 'Агрегатная функция, которая вычисляет PromQL-подобный idelta по данным временных рядов на заданной сетке.'
sidebar_position: 222
slug: /sql-reference/aggregate-functions/reference/timeSeriesInstantDeltaToGrid
title: 'timeSeriesInstantDeltaToGrid'
doc_type: 'reference'
---

Агрегатная функция, которая принимает данные временных рядов в виде пар меток времени и значений и вычисляет [PromQL-подобный idelta](https://prometheus.io/docs/prometheus/latest/querying/functions/#idelta) по этим данным на регулярной временной сетке, задаваемой начальной меткой времени, конечной меткой времени и шагом. Для каждой точки сетки учитываемые для вычисления `idelta` отсчёты берутся в пределах указанного временного окна.

Параметры:

* `start timestamp` — задаёт начало сетки.
* `end timestamp` — задаёт конец сетки.
* `grid step` — задаёт шаг сетки в секундах.
* `staleness` — задаёт максимальную «устарелость» в секундах для учитываемых отсчётов. Окно устарелости представляет собой интервал, открытый слева и закрытый справа.

Аргументы:

* `timestamp` — метка времени отсчёта.
* `value` — значение временного ряда, соответствующее `timestamp`.

Возвращаемое значение:
Значения `idelta` на заданной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит по одному значению для каждой точки временной сетки. Значение равно NULL, если в окне недостаточно отсчётов для вычисления значения мгновенного приращения (instant delta) для конкретной точки сетки.

Пример:
Следующий запрос вычисляет значения `idelta` на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210]:

```sql
WITH
    -- ПРИМЕЧАНИЕ: разрыв между 140 и 190 демонстрирует заполнение значений для ts = 150, 165, 180 согласно параметру окна
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- массив значений, соответствующих указанным выше временным меткам
    90 AS start_ts,       -- начало временной сетки
    90 + 120 AS end_ts,   -- конец временной сетки
    15 AS step_seconds,   -- шаг временной сетки
    45 AS window_seconds  -- окно устаревания
SELECT timeSeriesInstantDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM
(
    -- Данный подзапрос преобразует массивы временных меток и значений в строки с полями `timestamp`, `value`
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

Ответ:

```response
   ┌─timeSeriesInsta⋯stamps, values)─┐
1. │ [NULL,NULL,0,2,1,1,NULL,NULL,3] │
   └─────────────────────────────────┘
```

Также можно передавать несколько меток времени и значений в виде массивов одинаковой длины. Тот же запрос, но с аргументами-массивами:

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesInstantDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
Функция экспериментальная, включите её, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::
