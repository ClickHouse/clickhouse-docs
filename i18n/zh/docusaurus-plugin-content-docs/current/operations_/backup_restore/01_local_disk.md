---
description: '详细说明如何在本地磁盘上执行备份和恢复'
sidebar_label: '本地磁盘 / S3 磁盘'
slug: /operations/backup/disk
title: 'ClickHouse 中的备份与恢复'
doc_type: 'guide'
---

import GenericSettings from '@site/docs/operations_/backup_restore/_snippets/_generic_settings.md';
import S3Settings from '@site/docs/operations_/backup_restore/_snippets/_s3_settings.md';
import ExampleSetup from '@site/docs/operations_/backup_restore/_snippets/_example_setup.md';
import Syntax from '@site/docs/operations_/backup_restore/_snippets/_syntax.md';


# 备份/恢复到磁盘 {#backup-to-a-local-disk}


## 语法 {#syntax}

<Syntax />


## 为磁盘配置备份目标 {#configure-backup-destinations-for-disk}

### 为本地磁盘配置备份目标 {#configure-a-backup-destination}

在下面的示例中,您将看到备份目标指定为 `Disk('backups', '1.zip')`。
要使用 `Disk` 备份引擎,需要首先在以下路径添加一个指定备份目标的文件:

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

例如,以下配置定义了一个名为 `backups` 的磁盘,然后将该磁盘添加到 **backups** 的 **allowed_disk** 列表中:

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

### 为 S3 磁盘配置备份目标 {#backuprestore-using-an-s3-disk}

通过在 ClickHouse 存储配置中配置 S3 磁盘,也可以对 S3 执行 `BACKUP`/`RESTORE` 操作。
按照上述本地磁盘的配置方式,向 `/etc/clickhouse-server/config.d` 添加文件来配置该磁盘。

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

S3 磁盘的 `BACKUP`/`RESTORE` 操作与本地磁盘相同:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note

- 此磁盘不应用于 `MergeTree` 本身,仅用于 `BACKUP`/`RESTORE` 操作
- 如果您的表使用 S3 存储且磁盘类型不同,
  系统不会使用 `CopyObject` 调用将数据部分复制到目标存储桶,而是
  先下载再上传,这非常低效。在这种情况下,建议使用
  `BACKUP ... TO S3(<endpoint>)` 语法来处理此场景。
  :::


## 备份/恢复到本地磁盘的使用示例 {#usage-examples}

### 备份和恢复表 {#backup-and-restore-a-table}

<ExampleSetup />

要备份表,可以运行:

```sql title="Query"
BACKUP TABLE test_db.test_table TO Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status─────────┐
1. │ 065a8baf-9db7-4393-9c3f-ba04d1e76bcd │ BACKUP_CREATED │
   └──────────────────────────────────────┴────────────────┘
```

如果表为空,可以使用以下命令从备份中恢复表:

```sql title="Query"
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status───┐
1. │ f29c753f-a7f2-4118-898e-0e4600cd2797 │ RESTORED │
   └──────────────────────────────────────┴──────────┘
```

:::note
如果表 `test.table` 包含数据,上述 `RESTORE` 操作将失败。
设置 `allow_non_empty_tables=true` 允许 `RESTORE TABLE` 将数据插入到非空表中。这会将表中的原有数据与从备份中提取的数据混合在一起。
因此,此设置可能会导致表中的数据重复,应谨慎使用。
:::

要恢复已包含数据的表,请运行:

```sql
RESTORE TABLE test_db.table_table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

表可以使用新名称进行恢复或备份:

```sql
RESTORE TABLE test_db.table_table AS test_db.test_table_renamed FROM Disk('backups', '1.zip')
```

此备份的归档文件具有以下结构:

```text
├── .backup
└── metadata
    └── test_db
        └── test_table.sql
