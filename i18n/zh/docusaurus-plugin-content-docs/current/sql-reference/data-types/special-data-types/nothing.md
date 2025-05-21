---
'description': 'Documentation for the Nothing special data type'
'sidebar_label': 'Nothing'
'sidebar_position': 60
'slug': '/sql-reference/data-types/special-data-types/nothing'
'title': 'Nothing'
---




# Nothing

该数据类型的唯一目的是表示不期望出现值的情况。因此，您无法创建 `Nothing` 类型的值。

例如，字面量 [NULL](/sql-reference/syntax#null) 的类型为 `Nullable(Nothing)`。有关更多信息，请参见 [Nullable](../../../sql-reference/data-types/nullable.md)。

`Nothing` 类型还可以用于表示空数组：

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
