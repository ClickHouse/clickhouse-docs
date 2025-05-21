---
sidebar_label: 'Kafka Connect JDBCコネクタ'
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: 'Kafka ConnectとClickHouseを使用したJDBCコネクタシンク'
title: 'JDBCコネクタ'
---
```

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# JDBCコネクタ

:::note
このコネクタは、データが単純であり、例えば int のような基本データ型で構成されている場合にのみ使用してください。maps のような ClickHouse 特有の型はサポートされていません。
:::

私たちの例では、Kafka ConnectのConfluentディストリビューションを利用します。

以下に、単一のKafkaトピックからメッセージを取得し、ClickHouseテーブルに行を挿入するための簡単なインストール手順を説明します。Kafka環境を持たない場合は、寛大な無料プランを提供するConfluent Cloudをお勧めします。

JDBCコネクタにはスキーマが必要であることに注意してください（JDBCコネクタではプレーンなJSONまたはCSVを使用することはできません）。スキーマは各メッセージにエンコードできますが、関連するオーバーヘッドを避けるために [Confluentスキーマレジストリ](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)y を使用することを強く推奨します。提供された挿入スクリプトは、メッセージからスキーマを自動的に推測し、レジストリに挿入します - このスクリプトは他のデータセットにも再利用できます。Kafkaのキーは文字列であると仮定しています。Kafkaスキーマについての詳細は [こちら](https://docs.confluent.io/platform/current/schema-registry/index.html)で確認できます。

### ライセンス {#license}
JDBCコネクタは [Confluent Community License](https://www.confluent.io/confluent-community-license)のもとで配布されています。

### 手順 {#steps}
#### 接続詳細の収集 {#gather-your-connection-details}
<ConnectionDetails />

#### 1. Kafka Connectとコネクタのインストール {#1-install-kafka-connect-and-connector}

Confluentパッケージをダウンロードし、ローカルにインストールしたと仮定します。コネクタのインストールに関する手順は[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector)に記載されています。

confluent-hubインストール方法を使用する場合、ローカルの設定ファイルが更新されます。

KafkaからClickHouseにデータを送信するには、コネクタのSinkコンポーネントを使用します。

#### 2. JDBCドライバーのダウンロードとインストール {#2-download-and-install-the-jdbc-driver}

[こちら](https://github.com/ClickHouse/clickhouse-java/releases)からClickHouse JDBCドライバー `clickhouse-jdbc-<version>-shaded.jar` をダウンロードしインストールします。このドライバーをKafka Connectにインストールする手順については[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers)を参照してください。他のドライバーも動作する可能性がありますが、テストされていません。

:::note

一般的な問題: ドキュメントでは jar を `share/java/kafka-connect-jdbc/` にコピーすることを提案しています。コネクトがドライバーを見つけられない場合、ドライバーを `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/` にコピーしてください。または、`plugin.path` を変更してドライバーを含めるようにします - 下記を参照。

:::

#### 3. 設定の準備 {#3-prepare-configuration}

[こちらの手順](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従って、インストールタイプに関連するコネクトのセットアップを行ってください。スタンドアロンと分散クラスターの違いに注意してください。Confluent Cloudを使用する場合は、分散セットアップが適用されます。

以下のパラメータは、ClickHouseでJDBCコネクタを使用する際に関連します。完全なパラメータリストは[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html)で確認できます。

* `_connection.url_` - これは `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>` の形式にする必要があります。
* `connection.user` - 対象データベースへの書き込み権限を持つユーザー。
* `table.name.format` - データを挿入するClickHouseテーブル。これは存在する必要があります。
* `batch.size` - 単一のバッチで送信する行の数。適切に大きな数に設定してください。ClickHouseの[推奨事項](/sql-reference/statements/insert-into#performance-considerations)によれば、1000の値が下限として考慮されるべきです。
* `tasks.max` - JDBC Sinkコネクタは1つ以上のタスクを実行できます。これを使用してパフォーマンスを向上させることができます。バッチサイズと共に、これがパフォーマンス向上の主要手段となります。
* `value.converter.schemas.enable` - スキーマレジストリを使用している場合はfalseに設定し、メッセージにスキーマを埋め込む場合はtrueに設定します。
* `value.converter` - データ型に応じて設定します。例えばJSONの場合、`io.confluent.connect.json.JsonSchemaConverter`になります。
* `key.converter` - `org.apache.kafka.connect.storage.StringConverter`に設定します。文字列キーを使用します。
* `pk.mode` - ClickHouseには関連しません。noneに設定します。
* `auto.create` - サポートされておらず、falseにする必要があります。
* `auto.evolve` - この設定は推奨としてfalseにしておくことをお勧めしますが、将来のサポートの可能性があります。
* `insert.mode` - "insert"に設定します。現在他のモードはサポートされていません。
* `key.converter` - キーのタイプに応じて設定します。
* `value.converter` - トピックのデータ型に基づいて設定します。このデータにはサポートされているスキーマ - JSON、Avro、またはProtobuf形式が必要です。

テスト用のサンプルデータセットを使用する場合は、次の設定が必要です。

* `value.converter.schemas.enable` - スキーマレジストリを利用するためfalseに設定します。各メッセージにスキーマを埋め込む場合はtrueに設定します。
* `key.converter` - "org.apache.kafka.connect.storage.StringConverter"に設定します。文字列キーを使用します。
* `value.converter` - "io.confluent.connect.json.JsonSchemaConverter"に設定します。
* `value.converter.schema.registry.url` - スキーマサーバーのURLと、スキーマサーバーの資格情報を `value.converter.schema.registry.basic.auth.user.info` パラメータを介して指定します。

Githubのサンプルデータに対する設定ファイルの例は、[こちら](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink)にあります。Connectがスタンドアロンモードで実行され、KafkaがConfluent Cloudにホストされていることを想定しています。

#### 4. ClickHouseテーブルの作成 {#4-create-the-clickhouse-table}

テーブルが作成されていることを確認し、前の例から既に存在する場合は削除してください。削減されたGithubデータセットに適した例は以下に示します。現在サポートされていないArrayやMap型がないことに注意してください：

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

#### 5. Kafka Connectの起動 {#5-start-kafka-connect}

[スタンドアロン](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster)または[分散](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster)モードのいずれかでKafka Connectを起動します。

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Kafkaにデータを追加 {#6-add-data-to-kafka}

提供された[スクリプトと設定](https://github.com/ClickHouse/kafka-samples/tree/main/producer)を使用してKafkaにメッセージを挿入します。github.configを変更してKafkaの資格情報を含める必要があります。このスクリプトは現在、Confluent Cloudでの使用に設定されています。

```bash
python producer.py -c github.config
```

このスクリプトは任意のndjsonファイルをKafkaトピックに挿入するために使用できます。これは自動的にスキーマを推測しようとします。サンプル設定は10,000メッセージのみを挿入します - 必要に応じて[ここ](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25)を変更してください。この設定は、Kafkaへの挿入中に不適合なArrayフィールドをデータセットから削除します。

これはJDBCコネクタがメッセージをINSERT文に変換するために必要です。独自のデータを使用している場合は、各メッセージにスキーマを挿入するか（`_value.converter.schemas.enable_`をtrueに設定）、クライアントがレジストリにスキーマを参照してメッセージを公開することを確認してください。

Kafka Connectはメッセージを消費し始め、ClickHouseに行を挿入します。「[JDBCコンプライアントモード] トランザクションはサポートされていません。」という警告は予想されるものであり、無視できます。

ターゲットテーブル「Github」に対する単純な読み込みは、データ挿入を確認するはずです。

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### 推奨するさらなる読書 {#recommended-further-reading}

* [Kafka Sink構成パラメータ](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connectの深い理解 – JDBCソースコネクタ](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC Sinkの深い理解: 主キーとの連携](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect in Action: JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 読むのではなく見る方が好きな方のために。
* [Kafka Connectの深い理解 – コンバータとシリアル化の説明](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
