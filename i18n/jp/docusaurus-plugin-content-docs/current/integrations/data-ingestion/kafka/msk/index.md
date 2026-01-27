---
sidebar_label: 'Amazon MSK と Kafka Connector Sink'
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: 'ClickHouse 公式 Kafka コネクタを使用した Amazon MSK との統合'
keywords: ['統合', 'kafka', 'amazon msk', 'シンク', 'コネクタ']
title: 'Amazon MSK と ClickHouse の統合 {#integrating-amazon-msk-with-clickhouse}'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Amazon MSK と ClickHouse の統合 \{#integrating-amazon-msk-with-clickhouse\}

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/6lKI_WlQ3-s"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

> 注意: この動画で示しているポリシーは権限設定が緩く、クイックスタート用にのみ意図されています。IAM の最小権限ガイドラインについては、以下を参照してください。

## 前提条件 \{#prerequisites\}

次のことを前提とします:

* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md) について理解していること。
* Amazon MSK および MSK Connectors について理解していること。Amazon MSK の [はじめにガイド](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) と [MSK Connect ガイド](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html) の参照を推奨します。

## ClickHouse 公式 Kafka コネクタと Amazon MSK の連携 \{#the-official-kafka-connector-from-clickhouse-with-amazon-msk\}

### 接続情報を確認する \{#gather-your-connection-details\}

<ConnectionDetails />

### 手順 \{#steps\}

1. [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md) に目を通しておく。
2. [MSK インスタンスを作成する](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)。
3. [IAM ロールを作成して割り当てる](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)。
4. ClickHouse Connect Sink の [リリースページ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) から `jar` ファイルをダウンロードする。
5. ダウンロードした `jar` ファイルを、Amazon MSK コンソールの [カスタムプラグインページ](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html) にインストールする。
6. コネクタがパブリックな ClickHouse インスタンスと通信する場合は、[インターネットアクセスを有効化する](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)。
7. 設定に、トピック名、ClickHouse インスタンスのホスト名、およびパスワードを指定する。

```yml
connector.class=com.clickhouse.kafka.connect.ClickHouseSinkConnector
tasks.max=1
topics=<topic_name>
ssl=true
security.protocol=SSL
hostname=<hostname>
database=<database_name>
password=<password>
ssl.truststore.location=/tmp/kafka.client.truststore.jks
port=8443
value.converter.schemas.enable=false
value.converter=org.apache.kafka.connect.json.JsonConverter
exactlyOnce=true
username=default
schemas.enable=false
```

## 推奨 IAM 権限（最小権限） \{#iam-least-privilege\}

