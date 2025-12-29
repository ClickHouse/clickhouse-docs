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

この記事では、ClickHouse Cloud からロールベースのアクセス制御を利用して Amazon Simple Storage Service (S3) に認証し、データへ安全にアクセスする方法を示します。


## はじめに {#introduction}

セキュアな S3 アクセスの設定に入る前に、その仕組みを理解しておくことが重要です。以下では、ClickHouse の各種サービスが、自身の AWS アカウント内のロールを引き受けることで、プライベートな S3 バケットへアクセスできる仕組みの概要を示します。

<Image img={secure_s3} size="lg" alt="ClickHouse によるセキュアな S3 アクセスの概要"/>

この方法により、S3 バケットへのすべてのアクセスを、各バケットのポリシーを個別に確認してアクセス権限を追加・削除することなく、引き受けられるロールに設定された IAM ポリシー 1 箇所で一元的に管理できます。

## セットアップ {#setup}

### ClickHouse サービスの IAM ロール ARN を取得する {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse Cloud アカウントにログインします。

2 - 接続元にする ClickHouse サービスを選択します。

3 - **Settings** タブを選択します。

4 - ページ下部の **Network security information** セクションまでスクロールします。

5 - 下図に示すように、そのサービスに対応する **Service role ID (IAM)** の値をコピーします。

<Image img={s3_info} size="lg" alt="ClickHouse サービスの IAM ロール ARN を取得する" border />

### IAM ロールの引き受けの設定 {#setting-up-iam-assume-role}

#### オプション 1: CloudFormation スタックでデプロイする {#option-1-deploying-with-cloudformation-stack}

1 - IAM ロールを作成および管理できる十分な権限を持つ IAM ユーザーで、Web ブラウザーから AWS アカウントにログインします。

2 - CloudFormation スタックを作成するために [この URL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3) にアクセスします。

3 - [前の手順](#obtaining-the-clickhouse-service-iam-role-arn) でメモしておいた ClickHouse サービスの **IAM Role** を入力します。

4 - CloudFormation スタックを設定します。以下は各パラメーターに関する追加情報です。

| Parameter                 | Default Value        | Description                                                                                        |
| :---                      |    :----:            | :----                                                                                              |
| RoleName                  | ClickHouseAccess-001 | ClickHouse Cloud が S3 バケットにアクセスするために使用する、新しいロールの名前です。                   |
| Role Session Name         |      *               | Role Session Name は、共有シークレットとして使用することで、バケットをさらに保護するために利用できます。                   |
| ClickHouse Instance Roles |                      | このセキュアな S3 連携を利用できる ClickHouse サービス IAM ロールのカンマ区切りリストです。      |
| Bucket Access             |    Read              | 指定したバケットに対するアクセスレベルを設定します。                                                 |
| Bucket Names              |                      | このロールがアクセスできるバケット名のカンマ区切りリストです。**注意:** バケット ARN 全体ではなく、バケット名を使用してください。                       |

5 - **I acknowledge that AWS CloudFormation might create IAM resources with custom names** チェックボックスを選択します。

6 - 右下の **Create stack** ボタンをクリックします。

7 - CloudFormation スタックがエラーなく完了したことを確認します。

8 - CloudFormation スタックの **Outputs** を選択します。

9 - この連携用に **RoleArn** の値をコピーします。これは [次の手順](#access-your-s3-bucket-with-the-clickhouseaccess-role) で S3 バケットへのアクセスを設定する際に必要になります。

<Image img={s3_output} size="lg" alt="IAM Role ARN を表示している CloudFormation スタックの出力" border />

#### オプション 2: IAM ロールを手動で作成する {#option-2-manually-create-iam-role}

1 - IAM ロールの作成および管理権限を持つ IAM ユーザーで、ウェブブラウザから自分の AWS アカウントにログインします。

2 - IAM サービスコンソールにアクセスします。

3 - 次の信頼ポリシーおよび IAM ポリシーを使用して新しい IAM ロールを作成し、`{ClickHouse_IAM_ARN}` を ClickHouse インスタンスに対応する IAM ロール ARN に、`{BUCKET_NAME}` をバケット名に置き換えます。

**信頼ポリシー**

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

**IAM ポリシー**

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

4 - 作成後に新しい **IAM Role Arn** をコピーします。これは[次のステップ](#access-your-s3-bucket-with-the-clickhouseaccess-role)で S3 バケットへのアクセスを設定するために必要です。


## ClickHouseAccess ロールを使用して S3 バケットにアクセスする {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud では、S3 テーブル関数の一部として `extra_credentials` を指定できる新機能が利用できます。以下は、上で作成した新しいロールを使用してクエリを実行する例です。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

以下は、`role_session_name` を共有シークレットとして使用し、バケット内のデータをクエリするクエリ例です。`role_session_name` が正しくない場合、この操作は失敗します。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
データ転送料金を抑えるため、S3 バケットは ClickHouse Cloud サービスと同じリージョンに配置することを推奨します。詳細については [S3 pricing](https://aws.amazon.com/s3/pricing/) を参照してください。
:::


## 高度なアクション制御 {#advanced-action-control}

より厳格なアクセス制御を行うために、[`aws:SourceVpce` 条件](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies-vpc-endpoint.html#example-bucket-policies-restrict-accesss-vpc-endpoint) を使用して、ClickHouse Cloud の VPC エンドポイントから発行されたリクエストのみを受け付けるようにバケットポリシーを制限できます。ご利用の ClickHouse Cloud リージョンの VPC エンドポイントを取得するには、ターミナルを開いて次を実行します。

```bash
# Replace <your-region> with your ClickHouse Cloud region
curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.aws[] | select(.region == "<your-region>") | .s3_endpoints[]'
```

次に、取得したエンドポイントを使用して、IAM ポリシーに Deny ルールを追加します。

```json
{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "VisualEditor0",
                "Effect": "Allow",
                "Action": [
                    "s3:List*",
                    "s3:Get*"
                ],
                "Resource": [
                    "arn:aws:s3:::{BUCKET_NAME}",
                    "arn:aws:s3:::{BUCKET_NAME}/*"
                ]
            },
            {
                "Sid": "VisualEditor3",
                "Effect": "Deny",
                "Action": [
                    "s3:GetObject"
                ],
                "Resource": "*",
                "Condition": {
                    "StringNotEquals": {
                        "aws:SourceVpce": [
                            "{ClickHouse VPC ID from your S3 region}",
                            "{ClickHouse VPC ID from your S3 region}",
                            "{ClickHouse VPC ID from your S3 region}"
                        ]
                    }
                }
            }
        ]
}
```

ClickHouse Cloud サービスのエンドポイントへのアクセス方法の詳細については、[Cloud IP Addresses](/manage/data-sources/cloud-endpoints-api) を参照してください。
