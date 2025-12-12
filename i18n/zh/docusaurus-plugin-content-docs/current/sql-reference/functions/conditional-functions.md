---
description: '条件函数相关文档'
sidebar_label: '条件函数'
slug: /sql-reference/functions/conditional-functions
title: '条件函数'
doc_type: '参考文档'
---

# 条件函数 {#conditional-functions}

## 概述 {#overview}

### 直接使用条件表达式结果 {#using-conditional-results-directly}

条件表达式始终返回 `0`、`1` 或 `NULL`。因此，你可以直接使用条件表达式的结果，例如：

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

### 条件表达式中的 NULL 值 {#null-values-in-conditionals}

当条件表达式中涉及 `NULL` 值时，结果也将为 `NULL`。

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

因此，当类型为 `Nullable` 时，你应当格外谨慎地构造查询。

下面的示例通过未能为 `multiIf` 添加等值条件而导致失败，从而演示了这一点。

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

### CASE 语句 {#case-statement}

ClickHouse 中的 CASE 表达式提供了与 SQL CASE 运算符类似的条件逻辑。它会对条件进行求值，并根据第一个满足的条件返回相应的值。

ClickHouse 支持两种形式的 CASE：

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br />
   这种形式提供了充分的灵活性，并在内部通过 [multiIf](/sql-reference/functions/conditional-functions#multiIf) 函数实现。每个条件都会被独立求值，表达式中可以包含非常量值。

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
   <br />
   这种更紧凑的形式针对常量值匹配进行了优化，并在内部使用 `caseWithExpression()`。

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

┌─number─┬─result─┐
│      0 │    100 │
│      1 │    200 │
│      2 │      0 │
└────────┴────────┘

3 行结果，耗时：0.002 秒。

````sql
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
````sql
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

-- 转换为

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

返回 3 行。用时:0.011 秒。
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
```sql
clamp(value, min, max)
```

<!-- 
以下标签内的内容将在文档框架构建时被替换为
从 system.functions 生成的文档。请勿修改或删除这些标签。
参见:https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->
```

```sql
clamp(value, min, max)
```

**Value below minimum**

```sql title=Query
SELECT clamp(5, 1, 10) AS result;
```

```response title=Response
┌─result─┐
│      5 │
└────────┘
```

**Value above maximum**

```sql title=Query
SELECT clamp(-3, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      0 │
└────────┘
```



## greatest {#greatest}

Introduced in: v1.1


Returns the greatest value among the arguments.
`NULL` arguments are ignored.

- For arrays, returns the lexicographically greatest array.
- For `DateTime` types, the result type is promoted to the largest type (e.g., `DateTime64` if mixed with `DateTime32`).

:::note Use setting `least_greatest_legacy_null_behavior` to change `NULL` behavior
Version [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) introduced a backwards-incompatible change such that `NULL` values are ignored, while previously it returned `NULL` if one of the arguments was `NULL`.
To retain the previous behavior, set setting `least_greatest_legacy_null_behavior` (default: `false`) to `true`.
:::
    

**Syntax**

```sql title=Query
SELECT clamp(15, 0, 7) AS result;
```

**Arguments**

- `x1[, x2, ...]` — One or multiple values to compare. All arguments must be of comparable types. [`Any`](/sql-reference/data-types)


**Returned value**

Returns the greatest value among the arguments, promoted to the largest compatible type. [`Any`](/sql-reference/data-types)

**Examples**

**Numeric types**

```response title=Response
┌─result─┐
│      7 │
└────────┘
```

```sql
greatest(x1[, x2, ...])
```

**Arrays**

```sql title=Query
SELECT greatest(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- 返回的类型为 Float64,因为 UInt8 必须提升至 64 位以进行比较。
```

```response title=Response
┌─result─┬─type────┐
│      3 │ Float64 │
└────────┴─────────┘
```

**DateTime types**

```sql title=Query
SELECT greatest(['hello'], ['there'], ['world']);
```

```response title=Response
┌─greatest(['hello'], ['there'], ['world'])─┐
│ ['world']                                 │
└───────────────────────────────────────────┘
```



## if {#if}

Introduced in: v1.1


Performs conditional branching.

- If the condition `cond` evaluates to a non-zero value, the function returns the result of the expression `then`.
- If `cond` evaluates to zero or NULL, the result of the `else` expression is returned.

The setting [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) controls whether short-circuit evaluation is used.

If enabled, the `then` expression is evaluated only on rows where `cond` is true and the `else` expression where `cond` is false.

For example, with short-circuit evaluation, no division-by-zero exception is thrown when executing the following query:

```sql title=Query
SELECT greatest(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- 返回类型为 DateTime64,因为 DateTime32 必须提升至 64 位以进行比较。
```

`then` and `else` must be of a similar type.


**Syntax**

```response title=Response
┌─greatest(toD⋯(now(), 3))─┐
│  2025-05-28 15:50:53.000 │
└──────────────────────────┘
```

**Arguments**

- `cond` — The evaluated condition. [`UInt8`](/sql-reference/data-types/int-uint) or [`Nullable(UInt8)`](/sql-reference/data-types/nullable) or [`NULL`](/sql-reference/syntax#null)
- `then` — The expression returned if `cond` is true. - `else` — The expression returned if `cond` is false or `NULL`. 

**Returned value**

The result of either the `then` or `else` expressions, depending on condition `cond`.

**Examples**

**Example usage**

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

```sql
if(cond, then, else)
```



## least {#least}

Introduced in: v1.1


Returns the smallest value among the arguments.
`NULL` arguments are ignored.

- For arrays, returns the lexicographically least array.
- For DateTime types, the result type is promoted to the largest type (e.g., DateTime64 if mixed with DateTime32).

:::note Use setting `least_greatest_legacy_null_behavior` to change `NULL` behavior
Version [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) introduced a backwards-incompatible change such that `NULL` values are ignored, while previously it returned `NULL` if one of the arguments was `NULL`.
To retain the previous behavior, set setting `least_greatest_legacy_null_behavior` (default: `false`) to `true`.
:::
    

**Syntax**

```sql title=Query
SELECT if(1, 2 + 2, 2 + 6) AS res;
```

**Arguments**

- `x1[, x2, ...]` — A single value or multiple values to compare. All arguments must be of comparable types. [`Any`](/sql-reference/data-types)


**Returned value**

Returns the least value among the arguments, promoted to the largest compatible type. [`Any`](/sql-reference/data-types)

**Examples**

**Numeric types**

```response title=Response
┌─res─┐
│   4 │
└─────┘
```

```sql
least(x1[, x2, ...])
```

**Arrays**

```sql title=Query
SELECT least(1, 2, toUInt8(3), 3.) AS result, toTypeName(result) AS type;
-- 返回类型为 Float64,因为 UInt8 必须提升至 64 位以进行比较。
```

```response title=Response
┌─result─┬─type────┐
│      1 │ Float64 │
└────────┴─────────┘
```

**DateTime types**

```sql title=Query
SELECT least(['hello'], ['there'], ['world']);
```

```response title=Response
┌─least(['hell⋯ ['world'])─┐
│ ['hello']                │
└──────────────────────────┘
```



## multiIf {#multiIf}

Introduced in: v1.1


Allows writing the [`CASE`](/sql-reference/operators#conditional-expression) operator more compactly in the query.
Evaluates each condition in order. For the first condition that is true (non-zero and not `NULL`), returns the corresponding branch value.
If none of the conditions are true, returns the `else` value.

Setting [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) controls
whether short-circuit evaluation is used. If enabled, the `then_i` expression is evaluated only on rows where
`((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)` is true.

For example, with short-circuit evaluation, no division-by-zero exception is thrown when executing the following query:

```sql title=Query
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- 返回类型为 DateTime64,因为 DateTime32 必须提升至 64 位以进行比较。
```

All branch and else expressions must have a common supertype. `NULL` conditions are treated as false.
    

**Syntax**

```response title=Response
┌─least(toDate⋯(now(), 3))─┐
│  2025-05-27 15:55:20.000 │
└──────────────────────────┘
```

**Aliases**: `caseWithoutExpression`, `caseWithoutExpr`

**Arguments**

- `cond_N` — The N-th evaluated condition which controls if `then_N` is returned. [`UInt8`](/sql-reference/data-types/int-uint) or [`Nullable(UInt8)`](/sql-reference/data-types/nullable) or [`NULL`](/sql-reference/syntax#null)
- `then_N` — The result of the function when `cond_N` is true. - `else` — The result of the function if none of the conditions is true. 

**Returned value**

Returns the result of `then_N` for matching `cond_N`, otherwise returns the `else` condition.

**Examples**

**Example usage**

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**别名**: `caseWithoutExpression`, `caseWithoutExpr`

**参数**

* `cond_N` — 第 N 个被求值的条件，用于控制是否返回 `then_N`。类型为 [`UInt8`](/sql-reference/data-types/int-uint) 或 [`Nullable(UInt8)`](/sql-reference/data-types/nullable) 或 [`NULL`](/sql-reference/syntax#null)
* `then_N` — 当 `cond_N` 为真时的函数结果。- `else` — 当所有条件都不为真时的函数结果。

**返回值**

对于匹配的 `cond_N`，返回对应的 `then_N` 结果，否则返回 `else` 的结果。

**示例**

**用法示例**

```sql title=Query
CREATE TABLE LEFT_RIGHT (left Nullable(UInt8), right Nullable(UInt8)) ENGINE = Memory;
INSERT INTO LEFT_RIGHT VALUES (NULL, 4), (1, 3), (2, 2), (3, 1), (4, NULL);

SELECT
    left,
    right,
    multiIf(left < right, 'left 较小', left > right, 'left 较大', left = right, '两者相等', '空值') AS result
FROM LEFT_RIGHT;
```

```response title=Response
┌─left─┬─right─┬─result──────────┐
│ ᴺᵁᴸᴸ │     4 │ 空值            │
│    1 │     3 │ 左值较小        │
│    2 │     2 │ 两者相等        │
│    3 │     1 │ 左值较大        │
│    4 │  ᴺᵁᴸᴸ │ 空值            │
└──────┴───────┴─────────────────┘
```

{/*AUTOGENERATED_END*/ }
