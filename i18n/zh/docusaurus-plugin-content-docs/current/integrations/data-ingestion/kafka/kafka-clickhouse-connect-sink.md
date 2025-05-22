import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# ClickHouse Kafka Connect Sink

:::note
如果您需要任何帮助，请 [在存储库中提交问题](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) 或在 [ClickHouse 公共 Slack](https://clickhouse.com/slack) 中提出问题。
:::
**ClickHouse Kafka Connect Sink** 是从 Kafka 主题将数据传输到 ClickHouse 表的 Kafka 连接器。

### License {#license}

Kafka 连接器 Sink 在 [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0) 下分发。

### Requirements for the environment {#requirements-for-the-environment}

环境中应安装 [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) 框架 v2.7 或更高版本。

### Version compatibility matrix {#version-compatibility-matrix}

| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
|----------------------------------|--------------------|---------------|--------------------|
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1              |

### Main Features {#main-features}

- 随附开箱即用的精准一次语义。它由一个名为 [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) 的新 ClickHouse 核心功能提供支持（作为连接器的状态存储），允许实现简约架构。
- 支持 3rd-party 状态存储：当前默认为内存存储，但可以使用 KeeperMap（Redis 将很快添加）。
- 核心集成：由 ClickHouse 构建、维护和支持。
- 在 [ClickHouse Cloud](https://clickhouse.com/cloud) 上持续进行测试。
- 支持声明模式和无模式的数据插入。
- 支持 ClickHouse 的所有数据类型。

### Installation instructions {#installation-instructions}

#### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />

#### General Installation Instructions {#general-installation-instructions}

连接器以一个包含运行插件所需所有类文件的单个 JAR 文件形式分发。

要安装插件，请按照以下步骤操作：

- 从 ClickHouse Kafka Connect Sink 存储库的 [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) 页面下载包含 Connector JAR 文件的 ZIP 压缩包。
- 解压 ZIP 文件内容并将其复制到所需位置。
- 在 Connect 属性文件中，在 [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) 配置中添加包含插件目录的路径，以使 Confluent Platform 能找到插件。
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
- 如果您使用 Confluent Platform，请登录 Confluent Control Center UI，确认 ClickHouse Sink 可在可用连接器列表中找到。

### Configuration options {#configuration-options}

要将 ClickHouse Sink 连接到 ClickHouse 服务器，您需要提供：

- 连接详细信息：主机名 (**必需**) 和端口（可选）
- 用户凭据：密码 (**必需**) 和用户名（可选）
- 连接器类： `com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**必需**)
- topics 或 topics.regex: 要轮询的 Kafka 主题 - 主题名称必须与表名称匹配 (**必需**)
- 键和值转换器：根据主题上的数据类型进行设置。如果在工作者配置中未定义，则为必需。

完整的配置选项表：

| Property Name                                   | Description                                                                                                                                                                                                                        | Default Value                                            |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `hostname` (Required)                           | 服务器的主机名或 IP 地址                                                                                                                                                                                                   | N/A                                                      |
| `port`                                          | ClickHouse 端口 - 默认是 8443（在云中使用 HTTPS），但对于 HTTP（自托管的默认）应为 8123                                                                                                | `8443`                                                   |
| `ssl`                                           | 启用与 ClickHouse 的 ssl 连接                                                                                                                                                                                               | `true`                                                   |
| `jdbcConnectionProperties`                      | 连接到 Clickhouse 的连接属性。必须以 `?` 开头，并通过 `&` 在 `param=value` 之间连接                                                                                                           | `""`                                                     |
| `username`                                      | ClickHouse 数据库用户名                                                                                                                                                                                                       | `default`                                                |
| `password` (Required)                           | ClickHouse 数据库密码                                                                                                                                                                                                       | N/A                                                      |
| `database`                                      | ClickHouse 数据库名称                                                                                                                                                                                                       | `default`                                                |
| `connector.class` (Required)                    | 连接器类（显式设置并保持为默认值）                                                                                                                                                                                             | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                     | 连接器任务的数量                                                                                                                                                                                                           | `"1"`                                                    |
| `errors.retry.timeout`                          | ClickHouse JDBC 重试超时                                                                                                                                                                                                       | `"60"`                                                   |
| `exactlyOnce`                                   | 精准一次启用                                                                                                                                                                                                                | `"false"`                                                |
| `topics` (Required)                             | 要轮询的 Kafka 主题 - 主题名称必须与表名称匹配                                                                                                                                                                               | `""`                                                     |
| `key.converter` (Required* - See Description)   | 按照键的类型进行设置。如果您传递密钥（且在工作者配置中未定义），则这里必需。                                                                                                                  | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Required* - See Description) | 根据主题上数据的类型进行设置。支持：- JSON、String、Avro 或 Protobuf 格式。 如果在工作者配置中未定义，则这里必需。                                                                                                   | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                | 连接器值转换器模式支持                                                                                                                                                                                                       | `"false"`                                                |
| `errors.tolerance`                              | 连接器错误容忍度。支持：none，all                                                                                                                                                                                           | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`             | 如果设置（与 errors.tolerance=all 一同），将为失败的批次使用 DLQ（请参阅 [Troubleshooting](#troubleshooting)）                                                                                                     | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable` | 为 DLQ 添加附加头                                                                                                                                                                                                            | `""`                                                     |
| `clickhouseSettings`                            | ClickHouse 设置的以逗号分隔的列表（例如 "insert_quorum=2, etc..."）                                                                                                                                                        | `""`                                                     |
| `topic2TableMap`                                | 映射主题名称到表名称的以逗号分隔的列表（例如 "topic1=table1, topic2=table2, etc..."）                                                                                                                                        | `""`                                                     |
| `tableRefreshInterval`                          | 刷新表定义缓存的时间（以秒为单位）                                                                                                                                                                                            | `0`                                                      |
| `keeperOnCluster`                               | 允许为自托管实例配置 ON CLUSTER 参数（例如 `ON CLUSTER clusterNameInConfigFileDefinition`）用于精准一次 connect_state 表（请参见 [Distributed DDL Queries](/sql-reference/distributed-ddl)） | `""`                                                     |
| `bypassRowBinary`                               | 允许禁用对基于模式的数据（Avro、Protobuf 等）使用 RowBinary 和 RowBinaryWithDefaults - 仅在数据缺少列且 Nullable/Default 不可接受时使用。                                     | `"false"`                                                |
| `dateTimeFormats`                               | 用于解析 DateTime64 模式字段的日期时间格式，由 `;` 分隔（例如 `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`）。                                                                     | `""`                                                     |
| `tolerateStateMismatch`                         | 允许连接器丢弃 “早于” 存储的当前偏移的记录 AFTER_PROCESSING（例如，如果发送偏移 5，而偏移 250 是最后记录的偏移）                                              | `"false"`                                                |
| `ignorePartitionsWhenBatching`                  | 在收集插入消息时将忽略分区（但仅当 `exactlyOnce` 为 `false` 时）。性能注意事项：连接器任务越多，每个任务分配的 Kafka 分区越少 - 这可能意味着收益递减。                       | `"false"`                                                |

### Target Tables {#target-tables}

ClickHouse Connect Sink 从 Kafka 主题读取消息并将其写入适当的表。ClickHouse Connect Sink 将数据写入现有表。请确保在 ClickHouse 中创建了具有相应模式的目标表，然后再开始向其中插入数据。

每个主题在 ClickHouse 中需要一个专用目标表。目标表的名称必须与源主题的名称匹配。

### Pre-processing {#pre-processing}

如果您需要在发送到 ClickHouse Kafka Connect Sink 之前转换出站消息，请使用 [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html)。

### Supported Data types {#supported-data-types}

**使用声明的模式：**

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

**没有声明的模式：**

记录被转换为 JSON 并作为值以 [JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow) 格式发送到 ClickHouse。

### Configuration Recipes {#configuration-recipes}

以下是一些常见的配置食谱，可帮助您快速入门。

#### Basic Configuration {#basic-configuration}

最基本的配置可以帮助您入门 - 它假设您在分布式模式下运行 Kafka Connect，并且在 `localhost:8443` 上运行了启用 SSL 的 ClickHouse 服务器，数据是无模式的 JSON。

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

请注意：如果您遇到缺少类的问题，并非所有环境都带有 protobuf 转换器，您可能需要替代的 JAR 版本，捆绑依赖项。

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

连接器支持在不同 ClickHouse 格式中的 String Converter：[JSON](/interfaces/formats#jsoneachrow)，[CSV](/interfaces/formats#csv)，和 [TSV](/interfaces/formats#tabseparated)。

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
日志目的地和格式可以通过 Kafka connect [配置文件](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file) 进行配置。

如果使用 Confluent Platform，可以通过运行 CLI 命令查看日志：

```bash
confluent local services connect log
```

有关更多详细信息，请查看官方 [教程](https://docs.confluent.io/platform/current/connect/logging.html)。

### Monitoring {#monitoring}

ClickHouse Kafka Connect 通过 [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html) 报告运行时指标。JMX 默认为 Kafka Connector 启用。

ClickHouse Connect `MBeanName`：

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect 报告以下指标：

| Name                 | Type | Description                                                                             |
|----------------------|------|-----------------------------------------------------------------------------------------|
| `receivedRecords`      | long | 接收到的记录总数。                                                                     |
| `recordProcessingTime` | long | 花费在将记录分组和转换为统一结构上的纳秒总时间。                                                   |
| `taskProcessingTime`   | long | 花费在处理和插入数据到 ClickHouse 上的纳秒总时间。                                      |

### Limitations {#limitations}

- 不支持删除。
- 批量大小从 Kafka 消费者属性继承。
- 使用 KeeperMap 进行精准一次处理时，如果偏移量更改或倒回，您需要删除该特定主题的 KeeperMap 内容。(有关更多详细信息，请参见下面的故障排除指南)

### Tuning Performance {#tuning-performance}

如果您曾经想过“我希望调整 Sink 连接器的批量大小”，那么这一部分就是为您准备的。

##### Connect Fetch vs Connector Poll {#connect-fetch-vs-connector-poll}

Kafka Connect（我们的 Sink 连接器构建的框架）将在后台（独立于连接器）从 Kafka 主题获取消息。

您可以使用 `fetch.min.bytes` 和 `fetch.max.bytes` 控制此过程 - `fetch.min.bytes` 设置框架在将值传递给连接器之前所需的最小数量（设置的时间限制由 `fetch.max.wait.ms` 确定），而 `fetch.max.bytes` 设置上限。如果您想将更大的批量传递给连接器，可以选择增加最小获取量或最大等待时间，以构建更大的数据包。

然后，连接器客户端轮询消息消耗已获取的数据，每次轮询的数量由 `max.poll.records` 控制 - 请注意，获取和轮询是独立的！

在调整这些设置时，用户应确保其获取大小生成多个 `max.poll.records` 的批量（并且请记住，`fetch.min.bytes` 和 `fetch.max.bytes` 设置表示压缩的数据） - 这样每个连接器任务就能够插入尽可能大的批量。

ClickHouse 针对更大的批量进行了优化，即使略有延迟，也比频繁但较小的批量更好 - 批量越大效果越好。

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

更多细节可以在 [Confluent 文档](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration) 或 [Kafka 文档](https://kafka.apache.org/documentation/#consumerconfigs) 中找到。

#### Multiple high throughput topics {#multiple-high-throughput-topics}

如果您的连接器配置为订阅多个主题，您正在使用 `topic2TableMap` 将主题映射到表，并且您在插入时遇到瓶颈导致消费者滞后，请考虑为每个主题创建一个连接器。造成这种情况的主要原因是当前批量以串行方式插入到每个表中 [serially](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100)。

每个主题创建一个连接器是一种解决方法，可以确保您获得尽可能快的插入速度。

### Troubleshooting {#troubleshooting}

#### "State mismatch for topic `[someTopic]` partition `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

当 KeeperMap 中存储的偏移量与 Kafka 中存储的偏移量不同时，会发生这种情况，通常是主题已被删除或偏移量被手动调整。
要修复此问题，您需要删除为给定主题 + 分区存储的旧值。

**注意：此调整可能会影响精准一次语义。**

#### "What errors will the connector retry?" {#what-errors-will-the-connector-retry}

现在的重点是识别可以重试的临时错误，包括：

- `ClickHouseException` - 这是 ClickHouse 可能抛出的通用异常。
  当服务器超载时，通常会抛出此异常，以下错误代码被认为特别临时：
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
可能您的数据字段与表中的字段不匹配 - 这在 CDC（和 Debezium 格式）中特别常见。
一种常见的解决方案是向您的连接器配置中添加平展转换：

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

这会将您的数据从嵌套 JSON 转换为平坦 JSON（使用 `_` 作为分隔符）。表中的字段将遵循“field1_field2_field3”格式（即“before_id”、“after_id”等）。

#### "I want to use my Kafka keys in ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}
默认情况下，Kafka 键不会存储在值字段中，但您可以使用 `KeyToValue` 转换器将键移动到值字段（在新的 `_key` 字段名下）：

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
