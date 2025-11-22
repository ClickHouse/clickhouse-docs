---
description: 'ユーザーおよびロールへのロール付与を格納するシステムテーブル。'
keywords: ['system table', 'role_grants']
slug: /operations/system-tables/role_grants
title: 'system.role_grants'
doc_type: 'reference'
---

# system.role_grants

ユーザーおよびロールに対するロール付与情報を含みます。このテーブルに行を追加するには、`GRANT role TO user` を使用します。

カラム:

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザー名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ロール名。

- `granted_role_name` ([String](../../sql-reference/data-types/string.md)) — `role_name` ロールに付与されたロールの名前。あるロールを別のロールに付与するには `GRANT role1 TO role2` を使用します。

- `granted_role_is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `granted_role` がデフォルトロールかどうかを示すフラグ。取りうる値は次のとおりです:
  - 1 — `granted_role` はデフォルトロール。
  - 0 — `granted_role` はデフォルトロールではない。

- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `granted_role` が [ADMIN OPTION](/sql-reference/statements/grant#admin-option) 権限付きロールかどうかを示すフラグ。取りうる値は次のとおりです:
  - 1 — ロールは `ADMIN OPTION` 権限を持つ。
  - 0 — ロールは `ADMIN OPTION` 権限を持たない。