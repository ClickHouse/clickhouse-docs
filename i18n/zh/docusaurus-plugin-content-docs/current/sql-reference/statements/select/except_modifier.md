---
description: '本文档介绍 EXCEPT 修饰符，该修饰符用于指定要从结果中排除的一个或多个列名。所有匹配的列名都会从输出中省略。'
sidebar_label: 'EXCEPT'
slug: /sql-reference/statements/select/except-modifier
title: 'EXCEPT 修饰符'
keywords: ['EXCEPT', 'modifier']
doc_type: 'reference'
---

# EXCEPT 修饰符 {#except}

> 指定要从结果中排除的一个或多个列名。所有匹配的列名都会在输出中被省略。

## 语法 {#syntax}

```sql
SELECT <expr> EXCEPT ( col_name1 [, col_name2, col_name3, ...] ) FROM [db.]table_name
```

## 示例 {#examples}

```sql title="Query"
SELECT * EXCEPT (i) from columns_transformers;
```

```response title="Response"
┌──j─┬───k─┐
│ 10 │ 324 │
│  8 │  23 │
└────┴─────┘
```
