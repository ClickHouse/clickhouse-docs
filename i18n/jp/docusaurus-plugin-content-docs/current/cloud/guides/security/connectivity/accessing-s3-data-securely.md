---
'slug': '/cloud/security/secure-s3'
'sidebar_label': '安全にS3データにアクセスする'
'title': '安全にS3データにアクセスする'
'description': 'この記事では、ClickHouse Cloudの顧客が役割ベースのアクセスを利用して、Amazon Simple Storage Service
  (S3) に認証し、データに安全にアクセスする方法を示します。'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

この文章は、ClickHouse Cloud の顧客が役割ベースのアクセスを利用して、Amazon Simple Storage Service (S3) で認証し、安全にデータにアクセスする方法を示しています。

## はじめに {#introduction}

安全な S3 アクセスのセットアップに入る前に、これがどのように機能するかを理解することが重要です。以下は、ClickHouse サービスが顧客の AWS アカウント内の役割を引き受けることによってプライベート S3 バケットにアクセスできる方法の概要です。

<Image img={secure_s3} size="md" alt="ClickHouseによる安全なS3アクセスの概要"/>

このアプローチにより、顧客はアクセスを追加または削除するためにすべてのバケットポリシーを確認することなく、単一の場所（引き受けた役割の IAM ポリシー）で自分の S3 バケットへのすべてのアクセスを管理できます。

## セットアップ {#setup}

### ClickHouse サービスの IAM ロール ARN を取得する {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse Cloud アカウントにログインします。

2 - 統合を作成したい ClickHouse サービスを選択します。

3 - **設定** タブを選択します。

4 - ページの下部にある **ネットワークセキュリティ情報** セクションまでスクロールします。

5 - 下記のようにサービスに属する **サービスロール ID (IAM)** の値をコピーします。

<Image img={s3_info} size="lg" alt="ClickHouseサービスのIAMロールARNを取得する" border />

### IAM assume role を設定する {#setting-up-iam-assume-role}

#### オプション 1: CloudFormation スタックを使用してデプロイする {#option-1-deploying-with-cloudformation-stack}

1 - IAM ユーザーとしてウェブブラウザで AWS アカウントにログインします。この IAM ユーザーには IAM ロールを作成および管理する権限があります。

2 - [このURL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3)を訪れ、CloudFormation スタックを生成します。

3 - ClickHouse サービスに属する **IAM ロール** を入力（または貼り付け）します。

4 - CloudFormation スタックを設定します。以下はこれらのパラメータに関する追加情報です。

| パラメータ                  | デフォルト値           | 説明                                                                                               |
| :---                       |    :----:              | :----                                                                                             |
| RoleName                   | ClickHouseAccess-001   | ClickHouse Cloud が S3 バケットにアクセスするために使用する新しい役割の名前                      |
| Role Session Name          |      *                 | 役割セッション名はバケットをさらに保護するための共有秘密として使用できます。                    |
| ClickHouse Instance Roles   |                       | この Secure S3 統合を使用できる ClickHouse サービスの IAM ロールのコンマ区切りリスト。            |
| Bucket Access              |    Read                | 提供されたバケットのアクセスレベルを設定します。                                                  |
| Bucket Names               |                       | この役割がアクセスできる **バケット名** のコンマ区切りリスト。                                     |

*注*: フルバケット ARN を入力するのではなく、バケット名のみを入力してください。

5 - **AWS CloudFormation がカスタム名の IAM リソースを作成する可能性があることを確認しました。** チェックボックスを選択します。

6 - 右下の **スタックを作成** ボタンをクリックします。

7 - CloudFormation スタックがエラーなく完了することを確認します。

8 - CloudFormation スタックの **出力** を選択します。

9 - この統合に必要な **RoleArn** 値をコピーします。これが S3 バケットにアクセスするために必要です。

<Image img={s3_output} size="lg" alt="IAMロールARNを示すCloudFormationスタックの出力" border />

#### オプション 2: IAM ロールを手動で作成する {#option-2-manually-create-iam-role}

1 - IAM ユーザーとしてウェブブラウザで AWS アカウントにログインします。この IAM ユーザーには IAM ロールを作成および管理する権限があります。

2 - IAM サービスコンソールに移動します。

3 - 次の IAM および信頼ポリシーを使用して新しい IAM ロールを作成します。

信頼ポリシー（`{ClickHouse_IAM_ARN}` をあなたの ClickHouse インスタンスに属する IAM ロールARNに置き換えてください）:

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

IAM ポリシー（`{BUCKET_NAME}` をあなたのバケット名で置き換えてください）:

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

4 - 作成後に新しい **IAM ロール ARN** をコピーします。これがあなたの S3 バケットにアクセスするために必要です。

## ClickHouseAccess ロールを使用して S3 バケットにアクセスする {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud には、S3 テーブル関数の一部として `extra_credentials` を指定できる新しい機能があります。以下は、上記からコピーした新しく作成した役割を使用してクエリを実行する方法の例です。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

以下は、`role_session_name` を共有秘密として使用してバケットからデータをクエリする例のクエリです。`role_session_name` が正しくない場合、この操作は失敗します。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
S3 のソースは ClickHouse Cloud サービスと同じリージョンにあることをお勧めします。これにより、データ転送コストを削減できます。詳細については、[S3 料金]( https://aws.amazon.com/s3/pricing/)を参照してください。
:::
