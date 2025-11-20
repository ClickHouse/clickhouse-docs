---
description: 'ClickHouse 备份与恢复概览'
sidebar_label: 'S3 端点'
slug: /operations/backup/s3_endpoint
title: '在 S3 端点上进行备份与恢复'
doc_type: 'guide'
---

import Syntax from '@site/docs/operations_/backup_restore/_snippets/_syntax.md';


# 通过 S3 端点进行备份/恢复 {#backup-to-a-local-disk}

本文介绍如何通过 S3 端点将数据备份到 S3 存储桶或从 S3 存储桶恢复数据。


## 语法 {#syntax}

<Syntax />


## 使用示例 {#usage-examples}

### 增量备份到 S3 端点 {#incremental-backup-to-an-s3-endpoint}

在本示例中,我们将创建一个备份到 S3 端点,然后从中恢复数据。

:::note
有关完整备份和增量备份之间差异的说明,请参阅["备份类型"](/operations/backup/overview/#backup-types)
:::

使用此方法需要以下信息:

| 参数              | 示例                                                         |
| ----------------- | ------------------------------------------------------------ |
| S3 端点           | `https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/` |
| 访问密钥 ID       | `BKIOZLE2VYN3VXXTP9RC`                                       |
| 秘密访问密钥      | `40bwYnbqN7xU8bVePaUCh3+YEyGXu8UOMV9ANpwL`                   |

:::tip
创建 S3 存储桶的相关内容请参阅["将 S3 对象存储用作 ClickHouse 磁盘"](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use)章节
:::

备份目标位置的指定格式如下:

```sql
S3('<s3 endpoint>/<directory>', '<access key id>', '<secret access key>', '<extra_credentials>')
```

<br/>
<VerticalStepper headerLevel="h4">

#### 设置 {#create-a-table}

创建以下数据库和表,并插入一些随机数据:

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

增量备份需要从一个_基础_备份开始。S3 目标位置的第一个参数是 S3 端点,后跟存储桶中用于此备份的目录。在本示例中,目录名为 `my_backup`。

运行以下命令创建基础备份:

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

增量备份包含基础备份与正在备份的表的当前内容之间的差异。在执行增量备份之前添加更多数据:

```sql
INSERT INTO test_db.test_table SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```

#### 执行增量备份 {#take-an-incremental-backup}

此备份命令与基础备份类似,但添加了 `SETTINGS base_backup` 和基础备份的位置。请注意,增量备份的目标位置与基础备份不在同一目录中,它使用相同的端点但存储桶中的目标目录不同。基础备份位于 `my_backup`,增量备份将写入 `my_incremental`:

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
请注意,恢复增量备份时,基础备份也会自动包含在内。
恢复时仅需指定**增量备份**:


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

原始表 `data` 进行了两次插入操作,第一次插入 1,000 行,第二次插入 100 行,总计 1,100 行。
验证恢复后的表是否包含 1,100 行:

```sql
SELECT count()
FROM test_db.test_table_restored
```

```response
┌─count()─┐
│    1100 │
└─────────┘
```

#### 验证数据内容 {#verify-the-content}

以下查询将原始表 `test_table` 的内容与恢复后的表 `test_table_restored` 进行比较:

```sql
SELECT throwIf((
   SELECT groupArray(tuple(*))
   FROM test_db.test_table
   ) != (
   SELECT groupArray(tuple(*))
   FROM test_db.test_table_restored
), 'Data does not match after BACKUP/RESTORE')
```

</VerticalStepper>
