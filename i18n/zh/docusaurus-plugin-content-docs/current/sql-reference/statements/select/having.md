---
slug: /sql-reference/statements/select/having
sidebar_label: HAVING
---


# HAVING 子句

允许过滤由 [GROUP BY](/sql-reference/statements/select/group-by) 生成的聚合结果。它类似于 [WHERE](../../../sql-reference/statements/select/where.md) 子句，但不同之处在于 `WHERE` 是在聚合之前执行的，而 `HAVING` 是在聚合之后执行的。

可以通过它们的别名在 `HAVING` 子句中引用 `SELECT` 子句的聚合结果。或者，`HAVING` 子句可以过滤查询结果中未返回的其他聚合结果。

## 限制 {#limitations}

如果未进行聚合，则无法使用 `HAVING`。请改用 `WHERE`。
