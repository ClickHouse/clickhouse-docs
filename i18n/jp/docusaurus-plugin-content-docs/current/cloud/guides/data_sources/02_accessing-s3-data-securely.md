---
slug: /cloud/data-sources/secure-s3
sidebar_label: 'S3 データへ安全にアクセスする'
title: 'S3 データへ安全にアクセスする'
description: 'この記事では、ClickHouse Cloud のお客様がロールベースのアクセス制御を活用して Amazon Simple Storage Service（S3）で認証を行い、データへ安全にアクセスする方法を説明します。'
keywords: ['RBAC', 'Amazon S3', '認証']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

この記事では、ClickHouse Cloud のユーザーがロールベースアクセスを活用して Amazon Simple Storage Service (S3) に対して認証を行い、データに安全にアクセスする方法を説明します。


## はじめに {#introduction}

安全な S3 アクセスの構成に入る前に、その仕組みを理解しておくことが重要です。以下では、ClickHouse の各種サービスが、顧客の AWS アカウント内のロールを引き受けることで、プライベート S3 バケットへアクセスする方法の概要を示します。

<Image img={secure_s3} size="md" alt="ClickHouse による安全な S3 アクセスの概要"/>

この方式により、顧客は S3 バケットへのすべてのアクセスを 1 か所（引き受けたロールの IAM ポリシー）で一元管理できるようになり、すべてのバケットポリシーを個別に確認してアクセス権を追加・削除する必要がなくなります。



## セットアップ {#setup}

### ClickHouse サービスの IAM ロール ARN の取得 {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse Cloud アカウントにログインします。

2 - 連携を作成したい ClickHouse サービスを選択します。

3 - **Settings** タブを選択します。

4 - ページ下部にある **Network security information** セクションまでスクロールします。

5 - 下図のように、そのサービスに対応する **Service role ID (IAM)** の値をコピーします。

<Image img={s3_info} size="lg" alt="ClickHouse サービスの IAM ロール ARN の取得" border />

### IAM Assume Role の設定 {#setting-up-iam-assume-role}

#### オプション 1: CloudFormation スタックでデプロイする {#option-1-deploying-with-cloudformation-stack}

1 - IAM ロールの作成および管理権限を持つ IAM ユーザーで、Web ブラウザから AWS アカウントにログインします。

2 - [この URL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml\&stackName=ClickHouseSecureS3) にアクセスして CloudFormation スタックを作成します。

3 - ClickHouse サービスに紐づく **IAM Role** を入力（または貼り付け）します。

4 - CloudFormation スタックを設定します。以下は各パラメータの補足情報です。

| Parameter                 |     Default Value    | 説明                                                            |
| :------------------------ | :------------------: | :------------------------------------------------------------ |
| RoleName                  | ClickHouseAccess-001 | ClickHouse Cloud があなたの S3 バケットにアクセスするために使用する新しいロールの名前         |
| Role Session Name         |           *          | Role Session Name は共有シークレットとして使用でき、バケットをさらに保護するのに役立ちます。       |
| ClickHouse Instance Roles |                      | この Secure S3 連携を利用できる ClickHouse サービスの IAM ロールを、カンマ区切りで指定します。 |
| Bucket Access             |         Read         | 指定したバケットに対するアクセスレベルを設定します。                                    |
| Bucket Names              |                      | このロールがアクセスできる **バケット名** を、カンマ区切りで指定します。                       |

*注意*: バケットの完全な ARN ではなく、バケット名のみを指定してください。

5 - **I acknowledge that AWS CloudFormation might create IAM resources with custom names.** チェックボックスを選択します。

6 - 右下の **Create stack** ボタンをクリックします。

7 - CloudFormation スタックの作成がエラーなく完了したことを確認します。

8 - CloudFormation スタックの **Outputs** タブを選択します。

9 - この連携用に **RoleArn** の値をコピーします。これは S3 バケットへアクセスする際に必要となる値です。

<Image img={s3_output} size="lg" alt="IAM ロール ARN を示す CloudFormation スタックの出力" border />

#### オプション 2: IAM ロールを手動で作成する {#option-2-manually-create-iam-role}

1 - IAM ロールの作成および管理権限を持つ IAM ユーザーで、Web ブラウザから AWS アカウントにログインします。

2 - IAM Service Console を開きます。

3 - 以下の IAM ポリシーおよび信頼ポリシーを使用して、新しい IAM ロールを作成します。

信頼ポリシー（`{ClickHouse_IAM_ARN}` を、お使いの ClickHouse インスタンスに対応する IAM ロール ARN に置き換えてください）:

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

IAM ポリシー（`{BUCKET_NAME}` をバケット名に置き換えてください）:

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

4 - 作成後、新しい **IAM ロール ARN** をコピーします。これは S3 バケットにアクセスするために必要なものです。


## ClickHouseAccess ロールで S3 バケットにアクセスする {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud には、S3 テーブル関数内で `extra_credentials` を指定できる新機能があります。以下は、前述の手順で作成した新しいロールを使ってクエリを実行する例です。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

以下は、`role_session_name` を共有シークレットとして用いてバケット内のデータをクエリする例です。`role_session_name` が正しくない場合、この操作は失敗します。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
データ転送料金を抑えるため、ソースの S3 は ClickHouse Cloud サービスと同じリージョンに配置することを推奨します。詳細は [S3 pricing](https://aws.amazon.com/s3/pricing/) を参照してください。
:::
