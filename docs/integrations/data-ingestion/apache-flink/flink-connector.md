---
sidebar_label: 'Apache Flink'
sidebar_position: 1
slug: /integrations/apache-flink
description: 'Introduction to Apache Flink with ClickHouse'
keywords: ['clickhouse', 'Apache Flink', 'migrating', 'data', 'stream processing']
title: 'Flink Connector'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Flink Connector

<ClickHouseSupportedBadge/>

This is the official Apache Flink Sink Connector supported by ClickHouse. It is built using Flink's [AsyncSinkBase](https://cwiki.apache.org/confluence/display/FLINK/FLIP-171%3A+Async+Sink) and the official ClickHouse [java client](https://github.com/ClickHouse/clickhouse-java).

The connector supports Apache Flink's DataStream API. Table API support is [planned for a future release](https://github.com/ClickHouse/flink-connector-clickhouse/issues/42).

## Requirements {#requirements}

- Java 11+ (for Flink 1.17+) or 17+ (for Flink 2.0+)
- Apache Flink 1.17+

## Flink Version Compatibility Matrix {#flink-compatibility-matrix}

The connector is split into two artifacts to support both Flink 1.17+ and Flink 2.0+. Choose the artifact that matches your desired Flink version:

| Flink Version | Artifact                         | ClickHouse Java Client Version | Required Java |
|---------------|----------------------------------|--------------------------------|---------------|
| latest        | flink-connector-clickhouse-2.0.0 | 0.9.5                          | Java 17+      |
| 2.0.1         | flink-connector-clickhouse-2.0.0 | 0.9.5                          | Java 17+      |
| 2.0.0         | flink-connector-clickhouse-2.0.0 | 0.9.5                          | Java 17+      |
| 1.20.2        | flink-connector-clickhouse-1.17  | 0.9.5                          | Java 11+      |
| 1.19.3        | flink-connector-clickhouse-1.17  | 0.9.5                          | Java 11+      |
| 1.18.1        | flink-connector-clickhouse-1.17  | 0.9.5                          | Java 11+      |
| 1.17.2        | flink-connector-clickhouse-1.17  | 0.9.5                          | Java 11+      |

_Note: the connector has not been tested against Flink versions earlier than 1.17.2

## Installation & Setup {#installation--setup}
### Import as a Dependency {#import-as-a-dependency}
#### For Flink 2.0+ {#flink-2}

<Tabs>
<TabItem value="Maven" label="Maven" default>

```maven
<dependency>
    <groupId>com.clickhouse.flink</groupId>
    <artifactId>flink-connector-clickhouse-2.0.0</artifactId>
    <version>{{ stable_version }}</version>
    <classifier>all</classifier>
</dependency>
```
</TabItem>
<TabItem value="Gradle" label="Gradle">

```gradle
dependencies {
    implementation("com.clickhouse.flink:flink-connector-clickhouse-2.0.0:{{ stable_version }}")
}
```
</TabItem>
<TabItem value="SBT" label="SBT">

```sbt
libraryDependencies += "com.clickhouse.flink" % "flink-connector-clickhouse-2.0.0" % {{ stable_version }} classifier "all"
```

</TabItem>
</Tabs>

#### For Flink 1.17+ {#flink-117}
<Tabs>
<TabItem value="Maven" label="Maven" default>

```maven
<dependency>
    <groupId>com.clickhouse.flink</groupId>
    <artifactId>flink-connector-clickhouse-1.17</artifactId>
    <version>{{ stable_version }}</version>
    <classifier>all</classifier>
</dependency>
```
</TabItem>
<TabItem value="Gradle" label="Gradle">

```gradle
dependencies {
    implementation("com.clickhouse.flink:flink-connector-clickhouse-1.17:{{ stable_version }}")
}
```
</TabItem>
<TabItem value="SBT" label="SBT">

```sbt
libraryDependencies += "com.clickhouse.flink" % "flink-connector-clickhouse-1.17" % {{ stable_version }} classifier "all"
```

</TabItem>
</Tabs>

### Download the binary {#download-the-binary}

The name pattern of the binary JAR is:

```bash
flink-connector-clickhouse-${flink_version}-${stable_version}-all.jar
```

