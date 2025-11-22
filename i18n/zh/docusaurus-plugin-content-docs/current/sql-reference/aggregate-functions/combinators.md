---
description: '聚合函数组合器文档'
sidebar_label: '组合器'
sidebar_position: 37
slug: /sql-reference/aggregate-functions/combinators
title: '聚合函数组合器'
doc_type: 'reference'
---



# 聚合函数组合器

聚合函数的名称后可以添加一个后缀，从而改变该聚合函数的工作方式。



## -If {#-if}

后缀 -If 可以附加到任何聚合函数的名称后。在这种情况下,聚合函数接受一个额外的参数——一个条件(Uint8 类型)。聚合函数仅处理满足该条件的行。如果条件从未满足,则返回默认值(通常是零或空字符串)。

示例:`sumIf(column, cond)`、`countIf(cond)`、`avgIf(x, cond)`、`quantilesTimingIf(level1, level2)(x, cond)`、`argMinIf(arg, val, cond)` 等。

使用条件聚合函数,您可以一次性计算多个条件的聚合结果,而无需使用子查询和 `JOIN`。例如,条件聚合函数可用于实现分段对比功能。


## -Array {#-array}

-Array 后缀可以附加到任何聚合函数。在这种情况下,聚合函数接受 'Array(T)' 类型(数组)的参数,而不是 'T' 类型参数。如果聚合函数接受多个参数,则这些参数必须是长度相等的数组。处理数组时,聚合函数会像原始聚合函数一样对所有数组元素进行操作。

示例 1:`sumArray(arr)` - 对所有 'arr' 数组的所有元素求和。在此示例中,也可以更简单地写为:`sum(arraySum(arr))`。

示例 2:`uniqArray(arr)` – 计算所有 'arr' 数组中唯一元素的数量。也可以用更简单的方式实现:`uniq(arrayJoin(arr))`,但并非总能在查询中添加 'arrayJoin'。

-If 和 -Array 可以组合使用。但是,'Array' 必须在前,'If' 在后。示例:`uniqArrayIf(arr, cond)`、`quantilesTimingArrayIf(level1, level2)(arr, cond)`。由于这种顺序,'cond' 参数不会是数组。


## -Map {#-map}

-Map 后缀可以附加到任何聚合函数上。这将创建一个聚合函数,该函数接受 Map 类型作为参数,并使用指定的聚合函数对映射中每个键的值分别进行聚合。结果也是 Map 类型。

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

如果应用此组合器,聚合函数将返回相同的值,但类型不同。这是一个 [SimpleAggregateFunction(...)](../../sql-reference/data-types/simpleaggregatefunction.md),可以存储在表中以与 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 表配合使用。

**语法**

```sql
<aggFunction>SimpleState(x)
```

**参数**

- `x` — 聚合函数参数。

**返回值**

返回 `SimpleAggregateFunction(...)` 类型的聚合函数值。

**示例**

查询:

```sql
WITH anySimpleState(number) AS c SELECT toTypeName(c), c FROM numbers(1);
```

结果:

```text
┌─toTypeName(c)────────────────────────┬─c─┐
│ SimpleAggregateFunction(any, UInt64) │ 0 │
└──────────────────────────────────────┴───┘
```


## -State {#-state}

如果应用此组合器,聚合函数不会返回最终结果值(例如 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数的唯一值数量),而是返回聚合的中间状态(对于 `uniq`,这是用于计算唯一值数量的哈希表)。这是一个 `AggregateFunction(...)` 类型,可用于进一步处理或存储在表中以便稍后完成聚合。

:::note
请注意,-MapState 对于相同数据不是不变式,因为中间状态中的数据顺序可能会改变,但这不会影响数据的导入。
:::

要使用这些状态,请使用:

