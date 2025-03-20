---
sidebar_label: 使用 Kafka 的 Vector
sidebar_position: 3
slug: /integrations/kafka/kafka-vector
description: 使用 Vector 与 Kafka 和 ClickHouse
---
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

## 使用 Vector 与 Kafka 和 ClickHouse {#using-vector-with-kafka-and-clickhouse}

 Vector 是一个与供应商无关的数据管道，能够从 Kafka 读取数据并将事件发送到 ClickHouse。

一个关于 Vector 与 ClickHouse 的 [入门指南](../etl-tools/vector-to-clickhouse.md) 重点介绍了日志用例和从文件读取事件。我们利用 [Github 示例数据集](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)，该数据集包含位于 Kafka 主题上的事件。

Vector 使用 [sources](https://vector.dev/docs/about/concepts/#sources) 通过推送或拉取模型来检索数据。[Sinks](https://vector.dev/docs/about/concepts/#sinks) 则提供事件的目标。因此，我们使用 Kafka 源和 ClickHouse 接收器。请注意，虽然 Kafka 被支持为接收器，但 ClickHouse 源目前不可用。因此，Vector 不适合希望将数据从 ClickHouse 传输到 Kafka 的用户。

Vector 还支持数据的 [transformation](https://vector.dev/docs/reference/configuration/transforms/)。这超出了本指南的范围。如果用户需要这方面的帮助，请参考 Vector 文档。

请注意，当前 ClickHouse 接收器的实现利用了 HTTP 接口。目前 ClickHouse 接收器不支持使用 JSON schema。数据必须以纯 JSON 格式或字符串格式发布到 Kafka。

### 许可证 {#license}
Vector 根据 [MPL-2.0 许可证](https://github.com/vectordotdev/vector/blob/master/LICENSE) 分发。


### 收集您的连接详情 {#gather-your-connection-details}
<ConnectionDetails />

### 步骤 {#steps}

1. 创建 Kafka `github` 主题，并插入 [Github 数据集](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)。

```bash
cat /opt/data/github/github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

该数据集包含 200,000 行，专注于 `ClickHouse/ClickHouse` 存储库。

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

3. [下载并安装 Vector](https://vector.dev/docs/setup/quickstart/)。创建一个 `kafka.toml` 配置文件，并修改 Kafka 和 ClickHouse 实例的值。

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

关于此配置和 Vector 行为的一些重要注意事项：

- 此示例已在 Confluent Cloud 上进行了测试。因此，`sasl.*` 和 `ssl.enabled` 安全选项在自管理的情况下可能不合适。
- 配置参数 `bootstrap_servers` 不需要协议前缀，例如 `pkc-2396y.us-east-1.aws.confluent.cloud:9092`
- 源参数 `decoding.codec = "json"` 确保消息被作为单个 JSON 对象传递给 ClickHouse 接收器。如果将消息作为字符串处理并使用默认的 `bytes` 值，则消息内容将附加到字段 `message`。在大多数情况下，这将需要在 ClickHouse 中处理，如 [Vector 入门指南](../etl-tools/vector-to-clickhouse.md#4-parse-the-logs) 所描述。
- Vector [为消息添加了许多字段](https://vector.dev/docs/reference/configuration/sources/kafka/#output-data)。在我们的示例中，我们通过配置参数 `skip_unknown_fields = true` 忽略这些字段。这将忽略不属于目标表架构的字段。请根据需要调整您的架构，以确保添加诸如 `offset` 的元字段。
- 请注意，接收器如何通过参数 `inputs` 引用事件源。
- 请注意 ClickHouse 接收器的行为如 [此处所述](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#buffers-and-batches)。为了获得最佳吞吐量，用户可能希望调整 `buffer.max_events`、`batch.timeout_secs` 和 `batch.max_bytes` 参数。根据 ClickHouse [建议](/sql-reference/statements/insert-into#performance-considerations)，单个批次中的事件数量应考虑为 1000 的最小值。对于均匀的高吞吐量用例，用户可以增加 `buffer.max_events` 参数。更多变量的吞吐量可能需要调整 `batch.timeout_secs` 参数。
- 参数 `auto_offset_reset = "smallest"` 强制 Kafka 源从主题的开始处启动，从而确保我们消费在步骤 (1) 发布的消息。用户可能需要不同的行为。有关详细信息，请参见 [这里](https://vector.dev/docs/reference/configuration/sources/kafka/#auto_offset_reset)。

4. 启动 Vector

```bash
vector --config ./kafka.toml
```

默认情况下，在开始插入到 ClickHouse 之前需要进行 [健康检查](https://vector.dev/docs/reference/configuration/sinks/clickhouse/#healthcheck)。这确保可以建立连接并读取架构。前面加上 `VECTOR_LOG=debug` 以获取进一步的日志，这在遇到问题时可能会有所帮助。

5. 确认数据的插入。

```sql
SELECT count() as count FROM github;
```

| count |
| :--- |
| 200000 |
