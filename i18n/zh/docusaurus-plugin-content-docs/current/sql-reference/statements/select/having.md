---
'description': 'HAVING 子句的文档'
'sidebar_label': 'HAVING'
'slug': '/sql-reference/statements/select/having'
'title': 'HAVING 子句'
'doc_type': 'reference'
---


# HAVING 子句

允许过滤由 [GROUP BY](/sql-reference/statements/select/group-by) 产生的聚合结果。它类似于 [WHERE](../../../sql-reference/statements/select/where.md) 子句，但区别在于 `WHERE` 在聚合之前执行，而 `HAVING` 在聚合之后执行。

可以通过其别名在 `HAVING` 子句中引用 `SELECT` 子句的聚合结果。或者，`HAVING` 子句可以过滤未在查询结果中返回的额外聚合结果。

## 限制 {#limitations}

如果没有执行聚合，则无法使用 `HAVING`。请改用 `WHERE`。
