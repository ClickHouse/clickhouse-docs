---
'description': 'arrayJoin函数的文档'
'sidebar_label': 'arrayJoin'
'sidebar_position': 15
'slug': '/sql-reference/functions/array-join'
'title': 'arrayJoin函数'
---




# arrayJoin 函数

这是一个非常不寻常的函数。

普通函数不会改变行集，而只是改变每行中的值（映射）。聚合函数则压缩一组行（折叠或减少）。`arrayJoin` 函数则是将每一行生成一组行（展开）。

此函数将数组作为参数，并根据数组中的元素数量将源行传播到多行。所有列中的值都会被简单复制，除了应用此函数的列中的值；它会被相应的数组值替换。

示例：

```sql
SELECT arrayJoin([1, 2, 3] AS src) AS dst, 'Hello', src
```

```text
┌─dst─┬─\'Hello\'─┬─src─────┐
│   1 │ Hello     │ [1,2,3] │
│   2 │ Hello     │ [1,2,3] │
│   3 │ Hello     │ [1,2,3] │
└─────┴───────────┴─────────┘
```

`arrayJoin` 函数会影响查询的所有部分，包括 `WHERE` 部分。注意结果 2，尽管子查询返回了 1 行。

示例：

```sql
SELECT sum(1) AS impressions
FROM
(
    SELECT ['Istanbul', 'Berlin', 'Bobruisk'] AS cities
)
WHERE arrayJoin(cities) IN ['Istanbul', 'Berlin'];
```

```text
┌─impressions─┐
│           2 │
└─────────────┘
```

一个查询可以使用多个 `arrayJoin` 函数。在这种情况下，转换会多次执行，行数会增加。

示例：

```sql
SELECT
    sum(1) AS impressions,
    arrayJoin(cities) AS city,
    arrayJoin(browsers) AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Bobruisk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text
┌─impressions─┬─city─────┬─browser─┐
│           2 │ Istanbul │ Chrome  │
│           1 │ Istanbul │ Firefox │
│           2 │ Berlin   │ Chrome  │
│           1 │ Berlin   │ Firefox │
│           2 │ Bobruisk │ Chrome  │
│           1 │ Bobruisk │ Firefox │
└─────────────┴──────────┴─────────┘
```

### 重要说明！ {#important-note}
使用相同表达式的多个 `arrayJoin` 可能不会产生预期的结果，因为优化可能导致意外行为。
对于这种情况，请考虑通过额外的操作来修改重复的数组表达式，这些操作不影响连接结果 - 例如 `arrayJoin(arraySort(arr))`，`arrayJoin(arrayConcat(arr, []))`

示例：
```sql
SELECT
    arrayJoin(dice) as first_throw,
    /* arrayJoin(dice) as second_throw */ -- is technically correct, but will annihilate result set
    arrayJoin(arrayConcat(dice, [])) as second_throw -- intentionally changed expression to force re-evaluation
FROM (
    SELECT [1, 2, 3, 4, 5, 6] as dice
);
```

请注意在 SELECT 查询中使用的 [ARRAY JOIN](../statements/select/array-join.md) 语法，它提供了更广泛的可能性。`ARRAY JOIN` 允许你同时转换多个具有相同数量元素的数组。

示例：

```sql
SELECT
    sum(1) AS impressions,
    city,
    browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Bobruisk'] AS cities,
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
│           1 │ Bobruisk │ Chrome  │
└─────────────┴──────────┴─────────┘
```

或者你可以使用 [Tuple](../data-types/tuple.md)

示例：

```sql
SELECT
    sum(1) AS impressions,
    (arrayJoin(arrayZip(cities, browsers)) AS t).1 AS city,
    t.2 AS browser
FROM
(
    SELECT
        ['Istanbul', 'Berlin', 'Bobruisk'] AS cities,
        ['Firefox', 'Chrome', 'Chrome'] AS browsers
)
GROUP BY
    2,
    3
```

```text
┌─impressions─┬─city─────┬─browser─┐
│           1 │ Istanbul │ Firefox │
│           1 │ Berlin   │ Chrome  │
│           1 │ Bobruisk │ Chrome  │
└─────────────┴──────────┴─────────┘
```
