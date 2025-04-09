---
sidebar_label: ClickHouse Kafka Connect Sink
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: ClickHouseのオフィシャルKafkaコネクタ。
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
お手伝いが必要な場合は、[リポジトリに問題を報告](https://github.com/ClickHouse/clickhouse-kafka-connect/issues)するか、[ClickHouseの公共Slack](https://clickhouse.com/slack)で質問をしてください。
:::
**ClickHouse Kafka Connect Sink**は、KafkaトピックからClickHouseテーブルにデータを提供するKafkaコネクタです。

### License {#license}

Kafka Connector Sinkは、[Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)の下で配布されています。

### Requirements for the environment {#requirements-for-the-environment}

[Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html)フレームワークv2.7以降が環境にインストールされている必要があります。

### Version compatibility matrix {#version-compatibility-matrix}

| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
|----------------------------------|--------------------|---------------|--------------------|
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1              |

### Main Features {#main-features}

- 高度な一貫性を実現する機能が組み込まれています。これは、コネクタによって状態ストアとして使用される新しいClickHouseコア機能[KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976)によって提供され、ミニマリストアーキテクチャを実現します。
- 3rd-party状態ストアへのサポート: 現在はIn-memoryがデフォルトですが、KeeperMapを使用できます（Redisを近日中に追加予定）。
- コア統合: ClickHouseによって構築、維持、サポートされています。
- [ClickHouse Cloud](https://clickhouse.com/cloud)に対して継続的にテストされています。
- 宣言されたスキーマとスキーマレスのデータ挿入。
- ClickHouseのすべてのデータ型をサポート。

### Installation instructions {#installation-instructions}

#### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />

#### General Installation Instructions {#general-installation-instructions}

コネクタは、プラグインを実行するために必要なすべてのクラスファイルを含む単一のJARファイルとして配布されます。

プラグインをインストールするには、次の手順に従ってください。

- [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)ページからコネクタJARファイルを含むzipアーカイブをダウンロードします。
- ZIPファイルの内容を抽出し、希望の場所にコピーします。
- Confluent Platformがプラグインを見つけられるように、Connectプロパティファイルの[plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path)構成にプラグインディレクトリのパスを追加します。
- configにトピック名、ClickHouseインスタンスのホスト名、およびパスワードを提供します。

```yml
connector.class=com.clickhouse.kafka.connect.ClickHouseSinkConnector
tasks.max=1
topics=<topic_name>
ssl=true
jdbcConnectionProperties=?sslmode=STRICT
security.protocol=SSL
hostname=<hostname>
database=<database_name>
password=<password>
ssl.truststore.location=/tmp/kafka.client.truststore.jks
port=8443
value.converter.schemas.enable=false
value.converter=org.apache.kafka.connect.json.JsonConverter
exactlyOnce=true
username=default
schemas.enable=false
```

- Confluent Platformを再起動します。
- Confluent Platformを使用している場合、Confluent Control Center UIにログインし、ClickHouse Sinkが利用可能なコネクタのリストに表示されることを確認します。

### Configuration options {#configuration-options}

ClickHouse SinkをClickHouseサーバーに接続するには、次の情報を提供する必要があります。

- 接続の詳細：ホスト名（**必須**）およびポート（オプション）
- ユーザー認証情報：パスワード（**必須**）およびユーザー名（オプション）
- コネクタクラス：`com.clickhouse.kafka.connect.ClickHouseSinkConnector`（**必須**）
- topicsまたはtopics.regex：ポーリングするKafkaトピック - トピック名はテーブル名と一致する必要があります（**必須**）
- キーおよび値のコンバータ：トピックのデータタイプに基づいて設定します。ワーカ構成で未定義の場合は必須です。

設定オプションの完全な表：

| Property Name                                   | Description                                                                                                                                                                                                                                                      | Default Value                                            |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `hostname` (Required)                           | サーバーのホスト名またはIPアドレス                                                                                                                                                                                                                               | N/A                                                      |
| `port`                                          | ClickHouseポート - デフォルトは8443（クラウドでのHTTPS用）ですが、HTTP（セルフホスティングのデフォルト）の場合は8123を指定する必要があります。                                                                                                                                 | `8443`                                                   |
| `ssl`                                           | ClickHouseへのssl接続を有効にします                                                                                                                                                                                                                             | `true`                                                   |
| `jdbcConnectionProperties`                      | ClickHouseに接続する際の接続プロパティ。`?`で始まり、`param=value`の間は`&`で結合する必要があります。                                                                                                                                                   | `""`                                                     |
| `username`                                      | ClickHouseデータベースのユーザー名                                                                                                                                                                                                                               | `default`                                                |
| `password` (Required)                           | ClickHouseデータベースのパスワード                                                                                                                                                                                                                               | N/A                                                      |
| `database`                                      | ClickHouseデータベース名                                                                                                                                                                                                                                        | `default`                                                |
| `connector.class` (Required)                    | コネクタクラス（明示的に設定し、デフォルト値を保持）                                                                                                                                                                                                              | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                     | コネクタタスクの最大数                                                                                                                                                                                                                                           | `"1"`                                                    |
| `errors.retry.timeout`                          | ClickHouse JDBCリトライタイムアウト                                                                                                                                                                                                                              | `"60"`                                                   |
| `exactlyOnce`                                   | 一貫性のある接続を有効にします                                                                                                                                                                                                                                     | `"false"`                                                |
| `topics` (Required)                             | ポーリングするKafkaトピック - トピック名はテーブル名と一致する必要があります。                                                                                                                                                                                  | `""`                                                     |
| `key.converter` (Required* - See Description)   | キーのタイプに基づいて設定します。キーを送信する場合（ワーカ構成で未定義の場合）はここで必須です。                                                                                                                                                                | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Required* - See Description) | トピックのデータタイプに基づいて設定します。サポートされているフォーマット：- JSON、String、Avro、Protobuf。この設定は、ワーカ構成で定義されていない場合にここで必要です。                                                                                                                              | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                | コネクタ値コンバータスキーマサポート                                                                                                                                                                                                                             | `"false"`                                                |
| `errors.tolerance`                              | コネクタエラーの耐久性。サポートされている値：none、all                                                                                                                                                                                                        | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`             | 設定されている場合（errors.tolerance=all）、失敗したバッチのためにDLQが使用されます（[トラブルシューティング](#troubleshooting)を参照）。                                                                                                                          | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable` | DLQの追加ヘッダーを追加します。                                                                                                                                                                                                                                  | `""`                                                     |
| `clickhouseSettings`                            | ClickHouseの設定のカンマ区切りリスト（例： "insert_quorum=2, etc..."）                                                                                                                                                                                      | `""`                                                     |
| `topic2TableMap`                                | トピック名とテーブル名をマッピングするカンマ区切りリスト（例： "topic1=table1, topic2=table2, etc..."）                                                                                                                                                        | `""`                                                     |
| `tableRefreshInterval`                          | テーブル定義キャッシュをリフレッシュする時間（秒単位）                                                                                                                                                                                                          | `0`                                                      |
| `keeperOnCluster`                               | セルフホストインスタンス用のON CLUSTERパラメータの構成を許可します（例：`ON CLUSTER clusterNameInConfigFileDefinition`）一貫性のあるconnect_stateテーブルのため（[分散DDLクエリ](/sql-reference/distributed-ddl)を参照）                                               | `""`                                                     |
| `bypassRowBinary`                               | スキーマに基づくデータ（Avro、Protobufなど）でRowBinaryおよびRowBinaryWithDefaultsの使用を無効にします。データにコラムが欠けている場合にのみ使用すべきであり、Nullable/Defaultが受け入れられないときに使用します。                                                    | `"false"`                                                |
| `dateTimeFormats`                               | DateTime64スキーマフィールドを解析するための日付時刻フォーマット、`;`で区切っています（例：`someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                                                                                              | `""`                                                     |
| `tolerateStateMismatch`                         | コネクタが"現在の"オフセットが格納される前に、"より早い"レコードを削除できるようにします（例：オフセット5が送信され、オフセット250が最後に記録されたオフセットである場合）。                                                                                                                  | `"false"`                                                |

### Target Tables {#target-tables}

ClickHouse Connect Sinkは、Kafkaトピックからメッセージを読み込み、適切なテーブルに書き込みます。ClickHouse Connect Sinkは、既存のテーブルにデータを書き込みます。データを挿入する前に、ClickHouseに適切なスキーマのターゲットテーブルが作成されていることを確認してください。

各トピックには、ClickHouseに専用のターゲットテーブルが必要です。ターゲットテーブル名は、ソーストピック名と一致する必要があります。

### Pre-processing {#pre-processing}

ClickHouse Kafka Connect Sinkに送信される前に、送信メッセージを変換する必要がある場合は、[Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html)を使用してください。

### Supported Data types {#supported-data-types}

**スキーマが宣言された場合:**

| Kafka Connect Type                      | ClickHouse Type       | Supported | Primitive |
| --------------------------------------- |-----------------------| --------- | --------- |
| STRING                                  | String                | ✅        | Yes       |
| INT8                                    | Int8                  | ✅        | Yes       |
| INT16                                   | Int16                 | ✅        | Yes       |
| INT32                                   | Int32                 | ✅        | Yes       |
| INT64                                   | Int64                 | ✅        | Yes       |
| FLOAT32                                 | Float32               | ✅        | Yes       |
| FLOAT64                                 | Float64               | ✅        | Yes       |
| BOOLEAN                                 | Boolean               | ✅        | Yes       |
| ARRAY                                   | Array(T)              | ✅        | No        |
| MAP                                     | Map(Primitive, T)     | ✅        | No        |
| STRUCT                                  | Variant(T1, T2, …)    | ✅        | No        |
| STRUCT                                  | Tuple(a T1, b T2, …)  | ✅        | No        |
| STRUCT                                  | Nested(a T1, b T2, …) | ✅        | No        |
| BYTES                                   | String                | ✅        | No        |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64    | ✅        | No        |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32        | ✅        | No        |
| org.apache.kafka.connect.data.Decimal   | Decimal               | ✅        | No        |

**スキーマが宣言されていない場合:**

レコードはJSONに変換され、[JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow)形式でClickHouseに値として送信されます。

### Configuration Recipes {#configuration-recipes}

これらは、迅速に始めるための一般的な設定レシピです。

#### Basic Configuration {#basic-configuration}

最も基本的な設定 - Kafka Connectを分散モードで実行し、SSLが有効になっている`localhost:8443`でClickHouseサーバーが実行されていることを前提とし、データはスキーマレスJSONです。

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    "tasks.max": "1",
    "consumer.override.max.poll.records": "5000",
    "consumer.override.max.partition.fetch.bytes": "5242880",
    "database": "default",
    "errors.retry.timeout": "60",
    "exactlyOnce": "false",
    "hostname": "localhost",
    "port": "8443",
    "ssl": "true",
    "jdbcConnectionProperties": "?ssl=true&sslmode=strict",
    "username": "default",
    "password": "<PASSWORD>",
    "topics": "<TOPIC_NAME>",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "false",
    "clickhouseSettings": ""
  }
}
```

#### Basic Configuration with Multiple Topics {#basic-configuration-with-multiple-topics}

コネクタは複数のトピックからデータを取得できます。

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "topics": "SAMPLE_TOPIC, ANOTHER_TOPIC, YET_ANOTHER_TOPIC",
    ...
  }
}
```

#### Basic Configuration with DLQ {#basic-configuration-with-dlq}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "errors.tolerance": "all",
    "errors.deadletterqueue.topic.name": "<DLQ_TOPIC>",
    "errors.deadletterqueue.context.headers.enable": "true",
  }
}
```

