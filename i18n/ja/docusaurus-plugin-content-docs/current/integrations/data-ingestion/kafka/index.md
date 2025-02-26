---
sidebar_label: KafkaとClickHouseの統合
sidebar_position: 1
slug: /integrations/kafka
description: ClickHouseでのKafkaの紹介
---

# KafkaとClickHouseの統合

[Apache Kafka](https://kafka.apache.org/)は、高パフォーマンスなデータパイプライン、ストリーミング分析、データ統合、重要業務アプリケーションのために多くの企業で使用されるオープンソースの分散イベントストリーミングプラットフォームです。KafkaとClickHouseに関するほとんどのケースでは、ユーザーはKafkaに基づくデータをClickHouseに挿入したいと考えます。以下では、いくつかの選択肢を概説し、それぞれのアプローチの長所と短所を特定します。

## オプションの選択 {#choosing-an-option}

KafkaとClickHouseを統合する際、使用する高レベルなアプローチについて初期のアーキテクチャ的決定を下す必要があります。以下に最も一般的な戦略を示します。

### Kafka用のClickPipes (ClickHouse Cloud) {#clickpipes-for-kafka-clickhouse-cloud}
* [**ClickPipes**](../clickpipes/kafka.md)は、ClickHouse Cloudにデータを取り込む最も簡単で直感的な方法を提供します。現在、Apache Kafka、Confluent Cloud、Amazon MSKをサポートしており、今後も多くのデータソースが追加される予定です。

### 第三者のクラウドベースのKafka接続 {#3rd-party-cloud-based-kafka-connectivity}
* [**Confluent Cloud**](./confluent/index.md) - Confluentプラットフォームは、[Confluent CloudでClickHouse Connector Sinkをアップロードして実行するオプション](./confluent/custom-connector.md)や、Apache KafkaとHTTPまたはHTTPS経由でAPIを統合するための[HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)を提供します。

* [**Amazon MSK**](./msk/index.md) - Apache KafkaクラスターからClickHouseなどの外部システムにデータを転送するために、Amazon MSK Connectフレームワークをサポートしています。Amazon MSKにClickHouse Kafka Connectをインストールできます。

* [**Redpanda Cloud**](https://cloud.redpanda.com/) - RedpandaはKafka API互換のストリーミングデータプラットフォームで、ClickHouseのアップストリームデータソースとして使用できます。ホスティングされたクラウドプラットフォームであるRedpanda Cloudは、Kafkaプロトコルを介してClickHouseと統合し、ストリーミング分析ワークロードのためのリアルタイムデータ取り込みを可能にしています。

### セルフマネージドKafka接続 {#self-managed-kafka-connectivity}
* [**Kafka Connect**](./kafka-clickhouse-connect-sink.md) - Kafka Connectは、Apache Kafkaの無料でオープンソースのコンポーネントで、Kafkaと他のデータシステム間のシンプルなデータ統合のための中央集権的データハブとして機能します。コネクタは、Kafkaへのデータのストリーミングをスケーラブルかつ信頼性の高い方法で実現します。ソースコネクタは、他のシステムからKafkaトピックにデータを挿入し、シンクコネクタは、KafkaトピックからClickHouseなどの他のデータストアにデータを供給します。
* [**Vector**](./kafka-vector.md) - Vectorは、ベンダーに依存しないデータパイプラインです。Kafkaから読み取り、イベントをClickHouseに送信する能力を持つため、堅牢な統合オプションを表します。
* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sinkコネクタを使用すると、KafkaトピックからJDBCドライバを持つ任意のリレーショナルデータベースにデータをエクスポートできます。
* **カスタムコード** - KafkaおよびClickHouseのそれぞれのクライアントライブラリを使用するカスタムコードは、イベントのカスタム処理が必要な場合に適切なケースがあります。これはこのドキュメントの範囲を超えています。
* [**Kafkaテーブルエンジン**](./kafka-table-engine.md)は、ネイティブのClickHouse統合を提供します（ClickHouse Cloudでは利用できません）。このテーブルエンジンは、データをソースシステムから**プル**します。これには、ClickHouseがKafkaに直接アクセスできる必要があります。
* [**名前付きコレクションを持つKafkaテーブルエンジン**](./kafka-table-engine-named-collections.md) - 名前付きコレクションを使用することで、KafkaとのネイティブなClickHouse統合を提供します。このアプローチは、複数のKafkaクラスターに対する安全な接続を可能にし、構成管理を中央集権化し、スケーラビリティとセキュリティを向上させます。

### アプローチの選択 {#choosing-an-approach}
いくつかの決定ポイントに絞られます：

* **接続性** - Kafkaテーブルエンジンは、ClickHouseが宛先である場合、Kafkaからプルできる必要があります。これには双方向の接続が必要です。ネットワークの分離がある場合、例えばClickHouseがクラウドにあり、Kafkaがセルフマネージドである場合、コンプライアンスやセキュリティ上の理由からこれを削除することをためらうかもしれません（このアプローチは現在ClickHouse Cloudではサポートされていません）。Kafkaテーブルエンジンは、ClickHouse自体内のリソースを利用し、消費者のためのスレッドを活用します。このリソースのプレッシャーをClickHouseにかけることは、リソースの制約のために可能ではないかもしれませんし、アーキテクトが関心の分離を好むかもしれません。この場合、別のプロセスとして運用し、異なるハードウェアにデプロイできるKafka Connectなどのツールが好まれるかもしれません。これにより、Kafkaデータをプルする責任を持つプロセスをClickHouseとは独立してスケールさせることができます。

* **クラウドでのホスティング** - クラウドベンダーは、そのプラットフォームで利用可能なKafkaコンポーネントに制限を設定する場合があります。各クラウドベンダーの推奨オプションを探るためのガイドに従ってください。

* **外部の強化** - メッセージは、マテリアライズドビューのSELECT文内の関数を使用してClickHouseに挿入する前に操作できますが、ユーザーは複雑な強化をClickHouseの外部で行いたいと考えるかもしれません。

* **データフローの方向** - Vectorは、KafkaからClickHouseへのデータ転送のみをサポートしています。

## 前提条件 {#assumptions}

上記のユーザーガイドは以下を前提としています：

* あなたは、生産者、消費者、トピックなどのKafkaの基本を理解しています。
* これらの例用にトピックが準備されています。私たちはすべてのデータがKafkaにJSON形式で保存されていると仮定していますが、Avroを使用しても原則は同じです。
* 私たちは、Kafkaデータを公開・消費するために優れた[kcat](https://github.com/edenhill/kcat)（以前はkafkacat）を例として利用しています。
* サンプルデータをロードするためのいくつかのPythonスクリプトを参照していますが、例を自分のデータセットに合わせて適応させて構いません。
* あなたは、ClickHouseのマテリアライズドビューに関して広く理解している状態です。
