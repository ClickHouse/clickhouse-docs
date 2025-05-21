description: '設定プロファイルの内容を記述するシステムテーブル: 制約、設定が適用される役割とユーザー、親設定プロファイル。'
keywords: ['system table', 'settings_profile_elements']
slug: /operations/system-tables/settings_profile_elements
title: 'system.settings_profile_elements'
```


# system.settings_profile_elements

設定プロファイルの内容を記述します：

- 制約。
- 設定が適用される役割とユーザー。
- 親設定プロファイル。

カラム：
- `profile_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定プロファイル名。

- `user_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — ユーザー名。

- `role_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 役割名。

- `index` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 設定プロファイル要素の連番。

- `setting_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定名。

- `value` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定値。

- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最小値。設定されていない場合は `NULL`。

- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 設定の最大値。設定されていない場合は `NULL`。

- `writability` ([Nullable](../../sql-reference/data-types/nullable.md)([Enum8](../../sql-reference/data-types/enum.md)('WRITABLE' = 0, 'CONST' = 1, 'CHANGEABLE_IN_READONLY' = 2))) — 設定制約の書き込み可能性の種類を設定します。

- `inherit_profile` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — この設定プロファイルの親プロファイル。設定されていない場合は `NULL`。設定プロファイルは、その親プロファイルからすべての設定値および制約（`min`、`max`、`readonly`）を継承します。
