---
sidebar_label: ClickHouse Kafka Connect Sink
sidebar_position: 2
slug: /en/integrations/kafka/clickhouse-kafka-connect-sink
description: The official Kafka connector from ClickHouse.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink
:::note
If you need any help, please [file an issue in the repository](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) or raise a question in [ClickHouse public Slack](https://clickhouse.com/slack).
:::
**ClickHouse Kafka Connect Sink** is the Kafka connector delivering data from a Kafka topic to a ClickHouse table.

### License
The Kafka Connector Sink is distributed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)

### Requirements for the environment
The [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) framework v2.7 or later should be installed in the environment.

### Version compatibility matrix
| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
| -------------------------------- | ------------------ | ------------- | ------------------ |
| 1.0.0                            | > 22.5             | > 2.7         | > 6.1              |

### Main Features
- Shipped with out-of-the-box exactly-once semantics. It's powered by a new ClickHouse core feature named [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) (used as a state store by the connector) and allows for minimalistic architecture.
- Support for 3rd-party state stores: Currently defaults to In-memory but can use KeeperMap (Redis to be added soon).
- Core integration: Built, maintained, and supported by ClickHouse.
- Tested continuously against [ClickHouse Cloud](https://clickhouse.com/cloud).
- Data inserts with a declared schema and schemaless.
- Support for most major data types of ClickHouse (more to be added soon)

### Installation instructions

#### Gather your connection details
<ConnectionDetails />

#### General Installation Instructions
The connector is distributed as a single uber JAR file containing all the class files necessary to run the plugin.

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

### Configuration options
To connect the ClickHouse Sink to the ClickHouse server, you need to provide:
- connection details: hostname (**required**) and port (optional)
- user credentials: password (**required**) and username (optional)

The full table of configuration options:

| Name | Required | Type | Description | Default value |
| ---- | -------- | ---- | ----------- | ------- |
| hostname | **required** | string | The hostname or IP address of the server| N/A |
| port | optional | integer | Port the server listens to | 8443 |
| username | optional | string | The name of the user on whose behalf to connect to the server | default |
| password | **required** | string | Password for the specified user | N/A |
| database | optional | string | The name of the database to write to | default |
| ssl | optional | boolean | Enable TLS for network connections | true |
| exactlyOnce | optional | boolean | Enable exactly-once processing guarantees.<br/>When **true**, stores processing state in KeeperMap.<br/>When **false**, stores processing state in-memory.  | false |
| timeoutSeconds | optional | integer | Connection timeout in seconds. | 30 |
| retryCount | optional | integer | Maximum number of retries for a query. No delay between retries. | 3 |


### Target Tables
ClickHouse Connect Sink reads messages from Kafka topics and writes them to appropriate tables. ClickHouse Connect Sink writes data into existing tables. Please, make sure a target table with an appropriate schema was created in ClickHouse before starting to insert data into it.

Each topic requires a dedicated target table in ClickHouse. The target table name must match the source topic name.

### Pre-processing
If you need to transform outbound messages before they are sent to ClickHouse Kafka Connect
Sink, use [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html).


### Supported Data types
**With a schema declared:**

| Kafka Connect Type                      | ClickHouse Type          | Supported | Primitive |
|-----------------------------------------| ------------------------ | --------- | --------- |
| STRING                                  | String                   | ✅        | Yes       |
| INT8                                    | Int8                     | ✅        | Yes       |
| INT16                                   | Int16                    | ✅        | Yes       |
| INT32                                   | Int32                    | ✅        | Yes       |
| INT64                                   | Int64                    | ✅        | Yes       |
| FLOAT32                                 | Float32                  | ✅        | Yes       |
| FLOAT64                                 | Float64                  | ✅        | Yes       |
| BOOLEAN                                 | Boolean                  | ✅        | Yes       |
| ARRAY                                   | Array(Primitive)         | ✅        | No        |
| MAP                                     | Map(Primitive, Primitive)| ✅        | No        |
| STRUCT                                  | N/A                      | ❌        | No        |
| BYTES                                   | N/A                      | ❌        | No        |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64       | ✅        | No        |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32           | ✅        | No        |

**Without a schema declared:**

A record is converted into JSON and sent to ClickHouse as a value in [JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow) format.

### Configuration Properties
| Property Name | Default Value | Description |
|---------------|---------------|-------------|
| `hostname` | N/A| The ClickHouse hostname to connect to |
| `port` | `8443` |  The ClickHouse port - default is the SSL value |
| `ssl` | `true` |  Enable ssl connection to ClickHouse |
| `username` | `default` |  ClickHouse database username |
| `password` | `""` | ClickHouse database password |
| `database` | `default` | ClickHouse database name |
| `connector.class` | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` | Connector Class(set and keep as the default) |
| `tasks.max` | `"1"` | The number of Connector Tasks |
| `errors.retry.timeout` |`"60"` | ClickHouse JDBC Retry Timeout |
| `exactlyOnce` | `"false"` | Exactly Once Enabled |
| `topics` | `""` | The Kafka topics to poll - topic names must match table names |
| `key.converter` | `"org.apache.kafka.connect.storage.StringConverter"` | Set according to the types of your keys. |
| `value.converter` | `"org.apache.kafka.connect.json.JsonConverter"` | Set based on the type of data on your topic. This data must have a supported schema - JSON, Avro or Protobuf formats. |
| `value.converter.schemas.enable` | `"false"` | Connector Value Converter Schema Support |
| `errors.tolerance` | `"none"` | Connector Error Tolerance |
| `errors.deadletterqueue.topic.name` | `""` | If set, a DLQ will be used for failed batches |
| `errors.deadletterqueue.context.headers.enable` | `""` | Adds additional headers for the DLQ |
| `clickhouseSettings` | `""` |  Allows configuration of ClickHouse settings, using a comma seperated list (e.g. "insert_quorum=2, etc...") |

### Configuration Recipes
These are some common configuration recipes to get you started quickly.
#### Basic Configuration
The most basic configuration to get you started - it assumes you're running Kafka Connect in distributed mode and have a ClickHouse server running on `localhost:8443` with SSL enabled, data is in schemaless JSON.
```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    "tasks.max": "1",
    "database": "default",
    "errors.retry.timeout": "60",
    "exactlyOnce": "false",
    "hostname": "localhost",
    "port": "8443",
    "ssl": "true",
    "username": "default",
    "password": "<PASSWORD>",
    "topics": "<TOPIC_NAME>",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "false",
    "clickhouseSettings": ""
  }
}
```

#### Basic Configuration with Multiple Topics
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

#### Basic Configuration with DLQ
```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "errors.deadletterqueue.topic.name": "<DLQ_TOPIC>",
    "errors.deadletterqueue.context.headers.enable": "true",
  }
}
```
#### Using with different data formats
##### Avro Schema Support
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

##### JSON Schema Support
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

### Logging
Logging is automatically provided by Kafka Connect Platform.
The logging destination and format might be configured via Kafka connect [configuration file](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file).

If using the Confluent Platform, the logs can be seen by running a CLI command:

```bash
confluent local services connect log
```

For additional details check out the official [tutorial](https://docs.confluent.io/platform/current/connect/logging.html).

### Monitoring

ClickHouse Kafka Connect reports runtime metrics via [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html). JMX is enabled in Kafka Connector by default.

ClickHouse Connect MBeanName:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect reports the following metrics:

| Name                 | Type | Description              |
| -------------------- | ---- | ------------------------ |
| receivedRecords      | long | The total number of records received. |
| recordProcessingTime | long | Total time in nanoseconds spent grouping and converting records to a unified structure. |
| taskProcessingTime   | long | Total time in nanoseconds spent processing and inserting data into ClickHouse. |

### Limitations
- Deletes are not supported.
- Batch size is inherited from the Kafka Consumer properties.
- When using KeeperMap for exactly-once and the offset is changed or rewound, you need to delete the content from KeeperMap for that specific topic. (See troubleshooting guide below for more details)


### Troubleshooting
#### "I would like to adjust the batch size for the sink connector"
The batch size is inherited from the Kafka Consumer properties. You can adjust the batch size by setting the following properties
(and calculating the appropriate values):
```properties
consumer.max.poll.records=[NUMBER OF RECORDS]
consumer.max.partition.fetch.bytes=[NUMBER OF RECORDS * RECORD SIZE IN BYTES]
```
More details can be found in the [Confluent documentation](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration)
or in the [Kafka documentation](https://kafka.apache.org/documentation/#consumerconfigs).


#### "State mismatch for topic \[someTopic\] partition \[0\]"
This happens when the offset stored in KeeperMap is different from the offset stored in Kafka, usually when a topic has been deleted
or the offset has been manually adjusted.
To fix this, you would need to delete the old values stored for that given topic + partition.

**NOTE: This adjustment may have exactly-once implications.**

#### "What errors will the connector retry?"
Right now the focus is on identifying errors that are transient and can be retried, including:
- `ClickHouseException` - This is a generic exception that can be thrown by ClickHouse. 
It is usually thrown when the server is overloaded and the following error codes are considered particularly transient:
  - 159 - TIMEOUT_EXCEEDED 
  - 164 - READONLY
  - 203 - NO_FREE_CONNECTION
  - 209 - SOCKET_TIMEOUT
  - 210 - NETWORK_ERROR
  - 425 - SYSTEM_ERROR
- `SocketTimeoutException` - This is thrown when the socket times out.
- `UnknownHostException` - This is thrown when the host cannot be resolved.
