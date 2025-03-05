---
sidebar_label: Kafka Connect JDBC コネクタ
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: Kafka Connect と ClickHouse を使用した JDBC コネクタシンク
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# JDBC コネクタ

:::note
このコネクタは、データが単純で基本的なデータ型（例: int）から成る場合のみ使用してください。map のような ClickHouse 特有のデータ型はサポートされていません。
:::

本例では、Confluent の Kafka Connect ディストリビューションを利用します。

以下では、単一の Kafka トピックからメッセージを取得し、ClickHouse テーブルに行を挿入するシンプルなインストールについて説明します。Kafka 環境を持っていない方には、十分な無料枠を提供する Confluent Cloud をお勧めします。

JDBC コネクタにはスキーマが必要である点に注意してください（JDBC コネクタではプレーンな JSON または CSV を使用できません）。スキーマは各メッセージにエンコード可能ですが、関連するオーバーヘッドを避けるために [Confluent スキーマレジストリ](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)を使用することを強くお勧めします。提供された挿入スクリプトは、メッセージからスキーマを自動的に推測し、これをレジストリに挿入します。このスクリプトは他のデータセットにも再利用可能です。Kafka のキーは文字列であると仮定しています。Kafka のスキーマに関する詳細は [こちら](https://docs.confluent.io/platform/current/schema-registry/index.html)でご覧いただけます。

### ライセンス {#license}
JDBC コネクタは [Confluent Community License](https://www.confluent.io/confluent-community-license) の下で配布されています。

### 手順 {#steps}
#### 接続詳細を集める {#gather-your-connection-details}
<ConnectionDetails />

#### 1. Kafka Connect とコネクタをインストールする {#1-install-kafka-connect-and-connector}

Confluent パッケージをダウンロードしてローカルにインストールしているものとします。コネクタのインストールに関する手順は [こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector) に記載されています。

confluent-hub インストール方法を使用する場合は、ローカル構成ファイルが更新されます。

Kafka から ClickHouse へデータを送信するために、コネクタのシンクコンポーネントを使用します。

#### 2. JDBC ドライバをダウンロードしてインストールする {#2-download-and-install-the-jdbc-driver}

[こちら](https://github.com/ClickHouse/clickhouse-java/releases) から ClickHouse JDBC ドライバ `clickhouse-jdbc-<version>-shaded.jar` をダウンロードしてインストールします。このドライバを以下の詳細に従って Kafka Connect にインストールします [こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers) を参照してください。他のドライバも機能する可能性がありますが、テストはされていません。

:::note

一般的な問題: ドキュメントでは jar を `share/java/kafka-connect-jdbc/` にコピーすることを推奨しています。コネクトがドライバを発見できない場合は、ドライバを `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/` にコピーします。または、ドライバを含むように `plugin.path` を変更します - 以下を参照してください。

:::

#### 3. 設定を準備する {#3-prepare-configuration}

[こちらの手順](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従って、インストールタイプに関連するコネクトを設定します。スタンドアロンと分散クラスターの違いに注意してください。Confluent Cloud を使用する場合は、分散セットアップが関連します。

以下のパラメータは、JDBC コネクタを ClickHouse で使用する場合に関係します。完全なパラメータリストは [こちら](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html) で見つけることができます。

* `_connection.url_` - この形式であるべきです: `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>`
* `connection.user` - 対象のデータベースに書き込み権限を持つユーザー
* `table.name.format` - データを挿入する ClickHouse テーブル。このテーブルは存在する必要があります。
* `batch.size` - 一度に送信する行の数。適切に大きな数値に設定してください。ClickHouse の [推奨事項](../../../concepts/why-clickhouse-is-so-fast.md#performance-when-inserting-data) に従い、1000 は最低値として考慮する必要があります。
* `tasks.max` - JDBC シンクコネクタは 1 つ以上のタスクを実行することができます。これを使用してパフォーマンスを向上させることができます。バッチサイズと併せて、パフォーマンス向上のための主要な手段です。
* `value.converter.schemas.enable` - スキーマレジストリを使用する場合は false に、メッセージにスキーマを埋め込む場合は true に設定します。
* `value.converter` - データ型に応じて設定します。例えば JSON の場合は、`io.confluent.connect.json.JsonSchemaConverter`。
* `key.converter` - `org.apache.kafka.connect.storage.StringConverter` に設定します。文字列キーを使用します。
* `pk.mode` - ClickHouse には関連していません。none に設定します。
* `auto.create` - サポートされておらず false に設定する必要があります。
* `auto.evolve` - この設定には false をお勧めしますが、将来的にサポートされる可能性があります。
* `insert.mode` - "insert" に設定します。他のモードは現在サポートされていません。
* `key.converter` - キーの型に応じて設定します。
* `value.converter` - トピック上のデータの型に基づいて設定します。このデータにはサポートされたスキーマが必須です - JSON、Avro または Protobuf フォーマット。

テスト用のサンプルデータセットを使用する場合、次の設定が必要です:

* `value.converter.schemas.enable` - スキーマレジストリを利用するため、false に設定します。メッセージにスキーマを埋め込む場合は true に設定します。
* `key.converter` - "org.apache.kafka.connect.storage.StringConverter" に設定します。文字列キーを使用します。
* `value.converter` - "io.confluent.connect.json.JsonSchemaConverter" に設定します。
* `value.converter.schema.registry.url` - スキーマサーバーの URL を、スキーマサーバーの認証情報と共に `value.converter.schema.registry.basic.auth.user.info` パラメータを使用して設定します。

Github サンプルデータ用の設定ファイルの例は [こちら](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink) にあります。この例では、コネクトがスタンドアロンモードで実行され、Kafka が Confluent Cloud にホストされていることが前提です。

#### 4. ClickHouse テーブルを作成する {#4-create-the-clickhouse-table}

テーブルが作成されていることを確認し、以前の例から存在する場合は削除します。以下は、減少した Github データセットと互換性のある例です。サポートされていない Array や Map タイプがないことに注意してください：

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

#### 5. Kafka Connect を開始する {#5-start-kafka-connect}

[スタンドアロン](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) または [分散](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster) モードで Kafka Connect を開始します。

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Kafka にデータを追加する {#6-add-data-to-kafka}

提供された [スクリプトと設定](https://github.com/ClickHouse/kafka-samples/tree/main/producer) を使用して Kafka にメッセージを挿入します。github.config を変更して Kafka 認証情報を含める必要があります。このスクリプトは現在 Confluent Cloud で使用するように構成されています。

```bash
python producer.py -c github.config
```

このスクリプトは、任意の ndjson ファイルを Kafka トピックに挿入するために使用できます。これにより、スキーマを自動的に推測しようとします。提供されたサンプル構成は 10,000 メッセージしか挿入しません - 必要に応じて [ここで変更](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25) してください。この構成は、挿入時に Kafka に対して互換性のない Array フィールドをデータセットから削除します。

これは、JDBC コネクタがメッセージを INSERT ステートメントに変換するために必要です。独自のデータを使用している場合は、各メッセージにスキーマを挿入するか（`_value.converter.schemas.enable_を true に設定`）、クライアントがスキーマを参照するメッセージをレジストリに発行することを確認してください。

Kafka Connect はメッセージの消費を開始し、ClickHouse に行を挿入するはずです。「[JDBC コンプライアントモード] トランザクションはサポートされていません。」に関する警告は予想されるものであり、無視しても問題ありません。

ターゲットテーブル "Github" で簡単な読み取りを行い、データの挿入を確認してください。

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### おすすめの参考文献 {#recommended-further-reading}

* [Kafka シンク構成パラメータ](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connect 深掘り- JDBC ソースコネクタ](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC シンク深掘り: 主キーを扱う](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect in Action: JDBC シンク](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 読むより見るのが好きな方に。
* [Kafka Connect 深掘り - コンバータとシリアライズの説明](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
