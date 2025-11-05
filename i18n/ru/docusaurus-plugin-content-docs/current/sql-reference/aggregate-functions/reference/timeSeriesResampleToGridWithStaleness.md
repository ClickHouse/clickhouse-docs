---
'description': 'Агрегатная функция, которая повторно выбирает данные временных рядов
  в указанную сетку.'
'sidebar_position': 226
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesResampleToGridWithStaleness'
'title': 'timeSeriesResampleToGridWithStaleness'
'doc_type': 'reference'
---
Агрегатная функция, которая принимает данные временных рядов в виде пар меток времени и значений и переобразует эти данные в регулярную временную сетку, описанную начальной меткой времени, конечной меткой времени и шагом. Для каждой точки в сетке выбирается наиболее недавний (в пределах указанного временного окна) образец.

Псевдоним: `timeSeriesLastToGrid`.

Параметры:
- `start timestamp` - задает начало сетки
- `end timestamp` - задает конец сетки
- `grid step` - задает шаг сетки в секундах
- `staleness window` - задает максимальную "устарелость" наиболее последнего образца в секундах

Аргументы:
- `timestamp` - метка времени образца
- `value` - значение временного ряда, соответствующее `timestamp`

Возвращаемое значение:
значения временного ряда, переобразованные в указанную сетку в виде `Array(Nullable(Float64))`. Возвращаемый массив содержит одно значение для каждой точки временной сетки. Значение равно NULL, если для конкретной точки сетки нет образца.

Пример:
Следующий запрос переобразует данные временных рядов в сетку [90, 105, 120, 135, 150, 165, 180, 195, 210], выбирая значение не старше 30 секунд для каждой точки в сетке:

```sql
WITH
    -- NOTE: the gap between 140 and 190 is to show how values are filled for ts = 150, 165, 180 according to staleness window parameter
    [110, 120, 130, 140, 190, 200, 210, 220, 230]::Array(DateTime) AS timestamps,
    [1, 1, 3, 4, 5, 5, 8, 12, 13]::Array(Float32) AS values, -- array of values corresponding to timestamps above
    90 AS start_ts,       -- start of timestamp grid
    90 + 120 AS end_ts,   -- end of timestamp grid
    15 AS step_seconds,   -- step of timestamp grid
    30 AS window_seconds  -- "staleness" window
SELECT timeSeriesResampleToGridWithStaleness(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
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
   ┌─timeSeriesResa⋯stamp, value)─┐
1. │ [NULL,NULL,1,3,4,4,NULL,5,8] │
   └──────────────────────────────┘
```

Также возможно передавать несколько образцов меток времени и значений в виде массивов одинакового размера. Тот же запрос с массивными аргументами:

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
Эта функция является экспериментальной, включите её, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::