---
description: '聚合函数组合器的文档'
sidebar_label: '组合器'
sidebar_position: 37
slug: /sql-reference/aggregate-functions/combinators
title: '聚合函数组合器'
doc_type: 'reference'
---

# 聚合函数组合器 {#aggregate-function-combinators}

聚合函数名可以追加一个后缀，从而改变该聚合函数的工作方式。

## -If {#-if}

后缀 -If 可以附加到任意聚合函数的名称后面。此时，聚合函数会额外接受一个参数——条件（`UInt8` 类型）。聚合函数只会处理触发该条件的行。如果条件一次都没有被触发，则返回默认值（通常为 0 或空字符串）。

示例：`sumIf(column, cond)`、`countIf(cond)`、`avgIf(x, cond)`、`quantilesTimingIf(level1, level2)(x, cond)`、`argMinIf(arg, val, cond)` 等。

借助条件聚合函数，你可以在不使用子查询和 `JOIN` 的情况下，同时针对多个条件计算聚合值。例如，可以使用条件聚合函数实现分群对比功能。

## -Array {#-array}

可以将 -Array 后缀附加到任意聚合函数上。在这种情况下，聚合函数接受类型为 `Array(T)`（数组）的参数，而不是类型为 `T` 的参数。如果聚合函数接受多个参数，则这些参数必须是长度相同的数组。在处理数组时，该聚合函数的行为与原始聚合函数在所有数组元素上的行为相同。

示例 1：`sumArray(arr)` —— 对所有 `arr` 数组中的所有元素求和。在这个例子中，也可以更简单地写成：`sum(arraySum(arr))`。

示例 2：`uniqArray(arr)` —— 计算所有 `arr` 数组中唯一元素的数量。这也可以用更简单的方式实现：`uniq(arrayJoin(arr))`，但并不总是可以在查询中添加 `arrayJoin`。

-If 和 -Array 可以组合使用。不过，必须先使用 `Array`，再使用 `If`。示例：`uniqArrayIf(arr, cond)`、`quantilesTimingArrayIf(level1, level2)(arr, cond)`。由于这一顺序，`cond` 参数不会是数组。

## -Map {#-map}

可以为任意聚合函数添加 `-Map` 后缀。这样会创建一个以 `Map` 类型作为参数的聚合函数，并使用指定的聚合函数分别聚合该 `Map` 中每个键对应的值。结果同样为 `Map` 类型。

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

应用此组合子后，聚合函数会返回相同的值，但类型不同。它是一个可以存储在表中的 [SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md)，用于与 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 表配合使用。

**语法**

```sql
<aggFunction>SimpleState(x)
```

**参数**

* `x` — 聚合函数的参数。

**返回值**

返回 `SimpleAggregateFunction(...)` 类型的聚合函数值。

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

如果你应用这个组合子，聚合函数不会返回最终结果值（例如 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数的唯一值个数），而是返回聚合的中间状态（对于 `uniq`，这是用于计算唯一值个数的哈希表）。这是一个 `AggregateFunction(...)` 类型，可以用于后续处理，或者存储在表中以便稍后完成聚合。

:::note
请注意，由于中间状态中的数据顺序可能发生变化，-MapState 对于相同数据并不是不变的，不过这并不影响对此数据的摄取。
:::

