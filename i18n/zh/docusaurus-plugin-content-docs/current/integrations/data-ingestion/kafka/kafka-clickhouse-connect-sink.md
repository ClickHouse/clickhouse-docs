---
'sidebar_label': 'ClickHouse Kafka Connect Sink'
'sidebar_position': 2
'slug': '/integrations/kafka/clickhouse-kafka-connect-sink'
'description': 'The official Kafka connector from ClickHouse.'
'title': 'ClickHouse Kafka Connect Sink'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
如果您需要任何帮助，请 [在仓库中提交问题](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) 或在 [ClickHouse 公共 Slack](https://clickhouse.com/slack) 中提出问题。
:::
**ClickHouse Kafka Connect Sink** 是将数据从 Kafka 主题发送到 ClickHouse 表的 Kafka 连接器。

### 许可证 {#license}

Kafka Connector Sink 在 [Apache 2.0 许可证](https://www.apache.org/licenses/LICENSE-2.0) 下发布。

### 环境要求 {#requirements-for-the-environment}

环境中应安装 [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) 框架 v2.7 或更高版本。

### 版本兼容性矩阵 {#version-compatibility-matrix}

| ClickHouse Kafka Connect 版本 | ClickHouse 版本 | Kafka Connect | Confluent 平台 |
|------------------------------|-------------------|---------------|-----------------|
| 1.0.0                       | > 23.3            | > 2.7        | > 6.1           |

### 主要特性 {#main-features}

- 自带开箱即用的严格一次语义。它由一个新的 ClickHouse 核心特性 [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) 提供支持（作为连接器的状态存储），允许极简架构。
- 支持第三方状态存储：当前默认为内存，但可以使用 KeeperMap（Redis 很快会添加）。
- 核心集成：由 ClickHouse 构建、维护和支持。
- 持续对 [ClickHouse Cloud](https://clickhouse.com/cloud) 进行测试。
- 使用声明的模式和无模式的数据插入。
- 支持 ClickHouse 的所有数据类型。

### 安装说明 {#installation-instructions}

#### 收集您的连接详情 {#gather-your-connection-details}

<ConnectionDetails />

#### 一般安装说明 {#general-installation-instructions}

连接器作为一个单独的 JAR 文件分发，其中包含运行插件所需的所有类文件。

要安装插件，请按照以下步骤操作：

- 从 ClickHouse Kafka Connect Sink 仓库的 [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) 页面下载包含连接器 JAR 文件的 zip 存档。
- 解压 ZIP 文件内容并复制到所需位置。
- 在您的 Connect 属性文件中将插件目录的路径添加到 [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) 配置，以便 Confluent Platform 可以找到插件。
- 在配置中提供主题名称、ClickHouse 实例主机名和密码。

```yml
connector.class=com.clickhouse.kafka.connect.ClickHouseSinkConnector
tasks.max=1
topics=<topic_name>
ssl=true
jdbcConnectionProperties=?sslmode=STRICT
security.protocol=SSL
hostname=<hostname>
database=<database_name>
password=<password>
ssl.truststore.location=/tmp/kafka.client.truststore.jks
port=8443
value.converter.schemas.enable=false
value.converter=org.apache.kafka.connect.json.JsonConverter
exactlyOnce=true
username=default
schemas.enable=false
```

- 重新启动 Confluent Platform。
- 如果您使用 Confluent Platform，请登录 Confluent Control Center UI 验证 ClickHouse Sink 是否在可用连接器列表中。

### 配置选项 {#configuration-options}

要将 ClickHouse Sink 连接到 ClickHouse 服务器，您需要提供：

- 连接详情：主机名（**必需**）和端口（可选）
- 用户凭据：密码（**必需**）和用户名（可选）
- 连接器类：`com.clickhouse.kafka.connect.ClickHouseSinkConnector`（**必需**）
- topics 或 topics.regex：要轮询的 Kafka 主题 - 主题名称必须与表名匹配（**必需**）
- 键值转换器：根据主题数据类型设置。如果在工人配置中未定义，则必需。

完整的配置选项表：

| 属性名称                                       | 描述                                                                                                                                                            | 默认值                                                         |
|------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| `hostname` （必需）                            | 服务器的主机名或 IP 地址                                                                                                                                       | N/A                                                            |
| `port`                                         | ClickHouse 端口 - 默认是 8443（用于云中的 HTTPS），但对于 HTTP（自托管的默认值），应为 8123                                                                      | `8443`                                                       |
| `ssl`                                          | 启用与 ClickHouse 的 ssl 连接                                                                                                                                 | `true`                                                       |
| `jdbcConnectionProperties`                     | 连接 ClickHouse 时的连接属性。必须以 `?` 开头，并在 `param=value` 之间用 `&` 连接                                                                             | `""`                                                          |
| `username`                                     | ClickHouse 数据库用户名                                                                                                                                       | `default`                                                    |
| `password` （必需）                            | ClickHouse 数据库密码                                                                                                                                       | N/A                                                            |
| `database`                                     | ClickHouse 数据库名称                                                                                                                                         | `default`                                                    |
| `connector.class` （必需）                     | 连接器类（显式设置并保持为默认值）                                                                                                                              | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"`      |
| `tasks.max`                                    | 连接器任务的数量                                                                                                                                             | `"1"`                                                       |
| `errors.retry.timeout`                         | ClickHouse JDBC 重试超时                                                                                                                                        | `"60"`                                                       |
| `exactlyOnce`                                  | 启用严格一次                                                                                                                                                 | `"false"`                                                    |
| `topics` （必需）                              | 要轮询的 Kafka 主题 - 主题名称必须与表名匹配                                                                                                                   | `""`                                                          |
| `key.converter` （必需* - 见描述）                | 根据您的键的类型设置。如果您传递键（而未在工人配置中定义），则此处为必需。                                                                                           | `"org.apache.kafka.connect.storage.StringConverter"`          |
| `value.converter` （必需* - 见描述）              | 根据主题的数据类型设置。支持：- JSON、String、Avro 或 Protobuf 格式。如果在工人配置中未定义，则此处必需。                                                      | `"org.apache.kafka.connect.json.JsonConverter"`               |
| `value.converter.schemas.enable`               | 连接器值转换器模式支持                                                                                                                                      | `"false"`                                                    |
| `errors.tolerance`                             | 连接器错误容忍度。支持：none，all                                                                                                                              | `"none"`                                                    |
| `errors.deadletterqueue.topic.name`             | 如果设置（与 errors.tolerance=all 一起），将为失败的批次使用 DLQ（参见 [故障排除](#troubleshooting)）                                                             | `""`                                                          |
| `errors.deadletterqueue.context.headers.enable` | 为 DLQ 添加额外的头                                                                                                                                           | `""`                                                          |
| `clickhouseSettings`                           | ClickHouse 设置的以逗号分隔的列表（例如 "insert_quorum=2, etc..."）                                                                                             | `""`                                                          |
| `topic2TableMap`                               | 以逗号分隔的列表，用于将主题名称映射到表名称（例如 "topic1=table1, topic2=table2, etc..."）                                                                      | `""`                                                          |
| `tableRefreshInterval`                         | 刷新表定义缓存的时间（以秒为单位）                                                                                                                            | `0`                                                           |
| `keeperOnCluster`                              | 允许配置自托管实例的 ON CLUSTER 参数（例如 `ON CLUSTER clusterNameInConfigFileDefinition`）用于严格一次 connect_state 表（参见 [分布式 DDL 查询](/sql-reference/distributed-ddl)） | `""`                                                          |
| `bypassRowBinary`                              | 允许禁用用于基于模式的数据（Avro、Protobuf 等）的 RowBinary 和 RowBinaryWithDefaults 的使用 - 仅在数据有缺失列，并且 Nullable/Default 不可接受时使用                           | `"false"`                                                    |
| `dateTimeFormats`                              | 用于解析 DateTime64 模式字段的日期时间格式，以 `;` 分隔（例如 `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                    | `""`                                                          |
| `tolerateStateMismatch`                        | 允许连接器丢弃当前偏移量存储后处理的“早期”记录（例如，如果发送偏移量 5，而偏移量 250 是上次记录的偏移量）                                                       | `"false"`                                                    |
| `ignorePartitionsWhenBatching`                 | 在收集插入消息时将忽略分区（尽管仅当 `exactlyOnce` 为 `false` 时）。性能注意事项：连接器任务越多，每个任务分配的 kafka 分区越少——这可能意味着收益递减。                  | `"false"`                                                    |

### 目标表 {#target-tables}

ClickHouse Connect Sink 从 Kafka 主题读取消息并将其写入适当的表。ClickHouse Connect Sink 将数据写入现有表。请确保在开始将数据插入 ClickHouse 之前，已在 ClickHouse 中创建了具有适当模式的目标表。

每个主题在 ClickHouse 中需要一个专用的目标表。目标表名称必须与源主题名称匹配。

### 预处理 {#pre-processing}

如果您需要在将出站消息发送到 ClickHouse Kafka Connect Sink 之前进行转换，请使用 [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html)。

### 支持的数据类型 {#supported-data-types}

**声明模式时：**

| Kafka Connect 类型                     | ClickHouse 类型       | 支持 | 原始 |
|---------------------------------------|-----------------------|------|------|
| STRING                                | String                | ✅   | Yes  |
| INT8                                  | Int8                  | ✅   | Yes  |
| INT16                                 | Int16                 | ✅   | Yes  |
| INT32                                 | Int32                 | ✅   | Yes  |
| INT64                                 | Int64                 | ✅   | Yes  |
| FLOAT32                               | Float32               | ✅   | Yes  |
| FLOAT64                               | Float64               | ✅   | Yes  |
| BOOLEAN                               | Boolean               | ✅   | Yes  |
| ARRAY                                 | Array(T)              | ✅   | No   |
| MAP                                   | Map(Primitive, T)     | ✅   | No   |
| STRUCT                                | Variant(T1, T2, ...)   | ✅   | No   |
| STRUCT                                | Tuple(a T1, b T2, ...) | ✅   | No   |
| STRUCT                                | Nested(a T1, b T2, ...) | ✅   | No   |
| BYTES                                 | String                | ✅   | No   |
| org.apache.kafka.connect.data.Time    | Int64 / DateTime64    | ✅   | No   |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32        | ✅   | No   |
| org.apache.kafka.connect.data.Decimal | Decimal               | ✅   | No   |

**未声明模式时：**

记录将转换为 JSON，并以 [JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow) 格式发送到 ClickHouse。

### 配置示例 {#configuration-recipes}

以下是一些常用的配置示例，可帮助您快速入门。

#### 基本配置 {#basic-configuration}

最基本的配置以帮助您入门 - 它假设您在分布式模式下运行 Kafka Connect，并且 ClickHouse 服务器在 `localhost:8443` 上运行，启用 SSL，数据以无模式 JSON 存在。

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    "tasks.max": "1",
    "consumer.override.max.poll.records": "5000",
    "consumer.override.max.partition.fetch.bytes": "5242880",
    "database": "default",
    "errors.retry.timeout": "60",
    "exactlyOnce": "false",
    "hostname": "localhost",
    "port": "8443",
    "ssl": "true",
    "jdbcConnectionProperties": "?ssl=true&sslmode=strict",
    "username": "default",
    "password": "<PASSWORD>",
    "topics": "<TOPIC_NAME>",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "false",
    "clickhouseSettings": ""
  }
}
```

#### 支持多个主题的基本配置 {#basic-configuration-with-multiple-topics}

连接器可以从多个主题中消费数据。

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "topics": "SAMPLE_TOPIC, ANOTHER_TOPIC, YET_ANOTHER_TOPIC",
    ...
  }
}
```

#### 支持 DLQ 的基本配置 {#basic-configuration-with-dlq}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "errors.tolerance": "all",
    "errors.deadletterqueue.topic.name": "<DLQ_TOPIC>",
    "errors.deadletterqueue.context.headers.enable": "true",
  }
}
```

#### 使用不同数据格式 {#using-with-different-data-formats}

##### Avro 模式支持 {#avro-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "io.confluent.connect.avro.AvroConverter",
    "value.converter.schema.registry.url": "<SCHEMA_REGISTRY_HOST>:<PORT>",
    "value.converter.schemas.enable": "true",
  }
}
```

##### Protobuf 模式支持 {#protobuf-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "io.confluent.connect.protobuf.ProtobufConverter",
    "value.converter.schema.registry.url": "<SCHEMA_REGISTRY_HOST>:<PORT>",
    "value.converter.schemas.enable": "true",
  }
}
```

