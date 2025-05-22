---
'description': 'Documentation for the Nothing special data type'
'sidebar_label': 'Nothing'
'sidebar_position': 60
'slug': '/sql-reference/data-types/special-data-types/nothing'
'title': 'Nothing'
---




# Nothing

このデータ型の唯一の目的は、値が期待されないケースを表現することです。したがって、`Nothing` 型の値を作成することはできません。

例えば、リテラル [NULL](/sql-reference/syntax#null) は `Nullable(Nothing)` 型を持っています。より詳しい情報は [Nullable](../../../sql-reference/data-types/nullable.md) を参照してください。

`Nothing` 型は空の配列を示すためにも使用できます：

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
