---
sidebar_label: '导出备份'
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: '将备份导出到您自己的云账户'
description: '说明如何将备份导出到您自己的云账户'
doc_type: 'guide'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge />

ClickHouse Cloud 支持将备份写入您自己的云服务提供商（CSP）账户（AWS S3、Google Cloud Storage 或 Azure Blob Storage）。
关于 ClickHouse Cloud 备份的工作原理（包括“完整”备份与“增量”备份）的详细信息，请参阅 [backups](/cloud/manage/backups/overview) 文档。

本指南演示如何将完整和增量备份写入 AWS、GCP、Azure 对象存储，以及如何从这些备份中进行恢复。

:::note
用户需要注意，如果备份被导出到同一云服务提供商的其他区域，将会产生 [data transfer](/cloud/manage/network-data-transfer) 费用。目前我们尚不支持跨云备份。
:::


## 前提条件 {#requirements}

要将备份导出到或从你自己的 CSP 存储 bucket 中恢复，需要准备以下信息。

### AWS {#aws}

1. AWS S3 端点，格式如下：

```text
  s3://<bucket_name>.s3.amazonaws.com/<directory>
  ```

例如：

```text
  s3://testchbackups.s3.amazonaws.com/backups/
  ```

Where:

* `testchbackups` 是用于导出备份的 S3 bucket 名称。
  * `backups` 是一个可选的子目录。

2. AWS access key 和 secret。也支持基于 AWS role 的身份验证，并且可以替代 AWS access key 和 secret 使用。

:::note
若要使用基于 role 的身份验证，请按照 Secure S3 的[配置步骤](https://clickhouse.com/docs/cloud/security/secure-s3)。此外，你还需要在[此处](https://clickhouse.com/docs/cloud/security/secure-s3#option-2-manually-create-iam-role)所述的 IAM 策略中添加 `s3:PutObject` 和 `s3:DeleteObject` 权限。
:::


### Azure {#azure}

1. Azure 存储连接字符串。
2. 存储帐户中 Azure 容器的名称。
3. 容器中的 Azure Blob 对象。

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. GCS endpoint，格式如下：

   ```text
    https://storage.googleapis.com/<bucket_name>/
    ```
2. 用于访问的 HMAC key 和 HMAC secret。

<hr/>

# 备份与恢复 {#backup-restore}

## 备份 / 恢复到 AWS S3 存储桶 {#backup--restore-to-aws-s3-bucket}

### 进行数据库备份 {#take-a-db-backup}

**完整备份**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

其中 `uuid` 是一个唯一标识符，用于区分一组备份。

:::note
你需要在该子目录中为每次新的备份使用不同的 UUID，否则会收到 `BACKUP_ALREADY_EXISTS` 错误。
例如，如果你进行的是每日备份，则需要每天使用一个新的 UUID。
:::

**增量备份**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>') 
SETTINGS base_backup = S3('https://testchbackups.s3.amazonaws.com/backups/<base-backup-uuid>', '<key id>', '<key secret>')
```


### 从备份中恢复 {#restore-from-a-backup}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored 
FROM S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

详情请参见：[将 BACKUP/RESTORE 配置为使用 S3 端点](/operations/backup/s3_endpoint)。


## 备份 / 恢复到 Azure Blob 存储 {#backup--restore-to-azure-blob-storage}

### 执行数据库备份 {#take-a-db-backup-1}

**完整备份**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

其中 `uuid` 是唯一标识符，用于区分一组备份。

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

请参阅：[配置 BACKUP/RESTORE 以使用 AzureBlobStorage 端点](/operations/backup/azure#configuring-backuprestore-to-use-an-azureblobstorage-endpoint) 了解更多详情。


## 备份 / 恢复到 Google Cloud Storage (GCS) {#backup--restore-to-google-cloud-storage-gcs}

### 执行数据库备份 {#take-a-db-backup-2}

**完整备份**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```

其中 `uuid` 是一个唯一标识符，用于区分一组备份。

**增量备份**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/test_gcs_backups/<uuid>/my_incremental', 'key', 'secret')
SETTINGS base_backup = S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```


### 从备份恢复 {#restore-from-a-backup-2}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_gcs 
FROM S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```
