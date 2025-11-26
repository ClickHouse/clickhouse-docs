---
alias: []
description: 'AvroConfluent 格式文档'
input_format: true
keywords: ['AvroConfluent']
output_format: false
slug: /interfaces/formats/AvroConfluent
title: 'AvroConfluent'
doc_type: 'reference'
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✔  | ✗  |    |


## 描述 {#description}

[Apache Avro](https://avro.apache.org/) 是一种行式序列化格式，使用二进制编码以提升数据处理效率。`AvroConfluent` 格式支持解码使用 [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html)（或与其 API 兼容的服务）序列化的、单对象 Avro 编码的 Kafka 消息。

每条 Avro 消息都会嵌入一个 schema ID，ClickHouse 会通过查询已配置的 schema registry 自动解析该 ID。解析完成后，schema 会被缓存以获得最佳性能。



<a id="data-types-matching"></a>
## 数据类型映射 {#data-type-mapping}

<DataTypesMatching/>



## 格式设置 {#format-settings}

[//]: # "NOTE These settings can be set at a session-level, but this isn't common and documenting it too prominently can be confusing to users."

| 设置                                       | 描述                                                                                               | 默认值  |
|-------------------------------------------|----------------------------------------------------------------------------------------------------|---------|
| `input_format_avro_allow_missing_fields`  | 当在模式（schema）中找不到字段时，是否使用默认值而不是抛出错误。                                   | `0`     |
| `input_format_avro_null_as_default`       | 当向非空列插入 `null` 值时，是否使用默认值而不是抛出错误。                                         | `0`     |
| `format_avro_schema_registry_url`         | Confluent Schema Registry 的 URL。对于基本身份验证，可以在 URL 路径中直接包含经过 URL 编码的凭据。 |         |



## 示例

### 使用 Schema Registry

要使用 [Kafka table engine](/engines/table-engines/integrations/kafka.md) 读取使用 Avro 编码的 Kafka 主题，请使用 `format_avro_schema_registry_url` 设置来指定 Schema Registry 的 URL。

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

#### 使用基本身份验证

如果你的 schema registry 需要基本身份验证（例如，你正在使用 Confluent Cloud），可以在 `format_avro_schema_registry_url` 设置中提供经过 URL 编码的凭据。

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


## 故障排查

要监控摄取进度并调试 Kafka consumer 的错误，可以查询 [`system.kafka_consumers` 系统表](../../../operations/system-tables/kafka_consumers.md)。如果部署包含多个副本（例如 ClickHouse Cloud），则必须使用 [`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md) 表函数。

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

如果遇到 Schema 解析问题，可以使用 [kafkacat](https://github.com/edenhill/kafkacat) 搭配 [clickhouse-local](/operations/utilities/clickhouse-local.md) 进行故障排查：

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```
