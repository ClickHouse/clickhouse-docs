---
slug: /sql-reference/statements/select/qualify
sidebar_label: 'QUALIFY'
---


# QUALIFY 子句

允许对窗口函数结果进行过滤。它类似于 [WHERE](../../../sql-reference/statements/select/where.md) 子句，但不同的是，`WHERE` 在窗口函数评估之前执行，而 `QUALIFY` 在之后执行。

可以在 `QUALIFY` 子句中通过别名引用 `SELECT` 子句中的窗口函数结果。Alternatively，`QUALIFY` 子句还可以过滤在查询结果中未返回的其他窗口函数的结果。

## 限制 {#limitations}

如果没有窗口函数需要评估，则无法使用 `QUALIFY`。请改用 `WHERE`。

## 示例 {#examples}

示例：

``` sql
SELECT number, COUNT() OVER (PARTITION BY number % 3) AS partition_count
FROM numbers(10)
QUALIFY partition_count = 4
ORDER BY number;
```

``` text
┌─number─┬─partition_count─┐
│      0 │               4 │
│      3 │               4 │
│      6 │               4 │
│      9 │               4 │
└────────┴─────────────────┘
```
