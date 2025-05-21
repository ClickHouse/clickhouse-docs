---
slug: '/integrations/clickpipes/secure-kinesis'
sidebar_label: 'Kinesis ロールベースのアクセス'
title: 'Kinesis ロールベースのアクセス'
description: 'この記事では、ClickPipesの顧客がロールベースのアクセスを活用してAmazon Kinesisを認証し、自分のデータストリームに安全にアクセスする方法を示します。'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

この記事では、ClickPipesの顧客がロールベースのアクセスを活用してAmazon Kinesisを認証し、自分のデータストリームに安全にアクセスする方法を示します。

## はじめに {#introduction}

セキュアなKinesisアクセスの設定に dive する前に、そのメカニズムを理解することが重要です。以下は、ClickPipesが顧客のAWSアカウント内でロールを引き受けてAmazon Kinesisストリームにアクセスする方法の概要です。

<Image img={secure_kinesis} alt="セキュアKinesis" size="lg" border/>

このアプローチを使用することで、顧客は各ストリームのアクセスポリシーを個別に変更することなく、単一の場所（引き受けたロールのIAMポリシー）でKinesisデータストリームへのすべてのアクセスを管理できます。

## 設定 {#setup}

### ClickHouseサービスのIAMロールArnを取得する {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouseクラウドアカウントにログインします。

2 - 統合を作成したいClickHouseサービスを選択します。

3 - **設定**タブを選択します。

4 - ページ下部の**ネットワークセキュリティ情報**セクションまでスクロールします。

5 - 下記に示す通り、サービスに属する**サービスロールID（IAM）**の値をコピーします。

<Image img={secures3_arn} alt="セキュアS3 ARN" size="lg" border/>

### IAMロールを引き受ける設定 {#setting-up-iam-assume-role}

#### IAMロールを手動で作成する {#manually-create-iam-role}

1 - IAMロールの作成および管理の権限を持つIAMユーザーで、WebブラウザからAWSアカウントにログインします。

2 - IAMサービスコンソールに移動します。

3 - 以下のIAMおよび信頼ポリシーを使用して新しいIAMロールを作成します。IAMロールの名前は**必ず `ClickHouseAccessRole-` で始まる必要があります**。

信頼ポリシー（ `{ClickHouse_IAM_ARN}` を自分のClickHouseインスタンスに属するIAMロールarnに置き換えてください）:

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

IAMポリシー（ `{STREAM_NAME}` を自分のKinesisストリーム名に置き換えてください）:

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

4 - 作成後に新しい**IAMロールArn**をコピーします。これがKinesisストリームにアクセスするために必要なものです。
