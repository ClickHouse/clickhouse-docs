---
sidebar_label: 'コマンドでバックアップまたは復元を実行'
slug: /cloud/manage/backups/backup-restore-via-commands
title: 'コマンドを使用してバックアップの取得または復元を行う'
description: '独自のバケットを使用し、コマンドでバックアップの取得または復元を行う方法を説明するページ'
sidebar_position: 3
doc_type: 'guide'
keywords: ['バックアップ', 'ディザスタリカバリ', 'データ保護', '復元', 'クラウド機能']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# コマンドを使用したバックアップの取得または復元 {#commands-experience}

ユーザーは、[ユーザーインターフェース経由](/cloud/manage/backups/backup-restore-via-ui)でのバックアップまたは復元に加えて、`BACKUP`および`RESTORE`コマンドを利用してストレージバケットへバックアップをエクスポートすることができます。
本ガイドでは、3つ全てのCSPに対応するコマンドを記載しています。


## 要件 {#requirements}

独自のCSPストレージバケットへバックアップをエクスポート/復元するには、以下の情報が必要です:

<Tabs>
  <TabItem value="AWS" label="AWS" default>
    1. AWS S3エンドポイント(形式: `s3://<bucket_name>.s3.amazonaws.com/<optional_directory>`)
       例: `s3://testchbackups.s3.amazonaws.com/`
       各項目の説明:
         * `testchbackups` はバックアップのエクスポート先となるS3バケット名です。
         * `backups` はオプションのサブディレクトリです。
    2. AWSアクセスキーとシークレット。AWSロールベース認証もサポートされており、上記のセクションで説明されているように、AWSアクセスキーとシークレットの代わりに使用できます。
    <br/>
  </TabItem>
  <TabItem value="GCP" label="GCP">
   1.  GCSエンドポイント(形式: `https://storage.googleapis.com/<bucket_name>/`)
   2. アクセスHMACキーとHMACシークレット。
   <br/>
  </TabItem>
  <TabItem value="Azure" label="Azure">
    1. Azureストレージ接続文字列。
    2. ストレージアカウント内のAzureコンテナ名。
    3. コンテナ内のAzure Blob。
    <br/>
  </TabItem>
</Tabs>


## 特定のデータベースのバックアップ/リストア {#backup_restore_db}

ここでは、_単一_のデータベースのバックアップとリストアを示します。
完全なバックアップおよびリストアコマンドについては、[バックアップコマンドの概要](/operations/backup#command-summary)を参照してください。

### AWS S3 {#aws-s3-bucket}

<Tabs>
  <TabItem value="Backup" label="バックアップ" default>

```sql
BACKUP DATABASE test_backups
TO S3(
  'https://testchbackups.s3.amazonaws.com/<uuid>',
  '<key id>',
  '<key secret>'
)
```

ここで、`uuid`は一意の識別子であり、バックアップのセットを区別するために使用されます。

:::note
このサブディレクトリ内の新しいバックアップごとに異なるuuidを使用する必要があります。そうしないと、`BACKUP_ALREADY_EXISTS`エラーが発生します。
例えば、日次バックアップを取得する場合、毎日新しいuuidを使用する必要があります。
:::

  </TabItem>
  <TabItem value="Restore" label="リストア" default>

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
  <TabItem value="Backup" label="バックアップ" default>
```sql
BACKUP DATABASE test_backups 
TO S3(
  'https://storage.googleapis.com/<bucket>/<uuid>',
  '<hmac-key>',
  '<hmac-secret>'
)
```

ここで、`uuid`は一意の識別子であり、バックアップを識別するために使用されます。

:::note
このサブディレクトリ内の新しいバックアップごとに異なるuuidを使用する必要があります。そうしないと、`BACKUP_ALREADY_EXISTS`エラーが発生します。
例えば、日次バックアップを取得する場合、毎日新しいuuidを使用する必要があります。
:::

  </TabItem>
  <TabItem value="Restore" label="リストア" default>
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
  <TabItem value="Backup" label="バックアップ" default>
```sql
BACKUP DATABASE test_backups 
TO AzureBlobStorage(
  '<AzureBlobStorage endpoint connection string>',
  '<container>',
  '<blob>/<>'
)
```

ここで、`uuid`は一意の識別子であり、バックアップを識別するために使用されます。

:::note
このサブディレクトリ内の新しいバックアップごとに異なるuuidを使用する必要があります。そうしないと、`BACKUP_ALREADY_EXISTS`エラーが発生します。
例えば、日次バックアップを取得する場合、毎日新しいuuidを使用する必要があります。
:::

</TabItem>
<TabItem value="Restore" label="リストア" default>
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
このバックアップには、作成されたエンティティ、設定プロファイル、ロールポリシー、クォータ、および関数に関するすべてのユーザーデータとシステムデータが含まれます。
ここではAWS S3の例を示します。
上記で説明した構文を使用して、これらのコマンドをGCSおよびAzure Blob Storageのバックアップにも利用できます。

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

ここで`uuid`は、バックアップを識別するための一意の識別子です。

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
<summary>クラウドオブジェクトストレージ内のバックアップはどうなりますか？ClickHouseによってクリーンアップされることはありますか？</summary>

お客様のバケットへのバックアップエクスポート機能を提供していますが、一度書き込まれたバックアップのクリーンアップや削除は行いません。バケット内のバックアップのライフサイクル管理（削除、アーカイブ、または全体的なコスト最適化のための低コストストレージへの移動など）は、お客様の責任となります。

</details>

<details>
<summary>既存のバックアップを別の場所に移動した場合、復元プロセスはどうなりますか？</summary>

バックアップが別の場所に移動された場合、復元コマンドを更新して、バックアップが保存されている新しい場所を参照する必要があります。

</details>

<details>
<summary>オブジェクトストレージへのアクセスに必要な認証情報を変更した場合はどうなりますか？</summary>

バックアップが再び正常に実行されるようにするには、UI内で変更した認証情報を更新する必要があります。

</details>

<details>
<summary>外部バックアップのエクスポート先を変更した場合はどうなりますか？</summary>

UI内で新しい場所を更新する必要があり、バックアップは新しい場所に対して実行されるようになります。古いバックアップは元の場所に残ります。

</details>

<details>
<summary>有効にしたサービスの外部バックアップを無効にするにはどうすればよいですか？</summary>

サービスの外部バックアップを無効にするには、サービス設定画面に移動し、「外部バックアップを変更」をクリックします。次の画面で「設定を削除」をクリックすると、サービスの外部バックアップが無効になります。

</details>
