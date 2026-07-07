---
sidebar_label: 'Справочник'
description: 'Описание поддерживаемых форматов, источников, семантики доставки сообщений, аутентификации и экспериментальных функций Kafka ClickPipes.'
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

* [JSON](/integrations/data-formats/json/overview)
* [AvroConfluent](/interfaces/formats/AvroConfluent)
* [Protobuf](/interfaces/formats/Protobuf)

## Поддерживаемые типы данных \{#supported-data-types\}

### Стандартные \{#standard-types-support\}

В ClickPipes в данный момент поддерживаются следующие стандартные типы данных ClickHouse:

* базовые числовые типы — [U]Int8/16/32/64, Float32/64 и BFloat16
* большие целочисленные типы — [U]Int128/256
* типы Decimal
* Boolean
* String
* FixedString
* Date, Date32
* DateTime, DateTime64 (только часовой пояс UTC)
* Enum8/Enum16
* UUID
* IPv4
* IPv6
* Time, Time64
* JSON
* все типы ClickHouse LowCardinality
* Map с ключами и значениями любого из перечисленных выше типов (включая Nullable)
* Tuple и Array с элементами любого из перечисленных выше типов (включая Nullable, только один уровень вложенности)
* типы SimpleAggregateFunction (для целевых таблиц на AggregatingMergeTree или SummingMergeTree)

### Поддержка типа Variant \{#variant-type-support\}

ClickPipes поддерживает тип Variant в следующих случаях:

* Объединения Avro (Avro unions). Если ваша схема Avro содержит union с несколькими типами, отличными от null, ClickPipes выведет
  соответствующий тип Variant. В остальных случаях тип Variant для данных Avro не поддерживается.
* Поля JSON. Вы можете вручную указать тип Variant (например, `Variant(String, Int64, DateTime)`) для любого поля JSON
  во входящем потоке данных. Сложные подтипы (массивы/отображения/кортежи) не поддерживаются. Кроме того, из-за того, как ClickPipes определяет
  корректный подтип Variant, в определении Variant может использоваться только один целочисленный или один тип даты/времени — например, `Variant(Int64, UInt32)` не поддерживается.

### Поддержка типа JSON \{#json-type-support\}

ClickPipes поддерживают тип JSON в следующих случаях:

* Поля Avro Record и Protobuf Message всегда можно сопоставить со столбцом типа JSON.
* Поля Avro String и Bytes можно сопоставить со столбцом типа JSON, если поле Avro фактически содержит строки в формате JSON.
* Типы Protobuf String и Bytes можно сопоставить со столбцом типа JSON, если поле Protobuf фактически содержит строки в формате JSON.
* Поля JSON, которые всегда являются JSON-объектом, можно сопоставить с целевым столбцом типа JSON.

Обратите внимание, что целевой столбец (включая любые явно заданные или пропускаемые пути) вам потребуется вручную изменить на нужный тип JSON.

### Avro \{#avro\}

#### Поддерживаемые типы данных Avro \{#supported-avro-data-types\}

