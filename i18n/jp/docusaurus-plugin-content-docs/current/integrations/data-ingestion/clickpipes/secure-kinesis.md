---
slug: /integrations/clickpipes/secure-kinesis
sidebar_label: 'Kinesis のロールベースアクセス'
title: 'Kinesis のロールベースアクセス'
description: 'このガイドでは、ClickPipes のお客様がロールベースのアクセス制御を利用して Amazon Kinesis で認証を行い、データストリームへ安全にアクセスする方法を解説します。'
doc_type: 'guide'
keywords: ['Amazon Kinesis']
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

この記事では、ClickPipes のお客様がロールベースのアクセスを活用して Amazon Kinesis で認証を行い、データストリームに安全にアクセスする方法を説明します。


## 前提条件 {#prerequisite}

このガイドを進めるには、以下が必要です：

- 有効なClickHouse Cloudサービス
- AWSアカウント


## はじめに {#introduction}

セキュアなKinesisアクセスの設定を始める前に、その仕組みを理解することが重要です。以下は、ClickPipesが顧客のAWSアカウント内でロールを引き受けることにより、Amazon Kinesisストリームにアクセスする方法の概要です。

<Image img={secure_kinesis} alt='Secure Kinesis' size='lg' border />

このアプローチを使用することで、顧客は各ストリームのアクセスポリシーを個別に変更することなく、単一の場所(引き受けロールのIAMポリシー)でKinesisデータストリームへのすべてのアクセスを管理できます。


## セットアップ {#setup}

<VerticalStepper headerLevel='h3' />

### ClickHouseサービスのIAMロールArnの取得 {#obtaining-the-clickhouse-service-iam-role-arn}

- 1. ClickHouse Cloudアカウントにログインします。
- 2. 統合を作成するClickHouseサービスを選択します。
- 3. **Settings**タブを選択します。
- 4. ページ下部の**Network security information**セクションまでスクロールします。
- 5. 以下に示すように、サービスに属する**Service role ID (IAM)**の値をコピーします。

<Image img={secures3_arn} alt='セキュアなS3 ARN' size='lg' border />

### IAM Assume Roleの設定 {#setting-up-iam-assume-role}

#### IAMロールの手動作成 {#manually-create-iam-role}

- 1. IAMロールの作成と管理の権限を持つIAMユーザーで、WebブラウザからAWSアカウントにログインします。
- 2. IAMサービスコンソールに移動します。
- 3. 信頼されたエンティティタイプが`AWS account`の新しいIAMロールを作成します。この機能を動作させるには、IAMロールの名前は**必ず**`ClickHouseAccessRole-`で始まる必要があることに注意してください。

  **i. 信頼ポリシーの設定**

  信頼ポリシーは、ClickHouseのIAMロールがこのロールを引き受けることを許可します。`{ClickHouse_IAM_ARN}`を、ClickHouseサービスのIAMロールARN(前のステップで取得したもの)に置き換えてください。

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

  **ii. アクセス許可ポリシーの設定**

  アクセス許可ポリシーは、Kinesisストリームへのアクセスを付与します。以下のプレースホルダーを置き換えてください:
  - `{REGION}`: AWSリージョン(例: `us-east-1`)
  - `{ACCOUNT_ID}`: AWSアカウントID
  - `{STREAM_NAME}`: Kinesisストリーム名

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "kinesis:DescribeStream",
          "kinesis:GetShardIterator",
          "kinesis:GetRecords",
          "kinesis:ListShards",
          "kinesis:RegisterStreamConsumer",
          "kinesis:DeregisterStreamConsumer",
          "kinesis:ListStreamConsumers"
        ],
        "Resource": [
          "arn:aws:kinesis:{REGION}:{ACCOUNT_ID}:stream/{STREAM_NAME}"
        ]
      },
      {
        "Effect": "Allow",
        "Action": [
          "kinesis:SubscribeToShard",
          "kinesis:DescribeStreamConsumer"
        ],
        "Resource": [
          "arn:aws:kinesis:{REGION}:{ACCOUNT_ID}:stream/{STREAM_NAME}/*"
        ]
      },
      {
        "Effect": "Allow",
        "Action": ["kinesis:ListStreams"],
        "Resource": "*"
      }
    ]
  }
  ```

- 4. 作成後、新しい**IAMロールArn**をコピーします。これがKinesisストリームにアクセスするために必要なものです。
