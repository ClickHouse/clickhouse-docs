---
sidebar_label: 'Confluent Platform HTTP Sink 连接器'
sidebar_position: 4
slug: /integrations/kafka/cloud/confluent/http
description: '在 Kafka Connect 中使用 HTTP Sink 连接器与 ClickHouse 集成'
title: 'Confluent HTTP Sink 连接器'
doc_type: 'guide'
keywords: ['Confluent HTTP Sink Connector', 'HTTP Sink ClickHouse', 'Kafka HTTP 连接器', 'ClickHouse HTTP 集成', 'Confluent Cloud HTTP Sink']
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';


# Confluent HTTP sink connector \\{#confluent-http-sink-connector\\}

HTTP Sink Connector 与数据类型无关，因此不需要 Kafka schema，同时也支持 ClickHouse 特定的数据类型，例如 Map 和 Array。这个额外的灵活性会带来一定的配置复杂度提升。

下面我们将介绍一个简单的安装示例：从单个 Kafka 主题中拉取消息，并将行写入 ClickHouse 表中。

:::note
HTTP Connector 是在 [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license) 许可下分发的。
:::

### 快速开始步骤 \\{#quick-start-steps\\}

#### 1. 收集连接信息 \\{#1-gather-your-connection-details\\}

<ConnectionDetails />

#### 2. 运行 Kafka Connect 和 HTTP sink connector \\{#2-run-kafka-connect-and-the-http-sink-connector\\}

你有两种选项：

