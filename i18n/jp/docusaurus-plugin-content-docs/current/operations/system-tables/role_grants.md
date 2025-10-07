---
'description': 'システムテーブルには、ユーザーおよびロールのための役割の付与が含まれています。'
'keywords':
- 'system table'
- 'role_grants'
'slug': '/operations/system-tables/role_grants'
'title': 'system.role_grants'
'doc_type': 'reference'
---


# system.role_grants

ユーザーおよびロールのためのロール付与を含みます。このテーブルにエントリを追加するには、 `GRANT role TO user` を使用します。

カラム:

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザー名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ロール名。

- `granted_role_name` ([String](../../sql-reference/data-types/string.md)) — `role_name` ロールに付与されたロールの名前。別のロールにロールを付与するには、 `GRANT role1 TO role2` を使用します。

- `granted_role_is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `granted_role` がデフォルトロールであるかどうかを示すフラグ。可能な値：
  - 1 — `granted_role` はデフォルトロールです。
  - 0 — `granted_role` はデフォルトロールではありません。

- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `granted_role` が [ADMIN OPTION](/sql-reference/statements/grant#admin-option) 権限を持つロールかどうかを示すフラグ。可能な値：
  - 1 — このロールには `ADMIN OPTION` 権限があります。
  - 0 — `ADMIN OPTION` 権限を持たないロールです。
