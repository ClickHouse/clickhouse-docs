---
sidebar_label: 'Kafka Connector Sink on Confluent Platform'
sidebar_position: 2
slug: '/integrations/kafka/cloud/confluent/custom-connector'
description: 'Using ClickHouse Connector Sink with Kafka Connect and ClickHouse'
title: 'Integrating Confluent Cloud with ClickHouse'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';


# Confluent Cloud と ClickHouse の統合

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
以下に精通していることを前提とします：
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud および [カスタムコネクタ](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html)。

## ClickHouse の公式 Kafka コネクタと Confluent Cloud {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

### Confluent Cloud へのインストール {#installing-on-confluent-cloud}
これは、Confluent Cloud 上の ClickHouse Sink Connector を開始するための簡単なガイドです。
詳細については、[公式の Confluent ドキュメント](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector) を参照してください。

#### トピックの作成 {#create-a-topic}
Confluent Cloud 上にトピックを作成するのは非常に簡単で、詳細な手順は[こちら](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)にあります。

#### 重要な注意点 {#important-notes}

* Kafka のトピック名は ClickHouse のテーブル名と同じである必要があります。これを調整する方法は、トランスフォーマーを使用することです（例： [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)）。
* パーティションが多いことが常にパフォーマンス向上に繋がるわけではありません - 詳細やパフォーマンスのヒントについては今後のガイドを参照してください。

#### コネクタのインストール {#install-connector}
コネクタは、私たちの[リポジトリ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)からダウンロードできます - コメントや問題をその場所に送信しても問題ありません！

「コネクタプラグイン」->「プラグインを追加」に移動し、以下の設定を使用します：

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'. これにより、ClickHouse パスワードのエントリが設定中にマスクされます。
```
例：
<Image img={AddCustomConnectorPlugin} size="md" alt="カスタム ClickHouse コネクタを追加するための設定を示す Confluent Platform UI" border/>

#### 接続の詳細を収集する {#gather-your-connection-details}
<ConnectionDetails />

#### コネクタの設定 {#configure-the-connector}
`Connectors` -> `Add Connector` に移動し、以下の設定を使用します（値は例であることに注意してください）：

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
ネットワークのエグレスエンドポイントを追加する際には、完全修飾ドメイン名 (FQDN) を使用する必要があります。
例: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
HTTP(S) ポートを指定する必要があります。コネクタはまだネイティブプロトコルをサポートしていません。
:::

[ドキュメントを読む。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

これで準備は整いました！

#### 知っておくべき制限事項 {#known-limitations}
* カスタムコネクタは公共インターネットエンドポイントを使用する必要があります。静的 IP アドレスはサポートされていません。
* 一部のカスタムコネクタのプロパティを上書きできます。完全なリストは[公式ドキュメント](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)を参照してください。
* カスタムコネクタは[一部の AWS リージョン](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)でのみ利用可能です。
* [公式ドキュメント](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)にカスタムコネクタの制限事項のリストがあります。
