---
description: 'ClickHouse 备份和恢复概览'
sidebar_label: '概览'
slug: /operations/backup/overview
title: 'ClickHouse 的备份和恢复'
doc_type: 'reference'
---

import GenericSettings from '@site/docs/operations_/backup_restore/_snippets/_generic_settings.md';
import Syntax from '@site/docs/operations_/backup_restore/_snippets/_syntax.md';
import AzureSettings from '@site/docs/operations_/backup_restore/_snippets/_azure_settings.md';
import S3Settings from '@site/docs/operations_/backup_restore/_snippets/_s3_settings.md';

> 本节将概述 ClickHouse 中的备份与恢复。若需了解各备份方法的详细说明，请参阅侧边栏中相应备份方法的页面。


## 简介 {#introduction}

虽然[复制](/engines/table-engines/mergetree-family/replication)可以防止硬件故障,但它无法
防止人为错误:意外删除数据、误删
表或删除错误集群上的表,以及导致数据处理错误或数据损坏的软件缺陷。

在许多情况下,此类错误会影响所有副本。ClickHouse 内置了
防护措施来防止某些类型的错误,例如,[默认情况下](/operations/settings/settings#max_table_size_to_drop)
您无法直接删除包含超过 50 GB 数据的 `MergeTree` 系列引擎表。然而,这些防护措施并未涵盖所有可能的情况,
问题仍可能发生。

为了有效减轻可能的人为错误,您应该**提前**仔细准备
数据备份和恢复策略。

每家公司都有不同的可用资源和业务需求,因此
没有适用于所有情况的 ClickHouse 备份和恢复通用解决方案。适用于 1 GB 数据的方法可能不适用于数十 PB 的数据。存在多种可能的方法,各有优缺点,本文档部分将介绍这些方法。建议
使用多种方法而不是仅使用一种方法,以弥补各自的
不足。

:::note
请记住,如果您备份了某些内容但从未尝试恢复,
那么当您真正需要时,恢复很可能无法正常工作(或者至少
需要的时间会超过业务所能容忍的范围)。因此,无论您选择哪种备份
方法,都要确保同时自动化恢复过程,并在备用 ClickHouse 集群上定期
进行演练。
:::

以下页面详细介绍了 ClickHouse 中可用的各种备份和
恢复方法:

| 页面                                                                | 描述                                               |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| [使用本地磁盘或 S3 磁盘进行备份/恢复](./01_local_disk.md)    | 详细介绍与本地磁盘或 S3 磁盘之间的备份/恢复 |
| [使用 S3 端点进行备份/恢复](./02_s3_endpoint.md)             | 详细介绍与 S3 端点之间的备份/恢复          |
| [使用 AzureBlobStorage 进行备份/恢复](./03_azure_blob_storage.md) | 详细介绍与 Azure Blob 存储之间的备份/恢复      |
| [替代方法](./04_alternative_methods.md)                  | 讨论替代备份方法                      |

备份可以:

- 为[完整备份或增量备份](#backup-types)
- 为[同步或异步](#synchronous-vs-asynchronous)
- 为[并发或非并发](#concurrent-vs-non-concurrent)
- 为[压缩或未压缩](#compressed-vs-uncompressed)
- 使用[命名集合](#using-named-collections)
- 受密码保护
- 对[系统表、日志表或访问管理表](#system-backups)进行备份


## 备份类型 {#backup-types}

备份可以是完全备份或增量备份。完全备份是数据的完整副本,而增量备份是相对于上次完全备份的数据增量。

完全备份的优势在于它是一种简单、独立(不依赖其他备份)且可靠的恢复方法。但是,完全备份可能需要较长时间才能完成,并且会占用大量存储空间。相比之下,增量备份在时间和空间方面都更加高效,但恢复数据时需要所有备份都可用。

根据您的需求,可以选择使用:

- **完全备份** 适用于较小的数据库或关键数据。
- **增量备份** 适用于较大的数据库或需要频繁且经济高效地执行备份的场景。
- **两者结合使用**,例如每周执行完全备份,每天执行增量备份。


## 同步与异步备份 {#synchronous-vs-asynchronous}

`BACKUP` 和 `RESTORE` 命令可以标记为 `ASYNC`。在这种情况下,备份命令会立即返回,备份过程在后台运行。如果命令未标记为 `ASYNC`,则备份过程为同步模式,命令将阻塞直至备份完成。


## 并发与非并发备份 {#concurrent-vs-non-concurrent}

默认情况下,ClickHouse 允许并发执行备份和恢复操作。这意味着您可以同时启动多个备份或恢复操作。但是,可以通过服务器级别的设置来禁用此行为。如果将这些设置设为 false,则集群上同一时间只允许运行一个备份或恢复操作。这有助于避免资源争用或操作之间的潜在冲突。

要禁用并发备份/恢复,可以分别使用以下设置:

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

这两个设置的默认值均为 true,因此默认情况下允许并发备份/恢复。当集群上的这些设置为 false 时,集群上同一时间只允许运行一个备份/恢复操作。


## 压缩与非压缩备份 {#compressed-vs-uncompressed}

ClickHouse 备份通过 `compression_method` 和 `compression_level` 设置支持压缩功能。

创建备份时,可以指定:

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```


## 使用命名集合 {#using-named-collections}

命名集合允许您存储键值对(如 S3 凭证、端点和设置),可在备份/恢复操作中重复使用。
它们的作用包括:

- 对非管理员用户隐藏凭证
- 通过集中存储复杂配置简化命令
- 保持操作的一致性
- 避免凭证在查询日志中暴露

有关更多详细信息,请参阅["命名集合"](/operations/named-collections)。


## 备份系统表、日志表或访问管理表 {#system-backups}

系统表也可以纳入您的备份和恢复工作流中,但是否纳入取决于您的具体使用场景。

存储历史数据的系统表,例如带有 `_log` 后缀的表(如 `query_log`、`part_log`),可以像其他表一样进行备份和恢复。如果您的使用场景依赖于分析历史数据——例如,使用 `query_log` 跟踪查询性能或调试问题——建议将这些表纳入您的备份策略中。但是,如果不需要这些表中的历史数据,可以将它们排除以节省备份存储空间。

与访问管理相关的系统表,例如 users、roles、row_policies、settings_profiles 和 quotas,在备份和恢复操作期间会接受特殊处理。当这些表包含在备份中时,它们的内容会被导出到一个特殊的 `accessXX.txt` 文件中,该文件封装了用于创建和配置访问实体的等效 SQL 语句。在恢复时,恢复过程会解析这些文件并重新应用 SQL 命令来重建用户、角色和其他配置。此功能确保 ClickHouse 集群的访问控制配置可以作为集群整体设置的一部分进行备份和恢复。

此功能仅适用于通过 SQL 命令管理的配置(称为["SQL 驱动的访问控制和账户管理"](/operations/access-rights#enabling-access-control))。在 ClickHouse 服务器配置文件(例如 `users.xml`)中定义的访问配置不包含在备份中,也无法通过此方法恢复。


## 通用语法 {#syntax}

<Syntax />

### 命令概览 {#command-summary}

以下详细说明了上述各个命令:

| **命令**                                                            | **说明**                                                                                                                                      |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `BACKUP`                                                               | 创建指定对象的备份                                                                                                                |
| `RESTORE`                                                              | 从备份中恢复对象                                                                                                                       |
| `[ASYNC]`                                                              | 使操作异步运行(立即返回一个可供监控的 ID)                                                              |
| `TABLE [db.]table_name [AS [db.]table_name_in_backup]`                 | 备份/恢复指定表(可重命名)                                                                                                  |
| `[PARTITION[S] partition_expr [,...]]`                                 | 仅备份/恢复表的指定分区                                                                                                 |
| `DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup]`             | 备份/恢复字典对象                                                                                                                |
| `DATABASE database_name [AS database_name_in_backup]`                  | 备份/恢复整个数据库(可重命名)                                                                                                |
| `TEMPORARY TABLE table_name [AS table_name_in_backup]`                 | 备份/恢复临时表(可重命名)                                                                                                 |
| `VIEW view_name [AS view_name_in_backup]`                              | 备份/恢复视图(可重命名)                                                                                                            |
| `[EXCEPT TABLES ...]`                                                  | 备份数据库时排除指定表                                                                                                   |
| `ALL`                                                                  | 备份/恢复所有内容(所有数据库、表等)。在 ClickHouse 23.4 版本之前,`ALL` 仅适用于 `RESTORE` 命令。 |
| `[EXCEPT {TABLES\|DATABASES}...]`                                      | 使用 `ALL` 时排除指定表或数据库                                                                                                |
| `[ON CLUSTER 'cluster_name']`                                          | 在 ClickHouse 集群上执行备份/恢复操作                                                                                               |
| `TO\|FROM`                                                             | 方向:`TO` 表示备份目标,`FROM` 表示恢复源                                                                                    |
| `File('<path>/<filename>')`                                            | 存储到本地文件系统或从本地文件系统恢复                                                                                                              |
| `Disk('<disk_name>', '<path>/')`                                       | 存储到已配置的磁盘或从已配置的磁盘恢复                                                                                                              |
| `S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')` | 存储到 Amazon S3 或 S3 兼容存储或从其恢复                                                                                             |
| `[SETTINGS ...]`                                                       | 完整的设置列表见下文                                                                                                              |     |

### 设置 {#settings}

**通用备份/恢复设置**

<GenericSettings />

**S3 专用设置**

<S3Settings />

**Azure 专用设置**

<AzureSettings />


## 管理和故障排查 {#check-the-status-of-backups}

备份命令会返回 `id` 和 `status`,可以使用该 `id` 来获取备份状态。这对于检查长时间运行的 `ASYNC` 备份进度非常有用。以下示例展示了尝试覆盖现有备份文件时发生的失败情况:

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

除了 [`system.backups`](/operations/system-tables/backups) 表之外,所有备份和恢复操作还会在系统日志表 [`system.backup_log`](/operations/system-tables/backup_log) 中进行跟踪:

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
