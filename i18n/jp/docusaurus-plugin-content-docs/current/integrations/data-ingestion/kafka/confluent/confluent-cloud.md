---
sidebar_label: 'Confluent Cloud 上の Kafka Connector Sink'
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/sink-connector
description: 'Confluent Cloud 上でフルマネージドの ClickHouse Connector Sink を利用するためのガイド'
title: 'Confluent Cloud と ClickHouse の統合'
keywords: ['Kafka', 'Confluent Cloud']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://clickhouse.com/cloud/clickpipes'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';


# Confluent Cloud と ClickHouse の統合 \{#integrating-confluent-cloud-with-clickhouse\}

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

## 前提条件 \\{#prerequisites\\}

以下の内容について理解していることを前提とします:

* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud

## Confluent Cloud 向け ClickHouse 公式 Kafka コネクタ \\{#the-official-kafka-connector-from-clickhouse-with-confluent-cloud\\}

#### トピックを作成する \\{#create-a-topic\\}

Confluent Cloud 上でトピックを作成するのは比較的簡単で、詳細な手順は[こちら](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)に記載されています。

#### 重要な注意事項 \\{#important-notes\\}

* Kafka のトピック名は ClickHouse のテーブル名と同一である必要があります。これを調整するには、トランスフォーマー（たとえば [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)）を使用します。
* パーティション数が多ければ常にパフォーマンスが向上するとは限りません。詳細およびパフォーマンス向上のためのヒントについては、今後公開予定のガイドを参照してください。

#### 接続情報を収集する \\{#gather-your-connection-details\\}

<ConnectionDetails />

#### コネクタをインストールする \\{#install-connector\\}

[公式ドキュメント](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html)に従って、Confluent Cloud 上に完全マネージド型の ClickHouse Sink Connector をインストールします。

#### コネクタを設定する \\{#configure-the-connector\\}

ClickHouse Sink Connector を設定する際に、次の情報を指定する必要があります:

- ClickHouse サーバーのホスト名
- ClickHouse サーバーのポート（デフォルトは 8443）
- ClickHouse サーバーのユーザー名とパスワード
- データを書き込む ClickHouse 上のデータベース名
- ClickHouse へのデータ書き込みに使用する Kafka のトピック名

Confluent Cloud の UI では、ポーリング間隔、バッチサイズ、その他のパラメータを調整してパフォーマンスを最適化するための高度な設定オプションを利用できます。

:::note  
Confluent Cloud 上では、[fetch settings](/integrations/kafka/clickhouse-kafka-connect-sink/#fetch-settings) や [poll settings](/integrations/kafka/clickhouse-kafka-connect-sink/#poll-settings) など一部の設定を調整するには、Confluent Cloud を通じてサポートケースを作成する必要があります。
:::  

#### 既知の制限事項 \\{#known-limitations\\}

* [公式ドキュメントに記載されている Connectors の制限事項一覧](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html#limitations)を参照してください。