環境に必要な最小限の権限だけを付与してください。まずは以下のベースラインから始め、利用するサービスがある場合にのみオプションの権限を追加します。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "MSKClusterAccess",
      "Effect": "Allow",
      "Action": [
        "kafka:DescribeCluster",
        "kafka:GetBootstrapBrokers",
        "kafka:DescribeClusterV2",
        "kafka:ListClusters",
        "kafka:ListClustersV2"
      ],
      "Resource": "*"
    },
    {
      "Sid": "KafkaAuthorization",
      "Effect": "Allow",
      "Action": [
        "kafka-cluster:Connect",
        "kafka-cluster:DescribeCluster",
        "kafka-cluster:DescribeGroup",
        "kafka-cluster:DescribeTopic",
        "kafka-cluster:ReadData"
      ],
      "Resource": "*"
    },
    {
      "Sid": "OptionalGlueSchemaRegistry",
      "Effect": "Allow",
      "Action": [
        "glue:GetSchema*",
        "glue:ListSchemas",
        "glue:ListSchemaVersions"
      ],
      "Resource": "*"
    },
    {
      "Sid": "OptionalSecretsManager",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:<region>:<account-id>:secret:<your-secret-name>*"
      ]
    },
    {
      "Sid": "OptionalS3Read",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::<your-bucket>/<optional-prefix>/*"
    }
  ]
}
```

* AWS Glue Schema Registry を使用している場合にのみ、Glue ブロックを使用してください。
* Secrets Manager から認証情報や truststore を取得する場合にのみ、Secrets Manager ブロックを使用してください。ARN のスコープを適切に絞り込んでください。
* S3 からアーティファクト（例: truststore）を読み込む場合にのみ、S3 ブロックを使用してください。バケット/プレフィックス単位でスコープを絞り込んでください。

あわせて参照してください: [Kafka のベストプラクティス – IAM](../../clickpipes/kafka/04_best_practices.md#iam).

## パフォーマンスチューニング \{#performance-tuning\}

パフォーマンスを向上させる 1 つの方法は、**worker** の設定に次の項目を追加し、Kafka から取得するバッチサイズとレコード数を調整することです。

```yml
consumer.max.poll.records=[NUMBER OF RECORDS]
consumer.max.partition.fetch.bytes=[NUMBER OF RECORDS * RECORD SIZE IN BYTES]
```

使用する具体的な値は、必要とするレコード数やレコードサイズによって異なります。たとえば、デフォルト値は次のとおりです。

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

実装に関する詳細やその他の検討事項については、公式の [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) ドキュメントおよび
[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config) ドキュメントを参照してください。

## MSK Connect のネットワーキングに関する注意事項 \{#notes-on-networking-for-msk-connect\}

MSK Connect から ClickHouse に接続できるようにするには、MSK クラスターをプライベートサブネット内に配置し、インターネットアクセス用にプライベート NAT ゲートウェイを接続することを推奨します。設定手順は以下のとおりです。パブリックサブネットもサポートされていますが、ENI に Elastic IP アドレスを継続的に割り当てる必要があるため推奨されません。[詳細は AWS のドキュメントを参照してください](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)

1. **プライベートサブネットを作成する:** VPC 内に新しいサブネットを作成し、それをプライベートサブネットとして指定します。このサブネットはインターネットへ直接アクセスできないようにします。
1. **NAT ゲートウェイを作成する:** VPC のパブリックサブネット内に NAT ゲートウェイを作成します。NAT ゲートウェイにより、プライベートサブネット内のインスタンスがインターネットや他の AWS サービスへ接続できる一方で、インターネット側からそれらのインスタンスへの接続開始は防止されます。
1. **ルートテーブルを更新する:** インターネット向けトラフィックを NAT ゲートウェイに転送するルートを追加します。
1. **セキュリティグループおよびネットワーク ACL の設定を確認する:** 関連するトラフィックを許可するように [セキュリティグループ](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) および [ネットワーク ACL (Access Control Lists)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) を設定します。
   1. MSK Connect ワーカー ENI から、TLS ポート（一般的には 9094）の MSK ブローカーへのトラフィック。
   1. MSK Connect ワーカー ENI から ClickHouse エンドポイントへのトラフィック: 9440（ネイティブ TLS）または 8443（HTTPS）。
   1. ブローカーのセキュリティグループで、MSK Connect ワーカーのセキュリティグループからのインバウンドを許可します。
   1. セルフホストの ClickHouse の場合は、サーバーで設定しているポート（デフォルトでは HTTP 用に 8123）を開放します。
1. **セキュリティグループを MSK にアタッチする:** これらのセキュリティグループが MSK クラスターおよび MSK Connect ワーカーにアタッチされていることを確認します。
1. **ClickHouse Cloud への接続:**
   1. パブリックエンドポイント + IP 許可リスト方式: プライベートサブネットから NAT 経由での送信（アウトバウンド）トラフィックが必要です。
   1. 利用可能な場合のプライベート接続（例: VPC ピアリング / PrivateLink / VPN）。VPC の DNS ホスト名/名前解決が有効化されており、DNS がプライベートエンドポイントを解決できることを確認します。
1. **接続検証（簡易チェックリスト）:**
   1. コネクターの実行環境から MSK のブートストラップ DNS を解決し、ブローカーポートへ TLS で接続できること。
   1. ClickHouse の 9440 ポート（または HTTPS 用の 8443）へ TLS 接続を確立できること。
   1. AWS のサービス（Glue / Secrets Manager）を使用する場合、それらのエンドポイントへの送信（アウトバウンド）トラフィックが許可されていること。