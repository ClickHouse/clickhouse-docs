---
'sidebar_label': 'Kafka と共に使う Vector'
'sidebar_position': 3
'slug': '/integrations/kafka/kafka-vector'
'description': 'Kafka と ClickHouse を使用した Vector'
'title': 'Kafka と ClickHouse を使用した Vector'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

## Using Vector with Kafka and ClickHouse {#using-vector-with-kafka-and-clickhouse}

Vectorは、Kafkaから読み取り、ClickHouseにイベントを送信する能力を持つベンダーに依存しないデータパイプラインです。

ClickHouseと連携したVectorの[はじめに](../etl-tools/vector-to-clickhouse.md)ガイドは、ログのユースケースとファイルからのイベント読み取りに焦点を当てています。私たちは、Kafkaトピックで保持されているイベントがある[Githubサンプルデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を利用しています。

Vectorは、プッシュまたはプルモデルを通じてデータを取得するために[ソース](https://vector.dev/docs/about/concepts/#sources)を利用します。一方、[シンク](https://vector.dev/docs/about/concepts/#sinks)はイベントの宛先を提供します。したがって、私たちはKafkaソースとClickHouseシンクを利用します。Kafkaはシンクとしてサポートされていますが、ClickHouseソースは利用できないことに注意してください。そのため、ClickHouseからKafkaにデータを転送したいユーザーにはVectorは適していません。

Vectorはまた、データの[変換](https://vector.dev/docs/reference/configuration/transforms/)もサポートしています。これについては、このガイドの範囲を超えています。この件に関してはユーザーはVectorのドキュメントを参照することをお勧めします。

現在のClickHouseシンクの実装はHTTPインターフェースを利用していることに注意してください。現在、ClickHouseシンクはJSONスキーマの使用をサポートしていません。データはプレーンJSON形式または文字列としてKafkaに公開されなければなりません。

### License {#license}
Vectorは、[MPL-2.0 License](https://github.com/vectordotdev/vector/blob/master/LICENSE)の下で配布されています。

### Gather your connection details {#gather-your-connection-details}
<ConnectionDetails />

### Steps {#steps}

1. Kafkaの `github` トピックを作成し、[Githubデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を挿入します。

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

このデータセットは、`ClickHouse/ClickHouse` リポジトリに焦点を当てた200,000行で構成されています。

2. 対象テーブルが作成されていることを確認します。以下では、デフォルトのデータベースを使用します。

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

3. [Vectorをダウンロードしてインストール](https://vector.dev/docs/setup/quickstart/)します。`kafka.toml` 構成ファイルを作成し、あなたのKafkaおよびClickHouseインスタンスの値を修正します。

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

この構成とVectorの動作に関するいくつかの重要な注意事項:

- この例はConfluent Cloudに対してテストされています。したがって、`sasl.*` および `ssl.enabled` セキュリティオプションはセルフマネージドの場合には適切でないかもしれません。
- 構成パラメータ `bootstrap_servers` にプロトコルプレフィックスは必要ありません。例: `pkc-2396y.us-east-1.aws.confluent.cloud:9092`
- ソースパラメータ `decoding.codec = "json"` はメッセージがClickHouseシンクに単一のJSONオブジェクトとして渡されることを保証します。メッセージを文字列として処理し、デフォルトの `bytes` 値を使用している場合、メッセージの内容はフィールド `message` に追加されます。ほとんどの場合、これは[Vectorはじめに](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs)ガイドに記載されているようにClickHouseで処理が必要になります。
- Vectorはメッセージに[いくつかのフィールドを追加](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)します。私たちの例では、構成パラメータ `skip_unknown_fields = true`を通じてClickHouseシンクでこれらのフィールドを無視します。これは、ターゲットテーブルスキーマの一部でないフィールドを無視します。`offset` などのメタフィールドが追加されるようにスキーマを調整することを自由に行ってください。
- シンクがイベントのソースをパラメータ `inputs` を介して参照する様子に注意してください。
- ClickHouseシンクの動作については[こちら](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)を参照してください。最適なスループットのために、ユーザーは `buffer.max_events`、 `batch.timeout_secs`、および `batch.max_bytes`パラメータを調整することが望ましいかもしれません。ClickHouseの[推奨事項](/sql-reference/statements/insert-into#performance-considerations)に従って、単一のバッチ内のイベント数（少なくとも1000）は考慮すべき最低値です。均一な高スループットのユースケースでは、ユーザーはパラメータ `buffer.max_events` を増加させることがあります。より変動的なスループットには、パラメータ `batch.timeout_secs`の変更が必要です。
- パラメータ `auto_offset_reset = "smallest"` はKafkaソースがトピックの開始から開始することを強制し、ステップ（1）で公開されたメッセージを消費することを保証します。ユーザーは異なる動作を必要とすることがあります。[こちら](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)を参照して詳細をご確認ください。

4. Vectorを開始します。

```bash
vector --config ./kafka.toml
```

デフォルトでは、[ヘルスチェック](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck)がClickHouseへの挿入が始まる前に必要です。これは、接続が確立でき、スキーマが読み取れることを確認します。問題が発生した場合に役立つ追加のログを取得するために、`VECTOR_LOG=debug`を前置きしてください。

5. データの挿入を確認します。

```sql
SELECT count() AS count FROM github;
```

| count |
| :--- |
| 200000 |
