---
description: 'Агрегатная функция для ресемплирования временных рядов для вычисления PromQL‑подобных irate и idelta'
sidebar_position: 224
slug: /sql-reference/aggregate-functions/reference/timeSeriesLastTwoSamples
title: 'timeSeriesLastTwoSamples'
doc_type: 'reference'
---

Агрегатная функция, которая принимает данные временного ряда в виде пар «метка времени — значение» и хранит не более двух последних измерений.

Аргументы:

* `timestamp` - метка времени измерения
* `value` - значение временного ряда, соответствующее `timestamp`\
  Также можно передать несколько измерений меток времени и значений в виде массивов (`Array`) одинакового размера.

Возвращаемое значение:
`Tuple(Array(DateTime), Array(Float64))` — пара массивов одинаковой длины от 0 до 2. Первый массив содержит метки времени выборок временного ряда, второй массив содержит соответствующие значения временного ряда.

Пример:
Эта агрегатная функция предназначена для использования с материализованным представлением и агрегирующей таблицей, которые хранят ресемплированные данные временных рядов для меток времени, выровненных по сетке.
Рассмотрим следующий пример таблицы для сырых данных и таблицу для хранения ресемплированных данных:

```sql
-- Таблица для необработанных данных
CREATE TABLE t_raw_timeseries
(
    metric_id UInt64,
    timestamp DateTime64(3, 'UTC') CODEC(DoubleDelta, ZSTD),
    value Float64 CODEC(DoubleDelta)
)
ENGINE = MergeTree()
ORDER BY (metric_id, timestamp);

-- Таблица с данными, передискретизированными с более крупным (15 сек) временным шагом
CREATE TABLE t_resampled_timeseries_15_sec
(
    metric_id UInt64,
    grid_timestamp DateTime('UTC') CODEC(DoubleDelta, ZSTD), -- Временная метка, выровненная по сетке 15 сек
    samples AggregateFunction(timeSeriesLastTwoSamples, DateTime64(3, 'UTC'), Float64)
)
ENGINE = AggregatingMergeTree()
ORDER BY (metric_id, grid_timestamp);

-- Материализованное представление для заполнения передискретизированной таблицы
CREATE MATERIALIZED VIEW mv_resampled_timeseries TO t_resampled_timeseries_15_sec
(
    metric_id UInt64,
    grid_timestamp DateTime('UTC') CODEC(DoubleDelta, ZSTD),
    samples AggregateFunction(timeSeriesLastTwoSamples, DateTime64(3, 'UTC'), Float64)
)
AS SELECT
    metric_id,
    ceil(toUnixTimestamp(timestamp + interval 999 millisecond) / 15, 0) * 15 AS grid_timestamp,   -- Округление временной метки вверх до следующей точки сетки
    initializeAggregation('timeSeriesLastTwoSamplesState', timestamp, value) AS samples
FROM t_raw_timeseries
ORDER BY metric_id, grid_timestamp;
```

Вставьте тестовые данные и выберите данные за период с &#39;2024-12-12 12:00:12&#39; по &#39;2024-12-12 12:00:30&#39;

```sql
-- Вставка данных
INSERT INTO t_raw_timeseries(metric_id, timestamp, value) SELECT number%10 AS metric_id, '2024-12-12 12:00:00'::DateTime64(3, 'UTC') + interval ((number/10)%100)*900 millisecond as timestamp, number%3+number%29 AS value FROM numbers(1000);

-- Проверка исходных данных
SELECT *
FROM t_raw_timeseries
WHERE metric_id = 3 AND timestamp BETWEEN '2024-12-12 12:00:12' AND '2024-12-12 12:00:31'
ORDER BY metric_id, timestamp;
```


