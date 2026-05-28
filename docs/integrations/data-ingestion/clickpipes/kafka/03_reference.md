---
sidebar_label: 'Reference'
description: 'Details supported formats, sources, delivery semantics, authentication and experimental features supported by Kafka ClickPipes.'
slug: /integrations/clickpipes/kafka/reference
sidebar_position: 1
title: 'Reference'
doc_type: 'reference'
keywords: ['kafka reference', 'clickpipes', 'data sources', 'avro', 'virtual columns']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';

## Supported data sources {#supported-data-sources}

| Name                 |Logo|Type| Status          | Description                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| Stable          | Configure ClickPipes and start ingesting streaming data from Apache Kafka into ClickHouse Cloud.     |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>|Streaming| Stable          | Unlock the combined power of Confluent and ClickHouse Cloud through our direct integration.          |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>|Streaming| Stable          | Configure ClickPipes and start ingesting streaming data from Redpanda into ClickHouse Cloud.         |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| Stable          | Configure ClickPipes and start ingesting streaming data from AWS MSK into ClickHouse Cloud.          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>|Streaming| Stable          | Configure ClickPipes and start ingesting streaming data from Azure Event Hubs into ClickHouse Cloud. |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>|Streaming| Stable          | Configure ClickPipes and start ingesting streaming data from WarpStream into ClickHouse Cloud.       |

## Supported data formats {#supported-data-formats}

The supported formats are:
- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)
- [Protobuf](/interfaces/formats/Protobuf)

## Supported data types {#supported-data-types}

### Standard {#standard-types-support}

The following standard ClickHouse data types are currently supported in ClickPipes:

- Base numeric types - \[U\]Int8/16/32/64, Float32/64, and BFloat16
- Large integer types - \[U\]Int128/256
- Decimal Types
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64 (UTC timezones only)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- Time, Time64
- JSON
- all ClickHouse LowCardinality types
- Map with keys and values using any of the above types (including Nullables)
- Tuple and Array with elements using any of the above types (including Nullables, one level depth only)
- SimpleAggregateFunction types (for AggregatingMergeTree or SummingMergeTree destinations)

### Variant type support {#variant-type-support}
ClickPipes supports the Variant type in the following circumstances:
- Avro Unions.  If your Avro schema contains a union with multiple non-null types, ClickPipes will infer the
  appropriate variant type.  Variant types are not otherwise supported for Avro data.
- JSON fields.  You can manually specify a Variant type (such as `Variant(String, Int64, DateTime)`) for any JSON field
  in the source data stream.  Complex subtypes (arrays/maps/tuples) are not supported.  In addition, because of the way ClickPipes determines
  the correct variant subtype to use, only one integer or datetime type can be used in the Variant definition - for example, `Variant(Int64, UInt32)` is not supported.

### JSON type support {#json-type-support}
ClickPipes support the JSON type in the following circumstances:
- Avro Record and Protobuf Message fields can always be assigned to a JSON column.
- Avro String and Bytes fields can be assigned to a JSON column if the Avro field actually contains JSON String objects.
- Protobuf String and Bytes kinds can be assigned to a JSON column if the Protobuf field actually contains JSON String objects.
- JSON fields that are always a JSON object can be assigned to a JSON destination column.

Note that you will have to manually change the destination column to the desired JSON type, including any fixed or skipped paths.

### Avro {#avro}

#### Supported Avro data types {#supported-avro-data-types}

