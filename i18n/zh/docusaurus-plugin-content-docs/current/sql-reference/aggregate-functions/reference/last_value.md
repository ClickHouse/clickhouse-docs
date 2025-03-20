---
slug: /sql-reference/aggregate-functions/reference/last_value
sidebar_position: 160
title: 'last_value'
description: '选择最后遇到的值，类似于 `anyLast`，但可以接受 NULL。'
---


# last_value

选择最后遇到的值，类似于 `anyLast`，但可以接受 NULL。主要应该与 [Window Functions](../../window-functions/index.md) 一起使用。如果没有 Window Functions，结果将是随机的如果源流没有排序。

## examples {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) Values (1,null), (2,3), (4, 5), (6,null)
```

### example1 {#example1}
NULL 值在默认情况下被忽略。
```sql
select last_value(b) from test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### example2 {#example2}
NULL 值被忽略。
```sql
select last_value(b) ignore nulls from test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### example3 {#example3}
NULL 值被接受。
```sql
select last_value(b) respect nulls from test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### example4 {#example4}
使用子查询和 `ORDER BY` 稳定结果。
```sql
SELECT
    last_value_respect_nulls(b),
    last_value(b)
FROM
(
    SELECT *
    FROM test_data
    ORDER BY a ASC
)
```

```text
┌─last_value_respect_nulls(b)─┬─last_value(b)─┐
│                        ᴺᵁᴸᴸ │             5 │
└─────────────────────────────┴───────────────┘
```
