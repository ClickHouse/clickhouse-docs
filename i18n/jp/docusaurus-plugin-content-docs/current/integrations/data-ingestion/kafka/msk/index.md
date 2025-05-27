---
'sidebar_label': 'Amazon MSK with Kafka Connector Sink'
'sidebar_position': 1
'slug': '/integrations/kafka/cloud/amazon-msk/'
'description': 'The official Kafka connector from ClickHouse with Amazon MSK'
'keywords':
- 'integration'
- 'kafka'
- 'amazon msk'
- 'sink'
- 'connector'
'title': 'Amazon MSK with ClickHouse との統合'
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
以下を前提とします：
* あなたは [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)、Amazon MSK、MSKコネクタに精通しているものとします。Amazon MSKの [はじめにガイド](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) と [MSK Connectガイド](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html) を推奨します。
* MSKブローカーが公開アクセス可能であること。開発者ガイドの [公開アクセス](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) セクションを参照してください。

## ClickHouseの公式KafkaコネクタとAmazon MSK {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}

### 接続の詳細を収集する {#gather-your-connection-details}

<ConnectionDetails />

### ステップ {#steps}
1. [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)に精通していることを確認してください。
1. [MSKインスタンスを作成](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)します。
1. [IAMロールを作成して割り当て](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)ます。
1. ClickHouse Connect Sinkの [リリースページ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)から`jar`ファイルをダウンロードします。
1. Amazon MSKコンソールの [カスタムプラグインページ](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html)にダウンロードした`jar`ファイルをインストールします。
1. コネクタが公開のClickHouseインスタンスと通信する場合、[インターネットアクセスを有効にします](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)。
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

## パフォーマンスチューニング {#performance-tuning}
パフォーマンスを向上させる方法の一つは、バッチサイズとKafkaから取得されるレコードの数を調整することです。以下を**worker**構成に追加します：
```yml
consumer.max.poll.records=[レコード数]
consumer.max.partition.fetch.bytes=[レコード数 * バイト単位のレコードサイズ]
```

使用する具体的な値は、希望するレコード数やレコードサイズによって異なります。例えば、デフォルトの値は以下の通りです：

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

詳細（実装やその他の考慮事項）は、公式の [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) および 
[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config) ドキュメントに記載されています。

## MSK Connect用のネットワーキングに関する注意事項 {#notes-on-networking-for-msk-connect}

MSK ConnectがClickHouseに接続するためには、MSKクラスターをプライベートサブネットに配置し、インターネットアクセスのためにプライベートNATを接続することを推奨します。設定手順は以下に示します。公共サブネットもサポートされていますが、ENIにElastic IPアドレスを常に割り当てる必要があるため推奨されません。詳細は[AWSがこちらで提供しています](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)。

1. **プライベートサブネットを作成する:** VPC内に新しいサブネットを作成し、それをプライベートサブネットとして指定します。このサブネットはインターネットへの直接アクセスを持ってはいけません。
1. **NATゲートウェイを作成する:** VPCの公共サブネット内にNATゲートウェイを作成します。NATゲートウェイは、プライベートサブネット内のインスタンスがインターネットまたは他のAWSサービスに接続できるようにしますが、インターネットがそれらのインスタンスに接続を開始することを防ぎます。
1. **ルートテーブルを更新する:** インターネット向けのトラフィックをNATゲートウェイへ誘導するルートを追加します。
1. **セキュリティグループおよびネットワークACLの構成を確認する:** [セキュリティグループ](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html)と[ネットワークACL（アクセス制御リスト）](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)を設定して、ClickHouseインスタンスへの関連トラフィックを許可します。
   1. ClickHouse Cloudの場合、9440および8443ポートでの着信トラフィックを許可するようセキュリティグループを設定します。 
   1. セルフホスティングのClickHouseの場合、設定ファイルのポート（デフォルトは8123）での着信トラフィックを許可するようセキュリティグループを設定します。
1. **MSKにセキュリティグループをアタッチする:** NATゲートウェイにルーティングされた新しいセキュリティグループがMSKクラスターにアタッチされていることを確認します。
