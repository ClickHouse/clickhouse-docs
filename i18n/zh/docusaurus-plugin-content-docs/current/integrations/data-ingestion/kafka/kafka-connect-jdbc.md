---
sidebar_label: 'Kafka Connect JDBC 连接器'
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: '在 Kafka Connect 中使用 JDBC Sink 连接器与 ClickHouse 集成'
title: 'JDBC 连接器'
doc_type: 'guide'
keywords: ['kafka', 'kafka connect', 'jdbc', 'integration', 'data pipeline']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# JDBC 连接器

:::note
此连接器仅适用于简单数据且由基本数据类型(例如 int)组成的场景。不支持 ClickHouse 特定类型(如 map)。
:::

在我们的示例中,使用 Confluent 发行版的 Kafka Connect。

下面介绍一个简单的安装过程,从单个 Kafka 主题拉取消息并将行插入到 ClickHouse 表中。我们推荐使用 Confluent Cloud,它为没有 Kafka 环境的用户提供了丰厚的免费套餐。

请注意,JDBC 连接器需要 schema(您不能在 JDBC 连接器中使用纯 JSON 或 CSV)。虽然 schema 可以编码在每条消息中,但[强烈建议使用 Confluent schema registry](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas) 以避免相关开销。提供的插入脚本会自动从消息中推断 schema 并将其插入到 registry 中 - 因此该脚本可以重复用于其他数据集。Kafka 的键假定为字符串类型。有关 Kafka schema 的更多详细信息可以在[此处](https://docs.confluent.io/platform/current/schema-registry/index.html)找到。

### 许可证 {#license}

JDBC 连接器根据 [Confluent Community License](https://www.confluent.io/confluent-community-license) 分发

### 步骤 {#steps}

#### 收集您的连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />

#### 1. 安装 Kafka Connect 和连接器 {#1-install-kafka-connect-and-connector}

我们假设您已下载 Confluent 软件包并在本地安装。按照[此处](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector)记录的安装说明来安装连接器。

如果您使用 confluent-hub 安装方法,您的本地配置文件将被更新。

要从 Kafka 向 ClickHouse 发送数据,我们使用连接器的 Sink 组件。

#### 2. 下载并安装 JDBC 驱动程序 {#2-download-and-install-the-jdbc-driver}

从[此处](https://github.com/ClickHouse/clickhouse-java/releases)下载并安装 ClickHouse JDBC 驱动程序 `clickhouse-jdbc-<version>-shaded.jar`。按照[此处](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers)的详细信息将其安装到 Kafka Connect 中。其他驱动程序可能有效,但尚未经过测试。

:::note

常见问题:文档建议将 jar 复制到 `share/java/kafka-connect-jdbc/`。如果您在 Connect 查找驱动程序时遇到问题,请将驱动程序复制到 `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`。或者修改 `plugin.path` 以包含驱动程序 - 见下文。

:::

#### 3. 准备配置 {#3-prepare-configuration}

按照[这些说明](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)设置与您的安装类型相关的 Connect,注意独立集群和分布式集群之间的差异。如果使用 Confluent Cloud,则分布式设置是相关的。

以下参数与在 ClickHouse 中使用 JDBC 连接器相关。完整的参数列表可以在[此处](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html)找到:


- `_connection.url_` - 应采用以下格式：`jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>`
- `connection.user` - 对目标数据库具有写入权限的用户
- `table.name.format`- 用于插入数据的 ClickHouse 表。该表必须已存在。
- `batch.size` - 单个批次中发送的行数。请确保将此值设置为适当的较大数值。根据 ClickHouse [建议](/sql-reference/statements/insert-into#performance-considerations)，应将 1000 视为最小值。
- `tasks.max` - JDBC Sink 连接器支持运行一个或多个任务。这可用于提高性能。与批次大小一起，这是提高性能的主要方式。
- `value.converter.schemas.enable` - 如果使用 schema registry，则设置为 false；如果在消息中嵌入 schema，则设置为 true。
- `value.converter` - 根据数据类型进行设置，例如对于 JSON，使用 `io.confluent.connect.json.JsonSchemaConverter`。
- `key.converter` - 设置为 `org.apache.kafka.connect.storage.StringConverter`。我们使用字符串键。
- `pk.mode` - 与 ClickHouse 无关。设置为 none。
- `auto.create` - 不支持，必须设置为 false。
- `auto.evolve` - 我们建议将此设置为 false，尽管将来可能会支持。
- `insert.mode` - 设置为 "insert"。目前不支持其他模式。
- `key.converter` - 根据键的类型进行设置。
- `value.converter` - 根据主题上的数据类型进行设置。此数据必须具有受支持的 schema - JSON、Avro 或 Protobuf 格式。

如果使用我们的示例数据集进行测试，请确保设置以下内容：

- `value.converter.schemas.enable` - 设置为 false，因为我们使用 schema registry。如果在每条消息中嵌入 schema，则设置为 true。
- `key.converter` - 设置为 "org.apache.kafka.connect.storage.StringConverter"。我们使用字符串键。
- `value.converter` - 设置为 "io.confluent.connect.json.JsonSchemaConverter"。
- `value.converter.schema.registry.url` - 设置为 schema 服务器 URL，并通过参数 `value.converter.schema.registry.basic.auth.user.info` 提供 schema 服务器的凭据。

假设 Connect 以独立模式运行且 Kafka 托管在 Confluent Cloud 中，可以在[此处](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink)找到 Github 示例数据的配置文件示例。

#### 4. 创建 ClickHouse 表 {#4-create-the-clickhouse-table}

确保已创建该表，如果该表已从之前的示例中存在，则将其删除。下面显示了与精简版 Github 数据集兼容的示例。请注意，目前不支持任何 Array 或 Map 类型：


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

以 [standalone](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) 或 [distributed](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster) 模式启动 Kafka Connect。

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. 向 Kafka 添加数据 {#6-add-data-to-kafka}

使用提供的[脚本和配置](https://github.com/ClickHouse/kafka-samples/tree/main/producer)向 Kafka 插入消息。您需要修改 github.config 以包含您的 Kafka 凭据。该脚本当前配置为与 Confluent Cloud 配合使用。

```bash
python producer.py -c github.config
```

此脚本可用于将任何 ndjson 文件插入 Kafka 主题。它将自动尝试为您推断模式。提供的示例配置仅会插入 10k 条消息 - 如有需要请[在此处修改](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25)。此配置还会在插入 Kafka 期间从数据集中移除任何不兼容的 Array 字段。

JDBC 连接器需要此配置才能将消息转换为 INSERT 语句。如果您使用自己的数据,请确保在每条消息中插入模式(将 \_value.converter.schemas.enable\_ 设置为 true),或确保您的客户端发布引用注册表中模式的消息。

Kafka Connect 应开始消费消息并将行插入 ClickHouse。请注意,关于"[JDBC Compliant Mode] Transaction is not supported."的警告是预期行为,可以忽略。

对目标表"Github"进行简单读取即可确认数据已插入。

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
* [Kafka Connect 深度解析 – JDBC Source Connector](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC Sink 深度解析：使用主键](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect 实战：JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 适合更喜欢看视频而非阅读的读者。
* [Kafka Connect 深度解析 – 转换器与序列化详解](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
