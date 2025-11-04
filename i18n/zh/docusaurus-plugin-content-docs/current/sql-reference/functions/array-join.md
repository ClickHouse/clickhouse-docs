---
'description': 'arrayJoin 函数的文档'
'sidebar_label': 'arrayJoin'
'slug': '/sql-reference/functions/array-join'
'title': 'arrayJoin 函数'
'doc_type': 'reference'
---


# arrayJoin 函数

这是一个非常特殊的函数。

普通函数不会改变行的集合，而只是改变每行中的值（映射）。
聚合函数压缩行的集合（折叠或减少）。
`arrayJoin` 函数则是将每一行生成一组行（展开）。

此函数将数组作为参数，并将源行传播为与数组中元素数量相对应的多行。
除了应用此函数的列中的值被替换为相应的数组值外，其他列中的所有值都被简单地复制。

:::note
如果数组为空，`arrayJoin` 不会产生任何行。
要返回一个包含数组类型默认值的单行，可以使用 [emptyArrayToSingle](./array-functions.md#emptyArrayToSingle) 包裹，例如：`arrayJoin(emptyArrayToSingle(...))`。
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

`arrayJoin` 函数影响查询的所有部分，包括 `WHERE` 部分。请注意，下面查询的结果是 `2`，尽管子查询返回了 1 行。

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

一个查询可以使用多个 `arrayJoin` 函数。在这种情况下，转换会多次进行，行将被重复。
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

使用相同表达式的多个 `arrayJoin` 可能不会产生预期结果，因为会消除公共子表达式。
在这些情况下，可以考虑通过额外的操作来修改重复的数组表达式，这些操作不会影响连接结果。例如，`arrayJoin(arraySort(arr))`、`arrayJoin(arrayConcat(arr, []))`。

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

注意在 SELECT 查询中的 [`ARRAY JOIN`](../statements/select/array-join.md) 语法，它提供了更广泛的可能性。
`ARRAY JOIN` 允许你同时转换多个具有相同数量元素的数组。

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

或者你可以使用 [`Tuple`](../data-types/tuple.md)。

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

在 ClickHouse 中，`arrayJoin` 的名称源于其概念上与 JOIN 操作的相似性，但适用于单行内的数组。传统的 JOIN 是将来自不同表的行组合在一起，而 `arrayJoin` 则“连接”每行数组中的每个元素，生成多个行—每个数组元素一个，同时复制其他列的值。ClickHouse 还提供了 [`ARRAY JOIN`](/sql-reference/statements/select/array-join) 子句语法，通过使用熟悉的 SQL JOIN 术语，使得这种关系与传统 JOIN 操作更加显而易见。这个过程也被称为“展开”数组，但在函数名称和子句中使用“连接”这个术语是因为它类似于将表与数组元素连接在一起，实际上以一种类似于 JOIN 操作的方式扩展数据集。
