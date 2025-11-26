---
description: 'Агрегатная функция, которая вычисляет PromQL-подобный irate для данных временных рядов на заданной сетке.'
sidebar_position: 223
slug: /sql-reference/aggregate-functions/reference/timeSeriesInstantRateToGrid
title: 'timeSeriesInstantRateToGrid'
doc_type: 'reference'
---

Агрегатная функция, которая принимает данные временного ряда в виде пар меток времени и значений и вычисляет [PromQL-подобный irate](https://prometheus.io/docs/prometheus/latest/querying/functions/#irate) для этих данных на регулярной временной сетке, задаваемой начальной меткой времени, конечной меткой времени и шагом. Для каждой точки на сетке семплы для вычисления `irate` рассматриваются в пределах заданного временного окна.

Параметры:

* `start timestamp` — определяет начало сетки.
* `end timestamp` — определяет конец сетки.
* `grid step` — определяет шаг сетки в секундах.
* `staleness` — задает максимальное время «устаревания» рассматриваемых семплов в секундах. Окно устаревания представляет собой полуинтервал, открытый слева и закрытый справа.

Аргументы:

* `timestamp` — метка времени семпла
* `value` — значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
значения `irate` на заданной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение равно NULL, если в окне недостаточно семплов для вычисления значения мгновенной скорости изменения для конкретной точки сетки.

Пример:
Следующий запрос вычисляет значения `irate` на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210]:

```sql
WITH
    -- ПРИМЕЧАНИЕ: промежуток между 140 и 190 демонстрирует заполнение значений для ts = 150, 165, 180 согласно параметру окна
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- массив значений, соответствующих временным меткам выше
    90 AS start_ts,       -- начало временной сетки
    90 + 120 AS end_ts,   -- конец временной сетки
    15 AS step_seconds,   -- шаг временной сетки
    45 AS window_seconds  -- окно устаревания
SELECT timeSeriesInstantRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesInstantRa⋯timestamps, values)─┐
1. │ [NULL,NULL,0,0.2,0.1,0.1,NULL,NULL,0.3] │
   └─────────────────────────────────────────┘
```

Также можно передать несколько выборок временных меток и значений в виде массивов одинакового размера. Тот же запрос с аргументами-массивами:

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesInstantRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
Эта функция экспериментальная; чтобы её включить, установите `allow_experimental_ts_to_grid_aggregate_function=true`.
:::
