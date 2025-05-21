---
description: 'サーバーの global settings に関する情報を含むシステムテーブルで、これは `config.xml` に指定されます。'
keywords: ['system table', 'server_settings']
slug: /operations/system-tables/server_settings
title: 'system.server_settings'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.server_settings

<SystemTableCloud/>

`config.xml` に指定されたサーバーの global settings に関する情報を含みます。現在、テーブルは `config.xml` の最初のレイヤーからの設定のみを表示し、入れ子の設定（例: [logger](../../operations/server-configuration-parameters/settings.md#logger)）には対応していません。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — サーバー設定の名前。
- `value` ([String](../../sql-reference/data-types/string.md)) — サーバー設定の値。
- `default` ([String](../../sql-reference/data-types/string.md)) — サーバー設定のデフォルト値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) —設定が `config.xml` に指定されているかを示します。
- `description` ([String](../../sql-reference/data-types/string.md)) — サーバー設定の短い説明。
- `type` ([String](../../sql-reference/data-types/string.md)) — サーバー設定の値の型。
- `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — 設定がサーバーの実行時に変更可能かどうか。値:
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
│ max_thread_pool_size                          │ 10000 │ 10000   │       0 │ OS から割り当てられ、クエリ実行やバックグラウンド操作に使用できる最大スレッド数。                                                         │ UInt64 │                         No │           0 │
│ max_thread_pool_free_size                     │ 1000  │ 1000    │       0 │ 割り当てられた後、常にグローバルスレッドプールに残り、タスクが不足している場合にはアイドルのままの最大スレッド数。                                  │ UInt64 │                         No │           0 │
│ thread_pool_queue_size                        │ 10000 │ 10000   │       0 │ 実行を待つためにキューに置かれる最大タスク数。                                                                                                         │ UInt64 │                         No │           0 │
│ max_io_thread_pool_size                       │ 100   │ 100     │       0 │ IO 操作に使用される最大スレッド数。                                                                                                                      │ UInt64 │                         No │           0 │
│ max_io_thread_pool_free_size                  │ 0     │ 0       │       0 │ IO スレッドプールの最大空きサイズ。                                                                                                                        │ UInt64 │                         No │           0 │
│ io_thread_pool_queue_size                     │ 10000 │ 10000   │       0 │ IO スレッドプールのキューサイズ。                                                                                                                            │ UInt64 │                         No │           0 │
│ max_active_parts_loading_thread_pool_size     │ 64    │ 64      │       0 │ スタートアップ時にアクティブなデータパーツのセットをロードするためのスレッド数。                                                                                                  │ UInt64 │                         No │           0 │
│ max_outdated_parts_loading_thread_pool_size   │ 32    │ 32      │       0 │ スタートアップ時に非アクティブなデータパーツのセットをロードするためのスレッド数。                                                                                                   │ UInt64 │                         No │           0 │
│ max_unexpected_parts_loading_thread_pool_size │ 32    │ 32      │       0 │ スタートアップ時に非アクティブなデータパーツのセットをロードするためのスレッド数。                                                                                                   │ UInt64 │                         No │           0 │
│ max_parts_cleaning_thread_pool_size           │ 128   │ 128     │       0 │ 非アクティブなデータパーツの同時削除のためのスレッド数。                                                                                                        │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_size               │ 1000  │ 1000    │       0 │ バックアップクエリのために使用される IO 操作の最大スレッド数。                                                                                               │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_free_size          │ 0     │ 0       │       0 │ バックアップ用の IO スレッドプールの最大空きサイズ。                                                                                                        │ UInt64 │                         No │           0 │
│ backups_io_thread_pool_queue_size             │ 0     │ 0       │       0 │ バックアップ用 IO スレッドプールのキューサイズ。                                                                                                           │ UInt64 │                         No │           0 │
└───────────────────────────────────────────────┴───────┴─────────┴─────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴────────────────────────────┴─────────────┘

```

`WHERE changed` の使用は、設定ファイルの設定が正しく読み込まれ、使用されているかどうかをチェックしたい場合に便利です。

<!-- -->

```sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**参照**

- [Settings](../../operations/system-tables/settings.md)
- [Configuration Files](../../operations/configuration-files.md)
- [Server Settings](../../operations/server-configuration-parameters/settings.md)
