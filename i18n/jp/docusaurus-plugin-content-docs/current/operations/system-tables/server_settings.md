---
description: "サーバーのグローバル設定に関する情報を含むシステムテーブルで、`config.xml` に指定されています。"
slug: /operations/system-tables/server_settings
title: "system.server_settings"
keywords: ["system table", "server_settings"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

`config.xml` に指定されたサーバーのグローバル設定に関する情報を含んでいます。現在、このテーブルは `config.xml` の最初のレイヤーからの設定のみを表示し、ネストされた設定（例えば [logger](../../operations/server-configuration-parameters/settings.md#logger)）には対応していません。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — サーバー設定名。
- `value` ([String](../../sql-reference/data-types/string.md)) — サーバー設定値。
- `default` ([String](../../sql-reference/data-types/string.md)) — サーバー設定のデフォルト値。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — `config.xml` に設定が指定されたかどうかを示します。
- `description` ([String](../../sql-reference/data-types/string.md)) — 短いサーバー設定の説明。
- `type` ([String](../../sql-reference/data-types/string.md)) — サーバー設定値の型。
- `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — サーバーの実行中に設定を変更できるかどうか。値:
    - `'No' `
    - `'IncreaseOnly'`
    - `'DecreaseOnly'`
    - `'Yes'`
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 設定が古いかどうかを示します。

**例**

以下の例では、名前に `thread_pool` を含むサーバー設定に関する情報を取得する方法を示しています。

``` sql
SELECT *
FROM system.server_settings
WHERE name LIKE '%thread_pool%'
```

``` text
┌─name──────────────────────────────────────────┬─value─┬─default─┬─changed─┬─description─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type───┬─changeable_without_restart─┬─is_obsolete─┐
│ max_thread_pool_size                          │ 10000 │ 10000   │       0 │ OSから割り当てられ、クエリの実行およびバックグラウンド操作に使用できるスレッドの最大数。                                                 │ UInt64 │                         No │           0 │
│ max_thread_pool_free_size                     │ 1000  │ 1000    │       0 │ 割り当て後、常にグローバルスレッドプールに残り、タスク数が不足している場合にアイドル状態となるスレッドの最大数。                             │ UInt64 │                         No │           0 │
│ thread_pool_queue_size                        │ 10000 │ 10000   │       0 │ キューに配置され、実行を待つことになるタスクの最大数。                                                                                      │ UInt64 │                         No │           0 │
│ max_io_thread_pool_size                       │ 100   │ 100     │       0 │ IO操作に使用されるスレッドの最大数。                                                                                                           │ UInt64 │                         No │           0 │
│ max_io_thread_pool_free_size                  │ 0     │ 0       │       0 │ IOスレッドプールの最大フリーサイズ。                                                                                                           │ UInt64 │                         No │           0 │
│ io_thread_pool_queue_size                     │ 10000 │ 10000   │       0 │ IOスレッドプールのキューサイズ。                                                                                                              │ UInt64 │                         No │           0 │
│ max_active_parts_loading_thread_pool_size     │ 64    │ 64      │       0 │ 起動時にアクティブなデータパーツセット（アクティブなもの）の読み込みに使用されるスレッドの数。                                             │ UInt64 │                         No │           0 │
│ max_outdated_parts_loading_thread_pool_size   │ 32    │ 32      │       0 │ 起動時に非アクティブなデータパーツセット（古いもの）の読み込みに使用されるスレッドの数。                                               │ UInt64 │                         No │           0 │
│ max_unexpected_parts_loading_thread_pool_size │ 32    │ 32      │       0 │ 起動時に非アクティブなデータパーツセット（予期しないもの）の読み込みに使用されるスレッドの数。                                           │ UInt64 │                         No │           0 │
│ max_parts_cleaning_thread_pool_size           │ 128   │ 128     │       0 │ 非アクティブなデータパーツの同時削除に使用されるスレッドの数。                                                                             │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_size               │ 1000  │ 1000    │       0 │ バックアップクエリのためにIO操作に使用されるスレッドの最大数。                                                                            │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_free_size          │ 0     │ 0       │       0 │ バックアップ用IOスレッドプールの最大フリーサイズ。                                                                                           │ UInt64 │                         No │           0 │
│ backups_io_thread_pool_queue_size             │ 0     │ 0       │       0 │ バックアップ用IOスレッドプールのキューサイズ。                                                                                              │ UInt64 │                         No │           0 │
└───────────────────────────────────────────────┴───────┴─────────┴─────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴────────────────────────────┴─────────────┘

```

`WHERE changed` の使用は、例えば、設定ファイルの設定が正しく読み込まれ、使用されているかを確認したい場合に便利です。

<!-- -->

``` sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**参照**

- [Settings](../../operations/system-tables/settings.md)
- [Configuration Files](../../operations/configuration-files.md)
- [Server Settings](../../operations/server-configuration-parameters/settings.md)
