---
'description': 'システムテーブルに現在アクティブなすべての役割が含まれており、現在のユーザーの現在の役割とその役割に付与された役割が含まれています。'
'keywords':
- 'system table'
- 'enabled_roles'
'slug': '/operations/system-tables/enabled_roles'
'title': 'system.enabled_roles'
'doc_type': 'reference'
---

現在のすべてのアクティブな役割が含まれており、現在のユーザーの現在の役割と現在の役割に付与された役割が含まれています。

カラム:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — 役割の名前。
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` が `ADMIN OPTION` 権限を持つ役割であるかどうかを示すフラグ。
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` が現在のユーザーの現在の役割であるかどうかを示すフラグ。
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` がデフォルトの役割であるかどうかを示すフラグ。
