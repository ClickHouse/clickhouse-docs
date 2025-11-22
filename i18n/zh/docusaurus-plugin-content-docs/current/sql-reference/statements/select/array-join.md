---
description: 'ARRAY JOIN 子句说明'
sidebar_label: 'ARRAY JOIN'
slug: /sql-reference/statements/select/array-join
title: 'ARRAY JOIN 子句'
doc_type: 'reference'
---



# ARRAY JOIN 子句

对于包含数组列的表，一个常见的操作是生成一个新表：该数组列中的每个数组元素各占一行，而其他列的值会被重复。这是 `ARRAY JOIN` 子句所执行操作的基本情形。

其名称来源于这样一个事实：可以把它看作对数组或嵌套数据结构执行一次 `JOIN` 操作。其用意与 [arrayJoin](/sql-reference/functions/array-join) 函数类似，但该子句的功能更为广泛。

语法：

```sql
SELECT <表达式列表>
FROM <左子查询>
[LEFT] ARRAY JOIN <数组>
[WHERE|PREWHERE <表达式>]
...
```

`ARRAY JOIN` 支持的类型如下所示：

* `ARRAY JOIN` - 在默认情况下，`JOIN` 的结果中不包含数组为空的行。
* `LEFT ARRAY JOIN` - `JOIN` 的结果包含数组为空的行。此时这些空数组的元素值会被设置为该数组元素类型的默认值（通常为 0、空字符串或 NULL）。


## 基本 ARRAY JOIN 示例 {#basic-array-join-examples}

### ARRAY JOIN 和 LEFT ARRAY JOIN {#array-join-left-array-join-examples}

以下示例演示了 `ARRAY JOIN` 和 `LEFT ARRAY JOIN` 子句的用法。首先创建一个包含 [Array](../../../sql-reference/data-types/array.md) 类型列的表并插入数据:

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
│ Hello       │ [1,2]   │
│ World       │ [3,4,5] │
│ Goodbye     │ []      │
└─────────────┴─────────┘
```

以下示例使用 `ARRAY JOIN` 子句:

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

下一个示例使用 `LEFT ARRAY JOIN` 子句:

```sql
SELECT s, arr
FROM arrays_test
LEFT ARRAY JOIN arr;
```

```response
┌─s───────────┬─arr─┐
│ Hello       │   1 │
│ Hello       │   2 │
│ World       │   3 │
│ World       │   4 │
│ World       │   5 │
│ Goodbye     │   0 │
└─────────────┴─────┘
```

### ARRAY JOIN 和 arrayEnumerate 函数 {#array-join-arrayEnumerate}

此函数通常与 `ARRAY JOIN` 一起使用。它允许在应用 `ARRAY JOIN` 后对每个数组中的元素只计数一次。示例:

```sql
SELECT
    count() AS Reaches,
    countIf(num = 1) AS Hits
FROM test.hits
ARRAY JOIN
    GoalsReached,
    arrayEnumerate(GoalsReached) AS num
WHERE CounterID = 160656
LIMIT 10
```

```text
┌─Reaches─┬──Hits─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

在此示例中,Reaches 是转化次数(应用 `ARRAY JOIN` 后得到的行数),Hits 是页面浏览次数(`ARRAY JOIN` 之前的行数)。在这种特定情况下,可以用更简单的方式获得相同的结果:

```sql
SELECT
    sum(length(GoalsReached)) AS Reaches,
    count() AS Hits
FROM test.hits
WHERE (CounterID = 160656) AND notEmpty(GoalsReached)
```

