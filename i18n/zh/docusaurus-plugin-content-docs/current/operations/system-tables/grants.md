---
'description': 'System table showing which privileges are granted to ClickHouse user
  accounts.'
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

- `is_partial_revoke` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 逻辑值。它指示是否有某些权限已被撤回。可能的值：
  - `0` — 该行描述一个授予。
  - `1` — 该行描述一个部分撤回。

- `grant_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 权限以 `WITH GRANT OPTION` 方式授予，请参见 [GRANT](../../sql-reference/statements/grant.md#granting-privilege-syntax)。
