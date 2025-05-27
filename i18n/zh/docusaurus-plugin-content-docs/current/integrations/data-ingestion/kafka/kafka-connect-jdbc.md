---
'sidebar_label': 'Kafka Connect JDBC 连接器'
'sidebar_position': 4
'slug': '/integrations/kafka/kafka-connect-jdbc'
'description': '使用 JDBC 连接器接收器与 Kafka Connect 和 ClickHouse'
'title': 'JDBC 连接器'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# JDBC 连接器

:::note
仅当您的数据简单并且由基本数据类型组成（例如：int）时，才应使用此连接器。ClickHouse 特定类型，例如 maps，不受支持。
:::

在我们的示例中，我们使用 Confluent 分发版的 Kafka Connect。

下面我们描述了一种简单的安装方法，从单个 Kafka 主题获取消息并将行插入 ClickHouse 表中。我们推荐使用 Confluent Cloud，它为没有 Kafka 环境的用户提供了慷慨的免费套餐。

请注意，JDBC 连接器需要架构（您不能使用普通的 JSON 或 CSV 与 JDBC 连接器）。虽然可以在每条消息中编码架构，但**强烈建议使用 Confluent 架构注册表** [这里](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)y 以避免相关开销。提供的插入脚本会自动从消息中推断出架构并将其插入注册表 - 因此，该脚本可以重用于其他数据集。Kafka 的键假定为字符串。有关 Kafka 架构的更多详细信息，请参见 [这里](https://docs.confluent.io/platform/current/schema-registry/index.html)。

### 许可证 {#license}
JDBC 连接器根据 [Confluent Community License](https://www.confluent.io/confluent-community-license) 分发。

### 步骤 {#steps}
#### 收集连接详细信息 {#gather-your-connection-details}
<ConnectionDetails />

#### 1. 安装 Kafka Connect 和连接器 {#1-install-kafka-connect-and-connector}

我们假设您已下载了 Confluent 包并在本地安装。请按照 [这里](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector) 中记录的安装说明安装连接器。

如果您使用 confluent-hub 安装方法，您的本地配置文件将被更新。

为了从 Kafka 向 ClickHouse 发送数据，我们使用连接器的 Sink 组件。

#### 2. 下载和安装 JDBC 驱动程序 {#2-download-and-install-the-jdbc-driver}

从 [这里](https://github.com/ClickHouse/clickhouse-java/releases) 下载并安装 ClickHouse JDBC 驱动程序 `clickhouse-jdbc-<version>-shaded.jar`。根据 [这里](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers) 的信息将其安装到 Kafka Connect 中。其他驱动程序可能有效，但未经过测试。

:::note

常见问题：文档建议将 jar 复制到 `share/java/kafka-connect-jdbc/`。如果您在 Connect 找到驱动程序时遇到问题，请将驱动程序复制到 `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`。或者修改 `plugin.path` 以包含驱动程序 - 见下文。

:::

#### 3. 准备配置 {#3-prepare-configuration}

按照 [这些说明](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) 配置与您的安装类型相关的 Connect，注意独立和分布式集群之间的差异。如果使用 Confluent Cloud，分布式设置是相关的。

以下参数与使用 JDBC 连接器连接 ClickHouse 相关。完整参数列表可以在 [这里](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html) 找到：

* `_connection.url_` - 形式应为 `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>`
* `connection.user` - 具有目标数据库写入权限的用户
* `table.name.format`- ClickHouse 表以插入数据。此表必须存在。
* `batch.size` - 一次批量发送的行数。确保设置为适当大的数字。根据 ClickHouse 的 [建议](/sql-reference/statements/insert-into#performance-considerations)，值为 1000 应视为最低值。
* `tasks.max` - JDBC Sink 连接器支持运行一个或多个任务。这可以用来提高性能。连同批量大小，这表示您改善性能的主要手段。
* `value.converter.schemas.enable` - 如果使用架构注册表，设置为 false；如果您将架构嵌入到消息中，设置为 true。
* `value.converter` - 根据您的数据类型进行设置，例如对于 JSON，`io.confluent.connect.json.JsonSchemaConverter`。
* `key.converter` - 设置为 `org.apache.kafka.connect.storage.StringConverter`。我们使用字符串键。
* `pk.mode` - 与 ClickHouse 无关。设置为 none。
* `auto.create` - 不支持，必须设置为 false。
* `auto.evolve` - 我们建议将此设置为 false，尽管将来可能会受到支持。
* `insert.mode` - 设置为 "insert"。其他模式当前不受支持。
* `key.converter` - 根据您的键类型进行设置。
* `value.converter` - 根据主题中的数据类型进行设置。该数据必须有支持的架构 - JSON，Avro 或 Protobuf 格式。

如果使用我们的示例数据集进行测试，请确保以下设置：

* `value.converter.schemas.enable` - 设置为 false，因为我们使用架构注册表。如果您将架构嵌入到每条消息中，则设置为 true。
* `key.converter` - 设置为 "org.apache.kafka.connect.storage.StringConverter"。我们使用字符串键。
* `value.converter` - 设置为 "io.confluent.connect.json.JsonSchemaConverter"。
* `value.converter.schema.registry.url` - 设置为架构服务器的 URL，并通过参数 `value.converter.schema.registry.basic.auth.user.info` 提供架构服务器的凭据。

可以在 [这里](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink) 找到 Github 示例数据的示例配置文件，假设 Connect 以独立模式运行，Kafka 托管在 Confluent Cloud 中。

#### 4. 创建 ClickHouse 表 {#4-create-the-clickhouse-table}

确保表已创建，如果之前的示例中已经存在，则删除该表。下面是兼容减少的 Github 数据集的示例。请注意缺少当前不支持的任何 Array 或 Map 类型：

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

以 [独立](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) 或 [分布式](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster) 模式启动 Kafka Connect。

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. 向 Kafka 添加数据 {#6-add-data-to-kafka}

使用提供的 [脚本和配置](https://github.com/ClickHouse/kafka-samples/tree/main/producer) 向 Kafka 插入消息。您需要修改 github.config 以包含您的 Kafka 凭据。该脚本当前配置为与 Confluent Cloud 一起使用。

```bash
python producer.py -c github.config
```

该脚本可用于将任何 ndjson 文件插入 Kafka 主题。这将尝试为您自动推断架构。提供的示例配置将只插入 1 万条消息 - 如有需要，可以 [在此修改](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25)。该配置还在插入数据到 Kafka 时从数据集中删除任何不兼容的 Array 字段。

这是 JDBC 连接器将消息转换为 INSERT 语句所必需的。如果您使用自己的数据，请确保您要么在每条消息中插入架构（将 _value.converter.schemas.enable _ 设置为 true），要么确保您的客户端发布引用到注册表的架构的消息。

Kafka Connect 应该开始消费消息并将行插入 ClickHouse。请注意关于 "[JDBC 兼容模式] 不支持事务。" 的警告是预期的，可以忽略。

对目标表 "Github" 的简单读取应该确认数据插入。

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
* [Kafka Connect 深入分析 – JDBC 源连接器](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC Sink 深入分析：使用主键](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect 实战：JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 适合那些喜欢观看而不是阅读的人。
* [Kafka Connect 深入分析 – 转换器和序列化解释](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
