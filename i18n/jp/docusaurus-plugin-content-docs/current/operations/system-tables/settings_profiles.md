---
'description': 'System table which contains properties of configured setting profiles.'
'keywords':
- 'system table'
- 'settings_profiles'
'slug': '/operations/system-tables/settings_profiles'
'title': 'system.settings_profiles'
---




# system.settings_profiles

設定プロファイルのプロパティを含みます。

Columns:
- `name` ([String](../../sql-reference/data-types/string.md)) — 設定プロファイル名。

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 設定プロファイルID。

- `storage` ([String](../../sql-reference/data-types/string.md)) — 設定プロファイルのストレージパス。`access_control_path` パラメータで構成されています。

- `num_elements` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `system.settings_profile_elements` テーブル内のこのプロファイルの要素数。

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — すべてのロールおよび/またはユーザーに設定プロファイルが適用されることを示します。

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 設定プロファイルが適用されるロールおよび/またはユーザーのリスト。

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — リストに記載されているロールおよび/またはユーザーを除いて、すべてのロールおよび/またはユーザーに設定プロファイルが適用されます。

## See Also {#see-also}

- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)
