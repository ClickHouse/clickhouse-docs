---
sidebar_label: 'ClickHouse Kafka Connect Sink'
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: 'ClickHouse の公式 Kafka コネクタです。'
title: 'ClickHouse Kafka Connect Sink'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
助けが必要な場合は、[リポジトリに問題を提出](https://github.com/ClickHouse/clickhouse-kafka-connect/issues)するか、[ClickHouse 公共 Slack](https://clickhouse.com/slack)で質問をしてください。
:::
**ClickHouse Kafka Connect Sink** は、Kafka トピックから ClickHouse テーブルにデータを配信する Kafka コネクタです。

### License {#license}

Kafka Connector Sink は [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0) の下で配布されています。

### 環境要件 {#requirements-for-the-environment}

[Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) フレームワークバージョン 2.7 以降が環境にインストールされている必要があります。

### バージョン互換性マトリックス {#version-compatibility-matrix}

| ClickHouse Kafka Connect バージョン | ClickHouse バージョン | Kafka Connect | Confluent プラットフォーム |
|--------------------------------------|-----------------------|---------------|-------------------------|
| 1.0.0                               | > 23.3                | > 2.7         | > 6.1                   |

### 主な機能 {#main-features}

- デフォルトで「一度だけ」のセマンティクスを持って出荷されます。これは、コネクタによって状態ストアとして使用される新しい ClickHouse コア機能である [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) によって支えられており、ミニマリストアーキテクチャを実現しています。
- サードパーティの状態ストアのサポート: 現在はインメモリがデフォルトですが、KeeperMap（近く Redis が追加される予定）を使用できます。
- コア統合: ClickHouse によって構築、維持、サポートされます。
- [ClickHouse Cloud](https://clickhouse.com/cloud) に対して継続的にテストされています。
- スキーマが宣言されたデータとスキーマレスのデータの挿入をサポートしています。
- ClickHouse のすべてのデータ型をサポートしています。

### インストール手順 {#installation-instructions}

#### 接続詳細をまとめる {#gather-your-connection-details}

<ConnectionDetails />

#### 一般的なインストール手順 {#general-installation-instructions}

コネクタは、プラグインを実行するために必要なクラスファイルをすべて含む単一の JAR ファイルとして配布されています。

プラグインをインストールするには、次の手順に従ってください。

- ClickHouse Kafka Connect Sink リポジトリの [リリース](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) ページからコネクタ JAR ファイルを含む ZIP アーカイブをダウンロードします。
- ZIP ファイルの内容を抽出し、希望する場所にコピーします。
- Confluent Platform がプラグインを見つけられるようにするために、Connect プロパティファイル内の [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) 設定にプラグインディレクトリへのパスを追加します。
- 設定内でトピック名、ClickHouse インスタンスのホスト名、およびパスワードを指定します。

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

- Confluent Platform を再起動します。
- Confluent Platform を使用している場合は、Confluent Control Center UI にログインし、ClickHouse Sink が使用可能なコネクタのリストにあることを確認します。

### 設定オプション {#configuration-options}

ClickHouse Sink を ClickHouse サーバーに接続するには、以下の情報を提供する必要があります。

- 接続詳細: ホスト名（**必須**）およびポート（オプション）
- ユーザー資格情報: パスワード（**必須**）およびユーザー名（オプション）
- コネクタクラス: `com.clickhouse.kafka.connect.ClickHouseSinkConnector` （**必須**）
- トピックまたは topics.regex: ポーリングする Kafka トピック - トピック名はテーブル名と一致する必要があります（**必須**）
- キーと値のコンバーター: トピックのデータの種類に基づいて設定します。ワーカー構成で定義されていない場合は必須です。

設定オプションの完全な表は次の通りです。

| プロパティ名                                   | 説明                                                                                                                                                        | デフォルト値                                      |
|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| `hostname` (必須)                             | サーバーのホスト名または IP アドレス                                                                                                                       | N/A                                              |
| `port`                                        | ClickHouse ポート - デフォルトは 8443（クラウドの HTTPS 用）ですが、HTTP（セルフホストのデフォルト）の場合は 8123 です                                   | `8443`                                          |
| `ssl`                                         | ClickHouse への ssl 接続を有効にします                                                                                                                     | `true`                                          |
| `jdbcConnectionProperties`                    | ClickHouse に接続する際の接続プロパティ。 `?` で始まり、`param=value` の間に `&` で結合する必要があります                                                         | `""`                                            |
| `username`                                    | ClickHouse データベースのユーザー名                                                                                                                       | `default`                                       |
| `password` (必須)                             | ClickHouse データベースのパスワード                                                                                                                       | N/A                                              |
| `database`                                    | ClickHouse データベース名                                                                                                                               | `default`                                       |
| `connector.class` (必須)                      | コネクタクラス（明示的に設定してデフォルト値として保持）                                                                                                   | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                   | コネクタタスクの数                                                                                                                                          | `"1"`                                          |
| `errors.retry.timeout`                        | ClickHouse JDBC 再試行タイムアウト                                                                                                                | `"60"`                                        |
| `exactlyOnce`                                 | 一度だけの機能を有効にします                                                                                                                               | `"false"`                                      |
| `topics` (必須)                               | ポーリングする Kafka トピック - トピック名はテーブル名と一致する必要があります                                                                            | `""`                                            |
| `key.converter` (必須* - 説明を参照)           | キーの種類に応じて設定します。キーを渡す場合にここで必須です（ワーカー構成で定義されていない場合）。                                                                     | `"org.apache.kafka.connect.storage.StringConverter"` |
| `value.converter` (必須* - 説明を参照)         | トピックのデータの種類に基づいて設定します。サポートされている形式: JSON, String, Avro, Protobuf。ワーカー構成で未定義の場合に必須です。                           | `"org.apache.kafka.connect.json.JsonConverter"`  |
| `value.converter.schemas.enable`              | コネクタの値コンバーターのスキーマサポート                                                                                                                  | `"false"`                                      |
| `errors.tolerance`                            | コネクタエラーの耐性。サポート: none, all                                                                                                                | `"none"`                                       |
| `errors.deadletterqueue.topic.name`           | 設定されている場合（errors.tolerance=all とともに）、失敗したバッチのために DLQ が使用されます（[トラブルシューティング](#troubleshooting)を参照）                        | `""`                                            |
| `errors.deadletterqueue.context.headers.enable` | DLQ のために追加のヘッダーが追加されます                                                                                                                  | `""`                                            |
| `clickhouseSettings`                          | ClickHouse 設定のコンマ区切りリスト（例: "insert_quorum=2, etc..."）                                                                                          | `""`                                            |
| `topic2TableMap`                              | トピック名をテーブル名にマッピングするためのコンマ区切りリスト（例: "topic1=table1, topic2=table2, etc..."）                                                    | `""`                                            |
| `tableRefreshInterval`                        | テーブル定義キャッシュを更新する時間（秒）                                                                                                                | `0`                                             |
| `keeperOnCluster`                             | セルフホストインスタンスに対する ON CLUSTER パラメータの構成を許可します（例: `ON CLUSTER clusterNameInConfigFileDefinition`）                            | `""`                                            |
| `bypassRowBinary`                             | スキーマベースのデータ（Avro、Protobuf など）のために RowBinary および RowBinaryWithDefaults の使用を無効にすることを許可します - カラムが欠けるデータの場合にのみ使用すべきです。 | `"false"`                                      |
| `dateTimeFormats`                             | DateTime64 スキーマフィールドの解析用の日付時間形式、`;` で区切る（例: `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                       | `""`                                            |
| `tolerateStateMismatch`                       | コネクタに、AFTER_PROCESSING に保存された現在のオフセットよりも「早い」レコードをドロップさせることを許可します（例: オフセット 5 が送信され、オフセット 250 が最後に記録されたオフセットの場合）      | `"false"`                                      |
| `ignorePartitionsWhenBatching`                | 挿入のためのメッセージ収集時にパーティションを無視します（ただし、`exactlyOnce` が `false` の場合のみ）。パフォーマンスノート: コネクタタスクが多いほど、各タスクに割り当てられる Kafka パーティションが少なくなる - これは収益の減少を意味する可能性があります。 | `"false"`                                      |

### 対象テーブル {#target-tables}

ClickHouse Connect Sink は Kafka トピックからメッセージを読み取り、適切なテーブルに書き込みます。ClickHouse Connect Sink は既存のテーブルにデータを書き込むため、データを挿入する前に ClickHouse に適切なスキーマを持つターゲットテーブルが作成されていることを確認してください。

各トピックには ClickHouse に専用のターゲットテーブルが必要です。ターゲットテーブル名はソーストピック名と一致する必要があります。

### 前処理 {#pre-processing}

ClickHouse Kafka Connect Sink に送信される前にアウトバウンドメッセージを変換する必要がある場合は、[Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html) を使用してください。

### サポートされているデータ型 {#supported-data-types}

**スキーマが宣言されている場合:**

| Kafka Connect タイプ                  | ClickHouse タイプ       | サポート | 原始 |
|---------------------------------------|------------------------|---------|------|
| STRING                                | String                 | ✅      | はい  |
| INT8                                  | Int8                   | ✅      | はい  |
| INT16                                 | Int16                  | ✅      | はい  |
| INT32                                 | Int32                  | ✅      | はい  |
| INT64                                 | Int64                  | ✅      | はい  |
| FLOAT32                               | Float32                | ✅      | はい  |
| FLOAT64                               | Float64                | ✅      | はい  |
| BOOLEAN                               | Boolean                | ✅      | はい  |
| ARRAY                                 | Array(T)              | ✅      | いいえ |
| MAP                                   | Map(Primitive, T)     | ✅      | いいえ |
| STRUCT                                | Variant(T1, T2, ...)   | ✅      | いいえ |
| STRUCT                                | Tuple(a T1, b T2, ...) | ✅      | いいえ |
| STRUCT                                | Nested(a T1, b T2, ...) | ✅      | いいえ |
| BYTES                                 | String                 | ✅      | いいえ |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64     | ✅      | いいえ |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32         | ✅      | いいえ |
| org.apache.kafka.connect.data.Decimal   | Decimal                | ✅      | いいえ |

**スキーマが宣言されていない場合:**

レコードは JSON に変換され、[JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow) フォーマットで ClickHouse に値として送信されます。

### 設定レシピ {#configuration-recipes}

ここでは、迅速に始めるための一般的な設定レシピをいくつか示します。

#### 基本設定 {#basic-configuration}

迅速に開始するための最も基本的な設定 - これは、Kafka Connect が分散モードで実行され、`localhost:8443` で SSL が有効な ClickHouse サーバーが実行されていると仮定しています。データはスキーマレス JSON 形式です。

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

#### 複数トピックを使った基本設定 {#basic-configuration-with-multiple-topics}

コネクタは複数のトピックからデータを消費することができます。

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

#### DLQ を使った基本設定 {#basic-configuration-with-dlq}

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

#### 異なるデータ形式を使用した例 {#using-with-different-data-formats}

##### Avro スキーマサポート {#avro-schema-support}

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

##### Protobuf スキーマサポート {#protobuf-schema-support}

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

注意: クラスが見つからない問題に遭遇した場合、すべての環境に protobuf コンバータが付属しているわけではなく、依存関係と一緒にバンドルされた別のリリースの JAR が必要になることがあります。

##### JSON スキーマサポート {#json-schema-support}

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

##### 文字列サポート {#string-support}

コネクタは、さまざまな ClickHouse 形式での String Converter をサポートしています: [JSON](/interfaces/formats#jsoneachrow)、[CSV](/interfaces/formats#csv)、および [TSV](/interfaces/formats#tabseparated)。

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

ロギングは自動的に Kafka Connect プラットフォームによって提供されます。
ロギングの宛先と形式は Kafka connect [設定ファイル](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file)を介して設定することができます。

Confluent Platform を使用している場合、CLI コマンドを実行してログを確認できます。

```bash
confluent local services connect log
```

詳細については、公式の [チュートリアル](https://docs.confluent.io/platform/current/connect/logging.html)を確認してください。

### モニタリング {#monitoring}

ClickHouse Kafka Connect は [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html) を介してランタイムメトリックを報告します。JMX はデフォルトで Kafka Connector で有効になっています。

ClickHouse Connect `MBeanName`:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect は以下のメトリクスを報告します。

| 名前                  | タイプ | 説明                                                                                        |
|----------------------|--------|------------------------------------------------------------------------------------------|
| `receivedRecords`      | long   | 受信したレコードの総数。                                                                  |
| `recordProcessingTime` | long   | レコードをグループ化して統一された構造に変換するのに費やしたナノ秒単位の総時間。                |
| `taskProcessingTime`   | long   | ClickHouse にデータを処理して挿入するのに費やしたナノ秒単位の総時間。                       |

### 制限事項 {#limitations}

- 削除はサポートされていません。
- バッチサイズは Kafka Consumer プロパティから継承されます。
- KeeperMap を使用して一度だけを実行している場合、オフセットが変更されたり巻き戻されたりしたときには、その特定のトピックの内容を KeeperMap から削除する必要があります。（詳細については以下のトラブルシューティングガイドを参照してください）

### パフォーマンスの調整 {#tuning-performance}

「シンクコネクタのバッチサイズを調整したい」と考えたことがある場合、ここはあなたのためのセクションです。

##### Connect Fetch vs Connector Poll {#connect-fetch-vs-connector-poll}

Kafka Connect（私たちのシンクコネクタが構築されているフレームワーク）は、バックグラウンドで Kafka トピックからメッセージを取得します（コネクタとは独立しています）。

このプロセスは `fetch.min.bytes` と `fetch.max.bytes` を使用して制御できます - `fetch.min.bytes` はフレームワークがコネクタに値を渡すために必要な最小量を設定し（`fetch.max.wait.ms` で設定された時間制限まで）、`fetch.max.bytes` は上限サイズを設定します。コネクタにより大きなバッチを渡したい場合、最小フェッチまたは最大待機時間を増やして大きなデータバンドルを構築することが選択肢となります。

このフェッチしたデータは、その後、メッセージをポーリングするコネクタクライアントに消費され、各ポーリングの量は `max.poll.records` によって制御されます - ただし、フェッチはポールとは独立して行われます！

これらの設定を調整するときは、ユーザーはフェッチサイズが `max.poll.records` の複数のバッチを生成することを目指すべきです（`fetch.min.bytes` と `fetch.max.bytes` の設定は圧縮されたデータを反映することを忘れないでください） - そうすれば、各コネクタタスクができる限り大きなバッチを挿入できます。

ClickHouse は頻繁な小さなバッチの代わりに、わずかな遅延で大きなバッチのために最適化されています - バッチが大きいほど、効果が高いです。

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

詳細は、[Confluent ドキュメント](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration)
または [Kafka ドキュメント](https://kafka.apache.org/documentation/#consumerconfigs) を参照してください。

#### 高スループットの複数トピック {#multiple-high-throughput-topics}

コネクタが複数のトピックにサブスクライブするように設定されていて、トピックをテーブルにマッピングするために `topic2TableMap` を利用していて、挿入時にボトルネックが発生している場合、代わりにトピックごとに1つのコネクタを作成することを検討してください。これが発生する主な理由は、現在バッチがすべてのテーブルに[直列に](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100)挿入されるからです。

トピックごとに1つのコネクタを作成することは、可能な限り高速な挿入速度を得るための回避策です。

### トラブルシューティング {#troubleshooting}

#### "トピック `[someTopic]` のパーティション `[0]` に対する状態の不一致" {#state-mismatch-for-topic-sometopic-partition-0}

これは、KeeperMap に保存されたオフセットが Kafka に保存されたオフセットと異なる場合に発生します。通常、トピックが削除された場合やオフセットが手動で調整された場合です。
これを修正するには、その特定のトピックとパーティションの古い値を削除する必要があります。

**注: この調整は一度だけの影響があるかもしれません。**

#### "コネクタはどのエラーを再試行しますか？" {#what-errors-will-the-connector-retry}

現在のところ、焦点は一時的なエラーを特定し、再試行できるエラーを特定することにあります。

- `ClickHouseException` - これは ClickHouse によってスローされる一般的な例外です。
  通常、サーバーが過負荷の際にスローされ、以下のエラーコードは特に一時的とされます：
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

#### "私のデータはすべて空白/ゼロです" {#all-my-data-is-blankzeroes}
おそらく、データ内のフィールドがテーブル内のフィールドと一致していません - これは特に CDC（と Debezium 形式）では一般的です。
一般的な解決策は、コネクタ設定にフラッテン変換を追加することです。

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

これにより、データはネストされた JSON からフラットな JSON に変換されます（`_` を区切りとして使用）。テーブル内のフィールドは「field1_field2_field3」という形式になります（例: "before_id", "after_id" など）。

#### "Kafka のキーを ClickHouse で使用したい" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Kafka のキーはデフォルトでは値フィールドに保存されませんが、`KeyToValue` 変換を使用してキーを新しい `_key` フィールド名の値フィールドに移動することができます。

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