where:
- `flink_version` is one of `2.0.0` or `1.17`
- `stable_version` is a [stable artifact release version](https://github.com/ClickHouse/flink-connector-clickhouse/releases)

You can find all available released JAR files in the [Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/flink/).

## Using the DataStream API {#using-the-datastream-api}
### Snippet {#datastream-snippet}

Let's say you want to insert raw CSV data into ClickHouse:

<Tabs groupId="raw_csv_java_example">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
    // Configure ClickHouseClient
    ClickHouseClientConfig clickHouseClientConfig = new ClickHouseClientConfig(url, username, password, database, tableName);

    // Create an ElementConverter
    ElementConverter<String, ClickHousePayload> convertorString = new ClickHouseConvertor<>(String.class);

    // Create the sink and set the format using `setClickHouseFormat`
    ClickHouseAsyncSink<String> csvSink = new ClickHouseAsyncSink<>(
            convertorString,
            MAX_BATCH_SIZE,
            MAX_IN_FLIGHT_REQUESTS,
            MAX_BUFFERED_REQUESTS,
            MAX_BATCH_SIZE_IN_BYTES,
            MAX_TIME_IN_BUFFER_MS,
            MAX_RECORD_SIZE_IN_BYTES,
            clickHouseClientConfig
    );

    csvSink.setClickHouseFormat(ClickHouseFormat.CSV);

    // Finally, connect your DataStream to the sink.
    final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

    Path csvFilePath = new Path(fileFullName);
    FileSource<String> csvSource = FileSource
            .forRecordStreamFormat(new TextLineInputFormat(), csvFilePath)
            .build();

    env.fromSource(
            csvSource,
            WatermarkStrategy.noWatermarks(),
            "GzipCsvSource"
    ).sinkTo(csvSink);
}
```

</TabItem>
</Tabs>

More examples and snippets can be found in our tests:
- [flink-connector-clickhouse-1.17](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/flink-connector-clickhouse-1.17/src/test/java/org/apache/flink/connector/clickhouse/sink)
- [flink-connector-clickhouse-2.0.0](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/flink-connector-clickhouse-2.0.0/src/test/java/org/apache/flink/connector/clickhouse/sink)

### Quick Start Example {#datastream-quick-start}

We have created maven-based example for an easy start with the ClickHouse Sink:

- [Flink 1.17+](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/examples/maven/flink-v1.7/covid)
- [Flink 2.0.0+](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/examples/maven/flink-v2/covid)

For more detailed instructions, see the [Example Guide](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/examples/README.md)

### DataStream API Connection Options {#datastream-api-connection-options}
#### Clickhouse Client Options {#client-options}

| Parameters                  | Description                                                                                                                                        | Default Value | Required |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|---------------|----------|
| `url`                       | Fully qualified Clickhouse URL                                                                                                                     | N/A           | Yes      |
| `username`                  | ClickHouse database username                                                                                                                       | N/A           | Yes      |
| `password`                  | ClickHouse database password                                                                                                                       | N/A           | Yes      |
| `database`                  | ClickHouse database name                                                                                                                           | N/A           | Yes      |
| `table`                     | ClickHouse table name                                                                                                                              | N/A           | Yes      |
| `options`                   | Map of Java client configuration options                                                                                                           | Empty map     | No       |
| `serverSettings`            | Map of ClickHouse server session settings                                                                                                          | Empty map     | No       |
| `enableJsonSupportAsString` | ClickHouse server setting to expect a JSON formatted String for the [JSON data type](https://clickhouse.com/docs/sql-reference/data-types/newjson) | true          | No       |

`options` and `serverSettings` should be passed to the client as `Map<String, String>`. An empty map for either will use client or server defaults, respectively.

:::note
All available Java client options are listed in [ClientConfigProperties.java](https://github.com/ClickHouse/clickhouse-java/blob/main/client-v2/src/main/java/com/clickhouse/client/api/ClientConfigProperties.java) and [this documentation page](https://clickhouse.com/docs/integrations/language-clients/java/client#configuration).

All available server session settings are listed in [this documentation page](https://clickhouse.com/docs/operations/settings/settings).
:::

For example:

<Tabs groupId="client_options_example">
<TabItem value="Java" label="Java" default>

```java
Map<String, String> javaClientOptions = Map.of(
    ClientConfigProperties.CA_CERTIFICATE.getKey(), "<my_CA_cert>",
    ClientConfigProperties.SSL_CERTIFICATE.getKey(), "<my_SSL_cert>",
    ClientConfigProperties.CLIENT_NETWORK_BUFFER_SIZE.getKey(), "30000",
    ClientConfigProperties.HTTP_MAX_OPEN_CONNECTIONS.getKey(), "5"
);

