---
'sidebar_label': 'ClickHouse Kafka Connect Sink'
'sidebar_position': 2
'slug': '/integrations/kafka/clickhouse-kafka-connect-sink'
'description': 'The official Kafka connector from ClickHouse.'
'title': 'ClickHouse Kafka Connect Sink'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
助けが必要な場合は、[リポジトリに問題を登録してください](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) または [ClickHouseのパブリックスラック](https://clickhouse.com/slack)で質問をしてください。
:::
**ClickHouse Kafka Connect Sink**は、KafkaトピックからClickHouseテーブルにデータを提供するKafkaコネクタです。

### License {#license}

Kafkaコネクタシンクは、[Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)の下で配布されています。

### Requirements for the environment {#requirements-for-the-environment}

[Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html)フレームワークv2.7以降が環境にインストールされている必要があります。

### Version compatibility matrix {#version-compatibility-matrix}

| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
|----------------------------------|--------------------|---------------|--------------------|
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1              |

### Main Features {#main-features}

- ワンバウンドのセマンティクスを持つ状態で出荷されます。これは、コネクタによって状態ストアとして使用される新しいClickHouseコア機能である[KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976)によって実現され、最小限のアーキテクチャを可能にします。
- サードパーティの状態ストアをサポート：現在はメモリ内がデフォルトですが、KeeperMapを使用することも可能です（Redisは近日中に追加予定）。
- コア統合：ClickHouseによって構築、維持、サポートされています。
- [ClickHouse Cloud](https://clickhouse.com/cloud)に対して継続的にテストされています。
- 宣言されたスキーマによるデータ挿入とスキーマレスデータをサポート。
- ClickHouseのすべてのデータ型をサポートしています。

### Installation instructions {#installation-instructions}

#### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />

#### General Installation Instructions {#general-installation-instructions}

コネクタは、プラグインを実行するために必要なすべてのクラスファイルを含む単一のJARファイルとして配布されます。

プラグインをインストールするには、以下の手順を実行します。

- [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)ページからConnector JARファイルを含むZIPアーカイブをダウンロードします。
- ZIPファイルの内容を抽出し、所望の場所にコピーします。
- Confluent Platformがプラグインを見つけることを許可するために、Connectプロパティファイルの[plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path)設定にプラグインディレクトリへのパスを追加します。
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
- Confluent Platformを使用している場合、Confluent Control Center UIにログインして、ClickHouse Sinkが利用可能なコネクタのリストにあることを確認します。

### Configuration options {#configuration-options}

ClickHouse SinkをClickHouseサーバーに接続するには、次の情報を提供する必要があります。

- 接続詳細：hostname（**必須**）とport（オプション）
- ユーザー認証情報：password（**必須**）およびusername（オプション）
- コネクタクラス：`com.clickhouse.kafka.connect.ClickHouseSinkConnector`（**必須**）
- topicsまたはtopics.regex：ポーリングするKafkaトピック - トピック名はテーブル名と一致する必要があります（**必須**）
- キーおよび値変換器：トピック上のデータの種類に基づいて設定します。ワーカー設定にまだ定義されていない場合は必須です。

全ての設定オプションの完全な表：

| Property Name                                   | Description                                                                                                                                                                                                                        | Default Value                                            |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `hostname` (Required)                           | サーバーのホスト名またはIPアドレス                                                                                                                                                                                               | N/A                                                      |
| `port`                                          | ClickHouseポート - デフォルトは8443（クラウドのHTTPS用）ですが、HTTP（セルフホストのデフォルト）の場合は8123にするべきです                                                                                                     | `8443`                                                   |
| `ssl`                                           | ClickHouseへのssl接続を有効にします                                                                                                                                                                                              | `true`                                                   |
| `jdbcConnectionProperties`                      | Clickhouseに接続する際の接続プロパティ。`?`で始まり、`param=value`の間を`&`で結合します                                                                                                                                   | `""`                                                     |
| `username`                                      | ClickHouseデータベースのユーザー名                                                                                                                                                                                               | `default`                                                |
| `password` (Required)                           | ClickHouseデータベースのパスワード                                                                                                                                                                                               | N/A                                                      |
| `database`                                      | ClickHouseデータベース名                                                                                                                                                                                                         | `default`                                                |
| `connector.class` (Required)                    | コネクタークラス（明示的に設定し、デフォルト値を保持）                                                                                                                                                                           | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                     | コネクタタスクの数                                                                                                                                                                                                                | `"1"`                                                    |
| `errors.retry.timeout`                          | ClickHouse JDBCリトライタイムアウト                                                                                                                                                                                              | `"60"`                                                   |
| `exactlyOnce`                                   | 一度だけの接続を有効にします                                                                                                                                                                                                       | `"false"`                                                |
| `topics` (Required)                             | ポーリングするKafkaトピック - トピック名はテーブル名と一致する必要があります                                                                                                                                                  | `""`                                                     |
| `key.converter` (Required* - See Description)   | キーのタイプに応じて設定します。キーを渡す場合はここで必須です（ワーカー設定にまだ定義されていない場合）。                                                                                                                         | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Required* - See Description) | トピックのデータのタイプに基づいて設定します。サポート：- JSON、String、AvroまたはProtobuf形式。ワーカー設定にまだ定義されていない場合はここで必須です。                                                                               | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                | コネクタの値変換器のスキーマサポート                                                                                                                                                                                              | `"false"`                                                |
| `errors.tolerance`                              | コネクタのエラー許容。サポート：none, all                                                                                                                                                                                       | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`             | 設定されている場合（errors.tolerance=allとともに）、失敗したバッチのためにDLQが使用されます（[トラブルシューティング](#troubleshooting)を参照）                                                                                      | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable` | DLQの追加ヘッダーを追加します                                                                                                                                                                                                    | `""`                                                     |
| `clickhouseSettings`                            | ClickHouseの設定のカンマ区切りリスト（例："insert_quorum=2, etc..."）                                                                                                                                                       | `""`                                                     |
| `topic2TableMap`                                | トピック名をテーブル名にマッピングするカンマ区切りリスト（例："topic1=table1, topic2=table2, etc..."）                                                                                                                        | `""`                                                     |
| `tableRefreshInterval`                          | テーブル定義キャッシュを更新する時間（秒単位）                                                                                                                                                                               | `0`                                                      |
| `keeperOnCluster`                               | セルフホストインスタンスのON CLUSTERパラメータの設定を許可します（例：`ON CLUSTER clusterNameInConfigFileDefinition`）正確に一度だけの接続状態テーブルのために([Distributed DDL Queries](/sql-reference/distributed-ddl)を参照） | `""`                                                     |
| `bypassRowBinary`                               | スキーマベースのデータ（Avro、Protobufなど）に対するRowBinaryとRowBinaryWithDefaultsの使用を無効にします - データに欠落したカラムがある場合やNullable/デフォルトが受け入れられない場合にのみ使用する必要があります                                | `"false"`                                                |
| `dateTimeFormats`                               | DateTime64スキーマフィールドを解析するための日付時刻形式、`;`で区切ります（例：`someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                                               | `""`                                                     |
| `tolerateStateMismatch`                         | コネクタがAFTER_PROCESSINGで保存された現在のオフセットよりも"早い"レコードをドロップすることを許可します（例：オフセット5が送信され、オフセット250が最後に記録されたオフセットの場合）                                                  | `"false"`                                                |
| `ignorePartitionsWhenBatching`                  | 挿入のためにメッセージを収集するときにパーティションを無視します（ただし、`exactlyOnce`が`false`の場合のみ）。パフォーマンスノート：コネクタタスクが多いほど、タスクごとに割り当てられるKafkaパーティションは少なくなります - これはリターンが減ることを意味します。 | `"false"`                                                |

### Target Tables {#target-tables}

ClickHouse Connect Sinkは、Kafkaトピックからメッセージを読み取り、適切なテーブルに書き込みます。ClickHouse Connect Sinkは、既存のテーブルにデータを書き込みます。データをそのテーブルに挿入し始める前に、適切なスキーマを持つターゲットテーブルがClickHouseに作成されていることを確認してください。

各トピックは、ClickHouse内に専用のターゲットテーブルを必要とします。ターゲットテーブル名は、ソーストピック名と一致する必要があります。

### Pre-processing {#pre-processing}

ClickHouse Kafka Connect Sinkに送信される前にアウトバウンドメッセージを変換する必要がある場合は、[Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html)を使用してください。

### Supported Data types {#supported-data-types}

**スキーマが宣言されている場合：**

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
| STRUCT                                  | Variant(T1, T2, ...)    | ✅        | No        |
| STRUCT                                  | Tuple(a T1, b T2, ...)  | ✅        | No        |
| STRUCT                                  | Nested(a T1, b T2, ...) | ✅        | No        |
| BYTES                                   | String                | ✅        | No        |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64    | ✅        | No        |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32        | ✅        | No        |
| org.apache.kafka.connect.data.Decimal   | Decimal               | ✅        | No        |

**スキーマが宣言されていない場合：**

レコードはJSONに変換され、[JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow)形式でClickHouseに送信されます。

### Configuration Recipes {#configuration-recipes}

迅速に始めるための一般的な設定レシピをいくつか紹介します。

#### Basic Configuration {#basic-configuration}

始めるための最も基本的な設定 - Kafka Connectが分散モードで実行されており、`localhost:8443`でSSLが有効になっているClickHouseサーバーが実行されていることを前提とし、データはスキーマレスのJSONです。

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

コネクタは複数のトピックからデータを消費できます。

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
    "errors.deadletterqueue.context.headers.enable": "true"
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
    "value.converter.schemas.enable": "true"
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
    "value.converter.schemas.enable": "true"
  }
}
```

注意：クラスが不足している問題が発生した場合、すべての環境がprotobuf変換器を含むわけではなく、依存関係がバンドルされた別のリリースのjarが必要になることがあります。

##### JSON Schema Support {#json-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "org.apache.kafka.connect.json.JsonConverter"
  }
}
```

##### String Support {#string-support}

コネクタは、異なるClickHouse形式のString Converterをサポートします：[JSON](/interfaces/formats#jsoneachrow)、[CSV](/interfaces/formats#csv)、および[TSV](/interfaces/formats#tabseparated)。

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

ログ記録はKafka Connect Platformによって自動的に提供されます。ログの宛先と形式は、Kafka connectの[設定ファイル](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file)を介して設定できます。

Confluent Platformを使用している場合は、CLIコマンドを実行することでログを確認できます。

```bash
confluent local services connect log
```

追加の詳細は公式の[チュートリアル](https://docs.confluent.io/platform/current/connect/logging.html)をチェックしてください。

### Monitoring {#monitoring}

ClickHouse Kafka Connectは、[Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html)を介してランタイムメトリックを報告します。JMXはデフォルトでKafka Connectorで有効になっています。

ClickHouse Connect `MBeanName`：

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connectは次のメトリックを報告します：

| Name                 | Type | Description                                                                             |
|----------------------|------|-----------------------------------------------------------------------------------------|
| `receivedRecords`      | long | 受け取ったレコードの総数。                                                   |
| `recordProcessingTime` | long | レコードを統一構造にグループ化して変換するのにかかる合計時間（ナノ秒単位）。 |
| `taskProcessingTime`   | long | ClickHouseにデータを処理して挿入するのにかかる合計時間（ナノ秒単位）。          |

### Limitations {#limitations}

- 削除はサポートされていません。
- バッチサイズはKafka Consumerプロパティから引き継がれます。
- KeeperMapを使って一度だけ接続している場合、オフセットが変更または巻き戻されると、その特定のトピックのKeeperMapから内容を削除する必要があります。（詳細は以下のトラブルシューティングガイドを参照）

### Tuning Performance {#tuning-performance}

「シンクコネクタのバッチサイズを調整したい」と思ったことがあれば、ここがあなたのセクションです。

##### Connect Fetch vs Connector Poll {#connect-fetch-vs-connector-poll}

Kafka Connect（私たちのシンクコネクタが構築されているフレームワーク）は、バックグラウンドでKafkaトピックからメッセージを取得します（コネクタとは独立しています）。

このプロセスは、`fetch.min.bytes`と`fetch.max.bytes`を使用して制御できます。`fetch.min.bytes`は、フレームワークがコネクタに値を渡す前に必要な最小量を設定し（`fetch.max.wait.ms`で設定された時間制限まで）、`fetch.max.bytes`は上限サイズを設定します。コネクタにより大きなバッチを渡したい場合は、最小フェッチまたは最大待機を増やすというオプションがあります。

この取得したデータは、その後メッセージをポーリングするコネクタクライアントによって消費されます。この際、各ポーリングに対する量は`max.poll.records`によって制御されます。フェッチはポーリングとは独立していることに注意してください！

これらの設定を調整する際、ユーザーはフェッチサイズが`max.poll.records`の複数のバッチを生成することを目指すべきです（設定`fetch.min.bytes`と`fetch.max.bytes`は圧縮データを表していることに注意してください） - そうすることで、各コネクタタスクができるだけ大きなバッチを挿入します。

ClickHouseは、頻繁だが小さなバッチよりも、わずかな遅延でも大きなバッチに最適化されています - バッチが大きいほど、パフォーマンスが良くなります。

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

詳細については、[Confluentのドキュメント](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration)や[Kafkaのドキュメント](https://kafka.apache.org/documentation/#consumerconfigs)をご覧ください。

#### Multiple high throughput topics {#multiple-high-throughput-topics}

コネクタが複数のトピックを購読するように設定されていて、`topic2TableMap`を使用してトピックをテーブルにマッピングし、挿入時にボトルネックが発生して消費者の遅延が生じている場合、代わりにトピックごとに一つのコネクタを作成することを検討してください。この理由は、現在バッチがすべてのテーブルに対して[直列的に](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100)挿入されるからです。

トピックごとに一つのコネクタを作成することは、可能な限り速い挿入率を確保するための暫定策です。

### Troubleshooting {#troubleshooting}

#### "State mismatch for topic `[someTopic]` partition `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

