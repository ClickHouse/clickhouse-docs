---
'description': '条件函数文档'
'sidebar_label': '条件'
'sidebar_position': 40
'slug': '/sql-reference/functions/conditional-functions'
'title': '条件函数'
---




# 条件函数

## if {#if}

执行条件分支。

如果条件 `cond` 的值非零，则函数返回表达式 `then` 的结果。如果 `cond` 的值为零或 `NULL`，则返回 `else` 表达式的结果。

设置 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) 控制是否使用短路求值。如果启用，`then` 表达式仅在 `cond` 为 `true` 的行上被计算，而 `else` 表达式则在 `cond` 为 `false` 的行上被计算。例如，在短路求值的情况下，当执行查询 `SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)` 时，不会抛出除以零的异常。

`then` 和 `else` 必须为相似的类型。

**语法**

```sql
if(cond, then, else)
```
别名：`cond ? then : else`（三元操作符）

**参数**

- `cond` – 被评估的条件。UInt8、Nullable(UInt8) 或 NULL。
- `then` – 当 `condition` 为真时返回的表达式。
- `else` – 当 `condition` 为 false 或 NULL 时返回的表达式。

**返回值**

根据条件 `cond` 返回 `then` 或 `else` 表达式的结果。

**示例**

```sql
SELECT if(1, plus(2, 2), plus(2, 6));
```

结果：

```text
┌─plus(2, 2)─┐
│          4 │
└────────────┘
```

## multiIf {#multiif}

允许在查询中更紧凑地编写 [CASE](../../sql-reference/operators/index.md#conditional-expression) 操作符。

**语法**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

设置 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) 控制是否使用短路求值。如果启用，`then_i` 表达式仅在 `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}) AND cond_i)` 为 `true` 的行上被计算，`cond_i` 仅在 `((NOT cond_1) AND (NOT cond_2) AND ... AND (NOT cond_{i-1}))` 为 `true` 的行上被评估。例如，在短路求值的情况下，当执行查询 `SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)` 时，不会抛出除以零的异常。

**参数**

该函数接受 `2N+1` 个参数：
- `cond_N` — 第 N 个被评估的条件，控制是否返回 `then_N`。
- `then_N` — 当 `cond_N` 为真时函数的结果。
- `else` — 如果没有任何条件为真，函数的结果。

**返回值**

根据条件 `cond_N`返回任何 `then_N` 或 `else` 表达式的结果。

**示例**

假设这个表：

```text
┌─left─┬─right─┐
│ ᴺᵁᴸᴸ │     4 │
│    1 │     3 │
│    2 │     2 │
│    3 │     1 │
│    4 │  ᴺᵁᴸᴸ │
└──────┴───────┘
```

```sql
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

条件总是返回 `0`、`1` 或 `NULL`。因此，你可以像这样直接使用条件结果：

```sql
SELECT left < right AS is_small
FROM LEFT_RIGHT

┌─is_small─┐
│     ᴺᵁᴸᴸ │
│        1 │
│        0 │
│        0 │
│     ᴺᵁᴸᴸ │
└──────────┘
```

## 条件中的 NULL 值 {#null-values-in-conditionals}

当条件中涉及 `NULL` 值时，结果也将是 `NULL`。

```sql
SELECT
    NULL < 1,
    2 < NULL,
    NULL < NULL,
    NULL = NULL

┌─less(NULL, 1)─┬─less(2, NULL)─┬─less(NULL, NULL)─┬─equals(NULL, NULL)─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ               │
└───────────────┴───────────────┴──────────────────┴────────────────────┘
```

所以如果类型是 `Nullable`，你应该仔细构造查询。

以下示例通过未能将相等条件添加到 `multiIf` 来演示这一点。

```sql
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

返回一组值中的最大值。所有列表成员必须为可比类型。

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
返回的类型是 Float64，因为 UInt8 必须提升到 64 位以进行比较。
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
└──---──────────────────────────────────────────────────────────────────────────┘
```

:::note
返回的类型是 DateTime64，因为 DateTime32 必须提升到 64 位以进行比较。
:::

## least {#least}

返回一组值中的最小值。所有列表成员必须为可比类型。

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
返回的类型是 Float64，因为 UInt8 必须提升到 64 位以进行比较。
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
返回的类型是 DateTime64，因为 DateTime32 必须提升到 64 位以进行比较。
:::

## clamp {#clamp}

将返回值限制在 A 和 B 之间。

**语法**

```sql
clamp(value, min, max)
```

**参数**

- `value` – 输入值。
- `min` – 限制下界。
- `max` – 限制上界。

**返回值**

如果值小于最小值，则返回最小值；如果值大于最大值，则返回最大值；否则，返回当前值。

示例：

```sql
SELECT clamp(1, 2, 3) result,  toTypeName(result) type;
```
```response
┌─result─┬─type────┐
│      2 │ Float64 │
└────────┴─────────┘
```

## CASE 语句 {#case-statement}

ClickHouse 中的 CASE 表达式提供了类似 SQL CASE 操作符的条件逻辑。它评估条件并根据第一个匹配的条件返回值。

ClickHouse 支持两种形式的 CASE：

1. `CASE WHEN ... THEN ... ELSE ... END`
<br/>
这种形式允许完全的灵活性，并且在内部使用 [multiIf](/sql-reference/functions/conditional-functions#multiif) 函数实现。每个条件都是独立评估的，表达式可以包含非常量值。

```sql
SELECT
    number,
    CASE
        WHEN number % 2 = 0 THEN number + 1
        WHEN number % 2 = 1 THEN number * 10
        ELSE number
    END AS result
