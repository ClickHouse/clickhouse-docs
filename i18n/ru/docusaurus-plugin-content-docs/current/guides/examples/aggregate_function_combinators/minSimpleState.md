---
slug: '/examples/aggregate-function-combinators/minSimpleState'
title: 'minSimpleState'
description: 'Пример использования комбинатора minSimpleState'
keywords: ['min', 'state', 'simple', 'combinator', 'examples', 'minSimpleState']
sidebar_label: 'minSimpleState'
doc_type: 'reference'
---



# minSimpleState {#minsimplestate}


## Описание {#description}

Комбинатор [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) может применяться к функции [`min`](/sql-reference/aggregate-functions/reference/min)
для получения минимального значения среди всех входных значений. Возвращает результат типа [`SimpleAggregateFunction`](/docs/sql-reference/data-types/simpleaggregatefunction).


## Пример использования {#example-usage}

Рассмотрим практический пример с использованием таблицы, которая отслеживает ежедневные показания температуры. Для каждого местоположения необходимо сохранять самую низкую зарегистрированную температуру.
Использование типа `SimpleAggregateFunction` с `min` автоматически обновляет
сохранённое значение при обнаружении более низкой температуры.

Создайте исходную таблицу для необработанных показаний температуры:

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

Создайте агрегатную таблицу для хранения минимальных температур:

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

Создайте инкрементное материализованное представление, которое будет действовать как триггер вставки
для вставляемых данных и поддерживать минимальную и максимальную температуры для каждого местоположения.

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

Вставьте начальные показания температуры:

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
(1, 'North', 5),
(2, 'South', 15),
(3, 'West', 10),
(4, 'East', 8);
```

Эти показания автоматически обрабатываются материализованным представлением. Проверим
текущее состояние:

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

Вставьте дополнительные данные:

```sql
INSERT INTO raw_temperature_readings (location_id, location_name, temperature) VALUES
    (1, 'North', 3),
    (2, 'South', 18),
    (3, 'West', 10),
    (1, 'North', 8),
    (4, 'East', 2);
```

Просмотрите обновлённые экстремумы после добавления новых данных:

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

Обратите внимание, что выше для каждого местоположения присутствует два значения. Это происходит потому, что
куски ещё не были объединены (и агрегированы движком `AggregatingMergeTree`). Чтобы получить
окончательный результат из частичных состояний, необходимо добавить `GROUP BY`:

```sql
SELECT
    location_id,
    location_name,
    min(min_temp) AS min_temp,  -- Агрегация по всем кускам
    max(max_temp) AS max_temp   -- Агрегация по всем кускам
FROM temperature_extremes
GROUP BY location_id, location_name
ORDER BY location_id;
```

Теперь мы получаем ожидаемый результат:


```sql
┌─location_id─┬─location_name─┬─min_temp─┬─max_temp─┐
│           1 │ Север         │        3 │        8 │
│           2 │ Юг            │       15 │       18 │
│           3 │ Запад         │       10 │       10 │
│           4 │ Восток        │        2 │        8 │
└─────────────┴───────────────┴──────────┴──────────┘
```

:::note
При использовании `SimpleState` нет необходимости применять комбинатор `Merge` для объединения
частичных состояний агрегации.
:::


## См. также {#see-also}

- [`min`](/sql-reference/aggregate-functions/reference/min)
- [Комбинатор `SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [Тип `SimpleAggregateFunction`](/sql-reference/data-types/simpleaggregatefunction)
