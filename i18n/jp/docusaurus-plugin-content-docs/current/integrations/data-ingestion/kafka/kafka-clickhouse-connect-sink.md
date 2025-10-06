---
'sidebar_label': 'ClickHouse Kafka Connect Sink'
'sidebar_position': 2
'slug': '/integrations/kafka/clickhouse-kafka-connect-sink'
'description': 'ClickHouse の公式 Kafka コネクタです。'
'title': 'ClickHouse Kafka Connect Sink'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
ヘルプが必要な場合は、[リポジトリに問題を報告](https://github.com/ClickHouse/clickhouse-kafka-connect/issues)するか、[ClickHouseパブリックスラック](https://clickhouse.com/slack)で質問してください。
:::
**ClickHouse Kafka Connect Sink** は、KafkaトピックからClickHouseテーブルへのデータを配信するKafkaコネクタです。

### License {#license}

Kafka Connector Sinkは、[Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)の下で配布されています。

### Requirements for the environment {#requirements-for-the-environment}

[Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html)フレームワークv2.7以降を環境にインストールする必要があります。

### Version compatibility matrix {#version-compatibility-matrix}

| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
|----------------------------------|--------------------|---------------|--------------------|
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1              |

### Main features {#main-features}

- 箱から出してすぐに使える正確な一度きりのセマンティクスを提供します。これは、コネクタによって状態ストアとして使用される新しいClickHouseコア機能である[KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976)により実現され、ミニマリズムのアーキテクチャを可能にします。
- サードパーティの状態ストアのサポート：現在はメモリ内がデフォルトですが、KeeperMap（Redisが近いうちに追加される予定）を使用できます。
- コア統合：ClickHouseによって構築、保守、サポートされています。
- [ClickHouse Cloud](https://clickhouse.com/cloud)に対して継続的にテストされています。
- 宣言されたスキーマとスキーマレスでのデータ挿入。
- ClickHouseのすべてのデータ型をサポートしています。

### Installation instructions {#installation-instructions}

#### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />

#### General installation instructions {#general-installation-instructions}

コネクタは、プラグインを実行するために必要なすべてのクラスファイルを含む単一のJARファイルとして配布されます。

プラグインをインストールするには、次の手順に従います。

- [リリース](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)ページからConnector JARファイルを含むzipアーカイブをダウンロードします。
- ZIPファイルの内容を抽出し、希望の場所にコピーします。
- Confluent Platformがプラグインを見つけられるように、Connectプロパティファイルの[plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path)構成にプラグインディレクトリのパスを追加します。
- トピック名、ClickHouseインスタンスのホスト名、およびパスワードをconfigに提供します。

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
- Confluent Platformを使用している場合は、Confluent Control Center UIにログインして、ClickHouse Sinkが利用可能なコネクタのリストにあることを確認します。

### Configuration options {#configuration-options}

ClickHouse SinkをClickHouseサーバに接続するには、次を提供する必要があります。

- 接続詳細：ホスト名（**必須**）およびポート（オプション）
- ユーザー資格情報：パスワード（**必須**）およびユーザー名（オプション）
- コネクタークラス：`com.clickhouse.kafka.connect.ClickHouseSinkConnector`（**必須**）
- トピックまたはtopics.regex：ポーリングするKafkaトピック - トピック名はテーブル名と一致する必要があります（**必須**）
- キーおよび値コンバーター：トピック内のデータタイプに基づいて設定します。ワーカー構成で未定義の場合は必須です。

完全な構成オプションの表：

| Property Name                                   | Description                                                                                                                                                                                                                        | Default Value                                            |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `hostname` (Required)                           | サーバのホスト名またはIPアドレス                                                                                                                                                                                           | N/A                                                      |
| `port`                                          | ClickHouseポート - デフォルトは8443（クラウドのHTTPS用）ですが、HTTP（セルフホストのデフォルト）の場合は8123である必要があります                                                                                                       | `8443`                                                   |
| `ssl`                                           | ClickHouseへのssl接続を有効にします                                                                                                                                                                                                | `true`                                                   |
| `jdbcConnectionProperties`                      | Clickhouseに接続する際の接続プロパティ。`?`から始まり、`param=value`の間は`&`で結合される必要があります                                                                                                                   | `""`                                                     |
| `username`                                      | ClickHouseデータベース用のユーザー名                                                                                                                                                                                                       | `default`                                                |
| `password` (Required)                           | ClickHouseデータベース用のパスワード                                                                                                                                                                                                       | N/A                                                      |
| `database`                                      | ClickHouseデータベース名                                                                                                                                                                                                           | `default`                                                |
| `connector.class` (Required)                    | コネクタークラス（明示的に設定し、デフォルト値を保持）                                                                                                                                                                        | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                     | コネクタタスクの数                                                                                                                                                                                                      | `"1"`                                                    |
| `errors.retry.timeout`                          | ClickHouse JDBCリトライタイムアウト                                                                                                                                                                                                      | `"60"`                                                   |
| `exactlyOnce`                                   | Exactly Once有効                                                                                                                                                                                                               | `"false"`                                                |
| `topics` (Required)                             | ポーリングするKafkaトピック - トピック名はテーブル名と一致する必要があります                                                                                                                                                                      | `""`                                                     |
| `key.converter` (Required* - See Description)   | キーのタイプに応じて設定します。キーを渡す場合はここで必須（ワーカー構成で定義されていない場合）。                                                                                                                 | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Required* - See Description) | トピックのデータタイプに基づいて設定します。サポートされている形式：- JSON、String、AvroまたはProtobuf形式。ワーカー構成で定義されていない場合はここで必須です。                                                                                   | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                | コネクタ値コンバータのスキーマサポート                                                                                                                                                                                           | `"false"`                                                |
| `errors.tolerance`                              | コネクタエラー耐性。サポートされる値：none, all                                                                                                                                                                                    | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`             | 設定されている場合（errors.tolerance=allと共に）、失敗したバッチ用のDLQが使用されます（[トラブルシューティング](#troubleshooting)を参照）                                                                                                                | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable` | DLQ用の追加ヘッダーを追加します                                                                                                                                                                                                | `""`                                                     |
| `clickhouseSettings`                            | クリックハウス設定のカンマ区切りリスト（例： "insert_quorum=2、etc..."）                                                                                                                                                       | `""`                                                     |
| `topic2TableMap`                                | トピック名をテーブル名にマッピングするカンマ区切りリスト（例： "topic1=table1、topic2=table2等..."）                                                                                                                            | `""`                                                     |
| `tableRefreshInterval`                          | テーブル定義キャッシュを更新するための時間（秒単位）                                                                                                                                                                            | `0`                                                      |
| `keeperOnCluster`                               | セルフホストのインスタンス用にON CLUSTERパラメーターを構成できるようにします（例： `ON CLUSTER clusterNameInConfigFileDefinition`）正確に一度きりのconnect_stateテーブル用（[分散DDLクエリ](/sql-reference/distributed-ddl)を参照）   | `""`                                                     |
| `bypassRowBinary`                               | スキーマベースのデータ（Avro、Protobufなど）用のRowBinaryおよびRowBinaryWithDefaultsの使用を無効にすることを許可します - データに欠落するカラムがあり、Nullable/Defaultが許可されない場合にのみ使用するべきです。                          | `"false"`                                                |
| `dateTimeFormats`                               | DateTime64スキーマフィールドの解析用の日付時間形式、`;`で区切ります（例： `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                                                              | `""`                                                     |
| `tolerateStateMismatch`                         | コネクタが「現在の」処理後に保存されたオフセットよりも「早い」レコードをドロップできるようにします（例：オフセット5が送信され、オフセット250が最後の記録されたオフセットだった場合）                                                             | `"false"`                                                |
| `ignorePartitionsWhenBatching`                  | 挿入のためにメッセージを収集する際にパーティションを無視します（`exactlyOnce`が`false`の場合のみ）。パフォーマンスノート：コネクタタスクが多いほど、タスクごとに割り当てられたkafkaパーティションが少なくなります - これにより効果が薄れる可能性があります。 | `"false"`                                                |

### Target tables {#target-tables}

ClickHouse Connect SinkはKafkaトピックからメッセージを読み取り、適切なテーブルに書き込みます。ClickHouse Connect Sinkは既存のテーブルにデータを書き込みます。データを挿入する前に、ClickHouseに適切なスキーマを持つターゲットテーブルが作成されていることを確認してください。

各トピックにはClickHouse内に専用のターゲットテーブルが必要です。ターゲットテーブル名はソーストピック名と一致する必要があります。

### Pre-processing {#pre-processing}

ClickHouse Kafka Connect Sinkに送信される前にアウトバウンドメッセージを変換する必要がある場合は、[Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html)を使用してください。

### Supported data types {#supported-data-types}

**スキーマが宣言されている場合：**

| Kafka Connect Type                      | ClickHouse Type       | Supported | Primitive |
| --------------------------------------- |-----------------------| --------- | --------- |
| STRING                                  | String                | ✅        | Yes       |
| STRING                                  | JSON. See below (1)              | ✅        | Yes       |
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
| STRUCT                                  | JSON. See below (1), (2)          | ✅        | No        |
| BYTES                                   | String                | ✅        | No        |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64    | ✅        | No        |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32        | ✅        | No        |
| org.apache.kafka.connect.data.Decimal   | Decimal               | ✅        | No        |

- (1) - JSONは、ClickHouse設定で`input_format_binary_read_json_as_string=1`が設定されている場合にのみサポートされます。これはRowBinary形式ファミリーにのみ機能し、この設定はすべてのカラムに影響するため、すべてのカラムは文字列にする必要があります。この場合、コネクタはSTRUCTをJSON文字列に変換します。 

- (2) - structに`oneof`のようなユニオンがある場合は、フィールド名にプレフィックス/サフィックスを追加しないようにコンバータを構成する必要があります。`ProtobufConverter`のための`generate.index.for.unions=false`という設定があります（詳細は[こちら](https://docs.confluent.io/platform/current/schema-registry/connect.html#protobuf)を参照）。  

**スキーマが宣言されていない場合：**

レコードはJSONに変換され、[JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow)形式でClickHouseに値として送信されます。

### Configuration recipes {#configuration-recipes}

これらは、迅速に始めるための一般的な構成レシピです。

#### Basic configuration {#basic-configuration}

開始するための最も基本的な構成 - Kafka Connectが分散モードで実行されており、SSLが有効な状態で`localhost:8443`でClickHouseサーバーが実行されていることを前提としています。データはスキーマレスのJSONです。

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

#### Basic configuration with multiple topics {#basic-configuration-with-multiple-topics}

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

#### Basic configuration with DLQ {#basic-configuration-with-dlq}

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

##### Avro schema support {#avro-schema-support}

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

##### Protobuf schema support {#protobuf-schema-support}

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

注意：クラスが見つからない問題が発生した場合、すべての環境にprotobufコンバータが付属しているわけではなく、依存関係がバンドルされたjarの代替リリースが必要になることがあります。

##### JSON schema support {#json-schema-support}

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

##### String support {#string-support}

コネクタは異なるClickHouse形式のString Converterをサポートしています：[JSON](/interfaces/formats#jsoneachrow)、[CSV](/interfaces/formats#csv)、および[TSV](/interfaces/formats#tabseparated)。

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

ログはKafka Connect Platformによって自動的に提供されます。
ログの出力先と形式は、Kafka connectの[設定ファイル](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file)を介して構成できます。

Confluent Platformを使用している場合、CLIコマンドを実行することでログを確認できます：

```bash
confluent local services connect log
```

詳細については、公式の[チュートリアル](https://docs.confluent.io/platform/current/connect/logging.html)を確認してください。

### Monitoring {#monitoring}

ClickHouse Kafka Connectは、[Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html)を介してランタイムメトリクスを報告します。JMXは既定でKafka Connectorで有効になっています。

ClickHouse Connect `MBeanName`：

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connectは以下のメトリクスを報告します：

| Name                 | Type | Description                                                                             |
|----------------------|------|-----------------------------------------------------------------------------------------|
| `receivedRecords`      | long | 受け取ったレコードの総数。                                                   |
| `recordProcessingTime` | long | レコードを統合し、統一された構造に変換するために消費された総時間（ナノ秒単位）。 |
| `taskProcessingTime`   | long | ClickHouseにデータを処理して挿入するために消費された総時間（ナノ秒単位）。          |

### Limitations {#limitations}

- 削除はサポートされていません。
- バッチサイズはKafka Consumerプロパティから引き継がれます。
- KeeperMapを正確に一度きりで使用し、オフセットが変更または巻き戻された場合、その特定のトピックに対してKeeperMapから内容を削除する必要があります。（詳細は以下のトラブルシューティングガイドを参照）

### Tuning performance {#tuning-performance}

「Sinkコネクタのバッチサイズを調整したい」と考えたことがあるなら、このセクションがあなたのためのものです。

##### Connect fetch vs connector poll {#connect-fetch-vs-connector-poll}

Kafka Connect（私たちのSinkコネクタが構築されるフレームワーク）は、バックグラウンドでKafkaトピックからメッセージを取得します（コネクタとは独立しています）。

このプロセスは、`fetch.min.bytes`と`fetch.max.bytes`を使用して制御できます - `fetch.min.bytes`はフレームワークが値をコネクタに渡す前に必要な最小量を設定し（`fetch.max.wait.ms`によって設定された時間制限まで）、`fetch.max.bytes`はサイズの上限を設定します。コネクタに大きなバッチを渡す場合、最小取得量または最大待機量を増やして大きなデータバンドルを構築するオプションがあります。

この取得したデータは、メッセージをポーリングするコネクタクライアントによって消費されます。各ポーリングの量は`max.poll.records`によって制御されますが、取得はポーリングとは独立しています！

これらの設定を調整する際は、ユーザーは取得サイズが`max.poll.records`の複数のバッチを生成することを目指すべきです（また、設定`fetch.min.bytes`と`fetch.max.bytes`が圧縮データを表すことを考慮してください） - そうすれば、各コネクタタスクはできるだけ大きなバッチを挿入できます。

ClickHouseは、頻繁で小さなバッチよりも、わずかな遅延で大きなバッチに最適化されています - バッチが大きいほど、より良い結果が得られます。

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

詳細は、[Confluentのドキュメント](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration)
や[Kafkaのドキュメント](https://kafka.apache.org/documentation/#consumerconfigs)を参照してください。

#### Multiple high throughput topics {#multiple-high-throughput-topics}

コネクタが複数のトピックにサブスクライブするように構成されており、`topic2TableMap`を使用してトピックをテーブルにマッピングしている場合、挿入時にボトルネックが発生して消費者の遅延が発生している場合、代わりにトピックごとに1つのコネクタを作成することを検討してください。これが発生する主な理由は、現在、バッチがすべてのテーブルに[直列的に](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100)挿入されるからです。

トピックごとに1つのコネクタを作成することは、可能な限り高速な挿入率を確保するための回避策です。

### Troubleshooting {#troubleshooting}

#### "State mismatch for topic `[someTopic]` partition `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

これは、KeeperMapに保存されているオフセットがKafkaに保存されているオフセットと異なる場合に発生します。通常、トピックが削除されたり、オフセットが手動で調整されたりすると発生します。
これを修正するには、その特定のトピック+パーティションに対して保存されている古い値を削除する必要があります。

**注：この調整は正確に一度きりの影響を及ぼす可能性があります。**

#### "What errors will the connector retry?" {#what-errors-will-the-connector-retry}

現在のところ、フォーカスは一時的で再試行可能なエラーの特定にあります。これには以下が含まれます：

- `ClickHouseException` - これはClickHouseによってスローされる一般的な例外です。
  通常、サーバーが過負荷であるときにスローされ、以下のエラーコードが特に一時的と見なされます：
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
- `SocketTimeoutException` - ソケットがタイムアウトした場合にスローされます。
- `UnknownHostException` - ホストが解決できない場合にスローされます。
- `IOException` - ネットワークに問題がある場合にスローされます。

#### "All my data is blank/zeroes" {#all-my-data-is-blankzeroes}
おそらくデータ内のフィールドがテーブル内のフィールドと一致していないためです - これは特にCDC（およびDebezium形式）で一般的です。
一般的な解決策の1つは、コネクタ構成にフラット変換を追加することです：

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

これにより、データがネストされたJSONからフラットなJSONに変換されます（`_`を区切り文字として使用）。テーブル内のフィールドは「field1_field2_field3」形式（例：「before_id」、「after_id」など）になります。

#### "I want to use my Kafka keys in ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Kafkaのキーはデフォルトでは値フィールドには保存されませんが、`KeyToValue`変換を使用してキーを値フィールドに移動することができます（新しい`_key`フィールド名の下に）：

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
