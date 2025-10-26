---
'slug': '/integrations/clickpipes/secure-kinesis'
'sidebar_label': 'Kinesis ロールベースのアクセス'
'title': 'Kinesis ロールベースのアクセス'
'description': 'この記事は、ClickPipesの顧客がどのようにロールベースのアクセスを利用してAmazon Kinesisに認証し、安全にデータストリームにアクセスできるかを示します。'
'doc_type': 'guide'
'keywords':
- 'Amazon Kinesis'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

このドキュメントでは、ClickPipes の顧客が、役割ベースのアクセスを利用して Amazon Kinesis に認証し、データストリームに安全にアクセスする方法を示します。

## 前提条件 {#prerequisite}

このガイドに従うには、次のものが必要です：
- アクティブな ClickHouse Cloud サービス
- AWS アカウント

## はじめに {#introduction}

安全な Kinesis アクセスの設定に入る前に、メカニズムを理解することが重要です。以下は、ClickPipes が顧客の AWS アカウント内の役割を引き受けて Amazon Kinesis ストリームにアクセスする方法の概要です。

<Image img={secure_kinesis} alt="Secure Kinesis" size="lg" border/>

このアプローチを使用することで、顧客は各ストリームのアクセスポリシーを個別に修正することなく、引き受けた役割の IAM ポリシーの中で Kinesis データストリームへのすべてのアクセスを一元管理できます。

## 設定 {#setup}

<VerticalStepper headerLevel="h3"/>

### ClickHouse サービス IAM ロールの Arn を取得する {#obtaining-the-clickhouse-service-iam-role-arn}

- 1. ClickHouse Cloud アカウントにログインします。
- 2. 統合を作成する ClickHouse サービスを選択します。
- 3. **設定**タブを選択します。
- 4. ページの下部にある **ネットワークセキュリティ情報** セクションまでスクロールします。
- 5. 以下のようにサービスに属する **サービスロール ID (IAM)** の値をコピーします。

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

### IAM の引き受け役割を設定する {#setting-up-iam-assume-role}

#### IAM ロールを手動で作成する。 {#manually-create-iam-role}

- 1. IAM ロールを作成および管理する権限を持つ IAM ユーザーで AWS アカウントにウェブブラウザからログインします。
- 2. IAM サービスコンソールに移動します。
- 3. Trusted Entity Type を `AWS account` とする新しい IAM ロールを作成します。このロールの名前は **必ず** `ClickHouseAccessRole-` で始まる必要があります。

信頼ポリシーでは、`{ClickHouse_IAM_ARN}` を ClickHouse インスタンスに属する IAM ロールの arn に置き換えてください。
IAM ポリシーでは、`{STREAM_NAME}` をあなたの Kinesis ストリーム名に置き換えてください。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Statement1",
      "Effect": "Allow",
      "Principal": {
        "AWS": "{ClickHouse_IAM_ARN}"
      },
      "Action": "sts:AssumeRole"
    },
    {
      "Action": [
        "kinesis:DescribeStream",
        "kinesis:GetShardIterator",
        "kinesis:GetRecords",
        "kinesis:ListShards",
        "kinesis:SubscribeToShard",
        "kinesis:DescribeStreamConsumer",
        "kinesis:RegisterStreamConsumer",
        "kinesis:DeregisterStreamConsumer",
        "kinesis:ListStreamConsumers"
      ],
      "Resource": [
        "arn:aws:kinesis:region:account-id:stream/{STREAM_NAME}/*"
      ],
      "Effect": "Allow"
    },
    {
      "Action": [
        "kinesis:ListStreams"
      ],
      "Resource": "*",
      "Effect": "Allow"
    }
  ]
}

</VerticalStepper>

```

- 4. 作成後に新しい **IAM ロール Arn** をコピーします。これは、Kinesis ストリームにアクセスするために必要です。