ClickPipes поддерживает все примитивные и сложные типы Avro, а также все логические типы Avro, кроме `local-timestamp-millis` и `local_timestamp-micros`. Типы Avro `record` преобразуются в Tuple, типы `array` — в Array, а `map` — в Map (только строковые ключи). В целом доступны преобразования, перечисленные [здесь](/interfaces/schema-inference#avro). Рекомендуется использовать точное соответствие типов для числовых типов Avro, так как ClickPipes не проверяет переполнение или потерю точности при преобразовании типов.
В качестве альтернативы все типы Avro можно записывать в столбец `String`, и в этом случае они будут представлены в виде валидной JSON-строки.

#### Типы Nullable и объединения Avro \{#nullable-types-and-avro-unions\}

Типы Nullable в Avro задаются с помощью схемы Union `(T, null)` или `(null, T)`, где T — базовый тип Avro. Во время вывода схемы такие объединения будут отображены в столбец ClickHouse типа Nullable. Обратите внимание, что ClickHouse не поддерживает
типы `Nullable(Array)`, `Nullable(Map)` или `Nullable(Tuple)`. Объединения Avro с null для этих типов будут отображены в варианты, не допускающие NULL (типы Avro Record отображаются в именованный Tuple в ClickHouse). Значения null в Avro для этих типов будут вставляться как:

- Пустой Array для массива Avro со значением null
- Пустой Map для Map Avro со значением null
- Именованный Tuple со всеми значениями по умолчанию/нулевыми значениями для Record Avro со значением null

### Protobuf \{#protobuf\}

#### Поддерживаемые типы данных Protobuf \{#supported-protobuf-data-types\}

ClickPipes поддерживает все типы Protobuf 2 и 3, за исключением давно устаревшего типа `group` из proto 2. Для базовых преобразований типов используются
следующие соответствия:

:::note
Также поддерживаются варианты `Array`, `Map` и `Nullable` для всех базовых типов.
:::

| Тип Protobuf                  | Тип ClickHouse |
| ----------------------------- | -------------- |
| `bool`                        | `UInt8`        |
| `float`                       | `Float32`      |
| `double`                      | `Float64`      |
| `int32`, `sint32`, `sfixed32` | `Int32`        |
| `int64`, `sint64`, `sfixed64` | `Int64`        |
| `uint32`, `fixed32`           | `UInt32`       |
| `uint64`, `fixed64`           | `UInt64`       |
| `string`, `bytes`             | `String`       |
| `enum`                        | `Enum`         |
| `repeated T`                  | `Array(T)`     |
| `message`                     | `Tuple`        |

:::tip
Для числовых типов рекомендуется точное соответствие, чтобы избежать переполнения или потери точности.
:::

Также поддерживаются следующие стандартные [well-known types](https://protobuf.dev/reference/protobuf/google.protobuf/):

| Стандартный тип                                                                              | Тип ClickHouse           |
| -------------------------------------------------------------------------------------------- | ------------------------ |
| `google.protobuf.Timestamp`                                                                  | `DateTime`, `DateTime64` |
| `google.protobuf.Duration`                                                                   | `Time`, `Time64`         |
| `google.protobuf.StringValue`, `google.protobuf.BytesValue`                                  | `Nullable(String)`       |
| `google.protobuf.Int32Value`, `google.protobuf.SInt32Value`, `google.protobuf.SFixed32Value` | `Nullable(Int32)`        |
| `google.protobuf.Int64Value`, `google.protobuf.SInt64Value`, `google.protobuf.SFixed64Value` | `Nullable(Int64)`        |
| `google.protobuf.UInt32Value`, `google.protobuf.Fixed32Value`                                | `Nullable(UInt32)`       |
| `google.protobuf.UInt64Value`, `google.protobuf.Fixed64Value`                                | `Nullable(UInt64)`       |
| `google.protobuf.FloatValue`                                                                 | `Nullable(Float32)`      |
| `google.protobuf.DoubleValue`                                                                | `Nullable(Float64)`      |
| `google.protobuf.BoolValue`                                                                  | `Nullable(UInt8)`        |

#### Protobuf `oneof` \{#protobuf-one-ofs\}

В процессе вывода схемы поля Protobuf `oneof` по умолчанию сопоставляются с именованным `Tuple`, в котором не более одного поля содержит значение,
отличное от значения по умолчанию. Эти поля также могут автоматически сопоставляться со столбцом `Variant`, где активное значение принимает тип
того составного поля, которое установлено. Кроме того, каждое составное поле можно вручную сопоставить с отдельным столбцом ClickHouse; поскольку поля `oneof`
взаимно исключают друг друга, в каждой записи будет заполнен только один столбец.

#### Списки сообщений \{#protobuf-message-lists\}

Если schema Protobuf верхнего уровня, заданная для ClickPipe, содержит одно повторяющееся поле, которое само является сообщением protobuf, то вывод схемы и соответствие столбцов будут основываться на «вложенном» поле Message. Сообщение Kafka будет обрабатываться как список таких сообщений, и одно сообщение Kafka будет разворачиваться в несколько строк ClickHouse.

## Виртуальные столбцы Kafka \{#kafka-virtual-columns\}

Для потоковых источников данных, совместимых с Kafka, доступны следующие виртуальные столбцы. При создании нового пункта назначения виртуальные столбцы можно добавить в целевую таблицу с помощью кнопки `Add Column`.

| Name             | Description                                              | Recommended Data Type |
| ---------------- | -------------------------------------------------------- | --------------------- |
| `_key`           | Kafka Message Key                                        | `String`              |
| `_timestamp`     | Kafka Timestamp (точность в миллисекундах)               | `DateTime64(3)`       |
| `_partition`     | Kafka Partition                                          | `Int32`               |
| `_offset`        | Kafka Offset                                             | `Int64`               |
| `_topic`         | Kafka Topic                                              | `String`              |
| `_header_keys`   | Параллельный массив ключей в заголовках (Headers) записи | `Array(String)`       |
| `_header_values` | Параллельный массив значений заголовков (Headers) записи | `Array(String)`       |
| `_raw_message`   | Полное сообщение Kafka                                   | `String`              |

Обратите внимание, что столбец `_raw_message` рекомендуется использовать только для данных в формате JSON.
Для сценариев, когда требуется только JSON-строка (например, при использовании функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для
заполнения нижестоящего materialized view), можно повысить производительность ClickPipes, удалив все «не виртуальные» столбцы.