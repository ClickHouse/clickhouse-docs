---
slug: /cloud/data-sources/secure-gcs
sidebar_label: 'GCS データに安全にアクセスする'
title: 'GCS データに安全にアクセスする'
description: 'この記事では、ClickHouse Cloud をご利用のお客様が GCS データに安全にアクセスする方法を説明します'
keywords: ['GCS']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import IAM_and_admin from '@site/static/images/cloud/guides/accessing-data/GCS/IAM_and_admin.png';
import create_service_account from '@site/static/images/cloud/guides/accessing-data/GCS/create_service_account.png';
import create_and_continue from '@site/static/images/cloud/guides/accessing-data/GCS/create_and_continue.png';
import storage_object_user_role from '@site/static/images/cloud/guides/accessing-data/GCS/storage_object_user.png';
import note_service_account_email from '@site/static/images/cloud/guides/accessing-data/GCS/note_service_account_email.png';
import cloud_storage_settings from '@site/static/images/cloud/guides/accessing-data/GCS/cloud_storage_settings.png';
import create_key_for_service_account from '@site/static/images/cloud/guides/accessing-data/GCS/create_key_for_service_account.png';
import create_key from '@site/static/images/cloud/guides/accessing-data/GCS/create_a_key.png';
import clickpipes_hmac_key from '@site/static/images/cloud/guides/accessing-data/GCS/clickpipes_hmac_key.png';

このガイドでは、Google Cloud Storage (GCS) に安全に認証し、ClickHouse Cloud からデータにアクセスする方法を説明します。


## はじめに \\{#introduction\\}

ClickHouse Cloud は、Google Cloud サービスアカウントに関連付けられた HMAC (Hash-based Message Authentication Code) キーを使用して GCS に接続します。
この方法により、クエリ内に認証情報を直接埋め込むことなく、GCS バケットに安全にアクセスできます。

動作の流れは次のとおりです:

1. 適切な GCS 権限を持つ Google Cloud サービスアカウントを作成します
2. そのサービスアカウント用の HMAC キーを生成します
3. これらの HMAC 認証情報を ClickHouse Cloud に設定します
4. ClickHouse Cloud はこれらの認証情報を使用して GCS バケットにアクセスします

この方法では、サービスアカウントに対する IAM ポリシーを通じて GCS バケットへのすべてのアクセスを管理できるため、個々のバケットポリシーを変更することなく、アクセス権の付与や取り消しを容易に行えます。

## 前提条件 \\{#prerequisites\\}

このガイドに従うには、次のものが必要です。

- 有効な ClickHouse Cloud サービス
- Cloud Storage が有効になっている Google Cloud プロジェクト
- GCP プロジェクトでサービスアカウントを作成し、HMAC キーを生成する権限

## セットアップ \\{#setup\\}

