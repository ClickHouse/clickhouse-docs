---
description: 'отличается от MergeTree тем, что удаляет дублирующиеся записи с одинаковым значением ключа сортировки (`ORDER BY`, а не `PRIMARY KEY`).'
sidebar_label: 'ReplacingMergeTree'
sidebar_position: 40
slug: /engines/table-engines/mergetree-family/replacingmergetree
title: 'ReplacingMergeTree'
---


# ReplacingMergeTree

Движок отличается от [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) тем, что удаляет дублирующиеся записи с одинаковым значением [ключа сортировки](../../../engines/table-engines/mergetree-family/mergetree.md) (`ORDER BY`, а не `PRIMARY KEY`).

Дедупликация данных происходит только в процессе слияния. Слияние происходит в фоновом режиме в неизвестное время, поэтому вы не можете запланировать его. Часть данных может остаться необработанной. Хотя вы можете выполнить несогласованное слияние с помощью запроса `OPTIMIZE`, не рассчитывайте, что оно всегда будет эффективно, так как запрос `OPTIMIZE` будет читать и записывать большое количество данных.

Таким образом, `ReplacingMergeTree` подходит для удаления дублирующихся данных в фоновом режиме с целью экономии места, но не гарантирует отсутствие дубликатов.

:::note
Подробное руководство по ReplacingMergeTree, включая передовые практики и оптимизацию производительности, доступно [здесь](/guides/replacing-merge-tree).
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

`ver` — столбец с номером версии. Тип `UInt*`, `Date`, `DateTime` или `DateTime64`. Необязательный параметр.

При слиянии `ReplacingMergeTree` из всех строк с одинаковым ключом сортировки оставляет только одну:

   - Последнюю в выборке, если `ver` не указан. Выборка — это множество строк в наборе частей, участвующих в слиянии. Самая недавно созданная часть (последняя вставка) будет последней в выборке. Таким образом, после дедупликации останется только последняя строка из самой недавней вставки для каждого уникального ключа сортировки.
   - С максимальной версией, если `ver` указан. Если `ver` одинаков для нескольких строк, применяется правило "если `ver` не указан" для них, т.е. останется самая недавно вставленная строка.

Пример:

```sql
-- без ver - последняя вставленная "выигрывает"
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


-- с ver - строка с наибольшей ver "выигрывает"
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

`is_deleted` — имя столбца, используемого во время слияния для определения, представляет ли данные в данной строке состояние или подлежит удалению; `1` — это строка "удалена", `0` — строка "состояние".

Тип данных столбца — `UInt8`.

:::note
`is_deleted` может быть включен только когда используется `ver`.

Независимо от операции с данными номер версии должен увеличиваться. Если две вставленные строки имеют одинаковый номер версии, сохраняется последняя вставленная строка.

По умолчанию ClickHouse будет сохранять последнюю строку для ключа, даже если эта строка является строкой удаления. Это делается для того, чтобы любые будущие строки с меньшими версиями могли быть безопасно вставлены, и строка удаления по-прежнему применялась.

Чтобы окончательно удалить такие строки удаления, включите настройку таблицы `allow_experimental_replacing_merge_with_cleanup` и либо:

1. Установите настройки таблицы `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`, `min_age_to_force_merge_on_partition_only` и `min_age_to_force_merge_seconds`. Если все части в разделе старше `min_age_to_force_merge_seconds`, ClickHouse объединит их все в одну часть и удалит любые строки удаления.

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

-- удаление строк с is_deleted
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 00:00:00', 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

## Условия запроса {#query-clauses}

При создании таблицы `ReplacingMergeTree` применяются те же [условия](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах и, по возможности, переходите на описанный выше метод.
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

- `ver` - столбец с версией. Необязательный параметр. Для описания см. текст выше.

</details>

## Дедупликация данных во время запроса и FINAL {#query-time-de-duplication--final}

Во время слияния `ReplacingMergeTree` идентифицирует дублирующиеся строки, используя значения столбцов `ORDER BY` (используемые для создания таблицы) в качестве уникального идентификатора, и сохраняет только наивысшую версию. Это, однако, обеспечивает только оперативную корректность - это не гарантирует, что строки будут дедуплицированы, и вам не следует на это полагаться. Запросы, следовательно, могут давать неверные ответы из-за того, что строки обновлений и удалений учитываются в запросах.

Чтобы получить правильные ответы, пользователям потребуется дополнить фоновую дедупликацию дедупликацией во время запроса и удалением строк. Это можно сделать с помощью оператора `FINAL`. Например, рассмотрим следующий пример:

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
Запрос без `FINAL` дает неверный результат (точный результат будет варьироваться в зависимости от слияний):

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

Для получения дополнительных сведений о `FINAL`, включая оптимизацию производительности `FINAL`, мы рекомендуем прочитать наше [подробное руководство по ReplacingMergeTree](/guides/replacing-merge-tree).
