---
'description': 'HAVING 子句的文档'
'sidebar_label': 'HAVING'
'slug': '/sql-reference/statements/select/having'
'title': 'HAVING 子句'
---


# HAVING 子句

允许过滤由 [GROUP BY](/sql-reference/statements/select/group-by) 产生的聚合结果。它与 [WHERE](../../../sql-reference/statements/select/where.md) 子句类似，但不同之处在于 `WHERE` 是在聚合之前执行的，而 `HAVING` 是在聚合之后执行的。

可以通过别名在 `HAVING` 子句中引用 `SELECT` 子句的聚合结果。或者，`HAVING` 子句可以过滤未在查询结果中返回的附加聚合结果。

## 限制 {#limitations}

如果未执行聚合，则无法使用 `HAVING`。请改用 `WHERE`。
