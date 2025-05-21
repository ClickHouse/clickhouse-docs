---
sidebar_label: 'Kafkaとのベクトル'
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: 'KafkaとClickHouseを用いたベクトルの使用法'
title: 'KafkaとClickHouseを用いたベクトルの使用法'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';

## KafkaとClickHouseを用いたベクトルの使用 {#using-vector-with-kafka-and-clickhouse}

Vectorは、Kafkaからの読み取りとClickHouseへのイベント送信を可能にするベンダーに依存しないデータパイプラインです。

ClickHouseとのVectorの使用に関する[始め方](../etl-tools/vector-to-clickhouse.md)ガイドは、ログのユースケースとファイルからのイベントの読み取りに焦点を当てています。私たちは、Kafkaトピックに保持されるイベントと共に[Githubサンプルデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を利用します。

Vectorは、プッシュまたはプルモデルを通じてデータを取得するために[ソース](https://vector.dev/docs/about/concepts/#sources)を利用します。[シンク](https://vector.dev/docs/about/concepts/#sinks)は、一方でイベントの宛先を提供します。したがって、私たちはKafkaソースとClickHouseシンクを利用します。Kafkaがシンクとしてサポートされている一方で、ClickHouseソースは利用できないことに注意してください。そのため、ClickHouseからKafkaにデータを転送したいユーザーにはVectorは適していません。

また、Vectorはデータの[変換](https://vector.dev/docs/reference/configuration/transforms/)をサポートしていますが、これはこのガイドの範囲を超えています。このデータセットに関して必要がある場合は、Vectorのドキュメントを参照してください。

現在のClickHouseシンクの実装はHTTPインターフェースを利用していることに注意してください。ClickHouseシンクは、現時点ではJSONスキーマの使用をサポートしていません。データは、プレーンJSON形式または文字列としてKafkaに公開されなければなりません。

### ライセンス {#license}
Vectorは[MPL-2.0ライセンス](https://github.com/vectordotdev/vector/blob/master/LICENSE)の下で配布されています。

### 接続詳細の収集 {#gather-your-connection-details}
<ConnectionDetails />

### ステップ {#steps}

1. Kafka `github` トピックを作成し、[Githubデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を挿入します。

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

このデータセットは、`ClickHouse/ClickHouse`リポジトリに関連する200,000行で構成されています。

2. 対象テーブルが作成されていることを確認します。以下ではデフォルトデータベースを使用します。

```sql
CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4,
                    'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
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
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at);
```

3. [Vectorのダウンロードとインストール](https://vector.dev/docs/setup/quickstart/)を行います。`kafka.toml`設定ファイルを作成し、自分のKafkaおよびClickHouseインスタンスの値に修正します。

```toml
[sources.github]
type = "kafka"
auto_offset_reset = "smallest"
bootstrap_servers = "<kafka_host>:<kafka_port>"
group_id = "vector"
topics = [ "github" ]
tls.enabled = true
sasl.enabled = true
sasl.mechanism = "PLAIN"
sasl.username = "<username>"
sasl.password = "<password>"
decoding.codec = "json"

[sinks.clickhouse]
type = "clickhouse"
inputs = ["github"]
endpoint = "http://localhost:8123"
database = "default"
table = "github"
skip_unknown_fields = true
auth.strategy = "basic"
auth.user = "username"
auth.password = "password"
buffer.max_events = 10000
batch.timeout_secs = 1
```

この設定およびVectorの動作に関する重要な注意点：

- この例はConfluent Cloudに対してテストされています。したがって、`sasl.*`および`ssl.enabled`のセキュリティオプションは、セルフマネージドの場合には適切でない可能性があります。
- 構成パラメータ`bootstrap_servers`にはプロトコルプレフィックスは必要ありません。例：`pkc-2396y.us-east-1.aws.confluent.cloud:9092`
- ソースパラメータ`decoding.codec = "json"`は、メッセージがClickHouseシンクに単一のJSONオブジェクトとして渡されることを保証します。メッセージを文字列として処理し、デフォルトの`bytes`値を使用すると、メッセージの内容が`message`フィールドに追加されます。ほとんどの場合、この処理は[Vector始め方ガイド](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs)にあるようにClickHouseで行う必要があります。
- Vectorはメッセージに[多くのフィールド](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)を追加します。私たちの例では、構成パラメータ`skip_unknown_fields = true`を介してClickHouseシンクでこれらのフィールドを無視します。これにより、ターゲットテーブルスキーマの一部でないフィールドが無視されます。必要に応じてスキーマを調整し、`offset`のようなメタフィールドが追加されるようにしてください。
- シンクは、パラメータ`inputs`を介してイベントのソースを参照していることに注意してください。
- ClickHouseシンクの動作については[こちら](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)を参照してください。最適なスループットのために、ユーザーは`buffer.max_events`、`batch.timeout_secs`、`batch.max_bytes`パラメータを調整することをお勧めします。ClickHouseの[推奨事項](/sql-reference/statements/insert-into#performance-considerations)によれば、単一バッチ内のイベント数の最小値は1000を考慮するべきです。均一な高スループットのユースケースでは、ユーザーは`buffer.max_events`パラメータを増やすことができます。変動のあるスループットには、`batch.timeout_secs`パラメータの変更が必要になることがあります。
- パラメータ`auto_offset_reset = "smallest"`はKafkaソースがトピックの最初から開始するように強制し、このステップ（1）で公開されたメッセージを消費できるようにします。ユーザーには異なる動作が必要な場合があります。[こちら](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)で詳細をご確認ください。

4. Vectorを起動します。

```bash
vector --config ./kafka.toml
```

デフォルトでは、[ヘルスチェック](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck)がClickHouseへの挿入が始まる前に必要です。これにより、接続性が確立でき、スキーマを読み取ることができます。問題が発生した場合は、`VECTOR_LOG=debug`を前に付けてさらなるログを取得することができます。

5. データの挿入を確認します。

```sql
SELECT count() as count FROM github;
```

| count |
| :--- |
| 200000 |
