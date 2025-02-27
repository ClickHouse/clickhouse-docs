---
description: "現在アクティブなすべてのロールを含むシステムテーブルで、現在のユーザーの現在のロールと現在のロールの付与されたロールを含みます。"
slug: /operations/system-tables/enabled-roles
title: "enabled_roles"
keywords: ["システムテーブル", "enabled_roles"]
---

現在アクティブなすべてのロールを含み、現在のユーザーの現在のロールとそのロールに付与されたロールを表示します。

カラム:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — ロール名。
- `with_admin_option` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — `enabled_role` が `ADMIN OPTION` 権限を持つロールであるかどうかを示すフラグ。
- `is_current` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — `enabled_role` が現在ユーザーの現在のロールであるかどうかを示すフラグ。
- `is_default` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — `enabled_role` がデフォルトロールであるかどうかを示すフラグ。
