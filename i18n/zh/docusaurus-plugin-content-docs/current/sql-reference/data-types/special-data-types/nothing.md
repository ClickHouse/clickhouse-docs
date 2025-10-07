---
'description': 'Nothing特殊数据类型的文档'
'sidebar_label': 'Nothing'
'sidebar_position': 60
'slug': '/sql-reference/data-types/special-data-types/nothing'
'title': 'Nothing'
'doc_type': 'reference'
---


# Nothing

这种数据类型的唯一目的在于表示不期望有值的情况。因此，您不能创建 `Nothing` 类型的值。

例如，文字 [NULL](/sql-reference/syntax#null) 的类型是 `Nullable(Nothing)`。有关更多信息，请参见 [Nullable](../../../sql-reference/data-types/nullable.md)。

`Nothing` 类型还可以用于表示空数组：

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
