---
sidebar_label: Kafka Connect JDBC Connector
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: Using JDBC Connector Sink with Kafka Connect and ClickHouse
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# JDBCコネクタ

:::note
このコネクタは、データがシンプルで、intなどのプリミティブデータ型で構成されている場合のみ使用するべきです。mapsなどのClickHouse特有の型はサポートされていません。
:::

私たちの例では、Confluent配布のKafka Connectを利用します。

以下では、単一のKafkaトピックからメッセージを取得し、ClickHouseテーブルに行を挿入するシンプルなインストール方法について説明します。Kafka環境がない方には、寛大な無料プランを提供するConfluent Cloudをお勧めします。

JDBCコネクタにはスキーマが必要であることに注意してください（JDBCコネクタでプレーンJSONやCSVを使用することはできません）。スキーマは各メッセージにエンコードできますが、関連するオーバーヘッドを避けるために、[Confluentスキーマレジストリ](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)yの使用が**強く推奨**されます。提供された挿入スクリプトは、メッセージからスキーマを自動的に推測し、これをレジストリに挿入します。このスクリプトは他のデータセットでも再利用できます。Kafkaのキーは文字列であると仮定されます。Kafkaスキーマの詳細については、[こちら](https://docs.confluent.io/platform/current/schema-registry/index.html)を参照してください。

### ライセンス {#license}
JDBCコネクタは、[Confluent Community License](https://www.confluent.io/confluent-community-license)の下で配布されています。

### ステップ {#steps}
#### 接続情報を収集する {#gather-your-connection-details}
<ConnectionDetails />

#### 1. Kafka Connectおよびコネクタのインストール {#1-install-kafka-connect-and-connector}

Confluentパッケージをダウンロードし、ローカルにインストールしたと仮定します。コネクタをインストールするためのインストラクションは[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector)に記載されています。

confluent-hubインストール方法を使用する場合、ローカル設定ファイルが更新されます。

KafkaからClickHouseにデータを送信するために、コネクタのSinkコンポーネントを使用します。

#### 2. JDBCドライバをダウンロードしてインストールする {#2-download-and-install-the-jdbc-driver}

[こちら](https://github.com/ClickHouse/clickhouse-java/releases)からClickHouse JDBCドライバ`clickhouse-jdbc-<version>-shaded.jar`をダウンロードしインストールします。このドライバをKafka Connectにインストールする方法については[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers)を参照してください。他のドライバも動作する可能性がありますが、保証はありません。

:::note

一般的な問題：ドキュメントでは、jarを`share/java/kafka-connect-jdbc/`にコピーすることを提案しています。Connectがドライバを見つけられない場合は、ドライバを`share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`にコピーしてください。または、`plugin.path`を変更してドライバを含めることができます - 下記を参照してください。

:::

#### 3. 設定を準備する {#3-prepare-configuration}

インストールタイプに関連するConnectのセットアップに関する[こちらの指示](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従ってください。スタンドアロンと分散クラスタの違いに注意してください。Confluent Cloudを使用する場合、分散セットアップが関連します。

ClickHouseとJDBCコネクタを使用する際に必要なパラメータは以下の通りです。完全なパラメータリストは[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html)で確認できます：

* `_connection.url_` - `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>`の形式である必要があります。
* `connection.user` - 対象データベースへの書き込みアクセスを持つユーザー
* `table.name.format` - データを挿入するClickHouseテーブル。このテーブルは存在する必要があります。
* `batch.size` - 一度に送信する行の数。適切に大きな数に設定してください。ClickHouseの[推奨事項](/sql-reference/statements/insert-into#performance-considerations)に従い、1000の値を最低限の値として考慮してください。
* `tasks.max` - JDBC Sinkコネクタは1つ以上のタスクの実行をサポートします。これはパフォーマンスを向上させるために使用できます。バッチサイズと共に、パフォーマンスを向上させる主要な手段を表します。
* `value.converter.schemas.enable` - スキーマレジストリを使用する場合はfalse、メッセージにスキーマを埋め込む場合はtrueに設定します。
* `value.converter` - データ型に応じて設定します。例えばJSONの場合は、`io.confluent.connect.json.JsonSchemaConverter`。
* `key.converter` - `org.apache.kafka.connect.storage.StringConverter`に設定します。文字列キーを使用します。
* `pk.mode` - ClickHouseには関係ありません。noneに設定します。
* `auto.create` - サポートされておらず、falseにする必要があります。
* `auto.evolve` - この設定は将来的にサポートされるかもしれませんが、現在はfalseを推奨します。
* `insert.mode` - "insert"に設定します。他のモードは現在サポートされていません。
* `key.converter` - キーのタイプに応じて設定します。
* `value.converter` - トピックのデータタイプに基づいて設定します。このデータにはサポートされているスキーマ - JSON、AvroまたはProtobuf形式 - が必要です。

テスト用にサンプルデータセットを使用する場合、以下の設定を確認してください：

* `value.converter.schemas.enable` - スキーマレジストリを利用しているためfalseに設定します。各メッセージにスキーマを埋め込む場合はtrueに設定します。
* `key.converter` - "org.apache.kafka.connect.storage.StringConverter"に設定します。文字列キーを使用します。
* `value.converter` - "io.confluent.connect.json.JsonSchemaConverter"に設定します。
* `value.converter.schema.registry.url` - スキーマサーバのURLと、`value.converter.schema.registry.basic.auth.user.info`を通じてスキーマサーバの資格情報を設定します。

Githubサンプルデータの設定ファイルの例は[こちら](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink)で見つけることができます。Connectはスタンドアロンモードで実行され、KafkaはConfluent Cloudにホストされます。

#### 4. ClickHouseテーブルを作成する {#4-create-the-clickhouse-table}

テーブルが作成されていることを確認し、前の例から既に存在する場合は削除します。制限されたGithubデータセットと互換性のある例は以下に示されています。サポートされていないArrayやMap型がないことに注意してください：

```sql
CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    actor_login LowCardinality(String),
    repo_name LowCardinality(String),
    created_at DateTime,
    updated_at DateTime,
    action Enum('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    comment_id UInt64,
    path String,
    ref LowCardinality(String),
    ref_type Enum('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    creator_user_login LowCardinality(String),
    number UInt32,
    title String,
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at)
```

#### 5. Kafka Connectを起動する {#5-start-kafka-connect}

[スタンドアロン](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster)または[分散](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster)モードでKafka Connectを起動します。

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Kafkaにデータを追加する {#6-add-data-to-kafka}

提供された[スクリプトと設定](https://github.com/ClickHouse/kafka-samples/tree/main/producer)を使用して、Kafkaにメッセージを挿入します。github.configを変更してKafka資格情報を含める必要があります。このスクリプトは現在Confluent Cloudでの使用のために設定されています。

```bash
python producer.py -c github.config
```

このスクリプトは任意のndjsonファイルをKafkaトピックに挿入するために使用できます。これにより、自動的にスキーマを推測しようとします。サンプルで提供された設定は、10,000メッセージのみを挿入します - 必要に応じて[ここを変更](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25)してください。この設定は、挿入中に互換性のないArrayフィールドをデータセットから削除します。

これはJDBCコネクタがメッセージをINSERT文に変換するために必要です。独自のデータを使用している場合は、各メッセージにスキーマを挿入する（`_value.converter.schemas.enable_`をtrueに設定する）か、クライアントがレジストリにスキーマを参照するメッセージを送信することを確認してください。

Kafka Connectは、メッセージを消費し、ClickHouseに行を挿入し始めるはずです。「[JDBC準拠モード] トランザクションはサポートされていません。」に関する警告は予期されるもので、無視して構いません。

ターゲットテーブル「Github」を簡単に読み取ることで、データの挿入を確認できます。

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### 推奨されるさらなるリーディング {#recommended-further-reading}

* [Kafka Sink設定パラメータ](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connect Deep Dive – JDBC Source Connector](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC Sink深堀：主キーを扱う](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect in Action: JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 読むより見るのを好む方のために。
* [Kafka Connect Deep Dive – コンバータとシリアル化の概要](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
