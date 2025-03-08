---
sidebar_label: Kafka Connect JDBC 连接器
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: 使用 Kafka Connect 和 ClickHouse 的 JDBC 连接器接收器
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# JDBC 连接器

:::note
此连接器仅在您的数据简单且由基本数据类型（例如，int）组成时使用。ClickHouse 特定类型，如映射，不支持。
:::

在我们的示例中，我们利用了 Confluent 版本的 Kafka Connect。

下面我们描述了一个简单的安装过程，从单个 Kafka 主题中提取消息并将行插入到 ClickHouse 表中。我们推荐使用 Confluent Cloud，该服务为没有 Kafka 环境的用户提供慷慨的免费套餐。

请注意，JDBC 连接器需要一个模式（您不能使用普通的 JSON 或 CSV）。虽然模式可以在每个消息中编码，但**强烈建议使用 Confluent 模式注册表**以避免相关开销。提供的插入脚本会自动推断消息的模式并将其插入到注册表中，因此此脚本可以重用于其他数据集。Kafka 的键被假定为字符串。有关 Kafka 模式的更多详细信息，请参见 [此处](https://docs.confluent.io/platform/current/schema-registry/index.html)。

### 许可证 {#license}
JDBC 连接器根据 [Confluent Community License](https://www.confluent.io/confluent-community-license) 分发。

### 步骤 {#steps}
#### 收集您的连接详细信息 {#gather-your-connection-details}
<ConnectionDetails />

#### 1. 安装 Kafka Connect 和连接器 {#1-install-kafka-connect-and-connector}

我们假设您已下载 Confluent 包并将其安装在本地。按照 [这里](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector) 文档中的安装说明安装连接器。

如果您使用 confluent-hub 安装方法，本地配置文件将被更新。

为了从 Kafka 向 ClickHouse 发送数据，我们使用连接器的接收器组件。

#### 2. 下载并安装 JDBC 驱动程序 {#2-download-and-install-the-jdbc-driver}

从 [这里](https://github.com/ClickHouse/clickhouse-java/releases) 下载并安装 ClickHouse JDBC 驱动程序 `clickhouse-jdbc-<version>-shaded.jar`。按照 [这里](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers) 的详细信息将其安装到 Kafka Connect 中。其他驱动程序可能有效，但尚未经过测试。

:::note

常见问题：文档建议将 jar 复制到 `share/java/kafka-connect-jdbc/`。如果您在 Connect 中遇到找不到驱动程序的问题，请将驱动程序复制到 `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`。或者修改 `plugin.path` 以包括驱动程序 - 详见下文。

:::

#### 3. 准备配置 {#3-prepare-configuration}

按照 [这些说明](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) 设置与您的安装类型相关的 Connect，注意独立和分布式集群之间的差异。如果使用 Confluent Cloud，则相关于分布式设置。

以下参数与将 JDBC 连接器与 ClickHouse 一起使用相关。完整参数列表可在 [这里](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html) 查找：

* `_connection.url_` - 其形式应为 `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>`
* `connection.user` - 对目标数据库具有写入权限的用户
* `table.name.format` - ClickHouse 表以插入数据。这个表必须存在。
* `batch.size` - 单个批次中要发送的行数。确保此项设置为适当大的数字。根据 ClickHouse 的 [建议](/sql-reference/statements/insert-into#performance-considerations)，值 1000 应视为最小值。
* `tasks.max` - JDBC Sink 连接器支持运行一个或多个任务。可以用来提高性能。结合批量大小，这是提高性能的主要手段。
* `value.converter.schemas.enable` - 如果使用模式注册表，设置为 false；如果您在消息中嵌入模式，则设置为 true。
* `value.converter` - 根据您的数据类型进行设置，例如对于 JSON，使用 `io.confluent.connect.json.JsonSchemaConverter`。
* `key.converter` - 设置为 `org.apache.kafka.connect.storage.StringConverter`。我们使用字符串键。
* `pk.mode` - 对 ClickHouse 不相关。设置为 none。
* `auto.create` - 不受支持，必须为 false。
* `auto.evolve` - 我们建议此设置为 false，尽管可能在未来支持。
* `insert.mode` - 设置为 "insert"。当前不支持其他模式。
* `key.converter` - 根据您的键类型进行设置。
* `value.converter` - 根据您主题中的数据类型进行设置。此数据必须具有受支持的模式 - JSON、Avro 或 Protobuf 格式。

如果使用我们的示例数据集进行测试，请确保设置以下内容：

* `value.converter.schemas.enable` - 设置为 false，因为我们使用模式注册表。如果您在每条消息中嵌入模式，则设置为 true。
* `key.converter` - 设置为 "org.apache.kafka.connect.storage.StringConverter"。我们使用字符串键。
* `value.converter` - 设置为 "io.confluent.connect.json.JsonSchemaConverter"。
* `value.converter.schema.registry.url` - 设置为模式服务器的 URL 及模式服务器的凭据，通过参数 `value.converter.schema.registry.basic.auth.user.info` 传递。

关于 Github 样本数据的示例配置文件，可以在 [这里](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink) 找到，假设 Connect 以独立模式运行，并且 Kafka 托管在 Confluent Cloud 中。

#### 4. 创建 ClickHouse 表 {#4-create-the-clickhouse-table}

确保表已经创建，如果之前存在，请将其删除。下面是与缩小的 Github 数据集兼容的一个示例。注意缺少当前不支持的任何 Array 或 Map 类型：

```sql
CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
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
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at)
```

#### 5. 启动 Kafka Connect {#5-start-kafka-connect}

在 [独立](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) 或 [分布式](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster) 模式下启动 Kafka Connect。

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. 向 Kafka 添加数据 {#6-add-data-to-kafka}

使用提供的 [脚本和配置](https://github.com/ClickHouse/kafka-samples/tree/main/producer) 向 Kafka 插入消息。您需要修改 github.config 以包含您的 Kafka 凭据。该脚本目前配置为与 Confluent Cloud 一起使用。

```bash
python producer.py -c github.config
```

该脚本可用于将任何 ndjson 文件插入到 Kafka 主题。它将尝试为您自动推断模式。提供的示例配置将仅插入 10k 消息 - 如果需要，请 [在此处修改](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25)。此配置在将数据插入 Kafka 期间还会移除数据集中任何不兼容的 Array 字段。

这是 JDBC 连接器将消息转换为 INSERT 语句所必需的。如果您使用自己的数据，请确保在每条消息中插入模式（将 _value.converter.schemas.enable _ 设置为 true）或确保您的客户端发布的消息引用注册表中的模式。

Kafka Connect 应开始消费消息并将行插入到 ClickHouse。请注意，有关 "[JDBC 兼容模式] 不支持事务。" 的警告是预期的，可以忽略。

对目标表 "Github" 的简单读取应确认数据插入。

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### 推荐进一步阅读 {#recommended-further-reading}

* [Kafka Sink 配置参数](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connect 深入探讨 – JDBC 源连接器](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC Sink 深入探讨：处理主键](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect 实践：JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 适合喜欢观看而非阅读的人。
* [Kafka Connect 深入探讨 – 转换器和序列化解释](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)

