---
description: "サーバーのグローバル設定に関する情報を含むシステムテーブルで、これらは `config.xml` で指定されています。"
slug: /operations/system-tables/server_settings
title: "system.server_settings"
keywords: ["システムテーブル", "server_settings"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

サーバーのグローバル設定に関する情報を含み、これらは `config.xml` で指定されています。
現在、このテーブルは `config.xml` の最初のレイヤーからの設定のみを表示し、ネストされた設定（例: [logger](../../operations/server-configuration-parameters/settings.md#logger)）には対応していません。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — サーバー設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — サーバー設定値。
- `default` ([String](../../sql-reference/data-types/string.md)) — サーバー設定のデフォルト値。
- `changed` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 設定が `config.xml` で指定されたかどうかを示します。
- `description` ([String](../../sql-reference/data-types/string.md)) — 短いサーバー設定の説明。
- `type` ([String](../../sql-reference/data-types/string.md)) — サーバー設定値の型。
- `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — 設定がサーバーのランタイム中に変更できるかどうか。値:
    - `'No' `
    - `'IncreaseOnly'`
    - `'DecreaseOnly'`
    - `'Yes'`
- `is_obsolete` ([UInt8](../../sql-reference/data-types/int-uint.md#uint-ranges)) - 設定が古くなっているかどうかを示します。

**例**

以下の例は、`thread_pool` を含むサーバー設定の情報を取得する方法を示しています。

``` sql
SELECT *
FROM system.server_settings
WHERE name LIKE '%thread_pool%'
```

``` text
┌─name──────────────────────────────────────────┬─value─┬─default─┬─changed─┬─description─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type───┬─changeable_without_restart─┬─is_obsolete─┐
│ max_thread_pool_size                          │ 10000 │ 10000   │       0 │ OS から割り当てられ、クエリの実行およびバックグラウンド操作に使用できるスレッドの最大数です。                                               │ UInt64 │                         No │           0 │
│ max_thread_pool_free_size                     │ 1000  │ 1000    │       0 │ 割り当てられたときに常にグローバルスレッドプールにとどまり、タスクが不足している場合はアイドル状態になるスレッドの最大数です。                   │ UInt64 │                         No │           0 │
│ thread_pool_queue_size                        │ 10000 │ 10000   │       0 │ キューに置かれ、実行を待つタスクの最大数です。                                                                                            │ UInt64 │                         No │           0 │
│ max_io_thread_pool_size                       │ 100   │ 100     │       0 │ IO 操作に使用されるスレッドの最大数です。                                                                                                  │ UInt64 │                         No │           0 │
│ max_io_thread_pool_free_size                  │ 0     │ 0       │       0 │ IO スレッドプールの最大空きサイズです。                                                                                                     │ UInt64 │                         No │           0 │
│ io_thread_pool_queue_size                     │ 10000 │ 10000   │       0 │ IO スレッドプールのキューサイズです。                                                                                                       │ UInt64 │                         No │           0 │
│ max_active_parts_loading_thread_pool_size     │ 64    │ 64      │       0 │ 起動時にアクティブなデータパーツのセットをロードするためのスレッドの数です。                                                              │ UInt64 │                         No │           0 │
│ max_outdated_parts_loading_thread_pool_size   │ 32    │ 32      │       0 │ 起動時に非アクティブなデータパーツのセットをロードするためのスレッドの数です。                                                            │ UInt64 │                         No │           0 │
│ max_unexpected_parts_loading_thread_pool_size │ 32    │ 32      │       0 │ 起動時に想定外のデータパーツのセットをロードするためのスレッドの数です。                                                                  │ UInt64 │                         No │           0 │
│ max_parts_cleaning_thread_pool_size           │ 128   │ 128     │       0 │ 非アクティブなデータパーツを同時に削除するためのスレッドの数です。                                                                        │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_size               │ 1000  │ 1000    │       0 │ BACKUP クエリのために使用される IO 操作の最大スレッド数です。                                                                             │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_free_size          │ 0     │ 0       │       0 │ バックアップの IO スレッドプールの最大空きサイズです。                                                                                     │ UInt64 │                         No │           0 │
│ backups_io_thread_pool_queue_size             │ 0     │ 0       │       0 │ バックアップの IO スレッドプールのキューサイズです。                                                                                       │ UInt64 │                         No │           0 │
└───────────────────────────────────────────────┴───────┴─────────┴─────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴────────────────────────────┴─────────────┘

```

`WHERE changed` の使用は、設定ファイル内の設定が正しく読み込まれ、使用されているかを確認したいときに便利です。

<!-- -->

``` sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**関連項目**

- [Settings](../../operations/system-tables/settings.md)
- [Configuration Files](../../operations/configuration-files.md)
- [Server Settings](../../operations/server-configuration-parameters/settings.md)
