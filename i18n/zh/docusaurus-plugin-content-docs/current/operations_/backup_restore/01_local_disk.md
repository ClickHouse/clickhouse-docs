---
description: '详细介绍到本地磁盘或从本地磁盘执行备份和恢复'
sidebar_label: '本地磁盘 / S3 磁盘'
slug: /operations/backup/disk
title: 'ClickHouse 中的备份与恢复'
doc_type: 'guide'
---

import GenericSettings from '@site/i18n/zh/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_generic_settings.md';
import S3Settings from '@site/i18n/zh/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_s3_settings.md';
import ExampleSetup from '@site/i18n/zh/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_example_setup.md';
import Syntax from '@site/i18n/zh/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';

# 备份/恢复到磁盘 {#backup-to-a-local-disk}

## 语法 {#syntax}

<Syntax/>

## 为磁盘配置备份目标 {#configure-backup-destinations-for-disk}

### 为本地磁盘配置备份目标 {#configure-a-backup-destination}

在下面的示例中，可以看到备份目标被指定为 `Disk('backups', '1.zip')`。\
要使用 `Disk` 备份引擎，必须先在以下路径添加一个文件，用于指定备份目标：

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

例如，下面的配置定义了一个名为 `backups` 的磁盘，然后将该磁盘添加到 **backups** 的 **allowed&#95;disk** 列表中：

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

也可以通过在 ClickHouse 存储配置中配置 S3 磁盘，实现对 S3 的 `BACKUP`/`RESTORE`。像上文为本地磁盘所做的那样，在 `/etc/clickhouse-server/config.d` 中添加一个文件来配置该磁盘。

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

对 S3 磁盘执行 `BACKUP`/`RESTORE` 的方式与本地磁盘相同：

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note

* 该磁盘不应直接用于 `MergeTree` 本身，只应用于 `BACKUP`/`RESTORE`。
* 如果你的表后端使用的是 S3 存储，并且这些磁盘的类型不同，
  将不会通过 `CopyObject` 调用将数据分片复制到目标 bucket，而是先下载再上传，这非常低效。在这种情况下，建议针对该场景使用
  `BACKUP ... TO S3(&lt;endpoint&gt;)` 语法。
  :::

## 本地磁盘备份/恢复的使用示例 {#usage-examples}

### 备份和恢复单个表 {#backup-and-restore-a-table}

<ExampleSetup />

要备份该表，可以运行：

```sql title="Query"
BACKUP TABLE test_db.test_table TO Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status─────────┐
1. │ 065a8baf-9db7-4393-9c3f-ba04d1e76bcd │ BACKUP_CREATED │
   └──────────────────────────────────────┴────────────────┘
```

如果该表为空，可以使用以下命令从备份中恢复：

```sql title="Query"
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status───┐
1. │ f29c753f-a7f2-4118-898e-0e4600cd2797 │ RESTORED │
   └──────────────────────────────────────┴──────────┘
```

:::note
如果表 `test.table` 中已经包含数据，则上述 `RESTORE` 将会失败。
将设置 `allow_non_empty_tables=true` 可以让 `RESTORE TABLE` 向非空表中插入数据。
这会将表中已有的数据与从备份中恢复的数据混合在一起。
因此，此设置可能导致表中数据重复，应谨慎使用。
:::

要在表中已存在数据的情况下恢复该表，请运行：

```sql
RESTORE TABLE test_db.table_table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

在还原或备份表时，可以为其指定新名称：

```sql
RESTORE TABLE test_db.table_table AS test_db.test_table_renamed FROM Disk('backups', '1.zip')
```

此备份对应的归档文件具有以下结构：

```text
├── .backup
└── metadata
    └── test_db
        └── test_table.sql
```

{/* TO DO: 
  在此补充有关备份格式的说明。参见 Issue 24a
  https://github.com/ClickHouse/clickhouse-docs/issues/3968
  */ }

除了 zip 之外，还可以使用其他格式。有关更多详细信息，请参见下文[“将备份保存为 tar 归档文件”](#backups-as-tar-archives)。

### 磁盘增量备份 {#incremental-backups}

ClickHouse 中的基础备份是用于创建后续增量备份的初始完整备份。增量备份只保存自基础备份之后发生的更改，因此必须保留基础备份，才能从任何增量备份中进行恢复。可以通过设置 `base_backup` 来指定基础备份的目标路径。

:::note
增量备份依赖于基础备份。必须保留基础备份，才能从增量备份中进行恢复。
:::

要对表进行增量备份，首先需要创建一次基础备份：

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'd.zip')
```

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'incremental-a.zip')
SETTINGS base_backup = Disk('backups', 'd.zip')
```

可以使用以下命令，将增量备份和全量备份中的所有数据恢复到新表 `test_db.test_table2` 中：

```sql
RESTORE TABLE test_db.test_table AS test_db.test_table2
FROM Disk('backups', 'incremental-a.zip');
```

### 保护备份 {#assign-a-password-to-the-backup}

备份写入磁盘后，可以为文件设置密码。
可以使用 `password` 配置项来指定密码：

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

要恢复受密码保护的备份，必须再次通过 `password` 设置项指定该密码：

```sql
RESTORE TABLE test_db.test_table
FROM Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

### 以 tar 归档形式存储备份 {#backups-as-tar-archives}

备份不仅可以存储为 zip 归档，还可以存储为 tar 归档。
其功能与 zip 归档相同，只是 tar 归档不支持密码保护。
此外，tar 归档支持多种压缩方式。

要将表备份为 tar 归档：

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar')
```

从 tar 归档文件恢复：

```sql
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.tar')
```

要更改压缩方法，需要在备份名称后添加正确的文件后缀。例如，要使用 gzip 压缩 tar 存档，请运行：

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar.gz')
```

支持的压缩文件后缀有：

* `tar.gz`
* `.tgz`
* `tar.bz2`
* `tar.lzma`
* `.tar.zst`
* `.tzst`
* `.tar.xz`

### 压缩设置 {#compression-settings}

可以分别通过设置 `compression_method` 和 `compression_level` 来指定压缩方法和压缩级别。

{/* 待办事项：
  需要补充这些设置的详细说明，以及在什么情况下你会选择这样配置
  */ }

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'filename.zip')
SETTINGS compression_method='lzma', compression_level=3
```

### 恢复特定分区 {#restore-specific-partitions}

如果需要恢复表中的特定分区，可以显式指定这些分区。

我们先创建一个包含四个分区的简单分区表，向其中插入一些数据，然后
仅对第一个和第四个分区进行备份：

<details>
  <summary>设置</summary>

  ```sql
CREATE IF NOT EXISTS test_db;
       
-- Create a partitioend table
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

运行以下命令以恢复分区 1 和 4：

```sql
RESTORE TABLE test_db.partitioned PARTITIONS '1', '4'
FROM Disk('backups', 'partitioned.zip')
SETTINGS allow_non_empty_tables=true
```
