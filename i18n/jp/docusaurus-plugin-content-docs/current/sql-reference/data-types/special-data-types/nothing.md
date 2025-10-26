---
'description': 'Nothing 特殊データ型に関する Documentation'
'sidebar_label': 'Nothing'
'sidebar_position': 60
'slug': '/sql-reference/data-types/special-data-types/nothing'
'title': 'Nothing'
'doc_type': 'reference'
---


# Nothing

このデータ型の唯一の目的は、値が期待されない場合を表現することです。そのため、`Nothing` 型の値を作成することはできません。

例えば、リテラル [NULL](/sql-reference/syntax#null) は `Nullable(Nothing)` 型です。`Nullable` についての詳細は、[こちら](../../../sql-reference/data-types/nullable.md)をご覧ください。

`Nothing` 型は空の配列を示すためにも使用されます：

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
