---
sidebar_label: 'Vector 与 Kafka'
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: '将 Vector 与 Kafka 和 ClickHouse 集成使用'
title: '将 Vector 与 Kafka 和 ClickHouse 集成使用'
doc_type: 'guide'
keywords: ['kafka', 'vector', '日志采集', '可观测性', '集成']
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


## 在 Kafka 和 ClickHouse 中使用 Vector \{#using-vector-with-kafka-and-clickhouse\}

Vector 是一个与厂商无关的数据管道，能够从 Kafka 读取数据并将事件发送到 ClickHouse。

针对 Vector 与 ClickHouse 的[入门](../etl-tools/vector-to-clickhouse.md)指南重点关注日志使用场景以及从文件中读取事件。我们使用包含在 Kafka topic 中事件的 [GitHub 示例数据集](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)。

Vector 使用 [sources](https://vector.dev/docs/about/concepts/#sources) 通过推送或拉取模型来获取数据。[sinks](https://vector.dev/docs/about/concepts/#sinks) 则为事件提供目标位置。因此，我们在此使用 Kafka source 和 ClickHouse sink。请注意，尽管 Kafka 支持作为 sink 使用，但目前尚无 ClickHouse source。因此，对于希望将数据从 ClickHouse 传输到 Kafka 的用户来说，Vector 并不适用。

Vector 还支持对数据进行[转换](https://vector.dev/docs/reference/configuration/transforms/)。这超出了本指南的范围。如果用户需要在其数据集上进行数据转换，请参考 Vector 文档。

请注意，当前 ClickHouse sink 的实现使用的是 HTTP 接口。ClickHouse sink 目前不支持使用 JSON schema。数据必须以纯 JSON 格式或字符串形式发布到 Kafka。

### 许可证 \{#license\}

Vector 按 [MPL-2.0 许可证](https://github.com/vectordotdev/vector/blob/master/LICENSE) 分发。

### 收集连接信息 \{#gather-your-connection-details\}

<ConnectionDetails />

### 步骤 \{#steps\}

1. 创建 Kafka 中的 `github` 主题，并写入 [GitHub 数据集](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)。

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

该数据集包含 200,000 行数据，针对 `ClickHouse/ClickHouse` 仓库。

2. 确保目标表已创建。下面我们使用默认数据库。

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

3. [下载并安装 Vector](https://vector.dev/docs/setup/quickstart/)。创建一个 `kafka.toml` 配置文件，并根据你的 Kafka 和 ClickHouse 实例调整其中的参数值。

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

关于此配置以及 Vector 的行为，有几个重要注意事项：


* 此示例已在 Confluent Cloud 上进行测试。因此，`sasl.*` 和 `ssl.enabled` 安全选项在自行管理部署的场景中可能并不适用。
* 配置参数 `bootstrap_servers` 不需要协议前缀，例如 `pkc-2396y.us-east-1.aws.confluent.cloud:9092`。
* source 端参数 `decoding.codec = "json"` 可确保消息作为单个 JSON 对象传递给 ClickHouse sink。如果将消息作为字符串处理并使用默认的 `bytes` 值，消息内容将被追加到字段 `message` 中。在大多数情况下，这需要在 ClickHouse 中进行进一步处理，如 [Vector 入门](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs) 指南中所述。
* Vector 会[向消息添加若干字段](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)。在我们的示例中，我们通过 ClickHouse sink 中的配置参数 `skip_unknown_fields = true` 忽略这些字段。该参数会忽略不属于目标表 schema 的字段。你可以根据需要调整 schema，以确保将 `offset` 等此类元字段添加进去。
* 注意 sink 如何通过参数 `inputs` 引用事件的 source。
* 注意 ClickHouse sink 的行为，如[此处](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)所述。为获得最佳吞吐量，用户可能需要调优 `buffer.max_events`、`batch.timeout_secs` 和 `batch.max_bytes` 参数。根据 ClickHouse 的[建议](/sql-reference/statements/insert-into#performance-considerations)，单个批次中的事件数量应至少为 1000。对于吞吐量持续较高的用例，可以增加参数 `buffer.max_events`。对于吞吐量波动较大的场景，可能需要调整参数 `batch.timeout_secs`。
* 参数 `auto_offset_reset = "smallest"` 会强制 Kafka source 从 topic 的起始位置开始读取——从而确保我们能消费在步骤 (1) 中发布的消息。用户可能需要不同的行为，更多详情参见[此处](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)。

4. 启动 Vector

```bash
vector --config ./kafka.toml
```

默认情况下，在开始向 ClickHouse 插入数据之前，需要先进行一次[健康检查](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck)，以确保能够建立连接并读取 schema。将 `VECTOR_LOG=debug` 添加到命令前可以获取更详细的日志信息，在排查问题时会很有帮助。

5. 确认数据已成功插入。

```sql
SELECT count() AS count FROM github;
```

| 数量     |
| :----- |
| 200000 |
