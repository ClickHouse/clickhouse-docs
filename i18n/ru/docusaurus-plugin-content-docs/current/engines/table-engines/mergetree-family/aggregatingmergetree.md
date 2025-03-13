---
slug: /engines/table-engines/mergetree-family/aggregatingmergetree
sidebar_position: 60
sidebar_label:  AggregatingMergeTree
title: "AggregatingMergeTree"
description: "Заменяет все строки с одинаковым первичным ключом (или, точнее, с одинаковым [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) одной строкой (внутри одной части данных), которая хранит комбинацию состояний агрегирующих функций."
---


# AggregatingMergeTree

Этот движок наследуется от [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree), изменяя логику слияния частей данных. ClickHouse заменяет все строки с одинаковым первичным ключом (или, точнее, с одинаковым [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) одной строкой (внутри одной части данных), которая хранит комбинацию состояний агрегирующих функций.

Вы можете использовать таблицы `AggregatingMergeTree` для инкрементной агрегации данных, включая агрегированные материализованные представления.

Вы можете увидеть пример использования AggregatingMergeTree и агрегирующих функций в приведенном ниже видео:
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Состояния агрегации в ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

Движок обрабатывает все колонки со следующими типами:

## [AggregateFunction](../../../sql-reference/data-types/aggregatefunction.md) {#aggregatefunction}
## [SimpleAggregateFunction](../../../sql-reference/data-types/simpleaggregatefunction.md) {#simpleaggregatefunction}

Использование `AggregatingMergeTree` уместно, если это уменьшает количество строк на порядки.

## Создание таблицы {#creating-a-table}

``` sql
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

**Классы запросов**

При создании таблицы `AggregatingMergeTree` требуются те же [классы](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах и, если возможно, переключите старые проекты на описанный выше метод.
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] AggregatingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

Все параметры имеют такое же значение, как в `MergeTree`.
</details>

## SELECT и INSERT {#select-and-insert}

Чтобы вставить данные, используйте [INSERT SELECT](../../../sql-reference/statements/insert-into.md) запрос с агрегирующими функциями -State-.
При выборке данных из таблицы `AggregatingMergeTree` используйте оператор `GROUP BY` и такие же агрегирующие функции, как и при вставке данных, добавляя суффикс `-Merge`.

В результатах запроса `SELECT` значения типа `AggregateFunction` имеют конкретное бинарное представление для всех форматов вывода ClickHouse. Например, если вы выгружаете данные в формате `TabSeparated` с помощью запроса `SELECT`, то этот дамп можно загрузить обратно с помощью запроса `INSERT`.

## Пример агрегированного материализованного представления {#example-of-an-aggregated-materialized-view}

Следующий пример предполагает, что у вас есть база данных с именем `test`, так что создайте ее, если она еще не существует:

```sql
CREATE DATABASE test;
```

Теперь создайте таблицу `test.visits`, которая содержит сырые данные:

``` sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

Далее вам нужна таблица `AggregatingMergeTree`, которая будет хранить `AggregationFunction`, отслеживающие общее количество визитов и количество уникальных пользователей. 

Создайте материализованное представление `AggregatingMergeTree`, которое следит за таблицей `test.visits` и использует тип `AggregateFunction`:

``` sql
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

``` sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

Данные вставляются как в `test.visits`, так и в `test.agg_visits`.

Чтобы получить агрегированные данные, выполните запрос, такой как `SELECT ... GROUP BY ...` из материализованного представления `test.mv_visits`:

```sql
SELECT
    StartDate,
    sumMerge(Visits) AS Visits,
    uniqMerge(Users) AS Users
FROM test.agg_visits
GROUP BY StartDate
ORDER BY StartDate;
```

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │      9 │     2 │
└─────────────────────────┴────────┴───────┘
```

Добавьте еще пару записей в `test.visits`, но на этот раз попробуйте использовать другую метку времени для одной из записей:

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

## Связанный контент {#related-content}

- Блог: [Использование агрегирующих комбинирующих функций в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
