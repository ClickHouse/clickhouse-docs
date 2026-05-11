---
slug: /cloud/data-sources/secure-iceberg
sidebar_label: 'Icebergデータへの安全なアクセス'
title: 'Icebergデータへの安全なアクセス'
description: 'この記事では、ClickHouse Cloud ユーザーがロールベースアクセスを使用して、オブジェクトストレージ内の Apache Iceberg データに安全にアクセスする方法を説明します。'
keywords: ['Iceberg', 'RBAC', 'Amazon S3', '認証']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';

ClickHouse Cloud は、ARN ベースの AWS IAM 信頼関係を利用して、オブジェクトストレージ (通常は S3) に保存された Iceberg データへの安全なロールベースアクセスをサポートします。このガイドでは、[Accessing S3 data securely](/cloud/data-sources/secure-s3) と同じ安全な設定パターンに従い、ClickHouse に Iceberg 固有の設定を追加します。

## 概要 \{#overview\}

* ClickHouse Cloud のサービスロール ID (IAM) を取得します。
* ClickHouse が引き受けられる IAM ロールを AWS アカウントに作成します。
* Iceberg 固有のオブジェクトポリシーとカタログポリシーをロールにアタッチします。
* ロールベースの認証情報を使用して、Iceberg テーブル関数または IcebergS3 テーブルエンジンを使用します。

## ClickHouse のサービスロール ID (ARN) を取得する \{#obtaining-the-clickhouse-service-iam-role-arn\}

<VerticalStepper headerLevel="h3">
  ### 1. ClickHouse Cloud アカウントにログインします。 \{#login\}

  ### 2. Iceberg データをクエリする ClickHouse サービスを選択します。 \{#select-service\}

  ### 3. **設定** タブを開きます。 \{#settings-tab\}

  ### 4. **ネットワーク セキュリティ情報** までスクロールします。 \{#network-security-information\}

  ### 5. **サービスロール ID (IAM)&#x20;**&#x20;の値をコピーします。 \{#service-role-iam-value\}

  この ARN は、Iceberg データにアクセスする AWS IAM ロールの信頼ポリシーで必要になります。

  <Image img={s3_info} size="lg" alt="ClickHouse サービスの IAM ロール ARN を取得する" border />
</VerticalStepper>

## IAM Assume Role をセットアップする \{#setting-up-iam-assume-role\}

