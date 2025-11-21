---
slug: /cloud/data-sources/secure-s3
sidebar_label: 'S3 データへの安全なアクセス'
title: 'S3 データへの安全なアクセス'
description: 'この記事では、ClickHouse Cloud のお客様がロールベースのアクセス制御を活用して Amazon Simple Storage Service (S3) に対して認証を行い、安全にデータにアクセスする方法を説明します。'
keywords: ['RBAC', 'Amazon S3', '認証']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

この記事では、ClickHouse Cloud のお客様がロールベースのアクセスを利用して Amazon Simple Storage Service (S3) に認証し、データに安全にアクセスする方法を説明します。


## はじめに {#introduction}

セキュアなS3アクセスの設定を始める前に、その仕組みを理解することが重要です。以下は、ClickHouseサービスが顧客のAWSアカウント内のロールを引き受けることで、プライベートS3バケットにアクセスする方法の概要です。

<Image
  img={secure_s3}
  size='md'
  alt='ClickHouseによるセキュアなS3アクセスの概要'
/>

このアプローチにより、顧客は単一の場所(引き受けロールのIAMポリシー)でS3バケットへのすべてのアクセスを管理でき、アクセスの追加や削除のために各バケットポリシーを個別に確認する必要がありません。


## セットアップ {#setup}

### ClickHouseサービスのIAMロールARNの取得 {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse Cloudアカウントにログインします。

2 - 統合を作成するClickHouseサービスを選択します。

3 - **Settings**タブを選択します。

4 - ページ下部の**Network security information**セクションまでスクロールします。

5 - 以下に示すように、サービスに属する**Service role ID (IAM)**の値をコピーします。

<Image
  img={s3_info}
  size='lg'
  alt='ClickHouseサービスのIAMロールARNの取得'
  border
/>

### IAM AssumeRoleの設定 {#setting-up-iam-assume-role}

#### オプション1: CloudFormationスタックを使用したデプロイ {#option-1-deploying-with-cloudformation-stack}

1 - IAMロールの作成と管理の権限を持つIAMユーザーで、WebブラウザからAWSアカウントにログインします。

2 - [このURL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3)にアクセスして、CloudFormationスタックを作成します。

3 - ClickHouseサービスに属する**IAM Role**を入力(または貼り付け)します。

4 - CloudFormationスタックを設定します。以下は、これらのパラメータに関する追加情報です。

| パラメータ                 |    デフォルト値     | 説明                                                                                   |
| :------------------------ | :------------------: | :-------------------------------------------------------------------------------------------- |
| RoleName                  | ClickHouseAccess-001 | ClickHouse CloudがS3バケットへのアクセスに使用する新しいロールの名前              |
| Role Session Name         |          \*          | Role Session Nameは、バケットをさらに保護するための共有シークレットとして使用できます。              |
| ClickHouse Instance Roles |                      | このSecure S3統合を使用できるClickHouseサービスのIAMロールのカンマ区切りリスト。 |
| Bucket Access             |         Read         | 指定されたバケットのアクセスレベルを設定します。                                            |
| Bucket Names              |                      | このロールがアクセスできる**バケット名**のカンマ区切りリスト。                  |

_注意_: 完全なバケットARNではなく、バケット名のみを入力してください。

5 - **I acknowledge that AWS CloudFormation might create IAM resources with custom names.**チェックボックスを選択します。

6 - 右下の**Create stack**ボタンをクリックします。

7 - CloudFormationスタックがエラーなく完了することを確認します。

8 - CloudFormationスタックの**Outputs**を選択します。

9 - この統合の**RoleArn**値をコピーします。これがS3バケットへのアクセスに必要な値です。

<Image
  img={s3_output}
  size='lg'
  alt='IAMロールARNを示すCloudFormationスタックの出力'
  border
/>

#### オプション2: IAMロールの手動作成 {#option-2-manually-create-iam-role}

1 - IAMロールの作成と管理の権限を持つIAMユーザーで、WebブラウザからAWSアカウントにログインします。

2 - IAMサービスコンソールに移動します。

3 - 以下のIAMポリシーと信頼ポリシーを使用して、新しいIAMロールを作成します。

信頼ポリシー(`{ClickHouse_IAM_ARN}`をClickHouseインスタンスに属するIAMロールARNに置き換えてください):

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

IAMポリシー(`{BUCKET_NAME}`をバケット名に置き換えてください):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::{BUCKET_NAME}"],
      "Effect": "Allow"
    },
    {
      "Action": ["s3:Get*", "s3:List*"],
      "Resource": ["arn:aws:s3:::{BUCKET_NAME}/*"],
      "Effect": "Allow"
    }
  ]
}
```

4 - 作成後、新しい**IAM Role Arn**をコピーします。これがS3バケットへのアクセスに必要な値です。


## ClickHouseAccessロールを使用したS3バケットへのアクセス {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloudには、S3テーブル関数の一部として`extra_credentials`を指定できる新機能があります。以下は、上記で作成したロールを使用してクエリを実行する例です。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

以下は、`role_session_name`を共有シークレットとして使用してバケットからデータをクエリする例です。`role_session_name`が正しくない場合、この操作は失敗します。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
データ転送コストを削減するため、ソースS3をClickHouse Cloudサービスと同じリージョンに配置することを推奨します。詳細については、[S3の料金](https://aws.amazon.com/s3/pricing/)を参照してください。
:::
