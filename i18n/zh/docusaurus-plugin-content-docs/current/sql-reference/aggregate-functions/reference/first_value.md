---
slug: /sql-reference/aggregate-functions/reference/first_value
sidebar_position: 137
title: 'first_value'
description: '它是任何的别名，但引入是为了与窗口函数兼容，有时需要处理 `NULL` 值（默认情况下，所有 ClickHouse 聚合函数都会忽略 NULL 值）。'
---


# first_value

它是[`any`](../../../sql-reference/aggregate-functions/reference/any.md)的别名，但引入是为了与[窗口函数](../../window-functions/index.md)兼容，有时需要处理`NULL`值（默认情况下，所有 ClickHouse 聚合函数都会忽略 NULL 值）。

它支持声明一个修饰符来尊重 NULL (`RESPECT NULLS`)，在[窗口函数](../../window-functions/index.md)和正常聚合中均适用。

与`any`一样，如果没有窗口函数，结果将是随机的，如果源流未排序且返回类型与输入类型匹配（仅在输入是 Nullable 时或添加了 -OrNull 组合器时返回 Null）。

## examples {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) Values (1,null), (2,3), (4, 5), (6,null);
```

### example1 {#example1}
默认情况下，NULL 值会被忽略。
```sql
select first_value(b) from test_data;
```

```text
┌─any(b)─┐
│      3 │
└────────┘
```

### example2 {#example2}
NULL 值被忽略。
```sql
select first_value(b) ignore nulls from test_data
```

```text
┌─any(b) IGNORE NULLS ─┐
│                    3 │
└──────────────────────┘
```

### example3 {#example3}
NULL 值被接受。
```sql
select first_value(b) respect nulls from test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### example4 {#example4}
使用带有 `ORDER BY` 的子查询稳定结果。
```sql
SELECT
    first_value_respect_nulls(b),
    first_value(b)
FROM
(
    SELECT *
    FROM test_data
    ORDER BY a ASC
)
```

```text
┌─any_respect_nulls(b)─┬─any(b)─┐
│                 ᴺᵁᴸᴸ │      3 │
└──────────────────────┴────────┘
```
