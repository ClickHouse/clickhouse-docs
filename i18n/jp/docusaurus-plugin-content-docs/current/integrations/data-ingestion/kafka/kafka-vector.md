---
sidebar_label: KafkaとのVector
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: KafkaとClickHouseを使用したVector
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

## KafkaとClickHouseを使用したVector {#using-vector-with-kafka-and-clickhouse}

Vectorは、Kafkaから読み込み、ClickHouseにイベントを送信する能力を持つベンダーに依存しないデータパイプラインです。

[はじめに](../etl-tools/vector-to-clickhouse.md)のガイドでは、ClickHouseを使用したVectorについて、ログのユースケースとファイルからのイベントの読み取りに焦点を当てています。私たちは、Kafkaトピックに保管されているイベントを持つ[Githubのサンプルデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を利用します。

Vectorは、プッシュまたはプルモデルを通じてデータを取得するために[ソース](https://vector.dev/docs/about/concepts/#sources)を利用します。一方、[シンク](https://vector.dev/docs/about/concepts/#sinks)は、イベントの出力先を提供します。したがって、KafkaソースとClickHouseシンクを利用します。Kafkaはシンクとしてサポートされていますが、ClickHouseソースは利用できません。そのため、ClickHouseからKafkaにデータを転送したいユーザーにはVectorは適していません。

また、Vectorはデータの[変換](https://vector.dev/docs/reference/configuration/transforms/)をサポートしていますが、これはこのガイドの範囲を超えています。そのため, 必要な場合はVectorドキュメントを参照してください。

現在のClickHouseシンクの実装はHTTPインターフェースを利用しています。現時点では、ClickHouseシンクはJSONスキーマの使用をサポートしていません。データはプレーンJSON形式または文字列としてKafkaに公開する必要があります。

### ライセンス {#license}
Vectorは[MPL-2.0ライセンス](https://github.com/vectordotdev/vector/blob/master/LICENSE)の下で配布されています。

### 接続の詳細を集める {#gather-your-connection-details}
<ConnectionDetails />

### 手順 {#steps}

1. Kafkaの`github`トピックを作成し、[Githubデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を挿入します。

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

3. [Vectorをダウンロードしてインストール](https://vector.dev/docs/setup/quickstart/)します。`kafka.toml`という構成ファイルを作成し、KafkaとClickHouseインスタンスの値を変更します。

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

この構成およびVectorの動作についてのいくつかの重要な注意点：

- この例はConfluent Cloudに対してテストされています。そのため、`sasl.*`および`ssl.enabled`セキュリティオプションはセルフマネージドの場合には適切でないかもしれません。
- `bootstrap_servers`の構成パラメータにプロトコルプレフィックスは必要ありません。例：`pkc-2396y.us-east-1.aws.confluent.cloud:9092`
- ソースパラメータ`decoding.codec = "json"`は、メッセージがClickHouseシンクに単一のJSONオブジェクトとして渡されることを保証します。メッセージを文字列として処理し、デフォルトの`bytes`値を使用している場合、メッセージの内容は`message`フィールドに追加されます。ほとんどの場合、これは[Vectorのはじめに](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs)ガイドで説明されているようにClickHouseで処理する必要があります。
- Vectorはメッセージにいくつかのフィールドを[追加](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)します。この例では、ClickHouseシンクでは`skip_unknown_fields = true`の構成パラメータを介してこれらのフィールドを無視します。これは、ターゲットテーブルスキーマの一部でないフィールドを無視します。必要に応じて、これらのメタフィールド（例えば`offset`）が追加されるようにスキーマを調整してください。
- シンクがイベントのソースをパラメータ`inputs`を介して参照していることに注意してください。
- ClickHouseシンクの動作は[こちら](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)に説明されています。最適なスループットを得るために、ユーザーは`buffer.max_events`、`batch.timeout_secs`、および`batch.max_bytes`パラメータの調整を希望するかもしれません。ClickHouseの[推奨](https://sql-reference/statements/insert-into#performance-considerations)では、単一バッチ内のイベント数の最小値として1000を考慮すべきです。均一な高スループットのユースケースでは、ユーザーは`buffer.max_events`パラメータを増加させることができます。変動が大きいスループットでは、`batch.timeout_secs`パラメータの変更が必要になるかもしれません。
- `auto_offset_reset = "smallest"`パラメータは、Kafkaソースがトピックの先頭から開始することを強制します。これにより、ステップ(1)で発行されたメッセージを消費します。ユーザーには異なる動作が必要になる場合があります。詳細については[こちら](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)を参照してください。

4. Vectorを起動します。

```bash
vector --config ./kafka.toml
```

デフォルトでは、[ヘルスチェック](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck)がClickHouseへの挿入が始まる前に必要です。これにより、接続が確立できていることとスキーマが読み取れることが確認されます。問題が発生した場合に役立つ追加のログを得るには、`VECTOR_LOG=debug`を前に付けてください。

5. データの挿入を確認します。

```sql
SELECT count() as count FROM github;
```

| count |
| :--- |
| 200000 |
