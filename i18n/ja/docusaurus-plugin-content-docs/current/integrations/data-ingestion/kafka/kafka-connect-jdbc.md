---
sidebar_label: Kafka Connect JDBCコネクタ
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: Kafka ConnectとClickHouseを使用したJDBCコネクタシンク
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# JDBCコネクタ

:::note
このコネクタは、データが単純で、intなどのプリミティブデータ型で構成されている場合のみ使用してください。マップなどのClickHouse固有の型はサポートされていません。
:::

私たちの例では、Kafka ConnectのConfluentディストリビューションを使用します。

以下では、単一のKafkaトピックからメッセージを取得し、ClickHouseテーブルに行を挿入するシンプルなインストールを説明します。Kafka環境を持っていない方には、寛大な無料プランを提供しているConfluent Cloudをお勧めします。

JDBCコネクタにはスキーマが必要であることに注意してください（JDBCコネクタではプレーンJSONやCSVを使用できません）。スキーマは各メッセージにエンコードできますが、関連するオーバーヘッドを回避するためには[Confluentスキーマレジストリを使用することを強くお勧めします](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)。提供される挿入スクリプトは、自動的にメッセージからスキーマを推測し、これをレジストリに挿入します。このスクリプトは他のデータセットでも再利用できます。KafkaのキーはStringであると仮定しています。Kafkaスキーマに関する詳細は[こちら](https://docs.confluent.io/platform/current/schema-registry/index.html)で確認できます。

### ライセンス {#license}
JDBCコネクタは[Confluent Community License](https://www.confluent.io/confluent-community-license)の下に配布されています。

### 手順 {#steps}
#### 接続詳細の収集 {#gather-your-connection-details}
<ConnectionDetails />

#### 1. Kafka Connectとコネクタのインストール {#1-install-kafka-connect-and-connector}

Confluentパッケージをダウンロードし、ローカルにインストールしたと仮定します。コネクタのインストールに関する詳しい指示は[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector)を参照してください。

confluent-hubインストール方法を使用する場合、ローカルの設定ファイルが更新されます。

KafkaからClickHouseにデータを送信するために、コネクタのシンクコンポーネントを使用します。

#### 2. JDBCドライバーのダウンロードとインストール {#2-download-and-install-the-jdbc-driver}

[こちら](https://github.com/ClickHouse/clickhouse-java/releases)からClickHouse JDBCドライバー `clickhouse-jdbc-<version>-shaded.jar` をダウンロードしてインストールします。このドライバーをKafka Connectにインストールする手順については[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers)を参照してください。他のドライバーも動作する可能性がありますが、テストされていません。

:::note

一般的な問題: ドキュメントでは、jarを `share/java/kafka-connect-jdbc/` にコピーすることを推奨しています。ドライバーを見つけられない場合は、ドライバーを `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/` にコピーするか、`plugin.path`を修正してドライバーを含めてください。詳細は以下を参照してください。

:::

#### 3. 設定の準備 {#3-prepare-configuration}

[これらの指示](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従って、インストールタイプに関連したConnectを設定します。スタンドアロンと分散クラスターの違いに注意してください。Confluent Cloudを使用している場合は、分散セットアップが関連します。

以下のパラメーターは、ClickHouseでJDBCコネクタを使用する際に関連します。完全なパラメーターリストは[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html)で確認できます。

* `_connection.url_` - これは `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>` の形式である必要があります。
* `connection.user` - 対象データベースへの書き込みアクセス権を持つユーザー。
* `table.name.format` - データを挿入するClickHouseテーブル。このテーブルは存在しなければなりません。
* `batch.size` - 一度に送信する行の数。適切な大きな数に設定してください。ClickHouseの[推奨事項](../../../concepts/why-clickhouse-is-so-fast.md#performance-when-inserting-data)では、1000は最低値と見なされるべきです。
* `tasks.max` - JDBCシンクコネクタは、1つ以上のタスクを実行することをサポートします。これはパフォーマンスを向上させるために使用できます。バッチサイズと共に、パフォーマンスを改善するための主要な手段を表します。
* `value.converter.schemas.enable` - スキーマレジストリを使用する場合はfalse、メッセージにスキーマを埋め込む場合はtrueに設定します。
* `value.converter` - データ型に応じて設定します。たとえば、JSONの場合は `io.confluent.connect.json.JsonSchemaConverter`。
* `key.converter` - `org.apache.kafka.connect.storage.StringConverter`に設定します。Stringキーを利用します。
* `pk.mode` - ClickHouseに関連なし。noneに設定します。
* `auto.create` - サポートされておらず、falseである必要があります。
* `auto.evolve` - この設定は将来的にサポートされるかもしれませんが、現在はfalseを推奨します。
* `insert.mode` - "insert"に設定します。他のモードは現在サポートされていません。
* `key.converter` - キーの型に応じて設定します。
* `value.converter` - トピック上のデータの型に基づいて設定します。このデータはサポートされるスキーマ - JSON、Avro、またはProtobuf形式を持っている必要があります。

テスト用のサンプルデータセットを使用する場合は、以下の設定が必要です。

* `value.converter.schemas.enable` - スキーマレジストリを利用しているためfalseに設定します。各メッセージにスキーマを埋め込む場合はtrueに設定します。
* `key.converter` - "org.apache.kafka.connect.storage.StringConverter"に設定します。Stringキーを利用します。
* `value.converter` - "io.confluent.connect.json.JsonSchemaConverter"に設定します。
* `value.converter.schema.registry.url` - スキーマサーバーのURLと、スキーマサーバーの認証情報を`value.converter.schema.registry.basic.auth.user.info`パラメーターを使用して設定します。

Githubのサンプルデータ用の設定ファイルの例は、[こちら](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink)で確認できます。Connectがスタンドアロンモードで実行され、KafkaがConfluent Cloudにホストされていると仮定しています。

#### 4. ClickHouseテーブルの作成 {#4-create-the-clickhouse-table}

テーブルが作成されていることを確認し、前の例からすでに存在する場合は削除してください。Githubの縮小データセットに対応した例を以下に示します。現在サポートされていないArrayやMap型が存在しないことに注意してください。

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

[スタンドアロン](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster)または[分散](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster)モードでKafka Connectを起動します。

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Kafkaにデータを追加 {#6-add-data-to-kafka}

提供された[スクリプトと設定](https://github.com/ClickHouse/kafka-samples/tree/main/producer)を使用して、Kafkaにメッセージを挿入します。github.configを変更してKafkaの認証情報を含める必要があります。このスクリプトは現在、Confluent Cloudでの使用のために構成されています。

```bash
python producer.py -c github.config
```

このスクリプトは任意のndjsonファイルをKafkaトピックに挿入するために使用できます。自動的にスキーマを推測しようとします。サンプル設定は10kメッセージのみ挿入されます- [ここを変更](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25)する必要がある場合は変更してください。この設定は、Kafkaへの挿入中にデータセットから互換性のないArrayフィールドを削除します。

これはJDBCコネクタがメッセージをINSERT文に変換するために必要です。独自のデータを使用している場合は、各メッセージにスキーマを挿入するか（_value.converter.schemas.enable_をtrueに設定）、クライアントがメッセージをスキーマに基づいてレジストリに公開するようにしてください。

Kafka Connectはメッセージを消費し始め、ClickHouseに行を挿入するはずです。"[JDBC Compliant Mode] トランザクションはサポートされていません。"に関する警告は予期されるものであり、無視しても問題ありません。

ターゲットテーブル"Github"でシンプルに読み取ることでデータ挿入を確認できます。

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### おすすめのさらなる読み物 {#recommended-further-reading}

* [Kafkaシンク設定パラメータ](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connectの深堀り – JDBCソースコネクタ](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBCシンクの深堀り: 主キーの取り扱い](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect in Action: JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 読むよりも見ることを好む方に。
* [Kafka Connectの深堀り – コンバータとシリアリゼーションの説明](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
