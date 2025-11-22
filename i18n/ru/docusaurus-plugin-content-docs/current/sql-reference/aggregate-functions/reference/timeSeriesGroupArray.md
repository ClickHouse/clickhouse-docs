---
description: 'Сортирует временные ряды по метке времени по возрастанию.'
sidebar_position: 146
slug: /sql-reference/aggregate-functions/reference/timeSeriesGroupArray
title: 'timeSeriesGroupArray'
doc_type: 'reference'
---

# timeSeriesGroupArray

Сортирует временные ряды по метке времени в порядке возрастания.

**Синтаксис**

```sql
timeSeriesGroupArray(timestamp, value)
```

**Аргументы**

* `timestamp` — метка времени отсчёта
* `value` — значение временного ряда, соответствующее `timestamp`

**Возвращаемое значение**

Функция возвращает массив кортежей (`timestamp`, `value`), отсортированный по `timestamp` по возрастанию.
Если для одного и того же `timestamp` есть несколько значений, функция выбирает максимальное из них.

**Пример**

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- массив значений, соответствующих временным меткам выше
SELECT timeSeriesGroupArray(timestamp, value)
FROM
(
    -- Этот подзапрос преобразует массивы временных меток и значений в строки со столбцами `timestamp`, `value`
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

Также можно передать несколько наборов меток времени и значений в виде массивов одинакового размера. Тот же запрос с аргументами-массивами:

```sql
WITH
    [110, 120, 130, 140, 140, 100]::Array(UInt32) AS timestamps,
    [1, 6, 8, 17, 19, 5]::Array(Float32) AS values -- массив значений, соответствующих указанным выше временным меткам
SELECT timeSeriesGroupArray(timestamps, values);
```

:::note
Эта функция экспериментальная. Чтобы её включить, установите `allow_experimental_ts_to_grid_aggregate_function=true`.
:::
