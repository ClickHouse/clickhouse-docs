---
'sidebar_label': '参考'
'description': '详细说明由 Kafka ClickPipes 支持的格式、来源、交付语义、身份验证和实验性功能'
'slug': '/integrations/clickpipes/kafka/reference'
'sidebar_position': 1
'title': '参考'
'doc_type': 'reference'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';


# 参考

## 支持的数据源 {#supported-data-sources}

| 名称                    | Logo| 类型  | 状态            | 描述                                                                                            |
|-------------------------|-----|-------|----------------|-------------------------------------------------------------------------------------------------|
| Apache Kafka            |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>| 流式  | 稳定            | 配置 ClickPipes，并开始将 Apache Kafka 的流式数据导入 ClickHouse Cloud。                       |
| Confluent Cloud         |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>| 流式  | 稳定            | 通过我们的直接集成，释放 Confluent 与 ClickHouse Cloud 的组合能力。                             |
| Redpanda                |<Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>| 流式  | 稳定            | 配置 ClickPipes，并开始将 Redpanda 的流式数据导入 ClickHouse Cloud。                          |
| AWS MSK                 |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>| 流式  | 稳定            | 配置 ClickPipes，并开始将 AWS MSK 的流式数据导入 ClickHouse Cloud。                            |
| Azure Event Hubs        |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>| 流式  | 稳定            | 配置 ClickPipes，并开始将 Azure Event Hubs 的流式数据导入 ClickHouse Cloud。                  |
| WarpStream              |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>| 流式  | 稳定            | 配置 ClickPipes，并开始将 WarpStream 的流式数据导入 ClickHouse Cloud。                        |

## 支持的数据格式 {#supported-data-formats}

支持的格式有：
- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)

## 支持的数据类型 {#supported-data-types}

### 标准 {#standard-types-support}

当前 ClickPipes 支持以下标准 ClickHouse 数据类型：

- 基本数值类型 - \[U\]Int8/16/32/64、Float32/64 和 BFloat16
- 大整数类型 - \[U\]Int128/256
- 十进制类型
- 布尔型
- 字符串
- 固定字符串
- 日期、Date32
- 日期时间、DateTime64 （仅支持 UTC 时区）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 所有 ClickHouse LowCardinality 类型
- 使用上述任何类型（包括 Nullable）的键和值的 Map
- 使用上述任何类型（包括 Nullable，仅支持一层深度）的 Tuple 和 Array
- SimpleAggregateFunction 类型（用于 AggregatingMergeTree 或 SummingMergeTree 目的地）

### Avro {#avro}

#### 支持的 Avro 数据类型 {#supported-avro-data-types}
ClickPipes 支持所有 Avro 原始和复杂类型，以及所有 Avro 逻辑类型，除了 `time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros` 和 `duration`。 Avro 的 `record` 类型转换为 Tuple，`array` 类型转换为 Array，`map` 转换为 Map（仅支持字符串键）。一般来说，列出 [这里](/interfaces/formats/Avro#data-type-mapping) 的转换是可用的。我们建议对 Avro 数值类型使用精确的类型匹配，因为 ClickPipes 不会检查类型转换中的溢出或精度损失。或者，所有 Avro 类型可以插入到 `String` 列中，在这种情况下将作为有效的 JSON 字符串表示。

#### Nullable 类型和 Avro 联合 {#nullable-types-and-avro-unions}
Avro 中的 Nullable 类型通过使用 `(T, null)` 或 `(null, T)` 的联合模式定义，其中 T 是基本的 Avro 类型。在模式推断过程中，此类联合将映射到 ClickHouse "Nullable" 列。请注意，ClickHouse 不支持
`Nullable(Array)`、`Nullable(Map)` 或 `Nullable(Tuple)` 类型。这些类型的 Avro null 联合将映射到非 Nullable 版本（Avro Record 类型映射到 ClickHouse 命名的 Tuple）。对于这些类型的 Avro "null" 将插入为：
- 空 Array 对于空的 Avro array
- 空 Map 对于空的 Avro Map
- 具有所有默认/零值的命名 Tuple 对于空的 Avro Record

#### 变体类型支持 {#variant-type-support}
ClickPipes 在以下情况下支持变体类型：
- Avro 联合。如果您的 Avro 模式包含多个非空类型的联合，ClickPipes 将推断出适当的变体类型。对于 Avro 数据，变体类型在其他情况下不被支持。
- JSON 字段。您可以为源数据流中的任何 JSON 字段手动指定变体类型（例如 `Variant(String, Int64, DateTime)`）。由于 ClickPipes 确定使用正确变体子类型的方式，变体定义中只能使用一个整数或日期时间类型——例如，`Variant(Int64, UInt32)` 不被支持。

#### JSON 类型支持 {#json-type-support}
ClickPipes 在以下情况下支持 JSON 类型：
- Avro Record 类型始终可以分配给 JSON 列。
- Avro String 和 Bytes 类型可以分配给 JSON 列，前提是列确实包含 JSON 字符串对象。
- 始终为 JSON 对象的 JSON 字段可以分配给 JSON 目标列。

请注意，您需要手动将目标列更改为所需的 JSON 类型，包括任何固定或跳过的路径。

## Kafka 虚拟列 {#kafka-virtual-columns}

以下虚拟列对于与 Kafka 兼容的流式数据源是支持的。在创建新目标表时，可以通过使用 `Add Column` 按钮添加虚拟列。

| 名称                 | 描述                                         | 推荐数据类型       |
|----------------------|----------------------------------------------|--------------------|
| `_key`               | Kafka 消息键                                 | `String`           |
| `_timestamp`         | Kafka 时间戳（毫秒精度）                     | `DateTime64(3)`    |
| `_partition`         | Kafka 分区                                   | `Int32`            |
| `_offset`            | Kafka 偏移                                   | `Int64`            |
| `_topic`             | Kafka 主题                                   | `String`           |
| `_header_keys`       | 记录头中的键的并行数组                       | `Array(String)`    |
| `_header_values`     | 记录头中的值的并行数组                       | `Array(String)`    |
| `_raw_message`       | 完整的 Kafka 消息                            | `String`           |

请注意，`_raw_message` 列仅建议用于 JSON 数据。
对于仅需要 JSON 字符串的用例（例如，使用 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 函数来填充下游的物化视图），删除所有“非虚拟”列可能会提高 ClickPipes 的性能。
