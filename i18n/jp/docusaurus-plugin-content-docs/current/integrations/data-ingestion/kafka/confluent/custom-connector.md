---
sidebar_label: 'Confluent Platform 上の Kafka シンクコネクタ'
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/custom-connector
description: 'Kafka Connect と ClickHouse で ClickHouse シンクコネクタを使用する'
title: 'Confluent Cloud と ClickHouse の統合'
keywords: ['Confluent ClickHouse 統合', 'ClickHouse Kafka コネクタ', 'Kafka Connect ClickHouse シンク', 'Confluent Platform ClickHouse', 'Confluent 向けカスタムコネクタ']
doc_type: 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';

# Confluent Platform と ClickHouse の連携 {#integrating-confluent-platform-with-clickhouse}

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
以下の内容に精通していることを前提とします:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Platform および [Custom Connectors](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html)。

## Confluent Platform 向け ClickHouse 公式 Kafka コネクタ {#the-official-kafka-connector-from-clickhouse-with-confluent-platform}

### Confluent Platform へのインストール {#installing-on-confluent-platform}

本ガイドは、Confluent Platform 上で ClickHouse Sink Connector を使い始めるためのクイックスタートです。
詳細については、[Confluent 公式ドキュメント](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector)を参照してください。

#### トピックの作成 {#create-a-topic}

Confluent Platform 上でトピックを作成するのは比較的容易で、詳細な手順は[こちら](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)に記載されています。

#### 重要な注意事項 {#important-notes}

* Kafka のトピック名は ClickHouse のテーブル名と同一である必要があります。これを調整するには、トランスフォーム（たとえば [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html) など）を利用します。
* パーティション数を増やせば常に性能が向上するとは限りません。詳細およびパフォーマンスに関するヒントについては、今後公開予定のガイドで説明します。

#### コネクタのインストール {#install-connector}

コネクタは[リポジトリ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)からダウンロードできます。コメントや issue もぜひそちらに投稿してください。

「Connector Plugins」→「Add plugin」に移動し、次の設定を使用します。

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'。これにより、設定中にClickHouseパスワードの入力がマスクされます。
```

例:

<Image img={AddCustomConnectorPlugin} size="md" alt="ClickHouse のカスタムコネクタを追加するための設定を表示している Confluent Platform の UI" border />

#### 接続情報を収集する {#gather-your-connection-details}

<ConnectionDetails />

#### コネクタを設定する {#configure-the-connector}

`Connectors` -&gt; `Add Connector` に移動し、次の設定を使用します（値はあくまでサンプルです）。

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

コネクタがアクセス可能なエンドポイントの allow-list（許可リスト）を指定する必要があります。
ネットワークの送信（egress）エンドポイントを追加する際は、必ず FQDN（完全修飾ドメイン名）を使用してください。
例: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
HTTP(S) ポートを必ず指定してください。Connector はまだ Native プロトコルをサポートしていません。
:::

[ドキュメントを参照してください。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

これで準備は完了です。

#### 既知の制限事項 {#known-limitations}

* Custom Connector はパブリックインターネット上のエンドポイントを使用する必要があります。固定 IP アドレスはサポートされていません。
* 一部の Custom Connector プロパティは上書きできます。公式ドキュメントに記載されている[完全な一覧を参照してください。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
* Custom Connector は[一部の AWS リージョン](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)でのみ利用可能です。
* 公式ドキュメントに記載されている[Custom Connector の制限事項一覧](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)も参照してください。
