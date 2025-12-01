---
sidebar_label: 'ClickHouse Kafka Connect Sink'
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: 'ClickHouse 官方提供的 Kafka 连接器。'
title: 'ClickHouse Kafka Connect Sink'
doc_type: 'guide'
keywords: ['ClickHouse Kafka Connect Sink', 'Kafka 连接器 ClickHouse', '官方 ClickHouse 连接器', 'ClickHouse Kafka 集成']
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink {#clickhouse-kafka-connect-sink}

:::note
如果你需要任何帮助，请[在代码仓库中提交 issue](https://github.com/ClickHouse/clickhouse-kafka-connect/issues)，或在 [ClickHouse 公共 Slack](https://clickhouse.com/slack) 中提问。
:::
**ClickHouse Kafka Connect Sink** 是一个 Kafka 连接器，用于将数据从 Kafka 主题投递到 ClickHouse 表中。

### 许可证 {#license}

Kafka Connector Sink 根据 [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0) 分发。

### 环境要求 {#requirements-for-the-environment}

环境中需要安装 [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) 框架 v2.7 或更高版本。

### 版本兼容性矩阵 {#version-compatibility-matrix}

| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
| -------------------------------- | ------------------ | ------------- | ------------------ |
| 1.0.0                            | &gt; 23.3          | &gt; 2.7      | &gt; 6.1           |

### 主要特性 {#main-features}

* 内置开箱即用的精确一次（exactly-once）语义。该能力由 ClickHouse 新的核心特性 [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976)（由连接器用作状态存储）提供支持，并允许采用极简的架构。
* 支持第三方状态存储：当前默认使用内存（In-memory），也可以使用 KeeperMap（即将支持 Redis）。
* 深度集成：由 ClickHouse 构建、维护并提供支持。
* 持续针对 [ClickHouse Cloud](https://clickhouse.com/cloud) 进行测试。
* 支持具有显式 schema 和无 schema 的数据写入。
* 支持 ClickHouse 的所有数据类型。

### 安装说明 {#installation-instructions}

#### 收集连接信息 {#gather-your-connection-details}

<ConnectionDetails />

#### 通用安装说明 {#general-installation-instructions}

连接器以单个 JAR 文件的形式分发，其中包含运行插件所需的全部类文件。

要安装插件，请执行以下步骤：

* 从 ClickHouse Kafka Connect Sink 仓库的 [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) 页面下载包含 Connector JAR 文件的 ZIP 压缩包。
* 解压 ZIP 文件内容并将其复制到目标位置。
* 在 Connect 配置文件中，将包含插件目录的路径添加到 [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) 配置项中，以便 Confluent Platform 能够找到该插件。
* 在配置中提供主题名称、ClickHouse 实例主机名以及密码。

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

* 重启 Confluent Platform。
* 如果您使用 Confluent Platform，请登录 Confluent Control Center UI，确认 ClickHouse Sink 已出现在可用连接器列表中。

### 配置选项 {#configuration-options}

要将 ClickHouse Sink 连接到 ClickHouse 服务器，您需要提供：

* 连接参数：主机名（**必填**）和端口（可选）
* 用户凭证：密码（**必填**）和用户名（可选）
* 连接器类：`com.clickhouse.kafka.connect.ClickHouseSinkConnector`（**必填**）
* topics 或 topics.regex：要轮询的 Kafka topic——topic 名称必须与表名匹配（**必填**）
* 键和值转换器：根据该 topic 上数据的类型进行设置。如果在 worker 配置中尚未定义，则为必填项。

完整的配置选项表如下：


| Property Name                                   | Description                                                                                                                                                                                                                        | Default Value                                            |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `hostname` (Required)                           | 服务器的主机名或 IP 地址                                                                                                                                                                                                           | N/A                                                      |
| `port`                                          | ClickHouse 端口——云环境中 HTTPS 的默认端口为 8443，自托管环境中默认使用 HTTP 时应使用 8123                                                                                                                                        | `8443`                                                   |
| `ssl`                                           | 启用到 ClickHouse 的 SSL 连接                                                                                                                                                                                                      | `true`                                                   |
| `jdbcConnectionProperties`                      | 连接 ClickHouse 时使用的连接属性。必须以 `?` 开头，`param=value` 之间使用 `&` 连接                                                                                                                                                | `""`                                                     |
| `username`                                      | ClickHouse 数据库用户名                                                                                                                                                                                                            | `default`                                                |
| `password` (Required)                           | ClickHouse 数据库密码                                                                                                                                                                                                              | N/A                                                      |
| `database`                                      | ClickHouse 数据库名称                                                                                                                                                                                                              | `default`                                                |
| `connector.class` (Required)                    | Connector 类（显式设置并保持为默认值）                                                                                                                                                                                             | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                     | Connector 任务数量                                                                                                                                                                                                                 | `"1"`                                                    |
| `errors.retry.timeout`                          | ClickHouse JDBC 重试超时时间（秒）                                                                                                                                                                                                 | `"60"`                                                   |
| `exactlyOnce`                                   | 是否启用 Exactly Once                                                                                                                                                                                                              | `"false"`                                                |
| `topics` (Required)                             | 要轮询的 Kafka 主题——主题名称必须与表名一致                                                                                                                                                                                       | `""`                                                     |
| `key.converter` (Required* - See Description)   | 根据 key 的类型进行设置。如果需要传递 key（且未在 worker 配置中定义），则此项为必填。                                                                                                                                             | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Required* - See Description) | 根据主题中的数据类型进行设置。支持：JSON、String、Avro 或 Protobuf 格式。如果未在 worker 配置中定义，则此项为必填。                                                                                                               | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                | Connector Value Converter 的 Schema 支持开关                                                                                                                                                                                      | `"false"`                                                |
| `errors.tolerance`                              | Connector 错误容忍度。支持：none、all                                                                                                                                                                                              | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`             | 如果设置了该项（且 errors.tolerance=all），将对失败的批次使用 DLQ（参见 [Troubleshooting](#troubleshooting)）                                                                                                                     | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable` | 为 DLQ 添加额外的 header                                                                                                                                                                                                           | `""`                                                     |
| `clickhouseSettings`                            | 以逗号分隔的 ClickHouse 设置列表（例如 "insert_quorum=2, etc..."）                                                                                                                                                                | `""`                                                     |
| `topic2TableMap`                                | 将主题名称映射到表名的、以逗号分隔的列表（例如 "topic1=table1, topic2=table2, etc..."）                                                                                                                                            | `""`                                                     |
| `tableRefreshInterval`                          | 刷新表定义缓存的时间（单位：秒）                                                                                                                                                                                                  | `0`                                                      |
| `keeperOnCluster`                               | 允许为自托管实例配置 exactly-once connect_state 表的 ON CLUSTER 参数（例如 `ON CLUSTER clusterNameInConfigFileDefinition`）（参见 [Distributed DDL Queries](/sql-reference/distributed-ddl)） | `""`                                                     |
| `bypassRowBinary`                               | 允许对基于 Schema 的数据（Avro、Protobuf 等）禁用 RowBinary 和 RowBinaryWithDefaults 的使用——仅应在数据可能缺少列且 Nullable/Default 不可接受时使用                                                                              | `"false"`                                                |
| `dateTimeFormats`                               | 用于解析 DateTime64 schema 字段的日期时间格式列表，以 `;` 分隔（例如 `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                                                                     | `""`                                                     |
| `tolerateStateMismatch`                         | 允许 Connector 丢弃“早于”当前 AFTER_PROCESSING 存储偏移量的记录（例如，如果发送了偏移量 5，而最近记录的偏移量是 250）                                                                                                            | `"false"`                                                |
| `ignorePartitionsWhenBatching`                  | 在收集要插入的消息时忽略分区（仅当 `exactlyOnce` 为 `false` 时）。性能注意：Connector 任务越多，每个任务分配到的 Kafka 分区就越少——这可能会产生收益递减。                                                                        | `"false"`                                                |

### 目标表 {#target-tables}



ClickHouse Connect Sink 从 Kafka 主题读取消息，并将其写入相应的表中。它只会向已存在的表写入数据。请确保在开始向目标表插入数据之前，已经在 ClickHouse 中创建了具有合适 schema 的目标表。

每个主题在 ClickHouse 中都需要一个专用的目标表。目标表名必须与源主题名一致。

### 预处理 {#pre-processing}

如果需要在消息发送到 ClickHouse Kafka Connect Sink 之前对出站消息进行转换，请使用 [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html)。

### 支持的数据类型 {#supported-data-types}

**已声明 schema 时：**

| Kafka Connect Type                      | ClickHouse Type          | Supported | Primitive |
| --------------------------------------- | ------------------------ | --------- | --------- |
| STRING                                  | String                   | ✅         | Yes       |
| STRING                                  | JSON. See below (1)      | ✅         | Yes       |
| INT8                                    | Int8                     | ✅         | Yes       |
| INT16                                   | Int16                    | ✅         | Yes       |
| INT32                                   | Int32                    | ✅         | Yes       |
| INT64                                   | Int64                    | ✅         | Yes       |
| FLOAT32                                 | Float32                  | ✅         | Yes       |
| FLOAT64                                 | Float64                  | ✅         | Yes       |
| BOOLEAN                                 | Boolean                  | ✅         | Yes       |
| ARRAY                                   | Array(T)                 | ✅         | No        |
| MAP                                     | Map(Primitive, T)        | ✅         | No        |
| STRUCT                                  | Variant(T1, T2, ...)     | ✅         | No        |
| STRUCT                                  | Tuple(a T1, b T2, ...)   | ✅         | No        |
| STRUCT                                  | Nested(a T1, b T2, ...)  | ✅         | No        |
| STRUCT                                  | JSON. See below (1), (2) | ✅         | No        |
| BYTES                                   | String                   | ✅         | No        |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64       | ✅         | No        |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32           | ✅         | No        |
| org.apache.kafka.connect.data.Decimal   | Decimal                  | ✅         | No        |

* (1) - 仅当在 ClickHouse 设置中将 `input_format_binary_read_json_as_string=1` 打开时才支持 JSON。该设置仅对 RowBinary 格式族生效，并且会影响插入请求中的所有列，因此所有列都必须是字符串。在这种情况下，Connector 会将 STRUCT 转换为 JSON 字符串。

* (2) - 当 struct 中包含 `oneof` 之类的 union 时，需要将 converter 配置为**不**在字段名上添加前缀/后缀。可以使用 `ProtobufConverter` 的 `generate.index.for.unions=false` [设置](https://docs.confluent.io/platform/current/schema-registry/connect.html#protobuf)。

**未声明 schema 时：**

记录会被转换为 JSON，并以 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式作为一个值发送到 ClickHouse。

### 配置示例 {#configuration-recipes}

以下是一些常见的配置示例，帮助你快速上手。

#### 基本配置 {#basic-configuration}

这是最基础的配置示例，用于帮助你入门——它假设你在分布式模式下运行 Kafka Connect，并在启用 SSL 的情况下，在 `localhost:8443` 上运行一个 ClickHouse 服务器，数据为无 schema 的 JSON。

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

#### 使用多个主题（topic）的基础配置 {#basic-configuration-with-multiple-topics}

该连接器可以从多个主题（topic）中消费数据


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

#### 带 DLQ 的基本配置 {#basic-configuration-with-dlq}

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

#### 与不同数据格式配合使用 {#using-with-different-data-formats}

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

##### Protobuf Schema 支持 {#protobuf-schema-support}

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

请注意：如果遇到类缺失的问题，请注意并非所有环境都包含 protobuf 转换器，您可能需要使用一个已将依赖打包在内的备用 jar 发行版本。

##### JSON schema 支持 {#json-schema-support}

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

该连接器在多种 ClickHouse 数据格式中均支持 String Converter：[JSON](/interfaces/formats/JSONEachRow)、[CSV](/interfaces/formats/CSV) 和 [TSV](/interfaces/formats/TabSeparated)。

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

### 日志 {#logging}

Kafka Connect Platform 会自动提供日志功能。
可以通过 Kafka Connect 的[配置文件](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file)来配置日志的输出目标和格式。

如果使用 Confluent Platform，可以通过运行 CLI 命令查看日志：

```bash
confluent local services connect log
```

如需了解更多详细信息，请参阅官方[教程](https://docs.confluent.io/platform/current/connect/logging.html)。

### 监控 {#monitoring}

ClickHouse Kafka Connect 通过 [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html) 上报运行时指标。Kafka Connector 中默认启用 JMX。

#### ClickHouse 特定指标 {#clickhouse-specific-metrics}

连接器通过以下 MBean 名称暴露自定义指标：

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

| Metric Name            | Type | Description                      |
| ---------------------- | ---- | -------------------------------- |
| `receivedRecords`      | long | 接收的记录总数。                         |
| `recordProcessingTime` | long | 将记录分组并转换为统一结构所花费的总时间（纳秒）。        |
| `taskProcessingTime`   | long | 处理并将数据插入 ClickHouse 所花费的总时间（纳秒）。 |

#### Kafka Producer/Consumer Metrics {#kafka-producer-consumer-metrics}

该连接器提供了标准的 Kafka 生产者和消费者指标，用于分析数据流、吞吐量和性能。

**Topic 级指标：**

* `records-sent-total`: 发送到该 topic 的记录总数
* `bytes-sent-total`: 发送到该 topic 的字节总数
* `record-send-rate`: 每秒发送记录的平均速率
* `byte-rate`: 每秒发送字节的平均速率
* `compression-rate`: 实际达到的压缩率


**分区级指标：**
- `records-sent-total`: 发送到该分区的记录总数
- `bytes-sent-total`: 发送到该分区的字节总数
- `records-lag`: 该分区当前的滞后
- `records-lead`: 该分区当前的领先
- `replica-fetch-lag`: 副本拉取的滞后信息

**节点级连接指标：**
- `connection-creation-total`: 到该 Kafka 节点建立的连接总数
- `connection-close-total`: 关闭的连接总数
- `request-total`: 发送到该节点的请求总数
- `response-total`: 从该节点接收的响应总数
- `request-rate`: 平均每秒请求速率
- `response-rate`: 平均每秒响应速率

这些指标有助于监控：
- **吞吐量**：跟踪数据摄取速率
- **滞后**：识别瓶颈和处理延迟
- **压缩**：衡量数据压缩效率
- **连接健康状况**：监控网络连通性和稳定性

#### Kafka Connect 框架指标 {#kafka-connect-framework-metrics}

该连接器集成了 Kafka Connect 框架，并公开了用于任务生命周期和错误跟踪的指标。

**任务状态指标：**
- `task-count`: 连接器中任务的总数
- `running-task-count`: 当前正在运行的任务数量
- `paused-task-count`: 当前被暂停的任务数量
- `failed-task-count`: 已失败的任务数量
- `destroyed-task-count`: 已销毁的任务数量
- `unassigned-task-count`: 未分配的任务数量

任务状态值包括：`running`、`paused`、`failed`、`destroyed`、`unassigned`

**错误指标：**
- `deadletterqueue-produce-failures`: DLQ 写入失败的次数
- `deadletterqueue-produce-requests`: DLQ 写入尝试总数
- `last-error-timestamp`: 最近一次错误的时间戳
- `records-skip-total`: 因错误被跳过的记录总数
- `records-retry-total`: 被重试的记录总数
- `errors-total`: 遇到的错误总数

**性能指标：**
- `offset-commit-failures`: 提交 offset 失败的次数
- `offset-commit-avg-time-ms`: 提交 offset 的平均耗时
- `offset-commit-max-time-ms`: 提交 offset 的最大耗时
- `put-batch-avg-time-ms`: 处理一个批次的平均耗时
- `put-batch-max-time-ms`: 处理一个批次的最大耗时
- `source-record-poll-total`: 轮询到的记录总数

#### 监控最佳实践 {#monitoring-best-practices}

1. **监控 Consumer 滞后情况**：跟踪每个分区的 `records-lag` 以识别处理瓶颈
2. **跟踪错误率**：关注 `errors-total` 和 `records-skip-total` 以发现数据质量问题
3. **观察任务健康状况**：监控任务状态指标以确保任务正常运行
4. **测量吞吐量**：使用 `records-send-rate` 和 `byte-rate` 跟踪摄取性能
5. **监控连接健康状况**：检查节点级连接指标以发现网络问题
6. **跟踪压缩效率**：使用 `compression-rate` 来优化数据传输

有关 JMX 指标的详细定义以及 Prometheus 集成，请参阅 [jmx-export-connector.yml](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/jmx-export-connector.yml) 配置文件。

### 限制 {#limitations}

- 不支持删除操作。
- 批大小继承自 Kafka Consumer 的属性。
- 当使用 KeeperMap 实现 exactly-once 且 offset 被更改或回退时，需要删除 KeeperMap 中该特定 topic 的内容。（参见下面的故障排除指南以获取更多详细信息）

### 性能调优与吞吐量优化 {#tuning-performance}

本节介绍 ClickHouse Kafka Connect Sink 的性能调优策略。当处理高吞吐量场景，或者需要优化资源使用并最小化滞后时，性能调优尤为重要。

#### 何时需要进行性能调优？ {#when-is-performance-tuning-needed}

在以下场景中通常需要进行性能调优：

- **高吞吐量工作负载**：当从 Kafka topic 处理每秒数百万条事件时
- **Consumer 滞后**：当连接器无法跟上数据生产速率，导致滞后不断增加时
- **资源受限**：当需要优化 CPU、内存或网络使用时
- **多 topic 场景**：当同时从多个高吞吐量 topic 中消费数据时
- **小消息大小**：当处理大量小消息并且可以从服务端批量处理获益时

在以下情况下 **通常不需要** 性能调优：

- 处理的量处于低到中等水平（< 10,000 条消息/秒）
- Consumer 的滞后稳定且在你的用例可接受范围内
- 默认的连接器设置已经满足你的吞吐量需求
- 你的 ClickHouse 集群可以轻松处理当前的写入负载



#### 理解数据流 {#understanding-the-data-flow}

在进行调优之前，首先需要理解数据在 connector 中的流转方式：

1. **Kafka Connect 框架** 在后台从 Kafka topic 中拉取消息
2. **Connector 轮询（poll）** 框架内部缓冲区中的消息
3. **Connector 按批处理（batch）** 消息，批次大小取决于每次轮询返回的数量
4. **ClickHouse 接收** 通过 HTTP/S 发送的批量写入请求
5. **ClickHouse 处理** 插入请求（同步或异步）

上述各个阶段都可以进行性能优化。

#### 调优 Kafka Connect 批量大小 {#connect-fetch-vs-connector-poll}

第一层优化是控制 connector 每批次从 Kafka 接收的数据量。

##### Fetch 设置 {#fetch-settings}

Kafka Connect（框架）在后台、独立于 connector，从 Kafka topic 中获取消息：

- **`fetch.min.bytes`**：在框架将数据传递给 connector 之前必须累积的最小数据量（默认：1 字节）
- **`fetch.max.bytes`**：单次请求中可获取的最大数据量（默认：52428800 / 50 MB）
- **`fetch.max.wait.ms`**：如果未达到 `fetch.min.bytes`，在返回数据前等待的最长时间（默认：500 ms）

##### Poll 设置 {#poll-settings}

Connector 从框架的缓冲区轮询消息：

- **`max.poll.records`**：单次轮询返回的最大记录数（默认：500）
- **`max.partition.fetch.bytes`**：每个分区可获取的最大数据量（默认：1048576 / 1 MB）

##### 高吞吐量推荐设置 {#recommended-batch-settings}

为了在 ClickHouse 上获得最佳性能，应尽量使用较大的批量：



```properties
# 增加每次轮询的记录数量 {#increase-the-number-of-records-per-poll}
consumer.max.poll.records=5000
```


# 增大分区拉取大小上限（5 MB） {#increase-the-partition-fetch-size-5-mb}
consumer.max.partition.fetch.bytes=5242880



# 可选：将最小拉取大小增加到 1 MB，以便等待更多数据 {#optional-increase-minimum-fetch-size-to-wait-for-more-data-1-mb}
consumer.fetch.min.bytes=1048576



# 可选：如果对延迟非常敏感，可缩短等待时间 {#optional-reduce-wait-time-if-latency-is-critical}

consumer.fetch.max.wait.ms=300

````

**重要提示**:Kafka Connect 的 fetch 设置表示压缩数据,而 ClickHouse 接收的是未压缩数据。请根据压缩比来平衡这些设置。

**权衡取舍**:
- **更大的批次** = 更好的 ClickHouse 摄取性能、更少的数据分片、更低的开销
- **更大的批次** = 更高的内存使用量、可能增加端到端延迟
- **批次过大** = 存在超时、OutOfMemory 错误或超过 `max.poll.interval.ms` 的风险

更多详情:[Confluent 文档](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration) | [Kafka 文档](https://kafka.apache.org/documentation/#consumerconfigs)

#### 异步插入                         {#asynchronous-inserts}

当连接器发送相对较小的批次,或者您希望通过将批处理责任转移到 ClickHouse 来进一步优化摄取时,异步插入是一项强大的功能。

##### 何时使用异步插入                              {#when-to-use-async-inserts}

在以下情况下考虑启用异步插入:

- **大量小批次**:连接器频繁发送小批次(每批次 < 1000 行)
- **高并发**:多个连接器任务同时写入同一张表
- **分布式部署**:在不同主机上运行多个连接器实例
- **数据分片创建开销**:遇到"数据分片过多"错误
- **混合工作负载**:将实时摄取与查询工作负载相结合

在以下情况下**不要**使用异步插入:

- 已经以受控频率发送大批次(每批次 > 10,000 行)
- 需要立即的数据可见性(查询必须立即看到数据)
- 使用 `wait_for_async_insert=0` 的精确一次语义与您的需求冲突
- 用例可以从客户端批处理改进中获益

##### 异步插入的工作原理                           {#how-async-inserts-work}

启用异步插入后,ClickHouse 将:

1. 从连接器接收插入查询
2. 将数据写入内存缓冲区(而不是立即写入磁盘)
3. 向连接器返回成功(如果 `wait_for_async_insert=0`)
4. 当满足以下条件之一时将缓冲区刷新到磁盘:
   - 缓冲区达到 `async_insert_max_data_size`(默认值:10 MB)
   - 自首次插入以来经过 `async_insert_busy_timeout_ms` 毫秒(默认值:1000 毫秒)
   - 累积的查询数量达到最大值(`async_insert_max_query_number`,默认值:100)

这显著减少了创建的数据分片数量并提高了整体吞吐量。

##### 启用异步插入                           {#enabling-async-inserts}

将异步插入设置添加到 `clickhouseSettings` 配置参数:

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
````

**关键设置**：

* **`async_insert=1`**：启用异步插入
* **`wait_for_async_insert=1`**（推荐）：连接器会在确认之前等待数据刷新到 ClickHouse 存储，以提供投递保证。
* **`wait_for_async_insert=0`**：连接器在写入缓冲后立即确认。性能更好，但在刷新前如果服务器崩溃，数据可能会丢失。

##### 调优异步插入行为 {#tuning-async-inserts}

可以对异步插入的刷新行为进行精细调优：

```json
"clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=10485760,async_insert_busy_timeout_ms=1000"
```

常见调优参数：

* **`async_insert_max_data_size`**（默认值：10485760 / 10 MB）：触发刷新前的最大缓冲区大小
* **`async_insert_busy_timeout_ms`**（默认值：1000）：触发刷新前的最长等待时间（毫秒）
* **`async_insert_stale_timeout_ms`**（默认值：0）：自上次插入以来触发刷新前的时间（毫秒）
* **`async_insert_max_query_number`**（默认值：100）：触发刷新前的最大查询次数

**权衡**：

* **优点**：更少的数据分片，更好的合并性能，更低的 CPU 开销，在高并发下具备更高吞吐量
* **注意事项**：数据无法被立即查询，端到端延迟略有增加
* **风险**：如果 `wait_for_async_insert=0`，服务器崩溃时可能发生数据丢失；缓冲区过大时可能导致内存压力

##### 具有 exactly-once 语义的异步插入 {#async-inserts-with-exactly-once}

在使用 `exactlyOnce=true` 进行异步插入时：


```json
{
  "config": {
    "exactlyOnce": "true",
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```

**重要**：在使用 exactly-once 时，始终将 `wait_for_async_insert` 设为 1，以确保只在数据持久化后才提交 offset。

有关异步插入的更多信息，请参阅 [ClickHouse 异步插入（async inserts）文档](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)。

#### 连接器并行度 {#connector-parallelism}

提高并行度以提升吞吐量：

##### 每个连接器的任务数 {#tasks-per-connector}

```json
"tasks.max": "4"
```

每个 task 处理一部分 topic 分区。task 越多，并行度越高，但要注意：

* 最大有效 task 数量 = topic 分区数
* 每个 task 都维护各自与 ClickHouse 的连接
* task 越多，开销越大，资源争用的可能性越高

**建议**：将 `tasks.max` 初始设置为 topic 分区数，然后根据 CPU 和吞吐量指标再进行调整。

##### 在批处理时忽略分区 {#ignoring-partitions}

默认情况下，connector 会按分区对消息进行批处理。为提高吞吐量，你可以跨分区进行批处理：

```json
"ignorePartitionsWhenBatching": "true"
```

**警告**：仅在 `exactlyOnce=false` 时使用。该设置可以通过创建更大的批次来提升吞吐量，但会丢失分区级的顺序保证。

#### 多个高吞吐量主题 {#multiple-high-throughput-topics}

如果你的连接器被配置为订阅多个主题，你使用 `topic2TableMap` 将主题映射到表，并且在插入阶段出现瓶颈导致消费者出现滞后，可以考虑改为为每个主题创建一个单独的连接器。

出现这种情况的主要原因是，目前批次会[串行](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100)插入到每一个表中。

**建议**：对于多个高吞吐量主题，为每个主题部署一个独立的连接器实例，以最大化并行写入吞吐量。

#### ClickHouse 表引擎注意事项 {#table-engine-considerations}

根据你的使用场景选择合适的 ClickHouse 表引擎：

* **`MergeTree`**：适用于大多数场景，在查询性能和写入性能之间取得平衡
* **`ReplicatedMergeTree`**：高可用场景必需，但会引入复制开销
* **带合适 `ORDER BY` 的 `*MergeTree`**：可根据查询模式进行优化

**需要考虑的设置**：

```sql
CREATE TABLE my_table (...)
ENGINE = MergeTree()
ORDER BY (timestamp, id)
SETTINGS 
    -- 增加最大插入线程数以并行写入数据部分
    max_insert_threads = 4,
    -- 允许使用仲裁插入以提高可靠性（ReplicatedMergeTree）
    insert_quorum = 2
```

连接器级插入设置：

```json
"clickhouseSettings": "insert_quorum=2,insert_quorum_timeout=60000"
```

#### 连接池和超时设置 {#connection-pooling}

连接器会维护到 ClickHouse 的 HTTP 连接池。对于高延迟网络环境，请调整超时时间：

```json
"clickhouseSettings": "socket_timeout=300000,connection_timeout=30000"
```

* **`socket_timeout`**（默认：30000 ms）：读取操作的最长等待时间
* **`connection_timeout`**（默认：10000 ms）：建立连接的最长等待时间

如果在处理大批量数据时出现超时错误，请适当增大这些数值。

#### 性能监控与故障排查 {#monitoring-performance}

监控以下关键指标：

1. **Consumer lag（消费者延迟）**：使用 Kafka 监控工具跟踪每个分区的延迟情况
2. **Connector metrics（连接器指标）**：通过 JMX 监控 `receivedRecords`、`recordProcessingTime`、`taskProcessingTime`（参见 [Monitoring](#monitoring)）
3. **ClickHouse metrics（ClickHouse 指标）**：
   * `system.asynchronous_inserts`：监控异步写入缓冲区使用情况
   * `system.parts`：监控数据分片（part）数量以检测合并问题
   * `system.merges`：监控正在进行的合并操作
   * `system.events`：跟踪 `InsertedRows`、`InsertedBytes`、`FailedInsertQuery`

**常见性能问题**：


| 症状                  | 可能原因      | 解决方案                                              |
| ------------------- | --------- | ------------------------------------------------- |
| 消费者延迟较高             | 批次过小      | 增加 `max.poll.records`，启用异步写入                      |
| “Too many parts” 错误 | 小批量且频繁的写入 | 启用异步写入，增大批次大小                                     |
| 超时错误                | 批次过大、网络较慢 | 减小批次大小，增大 `socket_timeout`，检查网络                   |
| CPU 使用率高            | 过多的小分片    | 启用异步写入，调高合并相关设置                                   |
| OutOfMemory 错误      | 批次大小过大    | 减小 `max.poll.records`、`max.partition.fetch.bytes` |
| 任务负载不均              | 分区分布不均    | 重新均衡分区或调整 `tasks.max`                             |

#### 最佳实践总结 {#performance-best-practices}

1. **先使用默认配置**，然后根据实际性能进行度量和调优
2. **优先使用较大批次**：在可能的情况下，每次写入以 10,000–100,000 行为目标
3. **在发送大量小批次或高并发场景下时，优先使用异步写入**
4. **在需要 exactly-once（完全一次）语义时始终使用 `wait_for_async_insert=1`**
5. **水平扩展**：将 `tasks.max` 增加到与分区数相同
6. **高流量主题一个主题一个连接器**，以获得最大吞吐量
7. **持续监控**：跟踪消费者延迟、分片数量以及合并活动
8. **充分测试**：在生产部署前，始终在真实负载下测试配置变更

#### 示例：高吞吐量配置 {#example-high-throughput}

下面是一个为高吞吐量优化的完整示例：

```json
{
  "name": "clickhouse-high-throughput",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    "tasks.max": "8",
    
    "topics": "high_volume_topic",
    "hostname": "my-clickhouse-host.cloud",
    "port": "8443",
    "database": "default",
    "username": "default",
    "password": "<PASSWORD>",
    "ssl": "true",
    
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "false",
    
    "exactlyOnce": "false",
    "ignorePartitionsWhenBatching": "true",
    
    "consumer.max.poll.records": "10000",
    "consumer.max.partition.fetch.bytes": "5242880",
    "consumer.fetch.min.bytes": "1048576",
    "consumer.fetch.max.wait.ms": "500",
    
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=16777216,async_insert_busy_timeout_ms=1000,socket_timeout=300000"
  }
}
```

**此配置**：

* 每次轮询最多处理 10,000 条记录
* 跨分区进行批处理，以支持更大的批量写入
* 使用 16 MB 缓冲区的异步插入
* 运行 8 个并行任务（与分区数量匹配）
* 针对吞吐量进行了优化，而非严格顺序

### 故障排查 {#troubleshooting}

#### &quot;State mismatch for topic `[someTopic]` partition `[0]`&quot; {#state-mismatch-for-topic-sometopic-partition-0}

当 KeeperMap 中存储的 offset 与 Kafka 中存储的 offset 不一致时，就会出现这种情况，通常发生在某个 topic 被删除
或 offset 被手动调整之后。
要修复此问题，需要删除该特定 topic 和分区对应存储的旧值。

**注意：此类调整可能会对 exactly-once 语义产生影响。**

#### &quot;What errors will the connector retry?&quot; {#what-errors-will-the-connector-retry}

目前的重点是识别可以视为短暂且可重试的错误，包括：

* `ClickHouseException` - 这是一个由 ClickHouse 抛出的通用异常。
  通常在服务器过载时抛出，以下错误码被认为是典型的短暂性错误：
  * 3 - UNEXPECTED&#95;END&#95;OF&#95;FILE
  * 159 - TIMEOUT&#95;EXCEEDED
  * 164 - READONLY
  * 202 - TOO&#95;MANY&#95;SIMULTANEOUS&#95;QUERIES
  * 203 - NO&#95;FREE&#95;CONNECTION
  * 209 - SOCKET&#95;TIMEOUT
  * 210 - NETWORK&#95;ERROR
  * 242 - TABLE&#95;IS&#95;READ&#95;ONLY
  * 252 - TOO&#95;MANY&#95;PARTS
  * 285 - TOO&#95;FEW&#95;LIVE&#95;REPLICAS
  * 319 - UNKNOWN&#95;STATUS&#95;OF&#95;INSERT
  * 425 - SYSTEM&#95;ERROR
  * 999 - KEEPER&#95;EXCEPTION
  * 1002 - UNKNOWN&#95;EXCEPTION
* `SocketTimeoutException` - 在 socket 超时时抛出。
* `UnknownHostException` - 在无法解析主机名时抛出。
* `IOException` - 在出现网络问题时抛出。


#### “所有数据都是空值/0” {#all-my-data-is-blankzeroes}

很可能是你数据中的字段与表中的字段不匹配——这在使用 CDC（以及 Debezium 格式）时尤其常见。
一个常见的解决方案是在连接器配置中添加 `flatten` 转换：

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

这会将你的数据从嵌套 JSON 转换为扁平化 JSON（使用 `_` 作为分隔符）。表中的字段将采用 &quot;field1&#95;field2&#95;field3&quot; 的格式（例如 &quot;before&#95;id&quot;、&quot;after&#95;id&quot; 等）。

#### &quot;我想在 ClickHouse 中使用我的 Kafka 键&quot; {#i-want-to-use-my-kafka-keys-in-clickhouse}

Kafka 键默认不会存储在 value 字段中，但你可以使用 `KeyToValue` 转换将键移动到 value 字段中（存放在名为 `_key` 的新字段下）：

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
