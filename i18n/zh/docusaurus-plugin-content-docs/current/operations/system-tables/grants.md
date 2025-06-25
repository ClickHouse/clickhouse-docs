---
'description': '系统表显示授予 ClickHouse 用户账户的权限。'
'keywords':
- 'system table'
- 'grants'
'slug': '/operations/system-tables/grants'
'title': 'system.grants'
---

授予 ClickHouse 用户帐户的权限。

列：
- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 用户名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 分配给用户帐户的角色。

- `access_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ClickHouse 用户帐户的访问参数。

- `database` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 数据库的名称。

- `table` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 表的名称。

- `column` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 授予访问权限的列的名称。

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 逻辑值。它显示是否撤销了一些权限。可能的值：
  - `0` — 此行描述一个授权。
  - `1` — 此行描述部分撤销。

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 权限以 `WITH GRANT OPTION` 授予，详见 [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax)。
