
# SET 语句

```sql
SET param = value
```

将 `value` 分配给当前会话的 `param` [设置](/operations/settings/overview)。您无法通过这种方式更改 [服务器设置](../../operations/server-configuration-parameters/settings.md)。

您还可以在单个查询中设置指定设置配置文件中的所有值。

```sql
SET profile = 'profile-name-from-the-settings-file'
```

有关更多信息，请参见 [设置](../../operations/settings/settings.md)。
