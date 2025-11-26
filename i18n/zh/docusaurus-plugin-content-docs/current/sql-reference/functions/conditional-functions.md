---
description: '条件函数文档'
sidebar_label: '条件'
slug: /sql-reference/functions/conditional-functions
title: '条件函数'
doc_type: 'reference'
---

# 条件函数

## 概述 {#overview}

### 直接使用条件表达式结果

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


### 条件语句中的 NULL 值

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


### CASE 语句

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


#### 注意事项

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

-- 转换为

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

返回 3 行。用时:0.002 秒。
```

{/* 
  以下标签内的内容会在文档框架构建时被替换为
  由 system.functions 生成的文档。请不要修改或删除这些标签。
  参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