#### Using with different data formats {#using-with-different-data-formats}

##### Avro Schema Support {#avro-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "io.confluent.connect.avro.AvroConverter",
    "value.converter.schema.registry.url": "<SCHEMA_REGISTRY_HOST>:<PORT>",
    "value.converter.schemas.enable": "true",
  }
}
```

##### Protobuf Schema Support {#protobuf-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "io.confluent.connect.protobuf.ProtobufConverter",
    "value.converter.schema.registry.url": "<SCHEMA_REGISTRY_HOST>:<PORT>",
    "value.converter.schemas.enable": "true",
  }
}
```

注意: クラスが見つからない問題が発生した場合、一部の環境にはprotobufコンバータが含まれておらず、依存関係とバンドルされた別リリースのjarが必要になることがあります。

##### JSON Schema Support {#json-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  }
}
```

##### String Support {#string-support}

コネクタは、異なるClickHouseフォーマットでのString Converterをサポートしています：[JSON](/interfaces/formats#jsoneachrow)、[CSV](/interfaces/formats#csv)、および[TSV](/interfaces/formats#tabseparated)。

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "org.apache.kafka.connect.storage.StringConverter",
    "customInsertFormat": "true",
    "insertFormat": "CSV"
  }
}
```

### Logging {#logging}

ロギングは自動的にKafka Connect Platformによって提供されます。
ロギングの宛先と形式は、Kafka connectの[設定ファイル](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file)を介して構成することができます。