* **自托管（Self-managed）：** 下载 Confluent 安装包并在本地安装。按照[此处](https://docs.confluent.io/kafka-connect-http/current/overview.html)文档中关于安装 connector 的说明进行操作。\
  如果你使用 confluent-hub 的安装方法，你的本地配置文件将会被更新。

* **Confluent Cloud：** 对于在 Confluent Cloud 上托管 Kafka 的用户，提供了一个完全托管的 HTTP Sink 版本。这要求你的 ClickHouse 环境能够从 Confluent Cloud 访问。

:::note
以下示例使用的是 Confluent Cloud。
:::

#### 3. 在 ClickHouse 中创建目标表 \{#3-create-destination-table-in-clickhouse\}

在进行连通性测试之前，我们先在 ClickHouse Cloud 中创建一个测试表，该表将接收来自 Kafka 的数据：

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


#### 4. 配置 HTTP Sink \\{#4-configure-http-sink\\}

创建一个 Kafka 主题以及一个 HTTP Sink Connector 实例：

<Image img={createHttpSink} size="sm" alt="Confluent Cloud 界面展示如何创建 HTTP Sink connector" border />

<br />

配置 HTTP Sink Connector：

* 提供你创建的主题名称
* 认证（Authentication）
  * `HTTP Url` - 带有指定 `INSERT` 查询的 ClickHouse Cloud URL：`<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`。**注意**：该查询必须进行编码。
  * `Endpoint Authentication type` - BASIC
  * `Auth username` - ClickHouse 用户名
  * `Auth password` - ClickHouse 密码

:::note
该 HTTP Url 很容易出错。请确保转义准确无误，以避免问题。
:::

<Image img={httpAuth} size="lg" alt="Confluent Cloud 界面展示 HTTP Sink connector 的认证设置" border />

<br />

* 配置（Configuration）
  * `Input Kafka record value format` 取决于你的源数据，但在大多数情况下为 JSON 或 Avro。以下设置中我们假定为 `JSON`。
  * 在 `advanced configurations` 部分：
    * `HTTP Request Method` - 设置为 POST
    * `Request Body Format` - json
    * `Batch batch size` - 根据 ClickHouse 的建议，将其设置为**至少 1000**。
    * `Batch json as array` - true
    * `Retry on HTTP codes` - 400-500，但可按需调整，例如如果 ClickHouse 前面有 HTTP 代理时可能需要修改。
    * `Maximum Reties` - 默认值（10）通常是合适的，但你可以根据需要调整，以获得更健壮的重试机制。

<Image img={httpAdvanced} size="sm" alt="Confluent Cloud 界面展示 HTTP Sink connector 的高级配置选项" border />

#### 5. 测试连通性 \\{#5-testing-the-connectivity\\}

在由你的 HTTP Sink 配置的主题中创建一条消息：

<Image img={createMessageInTopic} size="md" alt="Confluent Cloud 界面展示如何在 Kafka 主题中创建测试消息" border/>

<br/>

并验证该消息已写入你的 ClickHouse 实例。

### 故障排查 \\{#troubleshooting\\}

#### HTTP Sink 不对消息进行批处理 \\{#http-sink-doesnt-batch-messages\\}

摘自 [Sink 文档](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp)：

> 对于包含不同 Kafka header 值的消息，HTTP Sink connector 不会对请求进行批处理。

1. 确认你的 Kafka 记录使用相同的 key。
2. 当你在 HTTP API URL 中添加参数时，每条记录都可能生成唯一的 URL。基于这一点，当使用额外的 URL 参数时会禁用批处理功能。

#### 400 Bad Request \\{#400-bad-request\\}

##### CANNOT&#95;PARSE&#95;QUOTED&#95;STRING \{#cannot_parse_quoted_string\}

如果在向 `String` 列插入 JSON 对象时，HTTP Sink 失败并出现以下消息：

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

在 URL 中将参数 `input_format_json_read_objects_as_strings=1` 以编码字符串 `SETTINGS%20input_format_json_read_objects_as_strings%3D1` 的形式设置


### 加载 GitHub 数据集（可选） \\{#load-the-github-dataset-optional\\}

请注意，本示例会保留 GitHub 数据集中的 Array 字段。我们假设您在示例环境中有一个空的 GitHub 主题，并使用 [kcat](https://github.com/edenhill/kcat) 向 Kafka 插入消息。

##### 1. 准备配置 \{#1-prepare-configuration\}

根据您的安装类型，遵循[这些说明](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)来设置 Connect，并注意 standalone 集群与 distributed 集群之间的差异。如果使用 Confluent Cloud，则应采用 distributed 设置。

最重要的参数是 `http.api.url`。ClickHouse 的 [HTTP 接口](/interfaces/http) 要求您将 INSERT 语句作为参数编码在 URL 中。该语句必须包含格式（在本例中为 `JSONEachRow`）以及目标数据库。该格式必须与 Kafka 数据保持一致，Kafka 数据会在 HTTP 请求负载中被转换为字符串。这些参数必须进行 URL 转义。下面展示了一个适用于 GitHub 数据集的示例格式（假设您在本地运行 ClickHouse）：

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

以下附加参数与在 ClickHouse 中使用 HTTP Sink 相关。完整的参数列表可在[此处](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)找到：

* `request.method` - 设置为 **POST**。
* `retry.on.status.codes` - 设置为 400-500 以便在任何错误码时进行重试。可根据预期的数据错误情况进一步细化配置。
* `request.body.format` - 在大多数情况下应为 JSON。
* `auth.type` - 如果对 ClickHouse 启用了身份认证，则设置为 BASIC。其他与 ClickHouse 兼容的认证机制目前尚不支持。
* `ssl.enabled` - 如果使用 SSL 则设置为 true。
* `connection.user` - ClickHouse 的用户名。
* `connection.password` - ClickHouse 的密码。
* `batch.max.size` - 在单个批次中发送的行数。请确保该值足够大。根据 ClickHouse 的[建议](/sql-reference/statements/insert-into#performance-considerations)，1000 应被视为最小值。
* `tasks.max` - HTTP Sink connector 支持运行一个或多个任务，可用于提升性能。结合批大小，这是改进性能的主要手段。
* `key.converter` - 根据 key 的类型进行设置。
* `value.converter` - 根据 topic 中数据的类型进行设置。此数据不需要 schema。此处的格式必须与参数 `http.api.url` 中指定的 FORMAT 保持一致。最简单的是使用 JSON 以及 org.apache.kafka.connect.json.JsonConverter 转换器。也可以通过转换器 org.apache.kafka.connect.storage.StringConverter 将 value 视为字符串处理——不过这将要求用户在 INSERT 语句中通过函数提取值。如果使用 io.confluent.connect.avro.AvroConverter 转换器，ClickHouse 也支持 [Avro 格式](/interfaces/formats/Avro)。

包含如何配置代理、重试以及高级 SSL 在内的完整设置列表可在[此处](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)找到。

GitHub 示例数据的配置文件示例可在[此处](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink)找到，前提是 Connect 以 standalone 模式运行且 Kafka 部署在 Confluent Cloud 中。


##### 2. 创建 ClickHouse 表 \{#2-create-the-clickhouse-table\}

请确保已经创建该表。下面展示了一个使用标准 MergeTree 引擎的精简 Github 数据集示例。

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


##### 3. 向 Kafka 添加数据 \{#3-add-data-to-kafka\}

向 Kafka 写入消息。下面我们使用 [kcat](https://github.com/edenhill/kcat) 向 Kafka 写入 1 万条消息。

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

对目标表 &quot;Github&quot; 进行一次简单查询即可确认数据已成功写入。

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