请注意：如果您遇到缺少类的问题，并非每个环境都包含 protobuf 转换器，您可能需要使用带有依赖项的另一个版本的 jar。

##### JSON 模式支持 {#json-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  }
}
```

##### 字符串支持 {#string-support}

连接器支持多种 ClickHouse 格式中的字符串转换器：[JSON](/interfaces/formats#jsoneachrow)、[CSV](/interfaces/formats#csv) 和 [TSV](/interfaces/formats#tabseparated)。

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "org.apache.kafka.connect.storage.StringConverter",
    "customInsertFormat": "true",
    "insertFormat": "CSV"
  }
}
```

### 日志记录 {#logging}

Kafka Connect 平台自动提供日志记录。
可以通过 Kafka Connect [配置文件](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file) 配置日志记录目标和格式。

如果使用 Confluent Platform，可以通过运行 CLI 命令查看日志：

```bash
confluent local services connect log
```

有关更多详细信息，请查看官方 [教程](https://docs.confluent.io/platform/current/connect/logging.html)。

### 监控 {#monitoring}

ClickHouse Kafka Connect 通过 [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html) 报告运行时指标。默认情况下，Kafka Connector 中启用 JMX。

ClickHouse Connect `MBeanName`：

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect 报告以下指标：

| 名称                   | 类型 | 描述                                                                               |
|------------------------|------|-----------------------------------------------------------------------------------|
| `receivedRecords`      | long | 接收的记录总数。                                                                  |
| `recordProcessingTime` | long | 用于将记录分组和转换为统一结构所花费的总时间（以纳秒为单位）。                      |
| `taskProcessingTime`   | long | 处理和将数据插入到 ClickHouse 的总时间（以纳秒为单位）。                         |

### 限制 {#limitations}

- 不支持删除。
- 批量大小从 Kafka Consumer 属性中继承。
- 当使用 KeeperMap 进行严格一次，并且偏移量发生变化或回滚时，需要删除该主题特定的 KeeperMap 中的内容。（有关更多详细信息，请参见下面的故障排除指南）

### 调整性能 {#tuning-performance}

如果您曾经想过“我想调整 sink 连接器的批量大小”，那么本节适合您。

##### Connect Fetch 与 Connector Poll {#connect-fetch-vs-connector-poll}

Kafka Connect（我们的 sink 连接器构建的框架）将在后台从 Kafka 主题中获取消息（独立于连接器）。

您可以使用 `fetch.min.bytes` 和 `fetch.max.bytes` 控制此过程——`fetch.min.bytes` 设置传递值给连接器所需的最小量（受 `fetch.max.wait.ms` 设置的时间限制），`fetch.max.bytes` 设置上限。如果您希望将更大的批量传递给连接器，可以选择增加最小的提取或最大的等待时间来构建更大的数据包。

然后，连接器客户端轮询消息，消耗已提取的数据，每次轮询的数量由 `max.poll.records` 控制——请注意，提取与轮询是独立的！

在调整这些设置时，用户应目标设置，以使其提取大小产生多个 `max.poll.records` 的批量（并记住，设置 `fetch.min.bytes` 和 `fetch.max.bytes` 表示压缩数据）——这样，每个连接器任务将插入尽可能大的批量。

ClickHouse 针对更大的批量进行了优化，即使稍有延迟，也优于频繁的小批量——批量越大，效果越好。

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

更多详细信息可以在 [Confluent 文档](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration) 或在 [Kafka 文档](https://kafka.apache.org/documentation/#consumerconfigs) 中找到。

#### 多个高吞吐量主题 {#multiple-high-throughput-topics}

如果您的连接器配置为订阅多个主题，您正在使用 `topic2TableMap` 将主题映射到表，并且经历插入瓶颈，导致消费者滞后，可以考虑每个主题创建一个连接器。造成这种情况的主要原因是当前批量被串行插入到每个表中 [serially](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100)。

每个主题创建一个连接器是确保您获得最快插入速度的一种变通方法。

### 故障排除 {#troubleshooting}

#### “主题 `[someTopic]` 分区 `[0]` 状态不匹配” {#state-mismatch-for-topic-sometopic-partition-0}

当 KeeperMap 中存储的偏移量与 Kafka 中存储的偏移量不同时，会发生这种情况，通常是当主题已被删除或偏移量已被手动调整时。
要修复此问题，您需要删除为该给定主题 + 分区存储的旧值。

**注意：此调整可能对严格一次有影响。**

#### “连接器将重试什么错误？” {#what-errors-will-the-connector-retry}

目前的重点是识别可以重试的短暂错误，包括：

- `ClickHouseException` - 这是 ClickHouse 可以抛出的通用异常。
  通常在服务器过载时抛出，以下错误代码被认为特别短暂：
  - 3 - UNEXPECTED_END_OF_FILE
  - 159 - TIMEOUT_EXCEEDED
  - 164 - READONLY
  - 202 - TOO_MANY_SIMULTANEOUS_QUERIES
  - 203 - NO_FREE_CONNECTION
  - 209 - SOCKET_TIMEOUT
  - 210 - NETWORK_ERROR
  - 242 - TABLE_IS_READ_ONLY
  - 252 - TOO_MANY_PARTS
  - 285 - TOO_FEW_LIVE_REPLICAS
  - 319 - UNKNOWN_STATUS_OF_INSERT
  - 425 - SYSTEM_ERROR
  - 999 - KEEPER_EXCEPTION
  - 1002 - UNKNOWN_EXCEPTION
- `SocketTimeoutException` - 当套接字超时时抛出。
- `UnknownHostException` - 当主机无法解析时抛出。
- `IOException` - 当网络出现问题时抛出。

#### “我的所有数据都是空的/零” {#all-my-data-is-blankzeroes}
很可能您的数据中的字段与表中的字段不匹配——这在 CDC（和 Debezium 格式）中特别常见。
一个常见的解决方案是将扁平化转换添加到您的连接器配置中：

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

这将把您的数据从嵌套的 JSON 转换为扁平 JSON（使用 `_` 作为分隔符）。表中的字段将遵循 "field1_field2_field3" 格式（即 "before_id"、"after_id" 等）。

#### “我想在 ClickHouse 中使用我的 Kafka 键” {#i-want-to-use-my-kafka-keys-in-clickhouse}
Kafka 键默认不存储在值字段中，但您可以使用 `KeyToValue` 转换将键移动到值字段（在新的 `_key` 字段名称下）：

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
