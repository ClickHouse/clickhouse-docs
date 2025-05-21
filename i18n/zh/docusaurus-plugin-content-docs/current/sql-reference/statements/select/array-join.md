---
'description': 'Documentation for ARRAY JOIN Clause'
'sidebar_label': 'ARRAY JOIN'
'slug': '/sql-reference/statements/select/array-join'
'title': 'ARRAY JOIN Clause'
---




# ARRAY JOIN 子句

对于包含数组列的表，生成一个新表的操作是常见的，其中每个行都包含初始列的每个单独数组元素，而其他列的值则被复制。这就是 `ARRAY JOIN` 子句所做的基本情况。

它的名称来源于它可以被视为与数组或嵌套数据结构执行 `JOIN`。其意图与 [arrayJoin](/sql-reference/functions/array-join) 函数类似，但该子句的功能更加广泛。

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
- `LEFT ARRAY JOIN` - `JOIN` 的结果包含带有空数组的行。空数组的值被设定为数组元素类型的默认值（通常为 0、空字符串或 NULL）。

## 基本 ARRAY JOIN 示例 {#basic-array-join-examples}

### ARRAY JOIN 和 LEFT ARRAY JOIN {#array-join-left-array-join-examples}

下面的示例演示了 `ARRAY JOIN` 和 `LEFT ARRAY JOIN` 子句的用法。我们来创建一个带有 [Array](../../../sql-reference/data-types/array.md) 类型列的表并插入值：

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

以下示例使用了 `ARRAY JOIN` 子句：

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

下一个示例使用了 `LEFT ARRAY JOIN` 子句：

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

这个函数通常与 `ARRAY JOIN` 一起使用。它允许在应用 `ARRAY JOIN` 后对每个数组仅计算一次。例如：

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

在这个例子中，Reaches 是转化次数（在应用 `ARRAY JOIN` 后获得的字符串），而 Hits 是页面浏览量（在 `ARRAY JOIN` 之前的字符串）。在这个特定情况下，你可以用更简单的方法获得相同的结果：

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

在使用 `ARRAY JOIN` 并聚合数组元素时，这个函数非常有用。

在这个例子中，每个目标 ID 都计算了转化次数（Goals 嵌套数据结构中的每个元素是已达到的目标，我们称之为转化）和会话数。如果没有 `ARRAY JOIN`，我们会将会话数计算为 sum(Sign)。但在这个特定情况下，行数被嵌套的 Goals 结构乘以，因此为了在应用 `ARRAY JOIN` 后一次性计算每个会话，我们对 `arrayEnumerateUniq(Goals.ID)` 函数的值应用了条件。

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

在 `ARRAY JOIN` 子句中，可以为数组指定一个别名。在这种情况下，可以通过这个别名访问数组项，但可以通过原始名称访问数组本身。例如：

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

使用别名，你可以与外部数组执行 `ARRAY JOIN`。例如：

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

多个数组可以在 `ARRAY JOIN` 子句中用逗号分隔。在这种情况下，它们被同时 `JOIN`（直接求和，而不是笛卡尔积）。请注意，默认情况下，所有数组必须具有相同的大小。例如：

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

下面的示例使用了 [arrayEnumerate](/sql-reference/functions/array-functions#arrayenumeratearr) 函数：

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

不同大小的多个数组可以使用：`SETTINGS enable_unaligned_array_join = 1` 进行连接。例如：

```sql
SELECT s, arr, a, b
FROM arrays_test ARRAY JOIN arr as a, [['a','b'],['c']] as b
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

`ARRAY JOIN` 也可以与 [嵌套数据结构](../../../sql-reference/data-types/nested-data-structures/index.md) 一起使用：

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

在 `ARRAY JOIN` 中指定嵌套数据结构的名称时，其意义与 `ARRAY JOIN` 及其包含的所有数组元素相同。以下是列出的示例：

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

这种变体也是有意义的：

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

可以使用别名来表示嵌套数据结构，以选择 `JOIN` 结果或源数组。例如：

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

使用 [arrayEnumerate](/sql-reference/functions/array-functions#arrayenumeratearr) 函数的示例：

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

在运行 `ARRAY JOIN` 时，查询执行顺序是优化的。尽管在查询中 `ARRAY JOIN` 必须始终在 [WHERE](../../../sql-reference/statements/select/where.md)/[PREWHERE](../../../sql-reference/statements/select/prewhere.md) 子句之前指定，但从技术上讲，它们可以以任何顺序执行，除非 `ARRAY JOIN` 的结果用于过滤。处理顺序由查询优化器控制。

### 与短路函数求值的不兼容性 {#incompatibility-with-short-circuit-function-evaluation}

[短路函数求值](/operations/settings/settings#short_circuit_function_evaluation) 是一种优化特定函数（如 `if`、`multiIf`、`and` 和 `or`）中复杂表达式执行的特性。它防止在执行这些函数时发生潜在的异常，例如除以零。

`arrayJoin` 始终被执行且不支持短路函数求值。这是因为它是一个独特的函数，在查询分析和执行期间与所有其他函数分开处理，并且需要额外的逻辑，而这些逻辑在短路函数执行中无法工作。原因是结果中的行数依赖于 `arrayJoin` 的结果，而实现 `arrayJoin` 的惰性执行过于复杂且成本高昂。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
