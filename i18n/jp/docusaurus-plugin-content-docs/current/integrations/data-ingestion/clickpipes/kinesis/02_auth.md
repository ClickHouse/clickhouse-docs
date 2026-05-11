---
slug: /integrations/clickpipes/kinesis/auth
sidebar_label: 'Kinesis のロールベースアクセス'
title: 'Kinesis のロールベースアクセス'
description: 'このガイドでは、ClickPipes のお客様がロールベースのアクセスを活用して Amazon Kinesis で認証を行い、データストリームに安全にアクセスする方法を説明します。'
doc_type: 'guide'
keywords: ['Amazon Kinesis']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

この記事では、ClickPipes のお客様がロールベースのアクセスを利用して Amazon Kinesis に対して認証を行い、データストリームに安全にアクセスする方法を説明します。


## 前提条件 \{#prerequisite\}

このガイドを進めるには、次のものが必要です。

- 有効な ClickHouse Cloud サービス
- AWS アカウント

## はじめに \{#introduction\}

Kinesis への安全なアクセスをセットアップする前に、その仕組みを理解しておくことが重要です。ここでは、ClickPipes がお客様の AWS アカウント内でロールを引き受けることで Amazon Kinesis ストリームにアクセスする仕組みの概要を説明します。

<Image img={secure_kinesis} alt="Secure Kinesis" size="lg" border/>

このアプローチを用いることで、お客様は各ストリームのアクセスポリシーを個別に変更することなく、引き受けたロールに設定された IAM ポリシー 1 か所で Kinesis データストリームへのすべてのアクセスを管理できます。

## セットアップ \{#setup\}

<VerticalStepper headerLevel="h3"/>

### ClickHouse サービスの IAM ロール ARN を取得する \{#obtaining-the-clickhouse-service-iam-role-arn\}

- 1. ClickHouse Cloud アカウントにログインします。
- 2. インテグレーションを作成する対象の ClickHouse サービスを選択します。
- 3. **Settings** タブを開きます。
- 4. ページ下部の **Network security information** セクションまでスクロールします。
- 5. 下図のように、そのサービスに対応する **Service role ID (IAM)** の値をコピーします。

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

### IAM Assume Role の設定 \{#setting-up-iam-assume-role\}

#### IAM ロールを手動で作成する \{#manually-create-iam-role\}

- 1. IAM ロールの作成および管理権限を持つ IAM ユーザーで、Web ブラウザから自分の AWS アカウントにログインします。
- 2. IAM サービスコンソールを開きます。
- 3. 信頼されたエンティティタイプとして `AWS account` を選択し、新しい IAM ロールを作成します。この手順が機能するためには、IAM ロール名は **必ず** `ClickHouseAccessRole-` で始まる必要があります。

   **i. 信頼ポリシーを設定する**

   信頼ポリシーにより、ClickHouse の IAM ロールがこのロールを引き受けられるようにします。`{ClickHouse_IAM_ARN}` を、ClickHouse サービスから取得した IAM ロール ARN（前の手順で取得）に置き換えます。

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

   **ii. 権限ポリシーを設定する**

   権限ポリシーは、Kinesis ストリームへのアクセス権限を付与します。次のプレースホルダーをそれぞれの値に置き換えます。
  - `{REGION}`: 使用している AWS リージョン（例: `us-east-1`）
  - `{ACCOUNT_ID}`: 自分の AWS アカウント ID
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

- 4. 作成後に新しい **IAM ロール ARN** をコピーします。これは Kinesis ストリームにアクセスするために必要となります。