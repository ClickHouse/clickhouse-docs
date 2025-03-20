---
slug: /sql-reference/functions/conditional-functions
sidebar_position: 40
sidebar_label: 条件
---


# 条件函数

## if {#if}

执行条件分支。

如果条件 `cond` 的值评估为非零，函数返回表达式 `then` 的结果。 如果 `cond` 的值评估为零或 `NULL`，则返回 `else` 表达式的结果。

设置 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) 控制是否使用短路评估。如果启用，`then` 表达式仅在 `cond` 为 `true` 的行上进行评估，而 `else` 表达式仅在 `cond` 为 `false` 的行上进行评估。例如，使用短路评估时，执行查询 `SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)` 时不会抛出除以零的异常。

`then` 和 `else` 必须是类似类型。

**语法**

``` sql
if(cond, then, else)
```
别名： `cond ? then : else` （三元操作符）

**参数**

- `cond` – 被评估的条件。 UInt8、Nullable(UInt8) 或 NULL。
- `then` – 如果 `condition` 为 true 时返回的表达式。
- `else` – 如果 `condition` 为 false 或 NULL 时返回的表达式。

**返回值**

根据条件 `cond` 返回 `then` 或 `else` 表达式的结果。

**示例**

``` sql
SELECT if(1, plus(2, 2), plus(2, 6));
```

结果：

``` text
┌─plus(2, 2)─┐
│          4 │
└────────────┘
```

## multiIf {#multiif}

允许在查询中更简洁地编写 [CASE](../../sql-reference/operators/index.md#conditional-expression) 操作符。

**语法**

``` sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

设置 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) 控制是否使用短路评估。如果启用，`then_i` 表达式仅在 `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}) AND cond_i)` 为 `true` 的行上进行评估，`cond_i` 仅在 `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}))` 为 `true` 的行上进行评估。例如，使用短路评估时，执行查询 `SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)` 时不会抛出除以零的异常。

**参数**

该函数接受 `2N+1` 个参数：
- `cond_N` — 第 N 个被评估的条件，用于控制是否返回 `then_N`。
- `then_N` — 当 `cond_N` 为 true 时，函数的结果。
- `else` — 如果没有条件为 true，函数的结果。

**返回值**

根据条件 `cond_N` 返回的 `then_N` 或 `else` 表达式的结果。

**示例**

假设该数据表：

``` text
┌─left─┬─right─┐
│ ᴺᵁᴸᴸ │     4 │
│    1 │     3 │
│    2 │     2 │
│    3 │     1 │
│    4 │  ᴺᵁᴸᴸ │
└──────┴───────┘
```

``` sql
SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'left is greater', left = right, 'Both equal', 'Null value') AS result
FROM LEFT_RIGHT

┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ Null value      │
│    1 │     3 │ left is smaller │
│    2 │     2 │ Both equal      │
│    3 │     1 │ left is greater │
│    4 │  ᴺᵁᴸᴸ │ Null value      │
└──────┴───────┴─────────────────┘
```

## 直接使用条件结果 {#using-conditional-results-directly}

条件始终返回 `0`、`1` 或 `NULL`。因此，您可以像这样直接使用条件结果：

``` sql
SELECT left < right AS is_small
FROM LEFT_RIGHT

┌─is_small─┐
│     ᴺᵁᴸᴸ │
│        1 │
│        0 │
│        0 │
│     ᴺᵁᴸᴹ │
└──────────┘
```

## 条件中的 NULL 值 {#null-values-in-conditionals}

当条件中涉及 `NULL` 值时，结果也将为 `NULL`。

``` sql
SELECT
    NULL < 1,
    2 < NULL,
    NULL < NULL,
    NULL = NULL

┌─less(NULL, 1)─┬─less(2, NULL)─┬─less(NULL, NULL)─┬─equals(NULL, NULL)─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ               │
└───────────────┴───────────────┴──────────────────┴────────────────────┘
```

因此，如果类型是 `Nullable`，则应仔细构建查询。

以下示例通过未能将等于条件添加到 `multiIf` 中演示了这一点。

``` sql
SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'right is smaller', 'Both equal') AS faulty_result
FROM LEFT_RIGHT

┌─left─┬─right─┬─faulty_result────┐
│ ᴺᵁᴸᴸ │     4 │ Both equal       │
│    1 │     3 │ left is smaller  │
│    2 │     2 │ Both equal       │
│    3 │     1 │ right is smaller │
│    4 │  ᴺᵁᴸᴸ │ Both equal       │
└──────┴───────┴──────────────────┘
```

## greatest {#greatest}

返回一系列值中的最大值。所有列表成员必须是可比较的类型。

示例：

```sql
SELECT greatest(1, 2, toUInt8(3), 3.) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      3 │ Float64 │
└────────┴─────────┘
```

:::note
返回的类型是 Float64，因为 UInt8 必须被提升到 64 位进行比较。
:::

```sql
SELECT greatest(['hello'], ['there'], ['world'])
```
```response
┌─greatest(['hello'], ['there'], ['world'])─┐
│ ['world']                                 │
└───────────────────────────────────────────┘
```

```sql
SELECT greatest(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3))
```
```response
┌─greatest(toDateTime32(plus(now(), toIntervalDay(1))), toDateTime64(now(), 3))─┐
│                                                       2023-05-12 01:16:59.000 │
└──────────────────────────────────────────────────────────────────────────┘
```

:::note
返回的类型是 DateTime64，因为 DateTime32 必须被提升到 64 位进行比较。
:::

## least {#least}

返回一系列值中的最小值。所有列表成员必须是可比较的类型。

示例：

```sql
SELECT least(1, 2, toUInt8(3), 3.) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      1 │ Float64 │
└────────┴─────────┘
```

:::note
返回的类型是 Float64，因为 UInt8 必须被提升到 64 位进行比较。
:::

```sql
SELECT least(['hello'], ['there'], ['world'])
```
```response
┌─least(['hello'], ['there'], ['world'])─┐
│ ['hello']                              │
└────────────────────────────────────────┘
```

```sql
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3))
```
```response
┌─least(toDateTime32(plus(now(), toIntervalDay(1))), toDateTime64(now(), 3))─┐
│                                                    2023-05-12 01:16:59.000 │
└────────────────────────────────────────────────────────────────────────────┘
```

:::note
返回的类型是 DateTime64，因为 DateTime32 必须被提升到 64 位进行比较。
:::

## clamp {#clamp}

将返回值限制在 A 和 B 之间。

**语法**

``` sql
clamp(value, min, max)
```

**参数**

- `value` – 输入值。
- `min` – 限制下限。
- `max` – 限制上限。

**返回值**

如果值小于最小值，则返回最小值；如果大于最大值，则返回最大值；否则返回当前值。

示例：

```sql
SELECT clamp(1, 2, 3) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      2 │ Float64 │
└────────┴─────────┘
```
