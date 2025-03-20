---
slug: /engines/table-engines/mergetree-family/summingmergetree
sidebar_position: 50
sidebar_label:  SummingMergeTree
title: 'SummingMergeTree'
description: 'SummingMergeTree наследуется от движка MergeTree. Его ключевая особенность заключается в возможности автоматически суммировать числовые данные во время слияния частей.'
---


# SummingMergeTree

Движок наследуется от [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree). Отличие заключается в том, что при слиянии частей данных для таблиц `SummingMergeTree` ClickHouse заменяет все строки с тем же первичным ключом (или, точнее, с тем же [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) одной строкой, которая содержит сводные значения для колонок с числовым типом данных. Если ключ сортировки составлен так, что одно значение ключа соответствует большому количеству строк, это значительно уменьшает объем хранимых данных и ускоряет выборку данных.

Мы рекомендуем использовать этот движок вместе с `MergeTree`. Храните полные данные в таблице `MergeTree`, а используйте `SummingMergeTree` для хранения агрегированных данных, например, при подготовке отчетов. Такой подход позволит вам избежать потери ценных данных из-за некорректно составленного первичного ключа.

## Создание таблицы {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = SummingMergeTree([columns])
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

Для описания параметров запроса смотрите [описание запроса](../../../sql-reference/statements/create/table.md).

### Параметры SummingMergeTree {#parameters-of-summingmergetree}

#### columns {#columns}

`columns` - кортеж с именами колонок, где будут суммироваться значения. Необязательный параметр.
    Колонки должны быть числового типа и не должны входить в первичный ключ.

Если `columns` не указан, ClickHouse суммирует значения во всех колонках с числовым типом данных, которые не входят в первичный ключ.

### Части запроса {#query-clauses}

При создании таблицы `SummingMergeTree` требуются те же [части](../../../engines/table-engines/mergetree-family/mergetree.md), что и при создании таблицы `MergeTree`.

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
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

Все параметры, кроме `columns`, имеют то же значение, что и в `MergeTree`.

- `columns` — кортеж с именами колонок, значения которых будут суммироваться. Необязательный параметр. Для описания смотрите текст выше.

</details>

## Пример использования {#usage-example}

Рассмотрим следующую таблицу:

``` sql
CREATE TABLE summtt
(
    key UInt32,
    value UInt32
)
ENGINE = SummingMergeTree()
ORDER BY key
```

Вставим данные в нее:

``` sql
INSERT INTO summtt Values(1,1),(1,2),(2,1)
```

ClickHouse может не полностью суммировать все строки ([см. ниже](#data-processing)), поэтому мы используем агрегационную функцию `sum` и часть `GROUP BY` в запросе.

``` sql
SELECT key, sum(value) FROM summtt GROUP BY key
```

``` text
┌─key─┬─sum(value)─┐
│   2 │          1 │
│   1 │          3 │
└─────┴────────────┘
```

## Обработка данных {#data-processing}

Когда данные вставляются в таблицу, они сохраняются как есть. ClickHouse периодически объединяет вставленные части данных, и именно тогда строки с тем же первичным ключом суммируются и заменяются одной строкой для каждой результирующей части данных.

ClickHouse может объединять части данных таким образом, что различные результирующие части данных могут состоять из строк с тем же первичным ключом, т.е. суммирование будет неполным. Поэтому (`SELECT`) агрегационную функцию [sum()](/sql-reference/aggregate-functions/reference/sum) и часть `GROUP BY` следует использовать в запросе, как описано в примере выше.

### Общие правила для суммирования {#common-rules-for-summation}

Значения в колонках с числовым типом данных суммируются. Набор колонок определяется параметром `columns`.

Если значения во всех колонках для суммирования были 0, строка удаляется.

Если колонка не входит в первичный ключ и не суммируется, выбирается произвольное значение из существующих.

Значения не суммируются для колонок в первичном ключе.

### Суммирование в колонках типа AggregateFunction {#the-summation-in-the-aggregatefunction-columns}

Для колонок типа [AggregateFunction](../../../sql-reference/data-types/aggregatefunction.md) ClickHouse ведет себя как движок [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md), агрегируя в соответствии с функцией.

### Вложенные структуры {#nested-structures}

Таблица может иметь вложенные структуры данных, которые обрабатываются особым образом.

Если имя вложенной таблицы заканчивается на `Map` и содержит по меньшей мере два столбца, которые соответствуют следующим критериям:

- первый столбец числовой `(*Int*, Date, DateTime)` или строковый `(String, FixedString)`, давайте назовем его `key`,
- другие столбцы арифметические `(*Int*, Float32/64)`, давайте назовем их `(values...)`,

то эта вложенная таблица интерпретируется как отображение `key => (values...)`, и при слиянии ее строк элементы двух наборов данных объединяются по `key` с суммированием соответствующих `(values...)`.

Примеры:

``` text
DROP TABLE IF EXISTS nested_sum;
CREATE TABLE nested_sum
(
    date Date,
    site UInt32,
    hitsMap Nested(
        browser String,
        imps UInt32,
        clicks UInt32
    )
) ENGINE = SummingMergeTree
PRIMARY KEY (date, site);

INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['Firefox', 'Opera'], [10, 5], [2, 1]);
INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['Chrome', 'Firefox'], [20, 1], [1, 1]);
INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['IE'], [22], [0]);
INSERT INTO nested_sum VALUES ('2020-01-01', 10, ['Chrome'], [4], [3]);

OPTIMIZE TABLE nested_sum FINAL; -- эмуляция слияния

SELECT * FROM nested_sum;
┌───────date─┬─site─┬─hitsMap.browser───────────────────┬─hitsMap.imps─┬─hitsMap.clicks─┐
│ 2020-01-01 │   10 │ ['Chrome']                        │ [4]          │ [3]            │
│ 2020-01-01 │   12 │ ['Chrome','Firefox','IE','Opera'] │ [20,11,22,5] │ [1,3,0,1]      │
└────────────┴──────┴───────────────────────────────────┴──────────────┴────────────────┘

SELECT
    site,
    browser,
    impressions,
    clicks
FROM
(
    SELECT
        site,
        sumMap(hitsMap.browser, hitsMap.imps, hitsMap.clicks) AS imps_map
    FROM nested_sum
    GROUP BY site
)
ARRAY JOIN
    imps_map.1 AS browser,
    imps_map.2 AS impressions,
    imps_map.3 AS clicks;

┌─site─┬─browser─┬─impressions─┬─clicks─┐
│   12 │ Chrome  │          20 │      1 │
│   12 │ Firefox │          11 │      3 │
│   12 │ IE      │          22 │      0 │
│   12 │ Opera   │           5 │      1 │
│   10 │ Chrome  │           4 │      3 │
└──────┴─────────┴─────────────┴────────┘
```

При запросе данных используйте функцию [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md) для агрегации `Map`.

Для вложенной структуры данных вам не нужно указывать ее колонки в кортеже колонок для суммирования.

## Связанный контент {#related-content}

- Блог: [Использование агрегирующих комбинаторов в ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
