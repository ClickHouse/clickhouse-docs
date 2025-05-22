
# arrayJoin函数

这是一个非常不寻常的函数。

正常的函数不会改变一组行，而只是改变每行的值（映射）。
聚合函数压缩一组行（折叠或减少）。
`arrayJoin`函数则是将每一行生成一组行（展开）。

该函数以数组作为参数，并将源行传播到多个行，数量为数组中的元素个数。
所有列中的值都被简单地复制，除了应用该函数的列中的值；它被替换为相应的数组值。

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

`arrayJoin`函数影响查询的所有部分，包括`WHERE`部分。注意结果为2，即使子查询返回了1行。

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

一个查询可以使用多个`arrayJoin`函数。在这种情况下，转换将多次执行，行数也会相应增加。

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
使用相同表达式的多个`arrayJoin`可能由于优化而产生意外的结果。
对于这种情况，考虑用额外的操作修改重复的数组表达式，这些操作不会影响连接结果 - 例如`arrayJoin(arraySort(arr))`，`arrayJoin(arrayConcat(arr, []))`。

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

注意SELECT查询中的[ARRAY JOIN](../statements/select/array-join.md)语法，它提供了更广泛的可能性。
`ARRAY JOIN`允许你一次性转换多个具有相同元素数量的数组。

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

或者你可以使用[Tuple](../data-types/tuple.md)。

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