ClickPipes supports all Avro Primitive and Complex types, and all Avro Logical types except `local-timestamp-millis` and `local_timestamp-micros`.  Avro `record` types are converted to Tuple, `array` types to Array, and `map` to Map (string keys only).  In general the conversions listed [here](/interfaces/schema-inference#avro) are available.  We recommend using exact type matching for Avro numeric types, as ClickPipes does not check for overflow or precision loss on type conversion.
Alternatively, all Avro types can be inserted into a `String` column, and will be represented as a valid JSON string in that case.

#### Nullable types and Avro unions {#nullable-types-and-avro-unions}

Nullable types in Avro are defined by using a Union schema of `(T, null)` or `(null, T)` where T is the base Avro type.  During schema inference, such unions will be mapped to a ClickHouse "Nullable" column.  Note that ClickHouse doesn't support
`Nullable(Array)`, `Nullable(Map)`, or `Nullable(Tuple)` types.  Avro null unions for these types will be mapped to non-nullable versions (Avro Record types are mapped to a ClickHouse named Tuple).  Avro "nulls" for these types will be inserted as:
- An empty Array for a null Avro array
- An empty Map for a null Avro Map
- A named Tuple with all default/zero values for a null Avro Record

### Protobuf {#protobuf}

#### Supported Protobuf data types {#supported-protobuf-data-types}

ClickPipes supports all Protobuf 2 and 3 types, with the exception of the long-deprecated proto 2 `group` type. Basic type conversions use
the following mappings:

:::note
`Array`, `Map`, and `Nullable` variants of all basic types are also supported.
:::

| Protobuf type                 | ClickHouse type   |
|-------------------------------|-------------------|
| `bool`                        | `UInt8`           |
| `float`                       | `Float32`         |
| `double`                      | `Float64`         |
| `int32`, `sint32`, `sfixed32` | `Int32`           |
| `int64`, `sint64`, `sfixed64` | `Int64`           |
| `uint32`, `fixed32`           | `UInt32`          |
| `uint64`, `fixed64`           | `UInt64`          |
| `string`, `bytes`             | `String`          |
| `enum`                        | `Enum`            |
| `repeated T`                  | `Array(T)`        |
| `message`                     | `Tuple`           |

:::tip
For numeric types, exact matching is recommended to avoid overflows or precision loss.
:::

The following [well-known types](https://protobuf.dev/reference/protobuf/google.protobuf/) are also supported:

| Well-known type                                                                              | ClickHouse type          |
|----------------------------------------------------------------------------------------------|--------------------------|
| `google.protobuf.Timestamp`                                                                  | `DateTime`, `DateTime64` |
| `google.protobuf.Duration`                                                                   | `Time`, `Time64`         |
| `google.protobuf.StringValue`, `google.protobuf.BytesValue`                                  | `Nullable(String)`       |
| `google.protobuf.Int32Value`, `google.protobuf.SInt32Value`, `google.protobuf.SFixed32Value` | `Nullable(Int32)`        |
| `google.protobuf.Int64Value`, `google.protobuf.SInt64Value`, `google.protobuf.SFixed64Value` | `Nullable(Int64)`        |
| `google.protobuf.UInt32Value`, `google.protobuf.Fixed32Value`                                | `Nullable(UInt32)`       |
| `google.protobuf.UInt64Value`, `google.protobuf.Fixed64Value`                                | `Nullable(UInt64)`       |
| `google.protobuf.FloatValue`                                                                 | `Nullable(Float32)`      |
| `google.protobuf.DoubleValue`                                                                | `Nullable(Float64)`      |
| `google.protobuf.BoolValue`                                                                  | `Nullable(UInt8)`        |

#### Protobuf `oneof` {#protobuf-one-ofs}

During schema inference, Protobuf `oneof` fields are mapped by default to a named `Tuple`, where at most one field will hold a non-default
value. These fields can also be automatically mapped to a `Variant` column where the active value takes the type of
whichever constituent field is set. Alternatively, each constituent field can be manually mapped to its own ClickHouse column; since `oneof`
fields are mutually exclusive, only one column will ever be populated per record.

#### Message lists {#protobuf-message-lists}

If the top level Protobuf schema defined for the ClickPipe contains a single repeated field that is itself a protobuf Message, schema inference and column mapping will be based on the "contained" Message field.  The Kafka message will be processed as a list of such messages, and a single Kafka message will unwrap into multiple ClickHouse rows.

## Kafka virtual columns {#kafka-virtual-columns}

The following virtual columns are supported for Kafka compatible streaming data sources.  When creating a new destination, virtual columns can be added to the target table by using the `Add Column` button.

| Name             | Description                                     | Recommended Data Type  |
|------------------|-------------------------------------------------|------------------------|
| `_key`           | Kafka Message Key                               | `String`               |
| `_timestamp`     | Kafka Timestamp (Millisecond precision)         | `DateTime64(3)`        |
| `_partition`     | Kafka Partition                                 | `Int32`                |
| `_offset`        | Kafka Offset                                    | `Int64`                |
| `_topic`         | Kafka Topic                                     | `String`               |
| `_header_keys`   | Parallel array of keys in the record Headers    | `Array(String)`        |
| `_header_values` | Parallel array of headers in the record Headers | `Array(String)`        |
| `_raw_message`   | Full Kafka Message                              | `String`               |

Note that the `_raw_message` column is only recommended for JSON data. 
For use cases where only the JSON string is required (such as using ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) functions to
populate a downstream materialized view), it may improve ClickPipes performance to delete all the "non-virtual" columns.
