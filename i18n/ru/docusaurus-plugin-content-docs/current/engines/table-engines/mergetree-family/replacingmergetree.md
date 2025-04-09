---
description: 'отличается от MergeTree тем, что удаляет дубликаты с одинаковым значением ключа сортировки (`ORDER BY` секция таблицы, а не `PRIMARY KEY`).'
sidebar_label: 'ReplacingMergeTree'
sidebar_position: 40
slug: /engines/table-engines/mergetree-family/replacingmergetree
title: 'ReplacingMergeTree'
---


# ReplacingMergeTree

Движок отличается от [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) тем, что удаляет дубликаты с одинаковым значением [ключа сортировки](../../../engines/table-engines/mergetree-family/mergetree.md) (`ORDER BY` секция таблицы, а не `PRIMARY KEY`).

Дедупликация данных происходит только во время слияния. Слияние происходит в фоновом режиме в неизвестное время, поэтому вы не можете запланировать его. Некоторые данные могут оставаться необработанными. Хотя вы можете выполнить несогласованное слияние, используя запрос `OPTIMIZE`, не рассчитывайте на его использование, так как запрос `OPTIMIZE` будет читать и записывать большое количество данных.

Таким образом, `ReplacingMergeTree` подходит для удаления дублирующихся данных в фоновом режиме, чтобы сэкономить место, но не гарантирует отсутствие дубликатов.

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

Для описания параметров запроса см. [описание оператора](../../../sql-reference/statements/create/table.md).

:::note
Уникальность строк определяется секцией `ORDER BY` таблицы, а не `PRIMARY KEY`.
:::

## Параметры ReplacingMergeTree {#replacingmergetree-parameters}

### ver {#ver}

`ver` — колонка с номером версии. Тип `UInt*`, `Date`, `DateTime` или `DateTime64`. Опциональный параметр.

При слиянии `ReplacingMergeTree` оставляет только одну из всех строк с одинаковым ключом сортировки:

   - Последнюю в выборке, если `ver` не установлен. Выборка представляет собой набор строк в наборе частей, участвующих в слиянии. Самая недавно созданная часть (последняя вставка) будет последней в выборке. Таким образом, после дедупликации последняя строка из самой последней вставки останется для каждого уникального ключа сортировки.
   - С максимальной версией, если указан `ver`. Если `ver` одинаков для нескольких строк, то для них будет применено правило "если `ver` не указано", т.е. останется последняя вставленная строка.

Пример:

```sql
-- без ver - последняя вставленная 'побеждает'
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


-- с ver - строка с наибольшим ver 'побеждает'
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

`is_deleted` — имя колонки, используемой во время слияния для определения, представляет ли данные в этой строке состояние или должно быть удалено; `1` - "удаленная" строка, `0` - "строка состояния".

  Тип данных колонки — `UInt8`.

:::note
`is_deleted` можно включить только при использовании `ver`.

Не имеет значения, какая операция выполняется с данными, версия должна увеличиваться. Если две вставленные строки имеют одинаковый номер версии, сохраняется последняя вставленная строка.

По умолчанию ClickHouse сохранит последнюю строку для ключа, даже если эта строка является строкой удаления. Это сделано для того, чтобы любые будущие строки с более низкими версиями могли быть безопасно вставлены, и строка удаления все еще применялась.

Чтобы навсегда удалить такие строки удаления, включите настройку таблицы `allow_experimental_replacing_merge_with_cleanup` и либо:

1. Установите настройки таблицы `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`, `min_age_to_force_merge_on_partition_only` и `min_age_to_force_merge_seconds`. Если все части в партиции старше `min_age_to_force_merge_seconds`, ClickHouse объединит их в одну часть и удалит любые строки удаления.

2. Вручную выполните `OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 'partition_id'] FINAL CLEANUP`.
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

-- удалить строки с is_deleted
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 00:00:00', 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

## Клаузулы запроса {#query-clauses}

При создании таблицы `ReplacingMergeTree` требуются те же [клаузулы](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах и, если возможно, переключитесь на описанный выше метод для старых проектов.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

Все параметры, кроме `ver`, имеют то же значение, что и в `MergeTree`.

- `ver` - колонка с версией. Опциональный параметр. Для описания смотрите выше.

</details>

## Дедупликация во время запроса и FINAL {#query-time-de-duplication--final}

Во время слияния ReplacingMergeTree идентифицирует дублирующиеся строки, используя значения колонок `ORDER BY` (используемые для создания таблицы) как уникальный идентификатор, и сохраняет только наивысшую версию. Однако это дает только будущую корректность - не гарантирует, что строки будут дедуплицированы, и вы не должны на это полагаться. Запросы, следовательно, могут давать некорректные ответы из-за того, что строки обновления и удаления учитываются в запросах.

Чтобы получить правильные ответы, пользователям потребуется дополнить фоновое слияние дедупликацией и удалением строк во время запроса. Это можно сделать, используя оператор `FINAL`. Например, рассмотрим следующий пример:

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
Запрос без `FINAL` дает некорректное количество (точный результат будет варьироваться в зависимости от слияний):

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

Добавление final дает правильный результат:

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

Для получения дополнительной информации о `FINAL`, включая способы оптимизации производительности `FINAL`, мы рекомендуем прочитать наше [подробное руководство по ReplacingMergeTree](/guides/replacing-merge-tree).
