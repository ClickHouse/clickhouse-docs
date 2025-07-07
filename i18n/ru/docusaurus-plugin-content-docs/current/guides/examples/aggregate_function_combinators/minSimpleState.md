---
slug: '/examples/aggregate-function-combinators/minSimpleState'
title: 'minSimpleState'
description: 'Пример использования комбинатора minSimpleState'
keywords: ['min', 'state', 'simple', 'combinator', 'examples', 'minSimpleState']
sidebar_label: 'minSimpleState'
---


# minSimpleState {#minsimplestate}

## Description {#description}

Комбинатор [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) может быть применен к функции [`min`](/sql-reference/aggregate-functions/reference/min) для получения минимального значения среди всех входных значений. Он возвращает результат с типом [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction).

## Example Usage {#example-usage}

Рассмотрим практический пример использования таблицы, которая отслеживает ежедневные показания температуры. Для каждого местоположения мы хотим поддерживать наиболее низкую зарегистрированную температуру. Использование типа `SimpleAggregateFunction` с `min` автоматически обновляет хранимое значение при обнаружении более низкой температуры.

Создайте исходную таблицу для сырых показаний температуры:

```sql
CREATE TABLE raw_temperature_readings
(
    location_id UInt32,
    location_name String,
    temperature Int32,
    recorded_at DateTime DEFAULT now()
)
    ENGINE = MergeTree()
ORDER BY (location_id, recorded_at);
```

Создайте агрегатную таблицу, которая будет хранить минимальные температуры:

```sql
CREATE TABLE temperature_extremes
(
    location_id UInt32,
    location_name String,
    min_temp SimpleAggregateFunction(min, Int32),  -- Хранит минимальную температуру
    max_temp SimpleAggregateFunction(max, Int32)   -- Хранит максимальную температуру
)
ENGINE = AggregatingMergeTree()
ORDER BY location_id;
```

Создайте инкрементное материализованное представление, которое будет действовать как триггер вставки для добавленных данных и поддерживать минимальные и максимальные температуры для каждого местоположения.

```sql
CREATE MATERIALIZED VIEW temperature_extremes_mv
TO temperature_extremes
AS SELECT
    location_id,
    location_name,
    minSimpleState(temperature) AS min_temp,     -- Использование комбинатора SimpleState
    maxSimpleState(temperature) AS max_temp      -- Использование комбинатора SimpleState
FROM raw_temperature_readings
GROUP BY location_id, location_name;
```

Вставьте некоторые начальные показания температуры:

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
(1, 'North', 5),
(2, 'South', 15),
(3, 'West', 10),
(4, 'East', 8);
```

Эти показания автоматически обрабатываются материализованным представлением. Давайте проверим текущее состояние:

```sql
SELECT
    location_id,
    location_name,
    min_temp,     -- Прямой доступ к значениям SimpleAggregateFunction
    max_temp      -- Нет необходимости в функции финализации с SimpleAggregateFunction
FROM temperature_extremes
ORDER BY location_id;
```

```response
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        5 │        5 │
│           2 │ South         │       15 │       15 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        8 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

Вставьте еще данные:

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
    (1, 'North', 3),
    (2, 'South', 18),
    (3, 'West', 10),
    (1, 'North', 8),
    (4, 'East', 2);
```

Посмотрите обновленные экстремумы после новых данных:

```sql
SELECT
    location_id,
    location_name,
    min_temp,  
    max_temp
FROM temperature_extremes
ORDER BY location_id;
```

```response
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        3 │        8 │
│           1 │ North         │        5 │        5 │
│           2 │ South         │       18 │       18 │
│           2 │ South         │       15 │       15 │
│           3 │ West          │       10 │       10 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        2 │        2 │
│           4 │ East          │        8 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

Обратите внимание, что выше у нас есть два вставленных значения для каждого местоположения. Это происходит потому, что части еще не были объединены (и агрегированы с помощью `AggregatingMergeTree`). Чтобы получить окончательный результат из частичных состояний, нам нужно добавить `GROUP BY`:

```sql
SELECT
    location_id,
    location_name,
    min(min_temp) AS min_temp,  -- Агрегация по всем частям 
    max(max_temp) AS max_temp   -- Агрегация по всем частям
FROM temperature_extremes
GROUP BY location_id, location_name
ORDER BY location_id;
```

Теперь мы получаем ожидаемый результат:

```sql
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ North         │        3 │        8 │
│           2 │ South         │       15 │       18 │
│           3 │ West          │       10 │       10 │
│           4 │ East          │        2 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

:::note
С `SimpleState` вам не нужно использовать комбинатор `Merge` для объединения частичных состояний агрегации.
:::

## See also {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
