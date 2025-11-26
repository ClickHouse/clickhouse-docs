---


sidebar_label: 'Kafka と ClickHouse の統合'
sidebar_position: 1
slug: /integrations/kafka
description: 'ClickHouse と連携した Kafka の概要'
title: 'Kafka と ClickHouse の統合'
keywords: ['Apache Kafka', 'イベントストリーミング', 'データパイプライン', 'メッセージブローカー', 'リアルタイムデータ']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---



# Kafka を ClickHouse と統合する

[Apache Kafka](https://kafka.apache.org/) は、ハイパフォーマンスなデータパイプライン、ストリーミング分析、データ統合、およびミッションクリティカルなアプリケーションのために数千社で利用されている、オープンソースの分散イベントストリーミングプラットフォームです。ClickHouse は、Kafka およびその他の Kafka API 互換ブローカー（例: Redpanda、Amazon MSK）からの**読み取り**およびそれらへの**書き込み**を行うための複数のオプションを提供します。



## 利用可能なオプション {#available-options}

ユースケースに最適なオプションを選択するには、ClickHouse のデプロイメントタイプ、データフローの方向性、運用要件など、複数の要因を考慮する必要があります。

| オプション                                                  | デプロイメントタイプ | フルマネージド | Kafka から ClickHouse | ClickHouse から Kafka |
|---------------------------------------------------------|------------|:-------------------:|:-------------------:|:------------------:|
| [ClickPipes for Kafka](/integrations/clickpipes/kafka)                                | [Cloud], [BYOC] (coming soon!)   | ✅ | ✅ |   |
| [Kafka Connect Sink](./kafka-clickhouse-connect-sink.md) | [Cloud], [BYOC], [Self-hosted] | | ✅ |   |
| [Kafka table engine](./kafka-table-engine.md)           | [Cloud], [BYOC], [Self-hosted] | | ✅ | ✅ |

これらのオプションのより詳細な比較については、[オプションの選択](#choosing-an-option)を参照してください。

### ClickPipes for Kafka {#clickpipes-for-kafka}

[ClickPipes](../clickpipes/index.md) はマネージドのインテグレーションプラットフォームであり、多様なソースからのデータを数回クリックするだけで簡単に取り込むことができます。フルマネージドであり、本番ワークロード向けに設計されているため、ClickPipes はインフラストラクチャおよび運用コストを大幅に削減し、外部のデータストリーミングや ETL ツールを不要にします。

:::tip
ClickHouse Cloud ユーザーの場合、このオプションが推奨されます。ClickPipes は **フルマネージド** であり、クラウド環境で **最高のパフォーマンス** を発揮するように設計されています。
:::

#### 主な機能 {#clickpipes-for-kafka-main-features}

[//]: # "TODO It isn't optimal to link to a static alpha-release of the Terraform provider. Link to a Terraform guide once that's available."

* ClickHouse Cloud 向けに最適化されており、非常に高速なパフォーマンスを実現
* 高スループットワークロード向けの水平および垂直スケーラビリティ
* 設定可能なレプリカと自動リトライによる組み込みのフォールトトレランス
* ClickHouse Cloud UI、[Open API](/cloud/manage/api/api-overview)、または [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.3.3-alpha2/docs/resources/clickpipe) を介したデプロイおよび管理
* クラウドネイティブ認可 (IAM) とプライベート接続 (PrivateLink) をサポートするエンタープライズグレードのセキュリティ
* Confluent Cloud、Amazon MSK、Redpanda Cloud、Azure Event Hubs など、幅広い [データソース](/integrations/clickpipes/kafka/reference/) をサポート
* 一般的なシリアル化フォーマット (JSON、Avro、Protobuf［近日対応予定］) をサポート

#### はじめに {#clickpipes-for-kafka-getting-started}

ClickPipes for Kafka の利用を開始するには、[リファレンスドキュメント](/integrations/clickpipes/kafka/reference) を参照するか、ClickHouse Cloud UI の `Data Sources` タブに移動してください。

### Kafka Connect Sink {#kafka-connect-sink}

Kafka Connect はオープンソースのフレームワークであり、Kafka と他のデータシステム間でのシンプルなデータ統合のための集中型データハブとして機能します。[ClickHouse Kafka Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect) コネクタは、Apache Kafka およびその他の Kafka API 互換ブローカーからデータを読み取るための、スケーラブルで高度に設定可能なオプションを提供します。

:::tip
高い **設定自由度** を重視する場合、またはすでに Kafka Connect を利用している場合には、このオプションが推奨されます。
:::

#### 主な機能 {#kafka-connect-sink-main-features}

* exactly-once セマンティクスをサポートするように設定可能
* 一般的なシリアル化フォーマット (JSON、Avro、Protobuf) をサポート
* ClickHouse Cloud を対象に継続的にテストされています

#### はじめに {#kafka-connect-sink-getting-started}

ClickHouse Kafka Connect Sink の利用を開始するには、[リファレンスドキュメント](./kafka-clickhouse-connect-sink.md) を参照してください。

### Kafka table engine {#kafka-table-engine}

[Kafka table engine](./kafka-table-engine.md) は、Apache Kafka およびその他の Kafka API 互換ブローカーからデータを読み取ったり、書き込んだりするために使用できます。このオプションはオープンソース版 ClickHouse にバンドルされており、すべてのデプロイメントタイプで利用可能です。

:::tip
ClickHouse をセルフホストしており、**導入ハードルが低い** オプションを必要としている場合、または Kafka にデータを **書き込む** 必要がある場合には、このオプションが推奨されます。
:::

#### 主な機能 {#kafka-table-engine-main-features}

* データの[読み取り](./kafka-table-engine.md/#kafka-to-clickhouse)および[書き込み](./kafka-table-engine.md/#clickhouse-to-kafka)に使用可能
* オープンソース版 ClickHouse にバンドル済み
* 一般的なシリアル化フォーマット (JSON、Avro、Protobuf) をサポート

#### はじめに {#kafka-table-engine-getting-started}



Kafka テーブルエンジンの利用を開始するには、[リファレンスドキュメント](./kafka-table-engine.md) を参照してください。

### オプションの選択 {#choosing-an-option}

| 製品 | 長所 | 短所 |
|---------|-----------|------------|
| **ClickPipes for Kafka** | • 高スループットかつ低レイテンシーを実現するスケーラブルなアーキテクチャ<br/>• 組み込みのモニタリングとスキーマ管理<br/>• PrivateLink 経由のプライベートネットワーク接続<br/>• SSL/TLS 認証および IAM 認可をサポート<br/>• プログラムによる構成 (Terraform、API エンドポイント) をサポート | • Kafka へのデータプッシュは非対応<br/>• at-least-once セマンティクス |
| **Kafka Connect Sink** | • exactly-once セマンティクス<br/>• データ変換、バッチ処理、エラー処理をきめ細かく制御可能<br/>• プライベートネットワーク内にデプロイ可能<br/>• ClickPipes でまだサポートされていないデータベースから、Debezium 経由でリアルタイムレプリケーションが可能 | • Kafka へのデータプッシュは非対応<br/>• セットアップおよび運用保守が複雑<br/>• Kafka および Kafka Connect に関する専門知識が必要 |
| **Kafka table engine** | • [Kafka へのデータプッシュ](./kafka-table-engine.md/#clickhouse-to-kafka) に対応<br/>• セットアップが運用面でシンプル | • at-least-once セマンティクス<br/>• コンシューマーの水平方向スケーリングが制限される。ClickHouse サーバーとは独立してスケールできない<br/>• エラー処理やデバッグの選択肢が限られる<br/>• Kafka に関する専門知識が必要 |

### その他のオプション {#other-options}

* [**Confluent Cloud**](./confluent/index.md) - Confluent Platform では、[ClickHouse Connector Sink を Confluent Cloud 上でアップロードおよび実行](./confluent/custom-connector.md)したり、Apache Kafka を HTTP または HTTPS 経由で API と統合する [HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md) を利用したりできます。

* [**Vector**](./kafka-vector.md) - Vector はベンダーに依存しないデータパイプラインです。Kafka からの読み取りと ClickHouse へのイベント送信が可能で、堅牢な統合オプションとなります。

* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sink コネクタを使用すると、Kafka トピックから JDBC ドライバーを備えた任意のリレーショナルデータベースへデータをエクスポートできます。

* **カスタムコード** - Kafka および ClickHouse の [クライアントライブラリ](../../language-clients/index.md) を用いたカスタムコードは、イベントのカスタム処理が必要なケースに適している場合があります。

[BYOC]: /cloud/reference/byoc/overview
[Cloud]: /cloud/get-started
[Self-hosted]: ../../../intro.md
