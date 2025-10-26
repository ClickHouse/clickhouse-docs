---
'sidebar_label': 'Kafka Connect JDBC コネクタ'
'sidebar_position': 4
'slug': '/integrations/kafka/kafka-connect-jdbc'
'description': 'Kafka Connect と ClickHouse を使用した JDBC コネクタ シンク'
'title': 'JDBC コネクタ'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# JDBCコネクタ

:::note
このコネクタは、データがシンプルであり、整数などの基本データ型で構成されている場合のみ使用するべきです。 ClickHouse特有のタイプ（マップなど）はサポートされていません。
:::

例として、私たちはKafka ConnectのConfluentディストリビューションを利用します。

以下に、単一のKafkaトピックからメッセージを取得し、ClickHouseテーブルに行を挿入する簡単なインストール手順を説明します。 Kafka環境を持っていない方には、寛大な無料プランを提供するConfluent Cloudをお勧めします。

JDBCコネクタにはスキーマが必要であることに注意してください（JDBCコネクタにはプレーンなJSONまたはCSVを使用できません）。スキーマを各メッセージにエンコードすることも可能ですが、関連するオーバーヘッドを回避するために、[Confluentスキーマレジストリを使用することを強く推奨します](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)。提供された挿入スクリプトは、メッセージから自動的にスキーマを推測し、これをレジストリに挿入します - このスクリプトは他のデータセットにも再利用可能です。Kafkaのキーは文字列であると仮定されます。Kafkaスキーマに関する詳細は[こちら](https://docs.confluent.io/platform/current/schema-registry/index.html)にあります。

### ライセンス {#license}
JDBCコネクタは[Confluent Community License](https://www.confluent.io/confluent-community-license)の下で配布されています。

### 手順 {#steps}
#### 接続情報の収集 {#gather-your-connection-details}
<ConnectionDetails />

#### 1. Kafka Connectとコネクタのインストール {#1-install-kafka-connect-and-connector}

Confluentパッケージをダウンロードし、ローカルにインストールしたと仮定します。コネクタのインストール手順については、[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector)に記載されています。

confluent-hubインストールメソッドを使用する場合、ローカルの設定ファイルは更新されます。

KafkaからClickHouseにデータを送信するには、コネクタのシンクコンポーネントを使用します。

#### 2. JDBCドライバのダウンロードとインストール {#2-download-and-install-the-jdbc-driver}

[こちら](https://github.com/ClickHouse/clickhouse-java/releases)から`clickhouse-jdbc-<version>-shaded.jar`というClickHouse JDBCドライバをダウンロードし、インストールします。Kafka Connectへのインストール手順は[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers)に従ってください。他のドライバも機能する場合がありますが、テストされていません。

:::note

一般的な問題：ドキュメントではjarを`share/java/kafka-connect-jdbc/`にコピーするよう示されています。Connectがドライバを見つけられない場合は、ドライバを`share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`にコピーしてください。または、ドライバを含めるように`plugin.path`を修正してください - 詳細は以下の通りです。

:::

#### 3. 設定の準備 {#3-prepare-configuration}

[これらの手順](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従って、インストールタイプに関連するConnectのセットアップを行います。スタンドアロンと分散クラスタの違いに注意してください。Confluent Cloudを使用する場合は、分散セットアップが関連します。

以下のパラメータは、ClickHouseでJDBCコネクタを使用するために関連します。完全なパラメータリストは[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html)にあります：

* `_connection.url_` - 形式は`jdbc:clickhouse://&lt;clickhouse host&gt;:&lt;clickhouse http port&gt;/&lt;target database&gt;`にする必要があります
* `connection.user` - 対象データベースへの書き込みアクセスを持つユーザー
* `table.name.format` - データを挿入するClickHouseテーブル。これが存在する必要があります。
* `batch.size` - 一度に送信する行数。適切に大きな数に設定してください。ClickHouseの[推奨事項](/sql-reference/statements/insert-into#performance-considerations)によると、1000の値は最低限考慮すべきです。
* `tasks.max` - JDBCシンクコネクタは1つ以上のタスクを実行することをサポートしています。これを使用してパフォーマンスを向上させます。バッチサイズと合わせて、パフォーマンス向上の主要な手段を表します。
* `value.converter.schemas.enable` - スキーマレジストリを使用している場合はfalse、メッセージにスキーマを埋め込んでいる場合はtrueに設定します。
* `value.converter` - データ型に応じて設定します。例えばJSONの場合、`io.confluent.connect.json.JsonSchemaConverter`です。
* `key.converter` - `org.apache.kafka.connect.storage.StringConverter`に設定します。Stringキーを使用しています。
* `pk.mode` - ClickHouseには関係ありません。noneに設定します。
* `auto.create` - サポートされておらず、falseでなければなりません。
* `auto.evolve` - この設定についてはfalseを推奨しますが、将来的にはサポートされるかもしれません。
* `insert.mode` - "insert"に設定します。他のモードは現在サポートされていません。
* `key.converter` - キーのタイプに応じて設定します。
* `value.converter` - トピック内のデータのタイプに基づいて設定します。このデータにはサポートされているスキーマが必要です - JSON、AvroまたはProtobuf形式。

テスト用のサンプルデータセットを使用している場合は、以下が設定されていることを確認してください：

* `value.converter.schemas.enable` - スキーマレジストリを使用しているためfalseに設定します。各メッセージにスキーマを埋め込んでいる場合はtrueに設定します。
* `key.converter` - "org.apache.kafka.connect.storage.StringConverter"に設定します。Stringキーを使用しています。
* `value.converter` - "io.confluent.connect.json.JsonSchemaConverter"に設定します。
* `value.converter.schema.registry.url` - スキーマサーバーのURLと、スキーマサーバーの認証情報を`value.converter.schema.registry.basic.auth.user.info`パラメータを通じて設定します。

Githubサンプルデータ用の設定ファイル例は、[こちら](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink)で見つけられます。Connectがスタンドアロンモードで実行され、KafkaがConfluent Cloudでホストされていると仮定します。

#### 4. ClickHouseテーブルを作成する {#4-create-the-clickhouse-table}

テーブルが作成されていることを確認し、以前の例から既に存在する場合は削除します。簡易化されたGithubデータセットに互換性のある例を以下に示します。現在サポートされていないArrayまたはMapタイプがないことに注意してください：

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

提供された[スクリプトと設定](https://github.com/ClickHouse/kafka-samples/tree/main/producer)を使用してKafkaにメッセージを挿入します。github.configを変更してKafkaの認証情報を追加する必要があります。スクリプトは現在Confluent Cloudでの使用に設定されています。

```bash
python producer.py -c github.config
```

このスクリプトは、任意のndjsonファイルをKafkaトピックに挿入するために使用できます。このスクリプトは自動的にスキーマを推測しようとします。提供されたサンプル設定は10,000メッセージのみを挿入します - 必要に応じて[ここを変更](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25)してください。この設定は、Kafkaへの挿入中に不適合なArrayフィールドをデータセットから除去します。

これはJDBCコネクタがメッセージをINSERT文に変換するために必要です。自分のデータを使用している場合は、スキーマを各メッセージに挿入するか（`_value.converter.schemas.enable_`をtrueに設定）、クライアントがスキーマをレジストリに参照するメッセージを公開することを確実にしてください。

Kafka Connectはメッセージを消費し、ClickHouseに行を挿入し始めるはずです。" [JDBC Compliant Mode] トランザクションはサポートされていません。"という警告は予想され、無視可能です。

対象テーブル「Github」で簡単に読んでデータ挿入を確認してください。

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### 推奨されるさらなる読み物 {#recommended-further-reading}

* [Kafkaシンク構成パラメータ](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connect Deep Dive – JDBCソースコネクタ](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBCシンクの詳細: 主キーの操作](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect in Action: JDBCシンク](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 読むより、見ることを好む方向け。
* [Kafka Connect Deep Dive – コンバータとシリアル化の説明](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
