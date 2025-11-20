---
sidebar_label: '参考'
description: '介绍 Kafka ClickPipes 支持的格式、数据源、投递语义、身份验证方式以及实验性特性'
slug: /integrations/clickpipes/kafka/reference
sidebar_position: 1
title: '参考'
doc_type: 'reference'
keywords: ['kafka reference', 'clickpipes', 'data sources', 'avro', 'virtual columns']
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

| 名称             | Logo                                                                                        | 类型      | 状态 | 描述                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------- | --------- | ------ | ---------------------------------------------------------------------------------------------------- |
| Apache Kafka     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/> | Streaming | Stable | 配置 ClickPipes 并开始从 Apache Kafka 摄取流数据到 ClickHouse Cloud。     |
| Confluent Cloud  | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>            | Streaming | Stable | 通过我们的直接集成,充分发挥 Confluent 和 ClickHouse Cloud 的组合优势。          |
| Redpanda         | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                | Streaming | Stable | 配置 ClickPipes 并开始从 Redpanda 摄取流数据到 ClickHouse Cloud。         |
| AWS MSK          | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>        | Streaming | Stable | 配置 ClickPipes 并开始从 AWS MSK 摄取流数据到 ClickHouse Cloud。          |
| Azure Event Hubs | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>      | Streaming | Stable | 配置 ClickPipes 并开始从 Azure Event Hubs 摄取流数据到 ClickHouse Cloud。 |
| WarpStream       | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                | Streaming | Stable | 配置 ClickPipes 并开始从 WarpStream 摄取流数据到 ClickHouse Cloud。       |


## 支持的数据格式 {#supported-data-formats}

支持的格式包括:

- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)


## 支持的数据类型 {#supported-data-types}

### 标准类型 {#standard-types-support}

ClickPipes 目前支持以下标准 ClickHouse 数据类型:

- 基础数值类型 - \[U\]Int8/16/32/64、Float32/64 和 BFloat16
- 大整数类型 - \[U\]Int128/256
- Decimal 类型
- Boolean
- String
- FixedString
- Date、Date32
- DateTime、DateTime64(仅支持 UTC 时区)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse LowCardinality 类型
- Map,其键和值可使用上述任意类型(包括 Nullable 类型)
- Tuple 和 Array,其元素可使用上述任意类型(包括 Nullable 类型,仅支持一层嵌套深度)
- SimpleAggregateFunction 类型(用于 AggregatingMergeTree 或 SummingMergeTree 目标表)

### Avro {#avro}

#### 支持的 Avro 数据类型 {#supported-avro-data-types}

ClickPipes 支持所有 Avro 原始类型和复杂类型,以及除 `time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros` 和 `duration` 之外的所有 Avro 逻辑类型。Avro `record` 类型会转换为 Tuple,`array` 类型转换为 Array,`map` 转换为 Map(仅支持字符串键)。通常,[此处](/interfaces/formats/Avro#data-type-mapping)列出的转换均可用。我们建议对 Avro 数值类型使用精确的类型匹配,因为 ClickPipes 在类型转换时不会检查溢出或精度损失。
或者,所有 Avro 类型都可以插入到 `String` 列中,此时将表示为有效的 JSON 字符串。

#### Nullable 类型和 Avro 联合类型 {#nullable-types-and-avro-unions}

Avro 中的 Nullable 类型通过使用 `(T, null)` 或 `(null, T)` 的联合模式定义,其中 T 是基础 Avro 类型。在模式推断期间,此类联合类型将映射到 ClickHouse 的 "Nullable" 列。请注意,ClickHouse 不支持
`Nullable(Array)`、`Nullable(Map)` 或 `Nullable(Tuple)` 类型。这些类型的 Avro null 联合将映射为非 nullable 版本(Avro Record 类型映射为 ClickHouse 命名 Tuple)。这些类型的 Avro "null" 值将按以下方式插入:

- null Avro 数组插入为空 Array
- null Avro Map 插入为空 Map
- null Avro Record 插入为所有字段均为默认值/零值的命名 Tuple

#### Variant 类型支持 {#variant-type-support}

ClickPipes 在以下情况下支持 Variant 类型:

- Avro 联合类型。如果您的 Avro 模式包含具有多个非 null 类型的联合,ClickPipes 将推断出
  相应的 Variant 类型。除此之外,Avro 数据不支持 Variant 类型。
- JSON 字段。您可以为源数据流中的任何 JSON 字段手动指定 Variant 类型(例如 `Variant(String, Int64, DateTime)`)。由于 ClickPipes 确定要使用的正确 Variant 子类型的方式,Variant 定义中只能使用一种整数或日期时间类型 - 例如,不支持 `Variant(Int64, UInt32)`。

#### JSON 类型支持 {#json-type-support}

ClickPipes 在以下情况下支持 JSON 类型:

- Avro Record 类型始终可以分配给 JSON 列。
- 如果列实际包含 JSON 字符串对象,Avro String 和 Bytes 类型可以分配给 JSON 列。
- 始终为 JSON 对象的 JSON 字段可以分配给 JSON 目标列。

请注意,您需要手动将目标列更改为所需的 JSON 类型,包括任何固定或跳过的路径。


## Kafka 虚拟列 {#kafka-virtual-columns}

Kafka 兼容的流数据源支持以下虚拟列。创建新的目标表时,可以使用 `Add Column` 按钮添加虚拟列。

| 名称             | 描述                                     | 推荐数据类型 |
| ---------------- | ----------------------------------------------- | --------------------- |
| `_key`           | Kafka 消息键                               | `String`              |
| `_timestamp`     | Kafka 时间戳(毫秒精度)         | `DateTime64(3)`       |
| `_partition`     | Kafka 分区                                 | `Int32`               |
| `_offset`        | Kafka 偏移量                                    | `Int64`               |
| `_topic`         | Kafka 主题                                     | `String`              |
| `_header_keys`   | 记录头中键的并行数组    | `Array(String)`       |
| `_header_values` | 记录头中值的并行数组 | `Array(String)`       |
| `_raw_message`   | 完整的 Kafka 消息                              | `String`              |

注意:`_raw_message` 列仅推荐用于 JSON 数据。
对于仅需要 JSON 字符串的使用场景(例如使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数填充下游物化视图),删除所有"非虚拟"列可能会提高 ClickPipes 性能。
