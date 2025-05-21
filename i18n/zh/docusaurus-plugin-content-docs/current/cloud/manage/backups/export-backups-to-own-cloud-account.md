---
'sidebar_label': 'Export Backups to your Own Cloud Account'
'slug': '/cloud/manage/backups/export-backups-to-own-cloud-account'
'title': 'Export Backups to your Own Cloud Account'
'description': 'Describes how to export backups to your own Cloud account'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge/>

ClickHouse Cloud 支持将备份保存到您自己的云服务提供商 (CSP) 账户（AWS S3、Google Cloud Storage 或 Azure Blob Storage）。
有关 ClickHouse Cloud 备份工作的详细信息，包括“完整”备份与“增量”备份的区别，请参见 [backups](overview.md) 文档。

在这里，我们展示了如何将完整和增量备份保存到 AWS、GCP、Azure 对象存储，以及如何从备份中恢复。

:::note
用户应注意，任何将备份导出到同一云提供商的不同区域或另一个云提供商（在同一或不同区域）的使用都将产生 [数据传输](../network-data-transfer.mdx) 费用。
:::

## 要求 {#requirements}

您需要以下详细信息才能将备份导出/恢复到您自己的 CSP 存储桶。

### AWS {#aws}

1. AWS S3 终端节点，格式如下：

```text
    s3://<bucket_name>.s3.amazonaws.com/<directory>
```

    例如：
```text
    s3://testchbackups.s3.amazonaws.com/backups/
```
    其中：
   - `testchbackups` 是导出备份到的 S3 存储桶的名称。
   - `backups` 是可选的子目录。

2. AWS 访问密钥和密钥密文。

### Azure {#azure}

1. Azure 存储连接字符串。
2. 存储账户中的 Azure 容器名称。
3. 容器中的 Azure Blob。

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. GCS 终端节点，格式如下：

```text
    https://storage.googleapis.com/<bucket_name>/
```
2. 访问 HMAC 密钥和 HMAC 秘密。

<hr/>

# 备份 / 恢复

## 备份 / 恢复到 AWS S3 存储桶 {#backup--restore-to-aws-s3-bucket}

### 进行数据库备份 {#take-a-db-backup}

**完整备份**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

其中 `uuid` 是唯一标识符，用于区分一组备份。

:::note
您需要为此子目录中的每个新备份使用不同的 UUID，否则您将收到 `BACKUP_ALREADY_EXISTS` 错误。
例如，如果您每天进行一次备份，则每天都需要使用新的 UUID。
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

请参见: [配置备份/恢复以使用 S3 终端节点](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint) 获取更多详细信息。

## 备份 / 恢复到 Azure Blob Storage {#backup--restore-to-azure-blob-storage}

### 进行数据库备份 {#take-a-db-backup-1}

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

### 从备份恢复 {#restore-from-a-backup-1}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_azure 
FROM AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

请参见: [配置备份/恢复以使用 S3 终端节点](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint) 获取更多详细信息。

## 备份 / 恢复到 Google Cloud Storage (GCS) {#backup--restore-to-google-cloud-storage-gcs}

### 进行数据库备份 {#take-a-db-backup-2}

**完整备份**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```
其中 `uuid` 是唯一标识符，用于区分一组备份。

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