```

<!-- TO DO: 
Explanation here about the backup format. See Issue 24a
https://github.com/ClickHouse/clickhouse-docs/issues/3968
-->

可以使用 zip 以外的格式。有关更多详细信息,请参阅下面的["tar 归档备份"](#backups-as-tar-archives)。

### 增量备份到磁盘 {#incremental-backups}

ClickHouse 中的基础备份是初始的完整备份,后续的增量备份都基于此创建。增量备份仅存储自基础备份以来的更改,因此必须保留基础备份才能从任何增量备份中恢复。可以使用 `base_backup` 设置来指定基础备份的位置。

:::note
增量备份依赖于基础备份。必须保留基础备份才能从增量备份中恢复。
:::

要创建表的增量备份,首先创建基础备份:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'd.zip')
```

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'incremental-a.zip')
SETTINGS base_backup = Disk('backups', 'd.zip')
```

可以使用以下命令将增量备份和基础备份中的所有数据恢复到新表 `test_db.test_table2`:

```sql
RESTORE TABLE test_db.test_table AS test_db.test_table2
FROM Disk('backups', 'incremental-a.zip');
```

### 保护备份 {#assign-a-password-to-the-backup}

写入磁盘的备份可以为文件设置密码。
可以使用 `password` 设置指定密码:

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

要恢复受密码保护的备份,必须再次使用 `password` 设置指定密码:

```sql
RESTORE TABLE test_db.test_table
FROM Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

### tar 归档备份 {#backups-as-tar-archives}

备份不仅可以存储为 zip 归档,还可以存储为 tar 归档。
功能与 zip 相同,但 tar 归档不支持密码保护。此外,tar 归档支持多种压缩方法。

要将表备份为 tar 格式:


```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar')
```

从 tar 归档文件恢复：

```sql
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.tar')
```

要更改压缩方法，应在备份名称后附加正确的文件后缀。例如，要使用 gzip 压缩 tar 归档文件，请运行：

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar.gz')
```

支持的压缩文件后缀包括：

- `tar.gz`
- `.tgz`
- `tar.bz2`
- `tar.lzma`
- `.tar.zst`
- `.tzst`
- `.tar.xz`

### 压缩设置 {#compression-settings}

可以分别使用 `compression_method` 和 `compression_level` 设置来指定压缩方法和压缩级别。

<!-- 待办：
需要更多关于这些设置的信息以及为什么要这样做
-->

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'filename.zip')
SETTINGS compression_method='lzma', compression_level=3
```

### 恢复特定分区 {#restore-specific-partitions}

如果需要恢复与表关联的特定分区，可以指定这些分区。

让我们创建一个简单的分区表，将其分为四个部分，向其中插入一些数据，然后仅备份第一个和第四个分区：

<details>

<summary>设置</summary>

```sql
CREATE IF NOT EXISTS test_db;

-- 创建一个分区表
CREATE TABLE test_db.partitioned (
    id UInt32,
    data String,
    partition_key UInt8
) ENGINE = MergeTree()
PARTITION BY partition_key
ORDER BY id;

INSERT INTO test_db.partitioned VALUES
(1, 'data1', 1),
(2, 'data2', 2),
(3, 'data3', 3),
(4, 'data4', 4);

SELECT count() FROM test_db.partitioned;

SELECT partition_key, count()
FROM test_db.partitioned
GROUP BY partition_key
ORDER BY partition_key;
```

```response
   ┌─count()─┐
1. │       4 │
   └─────────┘
   ┌─partition_key─┬─count()─┐
1. │             1 │       1 │
2. │             2 │       1 │
3. │             3 │       1 │
4. │             4 │       1 │
   └───────────────┴─────────┘
```

</details>

运行以下命令备份分区 1 和 4：

```sql
BACKUP TABLE test_db.partitioned PARTITIONS '1', '4'
TO Disk('backups', 'partitioned.zip')
```

运行以下命令恢复分区 1 和 4：

```sql
RESTORE TABLE test_db.partitioned PARTITIONS '1', '4'
FROM Disk('backups', 'partitioned.zip')
SETTINGS allow_non_empty_tables=true
```
