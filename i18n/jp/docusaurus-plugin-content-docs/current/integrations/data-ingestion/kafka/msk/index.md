---
sidebar_label: 'Amazon MSK と Kafka コネクタシンク'
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: 'ClickHouse 公式 Kafka コネクタによる Amazon MSK との連携'
keywords: ['連携', 'kafka', 'amazon msk', 'シンク', 'コネクタ']
title: 'Amazon MSK と ClickHouse の連携'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# Amazon MSK と ClickHouse の統合

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

> 注意: 動画で示しているポリシーは、クイックスタートを目的とした、権限を広く許可する設定です。実運用では、以下の最小権限の IAM ガイダンスに従ってください。



## 前提条件 {#prerequisites}

以下を前提としています：

- [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)、Amazon MSK、およびMSK Connectorsに精通していること。Amazon MSKの[入門ガイド](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html)および[MSK Connectガイド](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html)の参照を推奨します。
- MSKブローカーがパブリックアクセス可能であること。Developer Guideの[パブリックアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html)セクションを参照してください。


## Amazon MSKでのClickHouse公式Kafkaコネクタ {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}

### 接続情報の収集 {#gather-your-connection-details}

<ConnectionDetails />

### 手順 {#steps}

1. [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)について理解していることを確認してください
1. [MSKインスタンスを作成](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)します。
1. [IAMロールを作成して割り当て](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)ます。
1. ClickHouse Connect Sinkの[リリースページ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)から`jar`ファイルをダウンロードします。
1. ダウンロードした`jar`ファイルをAmazon MSKコンソールの[カスタムプラグインページ](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html)にインストールします。
1. コネクタがパブリックなClickHouseインスタンスと通信する場合は、[インターネットアクセスを有効化](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)します。
1. 設定ファイルにトピック名、ClickHouseインスタンスのホスト名、およびパスワードを指定します。

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


## 推奨IAM権限（最小権限） {#iam-least-privilege}

セットアップに必要な最小限の権限セットを使用してください。以下のベースラインから開始し、使用する場合にのみオプションのサービスを追加してください。

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
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": [
        "arn:aws:secretsmanager:<region>:<account-id>:secret:<your-secret-name>*"
      ]
    },
    {
      "Sid": "OptionalS3Read",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::<your-bucket>/<optional-prefix>/*"
    }
  ]
}
```

- AWS Glue Schema Registryを使用する場合にのみGlueブロックを使用してください。
- Secrets Managerから認証情報/トラストストアを取得する場合にのみSecrets Managerブロックを使用してください。ARNのスコープを指定してください。
- S3からアーティファクト（例：トラストストア）をロードする場合にのみS3ブロックを使用してください。バケット/プレフィックスにスコープを指定してください。

参照：[Kafkaベストプラクティス – IAM](../../clickpipes/kafka/04_best_practices.md#iam)


## パフォーマンスチューニング {#performance-tuning}

パフォーマンスを向上させる方法の一つとして、**worker**設定に以下を追加し、バッチサイズとKafkaから取得するレコード数を調整する方法があります:

```yml
consumer.max.poll.records=[レコード数]
consumer.max.partition.fetch.bytes=[レコード数 * レコードサイズ(バイト)]
```

使用する具体的な値は、目的とするレコード数とレコードサイズによって異なります。例えば、デフォルト値は次のとおりです:

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

実装の詳細やその他の考慮事項については、公式の[Kafka](https://kafka.apache.org/documentation/#consumerconfigs)および[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config)ドキュメントを参照してください。


## MSK Connectのネットワーク設定に関する注意事項 {#notes-on-networking-for-msk-connect}

MSK ConnectがClickHouseに接続するには、MSKクラスタをプライベートサブネットに配置し、インターネットアクセス用にNATゲートウェイを接続することを推奨します。設定手順は以下のとおりです。なお、パブリックサブネットもサポートされていますが、ENIにElastic IPアドレスを常に割り当てる必要があるため推奨されません。[詳細はAWSのドキュメントを参照してください](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)

1. **プライベートサブネットの作成:** VPC内に新しいサブネットを作成し、プライベートサブネットとして指定します。このサブネットはインターネットへの直接アクセスを持たないようにしてください。
1. **NATゲートウェイの作成:** VPCのパブリックサブネット内にNATゲートウェイを作成します。NATゲートウェイにより、プライベートサブネット内のインスタンスがインターネットや他のAWSサービスに接続できるようになりますが、インターネットからそれらのインスタンスへの接続開始は防止されます。
1. **ルートテーブルの更新:** インターネット宛てトラフィックをNATゲートウェイに転送するルートを追加します
1. **セキュリティグループとネットワークACLの設定:** [セキュリティグループ](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html)と[ネットワークACL(アクセス制御リスト)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)を設定して、関連するトラフィックを許可します。
   1. MSK ConnectワーカーENIからMSKブローカーへのTLSポート(通常9094)への通信
   1. MSK ConnectワーカーENIからClickHouseエンドポイントへの通信: 9440(ネイティブTLS)または8443(HTTPS)
   1. MSK ConnectワーカーSGからブローカーSGへのインバウンドを許可
   1. セルフホスト型ClickHouseの場合、サーバーで設定されたポートを開放(HTTPのデフォルトは8123)
1. **MSKへのセキュリティグループのアタッチ:** これらのセキュリティグループがMSKクラスタとMSK Connectワーカーにアタッチされていることを確認します。
1. **ClickHouse Cloudへの接続:**
   1. パブリックエンドポイント + IP許可リスト: プライベートサブネットからのNATエグレスが必要
   1. 利用可能な場合のプライベート接続(例: VPCピアリング/PrivateLink/VPN)。VPC DNSホスト名/名前解決が有効になっており、DNSがプライベートエンドポイントを解決できることを確認してください。
1. **接続の検証(クイックチェックリスト):**
   1. コネクタ環境から、MSKブートストラップDNSを解決し、TLS経由でブローカーポートに接続
   1. ポート9440(HTTPSの場合は8443)でClickHouseへのTLS接続を確立
   1. AWSサービス(Glue/Secrets Manager)を使用する場合、それらのエンドポイントへのエグレスを許可
