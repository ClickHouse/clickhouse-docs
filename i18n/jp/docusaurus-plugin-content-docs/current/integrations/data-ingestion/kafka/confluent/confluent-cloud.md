---
sidebar_label: 'Confluent Cloud 上の Kafka Connector Sink'
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/sink-connector
description: 'Confluent Cloud 上でフルマネージドの ClickHouse Connector Sink を使用するためのガイド'
title: 'Confluent Cloud と ClickHouse の統合'
keywords: ['Kafka', 'Confluent Cloud']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://clickhouse.com/cloud/clickpipes'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';


# Confluent Cloud と ClickHouse の連携

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

以下の知識があることを前提としています：

- [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
- Confluent Cloud


## ClickHouseの公式KafkaコネクタとConfluent Cloudの連携 {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

#### トピックの作成 {#create-a-topic}

Confluent Cloud上でのトピック作成は比較的簡単です。詳細な手順は[こちら](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)を参照してください。

#### 重要な注意事項 {#important-notes}

- Kafkaトピック名はClickHouseテーブル名と同一である必要があります。この動作を変更するには、トランスフォーマー(例: [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html))を使用してください。
- パーティション数を増やすことが必ずしもパフォーマンス向上につながるわけではありません。詳細とパフォーマンスのヒントについては、今後公開予定のガイドを参照してください。

#### 接続情報の収集 {#gather-your-connection-details}

<ConnectionDetails />

#### コネクタのインストール {#install-connector}

[公式ドキュメント](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html)に従って、Confluent Cloud上にフルマネージドのClickHouse Sinkコネクタをインストールしてください。

#### コネクタの設定 {#configure-the-connector}

ClickHouse Sinkコネクタの設定時には、以下の情報を提供する必要があります:

- ClickHouseサーバーのホスト名
- ClickHouseサーバーのポート番号(デフォルトは8443)
- ClickHouseサーバーのユーザー名とパスワード
- データが書き込まれるClickHouseのデータベース名
- ClickHouseへのデータ書き込みに使用されるKafkaのトピック名

Confluent CloudのUIでは、ポーリング間隔、バッチサイズ、その他のパラメータを調整してパフォーマンスを最適化するための高度な設定オプションがサポートされています。

#### 既知の制限事項 {#known-limitations}

- [公式ドキュメントのコネクタの制限事項一覧](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html#limitations)を参照してください
