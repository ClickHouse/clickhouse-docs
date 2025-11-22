---
description: 'отличается от MergeTree тем, что удаляет дублирующиеся записи с одинаковым значением ключа сортировки (секция таблицы `ORDER BY`, а не `PRIMARY KEY`).'
sidebar_label: 'ReplacingMergeTree'
sidebar_position: 40
slug: /engines/table-engines/mergetree-family/replacingmergetree
title: 'Движок таблицы ReplacingMergeTree'
doc_type: 'reference'
---



# Движок таблицы ReplacingMergeTree

Этот движок отличается от [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) тем, что удаляет дублирующиеся записи с одинаковым значением [ключа сортировки](../../../engines/table-engines/mergetree-family/mergetree.md) (секция `ORDER BY` таблицы, а не `PRIMARY KEY`).

Дедупликация данных выполняется только во время слияния. Слияние выполняется в фоновом режиме в неопределённый момент времени, поэтому на него нельзя полагаться при планировании. Часть данных может остаться необработанной. Хотя вы можете запустить внеплановое слияние с помощью запроса `OPTIMIZE`, не стоит на него рассчитывать, потому что запрос `OPTIMIZE` будет читать и записывать большой объём данных.

Таким образом, `ReplacingMergeTree` подходит для фоновой очистки дублирующихся данных с целью экономии места, но не гарантирует отсутствие дубликатов.

:::note
Подробное руководство по ReplacingMergeTree, включая лучшие практики и рекомендации по оптимизации производительности, доступно [здесь](/guides/replacing-merge-tree).
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

Описание параметров запроса см. в [описании инструкции](../../../sql-reference/statements/create/table.md).

:::note
Уникальность строк определяется секцией таблицы `ORDER BY`, а не `PRIMARY KEY`.
:::


## Параметры ReplacingMergeTree {#replacingmergetree-parameters}

### `ver` {#ver}

`ver` — столбец с номером версии. Тип `UInt*`, `Date`, `DateTime` или `DateTime64`. Необязательный параметр.

При слиянии `ReplacingMergeTree` из всех строк с одинаковым ключом сортировки оставляет только одну:

- Последнюю в выборке, если `ver` не задан. Выборка — это набор строк в наборе кусков, участвующих в слиянии. Самый недавно созданный кусок (последняя вставка) будет последним в выборке. Таким образом, после дедупликации для каждого уникального ключа сортировки останется самая последняя строка из самой последней вставки.
- С максимальной версией, если `ver` указан. Если `ver` одинаков для нескольких строк, то для них будет использоваться правило «если `ver` не указан», т. е. останется самая последняя вставленная строка.

Пример:

```sql
-- без ver - «побеждает» последняя вставленная строка
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


-- с ver - «побеждает» строка с наибольшим ver
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

`is_deleted` — имя столбца, используемого во время слияния для определения того, представляют ли данные в этой строке состояние или должны быть удалены; `1` — это «удалённая» строка, `0` — это строка «состояния».

Тип данных столбца — `UInt8`.

:::note
`is_deleted` может быть включён только при использовании `ver`.

Независимо от операции над данными версия должна увеличиваться. Если две вставленные строки имеют одинаковый номер версии, сохраняется последняя вставленная строка.

По умолчанию ClickHouse сохранит последнюю строку для ключа, даже если эта строка является строкой удаления. Это сделано для того, чтобы любые будущие строки с более низкими версиями могли быть безопасно вставлены, и строка удаления всё равно будет применена.

Чтобы окончательно удалить такие строки удаления, включите настройку таблицы `allow_experimental_replacing_merge_with_cleanup` и выполните одно из следующих действий:

1. Установите настройки таблицы `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`, `min_age_to_force_merge_on_partition_only` и `min_age_to_force_merge_seconds`. Если все куски в партиции старше `min_age_to_force_merge_seconds`, ClickHouse объединит их
   все в один кусок и удалит все строки удаления.

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

```


select * from myThirdReplacingMT final;

0 строк в наборе. Затрачено: 0.003 сек.

-- удаляем строки с is&#95;deleted
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, &#39;first&#39;, &#39;2020-01-01 00:00:00&#39;, 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is&#95;deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘

```
```


## Секции запроса {#query-clauses}

При создании таблицы `ReplacingMergeTree` требуются те же [секции](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

<details markdown="1">

<summary>Устаревший способ создания таблицы</summary>

:::note
Не используйте этот способ в новых проектах и, по возможности, переведите старые проекты на способ, описанный выше.
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

- `ver` — столбец с версией. Необязательный параметр. Описание см. в тексте выше.

</details>


## Дедупликация на уровне запроса и FINAL {#query-time-de-duplication--final}

Во время слияния ReplacingMergeTree идентифицирует дублирующиеся строки, используя значения столбцов `ORDER BY` (указанных при создании таблицы) в качестве уникального идентификатора, и сохраняет только версию с наибольшим номером. Однако это обеспечивает лишь итоговую согласованность — не гарантируется, что строки будут дедуплицированы, и на это не следует полагаться. Поэтому запросы могут возвращать неверные результаты из-за того, что строки обновлений и удалений учитываются при выполнении запросов.

Для получения корректных результатов пользователям необходимо дополнить фоновые слияния дедупликацией на уровне запроса и удалением помеченных строк. Это можно реализовать с помощью оператора `FINAL`. Например, рассмотрим следующий пример:

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

Запрос без `FINAL` возвращает неверное количество строк (точный результат будет зависеть от слияний):

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

Добавление `FINAL` возвращает корректный результат:

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

Для получения дополнительной информации о `FINAL`, включая способы оптимизации производительности `FINAL`, рекомендуем ознакомиться с нашим [подробным руководством по ReplacingMergeTree](/guides/replacing-merge-tree).
