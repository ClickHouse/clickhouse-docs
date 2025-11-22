---
description: 'Агрегатная функция, вычисляющая производную в стиле PromQL по временным рядам на заданной сетке.'
sidebar_position: 227
slug: /sql-reference/aggregate-functions/reference/timeSeriesDerivToGrid
title: 'timeSeriesDerivToGrid'
doc_type: 'reference'
---

Агрегатная функция, которая принимает данные временных рядов в виде пар метка времени — значение и вычисляет [производную в стиле PromQL](https://prometheus.io/docs/prometheus/latest/querying/functions/#deriv) по этим данным на регулярной временной сетке, задаваемой начальной меткой времени, конечной меткой времени и шагом. Для каждой точки сетки выборка для вычисления `deriv` рассматривается в пределах указанного временного окна.

Параметры:

* `start timestamp` - задает начало сетки.
* `end timestamp` - задает конец сетки.
* `grid step` - задает шаг сетки в секундах.
* `staleness` - задает максимальную «устарелость» в секундах для учитываемых выборок. Окно устарелости — полуинтервал, открытый слева и закрытый справа.

Аргументы:

* `timestamp` - метка времени выборки
* `value` - значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
Значения `deriv` на заданной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит по одному значению для каждой точки временной сетки. Значение равно NULL, если в окне недостаточно выборок для вычисления значения производной для конкретной точки сетки.

Пример:
Следующий запрос вычисляет значения `deriv` на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210]:

```sql
WITH
    -- ПРИМЕЧАНИЕ: разрыв между 140 и 190 демонстрирует, как заполняются значения для ts = 150, 165, 180 согласно параметру окна
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- массив значений, соответствующих временным меткам выше
    90 AS start_ts,       -- начало временной сетки
    90 + 120 AS end_ts,   -- конец временной сетки
    15 AS step_seconds,   -- шаг временной сетки
    45 AS window_seconds  -- окно "устаревания"
SELECT timeSeriesDerivToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM
(
    -- Этот подзапрос преобразует массивы временных меток и значений в строки `timestamp`, `value`
    SELECT
        arrayJoin(arrayZip(timestamps, values)) AS ts_and_val,
        ts_and_val.1 AS timestamp,
        ts_and_val.2 AS value
);
```

Ответ:

```response
   ┌─timeSeriesDerivToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)─┐
1. │ [NULL,NULL,0,0.1,0.11,0.15,NULL,NULL,0.15]                                              │
   └─────────────────────────────────────────────────────────────────────────────────────────┘
```

Также можно передавать несколько наборов меток времени и значений в виде массивов одинаковой длины. Тот же запрос, но с аргументами-массивами:

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesDerivToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
Эта функция экспериментальная; чтобы её включить, задайте `allow_experimental_ts_to_grid_aggregate_function=true`.
:::
