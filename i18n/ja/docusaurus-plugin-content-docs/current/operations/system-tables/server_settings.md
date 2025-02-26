---
description: "サーバーのグローバル設定に関する情報を含むシステムテーブルで、`config.xml`に指定されています。"
slug: /operations/system-tables/server_settings
title: "server_settings"
keywords: ["システムテーブル", "server_settings"]
---
import SystemTableCloud from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

`config.xml`に指定されているサーバーのグローバル設定に関する情報を含みます。
現在、このテーブルは`config.xml`の最初のレイヤーからの設定のみを表示し、入れ子になった設定はサポートしていません（例：[logger](../../operations/server-configuration-parameters/settings.md#logger)）。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — サーバー設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — サーバー設定値。
- `default` ([String](../../sql-reference/data-types/string.md)) — サーバー設定のデフォルト値。
- `changed` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — `config.xml`に設定が指定されたかどうかを示します。
- `description` ([String](../../sql-reference/data-types/string.md)) — 短いサーバー設定の説明。
- `type` ([String](../../sql-reference/data-types/string.md)) — サーバー設定値の型。
- `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — サーバーの実行時に設定を変更できるかどうか。値:
    - `'No'`
    - `'IncreaseOnly'`
    - `'DecreaseOnly'`
    - `'Yes'`
- `is_obsolete` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) - 設定が古くなっているかどうかを示します。

**例**

次の例は、名前に `thread_pool` を含むサーバー設定に関する情報を取得する方法を示しています。

``` sql
SELECT *
FROM system.server_settings
WHERE name LIKE '%thread_pool%'
```

``` text
┌─name──────────────────────────────────────────┬─value─┬─default─┬─changed─┬─description─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type───┬─changeable_without_restart─┬─is_obsolete─┐
│ max_thread_pool_size                          │ 10000 │ 10000   │       0 │ OSから割り当てられ、クエリ実行やバックグラウンド操作に使用されるスレッドの最大数。                                                   │ UInt64 │                         No │           0 │
│ max_thread_pool_free_size                     │ 1000  │ 1000    │       0 │ 割り当てられた後、グローバルスレッドプールに常に留まり、タスクが不足する場合にアイドル状態になるスレッドの最大数。                    │ UInt64 │                         No │           0 │
│ thread_pool_queue_size                        │ 10000 │ 10000   │       0 │ キューに置かれ、実行を待っているタスクの最大数。                                                                                          │ UInt64 │                         No │           0 │
│ max_io_thread_pool_size                       │ 100   │ 100     │       0 │ IO操作に使用されるスレッドの最大数。                                                                                                         │ UInt64 │                         No │           0 │
│ max_io_thread_pool_free_size                  │ 0     │ 0       │       0 │ IOスレッドプールの最大自由サイズ。                                                                                                           │ UInt64 │                         No │           0 │
│ io_thread_pool_queue_size                     │ 10000 │ 10000   │       0 │ IOスレッドプールのキューサイズ。                                                                                                            │ UInt64 │                         No │           0 │
│ max_active_parts_loading_thread_pool_size     │ 64    │ 64      │       0 │ 起動時にアクティブなデータパーツ（アクティブなもの）を読み込むためのスレッドの数。                                                         │ UInt64 │                         No │           0 │
│ max_outdated_parts_loading_thread_pool_size   │ 32    │ 32      │       0 │ 起動時に非アクティブなデータパーツ（古くなったもの）を読み込むためのスレッドの数。                                                         │ UInt64 │                         No │           0 │
│ max_unexpected_parts_loading_thread_pool_size │ 32    │ 32      │       0 │ 起動時に非アクティブなデータパーツ（予期しないもの）を読み込むためのスレッドの数。                                                       │ UInt64 │                         No │           0 │
│ max_parts_cleaning_thread_pool_size           │ 128   │ 128     │       0 │ 非アクティブなデータパーツを同時に削除するためのスレッドの数。                                                                           │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_size               │ 1000  │ 1000    │       0 │ BACKUPクエリのIO操作に使用されるスレッドの最大数。                                                                                          │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_free_size          │ 0     │ 0       │       0 │ バックアップIOスレッドプールの最大自由サイズ。                                                                                              │ UInt64 │                         No │           0 │
│ backups_io_thread_pool_queue_size             │ 0     │ 0       │       0 │ バックアップIOスレッドプールのキューサイズ。                                                                                                │ UInt64 │                         No │           0 │
└───────────────────────────────────────────────┴───────┴─────────┴─────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴────────────────────────────┴─────────────┘

```

`WHERE changed`を使用することは、設定ファイルの設定が正しく読み込まれ、使用されているかどうかを確認したい場合に便利です。

<!-- -->

``` sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**参照してください**

- [設定](../../operations/system-tables/settings.md)
- [設定ファイル](../../operations/configuration-files.md)
- [サーバー設定](../../operations/server-configuration-parameters/settings.md)
