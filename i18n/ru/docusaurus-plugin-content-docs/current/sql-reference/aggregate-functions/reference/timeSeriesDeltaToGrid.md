---
description: 'Агрегатная функция, вычисляющая PromQL-подобное delta для данных временных рядов на заданной сетке.'
sidebar_position: 221
slug: /sql-reference/aggregate-functions/reference/timeSeriesDeltaToGrid
title: 'timeSeriesDeltaToGrid'
doc_type: 'reference'
---

Агрегатная функция, которая принимает данные временных рядов в виде пар меток времени и значений и вычисляет [PromQL-подобное delta](https://prometheus.io/docs/prometheus/latest/querying/functions/#delta) для этих данных на регулярной временной сетке, задаваемой начальной меткой времени, конечной меткой времени и шагом. Для каждой точки сетки образцы для вычисления `delta` рассматриваются в пределах указанного временного окна.

Параметры:

* `start timestamp` — задаёт начало сетки.
* `end timestamp` — задаёт конец сетки.
* `grid step` — задаёт шаг сетки в секундах.
* `staleness` — задаёт максимальное время «устаревания» рассматриваемых образцов в секундах. Окно устаревания — это полуинтервал, открытый слева и закрытый справа.

Аргументы:

* `timestamp` — метка времени образца
* `value` — значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
Значения `delta` на заданной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение равно `NULL`, если в окне недостаточно образцов для вычисления значения delta для конкретной точки сетки.

Пример:
Следующий запрос вычисляет значения `delta` на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210]:

```sql
WITH
    -- ПРИМЕЧАНИЕ: разрыв между 140 и 190 демонстрирует, как заполняются значения для ts = 150, 165, 180 согласно параметру окна
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- массив значений, соответствующих временным меткам выше
    90 AS start_ts,       -- начало временной сетки
    90 + 120 AS end_ts,   -- конец временной сетки
    15 AS step_seconds,   -- шаг временной сетки
    45 AS window_seconds  -- окно "устаревания"
SELECT timeSeriesDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesDeltaToGr⋯timestamps, values)─┐
1. │ [NULL,NULL,0,3,4.5,3.75,NULL,NULL,3.75] │
   └─────────────────────────────────────────┘
```

Также можно передать несколько наборов меток времени и значений в виде массивов одинакового размера. Тот же запрос с аргументами-массивами:

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
Это экспериментальная функция; включите её, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::
