---
slug: /integrations/clickpipes/postgres/auth
sidebar_label: "AWS IAM DB 認証 (RDS/Aurora)"
title: "AWS IAM DB 認証 (RDS/Aurora)"
description: "本記事では、ClickPipes のお客様がロールベースのアクセス制御を活用して Amazon RDS/Aurora に対して認証を行い、データベースに安全にアクセスする方法を説明します。"
doc_type: 'guide'
keywords: ['clickpipes', 'rds', 'security', 'aws', 'private connection']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

この記事では、ClickPipes を利用するユーザーがロールベースのアクセス制御を活用して Amazon Aurora および RDS に対して認証を行い、データベースに安全にアクセスする方法を説明します。

:::warning
AWS RDS Postgres および Aurora Postgres では、AWS IAM DB Authentication の制限により、`Initial Load Only` の ClickPipes のみを実行できます。

MySQL および MariaDB ではこの制限は適用されないため、`Initial Load Only` と `CDC` の両方の ClickPipes を実行できます。
:::


## セットアップ \{#setup\}

### ClickHouse サービスの IAM ロール ARN を取得する \{#obtaining-the-clickhouse-service-iam-role-arn\}

1 - ClickHouse Cloud アカウントにログインします。

2 - 統合を作成する対象の ClickHouse サービスを選択します。

3 - **Settings** タブを選択します。

4 - ページの下部にある **Network security information** セクションまでスクロールします。

5 - 下図のように、そのサービスに対応する **Service role ID (IAM)** の値をコピーします。

<Image img={secures3_arn} alt="Secure S3 の ARN" size="lg" border/>

この値を `{ClickHouse_IAM_ARN}` と呼ぶことにします。これは、RDS/Aurora インスタンスにアクセスするために使用される IAM ロールです。

### RDS/Aurora インスタンスの構成 \{#configuring-the-rds-aurora-instance\}

#### IAM DB 認証の有効化 \{#enabling-iam-db-authentication\}

1. AWS アカウントにログインし、設定対象の RDS インスタンスを開きます。
2. **Modify** ボタンをクリックします。
3. **Database authentication** セクションまでスクロールします。
4. **Password and IAM database authentication** オプションを有効にします。
5. **Continue** ボタンをクリックします。
6. 変更内容を確認し、**Apply immediately** オプションを選択します。

#### RDS/Aurora のリソース ID の取得 \{#obtaining-the-rds-resource-id\}

1. AWS アカウントにログインし、構成したい RDS インスタンスまたは Aurora クラスターに移動します。
2. **Configuration** タブをクリックします。
3. **Resource ID** の値を確認します。RDS の場合は `db-xxxxxxxxxxxxxx`、Aurora クラスターの場合は `cluster-xxxxxxxxxxxxxx` のような形式になっているはずです。この値を `{RDS_RESOURCE_ID}` とします。これは、RDS インスタンスへのアクセスを許可するために IAM ポリシーで使用されるリソース ID です。

#### データベースユーザーの設定 \{#setting-up-the-database-user\}

##### PostgreSQL \{#setting-up-the-database-user-postgres\}

1. RDS/Aurora インスタンスに接続し、次のコマンドを実行して新しいデータベースユーザーを作成します:
    ```sql
    CREATE USER clickpipes_iam_user; 
    GRANT rds_iam TO clickpipes_iam_user;
    ```
2. [PostgreSQL ソースセットアップガイド](./source/rds)の残りの手順に従って、ClickPipes 用に RDS インスタンスを設定します。

##### MySQL / MariaDB \{#setting-up-the-database-user-mysql\}

1. RDS/Aurora インスタンスに接続し、次のコマンドを実行して新しいデータベースユーザーを作成します。
    ```sql
    CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
    ```
2. [MySQL source setup guide](../mysql/source/rds) の残りの手順に従って、ClickPipes 用に RDS/Aurora インスタンスを構成します。

### IAM ロールの設定 \{#setting-up-iam-role\}

#### IAM ロールを手動で作成する \{#manually-create-iam-role\}

1 - IAM ロールの作成および管理権限を持つ IAM ユーザーで、Web ブラウザから AWS アカウントにログインします。

2 - IAM サービスコンソールを開きます。

3 - 次の IAM ポリシーおよび信頼ポリシーを使用して、新しい IAM ロールを作成します。

信頼ポリシー（`{ClickHouse_IAM_ARN}` を、ClickHouse インスタンス用の IAM ロールの ARN に置き換えてください）:

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

IAM ポリシー（`{RDS_RESOURCE_ID}` をお使いの RDS インスタンスのリソース ID に置き換えてください）。必ず `{RDS_REGION}` をお使いの RDS/Aurora インスタンスのリージョンに、`{AWS_ACCOUNT}` をお使いの AWS アカウント ID に置き換えてください:

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

4 - 作成後に新しい **IAM Role Arn** をコピーします。これは ClickPipes から AWS データベースに安全にアクセスするために必要なものです。この値を `{RDS_ACCESS_IAM_ROLE_ARN}` と呼ぶことにします。

これで、ClickPipes から RDS/Aurora インスタンスに対して認証を行うために、この IAM ロールを使用できるようになりました。
