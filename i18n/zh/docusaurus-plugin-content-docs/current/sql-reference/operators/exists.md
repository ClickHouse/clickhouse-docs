---
description: '关于 `EXISTS` 运算符的文档'
slug: /sql-reference/operators/exists
title: 'EXISTS'
doc_type: 'reference'
---

# EXISTS

`EXISTS` 运算符用于检查子查询结果中的记录数量。如果结果为空，则运算符返回 `0`；否则返回 `1`。

`EXISTS` 也可以用于 [WHERE](../../sql-reference/statements/select/where.md) 子句中。

:::tip\
在子查询中不支持引用主查询中的表和列。
:::

**语法**

```sql
EXISTS(subquery)
```

**示例**

用于检查子查询中是否存在某些值的查询：

```sql
SELECT EXISTS(SELECT * FROM numbers(10) WHERE number > 8), EXISTS(SELECT * FROM numbers(10) WHERE number > 11)
```

结果：

```text
┌─in(1, _subquery1)─┬─in(1, _subquery2)─┐
│                 1 │                 0 │
└───────────────────┴───────────────────┘
```

包含返回多行结果的子查询的查询：

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 8);
```

结果：

```text
┌─count()─┐
│      10 │
└─────────┘
```

包含返回空结果的子查询的查询：

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 11);
```

结果：

```text
┌─count()─┐
│       0 │
└─────────┘
```
