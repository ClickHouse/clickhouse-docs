---
slug: /cloud/security/secure-s3
sidebar_label: S3データへの安全なアクセス
title: S3データへの安全なアクセス
---

import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

この記事では、ClickHouse Cloudの顧客が役割ベースのアクセスを利用して、Amazon Simple Storage Service(S3)に認証し、安全にデータにアクセスする方法を示します。

## はじめに {#introduction}

安全なS3アクセスの設定に入る前に、これがどのように機能するかを理解することが重要です。以下は、ClickHouseサービスが顧客のAWSアカウント内の役割に昇格することで、プライベートなS3バケットにアクセスできる方法の概要です。

<img src={secure_s3} alt="ClickHouseによる安全なS3アクセスの概要" />

このアプローチにより、顧客はすべてのS3バケットへのアクセスを一か所（昇格された役割のIAMポリシー）で管理でき、すべてのバケットポリシーを通過してアクセスを追加または削除する必要がなくなります。

## 設定 {#setup}

### ClickHouseサービスのIAMロールArnの取得 {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse Cloudアカウントにログインします。

2 - 統合を作成するClickHouseサービスを選択します。

3 - **設定**タブを選択します。

4 - ページの下部にある**このサービスについて**セクションまでスクロールします。

5 - 下記のようにサービスに属する**IAMロール**の値をコピーします。

<img src={s3_info} alt="ClickHouseサービスのIAMロールARNの取得" />

### IAMロールの設定 {#setting-up-iam-assume-role}

#### オプション1: CloudFormationスタックによるデプロイ {#option-1-deploying-with-cloudformation-stack}

1 - IAMロールの作成と管理の権限を持つIAMユーザーで、ウェブブラウザからAWSアカウントにログインします。

2 - [このURL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3)を訪れてCloudFormationスタックを取得します。

3 - ClickHouseサービスに属する**IAMロール**を入力（または貼り付け）します。

4 - CloudFormationスタックを構成します。以下は、これらのパラメータに関する追加情報です。

| パラメータ                | デフォルト値             | 説明                                                                                       |
| :---                     |    :----:                | :----                                                                                     |
| ロール名                 | ClickHouseAccess-001     | ClickHouse CloudがあなたのS3バケットにアクセスするために使用する新しいロールの名前       |
| ロールセッション名       |      *                  | ロールセッション名は、バケットを更に保護するための共有秘密として使用できます。         |
| ClickHouseインスタンスロール |                      | このSecure S3統合を使用できるClickHouseサービスのIAMロールのカンマ区切りリスト。       |
| バケットアクセス          |    読み取り              | 提供されたバケットへのアクセスレベルを設定します。                                      |
| バケット名               |                      | このロールがアクセスできる**バケット名**のカンマ区切りリスト。                         |

*注*: フルバケットArnは入力せず、バケット名のみを指定してください。

5 - **AWS CloudFormationがカスタム名のIAMリソースを作成する可能性があることを理解しました。** チェックボックスを選択します。

6 - 右下の**スタックを作成**ボタンをクリックします。

7 - CloudFormationスタックがエラーなしで完了することを確認します。

8 - CloudFormationスタックの**出力**を選択します。

9 - この統合のための**RoleArn**の値をコピーします。これがあなたのS3バケットにアクセスするために必要なものです。

<img src={s3_output} alt="IAMロールARNを示すCloudFormationスタックの出力" />

#### オプション2: IAMロールを手動で作成する {#option-2-manually-create-iam-role}

1 - IAMロールの作成と管理の権限を持つIAMユーザーで、ウェブブラウザからAWSアカウントにログインします。

2 - IAMサービスコンソールに移動します。

3 - 以下のIAMポリシーとTrustポリシーを使用して新しいIAMロールを作成します。

Trustポリシー（`{ClickHouse_IAM_ARN}`をあなたのClickHouseインスタンスに属するIAMロールarnで置き換えてください）:

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

IAMポリシー（`{BUCKET_NAME}`をあなたのバケット名で置き換えてください）:

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

4 - 作成後に新しい**IAMロールArn**をコピーします。これがあなたのS3バケットにアクセスするために必要なものです。

## ClickHouseAccessロールでS3バケットにアクセスする {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloudには、S3テーブル関数の一部として`extra_credentials`を指定できる新機能があります。以下は、上記からコピーした新しく作成されたロールを使ってクエリを実行する方法の例です。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

以下は、`role_session_name`を共有秘密として使用してバケットからデータをクエリする例です。`role_session_name`が正しくない場合、この操作は失敗します。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
データ転送料を削減するため、ソースのS3がClickHouse Cloudサービスと同じリージョンにあることをお勧めします。詳細については、[S3の料金]( https://aws.amazon.com/s3/pricing/)を参照してください。
:::