ClickHouseClientConfig clickHouseClientConfig = new ClickHouseClientConfig(
    url,
    username,
    password,
    database,
    tableName,
    javaClientOptions,
    Map.of(), // serverSettings
    false // enableJsonSupportAsString
);
```
</TabItem>
</Tabs>

#### Sink Options {#sink-options}

The following options come directly from Flink's `AsyncSinkBase`:

| Parameters             | Description                                                                                                 | Default Value | Required |
|------------------------|-------------------------------------------------------------------------------------------------------------|---------------|----------|
| `maxBatchSize`         | Maximum number of records inserted in a single batch                                                        | N/A           | Yes      |
| `maxInFlightRequests`  | The maximum number of in flight requests allowed before the sink applies backpressure                       | N/A           | Yes      |
| `maxBufferedRequests`  | The maximum number of records that may be buffered in the sink before backpressure is applied               | N/A           | Yes      |
| `maxBatchSizeInBytes`  | The maximum size (in bytes) a batch may become. All batches sent will be smaller than or equal to this size | N/A           | Yes      |
| `maxTimeInBufferMS`    | The maximum time a record may stay in the sink before being flushed                                         | N/A           | Yes      |
| `maxRecordSizeInBytes` | The maximum record size that the sink will accept, records larger than this will be automatically rejected  | N/A           | Yes      |

## Supported data types {#supported-data-types}

The table below provides a quick reference for converting data types when inserting from Flink into ClickHouse.

### Inserting data from Flink into ClickHouse {#inserting-data-from-flink-into-clickhouse}

[//]: # (TODO: add a "Flink SQL Type" column once table api support is added )

| Java Type           | ClickHouse Type   | Supported | Serialize Method              |
|---------------------|-------------------|-----------|-------------------------------| 
| `byte`/`Byte`       | `Int8`            | ✅         | `DataWriter.writeInt8`        |
| `short`/`Short`     | `Int16`           | ✅         | `DataWriter.writeInt16`       |
| `int`/`Integer`     | `Int32`           | ✅         | `DataWriter.writeInt32`       |
| `long`/`Long`       | `Int64`           | ✅         | `DataWriter.writeInt64`       |
| `BigInteger`        | `Int128`          | ✅         | `DataWriter.writeInt128`      |
| `BigInteger`        | `Int256`          | ✅         | `DataWriter.writeInt256`      |
| `short`/`Short`     | `UInt8`           | ✅         | `DataWriter.writeUInt8`       |
| `int`/`Integer`     | `UInt8`           | ✅         | `DataWriter.writeUInt8 `      |
| `int`/`Integer`     | `UInt16`          | ✅         | `DataWriter.writeUInt16`      |
| `long`/`Long`       | `UInt32`          | ✅         | `DataWriter.writeUInt32`      |
| `long`/`Long`       | `UInt64`          | ✅         | `DataWriter.writeUInt64`      |
| `BigInteger`        | `UInt64`          | ✅         | `DataWriter.writeUInt64`      |
| `BigInteger`        | `UInt128`         | ✅         | `DataWriter.writeUInt128`     |
| `BigInteger`        | `UInt256`         | ✅         | `DataWriter.writeUInt256`     |
| `BigDecimal`        | `Decimal`         | ✅         | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal32`       | ✅         | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal64`       | ✅         | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal128`      | ✅         | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal256`      | ✅         | `DataWriter.writeDecimal`     |
| `float`/`Float`     | `Float`           | ✅         | `DataWriter.writeFloat32`     |
| `double`/`Double`   | `Double`          | ✅         | `DataWriter.writeFloat64`     |
| `boolean`/`Boolean` | `Boolean`         | ✅         | `DataWriter.writeBoolean`     |
| `String`            | `String`          | ✅         | `DataWriter.writeString`      |
| `String`            | `FixedString`     | ✅         | `DataWriter.writeFixedString` |
| `LocalDate`         | `Date`            | ✅         | `DataWriter.writeDate`        |
| `LocalDate`         | `Date32`          | ✅         | `DataWriter.writeDate32`      |
| `LocalDateTime`     | `DateTime`        | ✅         | `DataWriter.writeDateTime`    |
| `ZonedDateTime`     | `DateTime`        | ✅         | `DataWriter.writeDateTime`    |
| `LocalDateTime`     | `DateTime64`      | ✅         | `DataWriter.writeDateTime64`  |
| `ZonedDateTime`     | `DateTime64`      | ✅         | `DataWriter.writeDateTime64`  |
| `int`/`Integer`     | `Time`            | ❌         | N/A                           |
| `long`/`Long`       | `Time64`          | ❌         | N/A                           |
| `byte`/`Byte`       | `Enum8`           | ✅         | `DataWriter.writeInt8`        |
| `int`/`Integer`     | `Enum16`          | ✅         | `DataWriter.writeInt16`       |
| `java.util.UUID`    | `UUID`            | ✅         | `DataWriter.writeIntUUID`     |
| `String`            | `JSON`            | ✅         | `DataWriter.writeJSON`        |
| `Array<Type>`       | `Array<Type>`     | ✅         | `DataWriter.writeArray`       |
| `Map<K,V>`          | `Map<K,V>`        | ✅         | `DataWriter.writeMap`         |
| `Tuple<Type,..>`    | `Tuple<T1,T2,..>` | ✅         | `DataWriter.writeTuple`       |
| `Object`            | `Variant`         | ❌         | N/A                           |

Notes:
* A `ZoneId` must be provided when performing date operations.
* [Precision and scale](https://clickhouse.com/docs/sql-reference/data-types/decimal#decimal-value-ranges) must be provided when performing decimal operations.
* In order for ClickHouse to parse a Java String as JSON, you need to enable `enableJsonSupportAsString` in `ClickHouseClientConfig`.

## Metrics {#metrics}

The connector exposes the following additional metrics on top of Flink's existing metrics:

| Metric                                  | Description                                                         | Type      | Status |
|-----------------------------------------|---------------------------------------------------------------------|-----------|--------|
| `numBytesSend`                          | Total number of bytes sent to ClickHouse                            | Counter   | ✅      |
| `numRecordSend`                         | Total number of records sent to ClickHouse                          | Counter   | ✅      |
| `numRequestSubmitted`                   | Total number of requests sent (actual number of flushes performed)  | Counter   | ✅      |
| `numOfDroppedBatches`                   | Total number of batches dropped due to non-retryable failures       | Counter   | ✅      |
| `numOfDroppedRecords`                   | Total number of records dropped due to non-retryable failures       | Counter   | ✅      |
| `totalBatchRetries`                     | Total number of batch retries due to retryable failures             | Counter   | ✅      |
| `writeLatencyHistogram`                 | Histogram of successful write latency distribution (ms)             | Histogram | ✅      |
| `writeFailureLatencyHistogram`          | Histogram of failed write latency distribution (ms)                 | Histogram | ✅      |
| `triggeredByMaxBatchSizeCounter`        | Total number of flushes triggered by reaching `maxBatchSize`        | Counter   | ✅      |
| `triggeredByMaxBatchSizeInBytesCounter` | Total number of flushes triggered by reaching `maxBatchSizeInBytes` | Counter   | ✅      |
| `triggeredByMaxTimeInBufferMSCounter`   | Total number of flushes triggered by reaching `maxTimeInBufferMS`   | Counter   | ✅      |
| `actualRecordsPerBatch`                 | Histogram of actual batch size distribution                         | Histogram | ✅      |
| `actualBytesPerBatch`                   | Histogram of actual bytes per batch distribution                    | Histogram | ✅      |

[//]: # (| actualTimeInBuffer           | Histogram of actual time in buffer before flush distribution       | Histogram | ❌      |)

## Limitations {#limitations}

* The sink currently provides an at-least-once delivery guarantee. Work toward exactly-once semantics is being tracked [here](https://github.com/ClickHouse/flink-connector-clickhouse/issues/106).
* The sink does not yet support a dead-letter queue (DLQ) for buffering unprocessable messages. In the meantime, the connector will stop processing at the first row it is unable to handle. This feature is being tracked [here](https://github.com/ClickHouse/flink-connector-clickhouse/issues/105).
* The sink does not yet support creation via Flink's Table API or Flink SQL. This feature is being tracked [here](https://github.com/ClickHouse/flink-connector-clickhouse/issues/42).

## ClickHouse Version Compatibility and Security {#compatibility-and-security}

- The connector is tested against a range of recent ClickHouse versions, including latest and head, via a daily CI workflow. The tested versions are updated periodically as new ClickHouse releases become active. See [here](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/.github/workflows/tests-nightly.yaml#L15) for the versions the connector is tested against daily.
- See the [ClickHouse security policy](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support) for known security vulnerabilities and how to report a vulnerability.
- We recommend upgrading the connector continuously to not miss security fixes and new improvements.
- If you have an issue with migration, please create a GitHub [issue](https://github.com/ClickHouse/flink-connector-clickhouse/issues) and we will respond!

## Contributing and Support {#contributing-and-support}

If you'd like to contribute to the project or report any issues, we welcome your input!
Visit our [GitHub repository](https://github.com/ClickHouse/flink-connector-clickhouse) to open an issue, suggest
improvements, or submit a pull request.

Contributions are welcome! Please check the [contribution guide](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/CONTRIBUTING.md) in the repository before starting.
Thank you for helping improve the ClickHouse Flink connector!
