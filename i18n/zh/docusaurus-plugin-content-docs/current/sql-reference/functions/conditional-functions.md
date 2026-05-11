---
description: '条件函数文档'
sidebar_label: '条件'
slug: /sql-reference/functions/conditional-functions
title: '条件函数'
doc_type: 'reference'
---

# 条件函数 \{#conditional-functions\}

## 概述 \{#overview\}

### 直接使用条件表达式结果 \{#using-conditional-results-directly\}

条件表达式的结果始终为 `0`、`1` 或 `NULL`。因此你可以像下面这样直接使用条件表达式的结果：

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


### 条件语句中的 NULL 值 \{#null-values-in-conditionals\}

当条件中出现 `NULL` 值时，结果也会是 `NULL`。

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

因此，如果类型是 `Nullable`，你在构造查询时应格外谨慎。

下面的示例通过在 `multiIf` 中遗漏等值条件而导致失败来演示这一点。

```sql
SELECT
    left,
    right,
    multiIf(left < right, '左边更小', left > right, '右边更小', '两者相等') AS faulty_result
FROM LEFT_RIGHT

┌─left─┬─right─┬─faulty_result────┐
│ ᴺᵁᴸᴸ │     4 │ 两者相等       │
│    1 │     3 │ 左边更小  │
│    2 │     2 │ 两者相等       │
│    3 │     1 │ 右边更小 │
│    4 │  ᴺᵁᴸᴸ │ 两者相等       │
└──────┴───────┴──────────────────┘
```


### CASE 语句 \{#case-statement\}

ClickHouse 中的 CASE 表达式提供了与 SQL 中 CASE 运算符类似的条件逻辑。它会对条件进行求值，并根据第一个匹配的条件返回对应的值。

