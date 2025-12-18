---
sidebar_label: 'UI を使用したバックアップ／復元'
slug: /cloud/manage/backups/backup-restore-via-ui
title: 'UI からバックアップを取得・復元する'
description: '独自のバケットを使用して、UI からバックアップを取得および復元する方法を説明するページ'
sidebar_position: 2
doc_type: 'guide'
keywords: ['バックアップ', '災害復旧', 'データ保護', '復元', 'クラウド機能']
---

import Image from '@theme/IdealImage'
import arn from '@site/static/images/cloud/manage/backups/arn.png'
import change_external_backup from '@site/static/images/cloud/manage/backups/change_external_backup.png'
import configure_arn_s3_details from '@site/static/images/cloud/manage/backups/configure_arn_s3_details.png'
import view_backups from '@site/static/images/cloud/manage/backups/view_backups.png'
import backup_command from '@site/static/images/cloud/manage/backups/backup_command.png'
import gcp_configure from '@site/static/images/cloud/manage/backups/gcp_configure.png'
import gcp_stored_backups from '@site/static/images/cloud/manage/backups/gcp_stored_backups.png'
import gcp_restore_command from '@site/static/images/cloud/manage/backups/gcp_restore_command.png'
import azure_connection_details from '@site/static/images/cloud/manage/backups/azure_connection_details.png'
import view_backups_azure from '@site/static/images/cloud/manage/backups/view_backups_azure.png'
import restore_backups_azure from '@site/static/images/cloud/manage/backups/restore_backups_azure.png'

# ユーザーインターフェイスからのバックアップ／リストア {#ui-experience}

## AWS {#AWS}

### AWSへのバックアップ取得 {#taking-backups-to-aws}

#### 1. AWSでの手順 {#aws-steps}

:::note
以下の手順は["S3データへの安全なアクセス"](/cloud/data-sources/secure-s3)で説明されている安全なS3セットアップと類似していますが、ロール権限に追加のアクションが必要です
:::

AWSアカウントで以下の手順を実行します:

<VerticalStepper headerLevel="h5">

##### AWS S3バケットの作成 {#create-s3-bucket}

バックアップをエクスポートするAWS S3バケットをアカウント内に作成します。

##### IAMロールの作成 {#create-iam-role}

AWSはロールベース認証を使用するため、ClickHouse Cloudサービスがこのバケットへの書き込みのために引き受けることができるIAMロールを作成します。

- a. ClickHouse Cloudサービス設定ページのネットワークセキュリティ情報からARNを取得します。以下のような形式です:

<Image img={arn} alt='AWS S3 ARN' size='lg' />

