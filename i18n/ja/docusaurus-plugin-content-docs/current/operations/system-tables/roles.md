---
description: "構成された役割に関する情報を含むシステムテーブル。"
slug: /operations/system-tables/roles
title: "役割"
keywords: ["システムテーブル", "役割"]
---

構成された[役割](../../guides/sre/user-management/index.md#role-management)に関する情報を含みます。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — 役割名。
- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 役割ID。
- `storage` ([String](../../sql-reference/data-types/string.md)) — 役割のストレージへのパス。`access_control_path` パラメータで構成されています。

## 関連情報 {#see-also}

- [SHOW ROLES](../../sql-reference/statements/show.md#show-roles-statement)