- [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 表引擎。
- [finalizeAggregation](/sql-reference/functions/other-functions#finalizeAggregation) 函数。
- [runningAccumulate](../../sql-reference/functions/other-functions.md#runningAccumulate) 函数。
- [-Merge](#-merge) 组合器。
- [-MergeState](#-mergestate) 组合器。


## -Merge {#-merge}

如果应用此组合器，聚合函数会接收中间聚合状态作为参数，合并这些状态以完成聚合，并返回最终结果值。


## -MergeState {#-mergestate}

以与 -Merge 组合器相同的方式合并中间聚合状态。但它不返回最终结果值,而是返回一个中间聚合状态,类似于 -State 组合器。


## -ForEach {#-foreach}

将表的聚合函数转换为数组的聚合函数,对数组中对应位置的元素进行聚合并返回结果数组。例如,对数组 `[1, 2]`、`[3, 4, 5]` 和 `[6, 7]` 使用 `sumForEach`,会将对应位置的数组元素相加后返回结果 `[10, 13, 5]`。


## -Distinct {#-distinct}

每个唯一的参数组合仅会被聚合一次。重复值会被忽略。
示例：`sum(DISTINCT x)`(或 `sumDistinct(x)`)、`groupArray(DISTINCT x)`(或 `groupArrayDistinct(x)`)、`corrStable(DISTINCT x, y)`(或 `corrStableDistinct(x, y)`)等。


## -OrDefault {#-ordefault}

改变聚合函数的行为。

如果聚合函数没有输入值,使用此组合器将返回其返回数据类型的默认值。适用于可以接受空输入数据的聚合函数。

`-OrDefault` 可以与其他组合器一起使用。

**语法**

```sql
<aggFunction>OrDefault(x)
```

**参数**

- `x` — 聚合函数参数。

**返回值**

如果没有可聚合的数据,则返回聚合函数返回类型的默认值。

返回类型取决于所使用的聚合函数。

**示例**

查询:

```sql
SELECT avg(number), avgOrDefault(number) FROM numbers(0)
```

结果:

```text
┌─avg(number)─┬─avgOrDefault(number)─┐
│         nan │                    0 │
└─────────────┴──────────────────────┘
```

此外,`-OrDefault` 可以与其他组合器一起使用。当聚合函数不接受空输入时,这很有用。

查询:

```sql
SELECT avgOrDefaultIf(x, x > 10)
FROM
(
    SELECT toDecimal32(1.23, 2) AS x
)
```

结果:

```text
┌─avgOrDefaultIf(x, greater(x, 10))─┐
│                              0.00 │
└───────────────────────────────────┘
```


## -OrNull {#-ornull}

改变聚合函数的行为。

此组合器将聚合函数的结果转换为 [Nullable](../../sql-reference/data-types/nullable.md) 数据类型。如果聚合函数没有值可供计算,则返回 [NULL](/operations/settings/formats#input_format_null_as_default)。

`-OrNull` 可与其他组合器一起使用。

**语法**

```sql
<aggFunction>OrNull(x)
```

**参数**

- `x` — 聚合函数参数。

**返回值**

- 聚合函数的结果,转换为 `Nullable` 数据类型。
- 如果没有可聚合的内容,则返回 `NULL`。

类型:`Nullable(聚合函数返回类型)`。

**示例**

在聚合函数末尾添加 `-orNull`。

查询:

```sql
SELECT sumOrNull(number), toTypeName(sumOrNull(number)) FROM numbers(10) WHERE number > 10
```

结果:

```text
┌─sumOrNull(number)─┬─toTypeName(sumOrNull(number))─┐
│              ᴺᵁᴸᴸ │ Nullable(UInt64)              │
└───────────────────┴───────────────────────────────┘
```

`-OrNull` 也可与其他组合器一起使用。当聚合函数不接受空输入时,这很有用。

查询:

```sql
SELECT avgOrNullIf(x, x > 10)
FROM
(
    SELECT toDecimal32(1.23, 2) AS x
)
```

结果:

```text
┌─avgOrNullIf(x, greater(x, 10))─┐
│                           ᴺᵁᴸᴸ │
└────────────────────────────────┘
```


## -Resample {#-resample}

允许将数据划分为多个组,然后分别对这些组中的数据进行聚合。通过将某一列的值拆分为多个区间来创建组。

```sql
<aggFunction>Resample(start, end, step)(<aggFunction_params>, resampling_key)
```

**参数**

- `start` — `resampling_key` 值的整个所需区间的起始值。
- `stop` — `resampling_key` 值的整个所需区间的结束值。整个区间不包括 `stop` 值 `[start, stop)`。
- `step` — 将整个区间分隔为子区间的步长。`aggFunction` 在每个子区间上独立执行。
- `resampling_key` — 用于将数据分隔到区间的列。
- `aggFunction_params` — `aggFunction` 的参数。

**返回值**

- 每个子区间的 `aggFunction` 结果组成的数组。

**示例**

考虑包含以下数据的 `people` 表:

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

获取年龄位于 `[30,60)` 和 `[60,75)` 区间内的人员姓名。由于使用整数表示年龄,因此实际获取的年龄位于 `[30, 59]` 和 `[60,74]` 区间内。

要将姓名聚合到数组中,使用 [groupArray](/sql-reference/aggregate-functions/reference/grouparray) 聚合函数。该函数接受一个参数。在本例中为 `name` 列。`groupArrayResample` 函数使用 `age` 列按年龄聚合姓名。为了定义所需的区间,将 `30, 75, 30` 参数传递给 `groupArrayResample` 函数。

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM people
```

```text
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

分析结果。

`John` 不在样本中,因为他太年轻了。其他人根据指定的年龄区间进行分布。

现在计算指定年龄区间内的总人数及其平均工资。

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

后缀 -ArgMin 可以附加到任何聚合函数名称之后。在这种情况下,聚合函数会接受一个额外参数,该参数应为任何可比较的表达式。聚合函数仅处理在指定的额外表达式中具有最小值的行。

示例:`sumArgMin(column, expr)`、`countArgMin(expr)`、`avgArgMin(x, expr)` 等。


## -ArgMax {#-argmax}

与后缀 -ArgMin 类似,但仅处理指定附加表达式的值为最大值的行。


## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
