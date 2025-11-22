---
description: '現在のユーザーに対して有効なロールを含むシステムテーブル。'
keywords: ['system table', 'current_roles']
slug: /operations/system-tables/current_roles
title: 'system.current_roles'
doc_type: 'reference'
---

現在のユーザーに対して有効なロールが含まれます。`SET ROLE` によって、このテーブルの内容が変更されます。

列:

- `role_name` ([String](../../sql-reference/data-types/string.md))) — ロール名。
- `with_admin_option` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `current_role` が `ADMIN OPTION` 権限付きのロールかどうかを示すフラグ。
- `is_default` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `current_role` がデフォルトロールかどうかを示すフラグ。