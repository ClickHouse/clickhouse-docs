---


sidebar_label: 'ClickHouse と Kafka の統合'
sidebar_position: 1
slug: /integrations/kafka
description: 'ClickHouse と連携した Kafka 入門'
title: 'ClickHouse と Kafka の統合'
keywords: ['Apache Kafka', 'イベントストリーミング', 'データパイプライン', 'メッセージブローカー', 'リアルタイムデータ']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---



# ClickHouse と Kafka の統合

[Apache Kafka](https://kafka.apache.org/) は、数千社で高性能なデータパイプライン、ストリーミング分析、データ統合、およびミッションクリティカルなアプリケーションに利用されている、オープンソースの分散イベントストリーミングプラットフォームです。ClickHouse は、Kafka およびその他の Kafka API 互換ブローカー（例: Redpanda、Amazon MSK）からデータを**読み取る**、あるいはそれらにデータを**書き込む**ための複数のオプションを提供します。



## 利用可能なオプション {#available-options}

ユースケースに適したオプションを選択するには、ClickHouseのデプロイメント形態、データフローの方向、運用要件など、複数の要因に依存します。

| オプション                                                   | デプロイメント形態                | フルマネージド | KafkaからClickHouse | ClickHouseからKafka |
| -------------------------------------------------------- | ------------------------------ | :-----------: | :-----------------: | :-----------------: |
| [ClickPipes for Kafka](/integrations/clickpipes/kafka)   | [Cloud]、[BYOC]（近日公開予定） |      ✅       |         ✅          |                     |
| [Kafka Connect Sink](./kafka-clickhouse-connect-sink.md) | [Cloud]、[BYOC]、[Self-hosted] |               |         ✅          |                     |
| [Kafkaテーブルエンジン](./kafka-table-engine.md)            | [Cloud]、[BYOC]、[Self-hosted] |               |         ✅          |         ✅          |

これらのオプションの詳細な比較については、[オプションの選択](#choosing-an-option)を参照してください。

### ClickPipes for Kafka {#clickpipes-for-kafka}

[ClickPipes](../clickpipes/index.md)は、多様なソースからのデータ取り込みを数回のクリックで簡単に実現するマネージド統合プラットフォームです。フルマネージドで本番ワークロード向けに特別に構築されているため、ClickPipesはインフラストラクチャと運用コストを大幅に削減し、外部のデータストリーミングやETLツールを不要にします。

:::tip
ClickHouse Cloudユーザーには、このオプションを推奨します。ClickPipesは**フルマネージド**であり、Cloud環境で**最高のパフォーマンス**を提供するために特別に構築されています。
:::

#### 主な機能 {#clickpipes-for-kafka-main-features}

[//]: # "TODO It isn't optimal to link to a static alpha-release of the Terraform provider. Link to a Terraform guide once that's available."

- ClickHouse Cloudに最適化され、超高速なパフォーマンスを実現
- 高スループットワークロードに対応する水平および垂直スケーラビリティ
- 設定可能なレプリカと自動リトライによる組み込みの耐障害性
- ClickHouse Cloud UI、[Open API](/cloud/manage/api/api-overview)、または[Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.3.3-alpha2/docs/resources/clickpipe)によるデプロイメントと管理
- クラウドネイティブ認証（IAM）とプライベート接続（PrivateLink）をサポートするエンタープライズグレードのセキュリティ
- Confluent Cloud、Amazon MSK、Redpanda Cloud、Azure Event Hubsを含む幅広い[データソース](/integrations/clickpipes/kafka/reference/)をサポート
- 最も一般的なシリアライゼーション形式をサポート（JSON、Avro、Protobufは近日公開予定）

#### はじめに {#clickpipes-for-kafka-getting-started}

ClickPipes for Kafkaの使用を開始するには、[リファレンスドキュメント](/integrations/clickpipes/kafka/reference)を参照するか、ClickHouse Cloud UIの`Data Sources`タブに移動してください。

### Kafka Connect Sink {#kafka-connect-sink}

Kafka Connectは、Kafkaと他のデータシステム間のシンプルなデータ統合のための集中型データハブとして機能するオープンソースフレームワークです。[ClickHouse Kafka Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect)コネクタは、Apache Kafkaおよび他のKafka API互換ブローカーからデータを読み取るためのスケーラブルで高度に設定可能なオプションを提供します。

:::tip
**高い設定可能性**を好む場合、またはすでにKafka Connectユーザーである場合は、このオプションを推奨します。
:::

#### 主な機能 {#kafka-connect-sink-main-features}

- 厳密に1回のセマンティクスをサポートするように設定可能
- 最も一般的なシリアライゼーション形式をサポート（JSON、Avro、Protobuf）
- ClickHouse Cloudに対して継続的にテスト済み

#### はじめに {#kafka-connect-sink-getting-started}

ClickHouse Kafka Connect Sinkの使用を開始するには、[リファレンスドキュメント](./kafka-clickhouse-connect-sink.md)を参照してください。

### Kafkaテーブルエンジン {#kafka-table-engine}

[Kafkaテーブルエンジン](./kafka-table-engine.md)は、Apache Kafkaおよび他のKafka API互換ブローカーからデータを読み取り、データを書き込むために使用できます。このオプションはオープンソースのClickHouseにバンドルされており、すべてのデプロイメント形態で利用可能です。

:::tip
ClickHouseをセルフホスティングしており、**導入障壁の低い**オプションが必要な場合、またはKafkaにデータを**書き込む**必要がある場合は、このオプションを推奨します。
:::

#### 主な機能 {#kafka-table-engine-main-features}

- データの[読み取り](./kafka-table-engine.md/#kafka-to-clickhouse)と[書き込み](./kafka-table-engine.md/#clickhouse-to-kafka)に使用可能
- オープンソースのClickHouseにバンドル
- 最も一般的なシリアライゼーション形式をサポート（JSON、Avro、Protobuf）

#### はじめに {#kafka-table-engine-getting-started}


Kafkaテーブルエンジンの使用を開始するには、[リファレンスドキュメント](./kafka-table-engine.md)を参照してください。

### オプションの選択 {#choosing-an-option}

| 製品                  | 強み                                                                                                                                                                                                                                                                                           | 弱み                                                                                                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ClickPipes for Kafka** | • 高スループットと低レイテンシを実現するスケーラブルなアーキテクチャ<br/>• 組み込みの監視とスキーマ管理<br/>• プライベートネットワーク接続(PrivateLink経由)<br/>• SSL/TLS認証とIAM認可をサポート<br/>• プログラマティックな設定をサポート(Terraform、APIエンドポイント) | • Kafkaへのデータプッシュには非対応<br/>• At-least-onceセマンティクス                                                                                                                                                |
| **Kafka Connect Sink**   | • Exactly-onceセマンティクス<br/>• データ変換、バッチ処理、エラー処理に対するきめ細かい制御が可能<br/>• プライベートネットワークにデプロイ可能<br/>• Debezium経由でClickPipesがまだサポートしていないデータベースからのリアルタイムレプリケーションが可能                                               | • Kafkaへのデータプッシュには非対応<br/>• セットアップと保守が運用上複雑<br/>• KafkaとKafka Connectの専門知識が必要                                                                          |
| **Kafkaテーブルエンジン**   | • [Kafkaへのデータプッシュ](./kafka-table-engine.md/#clickhouse-to-kafka)をサポート<br/>• セットアップが運用上シンプル                                                                                                                                                                               | • At-least-onceセマンティクス<br/>• コンシューマーの水平スケーリングが制限される。ClickHouseサーバーから独立してスケールできない<br/>• エラー処理とデバッグオプションが制限される<br/>• Kafkaの専門知識が必要 |

### その他のオプション {#other-options}

- [**Confluent Cloud**](./confluent/index.md) - Confluent Platformは、[Confluent CloudでClickHouse Connector Sinkをアップロードして実行](./confluent/custom-connector.md)するオプション、またはHTTPまたはHTTPS経由でApache KafkaをAPIと統合する[HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)を使用するオプションを提供します。

- [**Vector**](./kafka-vector.md) - Vectorはベンダー非依存のデータパイプラインです。Kafkaから読み取り、ClickHouseにイベントを送信する機能を備えており、堅牢な統合オプションとなります。

- [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sinkコネクタを使用すると、KafkaトピックからJDBCドライバを持つ任意のリレーショナルデータベースにデータをエクスポートできます。

- **カスタムコード** - イベントのカスタム処理が必要な場合、KafkaとClickHouseの[クライアントライブラリ](../../language-clients/index.md)を使用したカスタムコードが適切な選択肢となる可能性があります。

[BYOC]: /cloud/reference/byoc/overview
[Cloud]: /cloud/get-started
[Self-hosted]: ../../../intro.md
