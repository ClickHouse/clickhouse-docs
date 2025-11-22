---
description: '現在有効なすべてのロールを含むシステムテーブルであり、現在のユーザーの現在のロールおよびそのロールに対して付与されているロールを含む'
keywords: ['system table', 'enabled_roles']
slug: /operations/system-tables/enabled_roles
title: 'system.enabled_roles'
doc_type: 'reference'
---

現在有効なすべてのロールを含むシステムテーブルであり、現在のユーザーの現在のロールおよびそのロールに対して付与されているロールを保持します。

列:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — ロール名。
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` が `ADMIN OPTION` 権限を持つロールかどうかを示すフラグ。
- `is_current` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` が現在のユーザーの現在のロールかどうかを示すフラグ。
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `enabled_role` がデフォルトロールかどうかを示すフラグ。