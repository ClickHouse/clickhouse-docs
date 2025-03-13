---
slug: /integrations/clickpipes/secure-kinesis
sidebar_label: Kinesis ロールベースのアクセス
title: Kinesis ロールベースのアクセス
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';

この記事では、ClickPipes の顧客がロールベースのアクセスを利用して Amazon Kinesis に認証し、安全にデータストリームにアクセスする方法を示します。

## はじめに {#introduction}

安全な Kinesis アクセスのセットアップに入る前に、メカニズムを理解することが重要です。顧客の AWS アカウント内でロールを引き受けることによって ClickPipes が Amazon Kinesis ストリームにアクセスする概要は以下の通りです。

<img src={secure_kinesis} alt="Secure Kinesis" />

このアプローチを使用することで、顧客は各ストリームのアクセスポリシーを個別に修正することなく、引き受けたロールの IAM ポリシー内で Kinesis データストリームへのすべてのアクセスを一元管理できます。

## セットアップ {#setup}

### ClickHouse サービス IAM ロール ARN を取得する {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouse クラウドアカウントにログインします。

2 - 統合を作成する ClickHouse サービスを選択します。

3 - **設定**タブを選択します。

4 - ページの一番下にある **このサービスについて** セクションまでスクロールダウンします。

5 - 下記のようにサービスに属する **IAM ロール** の値をコピーします。

<img src={secures3_arn} alt="Secure S3 ARN" />

### IAM 引き受けロールの設定 {#setting-up-iam-assume-role}

#### IAM ロールを手動で作成する {#manually-create-iam-role}

1 - IAM ユーザーとして、IAM ロールを作成および管理する権限を持つ状態で AWS アカウントにウェブブラウザでログインします。

2 - IAM サービスコンソールに移動します。

3 - 以下の IAM & Trust ポリシーを使用して新しい IAM ロールを作成します。この作業を行うには、IAM ロールの名前が **必ず `ClickHouseAccessRole-` で始まる** 必要があります。

信頼ポリシー（`{ClickHouse_IAM_ARN}` を ClickHouse インスタンスに属する IAM ロール ARN に置き換えてください）:

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

IAM ポリシー（`{STREAM_NAME}` を Kinesis ストリーム名に置き換えてください）:

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
                "kinesis:ListStreams"
            ],
            "Resource": "*",
            "Effect": "Allow"
        }
    ]
}
```

4 - 作成後に新しい **IAM ロール ARN** をコピーします。これは Kinesis ストリームにアクセスするために必要です。
