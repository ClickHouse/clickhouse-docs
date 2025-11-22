---
description: '包含服务器全局设置信息的系统表，这些设置在 `config.xml` 中指定。'
keywords: ['system table', 'server_settings']
slug: /operations/system-tables/server_settings
title: 'system.server_settings'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.server&#95;settings

<SystemTableCloud />

包含服务器全局设置的信息，这些设置在 `config.xml` 中指定。
当前该表仅显示 `config.xml` 顶层中的设置，不支持嵌套配置（例如 [logger](../../operations/server-configuration-parameters/settings.md#logger)）。

列：

* `name` ([String](../../sql-reference/data-types/string.md)) — 服务器设置名称。
* `value` ([String](../../sql-reference/data-types/string.md)) — 服务器设置的值。
* `default` ([String](../../sql-reference/data-types/string.md)) — 服务器设置的默认值。
* `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 表示该设置是否在 `config.xml` 中被显式指定。
* `description` ([String](../../sql-reference/data-types/string.md)) — 服务器设置的简要说明。
* `type` ([String](../../sql-reference/data-types/string.md)) — 服务器设置值的类型。
* `changeable_without_restart` ([Enum8](../../sql-reference/data-types/enum.md)) — 指示该设置是否可以在服务器运行时更改。取值：
  * `'No' `
  * `'IncreaseOnly'`
  * `'DecreaseOnly'`
  * `'Yes'`
* `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 表示该设置是否已废弃。

**示例**

下面的示例展示了如何获取名称中包含 `thread_pool` 的服务器设置信息。

```sql
SELECT *
FROM system.server_settings
WHERE name LIKE '%thread_pool%'
```


```text
┌─name──────────────────────────────────────────┬─value─┬─default─┬─changed─┬─description─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─type───┬─changeable_without_restart─┬─is_obsolete─┐
│ max_thread_pool_size                          │ 10000 │ 10000   │       0 │ 可从操作系统分配并用于查询执行和后台操作的最大线程数。                           │ UInt64 │                         No │           0 │
│ max_thread_pool_free_size                     │ 1000  │ 1000    │       0 │ 分配后始终保留在全局线程池中的最大线程数,当任务数量不足时保持空闲。 │ UInt64 │                         No │           0 │
│ thread_pool_queue_size                        │ 10000 │ 10000   │       0 │ 可放入队列等待执行的最大任务数。                                                                  │ UInt64 │                         No │           0 │
│ max_io_thread_pool_size                       │ 100   │ 100     │       0 │ 用于 IO 操作的最大线程数                                                                                  │ UInt64 │                         No │           0 │
│ max_io_thread_pool_free_size                  │ 0     │ 0       │       0 │ IO 线程池的最大空闲线程数。                                                                                                                   │ UInt64 │                         No │           0 │
│ io_thread_pool_queue_size                     │ 10000 │ 10000   │       0 │ IO 线程池的队列大小。                                                                                                                      │ UInt64 │                         No │           0 │
│ max_active_parts_loading_thread_pool_size     │ 64    │ 64      │       0 │ 启动时用于加载活动数据分区集(活动分区)的线程数。                                                                    │ UInt64 │                         No │           0 │
│ max_outdated_parts_loading_thread_pool_size   │ 32    │ 32      │       0 │ 启动时用于加载非活动数据分区集(过时分区)的线程数。                                                                │ UInt64 │                         No │           0 │
│ max_unexpected_parts_loading_thread_pool_size │ 32    │ 32      │       0 │ 启动时用于加载非活动数据分区集(意外分区)的线程数。                                                              │ UInt64 │                         No │           0 │
│ max_parts_cleaning_thread_pool_size           │ 128   │ 128     │       0 │ 用于并发删除非活动数据分区的线程数。                                                                                │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_size               │ 1000  │ 1000    │       0 │ 用于 BACKUP 查询 IO 操作的最大线程数                                                               │ UInt64 │                         No │           0 │
│ max_backups_io_thread_pool_free_size          │ 0     │ 0       │       0 │ 备份 IO 线程池的最大空闲线程数。                                                                                                           │ UInt64 │                         No │           0 │
│ backups_io_thread_pool_queue_size             │ 0     │ 0       │       0 │ 备份 IO 线程池的队列大小。                                                                                                              │ UInt64 │                         No │           0 │
└───────────────────────────────────────────────┴───────┴─────────┴─────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴────────────────────────────┴─────────────┘

```

使用 `WHERE changed` 可以很有用,例如,当您想要检查配置文件中的设置是否已正确加载并正在使用时。

<!-- -->

```sql
SELECT * FROM system.server_settings WHERE changed AND name='max_thread_pool_size'
```

**另请参阅**

- [设置](../../operations/system-tables/settings.md)
- [配置文件](../../operations/configuration-files.md)
- [服务器设置](../../operations/server-configuration-parameters/settings.md)