- b. このロールに対して、以下のように信頼ポリシーを作成します:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "backup service",
      "Effect": "Allow",
      "Principal": {
        "AWS":  "arn:aws:iam::463754717262:role/CH-S3-bordeaux-ar-90-ue2-29-Role"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

##### ロール権限の更新 {#update-permissions-for-role}

ClickHouse CloudサービスがS3バケットに書き込めるように、このロールの権限を設定する必要があります。
以下のようなJSONでロールの権限ポリシーを作成します。両方の箇所でリソースに自分のバケットARNを代入してください。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::byob-ui"
      ],
      "Effect": "Allow"
    },
    {
      "Action": [
        "s3:Get*",
        "s3:List*",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::byob-ui/*"
      ],
      "Effect": "Allow"
    },
    {
      "Action": [
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::byob-ui/*/.lock"
      ],
      "Effect": "Allow"
    }
  ]
}
```

</VerticalStepper>

#### 2. ClickHouse Cloudでの手順 {#cloud-steps}

ClickHouse Cloudコンソールで以下の手順を実行して外部バケットを設定します:

<VerticalStepper headerLevel="h5">

##### 外部バックアップの変更 {#configure-external-bucket}

設定ページで「外部バックアップの設定」をクリックします:

<Image img={change_external_backup} alt='Change external backup' size='lg' />

##### AWS IAMロールARNとS3バケット詳細の設定 {#configure-aws-iam-role-arn-and-s3-bucket-details}

次の画面で、作成したAWS IAMロールARNとS3バケットURLを以下の形式で入力します:

<Image
  img={configure_arn_s3_details}
  alt='Configure AWS IAM Role ARN and S3 bucket details'
  size='lg'
/>

##### 変更の保存 {#save-changes}

設定を保存するには「外部バケットを保存」をクリックします

##### デフォルトスケジュールからバックアップスケジュールの変更 {#changing-the-backup-schedule}

外部バックアップは、デフォルトスケジュールでバケット内に実行されるようになります。
または、「設定」ページからバックアップスケジュールを設定することもできます。
異なる設定を行った場合、カスタムスケジュールがバケットへのバックアップ書き込みに使用され、
デフォルトスケジュール(24時間ごとのバックアップ)がClickHouse Cloud所有バケット内のバックアップに使用されます。

##### バケットに保存されたバックアップの表示 {#view-backups-stored-in-your-bucket}

バックアップページには、以下のようにバケット内のこれらのバックアップが別のテーブルに表示されます:

<Image img={view_backups} alt='View backups stored in your bucket' size='lg' />

</VerticalStepper>

### AWSからのバックアップ復元 {#restoring-backups-from-aws}

AWSからバックアップを復元するには、以下の手順を実行します:

<VerticalStepper headerLevel="h5">

##### 復元先の新しいサービスの作成 {#create-new-service-to-restore-to}

バックアップを復元する新しいサービスを作成します。

##### サービスARNの追加 {#add-service-arn}

新しく作成したサービスのARN(ClickHouse Cloudコンソールのサービス設定ページから取得)をIAMロールの信頼ポリシーに追加します。これは上記のAWS手順セクションの[2番目のステップ](#create-iam-role)と同じです。新しいサービスがS3バケットにアクセスできるようにするために必要です。

##### バックアップ復元用SQLコマンドの取得 {#obtain-sql-command-to-restore-backup}

UIのバックアップリストの上にある「access or restore a backup」リンクをクリックして、バックアップを復元するためのSQLコマンドを取得します。コマンドは次のようになります:

<Image
  img={backup_command}
  alt='バックアップ復元用SQLコマンドの取得'
  size='md'
/>

:::warning バックアップを別の場所に移動する場合
バックアップを別の場所に移動する場合は、新しい場所を参照するように復元コマンドをカスタマイズする必要があります。
:::

:::tip ASYNCコマンド
大規模な復元の場合、Restoreコマンドの末尾にオプションで`ASYNC`コマンドを追加できます。
これにより復元が非同期で実行されるため、接続が失われても復元は継続されます。
ASYNCコマンドは即座に成功ステータスを返すことに注意してください。
これは復元が成功したことを意味するものではありません。
復元が完了したか、成功または失敗したかを確認するには、`system.backups`テーブルを監視する必要があります。
:::

##### 復元コマンドの実行 {#run-the-restore-command}

新しく作成したサービスのSQLコンソールから復元コマンドを実行して、バックアップを復元します。

</VerticalStepper>

## GCP {#gcp}

### GCPへのバックアップ取得 {#taking-backups-to-gcp}

以下の手順に従ってGCPへバックアップを取得します:

#### GCPでの実行手順 {#gcp-steps-to-follow}

<VerticalStepper headerLevel="h5">

##### GCPストレージバケットの作成 {#create-a-gcp-storage-bucket}

バックアップをエクスポートするために、GCPアカウントにストレージバケットを作成します。

##### HMACキーとシークレットの生成 {#generate-an-hmac-key-and-secret}

パスワードベース認証に必要なHMACキーとシークレットを生成します。以下の手順に従ってキーを生成してください:

- a. サービスアカウントの作成
  - I. Google Cloud ConsoleのIAM & Adminセクションに移動し、`Service Accounts`を選択します。
  - II. `Create Service Account`をクリックし、名前とIDを入力します。`Create and Continue`をクリックします。
  - III. このサービスアカウントにStorage Object Userロールを付与します。
  - IV. `Done`をクリックしてサービスアカウントの作成を完了します。

- b. HMACキーの生成
  - I. Google Cloud ConsoleのCloud Storageに移動し、`Settings`を選択します。
  - II. Interoperabilityタブに移動します。
  - III. `Service account HMAC`セクションで、`Create a key for a service account`をクリックします。
  - IV. ドロップダウンメニューから前の手順で作成したサービスアカウントを選択します。
  - V. `Create key`をクリックします。

- c. 認証情報の安全な保管:
  - I. システムはAccess ID(HMACキー)とSecret(HMACシークレット)を表示します。これらの値を保存してください。このウィンドウを閉じた後、シークレットは再表示されません。

</VerticalStepper>

#### ClickHouse Cloudでの実行手順 {#gcp-cloud-steps}

ClickHouse Cloudコンソールで以下の手順に従って外部バケットを設定します:

<VerticalStepper headerLevel="h5">

##### 外部バックアップの変更 {#gcp-configure-external-bucket}

`Settings`ページで、`Change external backup`をクリックします。

<Image img={change_external_backup} alt='Change external backup' size='lg' />

##### GCP HMACキーとシークレットの設定 {#gcp-configure-gcp-hmac-key-and-secret}

ポップアップダイアログで、前のセクションで作成したGCPバケットパス、HMACキー、およびシークレットを入力します。

<Image img={gcp_configure} alt='Configure GCP HMAC Key and Secret' size='md' />

##### 外部バケットの保存 {#gcp-save-external-bucket}

`Save External Bucket`をクリックして設定を保存します。

##### デフォルトスケジュールからのバックアップスケジュール変更 {#gcp-changing-the-backup-schedule}

外部バックアップは、デフォルトスケジュールでバケットに実行されるようになります。
または、`Settings`ページからバックアップスケジュールを設定することもできます。
異なる設定を行った場合、カスタムスケジュールはバケットへのバックアップ書き込みに使用され、デフォルトスケジュール(24時間ごとのバックアップ)はClickHouse Cloud所有バケットへのバックアップに使用されます。

##### バケットに保存されたバックアップの表示 {#gcp-view-backups-stored-in-your-bucket}

Backupsページには、以下のようにバケット内のこれらのバックアップが別のテーブルに表示されます:

<Image
  img={gcp_stored_backups}
  alt='View backups stored in your bucket'
  size='lg'
/>

</VerticalStepper>

### GCPからのバックアップ復元 {#gcp-restoring-backups-from-gcp}

以下の手順に従ってGCPからバックアップを復元します:

<VerticalStepper headerLevel="h5">

##### 復元先の新しいサービスの作成 {#gcp-create-new-service-to-restore-to}

バックアップを復元するための新しいサービスを作成します。

##### バックアップ復元に使用するSQLコマンドの取得 {#gcp-obtain-sql-command-to-restore-backup}

UI内のバックアップリストの上にある`access or restore a backup`リンクをクリックして、バックアップを復元するためのSQLコマンドを取得します。コマンドは以下のようになります。ドロップダウンから適切なバックアップを選択して、その特定のバックアップの復元コマンドを取得できます。コマンドにシークレットアクセスキーを追加する必要があります:

<Image
  img={gcp_restore_command}
  alt='Get SQL command used to restore backup'
  size='md'
/>

:::warning バックアップの別の場所への移動
バックアップを別の場所に移動する場合、新しい場所を参照するように復元コマンドをカスタマイズする必要があります。
:::

:::tip ASYNCコマンド
大規模なリストアを行う場合、Restoreコマンドの末尾にオプションで`ASYNC`コマンドを追加できます。
これにより、リストアが非同期で実行されるため、接続が切断されてもリストア処理は継続されます。
ASYNCコマンドは即座に成功ステータスを返すことに注意が必要です。
これはリストアが成功したことを意味するものではありません。
リストアが完了したか、成功または失敗したかを確認するには、`system.backups`テーブルを監視する必要があります。
:::

##### SQLコマンドを実行してバックアップをリストアする {#gcp-run-sql-command-to-restore-backup}

新しく作成されたサービスのSQLコンソールからrestoreコマンドを実行し、
バックアップをリストアします。

</VerticalStepper>

## Azure {#azure}

### Azure へのバックアップ取得 {#taking-backups-to-azure}

Azure へバックアップを取得するには、以下の手順に従ってください。

#### Azure での手順 {#steps-to-follow-in-azure}

<VerticalStepper headerLevel="h5">

##### ストレージアカウントを作成する {#azure-create-a-storage-account}

バックアップを保存したい Azure ポータル上で、新しいストレージアカウントを作成するか、既存のストレージアカウントを選択します。

##### 接続文字列を取得する {#azure-get-connection-string}

* a. ストレージアカウントの概要で、`Security + networking` セクションを探し、`Access keys` をクリックします。
* b. ここで `key1` と `key2` が表示されます。各キーの下に `Connection string` フィールドがあります。
* c. `Show` をクリックして接続文字列を表示します。ClickHouse Cloud でのセットアップに使用するため、この接続文字列をコピーします。

</VerticalStepper>

#### ClickHouse Cloud での手順 {#azure-cloud-steps}

ClickHouse Cloud コンソールで外部バケットを構成するには、以下の手順に従ってください。

<VerticalStepper headerLevel="h5">

##### 外部バックアップを変更する {#azure-configure-external-bucket}

`Settings` ページで、`Change external backup` をクリックします。

<Image img={change_external_backup} alt="外部バックアップを変更" size="lg" />

##### Azure ストレージアカウントの接続文字列とコンテナー名を指定する {#azure-provide-connection-string-and-container-name-azure}

次の画面で、前のセクションで作成した Azure ストレージアカウントの Connection String と Container Name を指定します。

<Image img={azure_connection_details} alt="Azure ストレージアカウントの接続文字列とコンテナー名を指定" size="md" />

##### 外部バケットを保存する {#azure-save-external-bucket}

設定を保存するには、`Save External Bucket` をクリックします。

##### デフォルトのスケジュールからバックアップスケジュールを変更する {#azure-changing-the-backup-schedule}

外部バックアップは、デフォルトスケジュールに従ってバケットに対して実行されるようになります。あるいは、
`Settings` ページからバックアップスケジュールを設定することもできます。別の設定を行った場合、
カスタムスケジュールがバケットへのバックアップ書き込みに使用され、デフォルトスケジュール
（24 時間ごとのバックアップ）は ClickHouse Cloud が所有するバケットへのバックアップに使用されます。

##### バケットに保存されているバックアップを表示する {#azure-view-backups-stored-in-your-bucket}

Backups ページには、次のように、バケット内のこれらのバックアップが別のテーブルとして表示されます。

<Image img={view_backups_azure} alt="バケットに保存されているバックアップを表示" size="md" />

</VerticalStepper>

### Azure からバックアップをリストアする {#azure-restore-steps}

Azure からバックアップをリストアするには、以下の手順に従ってください。

<VerticalStepper headerLevel="h5">

##### リストア先となる新しいサービスを作成する {#azure-create-new-service-to-restore-to}

バックアップをリストアするための新しいサービスを作成します。現在は、
新しいサービスへのバックアップのリストアのみをサポートしています。

##### バックアップのリストアに使用する SQL コマンドを取得する {#azure-obtain-sql-command-to-restore-backup}

UI のバックアップ一覧の上にある `access or restore a backup` リンクをクリックして、
バックアップをリストアするための SQL コマンドを取得します。コマンドは次のような形式になり、
ドロップダウンから対象のバックアップを選択して、そのバックアップ専用の
リストアコマンドを取得できます。このコマンドに Azure ストレージアカウントの
接続文字列を追加する必要があります。

<Image img={restore_backups_azure} alt="Azure でバックアップをリストア" size="md" />

:::warning バックアップを別の場所に移動する場合
バックアップを別の場所に移動した場合は、新しい場所を参照するようにリストアコマンドをカスタマイズする必要があります。
:::

:::tip ASYNC コマンド
リストアコマンドに対しては、大規模なリストアのためにオプションで末尾に `ASYNC` コマンドを追加できます。
これにより、非同期的にリストアが実行されるため、接続が失われてもリストア処理は継続されます。
ASYNC コマンドは直ちに成功ステータスを返す点に注意が必要です。
これはリストアが成功したことを意味しません。
リストアが完了し、成功したか失敗したかを確認するには、`system.backups` テーブルを監視する必要があります。
:::

##### バックアップをリストアするための SQL コマンドを実行する {#azure-run-sql-command-to-restore-backup}

新しく作成したサービスの SQL コンソールからリストアコマンドを実行し、
バックアップをリストアします。

</VerticalStepper>
