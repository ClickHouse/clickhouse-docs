---
sidebar_label: バックアップを自分のクラウドアカウントにエクスポート
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: バックアップを自分のクラウドアカウントにエクスポート
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge/>

ClickHouse Cloudは、自分のクラウドサービスプロバイダー（CSP）アカウント（AWS S3、Google Cloud Storage、またはAzure Blob Storage）にバックアップを取ることをサポートしています。
ClickHouse Cloudのバックアップの詳細、特に「フルバックアップ」と「増分バックアップ」に関する情報は、[バックアップ](overview.md)のドキュメントを参照してください。

ここでは、AWS、GCP、Azureオブジェクトストレージにフルバックアップと増分バックアップを取得する方法、およびバックアップから復元する方法の例を示します。

:::note
バックアップが同じクラウドプロバイダー内の別のリージョンにエクスポートされる場合や、異なるクラウドプロバイダーにエクスポートされる場合（同じリージョンまたは異なるリージョン）には、[データ転送](../network-data-transfer.mdx)料金が発生することに注意してください。
:::

## 要件 {#requirements}

バックアップを自分のCSPストレージバケットにエクスポートまたは復元するには、以下の詳細が必要です。

### AWS {#aws}

1. AWS S3エンドポイント、形式は以下の通りです：

    ```text
    s3://<bucket_name>.s3.amazonaws.com/<directory>
    ```

    例えば：
    ```text
    s3://testchbackups.s3.amazonaws.com/backups/
    ```
    ここで：
   - `testchbackups` はバックアップをエクスポートするS3バケットの名前です。
   - `backups` はオプションのサブディレクトリです。

2. AWSアクセスキーとシークレット。

### Azure {#azure}

1. Azureストレージ接続文字列。
2. ストレージアカウント内のAzureコンテナ名。
3. コンテナ内のAzure Blob。

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. GCSエンドポイント、形式は以下の通りです：

    ```text
    https://storage.googleapis.com/<bucket_name>/
    ```
2. アクセスHMACキーとHMACシークレット。

<hr/>
# バックアップ / 復元

## AWS S3バケットへのバックアップ / 復元 {#backup--restore-to-aws-s3-bucket}

### データベースのバックアップを取得 {#take-a-db-backup}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

ここで`uuid`は、一連のバックアップを区別するためのユニークな識別子です。

:::note
このサブディレクトリ内の新しいバックアップごとに異なるUUIDを使用する必要があります。そうしないと、`BACKUP_ALREADY_EXISTS`エラーが発生します。
例えば、毎日バックアップを取得する場合、毎日新しいUUIDを使用する必要があります。  
:::

**増分バックアップ**

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

詳細は、[S3エンドポイントを使用するためのバックアップ/復元の構成](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint)を参照してください。

## Azure Blob Storageへのバックアップ / 復元 {#backup--restore-to-azure-blob-storage}

:::note
Azure Blob Storageの自分のバケットへのバックアップエクスポートはまだ利用できません。機能が利用可能になった際にこのページを更新します。
:::

### データベースのバックアップを取得 {#take-a-db-backup-1}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

ここで`uuid`は、一連のバックアップを区別するためのユニークな識別子です。

**増分バックアップ**

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

詳細は、[AzureBlobStorageエンドポイントを使用するためのバックアップ/復元の構成](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint)を参照してください。

## Google Cloud Storage (GCS)へのバックアップ / 復元 {#backup--restore-to-google-cloud-storage-gcs}

### データベースのバックアップを取得 {#take-a-db-backup-2}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', '<hmac-key>', '<hmac-secret>')
```
ここで`uuid`は、一連のバックアップを区別するためのユニークな識別子です。

**増分バックアップ**

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