Confluent Platformを使用している場合、ログはCLIコマンドを実行することで表示できます。

```bash
confluent local services connect log
```

詳細については、公式の[チュートリアル](https://docs.confluent.io/platform/current/connect/logging.html)をご覧ください。

### Monitoring {#monitoring}

ClickHouse Kafka Connectは、[Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html)を介してランタイムメトリクスを報告します。JMXはデフォルトでKafka Connectorに有効になっています。

ClickHouse Connectの`MBeanName`:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connectは、次のメトリクスを報告します。

| Name                 | Type | Description                                                                             |
|----------------------|------|-----------------------------------------------------------------------------------------|
| `receivedRecords`      | long | 受信したレコードの総数。                                                                     |
| `recordProcessingTime` | long | レコードを統合構造にグループ化し変換するのに要した合計時間（ナノ秒単位）。                          |
| `taskProcessingTime`   | long | ClickHouseにデータを処理し挿入するのに要した合計時間（ナノ秒単位）。                             |

### Limitations {#limitations}

- 削除はサポートされていません。
- バッチサイズはKafka Consumerプロパティから引き継がれます。
- KeeperMapで一貫性のある状態が変更された場合は、特定のトピックの内容をKeeperMapから削除する必要があります。（詳細は下のトラブルシューティングガイドを参照）

### Tuning Performance {#tuning-performance}

「Sinkコネクタのバッチサイズを調整したい」と考えたことがあるなら、このセクションがあなたのためです。

##### Connect Fetch vs Connector Poll {#connect-fetch-vs-connector-poll}

Kafka Connect（私たちのSinkコネクタが構築されているフレームワーク）は、バックグラウンドでKafkaトピックからメッセージを取得します（コネクタとは独立しています）。

このプロセスは、`fetch.min.bytes`と`fetch.max.bytes`を使用して制御できます。`fetch.min.bytes`はフレームワークがコネクタに値を渡す前に必要な最小量を設定し（`fetch.max.wait.ms`で設定された時間制限まで）、`fetch.max.bytes`は上限サイズを設定します。コネクタにより大きなバッチを渡したい場合は、最小フェッチまたは最大待機を増やすことがオプションになるかもしれません。

取得されたデータは、メッセージをポーリングするコネクタクライアントによって消費されます。各ポーリングの量は`max.poll.records`で制御されますが、フェッチはポーリングとは独立しています。

これらの設定を調整する際には、ユーザーは取得サイズが複数の`max.poll.records`バッチを生成するように目指すべきです（設定`fetch.min.bytes`と`fetch.max.bytes`は圧縮されたデータを表すことを忘れないでください） - そうすれば、各コネクタタスクは可能な限り大きなバッチを挿入します。

ClickHouseは、頻繁ではなく小さなバッチよりも少し遅れて大きなバッチに最適化されています - バッチが大きいほど良いです。

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

詳細については、[Confluentのドキュメンテーション](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration)や[Kafkaのドキュメンテーション](https://kafka.apache.org/documentation/#consumerconfigs)を参照してください。

#### Multiple high throughput topics {#multiple-high-throughput-topics}

コネクタが複数トピックをサブスクライブするように構成されている場合、`topics2TableMap`を使用してトピックをテーブルにマッピングしており、挿入でボトルネックを経験している場合は、トピックごとに1つのコネクタを作成することを検討してください。この現象が発生する主な理由は、現在バッチがすべてのテーブルに[直列で挿入される](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100)からです。

トピックごとに1つのコネクタを作成することは、可能な限り迅速な挿入率を確保するためのワークアラウンドです。

### Troubleshooting {#troubleshooting}

#### "State mismatch for topic `[someTopic]` partition `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

これは、KeeperMapに保存されたオフセットがKafkaに保存されたオフセットと異なる場合に発生します。通常はトピックが削除されたり、オフセットが手動で調整されたときです。
これを修正するには、指定のトピックとパーティションに対して保存された古い値を削除する必要があります。

**注意: この調整は一貫性のある影響を与える可能性があります。**

#### "What errors will the connector retry?" {#what-errors-will-the-connector-retry}

現在のところ、焦点は一時的でリトライ可能なエラーの特定にあります。含まれるエラーは以下の通りです：

- `ClickHouseException` - ClickHouseから投げられる可能性のあるジェネリックな例外です。通常、サーバーが過負荷の時に発生し、以下のエラーコードが特に一時的とみなされます：
  - 3 - UNEXPECTED_END_OF_FILE
  - 159 - TIMEOUT_EXCEEDED
  - 164 - READONLY
  - 202 - TOO_MANY_SIMULTANEOUS_QUERIES
  - 203 - NO_FREE_CONNECTION
  - 209 - SOCKET_TIMEOUT
  - 210 - NETWORK_ERROR
  - 242 - TABLE_IS_READ_ONLY
  - 252 - TOO_MANY_PARTS
  - 285 - TOO_FEW_LIVE_REPLICAS
  - 319 - UNKNOWN_STATUS_OF_INSERT
  - 425 - SYSTEM_ERROR
  - 999 - KEEPER_EXCEPTION
  - 1002 - UNKNOWN_EXCEPTION
- `SocketTimeoutException` - ソケットがタイムアウトした場合に発生します。
- `UnknownHostException` - ホストを解決できない場合に発生します。
- `IOException` - ネットワークに問題がある場合に発生します。

#### "All my data is blank/zeroes" {#all-my-data-is-blankzeroes}
おそらく、あなたのデータのフィールドがテーブルのフィールドと一致していません - これはCDC（およびDebeziumフォーマット）で特に一般的です。
一般的な解決策は、コネクタ設定にフラット変換を追加することです：

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

これにより、データがネストされたJSONからフラットなJSONに変換されます（`_`を区切り文字として使用）。テーブルのフィールドは「field1_field2_field3」形式（例：「before_id」、「after_id」など）になります。

#### "I want to use my Kafka keys in ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Kafkaのキーはデフォルトでは値フィールドに保存されていませんが、`KeyToValue`変換を使用して、キーを値フィールドに移動させることができます（新しい`_key`フィールド名の下に）：

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
