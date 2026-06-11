---
sidebar_label: '参考'
description: '详细说明 Kafka ClickPipes 所支持的格式、数据源、投递语义、身份验证以及实验性功能。'
slug: /integrations/clickpipes/kafka/reference
sidebar_position: 1
title: '参考'
doc_type: 'reference'
keywords: ['Kafka 参考', 'ClickPipes', '数据源', 'avro', '虚拟列']
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

## 支持的数据源 \{#supported-data-sources\}

| 名称                 |Logo|类型| 状态           | 描述                                                                                                  |
|----------------------|----|----|----------------|-------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka 标志" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| 稳定           | 配置 ClickPipes 并开始从 Apache Kafka 摄取流式数据到 ClickHouse Cloud。                               |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud 标志" style={{width: '3rem'}}/>|Streaming| 稳定           | 通过我们的直接集成，将 Confluent 与 ClickHouse Cloud 的能力结合使用。                                |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Redpanda 标志"/>|Streaming| 稳定           | 配置 ClickPipes 并开始从 Redpanda 摄取流式数据到 ClickHouse Cloud。                                  |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK 标志" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| 稳定           | 配置 ClickPipes 并开始从 AWS MSK 摄取流式数据到 ClickHouse Cloud。                                   |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs 标志" style={{width: '3rem'}}/>|Streaming| 稳定           | 配置 ClickPipes 并开始从 Azure Event Hubs 摄取流式数据到 ClickHouse Cloud。                          |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream 标志" style={{width: '3rem'}}/>|Streaming| 稳定           | 配置 ClickPipes 并开始从 WarpStream 摄取流式数据到 ClickHouse Cloud。                                |

## 支持的数据格式 \{#supported-data-formats\}

支持的格式有：

* [JSON](/integrations/data-formats/json/overview)
* [AvroConfluent](/interfaces/formats/AvroConfluent)
* [Protobuf](/interfaces/formats/Protobuf)

## 受支持的数据类型 \{#supported-data-types\}

### 标准 \{#standard-types-support\}

ClickPipes 当前支持以下标准 ClickHouse 数据类型：

* 基本数值类型 - [U]Int8/16/32/64、Float32/64 和 BFloat16
* 大整数类型 - [U]Int128/256
* Decimal 类型
* Boolean
* String
* FixedString
* Date、Date32
* DateTime、DateTime64 (仅支持 UTC 时区) 
* Enum8/Enum16
* UUID
* IPv4
* IPv6
* Time、Time64
* JSON
* 所有 ClickHouse 的 LowCardinality 类型
* 键和值使用上述任意类型 (包括 Nullable) 的 Map
* 元素使用上述任意类型 (包括 Nullable，仅一层嵌套) 的 Tuple 和 Array
* SimpleAggregateFunction 类型 (用于 AggregatingMergeTree 或 SummingMergeTree 目标)

### Variant 类型支持 \{#variant-type-support\}

ClickPipes 在下列情况下支持 Variant 类型：

* Avro Union。 如果你的 Avro schema 中包含由多个非 null 类型组成的 union，ClickPipes 会推断出
  合适的 Variant 类型。除此之外，Avro 数据不支持 Variant 类型。
* JSON 字段。你可以为源数据流中的任何 JSON 字段手动指定 Variant 类型 (例如 `Variant(String, Int64, DateTime)`) 。
  不支持复杂子类型 (数组/映射/元组) 。另外，由于 ClickPipes 确定要使用的正确 Variant 子类型的方式所限，
  在 Variant 定义中只能使用一种整数类型或一种日期时间类型 —— 例如，不支持 `Variant(Int64, UInt32)`。

### JSON 类型支持 \{#json-type-support\}

ClickPipes 在以下情况下支持 JSON 类型：

* Avro Record 和 Protobuf Message 字段始终可以指定为 JSON 列。
* 如果 Avro 字段实际包含的是 JSON 字符串对象，则 Avro String 和 Bytes 字段可以指定为 JSON 列。
* 如果 Protobuf 字段实际包含的是 JSON 字符串对象，则 Protobuf String 和 Bytes kind 可以指定为 JSON 列。
* 始终为 JSON 对象的 JSON 字段可以指定为 JSON 目标列。

请注意，您需要手动将目标列更改为所需的 JSON 类型，包括任何固定路径或跳过路径。

### Avro \{#avro\}

#### 支持的 Avro 数据类型 \{#supported-avro-data-types\}

