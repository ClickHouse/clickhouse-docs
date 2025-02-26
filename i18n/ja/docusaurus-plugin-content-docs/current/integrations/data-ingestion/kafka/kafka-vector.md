---
sidebar_label: KafkaとVector
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: KafkaとClickHouseを使用したVector
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

## KafkaとClickHouseを使用したVector {#using-vector-with-kafka-and-clickhouse}

Vectorは、Kafkaからデータを読み取り、ClickHouseにイベントを送信することができるベンダー非依存のデータパイプラインです。

[Getting Started](../etl-tools/vector-to-clickhouse.md) ガイドでは、ClickHouseとのVectorのログユースケースに焦点を当て、ファイルからイベントを読み取る方法が説明されています。私たちは、Kafkaトピックに保持されているイベントを持つ[Githubサンプルデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を利用しています。

Vectorは、プッシュまたはプルモデルを通じてデータを取得するための[ソース](https://vector.dev/docs/about/concepts/#sources)を利用します。一方、[シンク](https://vector.dev/docs/about/concepts/#sinks)はイベントの送信先を提供します。したがって、私たちはKafkaソースとClickHouseシンクを使用します。Kafkaはシンクとしてサポートされていますが、ClickHouseソースは利用できません。その結果、ClickHouseからKafkaにデータを転送したいユーザーにはVectorは適していません。

また、Vectorはデータの[変換](https://vector.dev/docs/reference/configuration/transforms/)をサポートしていますが、これはこのガイドの範囲外です。データセットに関してこれが必要な場合は、Vectorのドキュメントを参照してください。

現在のClickHouseシンクの実装はHTTPインターフェイスを利用しています。現時点ではClickHouseシンクはJSONスキーマの使用をサポートしていません。データはプレーンJSONフォーマットまたは文字列としてKafkaに公開する必要があります。

### ライセンス {#license}
Vectorは[MPL-2.0ライセンス](https://github.com/vectordotdev/vector/blob/master/LICENSE)のもとで配布されています。

### 接続詳細の収集 {#gather-your-connection-details}
<ConnectionDetails />

### 手順 {#steps}

1. Kafkaに`github`トピックを作成し、[Githubデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を挿入します。

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

このデータセットは、`ClickHouse/ClickHouse`リポジトリに焦点を当てた200,000行で構成されています。

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

3. [Vectorをダウンロードおよびインストール](https://vector.dev/docs/setup/quickstart/)します。`kafka.toml`設定ファイルを作成し、KafkaおよびClickHouseインスタンスの値を修正します。

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

この設定とVectorの動作に関する重要な注意点：

- この例はConfluent Cloudに対してテスト済みです。したがって、`sasl.*`および`ssl.enabled`セキュリティオプションは、セルフマネージドのケースでは適切でない場合があります。
- 設定パラメータ`bootstrap_servers`にはプロトコルプレフィックスは不要です。例：`pkc-2396y.us-east-1.aws.confluent.cloud:9092`
- ソースパラメータ`decoding.codec = "json"`は、メッセージがClickHouseシンクに単一のJSONオブジェクトとして渡されることを保証します。メッセージを文字列として処理し、デフォルトの`bytes`値を使用する場合、メッセージの内容は`message`フィールドに追加されます。ほとんどの場合、これは[Vector Getting Started](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs)ガイドに説明されているようにClickHouseでの処理が必要です。
- Vectorは、メッセージに[多くのフィールド](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)を追加します。今回の例では、設定パラメータ`skip_unknown_fields = true`を介してClickHouseシンクでこれらのフィールドを無視します。これは、ターゲットテーブルスキーマの一部ではないフィールドを無視します。必要に応じて、これらのメタフィールド（`offset`など）を追加するようにスキーマを調整してください。
- シンクは、イベントのソースの参照をパラメータ`inputs`経由で示します。
- ClickHouseシンクの動作については[こちら](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)を参照してください。最適なスループットのためには、ユーザーは`buffer.max_events`、`batch.timeout_secs`および`batch.max_bytes`パラメータを調整したいと考えるかもしれません。ClickHouseの[推奨事項](../../../concepts/why-clickhouse-is-so-fast.md#performance-when-inserting-data)によれば、単一バッチ内のイベント数として1000を最低値として考慮すべきです。均等に高いスループットのユースケースでは、ユーザーは`buffer.max_events`パラメータを増やすことができます。変動するスループットには`batch.timeout_secs`パラメータの変更が必要になる場合があります。
- パラメータ`auto_offset_reset = "smallest"`は、Kafkaソースにトピックの最初から開始させます。したがって、ステップ（1）で公開されたメッセージを消費することが保証されます。異なる動作が必要な場合があるため、[こちら](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)を参照してください。

4. Vectorを開始します。

```bash
vector --config ./kafka.toml
```

デフォルトでは、[ヘルスチェック](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck)がClickHouseに挿入を開始する前に必要です。これは接続性が確立でき、スキーマを読み取ることができることを保証します。問題が発生した場合に役立つことがあるため、`VECTOR_LOG=debug`を前に追加して、さらに詳細なログを取得できます。

5. データの挿入を確認します。

```sql
SELECT count() as count FROM github;
```

| count |
| :--- |
| 200000 |

