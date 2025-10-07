---
'sidebar_label': 'Confluent Cloud上のKafkaコネクタシンク'
'sidebar_position': 2
'slug': '/integrations/kafka/cloud/confluent/sink-connector'
'description': 'フルマネージドのClickHouseコネクタシンクをConfluent Cloudで使用するためのガイド'
'title': 'Confluent CloudとClickHouseの統合'
'keywords':
- 'Kafka'
- 'Confluent Cloud'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';


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
以下に精通していることを前提としています：
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud

## Confluent Cloudとの公式Kafkaコネクタ {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

#### トピックの作成 {#create-a-topic}
Confluent Cloudでトピックを作成するのは非常に簡単で、詳細な手順は[こちら](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)にあります。

#### 重要な注意事項 {#important-notes}

* Kafkaのトピック名はClickHouseのテーブル名と同じでなければなりません。この調整方法はトランスフォーマーを使用することです（例えば [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)）。
* パーティションが多いことが常にパフォーマンスを向上させるわけではありません - 詳細やパフォーマンスのヒントについては、今後のガイドを参照してください。

#### 接続情報を収集する {#gather-your-connection-details}
<ConnectionDetails />

#### コネクタのインストール {#install-connector}
Confluent Cloud上に完全に管理されたClickHouse Sink Connectorをインストールするには、[公式ドキュメント](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html)に従ってください。

#### コネクタの設定 {#configure-the-connector}
ClickHouse Sink Connectorの設定中に、以下の情報を提供する必要があります：
- ClickHouseサーバーのホスト名
- ClickHouseサーバーのポート（デフォルトは8443）
- ClickHouseサーバーのユーザー名とパスワード
- データが書き込まれるClickHouseのデータベース名
- ClickHouseにデータを書き込むために使用されるKafkaのトピック名

Confluent CloudのUIは、パフォーマンスを最適化するためにポーリング間隔、バッチサイズ、およびその他のパラメータを調整するための高度な設定オプションをサポートしています。

#### 知られている制限事項 {#known-limitations}
* [公式ドキュメントのコネクタの制限事項のリスト](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html#limitations)を参照してください。
