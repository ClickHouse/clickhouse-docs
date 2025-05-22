---
'description': '系统表显示哪些权限被授予给 ClickHouse 用户账户。'
'keywords':
- 'system table'
- 'grants'
'slug': '/operations/system-tables/grants'
'title': 'system.grants'
---

被授予给 ClickHouse 用户账户的权限。

列：
- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 用户名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 分配给用户账户的角色。

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ClickHouse 用户账户的访问参数。

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 数据库名称。

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 表名称。

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 授予访问权限的列名称。

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 逻辑值。它显示是否撤销了一些权限。可能的值：
  - `0` — 该行描述的是授予。
  - `1` — 该行描述的是部分撤销。

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 权限是以 `WITH GRANT OPTION` 授予的，见 [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax)。
