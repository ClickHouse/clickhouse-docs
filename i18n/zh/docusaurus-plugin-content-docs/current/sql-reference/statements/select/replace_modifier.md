---
'description': '描述APPLY修饰符的文档，该修饰符允许您为查询的外部表表达式返回的每一行调用某个函数。'
'sidebar_label': 'REPLACE'
'slug': '/sql-reference/statements/select/replace-modifier'
'title': '替换修饰符'
'keywords':
- 'REPLACE'
- 'modifier'
'doc_type': 'reference'
---


# Replace modifier {#replace}

> 允许您指定一个或多个 [expression aliases](/sql-reference/syntax#expression-aliases)。 

每个别名必须与 `SELECT *` 语句中的列名匹配。在输出列列表中，与别名匹配的列将被该 `REPLACE` 中的表达式替换。

该修饰符不会改变列的名称或顺序。然而，它可以改变值和值的类型。

**语法：**

```sql
SELECT <expr> REPLACE( <expr> AS col_name) from [db.]table_name
```

**示例：**

```sql
SELECT * REPLACE(i + 1 AS i) from columns_transformers;
```

```response
┌───i─┬──j─┬───k─┐
│ 101 │ 10 │ 324 │
│ 121 │  8 │  23 │
└─────┴────┴─────┘
```
