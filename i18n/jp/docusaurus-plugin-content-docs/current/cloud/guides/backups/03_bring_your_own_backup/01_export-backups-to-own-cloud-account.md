---
sidebar_label: 'バックアップのエクスポート'
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: 'バックアップをご自身のクラウドアカウントにエクスポートする'
description: 'バックアップを自身のクラウドアカウントにエクスポートする方法について説明します'
doc_type: 'guide'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge />

ClickHouse Cloud では、お客様のクラウドサービスプロバイダー (CSP) アカウント (AWS S3、Google Cloud Storage、Azure Blob Storage) へのバックアップ取得をサポートしています。
「フル」バックアップと「増分」バックアップを含む ClickHouse Cloud のバックアップの仕組みについての詳細は、[backups](/cloud/manage/backups/overview) ドキュメントを参照してください。

このガイドでは、AWS、GCP、Azure のオブジェクトストレージに対してフルバックアップおよび増分バックアップを取得する方法と、バックアップから復元する方法の例を示します。

:::note
バックアップを同一クラウドプロバイダー内の別リージョンにエクスポートする場合には、[data transfer](/cloud/manage/network-data-transfer) の料金が発生することに注意してください。現在、クラウド間をまたいだバックアップはサポートしていません。
:::


## 要件 {#requirements}

独自のCSPストレージバケットへバックアップをエクスポート/復元するには、以下の情報が必要です。

### AWS {#aws}

1. AWS S3エンドポイント(以下の形式):

```text
s3://<bucket_name>.s3.amazonaws.com/<directory>
```

例:

```text
s3://testchbackups.s3.amazonaws.com/backups/
```

各項目の説明: - `testchbackups`はバックアップのエクスポート先となるS3バケット名です。 - `backups`はオプションのサブディレクトリです。

2. AWSアクセスキーとシークレット。AWSロールベース認証もサポートされており、AWSアクセスキーとシークレットの代わりに使用できます。

:::note
ロールベース認証を使用する場合は、Secure s3の[セットアップ](https://clickhouse.com/docs/cloud/security/secure-s3)手順に従ってください。また、[こちら](https://clickhouse.com/docs/cloud/security/secure-s3#option-2-manually-create-iam-role)で説明されているIAMポリシーに`s3:PutObject`および`s3:DeleteObject`の権限を追加する必要があります。
:::

### Azure {#azure}

1. Azureストレージ接続文字列。
2. ストレージアカウント内のAzureコンテナ名。
3. コンテナ内のAzure Blob。

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. GCSエンドポイント(以下の形式):

   ```text
   https://storage.googleapis.com/<bucket_name>/
   ```

2. アクセスHMACキーとHMACシークレット。


<hr/>
# バックアップ / 復元



## AWS S3バケットへのバックアップ/リストア {#backup--restore-to-aws-s3-bucket}

### データベースのバックアップを取得 {#take-a-db-backup}

**完全バックアップ**

```sql
BACKUP DATABASE test_backups
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

ここで`uuid`は一意の識別子で、バックアップのセットを区別するために使用されます。

:::note
このサブディレクトリ内の新しいバックアップごとに異なるUUIDを使用する必要があります。そうしないと`BACKUP_ALREADY_EXISTS`エラーが発生します。
例えば、日次バックアップを取得する場合、毎日新しいUUIDを使用する必要があります。
:::

**増分バックアップ**

```sql
BACKUP DATABASE test_backups
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
SETTINGS base_backup = S3('https://testchbackups.s3.amazonaws.com/backups/<base-backup-uuid>', '<key id>', '<key secret>')
```

### バックアップからリストア {#restore-from-a-backup}

```sql
RESTORE DATABASE test_backups
AS test_backups_restored
FROM S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

詳細については、[S3エンドポイントを使用するためのBACKUP/RESTOREの設定](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint)を参照してください。


## Azure Blob Storageへのバックアップ/リストア {#backup--restore-to-azure-blob-storage}

### データベースのバックアップを取得 {#take-a-db-backup-1}

**完全バックアップ**

```sql
BACKUP DATABASE test_backups
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

`uuid`は一意の識別子で、バックアップのセットを区別するために使用されます。

**増分バックアップ**

```sql
BACKUP DATABASE test_backups
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>/my_incremental')
SETTINGS base_backup = AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

### バックアップからのリストア {#restore-from-a-backup-1}

```sql
RESTORE DATABASE test_backups
AS test_backups_restored_azure
FROM AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

詳細については、[Azure Blob Storageエンドポイントを使用するためのBACKUP/RESTOREの設定](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint)を参照してください。


## Google Cloud Storage (GCS) へのバックアップ/復元 {#backup--restore-to-google-cloud-storage-gcs}

### データベースのバックアップを作成する {#take-a-db-backup-2}

**完全バックアップ**

```sql
BACKUP DATABASE test_backups
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```

ここで `uuid` は一意の識別子であり、バックアップのセットを区別するために使用されます。

**増分バックアップ**

```sql
BACKUP DATABASE test_backups
TO S3('https://storage.googleapis.com/test_gcs_backups/<uuid>/my_incremental', 'key', 'secret')
SETTINGS base_backup = S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```

### バックアップから復元する {#restore-from-a-backup-2}

```sql
RESTORE DATABASE test_backups
AS test_backups_restored_gcs
FROM S3('https://storage.googleapis.com/test_gcs_backups/<uuid>', 'key', 'secret')
```
