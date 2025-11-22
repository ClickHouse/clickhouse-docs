---
description: 'arrayJoin 函数说明文档'
sidebar_label: 'arrayJoin'
slug: /sql-reference/functions/array-join
title: 'arrayJoin 函数'
doc_type: 'reference'
---



# arrayJoin 函数

这是一个非常特殊的函数。

普通函数不会改变行集,只会改变每行中的值(映射)。
聚合函数会压缩行集(折叠或归约)。
`arrayJoin` 函数会获取每一行并生成一组行(展开)。

该函数接受一个数组作为参数,并根据数组中元素的数量将源行扩展为多行。
所有列中的值都会被简单复制,但应用此函数的列除外;该列的值会被替换为相应的数组元素值。

:::note
如果数组为空,`arrayJoin` 不会产生任何行。
要返回包含数组类型默认值的单行,可以使用 [emptyArrayToSingle](./array-functions.md#emptyArrayToSingle) 包装它,例如:`arrayJoin(emptyArrayToSingle(...))`。
:::

例如:

```sql title="查询"
SELECT arrayJoin([1, 2, 3] AS src) AS dst, 'Hello', src
```

```text title="响应"
┌─dst─┬─\'Hello\'─┬─src─────┐
│   1 │ Hello     │ [1,2,3] │
│   2 │ Hello     │ [1,2,3] │
│   3 │ Hello     │ [1,2,3] │
└─────┴───────────┴─────────┘
```

`arrayJoin` 函数会影响查询的所有部分,包括 `WHERE` 部分。请注意,下面查询的结果是 `2`,尽管子查询只返回了 1 行。

```sql title="查询"
SELECT sum(1) AS impressions
FROM
(
    SELECT ['Istanbul', 'Berlin', 'Babruysk'] AS cities
)
WHERE arrayJoin(cities) IN ['Istanbul', 'Berlin'];
```

```text title="响应"
┌─impressions─┐
│           2 │
└─────────────┘
```

查询可以使用多个 `arrayJoin` 函数。在这种情况下,转换会执行多次,行数会相乘。
例如:

```sql title="查询"
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

```text title="响应"
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

对同一表达式使用多个 `arrayJoin` 可能由于公共子表达式消除而无法产生预期结果。
在这些情况下,可以考虑通过不影响连接结果的额外操作来修改重复的数组表达式。例如,`arrayJoin(arraySort(arr))`、`arrayJoin(arrayConcat(arr, []))`

示例:

```sql
SELECT
    arrayJoin(dice) AS first_throw,
    /* arrayJoin(dice) as second_throw */ -- 技术上是正确的,但会导致结果集为空
    arrayJoin(arrayConcat(dice, [])) AS second_throw -- 故意修改表达式以强制重新计算
FROM (
    SELECT [1, 2, 3, 4, 5, 6] AS dice
);
```

注意 SELECT 查询中的 [`ARRAY JOIN`](../statements/select/array-join.md) 语法,它提供了更广泛的功能。
`ARRAY JOIN` 允许您一次转换具有相同元素数量的多个数组。

示例:

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

或者可以使用 [`Tuple`](../data-types/tuple.md)

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

ClickHouse 中的 `arrayJoin` 这一名称源于它在概念上与 JOIN 操作类似，不过是作用于单行内的数组。传统的 JOIN 会合并来自不同表的行，而 `arrayJoin` 则对一行中数组的每个元素进行“连接”，生成多行——每个数组元素对应一行——同时复制该行中其他列的值。ClickHouse 还提供了 [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 子句语法，通过使用熟悉的 SQL JOIN 术语，使其与传统 JOIN 操作之间的关系更加直观。这一过程也被称为对数组进行“展开”，但在函数名和子句中都使用了 “join” 这一术语，因为它类似于将表与数组元素进行连接，从而以类似 JOIN 操作的方式有效地扩展数据集。
