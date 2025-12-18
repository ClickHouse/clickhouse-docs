---
slug: /integrations/clickpipes/secure-kinesis
sidebar_label: 'Kinesis ロールベースアクセス'
title: 'Kinesis ロールベースアクセス'
description: 'この記事では、ClickPipes のユーザーがロールベースアクセスを活用して Amazon Kinesis で認証を行い、データストリームに安全にアクセスする方法を説明します。'
doc_type: 'guide'
keywords: ['Amazon Kinesis']
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

この記事では、ClickPipes のお客様がロールベースアクセスを利用して Amazon Kinesis で認証を行い、自身のデータストリームに安全にアクセスする方法を説明します。

## 前提条件 {#prerequisite}

このガイドに従うには、次のものが必要です：
- アクティブな ClickHouse Cloud サービス
- AWS アカウント

## はじめに {#introduction}

Kinesis へのセキュアなアクセス設定の説明に入る前に、その仕組みを理解しておくことが重要です。ここでは、ClickPipes がどのようにしてお客様の AWS アカウント内でロールを引き受けることにより、Amazon Kinesis ストリームへアクセスできるかの概要を説明します。

<Image img={secure_kinesis} alt="Secure Kinesis" size="lg" border/>

このアプローチを用いることで、お客様は各ストリームのアクセスポリシーを個別に変更することなく、引き受けたロールの IAM ポリシーだけで Kinesis データストリームへのすべてのアクセスを一元的に管理できます。

## セットアップ {#setup}

<VerticalStepper headerLevel="h3">

### ClickHouse サービスの IAM ロール ARN の取得 {#obtaining-the-clickhouse-service-iam-role-arn}

- 1. ClickHouse Cloud アカウントにログインします。
- 2. 連携を作成したい ClickHouse サービスを選択します。
- 3. **Settings** タブを選択します。
- 4. ページ下部の **Network security information** セクションまでスクロールします。
- 5. 下図のように、そのサービスに対応する **Service role ID (IAM)** の値をコピーします。

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

### IAM AssumeRole の設定 {#setting-up-iam-assume-role}

#### IAM ロールを手動で作成する {#manually-create-iam-role}

- 1. IAM ロールの作成および管理権限を持つ IAM ユーザーで、Web ブラウザから AWS アカウントにログインします。
- 2. IAM サービスコンソールを開きます。
- 3. Trusted Entity Type が `AWS account` の新しい IAM ロールを作成します。この設定が機能するためには、IAM ロール名が **必ず** `ClickHouseAccessRole-` で始まっている必要があります。

   **i. 信頼ポリシーの設定**

   信頼ポリシーにより、ClickHouse の IAM ロールがこのロールを引き受けられるようにします。`{ClickHouse_IAM_ARN}` を、前の手順で取得した ClickHouse サービスの IAM ロール ARN に置き換えます。

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

   アクセス許可ポリシーにより、Kinesis ストリームへのアクセスが許可されます。次のプレースホルダーを置き換えてください。
  - `{REGION}`: AWS リージョン (例: `us-east-1`)
  - `{ACCOUNT_ID}`: AWS アカウント ID
  - `{STREAM_NAME}`: Kinesis ストリーム名

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
         "Action": [
           "kinesis:ListStreams"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

- 4. 作成後、新しい **IAM Role ARN** をコピーします。これは Kinesis ストリームへアクセスするために必要となる ARN です。

</VerticalStepper>
