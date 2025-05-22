
# Nothing

此数据类型的唯一目的是表示不期望值的情况。因此，您无法创建 `Nothing` 类型的值。

例如，字面量 [NULL](/sql-reference/syntax#null) 的类型为 `Nullable(Nothing)`。有关 [Nullable](../../../sql-reference/data-types/nullable.md) 的更多信息，请参见。

`Nothing` 类型也可用于表示空数组：

```sql
SELECT toTypeName(array())
```

```text
┌─toTypeName(array())─┐
│ Array(Nothing)      │
└─────────────────────┘
```