<VerticalStepper headerLevel="h3">
  ### 1. AWS にログインし、IAM サービスに移動します。 \{#aws-iam-service\}

  ### 2. `Roles` を選択し、次に `Create role` を選択します。 \{#create-role\}

  `Trusted entity type` で `Custom trust policy` を選択し、ステップ 3 の内容に基づいて値を入力します。

  ### 3. 信頼ポリシーと IAM ポリシーを追加します。 \{#add-trust-iam-policies\}

  `{service-role-id}` を、ClickHouse インスタンスの サービスロール ID (IAM) に置き換えます。

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "ClickHouseServiceRoleTrustPolicy",
        "Effect": "Allow",
        "Action": "sts:AssumeRole",
        "Principal": {
          "AWS": "{service-role-id}"  
        }
      },
      {
        "Sid": "ReadOnlyIcebergS3IAMPolicy",
        "Effect": "Allow",
        "Action": [
          "s3:GetBucketLocation",
          "s3:ListBucket",
          "s3:GetObject",
          "s3:ListMultipartUploadParts",
          "s3:GetObjectVersion",
          "s3:ListBucketVersions"
        ],
        "Resource": [
          "arn:aws:s3:::{your-bucket}",
          "arn:aws:s3:::{your-bucket}/*"
        ]
      },
      {
        "Sid": "OptionalGlueDataCatalogIAMPolicy",
        "Effect": "Allow",
        "Action": [
          "glue:GetDatabase",
          "glue:GetDatabases",
          "glue:GetTable",
          "glue:GetTables",
          "glue:GetPartition",
          "glue:GetPartitions"
        ],
        "Resource": "arn:aws:glue:{region}:{account-id}:*"
      }
    ]
  }
  ```

  :::note
  読み取り/書き込みワークロードでは、IAM ポリシーに `s3:PutObject`、`s3:DeleteObject`、および Iceberg のメタデータを変更するアクションを含める必要があります。上記のサンプルは、保守的な読み取り専用の例です。

  より強力な分離が必要な場合は、リクエスト元を ClickHouse Cloud の VPC エンドポイントに制限してください。このオプションの詳細については、[Secure S3 advanced action control](/docs/cloud/data-sources/secure-s3#advanced-action-control) を参照してください。
  :::

  ### 4. ロールの作成を完了します。 \{#finish-role-creation\}

  a. `Next` をクリックし、権限割り当て画面でもう一度 `Next` をクリックします。

  b. 名前 (例: `iceberg-role-for-clickhouse`) と説明を追加します。

  c. タグを追加します (任意) 。

  d. ポリシーを確認します。

  e. `Create role` を選択します。

  ### 5. 作成後、新しい **IAM Role ARN** をコピーします。 \{#copy-role-arn\}
</VerticalStepper>

## ClickHouse Cloud での Iceberg アクセスを設定する \{#configure-iceberg-access\}

### オプション A: ロール ARN を使用する Iceberg テーブル関数 \{#iceberg-table-function-with-role-arn\}

`NOSIGN` オプションとロールベースの認証情報を指定して、`icebergS3` テーブル関数を使用します。ClickHouse Cloud は STS を呼び出して、そのロールを引き受けます。

```sql
SELECT count(*)
FROM icebergS3(
  'https://{your-bucket}.s3.{region}.amazonaws.com/{iceberg-path}/',
  'NOSIGN',
  extra_credentials(role_arn='arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse', role_session_name='iceberg-session')
);
```

### オプションB: 永続型 Iceberg テーブルエンジン \{#persistent-iceberg-table-engine\}

```sql
CREATE TABLE iceberg_secure (
  id UInt64,
  event_date Date,
  data String
)
ENGINE = IcebergS3(
  'https://{your-bucket}.s3.{region}.amazonaws.com/{iceberg-path}/',
  'NOSIGN',
  extra_credentials(role_arn='arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse')
);
```

### オプション C: Glue カタログ + IcebergS3 \{#glue-catalog-plus-icebergs3\}

```sql
CREATE TABLE my_db.my_table
ENGINE = IcebergS3(
  's3://{your-bucekt}/warehouse/{db}/{table}/',
  'NOSIGN',
  extra_credentials(role_arn='arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse')
)
SETTINGS
  catalog_type = 'glue',
  warehouse = '{your-warehouse}',
  storage_endpoint = 's3://{your-bucket}',
  region = '{region}'
  aws_role_arn = 'arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse';
```

> 注意: Glue カタログ を使用する場合は、IAM ロールに S3 と Glue の両方に対する読み取り権限と一覧表示権限があることを確認してください.

### オプション D: Glue 向け DataLake Catalog \{#datalake-catalog-for-glue\}

:::note
DataLake Catalog for Glue は、バージョン 26.2 で提供予定です。
:::

```sql
CREATE DATABASE glue_test2
ENGINE = DataLakeCatalog
SETTINGS 
    catalog_type = 'glue', 
    region = {region}, 
    aws_role_arn = 'arn:aws:iam::{account-id}:role/iceberg-role-for-clickhouse',
    aws_role_session_name = {session-name},
    SETTINGS
    allow_database_glue_catalog = 1;
```

## アクセスを確認する \{#validate-access\}

1. 簡単なクエリを実行します:

```sql
SELECT * FROM icebergS3('https://{your-bucket}.s3.{region}.amazonaws.com/{iceberg-path}/', 'NOSIGN')
LIMIT 5;
```

2. `AccessDenied` や `InvalidAccessKeyId` などの IAM エラーが発生していないか確認します。

## トラブルシューティング \{#troubelshooting\}

* ClickHouse Cloud のサービス設定で、ロール ARN を確認してください。
* レイテンシーとコストを抑えるため、バケットやオブジェクトが Iceberg クエリと同じリージョンにあることを確認してください。
* Iceberg テーブルのパスが、有効な Iceberg メタデータの場所 (テーブルルート配下の `metadata/v1/...` ファイル) を指していることを確認してください。
* カタログモードでは、AWS Glue コンソールで Glue メタデータとパーティションの可視性を確認してください。