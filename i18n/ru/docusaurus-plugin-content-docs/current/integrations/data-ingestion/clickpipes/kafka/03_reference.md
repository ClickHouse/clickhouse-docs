---
sidebar_label: 'Справочник'
description: 'Содержит сведения о поддерживаемых форматах, источниках, семантике доставки, аутентификации и экспериментальных возможностях Kafka ClickPipes'
slug: /integrations/clickpipes/kafka/reference
sidebar_position: 1
title: 'Справочник'
doc_type: 'reference'
keywords: ['справочник по Kafka', 'clickpipes', 'источники данных', 'avro', 'виртуальные столбцы']
integration:
  - support_level: 'основной'
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

# Справочные материалы {#reference}

## Поддерживаемые источники данных {#supported-data-sources}

| Name                 |Logo|Type| Status          | Description                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| Stable          | Настройте ClickPipes и начните приём потоковых данных из Apache Kafka в ClickHouse Cloud.           |
| Confluent Cloud      |<Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>|Streaming| Stable          | Используйте совместные возможности Confluent и ClickHouse Cloud с помощью нашей прямой интеграции. |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Логотип Redpanda"/>|Streaming| Stable          | Настройте ClickPipes и начните приём потоковых данных из Redpanda в ClickHouse Cloud.               |
| AWS MSK              |<Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| Stable          | Настройте ClickPipes и начните приём потоковых данных из AWS MSK в ClickHouse Cloud.                |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>|Streaming| Stable          | Настройте ClickPipes и начните приём потоковых данных из Azure Event Hubs в ClickHouse Cloud.       |
| WarpStream           |<Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>|Streaming| Stable          | Настройте ClickPipes и начните приём потоковых данных из WarpStream в ClickHouse Cloud.             |

## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаются следующие форматы:

- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)

## Поддерживаемые типы данных {#supported-data-types}

### Стандартные {#standard-types-support}

В ClickPipes в настоящее время поддерживаются следующие стандартные типы данных ClickHouse:

- Базовые числовые типы — \[U\]Int8/16/32/64, Float32/64 и BFloat16
- Большие целочисленные типы — \[U\]Int128/256
- Типы Decimal
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64 (только часовой пояс UTC)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы ClickHouse с LowCardinality
- Map с ключами и значениями любых из перечисленных выше типов (включая Nullable)
- Tuple и Array с элементами любых из перечисленных выше типов (включая Nullable, только один уровень вложенности)
- Типы SimpleAggregateFunction (для целей AggregatingMergeTree или SummingMergeTree)

### Avro {#avro}

#### Поддерживаемые типы данных Avro {#supported-avro-data-types}

ClickPipes поддерживает все примитивные и сложные типы Avro, а также все логические типы Avro, за исключением `time-millis`, `time-micros`, `local-timestamp-millis`, `local_timestamp-micros` и `duration`. Типы Avro `record` преобразуются в Tuple, типы `array` — в Array, а `map` — в Map (только строковые ключи). В целом доступны преобразования, перечисленные [здесь](/interfaces/formats/Avro#data-type-mapping). Мы рекомендуем использовать точное соответствие типов для числовых типов Avro, так как ClickPipes не проверяет переполнение или потерю точности при преобразовании типов.
В качестве альтернативы все типы Avro могут быть записаны в столбец типа `String` и в этом случае будут представлены как корректная строка в формате JSON.

#### Типы Nullable и объединения Avro {#nullable-types-and-avro-unions}

Типы Nullable в Avro задаются с помощью схемы Union `(T, null)` или `(null, T)`, где T — базовый тип Avro. При выводе схемы такие объединения будут отображаться в столбец ClickHouse типа Nullable. Обратите внимание, что ClickHouse не поддерживает типы
`Nullable(Array)`, `Nullable(Map)` или `Nullable(Tuple)`. Объединения Avro с null для этих типов будут отображаться в не-Nullable версии (типы Avro Record отображаются в именованный Tuple в ClickHouse). Значения Avro `null` для этих типов будут вставляться как:

- Пустой Array для Avro-массива со значением null
- Пустой Map для Avro-отображения со значением null
- Именованный Tuple со всеми значениями по умолчанию/нулевыми значениями для Avro-записи со значением null

#### Поддержка типа Variant {#variant-type-support}

ClickPipes поддерживает тип Variant в следующих случаях:

- Avro Unions. Если ваша схема Avro содержит объединение (union) с несколькими типами, отличными от null, ClickPipes определит
  соответствующий тип Variant. В остальных случаях для данных Avro тип Variant не поддерживается.
- Поля JSON. Вы можете вручную указать тип Variant (например, `Variant(String, Int64, DateTime)`) для любого поля JSON
  во входящем потоке данных. Сложные подтипы (массивы/карты/кортежи) не поддерживаются. Кроме того, из-за того, как ClickPipes определяет
  корректный подтип Variant, в определении Variant может использоваться только один целочисленный или тип даты/времени — например, `Variant(Int64, UInt32)` не поддерживается.

#### Поддержка типа JSON {#json-type-support}

ClickPipes поддерживают тип JSON в следующих случаях:

- Типы Avro Record всегда могут быть назначены столбцу типа JSON.
- Типы Avro String и Bytes могут быть назначены столбцу типа JSON, если столбец фактически содержит объекты JSON типа String.
- Поля JSON, которые всегда являются объектом JSON, могут быть назначены целевому столбцу типа JSON.

Обратите внимание, что вам потребуется вручную изменить целевой столбец на нужный тип JSON, включая любые фиксированные или пропущенные пути.

## Виртуальные столбцы Kafka {#kafka-virtual-columns}

Ниже приведены виртуальные столбцы, поддерживаемые для потоковых источников данных, совместимых с Kafka. При создании новой целевой таблицы виртуальные столбцы можно добавить с помощью кнопки `Add Column`.

| Name             | Description                                                  | Recommended Data Type  |
|------------------|--------------------------------------------------------------|------------------------|
| `_key`           | Ключ сообщения Kafka                                         | `String`               |
| `_timestamp`     | Временная метка Kafka (точность в миллисекундах)            | `DateTime64(3)`        |
| `_partition`     | Партиция Kafka                                               | `Int32`                |
| `_offset`        | Смещение Kafka                                               | `Int64`                |
| `_topic`         | Топик Kafka                                                  | `String`               |
| `_header_keys`   | Параллельный массив ключей в заголовках записи              | `Array(String)`        |
| `_header_values` | Параллельный массив значений заголовков в заголовках записи | `Array(String)`        |
| `_raw_message`   | Полное сообщение Kafka                                       | `String`               |

Обратите внимание, что столбец `_raw_message` рекомендуется только для данных в формате JSON.  
В сценариях, когда требуется только строка JSON (например, при использовании функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для
заполнения последующей materialized view), можно повысить производительность ClickPipes, удалив все «невиртуальные» столбцы.