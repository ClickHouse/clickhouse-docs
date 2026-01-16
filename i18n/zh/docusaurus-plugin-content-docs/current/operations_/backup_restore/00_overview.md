---
description: 'ClickHouse 备份和恢复概览'
sidebar_label: '概览'
slug: /operations/backup/overview
title: 'ClickHouse 中的备份和恢复'
doc_type: 'reference'
---

import GenericSettings from '@site/i18n/zh/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_generic_settings.md';
import Syntax from '@site/i18n/zh/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';
import AzureSettings from '@site/i18n/zh/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_azure_settings.md';
import S3Settings from '@site/i18n/zh/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_s3_settings.md';

> 本节将对 ClickHouse 中的备份和恢复进行总体介绍。若需要了解各备份方法的详细说明，请参阅侧边栏中相应方法的页面。

## 介绍 \\{#introduction\\}

虽然[复制](/engines/table-engines/mergetree-family/replication)可以防止硬件故障，但它无法
防止人为错误：例如误删数据、删除了错误的表，或者删除了错误集群上的表，以及软件缺陷导致的数据处理不正确或数据损坏。

在很多情况下，这类错误会影响所有副本。ClickHouse 内置了一些保护机制来防止某些类型的错误，例如，在[默认](/operations/settings/settings#max_table_size_to_drop)情
况下，你不能直接删除使用 `MergeTree` 系列表引擎且包含超过 50 GB 数据的表。然而，这些保护机制并不能覆盖所有可能的情况，问题仍然可能发生。

为了有效降低人为错误带来的影响，你应当在**事前**认真规划数据备份与恢复策略。

每家公司的可用资源和业务需求都不同，因此不存在一种通用的 ClickHouse 备份与恢复方案可以适用于所有场景。对 1 GB 数据有效的方法，很可能并不适用于数十 PB 的数据。本节文档介绍了多种可选方案及其优缺点。一个好的做法是组合使用多种方案，而不是只依赖单一方案，以此弥补各自的不足。

:::note
请记住，如果你只做过备份，却从未尝试恢复，那么在真正需要恢复时，很有可能恢复过程无法正常工作（或者至少会比业务可接受的时间长得多）。因此，无论选择哪种备份方案，都务必要同时实现恢复过程的自动化，并定期在备用的 ClickHouse 集群上进行恢复演练。
:::

以下页面详细介绍了 ClickHouse 中可用的各种备份与恢复方法：

| 页面                                                                | 说明                                                     |
|---------------------------------------------------------------------|----------------------------------------------------------|
| [使用本地磁盘或 S3 磁盘进行备份/恢复](./01_local_disk.md)          | 详细说明使用本地磁盘或 S3 磁盘进行备份/恢复的方法        |
| [使用 S3 endpoint 进行备份/恢复](./02_s3_endpoint.md)              | 详细说明使用 S3 endpoint 进行备份/恢复的方法             |
| [使用 AzureBlobStorage 进行备份/恢复](./03_azure_blob_storage.md)  | 详细说明使用 Azure Blob 存储进行备份/恢复的方法          |
| [替代方法](./04_alternative_methods.md)                             | 讨论其他备份替代方法                                     |        

备份可以：
- 是[完整或增量](#backup-types)
- 是[同步或异步](#synchronous-vs-asynchronous)
- 是[并发或非并发](#concurrent-vs-non-concurrent)
- 是[压缩或未压缩](#compressed-vs-uncompressed)
- 使用[命名集合](#using-named-collections)
- 进行密码保护
- 针对[系统表、日志表或访问管理表](#system-backups)进行备份

## 备份类型 \\{#backup-types\\}

备份可以分为全量备份和增量备份。全量备份是数据的完整副本，而增量备份则是相对于上一次全量备份的数据变更（差异）部分。

全量备份的优点是简单、独立（不依赖其他备份），并且是一种可靠的恢复方式。但它可能需要较长的完成时间，并占用大量存储空间。相比之下，增量备份在时间和空间占用方面都更加高效，但在恢复数据时需要所有相关备份都可用。

根据您的需求，可以考虑：
- 对于较小的数据库或关键数据，使用 **全量备份**。
- 对于较大的数据库，或需要频繁且具成本效益地执行备份的场景，使用 **增量备份**。
- **两者结合使用**，例如每周进行全量备份，每天进行增量备份。

## 同步备份与异步备份 \\{#synchronous-vs-asynchronous\\}

`BACKUP` 和 `RESTORE` 命令也可以标记为 `ASYNC`。在这种情况下，
备份命令会立即返回，备份过程在后台运行。
如果命令未标记为 `ASYNC`，则备份过程是同步的，
命令会阻塞直到备份完成。

## 并发与非并发备份 \\{#concurrent-vs-non-concurrent\\}

默认情况下，ClickHouse 允许并发执行备份与恢复操作。这意味着可以同时发起多个备份或恢复操作。不过，
也可以通过服务器级别的设置来禁用这种行为。如果将这些设置设为 false，则在任意时刻
集群上只允许运行一个备份或恢复操作。这有助于避免资源争用或操作之间的潜在冲突。

要禁止备份/恢复并发执行，可以分别使用如下设置：

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

这两个设置的默认值都是 true，因此默认情况下允许并发执行备份/恢复操作。 当在集群上将这些设置设为 false 时，任意时刻该集群上只允许运行一个备份或恢复操作。

## 压缩备份与未压缩备份 \\{#compressed-vs-uncompressed\\}

ClickHouse 备份通过 `compression_method` 和 `compression_level` 设置来支持压缩。

在创建备份时，可以指定：

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

## 使用命名集合 \\{#using-named-collections\\}

命名集合允许你存储键值对（例如 S3 凭证、端点和设置），并在备份/恢复等操作中重复使用。
它们有助于：

- 对没有管理员权限的用户隐藏凭证
- 通过集中存储复杂配置来简化命令
- 在各类操作之间保持一致性
- 避免在查询日志中暴露凭证

有关更多详细信息，请参阅[“命名集合”](/operations/named-collections)。

## 备份系统、日志或访问管理表 \\{#system-backups\\}

系统表也可以包含在你的备份和恢复工作流中，但是否包含取决于你的具体使用场景。

存储历史数据的系统表（例如以 `_log` 结尾的表，如 `query_log`、`part_log`）可以像其他任意表一样进行备份和恢复。  
如果你的使用场景依赖于分析历史数据——例如使用 `query_log` 跟踪查询性能或排查问题——建议将这些表纳入备份策略中。  
但是，如果不需要这些表中的历史数据，则可以将其排除，以节省备份存储空间。

与访问管理相关的系统表，例如 `users`、`roles`、`row_policies`、`settings_profiles` 和 `quotas`，在备份和恢复操作期间会被特殊处理。  
当这些表被包含在备份中时，其内容会导出到一个特殊的 `accessXX.txt` 文件中，该文件封装了用于创建和配置访问实体的等效 SQL 语句。  
在恢复时，恢复过程会解析这些文件，并重新执行 SQL 命令以重新创建用户、角色和其他配置。  
此功能确保 ClickHouse 集群的访问控制配置可以作为集群整体配置的一部分进行备份和恢复。

此功能仅适用于通过 SQL 命令管理的配置（称为 ["SQL-driven Access Control and Account Management"](/operations/access-rights#enabling-access-control)）。  
在 ClickHouse 服务器配置文件中定义的访问配置（例如 `users.xml`）不会包含在备份中，也无法通过此方法恢复。

## 通用语法 \\{#syntax\\}

<Syntax/>

### 命令摘要 \\{#command-summary\\}

上述每个命令的详细说明如下：

| **命令**                                                               | **说明**                                                                                                                                             |
|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `BACKUP`                                                               | 创建指定对象的备份                                                                                                                                    |
| `RESTORE`                                                              | 从备份中恢复对象                                                                                                                                     |
| `[ASYNC]`                                                              | 使操作异步执行（立即返回一个可用于监控的 ID）                                                                                                        |
| `TABLE [db.]table_name [AS [db.]table_name_in_backup]`                 | 备份/恢复某个特定表（可重命名）                                                                                                                      |
| `[PARTITION[S] partition_expr [,...]]`                                 | 仅备份/恢复表中的指定分区                                                                                                                            |
| `DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup]`             | 备份/恢复字典对象                                                                                                                                    |
| `DATABASE database_name [AS database_name_in_backup]`                  | 备份/恢复整个数据库（可重命名）                                                                                                                      |
| `TEMPORARY TABLE table_name [AS table_name_in_backup]`                 | 备份/恢复临时表（可重命名）                                                                                                                          |
| `VIEW view_name [AS view_name_in_backup]`                              | 备份/恢复视图（可重命名）                                                                                                                            |
| `[EXCEPT TABLES ...]`                                                  | 在备份数据库时排除指定的表                                                                                                                           |
| `ALL`                                                                  | 备份/恢复全部内容（所有数据库、表等）。在 ClickHouse 23.4 版本之前，`ALL` 仅适用于 `RESTORE` 命令。                                                  |
| `[EXCEPT {TABLES\|DATABASES}...]`                                      | 在使用 `ALL` 时排除指定的表或数据库                                                                                                                  |
| `[ON CLUSTER 'cluster_name']`                                          | 在 ClickHouse 集群范围内执行备份/恢复                                                                                                                |
| `TO\|FROM`                                                             | 方向：`TO` 表示备份目标，`FROM` 表示恢复来源                                                                                                         |
| `File('<path>/<filename>')`                                            | 存储到本地文件系统 / 从本地文件系统恢复                                                                                                             |
| `Disk('<disk_name>', '<path>/')`                                       | 存储到已配置的磁盘 / 从已配置的磁盘恢复                                                                                                             |
| `S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')` | 存储到 Amazon S3 或 S3 兼容存储 / 从中恢复                                                                                                           |
| `[SETTINGS ...]`                                                       | 完整的设置列表见下文                                                                                                                                 |
|                                                                        |                                                                                                                                                      |

### 设置 \\{#settings\\}

**通用备份/恢复设置**

<GenericSettings/>

**S3 特定设置**

<S3Settings/>

**Azure 特定设置**

<AzureSettings/>

## 管理与故障排查 \\{#check-the-status-of-backups\\}

备份命令会返回一个 `id` 和 `status`，可以使用该 `id` 来
查询备份状态。这对于检查耗时较长的 `ASYNC` 备份进度非常有用。下面的示例展示了在尝试
覆盖现有备份文件时出现的失败示例：

```sql
BACKUP TABLE helloworld.my_first_table TO Disk('backups', '1.zip') ASYNC
```

```response
┌─id───────────────────────────────────┬─status──────────┐
│ 7678b0b3-f519-4e6e-811f-5a0781a4eb52 │ CREATING_BACKUP │
└──────────────────────────────────────┴─────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

```sql
SELECT
*
FROM system.backups
WHERE id='7678b0b3-f519-4e6e-811f-5a0781a4eb52'
FORMAT Vertical
```

```response
Row 1:
──────
id:                7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:              Disk('backups', '1.zip')
#highlight-next-line
status:            BACKUP_FAILED
num_files:         0
uncompressed_size: 0
compressed_size:   0
#highlight-next-line
error:             Code: 598. DB::Exception: Backup Disk('backups', '1.zip') already exists. (BACKUP_ALREADY_EXISTS) (version 22.8.2.11 (official build))
start_time:        2022-08-30 09:21:46
end_time:          2022-08-30 09:21:46

1 row in set. Elapsed: 0.002 sec.
```

除了 [`system.backups`](/operations/system-tables/backups) 表之外，所有备份和恢复操作同样会记录在系统日志表 [`system.backup_log`](/operations/system-tables/backup_log) 中：

```sql
SELECT *
FROM system.backup_log
WHERE id = '7678b0b3-f519-4e6e-811f-5a0781a4eb52'
ORDER BY event_time_microseconds ASC
FORMAT Vertical
```

```response
Row 1:
──────
event_date:              2023-08-18
event_time_microseconds: 2023-08-18 11:13:43.097414
id:                      7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:                    Disk('backups', '1.zip')
status:                  CREATING_BACKUP
error:
start_time:              2023-08-18 11:13:43
end_time:                1970-01-01 03:00:00
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

Row 2:
──────
event_date:              2023-08-18
event_time_microseconds: 2023-08-18 11:13:43.174782
id:                      7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:                    Disk('backups', '1.zip')
status:                  BACKUP_FAILED
#highlight-next-line
error:                   Code: 598. DB::Exception: Backup Disk('backups', '1.zip') already exists. (BACKUP_ALREADY_EXISTS) (version 23.8.1.1)
start_time:              2023-08-18 11:13:43
end_time:                2023-08-18 11:13:43
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

2 rows in set. Elapsed: 0.075 sec.
```
