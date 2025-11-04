---
slug: '/interfaces/formats/AvroConfluent'
description: 'Документация для формата AvroConfluent'
title: AvroConfluent
keywords: ['AvroConfluent']
doc_type: reference
input_format: true
output_format: false
---
import DataTypesMatching from './_snippets/data-types-matching.md'

| Входные данные | Выходные данные | Псевдоним |
|----------------|-----------------|-----------|
| ✔              | ✗               |           |

## Описание {#description}

[Apache Avro](https://avro.apache.org/) — это ориентированный на строки формат сериализации, который использует двоичное кодирование для эффективной обработки данных. Формат `AvroConfluent` поддерживает декодирование однообъектных сообщений Kafka, закодированных в формате Avro, сериализованных с использованием [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html) (или совместимых с API сервисов).

Каждое сообщение Avro встраивает идентификатор схемы, который ClickHouse автоматически разрешает, запрашивая настроенный реестр схем. После разрешения схемы кэшируются для оптимальной производительности.

<a id="data-types-matching"></a>
## Соответствие типов данных {#data-type-mapping}

<DataTypesMatching/>

## Настройки формата {#format-settings}

[//]: # "NOTE Эти настройки могут быть установлены на уровне сессии, но это не распространено, и слишком явная документация может запутать пользователей."

| Настройка                                     | Описание                                                                                                  | По умолчанию |
|-----------------------------------------------|-----------------------------------------------------------------------------------------------------------|--------------|
| `input_format_avro_allow_missing_fields`      | Использовать ли значение по умолчанию вместо генерации ошибки, когда поле не найдено в схеме.            | `0`          |
| `input_format_avro_null_as_default`           | Использовать ли значение по умолчанию вместо генерации ошибки при вставке значения `null` в ненулевую колонку. |   `0`       |
| `format_avro_schema_registry_url`             | URL реестра схем Confluent. Для базовой аутентификации учетные данные можно включить непосредственно в путь URL. |              |

## Примеры {#examples}

### Использование реестра схем {#using-a-schema-registry}

Чтобы прочитать топик Kafka, закодированный в формате Avro, используя [движок таблиц Kafka](/engines/table-engines/integrations/kafka.md), используйте настройку `format_avro_schema_registry_url`, чтобы указать URL реестра схем.

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

#### Использование базовой аутентификации {#using-basic-authentication}

Если ваш реестр схем требует базовой аутентификации (например, если вы используете Confluent Cloud), вы можете предоставить закодированные в URL учетные данные в настройке `format_avro_schema_registry_url`.

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

## Устранение неполадок {#troubleshooting}

Чтобы отслеживать процесс приема данных и отлаживать ошибки с потребителем Kafka, вы можете запрашивать [`system.kafka_consumers` системную таблицу](../../../operations/system-tables/kafka_consumers.md). Если в вашей развертке несколько реплик (например, ClickHouse Cloud), вам нужно использовать табличную функцию [`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md).

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

Если вы столкнулись с проблемами разрешения схемы, вы можете использовать [kafkacat](https://github.com/edenhill/kafkacat) с [clickhouse-local](/operations/utilities/clickhouse-local.md) для устранения неполадок:

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```