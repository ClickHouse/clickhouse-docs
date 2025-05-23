---
'description': 'System table containing active roles for the current user.'
'keywords':
- 'system table'
- 'current_roles'
'slug': '/operations/system-tables/current-roles'
'title': 'system.current_roles'
---



現在のユーザーのアクティブなロールを含みます。 `SET ROLE` はこのテーブルの内容を変更します。

カラム:

 - `role_name` ([String](../../sql-reference/data-types/string.md))) — ロール名。
 - `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `current_role` が `ADMIN OPTION` 権限を持つロールであるかどうかを示すフラグ。
 - `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `current_role` がデフォルトロールであるかどうかを示すフラグ。
