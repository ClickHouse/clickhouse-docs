---
sidebar_label: Kafkaとのベクター
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: KafkaとClickHouseを使ったVectorの利用
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

## KafkaとClickHouseを使ったVectorの利用 {#using-vector-with-kafka-and-clickhouse}

Vectorは、Kafkaからデータを読み取り、ClickHouseにイベントを送信する能力を持つ、ベンダーに依存しないデータパイプラインです。

[始めに](../etl-tools/vector-to-clickhouse.md)のガイドでは、ClickHouseを使用してログのユースケースに焦点を当て、ファイルからのイベントを読み取ります。Kafkaトピックに保存されたイベントを使用して、[Githubのサンプルデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を活用します。

Vectorは、プッシュまたはプルモデルを介してデータを取得するために[ソース](https://vector.dev/docs/about/concepts/#sources)を利用します。一方、[シンク](https://vector.dev/docs/about/concepts/#sinks)はイベントの送信先を提供します。そのため、KafkaソースとClickHouseシンクを利用します。Kafkaがシンクとしてサポートされている一方で、ClickHouseソースは利用できないことに注意してください。したがって、ClickHouseからKafkaにデータを転送したいユーザーにはVectorは適していません。

Vectorはデータの[変換](https://vector.dev/docs/reference/configuration/transforms/)もサポートしていますが、これはこのガイドの範囲を超えています。データセットに対してこの機能が必要な場合は、Vectorのドキュメントを参照してください。

現在のClickHouseシンクの実装はHTTPインターフェースを利用しています。現時点ではClickHouseシンクはJSONスキーマの使用をサポートしていません。データはプレーンJSON形式または文字列としてKafkaに公開される必要があります。

### ライセンス {#license}
Vectorは[MPL-2.0ライセンス](https://github.com/vectordotdev/vector/blob/master/LICENSE)の下で配布されています。

### 接続の詳細を収集する {#gather-your-connection-details}
<ConnectionDetails />

### 手順 {#steps}

1. Kafkaの`github`トピックを作成し、[Githubデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を挿入します。

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

このデータセットは、`ClickHouse/ClickHouse`リポジトリに焦点を当てた200,000行で構成されています。

2. ターゲットテーブルが作成されていることを確認してください。以下では、デフォルトデータベースを使用します。

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

3. [Vectorをダウンロードしてインストール](https://vector.dev/docs/setup/quickstart/)します。`kafka.toml`設定ファイルを作成し、KafkaおよびClickHouseインスタンス用の値を変更します。

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

この設定およびVectorの動作に関するいくつかの重要な注意事項：

- この例はConfluent Cloudでテストされています。そのため、`sasl.*`および`ssl.enabled`のセキュリティオプションは、セルフマネージドのケースでは適切でない場合があります。
- `bootstrap_servers`構成パラメータにはプロトコルプレフィックスを指定する必要はありません。例：`pkc-2396y.us-east-1.aws.confluent.cloud:9092`
- ソースパラメータ`decoding.codec = "json"`は、メッセージがClickHouseシンクに単一のJSONオブジェクトとして渡されることを保証します。メッセージを文字列として処理し、デフォルトの`bytes`値を使用する場合、メッセージの内容は`message`フィールドに追加されます。ほとんどのケースでは、これは[Vectorの始めに](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs)ガイドに記載されたようにClickHouseでの処理を必要とします。
- Vectorはメッセージにいくつかのフィールドを[追加](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)します。この例では、`skip_unknown_fields = true`という構成パラメータを介してClickHouseシンクでこれらのフィールドを無視します。これは、ターゲットテーブルスキーマの一部でないフィールドを無視します。これらのメタフィールド（例えば`offset`）を追加するためにスキーマを調整しても構いません。
- シンクの設定は、イベントのソースのパラメータ`inputs`を介して参照されることに注意してください。
- ClickHouseシンクの動作に関しては、[こちら](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)を参照してください。最適なスループットのために、ユーザーは`buffer.max_events`、`batch.timeout_secs`および`batch.max_bytes`パラメータを調整することを検討するかもしれません。ClickHouseの[推奨](../../../concepts/why-clickhouse-is-so-fast.md#performance-when-inserting-data)に従い、単一バッチのイベント数は1000を最小値とする必要があります。均一な高スループットのユースケースでは、ユーザーは`buffer.max_events`のパラメータを増加させることができます。変動のあるスループットには`batch.timeout_secs`パラメータの変更が必要な場合があります。
- パラメータ`auto_offset_reset = "smallest"`は、Kafkaソースがトピックの先頭から始まることを強制し、ステップ（1）で発行されたメッセージを確実に消費できます。ユーザーは異なる動作を必要とする場合があります。詳細については[こちら](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)を参照してください。

4. Vectorを起動します。

```bash
vector --config ./kafka.toml
```

デフォルトでは、[ヘルスチェック](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck)がClickHouseへの挿入の前に必要です。これにより、接続可能かどうかを確認し、スキーマが読み取られます。問題が発生した場合は、`VECTOR_LOG=debug`を追加して詳細なログを取得できます。

5. データの挿入を確認します。

```sql
SELECT count() as count FROM github;
```

| count |
| :--- |
| 200000 |