これは、KeeperMapに保存されたオフセットがKafkaに保存されたオフセットと異なる場合に発生します。通常、トピックが削除されたか、オフセットが手動で調整されたときに発生します。
これを修正するには、その特定のトピック+パーティションのために保存されている古い値を削除する必要があります。

**注意：この調整は一度だけの接続に影響を与える可能性があります。**

#### "What errors will the connector retry?" {#what-errors-will-the-connector-retry}

現在のところ、焦点は一時的でリトライ可能なエラーの特定にあります。これには次のものが含まれます：

- `ClickHouseException` - ClickHouseによってスローされる可能性がある一般的な例外です。
  サーバーが過負荷であるときによくスローされ、以下のエラーコードが特に一時的拡張されます：
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
- `SocketTimeoutException` - ソケットがタイムアウトしたときにスローされます。
- `UnknownHostException` - ホストが解決できないときにスローされます。
- `IOException` - ネットワークに問題がある場合にスローされます。

#### "All my data is blank/zeroes" {#all-my-data-is-blankzeroes}
おそらく、データ内のフィールドがテーブル内のフィールドと一致していません - これは特にCDC（およびDebezium形式）で一般的です。
一般的な解決策の一つは、コネクタ設定にフラット変換を追加することです：

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

これにより、データがネストされたJSONからフラットなJSONに変換されます（`_`を区切り文字として使用）。テーブル内のフィールドは「field1_field2_field3」形式に従うことになります（例：「before_id」、「after_id」など）。

#### "I want to use my Kafka keys in ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Kafkaのキーはデフォルトでは値フィールドに保存されませんが、`KeyToValue`変換を使用してキーを値フィールドに移動できます（新しい`_key`フィールド名の下に）：

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
