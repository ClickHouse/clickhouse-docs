---
sidebar_label: ConfluentプラットフォームでのKafkaコネクタシンク
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/custom-connector
description: Kafka ConnectとClickHouseを使用したClickHouseコネクタシンク
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

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
以下についての理解があることを前提としています：
* [ClickHouseコネクタシンク](../kafka-clickhouse-connect-sink.md)
* Confluent Cloudおよび[カスタムコネクタ](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html)。

## Confluent CloudとのClickHouseの公式Kafkaコネクタ {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

### Confluent Cloudへのインストール {#installing-on-confluent-cloud}
これは、Confluent Cloud上でClickHouseシンクコネクタのセットアップを開始するための簡単なガイドです。
詳しくは、[公式Confluentドキュメント](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector)を参照してください。

#### トピックの作成 {#create-a-topic}
Confluent Cloud上でトピックを作成するのは非常に簡単で、詳細な手順が[こちら](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)に記載されています。

#### 重要な注意点 {#important-notes}

* Kafkaトピック名はClickHouseテーブル名と同じである必要があります。これを調整する方法には、トランスフォーマーを使用することが含まれます（例えば[`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)）。
* パーティションが多いからといって常にパフォーマンスが向上するわけではありません - 詳細とパフォーマンスのヒントについては、今後のガイドをご覧ください。

#### コネクタのインストール {#install-connector}
私たちの[リポジトリ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)からコネクタをダウンロードできます。フィードバックや問題の報告もお気軽にこちらにお願いします！

「コネクタプラグイン」 -> 「プラグインを追加」を選択し、以下の設定を使用してください：

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'. これにより、ClickHouseのパスワードの入力が構成中にマスクされます。
```
例：
<img src={require('./images/AddCustomConnectorPlugin.png').default} class="image" alt="カスタムコネクタを追加するための設定" style={{width: '50%'}}/>

#### 接続詳細の収集 {#gather-your-connection-details}
<ConnectionDetails />

#### コネクタの設定 {#configure-the-connector}
`Connectors` -> `Add Connector`に移動し、以下の設定を使用します（値は例に過ぎないことに注意してください）：

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
コネクタがアクセスできるエンドポイントのホワイトリストを指定する必要があります。
ネットワークの出口エンドポイントを追加する際には、完全修飾ドメイン名（FQDN）を使用する必要があります。
例： `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
HTTP(S)ポートを指定する必要があります。コネクタはまだネイティブプロトコルをサポートしていません。
:::

[ドキュメントを読む。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

これで準備完了です！

#### 制限事項 {#known-limitations}
* カスタムコネクタは公共のインターネットエンドポイントを使用する必要があります。静的IPアドレスはサポートされていません。
* 一部のカスタムコネクタプロパティを上書きすることができます。詳しくは[公式ドキュメントの全リストを参照してください。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
* カスタムコネクタは[一部のAWSリージョン](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)でのみ利用可能です。
* [公式ドキュメントでのカスタムコネクタの制限事項のリストを参照してください。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)
