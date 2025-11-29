---
description: 'Агрегатная функция, которая повторно дискретизирует данные временных рядов на заданную сетку.'
sidebar_position: 226
slug: /sql-reference/aggregate-functions/reference/timeSeriesResampleToGridWithStaleness
title: 'timeSeriesResampleToGridWithStaleness'
doc_type: 'reference'
---

Агрегатная функция, которая принимает данные временного ряда в виде пар меток времени и значений и повторно дискретизирует эти данные на регулярную временную сетку, задаваемую начальной меткой времени, конечной меткой времени и шагом. Для каждой точки сетки выбирается самый свежий (в пределах заданного временного окна) отсчёт.

Псевдоним: `timeSeriesLastToGrid`.

Параметры:

* `start timestamp` — определяет начало сетки
* `end timestamp` — определяет конец сетки
* `grid step` — определяет шаг сетки в секундах
* `staleness window` — определяет максимальную «устарелость» самого свежего отсчёта в секундах

Аргументы:

* `timestamp` — метка времени отсчёта
* `value` — значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
значения временного ряда, повторно дискретизированные на заданную сетку в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение равно NULL, если для конкретной точки сетки нет отсчёта.

Пример:
Следующий запрос повторно дискретизирует данные временного ряда на сетку [90, 105, 120, 135, 150, 165, 180, 195, 210], выбирая значение не старше 30 секунд для каждой точки сетки:

```sql
WITH
    -- ПРИМЕЧАНИЕ: разрыв между 140 и 190 демонстрирует заполнение значений для ts = 150, 165, 180 согласно параметру окна устаревания
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- массив значений, соответствующих указанным выше временным меткам
    90 AS start_ts,       -- начало временной сетки
    90 + 120 AS end_ts,   -- конец временной сетки
    15 AS step_seconds,   -- шаг временной сетки
    30 AS window_seconds  -- окно устаревания
SELECT timeSeriesResampleToGridWithStaleness(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesResa⋯stamp, value)─┐
1. │ [NULL,NULL,1,3,4,4,NULL,5,8] │
   └──────────────────────────────┘
```

Также можно передать несколько пар меток времени и значений в виде массивов одинаковой длины. Тот же запрос, но с аргументами-массивами:

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    30 AS window_seconds
SELECT timeSeriesResampleToGridWithStaleness(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
Эта функция является экспериментальной. Чтобы её включить, установите `allow_experimental_ts_to_grid_aggregate_function=true`.
:::
