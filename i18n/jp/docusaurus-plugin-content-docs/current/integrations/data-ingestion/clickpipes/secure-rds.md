---
slug: /integrations/clickpipes/secure-rds
sidebar_label: 'AWS IAM DB 認証 (RDS/Aurora)'
title: 'AWS IAM DB 認証 (RDS/Aurora)'
description: 'このガイドでは、ClickPipes のお客様がロールベースのアクセス制御を活用して Amazon RDS/Aurora に対する認証を行い、データベースへ安全にアクセスする方法を説明します。'
doc_type: 'guide'
keywords: ['clickpipes', 'rds', 'security', 'aws', 'private connection']
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

この記事では、ClickPipes のお客様がロールベースのアクセス制御を活用して Amazon Aurora および RDS で認証を行い、データベースへ安全にアクセスする方法を説明します。

:::warning
AWS RDS Postgres および Aurora Postgres では、AWS IAM DB Authentication の制約により、`Initial Load Only` の ClickPipes しか実行できません。

MySQL および MariaDB ではこの制約は適用されず、`Initial Load Only` と `CDC` の両方の ClickPipes を実行できます。
:::


## セットアップ {#setup}

### ClickHouseサービスのIAMロールArnの取得 {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse Cloudアカウントにログインします。

2 - 統合を作成するClickHouseサービスを選択します

3 - **Settings**タブを選択します

4 - ページ下部の**Network security information**セクションまでスクロールします

5 - 以下に示すように、サービスに属する**Service role ID (IAM)**の値をコピーします。

<Image img={secures3_arn} alt='Secure S3 ARN' size='lg' border />

この値を`{ClickHouse_IAM_ARN}`と呼びます。これは、RDS/Auroraインスタンスへのアクセスに使用されるIAMロールです。

### RDS/Auroraインスタンスの設定 {#configuring-the-rds-aurora-instance}

#### IAM DB認証の有効化 {#enabling-iam-db-authentication}

1. AWSアカウントにログインし、設定するRDSインスタンスに移動します。
2. **Modify**ボタンをクリックします。
3. **Database authentication**セクションまでスクロールします。
4. **Password and IAM database authentication**オプションを有効にします。
5. **Continue**ボタンをクリックします。
6. 変更内容を確認し、**Apply immediately**オプションをクリックします。

#### RDS/AuroraリソースIDの取得 {#obtaining-the-rds-resource-id}

1. AWSアカウントにログインし、設定するRDSインスタンス/Auroraクラスタに移動します。
2. **Configuration**タブをクリックします。
3. **Resource ID**の値をメモします。RDSの場合は`db-xxxxxxxxxxxxxx`、Auroraクラスタの場合は`cluster-xxxxxxxxxxxxxx`のような形式になります。この値を`{RDS_RESOURCE_ID}`と呼びます。これは、RDSインスタンスへのアクセスを許可するIAMポリシーで使用されるリソースIDです。

#### データベースユーザーのセットアップ {#setting-up-the-database-user}

##### PostgreSQL {#setting-up-the-database-user-postgres}

1. RDS/Auroraインスタンスに接続し、以下のコマンドで新しいデータベースユーザーを作成します：
   ```sql
   CREATE USER clickpipes_iam_user;
   GRANT rds_iam TO clickpipes_iam_user;
   ```
2. [PostgreSQLソースセットアップガイド](postgres/source/rds)の残りの手順に従って、ClickPipes用にRDSインスタンスを設定します。

##### MySQL / MariaDB {#setting-up-the-database-user-mysql}

1. RDS/Auroraインスタンスに接続し、以下のコマンドで新しいデータベースユーザーを作成します：
   ```sql
   CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
   ```
2. [MySQLソースセットアップガイド](mysql/source/rds)の残りの手順に従って、ClickPipes用にRDS/Auroraインスタンスを設定します。

### IAMロールのセットアップ {#setting-up-iam-role}

#### IAMロールの手動作成 {#manually-create-iam-role}

1 - IAMロールの作成と管理の権限を持つIAMユーザーで、WebブラウザからAWSアカウントにログインします。

2 - IAMサービスコンソールに移動します

3 - 以下のIAMポリシーと信頼ポリシーを使用して、新しいIAMロールを作成します。

信頼ポリシー（`{ClickHouse_IAM_ARN}`をClickHouseインスタンスに属するIAMロールのarnに置き換えてください）：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "{ClickHouse_IAM_ARN}"
      },
      "Action": ["sts:AssumeRole", "sts:TagSession"]
    }
  ]
}
```

IAMポリシー（`{RDS_RESOURCE_ID}`をRDSインスタンスのリソースIDに置き換えてください）。`{RDS_REGION}`をRDS/Auroraインスタンスのリージョンに、`{AWS_ACCOUNT}`をAWSアカウントIDに置き換えてください：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["rds-db:connect"],
      "Resource": [
        "arn:aws:rds-db:{RDS_REGION}:{AWS_ACCOUNT}:dbuser:{RDS_RESOURCE_ID}/clickpipes_iam_user"
      ]
    }
  ]
}
```

4 - 作成後、新しい**IAM Role Arn**をコピーします。これは、ClickPipesからAWSデータベースに安全にアクセスするために必要なものです。この値を`{RDS_ACCESS_IAM_ROLE_ARN}`と呼びます。

これで、このIAMロールを使用してClickPipesからRDS/Auroraインスタンスで認証できるようになりました。
