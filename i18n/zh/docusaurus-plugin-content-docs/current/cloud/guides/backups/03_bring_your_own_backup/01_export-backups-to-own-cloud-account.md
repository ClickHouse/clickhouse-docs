---
sidebar_label: '导出备份'
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: '将备份导出到您自己的云账户'
description: '介绍如何将备份导出到您自己的云账户'
doc_type: 'guide'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge />

ClickHouse Cloud 支持将备份存储到您自己的云服务提供商（CSP）账户中（AWS S3、Google Cloud Storage 或 Azure Blob Storage）。
有关 ClickHouse Cloud 备份工作机制（包括「完整」备份与「增量」备份）的详细信息，请参阅 [备份](/cloud/manage/backups/overview) 文档。

在本指南中，我们将通过示例演示如何将完整和增量备份写入 AWS、GCP、Azure 对象存储，以及如何从这些备份中进行恢复。

:::note
用户需要注意，如果将备份导出到同一云服务提供商的不同区域，将会产生 [数据传输](/cloud/manage/network-data-transfer) 费用。目前我们不支持跨云备份。
:::


## 要求 {#requirements}

您需要以下详细信息才能将备份导出/恢复到您自己的云服务提供商 (CSP) 存储桶。

### AWS {#aws}

1. AWS S3 端点,格式如下:

```text
s3://<bucket_name>.s3.amazonaws.com/<directory>
```

例如:

```text
s3://testchbackups.s3.amazonaws.com/backups/
```

其中:
- `testchbackups` 是要导出备份的 S3 存储桶名称。
- `backups` 是可选的子目录。

2. AWS 访问密钥和访问密钥。也支持基于 AWS 角色的身份验证,可以用来替代 AWS 访问密钥和访问密钥。

:::note
为了使用基于角色的身份验证,请遵循 Secure S3 [设置](https://clickhouse.com/docs/cloud/security/secure-s3)。此外,您需要将 `s3:PutObject` 和 `s3:DeleteObject` 权限添加到[此处](https://clickhouse.com/docs/cloud/security/secure-s3#option-2-manually-create-iam-role)描述的 IAM 策略中。
:::

### Azure {#azure}

1. Azure 存储连接字符串。
2. 存储账户中的 Azure 容器名称。
3. 容器内的 Azure Blob。

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. GCS 端点,格式如下:

   ```text
   https://storage.googleapis.com/<bucket_name>/
   ```

2. 访问 HMAC 密钥和 HMAC 密钥。


<hr/>
# 备份/恢复



## 备份/恢复到 AWS S3 存储桶 {#backup--restore-to-aws-s3-bucket}

### 执行数据库备份 {#take-a-db-backup}

**完整备份**

```sql
BACKUP DATABASE test_backups
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

其中 `uuid` 是唯一标识符,用于区分不同的备份集。

:::note
您需要为此子目录中的每个新备份使用不同的 UUID,否则将收到 `BACKUP_ALREADY_EXISTS` 错误。
例如,如果您执行每日备份,则需要每天使用新的 UUID。
:::

**增量备份**

```sql
BACKUP DATABASE test_backups
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
SETTINGS base_backup = S3('https://testchbackups.s3.amazonaws.com/backups/<base-backup-uuid>', '<key id>', '<key secret>')
```

### 从备份恢复 {#restore-from-a-backup}

```sql
RESTORE DATABASE test_backups
AS test_backups_restored
FROM S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

详情请参阅:[配置 BACKUP/RESTORE 使用 S3 端点](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint)。


## 备份/恢复到 Azure Blob Storage {#backup--restore-to-azure-blob-storage}

### 创建数据库备份 {#take-a-db-backup-1}

**完整备份**

```sql
BACKUP DATABASE test_backups
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

其中 `uuid` 是唯一标识符,用于区分不同的备份集。

**增量备份**

```sql
BACKUP DATABASE test_backups
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>/my_incremental')
SETTINGS base_backup = AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

### 从备份中恢复 {#restore-from-a-backup-1}

```sql
RESTORE DATABASE test_backups
AS test_backups_restored_azure
FROM AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

详情请参阅:[配置 BACKUP/RESTORE 使用 Azure Blob Storage 端点](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint)。


## 备份/恢复到 Google Cloud Storage (GCS) {#backup--restore-to-google-cloud-storage-gcs}

### 创建数据库备份 {#take-a-db-backup-2}

**完整备份**

```sql
BACKUP DATABASE test_backups
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```

其中 `uuid` 是唯一标识符,用于区分一组备份。

**增量备份**

```sql
BACKUP DATABASE test_backups
TO S3('https://storage.googleapis.com/test_gcs_backups/<uuid>/my_incremental', 'key', 'secret')
SETTINGS base_backup = S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```

### 从备份中恢复 {#restore-from-a-backup-2}

```sql
RESTORE DATABASE test_backups
AS test_backups_restored_gcs
FROM S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```
