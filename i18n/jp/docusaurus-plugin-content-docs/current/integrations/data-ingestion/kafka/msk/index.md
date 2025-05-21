---
sidebar_label: 'Amazon MSK と Kafka コネクタシンク'
sidebar_position: 1
slug: /integrations/kafka/cloud/amazon-msk/
description: 'ClickHouse の公式 Kafka コネクタと Amazon MSK'
keywords: ['integration', 'kafka', 'amazon msk', 'sink', 'connector']
title: 'Amazon MSK と ClickHouse の統合'
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

## 前提条件 {#prerequisites}
私たちは次のことを前提とします：
* あなたは [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)、Amazon MSK、MSK コネクタに精通しています。Amazon MSK の [はじめにガイド](https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html) と [MSK Connect ガイド](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect.html) を推奨します。
* MSK ブローカーが公開アクセス可能です。開発者ガイドの [パブリックアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/public-access.html) セクションを参照してください。

## Amazon MSK と ClickHouse の公式 Kafka コネクタ {#the-official-kafka-connector-from-clickhouse-with-amazon-msk}


### 接続詳細の取得 {#gather-your-connection-details}

<ConnectionDetails />

### 手順 {#steps}
1. [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md) に精通していることを確認してください。
1. [MSK インスタンスを作成](https://docs.aws.amazon.com/msk/latest/developerguide/create-cluster.html)します。
1. [IAM ロールを作成し、割り当てる](https://docs.aws.amazon.com/msk/latest/developerguide/create-client-iam-role.html)。
1. ClickHouse Connect Sink の [リリースページ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)から `jar` ファイルをダウンロードします。
1. Amazon MSK コンソールの [カスタムプラグインページ](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-plugins.html) にダウンロードした `jar` ファイルをインストールします。
1. コネクタが公共の ClickHouse インスタンスと通信する場合、[インターネットアクセスを有効にします](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)。
1. 設定にトピック名、ClickHouse インスタンスのホスト名、パスワードを提供します。
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
パフォーマンスを向上させる方法の一つは、バッチサイズと逆引きされるレコードの数を調整することです。次の内容を **worker** 設定に追加してください：
```yml
consumer.max.poll.records=[NUMBER OF RECORDS]
consumer.max.partition.fetch.bytes=[NUMBER OF RECORDS * RECORD SIZE IN BYTES]
```

使用する具体的な値は、希望するレコード数とレコードサイズによって異なります。例えば、デフォルト値は以下の通りです：

```yml
consumer.max.poll.records=500
consumer.max.partition.fetch.bytes=1048576
```

詳細情報（実装や他の考慮事項）については、公式の [Kafka](https://kafka.apache.org/documentation/#consumerconfigs) と 
[Amazon MSK](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-workers.html#msk-connect-create-custom-worker-config) ドキュメントを参照してください。

## MSK Connect のネットワーキングに関する注意事項 {#notes-on-networking-for-msk-connect}

MSK Connect が ClickHouse に接続するためには、MSK クラスターをプライベートサブネットに置き、インターネットアクセス用のプライベート NAT を接続することをお勧めします。この設定手順は以下の通りです。パブリックサブネットもサポートされていますが、ENI に Elastic IP アドレスを常に割り当てる必要があるため推奨はされません。 [AWS がこちらで詳細を提供しています](https://docs.aws.amazon.com/msk/latest/developerguide/msk-connect-internet-access.html)

1. **プライベートサブネットを作成:** VPC 内に新しいサブネットを作成し、プライベートサブネットとして指定します。このサブネットはインターネットへの直接アクセスを持ってはいけません。
1. **NAT Gateway を作成:** VPC のパブリックサブネットに NAT ゲートウェイを作成します。NAT ゲートウェイは、プライベートサブネット内のインスタンスがインターネットや他の AWS サービスに接続できるようにしますが、インターネットがそれらのインスタンスに接続を開始することを防ぎます。
1. **ルートテーブルを更新:** インターネット向けのトラフィックを NAT ゲートウェイに向けるルートを追加します。
1. **セキュリティグループとネットワーク ACL の設定を確認:** [セキュリティグループ](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) と [ネットワーク ACL (アクセス制御リスト)](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) を設定して、ClickHouse インスタンスとの間で関連するトラフィックを許可してください。 
   1. ClickHouse Cloud の場合、セキュリティグループを設定してポート 9440 および 8443 の着信トラフィックを許可します。
   1. セルフホストされた ClickHouse の場合、設定ファイルのポート（デフォルトは 8123）で着信トラフィックを許可するようにセキュリティグループを設定します。
1. **MSK にセキュリティグループを接続:** これらの新しいセキュリティグループが NAT ゲートウェイに向けられていることを確認し、それを MSK クラスターに接続します。
