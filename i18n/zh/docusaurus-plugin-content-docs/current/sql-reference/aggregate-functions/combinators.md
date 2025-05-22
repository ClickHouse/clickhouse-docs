
# 聚合函数组合器

聚合函数的名称可以附加一个后缀。这会改变聚合函数的工作方式。

## -If {#-if}

后缀 -If 可以附加到任何聚合函数的名称。在这种情况下，聚合函数接受一个额外的参数 - 一个条件（Uint8 类型）。聚合函数仅处理触发条件的行。如果条件没有被触发，即使一次也没有，则返回默认值（通常是零或空字符串）。

示例： `sumIf(column, cond)`， `countIf(cond)`， `avgIf(x, cond)`， `quantilesTimingIf(level1, level2)(x, cond)`， `argMinIf(arg, val, cond)` 等等。

使用条件聚合函数，您可以一次计算多个条件的聚合，而无需使用子查询和 `JOIN`。例如，条件聚合函数可用于实现段比较功能。

## -Array {#-array}

后缀 -Array 可以附加到任何聚合函数。在这种情况下，聚合函数接受 'Array(T)' 类型（数组）作为参数，而不是 'T' 类型的参数。如果聚合函数接受多个参数，这必须是相同长度的数组。在处理数组时，聚合函数的工作方式与原始聚合函数在所有数组元素之间相同。

示例 1： `sumArray(arr)` - 对所有 'arr' 数组的所有元素求和。在这个例子中，可以更简单地写成： `sum(arraySum(arr))`。

示例 2： `uniqArray(arr)` - 计算所有 'arr' 数组中唯一元素的数量。这可以用更简单的方式实现： `uniq(arrayJoin(arr))`，但并不总是可以将 'arrayJoin' 添加到查询中。

-If 和 -Array 可以组合使用。然而，'Array' 必须排在前面，然后是 'If'。示例： `uniqArrayIf(arr, cond)`， `quantilesTimingArrayIf(level1, level2)(arr, cond)`。由于这个顺序，'cond' 参数不会是一个数组。

## -Map {#-map}

后缀 -Map 可以附加到任何聚合函数。这将创建一个聚合函数，该函数将 Map 类型作为参数，并使用指定的聚合函数单独聚合映射每个键的值。结果也是 Map 类型。

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

如果应用此组合器，聚合函数返回相同的值，但类型不同。这是一个 [SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md)，可以存储在表中，以便与 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 表一起使用。

**语法**

```sql
<aggFunction>SimpleState(x)
```

**参数**

- `x` — 聚合函数参数。

**返回值**

聚合函数的 `SimpleAggregateFunction(...)` 类型的值。

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

如果应用此组合器，聚合函数不返回结果值（例如 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数的唯一值数量），而是聚合的中间状态（对于 `uniq`，这是计算唯一值数量的哈希表）。这是一个 `AggregateFunction(...)`，可以用于进一步处理或存储在表中以便稍后完成聚合。

:::note
请注意，由于中间状态的数据顺序可能会变化，-MapState 对于相同数据并不是不变的，尽管这不会影响数据的摄取。
:::

