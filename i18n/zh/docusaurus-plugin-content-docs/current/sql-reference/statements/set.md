---
'description': 'SET 语句的文档'
'sidebar_label': 'SET'
'sidebar_position': 50
'slug': '/sql-reference/statements/set'
'title': 'SET 语句'
'doc_type': 'reference'
---


# SET 语句

```sql
SET param = value
```

将 `value` 分配给当前会话的 `param` [设置](/operations/settings/overview)。您不能通过这种方式更改 [服务器设置](../../operations/server-configuration-parameters/settings.md)。

您还可以在单个查询中设置指定设置配置文件的所有值。

```sql
SET profile = 'profile-name-from-the-settings-file'
```

对于设置为 true 的布尔值设置，您可以通过省略值分配使用简写语法。当仅指定设置名称时，它会自动设置为 `1` (true)。

```sql
-- These are equivalent:
SET force_index_by_date = 1
SET force_index_by_date
```

有关更多信息，请参见 [设置](../../operations/settings/settings.md)。
