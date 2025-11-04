---
'description': '关于 Conditional Functions 的文档'
'sidebar_label': '条件'
'slug': '/sql-reference/functions/conditional-functions'
'title': '条件函数'
'doc_type': 'reference'
---


# 条件函数

## 概述 {#overview}

### 直接使用条件结果 {#using-conditional-results-directly}

条件总是返回 `0`，`1` 或 `NULL`。因此，您可以直接像这样使用条件结果：

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

### 条件中的 NULL 值 {#null-values-in-conditionals}

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

因此，如果类型是 `Nullable`，您应该仔细构建查询。

以下示例通过未能将等于条件添加到 `multiIf` 中来演示这一点。

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

ClickHouse 中的 CASE 表达式提供类似于 SQL CASE 操作符的条件逻辑。它评估条件并根据第一个匹配的条件返回值。

ClickHouse 支持两种形式的 CASE：

1. `CASE WHEN ... THEN ... ELSE ... END`
   <br/>
   这种形式允许完全的灵活性，并且使用 [multiIf](/sql-reference/functions/conditional-functions#multiIf) 函数在内部实现。每个条件都是独立评估的，表达式可以包含非常量值。

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

这种形式也不要求返回的表达式为常量。

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

#### 注意事项 {#caveats}

ClickHouse 在评估任何条件之前确定 CASE 表达式（或其内部等效项，如 `multiIf`）的结果类型。这在返回表达式类型不同的情况下非常重要，例如不同的时区或数字类型。

- 结果类型是根据所有分支中最大的兼容类型来选择的。
- 一旦选择了此类型，所有其他分支都隐式转换为此类型，即使其逻辑在运行时永远不会被执行。
- 对于像 DateTime64 这样，时区是类型签名的一部分，这可能导致意想不到的行为：第一次遇到的时区可能会被用于所有分支，即使其他分支指定了不同的时区。

例如，下面所有行返回的时间戳都位于第一个匹配分支的时区，即 `Asia/Kolkata`

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

在这里，ClickHouse 看到多个 `DateTime64(3, <timezone>)` 返回类型。它推断出公共类型为 `DateTime64(3, 'Asia/Kolkata'`，因为这是它看到的第一个类型，隐式地将其他分支转换为此类型。

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

<!-- 
下面标签的内部内容将在文档框架构建时替换为 
从 system.functions 生成的文档。请勿修改或删除这些标签。
见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
## clamp {#clamp}

引入于：v24.5


限制一个值在指定的最小和最大范围内。

如果值小于最小值，则返回最小值。如果值大于最大值，则返回最大值。否则，返回值本身。

所有参数必须是可比较类型。结果类型是所有参数中的最大兼容类型。
    

**语法**

```sql
clamp(value, min, max)
```

**参数**

- `value` — 要限制的值。 - `min` — 最小范围。 - `max` — 最大范围。 

**返回值**

返回限制在 [min, max] 范围内的值。

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

**低于最小值**

```sql title=Query
SELECT clamp(-3, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      0 │
└────────┘
```

**高于最大值**

```sql title=Query
SELECT clamp(15, 0, 7) AS result;
```

```response title=Response
┌─result─┐
│      7 │
└────────┘
```



## greatest {#greatest}

引入于：v1.1


返回参数中最大的值。
`NULL` 参数将被忽略。

- 对于数组，返回字典序最大的数组。
- 对于 `DateTime` 类型，结果类型会提升到最大类型（例如，混合 `DateTime32` 时返回 `DateTime64`）。

:::note 使用设置 `least_greatest_legacy_null_behavior` 更改 `NULL` 的行为
版本 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) 引入了一个向后不兼容的更改，使得 `NULL` 值被忽略，而之前如果其中一个参数为 `NULL` 则返回 `NULL`。
要保持先前的行为，请将设置 `least_greatest_legacy_null_behavior`（默认值：`false`）设为 `true`。
:::
    

**语法**

```sql
greatest(x1[, x2, ...])
```

**参数**

- `x1[, x2, ...]` — 一个或多个要比较的值。所有参数必须是可比较类型。[`Any`](/sql-reference/data-types)


**返回值**

返回参数中的最大值，并提升为最大兼容类型。[`Any`](/sql-reference/data-types)

**示例**

**数字类型**

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



## if {#if}