ClickHouse 支持两种 CASE 形式：

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br />
   此形式提供最大程度的灵活性，并在内部通过 [multiIf](/sql-reference/functions/conditional-functions#multiIf) 函数实现。每个条件都会被独立求值，表达式可以包含非常量的值。

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

-- 转换为
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

返回 5 行。用时：0.002 秒。
```

2. `CASE <expr> WHEN <val1> THEN ... WHEN <val2> THEN ... ELSE ... END`
   <br />
   这种更紧凑的形式针对常量值匹配进行了优化，并在内部调用 `caseWithExpression()` 实现。

例如，下面的写法是有效的：

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

-- 转换为

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

返回 3 行。用时:0.002 秒。
```

这种形式也不要求返回表达式必须是常量。

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

-- 转换为

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

返回 3 行。用时:0.001 秒。
```


#### 注意事项 \{#caveats\}

ClickHouse 会在计算任何条件之前，先确定 CASE 表达式（或其内部等价形式，例如 `multiIf`）的结果类型。当各个分支的返回表达式类型不同时（例如不同时区或不同数值类型），这一点尤为重要。

* 结果类型会根据所有分支中“最大”的兼容类型来选择。
* 一旦选定了该类型，其他所有分支都会被隐式转换为该类型——即使这些分支在运行时永远不会被执行。
* 对于像 DateTime64 这类类型，由于时区是类型签名的一部分，这可能导致出人意料的行为：第一个遇到的时区可能会被用于所有分支，即使其他分支指定了不同的时区。

例如，在下面的例子中，所有行都会返回第一个匹配分支时区下的时间戳，即 `Asia/Kolkata`。

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

在这里，ClickHouse 检测到多个 `DateTime64(3, <timezone>)` 返回类型。它将首次检测到的类型 `DateTime64(3, 'Asia/Kolkata'` 推断为公共类型，并将其他分支隐式转换为该类型。

可以通过先转换为字符串来解决该问题，从而保留预期的时区格式：

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

{/* 
  以下标签内的内容会在文档框架构建期间被替换为
  由 system.functions 生成的文档。请勿修改或删除这些标签。
  参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }


## clamp \{#clamp\}

引入于：v24.5.0

将一个值限制在指定的最小值和最大值范围内。

如果该值小于最小值，则返回最小值。如果该值大于最大值，则返回最大值。否则，返回该值本身。

所有参数必须是可相互比较的类型。结果类型为所有参数中兼容性最高的类型。

**语法**

```sql
clamp(value, min, max)
```

**参数**

* `value` — 要限制的值。 - `min` — 下界。 - `max` — 上界。

**返回值**

返回被限制在 [min, max] 区间内的值。

**示例**

**基本用法**

```sql title=Query
SELECT clamp(5, 1, 10) AS result;
```

```response title=Response
┌─result─┐
│      5 │
└────────┘
```

**值低于最小值**

```sql title=Query
SELECT clamp(-3, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      0 │
└────────┘
```

**数值超过最大值**

```sql title=Query
SELECT clamp(15, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      7 │
└────────┘
```


## greatest \{#greatest\}

引入于：v1.1.0

返回参数中最大的值。
会忽略 `NULL` 参数。

* 对于数组，返回按字典序比较结果最大的数组。
* 对于 `DateTime` 类型，结果类型会提升为其中最大的类型（例如，与 `DateTime32` 混用时为 `DateTime64`）。

:::note 使用设置 `least_greatest_legacy_null_behavior` 来改变 `NULL` 行为
版本 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) 引入了一个不向后兼容的更改：现在会忽略 `NULL` 值，而之前如果任一参数为 `NULL`，则返回 `NULL`。
要保留之前的行为，请将设置 `least_greatest_legacy_null_behavior`（默认值：`false`）设为 `true`。
:::

**语法**

```sql
greatest(x1[, x2, ...])
```

**参数**

* `x1[, x2, ...]` — 一个或多个用于比较的值。所有参数的类型必须彼此可比较。[`Any`](/sql-reference/data-types)

**返回值**

返回参数中最大的值，并提升为兼容的最大类型。[`Any`](/sql-reference/data-types)

**示例**

**数值类型**

```sql title=Query
SELECT greatest(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- The type returned is a Float64 as the UInt8 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─result─┬─type────┐
│      3 │ Float64 │
└────────┴─────────┘
```

**数组**

```sql title=Query
SELECT greatest(['hello'], ['there'], ['world']);
```

```response title=Response
┌─greatest(['hello'], ['there'], ['world'])─┐
│ ['world']                                 │
└───────────────────────────────────────────┘
```

**DateTime 类型**

```sql title=Query
SELECT greatest(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─greatest(toD⋯(now(), 3))─┐
│  2025-05-28 15:50:53.000 │
└──────────────────────────┘
```


## if \{#if\}

引入版本：v1.1.0

执行条件分支逻辑。

* 如果条件 `cond` 求值结果为非零值，则函数返回表达式 `then` 的结果。
* 如果 `cond` 求值结果为零或 NULL，则返回 `else` 表达式的结果。

[`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) SETTING 控制是否使用短路求值。

如果启用，只有在 `cond` 为 true 的行上才会计算 `then` 表达式，在 `cond` 为 false 的行上才会计算 `else` 表达式。

例如，使用短路求值时，在执行以下查询时不会抛出除零异常：

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

`then` 和 `else` 的类型必须为相同或兼容的类型。

**语法**

```sql
if(cond, then, else)
```

**参数**

* `cond` — 要计算的条件。[`UInt8`](/sql-reference/data-types/int-uint) 或 [`Nullable(UInt8)`](/sql-reference/data-types/nullable) 或 [`NULL`](/sql-reference/syntax#null)
* `then` — 当 `cond` 为 true 时返回的表达式；`else` — 当 `cond` 为 false 或 `NULL` 时返回的表达式。

**返回值**

根据条件 `cond`，返回 `then` 或 `else` 表达式的结果。

**示例**

**示例用法**

```sql title=Query
SELECT if(1, 2 + 2, 2 + 6) AS res;
```

```response title=Response
┌─res─┐
│   4 │
└─────┘
```


## least \{#least\}

自 v1.1.0 起引入

返回参数中最小的值。
会忽略 `NULL` 参数。

* 对于数组，返回按字典序最小的数组。
* 对于 DateTime 类型，结果类型会提升为“最大”的类型（例如与 DateTime32 混用时提升为 DateTime64）。

:::note 使用设置项 `least_greatest_legacy_null_behavior` 来更改 `NULL` 行为
版本 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) 引入了一个向后不兼容的变更，即会忽略 `NULL` 值，而之前如果任一参数为 `NULL` 则返回 `NULL`。
若要保留之前的行为，请将设置项 `least_greatest_legacy_null_behavior`（默认：`false`）设置为 `true`。
:::

**语法**

```sql
least(x1[, x2, ...])
```

**参数**

* `x1[, x2, ...]` —— 要比较的一个或多个值。所有参数的类型必须彼此可比较。[`Any`](/sql-reference/data-types)

**返回值**

返回参数中的最小值，并提升到其可兼容的最大类型。[`Any`](/sql-reference/data-types)

**示例**

**数值类型**

```sql title=Query
SELECT least(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- The type returned is a Float64 as the UInt8 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─result─┬─type────┐
│      1 │ Float64 │
└────────┴─────────┘
```

**数组**

```sql title=Query
SELECT least(['hello'], ['there'], ['world']);
```

```response title=Response
┌─least(['hell⋯ ['world'])─┐
│ ['hello']                │
└──────────────────────────┘
```

**DateTime 数据类型**

```sql title=Query
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─least(toDate⋯(now(), 3))─┐
│  2025-05-27 15:55:20.000 │
└──────────────────────────┘
```


## multiIf \{#multiIf\}

引入于：v1.1.0

允许在查询中更紧凑地编写 [`CASE`](/sql-reference/operators#conditional-expression) 运算符。
按顺序依次计算每个条件。对于第一个结果为 true（非零且不为 `NULL`）的条件，返回其对应分支的值。
如果所有条件结果都不为 true，则返回 `else` 值。

[`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) 设置控制
是否使用短路求值。如果启用，则表达式 `then_i` 仅在满足
`((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)` 的行上进行计算。

例如，在启用短路求值时，执行下面的查询不会抛出除零异常：

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

所有分支和 else 表达式必须具有一个公共超类型。`NULL` 条件会被当作 false 处理。

**语法**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**别名**: `caseWithoutExpression`, `caseWithoutExpr`

**参数**

* `cond_N` — 第 N 个参与求值的条件，用于控制是否返回 `then_N`。[`UInt8`](/sql-reference/data-types/int-uint) 或 [`Nullable(UInt8)`](/sql-reference/data-types/nullable) 或 [`NULL`](/sql-reference/syntax#null)
* `then_N` — 当 `cond_N` 为 true 时函数的结果。- `else` — 当所有条件都不为 true 时函数的结果。

**返回值**

对于与 `cond_N` 匹配的条件，返回对应的 `then_N` 结果，否则返回 `else` 分支的结果。

**示例**

**示例用法**

```sql title=Query
CREATE TABLE LEFT_RIGHT (left Nullable(UInt8), right Nullable(UInt8)) ENGINE = Memory;
INSERT INTO LEFT_RIGHT VALUES (NULL, 4), (1, 3), (2, 2), (3, 1), (4, NULL);

SELECT
    left,
    right,
    multiIf(left < right, 'left is smaller', left > right, 'left is greater', left = right, 'Both equal', 'Null value') AS result
FROM LEFT_RIGHT;
```

```response title=Response
┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ Null value      │
│    1 │     3 │ left is smaller │
│    2 │     2 │ Both equal      │
│    3 │     1 │ left is greater │
│    4 │  ᴺᵁᴸᴸ │ Null value      │
└──────┴───────┴─────────────────┘
```

{/*AUTOGENERATED_END*/ }
