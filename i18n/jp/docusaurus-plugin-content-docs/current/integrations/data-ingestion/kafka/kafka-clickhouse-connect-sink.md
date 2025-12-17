---
sidebar_label: 'ClickHouse Kafka Connect Sink'
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: 'ClickHouse 公式の Kafka コネクタです。'
title: 'ClickHouse Kafka Connect Sink'
doc_type: 'guide'
keywords: ['ClickHouse Kafka Connect Sink', 'ClickHouse 用 Kafka コネクタ', '公式 ClickHouse コネクタ', 'ClickHouse Kafka 連携']
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# ClickHouse Kafka Connect Sink {#clickhouse-kafka-connect-sink}

:::note
サポートが必要な場合は、[リポジトリで issue を作成](https://github.com/ClickHouse/clickhouse-kafka-connect/issues)するか、[ClickHouse public Slack](https://clickhouse.com/slack) で質問してください。
:::
**ClickHouse Kafka Connect Sink** は、Kafka トピックから ClickHouse テーブルへデータを配信する Kafka コネクタです。

### ライセンス {#license}

Kafka Connector Sink は [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0) の下で配布されています。

### 環境要件 {#requirements-for-the-environment}

[Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) フレームワーク v2.7 以降が環境にインストールされている必要があります。

### バージョン互換性マトリクス {#version-compatibility-matrix}

| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
| -------------------------------- | ------------------ | ------------- | ------------------ |
| 1.0.0                            | &gt; 23.3          | &gt; 2.7      | &gt; 6.1           |

### 主な機能 {#main-features}

* 標準で厳密な exactly-once セマンティクスを提供します。これは、新しい ClickHouse コア機能である [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976)（コネクタのステートストアとして使用）によって実現されており、ミニマルなアーキテクチャを可能にします。
* サードパーティ製ステートストアのサポート: 現在はデフォルトでインメモリストアを使用しますが、KeeperMap も利用可能です（Redis は今後追加予定）。
* コア統合コンポーネント: ClickHouse によってビルド・保守・サポートされています。
* [ClickHouse Cloud](https://clickhouse.com/cloud) に対して継続的にテストされています。
* 宣言されたスキーマあり／スキーマレスのどちらの場合でもデータ挿入をサポートします。
* ClickHouse のすべてのデータ型をサポートします。

### インストール手順 {#installation-instructions}

#### 接続情報を取得する {#gather-your-connection-details}

<ConnectionDetails />

#### 一般的なインストール手順 {#general-installation-instructions}

このコネクタは、プラグインの実行に必要なすべてのクラスファイルを含む単一の JAR ファイルとして配布されています。

プラグインをインストールするには、次の手順に従ってください。

* ClickHouse Kafka Connect Sink リポジトリの [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) ページから、Connector JAR ファイルを含む zip アーカイブをダウンロードします。
* ZIP ファイルの内容を展開し、任意の場所にコピーします。
* Confluent Platform がプラグインを検出できるように、プラグインディレクトリのパスを Connect プロパティファイル内の [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) 設定に追加します。
* 設定で、トピック名、ClickHouse インスタンスのホスト名、およびパスワードを指定します。

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

* Confluent Platform を再起動します。
* Confluent Platform を使用している場合は、Confluent Control Center UI にログインし、利用可能なコネクタ一覧に ClickHouse Sink が表示されていることを確認します。

### 設定オプション {#configuration-options}

ClickHouse Sink を ClickHouse サーバーに接続するには、次の情報を指定する必要があります。

* 接続情報: ホスト名（**必須**）とポート（任意）
* ユーザー認証情報: パスワード（**必須**）とユーザー名（任意）
* コネクタクラス: `com.clickhouse.kafka.connect.ClickHouseSinkConnector`（**必須**）
* topics または topics.regex: ポーリングする Kafka トピック。トピック名はテーブル名と一致している必要があります（**必須**）
* キーおよび値コンバーター: トピック上のデータ種別に基づいて設定します。ワーカー設定で既に定義されていない場合は必須です。

設定オプションの完全な一覧表:

| Property Name                                   | Description                                                                                                                                                                                                                        | Default Value                                            |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `hostname` (Required)                           | サーバーのホスト名または IP アドレス                                                                                                                                                                                               | N/A                                                      |
| `port`                                          | ClickHouse のポート。デフォルトは 8443（クラウドでの HTTPS 用）ですが、HTTP（セルフホスト時のデフォルト）の場合は 8123 を指定する必要がある                                                                                       | `8443`                                                   |
| `ssl`                                           | ClickHouse への SSL 接続を有効にするかどうか                                                                                                                                                                                      | `true`                                                   |
| `jdbcConnectionProperties`                      | ClickHouse に接続する際の接続プロパティ。`?` で開始し、`param=value` を `&` で連結する必要がある                                                                                                                                  | `""`                                                     |
| `username`                                      | ClickHouse データベースのユーザー名                                                                                                                                                                                               | `default`                                                |
| `password` (Required)                           | ClickHouse データベースのパスワード                                                                                                                                                                                               | N/A                                                      |
| `database`                                      | ClickHouse データベース名                                                                                                                                                                                                         | `default`                                                |
| `connector.class` (Required)                    | Connector クラス（明示的に設定し、デフォルト値のままにしておくこと）                                                                                                                                                              | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                     | Connector Task の最大数                                                                                                                                                                                                           | `"1"`                                                    |
| `errors.retry.timeout`                          | ClickHouse JDBC のリトライタイムアウト                                                                                                                                                                                            | `"60"`                                                   |
| `exactlyOnce`                                   | Exactly Once（正確に 1 回）処理の有効化フラグ                                                                                                                                                                                     | `"false"`                                                |
| `topics` (Required)                             | ポーリングする Kafka トピック。トピック名はテーブル名と一致している必要がある                                                                                                                                                    | `""`                                                     |
| `key.converter` (Required* - See Description)   | キーの型に応じて設定する。キーを渡す場合（かつ worker 設定で定義されていない場合）に必須。                                                                                                                                        | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Required* - See Description) | トピック上のデータ型に基づいて設定する。サポートされる形式: JSON、String、Avro、Protobuf。worker 設定で定義されていない場合はここで必須。                                                                                        | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                | Connector の Value Converter によるスキーマサポートを有効にするかどうか                                                                                                                                                           | `"false"`                                                |
| `errors.tolerance`                              | Connector のエラー許容度。サポートされる値: none, all                                                                                                                                                                             | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`             | 設定されている場合（かつ errors.tolerance=all のとき）、失敗したバッチに対して DLQ が使用される（[Troubleshooting](#troubleshooting) を参照）                                                                                     | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable` | DLQ に追加のヘッダーを付与する                                                                                                                                                                                                    | `""`                                                     |
| `clickhouseSettings`                            | ClickHouse の設定をカンマ区切りで指定（例: "insert_quorum=2, etc..."）                                                                                                                                                            | `""`                                                     |
| `topic2TableMap`                                | トピック名をテーブル名にマッピングするリストをカンマ区切りで指定（例: "topic1=table1, topic2=table2, etc..."）                                                                                                                    | `""`                                                     |
| `tableRefreshInterval`                          | テーブル定義キャッシュをリフレッシュする間隔（秒）                                                                                                                                                                                | `0`                                                      |
| `keeperOnCluster`                               | セルフホスト環境向けに、exactly-once 用 connect_state テーブルに対する ON CLUSTER パラメータを設定可能にする（例: `ON CLUSTER clusterNameInConfigFileDefinition`。 [Distributed DDL Queries](/sql-reference/distributed-ddl) を参照） | `""`                                                     |
| `bypassRowBinary`                               | スキーマベースのデータ（Avro、Protobuf など）に対して RowBinary および RowBinaryWithDefaults の使用を無効化できる。データに欠損カラムがあり、Nullable/Default が許容できない場合にのみ使用すること                             | `"false"`                                                |
| `dateTimeFormats`                               | DateTime64 スキーマフィールドをパースするための日時フォーマット。`;` 区切りで指定する（例: `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                                              | `""`                                                     |
| `tolerateStateMismatch`                         | AFTER_PROCESSING に保存されている現在のオフセットよりも「前」のレコードを connector が破棄することを許可する（例: オフセット 250 が最後に記録されたオフセットである状態で、オフセット 5 が送信された場合など）                  | `"false"`                                                |
| `ignorePartitionsWhenBatching`                  | insert 用にメッセージを収集する際にパーティションを無視する（ただし `exactlyOnce` が `false` の場合のみ）。パフォーマンス上の注意: Connector Task が多いほど、1 Task あたりに割り当てられる Kafka パーティションは少なくなり、効果が逓減しうる。 | `"false"`                                                |

### 対象テーブル {#target-tables}

ClickHouse Connect Sink は Kafka のトピックからメッセージを読み取り、適切なテーブルに書き込みます。ClickHouse Connect Sink が書き込むのは既存のテーブルのみです。データの挿入を開始する前に、対象テーブルが ClickHouse 上に適切なスキーマで作成済みであることを必ず確認してください。

各トピックごとに、ClickHouse 上に専用の対象テーブルが必要です。対象テーブル名は、元のトピック名と一致している必要があります。

### 前処理 {#pre-processing}

ClickHouse Kafka Connect Sink に送信される前に送信メッセージを変換する必要がある場合は、[Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html) を使用してください。

### サポートされるデータ型 {#supported-data-types}

**スキーマを宣言している場合:**

| Kafka Connect Type                      | ClickHouse Type          | Supported | Primitive |
| --------------------------------------- | ------------------------ | --------- | --------- |
| STRING                                  | String                   | ✅         | Yes       |
| STRING                                  | JSON. See below (1)      | ✅         | Yes       |
| INT8                                    | Int8                     | ✅         | Yes       |
| INT16                                   | Int16                    | ✅         | Yes       |
| INT32                                   | Int32                    | ✅         | Yes       |
| INT64                                   | Int64                    | ✅         | Yes       |
| FLOAT32                                 | Float32                  | ✅         | Yes       |
| FLOAT64                                 | Float64                  | ✅         | Yes       |
| BOOLEAN                                 | Boolean                  | ✅         | Yes       |
| ARRAY                                   | Array(T)                 | ✅         | No        |
| MAP                                     | Map(Primitive, T)        | ✅         | No        |
| STRUCT                                  | Variant(T1, T2, ...)     | ✅         | No        |
| STRUCT                                  | Tuple(a T1, b T2, ...)   | ✅         | No        |
| STRUCT                                  | Nested(a T1, b T2, ...)  | ✅         | No        |
| STRUCT                                  | JSON. See below (1), (2) | ✅         | No        |
| BYTES                                   | String                   | ✅         | No        |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64       | ✅         | No        |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32           | ✅         | No        |
| org.apache.kafka.connect.data.Decimal   | Decimal                  | ✅         | No        |

* (1) - JSON がサポートされるのは、ClickHouse の設定で `input_format_binary_read_json_as_string=1` が有効になっている場合のみです。これは RowBinary フォーマットファミリーでのみ動作し、この設定は挿入リクエスト内のすべてのカラムに影響するため、すべて文字列型である必要があります。この場合、コネクタは STRUCT を JSON 文字列に変換します。

* (2) - 構造体に `oneof` のような union が含まれている場合、コンバータはフィールド名にプレフィックス/サフィックスを追加しないように設定する必要があります。`ProtobufConverter` には `generate.index.for.unions=false` という [設定](https://docs.confluent.io/platform/current/schema-registry/connect.html#protobuf) があります。

**スキーマを宣言していない場合:**

レコードは JSON に変換され、[JSONEachRow](/interfaces/formats/JSONEachRow) フォーマットの値として ClickHouse に送信されます。

### 設定レシピ {#configuration-recipes}

すぐに使い始めるための、一般的な設定レシピをいくつか示します。

#### 基本設定 {#basic-configuration}

最も基本的な設定です。Kafka Connect を分散モードで実行しており、`localhost:8443` で SSL 有効な ClickHouse サーバーが稼働していて、データはスキーマレスな JSON であることを前提としています。

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

#### 複数のトピックを対象とした基本構成 {#basic-configuration-with-multiple-topics}

コネクタは複数のトピックからデータを読み取ることができます

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

#### DLQ を使用した基本構成 {#basic-configuration-with-dlq}

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

#### 異なるデータ形式での利用 {#using-with-different-data-formats}

##### Avro スキーマのサポート {#avro-schema-support}

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

##### Protobuf スキーマのサポート {#protobuf-schema-support}

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

注意：クラスが見つからないといった問題が発生する場合、一部の環境には `protobuf` コンバーターが含まれていないため、依存関係を同梱した別のバージョンの `jar` リリースが必要になる場合があります。

##### JSON スキーマのサポート {#json-schema-support}

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

このコネクタは、さまざまな ClickHouse フォーマットにおける String コンバーターをサポートしています（[JSON](/interfaces/formats/JSONEachRow)、[CSV](/interfaces/formats/CSV)、[TSV](/interfaces/formats/TabSeparated)）。

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

ログ記録は Kafka Connect Platform によって自動的に行われます。
ログの出力先や形式は、Kafka Connect の[設定ファイル](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file)で設定できます。

Confluent Platform を使用している場合は、CLI コマンドを実行することでログを確認できます。

```bash
confluent local services connect log
```

詳細については、公式の[チュートリアル](https://docs.confluent.io/platform/current/connect/logging.html)を参照してください。

### モニタリング {#monitoring}

ClickHouse Kafka Connect は、[Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html) を通じて実行時メトリクスを公開します。JMX は Kafka Connector でデフォルトで有効になっています。

#### ClickHouse 固有のメトリクス {#clickhouse-specific-metrics}

コネクタは、次の MBean 名でカスタムメトリクスを公開します。

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

| Metric Name            | Type | Description                              |
| ---------------------- | ---- | ---------------------------------------- |
| `receivedRecords`      | long | 受信したレコードの総数。                             |
| `recordProcessingTime` | long | レコードをグループ化し、統一された構造に変換するのに要した合計時間（ナノ秒）。  |
| `taskProcessingTime`   | long | データを処理して ClickHouse に挿入するのに要した合計時間（ナノ秒）。 |

#### Kafka Producer/Consumer Metrics {#kafka-producer-consumer-metrics}

このコネクタは、データフロー、スループット、およびパフォーマンスの把握に役立つ、標準的な Kafka producer/consumer のメトリクスを公開しています。

**トピックレベルのメトリクス:**

* `records-sent-total`: トピックに送信されたレコードの総数
* `bytes-sent-total`: トピックに送信されたバイト数の合計
* `record-send-rate`: 1 秒あたりに送信されたレコードの平均レート
* `byte-rate`: 1 秒あたりに送信されたバイト数の平均レート
* `compression-rate`: 達成された圧縮率

**パーティションレベルのメトリクス:**
- `records-sent-total`: パーティションに送信されたレコードの総数
- `bytes-sent-total`: パーティションに送信されたバイト数の総量
- `records-lag`: パーティションの現在のラグ
- `records-lead`: パーティションの現在のリード
- `replica-fetch-lag`: レプリカに関するラグ情報

**ノードレベルの接続メトリクス:**
- `connection-creation-total`: Kafka ノードに対して作成された接続の総数
- `connection-close-total`: クローズされた接続の総数
- `request-total`: ノードに送信されたリクエストの総数
- `response-total`: ノードから受信したレスポンスの総数
- `request-rate`: 1 秒あたりの平均リクエストレート
- `response-rate`: 1 秒あたりの平均レスポンスレート

これらのメトリクスは次の監視に役立ちます:
- **スループット**: データのインジェストレートを追跡
- **ラグ**: ボトルネックと処理遅延の特定
- **圧縮**: データ圧縮効率の測定
- **接続状態**: ネットワーク接続性と安定性の監視

#### Kafka Connect フレームワークのメトリクス {#kafka-connect-framework-metrics}

コネクタは Kafka Connect フレームワークと統合されており、タスクのライフサイクルおよびエラー追跡のためのメトリクスを公開します。

**タスクステータスメトリクス:**
- `task-count`: コネクタ内のタスクの総数
- `running-task-count`: 現在実行中のタスク数
- `paused-task-count`: 現在一時停止中のタスク数
- `failed-task-count`: 失敗したタスクの数
- `destroyed-task-count`: 破棄されたタスクの数
- `unassigned-task-count`: 未割り当てタスクの数

タスクステータスの値には次が含まれます: `running`, `paused`, `failed`, `destroyed`, `unassigned`

**エラーメトリクス:**
- `deadletterqueue-produce-failures`: 失敗したデッドレターキュー (DLQ) への書き込みの数
- `deadletterqueue-produce-requests`: デッドレターキューへの書き込み試行の総数
- `last-error-timestamp`: 直近のエラーのタイムスタンプ
- `records-skip-total`: エラーによりスキップされたレコードの総数
- `records-retry-total`: リトライされたレコードの総数
- `errors-total`: 発生したエラーの総数

**パフォーマンスメトリクス:**
- `offset-commit-failures`: 失敗したオフセットコミットの数
- `offset-commit-avg-time-ms`: オフセットコミットに要する平均時間
- `offset-commit-max-time-ms`: オフセットコミットに要する最大時間
- `put-batch-avg-time-ms`: バッチ処理に要する平均時間
- `put-batch-max-time-ms`: バッチ処理に要する最大時間
- `source-record-poll-total`: 取得されたレコードの総数

#### 監視のベストプラクティス {#monitoring-best-practices}

1. **コンシューマラグを監視する**: パーティションごとに `records-lag` を追跡して処理ボトルネックを特定します
2. **エラーレートを追跡する**: `errors-total` と `records-skip-total` を監視してデータ品質の問題を検出します
3. **タスクの健全性を確認する**: タスクステータスメトリクスを監視してタスクが正しく実行されていることを確認します
4. **スループットを計測する**: `records-send-rate` と `byte-rate` を使用してインジェスト性能を追跡します
5. **接続状態を監視する**: ノードレベルの接続メトリクスを確認してネットワークの問題を検出します
6. **圧縮効率を追跡する**: `compression-rate` を使用してデータ転送を最適化します

JMX メトリクスの詳細な定義および Prometheus との統合については、[jmx-export-connector.yml](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/jmx-export-connector.yml) 設定ファイルを参照してください。

### 制限事項 {#limitations}

- 削除はサポートされていません。
- バッチサイズは Kafka Consumer のプロパティから継承されます。
- exactly-once のために KeeperMap を使用していて、オフセットが変更または巻き戻された場合、その特定のトピックの KeeperMap の内容を削除する必要があります（詳細については、以下のトラブルシューティングガイドを参照してください）。

### パフォーマンスチューニングとスループット最適化 {#tuning-performance}

このセクションでは、ClickHouse Kafka Connect Sink のパフォーマンスチューニング手法について説明します。大規模なスループットが必要なユースケースを扱う場合や、リソース使用率を最適化しラグを最小化する必要がある場合、パフォーマンスチューニングは重要です。

#### いつパフォーマンスチューニングが必要になるか {#when-is-performance-tuning-needed}

パフォーマンスチューニングが一般的に必要となるのは、次のようなシナリオです:

- **高スループットワークロード**: Kafka トピックから毎秒数百万件のイベントを処理する場合
- **コンシューマラグ**: コネクタがデータ生成レートに追いつかず、ラグが増加している場合
- **リソース制約**: CPU、メモリ、またはネットワーク使用量を最適化する必要がある場合
- **複数トピック**: 複数の高ボリュームトピックを同時に消費している場合
- **メッセージサイズが小さい場合**: 多数の小さなメッセージを扱い、サーバーサイドでのバッチ処理の恩恵を受けられる場合

次のような場合には、パフォーマンスチューニングは**通常必要ありません**:

- 低〜中程度のボリューム（< 10,000 メッセージ/秒）を処理している場合
- コンシューマラグが安定しており、ユースケース上許容可能な場合
- デフォルトのコネクタ設定で既にスループット要件を満たしている場合
- ClickHouse クラスターが受信負荷を容易に処理できている場合

#### データフローの理解 {#understanding-the-data-flow}

チューニングを行う前に、コネクタ内でデータがどのように流れるかを理解しておくことが重要です。

1. **Kafka Connect フレームワーク** がバックグラウンドで Kafka のトピックからメッセージを取得する
2. **コネクタがポーリング** してフレームワークの内部バッファからメッセージを取得する
3. **コネクタがバッチ化** し、ポーリングサイズに基づいてメッセージをまとめる
4. **ClickHouse が受信** し、バッチ化された `INSERT` を HTTP/S 経由で受け取る
5. **ClickHouse が処理** し、`INSERT` を同期または非同期で処理する

これら各段階でパフォーマンスを最適化できます。

#### Kafka Connect のバッチサイズ調整 {#connect-fetch-vs-connector-poll}

最初の最適化ポイントは、Kafka からコネクタが 1 バッチあたりに受け取るデータ量を制御することです。

##### フェッチ設定 {#fetch-settings}

Kafka Connect（フレームワーク）は、コネクタとは独立してバックグラウンドで Kafka のトピックからメッセージを取得します。

- **`fetch.min.bytes`**: フレームワークが値をコネクタに渡す前に必要となる最小データ量（デフォルト: 1 バイト）
- **`fetch.max.bytes`**: 1 回のリクエストで取得する最大データ量（デフォルト: 52428800 / 50 MB）
- **`fetch.max.wait.ms`**: `fetch.min.bytes` に満たない場合にデータを返すまで待機する最大時間（デフォルト: 500 ms）

##### ポーリング設定 {#poll-settings}

コネクタはフレームワークのバッファからメッセージをポーリングします。

- **`max.poll.records`**: 1 回のポーリングで返される最大レコード数（デフォルト: 500）
- **`max.partition.fetch.bytes`**: パーティションごとの最大データ量（デフォルト: 1048576 / 1 MB）

##### 高スループット向けの推奨設定 {#recommended-batch-settings}

ClickHouse のパフォーマンスを最適化するには、より大きなバッチサイズを目標としてください。

```properties
# Increase the number of records per poll
consumer.max.poll.records=5000

# Increase the partition fetch size (5 MB)
consumer.max.partition.fetch.bytes=5242880

# Optional: Increase minimum fetch size to wait for more data (1 MB)
consumer.fetch.min.bytes=1048576

# Optional: Reduce wait time if latency is critical
consumer.fetch.max.wait.ms=300
```

# パーティションのフェッチサイズを増やす (5 MB) {#increase-the-partition-fetch-size-5-mb}
consumer.max.partition.fetch.bytes=5242880

# 任意: より多くのデータが揃うまで待つように最小フェッチサイズを増やす (1 MB) {#optional-increase-minimum-fetch-size-to-wait-for-more-data-1-mb}
consumer.fetch.min.bytes=1048576

# オプション: レイテンシがクリティカルな場合の待機時間を短縮する {#optional-reduce-wait-time-if-latency-is-critical}

consumer.fetch.max.wait.ms=300

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```json
"clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=10485760,async_insert_busy_timeout_ms=1000"

```json
"clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=10485760,async_insert_busy_timeout_ms=1000"
```json
{
  "config": {
    "exactlyOnce": "true",
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```json
{
  "config": {
    "exactlyOnce": "true",
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```json
"tasks.max": "4"
```json
"tasks.max": "4"
```json
"ignorePartitionsWhenBatching": "true"
```json
"ignorePartitionsWhenBatching": "true"
```sql
CREATE TABLE my_table (...)
ENGINE = MergeTree()
ORDER BY (timestamp, id)
SETTINGS 
    -- Increase max insert threads for parallel part writing
    max_insert_threads = 4,
    -- Allow inserts with quorum for reliability (ReplicatedMergeTree)
    insert_quorum = 2
```sql
CREATE TABLE my_table (...)
ENGINE = MergeTree()
ORDER BY (timestamp, id)
SETTINGS 
    -- パーツを並列に書き込むために max_insert_threads（挿入スレッド数）を増やす
    max_insert_threads = 4,
    -- 信頼性向上のためにクォーラム付きの INSERT を許可する（ReplicatedMergeTree）
    insert_quorum = 2
```json
"clickhouseSettings": "insert_quorum=2,insert_quorum_timeout=60000"
```json
"clickhouseSettings": "insert_quorum=2,insert_quorum_timeout=60000"
```json
"clickhouseSettings": "socket_timeout=300000,connection_timeout=30000"

```json
"clickhouseSettings": "socket_timeout=300000,connection_timeout=30000"
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
```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
