---
sidebar_label: ClickPipes (New)
description: Seamlessly connect your external data sources to ClickHouse Cloud. 
slug: /en/integrations/clickpipes
---

import KafkaSVG from "../../images/logos/kafka.svg";
import ConfluentSVG from "../../images/logos/confluent.svg";


# Integrating Kafka with ClickHouse Cloud
[ClickPipes](https://clickhouse.com/cloud/clickpipes) is a managed integration platform that makes ingesting data from a diverse set of sources as simple as clicking a few buttons. Designed for the most demanding workloads, ClickPipes's robust and scalable architecture ensures consistent performance and reliability. 
<br/>

<img src={require('./images/clickpipes_stack.png').default} class="image" alt="ClickPipes Stack Illustration"/>

<br/>

:::note
ClickPipes is a native capability of [ClickHouse Cloud](https://clickhouse.com/cloud) currently under private preview. You can join [our waitlist here](https://clickhouse.com/cloud/clickpipes#joinwaitlist)
:::

## Supported Data Sources

|Name|Logo|Type|Description|
|------|----|----------------|------------------|
|Confluent Cloud|<ConfluentSVG style={{width: '3rem'}} />|Streaming|Unlock the combined power of Confluent and ClickHouse Cloud through our direct integration.|
|Apache Kafka|<KafkaSVG style={{width: '3rem', 'height': '3rem'}} />|Streaming|Configure ClickPipes and start ingesting streaming data from Apache Kafka into ClickHouse Cloud.|

More connectors are will get added to ClickPipes, you can find out more by [contacting us](https://clickhouse.com/company/contact?loc=clickpipes).

## Setup

## Supported data formats

The supported formats are:

| Format                                                                                    | Support     |
|-------------------------------------------------------------------------------------------|-------------|
| [JSON](../../../interfaces/formats.md#json)                                               | ✔           | 
| [AvroConfluent](../../../interfaces/formats.md#data-format-avro-confluent)                |*Coming Soon*|
| [TabSeparated](../../../interfaces/formats.md#tabseparated)                               |*Coming Soon*| 
| [CSV](../../../interfaces/formats.md#csv)                                                 |*Coming Soon*| 


## Supported data types

The following ClickHouse types are currently supported by the transform package (with standard JSON as the source):

- Base numeric types
  - Int8
  - Int16
  - Int32
  - Int64
  - UInt8
  - UInt16
  - UInt32
  - UInt64
  - Float32
  - Float64
- Boolean
- String
- Date
- DateTime
- DateTime64

Nullable versions of all of the above are also supported.

- Enum8/Enum16 (Nullable Enums not supported)
- LowCardinality(String)  LowCardinality(Nullable(String)) is not supported

- Map with keys and values using any of the above types (including Nullables)
- Array with elements using any of the above types (including Nullables, one level depth only)

## Limitations