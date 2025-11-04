---
'description': 'システムテーブルで、設定プロファイルのプロパティが含まれています。'
'keywords':
- 'system table'
- 'settings_profiles'
'slug': '/operations/system-tables/settings_profiles'
'title': 'system.settings_profiles'
'doc_type': 'reference'
---


# system.settings_profiles

設定プロファイルのプロパティが含まれています。

カラム:
- `name` ([String](../../sql-reference/data-types/string.md)) — 設定プロファイルの名前。

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 設定プロファイルのID。

- `storage` ([String](../../sql-reference/data-types/string.md)) — 設定プロファイルのストレージへのパス。`access_control_path` パラメータで構成されています。

- `num_elements` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `system.settings_profile_elements` テーブル内のこのプロファイルの要素数。

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定プロファイルがすべてのロールおよび/またはユーザーに対して設定されていることを示します。

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 設定プロファイルが適用されるロールおよび/またはユーザーのリスト。

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 指定されたロールおよび/またはユーザーを除くすべてに設定プロファイルが適用されます。

## See Also {#see-also}

- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)
