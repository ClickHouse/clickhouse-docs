---
'description': 'Сортирует временные ряды по временной метке в порядке возрастания.'
'sidebar_position': 146
'slug': '/sql-reference/aggregate-functions/reference/timeSeriesGroupArray'
'title': 'timeSeriesGroupArray'
'doc_type': 'reference'
---
# timeSeriesGroupArray

Сортирует временные ряды по метке времени в порядке возрастания.

**Синтаксис**

```sql
timeSeriesGroupArray(timestamp, value)
```

**Аргументы**

- `timestamp` - метка времени образца
- `value` - значение временного ряда, соответствующее метке времени `timestamp`

**Возвращаемое значение**

Функция возвращает массив кортежей (`timestamp`, `value`), отсортированных по метке времени `timestamp` в порядке возрастания. Если для одной и той же метки времени существует несколько значений, то функция выбирает наибольшее из этих значений.

**Пример**

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- array of values corresponding to timestamps above
SELECT timeSeriesGroupArray(timestamp, value)
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
   ┌─timeSeriesGroupArray(timestamp, value)───────┐
1. │ [(100,5),(110,1),(120,6),(130,8),(140,19)]   │
   └──────────────────────────────────────────────┘
```

Также возможно передавать несколько образцов меток времени и значений в виде массивов одинакового размера. Тот же запрос с массивами в аргументах:

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- array of values corresponding to timestamps above
SELECT timeSeriesGroupArray(timestamps, values);
```

:::note
Эта функция является экспериментальной, включите её, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::