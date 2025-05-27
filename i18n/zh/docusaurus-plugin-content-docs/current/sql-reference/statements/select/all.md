---
'description': 'ALL 子句的文档'
'sidebar_label': 'ALL'
'slug': '/sql-reference/statements/select/all'
'title': 'ALL 子句'
---


# ALL 子句

如果表中有多行匹配，则 `ALL` 返回所有匹配的行。`SELECT ALL` 与没有 `DISTINCT` 的 `SELECT` 是相同的。如果同时指定了 `ALL` 和 `DISTINCT`，将抛出异常。

`ALL` 可以在聚合函数内指定，尽管它对查询结果没有实际影响。

例如：

```sql
SELECT sum(ALL number) FROM numbers(10);
```

相当于：

```sql
SELECT sum(number) FROM numbers(10);
```
