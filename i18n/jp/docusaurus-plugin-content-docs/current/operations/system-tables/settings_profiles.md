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

- `storage` ([String](../../sql-reference/data-types/string.md)) — 設定プロファイルのストレージへのパス。 `access_control_path` パラメータで設定されています。

- `num_elements` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `system.settings_profile_elements` テーブルにおけるこのプロファイルの要素数。

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定プロファイルがすべてのロールおよび/またはユーザーに適用されることを示します。

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 設定プロファイルが適用されるロールおよび/またはユーザーのリスト。

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — リストに記載されたロールおよび/またはユーザーを除いて、設定プロファイルがすべてのロールおよび/またはユーザーに適用されます。

## その他 {#see-also}

- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)
