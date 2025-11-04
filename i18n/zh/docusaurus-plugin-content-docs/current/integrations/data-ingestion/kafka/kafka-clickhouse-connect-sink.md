---
'sidebar_label': 'ClickHouse Kafka 连接器汇聚'
'sidebar_position': 2
'slug': '/integrations/kafka/clickhouse-kafka-connect-sink'
'description': '官方的 Kafka 连接器来自 ClickHouse.'
'title': 'ClickHouse Kafka 连接器汇聚'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
如果您需要任何帮助，请 [在这个仓库中提交问题](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) 或在 [ClickHouse 公共 Slack](https://clickhouse.com/slack) 提出问题。
:::
**ClickHouse Kafka Connect Sink** 是将数据从 Kafka 主题传递到 ClickHouse 表的 Kafka 连接器。

### License {#license}

Kafka 连接器 Sink 在 [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0) 下分发。

### Requirements for the environment {#requirements-for-the-environment}

环境中需安装 [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) 框架 v2.7 或更高版本。

### Version compatibility matrix {#version-compatibility-matrix}

| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
|----------------------------------|--------------------|---------------|--------------------|
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1              |

### Main features {#main-features}

- 具有开箱即用的恰好一次语义。它由一个名为 [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) 的新 ClickHouse 核心特性提供支持（作为连接器的状态存储），并允许最小化架构。
- 支持第三方状态存储：目前默认为内存存储，但可以使用 KeeperMap（Redis 将很快添加）。
- 核心集成：由 ClickHouse 构建、维护和支持。
- 持续对 [ClickHouse Cloud](https://clickhouse.com/cloud) 进行测试。
- 支持声明模式和无模式的数据插入。
- 支持 ClickHouse 的所有数据类型。

### Installation instructions {#installation-instructions}

#### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />

#### General installation instructions {#general-installation-instructions}

该连接器作为一个包含所有运行插件所需类文件的单个 JAR 文件分发。

要安装该插件，请执行以下步骤：

- 从 ClickHouse Kafka Connect Sink 仓库的 [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) 页面下载包含连接器 JAR 文件的 zip 文件。
- 解压 ZIP 文件内容并复制到所需位置。
- 在您的 Connect 属性文件中将插件目录的路径添加到 [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) 配置，以允许 Confluent 平台找到插件。
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

- 重启 Confluent 平台。
- 如果您使用 Confluent 平台，请登录到 Confluent 控制中心 UI，以验证 ClickHouse Sink 是否在可用连接器列表中。

### Configuration options {#configuration-options}

要将 ClickHouse Sink 连接到 ClickHouse 服务器，您需要提供：

- 连接详细信息：主机名 (**必填**) 和端口（可选）
- 用户凭据：密码 (**必填**) 和用户名（可选）
- 连接器类： `com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**必填**)
- topics 或 topics.regex：要轮询的 Kafka 主题 - 主题名称必须与表名称匹配 (**必填**)
- key 和 value 转换器：根据主题上的数据类型设置。如果在工作配置中尚未定义，则为必填项。

完整的配置选项表：

| 属性名                                       | 描述                                                                                                                                                                            | 默认值                                               |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| `hostname` (必填)                           | 服务器的主机名或 IP 地址                                                                                                                                                       | N/A                                                 |
| `port`                                      | ClickHouse 端口 - 默认是 8443（用于云中的 HTTPS），但对于 HTTP（自托管的默认值）应为 8123                                                                                     | `8443`                                             |
| `ssl`                                       | 启用ssl连接到 ClickHouse                                                                                                                                                       | `true`                                             |
| `jdbcConnectionProperties`                  | 连接到 Clickhouse 的连接属性。必须以 `?` 开头并通过 `&` 连结 `param=value`                                                                                                           | `""`                                               |
| `username`                                  | ClickHouse 数据库用户名                                                                                                                                                       | `default`                                         |
| `password` (必填)                           | ClickHouse 数据库密码                                                                                                                                                       | N/A                                                 |
| `database`                                  | ClickHouse 数据库名称                                                                                                                                                         | `default`                                         |
| `connector.class` (必填)                    | 连接器类（显式设置并保持为默认值）                                                                                                                                             | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                 | 连接器任务的数量                                                                                                                                                             | `"1"`                                              |
| `errors.retry.timeout`                      | ClickHouse JDBC 重试超时                                                                                                                                                       | `"60"`                                            |
| `exactlyOnce`                               | 启用恰好一次                                                                                                                                                                   | `"false"`                                        |
| `topics` (必填)                             | 要轮询的 Kafka 主题 - 主题名称必须与表名称匹配                                                                                                                                 | `""`                                               |
| `key.converter` (必填* - 见描述)            | 根据键的类型设置。如果您正在传递键（且未在工作配置中定义），此处为必填项。                                                                                                            | `"org.apache.kafka.connect.storage.StringConverter"` |
| `value.converter` (必填* - 见描述)          | 根据主题上数据的类型设置。支持：- JSON、字符串、Avro 或 Protobuf 格式。如果在工作配置中未定义，则在此处为必填项。                                                                  | `"org.apache.kafka.connect.json.JsonConverter"`    |
| `value.converter.schemas.enable`            | 连接器值转换器模式支持                                                                                                                                                         | `"false"`                                        |
| `errors.tolerance`                          | 连接器错误容忍度。支持：none, all                                                                                                                                               | `"none"`                                           |
| `errors.deadletterqueue.topic.name`         | 如果设置（与 errors.tolerance=all 一起使用），将为失败的批次使用 DLQ（请参阅 [Troubleshooting](#troubleshooting)）                                                      | `""`                                                |
| `errors.deadletterqueue.context.headers.enable` | 为 DLQ 添加其他标头                                                                                                                                                              | `""`                                                |
| `clickhouseSettings`                        | ClickHouse 设置的逗号分隔列表（例如 "insert_quorum=2, 等等..."）                                                                                                                      | `""`                                               |
| `topic2TableMap`                            | 将主题名称映射到表名称的逗号分隔列表（例如 "topic1=table1, topic2=table2, 等等..."）                                                                                                      | `""`                                               |
| `tableRefreshInterval`                      | 刷新表定义缓存的时间（以秒为单位）                                                                                                                                               | `0`                                               |
| `keeperOnCluster`                           | 允许为自托管实例配置 ON CLUSTER 参数（例如 `ON CLUSTER clusterNameInConfigFileDefinition`）用于恰好一次 connect_state 表（见 [分布式 DDL 查询](/sql-reference/distributed-ddl)）| `""`                                               |
| `bypassRowBinary`                           | 允许禁用 Schema 基于数据的 RowBinary 和 RowBinaryWithDefaults 的使用（Avro、Protobuf 等）- 仅在数据将具有缺失列且 Nullable/Default 不可接受时使用。                                          | `"false"`                                        |
| `dateTimeFormats`                           | 用于解析 DateTime64 模式字段的日期时间格式，使用 `;` 分隔（例如 `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                           | `""`                                            |
| `tolerateStateMismatch`                     | 允许连接器删除"早于"当前偏移存储的记录，AFTER_PROCESSING（例如如果发送偏移 5，而最后记录的偏移是 250）                                                                              | `"false"`                                        |
| `ignorePartitionsWhenBatching`              | 在收集要插入的消息时将忽略分区（尽管仅当 `exactlyOnce` 为`false`时）。性能注意：连接器任务越多，每个任务分配的 Kafka 分区越少 - 这可能意味着收益递减。                                   | `"false"`                                          |

### Target tables {#target-tables}

ClickHouse Connect Sink 从 Kafka 主题读取消息并将其写入相应的表。ClickHouse Connect Sink 将数据写入现有表。请确保在开始向其插入数据之前，在 ClickHouse 中创建了具有适当模式的目标表。

每个主题在 ClickHouse 中需要一个专用的目标表。目标表名称必须与源主题名称匹配。

### Pre-processing {#pre-processing}

如果您需要在将出站消息发送到 ClickHouse Kafka Connect Sink 之前转换消息，请使用 [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html)。

### Supported data types {#supported-data-types}

**声明模式时：**

| Kafka Connect 类型                       | ClickHouse 类型       | 支持     | 原始     |
|-----------------------------------------|-----------------------|---------|---------|
| STRING                                  | String                | ✅      | 是      |
| STRING                                  | JSON. 见下文 (1)              | ✅      | 是      |
| INT8                                    | Int8                  | ✅      | 是      |
| INT16                                   | Int16                 | ✅      | 是      |
| INT32                                   | Int32                 | ✅      | 是      |
| INT64                                   | Int64                 | ✅      | 是      |
| FLOAT32                                 | Float32               | ✅      | 是      |
| FLOAT64                                 | Float64               | ✅      | 是      |
| BOOLEAN                                 | Boolean               | ✅      | 是      |
| ARRAY                                   | Array(T)              | ✅      | 否      |
| MAP                                     | Map(Primitive, T)     | ✅      | 否      |
| STRUCT                                  | Variant(T1, T2, ...)    | ✅      | 否      |
| STRUCT                                  | Tuple(a T1, b T2, ...)  | ✅      | 否      |
| STRUCT                                  | Nested(a T1, b T2, ...) | ✅      | 否      |
| STRUCT                                  | JSON. 见下文 (1), (2)          | ✅      | 否      |
| BYTES                                   | String                | ✅      | 否      |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64    | ✅      | 否      |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32        | ✅      | 否      |
| org.apache.kafka.connect.data.Decimal   | Decimal               | ✅      | 否      |

- (1) - 仅当 ClickHouse 设置为 `input_format_binary_read_json_as_string=1` 时，JSON 被支持。此设置仅适用于 RowBinary 格式系列，并且此设置影响插入请求中的所有列，因此它们都应该是字符串。在这种情况下，连接器会将 STRUCT 转换为 JSON 字符串。

- (2) - 当结构具有像 `oneof` 的联合时，转换器应该配置为不向字段名添加前缀/后缀。为 `ProtobufConverter` 提供 `generate.index.for.unions=false` [设置](https://docs.confluent.io/platform/current/schema-registry/connect.html#protobuf)。  

**未声明模式时：**

记录被转换为 JSON，并作为值以 [JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow) 格式发送到 ClickHouse。

### Configuration recipes {#configuration-recipes}

这些是一些常见的配置配方，可以帮助您快速入门。

#### Basic configuration {#basic-configuration}

最基本的配置以帮助您入门 - 假设您在分布式模式下运行 Kafka Connect，并且有一个在 `localhost:8443` 上运行的 ClickHouse 服务器，SSL 启用，数据为无模式 JSON。

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

#### Basic configuration with multiple topics {#basic-configuration-with-multiple-topics}

连接器可以从多个主题获取数据。

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

#### Basic configuration with DLQ {#basic-configuration-with-dlq}

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

##### Avro schema support {#avro-schema-support}

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

##### Protobuf schema support {#protobuf-schema-support}

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

请注意：如果您在缺少类方面遇到问题，并不是每个环境都附带 Protobuf 转换器，您可能需要一个捆绑了依赖项的替代 JAR 版本。

##### JSON schema support {#json-schema-support}

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

##### String support {#string-support}

连接器支持不同 ClickHouse 格式中的字符串转换器：[JSON](/interfaces/formats#jsoneachrow)、[CSV](/interfaces/formats#csv) 和 [TSV](/interfaces/formats#tabseparated)。

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

Kafka Connect 平台自动提供日志记录。
日志的目的地和格式可以通过 Kafka connect [配置文件](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file)进行配置。

如果使用 Confluent 平台，可以通过运行 CLI 命令查看日志：

```bash
confluent local services connect log
```

有关更多详细信息，请查看官方 [教程](https://docs.confluent.io/platform/current/connect/logging.html)。

### Monitoring {#monitoring}

ClickHouse Kafka Connect 通过 [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html) 报告运行时指标。JMX 在 Kafka 连接器中默认启用。

ClickHouse Connect `MBeanName`：

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect 报告以下指标：

| 名称                       | 类型  | 描述                                                                              |
|--------------------------|-------|----------------------------------------------------------------------------------|
| `receivedRecords`         | long  | 接收到的记录总数。                                                               |
| `recordProcessingTime`    | long  | 将记录分组并转换为统一结构所花费的总时间（以纳秒为单位）。                      |
| `taskProcessingTime`      | long  | 处理并将数据插入 ClickHouse 所花费的总时间（以纳秒为单位）。                    |

### Limitations {#limitations}

- 不支持删除操作。
- 批量大小来自 Kafka 消费者属性。
- 使用 KeeperMap 进行恰好一次时，如果偏移量发生更改或回滚，您需要删除该特定主题在 KeeperMap 中的内容。（有关更多详细信息，请参阅下方的故障排除指南）

### Tuning performance {#tuning-performance}

如果您曾经想过"我想调整 sink 连接器的批量大小"，那么这一部分正是为您准备的。

##### Connect fetch vs connector poll {#connect-fetch-vs-connector-poll}

Kafka Connect（我们连接器构建的框架）将在后台从 Kafka 主题获取消息（与连接器无关）。

您可以使用 `fetch.min.bytes` 和 `fetch.max.bytes` 来控制此过程 - `fetch.min.bytes` 设置在框架将值传递给连接器之前所需的最小量（由 `fetch.max.wait.ms` 设置的时间限制），`fetch.max.bytes` 设置上限。如果您想将更大的批量传递给连接器，可以选择增加最小提取或最大等待时间以构建较大的数据包。

提取的数据然后由连接器客户端轮询，以获取消息，每次轮询的数量由 `max.poll.records` 控制 - 请注意，提取与轮询是独立的！

在调整这些设置时，用户应旨在使提取大小产生多个 `max.poll.records` 的批量（并记住，设置 `fetch.min.bytes` 和 `fetch.max.bytes` 代表压缩数据） - 这样，每个连接器任务都可以插入尽可能大的批量。

ClickHouse 针对更大的批量进行了优化，即使在稍微延迟的情况下，也优于频繁但较小的批量 - 批量越大，效果越好。

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

有关更多详细信息，请查看 [Confluent 文档](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration) 或 [Kafka 文档](https://kafka.apache.org/documentation/#consumerconfigs)。

#### Multiple high throughput topics {#multiple-high-throughput-topics}

如果您的连接器配置为订阅多个主题，您正在使用 `topic2TableMap` 将主题映射到表，并且在插入时遇到瓶颈导致消费者滞后，请考虑为每个主题创建一个连接器。发生这样情况的主要原因是，当前批量是以 [串行方式](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100) 插入到每个表中。

每个主题创建一个连接器是确保获得最快插入速度的解决方法。

### Troubleshooting {#troubleshooting}

#### "State mismatch for topic `[someTopic]` partition `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

当 KeeperMap 中存储的偏移量与 Kafka 中存储的偏移量不同，通常发生在主题被删除或偏移量被手动调整时。
要解决此问题，您需要删除为该特定主题 + 分区存储的旧值。

**注意：此调整可能会对恰好一次有影响。**

#### "What errors will the connector retry?" {#what-errors-will-the-connector-retry}

目前，重点是识别可以重试的瞬态错误，包括：

- `ClickHouseException` - 这是 ClickHouse 抛出的通用异常。它通常在服务器超载时抛出，以下错误代码被视为特别瞬态：
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

#### "All my data is blank/zeroes" {#all-my-data-is-blankzeroes}

您的数据中的字段与表中的字段不匹配可能是原因 - 这在 CDC（以及 Debezium 格式）中特别常见。
一个常见的解决方案是将扁平化转换添加到您的连接器配置中：

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

这将把您的数据从嵌套 JSON 转换为扁平 JSON（使用 `_` 作为分隔符）。表中的字段将遵循 "field1_field2_field3" 格式（即 "before_id"，"after_id"，等）。

#### "I want to use my Kafka keys in ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}

默认情况下，Kafka 键不存储在值字段中，但您可以使用 `KeyToValue` 转换将键移动到值字段（在新字段 `_key` 下）：

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
