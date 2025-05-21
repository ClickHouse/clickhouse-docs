---
slug: /cloud/security/secure-s3
sidebar_label: '安全にS3データにアクセスする'
title: '安全にS3データにアクセスする'
description: 'この記事では、ClickHouse Cloudの顧客が役割ベースのアクセスを利用して、Amazon Simple Storage Service(S3)で認証し、安全にデータにアクセスする方法を示します。'
---
```

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

この記事では、ClickHouse Cloudの顧客が役割ベースのアクセスを利用して、Amazon Simple Storage Service(S3)で認証し、安全にデータにアクセスする方法を示します。

## 概要 {#introduction}

安全なS3アクセスのセットアップに入る前に、これがどのように機能するかを理解することが重要です。以下は、クリックハウスサービスが顧客のAWSアカウント内の役割を引き受けることによってプライベートS3バケットにアクセスする方法の概要です。

<Image img={secure_s3} size="md" alt="ClickHouseによる安全なS3アクセスの概要"/>

このアプローチにより、顧客は役割を引き受けたIAMポリシーの1か所で、S3バケットへのすべてのアクセスを管理できるため、アクセスを追加または削除するためにすべてのバケットポリシーを確認する必要がありません。

## セットアップ {#setup}

### ClickHouseサービスのIAMロールArnを取得する {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouseクラウドアカウントにログインします。

2 - 統合を作成したいClickHouseサービスを選択します。

3 - **設定**タブを選択します。

4 - ページの下部にある**ネットワークセキュリティ情報**セクションまでスクロールします。

5 - 下記に示すように、サービスに該当する**サービスロールID(IAM)**の値をコピーします。

<Image img={s3_info} size="lg" alt="ClickHouseサービスのIAMロールARNを取得する" border />

### IAM役割の付与設定 {#setting-up-iam-assume-role}

#### オプション1: CloudFormationスタックでデプロイする {#option-1-deploying-with-cloudformation-stack}

1 - IAMユーザーとしてAWSアカウントにウェブブラウザでログインし、IAMロールを作成・管理する権限を持つユーザーにします。

2 - [このURL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3)にアクセスしてCloudFormationスタックを作成します。

3 - ClickHouseサービスに属する**IAMロール**を入力（または貼り付け）します。

4 - CloudFormationスタックを構成します。以下は、これらのパラメータに関する追加情報です。

| パラメータ                | デフォルト値           | 説明                                                                                       |
| :---                      |    :----:              | :----                                                                                      |
| RoleName                  | ClickHouseAccess-001   | ClickHouse CloudがあなたのS3バケットにアクセスするために使用する新しいロールの名前                      |
| Role Session Name         |      *                | ロールセッション名は、バケットをさらに保護するための共有秘密として使用できます。                     |
| ClickHouse Instance Roles |                      | このSecure S3統合を使用できるClickHouseサービスのIAMロールをカンマ区切りでリストします。                |
| Bucket Access             |    Read               | 提供されたバケットのアクセスレベルを設定します。                                             |
| Bucket Names              |                      | このロールがアクセスできる**バケット名**のカンマ区切りリストです。                                   |

*注*: フルバケットArnではなく、バケット名のみを入力してください。

5 - **AWS CloudFormationがカスタム名のIAMリソースを作成する可能性があることを確認しました。**チェックボックスを選択します。

6 - 右下の**スタックを作成**ボタンをクリックします。

7 - CloudFormationスタックがエラーなく完了することを確認します。

8 - CloudFormationスタックの**出力**を選択します。

9 - この統合のために必要な**RoleArn**の値をコピーします。これがあなたのS3バケットにアクセスするために必要です。

<Image img={s3_output} size="lg" alt="IAMロールARNを示すCloudFormationスタックの出力" border />

#### オプション2: IAMロールを手動で作成する {#option-2-manually-create-iam-role}

1 - IAMユーザーとしてAWSアカウントにウェブブラウザでログインし、IAMロールを作成・管理する権限を持つユーザーにします。

2 - IAMサービスコンソールに移動します。

3 - 以下のIAMおよび信頼ポリシーで新しいIAMロールを作成します。

信頼ポリシー  (ここで`{ClickHouse_IAM_ARN}`をあなたのClickHouseインスタンスに属するIAMロールarnに置き換えてください):

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

IAMポリシー (ここで`{BUCKET_NAME}`をあなたのバケット名に置き換えてください):

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

4 - 作成後に新しい**IAMロールARN**をコピーします。これがあなたのS3バケットにアクセスするために必要です。

## ClickHouseAccessロールでS3バケットにアクセスする {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloudには、`extra_credentials`をS3テーブル関数の一部として指定できる新機能があります。以下は、上記からコピーした新しく作成されたロールを使用してクエリを実行する方法の例です。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

以下は、`role_session_name`を共有秘密として使用してバケットからデータをクエリする例のクエリです。`role_session_name`が正しくない場合、この操作は失敗します。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
ソースS3がClickHouse Cloudサービスと同じリージョンにあることをお勧めします。データ転送コストを抑えるためです。詳細については、[S3の価格]( https://aws.amazon.com/s3/pricing/)を参照してください。
::: 
