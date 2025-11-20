---
sidebar_label: 'ClickHouse Kafka Connect Sink'
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: 'ClickHouse 官方提供的 Kafka 连接器。'
title: 'ClickHouse Kafka Connect Sink'
doc_type: 'guide'
keywords: ['ClickHouse Kafka Connect Sink', 'Kafka connector ClickHouse', 'official ClickHouse connector', 'ClickHouse Kafka integration']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink 连接器

:::note
如需帮助,请[在代码仓库中提交问题](https://github.com/ClickHouse/clickhouse-kafka-connect/issues)或在 [ClickHouse 公共 Slack](https://clickhouse.com/slack) 中提问。
:::
**ClickHouse Kafka Connect Sink** 是一个 Kafka 连接器,用于将数据从 Kafka 主题传输到 ClickHouse 表。

### 许可证 {#license}

Kafka Connector Sink 基于 [Apache 2.0 许可证](https://www.apache.org/licenses/LICENSE-2.0)分发

### 环境要求 {#requirements-for-the-environment}

环境中需要安装 [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) 框架 v2.7 或更高版本。

### 版本兼容性矩阵 {#version-compatibility-matrix}

| ClickHouse Kafka Connect 版本 | ClickHouse 版本 | Kafka Connect | Confluent 平台 |
| -------------------------------- | ------------------ | ------------- | ------------------ |
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1              |

### 主要特性 {#main-features}

- 开箱即用的精确一次(exactly-once)语义。该功能由 ClickHouse 核心的新特性 [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976)(连接器将其用作状态存储)提供支持,并支持极简架构。
- 支持第三方状态存储:当前默认使用内存存储,也可以使用 KeeperMap(即将添加 Redis 支持)。
- 核心集成:由 ClickHouse 构建、维护和支持。
- 针对 [ClickHouse Cloud](https://clickhouse.com/cloud) 进行持续测试。
- 支持带声明模式和无模式的数据插入。
- 支持 ClickHouse 的所有数据类型。

### 安装说明 {#installation-instructions}

#### 收集连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />

#### 通用安装说明 {#general-installation-instructions}

该连接器以单个 JAR 文件的形式分发,其中包含运行插件所需的所有类文件。

要安装该插件,请按照以下步骤操作:

- 从 ClickHouse Kafka Connect Sink 代码仓库的 [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) 页面下载包含连接器 JAR 文件的 zip 压缩包。
- 解压 ZIP 文件内容并将其复制到所需位置。
- 在您的 Connect 属性文件中,将插件目录路径添加到 [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) 配置中,以便 Confluent Platform 能够找到该插件。
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
- 如果您使用 Confluent Platform,请登录 Confluent Control Center UI 以验证 ClickHouse Sink 是否出现在可用连接器列表中。

### 配置选项 {#configuration-options}

要将 ClickHouse Sink 连接到 ClickHouse 服务器,您需要提供:

- 连接详细信息:主机名(**必需**)和端口(可选)
- 用户凭据:密码(**必需**)和用户名(可选)
- 连接器类:`com.clickhouse.kafka.connect.ClickHouseSinkConnector`(**必需**)
- topics 或 topics.regex:要轮询的 Kafka 主题 - 主题名称必须与表名称匹配(**必需**)
- 键和值转换器:根据主题上的数据类型进行设置。如果尚未在 worker 配置中定义,则为必需。

完整的配置选项表:


| 属性名称                                    | 描述                                                                                                                                                                                                                        | 默认值                                            |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `hostname`（必需）                            | 服务器的主机名或 IP 地址                                                                                                                                                                                           | N/A                                                      |
| `port`                                           | ClickHouse 端口 - 默认为 8443（云端使用 HTTPS），但对于 HTTP（自托管的默认方式）应为 8123                                                                                                       | `8443`                                                   |
| `ssl`                                            | 启用到 ClickHouse 的 SSL 连接                                                                                                                                                                                                | `true`                                                   |
| `jdbcConnectionProperties`                       | 连接到 ClickHouse 时的连接属性。必须以 `?` 开头，`param=value` 之间用 `&` 连接                                                                                                                   | `""`                                                     |
| `username`                                       | ClickHouse 数据库用户名                                                                                                                                                                                                       | `default`                                                |
| `password`（必需）                            | ClickHouse 数据库密码                                                                                                                                                                                                       | N/A                                                      |
| `database`                                       | ClickHouse 数据库名称                                                                                                                                                                                                           | `default`                                                |
| `connector.class`（必需）                     | 连接器类（显式设置并保持为默认值）                                                                                                                                                                        | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                      | 连接器任务数量                                                                                                                                                                                                      | `"1"`                                                    |
| `errors.retry.timeout`                           | ClickHouse JDBC 重试超时时间                                                                                                                                                                                                      | `"60"`                                                   |
| `exactlyOnce`                                    | 启用精确一次语义                                                                                                                                                                                                               | `"false"`                                                |
| `topics`（必需）                              | 要轮询的 Kafka 主题 - 主题名称必须与表名称匹配                                                                                                                                                                                      | `""`                                                     |
| `key.converter`（必需\* - 参见描述）   | 根据键的类型进行设置。如果传递键（且未在 worker 配置中定义），则此处为必需项。                                                                                                                 | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter`（必需\* - 参见描述） | 根据主题上的数据类型进行设置。支持：JSON、String、Avro 或 Protobuf 格式。如果未在 worker 配置中定义，则此处为必需项。                                                                                   | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                 | 连接器值转换器模式支持                                                                                                                                                                                           | `"false"`                                                |
| `errors.tolerance`                               | 连接器错误容忍度。支持：none、all                                                                                                                                                                                    | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`              | 如果设置（配合 errors.tolerance=all），将对失败的批次使用死信队列（参见[故障排除](#troubleshooting)）                                                                                                                | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable`  | 为死信队列添加额外的标头                                                                                                                                                                                                | `""`                                                     |
| `clickhouseSettings`                             | 以逗号分隔的 ClickHouse 设置列表（例如 "insert_quorum=2, etc..."）                                                                                                                                                       | `""`                                                     |
| `topic2TableMap`                                 | 将主题名称映射到表名称的逗号分隔列表（例如 "topic1=table1, topic2=table2, etc..."）                                                                                                                            | `""`                                                     |
| `tableRefreshInterval`                           | 刷新表定义缓存的时间（以秒为单位）                                                                                                                                                                            | `0`                                                      |
| `keeperOnCluster`                                | 允许为自托管实例配置 ON CLUSTER 参数（例如 `ON CLUSTER clusterNameInConfigFileDefinition`），用于精确一次语义的 connect_state 表（参见[分布式 DDL 查询](/sql-reference/distributed-ddl)）   | `""`                                                     |
| `bypassRowBinary`                                | 允许禁用基于模式的数据（Avro、Protobuf 等）的 RowBinary 和 RowBinaryWithDefaults - 仅应在数据存在缺失列且 Nullable/Default 不可接受时使用                          | `"false"`                                                |
| `dateTimeFormats`                                | 用于解析 DateTime64 模式字段的日期时间格式，以 `;` 分隔（例如 `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                                                              | `""`                                                     |
| `tolerateStateMismatch`                          | 允许连接器丢弃"早于"AFTER_PROCESSING 存储的当前偏移量的记录（例如，如果发送偏移量 5,而偏移量 250 是最后记录的偏移量）                                                             | `"false"`                                                |
| `ignorePartitionsWhenBatching`                   | 在收集消息进行插入时将忽略分区（但仅当 `exactlyOnce` 为 `false` 时）。性能说明:连接器任务越多,每个任务分配的 Kafka 分区越少 - 这可能意味着收益递减。 | `"false"`                                                |

### 目标表 {#target-tables}


ClickHouse Connect Sink 从 Kafka 主题读取消息并将其写入相应的表中。ClickHouse Connect Sink 将数据写入已存在的表。请确保在开始插入数据之前,已在 ClickHouse 中创建具有适当架构的目标表。

每个主题都需要在 ClickHouse 中有一个专用的目标表。目标表名称必须与源主题名称匹配。

### 预处理 {#pre-processing}

如果需要在将出站消息发送到 ClickHouse Kafka Connect Sink 之前对其进行转换,请使用 [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html)。

### 支持的数据类型 {#supported-data-types}

**声明了架构时:**

| Kafka Connect 类型                      | ClickHouse 类型          | 支持 | 基本类型 |
| --------------------------------------- | ------------------------ | --------- | --------- |
| STRING                                  | String                   | ✅        | 是       |
| STRING                                  | JSON. 见下文 (1)      | ✅        | 是       |
| INT8                                    | Int8                     | ✅        | 是       |
| INT16                                   | Int16                    | ✅        | 是       |
| INT32                                   | Int32                    | ✅        | 是       |
| INT64                                   | Int64                    | ✅        | 是       |
| FLOAT32                                 | Float32                  | ✅        | 是       |
| FLOAT64                                 | Float64                  | ✅        | 是       |
| BOOLEAN                                 | Boolean                  | ✅        | 是       |
| ARRAY                                   | Array(T)                 | ✅        | 否        |
| MAP                                     | Map(Primitive, T)        | ✅        | 否        |
| STRUCT                                  | Variant(T1, T2, ...)     | ✅        | 否        |
| STRUCT                                  | Tuple(a T1, b T2, ...)   | ✅        | 否        |
| STRUCT                                  | Nested(a T1, b T2, ...)  | ✅        | 否        |
| STRUCT                                  | JSON. 见下文 (1), (2) | ✅        | 否        |
| BYTES                                   | String                   | ✅        | 否        |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64       | ✅        | 否        |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32           | ✅        | 否        |
| org.apache.kafka.connect.data.Decimal   | Decimal                  | ✅        | 否        |

- (1) - 仅当 ClickHouse 设置中有 `input_format_binary_read_json_as_string=1` 时才支持 JSON。这仅适用于 RowBinary 格式系列,该设置会影响插入请求中的所有列,因此它们都应该是字符串类型。在这种情况下,连接器会将 STRUCT 转换为 JSON 字符串。

- (2) - 当结构体具有类似 `oneof` 的联合类型时,应将转换器配置为不向字段名称添加前缀/后缀。`ProtobufConverter` 有 `generate.index.for.unions=false` [设置](https://docs.confluent.io/platform/current/schema-registry/connect.html#protobuf)。

**未声明架构时:**

记录会被转换为 JSON,并以 [JSONEachRow](/interfaces/formats/JSONEachRow) 格式作为值发送到 ClickHouse。

### 配置示例 {#configuration-recipes}

以下是一些常见的配置示例,可帮助您快速入门。

#### 基本配置 {#basic-configuration}

最基本的入门配置 - 假设您在分布式模式下运行 Kafka Connect,并且在 `localhost:8443` 上运行启用了 SSL 的 ClickHouse 服务器,数据为无架构 JSON。

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

#### 多主题基本配置 {#basic-configuration-with-multiple-topics}

连接器可以从多个主题消费数据


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

#### 使用 DLQ 的基本配置 {#basic-configuration-with-dlq}

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

#### 使用不同的数据格式 {#using-with-different-data-formats}

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

请注意:如果遇到类缺失的问题,并非所有环境都自带 protobuf 转换器,您可能需要使用包含依赖项的替代 jar 版本。

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

该连接器支持在不同 ClickHouse 格式下使用字符串转换器:[JSON](/interfaces/formats/JSONEachRow)、[CSV](/interfaces/formats/CSV) 和 [TSV](/interfaces/formats/TabSeparated)。

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

日志记录由 Kafka Connect 平台自动提供。
日志记录的目标和格式可通过 Kafka Connect [配置文件](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file)进行配置。

如果使用 Confluent Platform,可以通过运行 CLI 命令查看日志:

```bash
confluent local services connect log
```

有关更多详细信息,请查看官方[教程](https://docs.confluent.io/platform/current/connect/logging.html)。

### 监控 {#monitoring}

ClickHouse Kafka Connect 通过 [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html) 报告运行时指标。JMX 在 Kafka Connector 中默认启用。

#### ClickHouse 特定指标 {#clickhouse-specific-metrics}

该连接器通过以下 MBean 名称公开自定义指标:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

| 指标名称                  | 类型   | 描述                                           |
| ---------------------- | ---- | -------------------------------------------- |
| `receivedRecords`      | long | 接收到的记录总数。                                    |
| `recordProcessingTime` | long | 对记录进行分组和转换为统一结构所花费的总时间(以纳秒为单位)。              |
| `taskProcessingTime`   | long | 处理数据并将其插入 ClickHouse 所花费的总时间(以纳秒为单位)。        |

#### Kafka 生产者/消费者指标 {#kafka-producer-consumer-metrics}

该连接器公开标准的 Kafka 生产者和消费者指标,提供有关数据流、吞吐量和性能的洞察。

**主题级别指标:**

- `records-sent-total`:发送到主题的记录总数
- `bytes-sent-total`:发送到主题的总字节数
- `record-send-rate`:每秒发送记录的平均速率
- `byte-rate`:每秒发送的平均字节数
- `compression-rate`:实现的压缩比


**分区级指标：**

- `records-sent-total`：发送到分区的记录总数
- `bytes-sent-total`：发送到分区的字节总数
- `records-lag`：分区当前滞后量
- `records-lead`：分区当前领先量
- `replica-fetch-lag`：副本滞后信息

**节点级连接指标：**

- `connection-creation-total`：与 Kafka 节点建立的连接总数
- `connection-close-total`：关闭的连接总数
- `request-total`：发送到节点的请求总数
- `response-total`：从节点接收的响应总数
- `request-rate`：平均每秒请求速率
- `response-rate`：平均每秒响应速率

这些指标可用于监控：

- **吞吐量**：跟踪数据摄取速率
- **滞后**：识别瓶颈和处理延迟
- **压缩**：衡量数据压缩效率
- **连接健康状况**：监控网络连接性和稳定性

#### Kafka Connect 框架指标 {#kafka-connect-framework-metrics}

该连接器与 Kafka Connect 框架集成，并公开任务生命周期和错误跟踪的相关指标。

**任务状态指标：**

- `task-count`：连接器中的任务总数
- `running-task-count`：当前运行中的任务数
- `paused-task-count`：当前已暂停的任务数
- `failed-task-count`：已失败的任务数
- `destroyed-task-count`：已销毁的任务数
- `unassigned-task-count`：未分配的任务数

任务状态值包括：`running`、`paused`、`failed`、`destroyed`、`unassigned`

**错误指标：**

- `deadletterqueue-produce-failures`：死信队列写入失败次数
- `deadletterqueue-produce-requests`：死信队列写入尝试总数
- `last-error-timestamp`：最后一次错误的时间戳
- `records-skip-total`：因错误跳过的记录总数
- `records-retry-total`：重试的记录总数
- `errors-total`：遇到的错误总数

**性能指标：**

- `offset-commit-failures`：偏移量提交失败次数
- `offset-commit-avg-time-ms`：偏移量提交平均耗时
- `offset-commit-max-time-ms`：偏移量提交最大耗时
- `put-batch-avg-time-ms`：批次处理平均耗时
- `put-batch-max-time-ms`：批次处理最大耗时
- `source-record-poll-total`：轮询的记录总数

#### 监控最佳实践 {#monitoring-best-practices}

1. **监控消费者滞后**：跟踪每个分区的 `records-lag` 以识别处理瓶颈
2. **跟踪错误率**：关注 `errors-total` 和 `records-skip-total` 以检测数据质量问题
3. **观察任务健康状况**：监控任务状态指标以确保任务正常运行
4. **衡量吞吐量**：使用 `records-send-rate` 和 `byte-rate` 跟踪摄取性能
5. **监控连接健康状况**：检查节点级连接指标以发现网络问题
6. **跟踪压缩效率**：使用 `compression-rate` 优化数据传输

有关详细的 JMX 指标定义和 Prometheus 集成，请参阅 [jmx-export-connector.yml](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/jmx-export-connector.yml) 配置文件。

### 限制 {#limitations}

- 不支持删除操作。
- 批次大小继承自 Kafka Consumer 属性。
- 当使用 KeeperMap 实现精确一次语义且偏移量被更改或回退时，需要删除该特定主题在 KeeperMap 中的内容。（有关更多详细信息，请参阅下面的故障排除指南）

### 性能调优和吞吐量优化 {#tuning-performance}

本节介绍 ClickHouse Kafka Connect Sink 的性能调优策略。在处理高吞吐量场景或需要优化资源利用率并最小化滞后时，性能调优至关重要。

#### 何时需要性能调优？ {#when-is-performance-tuning-needed}

通常在以下场景中需要进行性能调优：

- **高吞吐量工作负载**：从 Kafka 主题每秒处理数百万个事件时
- **消费者滞后**：当连接器无法跟上数据生产速率，导致滞后不断增加时
- **资源约束**：需要优化 CPU、内存或网络使用时
- **多主题消费**：同时从多个高容量主题消费时
- **小消息场景**：处理大量小消息且可从服务器端批处理中受益时

在以下情况下**通常不需要**性能调优：

- 处理低到中等容量（< 10,000 条消息/秒）
- 消费者滞后稳定且对您的使用场景可接受
- 默认连接器设置已满足您的吞吐量要求
- 您的 ClickHouse 集群可以轻松处理传入负载


#### 理解数据流 {#understanding-the-data-flow}

在进行调优之前,理解数据如何流经连接器非常重要:

1. **Kafka Connect 框架**在后台从 Kafka 主题获取消息
2. **连接器轮询**框架内部缓冲区中的消息
3. **连接器批处理**根据轮询大小对消息进行批处理
4. **ClickHouse 接收**通过 HTTP/S 发送的批量插入
5. **ClickHouse 处理**插入操作(同步或异步)

可以在这些阶段中的每个阶段优化性能。

#### Kafka Connect 批量大小调优 {#connect-fetch-vs-connector-poll}

第一级优化是控制连接器每批次从 Kafka 接收的数据量。

##### 获取设置 {#fetch-settings}

Kafka Connect(框架)在后台从 Kafka 主题获取消息,独立于连接器运行:

- **`fetch.min.bytes`**: 框架将数据传递给连接器之前的最小数据量(默认值:1 字节)
- **`fetch.max.bytes`**: 单次请求中获取的最大数据量(默认值:52428800 / 50 MB)
- **`fetch.max.wait.ms`**: 如果未满足 `fetch.min.bytes`,返回数据前的最长等待时间(默认值:500 毫秒)

##### 轮询设置 {#poll-settings}

连接器从框架的缓冲区轮询消息:

- **`max.poll.records`**: 单次轮询返回的最大记录数(默认值:500)
- **`max.partition.fetch.bytes`**: 每个分区的最大数据量(默认值:1048576 / 1 MB)

##### 高吞吐量推荐设置 {#recommended-batch-settings}

为了在 ClickHouse 中获得最佳性能,应采用更大的批次:


```properties
# 增加每次轮询的记录数
consumer.max.poll.records=5000
```


# 增大分区拉取大小（5 MB）
consumer.max.partition.fetch.bytes=5242880



# 可选：增大最小拉取大小以等待更多数据（1 MB）
consumer.fetch.min.bytes=1048576



# 可选:如果延迟要求严格,可减少等待时间

consumer.fetch.max.wait.ms=300

````

**重要提示**:Kafka Connect 的 fetch 设置针对的是压缩数据,而 ClickHouse 接收的是未压缩数据。请根据您的压缩比来平衡这些设置。

**权衡取舍**:
- **更大的批次** = 更好的 ClickHouse 摄取性能、更少的数据分区、更低的开销
- **更大的批次** = 更高的内存使用量、可能增加端到端延迟
- **批次过大** = 存在超时、OutOfMemory 错误或超过 `max.poll.interval.ms` 的风险

更多详情:[Confluent 文档](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration) | [Kafka 文档](https://kafka.apache.org/documentation/#consumerconfigs)

#### 异步插入 {#asynchronous-inserts}

当连接器发送的批次相对较小,或者您希望通过将批处理职责转移到 ClickHouse 来进一步优化数据摄取时,异步插入是一个强大的功能。

##### 何时使用异步插入 {#when-to-use-async-inserts}

在以下情况下考虑启用异步插入:

- **大量小批次**:您的连接器频繁发送小批次数据(每批次 < 1000 行)
- **高并发**:多个连接器任务同时写入同一张表
- **分布式部署**:在不同主机上运行多个连接器实例
- **数据分区创建开销**:您遇到"too many parts"错误
- **混合工作负载**:将实时数据摄取与查询工作负载结合使用

在以下情况下**不要**使用异步插入:

- 您已经以可控频率发送大批次数据(每批次 > 10,000 行)
- 您需要数据立即可见(查询必须立即看到数据)
- 使用 `wait_for_async_insert=0` 的精确一次语义与您的需求冲突
- 您的使用场景可以通过改进客户端批处理来获得更好的效果

##### 异步插入的工作原理 {#how-async-inserts-work}

启用异步插入后,ClickHouse 会:

1. 从连接器接收插入查询
2. 将数据写入内存缓冲区(而不是立即写入磁盘)
3. 向连接器返回成功响应(如果 `wait_for_async_insert=0`)
4. 当满足以下任一条件时将缓冲区刷新到磁盘:
   - 缓冲区达到 `async_insert_max_data_size`(默认值:10 MB)
   - 自首次插入以来经过 `async_insert_busy_timeout_ms` 毫秒(默认值:1000 ms)
   - 累积的查询数量达到最大值(`async_insert_max_query_number`,默认值:100)

这显著减少了创建的数据分区数量,并提高了整体吞吐量。

##### 启用异步插入 {#enabling-async-inserts}

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

**关键设置**:

- **`async_insert=1`**:启用异步插入
- **`wait_for_async_insert=1`**(推荐):连接器在确认之前等待数据刷新到 ClickHouse 存储。提供交付保证。
- **`wait_for_async_insert=0`**:连接器在缓冲后立即确认。性能更好,但在刷新前服务器崩溃可能导致数据丢失。

##### 调优异步插入行为 {#tuning-async-inserts}

您可以精细调整异步插入的刷新行为:

```json
"clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=10485760,async_insert_busy_timeout_ms=1000"
```

常用调优参数:

- **`async_insert_max_data_size`**(默认值:10485760 / 10 MB):刷新前的最大缓冲区大小
- **`async_insert_busy_timeout_ms`**(默认值:1000):刷新前的最大时间(毫秒)
- **`async_insert_stale_timeout_ms`**(默认值:0):自上次插入以来触发刷新的时间(毫秒)
- **`async_insert_max_query_number`**(默认值:100):刷新前的最大查询数

**权衡取舍**:

- **优势**:更少的数据分区、更好的合并性能、更低的 CPU 开销、高并发下的吞吐量提升
- **注意事项**:数据无法立即查询、端到端延迟略有增加
- **风险**:如果 `wait_for_async_insert=0`,服务器崩溃时可能丢失数据;大缓冲区可能造成内存压力

##### 具有精确一次语义的异步插入 {#async-inserts-with-exactly-once}

当使用 `exactlyOnce=true` 与异步插入时:


```json
{
  "config": {
    "exactlyOnce": "true",
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```

**重要提示**：使用 exactly-once 时必须设置 `wait_for_async_insert=1`，以确保只有在数据持久化后才提交偏移量。

有关异步插入的更多信息，请参阅 [ClickHouse 异步插入文档](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)。

#### 连接器并行度 {#connector-parallelism}

提高并行度以改善吞吐量：

##### 每个连接器的任务数 {#tasks-per-connector}

```json
"tasks.max": "4"
```

每个任务处理主题分区的一个子集。更多任务 = 更高并行度，但需注意：

- 最大有效任务数 = 主题分区数
- 每个任务维护自己到 ClickHouse 的连接
- 更多任务 = 更高开销和潜在的资源争用

**建议**：将 `tasks.max` 设置为主题分区数，然后根据 CPU 和吞吐量指标进行调整。

##### 批处理时忽略分区 {#ignoring-partitions}

默认情况下，连接器按分区批处理消息。为了获得更高的吞吐量，可以跨分区批处理：

```json
"ignorePartitionsWhenBatching": "true"
```

**警告**：仅在 `exactlyOnce=false` 时使用。此设置可以通过创建更大的批次来提高吞吐量，但会失去分区级别的顺序保证。

#### 多个高吞吐量主题 {#multiple-high-throughput-topics}

如果您的连接器配置为订阅多个主题，使用 `topic2TableMap` 将主题映射到表，并且在插入时遇到瓶颈导致消费者延迟，请考虑为每个主题创建单独的连接器。

发生这种情况的主要原因是当前批次是[串行](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100)插入到每个表中的。

**建议**：对于多个高流量主题，为每个主题部署一个连接器实例以最大化并行插入吞吐量。

#### ClickHouse 表引擎选择 {#table-engine-considerations}

根据使用场景选择合适的 ClickHouse 表引擎：

- **`MergeTree`**：适用于大多数场景，在查询和插入性能之间取得平衡
- **`ReplicatedMergeTree`**：高可用性必需，会增加复制开销
- **带有合适 `ORDER BY` 的 `*MergeTree`**：针对查询模式进行优化

**需要考虑的设置**：

```sql
CREATE TABLE my_table (...)
ENGINE = MergeTree()
ORDER BY (timestamp, id)
SETTINGS
    -- 增加最大插入线程数以实现并行数据部分写入
    max_insert_threads = 4,
    -- 允许使用仲裁插入以提高可靠性（ReplicatedMergeTree）
    insert_quorum = 2
```

对于连接器级别的插入设置：

```json
"clickhouseSettings": "insert_quorum=2,insert_quorum_timeout=60000"
```

#### 连接池和超时 {#connection-pooling}

连接器维护到 ClickHouse 的 HTTP 连接。针对高延迟网络调整超时设置：

```json
"clickhouseSettings": "socket_timeout=300000,connection_timeout=30000"
```

- **`socket_timeout`**（默认值：30000 毫秒）：读取操作的最大时间
- **`connection_timeout`**（默认值：10000 毫秒）：建立连接的最大时间

如果在处理大批次时遇到超时错误，请增加这些值。

#### 监控和性能故障排除 {#monitoring-performance}

监控以下关键指标：

1. **消费者延迟**：使用 Kafka 监控工具跟踪每个分区的延迟
2. **连接器指标**：通过 JMX 监控 `receivedRecords`、`recordProcessingTime`、`taskProcessingTime`（参见[监控](#monitoring)）
3. **ClickHouse 指标**：
   - `system.asynchronous_inserts`：监控异步插入缓冲区使用情况
   - `system.parts`：监控数据部分数量以检测合并问题
   - `system.merges`：监控活动合并
   - `system.events`：跟踪 `InsertedRows`、`InsertedBytes`、`FailedInsertQuery`

**常见性能问题**：


| 症状                    | 可能原因                       | 解决方案                                                    |
| ----------------------- | ------------------------------ | ----------------------------------------------------------- |
| 消费者延迟高            | 批次过小                       | 增加 `max.poll.records`，启用异步插入                       |
| "Too many parts" 错误   | 频繁的小批量插入               | 启用异步插入，增加批次大小                                  |
| 超时错误                | 批次过大，网络慢               | 减小批次大小，增加 `socket_timeout`，检查网络               |
| CPU 使用率高            | 小数据分片过多                 | 启用异步插入，增加合并设置                                  |
| OutOfMemory 错误        | 批次过大                       | 减小 `max.poll.records`、`max.partition.fetch.bytes`        |
| 任务负载不均            | 分区分布不均                   | 重新平衡分区或调整 `tasks.max`                              |

#### 最佳实践总结 {#performance-best-practices}

1. **从默认配置开始**，然后根据实际性能进行测量和调优
2. **优先使用较大批次**：尽可能将每次插入的目标行数设置为 10,000-100,000 行
3. **使用异步插入**：在发送大量小批次或高并发场景下使用
4. **始终使用 `wait_for_async_insert=1`**：在精确一次语义场景下使用
5. **水平扩展**：将 `tasks.max` 增加到分区数量
6. **每个高流量主题使用一个连接器**：以获得最大吞吐量
7. **持续监控**：跟踪消费者延迟、分片数量和合并活动
8. **充分测试**：在生产部署前，始终在真实负载下测试配置更改

#### 示例：高吞吐量配置 {#example-high-throughput}

以下是针对高吞吐量优化的完整示例：

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

- 每次轮询处理最多 10,000 条记录
- 跨分区批处理以实现更大的插入
- 使用 16 MB 缓冲区的异步插入
- 运行 8 个并行任务（与分区数量匹配）
- 优化吞吐量而非严格顺序

### 故障排除 {#troubleshooting}

#### "State mismatch for topic `[someTopic]` partition `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

当 KeeperMap 中存储的偏移量与 Kafka 中存储的偏移量不同时会发生这种情况，通常是在主题被删除或偏移量被手动调整时。
要解决此问题，您需要删除为该主题 + 分区存储的旧值。

**注意：此调整可能会影响精确一次语义。**

#### "连接器会重试哪些错误？" {#what-errors-will-the-connector-retry}

目前重点是识别可以重试的瞬态错误，包括：

- `ClickHouseException` - 这是 ClickHouse 可能抛出的通用异常。
  通常在服务器过载时抛出，以下错误代码被认为是特别瞬态的：
  - 3 - UNEXPECTED_END_OF_FILE（意外的文件结束）
  - 159 - TIMEOUT_EXCEEDED（超时）
  - 164 - READONLY（只读）
  - 202 - TOO_MANY_SIMULTANEOUS_QUERIES（并发查询过多）
  - 203 - NO_FREE_CONNECTION（无可用连接）
  - 209 - SOCKET_TIMEOUT（套接字超时）
  - 210 - NETWORK_ERROR（网络错误）
  - 242 - TABLE_IS_READ_ONLY（表为只读）
  - 252 - TOO_MANY_PARTS（分片过多）
  - 285 - TOO_FEW_LIVE_REPLICAS（活跃副本过少）
  - 319 - UNKNOWN_STATUS_OF_INSERT（插入状态未知）
  - 425 - SYSTEM_ERROR（系统错误）
  - 999 - KEEPER_EXCEPTION（Keeper 异常）
  - 1002 - UNKNOWN_EXCEPTION（未知异常）
- `SocketTimeoutException` - 套接字超时时抛出。
- `UnknownHostException` - 无法解析主机时抛出。
- `IOException` - 网络出现问题时抛出。


#### "我的所有数据都是空白/零值" {#all-my-data-is-blankzeroes}

可能是您数据中的字段与表中的字段不匹配——这在 CDC（以及 Debezium 格式）中尤为常见。
一个常见的解决方案是在连接器配置中添加扁平化转换:

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

这将把您的数据从嵌套 JSON 转换为扁平化 JSON(使用 `_` 作为分隔符)。表中的字段将遵循 "field1_field2_field3" 格式(例如 "before_id"、"after_id" 等)。

#### "我想在 ClickHouse 中使用 Kafka 键" {#i-want-to-use-my-kafka-keys-in-clickhouse}

Kafka 键默认不存储在值字段中,但您可以使用 `KeyToValue` 转换将键移动到值字段(在新的 `_key` 字段名下):

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
