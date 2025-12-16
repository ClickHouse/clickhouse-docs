---
description: "arrayJoin 函数文档"
sidebar_label: "arrayJoin"
slug: /sql-reference/functions/array-join
title: "arrayJoin 函数"
doc_type: "reference"
---

# arrayJoin 函数 {#arrayjoin-function}

这是一个比较特殊的函数。

普通函数不会改变行集，只会改变每一行中的值（map）。
聚合函数会压缩行集（fold 或 reduce）。
`arrayJoin` 函数则会从每一行生成一组新的行（unfold）。

此函数以数组作为参数，并根据数组中元素的数量，将原始行展开为多行。
除应用此函数的那一列外，其余列中的所有值都会被直接复制；该列的值则会被数组中对应的元素所替代。

:::note
如果数组为空，`arrayJoin` 不会产生任何行。
若要返回一行包含该数组类型默认值的记录，可以将其包裹在 [emptyArrayToSingle](./array-functions.md#emptyArrayToSingle) 中，例如：`arrayJoin(emptyArrayToSingle(...))`。
:::

例如：

```sql title="Query"
SELECT arrayJoin([1, 2, 3] AS src) AS dst, 'Hello', src
```

```text title="Response"
┌─dst─┬─\'Hello\'─┬─src─────┐
│   1 │ Hello     │ [1,2,3] │
│   2 │ Hello     │ [1,2,3] │
│   3 │ Hello     │ [1,2,3] │
└─────┴───────────┴─────────┘
```

`arrayJoin` 函数会作用于查询的所有子句，包括 `WHERE` 子句。请注意，下面这个查询的结果是 `2`，尽管子查询只返回了 1 行。

```sql title="Query"
SELECT sum(1) AS impressions
FROM
(
    SELECT ['Istanbul', 'Berlin', 'Babruysk'] AS cities
)
WHERE arrayJoin(cities) IN ['Istanbul', 'Berlin'];
```

```text title="Response"
┌─impressions─┐
│           2 │
└─────────────┘
```

一个查询可以使用多个 `arrayJoin` 函数。在这种情况下，会执行多次变换，行数会被成倍增加。
例如：

```sql title="Query"
SELECT
    sum(1) AS impressions,
    arrayJoin(cities) AS city,
    arrayJoin(browsers) AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Babruysk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text title="Response"
┌─impressions─┬─city─────┬─browser─┐
│           2 │ Istanbul │ Chrome  │
│           1 │ Istanbul │ Firefox │
│           2 │ Berlin   │ Chrome  │
│           1 │ Berlin   │ Firefox │
│           2 │ Babruysk │ Chrome  │
│           1 │ Babruysk │ Firefox │
└─────────────┴──────────┴─────────┘
```

### 最佳实践 {#important-note}

对同一表达式多次使用 `arrayJoin` 时，由于公用子表达式消除优化，可能无法得到预期结果。
在这种情况下，可以考虑为重复的数组表达式添加一些不会影响展开结果的额外操作。例如：`arrayJoin(arraySort(arr))`、`arrayJoin(arrayConcat(arr, []))`

示例：

```sql
SELECT
    arrayJoin(dice) AS first_throw,
    /* arrayJoin(dice) as second_throw */ -- is technically correct, but will annihilate result set
    arrayJoin(arrayConcat(dice, [])) AS second_throw -- intentionally changed expression to force re-evaluation
FROM (
    SELECT [1, 2, 3, 4, 5, 6] AS dice
);
```

注意在 SELECT 查询中使用的 [`ARRAY JOIN`](../statements/select/array-join.md) 语法，它提供了更丰富的功能。
`ARRAY JOIN` 允许一次性转换多个具有相同元素数量的数组。

示例：

```sql
SELECT
    sum(1) AS impressions,
    city,
    browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Babruysk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
ARRAY JOIN
    cities AS city,
    browsers AS browser
GROUP BY
    2,
    3
```

```text
┌─impressions─┬─city─────┬─browser─┐
│           1 │ Istanbul │ Firefox │
│           1 │ Berlin   │ Chrome  │
│           1 │ Babruysk │ Chrome  │
└─────────────┴──────────┴─────────┘
```

也可以使用 [`Tuple`](../data-types/tuple.md)

示例：

```sql title="Query"
SELECT
    sum(1) AS impressions,
    (arrayJoin(arrayZip(cities, browsers)) AS t).1 AS city,
    t.2 AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Babruysk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text title="Row"
┌─impressions─┬─city─────┬─browser─┐
│           1 │ Istanbul │ Firefox │
│           1 │ Berlin   │ Chrome  │
│           1 │ Babruysk │ Chrome  │
└─────────────┴──────────┴─────────┘
```

ClickHouse 中的 `arrayJoin` 这个名称源于它在概念上与 JOIN 操作的相似性，只不过是应用在同一行内的数组上。传统的 JOIN 会合并来自不同表的行，而 `arrayJoin` 则是将一行中的数组元素逐个“连接”，生成多行——每个数组元素对应一行——同时复制该行中的其他列值。ClickHouse 还提供了 [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 子句语法，通过使用熟悉的 SQL JOIN 术语，使其与传统 JOIN 操作之间的关系更加直观。这个过程也被称为对数组进行“展开”，但在函数名和子句中都采用了 “join” 一词，因为其行为类似于将表与数组元素进行连接，从而以类似 JOIN 操作的方式扩展数据集。
