---
'description': 'Агрегатная функция, которая вычисляет PromQL-подобный irate по данным
  временных рядов на указанной сетке.'
'sidebar_position': 223
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesInstantRateToGrid'
'title': 'timeSeriesInstantRateToGrid'
'doc_type': 'reference'
---
Агрегатная функция, которая принимает данные временных рядов в виде пар меток времени и значений и вычисляет [PromQL-подобный irate](https://prometheus.io/docs/prometheus/latest/querying/functions/#irate) из этих данных на регулярной временной сетке, описанной начальной меткой времени, конечной меткой времени и шагом. Для каждой точки на сетке учитываются образцы для расчета `irate` в пределах указанного временного окна.

Параметры:
- `start timestamp` - Указывает начало сетки.
- `end timestamp` - Указывает конец сетки.
- `grid step` - Указывает шаг сетки в секундах.
- `staleness` - Указывает максимальную "устарелость" в секундах учитываемых образцов. Окно устарелости является левосторонним открытым и правосторонним закрытым интервалом.

Аргументы:
- `timestamp` - метка времени образца
- `value` - значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
`irate` значения на указанной сетке в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение равно NULL, если недостаточно образцов в пределах окна для расчета значения мгновенной скорости для конкретной точки сетки.

Пример:
Следующий запрос вычисляет `irate` значения на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210]:

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window paramater
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesInstantRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesInstantRa⋯timestamps, values)─┐
1. │ [NULL,NULL,0,0.2,0.1,0.1,NULL,NULL,0.3] │
   └─────────────────────────────────────────┘
```

Также возможно передавать несколько образцов меток времени и значений в виде массивов одинакового размера. Тот же запрос с аргументами массивов:

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
Эта функция экспериментальная, включите ее, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::