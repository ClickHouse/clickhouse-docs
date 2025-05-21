---
sidebar_label: 'KafkaとClickHouseの統合'
sidebar_position: 1
slug: /integrations/kafka
description: 'KafkaとClickHouseの概要'
title: 'KafkaとClickHouseの統合'
---
```


# KafkaとClickHouseの統合

[Apache Kafka](https://kafka.apache.org/) は、高性能データパイプライン、ストリーミング分析、データ統合、ミッションクリティカルなアプリケーションのために数千の企業に利用されているオープンソースの分散イベントストリーミングプラットフォームです。KafkaとClickHouseに関わるほとんどのケースでは、ユーザーはKafkaに基づいたデータをClickHouseに挿入したいと考えます。以下に、両方のユースケースに対するいくつかのオプションを示し、それぞれのアプローチの利点と欠点を特定します。

## オプションの選択 {#choosing-an-option}

KafkaとClickHouseを統合する際には、使用する高レベルのアプローチについて早い段階でアーキテクチャの決定を下す必要があります。以下に最も一般的な戦略を示します。

### Kafka用のClickPipes (ClickHouse Cloud) {#clickpipes-for-kafka-clickhouse-cloud}
* [**ClickPipes**](../clickpipes/kafka.md) は、ClickHouse Cloudにデータを取り込む最も簡単で直感的な方法を提供します。現在、Apache Kafka、Confluent Cloud、Amazon MSKをサポートしており、さらに多くのデータソースが近日中に追加される予定です。

### サードパーティのクラウドベースのKafka接続 {#3rd-party-cloud-based-kafka-connectivity}
* [**Confluent Cloud**](./confluent/index.md) - Confluentプラットフォームは、ClickHouse Connector Sinkを[Confluent Cloudにアップロードして実行するオプション](./confluent/custom-connector.md)を提供するか、Apache KafkaをAPI経由でHTTPまたはHTTPSで統合するための[HTTP Sink Connector for Confluent Platform](./confluent/kafka-connect-http.md)を使用します。

* [**Amazon MSK**](./msk/index.md) - Apache KafkaクラスターからClickHouseのような外部システムにデータを転送するために、Amazon MSK Connectフレームワークをサポートします。Amazon MSK上にClickHouse Kafka Connectをインストールできます。

* [**Redpanda Cloud**](https://cloud.redpanda.com/) - Redpandaは、ClickHouseのための上流データソースとして使用できるKafka API互換のストリーミングデータプラットフォームです。ホスティングされたクラウドプラットフォームであるRedpanda Cloudは、Kafkaプロトコルを介してClickHouseと統合され、ストリーミング分析ワークロードのためのリアルタイムデータ取り込みを可能にします。

### セルフマネージドのKafka接続 {#self-managed-kafka-connectivity}
* [**Kafka Connect**](./kafka-clickhouse-connect-sink.md) - Kafka Connectは、Kafkaと他のデータシステム間のシンプルなデータ統合のための中央集権的なデータハブとして機能する、Apache Kafkaの無料のオープンソースコンポーネントです。コネクタは、Kafkaにデータをスケーラブルかつ信頼性高く送受信するためのシンプルな手段を提供します。ソースコネクタは他のシステムからKafkaトピックにデータを挿入し、シンクコネクタはKafkaトピックからClickHouseのような他のデータストアにデータを届けます。
* [**Vector**](./kafka-vector.md) - Vectorは、ベンダーに依存しないデータパイプラインです。Kafkaから読み込み、ClickHouseにイベントを送信する機能を持ち、これは強力な統合オプションを表しています。
* [**JDBC Connect Sink**](./kafka-connect-jdbc.md) - Kafka Connect JDBC Sinkコネクタを使用すると、KafkaトピックからJDBCドライバを持つ任意のリレーショナルデータベースにデータをエクスポートできます。
* **カスタムコード** - KafkaおよびClickHouseのそれぞれのクライアントライブラリを使用したカスタムコードは、イベントのカスタム処理が必要な場合に適切です。これは、このドキュメントの範囲を超えています。
* [**Kafkaテーブルエンジン**](./kafka-table-engine.md) は、ネイティブのClickHouse統合を提供します（ClickHouse Cloudでは使用できません）。このテーブルエンジンは**ソースシステム**からデータを取得します。これには、ClickHouseがKafkaに直接アクセスできる必要があります。
* [**名前付きコレクションを持つKafkaテーブルエンジン**](./kafka-table-engine-named-collections.md) - 名前付きコレクションを使用することで、KafkaとのネイティブのClickHouse統合が提供されます。このアプローチにより、複数のKafkaクラスターへの安全な接続が可能になり、構成管理が中央集権化され、スケーラビリティとセキュリティが向上します。

### アプローチの選択 {#choosing-an-approach}
いくつかの決定ポイントに集約されます：

* **接続性** - ClickHouseが宛先である場合、KafkaテーブルエンジンはKafkaからデータを取得できる必要があります。これには双方向の接続が必要です。ネットワーク分離がある場合、例えばClickHouseがクラウドにありKafkaがセルフマネージドであれば、コンプライアンスやセキュリティ上の理由からこれを除外することに躊躇するかもしれません。（このアプローチは現在ClickHouse Cloudではサポートされていません。）Kafkaテーブルエンジンは、ClickHouse内のリソースを使用し、消費者用のスレッドを利用します。このリソースの圧力をClickHouseにかけることは、リソース制約のために不可能であるかもしれませんし、アーキテクトが関心の分離を好むかもしれません。この場合、Kafkaデータを引き出す責任を持つプロセスがClickHouseとは独立してスケールできるように、別のプロセスとして実行され、異なるハードウェアに展開できるKafka Connectなどのツールが好ましいかもしれません。

* **クラウドでのホスティング** - クラウドベンダーは、そのプラットフォームで使用可能なKafkaコンポーネントに制限を設ける可能性があります。各クラウドベンダーで推奨されるオプションを探るためのガイドに従ってください。

* **外部強化** - メッセージは、マテリアライズドビューのSELECT文の関数を使用してClickHouseに挿入する前に操作することができますが、ユーザーは複雑な強化をClickHouseの外部で行うことを好むかもしれません。

* **データフローの方向** - Vectorは、KafkaからClickHouseへのデータの転送のみをサポートしています。

## 仮定 {#assumptions}

上記のリンクされたユーザーガイドは、以下を仮定しています：

* あなたは、プロデューサー、消費者、およびトピックのようなKafkaの基本を理解しています。
* これらの例のために準備されたトピックがあります。すべてのデータがKafkaにJSON形式で保存されていると仮定していますが、Avroを使用する場合でも原則は同じです。
* 私たちは、Kafkaデータを公開および消費するために、優れた[kcat](https://github.com/edenhill/kcat) (以前のkafkacat)を例で利用しています。
* サンプルデータを読み込むためのいくつかのPythonスクリプトを参照していますが、気軽に例をあなたのデータセットに適応させてください。
* あなたは、ClickHouseのマテリアライズドビューに広く精通しています。
