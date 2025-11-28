---
sidebar_label: '参考'
description: '详细说明 Kafka ClickPipes 所支持的格式、数据源、投递语义、认证方式以及实验性特性'
slug: /integrations/clickpipes/kafka/reference
sidebar_position: 1
title: '参考'
doc_type: 'reference'
keywords: ['kafka 参考', 'clickpipes', '数据源', 'avro', '虚拟列']
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';


# 参考资料



## 支持的数据源 {#supported-data-sources}

| Name                 |Logo|Type| Status          | Description                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka 徽标" style={{width: '3rem', 'height': '3rem'}}/>|流式| 稳定            | 配置 ClickPipes，开始将来自 Apache Kafka 的流式数据摄取到 ClickHouse Cloud。                        |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud 徽标" style={{width: '3rem'}}/>|流式| 稳定            | 通过我们的直接集成，充分发挥 Confluent 与 ClickHouse Cloud 组合的强大能力。                          |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Redpanda 徽标"/>|流式| 稳定            | 配置 ClickPipes，开始将来自 Redpanda 的流式数据摄取到 ClickHouse Cloud。                           |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK 徽标" style={{width: '3rem', 'height': '3rem'}}/>|流式| 稳定            | 配置 ClickPipes，开始将来自 AWS MSK 的流式数据摄取到 ClickHouse Cloud。                            |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs 徽标" style={{width: '3rem'}}/>|流式| 稳定            | 配置 ClickPipes，开始将来自 Azure Event Hubs 的流式数据摄取到 ClickHouse Cloud。                  |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream 徽标" style={{width: '3rem'}}/>|流式| 稳定            | 配置 ClickPipes，开始将来自 WarpStream 的流式数据摄取到 ClickHouse Cloud。                        |



## 支持的数据格式 {#supported-data-formats}

支持的格式包括：
- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)



## 支持的数据类型 {#supported-data-types}

### 标准类型 {#standard-types-support}

ClickPipes 目前支持以下标准 ClickHouse 数据类型：

- 基础数值类型 - \[U\]Int8/16/32/64、Float32/64 和 BFloat16
- 大整数类型 - \[U\]Int128/256
- Decimal 类型
- Boolean
- String
- FixedString
- Date、Date32
- DateTime、DateTime64（仅支持 UTC 时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse 的 LowCardinality 类型
- Map，其键和值使用上述任意类型（包括 Nullable）
- Tuple 和 Array，其元素使用上述任意类型（包括 Nullable，仅支持一层深度）
- SimpleAggregateFunction 类型（用于 AggregatingMergeTree 或 SummingMergeTree 目标表）

### Avro {#avro}

#### 支持的 Avro 数据类型 {#supported-avro-data-types}
ClickPipes 支持所有 Avro Primitive 和 Complex 类型，以及除 `time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros` 和 `duration` 之外的所有 Avro Logical 类型。Avro 的 `record` 类型会被转换为 Tuple，`array` 类型转换为 Array，`map` 转换为 Map（仅支持字符串键）。通常情况下，可以使用[此处](/interfaces/formats/Avro#data-type-mapping)列出的转换方式。建议对 Avro 数值类型使用精确的类型匹配，因为 ClickPipes 在类型转换时不会检查溢出或精度损失。

另外，所有 Avro 类型都可以插入到一个 `String` 列中，在这种情况下会以有效的 JSON 字符串形式表示。

#### Nullable 类型与 Avro unions {#nullable-types-and-avro-unions}
Avro 中的 Nullable 类型通过使用 `(T, null)` 或 `(null, T)` 的 Union schema 定义，其中 T 为基础 Avro 类型。在模式推断期间，此类 Union 会被映射为 ClickHouse 的 "Nullable" 列。请注意，ClickHouse 不支持
`Nullable(Array)`、`Nullable(Map)` 或 `Nullable(Tuple)` 类型。对于这些类型中包含 null 的 Avro union，会映射为对应的非 Nullable 类型（Avro Record 类型会映射为 ClickHouse 的命名 Tuple）。对于这些类型的 Avro "null"，将按如下方式插入：
- 对于 null 的 Avro array，插入空 Array
- 对于 null 的 Avro Map，插入空 Map
- 对于 null 的 Avro Record，插入一个所有字段为默认值/零值的命名 Tuple

#### Variant 类型支持 {#variant-type-support}
在以下情况下，ClickPipes 支持 Variant 类型：
- Avro unions。如果 Avro schema 中包含具有多个非 null 类型的 union，ClickPipes 会推断出
  合适的 Variant 类型。除此之外，Variant 类型不支持用于 Avro 数据。
- JSON 字段。可以为源数据流中的任意 JSON 字段手动指定 Variant 类型（例如 `Variant(String, Int64, DateTime)`）。由于 ClickPipes 确定应使用的正确 Variant 子类型的方式所限，在 Variant 定义中只能使用一种整数类型或一种 datetime 类型——例如，不支持 `Variant(Int64, UInt32)`。

#### JSON 类型支持 {#json-type-support}
在以下情况下，ClickPipes 支持 JSON 类型：
- Avro Record 类型始终可以映射到 JSON 列。
- 如果 Avro String 和 Bytes 类型的列实际保存的是 JSON 字符串对象，则可以将其映射到 JSON 列。
- 始终为 JSON object 的 JSON 字段可以映射到 JSON 目标列。

请注意，需要手动将目标列更改为所需的 JSON 类型，包括任何固定路径或跳过路径。



## Kafka 虚拟列 {#kafka-virtual-columns}

以下虚拟列适用于 Kafka 兼容的流式数据源。在创建新的目标表时，可以通过 `Add Column` 按钮添加虚拟列。

| Name             | Description                                         | Recommended Data Type  |
|------------------|-----------------------------------------------------|------------------------|
| `_key`           | Kafka 消息键                                        | `String`               |
| `_timestamp`     | Kafka 时间戳（毫秒精度）                            | `DateTime64(3)`        |
| `_partition`     | Kafka 分区                                         | `Int32`                |
| `_offset`        | Kafka 偏移量                                       | `Int64`                |
| `_topic`         | Kafka 主题                                         | `String`               |
| `_header_keys`   | 记录 Headers 中键的并行数组                        | `Array(String)`        |
| `_header_values` | 记录 Headers 中值的并行数组                        | `Array(String)`        |
| `_raw_message`   | 完整 Kafka 消息                                    | `String`               |

请注意，`_raw_message` 列仅推荐用于 JSON 数据。
对于只需要 JSON 字符串的使用场景（例如使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数来填充下游物化视图），删除所有“非虚拟”列可能会提升 ClickPipes 的性能。
