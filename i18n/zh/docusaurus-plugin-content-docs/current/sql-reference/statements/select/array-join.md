---
'description': 'ARRAY JOIN 子句的文档'
'sidebar_label': 'ARRAY JOIN'
'slug': '/sql-reference/statements/select/array-join'
'title': 'ARRAY JOIN 子句'
'doc_type': 'reference'
---


# ARRAY JOIN 子句

对于包含数组列的表，将初始列的每个单独数组元素生成一行的新表是一个常见操作，同时其他列的值会被重复。这就是 `ARRAY JOIN` 子句的基本用法。

它的名称来源于可以被视为对一个数组或嵌套数据结构执行 `JOIN` 的事实。其意图与 [arrayJoin](/sql-reference/functions/array-join) 函数相似，但该子句的功能更广泛。

语法：

```sql
SELECT <expr_list>
FROM <left_subquery>
[LEFT] ARRAY JOIN <array>
[WHERE|PREWHERE <expr>]
...
```

支持的 `ARRAY JOIN` 类型如下所示：

- `ARRAY JOIN` - 在基本情况下，空数组不包含在 `JOIN` 的结果中。
- `LEFT ARRAY JOIN` - `JOIN` 的结果包含具有空数组的行。空数组的值被设置为数组元素类型的默认值（通常为 0、空字符串或 NULL）。

## 基本 ARRAY JOIN 示例 {#basic-array-join-examples}

### ARRAY JOIN 和 LEFT ARRAY JOIN {#array-join-left-array-join-examples}

以下示例演示了 `ARRAY JOIN` 和 `LEFT ARRAY JOIN` 子句的用法。我们来创建一个具有 [Array](../../../sql-reference/data-types/array.md) 类型列的表并插入值：

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

下一个示例使用 `LEFT ARRAY JOIN` 子句：

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

这个函数通常与 `ARRAY JOIN` 一起使用。它允许在应用 `ARRAY JOIN` 后对每个数组计数一次。示例：

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

在这个示例中，Reaches 是转换的数量（应用 `ARRAY JOIN` 后接收到的字符串），而 Hits 是页面浏览量（在 `ARRAY JOIN` 之前的字符串）。在这种特定情况下，你可以通过一种更简单的方式获得相同的结果：

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

在使用 `ARRAY JOIN` 和聚合数组元素时，这个函数非常有用。

在这个示例中，每个目标 ID 都有一个转换数量的计算（Goals 嵌套数据结构中的每个元素都是一个达成的目标，我们称之为转换）和会话的数量。在没有 `ARRAY JOIN` 的情况下，我们会将会话的数量统计为 sum(Sign)。但在这种特定情况下，行数被嵌套的 Goals 结构乘以，因此为了在这之后计算每个会话一次，我们应用了对 `arrayEnumerateUniq(Goals.ID)` 函数值的条件。

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

在 `ARRAY JOIN` 子句中，可以为数组指定一个别名。在这种情况下，可以通过这个别名访问数组项，但数组本身通过原始名称访问。示例：

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

使用别名，你可以对子数组执行 `ARRAY JOIN`。例如：

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

多个数组可以在 `ARRAY JOIN` 子句中用逗号分隔。在这种情况下，`JOIN` 是同时执行的（直接的总和，而不是笛卡尔积）。请注意，默认情况下所有数组必须具有相同的大小。示例：

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

下面的示例使用了 [arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 函数：

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

可以通过使用 `SETTINGS enable_unaligned_array_join = 1` 将多个不同大小的数组连接起来。示例：

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

`ARRAY JOIN` 也适用于 [嵌套数据结构](../../../sql-reference/data-types/nested-data-structures/index.md)：

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

在 `ARRAY JOIN` 中指定嵌套数据结构的名称时，其含义与其构成的所有数组元素的 `ARRAY JOIN` 相同。以下是示例：

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

这种变体也有意义：

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

可以为嵌套数据结构使用别名，以选择 `JOIN` 结果或源数组。示例：

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

使用 [arrayEnumerate](/sql-reference/functions/array-functions#arrayEnumerate) 函数的示例：

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

运行 `ARRAY JOIN` 时，查询执行顺序是经过优化的。虽然 `ARRAY JOIN` 必须始终在查询中的 [WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) 子句之前指定，但从技术上讲，它们可以以任何顺序执行，除非 `ARRAY JOIN` 的结果用于过滤。处理顺序由查询优化器控制。

### 与短路函数求值的不兼容性 {#incompatibility-with-short-circuit-function-evaluation}

[短路函数求值](/operations/settings/settings#short_circuit_function_evaluation) 是一个功能，它优化在特定函数（如 `if`、`multiIf`、`and` 和 `or`）中复杂表达式的执行。它防止在这些函数执行期间出现潜在异常，例如除以零。

`arrayJoin` 始终被执行，并且不支持短路函数求值。这是因为它是一个单独处理的独特函数，在查询分析和执行期间与所有其他函数分开处理，并且需要额外的逻辑，这在短路函数执行中不起作用。原因是结果中的行数取决于 `arrayJoin` 的结果，而实现 `arrayJoin` 的惰性执行太复杂和昂贵。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
