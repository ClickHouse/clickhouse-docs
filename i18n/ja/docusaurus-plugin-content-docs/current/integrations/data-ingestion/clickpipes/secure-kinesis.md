---
slug: /integrations/clickpipes/secure-kinesis
sidebar_label: Kinesisロールベースアクセス
title: Kinesisロールベースアクセス
---

この記事では、ClickPipesの顧客がロールベースのアクセスを利用してAmazon Kinesisに認証し、データストリームに安全にアクセスする方法を示します。

## はじめに {#introduction}

安全なKinesisアクセスの設定に入る前に、このメカニズムを理解することが重要です。ここでは、ClickPipesが顧客のAWSアカウント内のロールを引き受けることによってAmazon Kinesisのストリームにアクセスする方法について概説します。

![Secure Kinesis](@site/i18n/ja/docusaurus-plugin-content-docs/current/integrations/data-ingestion/clickpipes/images/securekinesis.jpg)

このアプローチを使用することで、顧客は各ストリームのアクセスポリシーを個別に変更することなく、単一の場所（引き受けたロールのIAMポリシー）でKinesisデータストリームへのすべてのアクセスを管理できます。

## 設定 {#setup}

### ClickHouseサービスのIAMロールArnを取得する {#obtaining-the-clickhouse-service-iam-role-arn}

1 - ClickHouseクラウドアカウントにログインします。

2 - 統合を作成したいClickHouseサービスを選択します。

3 - **設定**タブを選択します。

4 - ページの下部にある**このサービスについて**セクションまでスクロールします。

5 - 下記のようにサービスに属する**IAMロール**の値をコピーします。

![s3info](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/secures3_arn.jpg)

### IAMロールを引き受ける設定 {#setting-up-iam-assume-role}

#### IAMロールを手動で作成する {#manually-create-iam-role}

1 - IAMユーザーとして、IAMロールを作成および管理する権限を持つAWSアカウントにウェブブラウザでログインします。

2 - IAMサービスコンソールに移動します。

3 - 以下のIAMおよび信頼ポリシーを使用して、新しいIAMロールを作成します。この機能が正常に動作するためには、IAMロールの名前は**必ず** `ClickHouseAccessRole-` で始まる必要があります。

信頼ポリシー（`{ClickHouse_IAM_ARN}` をあなたのClickHouseインスタンスに属するIAMロールArnに置き換えてください）：

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

IAMポリシー（`{STREAM_NAME}` をあなたのKinesisストリーム名に置き換えてください）：

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

4 - 作成後に新しい**IAMロールArn**をコピーします。これがKinesisストリームにアクセスするために必要です。
