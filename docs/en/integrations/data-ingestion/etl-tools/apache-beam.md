---
sidebar_label: Apache Beam
slug: /en/integrations/apache-beam
description: Users can ingest data into ClickHouse using Apache Beam
---

# Integrating Apache Beam and ClickHouse

**Apache Beam**  is an open-source, unified programming model that enables developers to define and execute both batch and stream (continuous) data processing pipelines. The flexibility of Apache Beam lies in its ability to support a wide range of data processing scenarios, from ETL (Extract, Transform, Load) operations to complex event processing and real-time analytics.
This integration leverage ClickHouse's official [JDBC connector](https://github.com/ClickHouse/clickhouse-java) for the underlying insertion layer.

## Integration Package

The integration package required to integrate Apache Beam and ClickHouse is maintained and developed under [Apache Beam I/O Connectors](https://beam.apache.org/documentation/io/connectors/) - an integrations bundle of many popular data storage systems and databases.
`org.apache.beam.sdk.io.clickhouse.ClickHouseIO` implementation located within the [Apache Beam repo](https://github.com/apache/beam/tree/0bf43078130d7a258a0f1638a921d6d5287ca01e/sdks/java/io/clickhouse/src/main/java/org/apache/beam/sdk/io/clickhouse).

## Setup of the Apache Beam ClickHouse package

### Package installation

Add the following dependency to your package management framework:
```xml
<dependency>
    <groupId>org.apache.beam</groupId>
    <artifactId>beam-sdks-java-io-clickhouse</artifactId>
    <version>${beam.version}</version>
</dependency>
```

The artifacts could be found in the [official maven repository](https://mvnrepository.com/artifact/org.apache.beam/beam-sdks-java-io-clickhouse).

### Code Example

The following example reads a CSV file named `input.csv` as a `PCollection`, converts it to a Row object (using the defined schema) and inserts it into a local ClickHouse instance using `ClickHouseIO`:

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

## Supported Data Types

| ClickHouse                           | Apache Beam                  | Is Supported | Notes                                                                                                                                  |
|--------------------------------------|------------------------------|--------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `TableSchema.TypeName.FLOAT32`       | `Schema.TypeName#FLOAT`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.FLOAT64`       | `Schema.TypeName#DOUBLE`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.INT8`       | `Schema.TypeName#BYTE`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.INT16`       | `Schema.TypeName#INT16`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.INT32`       | `Schema.TypeName#INT32`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.INT64`       | `Schema.TypeName#INT64`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.STRING`       | `Schema.TypeName#STRING`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.UINT8`       | `Schema.TypeName#INT16`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.UINT16`       | `Schema.TypeName#INT32`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.UINT32`       | `Schema.TypeName#INT64`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.UINT64`       | `Schema.TypeName#INT64`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.DATE`       | `Schema.TypeName#DATETIME`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.DATETIME`      | `Schema.TypeName#DATETIME`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.ARRAY`       | `Schema.TypeName#ARRAY`   | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.ENUM8`       | `Schema.TypeName#STRING`  | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.ENUM16`      | `Schema.TypeName#STRING`  | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.BOOL`        | `Schema.TypeName#BOOLEAN` | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.TUPLE`       | `Schema.TypeName#ROW`        | ✅            |                                                                                                                                        |
| `TableSchema.TypeName.FIXEDSTRING` | `FixedBytes`                 | ✅            | `FixedBytes` is a LogicalType representing a fixed-length <br/> byte array located at <br/> `org.apache.beam.sdk.schemas.logicaltypes` |
|                                    | `Schema.TypeName#DECIMAL`    | ❌            |                                                                                                                                        |
|                                    | `Schema.TypeName#MAP`        | ❌            |                                                                                                                                        |



## Limitations

Please consider the following limitations when using the connector:
* As of today, only Sink operation is supported. The connector doesn't support Source operation.
* ClickHouse performs deduplication when inserting into a `ReplicatedMergeTree` or a `Distributed` table built on top of a `ReplicatedMergeTree`. Without replication, inserting into a regular MergeTree can result in duplicates if an insert fails and then successfully retries. However, each block is inserted atomically, and the block size can be configured using `ClickHouseIO.Write.withMaxInsertBlockSize(long)`. Deduplication is achieved by using checksums of the inserted blocks. For more information about deduplication, please visit [Deduplication](https://clickhouse.com/docs/en/guides/developer/deduplication) and [Deduplicate insertion config](https://clickhouse.com/docs/en/operations/settings/settings#insert-deduplicate). 
* The connector doesn't perform any DDL statements; therefore, the target table must exist prior insertion.


## Related Content
* `ClickHouseIO` class [documentation](https://beam.apache.org/releases/javadoc/current/org/apache/beam/sdk/io/clickhouse/ClickHouseIO.html).
