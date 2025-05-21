---
sidebar_label: '自分のクラウドアカウントにバックアップをエクスポート'
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: '自分のクラウドアカウントにバックアップをエクスポート'
description: '自分のクラウドアカウントにバックアップをエクスポートする方法について説明します'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge/>

ClickHouse Cloudは、あなた自身のクラウドサービスプロバイダー (CSP) アカウント (AWS S3、Google Cloud Storage、またはAzure Blob Storage) にバックアップを取ることをサポートしています。
ClickHouse Cloudのバックアップの詳細、特に「フル」と「インクリメンタル」バックアップについては、[バックアップ](overview.md) ドキュメントを参照してください。

ここでは、AWS、GCP、Azureオブジェクトストレージにフルバックアップとインクリメンタルバックアップを取得する方法、およびバックアップから復元する方法の例を示します。

:::note
ユーザーは、バックアップが同じクラウドプロバイダーの異なるリージョンにエクスポートされる場合や、他のクラウドプロバイダー(同じまたは異なるリージョン)にエクスポートされる場合、[データ転送](../network-data-transfer.mdx)料が発生することに留意してください。
:::

## 要件 {#requirements}

あなた自身のCSPストレージバケットにバックアップをエクスポート/復元するために、以下の詳細が必要です。

### AWS {#aws}

1. AWS S3エンドポイントは、次の形式です：

    ```text
    s3://<bucket_name>.s3.amazonaws.com/<directory>
    ```

    例：
    ```text
    s3://testchbackups.s3.amazonaws.com/backups/
    ```
    ここで：
   - `testchbackups`はバックアップをエクスポートするS3バケットの名前です。
   - `backups`はオプションのサブディレクトリです。

2. AWSアクセスキーとシークレット。

### Azure {#azure}

1. Azureストレージ接続文字列。
2. ストレージアカウント内のAzureコンテナ名。
3. コンテナ内のAzure Blob。

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. GCSエンドポイントは、次の形式です：

    ```text
    https://storage.googleapis.com/<bucket_name>/
    ```
2. アクセスHMACキーとHMACシークレット。

<hr/>

# バックアップ / 復元

## AWS S3バケットへのバックアップ / 復元 {#backup--restore-to-aws-s3-bucket}

### データベースバックアップを取得 {#take-a-db-backup}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

ここで、`uuid`はバックアップのセットを区別するための一意の識別子です。

:::note
このサブディレクトリ内で各新しいバックアップには異なるUUIDを使用する必要があります。さもなければ、`BACKUP_ALREADY_EXISTS`エラーが発生します。
たとえば、毎日バックアップを行う場合は、毎日新しいUUIDを使用する必要があります。  
:::

**インクリメンタルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>') 
SETTINGS base_backup = S3('https://testchbackups.s3.amazonaws.com/backups/<base-backup-uuid>', '<key id>', '<key secret>')
```

### バックアップから復元 {#restore-from-a-backup}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored 
FROM S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

詳細については、[S3エンドポイントを使用するためのバックアップ/復元の設定](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint)を参照してください。

## Azure Blob Storageへのバックアップ / 復元 {#backup--restore-to-azure-blob-storage}

### データベースバックアップを取得 {#take-a-db-backup-1}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

ここで、`uuid`はバックアップのセットを区別するための一意の識別子です。

**インクリメンタルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>/my_incremental') 
SETTINGS base_backup = AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

### バックアップから復元 {#restore-from-a-backup-1}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_azure 
FROM AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

詳細については、[Azure Blob Storageエンドポイントを使用するためのバックアップ/復元の設定](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint)を参照してください。

## Google Cloud Storage (GCS) へのバックアップ / 復元 {#backup--restore-to-google-cloud-storage-gcs}

### データベースバックアップを取得 {#take-a-db-backup-2}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', '<hmac-key>', '<hmac-secret>')
```
ここで、`uuid`はバックアップのセットを区別するための一意の識別子です。

**インクリメンタルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/test_gcs_backups/<uuid>/my_incremental', 'key', 'secret')
SETTINGS base_backup = S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```

### バックアップから復元 {#restore-from-a-backup-2}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_gcs 
FROM S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```