要处理这些状态，请使用：

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 表引擎。
- [finalizeAggregation](/sql-reference/functions/other-functions#finalizeaggregation) 函数。
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningaccumulate) 函数。
- [-Merge](#-merge) 组合器。
- [-MergeState](#-mergestate) 组合器。

## -Merge {#-merge}

如果应用此组合器，聚合函数将中间聚合状态作为参数，合并这些状态以完成聚合，并返回结果值。

## -MergeState {#-mergestate}

以与 -Merge 组合器相同的方式合并中间聚合状态。然而，它不返回结果值，而是一个中间聚合状态，类似于 -State 组合器。

## -ForEach {#-foreach}

将表的聚合函数转换为数组的聚合函数，该聚合函数聚合对应的数组项并返回结果数组。例如，对于数组 `[1, 2]`，`[3, 4, 5]` 和 `[6, 7]`， `sumForEach` 返回结果 `[10, 13, 5]`，这是将对应的数组项相加的结果。

## -Distinct {#-distinct}

每个唯一的参数组合将仅被聚合一次。重复的值将被忽略。
示例： `sum(DISTINCT x)`（或 `sumDistinct(x)`）， `groupArray(DISTINCT x)`（或 `groupArrayDistinct(x)`）， `corrStable(DISTINCT x, y)`（或 `corrStableDistinct(x, y)`）等。

## -OrDefault {#-ordefault}

改变聚合函数的行为。

如果聚合函数没有输入值，使用此组合器返回其返回数据类型的默认值。适用于可以接受空输入数据的聚合函数。

`-OrDefault` 可以与其他组合器一起使用。

**语法**

```sql
<aggFunction>OrDefault(x)
```

**参数**

- `x` — 聚合函数参数。

**返回值**

如果没有内容可聚合，则返回聚合函数返回类型的默认值。

类型取决于使用的聚合函数。

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

此外， `-OrDefault` 还可以与其他组合器一起使用。当聚合函数不接受空输入时，它非常有用。

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

改变聚合函数的行为。

此组合器将聚合函数的结果转换为 [Nullable](../../sql-reference/data-types/nullable.md) 数据类型。如果聚合函数没有计算的值，则返回 [NULL](/operations/settings/formats#input_format_null_as_default)。

`-OrNull` 可以与其他组合器一起使用。

**语法**

```sql
<aggFunction>OrNull(x)
```

**参数**

- `x` — 聚合函数参数。

**返回值**

- 聚合函数的结果，转换为 `Nullable` 数据类型。
- 如果没有内容可聚合，则返回 `NULL`。

类型： `Nullable(聚合函数返回类型)`。

**示例**

在聚合函数末尾添加 `-orNull`。

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

此外， `-OrNull` 还可以与其他组合器一起使用。当聚合函数不接受空输入时，它非常有用。

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

允许您将数据划分为组，然后分别聚合这些组中的数据。组是通过将一列中的值拆分为区间来创建的。

```sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**参数**

- `start` — `resampling_key` 值的整个所需区间的起始值。
- `stop` — `resampling_key` 值的整个所需区间的结束值。整个区间不包括 `stop` 值 `[start, stop)`。
- `step` — 将整个区间分隔为子区间的步长。 `aggFunction` 在每个子区间上独立执行。
- `resampling_key` — 用于将数据分隔为区间的列。
- `aggFunction_params` — `aggFunction` 参数。

**返回值**

- 每个子区间的 `aggFunction` 结果数组。

**示例**

考虑具有以下数据的 `people` 表：

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

让我们获取年龄在 `[30,60)` 和 `[60,75)` 区间内的人的姓名。由于我们对年龄使用整数表示，因此我们在 `[30, 59]` 和 `[60,74]` 区间内获得年龄。

为了将姓名聚合为数组，我们使用 [groupArray](/sql-reference/aggregate-functions/reference/grouparray) 聚合函数。它接受一个参数。在我们的情况下，它是 `name` 列。 `groupArrayResample` 函数应该使用 `age` 列按年龄聚合姓名。为了定义所需的区间，我们将 `30, 75, 30` 作为参数传递给 `groupArrayResample` 函数。

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

现在让我们计算指定年龄区间内总人数及其平均薪资。

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

后缀 -ArgMin 可以附加到任何聚合函数的名称。在这种情况下，聚合函数接受一个额外的参数，该参数应为任何可比较的表达式。聚合函数仅处理在该指定的额外表达式下具有最小值的行。

示例： `sumArgMin(column, expr)`， `countArgMin(expr)`， `avgArgMin(x, expr)` 等等。

## -ArgMax {#-argmax}

与后缀 -ArgMin 类似，但仅处理在指定额外表达式下具有最大值的行。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
