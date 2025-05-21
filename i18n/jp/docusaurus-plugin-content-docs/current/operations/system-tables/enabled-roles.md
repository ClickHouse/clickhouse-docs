---
description: '現在のユーザーの現在のロールおよび現在のロールに付与されたロールを含む、現在すべてのアクティブなロールを含むシステムテーブル'
keywords: ['system table', 'enabled_roles']
slug: /operations/system-tables/enabled-roles
title: 'system.enabled_roles'
---

現在のユーザーの現在のロールおよび現在のロールに付与されたロールを含む、現在すべてのアクティブなロールを含みます。

カラム:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — ロール名。
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` が `ADMIN OPTION` 権限を持つロールであるかどうかを示すフラグ。
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` が現在のユーザーの現在のロールであるかどうかを示すフラグ。
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` がデフォルトロールであるかどうかを示すフラグ。
