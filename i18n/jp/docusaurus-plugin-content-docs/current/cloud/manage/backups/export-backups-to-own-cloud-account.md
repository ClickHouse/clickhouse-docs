---
sidebar_label: 自分のクラウドアカウントにバックアップをエクスポート
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: 自分のクラウドアカウントにバックアップをエクスポート
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge/>

ClickHouse Cloudは、独自のクラウドサービスプロバイダー (CSP) アカウント (AWS S3、Google Cloud Storage、またはAzure Blob Storage) へのバックアップをサポートしています。  
ClickHouse Cloudバックアップの詳細については、「フル」バックアップと「インクリメンタル」バックアップの違いを含む、[バックアップ](overview.md)ドキュメントを参照してください。

ここでは、AWS、GCP、Azureオブジェクトストレージへのフルバックアップとインクリメンタルバックアップの取得方法、またバックアップからの復元方法の例を示します。

:::note
ユーザーは、バックアップが同一クラウドプロバイダーの異なるリージョンにエクスポートされる場合や、異なるクラウドプロバイダー (同一または異なるリージョン) にエクスポートされる場合、[データ転送](../network-data-transfer.mdx)料金が発生することに注意してください。
:::

## 必要条件 {#requirements}

独自のCSPストレージバケットにバックアップをエクスポート/復元するために、以下の詳細が必要です。

### AWS {#aws}

1. AWS S3エンドポイントの形式:

    ```text
    s3://<bucket_name>.s3.amazonaws.com/<directory>
    ```

    例えば: 
    ```text
    s3://testchbackups.s3.amazonaws.com/backups/
    ```
    ここで:
   - `testchbackups` はバックアップをエクスポートするS3バケットの名前です。
   - `backups` は任意のサブディレクトリです。

2. AWSアクセスキーとシークレット。

### Azure {#azure}

1. Azureストレージ接続文字列。
2. ストレージアカウント内のAzureコンテナ名。
3. コンテナ内のAzure Blob。

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. GCSエンドポイントの形式:

    ```text
    https://storage.googleapis.com/<bucket_name>/
    ```
2. アクセスHMACキーとHMACシークレット。

<hr/>

# バックアップ / 復元

## AWS S3バケットへのバックアップ / 復元 {#backup--restore-to-aws-s3-bucket}

### DBバックアップを取得 {#take-a-db-backup}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

ここで `uuid` は、バックアップセットを区別するための一意の識別子です。

:::note
このサブディレクトリ内の新しいバックアップには異なるUUIDを使用する必要があります。そうしないと `BACKUP_ALREADY_EXISTS` エラーが発生します。
例えば、日次バックアップを取得する場合、毎日新しいUUIDを使用する必要があります。  
:::

**インクリメンタルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>') 
SETTINGS base_backup = S3('https://testchbackups.s3.amazonaws.com/backups/<base-backup-uuid>', '<key id>', '<key secret>')
```

### バックアップからの復元 {#restore-from-a-backup}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored 
FROM S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

詳細については、[S3エンドポイントを使用したBACKUP/RESTOREの設定](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint)を参照してください。

## Azure Blob Storageへのバックアップ / 復元 {#backup--restore-to-azure-blob-storage}

:::note
Azure Blob Storageの独自のバケットへのバックアップエクスポートはまだ利用できません。この機能が利用可能になった際には、当ページを更新します。
:::

### DBバックアップを取得 {#take-a-db-backup-1}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

ここで `uuid` は、バックアップセットを区別するための一意の識別子です。

**インクリメンタルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>/my_incremental') 
SETTINGS base_backup = AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

### バックアップからの復元 {#restore-from-a-backup-1}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_azure 
FROM AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

詳細については、[AzureBlobStorageエンドポイントを使用したBACKUP/RESTOREの設定](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint)を参照してください。

## Google Cloud Storage (GCS)へのバックアップ / 復元 {#backup--restore-to-google-cloud-storage-gcs}

### DBバックアップを取得 {#take-a-db-backup-2}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```

ここで `uuid` は、バックアップセットを区別するための一意の識別子です。

**インクリメンタルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/test_gcs_backups/<uuid>/my_incremental', 'key', 'secret')
SETTINGS base_backup = S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```

### バックアップからの復元 {#restore-from-a-backup-2}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_gcs 
FROM S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```
