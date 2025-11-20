---
sidebar_label: '适用于 Confluent Platform 的 HTTP Sink 连接器'
sidebar_position: 4
slug: /integrations/kafka/cloud/confluent/http
description: '在 Kafka Connect 和 ClickHouse 中使用 HTTP Sink 连接器'
title: 'Confluent HTTP Sink 连接器'
doc_type: 'guide'
keywords: ['Confluent HTTP Sink Connector', 'HTTP Sink ClickHouse', 'Kafka HTTP connector
', 'ClickHouse HTTP integration', 'Confluent Cloud HTTP Sink']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';


# Confluent HTTP Sink 连接器

HTTP Sink 连接器与数据类型无关,因此不需要 Kafka schema,同时支持 ClickHouse 特定的数据类型,如 Map 和 Array。这种额外的灵活性会带来配置复杂度的轻微增加。

下面我们介绍一个简单的安装过程,从单个 Kafka 主题拉取消息并将数据行插入到 ClickHouse 表中。

:::note
HTTP 连接器基于 [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license) 分发。
:::

### 快速入门步骤 {#quick-start-steps}

#### 1. 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />

#### 2. 运行 Kafka Connect 和 HTTP Sink 连接器 {#2-run-kafka-connect-and-the-http-sink-connector}

您有两个选项:

- **自管理:** 下载 Confluent 软件包并在本地安装。按照[此处](https://docs.confluent.io/kafka-connect-http/current/overview.html)记录的安装说明来安装连接器。
  如果您使用 confluent-hub 安装方法,您的本地配置文件将被更新。

- **Confluent Cloud:** 对于使用 Confluent Cloud 托管 Kafka 的用户,可以使用完全托管版本的 HTTP Sink。这要求您的 ClickHouse 环境可以从 Confluent Cloud 访问。

:::note
以下示例使用 Confluent Cloud。
:::

#### 3. 在 ClickHouse 中创建目标表 {#3-create-destination-table-in-clickhouse}

在连接测试之前,让我们先在 ClickHouse Cloud 中创建一个测试表,该表将接收来自 Kafka 的数据:

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

创建一个 Kafka 主题和一个 HTTP Sink 连接器实例:

<Image
  img={createHttpSink}
  size='sm'
  alt='Confluent Cloud 界面显示如何创建 HTTP Sink 连接器'
  border
/>

<br />

配置 HTTP Sink 连接器:

- 提供您创建的主题名称
- 身份验证
  - `HTTP Url` - ClickHouse Cloud URL,指定 `INSERT` 查询 `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`。**注意**:查询必须进行编码。
  - `Endpoint Authentication type` - BASIC
  - `Auth username` - ClickHouse 用户名
  - `Auth password` - ClickHouse 密码

:::note
此 HTTP Url 容易出错。请确保转义准确以避免问题。
:::

<Image
  img={httpAuth}
  size='lg'
  alt='Confluent Cloud 界面显示 HTTP Sink 连接器的身份验证设置'
  border
/>
<br />

- 配置
  - `Input Kafka record value format` 取决于您的源数据,但在大多数情况下为 JSON 或 Avro。我们在以下设置中假设为 `JSON`。
  - 在 `advanced configurations` 部分:
    - `HTTP Request Method` - 设置为 POST
    - `Request Body Format` - json
    - `Batch batch size` - 根据 ClickHouse 建议,将此设置为**至少 1000**。
    - `Batch json as array` - true
    - `Retry on HTTP codes` - 400-500,但根据需要进行调整,例如,如果您在 ClickHouse 前面有 HTTP 代理,这可能会改变。
    - `Maximum Reties` - 默认值(10)是合适的,但可以根据需要调整以实现更强大的重试。

<Image
  img={httpAdvanced}
  size='sm'
  alt='Confluent Cloud 界面显示 HTTP Sink 连接器的高级配置选项'
  border
/>

#### 5. 测试连接性 {#5-testing-the-connectivity}

在由您的 HTTP Sink 配置的主题中创建一条消息

<Image
  img={createMessageInTopic}
  size='md'
  alt='Confluent Cloud 界面显示如何在 Kafka 主题中创建测试消息'
  border
/>

<br />

并验证创建的消息已写入您的 ClickHouse 实例。

### 故障排除 {#troubleshooting}

#### HTTP Sink 不批处理消息 {#http-sink-doesnt-batch-messages}

来自 [Sink 文档](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp):

> HTTP Sink 连接器不会对包含不同 Kafka 头值的消息进行批处理请求。


1. 验证您的 Kafka 记录具有相同的键。
2. 当您向 HTTP API URL 添加参数时,每条记录可能会生成唯一的 URL。因此,使用额外的 URL 参数时批处理将被禁用。

#### 400 错误请求 {#400-bad-request}

##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}

如果在将 JSON 对象插入 `String` 列时 HTTP Sink 失败并显示以下消息:

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

在 URL 中将 `input_format_json_read_objects_as_strings=1` 设置为编码字符串 `SETTINGS%20input_format_json_read_objects_as_strings%3D1`

### 加载 GitHub 数据集(可选) {#load-the-github-dataset-optional}

请注意,此示例保留了 Github 数据集的 Array 字段。我们假设您在示例中有一个空的 github 主题,并使用 [kcat](https://github.com/edenhill/kcat) 向 Kafka 插入消息。

##### 1. 准备配置 {#1-prepare-configuration}

按照[这些说明](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)设置与您的安装类型相关的 Connect,注意独立集群和分布式集群之间的差异。如果使用 Confluent Cloud,则需要使用分布式设置。

最重要的参数是 `http.api.url`。ClickHouse 的 [HTTP 接口](../../../../interfaces/http.md)要求您将 INSERT 语句编码为 URL 中的参数。这必须包括格式(在本例中为 `JSONEachRow`)和目标数据库。格式必须与 Kafka 数据一致,这些数据将在 HTTP 负载中转换为字符串。这些参数必须进行 URL 转义。下面显示了 Github 数据集的此格式示例(假设您在本地运行 ClickHouse):

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

以下附加参数与在 ClickHouse 中使用 HTTP Sink 相关。完整的参数列表可以在[这里](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)找到:

- `request.method` - 设置为 **POST**
- `retry.on.status.codes` - 设置为 400-500 以在任何错误代码时重试。根据数据中的预期错误进行调整。
- `request.body.format` - 在大多数情况下,这将是 JSON。
- `auth.type` - 如果在 ClickHouse 中启用了安全认证,则设置为 BASIC。目前不支持其他 ClickHouse 兼容的身份验证机制。
- `ssl.enabled` - 如果使用 SSL,则设置为 true。
- `connection.user` - ClickHouse 的用户名。
- `connection.password` - ClickHouse 的密码。
- `batch.max.size` - 单个批次中发送的行数。确保将此设置为适当的较大数值。根据 ClickHouse 的[建议](/sql-reference/statements/insert-into#performance-considerations),应将 1000 视为最小值。
- `tasks.max` - HTTP Sink 连接器支持运行一个或多个任务。这可用于提高性能。与批次大小一起,这是您提高性能的主要方式。
- `key.converter` - 根据键的类型进行设置。
- `value.converter` - 根据主题上的数据类型进行设置。此数据不需要模式。这里的格式必须与参数 `http.api.url` 中指定的 FORMAT 一致。最简单的方法是使用 JSON 和 org.apache.kafka.connect.json.JsonConverter 转换器。通过转换器 org.apache.kafka.connect.storage.StringConverter 将值视为字符串也是可行的 - 但这需要用户在 insert 语句中使用函数提取值。如果使用 io.confluent.connect.avro.AvroConverter 转换器,ClickHouse 也支持 [Avro 格式](/interfaces/formats/Avro)。

完整的设置列表,包括如何配置代理、重试和高级 SSL,可以在[这里](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)找到。


Github 示例数据的配置文件可以在[这里](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink)找到,假设 Connect 以独立模式运行,且 Kafka 托管在 Confluent Cloud 中。

##### 2. 创建 ClickHouse 表 {#2-create-the-clickhouse-table}

确保表已创建。以下是使用标准 MergeTree 的最小 github 数据集示例。

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

向 Kafka 插入消息。以下使用 [kcat](https://github.com/edenhill/kcat) 插入 10k 条消息。

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

对目标表 "Github" 进行简单查询即可确认数据已插入。

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
