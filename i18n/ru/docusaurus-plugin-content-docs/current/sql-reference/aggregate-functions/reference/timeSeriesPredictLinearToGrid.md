---
description: 'Агрегатная функция, вычисляющая предсказание по линейной модели в стиле PromQL по данным временных рядов на заданной сетке.'
sidebar_position: 228
slug: /sql-reference/aggregate-functions/reference/timeSeriesPredictLinearToGrid
title: 'timeSeriesPredictLinearToGrid'
doc_type: 'reference'
---

Агрегатная функция, которая принимает данные временных рядов в виде пар меток времени и значений и вычисляет [линейное предсказание в стиле PromQL](https://prometheus.io/docs/prometheus/latest/querying/functions/#predict_linear) с заданным смещением времени предсказания на регулярной временной сетке, задаваемой начальной меткой времени, конечной меткой времени и шагом. Для каждой точки сетки выборки для вычисления `predict_linear` рассматриваются в пределах заданного временного окна.

Параметры:

* `start timestamp` - Определяет начало сетки.
* `end timestamp` - Определяет конец сетки.
* `grid step` - Определяет шаг сетки в секундах.
* `staleness` - Определяет максимальную «устарелость» рассматриваемых выборок в секундах. Окно устарелости представляет собой полуинтервал, открытый слева и закрытый справа.
* `predict_offset` - Определяет количество секунд смещения, добавляемого ко времени предсказания.

Аргументы:

* `timestamp` - метка времени выборки.
* `value` - значение временного ряда, соответствующее `timestamp`.

Возвращаемое значение:
Значения `predict_linear` на заданной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит по одному значению для каждой точки временной сетки. Значение равно NULL, если в окне недостаточно выборок для вычисления значения `predict_linear` для конкретной точки сетки.

Пример:
Следующий запрос вычисляет значения `predict_linear` на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210] с 60-секундным смещением:

```sql
WITH
    -- ПРИМЕЧАНИЕ: разрыв между 140 и 190 демонстрирует, как заполняются значения для ts = 150, 165, 180 согласно параметру окна
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- массив значений, соответствующих указанным выше временным меткам
    90 AS start_ts,       -- начало временной сетки
    90 + 120 AS end_ts,   -- конец временной сетки
    15 AS step_seconds,   -- шаг временной сетки
    45 AS window_seconds, -- окно «устаревания»
    60 AS predict_offset  -- временное смещение для прогнозирования
SELECT timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamp, value)
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
   ┌─timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamp, value)─┐
1. │ [NULL,NULL,1,9.166667,11.6,16.916666,NULL,NULL,16.5]                                                            │
   └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Также можно передавать несколько наборов меток времени и значений в виде массивов одинаковой длины. Тот же запрос, но с аргументами-массивами:

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds,
    60 AS predict_offset
SELECT timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamps, values);
```

:::note
Эта функция экспериментальная; включите её, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::
