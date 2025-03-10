---
description: '包含有关服务器全球设置的信息，这些设置在 `config.xml` 中指定。'
slug: /operations/system-tables/server_settings
title: 'system.server_settings'
keywords: ['system table', 'server_settings']
---
import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含有关服务器全球设置的信息，这些设置在 `config.xml` 中指定。
目前，表中仅显示 `config.xml` 第一层的设置，不支持嵌套配置（例如 [logger](../../operations/server-configuration-parameters/settings.md#logger)）。

列：

- `name` ([String](../../sql-reference/data-types/string.md)) — 服务器设置名称。
- `value` ([String](../../sql-reference/data-types/string.md)) — 服务器设置值。
- `default` ([String](../../sql-reference/data-types/string.md)) — 服务器设置默认值。
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 显示设置是否在 `config.xml` 中指定。
- `description` ([String](../../sql-reference/data-types/string.md)) — 服务器设置的简短描述。
- `type` ([String](../../sql-reference/data-types/string.md)) — 服务器设置值类型。
- `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — 设置是否可以在服务器运行时更改。值：
    - `'No' `
    - `'IncreaseOnly'`
    - `'DecreaseOnly'`
    - `'Yes'`
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 显示设置是否已过时。

**示例**

以下示例显示如何获取名称包含 `thread_pool` 的服务器设置的信息。

``` sql
SELECT *
FROM system.server_settings
WHERE name LIKE '%thread_pool%'
```

``` text
┌─name──────────────────────────────────────────┬─value─┬─default─┬─changed─┬─description─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type───┬─changeable_without_restart─┬─is_obsolete─┐
│ max_thread_pool_size                          │ 10000 │ 10000   │       0 │ 可能从操作系统分配并用于查询执行和后台操作的最大线程数。                                                               │ UInt64 │                         No │           0 │
│ max_thread_pool_free_size                     │ 1000  │ 1000    │       0 │ 一旦分配，始终保留在全局线程池中并在任务不足时保持空闲的最大线程数。                                                        │ UInt64 │                         No │           0 │
│ thread_pool_queue_size                        │ 10000 │ 10000   │       0 │ 将被放入队列并等待执行的最大任务数。                                                                                         │ UInt64 │                         No │           0 │
│ max_io_thread_pool_size                       │ 100   │ 100     │       0 │ 将用于IO操作的最大线程数。                                                                                                     │ UInt64 │                         No │           0 │
│ max_io_thread_pool_free_size                  │ 0     │ 0       │       0 │ IO线程池的最大空闲大小。                                                                                                        │ UInt64 │                         No │           0 │
│ io_thread_pool_queue_size                     │ 10000 │ 10000   │       0 │ IO线程池的队列大小。                                                                                                            │ UInt64 │                         No │           0 │
│ max_active_parts_loading_thread_pool_size     │ 64    │ 64      │       0 │ 启动时加载活动数据分片的线程数（活动分片）。                                                                                   │ UInt64 │                         No │           0 │
│ max_outdated_parts_loading_thread_pool_size   │ 32    │ 32      │       0 │ 启动时加载不活动数据分片的线程数（过时分片）。                                                                                 │ UInt64 │                         No │           0 │
│ max_unexpected_parts_loading_thread_pool_size │ 32    │ 32      │       0 │ 启动时加载不活动数据分片的线程数（意外分片）。                                                                               │ UInt64 │                         No │           0 │
│ max_parts_cleaning_thread_pool_size           │ 128   │ 128     │       0 │ 用于并发删除不活动数据分片的线程数。                                                                                           │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_size               │ 1000  │ 1000    │       0 │ 将用于备份查询的IO操作的最大线程数。                                                                                            │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_free_size          │ 0     │ 0       │       0 │ 备份IO线程池的最大空闲大小。                                                                                                     │ UInt64 │                         No │           0 │
│ backups_io_thread_pool_queue_size             │ 0     │ 0       │       0 │ 备份IO线程池的队列大小。                                                                                                         │ UInt64 │                         No │           0 │
└───────────────────────────────────────────────┴───────┴─────────┴─────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴────────────────────────────┴─────────────┘

```

使用 `WHERE changed` 可以很有用，例如，当您想检查配置文件中的设置是否正确加载并正在使用时。

<!-- -->

``` sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**另见**

- [设置](../../operations/system-tables/settings.md)
- [配置文件](../../operations/configuration-files.md)
- [服务器设置](../../operations/server-configuration-parameters/settings.md)
