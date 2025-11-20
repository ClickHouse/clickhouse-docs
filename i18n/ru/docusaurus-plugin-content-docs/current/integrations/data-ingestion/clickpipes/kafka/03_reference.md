---
sidebar_label: 'Справочник'
description: 'Содержит сведения о поддерживаемых форматах, источниках, семантике доставки, аутентификации и экспериментальных возможностях Kafka ClickPipes'
slug: /integrations/clickpipes/kafka/reference
sidebar_position: 1
title: 'Справочник'
doc_type: 'reference'
keywords: ['kafka reference', 'clickpipes', 'data sources', 'avro', 'virtual columns']
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';


# Справочник



## Поддерживаемые источники данных {#supported-data-sources}

| Название         | Логотип                                                                                     | Тип       | Статус | Описание                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------- | --------- | ------ | ---------------------------------------------------------------------------------------------------- |
| Apache Kafka     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/> | Потоковый | Стабильно | Настройте ClickPipes и начните загрузку потоковых данных из Apache Kafka в ClickHouse Cloud.     |
| Confluent Cloud  | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>            | Потоковый | Стабильно | Используйте всю мощь совместной работы Confluent и ClickHouse Cloud через прямую интеграцию.          |
| Redpanda         | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                | Потоковый | Стабильно | Настройте ClickPipes и начните загрузку потоковых данных из Redpanda в ClickHouse Cloud.         |
| AWS MSK          | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>        | Потоковый | Стабильно | Настройте ClickPipes и начните загрузку потоковых данных из AWS MSK в ClickHouse Cloud.          |
| Azure Event Hubs | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>      | Потоковый | Стабильно | Настройте ClickPipes и начните загрузку потоковых данных из Azure Event Hubs в ClickHouse Cloud. |
| WarpStream       | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                | Потоковый | Стабильно | Настройте ClickPipes и начните загрузку потоковых данных из WarpStream в ClickHouse Cloud.       |


## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаются следующие форматы:

- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)


## Поддерживаемые типы данных {#supported-data-types}

### Стандартные {#standard-types-support}

В настоящее время ClickPipes поддерживает следующие стандартные типы данных ClickHouse:

- Базовые числовые типы — \[U\]Int8/16/32/64, Float32/64 и BFloat16
- Типы больших целых чисел — \[U\]Int128/256
- Типы Decimal
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64 (только часовые пояса UTC)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы LowCardinality ClickHouse
- Map с ключами и значениями любых из перечисленных выше типов (включая Nullable)
- Tuple и Array с элементами любых из перечисленных выше типов (включая Nullable, только один уровень вложенности)
- Типы SimpleAggregateFunction (для целевых таблиц AggregatingMergeTree или SummingMergeTree)

### Avro {#avro}

#### Поддерживаемые типы данных Avro {#supported-avro-data-types}

ClickPipes поддерживает все примитивные и сложные типы Avro, а также все логические типы Avro, за исключением `time-millis`, `time-micros`, `local-timestamp-millis`, `local_timestamp-micros` и `duration`. Типы `record` Avro преобразуются в Tuple, типы `array` — в Array, а `map` — в Map (только строковые ключи). В целом доступны преобразования, перечисленные [здесь](/interfaces/formats/Avro#data-type-mapping). Рекомендуется использовать точное соответствие типов для числовых типов Avro, поскольку ClickPipes не проверяет переполнение или потерю точности при преобразовании типов.
В качестве альтернативы все типы Avro можно вставить в столбец `String`, и в этом случае они будут представлены как корректная строка JSON.

#### Типы Nullable и объединения Avro {#nullable-types-and-avro-unions}

Типы Nullable в Avro определяются с использованием схемы Union вида `(T, null)` или `(null, T)`, где T — базовый тип Avro. При выводе схемы такие объединения будут сопоставлены со столбцом ClickHouse типа Nullable. Обратите внимание, что ClickHouse не поддерживает типы
`Nullable(Array)`, `Nullable(Map)` или `Nullable(Tuple)`. Объединения Avro с null для этих типов будут сопоставлены с ненулевыми версиями (типы Record Avro сопоставляются с именованным Tuple ClickHouse). Значения null Avro для этих типов будут вставлены как:

- Пустой Array для null-массива Avro
- Пустой Map для null-Map Avro
- Именованный Tuple со всеми значениями по умолчанию/нулевыми значениями для null-Record Avro

#### Поддержка типа Variant {#variant-type-support}

ClickPipes поддерживает тип Variant в следующих случаях:

- Объединения Avro. Если ваша схема Avro содержит объединение с несколькими ненулевыми типами, ClickPipes выведет
  соответствующий тип Variant. В остальных случаях типы Variant не поддерживаются для данных Avro.
- Поля JSON. Вы можете вручную указать тип Variant (например, `Variant(String, Int64, DateTime)`) для любого поля JSON
  в исходном потоке данных. Из-за способа, которым ClickPipes определяет правильный подтип Variant, в определении Variant может использоваться только один целочисленный или datetime-тип — например, `Variant(Int64, UInt32)` не поддерживается.

#### Поддержка типа JSON {#json-type-support}

ClickPipes поддерживает тип JSON в следующих случаях:

- Типы Record Avro всегда можно назначить столбцу JSON.
- Типы String и Bytes Avro можно назначить столбцу JSON, если столбец фактически содержит строковые объекты JSON.
- Поля JSON, которые всегда являются объектом JSON, можно назначить целевому столбцу JSON.

Обратите внимание, что вам потребуется вручную изменить целевой столбец на желаемый тип JSON, включая любые фиксированные или пропущенные пути.


## Виртуальные колонки Kafka {#kafka-virtual-columns}

Следующие виртуальные колонки поддерживаются для потоковых источников данных, совместимых с Kafka. При создании новой целевой таблицы виртуальные колонки можно добавить с помощью кнопки `Add Column`.

| Имя              | Описание                                        | Рекомендуемый тип данных |
| ---------------- | ----------------------------------------------- | ------------------------ |
| `_key`           | Ключ сообщения Kafka                            | `String`                 |
| `_timestamp`     | Временная метка Kafka (точность до миллисекунд) | `DateTime64(3)`          |
| `_partition`     | Партиция Kafka                                  | `Int32`                  |
| `_offset`        | Смещение Kafka                                  | `Int64`                  |
| `_topic`         | Топик Kafka                                     | `String`                 |
| `_header_keys`   | Параллельный массив ключей в заголовках записи  | `Array(String)`          |
| `_header_values` | Параллельный массив значений в заголовках записи | `Array(String)`          |
| `_raw_message`   | Полное сообщение Kafka                          | `String`                 |

Обратите внимание, что колонка `_raw_message` рекомендуется только для данных JSON.
В случаях, когда требуется только строка JSON (например, при использовании функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для
заполнения downstream материализованного представления), удаление всех «невиртуальных» колонок может улучшить производительность ClickPipes.
