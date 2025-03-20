---
description: "ユーザーとロールのためのロール付与を含むシステムテーブル。"
slug: /operations/system-tables/role-grants
title: "system.role_grants"
keywords: ["システムテーブル", "role_grants"]
---

ユーザーとロールのためのロール付与を含みます。このテーブルにエントリーを追加するには、 `GRANT role TO user` を使用します。

カラム:

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザー名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ロール名。

- `granted_role_name` ([String](../../sql-reference/data-types/string.md)) — `role_name` ロールに付与されたロールの名前。あるロールを別のロールに付与するには `GRANT role1 TO role2` を使用します。

- `granted_role_is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `granted_role` がデフォルトロールであるかどうかを示すフラグ。可能な値:
    - 1 — `granted_role` はデフォルトロールです。
    - 0 — `granted_role` はデフォルトロールではありません。

- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `granted_role` が [ADMIN OPTION](/sql-reference/statements/grant#admin-option) 権限を有するロールかどうかを示すフラグ。可能な値:
    - 1 — このロールは `ADMIN OPTION` 権限を持っています。
    - 0 — このロールは `ADMIN OPTION` 権限を持っていません。
