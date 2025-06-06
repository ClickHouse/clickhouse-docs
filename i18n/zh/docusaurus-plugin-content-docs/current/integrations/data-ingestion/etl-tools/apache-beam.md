---
'sidebar_label': 'Apache Beam'
'slug': '/integrations/apache-beam'
'description': '用户可以使用 Apache Beam 将数据导入 ClickHouse'
'title': '将 Apache Beam 与 ClickHouse 集成'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 集成 Apache Beam 和 ClickHouse

<ClickHouseSupportedBadge/>

**Apache Beam** 是一个开源的统一编程模型，使开发者能够定义和执行批处理和流（连续）数据处理管道。Apache Beam 的灵活性在于它支持广泛的数据处理场景，从 ETL（提取、转换、加载）操作到复杂事件处理和实时分析。本集成利用了 ClickHouse 的官方 [JDBC 连接器](https://github.com/ClickHouse/clickhouse-java) 作为底层插入层。

## 集成包 {#integration-package}

要集成 Apache Beam 和 ClickHouse 所需的集成包在 [Apache Beam I/O Connectors](https://beam.apache.org/documentation/io/connectors/) 下维护和开发，该包集成了许多流行的数据存储系统和数据库。`org.apache.beam.sdk.io.clickhouse.ClickHouseIO` 实现位于 [Apache Beam 仓库](https://github.com/apache/beam/tree/0bf43078130d7a258a0f1638a921d6d5287ca01e/sdks/java/io/clickhouse/src/main/java/org/apache/beam/sdk/io/clickhouse)。

## Apache Beam ClickHouse 包的设置 {#setup-of-the-apache-beam-clickhouse-package}

### 包安装 {#package-installation}

将以下依赖项添加到您的包管理框架中：
```xml
<dependency>
    <groupId>org.apache.beam</groupId>
    <artifactId>beam-sdks-java-io-clickhouse</artifactId>
    <version>${beam.version}</version>
</dependency>
```

:::important 推荐的 Beam 版本
建议从 Apache Beam 版本 `2.59.0` 开始使用 `ClickHouseIO` 连接器。早期版本可能无法完全支持连接器的功能。
:::

可以在 [官方 Maven 仓库](https://mvnrepository.com/artifact/org.apache.beam/beam-sdks-java-io-clickhouse) 中找到相关工件。

### 代码示例 {#code-example}

以下示例将名为 `input.csv` 的 CSV 文件作为 `PCollection` 读取，转换为 Row 对象（使用定义的模式），并使用 `ClickHouseIO` 将其插入到本地的 ClickHouse 实例中：

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

## 支持的数据类型 {#supported-data-types}

| ClickHouse                         | Apache Beam                | 是否支持 | 备注                                                                                                                                    |
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
| `TableSchema.TypeName.FIXEDSTRING` | `FixedBytes`               | ✅        | `FixedBytes` 是表示定长的 <br/> 字节数组的 `LogicalType`，位于 <br/> `org.apache.beam.sdk.schemas.logicaltypes` |
|                                    | `Schema.TypeName#DECIMAL`  | ❌        |                                                                                                                                          |
|                                    | `Schema.TypeName#MAP`      | ❌        |                                                                                                                                          |

## ClickHouseIO.Write 参数 {#clickhouseiowrite-parameters}

您可以通过以下设置函数调整 `ClickHouseIO.Write` 的配置：

| 参数设置函数               | 参数类型                   | 默认值                         | 描述                                                           |
|-----------------------------|----------------------------|-------------------------------|-----------------------------------------------------------------|
| `withMaxInsertBlockSize`    | `(long maxInsertBlockSize)` | `1000000`                     | 要插入的行块的最大大小。                                      |
| `withMaxRetries`            | `(int maxRetries)`          | `5`                           | 失败插入的最大重试次数。                                        |
| `withMaxCumulativeBackoff`  | `(Duration maxBackoff)`     | `Duration.standardDays(1000)` | 最大重试的累积退避持续时间。                                    |
| `withInitialBackoff`        | `(Duration initialBackoff)` | `Duration.standardSeconds(5)` | 第一次重试之前的初始退避持续时间。                             |
| `withInsertDistributedSync` | `(Boolean sync)`            | `true`                        | 如果为 true，则为分布式表同步插入操作。                      |
| `withInsertQuorum`          | `(Long quorum)`             | `null`                        | 确认插入操作所需的副本数量。                                   |
| `withInsertDeduplicate`     | `(Boolean deduplicate)`     | `true`                        | 如果为 true，则启用插入操作的去重。                           |
| `withTableSchema`           | `(TableSchema schema)`      | `null`                        | 目标 ClickHouse 表的模式。                                    |

## 限制 {#limitations}

使用该连接器时请考虑以下限制：
* 目前仅支持 Sink 操作。该连接器不支持 Source 操作。
* 在向 `ReplicatedMergeTree` 或基于 `ReplicatedMergeTree` 构建的 `Distributed` 表插入时，ClickHouse 会执行去重。如果没有复制，在常规的 MergeTree 中如果插入失败然后成功重试，可能会导致重复。然而，每个块都是原子插入的，块大小可以使用 `ClickHouseIO.Write.withMaxInsertBlockSize(long)` 进行配置。去重是通过使用插入块的校验和来实现的。有关去重的更多信息，请访问 [去重](/guides/developer/deduplication) 和 [去重插入配置](/operations/settings/settings#insert_deduplicate)。
* 该连接器不执行任何 DDL 语句；因此，目标表在插入之前必须存在。

## 相关内容 {#related-content}
* `ClickHouseIO` 类 [文档](https://beam.apache.org/releases/javadoc/current/org/apache/beam/sdk/io/clickhouse/ClickHouseIO.html)。
* `Github` 示例仓库 [clickhouse-beam-connector](https://github.com/ClickHouse/clickhouse-beam-connector)。