ClickPipes 支持所有 Avro 原始类型 (primitive) 和复杂类型 (complex) ，以及除 `local-timestamp-millis` 和 `local_timestamp-micros` 之外的所有 Avro 逻辑类型 (logical) 。Avro 的 `record` 类型会被转换为 Tuple，`array` 类型转换为 Array，`map` 类型转换为 Map (仅支持 string 键) 。通常情况下，可以使用[此处](/interfaces/schema-inference#avro)列出的转换。我们建议对 Avro 数值类型使用精确类型匹配，因为 ClickPipes 在类型转换时不会检查溢出或精度损失。

或者，也可以将所有 Avro 类型插入到一个 `String` 列中，在这种情况下它们将表示为合法的 JSON 字符串。

#### Nullable 类型和 Avro union \{#nullable-types-and-avro-unions\}

在 Avro 中，Nullable 类型是通过使用 `(T, null)` 或 `(null, T)` 的 union schema 来定义的，其中 T 是基础 Avro 类型。在 schema 推断过程中，此类 union 会被映射为 ClickHouse 的 Nullable 列。注意，ClickHouse 不支持
`Nullable(Array)`、`Nullable(Map)` 或 `Nullable(Tuple)` 类型。这些类型对应的 Avro null union 将被映射为非 Nullable 版本（Avro Record 类型会被映射为 ClickHouse 的命名 Tuple）。对于这些类型中的 Avro "null" 值，将按如下方式插入：

- 对于为 null 的 Avro array，插入空的 Array
- 对于为 null 的 Avro Map，插入空的 Map
- 对于为 null 的 Avro Record，插入一个所有字段为默认值/零值的命名 Tuple

### Protobuf \{#protobuf\}

#### 支持的 Protobuf 数据类型 \{#supported-protobuf-data-types\}

ClickPipes 支持所有 Protobuf 2 和 3 类型，唯一的例外是早已弃用的 proto 2 `group` 类型。基本类型转换使用
以下对照关系：

:::note
还支持所有基本类型的 `Array`、`Map` 和 `Nullable` 变体。
:::

| Protobuf 类型                   | ClickHouse 类型 |
| ----------------------------- | ------------- |
| `bool`                        | `UInt8`       |
| `float`                       | `Float32`     |
| `double`                      | `Float64`     |
| `int32`, `sint32`, `sfixed32` | `Int32`       |
| `int64`, `sint64`, `sfixed64` | `Int64`       |
| `uint32`, `fixed32`           | `UInt32`      |
| `uint64`, `fixed64`           | `UInt64`      |
| `string`, `bytes`             | `String`      |
| `enum`                        | `Enum`        |
| `repeated T`                  | `Array(T)`    |
| `message`                     | `Tuple`       |

:::tip
对于数值类型，建议使用精确匹配，以避免溢出或精度损失。
:::

还支持以下 [众所周知类型](https://protobuf.dev/reference/protobuf/google.protobuf/)：

| 众所周知类型                                                                                       | ClickHouse 类型            |
| -------------------------------------------------------------------------------------------- | ------------------------ |
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

#### Protobuf `oneof` \{#protobuf-one-ofs\}

在 schema 推断 过程中，Protobuf `oneof` 字段默认会映射为带名称的 `Tuple`，其中最多只有一个字段会包含非默认值。这些字段也可以自动映射为 `Variant` 列，其中生效的值会采用已设置的组成字段的类型。或者，也可以将每个组成字段手动映射到各自独立的 ClickHouse 列；由于 `oneof` 字段彼此互斥，因此每条记录中最终只会填充一个列。

#### 消息列表 \{#protobuf-message-lists\}

如果为 ClickPipe 定义的顶层 Protobuf schema 仅包含一个 repeated 字段，且该字段本身就是一个 protobuf Message，则 schema 推断 和列映射将基于其所包含的 Message 字段。Kafka 消息会按此类消息列表进行处理，而单条 Kafka 消息会展开为 ClickHouse 中的多行。

## Kafka 虚拟列 \{#kafka-virtual-columns\}

下列虚拟列适用于与 Kafka 兼容的流式数据源。创建新的目标端时，可以使用 `Add Column` 按钮将虚拟列添加到目标表。

| Name             | Description          | Recommended Data Type |
| ---------------- | -------------------- | --------------------- |
| `_key`           | Kafka 消息键            | `String`              |
| `_timestamp`     | Kafka 时间戳 (毫秒精度)     | `DateTime64(3)`       |
| `_partition`     | Kafka 分区             | `Int32`               |
| `_offset`        | Kafka 偏移量            | `Int64`               |
| `_topic`         | Kafka 主题             | `String`              |
| `_header_keys`   | 记录头部中键的并行数组          | `Array(String)`       |
| `_header_values` | 记录头部中各 header 值的并行数组 | `Array(String)`       |
| `_raw_message`   | 完整的 Kafka 消息         | `String`              |

请注意，`_raw_message` 列仅推荐用于 JSON 数据。
对于只需要 JSON 字符串的使用场景 (例如使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数来填充下游 materialized view) ，删除所有“非虚拟”列可能会提升 ClickPipes 的性能。