---
sidebar_label: 'ClickHouse Kafka Connect Sink'
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: 'The official Kafka connector from ClickHouse.'
title: 'ClickHouse Kafka Connect Sink'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';

# ClickHouse Kafka Connect Sink

:::note
If you need any help, please [file an issue in the repository](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) or raise a question in [ClickHouse public Slack](https://clickhouse.com/slack).
:::
**ClickHouse Kafka Connect Sink** is the Kafka connector delivering data from a Kafka topic to a ClickHouse table.

### License {#license}

The Kafka Connector Sink is distributed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)

### Requirements for the environment {#requirements-for-the-environment}

The [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) framework v2.7 or later should be installed in the environment.

### Version compatibility matrix {#version-compatibility-matrix}

| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
|----------------------------------|--------------------|---------------|--------------------|
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1              |

### Main features {#main-features}

- Shipped with out-of-the-box exactly-once semantics. It's powered by a new ClickHouse core feature named [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) (used as a state store by the connector) and allows for minimalistic architecture.
- Support for 3rd-party state stores: Currently defaults to In-memory but can use KeeperMap (Redis to be added soon).
- Core integration: Built, maintained, and supported by ClickHouse.
- Tested continuously against [ClickHouse Cloud](https://clickhouse.com/cloud).
- Data inserts with a declared schema and schemaless.
- Support for all data types of ClickHouse.

### Installation instructions {#installation-instructions}

#### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />

#### General installation instructions {#general-installation-instructions}

The connector is distributed as a single JAR file containing all the class files necessary to run the plugin.

To install the plugin, follow these steps:

- Download a zip archive containing the Connector JAR file from the [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) page of ClickHouse Kafka Connect Sink repository.
- Extract the ZIP file content and copy it to the desired location.
- Add a path with the plugin director to [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) configuration in your Connect properties file to allow Confluent Platform to find the plugin.
- Provide a topic name, ClickHouse instance hostname, and password in config.

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

- Restart the Confluent Platform.
- If you use Confluent Platform, log into Confluent Control Center UI to verify the ClickHouse Sink is available in the list of available connectors.

### Configuration options {#configuration-options}

To connect the ClickHouse Sink to the ClickHouse server, you need to provide:

- connection details: hostname (**required**) and port (optional)
- user credentials: password (**required**) and username (optional)
- connector class: `com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**required**)
- topics or topics.regex: the Kafka topics to poll - topic names must match table names (**required**)
- key and value converters: set based on the type of data on your topic. Required if not already defined in worker config.

The full table of configuration options:

| Property Name                                   | Description                                                                                                                                                                                                                        | Default Value                                            |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `hostname` (Required)                           | The hostname or IP address of the server                                                                                                                                                                                           | N/A                                                      |
| `port`                                          | The ClickHouse port - default is 8443 (for HTTPS in the cloud), but for HTTP (the default for self-hosted) it should be 8123                                                                                                       | `8443`                                                   |
| `ssl`                                           | Enable ssl connection to ClickHouse                                                                                                                                                                                                | `true`                                                   |
| `jdbcConnectionProperties`                      | Connection properties when connecting to Clickhouse. Must start with `?` and joined by `&` between `param=value`                                                                                                                   | `""`                                                     |
| `username`                                      | ClickHouse database username                                                                                                                                                                                                       | `default`                                                |
| `password` (Required)                           | ClickHouse database password                                                                                                                                                                                                       | N/A                                                      |
| `database`                                      | ClickHouse database name                                                                                                                                                                                                           | `default`                                                |
| `connector.class` (Required)                    | Connector Class(explicit set and keep as the default value)                                                                                                                                                                        | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                     | The number of Connector Tasks                                                                                                                                                                                                      | `"1"`                                                    |
| `errors.retry.timeout`                          | ClickHouse JDBC Retry Timeout                                                                                                                                                                                                      | `"60"`                                                   |
| `exactlyOnce`                                   | Exactly Once Enabled                                                                                                                                                                                                               | `"false"`                                                |
| `topics` (Required)                             | The Kafka topics to poll - topic names must match table names                                                                                                                                                                      | `""`                                                     |
| `key.converter` (Required* - See Description)   | Set according to the types of your keys. Required here if you are passing keys (and not defined in worker config).                                                                                                                 | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Required* - See Description) | Set based on the type of data on your topic. Supported: - JSON, String, Avro or Protobuf formats. Required here if not defined in worker config.                                                                                   | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                | Connector Value Converter Schema Support                                                                                                                                                                                           | `"false"`                                                |
| `errors.tolerance`                              | Connector Error Tolerance. Supported: none, all                                                                                                                                                                                    | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`             | If set (with errors.tolerance=all), a DLQ will be used for failed batches (see [Troubleshooting](#troubleshooting))                                                                                                                | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable` | Adds additional headers for the DLQ                                                                                                                                                                                                | `""`                                                     |
| `clickhouseSettings`                            | Comma-separated list of ClickHouse settings (e.g. "insert_quorum=2, etc...")                                                                                                                                                       | `""`                                                     |
| `topic2TableMap`                                | Comma-separated list that maps topic names to table names (e.g. "topic1=table1, topic2=table2, etc...")                                                                                                                            | `""`                                                     |
| `tableRefreshInterval`                          | Time (in seconds) to refresh the table definition cache                                                                                                                                                                            | `0`                                                      |
| `keeperOnCluster`                               | Allows configuration of ON CLUSTER parameter for self-hosted instances (e.g. `ON CLUSTER clusterNameInConfigFileDefinition`) for exactly-once connect_state table (see [Distributed DDL Queries](/sql-reference/distributed-ddl)   | `""`                                                     |
| `bypassRowBinary`                               | Allows disabling use of RowBinary and RowBinaryWithDefaults for Schema-based data (Avro, Protobuf, etc.) - should only be used when data will have missing columns, and Nullable/Default are unacceptable                          | `"false"`                                                |
| `dateTimeFormats`                               | Date time formats for parsing DateTime64 schema fields, separated by `;` (e.g. `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`).                                                              | `""`                                                     |
| `tolerateStateMismatch`                         | Allows the connector to drop records "earlier" than the current offset stored AFTER_PROCESSING (e.g. if offset 5 is sent, and offset 250 was the last recorded offset)                                                             | `"false"`                                                |
| `ignorePartitionsWhenBatching`                  | Will ignore partition when collecting messages for insert (though only if `exactlyOnce` is `false`). Performance Note: The more connector tasks, the fewer kafka partitions assigned per task - this can mean diminishing returns. | `"false"`                                                |

### Target tables {#target-tables}

ClickHouse Connect Sink reads messages from Kafka topics and writes them to appropriate tables. ClickHouse Connect Sink writes data into existing tables. Please, make sure a target table with an appropriate schema was created in ClickHouse before starting to insert data into it.

Each topic requires a dedicated target table in ClickHouse. The target table name must match the source topic name.

### Pre-processing {#pre-processing}

If you need to transform outbound messages before they are sent to ClickHouse Kafka Connect
Sink, use [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html).

### Supported data types {#supported-data-types}

**With a schema declared:**

| Kafka Connect Type                      | ClickHouse Type       | Supported | Primitive |
| --------------------------------------- |-----------------------| --------- | --------- |
| STRING                                  | String                | ✅        | Yes       |
| STRING                                  | JSON. See below (1)              | ✅        | Yes       |
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
| STRUCT                                  | JSON. See below (1), (2)          | ✅        | No        |
| BYTES                                   | String                | ✅        | No        |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64    | ✅        | No        |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32        | ✅        | No        |
| org.apache.kafka.connect.data.Decimal   | Decimal               | ✅        | No        |

- (1) - JSON is supported only when ClickHouse settings has `input_format_binary_read_json_as_string=1`. This works only for RowBinary format family and the setting affects all columns in the insert request so they all should be a string. Connector will convert STRUCT to a JSON string in this case. 

- (2) - When struct has unions like `oneof` then converter should be configured to NOT add prefix/suffix to a field names. There is `generate.index.for.unions=false` [setting for `ProtobufConverter`](https://docs.confluent.io/platform/current/schema-registry/connect.html#protobuf).  

**Without a schema declared:**

A record is converted into JSON and sent to ClickHouse as a value in [JSONEachRow](/interfaces/formats/JSONEachRow) format.

### Configuration recipes {#configuration-recipes}

These are some common configuration recipes to get you started quickly.

#### Basic configuration {#basic-configuration}

The most basic configuration to get you started - it assumes you're running Kafka Connect in distributed mode and have a ClickHouse server running on `localhost:8443` with SSL enabled, data is in schemaless JSON.

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

The connector can consume data from multiple topics

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

Please note: if you encounter issues with missing classes, not every environment comes with the protobuf converter and you may need an alternate release of the jar bundled with dependencies.

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

The connector supports the String Converter in different ClickHouse formats: [JSON](/interfaces/formats/JSONEachRow), [CSV](/interfaces/formats/CSV), and [TSV](/interfaces/formats/TabSeparated).

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

Logging is automatically provided by Kafka Connect Platform.
The logging destination and format might be configured via Kafka connect [configuration file](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file).

If using the Confluent Platform, the logs can be seen by running a CLI command:

```bash
confluent local services connect log
```

For additional details check out the official [tutorial](https://docs.confluent.io/platform/current/connect/logging.html).

### Monitoring {#monitoring}

ClickHouse Kafka Connect reports runtime metrics via [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html). JMX is enabled in Kafka Connector by default.

ClickHouse Connect `MBeanName`:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect reports the following metrics:

| Name                 | Type | Description                                                                             |
|----------------------|------|-----------------------------------------------------------------------------------------|
| `receivedRecords`      | long | The total number of records received.                                                   |
| `recordProcessingTime` | long | Total time in nanoseconds spent grouping and converting records to a unified structure. |
| `taskProcessingTime`   | long | Total time in nanoseconds spent processing and inserting data into ClickHouse.          |

### Limitations {#limitations}

- Deletes are not supported.
- Batch size is inherited from the Kafka Consumer properties.
- When using KeeperMap for exactly-once and the offset is changed or re-wound, you need to delete the content from KeeperMap for that specific topic. (See troubleshooting guide below for more details)

### Performance tuning and throughput optimization {#tuning-performance}

This section covers performance tuning strategies for the ClickHouse Kafka Connect Sink. Performance tuning is essential when dealing with high-throughput use cases or when you need to optimize resource utilization and minimize lag.

#### When is performance tuning needed? {#when-is-performance-tuning-needed}

Performance tuning is typically required in the following scenarios:

- **High-throughput workloads**: When processing millions of events per second from Kafka topics
- **Consumer lag**: When your connector can't keep up with the rate of data production, causing increasing lag
- **Resource constraints**: When you need to optimize CPU, memory, or network usage
- **Multiple topics**: When consuming from multiple high-volume topics simultaneously
- **Small message sizes**: When dealing with many small messages that would benefit from server-side batching

Performance tuning is **NOT typically needed** when:

- You're processing low to moderate volumes (< 10,000 messages/second)
- Consumer lag is stable and acceptable for your use case
- Default connector settings already meet your throughput requirements
- Your ClickHouse cluster can easily handle the incoming load

#### Understanding the data flow {#understanding-the-data-flow}

Before tuning, it's important to understand how data flows through the connector:

1. **Kafka Connect Framework** fetches messages from Kafka topics in the background
2. **Connector polls** for messages from the framework's internal buffer
3. **Connector batches** messages based on poll size
4. **ClickHouse receives** the batched insert via HTTP/S
5. **ClickHouse processes** the insert (synchronously or asynchronously)

Performance can be optimized at each of these stages.

#### Kafka Connect batch size tuning {#connect-fetch-vs-connector-poll}

The first level of optimization is controlling how much data the connector receives per batch from Kafka.

##### Fetch settings {#fetch-settings}

Kafka Connect (the framework) fetches messages from Kafka topics in the background, independent of the connector:

- **`fetch.min.bytes`**: Minimum amount of data before the framework passes values to the connector (default: 1 byte)
- **`fetch.max.bytes`**: Maximum amount of data to fetch in a single request (default: 52428800 / 50 MB)
- **`fetch.max.wait.ms`**: Maximum time to wait before returning data if `fetch.min.bytes` is not met (default: 500 ms)

##### Poll settings {#poll-settings}

The connector polls for messages from the framework's buffer:

- **`max.poll.records`**: Maximum number of records returned in a single poll (default: 500)
- **`max.partition.fetch.bytes`**: Maximum amount of data per partition (default: 1048576 / 1 MB)

##### Recommended settings for high throughput {#recommended-batch-settings}

For optimal performance with ClickHouse, aim for larger batches:

```properties
# Increase the number of records per poll
consumer.max.poll.records=5000

# Increase the partition fetch size (5 MB)
consumer.max.partition.fetch.bytes=5242880

# Optional: Increase minimum fetch size to wait for more data (1 MB)
consumer.fetch.min.bytes=1048576

# Optional: Reduce wait time if latency is critical
consumer.fetch.max.wait.ms=300
```

**Important**: Kafka Connect fetch settings represent compressed data, while ClickHouse receives uncompressed data. Balance these settings based on your compression ratio.

**Trade-offs**:
- **Larger batches** = Better ClickHouse ingestion performance, fewer parts, lower overhead
- **Larger batches** = Higher memory usage, potential increased end-to-end latency
- **Too large batches** = Risk of timeouts, OutOfMemory errors, or exceeding `max.poll.interval.ms`

More details: [Confluent documentation](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration) | [Kafka documentation](https://kafka.apache.org/documentation/#consumerconfigs)

#### Asynchronous inserts {#asynchronous-inserts}

Asynchronous inserts are a powerful feature when the connector sends relatively small batches or when you want to further optimize ingestion by shifting batching responsibility to ClickHouse.

##### When to use async inserts {#when-to-use-async-inserts}

Consider enabling async inserts when:

- **Many small batches**: Your connector sends frequent small batches (< 1000 rows per batch)
- **High concurrency**: Multiple connector tasks are writing to the same table
- **Distributed deployment**: Running many connector instances across different hosts
- **Part creation overhead**: You're experiencing "too many parts" errors
- **Mixed workload**: Combining real-time ingestion with query workloads

Do **NOT** use async inserts when:

- You're already sending large batches (> 10,000 rows per batch) with controlled frequency
- You require immediate data visibility (queries must see data instantly)
- Exactly-once semantics with `wait_for_async_insert=0` conflicts with your requirements
- Your use case can benefit from client-side batching improvements instead

##### How async inserts work {#how-async-inserts-work}

With asynchronous inserts enabled, ClickHouse:

1. Receives the insert query from the connector
2. Writes data to an in-memory buffer (instead of immediately to disk)
3. Returns success to the connector (if `wait_for_async_insert=0`)
4. Flushes the buffer to disk when one of these conditions is met:
   - Buffer reaches `async_insert_max_data_size` (default: 10 MB)
   - `async_insert_busy_timeout_ms` milliseconds elapsed since first insert (default: 1000 ms)
   - Maximum number of queries accumulated (`async_insert_max_query_number`, default: 100)

This significantly reduces the number of parts created and improves overall throughput.

##### Enabling async inserts {#enabling-async-inserts}

Add async insert settings to the `clickhouseSettings` configuration parameter:

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```

**Key settings**:

- **`async_insert=1`**: Enable asynchronous inserts
- **`wait_for_async_insert=1`** (recommended): Connector waits for data to be flushed to ClickHouse storage before acknowledging. Provides delivery guarantees.
- **`wait_for_async_insert=0`**: Connector acknowledges immediately after buffering. Better performance but data may be lost on server crash before flush.

##### Tuning async insert behavior {#tuning-async-inserts}

You can fine-tune the async insert flush behavior:

```json
"clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=10485760,async_insert_busy_timeout_ms=1000"
```

Common tuning parameters:

- **`async_insert_max_data_size`** (default: 10485760 / 10 MB): Maximum buffer size before flush
- **`async_insert_busy_timeout_ms`** (default: 1000): Maximum time (ms) before flush
- **`async_insert_stale_timeout_ms`** (default: 0): Time (ms) since last insert before flush
- **`async_insert_max_query_number`** (default: 100): Maximum queries before flush

**Trade-offs**:

- **Benefits**: Fewer parts, better merge performance, lower CPU overhead, improved throughput under high concurrency
- **Considerations**: Data not immediately queryable, slightly increased end-to-end latency
- **Risks**: Data loss on server crash if `wait_for_async_insert=0`, potential memory pressure with large buffers

##### Async inserts with exactly-once semantics {#async-inserts-with-exactly-once}

When using `exactlyOnce=true` with async inserts:

```json
{
  "config": {
    "exactlyOnce": "true",
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```

**Important**: Always use `wait_for_async_insert=1` with exactly-once to ensure offset commits happen only after data is persisted.

For more information about async inserts, see the [ClickHouse async inserts documentation](/best-practices/selecting-an-insert-strategy#asynchronous-inserts).

#### Connector parallelism {#connector-parallelism}

Increase parallelism to improve throughput:

##### Tasks per connector {#tasks-per-connector}

```json
"tasks.max": "4"
```

Each task processes a subset of topic partitions. More tasks = more parallelism, but:

- Maximum effective tasks = number of topic partitions
- Each task maintains its own connection to ClickHouse
- More tasks = higher overhead and potential resource contention

**Recommendation**: Start with `tasks.max` equal to the number of topic partitions, then adjust based on CPU and throughput metrics.

##### Ignoring partitions when batching {#ignoring-partitions}

By default, the connector batches messages per partition. For higher throughput, you can batch across partitions:

```json
"ignorePartitionsWhenBatching": "true"
```

** Warning**: Only use when `exactlyOnce=false`. This setting can improve throughput by creating larger batches but loses per-partition ordering guarantees.

#### Multiple high throughput topics {#multiple-high-throughput-topics}

If your connector is configured to subscribe to multiple topics, you're using `topic2TableMap` to map topics to tables, and you're experiencing a bottleneck at insertion resulting in consumer lag, consider creating one connector per topic instead. 

The main reason why this happens is that currently batches are inserted into every table [serially](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100).

**Recommendation**: For multiple high-volume topics, deploy one connector instance per topic to maximize parallel insert throughput.

#### ClickHouse table engine considerations {#table-engine-considerations}

Choose the appropriate ClickHouse table engine for your use case:

- **`MergeTree`**: Best for most use cases, balances query and insert performance
- **`ReplicatedMergeTree`**: Required for high availability, adds replication overhead
- **`*MergeTree` with proper `ORDER BY`**: Optimize for your query patterns

**Settings to consider**:

```sql
CREATE TABLE my_table (...)
ENGINE = MergeTree()
ORDER BY (timestamp, id)
SETTINGS 
    -- Increase max insert threads for parallel part writing
    max_insert_threads = 4,
    -- Allow inserts with quorum for reliability (ReplicatedMergeTree)
    insert_quorum = 2
```

For connector-level insert settings:

```json
"clickhouseSettings": "insert_quorum=2,insert_quorum_timeout=60000"
```

#### Connection pooling and timeouts {#connection-pooling}

The connector maintains HTTP connections to ClickHouse. Adjust timeouts for high-latency networks:

```json
"clickhouseSettings": "socket_timeout=300000,connection_timeout=30000"
```

- **`socket_timeout`** (default: 30000 ms): Maximum time for read operations
- **`connection_timeout`** (default: 10000 ms): Maximum time to establish connection

Increase these values if you experience timeout errors with large batches.

#### Monitoring and troubleshooting performance {#monitoring-performance}

Monitor these key metrics:

1. **Consumer lag**: Use Kafka monitoring tools to track lag per partition
2. **Connector metrics**: Monitor `receivedRecords`, `recordProcessingTime`, `taskProcessingTime` via JMX (see [Monitoring](#monitoring))
3. **ClickHouse metrics**:
   - `system.asynchronous_inserts`: Monitor async insert buffer usage
   - `system.parts`: Monitor part count to detect merge issues
   - `system.merges`: Monitor active merges
   - `system.events`: Track `InsertedRows`, `InsertedBytes`, `FailedInsertQuery`

**Common performance issues**:

| Symptom | Possible Cause | Solution |
|---------|----------------|----------|
| High consumer lag | Batches too small | Increase `max.poll.records`, enable async inserts |
| "Too many parts" errors | Small frequent inserts | Enable async inserts, increase batch size |
| Timeout errors | Large batch size, slow network | Reduce batch size, increase `socket_timeout`, check network |
| High CPU usage | Too many small parts | Enable async inserts, increase merge settings |
| OutOfMemory errors | Batch size too large | Reduce `max.poll.records`, `max.partition.fetch.bytes` |
| Uneven task load | Uneven partition distribution | Rebalance partitions or adjust `tasks.max` |

#### Best practices summary {#performance-best-practices}

1. **Start with defaults**, then measure and tune based on actual performance
2. **Prefer larger batches**: Aim for 10,000-100,000 rows per insert when possible
3. **Use async inserts** when sending many small batches or under high concurrency
4. **Always use `wait_for_async_insert=1`** with exactly-once semantics
5. **Scale horizontally**: Increase `tasks.max` up to the number of partitions
6. **One connector per high-volume topic** for maximum throughput
7. **Monitor continuously**: Track consumer lag, part count, and merge activity
8. **Test thoroughly**: Always test configuration changes under realistic load before production deployment

#### Example: High-throughput configuration {#example-high-throughput}

Here's a complete example optimized for high throughput:

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

**This configuration**:
- Processes up to 10,000 records per poll
- Batches across partitions for larger inserts
- Uses async inserts with 16 MB buffer
- Runs 8 parallel tasks (match your partition count)
- Optimized for throughput over strict ordering

### Troubleshooting {#troubleshooting}

#### "State mismatch for topic `[someTopic]` partition `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

This happens when the offset stored in KeeperMap is different from the offset stored in Kafka, usually when a topic has been deleted
or the offset has been manually adjusted.
To fix this, you would need to delete the old values stored for that given topic + partition.

**NOTE: This adjustment may have exactly-once implications.**

#### "What errors will the connector retry?" {#what-errors-will-the-connector-retry}

Right now the focus is on identifying errors that are transient and can be retried, including:

- `ClickHouseException` - This is a generic exception that can be thrown by ClickHouse.
  It is usually thrown when the server is overloaded and the following error codes are considered particularly transient:
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
- `SocketTimeoutException` - This is thrown when the socket times out.
- `UnknownHostException` - This is thrown when the host cannot be resolved.
- `IOException` - This is thrown when there is a problem with the network.

#### "All my data is blank/zeroes" {#all-my-data-is-blankzeroes}
Likely the fields in your data don't match the fields in the table - this is especially common with CDC (and the Debezium format).
One common solution is to add the flatten transformation to your connector configuration:

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

This will transform your data from a nested JSON to a flattened JSON (using `_` as a delimiter). Fields in the table would then follow the "field1_field2_field3" format (i.e. "before_id", "after_id", etc.).

#### "I want to use my Kafka keys in ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Kafka keys are not stored in the value field by default, but you can use the `KeyToValue` transformation to move the key to the value field (under a new `_key` field name):

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
