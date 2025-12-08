---
description: 'QUALIFY 子句文档'
sidebar_label: 'QUALIFY'
slug: /sql-reference/statements/select/qualify
title: 'QUALIFY 子句'
doc_type: 'reference'
---

# QUALIFY 子句 {#qualify-clause}

用于过滤窗口函数的结果。它类似于 [WHERE](../../../sql-reference/statements/select/where.md) 子句，但不同之处在于，`WHERE` 在窗口函数计算之前执行，而 `QUALIFY` 则在窗口函数计算之后执行。

在 `QUALIFY` 子句中可以通过别名引用 `SELECT` 子句中的窗口函数结果。或者，`QUALIFY` 子句也可以基于其他未在查询结果中返回的窗口函数结果进行过滤。

## 限制 {#limitations}

当查询中不包含需要计算的窗口函数时，不能使用 `QUALIFY`。请改用 `WHERE`。

## 示例 {#examples}

示例：

```sql
SELECT number, COUNT() OVER (PARTITION BY number % 3) AS partition_count
FROM numbers(10)
QUALIFY partition_count = 4
ORDER BY number;
```

```text
┌─number─┬─partition_count─┐
│      0 │               4 │
│      3 │               4 │
│      6 │               4 │
│      9 │               4 │
└────────┴─────────────────┘
```
