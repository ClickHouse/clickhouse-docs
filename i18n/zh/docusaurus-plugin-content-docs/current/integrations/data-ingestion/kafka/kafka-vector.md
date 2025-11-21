---
sidebar_label: '与 Kafka 搭配使用 Vector'
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: '在 Kafka 和 ClickHouse 中使用 Vector'
title: '在 Kafka 和 ClickHouse 中使用 Vector'
doc_type: 'guide'
keywords: ['kafka', 'vector', '日志采集', '可观测性', '集成']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


## 使用 Vector 与 Kafka 和 ClickHouse {#using-vector-with-kafka-and-clickhouse}

Vector 是一个与供应商无关的数据管道,能够从 Kafka 读取数据并将事件发送到 ClickHouse。

Vector 与 ClickHouse 的[入门指南](../etl-tools/vector-to-clickhouse.md)侧重于日志用例和从文件读取事件。本文使用存储在 Kafka 主题上的 [Github 示例数据集](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)。

Vector 使用[源(sources)](https://vector.dev/docs/about/concepts/#sources)通过推送或拉取模型检索数据。[接收器(sinks)](https://vector.dev/docs/about/concepts/#sinks)则为事件提供目标位置。因此,我们使用 Kafka 源和 ClickHouse 接收器。请注意,虽然 Kafka 支持作为接收器,但不支持 ClickHouse 源。因此,Vector 不适合需要将数据从 ClickHouse 传输到 Kafka 的用户。

Vector 还支持数据[转换](https://vector.dev/docs/reference/configuration/transforms/)。这超出了本指南的范围。如果用户需要对其数据集进行转换,请参阅 Vector 文档。

请注意,ClickHouse 接收器的当前实现使用 HTTP 接口。ClickHouse 接收器目前不支持使用 JSON schema。数据必须以纯 JSON 格式或字符串形式发布到 Kafka。

### 许可证 {#license}

Vector 在 [MPL-2.0 许可证](https://github.com/vectordotdev/vector/blob/master/LICENSE)下分发

### 收集连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />

### 步骤 {#steps}

1. 创建 Kafka `github` 主题并插入 [Github 数据集](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)。

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

该数据集包含 200,000 行,聚焦于 `ClickHouse/ClickHouse` 仓库。

2. 确保已创建目标表。下面我们使用默认数据库。

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

3. [下载并安装 Vector](https://vector.dev/docs/setup/quickstart/)。创建 `kafka.toml` 配置文件,并根据您的 Kafka 和 ClickHouse 实例修改相应的配置值。

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

下面是关于该配置和 Vector 行为的几点重要说明：


* 此示例已在 Confluent Cloud 上进行了测试。因此，`sasl.*` 和 `ssl.enabled` 安全选项在自托管场景中可能并不适用。
* 配置参数 `bootstrap_servers` 不需要协议前缀，例如 `pkc-2396y.us-east-1.aws.confluent.cloud:9092`。
* 源端参数 `decoding.codec = "json"` 可确保将消息作为单个 JSON 对象传递到 ClickHouse sink。如果将消息作为字符串处理并使用默认的 `bytes` 值，消息内容将被追加到字段 `message` 中。在大多数情况下，这需要在 ClickHouse 中进一步处理，如 [Vector 入门](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs) 指南中所述。
* Vector [会为消息添加多个字段](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)。在我们的示例中，我们通过配置参数 `skip_unknown_fields = true` 在 ClickHouse sink 中忽略这些字段。这会忽略不属于目标表 schema 的字段。你可以根据需要调整 schema，以确保将 `offset` 等这些元数据字段纳入其中。
* 注意 sink 如何通过参数 `inputs` 引用事件的 source。
* 注意 ClickHouse sink 的行为，如[此处](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)所述。为获得最佳吞吐量，用户可能希望调优 `buffer.max_events`、`batch.timeout_secs` 和 `batch.max_bytes` 参数。根据 ClickHouse 的[建议](/sql-reference/statements/insert-into#performance-considerations)，任意单个批次中的事件数量 1000 应被视为最小值。对于吞吐量较为均匀且较高的用例，用户可以增加参数 `buffer.max_events`。吞吐量波动较大的场景可能需要调整参数 `batch.timeout_secs`。
* 参数 `auto_offset_reset = "smallest"` 会强制 Kafka source 从该 topic 的起始位置开始消费，从而确保我们消费到在步骤 (1) 中发布的消息。用户可能需要不同的行为。更多详情请参见[此处](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)。

4. 启动 Vector

```bash
vector --config ./kafka.toml
```

默认情况下，在开始向 ClickHouse 插入数据之前，需要先进行一次[健康检查](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck)。这可以确保连接已建立并且可以读取 schema。将 `VECTOR_LOG=debug` 置于前面以启用调试日志，从而获取更多日志信息，在排查问题时会有所帮助。

5. 确认数据已被插入。

```sql
SELECT count() AS count FROM github;
```

| count  |
| :----- |
| 200000 |
