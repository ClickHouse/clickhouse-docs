---
description: "設定プロファイルのプロパティを含むシステムテーブル。"
slug: /operations/system-tables/settings_profiles
title: "system.settings_profiles"
keywords: ["システムテーブル", "settings_profiles"]
---

設定プロファイルのプロパティを含みます。

カラム:
- `name` ([String](../../sql-reference/data-types/string.md)) — 設定プロファイル名。

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 設定プロファイルID。

- `storage` ([String](../../sql-reference/data-types/string.md)) — 設定プロファイルのストレージパス。`access_control_path` パラメータで構成されています。

- `num_elements` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `system.settings_profile_elements` テーブルにおけるこのプロファイルの要素数。

- `apply_to_all` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — すべての役割および/またはユーザーに対して設定プロファイルが設定されていることを示します。

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 設定プロファイルが適用される役割および/またはユーザーのリスト。

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — リストに載っているものを除くすべての役割および/またはユーザーに設定プロファイルが適用されます。

## 関連項目 {#see-also}

- [SHOW PROFILES](../../sql-reference/statements/show.md#show-profiles-statement)
