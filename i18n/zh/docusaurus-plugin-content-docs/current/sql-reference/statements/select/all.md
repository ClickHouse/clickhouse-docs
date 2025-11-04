---
'description': 'ALL 子句的文档'
'sidebar_label': 'ALL'
'slug': '/sql-reference/statements/select/all'
'title': 'ALL 子句'
'doc_type': 'reference'
---


# ALL Clause

如果一个表中有多个匹配的行，则 `ALL` 会返回所有这些行。`SELECT ALL` 与没有 `DISTINCT` 的 `SELECT` 是相同的。如果同时指定了 `ALL` 和 `DISTINCT`，则会抛出异常。

`ALL` 可以在聚合函数中指定，尽管它对查询结果没有实际影响。

例如：

```sql
SELECT sum(ALL number) FROM numbers(10);
```

等价于：

```sql
SELECT sum(number) FROM numbers(10);
```
