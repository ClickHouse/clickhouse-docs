---
sidebar_label: Confluent PlatformのKafkaコネクタシンク
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/custom-connector
description: ClickHouseでKafka ConnectとClickHouse Connector Sinkを使用する
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';


# ClickHouseとConfluent Cloudの統合

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
以下に慣れていることを前提としています:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloudおよび[カスタムコネクタ](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html)。

## Confluent Cloud用の公式Kafkaコネクタ {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

### Confluent Cloudへのインストール {#installing-on-confluent-cloud}
これは、Confluent Cloud上でClickHouse Sink Connectorを使用するためのクイックガイドです。
詳細については、[公式Confluentドキュメント](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector)を参照してください。

#### トピックの作成 {#create-a-topic}
Confluent Cloud上でトピックを作成するのは比較的簡単で、詳細な手順は[こちら](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)にあります。

#### 重要な注意事項 {#important-notes}

* Kafkaのトピック名はClickHouseのテーブル名と同じでなければなりません。この点を調整する方法として、トランスフォーマー（例えば[`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)）を使用します。
* パーティションが多いからといって常にパフォーマンスが向上するわけではありません - 詳細とパフォーマンスのヒントについては、今後のガイドを参照してください。

#### コネクタのインストール {#install-connector}
コネクタは[リポジトリ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)からダウンロードできます。コメントや問題点についてもお気軽にお知らせください！

「コネクタプラグイン」->「プラグインを追加」に移動し、次の設定を使用します。

```text
'コネクタクラス' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'コネクタタイプ' - Sink
'機密プロパティ' - 'password'。これにより、ClickHouseのパスワードのエントリが設定中にマスクされます。
```
例:
<img src={AddCustomConnectorPlugin} class="image" alt="カスタムコネクタ追加の設定" style={{width: '50%'}}/>

#### 接続詳細を収集する {#gather-your-connection-details}
<ConnectionDetails />

#### コネクタの設定 {#configure-the-connector}
`Connectors` -> `Add Connector`に移動し、次の設定を使用します（値は例に過ぎないことに注意してください）:

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

#### 接続エンドポイントを指定する {#specify-the-connection-endpoints}
コネクタがアクセスできるエンドポイントの許可リストを指定する必要があります。
ネットワークの出口エンドポイントを追加する際は、完全修飾ドメイン名 (FQDN) を使用しなければなりません。
例: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
HTTP(S)ポートを指定する必要があります。コネクタはネイティブプロトコルをまだサポートしていません。
:::

[ドキュメントを読む。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

これで準備は整いました！

#### 知っておくべき制限事項 {#known-limitations}
* カスタムコネクタはパブリックインターネットエンドポイントを使用する必要があります。静的IPアドレスはサポートされていません。
* 一部のカスタムコネクタのプロパティを上書きすることができます。詳細は[公式ドキュメントの一覧](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)を参照してください。
* カスタムコネクタは[一部のAWSリージョン](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)でのみ利用可能です。
* [公式ドキュメントにおけるカスタムコネクタの制限事項の一覧を参照してください](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)。
