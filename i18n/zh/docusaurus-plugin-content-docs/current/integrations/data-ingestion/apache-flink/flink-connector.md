---
sidebar_label: 'Apache Flink'
sidebar_position: 1
slug: /integrations/apache-flink
description: 'Apache Flink 与 ClickHouse 集成简介'
keywords: ['clickhouse', 'Apache Flink', '迁移', '数据', '流处理']
title: 'Flink 连接器'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Flink 连接器 \{#flink-connector\}

<ClickHouseSupportedBadge />

这是 ClickHouse 官方支持的 [Apache Flink Sink Connector](https://github.com/ClickHouse/flink-connector-clickhouse)。它基于 Flink 的 [AsyncSinkBase](https://cwiki.apache.org/confluence/display/FLINK/FLIP-171%3A+Async+Sink) 和 ClickHouse 官方 [Java 客户端](https://github.com/ClickHouse/clickhouse-java) 构建。

该连接器支持 Apache Flink 的 DataStream API。对 Table API 的支持[计划在未来版本中推出](https://github.com/ClickHouse/flink-connector-clickhouse/issues/42)。

<TOCInline toc={toc} />

## 要求 \{#requirements\}

* Java 11+ (用于 Flink 1.17+) 或 17+ (用于 Flink 2.0+) 
* Apache Flink 1.17+

## Flink 版本兼容性矩阵 \{#flink-compatibility-matrix\}

该连接器分为两个制品，以支持 Flink 1.17+ 和 Flink 2.0+。请选择与目标 Flink 版本对应的制品：

| Flink 版本 | 制品                               | ClickHouse Java 客户端版本 | 所需 Java 版本 |
| -------- | -------------------------------- | --------------------- | ---------- |
| latest   | flink-connector-clickhouse-2.0.0 | 0.9.5                 | Java 17+   |
| 2.0.1    | flink-connector-clickhouse-2.0.0 | 0.9.5                 | Java 17+   |
| 2.0.0    | flink-connector-clickhouse-2.0.0 | 0.9.5                 | Java 17+   |
| 1.20.2   | flink-connector-clickhouse-1.17  | 0.9.5                 | Java 11+   |
| 1.19.3   | flink-connector-clickhouse-1.17  | 0.9.5                 | Java 11+   |
| 1.18.1   | flink-connector-clickhouse-1.17  | 0.9.5                 | Java 11+   |
| 1.17.2   | flink-connector-clickhouse-1.17  | 0.9.5                 | Java 11+   |

:::note
该连接器尚未针对早于 1.17.2 的 Flink 版本进行测试。
:::

## 安装与配置 \{#installation--setup\}

### 导入依赖项 \{#import-as-a-dependency\}

#### 适用于 Flink 2.0+ \{#flink-2\}

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

#### 适用于 Flink 1.17+ \{#flink-117\}

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

### 下载二进制包 \{#download-the-binary\}

二进制 JAR 的命名规则如下：

```bash
flink-connector-clickhouse-${flink_version}-${stable_version}-all.jar
```

其中：

* `flink_version` 可以是 `2.0.0` 或 `1.17`
* `stable_version` 是[稳定的 artifact 发布版本](https://github.com/ClickHouse/flink-connector-clickhouse/releases)

你可以在 [Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/flink/) 中找到所有已发布的可用 JAR 文件。


## 使用 DataStream API \{#using-the-datastream-api\}

### 示例代码 \{#datastream-snippet\}

假设你想将原始 CSV 数据插入 ClickHouse：

<Tabs groupId="raw_csv_java_example">
  <TabItem value="Java" label="Java" default>
    ```java
    public static void main(String[] args) {
        // 配置 ClickHouseClient
        ClickHouseClientConfig clickHouseClientConfig = new ClickHouseClientConfig(url, username, password, database, tableName);

        // 创建 ElementConverter
        ElementConverter<String, ClickHousePayload> convertorString = new ClickHouseConvertor<>(String.class);

        // 创建 sink，并使用 `setClickHouseFormat` 设置格式
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

        // 最后，将 DataStream 连接到 sink。
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

更多示例和代码片段可在测试代码中找到：

* [flink-connector-clickhouse-1.17](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/flink-connector-clickhouse-1.17/src/test/java/org/apache/flink/connector/clickhouse/sink)
* [flink-connector-clickhouse-2.0.0](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/flink-connector-clickhouse-2.0.0/src/test/java/org/apache/flink/connector/clickhouse/sink)

### 快速入门示例 \{#datastream-quick-start\}

我们提供了基于 Maven 的示例，帮助您快速开始使用 ClickHouse Sink：

* [Flink 1.17+](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/examples/maven/flink-v1.7/covid)
* [Flink 2.0.0+](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/examples/maven/flink-v2/covid)

如需更详细的说明，请参阅[示例指南](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/examples/README.md)

### DataStream API 连接选项 \{#datastream-api-connection-options\}

#### ClickHouse 客户端选项 \{#client-options\}

| Parameters                  | 描述                                                                                                               | Default Value | Required |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| `url`                       | 完整限定的 ClickHouse URL                                                                                             | N/A           | 是        |
| `username`                  | ClickHouse 数据库用户名                                                                                                | N/A           | 是        |
| `password`                  | ClickHouse 数据库密码                                                                                                 | N/A           | 是        |
| `database`                  | ClickHouse 数据库名称                                                                                                 | N/A           | 是        |
| `table`                     | ClickHouse 表名                                                                                                    | N/A           | 是        |
| `options`                   | Java 客户端配置选项映射                                                                                                   | 空映射           | 否        |
| `serverSettings`            | ClickHouse 服务器会话设置映射                                                                                             | 空映射           | 否        |
| `enableJsonSupportAsString` | 用于指定 [JSON 数据类型](https://clickhouse.com/docs/sql-reference/data-types/newjson) 应以 JSON 格式字符串传入的 ClickHouse 服务器设置 | true          | 否        |

应将 `options` 和 `serverSettings` 作为 `Map<String, String>` 传递给客户端。两者中任一项使用空映射时，分别采用客户端或服务器的默认值。

:::note
所有可用的 Java 客户端选项均列在 [ClientConfigProperties.java](https://github.com/ClickHouse/clickhouse-java/blob/main/client-v2/src/main/java/com/clickhouse/client/api/ClientConfigProperties.java) 和[此文档页面](https://clickhouse.com/docs/integrations/language-clients/java/client#configuration)中。

所有可用的服务器会话设置均列在[此文档页面](https://clickhouse.com/docs/operations/settings/settings)中。
:::

例如：

<Tabs groupId="client_options_example">
  <TabItem value="Java" label="Java" default>
    ```java
    Map<String, String> javaClientOptions = Map.of(
        ClientConfigProperties.CA_CERTIFICATE.getKey(), "<my_CA_cert>",
        ClientConfigProperties.SSL_CERTIFICATE.getKey(), "<my_SSL_cert>",
        ClientConfigProperties.CLIENT_NETWORK_BUFFER_SIZE.getKey(), "30000",
        ClientConfigProperties.HTTP_MAX_OPEN_CONNECTIONS.getKey(), "5"
    );

    Map<String, String> serverSettings = Map.of(
        "insert_deduplicate", "1"
    );

    ClickHouseClientConfig clickHouseClientConfig = new ClickHouseClientConfig(
        url,
        username,
        password,
        database,
        tableName,
        javaClientOptions,
        serverSettings,
        false // 启用 enableJsonSupportAsString
    );
    ```
  </TabItem>
</Tabs>

#### Sink 选项 \{#sink-options\}

以下选项直接来自 Flink 的 `AsyncSinkBase`：

| 参数                     | 描述                                        | 默认值 | 必填 |
| ---------------------- | ----------------------------------------- | --- | -- |
| `maxBatchSize`         | 单个批次可插入的最大记录数                             | N/A | 是  |
| `maxInFlightRequests`  | sink 开始施加背压之前，允许的最大进行中请求数                 | N/A | 是  |
| `maxBufferedRequests`  | sink 开始施加背压之前，可在其中缓冲的最大记录数                | N/A | 是  |
| `maxBatchSizeInBytes`  | 单个批次允许达到的最大大小 (以字节为单位) 。发送的所有批次都将小于或等于该大小 | N/A | 是  |
| `maxTimeInBufferMS`    | 记录在被刷新之前可在 sink 中停留的最长时间                  | N/A | 是  |
| `maxRecordSizeInBytes` | sink 可接受的最大记录大小，超过该大小的记录将被自动拒绝            | N/A | 是  |

## 支持的数据类型 \{#supported-data-types\}

下表简要说明了从 Flink 插入数据到 ClickHouse 时的数据类型转换。

### 将数据从 Flink 插入 ClickHouse \{#inserting-data-from-flink-into-clickhouse\}

[//]: # "TODO: 添加 Table API 支持后，再增加一个“Flink SQL Type”列 "

| Java 类型             | ClickHouse 类型     | 是否支持 | 序列化方法                         |
| ------------------- | ----------------- | ---- | ----------------------------- |
| `byte`/`Byte`       | `Int8`            | ✅    | `DataWriter.writeInt8`        |
| `short`/`Short`     | `Int16`           | ✅    | `DataWriter.writeInt16`       |
| `int`/`Integer`     | `Int32`           | ✅    | `DataWriter.writeInt32`       |
| `long`/`Long`       | `Int64`           | ✅    | `DataWriter.writeInt64`       |
| `BigInteger`        | `Int128`          | ✅    | `DataWriter.writeInt128`      |
| `BigInteger`        | `Int256`          | ✅    | `DataWriter.writeInt256`      |
| `short`/`Short`     | `UInt8`           | ✅    | `DataWriter.writeUInt8`       |
| `int`/`Integer`     | `UInt8`           | ✅    | `DataWriter.writeUInt8 `      |
| `int`/`Integer`     | `UInt16`          | ✅    | `DataWriter.writeUInt16`      |
| `long`/`Long`       | `UInt32`          | ✅    | `DataWriter.writeUInt32`      |
| `long`/`Long`       | `UInt64`          | ✅    | `DataWriter.writeUInt64`      |
| `BigInteger`        | `UInt64`          | ✅    | `DataWriter.writeUInt64`      |
| `BigInteger`        | `UInt128`         | ✅    | `DataWriter.writeUInt128`     |
| `BigInteger`        | `UInt256`         | ✅    | `DataWriter.writeUInt256`     |
| `BigDecimal`        | `Decimal`         | ✅    | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal32`       | ✅    | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal64`       | ✅    | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal128`      | ✅    | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal256`      | ✅    | `DataWriter.writeDecimal`     |
| `float`/`Float`     | `Float`           | ✅    | `DataWriter.writeFloat32`     |
| `double`/`Double`   | `Double`          | ✅    | `DataWriter.writeFloat64`     |
| `boolean`/`Boolean` | `Boolean`         | ✅    | `DataWriter.writeBoolean`     |
| `String`            | `String`          | ✅    | `DataWriter.writeString`      |
| `String`            | `FixedString`     | ✅    | `DataWriter.writeFixedString` |
| `LocalDate`         | `Date`            | ✅    | `DataWriter.writeDate`        |
| `LocalDate`         | `Date32`          | ✅    | `DataWriter.writeDate32`      |
| `LocalDateTime`     | `DateTime`        | ✅    | `DataWriter.writeDateTime`    |
| `ZonedDateTime`     | `DateTime`        | ✅    | `DataWriter.writeDateTime`    |
| `LocalDateTime`     | `DateTime64`      | ✅    | `DataWriter.writeDateTime64`  |
| `ZonedDateTime`     | `DateTime64`      | ✅    | `DataWriter.writeDateTime64`  |
| `int`/`Integer`     | `Time`            | ❌    | N/A                           |
| `long`/`Long`       | `Time64`          | ❌    | N/A                           |
| `byte`/`Byte`       | `Enum8`           | ✅    | `DataWriter.writeInt8`        |
| `int`/`Integer`     | `Enum16`          | ✅    | `DataWriter.writeInt16`       |
| `java.util.UUID`    | `UUID`            | ✅    | `DataWriter.writeIntUUID`     |
| `String`            | `JSON`            | ✅    | `DataWriter.writeJSON`        |
| `Array<Type>`       | `Array<Type>`     | ✅    | `DataWriter.writeArray`       |
| `Map<K,V>`          | `Map<K,V>`        | ✅    | `DataWriter.writeMap`         |
| `Tuple<Type,..>`    | `Tuple<T1,T2,..>` | ✅    | `DataWriter.writeTuple`       |
| `Object`            | `Variant`         | ❌    | N/A                           |

注意：

* 执行日期相关操作时，必须提供 `ZoneId`。
* 执行十进制相关操作时，必须提供[精度和小数位数](https://clickhouse.com/docs/sql-reference/data-types/decimal#decimal-value-ranges)。
* 要让 ClickHouse 将 Java String 解析为 JSON，您需要在 `ClickHouseClientConfig` 中启用 `enableJsonSupportAsString`。
* 该连接器需要一个 `ElementConvertor`，用于将输入 DataStream 中的元素映射为 ClickHouse 数据载荷。为此，连接器提供了 `ClickHouseConvertor` 和 `POJOConvertor`，您可以使用它们结合上述 `DataWriter` 序列化方法来实现此映射。

## 支持的输入格式 \{#supported-input-formats\}

可在[此文档页面](https://clickhouse.com/docs/interfaces/formats#formats-overview)和 [ClickHouseFormat.java](https://github.com/ClickHouse/clickhouse-java/blob/main/clickhouse-data/src/main/java/com/clickhouse/data/ClickHouseFormat.java) 中查看可用的 ClickHouse 输入格式列表。

要指定连接器使用哪种格式将您的 DataStream 序列化为发送到 ClickHouse 的载荷，请使用 `setClickHouseFormat` 函数。例如：

```java
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
```

:::note
默认情况下，如果在 `ClickHouseClientConfig` 中将 `setSupportDefault` 显式设置为 true 或 false，连接器将分别使用 [RowBinaryWithDefaults](https://clickhouse.com/docs/interfaces/formats/RowBinaryWithDefaults) 或 [RowBinary](https://clickhouse.com/docs/interfaces/formats/RowBinary)。
:::


## 指标 \{#metrics\}

该连接器除 Flink 现有指标外，还会额外暴露以下指标：

| Metric                                  | 描述                                                                                                                                    | Type      | Status |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ |
| `numBytesSend`                          | 请求负载中发送到 ClickHouse 的总字节数。*注意：该指标衡量的是通过网络发送的序列化数据大小，可能与 ClickHouse 在 `system.query_log` 中的 `written_bytes` 不同；后者反映的是数据经处理后实际写入存储的字节数* | Counter   | ✅      |
| `numRecordSend`                         | 发送到 ClickHouse 的记录总数                                                                                                                  | Counter   | ✅      |
| `numRequestSubmitted`                   | 已发送的请求总数 (即实际执行的 flush 次数)                                                                                                            | Counter   | ✅      |
| `numOfDroppedBatches`                   | 因不可重试故障而丢弃的批次总数                                                                                                                       | Counter   | ✅      |
| `numOfDroppedRecords`                   | 因不可重试故障而丢弃的记录总数                                                                                                                       | Counter   | ✅      |
| `totalBatchRetries`                     | 因可重试故障而进行的批次重试总数                                                                                                                      | Counter   | ✅      |
| `writeLatencyHistogram`                 | 成功写入延迟分布直方图 (毫秒)                                                                                                                      | Histogram | ✅      |
| `writeFailureLatencyHistogram`          | 写入失败延迟分布直方图 (毫秒)                                                                                                                      | Histogram | ✅      |
| `triggeredByMaxBatchSizeCounter`        | 因达到 `maxBatchSize` 而触发的 flush 总数                                                                                                      | Counter   | ✅      |
| `triggeredByMaxBatchSizeInBytesCounter` | 因达到 `maxBatchSizeInBytes` 而触发的 flush 总数                                                                                               | Counter   | ✅      |
| `triggeredByMaxTimeInBufferMSCounter`   | 因达到 `maxTimeInBufferMS` 而触发的 flush 总数                                                                                                 | Counter   | ✅      |
| `actualRecordsPerBatch`                 | 实际每批记录数分布直方图                                                                                                                          | Histogram | ✅      |
| `actualBytesPerBatch`                   | 实际每批字节数分布直方图                                                                                                                          | Histogram | ✅      |

[//]: # "| actualTimeInBuffer           | flush 前在缓冲区中的实际停留时间分布直方图       | Histogram | ❌      |"

## 限制 \{#limitations\}

* 该 sink 目前提供至少一次 (at-least-once) 交付保证。对 exactly-once 语义的支持工作正在[此处](https://github.com/ClickHouse/flink-connector-clickhouse/issues/106)跟进。
* 该 sink 尚不支持使用死信队列 (DLQ) 缓冲无法处理的记录。目前，连接器会尝试重新插入失败的记录；如果仍然失败，则会将其丢弃。此功能正在[此处](https://github.com/ClickHouse/flink-connector-clickhouse/issues/105)跟进。
* 该 sink 尚不支持通过 Flink 的 Table API 或 Flink SQL 创建。此功能正在[此处](https://github.com/ClickHouse/flink-connector-clickhouse/issues/42)跟进。

## ClickHouse 版本兼容性与安全性 \{#compatibility-and-security\}

* 该连接器通过每日 CI 工作流对一系列较新的 ClickHouse 版本进行测试，包括 latest 和 head。随着新的 ClickHouse 版本发布并进入活跃支持阶段，测试版本会定期更新。有关该连接器每日测试的版本，请参见[此处](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/.github/workflows/tests-nightly.yaml#L15)。
* 有关已知安全漏洞以及如何报告漏洞，请参见 [ClickHouse 安全策略](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support)。
* 我们建议持续升级该连接器，以免错过安全修复和功能改进。
* 如果你在迁移过程中遇到问题，请在 GitHub 上创建 [issue](https://github.com/ClickHouse/flink-connector-clickhouse/issues)，我们会尽快回复！

## 高级用法与推荐配置 \{#advanced-and-recommended-usage\}

* 为获得最佳性能，请确保 DataStream 的元素类型**不是**泛型类型——请参阅[此处有关 Flink 类型区分的说明](https://nightlies.apache.org/flink/flink-docs-release-2.2/docs/dev/datastream/fault-tolerance/serialization/types_serialization/#flinks-typeinformation-class)。非泛型元素可避免 Kryo 带来的序列化开销，并提高写入 ClickHouse 的吞吐量。
* 我们建议将 `maxBatchSize` 设置为至少 1000，理想情况下在 10,000 到 100,000 之间。更多信息请参阅[这篇关于批量插入的指南](https://clickhouse.com/docs/optimize/bulk-inserts)。
* 如需在 ClickHouse 中执行 OLTP 风格的去重或 upsert，请参阅[此文档页面](https://clickhouse.com/docs/guides/developer/deduplication#options-for-deduplication)。*注意：不要将其与重试时发生的批次去重混淆，详见[下文](#duplicate_batches)。*

## 故障排查 \{#troubleshooting\}

### CANNOT_READ_ALL_DATA \{#cannot_read_all_data\}

可能会出现以下报错：

```text
com.clickhouse.client.api.ServerException: Code: 33. DB::Exception: Cannot read all data. Bytes read: 9205. Bytes expected: 1100022.: (at row 9) : While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)
```

**原因**：最常见的情况是，CANNOT&#95;READ&#95;ALL&#95;DATA 错误意味着 ClickHouse 表的 schema 与 Flink 记录的 schema 不一致。当其中任意一方以不向后兼容的方式发生变更时，就可能出现这种情况。

**解决方案**：更新 ClickHouse 表或连接器输入数据类型中的 schema (或同时更新两者) ，使其相互兼容。如有需要，请参阅[type mapping](#inserting-data-from-flink-into-clickhouse)，了解如何将 Java 类型映射为 ClickHouse 类型。*注意：如果仍有正在传输中的记录，则在重启连接器时需要重置 Flink 状态。*


### 吞吐量低 \{#low_throughput\}

向 ClickHouse 写入时，你可能会遇到这样的问题：连接器的吞吐量不会随着作业并行度 (Flink 任务数) 的增加而提升。

**原因**：ClickHouse 的后台[分区片段合并过程](https://clickhouse.com/docs/merges)可能会拖慢插入速度。当配置的批次大小过小、连接器刷新过于频繁，或两者同时存在时，就可能发生这种情况。

**解决方案**：监控 `numRequestSubmitted` 和 `actualRecordsPerBatch` 指标，以帮助确定如何调整批次大小 (`maxBatchSize`) 以及刷新频率。另请参见[高级与推荐用法](#advanced-and-recommended-usage)中的批次大小建议。

[//]: # "TODO: 一旦 https://github.com/ClickHouse/flink-connector-clickhouse/issues/121 关闭，就取消注释本节"

[//]: # "### 我在 ClickHouse 表中看到了重复的批次行 {#duplicate_batches}"

[//]: #

[//]: # "**原因**：如果 Flink 某个批次中的一条或多条记录由于可重试失败而无法插入 ClickHouse，连接器将重试**整个批次**。如果未启用[插入去重](https://clickhouse.com/docs/guides/developer/deduplicating-inserts-on-retries#query-level-insert-deduplication)，则可能会导致重复记录写入你的 ClickHouse 表。否则，也有可能是去重窗口或窗口时长过小，导致在连接器重试这些数据块之前窗口已过期。"

[//]: #

[//]: # "**解决方案**："

[//]: # "- 如果你的表使用的是 `Replicated*MergeTree` 表引擎："

[//]: # "  1. 确保服务器会话设置 `insert_deduplicate=1` (如有需要，请参见上文的[示例](#client-options)了解如何设置)。请注意，对于复制表，`insert_deduplicate` 默认开启。"

[//]: # "  2. 如有必要，增大 `MergeTree` 表设置 [`replicated_deduplication_window`](https://clickhouse.com/docs/operations/settings/merge-tree-settings#replicated_deduplication_window) 和/或 [`replicated_deduplication_window_seconds`](https://clickhouse.com/docs/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)。"

[//]: # "- 如果你的表使用的是非复制的 `*MergeTree` 表引擎，请增大 `MergeTree` 表设置 [`non_replicated_deduplication_window`](https://clickhouse.com/docs/operations/settings/merge-tree-settings#non_replicated_deduplication_window)。"

[//]: #

[//]: # "_注 1：该解决方案依赖于[同步插入](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default)，这也是 Flink 连接器推荐使用的方式。请确保服务器会话设置 `async_insert=0`。_"

[//]: #

[//]: # "_注 2：`(non_)replicated_deduplication_window` 取值过大可能会拖慢插入速度，因为需要比较更多条目。_"

### 我的 ClickHouse 表中缺少一些行 \{#missing_rows\}

**原因**：这些批次之所以被丢弃，要么是因为发生了不可重试的故障，要么是因为在已配置的重试次数内仍无法完成插入（可通过 `ClickHouseClientConfig.setNumberOfRetries()` 设置）。_注意：默认情况下，连接器在丢弃一个批次之前，最多会尝试重新插入 3 次。_

**解决方案**：检查 TaskManager 日志和/或堆栈跟踪，找出根本原因。

## 贡献与支持 \{#contributing-and-support\}

如果您想为该项目做出贡献或报告任何问题，欢迎提出宝贵意见！
请访问我们的 [GitHub 仓库](https://github.com/ClickHouse/flink-connector-clickhouse) 提交 issue、提出改进建议，
或发起拉取请求。

欢迎贡献！开始之前，请先查看仓库中的[贡献指南](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/CONTRIBUTING.md)。
感谢您帮助改进 ClickHouse Flink 连接器！