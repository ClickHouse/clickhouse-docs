---
sidebar_label: 'Kafka Connect JDBC コネクタ'
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: 'Kafka Connect と ClickHouse で JDBC Sink Connector を使用する'
title: 'JDBC コネクタ'
doc_type: 'guide'
keywords: ['kafka', 'kafka connect', 'jdbc', 'integration', 'data pipeline']
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# JDBC コネクタ \\{#jdbc-connector\\}

:::note
このコネクタは、データが単純で、`int` などのプリミティブ型で構成されている場合にのみ使用してください。ClickHouse 固有の型（例: map）はサポートされていません。
:::

以下の例では、Kafka Connect の Confluent ディストリビューションを使用します。

ここでは、単一の Kafka トピックからメッセージを取得し、ClickHouse テーブルに行を挿入するシンプルなインストール方法について説明します。Kafka 環境をお持ちでない方には、無償枠が充実している Confluent Cloud の利用を推奨します。

JDBC コネクタにはスキーマが必須であることに注意してください（JDBC コネクタではプレーンな JSON や CSV は使用できません）。スキーマは各メッセージにエンコードすることもできますが、関連するオーバーヘッドを避けるために[Confluent Schema Registry を使用することが強く推奨されます](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)。ここで提供する挿入スクリプトは、メッセージからスキーマを自動的に推論してレジストリに登録するため、このスクリプトは他のデータセットにも再利用できます。Kafka のキーは String であることを前提としています。Kafka のスキーマの詳細は[こちら](https://docs.confluent.io/platform/current/schema-registry/index.html)を参照してください。

### ライセンス \\{#license\\}
JDBC コネクタは [Confluent Community License](https://www.confluent.io/confluent-community-license) の下で配布されています。

### 手順 \\{#steps\\}
#### 接続情報を収集する \\{#gather-your-connection-details\\}
<ConnectionDetails />

#### 1. Kafka Connect とコネクタをインストールする \\{#1-install-kafka-connect-and-connector\\}

Confluent パッケージをダウンロードしてローカルにインストール済みであることを前提とします。コネクタのインストール手順については、[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector)に記載されている手順に従ってください。

`confluent-hub` によるインストール方法を使用した場合、ローカルの設定ファイルが更新されます。

Kafka から ClickHouse へデータを送信するには、コネクタの Sink コンポーネントを使用します。

#### 2. JDBC ドライバをダウンロードしてインストールする \\{#2-download-and-install-the-jdbc-driver\\}

ClickHouse JDBC ドライバ `clickhouse-jdbc-<version>-shaded.jar` を[こちら](https://github.com/ClickHouse/clickhouse-java/releases)からダウンロードしてインストールします。Kafka Connect へのインストール方法は[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers)に従ってください。他のドライバも動作する可能性はありますが、検証は行っていません。

:::note

よくある問題: ドキュメントでは、jar を `share/java/kafka-connect-jdbc/` にコピーするように案内しています。Connect がドライバを見つけられない問題が発生した場合は、ドライバを `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/` にコピーしてください。もしくは、下記のように `plugin.path` を修正してドライバを含めてください。

:::

#### 3. 設定を準備する \\{#3-prepare-configuration\\}

スタンドアロンと分散クラスタの違いに注意しながら、インストール形態に応じた Connect のセットアップについては、[これらの手順](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従ってください。Confluent Cloud を使用する場合は、分散構成が該当します。

以下のパラメータは、ClickHouse で JDBC コネクタを使用する際に関連するものです。パラメータの完全な一覧は[こちら](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html)で確認できます。

* `_connection.url_` - これは `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>` の形式にする必要があります
* `connection.user` - 対象データベースへの書き込み権限を持つユーザー
* `table.name.format`- データを挿入する ClickHouse テーブル。事前に作成されている必要があります。
* `batch.size` - 1 回のバッチで送信する行数。十分に大きな値に設定してください。ClickHouse の[推奨事項](/sql-reference/statements/insert-into#performance-considerations) に従い、1000 を最小値として検討してください。
* `tasks.max` - JDBC Sink コネクタは 1 つ以上のタスクで実行できます。これは性能向上に利用できます。`batch.size` と併用することで、主な性能改善手段となります。
* `value.converter.schemas.enable` - スキーマレジストリを使用する場合は false、メッセージ内にスキーマを埋め込む場合は true に設定します。
* `value.converter` - 利用するデータ型に応じて設定します。例: JSON の場合は `io.confluent.connect.json.JsonSchemaConverter`。
* `key.converter` - `org.apache.kafka.connect.storage.StringConverter` を設定します。キーは文字列を使用します。
* `pk.mode` - ClickHouse には関連しません。`none` に設定してください。
* `auto.create` - サポートされていないため、false に設定する必要があります。
* `auto.evolve` - 将来的にサポートされる可能性はありますが、この設定は false にすることを推奨します。
* `insert.mode` - "insert" に設定します。他のモードは現在サポートされていません。
* `key.converter` - キーの型に応じて設定します。
* `value.converter` - トピック上のデータ型に基づいて設定します。このデータは JSON、Avro、Protobuf 形式のいずれかのサポート対象スキーマを持っている必要があります。

テスト用にサンプルデータセットを使用する場合は、次の設定になっていることを確認してください:

* `value.converter.schemas.enable` - スキーマレジストリを利用するため false に設定します。各メッセージにスキーマを埋め込む場合は true に設定します。
* `key.converter` - "org.apache.kafka.connect.storage.StringConverter" に設定します。キーは文字列を使用します。
* `value.converter` - "io.confluent.connect.json.JsonSchemaConverter" に設定します。
* `value.converter.schema.registry.url` - スキーマサーバーの URL を設定し、パラメータ `value.converter.schema.registry.basic.auth.user.info` を通じてスキーマサーバーの認証情報を指定します。

GitHub サンプルデータ用の設定ファイル例は、Connect をスタンドアロンモードで実行し、Kafka を Confluent Cloud 上でホストしていることを前提として、[こちら](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink) から参照できます。

#### 4. ClickHouse テーブルを作成する \\{#4-create-the-clickhouse-table\\}

テーブルが作成されていることを確認し、以前の例で既に存在する場合は削除してください。縮小版 GitHub データセットと互換性のある例を以下に示します。現在サポートされていない Array 型や Map 型が存在しないことに注意してください。

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

#### 5. Kafka Connect を起動する \\{#5-start-kafka-connect\\}

Kafka Connect を [スタンドアロン](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) モードまたは [分散](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster) モードのいずれかで起動します。

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. Kafka にデータを追加する \\{#6-add-data-to-kafka\\}

提供されている[スクリプトと設定](https://github.com/ClickHouse/kafka-samples/tree/main/producer)を使用して、メッセージを Kafka に送信します。`github.config` を編集し、Kafka の認証情報を設定する必要があります。スクリプトは現在、Confluent Cloud での使用向けに構成されています。

```bash
python producer.py -c github.config
```

このスクリプトは、任意の ndjson ファイルを Kafka トピックに挿入するために使用できます。自動的にスキーマの推論を試みます。提供されているサンプル設定では 1 万件のメッセージのみを挿入します。必要に応じて [こちらを変更](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25) してください。この設定では、Kafka への挿入時に、データセット内の互換性のない Array フィールドも削除します。

JDBC connector がメッセージを INSERT ステートメントに変換するためには、この設定が必要です。独自のデータを使用する場合は、(&#95;value.converter.schemas.enable を true に設定して) 各メッセージにスキーマを含めて送信するか、クライアントがスキーマを参照するメッセージをレジストリに公開していることを確認してください。

Kafka Connect はメッセージの消費を開始し、ClickHouse に行を挿入し始めるはずです。「[JDBC Compliant Mode] Transaction is not supported.」に関する警告メッセージが出力されることがありますが、これは想定された動作であり無視してかまいません。

対象テーブル &quot;Github&quot; に対して単純な読み取りを行うことで、データが挿入されたことを確認できます。

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### おすすめの参考資料 \\{#recommended-further-reading\\}

* [Kafka Sink 構成パラメータ](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connect Deep Dive – JDBC Source Connector](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC Sink 詳解: プライマリキーの扱い](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect in Action: JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - テキストで読むより動画で学びたい人向け。
* [Kafka Connect Deep Dive – Converters and Serialization Explained](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
