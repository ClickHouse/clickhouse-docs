---
'sidebar_label': 'Confluent Platform 的 HTTP Sink 连接器'
'sidebar_position': 3
'slug': '/integrations/kafka/cloud/confluent/http'
'description': '使用 Kafka Connect 和 ClickHouse 的 HTTP Connector Sink'
'title': 'Confluent HTTP Sink 连接器'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';


# Confluent HTTP Sink Connector
HTTP Sink Connector 是数据类型无关的，因此不需要 Kafka 模式，并且支持 ClickHouse 特有的数据类型，如 Maps 和 Arrays。这种额外的灵活性带来了轻微的配置复杂性增加。

下面我们将描述一个简单的安装，拉取来自单个 Kafka 主题的消息并插入行到 ClickHouse 表中。

:::note
  HTTP Connector 根据 [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license) 分发。
:::

### 快速启动步骤 {#quick-start-steps}

#### 1. 收集连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

#### 2. 运行 Kafka Connect 和 HTTP Sink Connector {#2-run-kafka-connect-and-the-http-sink-connector}

你有两个选择：

* **自管理:** 下载 Confluent 包并在本地安装。按照 [这里](https://docs.confluent.io/kafka-connect-http/current/overview.html) 文档中的安装指南进行操作。如果你使用 confluent-hub 安装方法，你的本地配置文件将会更新。

* **Confluent Cloud:** 对于使用 Confluent Cloud 进行 Kafka 托管的用户，HTTP Sink 的完全托管版本可供使用。这要求你的 ClickHouse 环境能够从 Confluent Cloud 访问。

:::note
  下面的示例使用的是 Confluent Cloud。
:::

#### 3. 在 ClickHouse 中创建目标表 {#3-create-destination-table-in-clickhouse}

在连接性测试之前，让我们先在 ClickHouse Cloud 中创建一个测试表，该表将接收来自 Kafka 的数据：

```sql
CREATE TABLE default.my_table
(
    `side` String,
    `quantity` Int32,
    `symbol` String,
    `price` Int32,
    `account` String,
    `userid` String
)
ORDER BY tuple()
```

#### 4. 配置 HTTP Sink {#4-configure-http-sink}
创建 Kafka 主题和 HTTP Sink Connector 实例：
<Image img={createHttpSink} size="sm" alt="Confluent Cloud interface showing how to create an HTTP Sink connector" border/>

<br />

配置 HTTP Sink Connector：
* 提供你创建的主题名称
* 认证
    * `HTTP Url` - ClickHouse Cloud URL，指定一个 `INSERT` 查询 `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`。**注意**:查询必须被编码。
    * `Endpoint Authentication type` - BASIC
    * `Auth username` - ClickHouse 用户名
    * `Auth password` - ClickHouse 密码

:::note
  这个 HTTP Url 易出错。确保转义精确，以避免问题。
:::

<Image img={httpAuth} size="lg" alt="Confluent Cloud interface showing authentication settings for the HTTP Sink connector" border/>
<br/>

* 配置
    * `Input Kafka record value format` - 根据你的源数据而定，但大多数情况下为 JSON 或 Avro。我们假设以下设置为 `JSON`。
    * 在 `advanced configurations` 部分：
        * `HTTP Request Method` - 设置为 POST
        * `Request Body Format` - json
        * `Batch batch size` - 根据 ClickHouse 推荐，将其设置为 **至少 1000**。
        * `Batch json as array` - true
        * `Retry on HTTP codes` - 400-500，但根据需要进行调整，例如如果你在 ClickHouse 前面有 HTTP 代理，这可能会改变。
        * `Maximum Reties` - 默认值（10）是合适的，但可以根据需要调整以实现更强大的重试。

<Image img={httpAdvanced} size="sm" alt="Confluent Cloud interface showing advanced configuration options for the HTTP Sink connector" border/>

#### 5. 测试连接性 {#5-testing-the-connectivity}
在你配置的 HTTP Sink 的主题中创建一条消息
<Image img={createMessageInTopic} size="md" alt="Confluent Cloud interface showing how to create a test message in a Kafka topic" border/>

<br />

并验证创建的消息已写入你的 ClickHouse 实例。

### 故障排除 {#troubleshooting}
#### HTTP Sink 没有批处理消息 {#http-sink-doesnt-batch-messages}

来自 [Sink documentation](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp):
> 如果包含不同的 Kafka 头值，HTTP Sink connector 不会批处理请求。

1. 验证你的 Kafka 记录是否具有相同的键。
2. 当你向 HTTP API URL 添加参数时，每个记录可能导致唯一的 URL。因此，当使用额外的 URL 参数时，批处理被禁用。

#### 400 Bad Request {#400-bad-request}
##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}
如果 HTTP Sink 在将 JSON 对象插入 `String` 列时失败，并出现以下消息：

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

在 URL 中设置 `input_format_json_read_objects_as_strings=1` 设置，作为编码字符串 `SETTINGS%20input_format_json_read_objects_as_strings%3D1`

### 加载 GitHub 数据集（可选） {#load-the-github-dataset-optional}

请注意，示例保留了 GitHub 数据集的 Array 字段。我们假设你在示例中有一个空的 github 主题，并使用 [kcat](https://github.com/edenhill/kcat) 向 Kafka 插入消息。

##### 1. 准备配置 {#1-prepare-configuration}

按照 [这些说明](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) 设置与您的安装类型相关的 Connect，并注意独立模式和分布式集群之间的差异。如果使用 Confluent Cloud，分布式设置是相关的。

最重要的参数是 `http.api.url`。ClickHouse 的 [HTTP 接口](../../../../interfaces/http.md) 要求你将 INSERT 语句作为 URL 中的参数进行编码。这必须包括格式（在本例中为 `JSONEachRow`）和目标数据库。格式必须与 Kafka 数据一致，该数据将在 HTTP 有效负载中转换为字符串。这些参数必须进行 URL 转义。以下是 GitHub 数据集的示例格式（假设你在本地运行 ClickHouse）：

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

以下附加参数与 ClickHouse 的 HTTP Sink 相关。完整参数列表可以在 [这里](https://docs.confluent.io/kafka-connect-http/current/connector_config.html) 找到：

* `request.method` - 设置为 **POST**
* `retry.on.status.codes` - 设置为 400-500 以在任何错误代码上重试。根据数据中的预期错误调整。
* `request.body.format` - 在大多数情况下，这将是 JSON。
* `auth.type` - 如果你使用 ClickHouse 的安全性，设置为 BASIC。目前不支持其他 ClickHouse 兼容的认证机制。
* `ssl.enabled` - 如果使用 SSL，则设置为 true。
* `connection.user` - ClickHouse 的用户名。
* `connection.password` - ClickHouse 的密码。
* `batch.max.size` - 在一次批处理中发送的行数。确保设置为适当大的数字。根据 ClickHouse 的 [建议](/sql-reference/statements/insert-into#performance-considerations)，建议使用 1000 作为最小值。
* `tasks.max` - HTTP Sink connector 支持运行一个或多个任务。这可以用于提高性能。与批处理大小一起，这是提高性能的主要手段。
* `key.converter` - 根据你的键的类型设置。
* `value.converter` - 根据主题中的数据类型设置。这些数据不需要模式。这里的格式必须与参数 `http.api.url` 中指定的 FORMAT 一致。使用 JSON 和 org.apache.kafka.connect.json.JsonConverter 转换器是最简单的。通过转换器 org.apache.kafka.connect.storage.StringConverter 将值视为字符串也是可能的 - 尽管这将要求用户在插入语句中使用函数提取值。如果使用 io.confluent.connect.avro.AvroConverter 转换器，ClickHouse也支持 [Avro格式](../../../../interfaces/formats.md#data-format-avro)。

完整的设置列表，包括如何配置代理、重试和高级 SSL，可以在 [这里](https://docs.confluent.io/kafka-connect-http/current/connector_config.html) 找到。

GitHub 示例数据的完整配置文件可以在 [这里](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink) 找到，假设 Connect 在独立模式下运行，且 Kafka 托管在 Confluent Cloud。

##### 2. 创建 ClickHouse 表 {#2-create-the-clickhouse-table}

确保已创建该表。下面是使用标准 MergeTree 的最小 GitHub 数据集的示例。

```sql
CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4,'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
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
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at)

```

##### 3. 向 Kafka 添加数据 {#3-add-data-to-kafka}

向 Kafka 插入消息。下面我们使用 [kcat](https://github.com/edenhill/kcat) 插入 10,000 条消息。

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

简单读取目标表 "Github" 应确认数据已插入。

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
