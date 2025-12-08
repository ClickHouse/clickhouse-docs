---
description: 'ClickHouse 数据库和表的备份与恢复指南'
sidebar_label: '备份与恢复'
sidebar_position: 10
slug: /operations/backup
title: '备份与恢复'
doc_type: 'guide'
---

# 备份与恢复 {#backup-and-restore}

- [备份到本地磁盘](#backup-to-a-local-disk)
- [配置使用 S3 端点进行备份/恢复](#configuring-backuprestore-to-use-an-s3-endpoint)
- [使用 S3 磁盘进行备份/恢复](#backuprestore-using-an-s3-disk)
- [其他方案](#alternatives)

## 命令概览 {#command-summary}

```bash
 BACKUP|RESTORE
  TABLE [db.]table_name [AS [db.]table_name_in_backup]
    [PARTITION[S] partition_expr [, ...]] |
  DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup] |
  DATABASE database_name [AS database_name_in_backup]
    [EXCEPT TABLES ...] |
  TEMPORARY TABLE table_name [AS table_name_in_backup] |
  VIEW view_name [AS view_name_in_backup] |
  ALL [EXCEPT {TABLES|DATABASES}...] } [, ...]
  [ON CLUSTER 'cluster_name']
  TO|FROM File('<path>/<filename>') | Disk('<disk_name>', '<path>/') | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')
  [SETTINGS base_backup = File('<path>/<filename>') | Disk(...) | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')]
  [SYNC|ASYNC]

```

:::note ALL
在 ClickHouse 23.4 版本之前，`ALL` 仅可用于 `RESTORE` 命令。
:::

## 背景 {#background}

虽然[复制](../engines/table-engines/mergetree-family/replication.md)可以防止硬件故障带来的影响，但它无法防止人为错误：例如误删数据、删除了错误的表或错误集群上的表，以及由于软件缺陷导致的数据处理错误或数据损坏。在许多情况下，这类错误会影响所有副本。ClickHouse 内置了一些保护机制来防止某些类型的错误——例如，默认情况下，[你不能直接删除使用类 MergeTree 引擎且包含超过 50 GB 数据的表](/operations/settings/settings#max_table_size_to_drop)。但是，这些保护机制并不能覆盖所有可能的情况，并且可能被绕过。

为了有效降低人为错误带来的风险，你应当**提前**认真制定数据备份与恢复策略。

每家公司的可用资源和业务需求都不同，因此不存在一种适用于所有场景的 ClickHouse 备份与恢复通用方案。对 1 GB 数据有效的方法，很可能并不适用于数十 PB 的数据。有多种可选方案，各自都有优缺点，后文会进行讨论。建议不要只依赖单一方案，而是结合多种方法，以相互弥补各自的不足。

:::note
请记住，如果你只做了备份却从未尝试过恢复，那么在你真正需要恢复时，它很有可能无法按预期工作（或者至少，其耗时会超过业务可接受的范围）。因此，无论你选择哪种备份方案，都务必同时实现恢复过程的自动化，并在备用的 ClickHouse 集群上定期演练恢复。
:::

## 备份到本地磁盘 {#backup-to-a-local-disk}

### 配置备份目标 {#configure-a-backup-destination}

在下面的示例中，备份目标被指定为 `Disk('backups', '1.zip')`。要准备该目标，请在 `/etc/clickhouse-server/config.d/backup_disk.xml` 中创建一个文件，用于指定备份目标。例如，下面这个文件定义了名为 `backups` 的磁盘，然后将该磁盘添加到 **backups &gt; allowed&#95;disk** 列表中：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
<!--highlight-next-line -->
            <backups>
                <type>local</type>
                <path>/backups/</path>
            </backups>
        </disks>
    </storage_configuration>
<!--highlight-start -->
    <backups>
        <allowed_disk>backups</allowed_disk>
        <allowed_path>/backups/</allowed_path>
    </backups>
<!--highlight-end -->
</clickhouse>
```

### 参数 {#parameters}

备份可以是全量或增量的，并且可以包含表（包括物化视图、投影（projection）和字典）以及数据库。备份可以是同步的（默认）或异步的，可以进行压缩，也可以通过密码进行保护。

`BACKUP` 和 `RESTORE` 语句接收一个由 `DATABASE` 和 `TABLE` 名称、目标（或源）、选项和设置组成的列表：

* 备份的目标，或恢复时的源。它基于前面定义的磁盘。例如 `Disk('backups', 'filename.zip')`
* `ASYNC`：异步备份或恢复
* `PARTITIONS`：要恢复的分区列表
* `SETTINGS`：
  * `id`：备份或恢复操作的标识符。如果未设置或为空，将使用随机生成的 UUID。
    如果显式设置为非空字符串，则每次都应不同。该 `id` 用于在 `system.backups` 表中查找与特定备份或恢复操作相关的行。
  * [`compression_method`](/sql-reference/statements/create/table#column_compression_codec) 和 `compression_level`
  * 磁盘上文件的 `password`
  * `base_backup`：此源上一次备份的目标位置。例如 `Disk('backups', '1.zip')`
  * `use_same_s3_credentials_for_base_backup`：基础备份到 S3 时，是否应从查询继承凭证。仅在使用 `S3` 时有效。
  * `use_same_password_for_base_backup`：基础备份归档是否应从查询继承密码。
  * `structure_only`：如果启用，则仅备份或恢复 `CREATE` 语句，而不包含表数据
  * `storage_policy`：要恢复的表的存储策略。参见 [使用多个块设备进行数据存储](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)。此设置仅适用于 `RESTORE` 命令。指定的存储策略只应用于使用 `MergeTree` 系列引擎的表。
  * `s3_storage_class`：用于 S3 备份的存储类别。例如 `STANDARD`
  * `azure_attempt_to_create_container`：在使用 Azure Blob Storage 时，如果指定的容器不存在，是否尝试创建该容器。默认值：`true`。
  * 这里也可以使用[核心设置](/operations/settings/settings)

### 使用示例 {#usage-examples}

先备份，再恢复一个表：

```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

对应的恢复操作：

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
如果表 `test.table` 中已经包含数据，上面的 RESTORE 将失败。若要测试 RESTORE 操作，你需要先删除该表，或者使用设置 `allow_non_empty_tables=true`：

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

:::

恢复或备份表时，可以使用新名称：

```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### 增量备份 {#incremental-backups}

可以通过指定 `base_backup` 来创建增量备份。
:::note
增量备份依赖于基础备份。必须确保基础备份始终可用，才能从增量备份中完成恢复。
:::

以增量方式存储新数据。将 `base_backup` 进行相应设置后，自上一次备份到 `Disk('backups', 'd.zip')` 以来产生的数据会被存储到 `Disk('backups', 'incremental-a.zip')` 中：

```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

从增量备份和 base&#95;backup 中将所有数据恢复到新表 `test.table2` 中：

```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### 为备份设置密码 {#assign-a-password-to-the-backup}

可以为写入磁盘的备份文件设置密码：

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

恢复：

```sql
RESTORE TABLE test.table
  FROM Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

### 压缩设置 {#compression-settings}

如果需要指定压缩方式或压缩级别：

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

### 恢复特定分区 {#restore-specific-partitions}

如果需要恢复与某个表关联的特定分区，可以单独指定这些分区。要从备份中恢复分区 1 和 4：

```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### 以 tar 归档形式存储备份 {#backups-as-tar-archives}

备份也可以以 tar 归档形式存储。其功能与 zip 相同，但不支持密码。

将备份写成 tar 归档：

```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

对应的恢复操作：

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

要更改压缩方式，需要在备份名称后添加正确的文件后缀。例如，要使用 gzip 压缩 tar 归档：

```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

支持的压缩文件后缀包括 `tar.gz`、`.tgz`、`tar.bz2`、`tar.lzma`、`.tar.zst`、`.tzst` 和 `.tar.xz`。

### 检查备份状态 {#check-the-status-of-backups}

备份命令会返回一个 `id` 和 `status`，该 `id` 可用于获取备份的状态。这对于检查长时间运行的 ASYNC（异步）备份进度非常有用。下面的示例展示了在尝试覆盖已有备份文件时发生的失败情况：

```sql
BACKUP TABLE helloworld.my_first_table TO Disk('backups', '1.zip') ASYNC
```

```response
┌─id───────────────────────────────────┬─status──────────┐
│ 7678b0b3-f519-4e6e-811f-5a0781a4eb52 │ CREATING_BACKUP │
└──────────────────────────────────────┴─────────────────┘

返回 1 行。耗时: 0.001 秒。
```

```sql
SELECT
    *
FROM system.backups
WHERE id='7678b0b3-f519-4e6e-811f-5a0781a4eb52'
FORMAT Vertical
```

```response
第 1 行:
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

返回 1 行。用时:0.002 秒。
```

除了 `system.backups` 表之外，所有备份和恢复操作还会记录在系统日志表 [backup&#95;log](../operations/system-tables/backup_log.md) 中：

```sql
SELECT *
FROM system.backup_log
WHERE id = '7678b0b3-f519-4e6e-811f-5a0781a4eb52'
ORDER BY event_time_microseconds ASC
FORMAT Vertical
```

```response
第 1 行:
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

第 2 行:
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

2 行结果集。用时:0.075 秒。
```

## 配置 BACKUP/RESTORE 以使用 S3 Endpoint {#configuring-backuprestore-to-use-an-s3-endpoint}

要将备份写入 S3 bucket，您需要以下三项信息：

* S3 endpoint，
  例如 `https://mars-doc-test.s3.amazonaws.com/backup-S3/`
* Access key ID，
  例如 `ABC123`
* Secret access key，
  例如 `Abc+123`

:::note
创建 S3 bucket 的步骤已在 [将 S3 对象存储用作 ClickHouse 磁盘](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use) 中说明。保存策略后再回到本文档即可，无需将 ClickHouse 配置为使用该 S3 bucket。
:::

备份的目标位置将按如下方式指定：

```sql
S3('<S3 端点>/<目录>', '<访问密钥 ID>', '<访问密钥密文>')
```

```sql
CREATE TABLE data
(
    `key` Int,
    `value` String,
    `array` Array(String)
)
ENGINE = MergeTree
ORDER BY tuple()
```

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 1000
```

### 创建基础（初始）备份 {#create-a-base-initial-backup}

增量备份需要先有一个*基础*备份作为起点，本示例稍后将作为基础备份使用。S3 目标的第一个参数是 S3 endpoint，后面是本次备份在 bucket 中使用的目录。在本示例中，该目录名为 `my_backup`。

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### 添加更多数据 {#add-more-data}

增量备份会保存基础备份与当前表内容之间的差异。在执行增量备份之前，先向表中添加更多数据：

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```

### 执行增量备份 {#take-an-incremental-backup}

此备份命令与基础备份类似，但额外指定了 `SETTINGS base_backup` 以及基础备份的位置。请注意，增量备份的目标路径与基础备份并非同一目录，而是在同一端点下、存储桶内的另一个目标目录。基础备份位于 `my_backup`，增量备份将写入 `my_incremental`：

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### 从增量备份恢复 {#restore-from-the-incremental-backup}

此命令会将增量备份还原到一个名为 `data3` 的新表中。请注意，当恢复增量备份时，基础备份也会一并包含在内。恢复时只需指定增量备份即可：

```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ 已恢复   │
└──────────────────────────────────────┴──────────┘
```

### 验证计数 {#verify-the-count}

在原始表 `data` 中进行了两次插入操作，一次插入 1,000 行，一次插入 100 行，共计 1,100 行。请验证还原后的表是否有 1,100 行：

```sql
SELECT count()
FROM data3
```

```response
┌─count()─┐
│    1100 │
└─────────┘
```

### 验证内容 {#verify-the-content}

这会将原始表 `data` 的内容与恢复后的表 `data3` 进行比较：

```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'BACKUP/RESTORE 后数据不匹配')
```

## 使用 S3 磁盘执行 BACKUP/RESTORE {#backuprestore-using-an-s3-disk}

也可以通过在 ClickHouse 存储配置中配置一个 S3 磁盘，将数据 `BACKUP`/`RESTORE` 到 S3。在 `/etc/clickhouse-server/config.d` 中添加一个文件，按如下方式配置该磁盘：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3_plain>
                <type>s3_plain</type>
                <endpoint></endpoint>
                <access_key_id></access_key_id>
                <secret_access_key></secret_access_key>
            </s3_plain>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3_plain</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>

    <backups>
        <allowed_disk>s3_plain</allowed_disk>
    </backups>
</clickhouse>
```

然后照常执行 `BACKUP`/`RESTORE`：

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
但请注意：

* 此磁盘不应被用于 `MergeTree` 本身，仅应用于 `BACKUP`/`RESTORE`
* 如果你的表使用 S3 存储作为后端，系统会尝试通过 `CopyObject` 调用在 S3 侧进行服务器端拷贝，使用相应凭证将数据分片复制到目标 bucket。若发生身份验证错误，则会退回为使用缓冲区拷贝的方法（先下载分片再上传），这种方式效率非常低。在这种情况下，你可能需要确保使用目标 bucket 的凭证对源 bucket 拥有 `read` 权限。
  :::

## 使用命名集合 {#using-named-collections}

命名集合可以用于 `BACKUP`/`RESTORE` 参数。示例请参见 [此处](./named-collections.md#named-collections-for-backups)。

## 替代方案 {#alternatives}

ClickHouse 将数据存储在磁盘上，而对磁盘进行备份的方法有很多。下面是一些过去曾经使用过的方案，也有可能非常适合你的环境。

### 在其他位置复制源数据 {#duplicating-source-data-somewhere-else}

通常，摄取到 ClickHouse 的数据是通过某种持久化队列传送过来的，例如 [Apache Kafka](https://kafka.apache.org)。在这种情况下，可以配置额外的一组订阅者，在数据被写入 ClickHouse 的同时读取同一条数据流，并将其存储到某个冷存储中。大多数公司通常已经有默认推荐的冷存储方案，例如对象存储或类似 [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) 这样的分布式文件系统。

### 文件系统快照 {#filesystem-snapshots}

某些本地文件系统提供快照功能（例如 [ZFS](https://en.wikipedia.org/wiki/ZFS)），但它们可能并不是为在线查询提供服务的最佳选择。一种可行的解决方案是使用这种文件系统创建额外副本，并将这些副本从用于 `SELECT` 查询的 [Distributed](../engines/table-engines/special/distributed.md) 表中排除。对这些副本进行快照时，将不会受到任何修改数据的查询影响。额外的好处是，这些副本可以使用具有更多磁盘挂载到单台服务器上的特殊硬件配置，从而更具成本效益。

对于数据量较小的场景，对远程表执行一个简单的 `INSERT INTO ... SELECT ...` 也同样可行。

### 对数据分片的操作 {#manipulations-with-parts}

ClickHouse 允许使用 `ALTER TABLE ... FREEZE PARTITION ...` 查询来创建表分区的本地副本。其实现方式是对 `/var/lib/clickhouse/shadow/` 目录使用硬链接，因此对于旧数据通常不会额外占用磁盘空间。生成的文件副本不会被 ClickHouse 服务器管理，因此可以直接将它们保留在那里：你将获得一个无需任何额外外部系统的简单备份，但这种方式仍然容易受到硬件故障的影响。基于这一原因，更好的做法是将它们远程复制到其他位置，然后再删除本地副本。分布式文件系统和对象存储依然是不错的选择，但容量足够大的普通挂载式文件服务器也同样可行（在这种情况下，传输会通过网络文件系统，或者可能使用 [rsync](https://en.wikipedia.org/wiki/Rsync)）。
可以使用 `ALTER TABLE ... ATTACH PARTITION ...` 从备份中恢复数据。

关于分区操作相关查询的更多信息，请参阅 [ALTER 文档](/sql-reference/statements/alter/partition)。

有一个第三方工具可以用来自动化此方案：[clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)。

## 禁止并发备份/恢复的设置 {#settings-to-disallow-concurrent-backuprestore}

要禁止备份和恢复操作并发执行，可以分别使用以下设置。

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

这两个设置的默认值都是 true，因此默认情况下允许并发执行备份和还原。
当在集群上将这两个设置设为 false 时，集群中同一时间只能运行 1 个备份或还原任务。

## 配置 BACKUP/RESTORE 以使用 AzureBlobStorage 端点 {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

要将备份写入 AzureBlobStorage 容器，您需要以下信息：

* AzureBlobStorage 端点连接字符串 / URL，
* 容器，
* 路径，
* 帐户名称（如果指定了 URL），
* 帐户密钥（如果指定了 URL）

备份目标应按如下方式指定：

```sql
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
```

```sql
BACKUP TABLE data TO AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
RESTORE TABLE data AS data_restored FROM AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
```

## 备份系统表 {#backup-up-system-tables}

系统表也可以纳入备份和恢复流程，但是否包含它们取决于具体使用场景。

### 备份日志表 {#backing-up-log-tables}

存储历史数据的系统表（例如带有 `_log` 后缀的表，如 `query_log`、`part_log`）可以像其他任何表一样进行备份和恢复。如果你的使用场景依赖分析历史数据——例如使用 `query_log` 跟踪查询性能或排查问题——建议在备份策略中包含这些表。相反，如果不需要这些表中的历史数据，则可以将其排除，以节省备份存储空间。

### 备份访问管理表 {#backing-up-access-management-tables}

与访问管理相关的系统表，如 `users`、`roles`、`row_policies`、`settings_profiles` 和 `quotas`，在备份和恢复操作中会被特殊处理。当这些表被包含在备份中时，它们的内容会被导出到一个特殊的 `accessXX.txt` 文件中，该文件封装了用于创建和配置访问实体的等效 SQL 语句。在恢复时，恢复过程会解析这些文件并重新执行其中的 SQL 命令，以重新创建用户、角色和其他配置。

此功能确保 ClickHouse 集群的访问控制配置可以作为集群整体配置的一部分进行备份和恢复。

注意：该功能仅适用于通过 SQL 命令管理的配置（称为 ["SQL-driven Access Control and Account Management"](/operations/access-rights#enabling-access-control)）。在 ClickHouse 服务器配置文件（例如 `users.xml`）中定义的访问配置不会包含在备份中，且无法通过此方法恢复。
