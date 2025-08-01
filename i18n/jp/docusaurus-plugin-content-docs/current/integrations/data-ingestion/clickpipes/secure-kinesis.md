---
slug: '/integrations/clickpipes/secure-kinesis'
sidebar_label: 'Kinesis Role-Based Access'
title: 'Kinesis Role-Based Access'
description: 'This article demonstrates how ClickPipes customers can leverage role-based
  access to authenticate with Amazon Kinesis and access their data streams securely.'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

この文書では、ClickPipes の顧客が役割ベースのアクセスを利用して Amazon Kinesis に認証し、安全にデータストリームにアクセスできる方法を示します。

## はじめに {#introduction}

安全な Kinesis アクセスの設定に dive する前に、そのメカニズムを理解することが重要です。ここでは、ClickPipes が顧客の AWS アカウント内で役割を引き受けて Amazon Kinesis ストリームにアクセスする方法の概要を示します。

<Image img={secure_kinesis} alt="Secure Kinesis" size="lg" border/>

このアプローチを使用することで、顧客はそれぞれのストリームのアクセスポリシーを個別に変更することなく（引き受けた役割の IAM ポリシーで）単一の場所で Kinesis データストリームへのすべてのアクセスを管理できます。

## セットアップ {#setup}

### ClickHouse サービス IAM ロール Arn の取得 {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse クラウドアカウントにログインします。

2 - 統合を作成したい ClickHouse サービスを選択します。

3 - **設定** タブを選択します。

4 - ページの下部にある **ネットワークセキュリティ情報** セクションにスクロールします。

5 - 以下のようにサービスに属する **サービスロール ID (IAM)** の値をコピーします。

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

### IAM の役割を引き受ける設定 {#setting-up-iam-assume-role}

#### IAM ロールを手動で作成します。 {#manually-create-iam-role}

1 - IAM ロールを作成および管理する権限を持つ IAM ユーザーを使用して、ウェブブラウザで AWS アカウントにログインします。

2 - IAM サービスコンソールに移動します。

3 - 次の IAM およびトラストポリシーで新しい IAM ロールを作成します。これが機能するには IAM ロールの名前は **必ず `ClickHouseAccessRole-` で始まる必要があります**。

トラストポリシー（ここで `{ClickHouse_IAM_ARN}` をあなたの ClickHouse インスタンスに属する IAM ロール ARN に置き換えてください）:

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

IAM ポリシー（ここで `{STREAM_NAME}` をあなたの Kinesis ストリーム名に置き換えてください）:

```json
{
    "Version": "2012-10-17",
        "Statement": [
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
                "arn:aws:kinesis:region:account-id:stream/{STREAM_NAME}"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "kinesis:SubscribeToShard",
                "kinesis:DescribeStreamConsumer"
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
```

4 - 作成後に新しい **IAM ロール ARN** をコピーします。これが Kinesis ストリームにアクセスするために必要です。
