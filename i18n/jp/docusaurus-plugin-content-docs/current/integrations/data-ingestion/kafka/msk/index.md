---
'sidebar_label': 'Amazon MSK と Kafka コネクタシンク'
'sidebar_position': 1
'slug': '/integrations/kafka/cloud/amazon-msk/'
'description': 'Amazon MSK を使用した ClickHouse からの公式 Kafka コネクタ'
'keywords':
- 'integration'
- 'kafka'
- 'amazon msk'
- 'sink'
- 'connector'
'title': 'Amazon MSK と ClickHouse の統合'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


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
次のことを前提とします：
* あなたは [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)、Amazon MSK、MSK Connectors に精通しています。Amazon MSK の [はじめにガイド](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) と [MSK Connect ガイド](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html) をお勧めします。
* MSK ブローカーは公開アクセス可能です。開発者ガイドの [公開アクセス](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) セクションを参照してください。

## Amazon MSKによるClickHouseの公式Kafkaコネクタ {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}

### 接続詳細を集める {#gather-your-connection-details}

<ConnectionDetails />

### 手順 {#steps}
1. [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md) に精通していることを確認してください。
1. [MSKインスタンスを作成](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)します。
1. [IAMロールを作成して割り当てる](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)。
1. ClickHouse Connect Sink の [リリースページ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) から `jar` ファイルをダウンロードします。
1. Amazon MSKコンソールの [カスタムプラグインページ](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html) にダウンロードした `jar` ファイルをインストールします。
1. コネクタが公開のClickHouseインスタンスと通信する場合、[インターネットアクセスを有効にする](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)。
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
パフォーマンスを向上させる一つの方法は、以下の設定を**ワーカー**構成に追加し、バッチサイズとKafkaから取得するレコードの数を調整することです：
```yml
consumer.max.poll.records=[NUMBER OF RECORDS]
consumer.max.partition.fetch.bytes=[NUMBER OF RECORDS * RECORD SIZE IN BYTES]
```

使用する具体的な値は、希望するレコード数とレコードサイズによって異なります。たとえば、デフォルト値は次の通りです：

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

公式の [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) と 
[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config) ドキュメントで、詳細（実装やその他の考慮事項）を見つけることができます。

## MSK Connectのネットワークに関する注意事項 {#notes-on-networking-for-msk-connect}

MSK ConnectがClickHouseに接続できるようにするため、MSKクラスターをインターネットアクセス用に接続されたプライベートNATがあるプライベートサブネット内に配置することをお勧めします。これを設定する方法は以下に示します。公共サブネットもサポートされていますが、ENIにElastic IPアドレスを常に割り当てる必要があるため推奨されません。詳細は[AWSがこちらで提供しています](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)

1. **プライベートサブネットを作成：** VPC内に新しいサブネットを作成し、プライベートサブネットとして指定します。このサブネットはインターネットへの直接アクセスを持たないべきです。
1. **NATゲートウェイを作成：** VPCの公共サブネットにNATゲートウェイを作成します。NATゲートウェイは、プライベートサブネット内のインスタンスがインターネットや他のAWSサービスに接続できるようにしますが、インターネットがそのインスタンスへの接続を開始するのを防ぎます。
1. **ルートテーブルを更新：** インターネット向けのトラフィックをNATゲートウェイに向けるルートを追加します。
1. **セキュリティグループとネットワークACLの設定を確認：** [セキュリティグループ](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) と [ネットワークACL（アクセス制御リスト）](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) を設定して、ClickHouseインスタンスとの間で関連するトラフィックを許可します。
   1. ClickHouse Cloudの場合、セキュリティグループを設定してポート9440および8443の着信トラフィックを許可します。
   1. セルフホストのClickHouseの場合、設定ファイルに記載のポート（デフォルトは8123）で着信トラフィックを許可するようにセキュリティグループを設定します。
1. **セキュリティグループをMSKにアタッチ：** NATゲートウェイにルーティングされた新しいセキュリティグループがMSKクラスターにアタッチされていることを確認します。
