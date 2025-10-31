---
'description': '文档描述了 EXCEPT 修饰符，该修饰符指定要从结果中排除的一个或多个列的名称。所有匹配的列名都将从输出中省略。'
'sidebar_label': 'EXCEPT'
'slug': '/sql-reference/statements/select/except-modifier'
'title': 'EXCEPT 修饰符'
'keywords':
- 'EXCEPT'
- 'modifier'
'doc_type': 'reference'
---


# EXCEPT 修饰符 {#except}

> 指定要从结果中排除的一列或多列的名称。所有匹配的列名将从输出中省略。

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
