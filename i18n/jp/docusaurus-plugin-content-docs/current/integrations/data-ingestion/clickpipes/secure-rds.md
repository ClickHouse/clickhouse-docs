---
slug: /integrations/clickpipes/secure-rds
sidebar_label: 'AWS IAM DB 認証 (RDS/Aurora)'
title: 'AWS IAM DB 認証 (RDS/Aurora)'
description: 'このガイドでは、ClickPipes のお客様がロールベースのアクセス制御を利用して Amazon RDS/Aurora に対して認証を行い、データベースへ安全にアクセスする方法を説明します。'
doc_type: 'guide'
keywords: ['clickpipes', 'rds', 'セキュリティ', 'aws', 'プライベート接続']
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

この記事では、ClickPipes ユーザーがロールベースのアクセス制御を活用して Amazon Aurora および Amazon RDS に対する認証を行い、データベースへ安全にアクセスする方法を説明します。

:::warning
AWS RDS Postgres および Aurora Postgres では、AWS IAM DB Authentication の制約により、`Initial Load Only` の ClickPipes のみを利用できます。

MySQL および MariaDB ではこの制約は適用されず、`Initial Load Only` と `CDC` の両方の ClickPipes を利用できます。
:::

## セットアップ {#setup}

### ClickHouse サービスの IAM ロール ARN の取得 {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse Cloud アカウントにログインします。

2 - 連携を作成したい対象の ClickHouse サービスを選択します。

3 - **Settings** タブを選択します。

4 - ページ下部の **Network security information** セクションまでスクロールします。

5 - 下図のように、そのサービスに対応する **Service role ID (IAM)** の値をコピーします。

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border />

この値を `{ClickHouse_IAM_ARN}` と呼ぶことにします。これは、RDS/Aurora インスタンスへアクセスするために使用する IAM ロールです。

### RDS/Aurora インスタンスの設定 {#configuring-the-rds-aurora-instance}

#### IAM DB 認証の有効化 {#enabling-iam-db-authentication}

1. AWS アカウントにログインし、設定したい RDS インスタンスに移動します。
2. **Modify** ボタンをクリックします。
3. **Database authentication** セクションまでスクロールします。
4. **Password and IAM database authentication** オプションを有効化します。
5. **Continue** ボタンをクリックします。
6. 変更内容を確認し、**Apply immediately** オプションをクリックします。

#### RDS/Aurora Resource ID の取得 {#obtaining-the-rds-resource-id}

1. AWS アカウントにログインし、設定したい RDS インスタンス / Aurora クラスターに移動します。
2. **Configuration** タブをクリックします。
3. **Resource ID** の値を確認します。RDS の場合は `db-xxxxxxxxxxxxxx`、Aurora クラスターの場合は `cluster-xxxxxxxxxxxxxx` のような形式です。この値を `{RDS_RESOURCE_ID}` と呼ぶことにします。これは、RDS インスタンスへのアクセスを許可する IAM ポリシー内で使用する Resource ID です。

#### データベースユーザーの設定 {#setting-up-the-database-user}

##### PostgreSQL {#setting-up-the-database-user-postgres}

1. RDS/Aurora インスタンスに接続し、次のコマンドで新しいデータベースユーザーを作成します:
   ```sql
    CREATE USER clickpipes_iam_user; 
    GRANT rds_iam TO clickpipes_iam_user;
    ```
2. RDS インスタンスを ClickPipes 用に設定するため、[PostgreSQL source setup guide](postgres/source/rds) に記載されている残りの手順に従います。

##### MySQL / MariaDB {#setting-up-the-database-user-mysql}

1. RDS/Aurora インスタンスに接続し、次のコマンドで新しいデータベースユーザーを作成します:
   ```sql
    CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
    ```
2. RDS/Aurora インスタンスを ClickPipes 用に設定するため、[MySQL source setup guide](mysql/source/rds) に記載されている残りの手順に従います。

### IAM ロールの設定 {#setting-up-iam-role}

#### IAM ロールを手動で作成する {#manually-create-iam-role}

1 - IAM ロールの作成および管理権限を持つ IAM ユーザーで、Web ブラウザから AWS アカウントにログインします。

2 - IAM サービスコンソールに移動します。

3 - 次の IAM ポリシーおよび信頼ポリシーを使用して新しい IAM ロールを作成します。

信頼ポリシー（`{ClickHouse_IAM_ARN}` を、ClickHouse インスタンスに対応する IAM ロール ARN に置き換えてください）:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "{ClickHouse_IAM_ARN}"
      },
      "Action": [
        "sts:AssumeRole",
        "sts:TagSession"
      ]
    }
  ]
}
```

IAM ポリシー（`{RDS_RESOURCE_ID}` をお使いの RDS インスタンスのリソース ID に置き換えてください）。必ず `{RDS_REGION}` を RDS/Aurora インスタンスのリージョンに、`{AWS_ACCOUNT}` を AWS アカウント ID に置き換えてください：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rds-db:connect"
      ],
      "Resource": [
        "arn:aws:rds-db:{RDS_REGION}:{AWS_ACCOUNT}:dbuser:{RDS_RESOURCE_ID}/clickpipes_iam_user"
      ]
    }
  ]
}
```

4 - 作成後に新しい **IAM ロール ARN** をコピーします。これは ClickPipes から AWS データベースへ安全にアクセスするために必要となるものです。これを `{RDS_ACCESS_IAM_ROLE_ARN}` と呼ぶことにします。

これで、ClickPipes から RDS/Aurora インスタンスに対する認証に、この IAM ロールを使用できるようになりました。
