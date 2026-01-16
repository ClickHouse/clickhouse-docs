---
sidebar_label: 'Kafka Connect JDBC 连接器'
sidebar_position: 4
slug: /integrations/kafka/kafka-connect-jdbc
description: '在 Kafka Connect 和 ClickHouse 中使用 JDBC Sink 连接器'
title: 'JDBC 连接器'
doc_type: 'guide'
keywords: ['kafka', 'kafka connect', 'jdbc', '集成', '数据管道']
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# JDBC connector \\{#jdbc-connector\\}

:::note
仅当你的数据较为简单且只包含基础数据类型（例如 `int`）时才应使用此 connector。像 ClickHouse 特有的 `map` 等类型目前不受支持。
:::

在下面的示例中，我们使用的是 Confluent 发行版的 Kafka Connect。

下面我们介绍一个简单的部署：从单个 Kafka topic 中拉取消息，并将行插入到 ClickHouse 表中。对于尚未拥有 Kafka 环境的用户，我们推荐使用 Confluent Cloud，它的免费层额度相当可观。

请注意，JDBC Connector 需要 schema（不能在 JDBC Connector 中直接使用原始 JSON 或 CSV）。虽然可以在每条消息中携带 schema，但[强烈建议使用 Confluent schema registry](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas) 以避免相关开销。我们提供的插入脚本会从消息中自动推断 schema 并将其写入 registry——因此该脚本可以复用于其他数据集。Kafka 的 key 假定为字符串（String）。关于 Kafka schema 的更多细节参见[这里](https://docs.confluent.io/platform/current/schema-registry/index.html)。

### License \\{#license\\}
JDBC Connector 基于 [Confluent Community License](https://www.confluent.io/confluent-community-license) 进行分发。

### Steps \\{#steps\\}
#### Gather your connection details \\{#gather-your-connection-details\\}
<ConnectionDetails />

#### 1. Install Kafka Connect and Connector \\{#1-install-kafka-connect-and-connector\\}

我们假设你已经下载了 Confluent 安装包并在本地完成安装。请按照[这里](https://docs.confluent.io/kafka-connect-jdbc/current/#install-the-jdbc-connector)文档中关于安装 connector 的步骤进行操作。

如果你使用 confluent-hub 的安装方式，你的本地配置文件将会被更新。

要将数据从 Kafka 发送到 ClickHouse，我们使用 connector 的 Sink 组件。

#### 2. Download and install the JDBC Driver \\{#2-download-and-install-the-jdbc-driver\\}

从[这里](https://github.com/ClickHouse/clickhouse-java/releases)下载并安装 ClickHouse JDBC driver `clickhouse-jdbc-<version>-shaded.jar`。然后按照[这里](https://docs.confluent.io/kafka-connect-jdbc/current/#installing-jdbc-drivers)中的说明将其安装到 Kafka Connect 中。其他驱动可能也能工作，但尚未经过测试。

:::note

常见问题：文档建议将 jar 复制到 `share/java/kafka-connect-jdbc/`。如果你遇到 Connect 无法找到 driver 的问题，请将 driver 复制到 `share/confluent-hub-components/confluentinc-kafka-connect-jdbc/lib/`。或者修改 `plugin.path` 将该 driver 包含进去——见下文。

:::

#### 3. Prepare configuration \\{#3-prepare-configuration\\}

请根据[这些说明](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)来设置与你的安装类型相匹配的 Connect，注意 standalone 集群与 distributed 集群之间的差异。如果使用 Confluent Cloud，则需要参考分布式（distributed）部署方式。

下面这些参数与在 ClickHouse 中使用 JDBC Connector 相关。完整的参数列表参见[这里](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/index.html)：

* `_connection.url_` - 应采用 `jdbc:clickhouse://&lt;clickhouse host>:&lt;clickhouse http port>/&lt;target database>` 的形式
* `connection.user` - 对目标数据库具有写权限的用户
* `table.name.format`- 用于插入数据的 ClickHouse 表。该表必须已存在。
* `batch.size` - 单个批次中发送的行数。请确保将其设置为足够大的数值。根据 ClickHouse 的[建议](/sql-reference/statements/insert-into#performance-considerations)，1000 应被视为最小值。
* `tasks.max` - JDBC Sink connector 支持运行一个或多个任务，可用于提升性能。结合批大小，这是提升性能的主要手段。
* `value.converter.schemas.enable` - 如果使用 schema registry，则设置为 false；如果将 schema 嵌入到消息中，则设置为 true。
* `value.converter` - 根据你的数据类型进行设置，例如对 JSON 使用 `io.confluent.connect.json.JsonSchemaConverter`。
* `key.converter` - 设置为 `org.apache.kafka.connect.storage.StringConverter`。我们使用字符串类型的 key。
* `pk.mode` - 与 ClickHouse 无关，设置为 none。
* `auto.create` - 不支持，必须为 false。
* `auto.evolve` - 我们建议将此设置为 false，尽管未来可能会提供支持。
* `insert.mode` - 设置为 "insert"。当前不支持其他模式。
* `key.converter` - 根据 key 的类型进行设置。
* `value.converter` - 根据 topic 中数据的类型进行设置。该数据必须具有受支持的 schema——JSON、Avro 或 Protobuf 格式。

如果使用我们的示例数据集进行测试，请确保如下设置：

* `value.converter.schemas.enable` - 设置为 false，因为我们使用 schema registry。如果你在每条消息中嵌入 schema，则设置为 true。
* `key.converter` - 设置为 "org.apache.kafka.connect.storage.StringConverter"。我们使用字符串类型的 key。
* `value.converter` - 设置为 "io.confluent.connect.json.JsonSchemaConverter"。
* `value.converter.schema.registry.url` - 设置为 schema server 的 URL，并通过参数 `value.converter.schema.registry.basic.auth.user.info` 配置访问 schema server 的凭据。

适用于 GitHub 示例数据的配置文件示例可在[此处](https://github.com/ClickHouse/kafka-samples/tree/main/github_events/jdbc_sink)找到，假定 Connect 以 standalone 模式运行且 Kafka 部署在 Confluent Cloud 上。

#### 4. Create the ClickHouse table \\{#4-create-the-clickhouse-table\\}

请确保该表已创建；如果之前的示例中已存在，则先将其删除。下面展示了一个与精简版 GitHub 数据集兼容的示例。请注意其中不包含当前尚不支持的 Array 或 Map 类型：

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

#### 5. 启动 Kafka Connect \\{#5-start-kafka-connect\\}

以 [standalone](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#standalone-cluster) 或 [distributed](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#distributed-cluster) 模式启动 Kafka Connect。

```bash
./bin/connect-standalone connect.properties.ini github-jdbc-sink.properties.ini
```

#### 6. 向 Kafka 添加数据 \\{#6-add-data-to-kafka\\}

使用提供的[脚本和配置](https://github.com/ClickHouse/kafka-samples/tree/main/producer)向 Kafka 插入消息。您需要修改 github.config 并填入您的 Kafka 凭证。该脚本目前已配置为在 Confluent Cloud 上使用。

```bash
python producer.py -c github.config
```

此脚本可用于将任意 ndjson 文件写入到 Kafka 主题中。脚本会尝试自动为你推断 schema。提供的示例配置只会插入 10k 条消息——如有需要请[在此修改](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/producer/github.config#L25)。该配置还会在写入 Kafka 时，从数据集中移除任何不兼容的 Array 字段。

这是 JDBC connector 将消息转换为 INSERT 语句所必需的。如果你使用自己的数据，请确保要么在每条消息中都附带 schema（将 &#95;value.converter.schemas.enable 设置为 true），要么确保你的客户端发布的消息引用注册表中的 schema。

Kafka Connect 随后会开始消费消息并向 ClickHouse 中插入数据行。请注意，关于“[JDBC Compliant Mode] Transaction is not supported.”的警告是预期行为，可以忽略。

对目标表 “Github” 执行一次简单的读取查询，即可确认数据是否已成功插入。

```sql
SELECT count() FROM default.github;
```

```response
| count\(\) |
| :--- |
| 10000 |
```

### 推荐阅读 \\{#recommended-further-reading\\}

* [Kafka Sink 配置参数](https://docs.confluent.io/kafka-connect-jdbc/current/sink-connector/sink_config_options.html#sink-config-options)
* [Kafka Connect 深入解析：JDBC Source Connector](https://www.confluent.io/blog/kafka-connect-deep-dive-jdbc-source-connector)
* [Kafka Connect JDBC Sink 深入解析：主键处理](https://rmoff.net/2021/03/12/kafka-connect-jdbc-sink-deep-dive-working-with-primary-keys/)
* [Kafka Connect 实战：JDBC Sink](https://www.youtube.com/watch?v=b-3qN_tlYR4&t=981s) - 适合偏好看视频而非阅读的读者。
* [Kafka Connect 深入解析：转换器与序列化机制详解](https://www.confluent.io/blog/kafka-connect-deep-dive-converters-serialization-explained/#json-schemas)
