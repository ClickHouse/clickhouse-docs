---
description: 'ユーザーおよびロールに対するロール付与情報を保持するシステムテーブル。'
keywords: ['system table', 'role_grants']
slug: /operations/system-tables/role_grants
title: 'system.role_grants'
doc_type: 'reference'
---

# system.role&#95;grants {#systemrole&#95;grants}

ユーザーおよびロールに対するロール付与情報を保持します。このテーブルに行を追加するには、`GRANT role TO user` を使用します。

列:

* `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザー名。

* `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ロール名。

* `granted_role_name` ([String](../../sql-reference/data-types/string.md)) — `role_name` ロールに付与されたロール名。あるロールを別のロールに付与するには `GRANT role1 TO role2` を使用します。

* `granted_role_is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `granted_role` がデフォルトロールかどうかを示すフラグ。取りうる値:
  * 1 — `granted_role` はデフォルトロール。
  * 0 — `granted_role` はデフォルトロールではない。

* `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `granted_role` が [ADMIN OPTION](/sql-reference/statements/grant#admin-option) 権限を持つロールかどうかを示すフラグ。取りうる値:
  * 1 — ロールは `ADMIN OPTION` 権限を持つ。
  * 0 — ロールは `ADMIN OPTION` 権限を持たない。