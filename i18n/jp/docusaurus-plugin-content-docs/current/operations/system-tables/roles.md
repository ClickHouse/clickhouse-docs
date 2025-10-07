---
'description': 'システムテーブルは、構成されたロールに関する情報を含んでいます。'
'keywords':
- 'system table'
- 'roles'
'slug': '/operations/system-tables/roles'
'title': 'system.roles'
'doc_type': 'reference'
---


# system.roles

設定された[ロール](../../guides/sre/user-management/index.md#role-management)に関する情報を含みます。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — ロール名。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — ロールID。
- `storage` ([String](../../sql-reference/data-types/string.md)) — ロールのストレージへのパス。`access_control_path`パラメータで設定されています。

## 関連項目 {#see-also}

- [SHOW ROLES](/sql-reference/statements/show#show-roles)
