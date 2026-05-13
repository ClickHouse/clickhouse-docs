---
alias: []
description: 'AvroConfluent 格式文档'
input_format: true
keywords: ['AvroConfluent']
output_format: true
slug: /interfaces/formats/AvroConfluent
title: 'AvroConfluent'
doc_type: 'reference'
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✔  | ✔  |    |

## 描述 \{#description\}

[Apache Avro](https://avro.apache.org/) 是一种面向行的序列化格式，使用二进制编码以实现高效的数据处理。`AvroConfluent` 格式支持使用 [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html) (或 API 兼容服务) 读取和写入采用 Avro 编码的消息。

每条消息都使用 Confluent 传输格式：一个魔数字节 (`0x00`) ，后跟 4 字节的大端 schema ID，再后跟 Avro 二进制数据。在读取时，ClickHouse 会通过查询 Schema Registry 解析 schema ID。在写入时，ClickHouse 会注册根据输出列派生的 schema，并将生成的 ID 预加到每一行之前。schema 会被缓存，以获得最佳性能。

<a id="data-types-matching" />

## 数据类型映射 \{#data-type-mapping\}

<DataTypesMatching/>

## 格式设置 \{#format-settings\}

[//]: # "NOTE These settings can be set at a session-level, but this isn't common and documenting it too prominently can be confusing to users."

| Setting                                          | Description                                                                | Default |
| ------------------------------------------------ | -------------------------------------------------------------------------- | ------- |
| `input_format_avro_allow_missing_fields`         | 指定在模式中找不到字段时，是否使用默认值而不是抛出错误。                                               | `0`     |
| `input_format_avro_null_as_default`              | 指定在向非空列插入 `null` 值时，是否使用默认值而不是抛出错误。                                        | `0`     |
| `format_avro_schema_registry_url`                | Confluent Schema Registry 的 URL。对于基本身份验证，可以在 URL 中直接包含经过 URL 编码的凭据。        |         |
| `format_avro_schema_registry_connection_timeout` | Schema Registry HTTP 客户端的连接超时时间 (秒)  (用于模式拉取和注册) 。必须大于 0 且小于 600 (10 分钟) 。 | `1`     |
| `format_avro_schema_registry_send_timeout`       | Schema Registry HTTP 客户端的发送超时时间 (秒) 。必须大于 0 且小于 600 (10 分钟) 。              | `1`     |
| `format_avro_schema_registry_receive_timeout`    | Schema Registry HTTP 客户端的接收超时时间 (秒) 。必须大于 0 且小于 600 (10 分钟) 。              | `1`     |
| `output_format_avro_confluent_subject`           | 用于输出：schema 在 Schema Registry 中注册时使用的 subject 名称。写入时必需。                    |         |
| `output_format_avro_string_column_pattern`       | 用于输出：要序列化为 Avro `string` 的 String 列的正则表达式 (默认为 `bytes`) 。                  |         |

## 示例 \{#examples\}

### 从 Kafka 读取 \{#reading-from-kafka\}

要使用 [Kafka 表引擎](/engines/table-engines/integrations/kafka.md) 读取使用 Avro 编码的 topic，请通过 `format_avro_schema_registry_url` 设置指定 schema registry 的 URL。

```sql
CREATE TABLE topic1_stream
(
    field1 String,
    field2 String
)
ENGINE = Kafka()
SETTINGS
kafka_broker_list = 'kafka-broker',
kafka_topic_list = 'topic1',
kafka_group_name = 'group1',
kafka_format = 'AvroConfluent',
format_avro_schema_registry_url = 'http://schema-registry-url';

SELECT * FROM topic1_stream;
```

### 写入 Kafka \{#writing-to-kafka\}

要将 AvroConfluent 消息写入 Kafka topic，请同时设置 Schema Registry 的 URL 和 subject 名称。首次写入时，schema 会自动注册到 registry 中。

```sql
CREATE TABLE topic1_sink
(
    field1 String,
    field2 String
)
ENGINE = Kafka()
SETTINGS
kafka_broker_list = 'kafka-broker',
kafka_topic_list = 'topic1',
kafka_format = 'AvroConfluent',
format_avro_schema_registry_url = 'http://schema-registry-url',
output_format_avro_confluent_subject = 'topic1-value';

INSERT INTO topic1_sink VALUES ('hello', 'world');
```

#### 使用基本身份验证 \{#using-basic-authentication\}

如果 schema registry 需要基本身份验证（例如使用 Confluent Cloud 时），可以在 `format_avro_schema_registry_url` 设置中提供经过 URL 编码的凭证。

```sql
CREATE TABLE topic1_stream
(
    field1 String,
    field2 String
)
ENGINE = Kafka()
SETTINGS
kafka_broker_list = 'kafka-broker',
kafka_topic_list = 'topic1',
kafka_group_name = 'group1',
kafka_format = 'AvroConfluent',
format_avro_schema_registry_url = 'https://<username>:<password>@schema-registry-url';
```

## 故障排查 \{#troubleshooting\}

要监控摄取进度并调试 Kafka 消费者的错误，可以查询 [`system.kafka_consumers` 系统表](../../../operations/system-tables/kafka_consumers.md)。如果您的部署有多个副本（例如 ClickHouse Cloud），则必须使用 [`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md) 表函数。

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

如果遇到 schema 解析相关问题，可以使用 [kafkacat](https://github.com/edenhill/kafkacat) 搭配 [clickhouse-local](/operations/utilities/clickhouse-local.md) 进行排查：

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```
