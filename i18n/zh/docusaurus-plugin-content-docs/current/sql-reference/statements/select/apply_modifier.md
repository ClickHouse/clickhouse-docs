---
description: '本文档介绍 APPLY 修饰符，它允许对查询的外层表表达式返回的每一行调用某个函数。'
sidebar_label: 'APPLY'
slug: /sql-reference/statements/select/apply-modifier
title: 'APPLY 修饰符'
keywords: ['APPLY', 'modifier']
doc_type: 'reference'
---

# APPLY 修饰符 \\{#apply\\}

> 允许对查询的外部表表达式返回的每一行调用某个函数。

## 语法 \\{#syntax\\}

```sql
SELECT <expr> APPLY( <func> ) FROM [db.]table_name
```

## 示例 \\{#example\\}

```sql
CREATE TABLE columns_transformers (i Int64, j Int16, k Int64) ENGINE = MergeTree ORDER by (i);
INSERT INTO columns_transformers VALUES (100, 10, 324), (120, 8, 23);
SELECT * APPLY(sum) FROM columns_transformers;
```

```response
┌─sum(i)─┬─sum(j)─┬─sum(k)─┐
│    220 │     18 │    347 │
└────────┴────────┴────────┘
```
