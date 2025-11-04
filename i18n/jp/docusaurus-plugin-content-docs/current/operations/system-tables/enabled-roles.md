---
'description': 'システムテーブルは、現在のユーザーの現在の役割と現在の役割のために付与された役割を含めて、現在アクティブなすべての役割を含んでいます。'
'keywords':
- 'system table'
- 'enabled_roles'
'slug': '/operations/system-tables/enabled-roles'
'title': 'system.enabled_roles'
'doc_type': 'reference'
---

現在アクティブなすべてのロールが含まれています。これには、現在のユーザーの現在のロールおよび現在のロールのために付与されたロールが含まれます。

カラム:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — ロール名。
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` が `ADMIN OPTION` 特権を持つロールであるかどうかを示すフラグ。
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` が現在のユーザーの現在のロールであるかどうかを示すフラグ。
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` がデフォルトロールであるかどうかを示すフラグ。
