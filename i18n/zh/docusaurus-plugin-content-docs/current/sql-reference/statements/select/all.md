---
description: 'ALL 子句文档'
sidebar_label: 'ALL'
slug: /sql-reference/statements/select/all
title: 'ALL 子句'
doc_type: 'reference'
---

# ALL 子句

如果表中存在多行匹配的行，则 `ALL` 会返回所有这些行。`SELECT ALL` 与不带 `DISTINCT` 的 `SELECT` 完全相同。如果同时指定了 `ALL` 和 `DISTINCT`，则会抛出异常。

`ALL` 可以在聚合函数中指定，但它对查询结果没有实际影响。

例如：

```sql
SELECT sum(ALL number) FROM numbers(10);
```

等同于：

```sql
SELECT sum(number) FROM numbers(10);
```
