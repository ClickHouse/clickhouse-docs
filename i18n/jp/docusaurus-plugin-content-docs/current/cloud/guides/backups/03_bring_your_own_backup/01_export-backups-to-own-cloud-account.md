---
sidebar_label: 'バックアップのエクスポート'
slug: /cloud/manage/backups/export-backups-to-own-cloud-account
title: 'バックアップを自分のクラウドアカウントにエクスポートする'
description: 'バックアップを自分のクラウドアカウントへエクスポートする方法を説明します'
doc_type: 'guide'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge />

ClickHouse Cloud では、お客様のクラウドサービスプロバイダ (CSP) アカウント (AWS S3、Google Cloud Storage、Azure Blob Storage) へのバックアップ取得をサポートしています。
「フル」バックアップと「増分」バックアップを含む ClickHouse Cloud のバックアップの仕組みについては、[backups](/cloud/manage/backups/overview) ドキュメントを参照してください。

このガイドでは、AWS、GCP、Azure のオブジェクトストレージに対してフルバックアップおよび増分バックアップを取得する方法と、バックアップからリストアする方法の例を示します。

:::note
バックアップを同一クラウドプロバイダ内で別リージョンにエクスポートするあらゆる利用形態では、[data transfer](/cloud/manage/network-data-transfer) の料金が発生することに注意してください。現在は、異なるクラウド間でのバックアップはサポートしていません。
:::

## 前提条件 {#requirements}

ご利用の CSP ストレージバケットにバックアップをエクスポート／リストアするには、次の情報が必要です。

### AWS {#aws}

1. AWS S3 エンドポイント（形式）:

```text
s3://<bucket_name>.s3.amazonaws.com/<directory>
```

例：

```text
s3://testchbackups.s3.amazonaws.com/backups/
```

Where:

* `testchbackups` は、バックアップを書き出す先の S3 バケット名です。
* `backups` は任意のサブディレクトリです。

2. AWS アクセスキーおよびシークレット。AWS のロールベース認証にも対応しており、AWS アクセスキーおよびシークレットの代わりに使用できます。

:::note
ロールベース認証を使用するには、Secure S3 の[セットアップ](https://clickhouse.com/docs/cloud/security/secure-s3)に従ってください。さらに、[こちら](https://clickhouse.com/docs/cloud/security/secure-s3#option-2-manually-create-iam-role)で説明されている IAM ポリシーに `s3:PutObject` および `s3:DeleteObject` の権限を追加する必要があります。
:::

### Azure {#azure}

1. Azure Storage の接続文字列。
2. ストレージアカウント内の Azure コンテナー名。
3. コンテナー内の Azure Blob 名。

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. GCS エンドポイント（形式）：

   ```text
   https://storage.googleapis.com/<bucket_name>/
   ```
2. アクセス用 HMAC キーおよび HMAC シークレット。

<hr />

# バックアップ / 復元 {#backup-restore}

## AWS S3 バケットへのバックアップ / 復元 {#backup--restore-to-aws-s3-bucket}

### データベースのバックアップを作成する {#take-a-db-backup}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

ここで `uuid` は一意の識別子であり、一連のバックアップを区別するために使用されます。

:::note
このサブディレクトリ内の新しいバックアップごとに異なる UUID を使用する必要があります。そうしないと、`BACKUP_ALREADY_EXISTS` エラーが発生します。
例えば、日次バックアップを実行している場合は、毎日新しい UUID を使用する必要があります。\
:::

**増分バックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>') 
SETTINGS base_backup = S3('https://testchbackups.s3.amazonaws.com/backups/<base-backup-uuid>', '<key id>', '<key secret>')
```

### バックアップから復元する {#restore-from-a-backup}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored 
FROM S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

詳細については、[S3 エンドポイントを使用するように BACKUP/RESTORE を設定する](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint) を参照してください。

## Azure Blob Storage へのバックアップ / リストア {#backup--restore-to-azure-blob-storage}

### DB のバックアップを取得する {#take-a-db-backup-1}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

ここで `uuid` は一意の識別子であり、一連のバックアップを区別するために使用されます。

**増分バックアップ**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>/my_incremental') 
SETTINGS base_backup = AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

### バックアップから復元する {#restore-from-a-backup-1}

```sql
RESTORE DATABASE test_backups 
AS test_backups_restored_azure 
FROM AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>')
```

詳細については、[S3 エンドポイントを使用するように BACKUP/RESTORE を構成する](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint) を参照してください。

## Google Cloud Storage (GCS) へのバックアップ / 復元 {#backup--restore-to-google-cloud-storage-gcs}

### DB バックアップの取得 {#take-a-db-backup-2}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```

ここで `uuid` は一意の識別子であり、一連のバックアップを区別するために使用されます。

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
