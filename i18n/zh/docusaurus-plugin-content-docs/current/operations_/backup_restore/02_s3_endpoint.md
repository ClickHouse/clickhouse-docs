---
description: 'ClickHouse 备份与恢复概览'
sidebar_label: 'S3 端点'
slug: /operations/backup/s3_endpoint
title: '通过 S3 端点进行备份与恢复'
doc_type: 'guide'
---

import Syntax from '@site/i18n/zh/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';


# 使用 S3 端点进行备份 / 恢复 {#backup-to-a-local-disk}

本文介绍如何通过 S3 端点将数据备份到 S3 存储桶，或从 S3 存储桶恢复备份。



## 语法 {#syntax}

<Syntax/>



## 使用示例 {#usage-examples}

### 增量备份到 S3 端点 {#incremental-backup-to-an-s3-endpoint}

在此示例中，我们将创建一个备份到 S3 端点，然后再次从中恢复。

:::note
有关完整备份与增量备份之间差异的说明，请参阅 ["备份类型"](/operations/backup/overview/#backup-types)
:::

使用此方法需要以下信息：

| 参数             | 示例                                                         |
| ---------------- | ------------------------------------------------------------ |
| S3 端点          | `https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/` |
| 访问密钥 ID      | `BKIOZLE2VYN3VXXTP9RC`                                       |
| 秘密访问密钥     | `40bwYnbqN7xU8bVePaUCh3+YEyGXu8UOMV9ANpwL`                   |

:::tip
创建 S3 存储桶的说明请参阅部分 ["将 S3 对象存储用作 ClickHouse 磁盘"](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use)
:::

备份的目标指定为：

```sql
S3('<s3 endpoint>/<directory>', '<access key id>', '<secret access key>', '<extra_credentials>')
```

<br/>
<VerticalStepper headerLevel="h4">

#### 设置 {#create-a-table}

创建以下数据库和表，并向其中插入一些随机数据：

```sql
CREATE DATABASE IF NOT EXISTS test_db;
CREATE TABLE test_db.test_table
(
    `key` Int,
    `value` String,
    `array` Array(String)
)
ENGINE = MergeTree
ORDER BY tuple()
```

```sql
INSERT INTO test_db.test_table SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 1000
```

#### 创建基础备份 {#create-a-base-initial-backup}

增量备份需要一个 _基础_ 备份作为起点。S3 目标的第一个参数是 S3 端点，后跟存储桶中用于此备份的目录。在此示例中，该目录名为 `my_backup`。

运行以下命令创建基础备份：

```sql
BACKUP TABLE test_db.test_table TO S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/base_backup',
'<access key id>',
'<secret access key>'
)
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

#### 添加更多数据 {#add-more-data}

增量备份包含基础备份与正在备份表当前内容之间的差异。在执行增量备份之前添加更多数据：

```sql
INSERT INTO test_db.test_table SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```

#### 执行增量备份 {#take-an-incremental-backup}

此备份命令类似于基础备份，但添加了 `SETTINGS base_backup` 和基础备份的位置。请注意，增量备份的目标不是基础备份的同一目录，而是同一端点下存储桶内的不同目标目录。基础备份位于 `my_backup`，增量备份将写入 `my_incremental`：

```sql
BACKUP TABLE test_db.test_table TO S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/incremental_backup',
'<access key id>',
'<secret access key>'
)
SETTINGS base_backup = S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/base_backup',
'<access key id>',
'<secret access key>'
)
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

#### 从增量备份恢复 {#restore-from-the-incremental-backup}

此命令将增量备份恢复到新表 `test_table_restored` 中。  
请注意，恢复增量备份时，基础备份也会被包含。
恢复时仅需指定 **增量备份**：


```sql
RESTORE TABLE data AS test_db.test_table_restored FROM S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/incremental_backup',
'<access key id>',
'<secret access key>'
)
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

#### 验证行数 {#verify-the-count}

对原始表 `data` 执行了两次插入操作，一次包含 1,000 行，一次包含 100 行，共计 1,100 行。
验证恢复后的表中是否有 1,100 行：

```sql
SELECT count()
FROM test_db.test_table_restored
```

```response
┌─count()─┐
│    1100 │
└─────────┘
```

#### 验证内容 {#verify-the-content}

此操作将原始表 `test_table` 的内容与恢复后的表 `test_table_restored` 进行比较：

```sql
SELECT throwIf((
   SELECT groupArray(tuple(*))
   FROM test_db.test_table
   ) != (
   SELECT groupArray(tuple(*))
   FROM test_db.test_table_restored
), 'BACKUP/RESTORE 之后数据不一致')
```

</VerticalStepper>
