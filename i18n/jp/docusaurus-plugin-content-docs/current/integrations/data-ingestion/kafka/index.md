---
'sidebar_label': 'KafkaとClickHouseの統合'
'sidebar_position': 1
'slug': '/integrations/kafka'
'description': 'ClickHouseとのKafkaの紹介'
'title': 'KafkaとClickHouseの統合'
'doc_type': 'guide'
---


# KafkaとClickHouseの統合

[Apache Kafka](https://kafka.apache.org/)は、高性能データパイプライン、ストリーミング分析、データ統合、ミッションクリティカルなアプリケーションのために、数千の企業によって使用されるオープンソースの分散イベントストリーミングプラットフォームです。ClickHouseは、Kafkaおよびその他のKafka API互換ブローカー（例：Redpanda、Amazon MSK）に**読み込み**および**書き込み**を行うための複数のオプションを提供しています。

## 利用可能なオプション {#available-options}

使用ケースに最適なオプションを選択するには、ClickHouseのデプロイメントタイプ、データフローの方向、および運用要件などの複数の要因を考慮する必要があります。

| オプション                                                  | デプロイメントタイプ | 完全管理               | KafkaからClickHouseへ | ClickHouseからKafkaへ |
|---------------------------------------------------------|----------------|:-------------------:|:-------------------:|:------------------:|
| [ClickPipes for Kafka](/integrations/clickpipes/kafka)                                | [Cloud], [BYOC] (近日登場!)   | ✅ | ✅ |   |
| [Kafka Connect Sink](./kafka-clickhouse-connect-sink.md) | [Cloud], [BYOC], [Self-hosted] | | ✅ |   |
| [Kafka table engine](./kafka-table-engine.md)           | [Cloud], [BYOC], [Self-hosted] | | ✅ | ✅ |

これらのオプションの詳細な比較については、[オプションの選択](#choosing-an-option)を参照してください。

### ClickPipes for Kafka {#clickpipes-for-kafka}

[ClickPipes](../clickpipes/index.md)は、多様なソースからデータを取り込むためのマネージドインテグレーションプラットフォームであり、数回ボタンをクリックするだけで実現できます。完全管理で生産ワークロード向けに特化されているため、ClickPipesはインフラストラクチャと運用コストを大幅に削減し、外部のデータストリーミングおよびETLツールの必要性を排除します。

:::tip
ClickHouse Cloudのユーザーには、これが推奨されるオプションです。ClickPipesは**完全管理**されており、クラウド環境で**最高のパフォーマンス**を提供するために設計されています。
:::

#### 主な機能 {#clickpipes-for-kafka-main-features}

[//]: # "TODO 静的なアルファリリースのTerraformプロバイダへのリンクは最適ではありません。利用可能になったらTerraformガイドにリンクしてください。"

* ClickHouse Cloud向けに最適化され、驚異的なパフォーマンスを実現
* 高スループットワークロードに対する水平および垂直スケーラビリティ
* 設定可能なレプリカと自動再試行による内蔵フォールトトレランス
* ClickHouse Cloud UI、[Open API](/cloud/manage/api/api-overview)、または[Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.3.3-alpha2/docs/resources/clickpipe)を使用したデプロイと管理
* クラウドネイティブな認証（IAM）およびプライベート接続（PrivateLink）をサポートするエンタープライズグレードのセキュリティ
* Confluent Cloud、Amazon MSK、Redpanda Cloud、Azure Event Hubsなど、幅広い[データソース](/integrations/clickpipes/kafka/reference/)をサポート
* 一般的なシリアル化形式（JSON、Avro、Protobufが近日登場！）をサポート

#### 始め方 {#clickpipes-for-kafka-getting-started}

Kafka用のClickPipesを使用するには、[リファレンスドキュメント](/integrations/clickpipes/kafka/reference)を参照するか、ClickHouse Cloud UIの`Data Sources`タブに移動してください。

### Kafka Connect Sink {#kafka-connect-sink}

Kafka Connectは、Kafkaと他のデータシステム間の簡単なデータ統合のための集中型データハブとして機能するオープンソースのフレームワークです。[ClickHouse Kafka Connect Sink](https://github.com/ClickHouse/clickhouse-kafka-connect)コネクタは、Apache Kafkaおよびその他のKafka API互換ブローカーからデータを読み込むためのスケーラブルで高度に設定可能なオプションを提供します。

:::tip
高い**設定可能性**を好む場合や、すでにKafka Connectユーザーである場合には、これが推奨されるオプションです。
:::

#### 主な機能 {#kafka-connect-sink-main-features}

* 一度だけのセマンティクスをサポートするように設定可能
* 一般的なシリアル化形式（JSON、Avro、Protobuf）をサポート
* ClickHouse Cloudに対して継続的にテスト済み

#### 始め方 {#kafka-connect-sink-getting-started}

ClickHouse Kafka Connect Sinkを使用するには、[リファレンスドキュメント](./kafka-clickhouse-connect-sink.md)を参照してください。

### Kafka table engine {#kafka-table-engine}

[Kafka table engine](./kafka-table-engine.md)を使用すると、Apache Kafkaおよびその他のKafka API互換ブローカーからデータを読み書きすることができます。このオプションはオープンソースのClickHouseにバンドルされており、すべてのデプロイメントタイプで利用可能です。

:::tip
ClickHouseをセルフホスティングしていて、**参入障壁が低い**オプションが必要な場合、またはKafkaに**データを書き込む**必要がある場合には、これが推奨されるオプションです。
:::

#### 主な機能 {#kafka-table-engine-main-features}

* [読み込み](./kafka-table-engine.md/#kafka-to-clickhouse)および[書き込み](./kafka-table-engine.md/#clickhouse-to-kafka)に使用可能
* オープンソースのClickHouseにバンドル
* 一般的なシリアル化形式（JSON、Avro、Protobuf）をサポート

#### 始め方 {#kafka-table-engine-getting-started}

Kafka table engineを使用するには、[リファレンスドキュメント](./kafka-table-engine.md)を参照してください。

### オプションの選択 {#choosing-an-option}

| 製品 | 強み | 弱み |
|---------|-----------|------------|
| **ClickPipes for Kafka** | • 高スループットと低レイテンシのためのスケーラブルアーキテクチャ<br/>• 内蔵のモニタリングとスキーマ管理<br/>• プライベートネットワーク接続（PrivateLink経由）<br/>• SSL/TLS認証とIAM認証をサポート<br/>• プログラムによる構成（Terraform、APIエンドポイント）をサポート | • Kafkaへのデータのプッシュをサポートしていません<br/>• 最低一回のセマンティクス |
| **Kafka Connect Sink** | • 一度だけのセマンティクス<br/>• データ変換、バッチ処理、エラーハンドリングに対する詳細な制御が可能<br/>• プライベートネットワークでのデプロイが可能<br/>• Debezium経由でClickPipesでまだサポートされていないデータベースからのリアルタイムレプリケーションが可能 | • Kafkaへのデータのプッシュをサポートしていません<br/>• 設定と保守が運用上複雑<br/>• KafkaとKafka Connectの専門知識が必要 |
| **Kafka table engine** | • [Kafkaへのデータのプッシュ](./kafka-table-engine.md/#clickhouse-to-kafka)をサポート<br/>• 設定が運用的に簡単 | • 最低一回のセマンティクス<br/>• 消費者に対する水平スケーリングが限定的。ClickHouseサーバーとは独立してスケーリングできません<br/>• エラーハンドリングとデバッグオプションが制限されている<br/>• Kafkaの専門知識が必要 |

### その他のオプション {#other-options}

* [**Confluent Cloud**](./confluent/index.md) - Confluent Platformは、ClickHouse Connector SinkをConfluent Cloudにアップロードして[実行するオプション](./confluent/custom-connector.md)や、Apache KafkaとAPIをHTTPまたはHTTPS経由で統合する[HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)を提供します。

* [**Vector**](./kafka-vector.md) - Vectorはベンダーに依存しないデータパイプラインです。Kafkaから読み取り、イベントをClickHouseに送信する能力を持ち、強力な統合オプションを表します。

* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sinkコネクタを使用すると、KafkaトピックからJDBCドライバを持つ任意のリレーショナルデータベースにデータをエクスポートできます。

* **カスタムコード** - KafkaとClickHouseの[クライアントライブラリ](../../language-clients/index.md)を使用したカスタムコードは、イベントのカスタム処理が必要な場合に適切かもしれません。

[BYOC]: /cloud/reference/byoc
[Cloud]: /cloud/get-started
[Self-hosted]: ../../../intro.md
