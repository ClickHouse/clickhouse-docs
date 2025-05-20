---
description: 'Заменяет все строки с одинаковым первичным ключом (или, точнее, с 
  тем же [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md))
  на одну строку (в пределах одной части данных), которая хранит комбинацию состояний
  агрегатных функций.'
sidebar_label: 'AggregatingMergeTree'
sidebar_position: 60
slug: /engines/table-engines/mergetree-family/aggregatingmergetree
title: 'AggregatingMergeTree'
---


# AggregatingMergeTree

Движок наследует от [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree), изменяя логику слияния частей данных. ClickHouse заменяет все строки с одинаковым первичным ключом (или, точнее, с тем же [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) на одну строку (в пределах одной части данных), которая хранит комбинацию состояний агрегатных функций.

Вы можете использовать таблицы `AggregatingMergeTree` для инкрементной агрегации данных, включая агрегированные материализованные представления.

Вы можете увидеть пример того, как использовать AggregatingMergeTree и агрегатные функции в приведённом ниже видео:
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Состояния агрегации в ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

Движок обрабатывает все колонки со следующими типами:

## [AggregateFunction](../../../sql-reference/data-types/aggregatefunction.md) {#aggregatefunction}
## [SimpleAggregateFunction](../../../sql-reference/data-types/simpleaggregatefunction.md) {#simpleaggregatefunction}

Использование `AggregatingMergeTree` оправдано, если оно уменьшает количество строк на порядок.

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

**Клаузы запросов**

При создании таблицы `AggregatingMergeTree` требуются те же [клаузы](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах и, если возможно, переключите старые проекты на описанный выше метод.
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

## SELECT и INSERT {#select-and-insert}

Чтобы вставить данные, используйте запрос [INSERT SELECT](../../../sql-reference/statements/insert-into.md) с агрегатными -State- функциями. 
При выборке данных из таблицы `AggregatingMergeTree` используйте оператор `GROUP BY` и те же агрегатные функции, что и при вставке данных, но с суффиксом `-Merge`.

В результате запроса `SELECT` значения типа `AggregateFunction` имеют специфическое для реализации бинарное представление для всех форматов вывода ClickHouse. Например, если вы выведите данные в формате `TabSeparated` с помощью запроса `SELECT`, то этот дамп можно будет загрузить обратно с помощью запроса `INSERT`.

## Пример агрегированного материализованного представления {#example-of-an-aggregated-materialized-view}

В следующем примере предполагается, что у вас есть база данных с именем `test`, поэтому создайте её, если она ещё не существует:

```sql
CREATE DATABASE test;
```

Теперь создайте таблицу `test.visits`, которая содержит необработанные данные:

```sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

Затем вам нужна таблица `AggregatingMergeTree`, которая будет хранить `AggregationFunction`, отслеживающие общее количество посещений и количество уникальных пользователей. 

Создайте материализованное представление `AggregatingMergeTree`, которое будет следить за таблицей `test.visits` и использовать тип `AggregateFunction`:

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

Чтобы получить агрегированные данные, выполните запрос, например, `SELECT ... GROUP BY ...` из материализованного представления `test.visits_mv`:

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

Добавьте ещё несколько записей в `test.visits`, но на этот раз попробуйте использовать другую метку времени для одной из записей:

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1669446031000, 2, 5, 10), (1667446031000, 3, 7, 5);
```

Снова запустите запрос `SELECT`, который вернет следующий результат:

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │     16 │     3 │
│ 2022-11-26 07:00:31.000 │      5 │     1 │
└─────────────────────────┴────────┴───────┘
```

## Связанное содержимое {#related-content}

- Блог: [Использование объединителей агрегатов в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
