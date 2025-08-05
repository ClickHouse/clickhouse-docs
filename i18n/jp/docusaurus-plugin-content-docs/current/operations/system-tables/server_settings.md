---
description: 'System table containing formation about global settings for the server,
  which are specified in `config.xml`.'
keywords:
- 'system table'
- 'server_settings'
slug: '/operations/system-tables/server_settings'
title: 'system.server_settings'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.server_settings

<SystemTableCloud/>

サーバーのグローバル設定に関する情報を含んでおり、これは `config.xml` で指定されています。現在、テーブルは `config.xml` の最初のレイヤーからの設定のみを表示し、ネストされた設定（例えば、[logger](../../operations/server-configuration-parameters/settings.md#logger)）はサポートしていません。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — サーバー設定の名前。
- `value` ([String](../../sql-reference/data-types/string.md)) — サーバー設定の値。
- `default` ([String](../../sql-reference/data-types/string.md)) — サーバー設定のデフォルト値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が `config.xml` で指定されたかどうかを示します。
- `description` ([String](../../sql-reference/data-types/string.md)) — 短いサーバー設定の説明。
- `type` ([String](../../sql-reference/data-types/string.md)) — サーバー設定の値の型。
- `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — 設定がサーバーの実行中に変更可能かどうか。値:
    - `'No' `
    - `'IncreaseOnly'`
    - `'DecreaseOnly'`
    - `'Yes'`
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 設定が廃止されているかどうかを示します。

**例**

以下の例は、名前に `thread_pool` を含むサーバー設定に関する情報を取得する方法を示しています。

```sql
SELECT *
FROM system.server_settings
WHERE name LIKE '%thread_pool%'
```

```text
┌─name──────────────────────────────────────────┬─value─┬─default─┬─changed─┬─description─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type───┬─changeable_without_restart─┬─is_obsolete─┐
│ max_thread_pool_size                          │ 10000 │ 10000   │       0 │ OS から割り当てられ、クエリ実行やバックグラウンドオペレーションに使用できる最大スレッド数。                           │ UInt64 │                         No │           0 │
│ max_thread_pool_free_size                     │ 1000  │ 1000    │       0 │ 割り当てられた後に常にグローバルスレッドプールに留まり、タスク数が不十分な場合にはアイドルのままの最大スレッド数。 │ UInt64 │                         No │           0 │
│ thread_pool_queue_size                        │ 10000 │ 10000   │       0 │ 実行を待機するタスクをキューに配置できる最大数。                                                                  │ UInt64 │                         No │           0 │
│ max_io_thread_pool_size                       │ 100   │ 100     │       0 │ IO オペレーションに使用される最大スレッド数。                                                                                 │ UInt64 │                         No │           0 │
│ max_io_thread_pool_free_size                  │ 0     │ 0       │       0 │ IO スレッドプールの最大空きサイズ。                                                                                                                   │ UInt64 │                         No │           0 │
│ io_thread_pool_queue_size                     │ 10000 │ 10000   │       0 │ IO スレッドプールのキューサイズ。                                                                                                                      │ UInt64 │                         No │           0 │
│ max_active_parts_loading_thread_pool_size     │ 64    │ 64      │       0 │ スタートアップ時にアクティブなデータパーツのセット（アクティブなもの）をロードするためのスレッド数。                                                                    │ UInt64 │                         No │           0 │
│ max_outdated_parts_loading_thread_pool_size   │ 32    │ 32      │       0 │ スタートアップ時に非アクティブなデータパーツのセット（アウトデートのもの）をロードするためのスレッド数。                                                                │ UInt64 │                         No │           0 │
│ max_unexpected_parts_loading_thread_pool_size │ 32    │ 32      │       0 │ スタートアップ時に非アクティブなデータパーツのセット（予期しないもの）をロードするためのスレッド数。                                                              │ UInt64 │                         No │           0 │
│ max_parts_cleaning_thread_pool_size           │ 128   │ 128     │       0 │ 非アクティブなデータパーツの同時削除に使用するスレッド数。                                                                                │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_size               │ 1000  │ 1000    │       0 │ バックアップクエリのための IO オペレーションに使用される最大スレッド数。                                                               │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_free_size          │ 0     │ 0       │       0 │ バックアップ IO スレッドプールの最大空きサイズ。                                                                                                           │ UInt64 │                         No │           0 │
│ backups_io_thread_pool_queue_size             │ 0     │ 0       │       0 │ バックアップ IO スレッドプールのキューサイズ。                                                                                                              │ UInt64 │                         No │           0 │
└───────────────────────────────────────────────┴───────┴─────────┴─────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴────────────────────────────┴─────────────┘

```

`WHERE changed` の使用は、設定ファイルの設定が正しく読み込まれ、使用されているかどうかを確認したいときに便利です。

<!-- -->

```sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**関連項目**

- [Settings](../../operations/system-tables/settings.md)
- [Configuration Files](../../operations/configuration-files.md)
- [Server Settings](../../operations/server-configuration-parameters/settings.md)
