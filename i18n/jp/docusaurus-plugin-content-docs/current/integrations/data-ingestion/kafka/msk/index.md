---
sidebar_label: Amazon MSK と Kafka コネクタ シンクの統合
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: ClickHouse の公式 Kafka コネクタと Amazon MSK
keywords: [integration, kafka, amazon msk, sink, connector]
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


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

## 前提条件 {#prerequisites}
以下のことを前提とします：
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)、Amazon MSK、および MSK コネクタに精通していること。Amazon MSK の [はじめにガイド](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) と [MSK Connect ガイド](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html) を推奨します。
* MSK ブローカーが公開されていること。[パブリックアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) のセクションを参照してください。

## Amazon MSK と ClickHouse の公式 Kafka コネクタ {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}


### 接続詳細を収集する {#gather-your-connection-details}

<ConnectionDetails />

### 手順 {#steps}
1. [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md) に精通していることを確認します。
1. [MSK インスタンスを作成する](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)。
1. [IAM ロールを作成して割り当てる](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)。
1. ClickHouse Connect Sink の [リリースページ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) から `jar` ファイルをダウンロードします。
1. Amazon MSK コンソールの [カスタムプラグインページ](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html) にダウンロードした `jar` ファイルをインストールします。
1. コネクタがパブリックな ClickHouse インスタンスと通信する場合は、[インターネットアクセスを有効にする](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)。
1. 設定でトピック名、ClickHouse インスタンスのホスト名、およびパスワードを提供します。
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
パフォーマンスを向上させる方法の一つは、バッチサイズと Kafka から取得するレコード数を調整することです。次の設定を **worker** 構成に追加します。
```yml
consumer.max.poll.records=[NUMBER OF RECORDS]
consumer.max.partition.fetch.bytes=[NUMBER OF RECORDS * RECORD SIZE IN BYTES]
```

使用する具体的な値は、希望するレコード数とレコードサイズによって異なります。例えば、デフォルト値は次の通りです。

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

詳細については、公式の [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) および
[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config) のドキュメントをご確認ください。

## MSK Connect 用のネットワーキングに関する注意事項 {#notes-on-networking-for-msk-connect}

MSK Connect が ClickHouse に接続するためには、MSK クラスターをプライベートサブネットに配置し、インターネットアクセス用のプライベート NAT を接続することを推奨します。以下にその設定方法を示します。パブリックサブネットもサポートされていますが、Elastic IP アドレスを ENI に常に割り当てる必要があるため推奨されません。[AWS からの詳細はこちら](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)。

1. **プライベートサブネットを作成する：** VPC 内に新しいサブネットを作成し、プライベートサブネットとして指定します。このサブネットにはインターネットへの直接アクセスは許可しません。
1. **NAT ゲートウェイを作成する：** VPC のパブリックサブネットに NAT ゲートウェイを作成します。NAT ゲートウェイにより、プライベートサブネット内のインスタンスがインターネットまたは他の AWS サービスに接続できますが、インターネットからこれらのインスタンスに対する接続を防ぎます。
1. **ルートテーブルを更新する：** インターネット行きのトラフィックを NAT ゲートウェイに向けるルートを追加します。
1. **セキュリティグループとネットワーク ACL の設定を確認する：** [セキュリティグループ](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) および [ネットワーク ACL (アクセスコントロールリスト)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) を設定し、ClickHouse インスタンスへの関連トラフィックを許可します。
   1. ClickHouse Cloud の場合は、9440 と 8443 番ポートでの受信トラフィックを許可するようセキュリティグループを設定します。
   1. セルフホストされた ClickHouse の場合は、設定ファイルのポート（デフォルトは 8123）で受信トラフィックを許可するようにセキュリティグループを設定します。
1. **MSK にセキュリティグループをアタッチする：** NAT ゲートウェイにルーティングされた新しいセキュリティグループが MSK クラスターにアタッチされていることを確認します。
