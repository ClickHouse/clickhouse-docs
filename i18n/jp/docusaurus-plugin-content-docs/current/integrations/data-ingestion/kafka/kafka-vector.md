---
sidebar_label: 'Kafka と Vector'
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: 'Kafka および ClickHouse での Vector の利用'
title: 'Kafka および ClickHouse での Vector の利用'
doc_type: 'guide'
keywords: ['kafka', 'vector', 'log collection', 'observability', 'integration']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


## VectorをKafkaおよびClickHouseと併用する {#using-vector-with-kafka-and-clickhouse}

Vectorは、Kafkaからデータを読み取り、ClickHouseにイベントを送信する機能を持つ、ベンダー非依存のデータパイプラインです。

VectorとClickHouseの[入門ガイド](../etl-tools/vector-to-clickhouse.md)では、ログのユースケースとファイルからのイベント読み取りに焦点を当てています。ここでは、Kafkaトピックに保持されているイベントを含む[GitHubサンプルデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を使用します。

Vectorは、プッシュまたはプルモデルを通じてデータを取得するために[ソース](https://vector.dev/docs/about/concepts/#sources)を利用します。一方、[シンク](https://vector.dev/docs/about/concepts/#sinks)はイベントの送信先を提供します。したがって、ここではKafkaソースとClickHouseシンクを使用します。Kafkaはシンクとしてサポートされていますが、ClickHouseソースは利用できないことに注意してください。そのため、VectorはClickHouseからKafkaにデータを転送したいユーザーには適していません。

Vectorはデータの[変換](https://vector.dev/docs/reference/configuration/transforms/)もサポートしています。これは本ガイドの範囲外です。データセットに対してこの機能が必要な場合は、Vectorのドキュメントを参照してください。

現在のClickHouseシンクの実装はHTTPインターフェースを使用していることに注意してください。ClickHouseシンクは現時点でJSONスキーマの使用をサポートしていません。データは、プレーンJSON形式または文字列としてKafkaに公開する必要があります。

### ライセンス {#license}

Vectorは[MPL-2.0ライセンス](https://github.com/vectordotdev/vector/blob/master/LICENSE)の下で配布されています。

### 接続情報の収集 {#gather-your-connection-details}

<ConnectionDetails />

### 手順 {#steps}

1. Kafkaの`github`トピックを作成し、[GitHubデータセット](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)を挿入します。

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

このデータセットは、`ClickHouse/ClickHouse`リポジトリに焦点を当てた200,000行で構成されています。

2. ターゲットテーブルが作成されていることを確認します。以下ではデフォルトデータベースを使用します。

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

3. [Vectorをダウンロードしてインストールします](https://vector.dev/docs/setup/quickstart/)。`kafka.toml`設定ファイルを作成し、KafkaおよびClickHouseインスタンスの値を変更します。

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

この設定と Vector の動作について、いくつか重要な注意点があります。


* この例は Confluent Cloud に対してテストされています。そのため、`sasl.*` および `ssl.enabled` セキュリティオプションは、セルフマネージド環境では適切でない可能性があります。
* 設定パラメータ `bootstrap_servers` にはプロトコルのプレフィックスは不要です。例: `pkc-2396y.us-east-1.aws.confluent.cloud:9092`
* ソースパラメータ `decoding.codec = "json"` により、メッセージは単一の JSON オブジェクトとして ClickHouse sink に渡されます。メッセージを文字列として扱い、デフォルトの `bytes` 値を使用する場合、メッセージの内容はフィールド `message` に追加されます。ほとんどのケースでは、[Vector getting started](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs) ガイドで説明しているように、ClickHouse 側での処理が必要になります。
* Vector はメッセージに[多数のフィールドを追加](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)します。この例では、ClickHouse sink の設定パラメータ `skip_unknown_fields = true` によって、これらのフィールドを無視しています。これは、対象テーブルのスキーマに含まれないフィールドを無視するものです。`offset` のようなメタフィールドを追加したい場合は、スキーマを調整してください。
* sink がパラメータ `inputs` を介してイベントのソースを参照している点に注目してください。
* ClickHouse sink の動作については[こちら](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)を参照してください。スループットを最適化するために、`buffer.max_events`、`batch.timeout_secs`、`batch.max_bytes` パラメータのチューニングを検討できます。ClickHouse の[推奨事項](/sql-reference/statements/insert-into#performance-considerations)に従うと、単一バッチ内のイベント数として 1000 を下限値として考慮すべきです。スループットが一様に高いユースケースでは、`buffer.max_events` パラメータを増加させることができます。スループットがより変動する場合は、`batch.timeout_secs` パラメータの調整が必要になることがあります。
* パラメータ `auto_offset_reset = "smallest"` は、Kafka ソースがトピックの先頭から読み取りを開始するようにします。これにより、手順 (1) で発行されたメッセージが確実に消費されます。ユーザーによっては異なる動作が必要な場合があります。詳細は[こちら](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)を参照してください。

4. Vector を起動する

```bash
vector --config ./kafka.toml
```

デフォルトでは、ClickHouse への挿入が開始される前に [health check](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck) が必要です。これにより、接続が確立できることとスキーマが読み取れることが保証されます。問題が発生した場合に役立つ詳細なログを取得するには、コマンドの前に `VECTOR_LOG=debug` を付けて実行してください。

5. データが挿入されたことを確認します。

```sql
SELECT count() AS count FROM github;
```

| count  |
| :----- |
| 200000 |
