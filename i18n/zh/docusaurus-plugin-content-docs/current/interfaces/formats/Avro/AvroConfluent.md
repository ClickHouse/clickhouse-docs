import DataTypesMatching from './_snippets/data-types-matching.md'

| 输入 | 输出 | 别名 |
|------|------|------|
| ✔    | ✗   |      |

## 描述 {#description}

AvroConfluent 支持解码与 [Kafka](https://kafka.apache.org/) 和 [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html) 一起使用的单对象 Avro 消息。每个 Avro 消息嵌入了一个可以在 Schema Registry 的帮助下解析为实际模式的模式 ID。模式在解析后会被缓存。

## 数据类型匹配 {#data_types-matching-1}

<DataTypesMatching/>

## 示例用法 {#example-usage}

为了快速验证模式解析，您可以使用 [kafkacat](https://github.com/edenhill/kafkacat) 和 [clickhouse-local](/operations/utilities/clickhouse-local.md)：

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```

要将 `AvroConfluent` 与 [Kafka](/engines/table-engines/integrations/kafka.md) 一起使用：

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

-- for debug purposes you can set format_avro_schema_registry_url in a session.
-- this way cannot be used in production
SET format_avro_schema_registry_url = 'http://schema-registry';

SELECT * FROM topic1_stream;
```

## 格式设置 {#format-settings}

Schema Registry URL 通过 [`format_avro_schema_registry_url`](/operations/settings/settings-formats.md/#format_avro_schema_registry_url) 进行配置。

:::note
设置 `format_avro_schema_registry_url` 需要在 `users.xml` 中配置，以保持其在重启后仍然有效。您也可以使用 `Kafka` 表引擎的 `format_avro_schema_registry_url` 设置。
:::

| 设置                                       | 描述                                                                                              | 默认   |
|-------------------------------------------|---------------------------------------------------------------------------------------------------|--------|
| `input_format_avro_allow_missing_fields`  | 对于 Avro/AvroConfluent 格式：当模式中未找到字段时，使用默认值而不是错误                           | `0`    |
| `input_format_avro_null_as_default`       | 对于 Avro/AvroConfluent 格式：在 null 和非 Nullable 列的情况下插入默认值                           | `0`    |
| `format_avro_schema_registry_url`         | 对于 AvroConfluent 格式：Confluent Schema Registry URL。                                         |        |
