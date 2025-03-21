---
slug: /engines/table-engines/mergetree-family/replacingmergetree
sidebar_position: 40
sidebar_label:  ReplacingMergeTree
title: 'ReplacingMergeTree'
description: 'отличается от MergeTree тем, что удаляет дублирующиеся записи с одинаковым значением сортировочного ключа (`ORDER BY` секция таблицы, а не `PRIMARY KEY`).'
---


# ReplacingMergeTree

Данный движок отличается от [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) тем, что удаляет дублирующиеся записи с одинаковым значением [сортировочного ключа](../../../engines/table-engines/mergetree-family/mergetree.md) (`ORDER BY` секция таблицы, а не `PRIMARY KEY`).

Дедупликация данных происходит только во время слияния. Слияние происходит в фоновом режиме в неизвестное время, поэтому вы не можете планировать его. Часть данных может оставаться необработанной. Хотя вы можете выполнить несогласованное слияние, используя запрос `OPTIMIZE`, не рассчитывайте на его использование, так как запрос `OPTIMIZE` будет читать и записывать большое количество данных.

Таким образом, `ReplacingMergeTree` подходит для очистки дублирующихся данных в фоновом режиме для экономии места, но не гарантирует отсутствие дубликатов.

:::note
Подробное руководство по ReplacingMergeTree, включая лучшие практики и оптимизацию производительности, доступно [здесь](/guides/replacing-merge-tree).
:::

## Создание таблицы {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = ReplacingMergeTree([ver [, is_deleted]])
[PARTITION BY expr]
[ORDER BY expr]
[PRIMARY KEY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

Для описания параметров запроса смотрите [описание операторов](../../../sql-reference/statements/create/table.md).

:::note
Уникальность строк определяется секцией `ORDER BY` таблицы, а не `PRIMARY KEY`.
:::

## Параметры ReplacingMergeTree {#replacingmergetree-parameters}

### ver {#ver}

`ver` — колонка с номером версии. Тип `UInt*`, `Date`, `DateTime` или `DateTime64`. Опциональный параметр.

При слиянии `ReplacingMergeTree` из всех строк с одинаковым сортировочным ключом оставляет только одну:

   - Последнюю в выборке, если `ver` не задан. Выборка — это множество строк в наборе шардов, участвующих в слиянии. Наиболее недавно созданный шард (последняя вставка) будет последним в выборке. Таким образом, после дедупликации останется самая последняя строка от самой недавней вставки для каждого уникального сортировочного ключа.
   - С максимальной версией, если `ver` задан. Если `ver` одинаковый для нескольких строк, тогда будет использоваться правило "если `ver` не задан", т.е. останется самая последняя вставленная строка.

Пример:

```sql
-- без ver - последняя вставленная 'выигрывает'
CREATE TABLE myFirstReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime
)
ENGINE = ReplacingMergeTree
ORDER BY key;

INSERT INTO myFirstReplacingMT Values (1, 'first', '2020-01-01 01:01:01');
INSERT INTO myFirstReplacingMT Values (1, 'second', '2020-01-01 00:00:00');

SELECT * FROM myFirstReplacingMT FINAL;

┌─key─┬─someCol─┬───────────eventTime─┐
│   1 │ second  │ 2020-01-01 00:00:00 │
└─────┴─────────┴─────────────────────┘


-- с ver - строка с наибольшим ver 'выигрывает'
CREATE TABLE mySecondReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime
)
ENGINE = ReplacingMergeTree(eventTime)
ORDER BY key;

INSERT INTO mySecondReplacingMT Values (1, 'first', '2020-01-01 01:01:01');
INSERT INTO mySecondReplacingMT Values (1, 'second', '2020-01-01 00:00:00');

SELECT * FROM mySecondReplacingMT FINAL;

┌─key─┬─someCol─┬───────────eventTime─┐
│   1 │ first   │ 2020-01-01 01:01:01 │
└─────┴─────────┴─────────────────────┘
```

### is_deleted {#is_deleted}

`is_deleted` — имя колонки, используемой во время слияния для определения, представляет ли данная строка состояние или должна быть удалена; `1` — это "удаленная" строка, `0` — это "строка состояния".

  Тип данных колонки — `UInt8`.

:::note
`is_deleted` может быть включен только при использовании `ver`.

Строка удаляется только при выполнении `OPTIMIZE ... FINAL CLEANUP`. Это специальное ключевое слово `CLEANUP` не разрешено по умолчанию, если настройка `allow_experimental_replacing_merge_with_cleanup` для MergeTree не включена.

Несмотря на операцию с данными, версия должна быть увеличена. Если две вставленные строки имеют одинаковый номер версии, то сохраняется последняя вставленная строка.

:::

Пример:
```sql
-- с ver и is_deleted
CREATE OR REPLACE TABLE myThirdReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime,
    `is_deleted` UInt8
)
ENGINE = ReplacingMergeTree(eventTime, is_deleted)
ORDER BY key
SETTINGS allow_experimental_replacing_merge_with_cleanup = 1;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 01:01:01', 0);
INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 01:01:01', 1);

select * from myThirdReplacingMT final;

0 rows in set. Elapsed: 0.003 sec.

-- удаление строк с is_deleted
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 00:00:00', 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

## Условия запроса {#query-clauses}

При создании таблицы `ReplacingMergeTree` требуются те же [условия](../../../engines/table-engines/mergetree-family/mergetree.md), как и при создании таблицы `MergeTree`.

<details markdown="1">

<summary>Устаревший способ создания таблицы</summary>

:::note
Не используйте этот способ в новых проектах и, если возможно, переключите старые проекты на описанный выше метод.
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

Все параметры, кроме `ver`, имеют то же значение, что и в `MergeTree`.

- `ver` - колонка с версией. Опциональный параметр. Для описания смотрите текст выше.

</details>

## Дедупликация данных во время запроса и FINAL {#query-time-de-duplication--final}

Во время слияния ReplacingMergeTree выявляет дублирующиеся строки, используя значения колонок `ORDER BY` (используемые для создания таблицы) в качестве уникального идентификатора и сохраняет только наивысшую версию. Однако это обеспечивает только конечную корректность - это не гарантирует, что строки будут дедуплицированы, и вы не должны на это полагаться. Запросы могут, следовательно, давать неверные ответы из-за обновления и удаления строк, учитываемых в запросах.

Чтобы получить правильные ответы, пользователям необходимо дополнить фоновые слияния дедупликацией и удалением строк на этапе запроса. Это можно сделать с помощью оператора `FINAL`. Например, рассмотрим следующий пример:

```sql
CREATE TABLE rmt_example
(
    `number` UInt16
)
ENGINE = ReplacingMergeTree
ORDER BY number

INSERT INTO rmt_example SELECT floor(randUniform(0, 100)) AS number
FROM numbers(1000000000)

0 rows in set. Elapsed: 19.958 sec. Processed 1.00 billion rows, 8.00 GB (50.11 million rows/s., 400.84 MB/s.)
```
Запрос без `FINAL` дает неправильное количество (точный результат будет варьироваться в зависимости от слияний):

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

Добавление `FINAL` дает правильный результат:

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

Для получения дополнительной информации о `FINAL`, включая оптимизацию его производительности, мы рекомендуем прочитать наше [подробное руководство по ReplacingMergeTree](/guides/replacing-merge-tree).
