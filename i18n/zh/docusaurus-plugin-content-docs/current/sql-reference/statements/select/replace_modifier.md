---
description: '描述 APPLY 修饰符的文档，该修饰符允许对查询外部表表达式返回的每一行调用某个函数。'
sidebar_label: 'REPLACE'
slug: /sql-reference/statements/select/replace-modifier
title: 'REPLACE 修饰符'
keywords: ['REPLACE', '修饰符']
doc_type: 'reference'
---



# Replace 修饰符 {#replace}

> 允许您指定一个或多个[表达式别名](/sql-reference/syntax#expression-aliases)。

每个别名必须与 `SELECT *` 语句中的列名匹配。在输出列列表中,与别名匹配的列会被 `REPLACE` 中的表达式所替换。

此修饰符不会更改列的名称或顺序,但可以更改列的值和值类型。

**语法:**

```sql
SELECT <expr> REPLACE( <expr> AS col_name) from [db.]table_name
```

**示例:**

```sql
SELECT * REPLACE(i + 1 AS i) from columns_transformers;
```

```response
┌───i─┬──j─┬───k─┐
│ 101 │ 10 │ 324 │
│ 121 │  8 │  23 │
└─────┴────┴─────┘
```
