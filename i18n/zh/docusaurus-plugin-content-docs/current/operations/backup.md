---
'description': '关于备份和恢复 ClickHouse 数据库和表的指南'
'sidebar_label': '备份和恢复'
'sidebar_position': 10
'slug': '/operations/backup'
'title': '备份和恢复'
---


# 备份和恢复

- [备份到本地磁盘](#backup-to-a-local-disk)
- [配置备份/恢复以使用 S3 端点](#configuring-backuprestore-to-use-an-s3-endpoint)
- [使用 S3 磁盘进行备份/恢复](#backuprestore-using-an-s3-disk)
- [替代方案](#alternatives)

## 命令摘要 {#command-summary}

```bash
BACKUP|RESTORE
 TABLE [db.]table_name [AS [db.]table_name_in_backup]
   [PARTITION[S] partition_expr [,...]] |
 DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup] |
 DATABASE database_name [AS database_name_in_backup]
   [EXCEPT TABLES ...] |
 TEMPORARY TABLE table_name [AS table_name_in_backup] |
 VIEW view_name [AS view_name_in_backup] |
 ALL [EXCEPT {TABLES|DATABASES}...] } [,...]
 [ON CLUSTER 'cluster_name']
 TO|FROM File('<path>/<filename>') | Disk('<disk_name>', '<path>/') | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')
 [SETTINGS base_backup = File('<path>/<filename>') | Disk(...) | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')]

```

:::note ALL
在 ClickHouse 的 23.4 版本之前，`ALL` 只能适用于 `RESTORE` 命令。
:::

## 背景 {#background}

虽然 [复制](../engines/table-engines/mergetree-family/replication.md) 提供了硬件故障的保护，但并不能防止人为错误：意外删除数据、删除错误的表或在错误的集群上删除表，以及导致数据处理不正确或数据损坏的软件漏洞。在许多情况下，这类错误会影响所有副本。ClickHouse 内置了防止某些类型错误的保障措施——例如，默认情况下 [你无法仅删除包含超过 50 Gb 数据的 MergeTree 类引擎的表](/operations/settings/settings#max_table_size_to_drop)。然而，这些保障措施并不涵盖所有可能的情况，并且可能会被绕过。

为了有效减轻可能的人为错误，你应该提前仔细准备备份和恢复数据的策略。

每个公司可用的资源和业务需求不同，因此没有适用于所有情况的 ClickHouse 备份和恢复的通用解决方案。对一千兆数据有效的解决方案，可能不适用于数十个拍字节的数据。存在多种可能的方法，各自有优缺点，下面将进行讨论。使用几种方法而不仅仅是一种，来补偿它们的各种缺点是一个好主意。

:::note
请记住，如果你备份了什么东西但从未尝试恢复，那么当你实际需要时，恢复可能无法正常工作（或者至少会比企业可容忍的时间更长）。因此，无论你选择哪种备份方法，请确保也自动化恢复过程，并定期在备用的 ClickHouse 集群上进行练习。
:::

## 备份到本地磁盘 {#backup-to-a-local-disk}

### 配置备份目标 {#configure-a-backup-destination}

在下面的示例中，你将看到备份目标指定为 `Disk('backups', '1.zip')`。为了准备目标，在 `/etc/clickhouse-server/config.d/backup_disk.xml` 中添加一个文件，指定备份目标。例如，该文件定义了名为 `backups` 的磁盘，然后将该磁盘添加到 **backups > allowed_disk** 列表中：

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

备份可以是完整的或增量的，可以包含表（包括物化视图、投影和字典）和数据库。备份可以是同步的（默认）或异步的。可以压缩备份。备份可以设有密码保护。

BACKUP 和 RESTORE 语句接受数据库和表名称的列表、一个目标（或源）、选项和设置：
- 备份的目标，或恢复的源。这基于之前定义的磁盘。例如 `Disk('backups', 'filename.zip')`
- ASYNC：异步备份或恢复
- PARTITIONS：要恢复的分区列表
- SETTINGS：
    - `id`：备份或恢复操作的 id，随机生成 UUID，若未手动指定则使用。若已有同一 `id` 的操作在运行，则抛出异常。
    - [`compression_method`](/sql-reference/statements/create/table#column_compression_codec) 和 compression_level
    - `password` 用于磁盘上的文件
    - `base_backup`：此源的前一个备份的目标。例如，`Disk('backups', '1.zip')`
    - `use_same_s3_credentials_for_base_backup`：基础备份是否应从查询中继承凭据。仅对 `S3` 有效。
    - `use_same_password_for_base_backup`：基础备份存档是否应从查询中继承密码。
    - `structure_only`：如果启用，仅允许备份或恢复 CREATE 语句，而不包括表的数据
    - `storage_policy`：恢复表的存储策略。请参见 [使用多个块设备进行数据存储](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)。此设置仅适用于 `RESTORE` 命令。所指定的存储策略仅适用于来自 `MergeTree` 家族的引擎的表。
    - `s3_storage_class`：用于 S3 备份的存储类。例如，`STANDARD`
    - `azure_attempt_to_create_container`：使用 Azure Blob Storage 时，指定的容器在不存在时是否尝试创建。默认值：true。
    - [核心设置](/operations/settings/settings) 也可在此处使用

### 使用示例 {#usage-examples}

备份并恢复一个表：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

相应的恢复：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
如果表 `test.table` 包含数据，上述 RESTORE 将失败，你必须先删除该表才能测试 RESTORE，或者使用设置 `allow_non_empty_tables=true`：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```
:::

表可以以新名称恢复或备份：
```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### 增量备份 {#incremental-backups}

通过指定 `base_backup` 可以进行增量备份。
:::note
增量备份依赖于基础备份。基础备份必须保持可用，以便能够从增量备份中恢复。
:::

增量存储新数据。设置 `base_backup` 会导致自上一个备份起的数据存储到 `Disk('backups', 'incremental-a.zip')`：
```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

从增量备份和 base_backup 恢复所有数据到新表 `test.table2`：
```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### 为备份分配密码 {#assign-a-password-to-the-backup}

写入磁盘的备份可以对文件应用密码：
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

如果你想指定压缩方法或级别：
```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

### 恢复特定分区 {#restore-specific-partitions}
如果需要恢复与表相关的特定分区，可以指定这些分区。要从备份恢复分区 1 和 4：
```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### 将备份作为 tar 存档 {#backups-as-tar-archives}

备份也可以存储为 tar 存档。其功能与 zip 相同，只是不支持密码。

将备份写入 tar：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

相应的恢复：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

要更改压缩方法，应将正确的文件后缀附加到备份名称。即要用 gzip 压缩 tar 存档：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

支持的压缩文件后缀为 `tar.gz`、`.tgz`、`tar.bz2`、`tar.lzma`、`.tar.zst`、`.tzst` 和 `.tar.xz`。

### 检查备份状态 {#check-the-status-of-backups}

备份命令返回一个 `id` 和 `status`，并且该 `id` 可用于获取备份的状态。这对于检查长时间 ASYNC 备份的进度非常有用。下面的示例显示在尝试覆盖已有备份文件时发生的失败：
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
where id='7678b0b3-f519-4e6e-811f-5a0781a4eb52'
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

与 `system.backups` 表一起，所有备份和恢复操作也在系统日志表 [backup_log](../operations/system-tables/backup_log.md) 中跟踪：
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

## 配置备份/恢复以使用 S3 端点 {#configuring-backuprestore-to-use-an-s3-endpoint}

要将备份写入 S3 存储桶，你需要三种信息：
- S3 端点，
  例如 `https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- 访问密钥 ID，
  例如 `ABC123`
- 秘密访问密钥，
  例如 `Abc+123`

:::note
创建 S3 存储桶的过程请参见 [将 S3 对象存储用作 ClickHouse 磁盘](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use)，保存策略后再返回此文档，无需配置 ClickHouse 以使用 S3 存储桶。
:::

备份的目标将如下指定：

```sql
S3('<S3 endpoint>/<directory>', '<Access key ID>', '<Secret access key>')
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

增量备份需要一个基础备份来开始，本示例将稍后用作基础备份。S3 目标的第一个参数是 S3 端点，后面是用于此备份的桶内目录。在本例中，目录名为 `my_backup`。

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### 添加更多数据 {#add-more-data}

增量备份是基于基础备份和当前内容之间的差异填充的。在进行增量备份之前，添加更多数据：

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```
### 进行增量备份 {#take-an-incremental-backup}

此备份命令类似于基础备份，但添加了 `SETTINGS base_backup` 和基础备份的位置。请注意，增量备份的目标不是与基础相同的目录，而是同一端点下不同的目标目录。基础备份在 `my_backup`，增量将写入 `my_incremental`：
```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```
### 从增量备份中恢复 {#restore-from-the-incremental-backup}

此命令将增量备份恢复到新表 `data3`。请注意，当恢复增量备份时，基础备份也包含在内。恢复时仅指定增量备份：
```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### 验证计数 {#verify-the-count}

原始表 `data` 中有两次插入，一次为 1,000 行，一次为 100 行，总共 1,100。验证恢复的表有 1,100 行：
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
这将比较原始表 `data` 与恢复的表 `data3` 的内容：
```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'Data does not match after BACKUP/RESTORE')
```
## 使用 S3 磁盘进行备份/恢复 {#backuprestore-using-an-s3-disk}

也可以通过在 ClickHouse 存储配置中配置 S3 磁盘来 `BACKUP`/`RESTORE` 到 S3。通过在 `/etc/clickhouse-server/config.d` 中添加一个文件来配置磁盘：

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

然后像往常一样进行 `BACKUP`/`RESTORE`：

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
但请记住：
- 该磁盘不应用于 `MergeTree` 本身，仅用于 `BACKUP`/`RESTORE`
- 如果你的表由 S3 存储支持且磁盘类型不同，则它不会使用 `CopyObject` 调用将部分复制到目标存储桶，而是下载并上传，这非常低效。对于这种用例，最好使用 `BACKUP ... TO S3(<endpoint>)` 语法。
:::

## 使用命名集合 {#using-named-collections}

命名集合可以用于 `BACKUP/RESTORE` 参数。示例请见 [这里](./named-collections.md#named-collections-for-backups)。

## 替代方案 {#alternatives}

ClickHouse 在磁盘上存储数据，有许多方法可以备份磁盘。这些是在过去使用的一些替代方案，可能适合你的环境。

### 在其他地方复制源数据 {#duplicating-source-data-somewhere-else}

通常，导入 ClickHouse 的数据是通过某种持久队列传递的，比如 [Apache Kafka](https://kafka.apache.org)。在这种情况下，可以配置一个额外的订阅者集合，这些订阅者将读取相同的数据流，同时在写入 ClickHouse 的时候将其存储在其他冷存储中。大多数公司已经有一些推荐的冷存储，可能是对象存储或 [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) 这样的分布式文件系统。

### 文件系统快照 {#filesystem-snapshots}

一些本地文件系统提供快照功能（例如，[ZFS](https://en.wikipedia.org/wiki/ZFS)），但它们可能不是服务实时查询的最佳选择。一个可能的解决方案是使用这种文件系统创建附加副本，并将其排除在用于 `SELECT` 查询的 [Distributed](../engines/table-engines/special/distributed.md) 表之外。此类副本上的快照将无法被任何修改数据的查询访问。作为额外好处，这些副本可能具有额外的硬件配置，每个服务器连接更多磁盘，从而具有成本效益。

对于较小的数据量，简单的 `INSERT INTO ... SELECT ...` 到远程表也可能有效。

### 处理分区 {#manipulations-with-parts}

ClickHouse 允许使用 `ALTER TABLE ... FREEZE PARTITION ...` 查询创建表分区的本地副本。这是通过对 `/var/lib/clickhouse/shadow/` 文件夹的硬链接实现的，因此通常不会为旧数据占用额外的磁盘空间。创建的文件副本不由 ClickHouse 服务器处理，因此你可以将它们留在那里：你将会有一个简单的备份，无需任何额外的外部系统，但它仍然容易受到硬件问题的影响。出于这个原因，最好将它们远程复制到另一个位置，然后删除本地副本。分布式文件系统和对象存储仍然是不错的选择，但正常的附加文件服务器只要容量足够也可能有效（在这种情况下，传输将通过网络文件系统或[rsync](https://en.wikipedia.org/wiki/Rsync) 进行）。
可以通过 `ALTER TABLE ... ATTACH PARTITION ...` 从备份中恢复数据

有关与分区操作相关的查询的更多信息，请参见 [ALTER 文档](/sql-reference/statements/alter/partition)。

有一个第三方工具可用于自动化此方法：[clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)。

## 设置以禁止并发备份/恢复 {#settings-to-disallow-concurrent-backuprestore}

要禁止并发备份/恢复，可以分别使用以下设置。

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

默认情况下，这两个的值为 true，因此默认允许并发备份/恢复。
当这些设置在集群上为false时，同一时间，仅允许在集群上运行1个备份/恢复。

## 配置备份/恢复以使用 AzureBlobStorage 端点 {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

要将备份写入 AzureBlobStorage 容器，你需要以下信息：
- AzureBlobStorage 端点连接字符串 / URL，
- 容器，
- 路径，
- 账户名称（如果指定 URL）
- 账户密钥（如果指定 URL）

备份的目标将如下指定：

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

系统表也可以包含在你的备份和恢复工作流中，但其包含取决于具体用例。

### 备份日志表 {#backing-up-log-tables}

存储历史数据的系统表，例如带有 _log 后缀的那些（例如，`query_log`、`part_log`），可以像任何其他表一样备份和恢复。如果你的用例依赖于分析历史数据，例如，使用 query_log 跟踪查询性能或调试问题，建议在备份策略中包括这些表。然而，如果不需要这些表的历史数据，可以排除它们以节省备份存储空间。

### 备份访问管理表 {#backing-up-access-management-tables}

与访问管理相关的系统表，如用户、角色、行策略、设置配置文件和配额，在备份和恢复操作中会受到特别处理。当这些表包含在备份中时，它们的内容会导出到一个特殊的 `accessXX.txt` 文件中，该文件封装了创建和配置访问实体的等效 SQL 语句。在恢复时，恢复过程会解释这些文件并重新应用 SQL 命令以重建用户、角色和其他配置。

此功能确保 ClickHouse 集群的访问控制配置可以作为集群整体设置的一部分进行备份和恢复。

注意：此功能仅适用于通过 SQL 命令管理的配置（称为 ["SQL驱动的访问控制和帐户管理"](/operations/access-rights#enabling-access-control)）。在 ClickHouse 服务器配置文件中定义的访问配置（例如 `users.xml`）不包括在备份中，并且无法通过此方法恢复。
