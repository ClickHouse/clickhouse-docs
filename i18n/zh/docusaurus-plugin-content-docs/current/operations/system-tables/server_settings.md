---
description: '包含服务器全局设置信息的系统表，这些设置在 `config.xml` 中指定。'
keywords: ['系统表', 'server_settings']
slug: /operations/system-tables/server_settings
title: 'system.server_settings'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.server&#95;settings {#systemserver&#95;settings}

<SystemTableCloud />

包含在 `config.xml` 中指定的服务器全局设置的信息。
当前，该表仅显示 `config.xml` 顶层中的设置，不支持嵌套配置（例如 [logger](../../operations/server-configuration-parameters/settings.md#logger)）。

列：

* `name` ([String](../../sql-reference/data-types/string.md)) — 服务器设置名称。
* `value` ([String](../../sql-reference/data-types/string.md)) — 服务器设置的值。
* `default` ([String](../../sql-reference/data-types/string.md)) — 服务器设置的默认值。
* `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 指示某个设置是否在 `config.xml` 中被显式指定。
* `description` ([String](../../sql-reference/data-types/string.md)) — 服务器设置的简要说明。
* `type` ([String](../../sql-reference/data-types/string.md)) — 服务器设置值的类型。
* `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — 指示该设置是否可以在服务器运行时更改。取值：
  * `'No' `
  * `'IncreaseOnly'`
  * `'DecreaseOnly'`
  * `'Yes'`
* `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 指示某个设置是否已废弃。

**示例**

下面的示例展示了如何获取名称中包含 `thread_pool` 的服务器设置相关信息。

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

使用 `WHERE changed` 在某些场景下会很有用，例如当你想检查配置文件中的设置是否已正确加载并实际生效时。

{/* */ }

```sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**另请参见**

* [设置](../../operations/system-tables/settings.md)
* [配置文件](../../operations/configuration-files.md)
* [服务器设置](../../operations/server-configuration-parameters/settings.md)
