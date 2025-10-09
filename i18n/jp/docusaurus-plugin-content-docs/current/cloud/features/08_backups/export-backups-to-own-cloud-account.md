---
'sidebar_label': '自分のクラウドアカウントにバックアップをエクスポートする'
'slug': '/cloud/manage/backups/export-backups-to-own-cloud-account'
'title': '自分のクラウドアカウントにバックアップをエクスポートする'
'description': '自分のクラウドアカウントにバックアップをエクスポートする方法について説明します'
'doc_type': 'guide'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

<EnterprisePlanFeatureBadge/>

ClickHouse Cloud は、あなた自身のクラウドサービスプロバイダー (CSP) アカウント (AWS S3、Google Cloud Storage、または Azure Blob Storage) へのバックアップをサポートしています。
ClickHouse Cloud のバックアップの仕組み、特に「フルバックアップ」と「インクリメンタルバックアップ」の違いについては、[バックアップ](overview.md) ドキュメントを参照してください。

ここでは、AWS、GCP、Azure オブジェクトストレージへのフルバックアップおよびインクリメンタルバックアップを取得する方法、ならびにバックアップから復元する方法の例を示します。

:::note
ユーザーは、バックアップが同じクラウドプロバイダーの別のリージョンにエクスポートされる場合、[データ転送](/cloud/manage/network-data-transfer) 料金が発生することを認識しておく必要があります。 現在、クラウド間バックアップはサポートしていません。
:::

## 要件 {#requirements}

自分の CSP ストレージバケットにバックアップをエクスポート/復元するために、以下の情報が必要です。

### AWS {#aws}

1. AWS S3 エンドポイント、形式:

```text
s3://<bucket_name>.s3.amazonaws.com/<directory>
```

  例: 
```text
s3://testchbackups.s3.amazonaws.com/backups/
```
  ここで:
    - `testchbackups` はバックアップをエクスポートする S3 バケットの名前です。
    - `backups` はオプションのサブディレクトリです。

2. AWS アクセスキーとシークレット。AWS ロールベースの認証もサポートされており、AWS アクセスキーとシークレットの代わりに使用できます。

:::note
ロールベースの認証を使用するには、セキュア S3 の [セットアップ](https://clickhouse.com/docs/cloud/security/secure-s3) に従ってください。さらに、IAM ポリシーに `s3:PutObject` および `s3:DeleteObject` の権限を追加する必要があります。詳しくは、[こちら](https://clickhouse.com/docs/cloud/security/secure-s3#option-2-manually-create-iam-role) を参照してください。
:::

### Azure {#azure}

1. Azure ストレージ接続文字列。
2. ストレージアカウント内の Azure コンテナ名。
3. コンテナ内の Azure Blob。

### Google Cloud Storage (GCS) {#google-cloud-storage-gcs}

1. GCS エンドポイント、形式:

```text
https://storage.googleapis.com/<bucket_name>/
```
2. アクセス HMAC キーと HMAC シークレット。

<hr/>

# バックアップ / 復元

## AWS S3 バケットへのバックアップ / 復元 {#backup--restore-to-aws-s3-bucket}

### DB バックアップを取得 {#take-a-db-backup}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://testchbackups.s3.amazonaws.com/backups/<uuid>', '<key id>', '<key secret>')
```

ここで `uuid` は、バックアップのセットを区別するための一意の識別子です。

:::note
このサブディレクトリ内の新しいバックアップごとに異なる UUID を使用する必要があります。さもなければ、`BACKUP_ALREADY_EXISTS` エラーが発生します。たとえば、毎日バックアップを取得する場合は、毎日新しい UUID を使用する必要があります。  
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

詳細については、[S3 エンドポイントを使用するためのバックアップ/復元の設定](/operations/backup#configuring-backuprestore-to-use-an-s3-endpoint) を参照してください。

## Azure Blob Storage へのバックアップ / 復元 {#backup--restore-to-azure-blob-storage}

### DB バックアップを取得 {#take-a-db-backup-1}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage('<AzureBlobStorage endpoint connection string>', '<container>', '<blob>/<uuid>');
```

ここで `uuid` は、バックアップのセットを区別するための一意の識別子です。

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

詳細については、[Azure Blob Storage エンドポイントを使用するためのバックアップ/復元の設定](/operations/backup#configuring-backuprestore-to-use-an-azureblobstorage-endpoint) を参照してください。

## Google Cloud Storage (GCS) へのバックアップ / 復元 {#backup--restore-to-google-cloud-storage-gcs}

### DB バックアップを取得 {#take-a-db-backup-2}

**フルバックアップ**

```sql
BACKUP DATABASE test_backups 
TO S3('https://storage.googleapis.com/<bucket>/<uuid>', <hmac-key>', <hmac-secret>)
```
ここで `uuid` は、バックアップのセットを区別するための一意の識別子です。

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
