---
description: "現在のユーザーの現在の役割とその役割のために付与された役割を含む、現在すべてのアクティブな役割を含むシステムテーブルです。"
slug: /operations/system-tables/enabled-roles
title: "system.enabled_roles"
keywords: ["system table", "enabled_roles"]
---

現在のユーザーの現在の役割とその役割に付与された役割を含む、現在すべてのアクティブな役割を含みます。

カラム:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — 役割名。
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` が `ADMIN OPTION` 権限を持つ役割であるかどうかを示すフラグ。
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` が現在のユーザーの現在の役割であるかどうかを示すフラグ。
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` がデフォルトの役割であるかどうかを示すフラグ。