<VerticalStepper headerLevel="h3">
  ### Google Cloud サービスアカウントを作成する

  1. Google Cloud Console で、[IAM と管理] → [サービス アカウント] に移動します

  <Image img={IAM_and_admin} size="md" alt="" />

  2. 左側のメニューで`Service accounts`をクリックし、次に`Create service account`をクリックします。

  <Image img={create_service_account} size="md" alt="" />

  サービスアカウントの名前と説明を入力してください。例：

  ```text
  Service account name: clickhouse-gcs-access (or your preferred name)
  Service account description: Service account for ClickHouse Cloud to access GCS buckets
  ```

  `Create and continue`をクリックします

  <Image img={create_and_continue} size="sm" alt="" />

  サービスアカウントに `Storage Object User` ロールを付与します:

  <Image img={storage_object_user_role} size="sm" alt="" />

  このロールは、GCSオブジェクトへの読み取りおよび書き込みアクセスを提供します

  :::tip
  読み取り専用アクセスには、代わりに `Storage Object Viewer` を使用してください
  より細かい制御が必要な場合は、カスタムロールを作成できます
  :::

  `Continue`をクリックし、次に`Done`をクリックします

  サービスアカウントのメールアドレスをメモしてください:

  <Image img={note_service_account_email} size="md" alt="" />

  ### サービスアカウントにバケットへのアクセス権を付与する

  アクセス権は、プロジェクトレベルまたは個別のバケットレベルで付与できます。

  #### オプション1: 特定のバケットへのアクセスを許可（推奨）

  1. `Cloud Storage` → `Buckets` を開きます
  2. アクセス権を付与するバケットをクリックします
  3. `Permissions` タブを開きます
  4. 「Permissions」で、前の手順で作成したプリンシパルの `Grant access` をクリックします
  5. &quot;New principals&quot; フィールドにサービス アカウントのメールアドレスを入力します
  6. 該当するロールを選択してください:

  * 読み取り/書き込みアクセス権を持つ Storage Object USER
  * 読み取り専用アクセス用 Storage Object Viewer

  7. `Save` をクリックします。
  8. 追加のバケットがある場合は、同じ手順を繰り返します

  #### オプション2: プロジェクトレベルのアクセス権限を付与する

  1. 「IAM と管理」→「IAM」に移動します
  2. `Grant access` をクリックします
  3. サービスアカウントのメールアドレスを `New principals` フィールドに入力します
  4. Storage Object User（読み取り専用とする場合は Storage Object Viewer）を選択します。
  5. [SAVE] をクリックします

  :::warning セキュリティのベストプラクティス
  プロジェクト全体の権限ではなく、ClickHouseがアクセスする必要のある特定のバケットのみにアクセス権を付与してください。
  :::

  ### サービスアカウントのHMAC鍵を生成する

  `Cloud Storage` → `Settings` → `Interoperability`に移動します:

  <Image img={cloud_storage_settings} size="sm" alt="" />

  「Access keys」セクションが表示されない場合は、`Enable interoperability access` をクリックします

  「サービスアカウント用のアクセスキー」の下で、`Create a key for a service account`をクリックします:

  <Image img={create_key_for_service_account} size="md" alt="" />

  先ほど作成したサービスアカウントを選択します(例:clickhouse-gcs-access@your-project.iam.gserviceaccount.com)

  `Create key`をクリックします。

  <Image img={create_key} size="md" alt="" />

  HMACキーが表示されます。
  アクセスキーとシークレットの両方を直ちに保存してください。シークレットは後から再表示できません。

  以下にキーの例を示します:

  ```vbnet
  Access Key: GOOG1EF4YBJVNFQ2YGCP3SLV4Y7CMFHW7HPC6EO7RITLJDDQ75639JK56SQVD
  Secret: nFy6DFRr4sM9OnV6BG4FtWVPR25JfqpmcdZ6w9nV
  ```

  :::danger 重要
  これらの認証情報は安全に保管してください。
  この画面を閉じると、シークレットを再度取得することはできません。
  シークレットを紛失した場合は、新しいキーを生成する必要があります。
  :::

  ## ClickHouse CloudでHMACキーを使用する

  これで、HMAC認証情報を使用してClickHouse CloudからGCSにアクセスできるようになりました。
  これには、GCSテーブル関数を使用します:

  ```sql
  SELECT *
  FROM gcs(
      'https://storage.googleapis.com/clickhouse-docs-example-bucket/epidemiology.csv',
      'GOOG1E...YOUR_ACCESS_KEY',
      'YOUR_SECRET_KEY',
      'CSVWithNames'
  );
  ```

  複数のファイルにはワイルドカードを使用してください:

  ```sql
  SELECT *
  FROM gcs(
  'https://storage.googleapis.com/clickhouse-docs-example-bucket/*.parquet',
  'GOOG1E...YOUR_ACCESS_KEY',
  'YOUR_SECRET_KEY',
  'Parquet'
  );
  ```

  ## GCS向けClickPipesでのHMAC認証

  ClickPipesは、Google Cloud Storageへの認証にHMAC（Hash-based Message Authentication Code）キーを使用します。

  [GCS ClickPipeをセットアップ](/integrations/clickpipes/object-storage/gcs/get-started)する際:

  1. ClickPipe のセットアップ時に、`Authentication method` で `Credentials` を選択します
  2. 前の手順で取得した HMAC 認証情報を入力します

  <Image img={clickpipes_hmac_key} size="md" alt="" />

  :::note
  サービスアカウント認証は現在サポートされていません。HMAC キーを使用してください。
  GCS バケット URL は `https://storage.googleapis.com/<bucket>/<path>` の形式で指定してください(`gs://` 形式は使用できません)。
  :::

  HMACキーは、`roles/storage.objectViewer`ロールを持つサービスアカウントに関連付ける必要があります。このロールには以下が含まれます:

  * `storage.objects.list`: バケット内のオブジェクトを一覧表示する
  * `storage.objects.get`: オブジェクトを取得／読み取りする
</VerticalStepper>

## ベストプラクティス {#best-practices}

### 環境ごとに個別のサービスアカウントを使用する \\{#separate-service-accounts\\}

開発、ステージング、本番といった各環境ごとに、個別のサービスアカウントを作成します。例えば:

- `clickhouse-gcs-dev@project.iam.gserviceaccount.com`
- `clickhouse-gcs-staging@project.iam.gserviceaccount.com`
- `clickhouse-gcs-prod@project.iam.gserviceaccount.com`

これにより、他の環境に影響を与えることなく、特定の環境へのアクセスだけを簡単に取り消せます。

### 最小権限アクセスを適用する {#apply-least-privilege-access}

必要最小限の権限のみを付与します。

- 読み取り専用アクセスには **Storage Object Viewer** を使用する
- プロジェクト全体ではなく特定のバケットにのみアクセスを付与する
- 特定のパスへのアクセスを制限するため、バケットレベルの条件の利用を検討する

### HMAC キーを定期的にローテーションする {#rotate-hmac-keys}

キーのローテーションスケジュールを実装します:

- 新しい HMAC キーを生成する
- ClickHouse の設定を新しいキーに更新する
- 新しいキーで動作を確認する
- 古い HMAC キーを削除する

:::tip
Google Cloud は HMAC キーの有効期限を強制しないため、独自のローテーションポリシーを実装する必要があります。
:::

### Cloud Audit Logs でアクセスを監視する \\{#monitor-access\\}

Cloud Storage 用に Cloud Audit Logs を有効化し、アクセスを監視します:

1. IAM &amp; Admin → Audit Logs に移動します
2. 一覧から Cloud Storage を探します
3. `Admin Read`、`Data Read`、`Data Write logs` を有効にします
4. これらのログを使用してアクセスパターンを監視し、異常を検知します