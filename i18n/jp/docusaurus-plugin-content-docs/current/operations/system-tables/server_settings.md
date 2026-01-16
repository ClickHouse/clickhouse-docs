---
description: 'サーバーのグローバル設定に関する情報を格納するシステムテーブルで、これらの設定は `config.xml` に記述されています。'
keywords: ['system table', 'server_settings']
slug: /operations/system-tables/server_settings
title: 'system.server_settings'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.server&#95;settings \\{#systemserver&#95;settings\\}

<SystemTableCloud />

`config.xml` に指定されているサーバーのグローバル設定に関する情報を保持します。
現在、このテーブルに表示されるのは `config.xml` の最上位階層にある設定のみで、入れ子になった設定（例: [logger](../../operations/server-configuration-parameters/settings.md#logger)）には対応していません。

Columns:

* `name` ([String](../../sql-reference/data-types/string.md)) — サーバー設定名。
* `value` ([String](../../sql-reference/data-types/string.md)) — サーバー設定値。
* `default` ([String](../../sql-reference/data-types/string.md)) — サーバー設定のデフォルト値。
* `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 設定が `config.xml` で明示的に指定されているかどうかを示します。
* `description` ([String](../../sql-reference/data-types/string.md)) — サーバー設定の簡潔な説明。
* `type` ([String](../../sql-reference/data-types/string.md)) — サーバー設定値の型。
* `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — 設定をサーバーの再起動なしで変更できるかどうか。値:
  * `'No' `
  * `'IncreaseOnly'`
  * `'DecreaseOnly'`
  * `'Yes'`
* `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 設定が廃止済みかどうかを示します。

**Example**

次の例は、名前に `thread_pool` を含むサーバー設定に関する情報の取得方法を示します。

```sql
SELECT *
FROM system.server_settings
WHERE name LIKE '%thread_pool%'
```

```text
┌─name──────────────────────────────────────────┬─value─┬─default─┬─changed─┬─description─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type───┬─changeable_without_restart─┬─is_obsolete─┐
│ max_thread_pool_size                          │ 10000 │ 10000   │       0 │ The maximum number of threads that could be allocated from the OS and used for query execution and background operations.                           │ UInt64 │                         No │           0 │
│ max_thread_pool_free_size                     │ 1000  │ 1000    │       0 │ The maximum number of threads that will always stay in a global thread pool once allocated and remain idle in case of insufficient number of tasks. │ UInt64 │                         No │           0 │
│ thread_pool_queue_size                        │ 10000 │ 10000   │       0 │ The maximum number of tasks that will be placed in a queue and wait for execution.                                                                  │ UInt64 │                         No │           0 │
│ max_io_thread_pool_size                       │ 100   │ 100     │       0 │ The maximum number of threads that would be used for IO operations                                                                                  │ UInt64 │                         No │           0 │
│ max_io_thread_pool_free_size                  │ 0     │ 0       │       0 │ Max free size for IO thread pool.                                                                                                                   │ UInt64 │                         No │           0 │
│ io_thread_pool_queue_size                     │ 10000 │ 10000   │       0 │ Queue size for IO thread pool.                                                                                                                      │ UInt64 │                         No │           0 │
│ max_active_parts_loading_thread_pool_size     │ 64    │ 64      │       0 │ The number of threads to load active set of data parts (Active ones) at startup.                                                                    │ UInt64 │                         No │           0 │
│ max_outdated_parts_loading_thread_pool_size   │ 32    │ 32      │       0 │ The number of threads to load inactive set of data parts (Outdated ones) at startup.                                                                │ UInt64 │                         No │           0 │
│ max_unexpected_parts_loading_thread_pool_size │ 32    │ 32      │       0 │ The number of threads to load inactive set of data parts (Unexpected ones) at startup.                                                              │ UInt64 │                         No │           0 │
│ max_parts_cleaning_thread_pool_size           │ 128   │ 128     │       0 │ The number of threads for concurrent removal of inactive data parts.                                                                                │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_size               │ 1000  │ 1000    │       0 │ The maximum number of threads that would be used for IO operations for BACKUP queries                                                               │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_free_size          │ 0     │ 0       │       0 │ Max free size for backups IO thread pool.                                                                                                           │ UInt64 │                         No │           0 │
│ backups_io_thread_pool_queue_size             │ 0     │ 0       │       0 │ Queue size for backups IO thread pool.                                                                                                              │ UInt64 │                         No │           0 │
└───────────────────────────────────────────────┴───────┴─────────┴─────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴────────────────────────────┴─────────────┘

```

`WHERE changed` は、例えば設定ファイル内の設定が正しく読み込まれ、実際に利用されているかどうかを確認したい場合に有用です。

{/* */ }

```sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**関連項目**

* [設定](../../operations/system-tables/settings.md)
* [設定ファイル](../../operations/configuration-files.md)
* [サーバー設定](../../operations/server-configuration-parameters/settings.md)
