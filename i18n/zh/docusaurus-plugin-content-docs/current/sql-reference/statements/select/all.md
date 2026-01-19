---
description: 'ALL 子句文档'
sidebar_label: 'ALL'
slug: /sql-reference/statements/select/all
title: 'ALL 子句'
doc_type: 'reference'
---

# ALL 子句 \{#all-clause\}

如果表中有多行匹配记录，则 `ALL` 会返回所有这些记录。`SELECT ALL` 与不带 `DISTINCT` 的 `SELECT` 完全相同。如果同时指定了 `ALL` 和 `DISTINCT`，则会抛出异常。

`ALL` 可以用于聚合函数中，但它对查询结果实际上没有任何影响。

例如：

```sql
SELECT sum(ALL number) FROM numbers(10);
```

等价于：

```sql
SELECT sum(number) FROM numbers(10);
```
