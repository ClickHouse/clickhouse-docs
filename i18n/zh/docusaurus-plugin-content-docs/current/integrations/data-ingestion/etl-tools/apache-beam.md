---
sidebar_label: 'Apache Beam'
slug: /integrations/apache-beam
description: '您可以使用 Apache Beam 将数据摄取到 ClickHouse'
title: '集成 Apache Beam 和 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['apache beam', 'stream processing', 'batch processing', 'jdbc connector', 'data pipeline']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 集成 Apache Beam 与 ClickHouse \\{#integrating-apache-beam-and-clickhouse\\}

<ClickHouseSupportedBadge/>

**Apache Beam** 是一个开源的统一编程模型，使开发者能够定义和执行批处理和流式（连续）数据处理管道。Apache Beam 的灵活性体现在它能够支持广泛的数据处理场景，从 ETL（抽取、转换、加载）操作到复杂事件处理和实时分析。
本集成在数据写入层使用了 ClickHouse 官方的 [JDBC 连接器](https://github.com/ClickHouse/clickhouse-java)。

## 集成包 \\{#integration-package\\}

用于集成 Apache Beam 和 ClickHouse 的集成包由 [Apache Beam I/O Connectors](https://beam.apache.org/documentation/io/connectors/) 维护和开发——这是一个汇集众多主流数据存储系统和数据库的集成组件集合。
`org.apache.beam.sdk.io.clickhouse.ClickHouseIO` 的实现位于 [Apache Beam 仓库](https://github.com/apache/beam/tree/0bf43078130d7a258a0f1638a921d6d5287ca01e/sdks/java/io/clickhouse/src/main/java/org/apache/beam/sdk/io/clickhouse) 中。

## 设置 Apache Beam ClickHouse 包 \\{#setup-of-the-apache-beam-clickhouse-package\\}

### 安装包 \{#package-installation\}

将以下依赖添加到你的包管理工具中：

```xml
<dependency>
    <groupId>org.apache.beam</groupId>
    <artifactId>beam-sdks-java-io-clickhouse</artifactId>
    <version>${beam.version}</version>
</dependency>
```

:::important 推荐的 Beam 版本
`ClickHouseIO` 连接器推荐从 Apache Beam 版本 `2.59.0` 起使用。
较早的版本可能无法完全支持该连接器的功能。
:::

相关构件可以在[官方 Maven 仓库](https://mvnrepository.com/artifact/org.apache.beam/beam-sdks-java-io-clickhouse)中找到。


### 代码示例 \{#code-example\}

以下示例将名为 `input.csv` 的 CSV 文件读取为 `PCollection`，将其转换为 Row 对象（基于已定义的 schema），并使用 `ClickHouseIO` 将其插入到本地 ClickHouse 实例中：

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
        // Create a Pipeline object.
        Pipeline p = Pipeline.create();

        Schema SCHEMA =
                Schema.builder()
                        .addField(Schema.Field.of("name", Schema.FieldType.STRING).withNullable(true))
                        .addField(Schema.Field.of("age", Schema.FieldType.INT16).withNullable(true))
                        .addField(Schema.Field.of("insertion_time", Schema.FieldType.DATETIME).withNullable(false))
                        .build();

        // Apply transforms to the pipeline.
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

        // Run the pipeline.
        p.run().waitUntilFinish();
    }
}

```


## 支持的数据类型 \\{#supported-data-types\\}

| ClickHouse                         | Apache Beam                | 是否支持 | 说明                                                                                                                                     |
|------------------------------------|----------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------|
| `TableSchema.TypeName.FLOAT32`     | `Schema.TypeName#FLOAT`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.FLOAT64`     | `Schema.TypeName#DOUBLE`   | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.INT8`        | `Schema.TypeName#BYTE`     | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.INT16`       | `Schema.TypeName#INT16`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.INT32`       | `Schema.TypeName#INT32`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.INT64`       | `Schema.TypeName#INT64`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.STRING`      | `Schema.TypeName#STRING`   | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.UINT8`       | `Schema.TypeName#INT16`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.UINT16`      | `Schema.TypeName#INT32`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.UINT32`      | `Schema.TypeName#INT64`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.UINT64`      | `Schema.TypeName#INT64`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.DATE`        | `Schema.TypeName#DATETIME` | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.DATETIME`    | `Schema.TypeName#DATETIME` | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.ARRAY`       | `Schema.TypeName#ARRAY`    | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.ENUM8`       | `Schema.TypeName#STRING`   | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.ENUM16`      | `Schema.TypeName#STRING`   | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.BOOL`        | `Schema.TypeName#BOOLEAN`  | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.TUPLE`       | `Schema.TypeName#ROW`      | ✅        |                                                                                                                                          |
| `TableSchema.TypeName.FIXEDSTRING` | `FixedBytes`               | ✅        | `FixedBytes` 是一种 `LogicalType`，表示固定长度的<br/>字节数组，定义在<br/>`org.apache.beam.sdk.schemas.logicaltypes` 包中 |
|                                    | `Schema.TypeName#DECIMAL`  | ❌        |                                                                                                                                          |
|                                    | `Schema.TypeName#MAP`      | ❌        |                                                                                                                                          |

## ClickHouseIO.Write 参数 \\{#clickhouseiowrite-parameters\\}

可以使用以下 setter 函数来调整 `ClickHouseIO.Write` 的配置：

| 参数设置函数                 | 参数类型                     | 默认值                         | 描述                                                             |
|-----------------------------|-----------------------------|-------------------------------|------------------------------------------------------------------|
| `withMaxInsertBlockSize`    | `(long maxInsertBlockSize)` | `1000000`                     | 每次插入的数据块的最大行数。                                    |
| `withMaxRetries`            | `(int maxRetries)`          | `5`                           | 插入失败时的最大重试次数。                                      |
| `withMaxCumulativeBackoff`  | `(Duration maxBackoff)`     | `Duration.standardDays(1000)` | 重试时允许的最大累计退避时长。                                  |
| `withInitialBackoff`        | `(Duration initialBackoff)` | `Duration.standardSeconds(5)` | 第一次重试前的初始退避时长。                                    |
| `withInsertDistributedSync` | `(Boolean sync)`            | `true`                        | 若为 true，则对分布式表的插入操作以同步方式执行。               |
| `withInsertQuorum`          | `(Long quorum)`             | `null`                        | 确认一次插入操作所需的副本数量。                                |
| `withInsertDeduplicate`     | `(Boolean deduplicate)`     | `true`                        | 若为 true，则对插入操作启用去重。                               |
| `withTableSchema`           | `(TableSchema schema)`      | `null`                        | 目标 ClickHouse 表的表结构（schema）。                          |

## 限制 \\{#limitations\\}

使用该连接器时请注意以下限制：

* 截至目前，仅支持 Sink 操作。该连接器不支持 Source 操作。
* 在向 `ReplicatedMergeTree` 或基于 `ReplicatedMergeTree` 构建的 `Distributed` 表中插入数据时，ClickHouse 会执行去重操作。如果未启用复制，向普通 MergeTree 表插入数据时，当一次插入失败并随后重试成功时，可能会产生重复数据。不过，每个数据块的插入是原子性的，并且可以使用 `ClickHouseIO.Write.withMaxInsertBlockSize(long)` 配置块大小。去重是通过插入数据块的校验和来实现的。有关去重的更多信息，请访问 [去重](/guides/developer/deduplication) 和 [插入去重配置](/operations/settings/settings#insert_deduplicate)。
* 该连接器不会执行任何 DDL 语句；因此，在执行插入之前，目标表必须已经存在。

## 相关文章 \\{#related-content\\}

* `ClickHouseIO` 类的[文档](https://beam.apache.org/releases/javadoc/current/org/apache/beam/sdk/io/clickhouse/ClickHouseIO.html)。
* 示例 `GitHub` 仓库：[clickhouse-beam-connector](https://github.com/ClickHouse/clickhouse-beam-connector)。