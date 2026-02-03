---
sidebar_label: 'Reference'
description: 'Details supported formats, sources, delivery semantics, authentication and experimental features supported by Kafka ClickPipes'
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

# Reference

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
- Protobuf string and bytes Kinds can be assigned to a JSON column if the Protobuf field actually contains JSON String objects.
- JSON fields that are always a JSON object can be assigned to a JSON destination column.

Note that you will have to manually change the destination column to the desired JSON type, including any fixed or skipped paths.

### Avro {#avro}

#### Supported Avro Data Types {#supported-avro-data-types}
ClickPipes supports all Avro Primitive and Complex types, and all Avro Logical types except `local-timestamp-millis` and `local_timestamp-micros`.  Avro `record` types are converted to Tuple, `array` types to Array, and `map` to Map (string keys only).  In general the conversions listed [here](/interfaces/schema-inference#avro) are available.  We recommend using exact type matching for Avro numeric types, as ClickPipes does not check for overflow or precision loss on type conversion.
Alternatively, all Avro types can be inserted into a `String` column, and will be represented as a valid JSON string in that case.

#### Nullable types and Avro unions {#nullable-types-and-avro-unions}
Nullable types in Avro are defined by using a Union schema of `(T, null)` or `(null, T)` where T is the base Avro type.  During schema inference, such unions will be mapped to a ClickHouse "Nullable" column.  Note that ClickHouse does not support
`Nullable(Array)`, `Nullable(Map)`, or `Nullable(Tuple)` types.  Avro null unions for these types will be mapped to non-nullable versions (Avro Record types are mapped to a ClickHouse named Tuple).  Avro "nulls" for these types will be inserted as:
- An empty Array for a null Avro array
- An empty Map for a null Avro Map
- A named Tuple with all default/zero values for a null Avro Record

### Protobuf {#protobuf}

#### Supported Protobuf Data Types {#supported-protobuf-data-types}
ClickPipes supports all Protobuf version 2 and 3 types (except the long deprecated proto 2 `group` type).  Basic conversions are identical to those used for the ClickHouse Protobuf format listed [here](/interfaces/schema-inference#protobuf).
We recommend exact type matching for Protobuf numeric types, as type conversion can result overflows or precision loss.  Protobuf maps, arrays, and Nullable variations of basic types are also supported.  ClickPipes also recognizes a
limited set of Google "well known types": Timestamp, Duration, and "wrapper" messages.  Timestamps can be accurately mapped to DateTime or DateTime64 types, Durations to Time or Time64 types, and wrapper messages to the
underlying type.  All Protobuf types can also be mapped to a ClickHouse `String` column and will be represented by a JSON string in that case.

#### Protobuf One-Ofs {#protobuf-one-ofs}
During schema inference, protobuf "One Of" special fields will normally be mapped to a named Tuple, where only one of the fields will have a "non-default" value.  Alternatively, some "One Ofs" may be automatically mapped to a name variant field
with the name of the "One Of", and a value representing using one of the valid types of the constituent fields.  Alternatively, each "One Of" constituent field can be manually mapped to a ClickHouse column, where only one of the constituent fields
will ever be populated during processing.

#### Message Lists (Envelopes) {#protobuf-message-lists}
If the top level Protobuf schema defined for the ClickPipe contains a single repeated field that is itself a protobuf Message, schema inference and column mapping will be based on the "contained" Message field.  The Kafka message will be processed as a
list of such messages, and a single Kafka message will generate multiple ClickHouse rows.

## Kafka virtual columns {#kafka-virtual-columns}

The following virtual columns are supported for Kafka compatible streaming data sources.  When creating a new destination table virtual columns can be added by using the `Add Column` button.

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
