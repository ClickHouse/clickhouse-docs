---
'description': 'Агрегатная функция, которая вычисляет производную, подобную PromQL,
  по данным временных рядов на указанной сетке.'
'sidebar_position': 227
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesDerivToGrid'
'title': 'timeSeriesDerivToGrid'
'doc_type': 'reference'
---
Агрегатная функция, которая принимает данные временных рядов в виде пар временных меток и значений и вычисляет [производную в стиле PromQL](https://prometheus.io/docs/prometheus/latest/querying/functions/#deriv) из этих данных по регулярной временной сетке, описанной начальной временной меткой, конечной временной меткой и шагом. Для каждой точки на сетке образцы для вычисления `deriv` рассматриваются в пределах указанного временного окна.

Параметры:
- `start timestamp` - Определяет начало сетки.
- `end timestamp` - Определяет конец сетки.
- `grid step` - Определяет шаг сетки в секундах.
- `staleness` - Определяет максимальную "устарелость" в секундах рассматриваемых образцов. Окно устарелости является левосторонним открытым и правосторонним закрытым интервалом.

Аргументы:
- `timestamp` - временная метка образца
- `value` - значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
Значения `deriv` на указанной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение NULL, если недостаточно образцов в пределах окна для вычисления значения производной для конкретной точки сетки.

Пример:
Следующий запрос вычисляет значения `deriv` на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210]:

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window parameter
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesDerivToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesDerivToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)─┐
1. │ [NULL,NULL,0,0.1,0.11,0.15,NULL,NULL,0.15]                                              │
   └─────────────────────────────────────────────────────────────────────────────────────────┘
```

Также возможно передать несколько образцов временных меток и значений в виде массивов одинакового размера. Тот же запрос с аргументами массива:

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
Эта функция экспериментальная, включите ее, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::