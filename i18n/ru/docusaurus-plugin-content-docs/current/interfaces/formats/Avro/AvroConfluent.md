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

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✔    | ✗     |           |


## Описание {#description}

[Apache Avro](https://avro.apache.org/) — это строчно-ориентированный формат сериализации, который использует двоичное кодирование для эффективной обработки данных. Формат `AvroConfluent` поддерживает декодирование отдельных Avro-сообщений Kafka, сериализованных с использованием [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html) (или API-совместимых сервисов).

Каждое Avro-сообщение содержит идентификатор схемы, который ClickHouse автоматически определяет, обращаясь к настроенному реестру схем. После этого схемы кэшируются для оптимизации производительности.



<a id="data-types-matching"></a>
## Сопоставление типов данных {#data-type-mapping}

<DataTypesMatching/>



## Настройки формата {#format-settings}

[//]: # "ПРИМЕЧАНИЕ Эти настройки можно задавать на уровне сессии, но это используется редко, а слишком заметное упоминание в документации может запутать пользователей."

| Настройка                                  | Описание                                                                                           | Значение по умолчанию |
|--------------------------------------------|----------------------------------------------------------------------------------------------------|------------------------|
| `input_format_avro_allow_missing_fields`   | Использовать ли значение по умолчанию вместо выдачи ошибки, если поле не найдено в схеме.         | `0`                    |
| `input_format_avro_null_as_default`        | Использовать ли значение по умолчанию вместо выдачи ошибки при вставке значения `null` в столбец, который не допускает `null`. | `0`                    |
| `format_avro_schema_registry_url`          | URL Confluent Schema Registry. Для базовой аутентификации URL-кодированные учетные данные можно включить непосредственно в путь URL. |                        |



## Примеры

### Использование реестра схем

Чтобы читать топик Kafka в формате Avro с помощью [табличного движка Kafka](/engines/table-engines/integrations/kafka.md), используйте настройку `format_avro_schema_registry_url`, чтобы указать URL-адрес реестра схем.

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

#### Использование базовой аутентификации

Если ваш реестр схем требует базовой аутентификации (например, при использовании Confluent Cloud), вы можете указать URL-кодированные учетные данные в параметре `format_avro_schema_registry_url`.

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


## Устранение неполадок

Чтобы отслеживать ход ингестии и диагностировать ошибки работы потребителя Kafka, вы можете выполнить запрос к [системной таблице `system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md). Если в вашем развертывании несколько реплик (например, ClickHouse Cloud), необходимо использовать табличную функцию [`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md).

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

Если у вас возникают проблемы с разрешением схем, вы можете использовать [kafkacat](https://github.com/edenhill/kafkacat) вместе с [clickhouse-local](/operations/utilities/clickhouse-local.md) для отладки:

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```
