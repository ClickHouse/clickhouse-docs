---
sidebar_label: Amazon MSKとKafkaコネクタシンクの統合
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: ClickHouseの公式KafkaコネクタとAmazon MSK
keywords: [integration, kafka, amazon msk, sink, connector]
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Amazon MSKとClickHouseの統合

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

## 前提条件 {#prerequisites}
以下のことを仮定します：
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)、Amazon MSK、およびMSKコネクタに精通していること。Amazon MSKの[入門ガイド](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html)と[MSK Connectガイド](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html)を推奨します。
* MSKブローカーがパブリックにアクセス可能であること。開発者ガイドの[パブリックアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html)セクションを参照してください。

## ClickHouseの公式KafkaコネクタとAmazon MSK {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}


### 接続詳細の収集 {#gather-your-connection-details}

<ConnectionDetails />

### ステップ {#steps}
1. [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)に精通していることを確認してください。
1. [MSKインスタンスを作成](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)します。
1. [IAMロールを作成して割り当て](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)ます。
1. ClickHouse Connect Sinkの[リリースページ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)から`jar`ファイルをダウンロードします。
1. ダウンロードした`jar`ファイルを、Amazon MSKコンソールの[カスタムプラグインページ](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html)にインストールします。
1. コネクタがパブリックなClickHouseインスタンスと通信する場合は、[インターネットアクセスを有効](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)にしてください。
1. 設定にトピック名、ClickHouseインスタンスのホスト名、およびパスワードを提供します。
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

## パフォーマンス調整 {#performance-tuning}
パフォーマンスを向上させる方法の1つは、バッチサイズとKafkaから取得するレコードの数を調整することです。これを**worker**設定に追加します。
```yml
consumer.max.poll.records=[NUMBER OF RECORDS]
consumer.max.partition.fetch.bytes=[NUMBER OF RECORDS * RECORD SIZE IN BYTES]
```

使用する具体的な値は、対象のレコード数とレコードサイズに応じて変わります。たとえば、デフォルト値は次のとおりです。

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

詳細情報（実装や他の考慮事項）は、公式の[Kafka](https://kafka.apache.org/documentation/#consumerconfigs)および[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config)のドキュメントで確認できます。

## MSK Connectのネットワーキングに関する注意事項 {#notes-on-networking-for-msk-connect}

MSK ConnectがClickHouseに接続できるようにするために、MSKクラスターはプライベートサブネットで、インターネットアクセス用のプライベートNATが接続されていることを推奨します。この設定方法は以下に示しています。パブリックサブネットはサポートされていますが、ENIにElastic IPアドレスを常に割り当てる必要があるため推奨されません。[AWSはここで詳細を提供しています](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)

1. **プライベートサブネットを作成する:** VPC内に新しいサブネットを作成し、プライベートサブネットとして指定します。このサブネットはインターネットへの直接アクセスがない必要があります。
1. **NATゲートウェイを作成する:** VPCのパブリックサブネットにNATゲートウェイを作成します。NATゲートウェイはプライベートサブネット内のインスタンスがインターネットや他のAWSサービスに接続することを可能にしますが、インターネットがこれらのインスタンスとの接続を開始することを防ぎます。
1. **ルートテーブルを更新する:** インターネット向けトラフィックをNATゲートウェイに向けるルートを追加します。
1. **セキュリティグループおよびネットワークACLの設定を確認する:** [セキュリティグループ](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html)および[ネットワークACL（アクセス制御リスト）](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)を構成し、ClickHouseインスタンスとの間で関連するトラフィックを許可します。
   1. ClickHouse Cloudの場合、9440および8443ポートでの受信トラフィックを許可するようセキュリティグループを構成します。
   1. セルフホストのClickHouseの場合、設定ファイルのポートでの受信トラフィック（デフォルトは8123）を許可するようにセキュリティグループを構成します。
1. **MSKにセキュリティグループを接続する:** NATゲートウェイにルーティングされている新しいセキュリティグループがMSKクラスターに接続されていることを確認します。
