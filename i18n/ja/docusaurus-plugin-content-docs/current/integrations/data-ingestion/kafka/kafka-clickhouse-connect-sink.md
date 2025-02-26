---
sidebar_label: ClickHouse Kafka Connect Sink
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: ClickHouse公式のKafkaコネクタ。
---

import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# ClickHouse Kafka Connect Sink

:::note
ヘルプが必要な場合は、[リポジトリに問題を報告](https://github.com/ClickHouse/clickhouse-kafka-connect/issues)するか、[ClickHouseの公開Slack](https://clickhouse.com/slack)で質問してください。
:::
**ClickHouse Kafka Connect Sink** は、KafkaのトピックからClickHouseのテーブルにデータを送信するKafkaコネクタです。

### ライセンス {#license}

Kafka Connector Sinkは、[Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)の下で配布されています。

### 環境要件 {#requirements-for-the-environment}

環境には、[Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html)フレームワークv2.7以上がインストールされている必要があります。

### バージョン互換性マトリックス {#version-compatibility-matrix}

| ClickHouse Kafka Connect バージョン | ClickHouse バージョン | Kafka Connect | Confluent platform |
|--------------------------------------|---------------------|---------------|--------------------|
| 1.0.0                               | > 23.3              | > 2.7         | > 6.1              |

### 主な機能 {#main-features}

- 初期設定で再現性のあるセマンティクスを提供しています。これは、コネクタによって状態ストアとして使用される新しいClickHouseコア機能である[KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976)によって支えられ、最小限のアーキテクチャを実現します。
- サードパーティ製の状態ストアのサポート: 現在はメモリ内にデフォルト設定されていますが、KeeperMapを使用することも可能です（Redisの追加が近日中に行われる予定です）。
- コア統合: ClickHouseによって構築、維持、サポートされています。
- [ClickHouse Cloud](https://clickhouse.com/cloud)に対して継続的にテストされています。
- 宣言されたスキーマとスキーマなしでのデータ挿入をサポート。
- ClickHouseのすべてのデータ型をサポート。

### インストール手順 {#installation-instructions}

#### 接続詳細の収集 {#gather-your-connection-details}

<ConnectionDetails />

#### 一般的なインストール手順 {#general-installation-instructions}

コネクタは、プラグインを実行するために必要なすべてのクラスファイルを含む単一のJARファイルとして配布されています。

プラグインをインストールするには、次の手順を実行します：

- ClickHouse Kafka Connect Sinkリポジトリの[リリース](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)ページからコネクタJARファイルを含むZIPアーカイブをダウンロードします。
- ZIPファイルの内容を抽出し、希望の場所にコピーします。
- Confluent Platformがプラグインを見つけることができるように、接続プロパティファイルの[plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path)設定にプラグインディレクトリのパスを追加します。
- トピック名、ClickHouseインスタンスのホスト名、およびパスワードを設定に提供します。

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
- Confluent Platformを使用している場合は、Confluent Control Center UIにログインしてClickHouse Sinkが利用可能なコネクタのリストに表示されていることを確認します。

### 設定オプション {#configuration-options}

ClickHouse SinkをClickHouseサーバーに接続するには、次の情報を提供する必要があります：

- 接続詳細: ホスト名（**必須**）とポート（オプション）
- ユーザー資格情報: パスワード（**必須**）とユーザー名（オプション）
- コネクタクラス: `com.clickhouse.kafka.connect.ClickHouseSinkConnector`（**必須**）
- トピックまたはtopics.regex: ポーリングするKafkaトピック - トピック名はテーブル名と一致する必要があります（**必須**）
- キーおよび値のコンバータ: トピックのデータタイプに基づいて設定。すでにワーカー設定で定義されていない場合は必須です。

設定オプションの完全な表：

| プロパティ名                                     | 説明                                                                                                                                                                                                                                                      | デフォルト値                                           |
|--------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `hostname` (必須)                               | サーバーのホスト名またはIPアドレス                                                                                                                                                                                                                        | N/A                                                    |
| `port`                                          | ClickHouseのポート - デフォルトは8443（クラウドのHTTPS用）ですが、自己ホストの場合は8123を使用する必要があります。                                                                                                                                      | `8443`                                                |
| `ssl`                                           | ClickHouseへのSSL接続を有効にします。                                                                                                                                                                                                                      | `true`                                                |
| `jdbcConnectionProperties`                       | ClickHouseに接続する際の接続プロパティ。`?`で始まり、`param=value`の間は`&`で結合される必要があります。                                                                                                                                           | `""`                                                  |
| `username`                                      | ClickHouseのデータベースユーザー名                                                                                                                                                                                                                         | `default`                                             |
| `password` (必須)                               | ClickHouseのデータベースパスワード                                                                                                                                                                                                                         | N/A                                                    |
| `database`                                      | ClickHouseのデータベース名                                                                                                                                                                                                                                | `default`                                             |
| `connector.class` (必須)                        | コネクタクラス（明示的に設定し、デフォルト値として保持）                                                                                                                                                                                                             | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                     | コネクタタスクの数                                                                                                                                                                                                                                        | `"1"`                                                 |
| `errors.retry.timeout`                          | ClickHouse JDBCのリトライタイムアウト                                                                                                                                                                                                                      | `"60"`                                                |
| `exactlyOnce`                                   | 完全に一度の Enabled                                                                                                                                                                                                                                       | `"false"`                                             |
| `topics` (必須)                                 | ポーリングするKafkaトピック - トピック名はテーブル名と一致する必要があります。                                                                                                                                                                                | `""`                                                  |
| `key.converter` (必須* - 説明を参照)             | キーのタイプに応じて設定。キーを渡している場合はここで必要（ワーカー設定で定義されていない場合）。                                                                                                                                                          | `"org.apache.kafka.connect.storage.StringConverter"`  |
| `value.converter` (必須* - 説明を参照)           | トピックのデータタイプに基づいて設定。サポートされている形式: - JSON、String、Avro、またはProtobuf形式。ワーカー設定で定義されていない場合ここで必要です。                                                                                                                   | `"org.apache.kafka.connect.json.JsonConverter"`       |
| `value.converter.schemas.enable`                | コネクタ値コンバータのスキーマサポート                                                                                                                                                                                                                      | `"false"`                                             |
| `errors.tolerance`                              | コネクタのエラー耐性。サポート: none, all                                                                                                                                                                                                                  | `"none"`                                              |
| `errors.deadletterqueue.topic.name`            | 設定された場合（errors.tolerance=all）、失敗したバッチのためのDLQが使用されます（[トラブルシューティング](#troubleshooting)を参照）                                                                                                                       | `""`                                                  |
| `errors.deadletterqueue.context.headers.enable` | DLQ用の追加ヘッダーを追加します。                                                                                                                                                                                                                          | `""`                                                  |
| `clickhouseSettings`                            | ClickHouseの設定のカンマ区切りリスト（例: "insert_quorum=2, etc..."）。                                                                                                                                                                                           | `""`                                                  |
| `topic2TableMap`                                | トピック名をテーブル名にマッピングするカンマ区切りリスト（例: "topic1=table1, topic2=table2, etc..."）。                                                                                                                                                    | `""`                                                  |
| `tableRefreshInterval`                          | テーブル定義キャッシュを更新する間隔（秒単位）。                                                                                                                                                                                                            | `0`                                                   |
| `keeperOnCluster`                               | 自己ホストインスタンスのためのON CLUSTERパラメータの構成を許可します（例: `ON CLUSTER clusterNameInConfigFileDefinition`）完全に一度のconnect_stateテーブルのために（[分散DDLクエリ](/sql-reference/distributed-ddl)を参照）。                                                                      | `""`                                                  |
| `bypassRowBinary`                               | スキーマベースのデータ（Avro、Protobufなど）のためにRowBinaryおよびRowBinaryWithDefaultsの使用を無効にします。これは、データに列が欠落している場合やNullable/Defaultが許容できない場合にのみ使用する必要があります。                                                                                | `"false"`                                             |
| `dateTimeFormats`                               | DateTime64スキーマフィールドを解析するための日付時刻形式。区切りは`;`（例: `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                                                                                                                                     | `""`                                                  |
| `tolerateStateMismatch`                         | コネクタが現在のオフセットの後で保存されたレコードを「早く」削除できるようにします（例: オフセット5が送信され、オフセット250が最後に記録されたオフセットの場合）。                                                                                                                                              | `"false"`                                             |

### ターゲットテーブル {#target-tables}

ClickHouse Connect Sinkは、Kafkaトピックからメッセージを読み取り、それらを適切なテーブルに書き込みます。ClickHouse Connect Sinkは、既存のテーブルにデータを書き込みます。データを挿入する前に、ClickHouseに適切なスキーマを持つターゲットテーブルが作成されていることを確認してください。

各トピックには、ClickHouseに専用のターゲットテーブルが必要です。ターゲットテーブルの名前は、ソーストピックの名前と一致する必要があります。

### 前処理 {#pre-processing}

ClickHouse Kafka Connect Sinkにメッセージを送信する前に送信されるメッセージを変換する必要がある場合は、[Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html)を使用してください。

### サポートされるデータ型 {#supported-data-types}

**スキーマが宣言されている場合：**

| Kafka Connect Type                      | ClickHouse Type       | Supported | Primitive |
| --------------------------------------- |-----------------------| --------- | --------- |
| STRING                                  | String                | ✅        | はい       |
| INT8                                    | Int8                  | ✅        | はい       |
| INT16                                   | Int16                 | ✅        | はい       |
| INT32                                   | Int32                 | ✅        | はい       |
| INT64                                   | Int64                 | ✅        | はい       |
| FLOAT32                                 | Float32               | ✅        | はい       |
| FLOAT64                                 | Float64               | ✅        | はい       |
| BOOLEAN                                 | Boolean               | ✅        | はい       |
| ARRAY                                   | Array(T)              | ✅        | いいえ     |
| MAP                                     | Map(Primitive, T)     | ✅        | いいえ     |
| STRUCT                                  | Variant(T1, T2, …)    | ✅        | いいえ     |
| STRUCT                                  | Tuple(a T1, b T2, …)  | ✅        | いいえ     |
| STRUCT                                  | Nested(a T1, b T2, …) | ✅        | いいえ     |
| BYTES                                   | String                | ✅        | いいえ     |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64    | ✅        | いいえ     |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32        | ✅        | いいえ     |
| org.apache.kafka.connect.data.Decimal   | Decimal               | ✅        | いいえ     |

**スキーマが宣言されていない場合：**

レコードはJSONに変換され、[JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow)形式でClickHouseに送信されます。

### 設定レシピ {#configuration-recipes}

ここでは、迅速に開始するための一般的な設定レシピをいくつか示します。

#### 基本設定 {#basic-configuration}

開始するための最も基本的な設定 - Kafka Connectを分散モードで実行し、`localhost:8443`でSSLが有効になったClickHouseサーバーが実行されていることを前提とし、データはスキーマなしのJSONです。

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

#### 複数トピックに対応する基本設定 {#basic-configuration-with-multiple-topics}

コネクタは複数のトピックからデータを処理できます。

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

#### DLQを使用する基本設定 {#basic-configuration-with-dlq}

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

#### 異なるデータ形式との使用 {#using-with-different-data-formats}

##### Avroスキーマのサポート {#avro-schema-support}

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

##### Protobufスキーマのサポート {#protobuf-schema-support}

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

注意: クラスが見つからない問題が発生した場合、すべての環境がProtobufコンバータを含むわけではなく、依存関係がバンドルされた別のJARリリースが必要なことがあります。

##### JSONスキーマのサポート {#json-schema-support}

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

##### 文字列のサポート {#string-support}

コネクタは異なるClickHouse形式でString Converterをサポートしています: [JSON](/interfaces/formats#jsoneachrow), [CSV](/interfaces/formats#csv), および[TSV](/interfaces/formats#tabseparated)。

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

### ロギング {#logging}

ロギングはKafka Connect Platformによって自動的に提供されます。
ロギングの宛先と形式は、Kafka connectの[設定ファイル](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file)を介して設定できます。

Confluent Platformを使用している場合、CLIコマンドを実行してログを確認できます：

```bash
confluent local services connect log
```

詳細については、公式の[チュートリアル](https://docs.confluent.io/platform/current/connect/logging.html)を確認してください。

### モニタリング {#monitoring}

ClickHouse Kafka Connectは、[Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html)を介して実行時メトリクスを報告します。JMXは、Kafka Connectorでデフォルトで有効になっています。

ClickHouse Connect `MBeanName`:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connectは次のメトリックを報告します：

| 名前                  | タイプ | 説明                                                                                              |
|-----------------------|-------|--------------------------------------------------------------------------------------------------|
| `receivedRecords`      | long  | 受信したレコードの合計数。                                                                                     |
| `recordProcessingTime` | long  | レコードを統合構造にグループ化して変換するのにかかった合計時間（ナノ秒単位）。                                                      |
| `taskProcessingTime`   | long  | ClickHouseへのデータの処理と挿入にかかった合計時間（ナノ秒単位）。                                                                    |

### 制限事項 {#limitations}

- 削除はサポートされていません。
- バッチサイズはKafka Consumerのプロパティから継承されます。
- 完全に一度の使用時にKeeperMapのオフセットが変更または巻き戻された場合、特定のトピックのKeeperMapからコンテンツを削除する必要があります。（詳細については、以下のトラブルシューティングガイドを参照してください）

### パフォーマンスの調整 {#tuning-performance}

「Sinkコネクタのバッチサイズを調整したい」と考えたことがある場合は、このセクションが該当します。

##### Connect Fetch と Connector Poll {#connect-fetch-vs-connector-poll}

Kafka Connect（私たちのSinkコネクタが構築されているフレームワーク）は、バックグラウンドでKafkaトピックからメッセージを取得します（コネクタとは独立して）。

このプロセスは `fetch.min.bytes` および `fetch.max.bytes`を使用して制御できます - `fetch.min.bytes`は、フレームワークがコネクタに値を渡す前に必要な最小量を設定します（`fetch.max.wait.ms`で設定された時間制限まで）、`fetch.max.bytes`は上限サイズを設定します。コネクタにより大きなバッチを渡したい場合は、最小取得数または最大待機時間を増やして大きなデータバンドルを構築するオプションがあります。

取得したデータは、その後、メッセージをポーリングするコネクタクライアントによって消費されます。各ポーリングの数は `max.poll.records` によって制御されます - ただし、取得はポーリングとは独立していることに注意してください！

これらの設定を調整する際、ユーザーは自分の取得サイズが `max.poll.records` の複数バッチを生成することを目指すべきです（`fetch.min.bytes` および `fetch.max.bytes` は圧縮データを表します） - これにより、各コネクタタスクができるだけ大きなバッチを挿入します。

ClickHouseは、頻繁にだが小さなバッチよりも、わずかな遅延のある大きなバッチの方が最適化されています - バッチが大きいほど、より良い結果が得られます。

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

詳細については、[Confluentのドキュメント](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration)や[Kafkaのドキュメント](https://kafka.apache.org/documentation/#consumerconfigs)を参照してください。

#### 複数の高スループットトピック {#multiple-high-throughput-topics}

コネクタが複数のトピックにサブスクライブするように設定されている場合、`topics2TableMap`を使用してトピックをテーブルにマッピングし、挿入時にボトルネックが発生し、コンシューマ遅延が見られる場合は、トピックごとに1つのコネクタを作成することを検討してください。これは、現在バッチがすべてのテーブルに[直列](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100)で挿入されるために発生する主な理由です。 

トピックごとに1つのコネクタを作成することは、できるだけ早く挿入レートを得るための回避策です。

### トラブルシューティング {#troubleshooting}

#### "トピック `[someTopic]` パーティション `[0]` の状態不一致" {#state-mismatch-for-topic-sometopic-partition-0}

これは、KeeperMapに保存されたオフセットがKafkaに保存されたオフセットと異なる場合に発生します。通常、トピックが削除された場合やオフセットが手動で調整された場合です。
これを修正するには、そのトピック + パーティションに保存されている古い値を削除する必要があります。

**注意: この調整は完全に一度の影響があるかもしれません。**

#### "コネクタはどのエラーを再試行しますか？" {#what-errors-will-the-connector-retry}

現在、焦点は一時的で再試行可能なエラーを特定することにあります。以下を含みます：

- `ClickHouseException` - これはClickHouseによってスローされる一般的な例外です。
  通常、サーバーが過負荷のときにスローされ、以下のエラーコードが特に一時的と見なされます：
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
- `SocketTimeoutException` - ソケットタイムアウトが発生した場合にスローされます。
- `UnknownHostException` - ホストが解決できない場合にスローされます。
- `IOException` - ネットワークに問題が生じた場合にスローされます。

#### "私のデータはすべて空またはゼロです" {#all-my-data-is-blankzeroes}
データのフィールドがテーブルのフィールドと一致していない可能性があります - これは特にCDC（およびDebezium形式）で一般的です。
一般的な解決策の1つは、コネクタ設定にフラット変換を追加することです：

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

これにより、データがネストされたJSONからフラットなJSONに変換されます（`_`を区切り文字として使用）。テーブルのフィールドは「field1_field2_field3」形式（例: "before_id"、"after_id"など）になります。

#### "KafkaのキーをClickHouseで使用したい" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Kafkaのキーはデフォルトでは値フィールドに保存されませんが、`KeyToValue`変換を使用して、キーを値フィールドに移動することができます（新しい`_key`フィールド名の下で）：

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
