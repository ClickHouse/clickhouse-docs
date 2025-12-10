---
description: 'Агрегатная функция, которая вычисляет PromQL-подобные resets для данных временных рядов на заданной сетке.'
sidebar_position: 230
slug: /sql-reference/aggregate-functions/reference/timeSeriesResetsToGrid
title: 'timeSeriesResetsToGrid'
doc_type: 'reference'
---

Агрегатная функция, которая принимает данные временных рядов в виде пар меток времени и значений и вычисляет [PromQL-подобные resets](https://prometheus.io/docs/prometheus/latest/querying/functions/#resets) для этих данных на регулярной временной сетке, описанной начальной меткой времени, конечной меткой времени и шагом. Для каждой точки сетки образцы для вычисления `resets` рассматриваются в пределах заданного временного окна.

Параметры:

* `start timestamp` — задаёт начало сетки
* `end timestamp` — задаёт конец сетки
* `grid step` — задаёт шаг сетки в секундах
* `staleness` — задаёт максимальный период «устаревания» в секундах для учитываемых образцов

Аргументы:

* `timestamp` — метка времени образца
* `value` — значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
значения `resets` на заданной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение равно NULL, если в окне нет образцов для вычисления значения `resets` для конкретной точки сетки.

Пример:
Следующий запрос вычисляет значения `resets` на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210, 225]:

```sql
WITH
    -- ПРИМЕЧАНИЕ: интервал между 130 и 190 показывает, как заполняются значения для ts = 180 в соответствии с параметром окна
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 3, 2, 6, 6, 4, 2, 0]::Array(Float32) AS values, -- массив значений, соответствующих указанным выше временным меткам
    90 AS start_ts,       -- start of timestamp grid
    90 + 135 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesResetsToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesResetsToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)─┐
1. │ [NULL,NULL,0,1,1,1,NULL,0,1,2]                                                           │
   └──────────────────────────────────────────────────────────────────────────────────────────┘
```

Также можно передать несколько пар меток времени и значений в виде массивов одинакового размера. Тот же запрос с аргументами-массивами:

```sql
WITH
    [110, 120, 130, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 3, 2, 6, 6, 4, 2, 0]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 135 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesResetsToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
Эта функция экспериментальная. Включите её, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::