```text
┌─Reaches─┬──Hits─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

### ARRAY JOIN 和 arrayEnumerateUniq {#array_join_arrayEnumerateUniq}

此函数在使用 `ARRAY JOIN` 并聚合数组元素时非常有用。

在此示例中,每个目标 ID 都计算了转化次数(Goals 嵌套数据结构中的每个元素都是已达成的目标,我们将其称为转化)和会话次数。如果没有 `ARRAY JOIN`,我们会将会话次数计为 sum(Sign)。但在这种特定情况下,由于嵌套的 Goals 结构导致行数被扩展,因此为了在扩展后对每个会话只计数一次,我们对 `arrayEnumerateUniq(Goals.ID)` 函数的值应用了条件。

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
┌──GoalID─┬─Reaches─┬─Visits─┐
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

可以在 `ARRAY JOIN` 子句中为数组指定别名。在这种情况下,数组元素可以通过该别名访问,但数组本身仍需通过原始名称访问。示例:

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

使用别名可以对外部数组执行 `ARRAY JOIN`。例如:

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

可以在 `ARRAY JOIN` 子句中用逗号分隔多个数组。在这种情况下,会同时对这些数组执行 `JOIN`(直接求和,而非笛卡尔积)。注意,默认情况下所有数组必须具有相同的大小。示例:

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

以下示例使用了 [arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 函数:

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

可以通过设置 `SETTINGS enable_unaligned_array_join = 1` 来连接不同大小的多个数组。示例:

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


## 对嵌套数据结构使用 ARRAY JOIN {#array-join-with-nested-data-structure}

`ARRAY JOIN` 也可用于[嵌套数据结构](../../../sql-reference/data-types/nested-data-structures/index.md):

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
│ Hello   │ [1,2]   │ [10,20]    │
│ World   │ [3,4,5] │ [30,40,50] │
│ Goodbye │ []      │ []         │
└─────────┴─────────┴────────────┘
```

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN nest;
```

```response
┌─s─────┬─nest.x─┬─nest.y─┐
│ Hello │      1 │     10 │
│ Hello │      2 │     20 │
│ World │      3 │     30 │
│ World │      4 │     40 │
│ World │      5 │     50 │
└───────┴────────┴────────┘
```

在 `ARRAY JOIN` 中指定嵌套数据结构的名称时,其含义等同于对该结构所包含的所有数组元素执行 `ARRAY JOIN`。示例如下:

```sql
SELECT s, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN `nest.x`, `nest.y`;
```

```response
┌─s─────┬─nest.x─┬─nest.y─┐
│ Hello │      1 │     10 │
│ Hello │      2 │     20 │
│ World │      3 │     30 │
│ World │      4 │     40 │
│ World │      5 │     50 │
└───────┴────────┴────────┘
```

以下这种用法也是合理的:

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

可以为嵌套数据结构使用别名,以便同时选择 `JOIN` 结果或源数组。示例:

```sql
SELECT s, `n.x`, `n.y`, `nest.x`, `nest.y`
FROM nested_test
ARRAY JOIN nest AS n;
```

```response
┌─s─────┬─n.x─┬─n.y─┬─nest.x──┬─nest.y─────┐
│ Hello │   1 │  10 │ [1,2]   │ [10,20]    │
│ Hello │   2 │  20 │ [1,2]   │ [10,20]    │
│ World │   3 │  30 │ [3,4,5] │ [30,40,50] │
│ World │   4 │  40 │ [3,4,5] │ [30,40,50] │
│ World │   5 │  50 │ [3,4,5] │ [30,40,50] │
└───────┴─────┴─────┴─────────┴────────────┘
```

使用 [arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 函数的示例:

```sql
SELECT s, `n.x`, `n.y`, `nest.x`, `nest.y`, num
FROM nested_test
ARRAY JOIN nest AS n, arrayEnumerate(`nest.x`) AS num;
```


```response
┌─s─────┬─n.x─┬─n.y─┬─nest.x──┬─nest.y─────┬─num─┐
│ Hello │   1 │  10 │ [1,2]   │ [10,20]    │   1 │
│ Hello │   2 │  20 │ [1,2]   │ [10,20]    │   2 │
│ World │   3 │  30 │ [3,4,5] │ [30,40,50] │   1 │
│ World │   4 │  40 │ [3,4,5] │ [30,40,50] │   2 │
│ World │   5 │  50 │ [3,4,5] │ [30,40,50] │   3 │
└───────┴─────┴─────┴─────────┴────────────┴─────┘
```


## 实现细节 {#implementation-details}

运行 `ARRAY JOIN` 时会优化查询执行顺序。尽管在查询中 `ARRAY JOIN` 必须始终指定在 [WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) 子句之前,但从技术上讲,除非 `ARRAY JOIN` 的结果用于过滤,否则它们可以按任意顺序执行。处理顺序由查询优化器控制。

### 与短路函数求值的不兼容性 {#incompatibility-with-short-circuit-function-evaluation}

[短路函数求值](/operations/settings/settings#short_circuit_function_evaluation)是一项优化特定函数(如 `if`、`multiIf`、`and` 和 `or`)中复杂表达式执行的功能。它可以防止在执行这些函数期间发生潜在的异常,例如除零错误。

`arrayJoin` 始终会被执行,不支持短路函数求值。这是因为它是一个特殊的函数,在查询分析和执行期间与所有其他函数分开处理,并且需要额外的逻辑,而这些逻辑无法与短路函数执行配合使用。原因在于结果中的行数取决于 `arrayJoin` 的结果,实现 `arrayJoin` 的惰性执行过于复杂且代价高昂。


## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中使用时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
