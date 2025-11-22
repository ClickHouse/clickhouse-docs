---
alias: []
description: 'Документация по формату AvroConfluent'
input_format: true
keywords: ['AvroConfluent']
output_format: false
slug: /interfaces/formats/AvroConfluent
title: 'AvroConfluent'
doc_type: 'reference'
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| Вход | Выход | Алиас |
| ---- | ----- | ----- |
| ✔    | ✗     |       |


## Описание {#description}

[Apache Avro](https://avro.apache.org/) — это строчно-ориентированный формат сериализации, использующий бинарное кодирование для эффективной обработки данных. Формат `AvroConfluent` поддерживает декодирование одиночных Avro-сообщений Kafka, сериализованных с использованием [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html) (или API-совместимых сервисов).

Каждое Avro-сообщение содержит идентификатор схемы, который ClickHouse автоматически разрешает, выполняя запрос к настроенному реестру схем. После разрешения схемы кэшируются для оптимальной производительности.


<a id="data-types-matching"></a>
## Сопоставление типов данных {#data-type-mapping}

<DataTypesMatching />


## Настройки формата {#format-settings}

[//]: # "NOTE These settings can be set at a session-level, but this isn't common and documenting it too prominently can be confusing to users."

| Настройка                                | Описание                                                                                                                       | Значение по умолчанию |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `input_format_avro_allow_missing_fields` | Использовать значение по умолчанию вместо генерации ошибки, если поле отсутствует в схеме.                           | `0`     |
| `input_format_avro_null_as_default`      | Использовать значение по умолчанию вместо генерации ошибки при вставке значения `null` в столбец, не допускающий NULL.          | `0`     |
| `format_avro_schema_registry_url`        | URL Confluent Schema Registry. Для базовой аутентификации учетные данные в URL-кодировке можно указать непосредственно в пути URL. |         |


## Примеры {#examples}

### Использование реестра схем {#using-a-schema-registry}

Для чтения топика Kafka в формате Avro с помощью [движка таблиц Kafka](/engines/table-engines/integrations/kafka.md) используйте настройку `format_avro_schema_registry_url` для указания URL реестра схем.

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

Если ваш реестр схем требует базовую аутентификацию (например, при использовании Confluent Cloud), вы можете указать учетные данные в URL-кодированном виде в настройке `format_avro_schema_registry_url`.

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

Для мониторинга процесса загрузки данных и отладки ошибок потребителя Kafka можно выполнить запрос к [системной таблице `system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md). Если ваше развёртывание содержит несколько реплик (например, ClickHouse Cloud), необходимо использовать табличную функцию [`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md).

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

Если возникают проблемы с разрешением схемы, можно использовать [kafkacat](https://github.com/edenhill/kafkacat) совместно с [clickhouse-local](/operations/utilities/clickhouse-local.md) для диагностики:

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```
