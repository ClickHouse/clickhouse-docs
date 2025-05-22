---
'sidebar_label': 'ClickHouse Kafka 连接器'
'sidebar_position': 2
'slug': '/integrations/kafka/clickhouse-kafka-connect-sink'
'description': 'ClickHouse 的官方 Kafka 连接器。'
'title': 'ClickHouse Kafka 连接器'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
如果您需要任何帮助，请 [在仓库中提交问题](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) 或在 [ClickHouse公共Slack](https://clickhouse.com/slack) 中提出问题。
:::
**ClickHouse Kafka Connect Sink** 是将数据从 Kafka 主题传递到 ClickHouse 表的 Kafka 连接器。

### License {#license}

Kafka 连接器 Sink 根据 [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0) 分发。

### Requirements for the environment {#requirements-for-the-environment}

在环境中应该安装版本 v2.7 或更高的 [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) 框架。

### Version compatibility matrix {#version-compatibility-matrix}

| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
|----------------------------------|--------------------|---------------|--------------------|
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1              |

### Main Features {#main-features}

- 以开箱即用的 exactly-once 语义发布。它由一个新的 ClickHouse 核心功能 [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) 驱动（作为连接器的状态存储使用），并允许最小化的架构。
- 支持第三方状态存储：当前默认使用内存，但可以使用 KeeperMap（Redis 将很快添加）。
- 核心集成：由 ClickHouse 构建、维护和支持。
- 持续针对 [ClickHouse Cloud](https://clickhouse.com/cloud) 进行测试。
- 具有声明架构和无架构的数据插入。
- 支持 ClickHouse 的所有数据类型。

### Installation instructions {#installation-instructions}

#### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />

#### General Installation Instructions {#general-installation-instructions}

连接器分发为一个包含所有必需类文件的单个 JAR 文件。

要安装插件，请按照以下步骤操作：

- 从 ClickHouse Kafka Connect Sink 仓库的 [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) 页面下载包含连接器 JAR 文件的 ZIP 压缩包。
- 解压 ZIP 文件内容并复制到所需位置。
- 在您的 Connect 属性文件中将插件目录的路径添加到 [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) 配置中，以允许 Confluent Platform 找到插件。
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
- 如果您使用 Confluent Platform，请登录 Confluent Control Center UI 验证 ClickHouse Sink 是否在可用连接器列表中。

### Configuration options {#configuration-options}

要将 ClickHouse Sink 连接到 ClickHouse 服务器，您需要提供：

- 连接详细信息：主机名 (**必填**) 和端口（可选）
- 用户凭据：密码 (**必填**) 和用户名（可选）
- 连接器类：`com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**必填**)
- topics 或 topics.regex：要轮询的 Kafka 主题 - 主题名称必须与表名匹配 (**必填**)
- 键和值转换器：根据主题上的数据类型进行设置。如果在工作配置中未定义，则需要。

完整的配置选项表：

| Property Name                                   | Description                                                                                                                                                                                                                        | Default Value                                            |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `hostname` (Required)                           | 服务器的主机名或 IP 地址                                                                                                                                                                                                           | N/A                                                      |
| `port`                                          | ClickHouse 端口 - 默认是 8443（用于云中的 HTTPS），但对于自托管的 HTTP 默认应为 8123                                                                                          | `8443`                                                   |
| `ssl`                                           | 启用与 ClickHouse 的 SSL 连接                                                                                                                                                                                                    | `true`                                                   |
| `jdbcConnectionProperties`                      | 连接到 Clickhouse 时的连接属性。必须以 `?` 开头，在 `param=value` 之间用 `&` 连接                                                                                                                                           | `""`                                                     |
| `username`                                      | ClickHouse 数据库用户名                                                                                                                                                                                                         | `default`                                                |
| `password` (Required)                           | ClickHouse 数据库密码                                                                                                                                                                                                           | N/A                                                      |
| `database`                                      | ClickHouse 数据库名称                                                                                                                                                                                                           | `default`                                                |
| `connector.class` (Required)                    | 连接器类（显式设置并保持为默认值）                                                                                                                                                                                                | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                     | 连接器任务的数量                                                                                                                                                                                                                | `"1"`                                                    |
| `errors.retry.timeout`                          | ClickHouse JDBC 重试超时                                                                                                                                                                                                         | `"60"`                                                   |
| `exactlyOnce`                                   | 启用 exactly Once                                                                                                                                                                                                                | `"false"`                                                |
| `topics` (Required)                             | 要轮询的 Kafka 主题 - 主题名称必须与表名匹配                                                                                                                                                                                    | `""`                                                     |
| `key.converter` (Required* - See Description)   | 根据键的类型进行设置。如果您传递键（并且在工作配置中未定义），这里是必需的。                                                                                                                                                       | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Required* - See Description) | 根据主题上数据的类型进行设置。支持：- JSON、String、Avro 或 Protobuf 格式。如果在工作配置中未定义，这里是必需的。                                                                                                             | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                | 连接器值转换器架构支持                                                                                                                                                                                                          | `"false"`                                                |
| `errors.tolerance`                              | 连接器错误容忍度。支持：none、all                                                                                                                                                                                                 | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`             | 如果设置（与 errors.tolerance=all 一起），将为失败的批次使用 DLQ（请参见 [Troubleshooting](#troubleshooting)）                                                                                                              | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable` | 为 DLQ 添加额外的头部                                                                                                                                                                                                          | `""`                                                     |
| `clickhouseSettings`                            | ClickHouse 设置的以逗号分隔的列表（例如 "insert_quorum=2, 等等..."）                                                                                                                                                             | `""`                                                     |
| `topic2TableMap`                                | 映射主题名称到表名称的以逗号分隔的列表（例如 "topic1=table1, topic2=table2, 等等..."）                                                                                                                                           | `""`                                                     |
| `tableRefreshInterval`                          | 刷新表定义缓存的时间（以秒为单位）                                                                                                                                                                                              | `0`                                                      |
| `keeperOnCluster`                               | 允许为自托管实例配置 ON CLUSTER 参数（例如 `ON CLUSTER clusterNameInConfigFileDefinition`）以获得 exactly-once 的 connect_state 表（请参见 [Distributed DDL Queries](/sql-reference/distributed-ddl)  | `""`                                                     |
| `bypassRowBinary`                               | 允许禁用 RowBinary 和 RowBinaryWithDefaults 用于基于模式的数据（Avro、Protobuf 等） - 仅在数据将有缺失列时使用，如果 Nullable/Default 不可接受。                                                                        | `"false"`                                                |
| `dateTimeFormats`                               | 用于解析 DateTime64 模式字段的日期时间格式，以 `;` 分隔（例如 `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                                                                       | `""`                                                     |
| `tolerateStateMismatch`                         | 允许连接器丢弃在 AFTER_PROCESSING 中存储的当前偏移量之前的记录（例如，如果发送偏移量 5，而最后记录的偏移量是 250）                                                                                                           | `"false"`                                                |
| `ignorePartitionsWhenBatching`                  | 在收集用于插入的消息时将忽略分区（但仅当 `exactlyOnce` 为 `false`）。性能注意：连接器任务越多，每个任务分配到的 Kafka 分区就越少 - 这可能意味着收益递减。                                                            | `"false"`                                                |

### Target Tables {#target-tables}

ClickHouse Connect Sink 从 Kafka 主题读取消息并将它们写入相应的表中。ClickHouse Connect Sink 将数据写入现有表中。在开始插入数据之前，请确保在 ClickHouse 中创建了具有适当架构的目标表。

每个主题都需要一个专用的目标表。目标表名称必须与源主题名称匹配。

### Pre-processing {#pre-processing}

如果您需要在将出站消息发送到 ClickHouse Kafka Connect Sink 之前转换它们，请使用 [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html)。

### Supported Data types {#supported-data-types}

**声明架构：**

| Kafka Connect Type                      | ClickHouse Type       | Supported | Primitive |
| --------------------------------------- |-----------------------| --------- | --------- |
| STRING                                  | String                | ✅        | Yes       |
| INT8                                    | Int8                  | ✅        | Yes       |
| INT16                                   | Int16                 | ✅        | Yes       |
| INT32                                   | Int32                 | ✅        | Yes       |
| INT64                                   | Int64                 | ✅        | Yes       |
| FLOAT32                                 | Float32               | ✅        | Yes       |
| FLOAT64                                 | Float64               | ✅        | Yes       |
| BOOLEAN                                 | Boolean               | ✅        | Yes       |
| ARRAY                                   | Array(T)              | ✅        | No        |
| MAP                                     | Map(Primitive, T)     | ✅        | No        |
| STRUCT                                  | Variant(T1, T2, ...)    | ✅        | No        |
| STRUCT                                  | Tuple(a T1, b T2, ...)  | ✅        | No        |
| STRUCT                                  | Nested(a T1, b T2, ...) | ✅        | No        |
| BYTES                                   | String                | ✅        | No        |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64    | ✅        | No        |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32        | ✅        | No        |
| org.apache.kafka.connect.data.Decimal   | Decimal               | ✅        | No        |

**未声明架构：**

记录被转换为 JSON 并以值的形式发送到 ClickHouse，格式为 [JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow)。

### Configuration Recipes {#configuration-recipes}

以下是一些常见的配置食谱，以帮助您快速入门。

#### Basic Configuration {#basic-configuration}

最基本的配置，以帮助您开始 - 假设您正在以分布式模式运行 Kafka Connect，并且在 `localhost:8443` 上运行了启用 SSL 的 ClickHouse 服务器，数据是无架构 JSON。

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

#### Basic Configuration with Multiple Topics {#basic-configuration-with-multiple-topics}

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

#### Basic Configuration with DLQ {#basic-configuration-with-dlq}

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

#### Using with different data formats {#using-with-different-data-formats}

##### Avro Schema Support {#avro-schema-support}

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

##### Protobuf Schema Support {#protobuf-schema-support}

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

请注意：如果您遇到缺少类的问题，并不是每个环境都包含 protobuf 转换器，您可能需要捆绑依赖项的 jar 的替代版本。

##### JSON Schema Support {#json-schema-support}

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

##### String Support {#string-support}

连接器支持以不同 ClickHouse 格式的 String Converter：[JSON](/interfaces/formats#jsoneachrow)、[CSV](/interfaces/formats#csv) 和 [TSV](/interfaces/formats#tabseparated)。

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

### Logging {#logging}

日志记录由 Kafka Connect Platform 自动提供。
日志目标和格式可以通过 Kafka connect [配置文件](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file)进行配置。

如果使用 Confluent Platform，可以通过运行 CLI 命令查看日志：

```bash
confluent local services connect log
```

有关更多详细信息，请查看官方 [tutorial](https://docs.confluent.io/platform/current/connect/logging.html)。

### Monitoring {#monitoring}

ClickHouse Kafka Connect 通过 [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html) 报告运行时指标。默认情况下，在 Kafka Connector 中启用 JMX。

ClickHouse Connect `MBeanName`：

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect 报告以下指标：

| Name                 | Type | Description                                                                             |
|----------------------|------|-----------------------------------------------------------------------------------------|
| `receivedRecords`      | long | 接收到的记录总数。                                                        |
| `recordProcessingTime` | long | 花费在将记录分组并转换为统一结构的总时间（以纳秒为单位）。 |
| `taskProcessingTime`   | long | 花费在处理和插入数据到 ClickHouse 的总时间（以纳秒为单位）。           |

### Limitations {#limitations}

- 不支持删除。
- 批量大小继承自 Kafka 消费者属性。
- 当使用 KeeperMap 进行 exactly-once 时，如果偏移量发生更改或回卷，您需要删除该特定主题在 KeeperMap 中的内容。（有关更多详细信息，请参见故障排除指南）

### Tuning Performance {#tuning-performance}

如果您曾经想过“我想调整 sink 连接器的批量大小”，那么您可以参考这一部分。

##### Connect Fetch vs Connector Poll {#connect-fetch-vs-connector-poll}

Kafka Connect（我们的 sink 连接器构建的框架）将在后台从 Kafka 主题中提取消息（与连接器无关）。

您可以使用 `fetch.min.bytes` 和 `fetch.max.bytes` 控制此过程 - `fetch.min.bytes` 设置传递给连接器之前所需的最小值（最多设置的时间限制由 `fetch.max.wait.ms`），`fetch.max.bytes` 设置上限。如果您想将更大的批量传递给连接器，可以选择增加最小提取或最大等待时间以构建更大的数据包。

提取的数据随后由连接器客户端轮询以获取消息，每次轮询的数量由 `max.poll.records` 控制 - 请注意，提取与轮询是独立的！

在调整这些设置时，用户应致力于使他们的提取大小生成多个 `max.poll.records` 批量（并记住，设置 `fetch.min.bytes` 和 `fetch.max.bytes` 代表压缩数据） - 这样，每个连接器任务就可以插入尽可能大的批量。

ClickHouse 针对更大的批量进行了优化，甚至在稍微延迟的情况下，也比频繁的小批量更好 - 批量越大，效果越好。

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

更多详细信息可以在 [Confluent documentation](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration)
或 [Kafka documentation](https://kafka.apache.org/documentation/#consumerconfigs) 中找到。

#### Multiple high throughput topics {#multiple-high-throughput-topics}

如果您的连接器配置为订阅多个主题，您正在使用 `topic2TableMap` 将主题映射到表，并且在插入时遇到瓶颈导致消费者延迟，则考虑为每个主题创建一个连接器。这主要是由于批量当前会被串行插入到每个表中造成的 [serially](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100)。

为每个主题创建一个连接器是一种解决方法，可以确保您获得最快的插入率。

### Troubleshooting {#troubleshooting}

#### "State mismatch for topic `[someTopic]` partition `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

当 KeeperMap 中存储的偏移量与 Kafka 中存储的偏移量不同（通常是主题被删除或手动调整偏移量时），会发生这种情况。要修复此问题，您需要删除给定主题 + 分区中存储的旧值。

**注意：此调整可能会有 exactly-once 的影响。**

#### "What errors will the connector retry?" {#what-errors-will-the-connector-retry}

目前的焦点是识别瞬态并且可以重试的错误，包括：

- `ClickHouseException` - 这是 ClickHouse 抛出的通用异常。
  通常在服务器过载时抛出，以下错误代码被认为特别瞬态：
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
- `UnknownHostException` - 当主机无法解析时抛出。
- `IOException` - 当网络出现问题时抛出。

#### "All my data is blank/zeroes" {#all-my-data-is-blankzeroes}
很可能您的数据中的字段与表中的字段不匹配 - 这在 CDC（和 Debezium 格式）中尤其常见。
一个常见的解决方案是向您的连接器配置中添加扁平化转换：

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

这将把您的数据从嵌套 JSON 转换为扁平 JSON（使用 `_` 作为分隔符）。表中的字段将遵循 "field1_field2_field3" 格式（即 "before_id"、"after_id" 等）。

#### "I want to use my Kafka keys in ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Kafka 键默认不存储在值字段中，但您可以使用 `KeyToValue` 转换将键移动到值字段（下划线 `_key` 字段名称下）：

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
