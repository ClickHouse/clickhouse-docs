---
'description': 'QUALIFY 子句的文档'
'sidebar_label': 'QUALIFY'
'slug': '/sql-reference/statements/select/qualify'
'title': 'QUALIFY 子句'
---


# QUALIFY 子句

允许过滤窗口函数的结果。它类似于 [WHERE](../../../sql-reference/statements/select/where.md) 子句，但不同之处在于 `WHERE` 在窗口函数评估之前执行，而 `QUALIFY` 在其之后执行。

可以通过别名在 `QUALIFY` 子句中引用 `SELECT` 子句中的窗口函数结果。或者，`QUALIFY` 子句可以过滤没有在查询结果中返回的额外窗口函数的结果。

## 限制 {#limitations}

如果没有窗口函数可供评估，无法使用 `QUALIFY`。请改用 `WHERE`。

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
