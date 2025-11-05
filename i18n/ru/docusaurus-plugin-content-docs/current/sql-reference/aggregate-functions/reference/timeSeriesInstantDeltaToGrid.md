---
'description': 'Агрегатная функция, которая вычисляет PromQL-подобный idelta по данным
  временных рядов на указанной сетке.'
'sidebar_position': 222
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesInstantDeltaToGrid'
'title': 'timeSeriesInstantDeltaToGrid'
'doc_type': 'reference'
---
Агрегатная функция, которая принимает данные временных рядов в виде пар временных меток и значений и вычисляет [PromQL-подобный idelta](https://prometheus.io/docs/prometheus/latest/querying/functions/#idelta) из этих данных на регулярной временной сетке, описанной начальной временной меткой, конечной временной меткой и шагом. Для каждой точки на сетке образцы для вычисления `idelta` рассматриваются в пределах указанного временного окна.

Параметры:
- `start timestamp` - Указывает начало сетки.
- `end timestamp` - Указывает конец сетки.
- `grid step` - Указывает шаг сетки в секундах.
- `staleness` - Указывает максимальную "устаревшую" временную метку в секундах для рассматриваемых образцов. Окно устаревания является левосторонним и правосторонним интервалом.

Аргументы:
- `timestamp` - временная метка образца
- `value` - значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
`idelta` значения на указанной сетке как `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение равно NULL, если недостаточно образцов в окне для вычисления значения мгновенного дельта для конкретной точки сетки.

Пример:
Следующий запрос вычисляет `idelta` значения на сетке [90, 105, 120, 135, 150, 165, 180, 195, 210]:

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to window parameter
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    45 AS window_seconds  -- "staleness" window
SELECT timeSeriesInstantDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesInsta⋯stamps, values)─┐
1. │ [NULL,NULL,0,2,1,1,NULL,NULL,3] │
   └─────────────────────────────────┘
```

Также возможно передать несколько образцов временных меток и значений в виде массивов одинакового размера. Тот же запрос с аргументами массивов:

```sql
WITH
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values,
    90 AS start_ts,
    90 + 120 AS end_ts,
    15 AS step_seconds,
    45 AS window_seconds
SELECT timeSeriesInstantDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values);
```

:::note
Эта функция является экспериментальной, включите её, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::