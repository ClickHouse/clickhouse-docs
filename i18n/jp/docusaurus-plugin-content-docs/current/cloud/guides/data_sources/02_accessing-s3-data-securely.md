---
slug: /cloud/data-sources/secure-s3
sidebar_label: 'S3 データへの安全なアクセス'
title: 'S3 データへの安全なアクセス'
description: 'この記事では、ClickHouse Cloud のお客様がロールベースのアクセス制御を活用して Amazon Simple Storage Service (S3) の認証を行い、データに安全にアクセスする方法を説明します。'
keywords: ['RBAC', 'Amazon S3', '認証']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.png';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

この記事では、ClickHouse Cloud のお客様がロールベースのアクセス制御を利用して Amazon Simple Storage Service (S3) に認証し、データへ安全にアクセスする方法を示します。

## はじめに {#introduction}

セキュアな S3 アクセスの設定に入る前に、その仕組みを理解しておくことが重要です。以下では、ClickHouse の各種サービスが、顧客の AWS アカウント内のロールを引き受けることで、プライベートな S3 バケットへアクセスできる仕組みの概要を示します。

<Image img={secure_s3} size="lg" alt="ClickHouse によるセキュアな S3 アクセスの概要"/>

この方法により、顧客は S3 バケットへのすべてのアクセスを、各バケットのポリシーを個別に確認してアクセス権限を追加・削除することなく、引き受けられるロールに設定された IAM ポリシー 1 箇所で一元的に管理できます。

## セットアップ {#setup}

### ClickHouse サービスの IAM ロール ARN を取得する {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse Cloud アカウントにログインします。

2 - 連携を作成したい ClickHouse サービスを選択します。

3 - **Settings** タブを選択します。

4 - ページ下部の **Network security information** セクションまでスクロールします。

5 - 下図に示すように、そのサービスに対応する **Service role ID (IAM)** の値をコピーします。

<Image img={s3_info} size="lg" alt="ClickHouse サービスの IAM ロール ARN を取得する" border />

### IAM ロールの引き受けの設定 {#setting-up-iam-assume-role}

#### オプション 1: CloudFormation スタックを使用してデプロイする {#option-1-deploying-with-cloudformation-stack}

1 - IAM ロールの作成および管理権限を持つ IAM ユーザーで、ウェブブラウザから自分の AWS アカウントにログインします。

2 - CloudFormation スタックを作成するために [この URL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3) にアクセスします。

3 - ClickHouse サービスに対応する **IAM Role** を入力（またはペースト）します。

4 - CloudFormation スタックを設定します。以下は各パラメータに関する補足情報です。

| Parameter                 | Default Value        | Description                                                                                        |
| :---                      |    :----:            | :----                                                                                              |
| RoleName                  | ClickHouseAccess-001 | ClickHouse Cloud が S3 バケットへアクセスする際に使用する、新しいロールの名前です。                |
| Role Session Name         |      *               | Role Session Name は、共有シークレットとして使用し、バケットをさらに保護するために利用できます。  |
| ClickHouse Instance Roles |                      | この Secure S3 連携を使用できる ClickHouse サービス IAM ロールの、カンマ区切りリストです。        |
| Bucket Access             |    Read              | 指定されたバケットに対するアクセスレベルを設定します。                                              |
| Bucket Names              |                      | このロールがアクセス権を持つ **バケット名** のカンマ区切りリストです。                             |

*注意*: バケットの完全な ARN ではなく、バケット名のみを指定してください。

5 - **I acknowledge that AWS CloudFormation might create IAM resources with custom names.** チェックボックスを選択します。

6 - 右下の **Create stack** ボタンをクリックします。

7 - CloudFormation スタックがエラーなく完了したことを確認します。

8 - CloudFormation スタックの **Outputs** を選択します。

9 - この連携用に **RoleArn** の値をコピーします。これは S3 バケットへアクセスするために必要な値です。

<Image img={s3_output} size="lg" alt="CloudFormation スタックの出力に表示された IAM Role ARN" border />

#### オプション 2: IAM ロールを手動で作成する {#option-2-manually-create-iam-role}

1 - IAM ロールの作成および管理権限を持つ IAM ユーザーで、ウェブブラウザから自分の AWS アカウントにログインします。

2 - IAM サービスコンソールにアクセスします。

3 - 次の IAM ポリシーおよび信頼ポリシーを使用して、新しい IAM ロールを作成します。

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
            "Action": "sts:AssumeRole"
        }
    ]
}
```

IAM ポリシー（`{BUCKET_NAME}` をバケット名に置き換えてください）：

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

4 - 作成後に新しい **IAM Role Arn** をコピーします。これは S3 バケットにアクセスするために必要なものです。

## ClickHouseAccess ロールを使用して S3 バケットにアクセスする {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud では、S3 テーブル関数の一部として `extra_credentials` を指定できる新機能が利用できます。以下は、上で作成した新しいロールを使用してクエリを実行する例です。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

以下は、`role_session_name` を共有シークレットとして使用し、バケットからデータをクエリするサンプルクエリです。`role_session_name` が正しくない場合、この操作は失敗します。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
データ転送料金を抑えるため、ソースの S3 バケットは ClickHouse Cloud サービスと同じリージョンに配置することを推奨します。詳細については [S3 pricing](https://aws.amazon.com/s3/pricing/) を参照してください。
:::
