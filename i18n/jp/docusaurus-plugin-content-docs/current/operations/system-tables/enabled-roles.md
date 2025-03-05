---
description: "現在のユーザーの現在のロールとそのロールに付与されたロールを含む、現在アクティブなすべてのロールを含むシステムテーブル"
slug: /operations/system-tables/enabled-roles
title: "system.enabled_roles"
keywords: ["システムテーブル", "enabled_roles"]
---

現在アクティブなすべてのロールを含み、現在のユーザーの現在のロールとそのロールに付与されたロールが含まれています。

カラム:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — ロール名。
- `with_admin_option` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — `enabled_role`が`ADMIN OPTION`特権を持つロールであるかどうかを示すフラグ。
- `is_current` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — `enabled_role`が現在のユーザーの現在のロールであるかどうかを示すフラグ。
- `is_default` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — `enabled_role`がデフォルトロールであるかどうかを示すフラグ。
