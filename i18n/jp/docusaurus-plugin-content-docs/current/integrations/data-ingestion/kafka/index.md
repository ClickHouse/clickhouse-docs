---
'sidebar_label': 'Integrating Kafka with ClickHouse'
'sidebar_position': 1
'slug': '/integrations/kafka'
'description': 'Introduction to Kafka with ClickHouse'
'title': 'Integrating Kafka with ClickHouse'
---




# KafkaとClickHouseの統合

[Apache Kafka](https://kafka.apache.org/)は、高性能なデータパイプライン、ストリーミング解析、データ統合、ミッションクリティカルなアプリケーションのために、何千もの企業によって使用されているオープンソースの分散イベントストリーミングプラットフォームです。KafkaとClickHouseを使用する多くのケースでは、ユーザーはKafkaベースのデータをClickHouseに挿入したいと考えるでしょう。以下では、両方のユースケースに対するいくつかのオプションを概説し、それぞれのアプローチの利点と欠点を特定します。

## オプションの選択 {#choosing-an-option}

KafkaとClickHouseを統合する際には、使用される高レベルのアプローチについて早い段階でのアーキテクチャーの決定が必要です。以下に、最も一般的な戦略を概説します。

### ClickPipes for Kafka (ClickHouse Cloud) {#clickpipes-for-kafka-clickhouse-cloud}
* [**ClickPipes**](../clickpipes/kafka.md)は、ClickHouse Cloudにデータを取り込む最も簡単で直感的な方法を提供します。現在、Apache Kafka、Confluent Cloud、Amazon MSKをサポートしており、今後さらに多くのデータソースが追加される予定です。

### サードパーティのクラウドベースのKafka接続 {#3rd-party-cloud-based-kafka-connectivity}
* [**Confluent Cloud**](./confluent/index.md) - Confluentプラットフォームは、ClickHouse Connector Sinkを[Confluent Cloudにアップロードして実行する](./confluent/custom-connector.md)オプションや、Apache KafkaをHTTPまたはHTTPSを介してAPIと統合する[HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)を提供しています。

* [**Amazon MSK**](./msk/index.md) - Apache KafkaクラスタからClickHouseなどの外部システムにデータを転送するためのAmazon MSK Connectフレームワークをサポートしています。Amazon MSKにClickHouse Kafka Connectをインストールできます。

* [**Redpanda Cloud**](https://cloud.redpanda.com/) - RedpandaはKafka API互換のストリーミングデータプラットフォームで、ClickHouseの上流データソースとして使用できます。ホスティングされたクラウドプラットフォームであるRedpanda Cloudは、Kafkaプロトコルを介してClickHouseと統合されており、ストリーミング解析ワークロードのためのリアルタイムデータ取り込みを可能にします。

### セルフマネージドKafka接続 {#self-managed-kafka-connectivity}
* [**Kafka Connect**](./kafka-clickhouse-connect-sink.md) - Kafka Connectは、Apache Kafkaの無料のオープンソースコンポーネントで、Kafkaと他のデータシステム間のシンプルなデータ統合のための集中型データハブとして機能します。コネクタは、Kafkaから他のシステムへのデータストリーミングをスケーラブルかつ信頼性高く行う簡単な手段を提供します。ソースコネクタは他のシステムからKafkaトピックにデータを挿入し、シンクコネクタはKafkaトピックからClickHouseなどの他のデータストアにデータを配信します。
* [**Vector**](./kafka-vector.md) - Vectorはベンダーに依存しないデータパイプラインです。Kafkaから読み取る能力があり、ClickHouseにイベントを送信することで、堅牢な統合オプションを提供します。
* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sinkコネクタを使用すると、Kafkaトピックから任意のリレーショナルデータベースにデータをエクスポートできます。
* **カスタムコード** - KafkaとClickHouseのそれぞれのクライアントライブラリを使用したカスタムコードは、イベントのカスタム処理が必要な場合に適切です。これはこのドキュメントの範囲を超えます。
* [**Kafkaテーブルエンジン**](./kafka-table-engine.md)は、ネイティブのClickHouse統合を提供します（ClickHouse Cloudでは利用できません）。このテーブルエンジンは、ソースシステムからデータを**プル**します。これにはClickHouseがKafkaへの直接アクセスを持っている必要があります。
* [**命名コレクションを持つKafkaテーブルエンジン**](./kafka-table-engine-named-collections.md) - 命名コレクションを使用すると、KafkaとのネイティブなClickHouse統合が提供されます。このアプローチにより、複数のKafkaクラスターへの安全な接続を可能にし、構成管理を集中化し、スケーラビリティとセキュリティを向上させます。

### アプローチの選択 {#choosing-an-approach}
いくつかの決定ポイントに絞られます：

* **接続性** - Kafkaテーブルエンジンは、ClickHouseが宛先である場合、Kafkaからデータをプルできる必要があります。これには双方向の接続が必要です。ネットワークの分離がある場合、たとえばClickHouseがクラウドにあり、Kafkaがセルフマネージドである場合、コンプライアンスやセキュリティの理由からこれを削除することに抵抗を感じるかもしれません。（このアプローチは現在ClickHouse Cloudではサポートされていません。）Kafkaテーブルエンジンは、ClickHouse内のリソースを利用し、消費者のためにスレッドを利用します。このリソースプレッシャーをClickHouseにかけることは、リソース制約のために難しい場合があり、あなたのアーキテクトが関心の分離を好むかもしれません。この場合、Kafkaデータをプルする責任を持つプロセスをClickHouseとは独立してスケールさせることができる、異なるハードウェアにデプロイ可能なKafka Connectのようなツールが好ましいかもしれません。

* **クラウドでのホスティング** - クラウドベンダーは、プラットフォーム上で利用可能なKafkaコンポーネントに制限を設ける場合があります。各クラウドベンダーに推奨されるオプションを探求するためのガイドに従ってください。

* **外部エンリッチメント** - メッセージはClickHouseに挿入される前に操作できますが、ユーザーは複雑なエンリッチメントをClickHouseの外部に移動したいと考えるかもしれません。

* **データフローの方向** - Vectorは、KafkaからClickHouseへのデータの転送のみをサポートしています。

## 前提条件 {#assumptions}

上記のリンクされたユーザーガイドは、以下の前提に基づいています。

* あなたは、プロデューサー、コンシューマー、トピックなどのKafkaの基本を知っています。
* これらの例のためにトピックが用意されていることを前提としています。すべてのデータがJSON形式でKafkaに保存されていると仮定していますが、Avroを使用する場合でも原則は同じです。
* 私たちは、Kafkaデータを公開し消費するために、優れた[kcat](https://github.com/edenhill/kcat)（以前のkafkacat）を例として利用します。
* サンプルデータをロードするためのいくつかのPythonスクリプトを参照していますが、例をあなたのデータセットに合わせて適応させてください。
* あなたは、ClickHouseのマテリアライズドビューに広く精通しています。
