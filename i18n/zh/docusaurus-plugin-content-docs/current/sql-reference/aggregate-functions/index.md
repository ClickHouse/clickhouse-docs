---
description: '聚合函数参考文档'
sidebar_label: '聚合函数'
sidebar_position: 33
slug: /sql-reference/aggregate-functions/
title: '聚合函数'
doc_type: 'reference'
---

# 聚合函数 \\{#aggregate-functions\\}

聚合函数以[常规](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial)方式工作，符合数据库专家对其的预期。

ClickHouse 还支持：

* [参数化聚合函数](/sql-reference/aggregate-functions/parametric-functions)，除了列之外还可以接受其他参数。
* [组合器](/sql-reference/aggregate-functions/combinators)，用于改变聚合函数的行为。

## NULL 处理 \\{#null-processing\\}

在聚合过程中，所有 `NULL` 参数都会被跳过。如果聚合函数有多个参数，那么对于任意一个或多个参数为 NULL 的行，都会被忽略。

此规则有一个例外，即函数 [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md)、[`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) 及其别名（分别为 `any` 和 `anyLast`），当它们后面带有修饰符 `RESPECT NULLS` 时。例如，`FIRST_VALUE(b) RESPECT NULLS`。

**示例：**

考虑下表：

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

假设你需要对 `y` 列的值求总和：

```sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

现在，你可以使用 `groupArray` 函数根据 `y` 列生成一个数组：

```sql
SELECT groupArray(y) FROM t_null_big
```

```text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray` 在结果数组中不会包含 `NULL`。

你可以使用 [COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce) 将 NULL 转换为在你的使用场景中有意义的值。例如：`avg(COALESCE(column, 0))` 会在聚合中使用该列的值；如果为 NULL 则使用 0：

```sql
SELECT
    avg(y),
    avg(coalesce(y, 0))
FROM t_null_big
```

```text
┌─────────────avg(y)─┬─avg(coalesce(y, 0))─┐
│ 2.3333333333333335 │                 1.4 │
└────────────────────┴─────────────────────┘
```

你也可以使用 [Tuple](sql-reference/data-types/tuple.md) 来绕过 NULL 跳过行为。仅包含一个 `NULL` 值的 `Tuple` 本身并不是 `NULL`，因此聚合函数不会因为这个 `NULL` 值而跳过该行。

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

请注意，当这些列被用作聚合函数的参数时，相应的聚合将被跳过。例如，没有参数的 [`count`](../../sql-reference/aggregate-functions/reference/count.md)（`count()`）或仅带常量参数的形式（`count(1)`）会对数据块中的所有行进行计数（与 GROUP BY 列的取值无关，因为该列不是参数），而 `count(column)` 只会返回该列值不为 NULL 的行数。

```sql
SELECT
    v,
    count(1),
    count(v)
FROM
(
    SELECT if(number < 10, NULL, number % 3) AS v
    FROM numbers(15)
)
GROUP BY v

┌────v─┬─count()─┬─count(v)─┐
│ ᴺᵁᴸᴸ │      10 │        0 │
│    0 │       1 │        1 │
│    1 │       2 │        2 │
│    2 │       2 │        2 │
└──────┴─────────┴──────────┘
```

下面是一个使用 `RESPECT NULLS` 的 `first_value` 示例，可以看到 NULL 输入会被保留（不会被跳过），并且它会返回读取到的第一个值，无论该值是否为 NULL：

```sql
SELECT
    col || '_' || ((col + 1) * 5 - 1) AS range,
    first_value(odd_or_null) AS first,
    first_value(odd_or_null) IGNORE NULLS as first_ignore_null,
    first_value(odd_or_null) RESPECT NULLS as first_respect_nulls
FROM
(
    SELECT
        intDiv(number, 5) AS col,
        if(number % 2 == 0, NULL, number) AS odd_or_null
    FROM numbers(15)
)
GROUP BY col
ORDER BY col

┌─range─┬─first─┬─first_ignore_null─┬─first_respect_nulls─┐
│ 0_4   │     1 │                 1 │                ᴺᵁᴸᴸ │
│ 1_9   │     5 │                 5 │                   5 │
│ 2_14  │    11 │                11 │                ᴺᵁᴸᴸ │
└───────┴───────┴───────────────────┴─────────────────────┘
```
