---
slug: /sql-reference/statements/select/all
sidebar_label: ALL
---


# ALL 子句

如果表中有多行匹配，那么 `ALL` 返回所有这些行。`SELECT ALL` 与不带 `DISTINCT` 的 `SELECT` 是相同的。如果同时指定 `ALL` 和 `DISTINCT`，将会抛出异常。

`ALL` 也可以在聚合函数中指定，效果相同（无操作），例如：

```sql
SELECT sum(ALL number) FROM numbers(10);
```
等同于

```sql
SELECT sum(number) FROM numbers(10);
```
