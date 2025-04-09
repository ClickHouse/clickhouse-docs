---
title: 'AvroConfluent'
slug: '/interfaces/formats/AvroConfluent'
keywords: ['AvroConfluent']
input_format: true
output_format: false
alias: []
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |

## Description {#description}

AvroConfluent 支持解码在 [Kafka](https://kafka.apache.org/) 和 [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html) 中常用的单对象 Avro 消息。每个 Avro 消息嵌入一个 schema ID，可以借助 Schema Registry 解析为实际的 schema。schemas 在解析后会被缓存。

## Data Types Matching {#data_types-matching-1}

<DataTypesMatching/>

## Example Usage {#example-usage}

要快速验证 schema 的解析，可以使用 [kafkacat](https://github.com/edenhill/kafkacat) 与 [clickhouse-local](/operations/utilities/clickhouse-local.md)：

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```

要在 [Kafka](/engines/table-engines/integrations/kafka.md) 中使用 `AvroConfluent`：

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
kafka_format = 'AvroConfluent';

-- 出于调试目的，您可以在会话中设置 format_avro_schema_registry_url。
-- 这种方法不能在生产中使用
SET format_avro_schema_registry_url = 'http://schema-registry';

SELECT * FROM topic1_stream;
```

## Format Settings {#format-settings}

Schema Registry URL 通过 [`format_avro_schema_registry_url`](/operations/settings/settings-formats.md/#format_avro_schema_registry_url) 进行配置。

:::note
设置 `format_avro_schema_registry_url` 需要在 `users.xml` 中配置，以便在重启后保持其值。您也可以使用 `Kafka` 表引擎的 `format_avro_schema_registry_url` 设置。
:::

| Setting                                     | Description                                                                                         | Default |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------|---------|
| `input_format_avro_allow_missing_fields`    | 对于 Avro/AvroConfluent 格式：当在 schema 中找不到字段时，使用默认值而不是错误。                             | `0`     |
| `input_format_avro_null_as_default`         | 对于 Avro/AvroConfluent 格式：在 null 和非 Nullable 列的情况下插入默认值。                                      |   `0`   |
| `format_avro_schema_registry_url`           | 对于 AvroConfluent 格式：Confluent Schema Registry URL。                                            |         |
