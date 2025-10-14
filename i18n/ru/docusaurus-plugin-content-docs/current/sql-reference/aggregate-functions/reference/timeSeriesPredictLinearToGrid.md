---
'description': 'Агрегатная функция, которая вычисляет линейное предсказание в стиле
  PromQL по данным временных рядов на указанной сетке.'
'sidebar_position': 228
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesPredictLinearToGrid'
'title': 'timeSeriesPredictLinearToGrid'
'doc_type': 'reference'
---
Агрегатная функция, которая принимает данные временных рядов в виде пар отметок времени и значений и вычисляет [линейное предсказание в стиле PromQL](https://prometheus.io/docs/prometheus/latest/querying/functions/#predict_linear) с заданным временным смещением предсказания от этих данных на регулярной временной сетке, описанной начальной отметкой времени, конечной отметкой времени и шагом. Для каждой точки на сетке образцы для вычисления `predict_linear` рассматриваются в пределах заданного временного окна.

Параметры:
- `start timestamp` - Определяет начало сетки.
- `end timestamp` - Определяет конец сетки.
- `grid step` - Определяет шаг сетки в секундах.
- `staleness` - Определяет максимальную "устарелость" в секундах учитываемых образцов. Окно устарелости является открытым слева и закрытым справа интервалом.
- `predict_offset` - Определяет количество секунд смещения, которое нужно добавить к времени предсказания.

Аргументы:
- `timestamp` - отметка времени образца
- `value` - значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
Значения `predict_linear` на указанной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение равно NULL, если недостаточно образцов в окне для вычисления значения скорости для конкретной точки сетки.

Пример:
Следующий запрос вычисляет значения `predict_linear` на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210] с 60-секундным смещением:

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window paramater
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds, -- "staleness" window
    60 AS predict_offset  -- prediction time offset
SELECT timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamp, value)
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
   ┌─timeSeriesPredictLinearToGrid(start_ts, end_ts, step_seconds, window_seconds, predict_offset)(timestamp, value)─┐
1. │ [NULL,NULL,1,9.166667,11.6,16.916666,NULL,NULL,16.5]                                                            │
   └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Также возможно передавать несколько образцов отметок времени и значений в виде массивов одинакового размера. Тот же запрос с аргументами в виде массивов:

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
Эта функция является экспериментальной, включите её, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::