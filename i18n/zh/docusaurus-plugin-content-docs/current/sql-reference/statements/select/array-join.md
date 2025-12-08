---
description: 'ARRAY JOIN 子句的文档'
sidebar_label: 'ARRAY JOIN'
slug: /sql-reference/statements/select/array-join
title: 'ARRAY JOIN 子句'
doc_type: 'reference'
---

# ARRAY JOIN 子句 {#array-join-clause}

对于包含数组列的表，一个常见操作是生成一个新表：在该新表中，原始数组列中的每个数组元素各占一行，而其他列的值会被复制重复。这是 `ARRAY JOIN` 子句的基本用例。

之所以叫这个名字，是因为可以把这一操作看作是对数组或嵌套数据结构执行一次 `JOIN`。其意图与 [arrayJoin](/sql-reference/functions/array-join) 函数类似，但该子句的功能更为强大。

语法：

```sql
SELECT <expr_list>
FROM <left_subquery>
[LEFT] ARRAY JOIN <array>
[WHERE|PREWHERE <expr>]
...
```

支持的 `ARRAY JOIN` 类型如下所示：

* `ARRAY JOIN` - 在默认情况下，`JOIN` 结果中不包含空数组。
* `LEFT ARRAY JOIN` - `JOIN` 结果中会包含含有空数组的行。空数组的值被设置为数组元素类型的默认值（通常是 0、空字符串或 NULL）。

## 基本 ARRAY JOIN 示例 {#basic-array-join-examples}

### ARRAY JOIN 和 LEFT ARRAY JOIN {#array-join-left-array-join-examples}

下面的示例展示了 `ARRAY JOIN` 和 `LEFT ARRAY JOIN` 子句的用法。我们先创建一个包含 [Array](../../../sql-reference/data-types/array.md) 类型列的表，并向其中插入值：

```sql
CREATE TABLE arrays_test
(
    s String,
    arr Array(UInt8)
) ENGINE = Memory;

INSERT INTO arrays_test
VALUES ('Hello', [1,2]), ('World', [3,4,5]), ('Goodbye', []);
```

```response
┌─s───────────┬─arr─────┐
│ 你好        │ [1,2]   │
│ 世界        │ [3,4,5] │
│ 再见        │ []      │
└─────────────┴─────────┘
```

下面的示例使用 `ARRAY JOIN` 子句：

```sql
SELECT s, arr
FROM arrays_test
ARRAY JOIN arr;
```

```response
┌─s─────┬─arr─┐
│ Hello │   1 │
│ Hello │   2 │
│ World │   3 │
│ World │   4 │
│ World │   5 │
└───────┴─────┘
```

以下示例使用 `LEFT ARRAY JOIN` 子句：

```sql
SELECT s, arr
FROM arrays_test
LEFT ARRAY JOIN arr;
```

```response
┌─s───────────┬─arr─┐
│ 你好        │   1 │
│ 你好        │   2 │
│ 世界        │   3 │
│ 世界        │   4 │
│ 世界        │   5 │
│ 再见        │   0 │
└─────────────┴─────┘
```

### ARRAY JOIN 和 arrayEnumerate 函数 {#array-join-arrayEnumerate}

此函数通常与 `ARRAY JOIN` 一起使用。它可以在应用 `ARRAY JOIN` 之后，对每个数组只计数一次。示例：

```sql
SELECT
    count() AS 达到次数,
    countIf(num = 1) AS 点击次数
FROM test.hits
ARRAY JOIN
    GoalsReached,
    arrayEnumerate(GoalsReached) AS num
WHERE CounterID = 160656
LIMIT 10
```

```text
┌─到达次数─┬──命中次数─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

在本示例中，Reaches 表示转化次数（应用 `ARRAY JOIN` 后得到的字符串数量），而 Hits 表示页面浏览量（应用 `ARRAY JOIN` 之前的字符串数量）。在这种情况下，你可以用一种更简单的方式得到相同的结果：

```sql
SELECT
    sum(length(GoalsReached)) AS Reaches,
    count() AS Hits
FROM test.hits
WHERE (CounterID = 160656) AND notEmpty(GoalsReached)
```

```text
┌─到达次数─┬──命中次数─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

### ARRAY JOIN 和 arrayEnumerateUniq {#array_join_arrayEnumerateUniq}

在使用 `ARRAY JOIN` 并对数组元素进行聚合时，此函数非常有用。

在此示例中，需要针对每个目标 ID 计算转化次数（Goals 嵌套数据结构中的每个元素都表示一次达成的目标，我们称之为一次转化）以及会话次数。如果不使用 `ARRAY JOIN`，会话次数会被统计为 sum(Sign)。但在这个特定场景中，行已经按嵌套的 Goals 结构被展开为多行，因此为了在此之后仍然只对每个会话统计一次，我们对 `arrayEnumerateUniq(Goals.ID)` 函数的返回值应用一个条件。

