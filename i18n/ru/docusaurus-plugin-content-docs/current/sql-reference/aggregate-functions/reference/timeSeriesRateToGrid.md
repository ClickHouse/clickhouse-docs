---
'description': 'Агрегатная функция, которая вычисляет аналогичную PromQL скорость
  по данным временных рядов на указанной сетке.'
'sidebar_position': 225
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesRateToGrid'
'title': 'timeSeriesRateToGrid'
'doc_type': 'reference'
---
Агрегатная функция, которая принимает данные временных рядов в виде пар временных меток и значений и вычисляет [значение rate в стиле PromQL](https://prometheus.io/docs/prometheus/latest/querying/functions/#rate) на регулярной временной сетке, описываемой начальной временной меткой, конечной временной меткой и шагом. Для каждой точки на сетке образцы для вычисления `rate` рассматриваются в пределах заданного временного окна.

Параметры:
- `start timestamp` - Указывает начало сетки.
- `end timestamp` - Указывает конец сетки.
- `grid step` - Указывает шаг сетки в секундах.
- `staleness` - Указывает максимальную "устарелость" в секундах рассматриваемых образцов. Окно устарелости является полуоткрытым слева и закрытым справа интервалом.

Аргументы:
- `timestamp` - временная метка образца
- `value` - значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
`rate` значения на заданной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение NULL, если недостаточно образцов в пределах окна для вычисления значения rate для конкретной точки сетки.

Пример:
Следующий запрос вычисляет значения `rate` на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210]:

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window parameter
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesRateToGrid(start_ts, ⋯w_seconds)(timestamps, values)─┐
1. │ [NULL,NULL,0,0.06666667,0.1,0.083333336,NULL,NULL,0.083333336] │
   └────────────────────────────────────────────────────────────────┘
```

Также возможно передать несколько образцов временных меток и значений в виде массивов одинакового размера. Тот же запрос с массивами в качестве аргументов:

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
Эта функция является экспериментальной, активируйте её, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::