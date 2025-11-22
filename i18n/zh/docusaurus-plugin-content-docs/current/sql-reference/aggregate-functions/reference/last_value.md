---
description: '选择最后出现的值，类似于 `anyLast`，但可以接受 NULL 值。'
sidebar_position: 160
slug: /sql-reference/aggregate-functions/reference/last_value
title: 'last_value'
doc_type: 'reference'
---



# last_value

选择遇到的最后一个值，与 `anyLast` 类似，但可以返回 NULL。
通常应当与[窗口函数](../../window-functions/index.md)一起使用。
如果不使用窗口函数且源数据流未排序，则结果是随机的。



## 示例 {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) VALUES (1,null), (2,3), (4, 5), (6,null)
```

### 示例 1 {#example1}

默认忽略 NULL 值。

```sql
SELECT last_value(b) FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### 示例 2 {#example2}

忽略 NULL 值。

```sql
SELECT last_value(b) ignore nulls FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### 示例 3 {#example3}

接受 NULL 值。

```sql
SELECT last_value(b) respect nulls FROM test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### 示例 4 {#example4}

使用带 `ORDER BY` 的子查询稳定结果。

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
