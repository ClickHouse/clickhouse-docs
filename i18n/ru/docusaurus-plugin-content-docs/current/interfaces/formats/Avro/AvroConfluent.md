---
alias: []
description: 'Документация о формате AvroConfluent'
input_format: true
keywords: ['AvroConfluent']
output_format: true
slug: /interfaces/formats/AvroConfluent
title: 'AvroConfluent'
doc_type: 'reference'
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| Ввод | Вывод | Псевдоним |
| ---- | ----- | --------- |
| ✔    | ✔     |           |

## Описание \{#description\}

[Apache Avro](https://avro.apache.org/) — это строчно-ориентированный формат сериализации, который использует двоичное кодирование для эффективной обработки данных. Формат `AvroConfluent` поддерживает чтение и запись сообщений, закодированных в Avro, с использованием [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html) (или API-совместимых сервисов).

В каждом сообщении используется формат передачи данных Confluent: магический байт (`0x00`), за которым следует 4-байтовый идентификатор схемы в формате big-endian, а затем двоичные данные Avro. При чтении ClickHouse определяет идентификатор схемы, обращаясь к реестру. При записи ClickHouse регистрирует схему, полученную на основе выходных столбцов, и добавляет полученный идентификатор в начало каждой строки. Схемы кэшируются для оптимальной производительности.

<a id="data-types-matching" />

## Сопоставление типов данных \{#data-type-mapping\}

<DataTypesMatching/>

## Настройки формата \{#format-settings\}

[//]: # "NOTE Эти настройки могут быть заданы на уровне сессии, но это используется нечасто, и слишком подробная документация по этому поводу может запутать пользователей."

| Параметр                                         | Описание                                                                                                                                                                     | Значение по умолчанию |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `input_format_avro_allow_missing_fields`         | Использовать ли значение по умолчанию вместо возникновения ошибки, когда поле не найдено в схеме.                                                                            | `0`                   |
| `input_format_avro_null_as_default`              | Использовать ли значение по умолчанию вместо возникновения ошибки при вставке значения `null` в столбец, не допускающий значения `null`.                                     | `0`                   |
| `format_avro_schema_registry_url`                | URL Confluent Schema Registry. Для базовой аутентификации URL-кодированные учетные данные могут быть включены непосредственно в путь URL.                                    |                       |
| `format_avro_schema_registry_connection_timeout` | Тайм-аут соединения в секундах для HTTP-клиента Schema Registry (используется как для получения схемы, так и для регистрации). Должен быть больше 0 и меньше 600 (10 минут). | `1`                   |
| `format_avro_schema_registry_send_timeout`       | Тайм-аут отправки в секундах для HTTP-клиента Schema Registry. Должен быть больше 0 и меньше 600 (10 минут).                                                                 | `1`                   |
| `format_avro_schema_registry_receive_timeout`    | Тайм-аут получения в секундах для HTTP-клиента Schema Registry. Должен быть больше 0 и меньше 600 (10 минут).                                                                | `1`                   |
| `output_format_avro_confluent_subject`           | Для вывода: имя subject, под которым схема регистрируется в Schema Registry. Обязательно при записи.                                                                         |                       |
| `output_format_avro_string_column_pattern`       | Для вывода: регулярное выражение для столбцов типа String, которые нужно сериализовать как Avro `string` (по умолчанию — `bytes`).                                           |                       |

## Примеры \{#examples\}

### Чтение из Kafka \{#reading-from-kafka\}

Чтобы прочитать Kafka-топик, закодированный в Avro, с помощью [движка таблиц Kafka](/engines/table-engines/integrations/kafka.md), используйте настройку `format_avro_schema_registry_url` для указания URL-адреса реестра схем.

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

### Запись в Kafka \{#writing-to-kafka\}

Чтобы записывать сообщения AvroConfluent в Kafka-топик, укажите URL-адрес реестра схем и имя subject. При первой записи схема автоматически регистрируется в реестре.

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

#### Использование базовой аутентификации \{#using-basic-authentication\}

Если для вашего реестра схем требуется базовая аутентификация (например, при использовании Confluent Cloud), вы можете указать URL-кодированные учетные данные в настройке `format_avro_schema_registry_url`.

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

## Диагностика неполадок \{#troubleshooting\}

Чтобы отслеживать ход ингестии и отлаживать ошибки потребителя Kafka, вы можете выполнить запрос к [системной таблице `system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md). Если в вашем развертывании несколько реплик (например, ClickHouse Cloud), необходимо использовать табличную функцию [`clusterAllReplicas`](../../../sql-reference/table-functions/cluster.md).

```sql
SELECT * FROM clusterAllReplicas('default',system.kafka_consumers)
ORDER BY assignments.partition_id ASC;
```

Если вы столкнулись с проблемами с разрешением схемы, вы можете использовать [kafkacat](https://github.com/edenhill/kafkacat) вместе с [clickhouse-local](/operations/utilities/clickhouse-local.md) для диагностики:

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```
