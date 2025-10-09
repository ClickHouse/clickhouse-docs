---
'description': '文档描述了APPLY修饰符，该修饰符允许您对查询的外部表表达式返回的每行调用某个函数。'
'sidebar_label': 'REPLACE'
'slug': '/sql-reference/statements/select/replace-modifier'
'title': '置换修饰符'
'keywords':
- 'REPLACE'
- 'modifier'
'doc_type': 'reference'
---


# Replace modifier {#replace}

> 1つ以上の [expression aliases](/sql-reference/syntax#expression-aliases) を指定することを許可します。

各エイリアスは `SELECT *` ステートメントのカラム名と一致する必要があります。出力カラムリストでは、エイリアスと一致するカラムは、その `REPLACE` の式によって置き換えられます。

この修飾子はカラムの名前や順序を変更しません。ただし、値や値の型を変更することができます。

**構文:**

```sql
SELECT <expr> REPLACE( <expr> AS col_name) from [db.]table_name
```

**例:**

```sql
SELECT * REPLACE(i + 1 AS i) from columns_transformers;
```

```response
┌───i─┬──j─┬───k─┐
│ 101 │ 10 │ 324 │
│ 121 │  8 │  23 │
└─────┴────┴─────┘
```