```response
3    2024-12-12 12:00:12.870    29
3    2024-12-12 12:00:13.770    8
3    2024-12-12 12:00:14.670    19
3    2024-12-12 12:00:15.570    30
3    2024-12-12 12:00:16.470    9
3    2024-12-12 12:00:17.370    20
3    2024-12-12 12:00:18.270    2
3    2024-12-12 12:00:19.170    10
3    2024-12-12 12:00:20.070    21
3    2024-12-12 12:00:20.970    3
3    2024-12-12 12:00:21.870    11
3    2024-12-12 12:00:22.770    22
3    2024-12-12 12:00:23.670    4
3    2024-12-12 12:00:24.570    12
3    2024-12-12 12:00:25.470    23
3    2024-12-12 12:00:26.370    5
3    2024-12-12 12:00:27.270    13
3    2024-12-12 12:00:28.170    24
3    2024-12-12 12:00:29.069    6
3    2024-12-12 12:00:29.969    14
3    2024-12-12 12:00:30.869    25
```

Выберите два последних образца для меток времени &#39;2024-12-12 12:00:15&#39; и &#39;2024-12-12 12:00:30&#39;:

```sql
-- Проверка данных после ресемплирования
SELECT metric_id, grid_timestamp, (finalizeAggregation(samples).1 as timestamp, finalizeAggregation(samples).2 as value) 
FROM t_resampled_timeseries_15_sec
WHERE metric_id = 3 AND grid_timestamp BETWEEN '2024-12-12 12:00:15' AND '2024-12-12 12:00:30'
ORDER BY metric_id, grid_timestamp;
```

```response
3    2024-12-12 12:00:15    (['2024-12-12 12:00:14.670','2024-12-12 12:00:13.770'],[19,8])
3    2024-12-12 12:00:30    (['2024-12-12 12:00:29.969','2024-12-12 12:00:29.069'],[14,6])
```

Агрегированная таблица хранит только последние два значения для каждой временной метки, выровненной по 15 секундам. Это позволяет вычислять функции, аналогичные PromQL `irate` и `idelta`, считывая значительно меньше данных, чем хранится в исходной таблице.

```sql
-- Вычисление idelta и irate из необработанных данных
WITH
    '2024-12-12 12:00:15'::DateTime64(3,'UTC') AS start_ts,       -- начало сетки временных меток
    start_ts + INTERVAL 60 SECOND AS end_ts,   -- конец сетки временных меток
    15 AS step_seconds,   -- шаг сетки временных меток
    45 AS window_seconds  -- окно "устаревания"
SELECT
    metric_id,
    timeSeriesInstantDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value),
    timeSeriesInstantRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamp, value)
FROM t_raw_timeseries
WHERE metric_id = 3 AND timestamp BETWEEN start_ts - interval window_seconds seconds AND end_ts
GROUP BY metric_id;
```

```response
3    [11,8,-18,8,11]    [12.222222222222221,8.88888888888889,1.1111111111111112,8.88888888888889,12.222222222222221]
```


```sql
-- Вычисление idelta и irate из передискретизированных данных
WITH
    '2024-12-12 12:00:15'::DateTime64(3,'UTC') AS start_ts,       -- начало временной сетки
    start_ts + INTERVAL 60 SECOND AS end_ts,   -- конец временной сетки
    15 AS step_seconds,   -- шаг временной сетки
    45 AS window_seconds  -- окно устаревания
SELECT
    metric_id,
    timeSeriesInstantDeltaToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values),
    timeSeriesInstantRateToGrid(start_ts, end_ts, step_seconds, window_seconds)(timestamps, values)
FROM (
    SELECT
        metric_id,
        finalizeAggregation(samples).1 AS timestamps,
        finalizeAggregation(samples).2 AS values
    FROM t_resampled_timeseries_15_sec
    WHERE metric_id = 3 AND grid_timestamp BETWEEN start_ts - interval window_seconds seconds AND end_ts
)
GROUP BY metric_id;
```

```response
3    [11,8,-18,8,11]    [12.222222222222221,8.88888888888889,1.1111111111111112,8.88888888888889,12.222222222222221]
```

:::note
Эта функция экспериментальная. Включите её, установив `allow_experimental_ts_to_grid_aggregate_function=true`.
:::
