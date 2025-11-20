---
sidebar_label: 'ClickHouse Kafka Connect Sink'
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: 'ClickHouse の公式 Kafka コネクタ。'
title: 'ClickHouse Kafka Connect Sink'
doc_type: 'guide'
keywords: ['ClickHouse Kafka Connect Sink', 'Kafka connector ClickHouse', 'official ClickHouse connector', 'ClickHouse Kafka integration']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
サポートが必要な場合は、[リポジトリでissueを作成](https://github.com/ClickHouse/clickhouse-kafka-connect/issues)するか、[ClickHouse公式Slack](https://clickhouse.com/slack)で質問してください。
:::
**ClickHouse Kafka Connect Sink**は、KafkaトピックからClickHouseテーブルへデータを配信するKafkaコネクタです。

### ライセンス {#license}

Kafka Connector Sinkは[Apache 2.0ライセンス](https://www.apache.org/licenses/LICENSE-2.0)の下で配布されています。

### 環境要件 {#requirements-for-the-environment}

環境には[Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html)フレームワークv2.7以降がインストールされている必要があります。

### バージョン互換性マトリックス {#version-compatibility-matrix}

| ClickHouse Kafka Connectバージョン | ClickHouseバージョン | Kafka Connect | Confluentプラットフォーム |
| -------------------------------- | ------------------ | ------------- | ------------------ |
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1              |

### 主な機能 {#main-features}

- 標準でexactly-onceセマンティクスを提供。[KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976)という新しいClickHouseコア機能(コネクタによってステートストアとして使用)により実現され、シンプルなアーキテクチャを可能にします。
- サードパーティステートストアのサポート: 現在はデフォルトでインメモリですが、KeeperMapを使用可能(Redisは近日追加予定)。
- コア統合: ClickHouseによって構築、保守、サポートされています。
- [ClickHouse Cloud](https://clickhouse.com/cloud)に対して継続的にテストされています。
- 宣言されたスキーマを使用したデータ挿入とスキーマレス挿入に対応。
- ClickHouseの全データ型をサポート。

### インストール手順 {#installation-instructions}

#### 接続情報の収集 {#gather-your-connection-details}

<ConnectionDetails />

#### 一般的なインストール手順 {#general-installation-instructions}

コネクタは、プラグインの実行に必要なすべてのクラスファイルを含む単一のJARファイルとして配布されています。

プラグインをインストールするには、以下の手順に従ってください:

- ClickHouse Kafka Connect Sinkリポジトリの[Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)ページから、Connector JARファイルを含むzipアーカイブをダウンロードします。
- ZIPファイルの内容を展開し、任意の場所にコピーします。
- Connectプロパティファイルの[plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path)設定にプラグインディレクトリのパスを追加し、Confluentプラットフォームがプラグインを検出できるようにします。
- 設定ファイルにトピック名、ClickHouseインスタンスのホスト名、パスワードを指定します。

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

- Confluentプラットフォームを再起動します。
- Confluentプラットフォームを使用している場合は、Confluent Control Center UIにログインし、利用可能なコネクタのリストにClickHouse Sinkが表示されていることを確認します。

### 設定オプション {#configuration-options}

ClickHouse SinkをClickHouseサーバーに接続するには、以下を指定する必要があります:

- 接続情報: ホスト名(**必須**)とポート(オプション)
- ユーザー認証情報: パスワード(**必須**)とユーザー名(オプション)
- コネクタクラス: `com.clickhouse.kafka.connect.ClickHouseSinkConnector`(**必須**)
- topicsまたはtopics.regex: ポーリングするKafkaトピック - トピック名はテーブル名と一致する必要があります(**必須**)
- キーと値のコンバーター: トピック上のデータの型に基づいて設定します。ワーカー設定で既に定義されていない場合は必須です。

設定オプションの完全な一覧:


| プロパティ名                                    | 説明                                                                                                                                                                                                                        | デフォルト値                                            |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `hostname` (必須)                            | サーバーのホスト名またはIPアドレス                                                                                                                                                                                           | N/A                                                      |
| `port`                                           | ClickHouseポート - デフォルトは8443（クラウドのHTTPS用）ですが、HTTP（セルフホストのデフォルト）の場合は8123を指定する必要があります                                                                                                       | `8443`                                                   |
| `ssl`                                            | ClickHouseへのSSL接続を有効化                                                                                                                                                                                                | `true`                                                   |
| `jdbcConnectionProperties`                       | ClickHouseへの接続時の接続プロパティ。`?`で始まり、`param=value`の間を`&`で結合する必要があります                                                                                                                   | `""`                                                     |
| `username`                                       | ClickHouseデータベースのユーザー名                                                                                                                                                                                                       | `default`                                                |
| `password` (必須)                            | ClickHouseデータベースのパスワード                                                                                                                                                                                                       | N/A                                                      |
| `database`                                       | ClickHouseデータベース名                                                                                                                                                                                                           | `default`                                                |
| `connector.class` (必須)                     | コネクタクラス（明示的に設定し、デフォルト値として保持）                                                                                                                                                                        | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                      | コネクタタスクの数                                                                                                                                                                                                      | `"1"`                                                    |
| `errors.retry.timeout`                           | ClickHouse JDBCリトライタイムアウト                                                                                                                                                                                                      | `"60"`                                                   |
| `exactlyOnce`                                    | Exactly Onceの有効化                                                                                                                                                                                                               | `"false"`                                                |
| `topics` (必須)                              | ポーリングするKafkaトピック - トピック名はテーブル名と一致する必要があります                                                                                                                                                                      | `""`                                                     |
| `key.converter` (必須\* - 説明を参照)   | キーの型に応じて設定します。キーを渡す場合（かつワーカー設定で定義されていない場合）、ここで必須となります。                                                                                                                 | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (必須\* - 説明を参照) | トピック上のデータの型に基づいて設定します。サポート対象: JSON、String、AvroまたはProtobuf形式。ワーカー設定で定義されていない場合、ここで必須となります。                                                                                   | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                 | コネクタ値コンバータのスキーマサポート                                                                                                                                                                                           | `"false"`                                                |
| `errors.tolerance`                               | コネクタのエラー許容度。サポート対象: none、all                                                                                                                                                                                    | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`              | 設定された場合（errors.tolerance=allと併用）、失敗したバッチに対してDLQが使用されます（[トラブルシューティング](#troubleshooting)を参照）                                                                                                                | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable`  | DLQに追加のヘッダーを追加                                                                                                                                                                                                | `""`                                                     |
| `clickhouseSettings`                             | カンマ区切りのClickHouse設定リスト（例: "insert_quorum=2, etc..."）                                                                                                                                                                       | `""`                                                     |
| `topic2TableMap`                                 | トピック名をテーブル名にマッピングするカンマ区切りリスト（例: "topic1=table1, topic2=table2, etc..."）                                                                                                                            | `""`                                                     |
| `tableRefreshInterval`                           | テーブル定義キャッシュを更新する時間（秒単位）                                                                                                                                                                                            | `0`                                                      |
| `keeperOnCluster`                                | セルフホストインスタンスのON CLUSTERパラメータの設定を許可します（例: `ON CLUSTER clusterNameInConfigFileDefinition`）。exactly-onceのconnect_stateテーブル用（[分散DDLクエリ](/sql-reference/distributed-ddl)を参照）   | `""`                                                     |
| `bypassRowBinary`                                | スキーマベースのデータ（Avro、Protobufなど）に対するRowBinaryおよびRowBinaryWithDefaultsの使用を無効化できます - データに欠落列があり、NullableまたはDefaultが受け入れられない場合にのみ使用してください                          | `"false"`                                                |
| `dateTimeFormats`                                | DateTime64スキーマフィールドを解析するための日時形式。`;`で区切ります（例: `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）                                                              | `""`                                                     |
| `tolerateStateMismatch`                          | AFTER_PROCESSING後に保存された現在のオフセットよりも「前」のレコードをコネクタがドロップすることを許可します（例: オフセット5が送信され、オフセット250が最後に記録されたオフセットだった場合）                                                             | `"false"`                                                |
| `ignorePartitionsWhenBatching`                   | 挿入用のメッセージを収集する際にパーティションを無視します（ただし`exactlyOnce`が`false`の場合のみ）。パフォーマンスに関する注意: コネクタタスクが多いほど、タスクごとに割り当てられるKafkaパーティションが少なくなり、収穫逓減が発生する可能性があります | `"false"`                                                |

### ターゲットテーブル {#target-tables}


ClickHouse Connect SinkはKafkaトピックからメッセージを読み取り、適切なテーブルに書き込みます。ClickHouse Connect Sinkは既存のテーブルにデータを書き込みます。データの挿入を開始する前に、適切なスキーマを持つターゲットテーブルがClickHouseに作成されていることを確認してください。

各トピックには、ClickHouse内に専用のターゲットテーブルが必要です。ターゲットテーブル名はソーストピック名と一致する必要があります。

### 前処理 {#pre-processing}

ClickHouse Kafka Connect Sinkに送信される前にメッセージを変換する必要がある場合は、[Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html)を使用してください。

### サポートされるデータ型 {#supported-data-types}

**スキーマが宣言されている場合:**

| Kafka Connect型                         | ClickHouse型             | サポート  | プリミティブ |
| --------------------------------------- | ------------------------ | --------- | --------- |
| STRING                                  | String                   | ✅        | はい       |
| STRING                                  | JSON. 下記(1)参照        | ✅        | はい       |
| INT8                                    | Int8                     | ✅        | はい       |
| INT16                                   | Int16                    | ✅        | はい       |
| INT32                                   | Int32                    | ✅        | はい       |
| INT64                                   | Int64                    | ✅        | はい       |
| FLOAT32                                 | Float32                  | ✅        | はい       |
| FLOAT64                                 | Float64                  | ✅        | はい       |
| BOOLEAN                                 | Boolean                  | ✅        | はい       |
| ARRAY                                   | Array(T)                 | ✅        | いいえ        |
| MAP                                     | Map(Primitive, T)        | ✅        | いいえ        |
| STRUCT                                  | Variant(T1, T2, ...)     | ✅        | いいえ        |
| STRUCT                                  | Tuple(a T1, b T2, ...)   | ✅        | いいえ        |
| STRUCT                                  | Nested(a T1, b T2, ...)  | ✅        | いいえ        |
| STRUCT                                  | JSON. 下記(1), (2)参照   | ✅        | いいえ        |
| BYTES                                   | String                   | ✅        | いいえ        |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64       | ✅        | いいえ        |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32           | ✅        | いいえ        |
| org.apache.kafka.connect.data.Decimal   | Decimal                  | ✅        | いいえ        |

- (1) - JSONは、ClickHouse設定で`input_format_binary_read_json_as_string=1`が設定されている場合にのみサポートされます。これはRowBinaryフォーマットファミリーでのみ機能し、この設定は挿入リクエスト内のすべてのカラムに影響するため、すべて文字列である必要があります。この場合、コネクタはSTRUCTをJSON文字列に変換します。

- (2) - 構造体が`oneof`のようなユニオンを持つ場合、コンバータはフィールド名にプレフィックス/サフィックスを追加しないように設定する必要があります。[`ProtobufConverter`の設定](https://docs.confluent.io/platform/current/schema-registry/connect.html#protobuf)として`generate.index.for.unions=false`があります。

**スキーマが宣言されていない場合:**

レコードはJSONに変換され、[JSONEachRow](/interfaces/formats/JSONEachRow)フォーマットの値としてClickHouseに送信されます。

### 設定例 {#configuration-recipes}

以下は、すぐに開始できる一般的な設定例です。

#### 基本設定 {#basic-configuration}

最も基本的な設定です。Kafka Connectを分散モードで実行し、SSL有効化された`localhost:8443`でClickHouseサーバーが稼働しており、データがスキーマレスJSONであることを前提としています。

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

#### 複数トピックを使用した基本設定 {#basic-configuration-with-multiple-topics}

コネクタは複数のトピックからデータを消費できます


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

#### DLQを使用した基本設定 {#basic-configuration-with-dlq}

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

#### 異なるデータフォーマットでの使用 {#using-with-different-data-formats}

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

注意: クラスが見つからない問題が発生した場合、すべての環境にProtobufコンバーターが含まれているわけではないため、依存関係をバンドルした代替リリースのjarが必要になる場合があります。

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

このコネクターは、[JSON](/interfaces/formats/JSONEachRow)、[CSV](/interfaces/formats/CSV)、[TSV](/interfaces/formats/TabSeparated)といった異なるClickHouseフォーマットでString Converterをサポートしています。

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

### ログ記録 {#logging}

ログ記録はKafka Connect Platformによって自動的に提供されます。
ログの出力先とフォーマットは、Kafka Connectの[設定ファイル](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file)を通じて設定できます。

Confluent Platformを使用している場合、ログは次のCLIコマンドを実行することで確認できます:

```bash
confluent local services connect log
```

詳細については、公式の[チュートリアル](https://docs.confluent.io/platform/current/connect/logging.html)を参照してください。

### モニタリング {#monitoring}

ClickHouse Kafka Connectは、[Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html)を介してランタイムメトリクスを報告します。JMXはKafka Connectorでデフォルトで有効になっています。

#### ClickHouse固有のメトリクス {#clickhouse-specific-metrics}

このコネクターは、次のMBean名を介してカスタムメトリクスを公開します:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

| メトリクス名            | 型 | 説明                                                                             |
| ---------------------- | ---- | --------------------------------------------------------------------------------------- |
| `receivedRecords`      | long | 受信したレコードの総数。                                                   |
| `recordProcessingTime` | long | レコードをグループ化し、統一された構造に変換するために費やされた合計時間(ナノ秒単位)。 |
| `taskProcessingTime`   | long | データを処理してClickHouseに挿入するために費やされた合計時間(ナノ秒単位)。          |

#### Kafka Producer/Consumerメトリクス {#kafka-producer-consumer-metrics}

このコネクターは、データフロー、スループット、パフォーマンスに関する洞察を提供する標準的なKafka ProducerおよびConsumerメトリクスを公開します。

**トピックレベルのメトリクス:**

- `records-sent-total`: トピックに送信されたレコードの総数
- `bytes-sent-total`: トピックに送信された総バイト数
- `record-send-rate`: 1秒あたりに送信されたレコードの平均レート
- `byte-rate`: 1秒あたりに送信された平均バイト数
- `compression-rate`: 達成された圧縮率


**パーティションレベルのメトリクス:**

- `records-sent-total`: パーティションに送信されたレコードの合計数
- `bytes-sent-total`: パーティションに送信されたバイトの合計数
- `records-lag`: パーティションの現在のラグ
- `records-lead`: パーティションの現在のリード
- `replica-fetch-lag`: レプリカのラグ情報

**ノードレベルの接続メトリクス:**

- `connection-creation-total`: Kafkaノードへの接続作成数の合計
- `connection-close-total`: クローズされた接続の合計数
- `request-total`: ノードに送信されたリクエストの合計数
- `response-total`: ノードから受信したレスポンスの合計数
- `request-rate`: 1秒あたりの平均リクエスト率
- `response-rate`: 1秒あたりの平均レスポンス率

これらのメトリクスは以下の監視に役立ちます:

- **スループット**: データ取り込み率の追跡
- **ラグ**: ボトルネックと処理遅延の特定
- **圧縮**: データ圧縮効率の測定
- **接続の健全性**: ネットワーク接続性と安定性の監視

#### Kafka Connectフレームワークメトリクス {#kafka-connect-framework-metrics}

このコネクタはKafka Connectフレームワークと統合され、タスクのライフサイクルとエラー追跡のためのメトリクスを公開します。

**タスクステータスメトリクス:**

- `task-count`: コネクタ内のタスクの合計数
- `running-task-count`: 現在実行中のタスク数
- `paused-task-count`: 現在一時停止中のタスク数
- `failed-task-count`: 失敗したタスク数
- `destroyed-task-count`: 破棄されたタスク数
- `unassigned-task-count`: 未割り当てのタスク数

タスクステータスの値には以下が含まれます: `running`、`paused`、`failed`、`destroyed`、`unassigned`

**エラーメトリクス:**

- `deadletterqueue-produce-failures`: 失敗したDLQ書き込み数
- `deadletterqueue-produce-requests`: DLQ書き込み試行の合計数
- `last-error-timestamp`: 最後のエラーのタイムスタンプ
- `records-skip-total`: エラーによりスキップされたレコードの合計数
- `records-retry-total`: リトライされたレコードの合計数
- `errors-total`: 発生したエラーの合計数

**パフォーマンスメトリクス:**

- `offset-commit-failures`: 失敗したオフセットコミット数
- `offset-commit-avg-time-ms`: オフセットコミットの平均時間
- `offset-commit-max-time-ms`: オフセットコミットの最大時間
- `put-batch-avg-time-ms`: バッチ処理の平均時間
- `put-batch-max-time-ms`: バッチ処理の最大時間
- `source-record-poll-total`: ポーリングされたレコードの合計数

#### 監視のベストプラクティス {#monitoring-best-practices}

1. **コンシューマラグの監視**: パーティションごとに`records-lag`を追跡し、処理のボトルネックを特定します
2. **エラー率の追跡**: `errors-total`と`records-skip-total`を監視し、データ品質の問題を検出します
3. **タスクの健全性の確認**: タスクステータスメトリクスを監視し、タスクが正常に実行されていることを確認します
4. **スループットの測定**: `records-send-rate`と`byte-rate`を使用して取り込みパフォーマンスを追跡します
5. **接続の健全性の監視**: ノードレベルの接続メトリクスをチェックし、ネットワークの問題を確認します
6. **圧縮効率の追跡**: `compression-rate`を使用してデータ転送を最適化します

詳細なJMXメトリクス定義とPrometheus統合については、[jmx-export-connector.yml](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/jmx-export-connector.yml)設定ファイルを参照してください。

### 制限事項 {#limitations}

- 削除はサポートされていません。
- バッチサイズはKafka Consumerプロパティから継承されます。
- exactly-onceのためにKeeperMapを使用している場合、オフセットが変更または巻き戻された際には、その特定のトピックに対してKeeperMapからコンテンツを削除する必要があります。(詳細については以下のトラブルシューティングガイドを参照してください)

### パフォーマンスチューニングとスループット最適化 {#tuning-performance}

このセクションでは、ClickHouse Kafka Connect Sinkのパフォーマンスチューニング戦略について説明します。パフォーマンスチューニングは、高スループットのユースケースに対処する場合や、リソース使用率を最適化してラグを最小化する必要がある場合に不可欠です。

#### パフォーマンスチューニングが必要なのはいつか? {#when-is-performance-tuning-needed}

パフォーマンスチューニングは通常、以下のシナリオで必要となります:

- **高スループットワークロード**: Kafkaトピックから毎秒数百万のイベントを処理する場合
- **コンシューマラグ**: コネクタがデータ生成速度に追いつけず、ラグが増加している場合
- **リソース制約**: CPU、メモリ、またはネットワーク使用率を最適化する必要がある場合
- **複数トピック**: 複数の大容量トピックから同時に消費する場合
- **小さなメッセージサイズ**: サーバーサイドバッチ処理の恩恵を受ける多数の小さなメッセージを扱う場合

パフォーマンスチューニングは通常、以下の場合には**必要ありません**:

- 低から中程度のボリューム(毎秒10,000メッセージ未満)を処理している場合
- コンシューマラグが安定しており、ユースケースにとって許容範囲内である場合
- デフォルトのコネクタ設定がすでにスループット要件を満たしている場合
- ClickHouseクラスタが受信負荷を容易に処理できる場合


#### データフローの理解 {#understanding-the-data-flow}

チューニングを行う前に、コネクタを通じてデータがどのように流れるかを理解することが重要です:

1. **Kafka Connect Framework** がバックグラウンドでKafkaトピックからメッセージを取得
2. **コネクタがポーリング** を実行し、フレームワークの内部バッファからメッセージを取得
3. **コネクタがバッチ処理** を実行し、ポーリングサイズに基づいてメッセージをまとめる
4. **ClickHouseが受信** し、HTTP/S経由でバッチ化された挿入を受け取る
5. **ClickHouseが処理** を実行し、挿入を実行(同期または非同期)

これらの各段階でパフォーマンスを最適化できます。

#### Kafka Connectバッチサイズのチューニング {#connect-fetch-vs-connector-poll}

最初の最適化レベルは、コネクタがKafkaから1バッチあたりに受信するデータ量を制御することです。

##### フェッチ設定 {#fetch-settings}

Kafka Connect(フレームワーク)は、コネクタとは独立してバックグラウンドでKafkaトピックからメッセージを取得します:

- **`fetch.min.bytes`**: フレームワークがコネクタに値を渡す前の最小データ量(デフォルト: 1バイト)
- **`fetch.max.bytes`**: 単一リクエストで取得する最大データ量(デフォルト: 52428800 / 50 MB)
- **`fetch.max.wait.ms`**: `fetch.min.bytes`が満たされない場合にデータを返すまでの最大待機時間(デフォルト: 500ミリ秒)

##### ポーリング設定 {#poll-settings}

コネクタはフレームワークのバッファからメッセージをポーリングします:

- **`max.poll.records`**: 単一ポーリングで返される最大レコード数(デフォルト: 500)
- **`max.partition.fetch.bytes`**: パーティションあたりの最大データ量(デフォルト: 1048576 / 1 MB)

##### 高スループット向けの推奨設定 {#recommended-batch-settings}

ClickHouseで最適なパフォーマンスを得るには、より大きなバッチを目指してください:


```properties
# ポーリングごとのレコード数を増やす
consumer.max.poll.records=5000
```


# パーティションのフェッチサイズを増やす（5 MB）
consumer.max.partition.fetch.bytes=5242880



# 任意: より多くのデータを受信するまで待つように最小フェッチサイズを増やす (1 MB)
consumer.fetch.min.bytes=1048576



# オプション: レイテンシが重要な場合は待機時間を短縮

consumer.fetch.max.wait.ms=300

````

**重要**: Kafka Connectのフェッチ設定は圧縮データを表しますが、ClickHouseは非圧縮データを受信します。圧縮率に基づいてこれらの設定のバランスを調整してください。

**トレードオフ**:
- **大きなバッチ** = ClickHouseの取り込みパフォーマンスの向上、パート数の削減、オーバーヘッドの低減
- **大きなバッチ** = メモリ使用量の増加、エンドツーエンドレイテンシの増加の可能性
- **過度に大きなバッチ** = タイムアウト、OutOfMemoryエラー、または`max.poll.interval.ms`超過のリスク

詳細: [Confluentドキュメント](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration) | [Kafkaドキュメント](https://kafka.apache.org/documentation/#consumerconfigs)

#### 非同期インサート {#asynchronous-inserts}

非同期インサートは、コネクタが比較的小さなバッチを送信する場合や、バッチ処理の責任をClickHouseに移すことで取り込みをさらに最適化したい場合に有効な強力な機能です。

##### 非同期インサートを使用するタイミング {#when-to-use-async-inserts}

次の場合に非同期インサートの有効化を検討してください:

- **多数の小さなバッチ**: コネクタが頻繁に小さなバッチ（バッチあたり1000行未満）を送信する
- **高い同時実行性**: 複数のコネクタタスクが同じテーブルに書き込んでいる
- **分散デプロイメント**: 異なるホスト間で多数のコネクタインスタンスを実行している
- **パート作成のオーバーヘッド**: 「パートが多すぎる」エラーが発生している
- **混合ワークロード**: リアルタイム取り込みとクエリワークロードを組み合わせている

次の場合は非同期インサートを使用**しないでください**:

- 制御された頻度で既に大きなバッチ（バッチあたり10,000行超）を送信している
- 即座のデータ可視性が必要（クエリがデータを即座に参照する必要がある）
- `wait_for_async_insert=0`によるexactly-onceセマンティクスが要件と競合する
- ユースケースがクライアント側のバッチ処理改善から恩恵を受けられる

##### 非同期インサートの仕組み {#how-async-inserts-work}

非同期インサートが有効な場合、ClickHouseは次のように動作します:

1. コネクタからインサートクエリを受信
2. データをインメモリバッファに書き込む（ディスクへの即座の書き込みではなく）
3. コネクタに成功を返す（`wait_for_async_insert=0`の場合）
4. 次のいずれかの条件が満たされたときにバッファをディスクにフラッシュ:
   - バッファが`async_insert_max_data_size`に達する（デフォルト: 10 MB）
   - 最初のインサートから`async_insert_busy_timeout_ms`ミリ秒が経過（デフォルト: 1000 ms）
   - 蓄積されたクエリの最大数（`async_insert_max_query_number`、デフォルト: 100）

これにより、作成されるパート数が大幅に削減され、全体的なスループットが向上します。

##### 非同期インサートの有効化 {#enabling-async-inserts}

`clickhouseSettings`設定パラメータに非同期インサート設定を追加します:

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
````

**主要な設定**:

- **`async_insert=1`**: 非同期インサートを有効化
- **`wait_for_async_insert=1`**（推奨）: コネクタは確認応答する前にデータがClickHouseストレージにフラッシュされるまで待機します。配信保証を提供します。
- **`wait_for_async_insert=0`**: コネクタはバッファリング後すぐに確認応答します。パフォーマンスは向上しますが、フラッシュ前にサーバーがクラッシュするとデータが失われる可能性があります。

##### 非同期インサート動作のチューニング {#tuning-async-inserts}

非同期インサートのフラッシュ動作を細かく調整できます:

```json
"clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=10485760,async_insert_busy_timeout_ms=1000"
```

一般的なチューニングパラメータ:

- **`async_insert_max_data_size`**（デフォルト: 10485760 / 10 MB）: フラッシュ前の最大バッファサイズ
- **`async_insert_busy_timeout_ms`**（デフォルト: 1000）: フラッシュ前の最大時間（ミリ秒）
- **`async_insert_stale_timeout_ms`**（デフォルト: 0）: フラッシュ前の最後のインサートからの時間（ミリ秒）
- **`async_insert_max_query_number`**（デフォルト: 100）: フラッシュ前の最大クエリ数

**トレードオフ**:

- **利点**: パート数の削減、マージパフォーマンスの向上、CPUオーバーヘッドの低減、高い同時実行性下でのスループット向上
- **考慮事項**: データが即座にクエリ可能にならない、エンドツーエンドレイテンシのわずかな増加
- **リスク**: `wait_for_async_insert=0`の場合のサーバークラッシュ時のデータ損失、大きなバッファによるメモリ圧迫の可能性

##### exactly-onceセマンティクスを持つ非同期インサート {#async-inserts-with-exactly-once}

非同期インサートで`exactlyOnce=true`を使用する場合:


```json
{
  "config": {
    "exactlyOnce": "true",
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```

**重要**: exactly-once を使用する場合は、必ず `wait_for_async_insert=1` を設定してください。これにより、データが永続化された後にのみオフセットコミットが行われることが保証されます。

非同期インサートの詳細については、[ClickHouse 非同期インサートのドキュメント](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)を参照してください。

#### コネクタの並列性 {#connector-parallelism}

スループットを向上させるために並列性を高めます:

##### コネクタあたりのタスク数 {#tasks-per-connector}

```json
"tasks.max": "4"
```

各タスクはトピックパーティションのサブセットを処理します。タスク数が多いほど並列性が高まりますが、以下の点に注意してください:

- 有効なタスクの最大数 = トピックパーティション数
- 各タスクは ClickHouse への独自の接続を維持します
- タスク数が多いほどオーバーヘッドが増加し、リソース競合の可能性が高まります

**推奨事項**: まず `tasks.max` をトピックパーティション数と同じ値に設定し、その後 CPU とスループットのメトリクスに基づいて調整してください。

##### バッチ処理時のパーティション無視 {#ignoring-partitions}

デフォルトでは、コネクタはパーティションごとにメッセージをバッチ処理します。より高いスループットを得るには、パーティションをまたいでバッチ処理することができます:

```json
"ignorePartitionsWhenBatching": "true"
```

**警告**: `exactlyOnce=false` の場合のみ使用してください。この設定により、より大きなバッチを作成してスループットを向上させることができますが、パーティションごとの順序保証が失われます。

#### 複数の高スループットトピック {#multiple-high-throughput-topics}

コネクタが複数のトピックをサブスクライブするように設定されており、`topic2TableMap` を使用してトピックをテーブルにマッピングしている場合で、挿入時のボトルネックによりコンシューマラグが発生している場合は、トピックごとに 1 つのコネクタを作成することを検討してください。

これが発生する主な理由は、現在バッチが各テーブルに[順次](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100)挿入されるためです。

**推奨事項**: 複数の大容量トピックの場合、並列挿入スループットを最大化するために、トピックごとに 1 つのコネクタインスタンスをデプロイしてください。

#### ClickHouse テーブルエンジンの考慮事項 {#table-engine-considerations}

ユースケースに適した ClickHouse テーブルエンジンを選択してください:

- **`MergeTree`**: ほとんどのユースケースに最適で、クエリと挿入のパフォーマンスのバランスが取れています
- **`ReplicatedMergeTree`**: 高可用性に必要ですが、レプリケーションのオーバーヘッドが追加されます
- **適切な `ORDER BY` を持つ `*MergeTree`**: クエリパターンに合わせて最適化します

**考慮すべき設定**:

```sql
CREATE TABLE my_table (...)
ENGINE = MergeTree()
ORDER BY (timestamp, id)
SETTINGS
    -- 並列パート書き込みのために最大挿入スレッド数を増やす
    max_insert_threads = 4,
    -- 信頼性のためにクォーラムでの挿入を許可する（ReplicatedMergeTree）
    insert_quorum = 2
```

コネクタレベルの挿入設定の場合:

```json
"clickhouseSettings": "insert_quorum=2,insert_quorum_timeout=60000"
```

#### 接続プーリングとタイムアウト {#connection-pooling}

コネクタは ClickHouse への HTTP 接続を維持します。高レイテンシネットワークの場合はタイムアウトを調整してください:

```json
"clickhouseSettings": "socket_timeout=300000,connection_timeout=30000"
```

- **`socket_timeout`**（デフォルト: 30000 ミリ秒）: 読み取り操作の最大時間
- **`connection_timeout`**（デフォルト: 10000 ミリ秒）: 接続確立の最大時間

大きなバッチでタイムアウトエラーが発生する場合は、これらの値を増やしてください。

#### パフォーマンスの監視とトラブルシューティング {#monitoring-performance}

以下の主要なメトリクスを監視してください:

1. **コンシューマラグ**: Kafka 監視ツールを使用してパーティションごとのラグを追跡します
2. **コネクタメトリクス**: JMX 経由で `receivedRecords`、`recordProcessingTime`、`taskProcessingTime` を監視します（[監視](#monitoring)を参照）
3. **ClickHouse メトリクス**:
   - `system.asynchronous_inserts`: 非同期インサートバッファの使用状況を監視します
   - `system.parts`: マージの問題を検出するためにパート数を監視します
   - `system.merges`: アクティブなマージを監視します
   - `system.events`: `InsertedRows`、`InsertedBytes`、`FailedInsertQuery` を追跡します

**一般的なパフォーマンスの問題**:


| 症状                 | 考えられる原因                 | 解決策                                                    |
| ----------------------- | ------------------------------ | ----------------------------------------------------------- |
| コンシューマラグが大きい       | バッチが小さすぎる              | `max.poll.records`を増やす、非同期挿入を有効化           |
| "Too many parts"エラー | 小さな挿入が頻繁に発生         | 非同期挿入を有効化、バッチサイズを増やす                   |
| タイムアウトエラー          | バッチサイズが大きい、ネットワークが遅い | バッチサイズを減らす、`socket_timeout`を増やす、ネットワークを確認 |
| CPU使用率が高い          | 小さなパーツが多すぎる           | 非同期挿入を有効化、マージ設定を増やす               |
| OutOfMemoryエラー      | バッチサイズが大きすぎる           | `max.poll.records`、`max.partition.fetch.bytes`を減らす      |
| タスク負荷が不均等        | パーティション分散が不均等  | パーティションを再バランスするか`tasks.max`を調整                  |

#### ベストプラクティスのまとめ {#performance-best-practices}

1. **デフォルト設定から始める**。その後、実際のパフォーマンスに基づいて測定し調整する
2. **大きなバッチを優先する**: 可能な限り1回の挿入で10,000〜100,000行を目指す
3. **非同期挿入を使用する**: 多数の小さなバッチを送信する場合や高い同時実行性がある場合
4. **Exactly-onceセマンティクスでは常に`wait_for_async_insert=1`を使用する**
5. **水平スケーリング**: `tasks.max`をパーティション数まで増やす
6. **高ボリュームトピックごとに1つのコネクタ**を使用して最大スループットを実現
7. **継続的に監視する**: コンシューマラグ、パーツ数、マージアクティビティを追跡
8. **徹底的にテストする**: 本番環境へのデプロイ前に、現実的な負荷下で設定変更を必ずテストする

#### 例: 高スループット構成 {#example-high-throughput}

以下は高スループット向けに最適化された完全な例です:

```json
{
  "name": "clickhouse-high-throughput",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    "tasks.max": "8",

    "topics": "high_volume_topic",
    "hostname": "my-clickhouse-host.cloud",
    "port": "8443",
    "database": "default",
    "username": "default",
    "password": "<PASSWORD>",
    "ssl": "true",

    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "false",

    "exactlyOnce": "false",
    "ignorePartitionsWhenBatching": "true",

    "consumer.max.poll.records": "10000",
    "consumer.max.partition.fetch.bytes": "5242880",
    "consumer.fetch.min.bytes": "1048576",
    "consumer.fetch.max.wait.ms": "500",

    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=16777216,async_insert_busy_timeout_ms=1000,socket_timeout=300000"
  }
}
```

**この構成の特徴**:

- ポーリングごとに最大10,000レコードを処理
- より大きな挿入のためにパーティション間でバッチ処理
- 16 MBバッファで非同期挿入を使用
- 8つの並列タスクを実行(パーティション数に合わせる)
- 厳密な順序よりもスループットを優先して最適化

### トラブルシューティング {#troubleshooting}

#### "State mismatch for topic `[someTopic]` partition `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

これは、KeeperMapに保存されているオフセットがKafkaに保存されているオフセットと異なる場合に発生します。通常、トピックが削除されたか、オフセットが手動で調整された場合に起こります。
これを修正するには、指定されたトピック+パーティションに保存されている古い値を削除する必要があります。

**注意: この調整はExactly-onceセマンティクスに影響を与える可能性があります。**

#### "What errors will the connector retry?" {#what-errors-will-the-connector-retry}

現在は、一時的でリトライ可能なエラーの特定に焦点を当てています。以下が含まれます:

- `ClickHouseException` - これはClickHouseによってスローされる汎用的な例外です。
  通常、サーバーが過負荷状態のときにスローされ、以下のエラーコードは特に一時的なものと見なされます:
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
- `IOException` - ネットワークに問題があるときにスローされます。


#### "すべてのデータが空白/ゼロになる" {#all-my-data-is-blankzeroes}

データ内のフィールドがテーブル内のフィールドと一致していない可能性があります。これはCDC（およびDebezium形式）で特によく見られる問題です。
一般的な解決策として、コネクタ設定にflatten変換を追加する方法があります:

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

これにより、データはネストされたJSONからフラット化されたJSON（`_`を区切り文字として使用）に変換されます。テーブル内のフィールドは「field1_field2_field3」形式（例:「before_id」、「after_id」など）に従います。

#### "ClickHouseでKafkaキーを使用したい" {#i-want-to-use-my-kafka-keys-in-clickhouse}

Kafkaキーはデフォルトでは値フィールドに格納されませんが、`KeyToValue`変換を使用してキーを値フィールド（新しい`_key`フィールド名の下）に移動できます:

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
