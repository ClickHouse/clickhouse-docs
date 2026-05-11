---
sidebar_label: 'Справочник'
description: 'Описание поддерживаемых форматов, источников, семантики доставки сообщений, аутентификации и экспериментальных функций Kafka ClickPipes'
slug: /integrations/clickpipes/kafka/reference
sidebar_position: 1
title: 'Справочник'
doc_type: 'reference'
keywords: ['справочник по Kafka', 'ClickPipes', 'источники данных', 'avro', 'виртуальные столбцы']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';


# Справочник \{#reference\}

## Поддерживаемые источники данных \{#supported-data-sources\}

| Название             |Логотип|Тип| Статус         | Описание                                                                                              |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните приём потоковых данных из Apache Kafka в ClickHouse Cloud.           |
| Confluent Cloud      |<Confluentsvg class="image" alt="логотип Confluent Cloud" style={{width: '3rem'}}/>|Потоковый| Стабильный      | Задействуйте совокупную мощь Confluent и ClickHouse Cloud с помощью нашей прямой интеграции.        |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="логотип Redpanda"/>|Потоковый| Стабильный      | Настройте ClickPipes и начните приём потоковых данных из Redpanda в ClickHouse Cloud.               |
| AWS MSK              |<Msksvg class="image" alt="логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните приём потоковых данных из AWS MSK в ClickHouse Cloud.                |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="логотип Azure Event Hubs" style={{width: '3rem'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните приём потоковых данных из Azure Event Hubs в ClickHouse Cloud.       |
| WarpStream           |<Warpstreamsvg class="image" alt="логотип WarpStream" style={{width: '3rem'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните приём потоковых данных из WarpStream в ClickHouse Cloud.             |

## Поддерживаемые форматы данных \{#supported-data-formats\}

Поддерживаемые форматы следующие:

- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)

## Поддерживаемые типы данных \{#supported-data-types\}

### Стандартные \{#standard-types-support\}

В ClickPipes в данный момент поддерживаются следующие стандартные типы данных ClickHouse:

- базовые числовые типы — \[U\]Int8/16/32/64, Float32/64 и BFloat16
- большие целочисленные типы — \[U\]Int128/256
- типы Decimal
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64 (только часовой пояс UTC)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы ClickHouse LowCardinality
- Map с ключами и значениями любого из перечисленных выше типов (включая Nullable)
- Tuple и Array с элементами любого из перечисленных выше типов (включая Nullable, только один уровень вложенности)
- типы SimpleAggregateFunction (для целевых таблиц на AggregatingMergeTree или SummingMergeTree)

### Avro \{#avro\}

#### Поддерживаемые типы данных Avro \{#supported-avro-data-types\}

ClickPipes поддерживает все примитивные и сложные типы Avro, а также все логические типы Avro, кроме `time-millis`, `time-micros`, `local-timestamp-millis`, `local_timestamp-micros` и `duration`. Типы Avro `record` преобразуются в Tuple, типы `array` — в Array, а `map` — в Map (только строковые ключи). В целом доступны преобразования, перечисленные [здесь](/interfaces/formats/Avro#data-type-mapping). Рекомендуется использовать точное соответствие типов для числовых типов Avro, так как ClickPipes не проверяет переполнение или потерю точности при преобразовании типов.
В качестве альтернативы все типы Avro можно записывать в столбец `String`, и в этом случае они будут представлены в виде валидной JSON-строки.

#### Типы Nullable и объединения Avro \{#nullable-types-and-avro-unions\}

Типы Nullable в Avro задаются с помощью схемы Union `(T, null)` или `(null, T)`, где T — базовый тип Avro. Во время вывода схемы такие объединения будут отображены в столбец ClickHouse типа Nullable. Обратите внимание, что ClickHouse не поддерживает
типы `Nullable(Array)`, `Nullable(Map)` или `Nullable(Tuple)`. Объединения Avro с null для этих типов будут отображены в варианты, не допускающие NULL (типы Avro Record отображаются в именованный Tuple в ClickHouse). Значения null в Avro для этих типов будут вставляться как:

- Пустой Array для массива Avro со значением null
- Пустой Map для Map Avro со значением null
- Именованный Tuple со всеми значениями по умолчанию/нулевыми значениями для Record Avro со значением null

#### Поддержка типа Variant \{#variant-type-support\}

ClickPipes поддерживает тип Variant в следующих случаях:

- Объединения Avro (Avro unions). Если ваша схема Avro содержит union с несколькими типами, отличными от null, ClickPipes выведет
  соответствующий тип Variant. В остальных случаях тип Variant для данных Avro не поддерживается.
- Поля JSON. Вы можете вручную указать тип Variant (например, `Variant(String, Int64, DateTime)`) для любого поля JSON
  во входящем потоке данных. Сложные подтипы (массивы/отображения/кортежи) не поддерживаются. Кроме того, из-за того, как ClickPipes определяет
  корректный подтип Variant, в определении Variant может использоваться только один целочисленный или один тип даты/времени — например, `Variant(Int64, UInt32)` не поддерживается.

#### Поддержка типа JSON \{#json-type-support\}

ClickPipes поддерживают тип JSON в следующих случаях:

- Типы Avro Record всегда можно сопоставить со столбцом типа JSON.
- Типы Avro String и Bytes можно сопоставить со столбцом типа JSON, если в столбце фактически хранятся строки в формате JSON.
- Поля JSON, которые всегда являются JSON-объектом, можно сопоставить с целевым столбцом типа JSON.

Обратите внимание, что целевой столбец (включая любые явно заданные или пропускаемые пути) вам потребуется вручную изменить на нужный тип JSON.

## Виртуальные столбцы Kafka \{#kafka-virtual-columns\}

Для потоковых источников данных, совместимых с Kafka, доступны следующие виртуальные столбцы. При создании новой целевой таблицы виртуальные столбцы можно добавить с помощью кнопки `Add Column`.

| Name             | Description                                                  | Recommended Data Type  |
|------------------|--------------------------------------------------------------|------------------------|
| `_key`           | Kafka Message Key                                            | `String`               |
| `_timestamp`     | Kafka Timestamp (точность в миллисекундах)                  | `DateTime64(3)`        |
| `_partition`     | Kafka Partition                                              | `Int32`                |
| `_offset`        | Kafka Offset                                                 | `Int64`                |
| `_topic`         | Kafka Topic                                                  | `String`               |
| `_header_keys`   | Параллельный массив ключей в заголовках (Headers) записи    | `Array(String)`        |
| `_header_values` | Параллельный массив значений заголовков (Headers) записи    | `Array(String)`        |
| `_raw_message`   | Полное сообщение Kafka                                       | `String`               |

Обратите внимание, что столбец `_raw_message` рекомендуется использовать только для данных в формате JSON. 
Для сценариев, когда требуется только JSON-строка (например, при использовании функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для
заполнения нижестоящего materialized view), можно повысить производительность ClickPipes, удалив все «не виртуальные» столбцы.