---
sidebar_label: KafkaとClickHouseの統合
sidebar_position: 1
slug: /integrations/kafka
description: ClickHouseとのKafkaの紹介
---


# KafkaとClickHouseの統合

[Apache Kafka](https://kafka.apache.org/)は、高性能なデータパイプライン、ストリーミング分析、データ統合、ミッションクリティカルなアプリケーションのために数千社によって使用されているオープンソースの分散イベントストリーミングプラットフォームです。KafkaとClickHouseに関わるほとんどのケースでは、ユーザーはKafkaベースのデータをClickHouseに挿入したいと考えています。以下に、両方のユースケースに対するいくつかのオプションを概説し、それぞれのアプローチの長所と短所を特定します。

## オプションの選択 {#choosing-an-option}

KafkaをClickHouseに統合する際には、使用する高レベルなアプローチに関する初期のアーキテクチャ決定を行う必要があります。最も一般的な戦略を以下に示します。

### Kafka用のClickPipes (ClickHouse Cloud) {#clickpipes-for-kafka-clickhouse-cloud}
* [**ClickPipes**](../clickpipes/kafka.md)は、ClickHouse Cloudにデータを取り込む最も簡単で直感的な方法を提供します。現在、Apache Kafka、Confluent Cloud、およびAmazon MSKをサポートしており、他のデータソースも近日中に追加される予定です。

### サードパーティのクラウドベースのKafka接続 {#3rd-party-cloud-based-kafka-connectivity}
* [**Confluent Cloud**](./confluent/index.md) - Confluentプラットフォームは、ClickHouse Connector SinkをConfluent Cloudにアップロードして[実行するオプション](./confluent/custom-connector.md)や、Apache KafkaをHTTPまたはHTTPS経由でAPIと統合する[HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)を使用するオプションを提供します。

* [**Amazon MSK**](./msk/index.md) - Amazon MSK Connectフレームワークをサポートし、Apache KafkaクラスターからClickHouseなどの外部システムへのデータ転送を実現します。ClickHouse Kafka ConnectをAmazon MSKにインストールできます。

* [**Redpanda Cloud**](https://cloud.redpanda.com/) - RedpandaはKafka API互換のストリーミングデータプラットフォームで、ClickHouseの上流データソースとして使用できます。ホスティングされたクラウドプラットフォームであるRedpanda Cloudは、Kafkaプロトコルを介してClickHouseと統合し、ストリーミング分析ワークロードのためのリアルタイムデータ取り込みを可能にします。

### セルフマネージドKafka接続 {#self-managed-kafka-connectivity}
* [**Kafka Connect**](./kafka-clickhouse-connect-sink.md) - Kafka ConnectはApache Kafkaの無料のオープンソースコンポーネントで、Kafkaと他のデータシステム間の簡単なデータ統合のための中央集権的なデータハブとして機能します。コネクタは、Kafkaにデータをスケーラブルかつ信頼性高くストリーミングする簡単な手段を提供します。ソースコネクタは他のシステムからKafkaトピックにデータを挿入し、シンクコネクタはKafkaトピックからClickHouseなどの他のデータストアにデータを届けます。

* [**Vector**](./kafka-vector.md) - Vectorはベンダーに依存しないデータパイプラインです。Kafkaから読み取り、ClickHouseにイベントを送信する能力を持ち、堅牢な統合オプションを提供します。

* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sinkコネクタを使用すると、Kafkaトピックから任意のリレーショナルデータベースにデータをエクスポートできます。

* **カスタムコード** - KafkaとClickHouseの各クライアントライブラリを使用してカスタム処理が必要な場合には、カスタムコードが適切なケースかもしれません。これはこのドキュメントの範囲を超えます。

* [**Kafkaテーブルエンジン**](./kafka-table-engine.md)は、ネイティブなClickHouseの統合を提供します（ClickHouse Cloudでは利用できません）。このテーブルエンジンは、ソースシステムからデータを**プル**します。これにはClickHouseがKafkaに直接アクセスする必要があります。

* [**名前付きコレクションを使用したKafkaテーブルエンジン**](./kafka-table-engine-named-collections.md) - 名前付きコレクションを使用することで、KafkaとのネイティブなClickHouse統合が提供されます。このアプローチは、複数のKafkaクラスターへの安全な接続を可能にし、構成管理を中央集約化し、スケーラビリティとセキュリティを向上させます。

### アプローチの選択 {#choosing-an-approach}
いくつかの決定ポイントになります：

* **接続性** - ClickHouseが宛先の場合、KafkaテーブルエンジンはKafkaからプルできる必要があります。これには双方向の接続が必要です。ネットワークの分離がある場合、例えばClickHouseがクラウド上にありKafkaがセルフマネージドである場合、コンプライアンスやセキュリティの理由からこれを除去することにためらいが生じるかもしれません。（このアプローチは現在ClickHouse Cloudではサポートされていません。）Kafkaテーブルエンジンは、ClickHouse自体内のリソースを利用し、コンシューマー用のスレッドを使用します。このリソースプレッシャーをClickHouseにかけることは、リソース制約から不可能な場合があるか、またはアーキテクトが関心の分離を好むかもしれません。この場合、Kafka Connectのように別プロセスとして実行され、異なるハードウェアに展開できるツールが好ましいかもしれません。これにより、KafkaデータをプルするプロセスをClickHouseから独立してスケールさせることが可能になります。

* **クラウドでのホスティング** - クラウドベンダーは、プラットフォーム上で利用可能なKafkaコンポーネントに制限を設ける場合があります。各クラウドベンダーの推奨オプションを探るためのガイドに従ってください。

* **外部エンリッチメント** - メッセージは、マテリアライズドビューのselect文の関数を使用してClickHouseに挿入する前に操作できますが、ユーザーは複雑なエンリッチメントをClickHouseの外部に移動することを好むかもしれません。

* **データフローの方向** - Vectorは、KafkaからClickHouseへのデータ転送のみをサポートしています。

## 前提条件 {#assumptions}

上記のリンクされたユーザーガイドは以下のことを前提としています：

* あなたはプロデューサー、コンシューマー、トピックなど、Kafkaの基本を理解している。
* これらの例のためにトピックが準備されていること。すべてのデータがKafkaにJSON形式で保存されると仮定しますが、Avroを使用する場合も原則は同じです。
* 私たちは、Kafkaデータを公開および消費するために、優れた[kcat](https://github.com/edenhill/kcat)（旧kafkacat）を例として利用します。
* サンプルデータを読み込むためのいくつかのPythonスクリプトに言及しますが、データセットに合わせて例を適応することができます。
* あなたは広範囲にClickHouseのマテリアライズドビューに精通している。
