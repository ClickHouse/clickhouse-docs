---
'alias': []
'description': 'AvroConfluent 格式的文档'
'input_format': true
'keywords':
- 'AvroConfluent'
'output_format': false
'slug': '/interfaces/formats/AvroConfluent'
'title': 'AvroConfluent'
'doc_type': 'reference'
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✗      |       |

## 描述 {#description}

[Apache Avro](https://avro.apache.org/) 是一种面向行的序列化格式，使用二进制编码以实现高效的数据处理。 `AvroConfluent` 格式支持解码使用 [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html)（或 API 兼容服务）序列化的单对象、Avro 编码的 Kafka 消息。

每个 Avro 消息嵌入一个模式 ID，ClickHouse 通过查询配置的模式注册表自动解析。解析后，模式会被缓存以优化性能。

<a id="data-types-matching"></a>
## 数据类型映射 {#data-type-mapping}

<DataTypesMatching/>

## 格式设置 {#format-settings}

[//]: # "注意 这些设置可以在会话级别设置，但这并不常见，并且过于突出地记录可能会让用户感到困惑。"

| 设置                                     | 描述                                                                                               | 默认   |
|-----------------------------------------|---------------------------------------------------------------------------------------------------|-------|
| `input_format_avro_allow_missing_fields`    | 当模式中未找到字段时，是否使用默认值而不是抛出错误。                                           | `0`   |
| `input_format_avro_null_as_default`         | 当向非可空列插入 `null` 值时，是否使用默认值而不是抛出错误。                                 | `0`   |
| `format_avro_schema_registry_url`           | Confluent Schema Registry 的 URL。对于基本身份验证，URL 编码的凭据可以直接包含在 URL 路径中。 |       |

## 示例 {#examples}

### 使用模式注册表 {#using-a-schema-registry}

要使用 [Kafka 表引擎](/engines/table-engines/integrations/kafka.md) 读取 Avro 编码的 Kafka 主题，请使用 `format_avro_schema_registry_url` 设置提供模式注册表的 URL。

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

#### 使用基本身份验证 {#using-basic-authentication}

如果您的模式注册表需要基本身份验证（例如，如果您使用的是 Confluent Cloud），您可以在 `format_avro_schema_registry_url` 设置中提供 URL 编码的凭据。

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

## 故障排除 {#troubleshooting}

要监控数据摄取进度并调试 Kafka 消费者的错误，您可以查询 [`system.kafka_consumers` 系统表](../../../operations/system-tables/kafka_consumers.md)。如果您的部署有多个副本（例如，ClickHouse Cloud），您必须使用 [`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md) 表函数。

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

如果遇到模式解析问题，可以使用 [kafkacat](https://github.com/edenhill/kafkacat) 和 [clickhouse-local](/operations/utilities/clickhouse-local.md) 进行故障排除：

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```
