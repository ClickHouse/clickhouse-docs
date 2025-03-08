---
sidebar_label: ClickHouse Kafka 连接器 Sink
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: ClickHouse 的官方 Kafka 连接器。
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka 连接器 Sink

:::note
如果您需要任何帮助，请 [在仓库中提交问题](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) 或在 [ClickHouse 公共 Slack](https://clickhouse.com/slack)中提出问题。
:::
**ClickHouse Kafka 连接器 Sink** 是将数据从 Kafka 主题传递到 ClickHouse 表的 Kafka 连接器。

### 许可证 {#license}

Kafka 连接器 Sink 依据 [Apache 2.0 许可证](https://www.apache.org/licenses/LICENSE-2.0) 分发。

### 环境要求 {#requirements-for-the-environment}

环境中应安装 [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) 框架 v2.7 或更高版本。

### 版本兼容性矩阵 {#version-compatibility-matrix}

| ClickHouse Kafka Connect 版本 | ClickHouse 版本 | Kafka Connect | Confluent 平台 |
|------------------------------|------------------|---------------|------------------|
| 1.0.0                       | > 23.3           | > 2.7         | > 6.1            |

### 主要特性 {#main-features}

- 具有开箱即用的精确一次语义。它由名为 [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) 的新 ClickHouse 核心功能提供支持（由连接器用作状态存储），并允许实现简约的架构。
- 支持第三方状态存储：当前默认为内存存储，但可以使用 KeeperMap（Redis 将很快添加）。
- 核心集成：由 ClickHouse 构建、维护和支持。
- 针对 [ClickHouse Cloud](https://clickhouse.com/cloud) 进行了持续测试。
- 支持具有声明模式和无模式的数据插入。
- 支持所有 ClickHouse 的数据类型。

### 安装说明 {#installation-instructions}

#### 收集连接详情 {#gather-your-connection-details}

<ConnectionDetails />

#### 一般安装说明 {#general-installation-instructions}

该连接器作为单个 JAR 文件分发，包含运行插件所需的所有类文件。

要安装插件，请按照以下步骤操作：

- 从 ClickHouse Kafka 连接器 Sink 仓库的 [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) 页面下载包含连接器 JAR 文件的 zip 压缩包。
- 解压 ZIP 文件内容并复制到所需位置。
- 在您的 Connect 属性文件中，向 [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) 配置添加包含插件目录的路径，以便 Confluent Platform 找到插件。
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

- 重启 Confluent Platform。
- 如果您使用 Confluent Platform，请登录 Confluent 控制中心界面以验证 ClickHouse Sink 是否出现在可用连接器列表中。

### 配置选项 {#configuration-options}

要将 ClickHouse Sink 连接到 ClickHouse 服务器，您需要提供：

- 连接详情：主机名 (**必填**) 和端口 (可选)
- 用户凭据：密码 (**必填**) 和用户名 (可选)
- 连接器类：`com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**必填**)
- topics 或 topics.regex：要轮询的 Kafka 主题 - 主题名称必须与表名称匹配 (**必填**)
- 键和值转换器：根据主题中数据的类型进行设置。如果在工作配置中未定义，则为必需。

完整的配置选项表：

| 属性名称                                   | 描述                                                                                                                                                                                                                                                            | 默认值                                            |
|--------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| `hostname` (必填)                         | 服务器的主机名或 IP 地址                                                                                                                                                                                                                                       | N/A                                              |
| `port`                                    | ClickHouse 端口 - 默认 8443（用于云中的 HTTPS），但对于 HTTP（自托管的默认设置），应为 8123                                                                                                                                                                  | `8443`                                          |
| `ssl`                                     | 启用与 ClickHouse 的 SSL 连接                                                                                                                                                                                                                                 | `true`                                          |
| `jdbcConnectionProperties`                | 连接到 ClickHouse 时的连接属性。必须以 `?` 开头，并用 `&` 连接 `param=value`                                                                                                                                                                                | `""`                                            |
| `username`                                | ClickHouse 数据库用户名                                                                                                                                                                                                                                       | `default`                                      |
| `password` (必填)                         | ClickHouse 数据库密码                                                                                                                                                                                                                                         | N/A                                            |
| `database`                                | ClickHouse 数据库名称                                                                                                                                                                                                                                           | `default`                                      |
| `connector.class` (必填)                  | 连接器类（显式设置并保持默认值）                                                                                                                                                                                                                                 | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                               | 连接器任务的数量                                                                                                                                                                                                                                                | `"1"`                                          |
| `errors.retry.timeout`                    | ClickHouse JDBC 重试超时                                                                                                                                                                                                                                       | `"60"`                                         |
| `exactlyOnce`                             | 启用精确一次                                                                                                                                                                                                                                                    | `"false"`                                      |
| `topics` (必填)                           | 要轮询的 Kafka 主题 - 主题名称必须与表名称匹配                                                                                                                                                                                                                  | `""`                                           |
| `key.converter` (必填* - 见描述)           | 根据键的类型进行设置。如果您传递键（且在工作配置中未定义），则在此处必需。                                                                                                                                                                                       | `"org.apache.kafka.connect.storage.StringConverter"` |
| `value.converter` (必填* - 见描述)         | 根据主题中数据的类型进行设置。支持：- JSON、字符串、Avro 或 Protobuf 格式。如果在工作配置中未定义，则在此处必需。                                                                                                                                               | `"org.apache.kafka.connect.json.JsonConverter"`  |
| `value.converter.schemas.enable`          | 连接器值转换器模式支持                                                                                                                                                                                                                                          | `"false"`                                      |
| `errors.tolerance`                        | 连接器错误容忍度。支持：none, all                                                                                                                                                                                                                                 | `"none"`                                       |
| `errors.deadletterqueue.topic.name`       | 如果设置（与 errors.tolerance=all 一起），将使用 DLQ 处理失败的批次（参见 [故障排除](#troubleshooting)）                                                                                                                                                     | `""`                                           |
| `errors.deadletterqueue.context.headers.enable` | 为 DLQ 添加额外的headers                                                                                                                                                                                                                                        | `""`                                           |
| `clickhouseSettings`                      | ClickHouse 设置的逗号分隔列表（例如："insert_quorum=2, 等等..."）                                                                                                                                                                                              | `""`                                           |
| `topic2TableMap`                          | 将主题名称映射到表名称的逗号分隔列表（例如："topic1=table1, topic2=table2, 等等..."）                                                                                                                                                                     | `""`                                           |
| `tableRefreshInterval`                    | 刷新表定义缓存的时间（以秒为单位）                                                                                                                                                                                                                              | `0`                                            |
| `keeperOnCluster`                         | 允许为自托管实例配置 ON CLUSTER 参数（例如：`ON CLUSTER clusterNameInConfigFileDefinition`）以实现精确一次的 connect_state 表（参见 [分布式 DDL 查询](/sql-reference/distributed-ddl)）                                                               | `""`                                           |
| `bypassRowBinary`                         | 允许针对基于模式的数据（Avro、Protobuf 等）禁用使用 RowBinary 和 RowBinaryWithDefaults - 应仅在数据将具有缺失列且 Nullable/Default 不可接受时使用                                                                                                           | `"false"`                                      |
| `dateTimeFormats`                         | 用于解析 DateTime64 模式字段的日期时间格式，以 `;` 分隔（例如：`someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                                                                                                     | `""`                                           |
| `tolerateStateMismatch`                   | 允许连接器丢弃“早于”当前偏移存储的记录 AFTER_PROCESSING（例如，如果发送偏移 5，而最后记录的偏移为 250，则丢弃）                                                                                                                                           | `"false"`                                      |

### 目标表 {#target-tables}

ClickHouse Connect Sink 从 Kafka 主题读取消息并将其写入适当的表中。ClickHouse Connect Sink 将数据写入现有表。请确保在开始向其插入数据之前，已经在 ClickHouse 中创建了具有适当模式的目标表。

每个主题在 ClickHouse 中都需要一个专用的目标表。目标表的名称必须与源主题名称匹配。

### 预处理 {#pre-processing}

如果您需要在将出站消息发送到 ClickHouse Kafka Connect Sink 之前对其进行转换，请使用 [Kafka Connect 转换](https://docs.confluent.io/platform/current/connect/transforms/overview.html)。

### 支持的数据类型 {#supported-data-types}

**声明模式的情况下：**

| Kafka Connect 类型                  | ClickHouse 类型      | 支持   | 原始   |
|------------------------------------|-------------------|-------|-------|
| STRING                             | String            | ✅    | 是    |
| INT8                               | Int8              | ✅    | 是    |
| INT16                              | Int16             | ✅    | 是    |
| INT32                              | Int32             | ✅    | 是    |
| INT64                              | Int64             | ✅    | 是    |
| FLOAT32                            | Float32           | ✅    | 是    |
| FLOAT64                            | Float64           | ✅    | 是    |
| BOOLEAN                            | Boolean           | ✅    | 是    |
| ARRAY                              | Array(T)          | ✅    | 否    |
| MAP                                | Map(Primitive, T) | ✅    | 否    |
| STRUCT                             | Variant(T1, T2, …) | ✅    | 否    |
| STRUCT                             | Tuple(a T1, b T2, …) | ✅    | 否    |
| STRUCT                             | Nested(a T1, b T2, …) | ✅    | 否    |
| BYTES                              | String            | ✅    | 否    |
| org.apache.kafka.connect.data.Time  | Int64 / DateTime64 | ✅    | 否    |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32     | ✅    | 否    |
| org.apache.kafka.connect.data.Decimal | Decimal          | ✅    | 否    |

**未声明模式的情况下：**

记录被转换为 JSON，并以 [JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow) 格式发送到 ClickHouse。

### 配置示例 {#configuration-recipes}

以下是一些常见的配置示例，帮助您快速入门。

#### 基本配置 {#basic-configuration}

最基本的配置以帮助您入门 - 它假设您在分布式模式下运行 Kafka Connect，并且 ClickHouse 服务器在 `localhost:8443` 上运行，SSL 启用，数据为无模式 JSON。

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

#### 多主题的基本配置 {#basic-configuration-with-multiple-topics}

连接器可以从多个主题消费数据。

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

#### 带有 DLQ 的基本配置 {#basic-configuration-with-dlq}

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

请注意：如果您遇到缺少类的问题，并不是每个环境都包含 Protobuf 转换器，您可能需要一个替代版本的带有依赖项的 JAR。

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

连接器支持不同 ClickHouse 格式的字符串转换器：[JSON](/interfaces/formats#jsoneachrow)、[CSV](/interfaces/formats#csv) 和 [TSV](/interfaces/formats#tabseparated)。

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

日志记录由 Kafka Connect Platform 自动提供。
日志目标和格式可以通过 Kafka connect [配置文件](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file) 进行配置。

如果使用 Confluent Platform，可以通过运行 CLI 命令来查看日志：

```bash
confluent local services connect log
```

有关更多详细信息，请查看官方 [教程](https://docs.confluent.io/platform/current/connect/logging.html)。

### 监控 {#monitoring}

ClickHouse Kafka Connect 通过 [Java 管理扩展 (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html) 报告运行时指标。默认情况下在 Kafka 连接器中启用 JMX。

ClickHouse Connect `MBeanName`：

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect 报告以下指标：

| 名称                       | 类型 | 描述                                                                                   |
|----------------------------|------|----------------------------------------------------------------------------------------|
| `receivedRecords`          | long | 接收到的记录总数。                                                                   |
| `recordProcessingTime`     | long | 花费的总时间（以纳秒为单位）在对记录进行分组和转换以形成统一结构。                        |
| `taskProcessingTime`       | long | 花费的总时间（以纳秒为单位）在处理和插入数据到 ClickHouse 中。                         |

### 限制 {#limitations}

- 不支持删除。
- 批量大小继承自 Kafka 消费者属性。
- 当使用 KeeperMap 进行精确一次并且偏移量发生更改或回滚时，您需要删除 KeeperMap 中特定主题的内容。（关于更多详细信息，请参见故障排除指南）

### 调整性能 {#tuning-performance}

如果您曾经想过“我想为 Sink 连接器调整批处理大小”，那么这一部分就是为您准备的。

##### Connect Fetch 与 Connector Poll {#connect-fetch-vs-connector-poll}

Kafka Connect（我们的 Sink 连接器构建的框架）将在后台从 Kafka 主题中获取消息（独立于连接器）。

您可以使用 `fetch.min.bytes` 和 `fetch.max.bytes` 控制此过程 - 当 `fetch.min.bytes` 设置最小所需量时，框架将会在达到 `fetch.max.wait.ms` 设置的时间限制之前将值传递给连接器，而 `fetch.max.bytes` 则设置上限。如果您希望将更大的批量传递给连接器，可以增加最小获取或最大等待来构建更大的数据包。

提取的数据随后被连接器客户端轮询消息，轮询中每次获取的数量受 `max.poll.records` 控制 - 请注意，获取与轮询是独立的，不过！

在调整这些设置时，用户应旨在使其获取大小产生多个 `max.poll.records` 批次（并且要记住，设置 `fetch.min.bytes` 和 `fetch.max.bytes` 表示的是压缩数据） - 这样，每个连接器任务都尽可能插入更大的批量。

ClickHouse 被优化为处理较大的批量，甚至在稍微延迟的情况下，而不是频繁但较小的批量 - 批量越大，效果越好。

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

更多详细信息可以在 [Confluent 文档](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration)
或 [Kafka 文档](https://kafka.apache.org/documentation/#consumerconfigs) 中找到。

#### 多个高吞吐量主题 {#multiple-high-throughput-topics}

如果您的连接器配置为订阅多个主题，您正在使用 `topics2TableMap` 将主题映射到表中，并且您在插入时遇到瓶颈导致消费者延迟，请考虑为每个主题创建一个连接器。发生这种情况的主要原因是当前批量是以串行方式插入到每个表中的 [串行](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100)。

每个主题创建一个连接器是一个解决办法，可以确保您获得尽可能快的插入速率。

### 故障排除 {#troubleshooting}

#### "主题 `[someTopic]` 分区 `[0]` 的状态不匹配" {#state-mismatch-for-topic-sometopic-partition-0}

当 KeeperMap 中存储的偏移与 Kafka 中存储的偏移不同，通常是在主题被删除或偏移手动调整时，会发生这种情况。
要解决此问题，您需要删除为给定主题 + 分区存储的旧值。

**注意：此调整可能具有精确一次的影响。**

#### "连接器 会重试哪些错误？" {#what-errors-will-the-connector-retry}

目前的重点是识别可以重试的瞬态错误，包括：

- `ClickHouseException` - 这是 ClickHouse 可能抛出的通用异常。
  通常在服务器超载时抛出，并且以下错误代码被认为是瞬态的：
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
- `SocketTimeoutException` - 当 socket 超时时抛出。
- `UnknownHostException` - 当无法解析主机时抛出。
- `IOException` - 当网络出现问题时抛出。

#### "我的所有数据都是空的/零" {#all-my-data-is-blankzeroes}
可能您的数据字段与表中的字段不匹配 - 这在 CDC（和 Debezium 格式）中特别常见。
一个常见的解决办法是向您的连接器配置添加扁平化转换：

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

这将把您的数据从嵌套 JSON 转换为扁平 JSON（使用 `_` 作为分隔符）。表中的字段将遵循 "field1_field2_field3" 格式（即 "before_id"、"after_id" 等）。

#### "我想在 ClickHouse 中使用我的 Kafka 键" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Kafka 键默认不存储在值字段中，但您可以使用 `KeyToValue` 转换将键移动到值字段（在新 `_key` 字段名下）：

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
