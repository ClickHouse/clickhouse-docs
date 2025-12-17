---
sidebar_label: 'Kafka と Vector'
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: 'Kafka と ClickHouse で Vector を利用する'
title: 'Kafka と ClickHouse で Vector を利用する'
doc_type: 'guide'
keywords: ['kafka', 'vector', 'ログ収集', 'オブザーバビリティ', '連携']
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


## Kafka と ClickHouse で Vector を使用する {#using-vector-with-kafka-and-clickhouse}

Vector はベンダー非依存のデータパイプラインであり、Kafka からデータを読み取り、ClickHouse にイベントを送信できます。

ClickHouse と組み合わせた Vector の[入門ガイド](../etl-tools/vector-to-clickhouse.md)では、ログのユースケースとファイルからのイベント読み取りに焦点を当てています。ここでは、Kafka トピックに格納されたイベントを含む [GitHub サンプルデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を利用します。

Vector は、プッシュまたはプルモデルでデータを取得するために [sources](https://vector.dev/docs/about/concepts/#sources) を利用します。一方で [sinks](https://vector.dev/docs/about/concepts/#sinks) はイベントの送信先を提供します。したがって、Kafka source と ClickHouse sink を使用します。なお、Kafka は sink としてサポートされていますが、ClickHouse source は利用できません。その結果、Vector は ClickHouse から Kafka へデータを転送したいユーザーには適していません。

Vector はデータの[変換](https://vector.dev/docs/reference/configuration/transforms/)にも対応していますが、これは本ガイドの範囲外です。この機能が必要な場合は、Vector のドキュメントを参照してください。

現在の ClickHouse sink の実装では HTTP インターフェースを利用している点に注意してください。ClickHouse sink は現時点では JSON スキーマの利用をサポートしていません。データはプレーンな JSON 形式、もしくは文字列として Kafka に送信される必要があります。

### ライセンス {#license}

Vector は [MPL-2.0 License](https://github.com/vectordotdev/vector/blob/master/LICENSE) の下で配布されています。

### 接続情報を確認する {#gather-your-connection-details}

<ConnectionDetails />

### 手順 {#steps}

1. Kafka の `github` トピックを作成し、[GitHub データセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson) を取り込みます。

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

このデータセットは、`ClickHouse/ClickHouse` リポジトリに焦点を当てた 200,000 行で構成されています。

2. 対象テーブルが作成済みであることを確認します。以下では、デフォルトデータベースを使用します。

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

3. [Vectorをダウンロードしてインストールします](https://vector.dev/docs/setup/quickstart/)。`kafka.toml`設定ファイルを作成し、KafkaおよびClickHouseインスタンスに合わせて値を変更してください。

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

この設定と Vector の動作について、いくつか重要な注意点があります。


* この例は Confluent Cloud に対してテストされています。そのため、`sasl.*` および `ssl.enabled` セキュリティオプションは、セルフマネージドなケースでは適切でない可能性があります。
* 設定パラメータ `bootstrap_servers` にはプロトコルのプレフィックスは不要です（例: `pkc-2396y.us-east-1.aws.confluent.cloud:9092`）。
* ソースパラメータ `decoding.codec = "json"` は、メッセージが単一の JSON オブジェクトとして ClickHouse sink に渡されることを保証します。メッセージを文字列として扱い、デフォルト値の `bytes` を使用する場合、メッセージの内容はフィールド `message` に格納されます。多くの場合、これは [Vector getting started](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs) ガイドで説明しているように、ClickHouse 側での処理が必要になります。
* Vector はメッセージに対して[多数のフィールドを追加](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)します。この例では、ClickHouse sink の設定パラメータ `skip_unknown_fields = true` によって、これらのフィールドを無視しています。これは、ターゲットテーブルのスキーマに含まれないフィールドを無視する設定です。`offset` のようなこれらのメタフィールドが追加されるように、スキーマを調整してもかまいません。
* `inputs` パラメータによって、sink がイベントのソースを参照している点に注目してください。
* ClickHouse sink の動作については[こちら](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)を参照してください。スループットを最適化するため、`buffer.max_events`、`batch.timeout_secs`、`batch.max_bytes` パラメータのチューニングを検討してください。ClickHouse の[推奨事項](/sql-reference/statements/insert-into#performance-considerations)に従うと、1 バッチあたりのイベント数については、1000 を最小値として考慮する必要があります。スループットが一様に高いユースケースでは、`buffer.max_events` パラメータを増やすことができます。スループットにばらつきがある場合は、`batch.timeout_secs` パラメータの調整が必要になることがあります。
* パラメータ `auto_offset_reset = "smallest"` は、Kafka ソースがトピックの先頭から読み取りを開始することを強制し、これによりステップ (1) で公開されたメッセージを確実に消費できるようにします。ユーザーによっては、異なる動作が必要になることがあります。詳細は[こちら](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)を参照してください。

4. Vector を起動する

```bash
vector --config ./kafka.toml
```

デフォルトでは、ClickHouse への挿入処理が開始される前に、[health check](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck) が必要です。これにより、接続が確立できることと、スキーマが読み取れることが保証されます。問題が発生した場合に役立つ、より詳細なログを取得するには、コマンドの前に `VECTOR_LOG=debug` を付けて実行してください。

5. データが挿入されたことを確認します。

```sql
SELECT count() AS count FROM github;
```

| 件数     |
| :----- |
| 200000 |
