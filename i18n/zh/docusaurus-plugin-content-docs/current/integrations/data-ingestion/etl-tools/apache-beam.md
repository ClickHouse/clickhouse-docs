---
sidebar_label: 'Apache Beam'
slug: /integrations/apache-beam
description: '用户可以使用 Apache Beam 将数据写入 ClickHouse'
title: '集成 Apache Beam 与 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['apache beam', 'stream processing', 'batch processing', 'jdbc connector', 'data pipeline']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 集成 Apache Beam 和 ClickHouse

<ClickHouseSupportedBadge/>

**Apache Beam** 是一个开源的统一编程模型，使开发者能够定义并执行批处理和流式（连续）数据处理流水线。Apache Beam 的灵活性体现在其能够支持从 ETL（Extract, Transform, Load）操作到复杂事件处理和实时分析在内的各类数据处理场景。
此集成在底层数据写入层使用了 ClickHouse 官方的 [JDBC connector](https://github.com/ClickHouse/clickhouse-java)。



## 集成包 {#integration-package}

用于集成 Apache Beam 和 ClickHouse 的集成包在 [Apache Beam I/O Connectors](https://beam.apache.org/documentation/io/connectors/) 下进行维护和开发,该项目是一个集成了众多流行数据存储系统和数据库的连接器集合。
`org.apache.beam.sdk.io.clickhouse.ClickHouseIO` 的实现位于 [Apache Beam 代码仓库](https://github.com/apache/beam/tree/0bf43078130d7a258a0f1638a921d6d5287ca01e/sdks/java/io/clickhouse/src/main/java/org/apache/beam/sdk/io/clickhouse)中。


## Apache Beam ClickHouse 包的设置 {#setup-of-the-apache-beam-clickhouse-package}

### 包安装 {#package-installation}

将以下依赖项添加到您的包管理框架中:

```xml
<dependency>
    <groupId>org.apache.beam</groupId>
    <artifactId>beam-sdks-java-io-clickhouse</artifactId>
    <version>${beam.version}</version>
</dependency>
```

:::important 推荐的 Beam 版本
建议使用 Apache Beam `2.59.0` 及以上版本的 `ClickHouseIO` 连接器。
早期版本可能无法完全支持该连接器的功能。
:::

可以在[官方 Maven 仓库](https://mvnrepository.com/artifact/org.apache.beam/beam-sdks-java-io-clickhouse)中找到这些构件。

### 代码示例 {#code-example}

以下示例将名为 `input.csv` 的 CSV 文件读取为 `PCollection`,将其转换为 Row 对象(使用定义的模式),并使用 `ClickHouseIO` 将其插入到本地 ClickHouse 实例中:

```java

package org.example;

import org.apache.beam.sdk.Pipeline;
import org.apache.beam.sdk.io.TextIO;
import org.apache.beam.sdk.io.clickhouse.ClickHouseIO;
import org.apache.beam.sdk.schemas.Schema;
import org.apache.beam.sdk.transforms.DoFn;
import org.apache.beam.sdk.transforms.ParDo;
import org.apache.beam.sdk.values.PCollection;
import org.apache.beam.sdk.values.Row;
import org.joda.time.DateTime;

public class Main {

    public static void main(String[] args) {
        // 创建 Pipeline 对象。
        Pipeline p = Pipeline.create();

        Schema SCHEMA =
                Schema.builder()
                        .addField(Schema.Field.of("name", Schema.FieldType.STRING).withNullable(true))
                        .addField(Schema.Field.of("age", Schema.FieldType.INT16).withNullable(true))
                        .addField(Schema.Field.of("insertion_time", Schema.FieldType.DATETIME).withNullable(false))
                        .build();

        // 对管道应用转换。
        PCollection<String> lines = p.apply("ReadLines", TextIO.read().from("src/main/resources/input.csv"));

        PCollection<Row> rows = lines.apply("ConvertToRow", ParDo.of(new DoFn<String, Row>() {
            @ProcessElement
            public void processElement(@Element String line, OutputReceiver<Row> out) {

                String[] values = line.split(",");
                Row row = Row.withSchema(SCHEMA)
                        .addValues(values[0], Short.parseShort(values[1]), DateTime.now())
                        .build();
                out.output(row);
            }
        })).setRowSchema(SCHEMA);

        rows.apply("Write to ClickHouse",
                        ClickHouseIO.write("jdbc:clickhouse://localhost:8123/default?user=default&password=******", "test_table"));

        // 运行管道。
        p.run().waitUntilFinish();
    }
}

```


## 支持的数据类型 {#supported-data-types}

| ClickHouse                         | Apache Beam                | 是否支持 | 说明                                                                                                                                    |
| ---------------------------------- | -------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `TableSchema.TypeName.FLOAT32`     | `Schema.TypeName#FLOAT`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.FLOAT64`     | `Schema.TypeName#DOUBLE`   | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.INT8`        | `Schema.TypeName#BYTE`     | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.INT16`       | `Schema.TypeName#INT16`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.INT32`       | `Schema.TypeName#INT32`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.INT64`       | `Schema.TypeName#INT64`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.STRING`      | `Schema.TypeName#STRING`   | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.UINT8`       | `Schema.TypeName#INT16`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.UINT16`      | `Schema.TypeName#INT32`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.UINT32`      | `Schema.TypeName#INT64`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.UINT64`      | `Schema.TypeName#INT64`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.DATE`        | `Schema.TypeName#DATETIME` | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.DATETIME`    | `Schema.TypeName#DATETIME` | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.ARRAY`       | `Schema.TypeName#ARRAY`    | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.ENUM8`       | `Schema.TypeName#STRING`   | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.ENUM16`      | `Schema.TypeName#STRING`   | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.BOOL`        | `Schema.TypeName#BOOLEAN`  | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.TUPLE`       | `Schema.TypeName#ROW`      | ✅           |                                                                                                                                          |
| `TableSchema.TypeName.FIXEDSTRING` | `FixedBytes`               | ✅           | `FixedBytes` 是一个 `LogicalType`,表示固定长度的 <br/> 字节数组,位于 <br/> `org.apache.beam.sdk.schemas.logicaltypes` |
|                                    | `Schema.TypeName#DECIMAL`  | ❌           |                                                                                                                                          |
|                                    | `Schema.TypeName#MAP`      | ❌           |                                                                                                                                          |


## ClickHouseIO.Write 参数 {#clickhouseiowrite-parameters}

您可以使用以下 setter 函数调整 `ClickHouseIO.Write` 配置:

| 参数 Setter 函数   | 参数类型               | 默认值                 | 描述                                                     |
| --------------------------- | --------------------------- | ----------------------------- | --------------------------------------------------------------- |
| `withMaxInsertBlockSize`    | `(long maxInsertBlockSize)` | `1000000`                     | 插入数据块的最大行数。                      |
| `withMaxRetries`            | `(int maxRetries)`          | `5`                           | 插入失败时的最大重试次数。                   |
| `withMaxCumulativeBackoff`  | `(Duration maxBackoff)`     | `Duration.standardDays(1000)` | 重试的最大累积退避时长。                |
| `withInitialBackoff`        | `(Duration initialBackoff)` | `Duration.standardSeconds(5)` | 首次重试前的初始退避时长。                |
| `withInsertDistributedSync` | `(Boolean sync)`            | `true`                        | 如果为 true,则同步分布式表的插入操作。 |
| `withInsertQuorum`          | `(Long quorum)`             | `null`                        | 确认插入操作所需的副本数。 |
| `withInsertDeduplicate`     | `(Boolean deduplicate)`     | `true`                        | 如果为 true,则为插入操作启用去重。        |
| `withTableSchema`           | `(TableSchema schema)`      | `null`                        | 目标 ClickHouse 表的 schema。                          |


## 限制 {#limitations}

使用该连接器时请注意以下限制：

- 目前仅支持 Sink 操作。该连接器不支持 Source 操作。
- ClickHouse 在向 `ReplicatedMergeTree` 或基于 `ReplicatedMergeTree` 构建的 `Distributed` 表插入数据时会执行去重。在没有副本的情况下，向普通 MergeTree 表插入数据时，如果插入失败后重试成功，可能会产生重复数据。但是，每个数据块都是原子性插入的，数据块大小可以通过 `ClickHouseIO.Write.withMaxInsertBlockSize(long)` 进行配置。去重通过使用插入数据块的校验和来实现。有关去重的更多信息，请参阅[去重](/guides/developer/deduplication)和[去重插入配置](/operations/settings/settings#insert_deduplicate)。
- 该连接器不执行任何 DDL 语句；因此，目标表必须在插入数据前已存在。


## 相关内容 {#related-content}

- `ClickHouseIO` 类[文档](https://beam.apache.org/releases/javadoc/current/org/apache/beam/sdk/io/clickhouse/ClickHouseIO.html)。
- `GitHub` 示例仓库 [clickhouse-beam-connector](https://github.com/ClickHouse/clickhouse-beam-connector)。
