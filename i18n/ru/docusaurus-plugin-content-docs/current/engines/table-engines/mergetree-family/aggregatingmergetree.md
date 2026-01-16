---
description: 'Заменяет все строки с одинаковым первичным ключом (или, точнее, с одинаковым [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) одной строкой (в пределах одной части данных), которая хранит объединённое состояние агрегатных функций.'
sidebar_label: 'AggregatingMergeTree'
sidebar_position: 60
slug: /engines/table-engines/mergetree-family/aggregatingmergetree
title: 'Движок таблицы AggregatingMergeTree'
doc_type: 'reference'
---

# Движок таблиц AggregatingMergeTree \\{#aggregatingmergetree-table-engine\\}

Движок наследуется от [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) и изменяет логику слияния частей данных. ClickHouse заменяет все строки с одинаковым первичным ключом (или, точнее, с одинаковым [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) одной строкой (в пределах одной части данных), которая хранит комбинацию состояний агрегатных функций.

Вы можете использовать таблицы `AggregatingMergeTree` для инкрементальной агрегации данных, в том числе для материализованных представлений с агрегированными данными.

Пример использования AggregatingMergeTree и агрегатных функций показан в видео ниже:
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Состояния агрегации в ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

Движок обрабатывает все столбцы со следующими типами:

- [`AggregateFunction`](../../../sql-reference/data-types/aggregatefunction.md)
- [`SimpleAggregateFunction`](../../../sql-reference/data-types/simpleaggregatefunction.md)

Имеет смысл использовать `AggregatingMergeTree`, если он уменьшает число строк на несколько порядков.

## Создание таблицы \\{#creating-a-table\\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = AggregatingMergeTree()
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[TTL expr]
[SETTINGS name=value, ...]
```

Для описания параметров запроса см. [описание запроса](../../../sql-reference/statements/create/table.md).

**Части запроса**

При создании таблицы `AggregatingMergeTree` требуются те же [части запроса](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

<details markdown="1">
  <summary>Устаревший способ создания таблицы</summary>

  :::note
  Не используйте этот способ в новых проектах и по возможности переведите старые проекты на метод, описанный выше.
  :::

  ```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] AggregatingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

  Все параметры имеют то же значение, что и в `MergeTree`.
</details>

## SELECT и INSERT \\{#select-and-insert\\}

Для вставки данных используйте запрос [INSERT SELECT](../../../sql-reference/statements/insert-into.md) с агрегирующими функциями с суффиксом `-State`.
При выборке данных из таблицы `AggregatingMergeTree` используйте предложение `GROUP BY` и те же агрегирующие функции, что и при вставке данных, но с суффиксом `-Merge`.

В результатах запроса `SELECT` значения типа `AggregateFunction` имеют двоичное представление, зависящее от реализации, для всех форматов вывода ClickHouse. Например, если вы выгружаете данные в формате `TabSeparated` с помощью запроса `SELECT`, то этот дамп можно загрузить обратно с помощью запроса `INSERT`.

## Пример агрегированного материализованного представления \\{#example-of-an-aggregated-materialized-view\\}

В этом примере предполагается, что у вас есть база данных под названием `test`. Создайте её, если она ещё не существует, с помощью приведённой ниже команды:

```sql
CREATE DATABASE test;
```

Теперь создайте таблицу `test.visits`, которая содержит сырые данные:

```sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

Далее необходимо создать таблицу `AggregatingMergeTree`, которая будет хранить агрегирующие функции `AggregationFunction`, отслеживающие общее количество посещений и количество уникальных пользователей.

Создайте материализованное представление с движком `AggregatingMergeTree`, которое отслеживает таблицу `test.visits` и использует тип [`AggregateFunction`](/sql-reference/data-types/aggregatefunction):

```sql
CREATE TABLE test.agg_visits (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Visits AggregateFunction(sum, Nullable(Int32)),
    Users AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree() ORDER BY (StartDate, CounterID);
```

Создайте материализованное представление, которое заполняет таблицу `test.agg_visits` данными из `test.visits`:

```sql
CREATE MATERIALIZED VIEW test.visits_mv TO test.agg_visits
AS SELECT
    StartDate,
    CounterID,
    sumState(Sign) AS Visits,
    uniqState(UserID) AS Users
FROM test.visits
GROUP BY StartDate, CounterID;
```

Добавьте данные в таблицу `test.visits`:

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

Данные вставляются как в `test.visits`, так и в `test.agg_visits`.

Чтобы получить агрегированные данные, выполните запрос вида `SELECT ... GROUP BY ...` к материализованному представлению `test.visits_mv`:

```sql
SELECT
    StartDate,
    sumMerge(Visits) AS Visits,
    uniqMerge(Users) AS Users
FROM test.visits_mv
GROUP BY StartDate
ORDER BY StartDate;
```

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │      9 │     2 │
└─────────────────────────┴────────┴───────┘
```

Добавьте ещё пару записей в `test.visits`, но на этот раз попробуйте использовать другое значение временной метки для одной из записей:

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1669446031000, 2, 5, 10), (1667446031000, 3, 7, 5);
```

Выполните запрос `SELECT` ещё раз — будет выведен следующий результат:

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │     16 │     3 │
│ 2022-11-26 07:00:31.000 │      5 │     1 │
└─────────────────────────┴────────┴───────┘
```

В некоторых случаях вы можете захотеть избежать предварительной агрегации строк во время вставки, чтобы перенести нагрузку агрегации с момента вставки
на момент слияния. Обычно необходимо включать столбцы, которые не участвуют в агрегации, в оператор `GROUP BY`
в определении материализованного представления, чтобы избежать ошибки. Однако вы можете воспользоваться функцией [`initializeAggregation`](/sql-reference/functions/other-functions#initializeAggregation)
с настройкой `optimize_on_insert = 0` (по умолчанию она включена), чтобы добиться этого. Использование `GROUP BY`
в этом случае больше не требуется:

```sql
CREATE MATERIALIZED VIEW test.visits_mv TO test.agg_visits
AS SELECT
    StartDate,
    CounterID,
    initializeAggregation('sumState', Sign) AS Visits,
    initializeAggregation('uniqState', UserID) AS Users
FROM test.visits;
```

:::note
При использовании `initializeAggregation` агрегатное состояние создаётся для каждой отдельной строки без группировки.
Каждая исходная строка даёт одну строку в материализованном представлении, а фактическая агрегация происходит позже, когда
`AggregatingMergeTree` объединяет части. Это верно только в том случае, если `optimize_on_insert = 0`.
:::

## Связанные материалы \\{#related-content\\}

- Блог: [Использование комбинаторов агрегатных функций в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
