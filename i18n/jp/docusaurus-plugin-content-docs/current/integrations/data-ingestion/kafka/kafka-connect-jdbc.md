---
sidebar_label: 'Kafka Connect JDBCコネクタ'
sidebar_position: 4
slug: '/integrations/kafka/kafka-connect-jdbc'
description: 'Kafka ConnectおよびClickHouseと組み合わせてJDBCコネクタシンクを使用する'
title: 'JDBC Connector'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# JDBC Connector

:::note
このコネクタは、データが単純で、intなどの基本データ型から成る場合のみ使用するべきです。マップなどのClickHouse独自の型はサポートされていません。
:::

私たちの例では、Kafka ConnectのConfluentディストリビューションを利用しています。

以下に、単一のKafkaトピックからメッセージを取得し、ClickHouseテーブルに行を挿入する簡単なインストール手順を説明します。Kafka環境を持っていない場合は、寛大な無料プランを提供するConfluent Cloudをお勧めします。

JDBCコネクタにはスキーマが必要であることに注意してください（JDBCコネクタでは通常のJSONやCSVを使用できません）。スキーマは各メッセージにエンコードできますが、関連するオーバーヘッドを避けるために[Confluentスキーマレジストリを使用することを強く推奨します](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)。提供される挿入スクリプトは、メッセージから自動的にスキーマを推測し、これをレジストリに挿入します。このスクリプトは他のデータセットでも再利用できます。Kafkaのキーは文字列であると仮定されます。Kafkaスキーマに関する詳細は[こちら](https://docs.confluent.io/platform/current/schema-registry/index.html)で確認できます。

### License {#license}
JDBCコネクタは[Confluent Community License](https://www.confluent.io/confluent-community-license)の下で配布されています。

### Steps {#steps}
#### Gather your connection details {#gather-your-connection-details}
<ConnectionDetails />

#### 1. Install Kafka Connect and Connector {#1-install-kafka-connect-and-connector}

Confluentパッケージをダウンロードしてローカルにインストールしたことを前提とします。コネクタをインストールするための手順は[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector)に記載されています。

confluent-hubインストール方法を使用する場合、ローカルの設定ファイルが更新されます。

KafkaからClickHouseにデータを送信するために、コネクタのSinkコンポーネントを使用します。

#### 2. Download and install the JDBC Driver {#2-download-and-install-the-jdbc-driver}

ClickHouse JDBCドライバ`clickhouse-jdbc-<version>-shaded.jar`を[こちら](https://github.com/ClickHouse/clickhouse-java/releases)からダウンロードしてインストールします。Kafka Connectにインストールする詳細は[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers)を参照してください。他のドライバも動作する可能性がありますが、テストは行われていません。

:::note

一般的な問題: ドキュメントではjarを`share/java/kafka-connect-jdbc/`にコピーすることを推奨しています。Connectがドライバを見つけられない場合は、ドライバを`share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`にコピーしてください。または、ドライバを含むように`plugin.path`を変更します - 以下を参照してください。

:::

#### 3. Prepare Configuration {#3-prepare-configuration}

あなたのインストールタイプに関連するConnectのセットアップは[こちらの指示](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従って行ってください。スタンドアロンと分散クラスターの違いに留意してください。Confluent Cloudを使用する場合、分散セットアップが関連します。

ClickHouseでJDBCコネクタを使用するために関連するパラメータは以下の通りです。全パラメータリストは[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html)で確認できます。

* `_connection.url_` - これは `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>`の形式である必要があります。
* `connection.user` - 対象データベースへの書き込みアクセスを持つユーザー。
* `table.name.format` - データを挿入するClickHouseテーブル。このテーブルは存在する必要があります。
* `batch.size` - 一度に送信する行の数。この値は適切に大きい数に設定してください。ClickHouseの[推奨事項](/sql-reference/statements/insert-into#performance-considerations)では、1000の値を最低限として考慮する必要があります。
* `tasks.max` - JDBC Sinkコネクタは一つまたは複数のタスクを実行することをサポートします。これはパフォーマンスを向上させるために使用できます。バッチサイズと共に、パフォーマンスを改善するための主要な手段を表します。
* `value.converter.schemas.enable` - スキーマレジストリを使用している場合はfalseに設定し、メッセージにスキーマを埋め込む場合はtrueに設定します。
* `value.converter` - データ型に応じて設定します。例えば、JSONの場合は`io.confluent.connect.json.JsonSchemaConverter`。
* `key.converter` - `org.apache.kafka.connect.storage.StringConverter`に設定します。文字列キーを使用します。
* `pk.mode` - ClickHouseには関連しません。noneに設定します。
* `auto.create` - サポートされておらず、falseにする必要があります。
* `auto.evolve` - この設定はfalseを推奨しますが、将来的にはサポートされる可能性があります。
* `insert.mode` - "insert"に設定します。他のモードは現在サポートされていません。
* `key.converter` - キーの種類に応じて設定します。
* `value.converter` - トピック上のデータに基づいて設定します。このデータにはサポートされているスキーマが必要です - JSON、Avro、またはProtobufフォーマット。

テストのためにサンプルデータセットを使用する場合は、以下を設定してください:

* `value.converter.schemas.enable` - スキーマレジストリを使用しているためfalseに設定します。各メッセージにスキーマを埋め込む場合はtrueに設定します。
* `key.converter` - "org.apache.kafka.connect.storage.StringConverter"に設定します。文字列キーを使用します。
* `value.converter` - "io.confluent.connect.json.JsonSchemaConverter"に設定します。
* `value.converter.schema.registry.url` - スキーマサーバーのURLとともに、スキーマサーバーの認証情報を`value.converter.schema.registry.basic.auth.user.info`パラメータを介して設定します。

Githubのサンプルデータに関する設定ファイルの例は[こちら](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink)にあります。これをスタンドアロンモードで実行し、KafkaがConfluent Cloudにホストされていると仮定します。

#### 4. Create the ClickHouse table {#4-create-the-clickhouse-table}

テーブルが作成されていることを確認し、以前の例から既に存在する場合は削除します。縮小されたGithubデータセットに対応した例を以下に示します。現在サポートされていないArrayやMap型がないことに注意してください:

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

#### 5. Start Kafka Connect {#5-start-kafka-connect}

[スタンドアロン](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster)または[分散](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster)モードでKafka Connectを起動します。

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Add data to Kafka {#6-add-data-to-kafka}

提供された[スクリプトと設定](https://github.com/ClickHouse/kafka-samples/tree/main/producer)を使用してKafkaにメッセージを挿入します。github.configを変更してKafkaの認証情報を含める必要があります。このスクリプトは現在Confluent Cloudでの使用に設定されています。

```bash
python producer.py -c github.config
```

このスクリプトは任意のndjsonファイルをKafkaトピックに挿入するために使用できます。これにより、自動的にスキーマを推測しようとします。提供されたサンプル設定は10,000メッセージのみを挿入するように設定されています - 必要に応じて[ここで変更](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25)してください。この設定は、Kafkaへの挿入中にデータセットから互換性のないArrayフィールドを削除します。

これは、JDBCコネクタがメッセージをINSERT文に変換するために必要です。自分のデータを使用している場合は、スキーマを各メッセージに挿入する（_value.converter.schemas.enable_をtrueに設定する）か、クライアントがレジストリにスキーマを参照してメッセージを公開するようにしてください。

Kafka Connectはメッセージの消費を開始し、ClickHouseに行を挿入するはずです。「[JDBC Compliance Mode] トランザクションはサポートされていません。」という警告が表示されることがありますが、これは予期されるものであり、無視することができます。

ターゲットテーブル「Github」を簡単に読み取ることで、データの挿入を確認できます。

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### Recommended Further Reading {#recommended-further-reading}

* [Kafka Sink Configuration Parameters](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connect Deep Dive – JDBC Source Connector](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC Sink deep-dive: Working with Primary Keys](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect in Action: JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 読むよりも見ることを好む方のために。
* [Kafka Connect Deep Dive – Converters and Serialization Explained](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
