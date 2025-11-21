---
sidebar_label: 'Kafka Connect JDBC シンクコネクタ'
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: 'Kafka Connect と ClickHouse で JDBC シンクコネクタを使用する'
title: 'JDBC シンクコネクタ'
doc_type: 'guide'
keywords: ['kafka', 'kafka connect', 'jdbc', 'integration', 'data pipeline']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# JDBCコネクタ

:::note
このコネクタは、データが単純でプリミティブなデータ型（例：int）で構成されている場合にのみ使用してください。マップなどのClickHouse固有の型はサポートされていません。
:::

本例では、Kafka ConnectのConfluent版を使用します。

以下では、単一のKafkaトピックからメッセージを取得し、ClickHouseテーブルに行を挿入する簡単なインストール方法について説明します。Kafka環境をお持ちでない方には、充実した無料プランを提供しているConfluent Cloudを推奨します。

JDBCコネクタにはスキーマが必要です（JDBCコネクタでは、プレーンなJSONやCSVは使用できません）。スキーマは各メッセージにエンコードすることもできますが、関連するオーバーヘッドを回避するために[Confluentスキーマレジストリの使用が強く推奨されます](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)。提供されている挿入スクリプトは、メッセージからスキーマを自動的に推論し、レジストリに挿入します。したがって、このスクリプトは他のデータセットにも再利用できます。Kafkaのキーは文字列であると想定されています。Kafkaスキーマの詳細については、[こちら](https://docs.confluent.io/platform/current/schema-registry/index.html)を参照してください。

### ライセンス {#license}

JDBCコネクタは[Confluent Community License](https://www.confluent.io/confluent-community-license)の下で配布されています。

### 手順 {#steps}

#### 接続情報の収集 {#gather-your-connection-details}

<ConnectionDetails />

#### 1. Kafka Connectとコネクタのインストール {#1-install-kafka-connect-and-connector}

Confluentパッケージをダウンロードし、ローカルにインストール済みであることを前提としています。コネクタのインストールについては、[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector)に記載されているインストール手順に従ってください。

confluent-hubインストール方法を使用する場合、ローカルの設定ファイルが更新されます。

KafkaからClickHouseへデータを送信するには、コネクタのSinkコンポーネントを使用します。

#### 2. JDBCドライバのダウンロードとインストール {#2-download-and-install-the-jdbc-driver}

ClickHouse JDBCドライバ`clickhouse-jdbc-<version>-shaded.jar`を[こちら](https://github.com/ClickHouse/clickhouse-java/releases)からダウンロードしてインストールしてください。[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers)の詳細に従って、Kafka Connectにインストールしてください。他のドライバも動作する可能性がありますが、テストされていません。

:::note

よくある問題：ドキュメントではjarファイルを`share/java/kafka-connect-jdbc/`にコピーすることを推奨していますが、Connectがドライバを見つけられない問題が発生した場合は、ドライバを`share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`にコピーしてください。または、`plugin.path`を変更してドライバを含めることもできます（以下を参照）。

:::

#### 3. 設定の準備 {#3-prepare-configuration}

インストールタイプに応じたConnectのセットアップについては、[こちらの手順](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従ってください。スタンドアロンと分散クラスタの違いに注意してください。Confluent Cloudを使用する場合は、分散セットアップが該当します。

以下のパラメータは、ClickHouseでJDBCコネクタを使用する際に関連します。完全なパラメータリストは[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html)で確認できます：


- `_connection.url_` - `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>` の形式で指定します
- `connection.user` - ターゲットデータベースへの書き込みアクセス権を持つユーザー
- `table.name.format`- データを挿入するClickHouseテーブル。事前に存在している必要があります。
- `batch.size` - 1回のバッチで送信する行数。適切に大きな値に設定してください。ClickHouseの[推奨事項](/sql-reference/statements/insert-into#performance-considerations)では、最小値として1000を設定することを推奨しています。
- `tasks.max` - JDBC Sinkコネクタは1つ以上のタスクの実行をサポートしています。パフォーマンス向上に利用できます。バッチサイズと併せて、パフォーマンスを改善する主要な手段となります。
- `value.converter.schemas.enable` - スキーマレジストリを使用する場合はfalseに、メッセージにスキーマを埋め込む場合はtrueに設定します。
- `value.converter` - データ型に応じて設定します。例えば、JSONの場合は`io.confluent.connect.json.JsonSchemaConverter`を指定します。
- `key.converter` - `org.apache.kafka.connect.storage.StringConverter`に設定します。文字列キーを使用します。
- `pk.mode` - ClickHouseには関係ありません。noneに設定します。
- `auto.create` - サポートされていないため、falseに設定する必要があります。
- `auto.evolve` - この設定にはfalseを推奨しますが、将来的にサポートされる可能性があります。
- `insert.mode` - "insert"に設定します。他のモードは現在サポートされていません。
- `key.converter` - キーの型に応じて設定します。
- `value.converter` - トピック上のデータの型に基づいて設定します。このデータはサポートされているスキーマ（JSON、Avro、またはProtobuf形式）を持つ必要があります。

テスト用にサンプルデータセットを使用する場合は、以下を設定してください：

- `value.converter.schemas.enable` - スキーマレジストリを使用するためfalseに設定します。各メッセージにスキーマを埋め込む場合はtrueに設定します。
- `key.converter` - "org.apache.kafka.connect.storage.StringConverter"に設定します。文字列キーを使用します。
- `value.converter` - "io.confluent.connect.json.JsonSchemaConverter"に設定します。
- `value.converter.schema.registry.url` - スキーマサーバーのURLを設定し、`value.converter.schema.registry.basic.auth.user.info`パラメータでスキーマサーバーの認証情報を指定します。

Githubサンプルデータの設定ファイル例は[こちら](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink)で確認できます。これはConnectがスタンドアロンモードで実行され、KafkaがConfluent Cloudでホストされていることを前提としています。

#### 4. ClickHouseテーブルの作成 {#4-create-the-clickhouse-table}

テーブルが作成されていることを確認し、以前の例から既に存在する場合は削除してください。縮小版Githubデータセットと互換性のある例を以下に示します。現在サポートされていないArray型やMap型が含まれていないことに注意してください：


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

Kafka Connectを[スタンドアロン](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster)モードまたは[分散](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster)モードで起動します。

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Kafkaへのデータ追加 {#6-add-data-to-kafka}

提供されている[スクリプトと設定ファイル](https://github.com/ClickHouse/kafka-samples/tree/main/producer)を使用してKafkaにメッセージを挿入します。github.configを変更してKafkaの認証情報を含める必要があります。このスクリプトは現在Confluent Cloudでの使用向けに設定されています。

```bash
python producer.py -c github.config
```

このスクリプトは、任意のndjsonファイルをKafkaトピックに挿入するために使用できます。スキーマは自動的に推論されます。提供されているサンプル設定では10,000件のメッセージのみが挿入されます。必要に応じて[こちらで変更](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25)してください。この設定では、Kafkaへの挿入時にデータセットから互換性のないArray型のフィールドも削除されます。

これは、JDBCコネクタがメッセージをINSERT文に変換するために必要です。独自のデータを使用する場合は、各メッセージにスキーマを含めるか(\_value.converter.schemas.enable\_をtrueに設定)、クライアントがレジストリ内のスキーマを参照するメッセージを発行するようにしてください。

Kafka Connectはメッセージの消費を開始し、ClickHouseに行を挿入します。「[JDBC Compliant Mode] Transaction is not supported.」という警告は想定されるものであり、無視して構いません。

対象テーブル「Github」に対する簡単な読み取りで、データの挿入を確認できます。

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### 推奨される関連資料 {#recommended-further-reading}


* [Kafka シンク設定パラメータ](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connect Deep Dive – JDBC ソースコネクタ](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC シンク徹底解説: プライマリキーの扱い](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect in Action: JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 読むより視聴を好む方はこちらをどうぞ。
* [Kafka Connect Deep Dive – コンバータとシリアライゼーションの解説](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