```sql
SELECT
    Goals.ID AS GoalID,
    sum(Sign) AS Reaches,
    sumIf(Sign, num = 1) AS Visits
FROM test.visits
ARRAY JOIN
    Goals,
    arrayEnumerateUniq(Goals.ID) AS num
WHERE CounterID = 160656
GROUP BY GoalID
ORDER BY Reaches DESC
LIMIT 10
```

```text
┌──GoalID─┬─触达人数─┬─访问次数─┐
│   53225 │    3214 │   1097 │
│ 2825062 │    3188 │   1097 │
│   56600 │    2803 │    488 │
│ 1989037 │    2401 │    365 │
│ 2830064 │    2396 │    910 │
│ 1113562 │    2372 │    373 │
│ 3270895 │    2262 │    812 │
│ 1084657 │    2262 │    345 │
│   56599 │    2260 │    799 │
│ 3271094 │    2256 │    812 │
└─────────┴─────────┴────────┘
```

## 使用别名 {#using-aliases}

可以在 `ARRAY JOIN` 子句中为数组指定一个别名。在这种情况下，可以通过该别名访问数组元素，但数组本身仍通过原始名称访问。示例：

```sql
SELECT s, arr, a
FROM arrays_test
ARRAY JOIN arr AS a;
```

```response
┌─s─────┬─arr─────┬─a─┐
│ Hello │ [1,2]   │ 1 │
│ Hello │ [1,2]   │ 2 │
│ World │ [3,4,5] │ 3 │
│ World │ [3,4,5] │ 4 │
│ World │ [3,4,5] │ 5 │
└───────┴─────────┴───┘
```

通过别名，你可以对外部数组执行 `ARRAY JOIN`。例如：

```sql
SELECT s, arr_external
FROM arrays_test
ARRAY JOIN [1, 2, 3] AS arr_external;
```

```response
┌─s───────────┬─arr_external─┐
│ Hello       │            1 │
│ Hello       │            2 │
│ Hello       │            3 │
│ World       │            1 │
│ World       │            2 │
│ World       │            3 │
│ Goodbye     │            1 │
│ Goodbye     │            2 │
│ Goodbye     │            3 │
└─────────────┴──────────────┘
```

可以在 `ARRAY JOIN` 子句中使用逗号分隔多个数组。在这种情况下，将对这些数组同时执行 `JOIN`（是直和，而不是笛卡尔积）。请注意，默认情况下，所有数组的长度必须相同。示例：

```sql
SELECT s, arr, a, num, mapped
FROM arrays_test
ARRAY JOIN arr AS a, arrayEnumerate(arr) AS num, arrayMap(x -> x + 1, arr) AS mapped;
```

```response
┌─s─────┬─arr─────┬─a─┬─num─┬─mapped─┐
│ Hello │ [1,2]   │ 1 │   1 │      2 │
│ Hello │ [1,2]   │ 2 │   2 │      3 │
│ World │ [3,4,5] │ 3 │   1 │      4 │
│ World │ [3,4,5] │ 4 │   2 │      5 │
│ World │ [3,4,5] │ 5 │   3 │      6 │
└───────┴─────────┴───┴─────┴────────┘
```

