---
sidebar_label: 'Справочник'
description: 'Описывает поддерживаемые форматы и источники данных, семантику доставки, аутентификацию и экспериментальные возможности Kafka ClickPipes'
slug: /integrations/clickpipes/kafka/reference
sidebar_position: 1
title: 'Справочник'
doc_type: 'reference'
keywords: ['справочник по Kafka', 'clickpipes', 'источники данных', 'avro', 'виртуальные столбцы']
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';


# Справочник {#reference}



## Поддерживаемые источники данных {#supported-data-sources}

| Название             |Логотип|Тип| Статус         | Описание                                                                                             |
|----------------------|-------|---|----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните приём потоковых данных из Apache Kafka в ClickHouse Cloud.           |
| Confluent Cloud      |<Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>|Потоковый| Стабильный      | Используйте совместные возможности Confluent и ClickHouse Cloud благодаря нашей прямой интеграции. |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Логотип Redpanda"/>|Потоковый| Стабильный      | Настройте ClickPipes и начните приём потоковых данных из Redpanda в ClickHouse Cloud.               |
| AWS MSK              |<Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните приём потоковых данных из AWS MSK в ClickHouse Cloud.                |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните приём потоковых данных из Azure Event Hubs в ClickHouse Cloud.       |
| WarpStream           |<Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>|Потоковый| Стабильный      | Настройте ClickPipes и начните приём потоковых данных из WarpStream в ClickHouse Cloud.             |



## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаются следующие форматы:
- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)



## Поддерживаемые типы данных {#supported-data-types}

### Стандартные {#standard-types-support}

Следующие стандартные типы данных ClickHouse в настоящее время поддерживаются в ClickPipes:

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
- все типы LowCardinality ClickHouse
- Map с ключами и значениями любых из перечисленных выше типов (включая Nullable)
- Tuple и Array с элементами любых из перечисленных выше типов (включая Nullable, только один уровень вложенности)
- Типы SimpleAggregateFunction (для целевых объектов AggregatingMergeTree или SummingMergeTree)

### Avro {#avro}

#### Поддерживаемые типы данных Avro {#supported-avro-data-types}
ClickPipes поддерживает все примитивные и составные типы Avro, а также все логические типы Avro, за исключением `time-millis`, `time-micros`, `local-timestamp-millis`, `local_timestamp-micros` и `duration`. Типы Avro `record` конвертируются в Tuple, типы `array` — в Array, а `map` — в Map (только строковые ключи). Как правило, доступны преобразования, перечисленные [здесь](/interfaces/formats/Avro#data-type-mapping). Рекомендуется использовать точное соответствие типов для числовых типов Avro, так как ClickPipes не проверяет переполнение или потерю точности при преобразовании типов.
В качестве альтернативы все типы Avro могут быть вставлены в столбец `String` и в этом случае будут представлены в виде корректной JSON-строки.

#### Типы Nullable и объединения Avro (unions) {#nullable-types-and-avro-unions}
Типы Nullable в Avro определяются с использованием Union-схемы `(T, null)` или `(null, T)`, где T — базовый тип Avro. Во время вывода схемы такие объединения будут отображены в столбец ClickHouse типа `Nullable`. Обратите внимание, что ClickHouse не поддерживает типы
`Nullable(Array)`, `Nullable(Map)` или `Nullable(Tuple)`. Объединения Avro с null для этих типов будут отображены на версии без Nullable (типы Avro Record отображаются в именованный Tuple ClickHouse). Значения Avro `null` для этих типов будут вставляться как:
- пустой Array для null-массива Avro
- пустой Map для null-Map Avro
- именованный Tuple со всеми значениями по умолчанию/нулевыми значениями для null-Record Avro

#### Поддержка типа Variant {#variant-type-support}
ClickPipes поддерживает тип Variant в следующих случаях:
- Объединения Avro (Unions). Если ваша схема Avro содержит объединение с несколькими типами, отличными от null, ClickPipes выведет
  соответствующий тип Variant. Типы Variant в иных случаях для данных Avro не поддерживаются.
- JSON-поля. Вы можете вручную указать тип Variant (например, `Variant(String, Int64, DateTime)`) для любого JSON-поля
  во входящем потоке данных. Из-за способа, которым ClickPipes определяет корректный подтип Variant для использования, в определении Variant может использоваться только один целочисленный или тип datetime — например, `Variant(Int64, UInt32)` не поддерживается.

#### Поддержка типа JSON {#json-type-support}
ClickPipes поддерживает тип JSON в следующих случаях:
- Типы Avro Record всегда можно сопоставить со столбцом JSON.
- Типы Avro String и Bytes можно сопоставить со столбцом JSON, если столбец фактически содержит JSON-строки.
- JSON-поля, которые всегда являются JSON-объектом, могут быть сопоставлены с целевым столбцом типа JSON.

Обратите внимание, что вам потребуется вручную изменить целевой столбец на нужный тип JSON, включая любые фиксированные или пропускаемые пути.



## Виртуальные столбцы Kafka {#kafka-virtual-columns}

Для потоковых источников данных, совместимых с Kafka, поддерживаются следующие виртуальные столбцы. При создании новой целевой таблицы виртуальные столбцы можно добавить, нажав кнопку `Add Column`.

| Name             | Description                                                  | Recommended Data Type  |
|------------------|--------------------------------------------------------------|------------------------|
| `_key`           | Ключ сообщения Kafka                                         | `String`               |
| `_timestamp`     | Метка времени Kafka (точность до миллисекунд)               | `DateTime64(3)`        |
| `_partition`     | Раздел Kafka                                                 | `Int32`                |
| `_offset`        | Смещение Kafka                                               | `Int64`                |
| `_topic`         | Топик Kafka                                                  | `String`               |
| `_header_keys`   | Параллельный массив ключей в заголовках записи              | `Array(String)`        |
| `_header_values` | Параллельный массив значений заголовков в записи            | `Array(String)`        |
| `_raw_message`   | Полное сообщение Kafka                                       | `String`               |

Обратите внимание, что столбец `_raw_message` рекомендуется только для JSON‑данных.  
Для сценариев, где требуется только JSON‑строка (например, при использовании функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для
заполнения нижестоящего материализованного представления), удаление всех «невиртуальных» столбцов может повысить производительность ClickPipes.
