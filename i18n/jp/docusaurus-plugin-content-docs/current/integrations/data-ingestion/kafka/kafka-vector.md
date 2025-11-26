---
sidebar_label: 'Kafka と Vector'
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: 'Kafka と ClickHouse で Vector を利用する'
title: 'Kafka と ClickHouse で Vector を利用する'
doc_type: 'guide'
keywords: ['kafka', 'vector', 'ログ収集', 'オブザーバビリティ', '連携']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


## Kafka と ClickHouse で Vector を使用する

Vector はベンダー非依存のデータパイプラインであり、Kafka からデータを読み取り、ClickHouse にイベントを送信できます。

ClickHouse と組み合わせた Vector の[入門ガイド](../etl-tools/vector-to-clickhouse.md)では、ログのユースケースとファイルからのイベント読み取りに焦点を当てています。ここでは、Kafka トピックに格納されたイベントを含む [GitHub サンプルデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を利用します。

Vector は、プッシュまたはプルモデルでデータを取得するために [sources](https://vector.dev/docs/about/concepts/#sources) を利用します。一方で [sinks](https://vector.dev/docs/about/concepts/#sinks) はイベントの送信先を提供します。したがって、Kafka source と ClickHouse sink を使用します。なお、Kafka は sink としてサポートされていますが、ClickHouse source は利用できません。その結果、Vector は ClickHouse から Kafka へデータを転送したいユーザーには適していません。

Vector はデータの[変換](https://vector.dev/docs/reference/configuration/transforms/)にも対応していますが、これは本ガイドの範囲外です。この機能が必要な場合は、Vector のドキュメントを参照してください。

現在の ClickHouse sink の実装では HTTP インターフェースを利用している点に注意してください。ClickHouse sink は現時点では JSON スキーマの利用をサポートしていません。データはプレーンな JSON 形式、もしくは文字列として Kafka に送信される必要があります。

### ライセンス

Vector は [MPL-2.0 License](https://github.com/vectordotdev/vector/blob/master/LICENSE) の下で配布されています。

### 接続情報を収集する

<ConnectionDetails />

### 手順

1. Kafka に `github` トピックを作成し、[GitHub データセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を投入します。

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

このデータセットは、`ClickHouse/ClickHouse` リポジトリに焦点を当てた 200,000 行で構成されています。

2. 対象テーブルが作成されていることを確認します。ここではデフォルトデータベースを使用します。

```sql
```


CREATE TABLE github
(
file&#95;time DateTime,
event&#95;type Enum(&#39;CommitCommentEvent&#39; = 1, &#39;CreateEvent&#39; = 2, &#39;DeleteEvent&#39; = 3, &#39;ForkEvent&#39; = 4,
&#39;GollumEvent&#39; = 5, &#39;IssueCommentEvent&#39; = 6, &#39;IssuesEvent&#39; = 7, &#39;MemberEvent&#39; = 8, &#39;PublicEvent&#39; = 9, &#39;PullRequestEvent&#39; = 10, &#39;PullRequestReviewCommentEvent&#39; = 11, &#39;PushEvent&#39; = 12, &#39;ReleaseEvent&#39; = 13, &#39;SponsorshipEvent&#39; = 14, &#39;WatchEvent&#39; = 15, &#39;GistEvent&#39; = 16, &#39;FollowEvent&#39; = 17, &#39;DownloadEvent&#39; = 18, &#39;PullRequestReviewEvent&#39; = 19, &#39;ForkApplyEvent&#39; = 20, &#39;Event&#39; = 21, &#39;TeamAddEvent&#39; = 22),
actor&#95;login LowCardinality(String),
repo&#95;name LowCardinality(String),
created&#95;at DateTime,
updated&#95;at DateTime,
action Enum(&#39;none&#39; = 0, &#39;created&#39; = 1, &#39;added&#39; = 2, &#39;edited&#39; = 3, &#39;deleted&#39; = 4, &#39;opened&#39; = 5, &#39;closed&#39; = 6, &#39;reopened&#39; = 7, &#39;assigned&#39; = 8, &#39;unassigned&#39; = 9, &#39;labeled&#39; = 10, &#39;unlabeled&#39; = 11, &#39;review&#95;requested&#39; = 12, &#39;review&#95;request&#95;removed&#39; = 13, &#39;synchronize&#39; = 14, &#39;started&#39; = 15, &#39;published&#39; = 16, &#39;update&#39; = 17, &#39;create&#39; = 18, &#39;fork&#39; = 19, &#39;merged&#39; = 20),
comment&#95;id UInt64,
path String,
ref LowCardinality(String),
ref&#95;type Enum(&#39;none&#39; = 0, &#39;branch&#39; = 1, &#39;tag&#39; = 2, &#39;repository&#39; = 3, &#39;unknown&#39; = 4),
creator&#95;user&#95;login LowCardinality(String),
number UInt32,
title String,
labels Array(LowCardinality(String)),
state Enum(&#39;none&#39; = 0, &#39;open&#39; = 1, &#39;closed&#39; = 2),
assignee LowCardinality(String),
assignees Array(LowCardinality(String)),
closed&#95;at DateTime,
merged&#95;at DateTime,
merge&#95;commit&#95;sha String,
requested&#95;reviewers Array(LowCardinality(String)),
merged&#95;by LowCardinality(String),
review&#95;comments UInt32,
member&#95;login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event&#95;type, repo&#95;name, created&#95;at);

````

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
````

この設定および Vector の動作について、いくつか重要な注意点があります。


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
