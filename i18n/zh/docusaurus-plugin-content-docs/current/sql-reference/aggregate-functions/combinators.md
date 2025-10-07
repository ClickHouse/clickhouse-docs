---
'description': '聚合函数组合器的文档'
'sidebar_label': '组合器'
'sidebar_position': 37
'slug': '/sql-reference/aggregate-functions/combinators'
'title': '聚合函数组合器'
'doc_type': 'reference'
---


# 聚合函数组合器

聚合函数的名称可以添加后缀。这样可以改变聚合函数的工作方式。

## -If {#-if}

后缀 -If 可以添加到任何聚合函数的名称上。在这种情况下，聚合函数接受一个额外参数——条件（Uint8 类型）。聚合函数仅处理触发条件的行。如果条件一次都未被触发，则返回默认值（通常为零或空字符串）。

示例： `sumIf(column, cond)`，`countIf(cond)`，`avgIf(x, cond)`，`quantilesTimingIf(level1, level2)(x, cond)`，`argMinIf(arg, val, cond)` 等等。

使用条件聚合函数，您可以一并计算多个条件的聚合，而无需使用子查询和 `JOIN`。例如，条件聚合函数可用于实现分段比较功能。

## -Array {#-array}

后缀 -Array 可以添加到任何聚合函数上。在这种情况下，聚合函数接受 'Array(T)' 类型（数组）的参数，而不是 'T' 类型的参数。如果聚合函数接受多个参数，这些参数必须是等长的数组。在处理数组时，聚合函数的工作方式与原始聚合函数在所有数组元素上的工作方式相同。

示例 1： `sumArray(arr)` - 对所有 'arr' 数组的所有元素求和。在这个例子中，更简单的写法是：`sum(arraySum(arr))`。

示例 2： `uniqArray(arr)` – 计算所有 'arr' 数组中唯一元素的数量。这可以通过更简单的方式完成：`uniq(arrayJoin(arr))`，但并非总是可以将 'arrayJoin' 添加到查询中。

-If 和 -Array 可以结合使用。但是，'Array' 必须在前，然后是 'If'。示例： `uniqArrayIf(arr, cond)`，`quantilesTimingArrayIf(level1, level2)(arr, cond)`。由于这种顺序，'cond' 参数不会是数组。

## -Map {#-map}

后缀 -Map 可以添加到任何聚合函数上。这将创建一个聚合函数，该函数将 Map 类型作为参数，并使用指定的聚合函数单独聚合映射的每个键的值。结果也是 Map 类型。

**示例**

```sql
CREATE TABLE map_map(
    date Date,
    timeslot DateTime,
    status Map(String, UInt64)
) ENGINE = Log;

INSERT INTO map_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', (['a', 'b', 'c'], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:00:00', (['c', 'd', 'e'], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', (['d', 'e', 'f'], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', (['f', 'g', 'g'], [10, 10, 10]));

SELECT
    timeslot,
    sumMap(status),
    avgMap(status),
    minMap(status)
FROM map_map
GROUP BY timeslot;

┌────────────timeslot─┬─sumMap(status)───────────────────────┬─avgMap(status)───────────────────────┬─minMap(status)───────────────────────┐
│ 2000-01-01 00:00:00 │ {'a':10,'b':10,'c':20,'d':10,'e':10} │ {'a':10,'b':10,'c':10,'d':10,'e':10} │ {'a':10,'b':10,'c':10,'d':10,'e':10} │
│ 2000-01-01 00:01:00 │ {'d':10,'e':10,'f':20,'g':20}        │ {'d':10,'e':10,'f':10,'g':10}        │ {'d':10,'e':10,'f':10,'g':10}        │
└─────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┘
```

## -SimpleState {#-simplestate}

如果您应用此组合器，聚合函数将返回相同的值，但类型不同。这是一个 [SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md)，可以存储在表中以与 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 表一起使用。

**语法**

