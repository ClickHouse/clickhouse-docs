---
sidebar_label: 'Vector with Kafka'
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: 'Using Vector with Kafka and ClickHouse'
title: 'Using Vector with Kafka and ClickHouse'
doc_type: 'guide'
keywords: ['kafka', 'vector', 'log collection', 'observability', 'integration']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';

## Kafka と ClickHouse で Vector を使用する {#using-vector-with-kafka-and-clickhouse}

Vector は、Kafka からデータを読み取り、ClickHouse にイベントを送信する機能を持つ、ベンダー非依存のデータパイプラインです。

ClickHouse での Vector の[入門ガイド](../etl-tools/vector-to-clickhouse.md)では、ログのユースケースとファイルからのイベント読み取りに焦点を当てています。ここでは、Kafka トピックに保存されたイベントを持つ [Github サンプルデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を使用します。

Vector は、プッシュまたはプルモデルでデータを取得するために[ソース](https://vector.dev/docs/about/concepts/#sources)を利用します。一方、[シンク](https://vector.dev/docs/about/concepts/#sinks)はイベントの宛先を提供します。したがって、Kafka ソースと ClickHouse シンクを利用します。Kafka はシンクとしてサポートされていますが、ClickHouse ソースは利用できないことに注意してください。そのため、ClickHouse から Kafka にデータを転送したい場合、Vector は適切ではありません。

Vector はデータの[変換](https://vector.dev/docs/reference/configuration/transforms/)もサポートしています。これはこのガイドの範囲外です。データセットに対してこれが必要な場合は、Vector のドキュメントを参照してください。

現在の ClickHouse シンクの実装は HTTP インターフェースを利用していることに注意してください。ClickHouse シンクは現時点で JSON スキーマの使用をサポートしていません。データは、プレーンな JSON フォーマットまたは文字列として Kafka に公開する必要があります。

### ライセンス {#license}
Vector は [MPL-2.0 ライセンス](https://github.com/vectordotdev/vector/blob/master/LICENSE)の下で配布されています

### 接続詳細を収集する {#gather-your-connection-details}
<ConnectionDetails />

### 手順 {#steps}

1. Kafka の `github` トピックを作成し、[Github データセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を挿入します。

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

このデータセットは、`ClickHouse/ClickHouse` リポジトリに焦点を当てた 200,000 行で構成されています。

2. ターゲットテーブルが作成されていることを確認します。以下ではデフォルトデータベースを使用します。

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

3. [Vector をダウンロードしてインストール](https://vector.dev/docs/setup/quickstart/)します。`kafka.toml` 設定ファイルを作成し、Kafka と ClickHouse インスタンスの値を変更します。

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

この設定と Vector の動作に関するいくつかの重要な注意事項:

- この例は Confluent Cloud に対してテストされています。したがって、セルフマネージドの場合、`sasl.*` および `ssl.enabled` のセキュリティオプションは適切ではない可能性があります。
- 設定パラメータ `bootstrap_servers` にはプロトコルプレフィックスは必要ありません。例: `pkc-2396y.us-east-1.aws.confluent.cloud:9092`
- ソースパラメータ `decoding.codec = "json"` は、メッセージが単一の JSON オブジェクトとして ClickHouse シンクに渡されることを保証します。メッセージを文字列として処理し、デフォルトの `bytes` 値を使用する場合、メッセージの内容は `message` フィールドに追加されます。ほとんどの場合、[Vector 入門](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs)ガイドで説明されているように、ClickHouse での処理が必要になります。
- Vector は[いくつかのフィールドを追加](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)します。この例では、設定パラメータ `skip_unknown_fields = true` を使用して、ClickHouse シンクでこれらのフィールドを無視します。これにより、ターゲットテーブルスキーマの一部ではないフィールドが無視されます。`offset` などのメタフィールドが追加されるように、スキーマを自由に調整してください。
- シンクがパラメータ `inputs` を介してイベントのソースを参照する方法に注意してください。
- [こちら](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)で説明されている ClickHouse シンクの動作に注意してください。最適なスループットのために、`buffer.max_events`、`batch.timeout_secs`、および `batch.max_bytes` パラメータを調整することをお勧めします。ClickHouse の[推奨事項](/sql-reference/statements/insert-into#performance-considerations)によると、単一バッチ内のイベント数の最小値として 1000 を考慮する必要があります。均一な高スループットのユースケースでは、パラメータ `buffer.max_events` を増やすことができます。より変動的なスループットでは、パラメータ `batch.timeout_secs` の変更が必要になる場合があります。
- パラメータ `auto_offset_reset = "smallest"` は、Kafka ソースがトピックの先頭から開始するように強制します。これにより、ステップ (1) で公開されたメッセージを確実に消費できます。異なる動作が必要な場合があります。詳細については[こちら](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)を参照してください。

4. Vector を起動します

```bash
vector --config ./kafka.toml
```

デフォルトでは、ClickHouse への挿入が開始される前に[ヘルスチェック](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck)が必要です。これにより、接続が確立され、スキーマが読み取られることが保証されます。問題が発生した場合に役立つ追加のログを取得するには、`VECTOR_LOG=debug` を先頭に追加してください。

5. データの挿入を確認します。

```sql
SELECT count() AS count FROM github;
```

| count |
| :--- |
| 200000 |
