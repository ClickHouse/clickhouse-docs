---
sidebar_label: 'コマンドで行うバックアップと復元'
slug: /cloud/manage/backups/backup-restore-via-commands
title: 'コマンドを使用してバックアップを作成または復元する'
description: '独自のバケットを使用し、コマンドでバックアップを作成または復元する方法を説明するページ'
sidebar_position: 3
doc_type: 'guide'
keywords: ['バックアップ', '災害復旧', 'データ保護', 'リストア', 'クラウド機能']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# コマンドを使用してバックアップの取得および復元を行う {#commands-experience}

`BACKUP` および `RESTORE` コマンドを使用してバックアップをストレージバケットにエクスポートできます。これは、[ユーザーインターフェイス経由](/cloud/manage/backups/backup-restore-via-ui)でバックアップや復元を行う方法に加えて利用できます。
本ガイドでは、3 つすべての CSP 向けのコマンドを紹介します。

## 必要条件 {#requirements}

ご自身の CSP ストレージバケットにバックアップをエクスポート／復元するには、次の情報が必要です：

<Tabs>
  <TabItem value="AWS" label="AWS" default>
    1. AWS S3 エンドポイント。形式：`s3://<bucket_name>.s3.amazonaws.com/<optional_directory>`
       例：`s3://testchbackups.s3.amazonaws.com/`
       ここで:
         * `testchbackups` はバックアップのエクスポート先となる S3 バケット名です。
         * `backups` は任意のサブディレクトリです。
    2. AWS アクセスキーとシークレット。AWS ロールベース認証もサポートされており、上記セクションで説明したとおり、AWS アクセスキーとシークレットの代わりに使用できます。
    <br/>
  </TabItem>
  <TabItem value="GCP" label="GCP">
   1.  GCS エンドポイント。形式：`https://storage.googleapis.com/<bucket_name>/`
   2. HMAC アクセスキーおよび HMAC シークレット。
   <br/>
  </TabItem>
  <TabItem value="Azure" label="Azure">
    1. Azure Storage 接続文字列。
    2. ストレージアカウント内の Azure コンテナ名。
    3. コンテナ内の Azure Blob オブジェクト。
    <br/>
  </TabItem>
</Tabs>

## 特定のデータベースのバックアップ / リストア {#backup_restore_db}