FROM system.numbers
WHERE number < 5;

-- is translated to
SELECT
    number,
    multiIf((number % 2) = 0, number + 1, (number % 2) = 1, number * 10, number) AS result
FROM system.numbers
WHERE number < 5

┌─number─┬─result─┐
│      0 │      1 │
│      1 │     10 │
│      2 │      3 │
│      3 │     30 │
│      4 │      5 │
└────────┴────────┘

5 rows in set. Elapsed: 0.002 sec.
```

2. `CASE <expr> WHEN <val1> THEN ... WHEN <val2> THEN ... ELSE ... END`
<br/>
这种更紧凑的形式针对常量值匹配进行了优化，并在内部使用 `caseWithExpression()`。

例如，以下是有效的：

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN 100
        WHEN 1 THEN 200
        ELSE 0
    END AS result
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    caseWithExpression(number, 0, 100, 1, 200, 0) AS result
FROM system.numbers
WHERE number < 3

┌─number─┬─result─┐
│      0 │    100 │
│      1 │    200 │
│      2 │      0 │
└────────┴────────┘

3 rows in set. Elapsed: 0.002 sec.
```

这种形式也不要求返回表达式是常量。

```sql
SELECT
    number,
    CASE number
        WHEN 0 THEN number + 1
        WHEN 1 THEN number * 10
        ELSE number
    END
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    caseWithExpression(number, 0, number + 1, 1, number * 10, number)
FROM system.numbers
WHERE number < 3

┌─number─┬─caseWithExpr⋯0), number)─┐
│      0 │                        1 │
│      1 │                       10 │
│      2 │                        2 │
└────────┴──────────────────────────┘

3 rows in set. Elapsed: 0.001 sec.
```

### 注意事项 {#caveats}

ClickHouse 在评估任何条件之前确定 CASE 表达式（或其内部等价物，例如 `multiIf`）的结果类型。这在返回表达式的类型不同，例如不同时区或数字类型时非常重要。

- 结果类型是根据所有分支中最大的兼容类型选择的。
- 一旦选择了该类型，所有其他分支都会隐式转换为该类型——即使它们的逻辑在运行时可能永远不会执行。
- 对于类型如 DateTime64，其中时区是类型签名的一部分，这可能会导致意外行为：第一个遇到的时区可能被用于所有分支，即使其他分支指定了不同的时区。

例如，以下所有行返回的时间戳都是第一个匹配分支的时区，即 `Asia/Kolkata`

```sql
SELECT
    number,
    CASE
        WHEN number = 0 THEN fromUnixTimestamp64Milli(0, 'Asia/Kolkata')
        WHEN number = 1 THEN fromUnixTimestamp64Milli(0, 'America/Los_Angeles')
        ELSE fromUnixTimestamp64Milli(0, 'UTC')
    END AS tz
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    multiIf(number = 0, fromUnixTimestamp64Milli(0, 'Asia/Kolkata'), number = 1, fromUnixTimestamp64Milli(0, 'America/Los_Angeles'), fromUnixTimestamp64Milli(0, 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬──────────────────────tz─┐
│      0 │ 1970-01-01 05:30:00.000 │
│      1 │ 1970-01-01 05:30:00.000 │
│      2 │ 1970-01-01 05:30:00.000 │
└────────┴─────────────────────────┘

3 rows in set. Elapsed: 0.011 sec.
```

在这里，ClickHouse 看到多个 `DateTime64(3, <timezone>)` 返回类型。它推断出公共类型为 `DateTime64(3, 'Asia/Kolkata'`，并隐式转换其他分支为该类型。

这可以通过转换为字符串以保留预期的时区格式来解决：

```sql
SELECT
    number,
    multiIf(
        number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'),
        number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'),
        formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')
    ) AS tz
FROM system.numbers
WHERE number < 3;

-- is translated to

SELECT
    number,
    multiIf(number = 0, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'Asia/Kolkata'), number = 1, formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'America/Los_Angeles'), formatDateTime(fromUnixTimestamp64Milli(0), '%F %T', 'UTC')) AS tz
FROM system.numbers
WHERE number < 3

┌─number─┬─tz──────────────────┐
│      0 │ 1970-01-01 05:30:00 │
│      1 │ 1969-12-31 16:00:00 │
│      2 │ 1970-01-01 00:00:00 │
└────────┴─────────────────────┘

3 rows in set. Elapsed: 0.002 sec.
```