```sql
<aggFunction>SimpleState(x)
```

**参数**

- `x` — 聚合函数参数。

**返回值**

聚合函数的 `SimpleAggregateFunction(...)` 类型值。

**示例**

查询：

```sql
WITH anySimpleState(number) AS c SELECT toTypeName(c), c FROM numbers(1);
```

结果：

```text
┌─toTypeName(c)────────────────────────┬─c─┐
│ SimpleAggregateFunction(any, UInt64) │ 0 │
└──────────────────────────────────────┴───┘
```

## -State {#-state}

如果您应用此组合器，聚合函数不会返回结果值（例如， [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数的唯一值数量），而返回聚合的中间状态（对于 `uniq` 来说，这是用于计算唯一值数量的哈希表）。这是一个 `AggregateFunction(...)`，可用于进一步处理或存储在表中以便稍后完成聚合。

:::note
请注意，由于中间状态中数据顺序可能改变，因此 -MapState 对于相同数据并非不变，但这不会影响此数据的摄取。
:::

要处理这些状态，使用：

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 表引擎。
- [finalizeAggregation](/sql-reference/functions/other-functions#finalizeaggregation) 函数。
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningaccumulate) 函数。
- [-Merge](#-merge) 组合器。
- [-MergeState](#-mergestate) 组合器。

## -Merge {#-merge}

如果您应用此组合器，聚合函数将中间聚合状态作为参数，结合这些状态以完成聚合，并返回结果值。

## -MergeState {#-mergestate}

以与 -Merge 组合器相同的方式合并中间聚合状态。但是，它不返回结果值，而是中间聚合状态，类似于 -State 组合器。

## -ForEach {#-foreach}

将表的聚合函数转换为数组的聚合函数，聚合相应的数组项并返回结果数组。例如，`sumForEach` 对于数组 `[1, 2]`，`[3, 4, 5]` 和 `[6, 7]`，经过相加后返回结果 `[10, 13, 5]`。

## -Distinct {#-distinct}

每个唯一的参数组合仅聚合一次。重复的值会被忽略。
示例： `sum(DISTINCT x)`（或 `sumDistinct(x)`），`groupArray(DISTINCT x)`（或 `groupArrayDistinct(x)`），`corrStable(DISTINCT x, y)`（或 `corrStableDistinct(x, y)`）等。

## -OrDefault {#-ordefault}

更改聚合函数的行为。

如果聚合函数没有输入值，使用此组合器将返回其返回数据类型的默认值。适用于可以接受空输入数据的聚合函数。

`-OrDefault` 可以与其他组合器一起使用。

**语法**

```sql
<aggFunction>OrDefault(x)
```

**参数**

- `x` — 聚合函数参数。

**返回值**

如果没有要聚合的内容，则返回聚合函数返回类型的默认值。

类型取决于所用的聚合函数。

**示例**

查询：

```sql
SELECT avg(number), avgOrDefault(number) FROM numbers(0)
```

结果：

```text
┌─avg(number)─┬─avgOrDefault(number)─┐
│         nan │                    0 │
└─────────────┴──────────────────────┘
```

此外，`-OrDefault` 还可以与其他组合器一起使用。当聚合函数不接受空输入时非常有用。

查询：

```sql
SELECT avgOrDefaultIf(x, x > 10)
FROM
(
    SELECT toDecimal32(1.23, 2) AS x
)
```

结果：

```text
┌─avgOrDefaultIf(x, greater(x, 10))─┐
│                              0.00 │
└───────────────────────────────────┘
```

## -OrNull {#-ornull}

更改聚合函数的行为。

此组合器将聚合函数的结果转换为 [Nullable](../../sql-reference/data-types/nullable.md) 数据类型。如果聚合函数没有可计算的值，它将返回 [NULL](/operations/settings/formats#input_format_null_as_default)。

`-OrNull` 可以与其他组合器一起使用。

**语法**

```sql
<aggFunction>OrNull(x)
```

**参数**

- `x` — 聚合函数参数。

**返回值**

- 聚合函数的结果，转换为 `Nullable` 数据类型。
- 如果没有要聚合的内容，则返回 `NULL`。

类型： `Nullable(aggregate function return type)`。

**示例**

在聚合函数的末尾添加 `-orNull`。

查询：

```sql
SELECT sumOrNull(number), toTypeName(sumOrNull(number)) FROM numbers(10) WHERE number > 10
```

结果：

```text
┌─sumOrNull(number)─┬─toTypeName(sumOrNull(number))─┐
│              ᴺᵁᴸᴸ │ Nullable(UInt64)              │
└───────────────────┴───────────────────────────────┘
```

此外，`-OrNull` 还可以与其他组合器一起使用。当聚合函数不接受空输入时非常有用。

查询：

```sql
SELECT avgOrNullIf(x, x > 10)
FROM
(
    SELECT toDecimal32(1.23, 2) AS x
)
```

结果：

```text
┌─avgOrNullIf(x, greater(x, 10))─┐
│                           ᴺᵁᴸᴸ │
└────────────────────────────────┘
```

## -Resample {#-resample}

允许您将数据分组，然后分别对这些组中的数据进行聚合。通过将一列中的值划分为区间来创建组。

```sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**参数**

- `start` — `resampling_key` 值的整个所需区间的起始值。
- `stop` — `resampling_key` 值的整个所需区间的结束值。整个区间不包括 `stop` 值 `[start, stop)`。
- `step` — 将整个区间分隔为子区间的步长。`aggFunction` 在每个子区间独立执行。
- `resampling_key` — 用于将数据分隔为区间的列。
- `aggFunction_params` — `aggFunction` 参数。

**返回值**

- 每个子区间的 `aggFunction` 结果数组。

**示例**

考虑以下数据的 `people` 表：

```text
┌─name───┬─age─┬─wage─┐
│ John   │  16 │   10 │
│ Alice  │  30 │   15 │
│ Mary   │  35 │    8 │
│ Evelyn │  48 │ 11.5 │
│ David  │  62 │  9.9 │
│ Brian  │  60 │   16 │
└────────┴─────┴──────┘
```

让我们获取年龄在 `[30,60)` 和 `[60,75)` 区间内的人的名字。由于我们使用整数表示年龄，因此我们得到的年龄在 `[30, 59]` 和 `[60,74]` 区间内。

为了以数组聚合名字，我们使用 [groupArray](/sql-reference/aggregate-functions/reference/grouparray) 聚合函数。它接受一个参数。在我们的例子中，它是 `name` 列。`groupArrayResample` 函数应使用 `age` 列按年龄聚合名字。为了定义所需区间，我们将 `30, 75, 30` 参数传递给 `groupArrayResample` 函数。

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

```text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

考虑结果。

`John` 不在样本中，因为他太年轻。其他人根据指定的年龄区间分布。

现在让我们统计指定年龄区间内的总人数和他们的平均薪水。

```sql
SELECT
    countResample(30, 75, 30)(name, age) AS amount,
    avgResample(30, 75, 30)(wage, age) AS avg_wage
FROM people
```

```text
┌─amount─┬─avg_wage──────────────────┐
│ [3,2]  │ [11.5,12.949999809265137] │
└────────┴───────────────────────────┘
```

## -ArgMin {#-argmin}

后缀 -ArgMin 可以添加到任何聚合函数的名称上。在这种情况下，聚合函数接受一个额外参数，该参数应该是任何可比较的表达式。聚合函数仅处理具有指定额外表达式最小值的行。

示例： `sumArgMin(column, expr)`，`countArgMin(expr)`，`avgArgMin(x, expr)` 等等。

## -ArgMax {#-argmax}

与后缀 -ArgMin 类似，但仅处理具有指定额外表达式最大值的行。

## 相关内容 {#related-content}

- 博客： [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
