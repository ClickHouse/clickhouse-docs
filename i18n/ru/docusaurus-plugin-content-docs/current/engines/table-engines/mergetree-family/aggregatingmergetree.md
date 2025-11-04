---
slug: '/engines/table-engines/mergetree-family/aggregatingmergetree'
sidebar_label: AggregatingMergeTree
sidebar_position: 60
description: 'Заменяет все строки с одним и тем же первичным ключом (или, более'
title: AggregatingMergeTree
doc_type: reference
---
# AggregatingMergeTree

Движок наследует от [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree), изменяя логику слияния частей данных. ClickHouse заменяет все строки с одинаковым первичным ключом (или, точнее, с одинаковым [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) на одну строку (в пределах одной части данных), которая хранит комбинацию состояний агрегатных функций.

Вы можете использовать таблицы `AggregatingMergeTree` для инкрементной агрегации данных, включая агрегированные материализованные представления.

Вы можете увидеть пример того, как использовать `AggregatingMergeTree` и агрегатные функции в видео ниже:
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Aggregation States in ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

Движок обрабатывает все колонки со следующими типами:

- [`AggregateFunction`](../../../sql-reference/data-types/aggregatefunction.md)
- [`SimpleAggregateFunction`](../../../sql-reference/data-types/simpleaggregatefunction.md)

Использование `AggregatingMergeTree` уместно, если оно снижает количество строк на порядки.

## Создание таблицы {#creating-a-table}

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

Для описания параметров запроса смотрите [описание запроса](../../../sql-reference/statements/create/table.md).

**Клаузы запроса**

При создании таблицы `AggregatingMergeTree` требуются те же [клаузулы](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах и, если возможно, переведите старые проекты на вышеописанный метод.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] AggregatingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

Все параметры имеют такое же значение, как и в `MergeTree`.
</details>

## SELECT и INSERT {#select-and-insert}

Для вставки данных используйте запрос [INSERT SELECT](../../../sql-reference/statements/insert-into.md) с агрегатными функциями -State-.
При выборке данных из таблицы `AggregatingMergeTree` используйте клаузу `GROUP BY` и те же агрегатные функции, что и при вставке данных, но с суффиксом `-Merge`.

В результатах запроса `SELECT` значения типа `AggregateFunction` имеют специфическое бинарное представление для всех форматов вывода ClickHouse. Например, если вы выгрузите данные в формате `TabSeparated` с помощью запроса `SELECT`, то эту выгрузку можно загрузить обратно с использованием запроса `INSERT`.

## Пример агрегированного материализованного представления {#example-of-an-aggregated-materialized-view}

Следующий пример предполагает, что у вас есть база данных с именем `test`. Создайте ее, если она еще не существует, с помощью команды ниже:

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

Далее вам нужна таблица `AggregatingMergeTree`, которая будет хранить `AggregationFunction`, которые отслеживают общее количество визитов и количество уникальных пользователей.

Создайте материализованное представление `AggregatingMergeTree`, которое следит за таблицей `test.visits` и использует тип [`AggregateFunction`](/sql-reference/data-types/aggregatefunction):

```sql
CREATE TABLE test.agg_visits (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Visits AggregateFunction(sum, Nullable(Int32)),
    Users AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree() ORDER BY (StartDate, CounterID);
```

Создайте материализованное представление, которое заполняет `test.agg_visits` из `test.visits`:

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

Вставьте данные в таблицу `test.visits`:

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

Данные вставляются как в `test.visits`, так и в `test.agg_visits`.

Чтобы получить агрегированные данные, выполните запрос, такой как `SELECT ... GROUP BY ...` из материализованного представления `test.visits_mv`:

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

Добавьте еще пару записей в `test.visits`, но на этот раз попробуйте использовать другой временной штамп для одной из записей:

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1669446031000, 2, 5, 10), (1667446031000, 3, 7, 5);
```

Снова выполните запрос `SELECT`, который вернет следующий результат:

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │     16 │     3 │
│ 2022-11-26 07:00:31.000 │      5 │     1 │
└─────────────────────────┴────────┴───────┘
```

В некоторых случаях вы можете хотеть избежать предагрегации строк во время вставки, чтобы перенести затраты на агрегацию с времени вставки на время слияния. Обычно в определении материализованного представления необходимо включить колонки, которые не являются частью агрегации, в клаузу `GROUP BY`, чтобы избежать ошибки. Тем не менее, вы можете использовать функцию [`initializeAggregation`](/sql-reference/functions/other-functions#initializeaggregation) с установкой `optimize_on_insert = 0` (по умолчанию включена), чтобы достичь этого. Использование `GROUP BY` больше не требуется в этом случае:

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
При использовании `initializeAggregation` создается агрегатное состояние для каждой отдельной строки без группировки.
Каждая исходная строка производит одну строку в материализованном представлении, а фактическая агрегация происходит позже, когда
`AggregatingMergeTree` сливает части. Это верно только если `optimize_on_insert = 0`.
:::

## Связанный контент {#related-content}

- Блог: [Использование агрегатных комбинирования в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)