---
slug: /cloud/security/secure-s3
sidebar_label: 安全にS3データにアクセスする
title: 安全にS3データにアクセスする
---

この記事では、ClickHouse Cloudの顧客が役割ベースのアクセスを利用して、Amazon Simple Storage Service (S3) に認証し、自分のデータに安全にアクセスする方法を示します。

## はじめに {#introduction}

安全なS3アクセスの設定に飛び込む前に、これがどのように機能するかを理解することが重要です。以下は、ClickHouseサービスが顧客のAWSアカウント内の役割に基づいてプライベートS3バケットにアクセスする方法の概要です。

![secures3](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/secures3.jpg)

このアプローチにより、顧客はアクセスを追加または削除するためにすべてのバケットポリシーを通過することなく、単一の場所（アサインされたロールのIAMポリシー）でS3バケットへのすべてのアクセスを管理できます。

## 設定 {#setup}

### ClickHouseサービスのIAMロールArnを取得する {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse Cloudアカウントにログインします。

2 - 統合を作成するClickHouseサービスを選択します。

3 - **設定**タブを選択します。

4 - ページの下部にある**このサービスについて**セクションまでスクロールします。

5 - 下記のように、サービスに属する**IAMロール**の値をコピーします。

![s3info](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/secures3_arn.jpg)

### IAMアサインロールを設定する {#setting-up-iam-assume-role}

#### オプション1: CloudFormationスタックを使ってデプロイ {#option-1-deploying-with-cloudformation-stack}

1 - IAMロールを作成および管理する権限を持つIAMユーザーでAWSアカウントにログインします。

2 - [このURL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3)にアクセスしてCloudFormationスタックを設定します。

3 - ClickHouseサービスに属する**IAMロール**を入力（または貼り付け）します。

4 - CloudFormationスタックを設定します。以下はこれらのパラメーターに関する追加情報です。

| パラメーター              | デフォルト値              | 説明                                                                                            |
| :---                     |    :----:                | :----                                                                                          |
| RoleName                 | ClickHouseAccess-001      | ClickHouse CloudがあなたのS3バケットにアクセスするために使用する新しいロールの名前            |
| Role Session Name        |      *                   | ロールセッション名は、バケットをさらに保護するための共有秘密として使える場合があります。     |
| ClickHouse Instance Roles |                          | このSecure S3統合を使用できるClickHouseサービスのIAMロールのカンマ区切りリスト。              |
| Bucket Access            |    Read                  | 指定されたバケットのアクセスレベルを設定します。                                            |
| Bucket Names             |                          | このロールがアクセスできる**バケット名**のカンマ区切りリスト。                              |

*注意*: フルバケットArnではなく、バケット名のみを入力してください。

5 - **AWS CloudFormationがカスタム名のIAMリソースを作成する可能性があることを承認します。** チェックボックスを選択します。

6 - 右下の**スタックを作成**ボタンをクリックします。

7 - CloudFormationスタックがエラーなく完了することを確認します。

8 - CloudFormationスタックの**出力**を選択します。

9 - この統合のために**RoleArn**値をコピーします。これがあなたのS3バケットにアクセスするために必要です。

![s3info](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/secures3_output.jpg)

#### オプション2: IAMロールを手動で作成する {#option-2-manually-create-iam-role}

1 - IAMロールを作成および管理する権限を持つIAMユーザーでAWSアカウントにログインします。

2 - IAMサービスコンソールに移動します。

3 - 次のIAMポリシーおよび信頼ポリシーで新しいIAMロールを作成します。

信頼ポリシー（`{ClickHouse_IAM_ARN}`を、あなたのClickHouseインスタンスに属するIAMロールarnに置き換えてください）:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "{ClickHouse_IAM_ARN}"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

IAMポリシー（`{BUCKET_NAME}`をあなたのバケット名に置き換えてください）:

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
                "arn:aws:s3:::{BUCKET_NAME}"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "s3:Get*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::{BUCKET_NAME}/*"
            ],
            "Effect": "Allow"
        }
    ]
}
```

4 - 作成後に新しい**IAMロールArn**をコピーします。これがあなたのS3バケットにアクセスするために必要です。

## ClickHouseAccessロールを使ってS3バケットにアクセスする {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloudには、新しく作成した役割をS3テーブル関数の一部として`extra_credentials`として指定する機能があります。以下は、上記からコピーした新しく作成したロールを使用してクエリを実行する方法の例です。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

以下は、バケットからデータをクエリするために`role_session_name`を共有秘密として使用する例クエリです。`role_session_name`が正しくない場合、この操作は失敗します。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
あなたのソースS3がClickHouse Cloudサービスと同じリージョンにあることをお勧めします。そうすることでデータ転送コストを削減できます。詳細については、[S3料金]( https://aws.amazon.com/s3/pricing/)を参照してください。
:::
