---
description: 'отличается от MergeTree тем, что удаляет дублирующиеся записи с
  одинаковым значением сортировочного ключа (секция `ORDER BY` таблицы, а не `PRIMARY KEY`).'
sidebar_label: 'ReplacingMergeTree'
sidebar_position: 40
slug: /engines/table-engines/mergetree-family/replacingmergetree
title: 'Движок таблицы ReplacingMergeTree'
doc_type: 'reference'
---

# Движок таблиц ReplacingMergeTree {#replacingmergetree-table-engine}

Этот движок отличается от [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) тем, что удаляет дублирующиеся записи с одинаковым значением [ключа сортировки](../../../engines/table-engines/mergetree-family/mergetree.md) (раздел `ORDER BY` в определении таблицы, а не `PRIMARY KEY`).

Дедупликация данных происходит только во время слияния. Слияния выполняются в фоновом режиме в неизвестный момент времени, поэтому вы не можете планировать их выполнение. Часть данных может остаться необработанной. Хотя вы можете запустить внеплановое слияние с помощью запроса `OPTIMIZE`, не рассчитывайте на это, потому что запрос `OPTIMIZE` будет считывать и записывать большой объем данных.

Таким образом, `ReplacingMergeTree` подходит для фоновой очистки дублирующихся данных с целью экономии места, но не гарантирует отсутствие дубликатов.

:::note
Подробное руководство по ReplacingMergeTree, включая лучшие практики и способы оптимизации производительности, доступно [здесь](/guides/replacing-merge-tree).
:::

## Создание таблицы {#creating-a-table}

```sql
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

Описание параметров запроса см. в [описании оператора](../../../sql-reference/statements/create/table.md).

:::note
Уникальность строк определяется разделом таблицы `ORDER BY`, а не `PRIMARY KEY`.
:::

## Параметры ReplacingMergeTree {#replacingmergetree-parameters}

### `ver` {#ver}

`ver` — столбец с номером версии. Тип `UInt*`, `Date`, `DateTime` или `DateTime64`. Необязательный параметр.

При слиянии `ReplacingMergeTree` из всех строк с одинаковым сортировочным ключом оставляет только одну:

* Последнюю в выборке, если `ver` не указан. Выборка — это набор строк в наборе кусков, участвующих в слиянии. Самый недавно созданный кусок (последняя вставка) будет последним в выборке. Таким образом, после дедупликации для каждого уникального сортировочного ключа останется самая последняя строка из самой свежей вставки.
* С максимальной версией, если `ver` указан. Если `ver` одинаков для нескольких строк, для них используется правило «если `ver` не указан», то есть останется самая недавно вставленная строка.

Пример:

```sql
-- without ver - the last inserted 'wins'
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


-- with ver - the row with the biggest ver 'wins'
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

### `is_deleted` {#is_deleted}

`is_deleted` — имя столбца, используемого во время слияния для определения, представляет ли строка состояние или подлежит удалению; `1` — строка-удаление, `0` — строка-состояние.

Тип данных столбца — `UInt8`.

:::note
`is_deleted` может быть включён только при использовании `ver`.

Независимо от выполняемой над данными операции, версия должна увеличиваться. Если две вставленные строки имеют одинаковый номер версии, сохраняется последняя вставленная строка.

По умолчанию ClickHouse сохраняет последнюю строку для ключа, даже если эта строка является строкой удаления. Это нужно для того, чтобы любые будущие строки с более низкими версиями могли быть безопасно вставлены, и строка удаления всё равно применялась.

Чтобы навсегда удалить такие строки удаления, включите настройку таблицы `allow_experimental_replacing_merge_with_cleanup` и выполните одно из следующих действий:

1. Задайте настройки таблицы `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`, `min_age_to_force_merge_on_partition_only` и `min_age_to_force_merge_seconds`. Если все части в партиции старше, чем `min_age_to_force_merge_seconds`, ClickHouse выполнит их слияние
   в одну часть и удалит все строки удаления.

2. Вручную выполните `OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 'partition_id'] FINAL CLEANUP`.
   :::

Пример:

```sql
-- with ver and is_deleted
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

-- delete rows with is_deleted
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 00:00:00', 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

select * from myThirdReplacingMT final;

0 строк в наборе. Прошло: 0.003 сек.

-- удалить строки с is&#95;deleted
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, &#39;first&#39;, &#39;2020-01-01 00:00:00&#39;, 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is&#95;deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

## Части запроса {#query-clauses}

При создании таблицы `ReplacingMergeTree` необходимо указывать те же [части запроса](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

<details markdown="1">

<summary>Устаревший способ создания таблицы</summary>

:::note
Не используйте этот способ в новых проектах и, по возможности, переведите старые проекты на способ, описанный выше.
:::

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

Все параметры, за исключением `ver`, имеют тот же смысл, что и в `MergeTree`.

- `ver` — столбец с версией. Необязательный параметр. Описание см. в тексте выше.

</details>

## Дедупликация при выполнении запроса &amp; FINAL {#query-time-de-duplication--final}

Во время слияния ReplacingMergeTree определяет дублирующиеся строки, используя значения столбцов `ORDER BY` (указанных при создании таблицы) в качестве уникального идентификатора и сохраняя только самую позднюю версию. Однако это обеспечивает лишь корректность «в конечном счёте» — нет гарантии, что строки будут дедуплицированы, и полагаться на это не следует. Поэтому запросы могут возвращать некорректные результаты, так как строки с обновлениями и удалениями учитываются в запросах.

Для получения корректных результатов пользователям необходимо дополнять фоновые слияния дедупликацией и удалением строк при выполнении запроса. Это можно сделать с помощью оператора `FINAL`. Например, рассмотрим следующий пример:

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

Запрос без `FINAL` возвращает некорректный результат подсчёта (точное значение будет отличаться в зависимости от выполняемых слияний):

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

Добавление FINAL даёт правильный результат:

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 строка в наборе. Затрачено: 0.002 сек.
```

Для получения дополнительных сведений о `FINAL`, включая рекомендации по оптимизации его производительности, мы рекомендуем ознакомиться с [подробным руководством по ReplacingMergeTree](/guides/replacing-merge-tree).
