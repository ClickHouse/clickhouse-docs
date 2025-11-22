---
description: '它是 `any` 的别名，为了与窗口函数兼容而引入，在这些场景中有时需要处理 `NULL` 值（默认情况下，所有 ClickHouse 聚合函数都会忽略 `NULL` 值）。'
sidebar_position: 137
slug: /sql-reference/aggregate-functions/reference/first_value
title: 'first_value'
doc_type: 'reference'
---



# first_value

它是 [`any`](../../../sql-reference/aggregate-functions/reference/any.md) 的别名，但为了与[窗口函数](../../window-functions/index.md) 兼容而引入，在这些场景中有时需要处理 `NULL` 值（默认情况下，所有 ClickHouse 聚合函数都会忽略 `NULL` 值）。

它支持声明一个用于保留 `NULL` 值的修饰符（`RESPECT NULLS`），既可用于[窗口函数](../../window-functions/index.md)，也可用于普通聚合。

与 `any` 一样，在不使用窗口函数时，如果源数据流未排序，则结果是随机的，并且返回类型与输入类型相同（仅当输入类型是 Nullable 或添加了 `-OrNull` 组合器时才会返回 `NULL`）。



## 示例 {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) VALUES (1,null), (2,3), (4, 5), (6,null);
```

### 示例 1 {#example1}

默认情况下,NULL 值将被忽略。

```sql
SELECT first_value(b) FROM test_data;
```

```text
┌─any(b)─┐
│      3 │
└────────┘
```

### 示例 2 {#example2}

NULL 值将被忽略。

```sql
SELECT first_value(b) ignore nulls FROM test_data
```

```text
┌─any(b) IGNORE NULLS ─┐
│                    3 │
└──────────────────────┘
```

### 示例 3 {#example3}

NULL 值将被接受。

```sql
SELECT first_value(b) respect nulls FROM test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### 示例 4 {#example4}

使用带有 `ORDER BY` 的子查询来获得稳定的结果。

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
