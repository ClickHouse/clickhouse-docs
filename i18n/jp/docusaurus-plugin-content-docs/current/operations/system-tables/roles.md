---
description: "システムテーブルには設定されたロールに関する情報が含まれています。"
slug: /operations/system-tables/roles
title: "system.roles"
keywords: ["システムテーブル", "ロール"]
---

設定された [ロール](../../guides/sre/user-management/index.md#role-management) に関する情報が含まれています。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — ロール名。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — ロールID。
- `storage` ([String](../../sql-reference/data-types/string.md)) — ロールのストレージへのパス。 `access_control_path` パラメータで設定されています。

## 関連情報 {#see-also}

- [SHOW ROLES](/sql-reference/statements/show#show-roles)
