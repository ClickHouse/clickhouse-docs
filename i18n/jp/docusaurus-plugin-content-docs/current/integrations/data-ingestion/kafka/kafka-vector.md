---
'sidebar_label': 'Vector with Kafka'
'sidebar_position': 3
'slug': '/integrations/kafka/kafka-vector'
'description': 'Using Vector with Kafka and ClickHouse'
'title': 'Using Vector with Kafka and ClickHouse'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

## Kafka と ClickHouse を使用した Vector の利用 {#using-vector-with-kafka-and-clickhouse}

Vector は、Kafka からデータを読み取り、ClickHouse にイベントを送信する能力を持つ、ベンダーに依存しないデータパイプラインです。

ClickHouse と連携するための [はじめに](../etl-tools/vector-to-clickhouse.md) ガイドは、ログのユースケースとファイルからのイベントの読み取りに焦点を当てています。私たちは、Kafka トピックに保持されているイベントを含む [Github サンプルデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson) を利用します。

Vector は、プッシュまたはプルモデルを通じてデータを取得するために [sources](https://vector.dev/docs/about/concepts/#sources) を利用します。一方、[sinks](https://vector.dev/docs/about/concepts/#sinks) はイベントの宛先を提供します。したがって、私は Kafka ソースと ClickHouse シンクを利用します。Kafka はシンクとしてサポートされていますが、ClickHouse ソースは利用できないため、ClickHouse から Kafka にデータを転送したいユーザーには Vector は適していません。

Vector はデータの [変換](https://vector.dev/docs/reference/configuration/transforms/) もサポートしています。これは本ガイドの範囲を超えています。この機能が必要な場合は、ユーザーは自身のデータセットについて Vector ドキュメントを参照してください。

現在の ClickHouse シンクの実装は HTTP インターフェースを使用しています。現時点では ClickHouse シンクは JSON スキーマの使用をサポートしていません。データはプレーン JSON 形式または文字列として Kafka に公開する必要があります。

### ライセンス {#license}
Vector は [MPL-2.0 ライセンス](https://github.com/vectordotdev/vector/blob/master/LICENSE)のもとで配布されています。

### 接続詳細をまとめる {#gather-your-connection-details}
<ConnectionDetails />

### 手順 {#steps}

1. Kafka の `github` トピックを作成し、[Github データセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson) を挿入します。

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

このデータセットは、`ClickHouse/ClickHouse` リポジトリに焦点を当てた 200,000 行から構成されています。

2. 目標のテーブルが作成されていることを確認します。以下ではデフォルトのデータベースを使用します。

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

3. [Vector をダウンロードしてインストール](https://vector.dev/docs/setup/quickstart/)します。`kafka.toml` 構成ファイルを作成し、Kafka と ClickHouse インスタンスの値を変更します。

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

この構成および Vector の動作に関する重要な注意点がいくつかあります：

- この例は Confluent Cloud に対してテストされています。したがって、`sasl.*` および `ssl.enabled` のセキュリティオプションは、セルフマネージドのケースには適さない可能性があります。
- 構成パラメータ `bootstrap_servers` にはプロトコルプレフィックスは必要ありません。例: `pkc-2396y.us-east-1.aws.confluent.cloud:9092`
- ソースパラメータ `decoding.codec = "json"` は、メッセージが ClickHouse シンクに単一の JSON オブジェクトとして渡されることを保証します。メッセージを文字列として扱い、デフォルトの `bytes` 値を使用した場合、メッセージの内容はフィールド `message` に追加されます。このほとんどの場合、[Vector のはじめに](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs)ガイドに記載されたように ClickHouse で処理が必要です。
- Vector はメッセージにいくつかのフィールドを [追加します](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)。私たちの例では、設定パラメータ `skip_unknown_fields = true` を通じて ClickHouse シンクでこれらのフィールドを無視します。これは、ターゲットテーブルスキーマの一部でないフィールドを無視します。これらのメタフィールド（例: `offset`）を追加するようにスキーマを調整してください。
- シンクがイベントのソースを `inputs` パラメータを通じて参照していることに注意してください。
- ClickHouse シンクの動作については [こちら](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)を参照してください。最適なスループットを得るために、ユーザーは `buffer.max_events`、`batch.timeout_secs`、および `batch.max_bytes` パラメータを調整したいと考えるかもしれません。ClickHouse の [推奨事項](/sql-reference/statements/insert-into#performance-considerations) によれば、単一のバッチに含まれるイベント数の最小値として 1000 を考慮すべきです。均一な高スループットユースケースでは、ユーザーはパラメータ `buffer.max_events` を増やすことを検討します。可変スループットの場合は、パラメータ `batch.timeout_secs` の変更が必要です。
- パラメータ `auto_offset_reset = "smallest"` は Kafka ソースにトピックの最初から始めさせます。これにより、ステップ (1) で公開されたメッセージを消費できるようになります。異なる動作が必要なユーザーは、[こちら](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)を参照してください。

4. Vector を起動します。

```bash
vector --config ./kafka.toml
```

デフォルトでは、[ヘルスチェック](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck)が ClickHouse への挿入開始前に必要です。これにより、接続が確立され、スキーマが読み取れることが確認されます。問題が発生した場合は、`VECTOR_LOG=debug` を前に置くことで、さらに詳細なログを取得できます。

5. データの挿入を確認します。

```sql
SELECT count() as count FROM github;
```

| count |
| :--- |
| 200000 |