ここでは、*単一* のデータベースのバックアップおよびリストアの方法を示します。
完全なバックアップおよびリストアコマンドについては、[バックアップコマンドの概要](/operations/backup/overview#command-summary)を参照してください。

### AWS S3 {#aws-s3-bucket}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>

```sql
BACKUP DATABASE test_backups 
TO S3(
  'https://testchbackups.s3.amazonaws.com/<uuid>',
  '<key id>',
  '<key secret>'
)
```

ここで `uuid` は、バックアップセットを区別するために使用される一意の識別子です。

:::note
このサブディレクトリ内で新しいバックアップを作成するたびに、異なる `uuid` を使用する必要があります。そうしないと、`BACKUP_ALREADY_EXISTS` エラーが発生します。
たとえば、毎日バックアップを取得する場合は、毎日新しい `uuid` を使用する必要があります。
:::
  </TabItem>
  <TabItem value="Restore" label="RESTORE" default>

```sql
RESTORE DATABASE test_backups
FROM S3(
  'https://testchbackups.s3.amazonaws.com/<uuid>',
  '<key id>',
  '<key secret>'
)
```
  </TabItem>
</Tabs>

### Google Cloud Storage (GCS) {#google-cloud-storage}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>
```sql
BACKUP DATABASE test_backups 
TO S3(
  'https://storage.googleapis.com/<bucket>/<uuid>',
  '<hmac-key>',
  '<hmac-secret>'
)
```

ここで `uuid` は、バックアップを識別するために使用される一意の識別子です。

:::note
このサブディレクトリ内で新しいバックアップを作成するたびに、異なる `uuid` を使用する必要があります。そうしないと、`BACKUP_ALREADY_EXISTS` エラーが発生します。
たとえば、毎日バックアップを取得する場合は、毎日新しい `uuid` を使用する必要があります。
:::

  </TabItem>
  <TabItem value="Restore" label="RESTORE" default>
```sql
RESTORE DATABASE test_backups
FROM S3(
  'https://storage.googleapis.com/<bucket>/<uuid>',
  '<hmac-key>',
  '<hmac-secret>'
)
```
  </TabItem>
</Tabs>

### Azure Blob Storage {#azure-blob-storage}

<Tabs>
  <TabItem value="Backup" label="BACKUP" default>
```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage(
  '<AzureBlobStorage endpoint connection string>',
  '<container>',
  '<blob>/<>'
)
```

ここで `uuid` は、バックアップを識別するために使用される一意の識別子です。

:::note
このサブディレクトリ内で新しいバックアップを作成するたびに、異なる `uuid` を使用する必要があります。そうしないと、`BACKUP_ALREADY_EXISTS` エラーが発生します。
たとえば、毎日バックアップを取得する場合は、毎日新しい `uuid` を使用する必要があります。
:::
</TabItem>
<TabItem value="Restore" label="RESTORE" default>
```sql
RESTORE DATABASE test_backups
FROM AzureBlobStorage(
  '<AzureBlobStorage endpoint connection string>',
  '<container>',
  '<blob>/<uuid>'
)
```
  </TabItem>
</Tabs>

## サービス全体のバックアップ / リストア {#backup_restore_entire_service}

サービス全体をバックアップするには、以下のコマンドを使用します。
このバックアップには、作成されたエンティティ、設定プロファイル、ロールポリシー、クォータ、関数に関するすべてのユーザーデータおよびシステムデータが含まれます。
ここでは AWS S3 向けの例を示します。
上記で説明した構文を利用することで、GCS や Azure Blob Storage に対するバックアップも取得できます。

<Tabs>
<TabItem value="Backup" label="バックアップ" default>

```sql
BACKUP 
    TABLE system.users,
    TABLE system.roles,
    TABLE system.settings_profiles,
    TABLE system.row_policies,
    TABLE system.quotas,
    TABLE system.functions,
    ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3(
    'https://testchbackups.s3.amazonaws.com/<uuid>',
    '<key id>',
    '<key secret>'
)
```

ここで `uuid` は、バックアップを識別するために使用される一意の識別子です。

</TabItem>
<TabItem value="Restore" label="リストア" default>

```sql
RESTORE ALL
FROM S3(
    'https://testchbackups.s3.amazonaws.com/<uuid>',
    '<key id>',
    '<key secret>'
)
```
</TabItem>
</Tabs>

## FAQ {#backups-faq}

<details>
<summary>クラウドオブジェクトストレージ内のバックアップはどうなりますか？ClickHouse によって自動的にクリーンアップされますか？</summary>

バックアップをバケットにエクスポートできる機能を提供していますが、一度書き込まれたバックアップをクリーンアップしたり削除したりすることはありません。バケット内のバックアップのライフサイクル（不要になったバックアップの削除やアーカイブ、全体コスト最適化のためのより安価なストレージへの移動など）は、すべてお客様の責任となります。

</details>

<details>
<summary>既存のバックアップの一部を別の場所に移動した場合、リストア処理はどうなりますか？</summary>

バックアップが別の場所に移動された場合は、バックアップが保存されている新しい場所を参照するように、リストアコマンドを更新する必要があります。

</details>

<details>
<summary>オブジェクトストレージへのアクセスに必要な認証情報を変更した場合はどうなりますか？</summary>

バックアップが再び正常に実行されるように、変更した認証情報を UI 上で更新する必要があります。

</details>

<details>
<summary>外部バックアップのエクスポート先の場所を変更した場合はどうなりますか？</summary>

UI 上でエクスポート先として新しい場所を設定する必要があります。以降のバックアップは新しい場所に保存されます。既存の古いバックアップは元の場所に残ります。

</details>

<details>
<summary>有効化したサービスで外部バックアップを無効化するにはどうすればよいですか？</summary>

特定のサービスの外部バックアップを無効化するには、そのサービスの設定画面に移動し、「Change external backup」をクリックします。続く画面で「Remove setup」をクリックすると、そのサービスの外部バックアップが無効化されます。

</details>