引入于：v1.1


执行条件分支。

- 如果条件 `cond` 评估为非零值，则该函数返回表达式 `then` 的结果。
- 如果 `cond` 评估为零或 NULL，则返回 `else` 表达式的结果。

设置 [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) 控制是否使用短路求值。

如果启用，`then` 表达式只会在 `cond` 为真时在行上进行评估，而 `else` 表达式只会在 `cond` 为假时进行评估。

例如，使用短路求值时，执行以下查询时不会引发除零异常：

```sql
SELECT if(number = 0, 0, intDiv(42, number)) FROM numbers(10)
```

`then` 和 `else` 必须是相似的类型。


**语法**

```sql
if(cond, then, else)
```

**参数**

- `cond` — 被评估的条件。[`UInt8`](/sql-reference/data-types/int-uint) 或 [`Nullable(UInt8)`](/sql-reference/data-types/nullable) 或 [`NULL`](/sql-reference/syntax#null)
- `then` — 如果 `cond` 为真则返回的表达式。 - `else` — 如果 `cond` 为假或为 `NULL` 则返回的表达式。 

**返回值**

根据条件 `cond` 返回 `then` 或 `else` 表达式的结果。

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



## least {#least}

引入于：v1.1


返回参数中最小的值。
`NULL` 参数将被忽略。

- 对于数组，返回字典序最小的数组。
- 对于 DateTime 类型，结果类型会提升到最大类型（例如，混合 DateTime32 时返回 DateTime64）。

:::note 使用设置 `least_greatest_legacy_null_behavior` 更改 `NULL` 的行为
版本 [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) 引入了一个向后不兼容的更改，使得 `NULL` 值被忽略，而之前如果其中一个参数为 `NULL` 则返回 `NULL`。
要保持先前的行为，请将设置 `least_greatest_legacy_null_behavior`（默认值：`false`）设为 `true`。
:::
    

**语法**

```sql
least(x1[, x2, ...])
```

**参数**

- `x1[, x2, ...]` — 一个单独的值或多个值进行比较。所有参数必须是可比较类型。[`Any`](/sql-reference/data-types)


**返回值**

返回参数中的最小值，并提升为最大兼容类型。[`Any`](/sql-reference/data-types)

**示例**

**数字类型**

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

**DateTime 类型**

```sql title=Query
SELECT least(toDateTime32(now() + toIntervalDay(1)), toDateTime64(now(), 3));
-- The type returned is a DateTime64 as the DateTime32 must be promoted to 64 bit for the comparison.
```

```response title=Response
┌─least(toDate⋯(now(), 3))─┐
│  2025-05-27 15:55:20.000 │
└──────────────────────────┘
```



## multiIf {#multiIf}

引入于：v1.1


允许在查询中以更紧凑的方式编写 [`CASE`](/sql-reference/operators#conditional-expression) 操作符。
按顺序评估每个条件。对于第一个为真（非零且不为 `NULL`）的条件，返回相应的分支值。
如果没有条件为真，则返回 `else` 值。

设置 [`short_circuit_function_evaluation`](/operations/settings/settings#short_circuit_function_evaluation) 控制是否使用短路求值。如果启用，`then_i` 表达式仅在 `((NOT cond_1) AND ... AND (NOT cond_{i-1}) AND cond_i)` 为真时在行上进行评估。

例如，使用短路求值时，执行以下查询时不会引发除零异常：

```sql
SELECT multiIf(number = 2, intDiv(1, number), number = 5) FROM numbers(10)
```

所有分支和 else 表达式必须具有共同的超类型。 `NULL` 条件被视为假。
    

**语法**

```sql
multiIf(cond_1, then_1, cond_2, then_2, ..., else)
```

**参数**

- `cond_N` — 第 N 个被评估的条件，控制是否返回 `then_N`。[`UInt8`](/sql-reference/data-types/int-uint) 或 [`Nullable(UInt8)`](/sql-reference/data-types/nullable) 或 [`NULL`](/sql-reference/syntax#null)
- `then_N` — 当 `cond_N` 为真时函数的结果。 - `else` — 如果没有条件为真，则函数的结果。 

**返回值**

返回匹配 `cond_N` 的 `then_N` 的结果，否则返回 `else` 条件。

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



<!--AUTOGENERATED_END-->