以下示例使用 [arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 函数：

```sql
SELECT s, arr, a, num, arrayEnumerate(arr)
FROM arrays_test
ARRAY JOIN arr AS a, arrayEnumerate(arr) AS num;
```

```response
┌─s─────┬─arr─────┬─a─┬─num─┬─arrayEnumerate(arr)─┐
│ Hello │ [1,2]   │ 1 │   1 │ [1,2]               │
│ Hello │ [1,2]   │ 2 │   2 │ [1,2]               │
│ World │ [3,4,5] │ 3 │   1 │ [1,2,3]             │
│ World │ [3,4,5] │ 4 │   2 │ [1,2,3]             │
│ World │ [3,4,5] │ 5 │   3 │ [1,2,3]             │
└───────┴─────────┴───┴─────┴─────────────────────┘
```

可以通过设置 `SETTINGS enable_unaligned_array_join = 1` 来对多个长度不同的数组执行 JOIN。示例：

```sql
SELECT s, arr, a, b
FROM arrays_test ARRAY JOIN arr AS a, [['a','b'],['c']] AS b
SETTINGS enable_unaligned_array_join = 1;
```

```response
┌─s───────┬─arr─────┬─a─┬─b─────────┐
│ Hello   │ [1,2]   │ 1 │ ['a','b'] │
│ Hello   │ [1,2]   │ 2 │ ['c']     │
│ World   │ [3,4,5] │ 3 │ ['a','b'] │
│ World   │ [3,4,5] │ 4 │ ['c']     │
│ World   │ [3,4,5] │ 5 │ []        │
│ Goodbye │ []      │ 0 │ ['a','b'] │
│ Goodbye │ []      │ 0 │ ['c']     │
└─────────┴─────────┴───┴───────────┘
```

## ARRAY JOIN 与嵌套数据结构 {#array-join-with-nested-data-structure}

`ARRAY JOIN` 也可以用于[嵌套数据结构](../../../sql-reference/data-types/nested-data-structures/index.md)：

```sql
CREATE TABLE nested_test
(
    s String,
    nest Nested(
    x UInt8,
    y UInt32)
) ENGINE = Memory;

INSERT INTO nested_test
VALUES ('Hello', [1,2], [10,20]), ('World', [3,4,5], [30,40,50]), ('Goodbye', [], []);
```

```response
┌─s───────┬─nest.x──┬─nest.y─────┐
│ 你好    │ [1,2]   │ [10,20]    │
│ 世界    │ [3,4,5] │ [30,40,50] │
│ 再见    │ []      │ []         │
└─────────┴─────────┴────────────┘
```

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN nest;
```

```response
┌─s─────┬─nest.x─┬─nest.y─┐
│ 你好 │      1 │     10 │
│ 你好 │      2 │     20 │
│ 世界 │      3 │     30 │
│ 世界 │      4 │     40 │
│ 世界 │      5 │     50 │
└───────┴────────┴────────┘
```

在 `ARRAY JOIN` 中指定嵌套数据结构的名称时，其含义等同于对该嵌套结构中包含的所有数组元素执行 `ARRAY JOIN`。下面给出一些示例：

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN `nest.x`, `nest.y`;
```

```response
┌─s─────┬─nest.x─┬─nest.y─┐
│ 你好 │      1 │     10 │
│ 你好 │      2 │     20 │
│ 世界 │      3 │     30 │
│ 世界 │      4 │     40 │
│ 世界 │      5 │     50 │
└───────┴────────┴────────┘
```

这种变体也同样合理：

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN `nest.x`;
```

```response
┌─s─────┬─nest.x─┬─nest.y─────┐
│ Hello │      1 │ [10,20]    │
│ Hello │      2 │ [10,20]    │
│ World │      3 │ [30,40,50] │
│ World │      4 │ [30,40,50] │
│ World │      5 │ [30,40,50] │
└───────┴────────┴────────────┘
```

可以为嵌套数据结构使用别名，以便在 `JOIN` 结果和源数组之间进行选择。示例：

```sql
SELECT s, `n.x`, `n.y`, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN nest AS n;
```

```response
┌─s─────┬─n.x─┬─n.y─┬─nest.x──┬─nest.y─────┐
│ 你好 │   1 │  10 │ [1,2]   │ [10,20]    │
│ 你好 │   2 │  20 │ [1,2]   │ [10,20]    │
│ 世界 │   3 │  30 │ [3,4,5] │ [30,40,50] │
│ 世界 │   4 │  40 │ [3,4,5] │ [30,40,50] │
│ 世界 │   5 │  50 │ [3,4,5] │ [30,40,50] │
└───────┴─────┴─────┴─────────┴────────────┘
```

使用 [arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 函数的示例：

```sql
SELECT s, `n.x`, `n.y`, `nest.x`, `nest.y`, num
FROM nested_test
ARRAY JOIN nest AS n, arrayEnumerate(`nest.x`) AS num;
```

```response
┌─s─────┬─n.x─┬─n.y─┬─nest.x──┬─nest.y─────┬─num─┐
│ 你好 │   1 │  10 │ [1,2]   │ [10,20]    │   1 │
│ 你好 │   2 │  20 │ [1,2]   │ [10,20]    │   2 │
│ 世界 │   3 │  30 │ [3,4,5] │ [30,40,50] │   1 │
│ 世界 │   4 │  40 │ [3,4,5] │ [30,40,50] │   2 │
│ 世界 │   5 │  50 │ [3,4,5] │ [30,40,50] │   3 │
└───────┴─────┴─────┴─────────┴────────────┴─────┘
```

## 实现细节 {#implementation-details}

在运行 `ARRAY JOIN` 时，查询的执行顺序会被优化。尽管在查询中 `ARRAY JOIN` 必须始终写在 [WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) 子句之前，但从技术上讲，它们可以按任意顺序执行，除非需要使用 `ARRAY JOIN` 的结果进行过滤。具体执行顺序由查询优化器决定。

### 与短路函数求值的不兼容性 {#incompatibility-with-short-circuit-function-evaluation}

[短路函数求值](/operations/settings/settings#short_circuit_function_evaluation) 是一项功能，用于在特定函数（如 `if`、`multiIf`、`and` 和 `or`）中优化复杂表达式的执行。它可以防止在执行这些函数时出现潜在异常，例如除以零错误。

`arrayJoin` 始终会被执行，且不支持短路函数求值。这是因为它是一个在查询分析和执行过程中与其他所有函数分开处理的特殊函数，并且需要额外的逻辑，而这些逻辑无法与短路函数执行配合使用。原因在于结果中的行数取决于 `arrayJoin` 的结果，实现对 `arrayJoin` 的惰性执行过于复杂且代价高昂。

## 相关内容 {#related-content}

- 博客文章：[在 ClickHouse 中处理时序数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
