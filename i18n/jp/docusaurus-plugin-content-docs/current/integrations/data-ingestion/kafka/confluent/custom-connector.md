---
sidebar_label: 'Kafka Connector Sink on Confluent Platform'
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/custom-connector
description: 'Using ClickHouse Connector Sink with Kafka Connect and ClickHouse'
title: 'Integrating Confluent Cloud with ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';

# Confluent CloudとClickHouseの統合

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
次のことに慣れていることを前提とします:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloudおよび[カスタムコネクタ](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html)。

## Confluent CloudにおけるClickHouseの公式Kafkaコネクタ {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

### Confluent Cloudへのインストール {#installing-on-confluent-cloud}
これはConfluent Cloud上でClickHouse Sink Connectorを始めるための簡単なガイドです。
詳細については、[公式のConfluentドキュメント](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector)を参照してください。

#### トピックの作成 {#create-a-topic}
Confluent Cloud上でトピックを作成するのは非常に簡単で、詳細な手順は[こちら](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)にあります。

#### 重要な注意事項 {#important-notes}

* Kafkaトピック名はClickHouseテーブル名と同じでなければなりません。この調整を行う方法は、変換器（例えば[`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)）を使用することです。
* パーティションが多ければ必ずしもパフォーマンスが向上するわけではありません - 詳細とパフォーマンスのヒントについては、今後のガイドを参照してください。

#### コネクタのインストール {#install-connector}
コネクタは私たちの[リポジトリ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)からダウンロードできます - コメントや問題をぜひご自由に投稿してください！

「コネクタプラグイン」->「プラグインを追加」に移動し、以下の設定を使用してください:

```text
'コネクタクラス' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'コネクタタイプ' - Sink
'センシティブプロパティ' - 'password'。これにより、ClickHouseパスワードのエントリが設定中にマスクされます。
```
例:
<Image img={AddCustomConnectorPlugin} size="md" alt="カスタムClickHouseコネクタを追加するための設定を表示しているConfluentプラットフォームのUI" border/>

#### 接続詳細の収集 {#gather-your-connection-details}

<ConnectionDetails />

#### コネクタの設定 {#configure-the-connector}
`Connectors` -> `Add Connector`に移動し、以下の設定を使用してください（値は例に過ぎないことに注意してください）:

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
ネットワークの出口エンドポイントを追加する際は、完全修飾ドメイン名（FQDN）を使用しなければなりません。
例: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
HTTP(S)ポートを指定する必要があります。コネクタはまだネイティブプロトコルをサポートしていません。
:::

[ドキュメントを読む。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

これで準備完了です！

#### 既知の制限事項 {#known-limitations}
* カスタムコネクタは公共のインターネットエンドポイントを使用する必要があります。静的IPアドレスはサポートされていません。
* 一部のカスタムコネクタのプロパティをオーバーライドできます。公式ドキュメントの[完全なリスト](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)を参照してください。
* カスタムコネクタは[一部のAWSリージョン](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)でのみ利用可能です。
* [公式ドキュメントにおけるカスタムコネクタの制限事項のリスト](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)を参照してください。
