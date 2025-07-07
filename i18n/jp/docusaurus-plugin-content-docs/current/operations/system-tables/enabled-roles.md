---
'description': 'System table containing all active roles at the moment, including
  the current role of the current user and the granted roles for the current role'
'keywords':
- 'system table'
- 'enabled_roles'
'slug': '/operations/system-tables/enabled-roles'
'title': 'system.enabled_roles'
---



現在のユーザーの現在のロールおよびそのロールに付与されたロールを含む、現在のすべてのアクティブなロールを含みます。

カラム:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — ロール名。
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` が `ADMIN OPTION` の特権を持つロールであるかどうかを示すフラグ。
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` が現在のユーザーの現在のロールであるかどうかを示すフラグ。
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` がデフォルトロールであるかどうかを示すフラグ。
