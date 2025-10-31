---
'slug': '/integrations/clickpipes/secure-rds'
'sidebar_label': 'AWS IAM DB 認証 (RDS/Aurora)'
'title': 'AWS IAM DB 認証 (RDS/Aurora)'
'description': 'この記事では、ClickPipes の顧客が Amazon RDS/Aurora との認証に役立つロールベースのアクセスを利用し、自分の
  DATABASE に安全にアクセスする方法を示します。'
'doc_type': 'guide'
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

この文書では、ClickPipes の顧客がロールベースのアクセスを活用して、Amazon Aurora および RDS に認証し、データベースに安全にアクセスできる方法を示します。

:::warning
AWS RDS Postgres と Aurora Postgres では、AWS IAM DB 認証の制限により、`Initial Load Only` ClickPipes のみを実行できます。

MySQL および MariaDB については、この制限は適用されず、`Initial Load Only` および `CDC` ClickPipes の両方を実行できます。
:::

## セットアップ {#setup}

### ClickHouseサービス IAMロール Arn の取得 {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse クラウドアカウントにログインします。

2 - 統合を作成する ClickHouse サービスを選択します。

3 - **設定**タブを選択します。

4 - ページの下部にある **ネットワークセキュリティ情報**セクションまでスクロールします。

5 - 以下に示すように、サービスに属する **サービスロール ID (IAM)** の値をコピーします。

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

この値を `{ClickHouse_IAM_ARN}` と呼びましょう。これは RDS/Aurora インスタンスにアクセスするために使用される IAM ロールです。

### RDS/Aurora インスタンスの構成 {#configuring-the-rds-aurora-instance}

#### IAM DB 認証の有効化 {#enabling-iam-db-authentication}
1. AWS アカウントにログインし、構成したい RDS インスタンスに移動します。
2. **変更**ボタンをクリックします。
3. **データベース認証**セクションまでスクロールします。
4. **パスワードおよび IAM データベース認証**オプションを有効にします。
5. **続ける**ボタンをクリックします。
6. 変更を確認し、**すぐに適用**オプションをクリックします。

#### RDS/Aurora リソース ID の取得 {#obtaining-the-rds-resource-id}

1. AWS アカウントにログインし、構成したい RDS/Aurora インスタンスに移動します。
2. **構成**タブをクリックします。
3. **リソース ID**の値に注意します。これは `db-xxxxxxxxxxxxxx` のように見えます。この値を `{RDS_RESOURCE_ID}` と呼びましょう。これは、RDS インスタンスへのアクセスを許可するために IAM ポリシーで使用されるリソース ID です。

#### データベースユーザーの設定 {#setting-up-the-database-user}

##### PostgreSQL {#setting-up-the-database-user-postgres}

1. RDS/Aurora インスタンスに接続し、次のコマンドを使用して新しいデータベースユーザーを作成します：
```sql
CREATE USER clickpipes_iam_user; 
GRANT rds_iam TO clickpipes_iam_user;
```
2. [PostgreSQL ソースセットアップガイド](postgres/source/rds) の残りの手順に従って、ClickPipes 用に RDS インスタンスを構成します。

##### MySQL / MariaDB {#setting-up-the-database-user-mysql}

1. RDS/Aurora インスタンスに接続し、次のコマンドを使用して新しいデータベースユーザーを作成します：
```sql
CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
```
2. [MySQL ソースセットアップガイド](mysql/source/rds) の残りの手順に従って、ClickPipes 用に RDS/Aurora インスタンスを構成します。

### IAMロールの設定 {#setting-up-iam-role}

#### IAM ロールを手動で作成します。 {#manually-create-iam-role}

1 - IAM ユーザーとしてブラウザで AWS アカウントにログインし、IAM ロールの作成と管理を行う権限を持つことを確認します。

2 - IAM サービスコンソールに移動します。

3 - 次の IAM および信頼ポリシーを使用して新しい IAM ロールを作成します。

信頼ポリシー（`{ClickHouse_IAM_ARN}` をあなたの ClickHouse インスタンスに属する IAM ロールの arn に置き換えてください）：

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

IAM ポリシー（`{RDS_RESOURCE_ID}` をあなたの RDS インスタンスのリソース ID に置き換えてください）。また、`{RDS_REGION}` をあなたの RDS/Aurora インスタンスのリージョンと、`{AWS_ACCOUNT}` をあなたの AWS アカウント ID に置き換えてください：

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

4 - 作成後に新しい **IAM ロール Arn** をコピーします。これは、ClickPipes から AWS データベースに安全にアクセスするために必要です。この値を `{RDS_ACCESS_IAM_ROLE_ARN}` と呼びましょう。

これで、この IAM ロールを使用して ClickPipes から RDS/Aurora インスタンスに認証できます。
