---
'description': 'システムテーブルは現在のユーザーのアクティブなロールを含んでいます。'
'keywords':
- 'system table'
- 'current_roles'
'slug': '/operations/system-tables/current_roles'
'title': 'system.current_roles'
'doc_type': 'reference'
---

現在のユーザーのアクティブなロールを含みます。 `SET ROLE` はこのテーブルの内容を変更します。

カラム:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — ロール名。
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `current_role` が `ADMIN OPTION` 権限を持つロールかどうかを示すフラグ。
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `current_role` がデフォルトロールであるかどうかを示すフラグ。
