---
'description': 'HAVING 子句的文档'
'sidebar_label': 'HAVING'
'slug': '/sql-reference/statements/select/having'
'title': 'HAVING 子句'
---


# HAVING 子句

允许过滤通过 [GROUP BY](/sql-reference/statements/select/group-by) 产生的聚合结果。它类似于 [WHERE](../../../sql-reference/statements/select/where.md) 子句，但不同之处在于 `WHERE` 在聚合之前执行，而 `HAVING` 在聚合之后执行。

可以在 `HAVING` 子句中通过别名引用 `SELECT` 子句中的聚合结果。或者，`HAVING` 子句可以基于查询结果中未返回的其他聚合结果进行过滤。

## 限制 {#limitations}

如果没有执行聚合，则无法使用 `HAVING`。请改用 `WHERE`。