要处理这些状态，请使用：

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 表引擎。
- [finalizeAggregation](/sql-reference/functions/other-functions#finalizeAggregation) 函数。
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningAccumulate) 函数。
- [-Merge](#-merge) 组合子。
- [-MergeState](#-mergestate) 组合子。

## -Merge {#-merge}

如果使用此组合器，聚合函数会将中间聚合状态作为参数，合并这些状态以完成聚合，并返回最终结果值。

## -MergeState {#-mergestate}

以与 -Merge 组合器相同的方式合并中间聚合状态。但它不会返回最终结果值，而是返回中间聚合状态，类似于 -State 组合器。

## -ForEach {#-foreach}

将作用于表的聚合函数转换为作用于数组的聚合函数，对各数组中对应位置的元素进行聚合，并返回结果数组。例如，对于数组 `[1, 2]`、`[3, 4, 5]` 和 `[6, 7]`，`sumForEach` 在对对应位置的数组元素求和后返回结果 `[10, 13, 5]`。

## -Distinct {#-distinct}

每个唯一的参数组合只会被聚合一次。重复的值会被忽略。
示例：`sum(DISTINCT x)`（或 `sumDistinct(x)`）、`groupArray(DISTINCT x)`（或 `groupArrayDistinct(x)`）、`corrStable(DISTINCT x, y)`（或 `corrStableDistinct(x, y)`）等。

## -OrDefault {#-ordefault}

修改聚合函数的行为。

如果聚合函数没有输入值，使用此组合器时，会返回其返回类型的默认值。适用于可以接受空输入数据的聚合函数。

`-OrDefault` 可以与其他组合器一起使用。

**语法**

```sql
<aggFunction>OrDefault(x)
```

**参数**

* `x` — 聚合函数的参数。

**返回值**

如果没有任何可聚合的数据，则返回聚合函数返回类型的默认值。

具体类型取决于所使用的聚合函数。

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

另外，`-OrDefault` 也可以与其他组合器一起使用。当聚合函数无法处理空输入时，这会很有用。

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

修改聚合函数的行为。

此组合器将聚合函数的结果转换为 [Nullable](../../sql-reference/data-types/nullable.md) 数据类型。如果聚合函数没有可用于计算的值，则返回 [NULL](/operations/settings/formats#input_format_null_as_default)。

`-OrNull` 可以与其他组合器一起使用。

**语法**

```sql
<aggFunction>OrNull(x)
```

**参数**

* `x` — 聚合函数的参数。

**返回值**

* 聚合函数的结果，转换为 `Nullable` 数据类型。
* 如果没有任何可聚合的数据，则返回 `NULL`。

类型：`Nullable(聚合函数返回类型)`。

**示例**

在聚合函数名称末尾添加 `-orNull`。

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

`-OrNull` 也可以与其他组合器一起使用。当聚合函数不接受空输入时，这会很有用。

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

可将数据划分为多个组，并分别对每个组中的数据进行聚合。分组是通过将某一列的取值划分为不同的区间来完成的。

```sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**参数**

* `start` — `resampling_key` 值的完整所需区间的起始值。
* `stop` — `resampling_key` 值的完整所需区间的结束值。该完整区间不包含 `stop` 值，即 `[start, stop)`。
* `step` — 将完整区间划分为子区间时使用的步长。`aggFunction` 会在每个子区间上独立执行。
* `resampling_key` — 用于将数据划分为各个区间的列。
* `aggFunction_params` — 传给 `aggFunction` 的参数。

**返回值**

* 一个数组，包含每个子区间上执行 `aggFunction` 的结果。

**示例**

考虑包含如下数据的 `people` 表：

```text
┌─姓名───┬─年龄─┬─工资─┐
│ John   │  16 │   10 │
│ Alice  │  30 │   15 │
│ Mary   │  35 │    8 │
│ Evelyn │  48 │ 11.5 │
│ David  │  62 │  9.9 │
│ Brian  │  60 │   16 │
└────────┴─────┴──────┘
```

让我们获取年龄位于 `[30,60)` 和 `[60,75)` 区间内的人的姓名。由于我们使用整数来表示年龄，因此实际得到的年龄区间为 `[30, 59]` 和 `[60,74]`。

要将姓名聚合到数组中，我们使用 [groupArray](/sql-reference/aggregate-functions/reference/grouparray) 聚合函数。它只接受一个参数，在我们的示例中就是 `name` 列。`groupArrayResample` 函数则使用 `age` 列按年龄对姓名进行聚合。要定义所需的区间，我们向 `groupArrayResample` 函数传递 `30, 75, 30` 这几个参数。

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

```text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

来看一下结果。

由于 `John` 年龄太小，他没有被纳入样本。其他人则按照指定的年龄区间进行了划分。

现在让我们计算在各个指定年龄区间内的总人数及其平均工资。

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

后缀 -ArgMin 可以附加到任意聚合函数的名称后使用。在这种情况下，该聚合函数会额外接受一个参数，该参数应当是任意可比较的表达式。聚合函数只会处理在该附加表达式对应的值上最小的那些行。

示例：`sumArgMin(column, expr)`、`countArgMin(expr)`、`avgArgMin(x, expr)` 等。

## -ArgMax {#-argmax}

类似于后缀 -ArgMin，但只处理在指定附加表达式上具有最大值的行。

## 相关内容 {#related-content}

- 博客文章：[在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
