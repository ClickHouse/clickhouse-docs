---
sidebar_label: 'Confluent Platform 上の Kafka Sink コネクタ'
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/custom-connector
description: 'Kafka Connect と ClickHouse で ClickHouse Sink コネクタを使用する'
title: 'Confluent Cloud と ClickHouse の連携'
keywords: ['Confluent ClickHouse 連携', 'ClickHouse Kafka コネクタ', 'Kafka Connect ClickHouse シンク', 'Confluent Platform ClickHouse', 'Confluent カスタムコネクタ']
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';


# Confluent Platform と ClickHouse の統合

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/SQAiPVbd3gg"
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

以下の内容について理解していることを前提としています：

- [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
- Confluent Platformおよび[カスタムコネクタ](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html)


## ClickHouseの公式KafkaコネクタとConfluent Platformの統合 {#the-official-kafka-connector-from-clickhouse-with-confluent-platform}

### Confluent Platformへのインストール {#installing-on-confluent-platform}

本ガイドは、Confluent Platform上でClickHouse Sink Connectorを使い始めるためのクイックガイドです。
詳細については、[Confluent公式ドキュメント](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector)を参照してください。

#### トピックの作成 {#create-a-topic}

Confluent Platform上でのトピック作成は比較的簡単です。詳細な手順は[こちら](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)を参照してください。

#### 重要な注意事項 {#important-notes}

- Kafkaトピック名はClickHouseテーブル名と同一である必要があります。これを調整するには、トランスフォーマー（例：[`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)）を使用してください。
- パーティション数を増やしても必ずしもパフォーマンスが向上するわけではありません。詳細とパフォーマンスのヒントについては、今後公開予定のガイドを参照してください。

#### コネクタのインストール {#install-connector}

コネクタは[リポジトリ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)からダウンロードできます。コメントや問題の報告もお気軽にお寄せください。

「Connector Plugins」→「Add plugin」に移動し、以下の設定を使用します：

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'。これにより、設定時にClickHouseパスワードの入力がマスクされます。
```

例：

<Image
  img={AddCustomConnectorPlugin}
  size='md'
  alt='カスタムClickHouseコネクタを追加するための設定を表示するConfluent Platform UI'
  border
/>

#### 接続情報の収集 {#gather-your-connection-details}

<ConnectionDetails />

#### コネクタの設定 {#configure-the-connector}

`Connectors`→`Add Connector`に移動し、以下の設定を使用します（値は例示のみです）：

```json
{
  "database": "<DATABASE_NAME>",
  "errors.retry.timeout": "30",
  "exactlyOnce": "false",
  "schemas.enable": "false",
  "hostname": "<CLICKHOUSE_HOSTNAME>",
  "password": "<SAMPLE_PASSWORD>",
  "port": "8443",
  "ssl": "true",
  "topics": "<TOPIC_NAME>",
  "username": "<SAMPLE_USERNAME>",
  "key.converter": "org.apache.kafka.connect.storage.StringConverter",
  "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  "value.converter.schemas.enable": "false"
}
```

#### 接続エンドポイントの指定 {#specify-the-connection-endpoints}

コネクタがアクセスできるエンドポイントの許可リストを指定する必要があります。
ネットワーク出力エンドポイントを追加する際は、完全修飾ドメイン名（FQDN）を使用する必要があります。
例：`u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
HTTP(S)ポートを指定する必要があります。コネクタはまだNativeプロトコルをサポートしていません。
:::

[ドキュメントを参照してください。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

これで準備完了です。

#### 既知の制限事項 {#known-limitations}

- カスタムコネクタはパブリックインターネットエンドポイントを使用する必要があります。静的IPアドレスはサポートされていません。
- 一部のカスタムコネクタプロパティは上書き可能です。完全な[リストは公式ドキュメント](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)を参照してください。
- カスタムコネクタは[一部のAWSリージョン](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)でのみ利用可能です
- [公式ドキュメントのカスタムコネクタの制限事項リスト](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)を参照してください
