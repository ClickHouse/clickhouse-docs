---
alias: []
description: 'Документация для формата AvroConfluent'
input_format: true
keywords: ['AvroConfluent']
output_format: false
slug: /interfaces/formats/AvroConfluent
title: 'AvroConfluent'
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| Входные данные | Выходные данные | Псевдоним |
|----------------|----------------|-----------|
| ✔              | ✗              |           |

## Описание {#description}

AvroConfluent поддерживает декодирование однообъектных сообщений Avro, которые обычно используются с [Kafka](https://kafka.apache.org/) и [Confluent Schema Registry](https://docs.confluent.io/current/schema-registry/index.html).
Каждое сообщение Avro встраивает идентификатор схемы, который можно разрешить в фактическую схему с помощью Schema Registry.
Схемы кэшируются после разрешения.

## Сопоставление типов данных {#data_types-matching-1}

<DataTypesMatching/>

## Пример использования {#example-usage}

Чтобы быстро проверить разрешение схемы, вы можете использовать [kafkacat](https://github.com/edenhill/kafkacat) с [clickhouse-local](/operations/utilities/clickhouse-local.md):

```bash
$ kafkacat -b kafka-broker  -C -t topic1 -o beginning -f '%s' -c 3 | clickhouse-local   --input-format AvroConfluent --format_avro_schema_registry_url 'http://schema-registry' -S "field1 Int64, field2 String"  -q 'select *  from table'
1 a
2 b
3 c
```

Чтобы использовать `AvroConfluent` с [Kafka](/engines/table-engines/integrations/kafka.md):

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

-- для целей отладки вы можете установить format_avro_schema_registry_url в сессии.
-- этот способ нельзя использовать в производственной среде
SET format_avro_schema_registry_url = 'http://schema-registry';

SELECT * FROM topic1_stream;
```

## Настройки формата {#format-settings}

URL Schema Registry настраивается с помощью [`format_avro_schema_registry_url`](/operations/settings/settings-formats.md/#format_avro_schema_registry_url).

:::note
Настройку `format_avro_schema_registry_url` необходимо конфигурировать в `users.xml`, чтобы сохранить её значение после перезапуска. Также вы можете использовать настройку `format_avro_schema_registry_url` движка таблиц `Kafka`.
:::

| Настройка                                     | Описание                                                                                          | По умолчанию |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------|--------------|
| `input_format_avro_allow_missing_fields`     | Для формата Avro/AvroConfluent: если поле не найдено в схеме, используйте значение по умолчанию вместо ошибки | `0`          |
| `input_format_avro_null_as_default`          | Для формата Avro/AvroConfluent: вставьте значение по умолчанию в случае null и ненулевого столбца  |   `0`        |
| `format_avro_schema_registry_url`            | Для формата AvroConfluent: URL Confluent Schema Registry.                                         |              |
