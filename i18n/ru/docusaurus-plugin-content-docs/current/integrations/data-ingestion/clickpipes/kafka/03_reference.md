---
'sidebar_label': 'Справочник'
'description': 'Детали поддерживаемых форматов, источников, семантики доставки, аутентификации
  и экспериментальных функций, поддерживаемых Kafka ClickPipes'
'slug': '/integrations/clickpipes/kafka/reference'
'sidebar_position': 1
'title': 'Справочник'
'doc_type': 'reference'
---
import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@site/src/theme/badges/ExperimentalBadge';


# Справка

## Поддерживаемые источники данных {#supported-data-sources}

| Название              | Логотип| Тип      | Статус          | Описание                                                                                              |
|----------------------|--------|----------|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Логотип Apache Kafka" style={{width: '3rem', 'height': '3rem'}}/>| Потоковый | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Apache Kafka в ClickHouse Cloud.       |
| Confluent Cloud      |<Confluentsvg class="image" alt="Логотип Confluent Cloud" style={{width: '3rem'}}/>| Потоковый | Стабильный      | Раскройте объединенную мощь Confluent и ClickHouse Cloud через нашу прямую интеграцию.              |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Логотип Redpanda"/>| Потоковый | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Redpanda в ClickHouse Cloud.           |
| AWS MSK              |<Msksvg class="image" alt="Логотип AWS MSK" style={{width: '3rem', 'height': '3rem'}}/>| Потоковый | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из AWS MSK в ClickHouse Cloud.            |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Логотип Azure Event Hubs" style={{width: '3rem'}}/>| Потоковый | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из Azure Event Hubs в ClickHouse Cloud.   |
| WarpStream           |<Warpstreamsvg class="image" alt="Логотип WarpStream" style={{width: '3rem'}}/>| Потоковый | Стабильный      | Настройте ClickPipes и начните загружать потоковые данные из WarpStream в ClickHouse Cloud.         |

## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаемые форматы:
- [JSON](/integrations/data-formats/json/overview)
- [AvroConfluent](/interfaces/formats/AvroConfluent)

## Поддерживаемые типы данных {#supported-data-types}

### Стандартные {#standard-types-support}

В ClickPipes в настоящее время поддерживаются следующие стандартные типы данных ClickHouse:

- Базовые численные типы - \[U\]Int8/16/32/64, Float32/64 и BFloat16
- Большие целочисленные типы - \[U\]Int128/256
- Десятичные типы
- Логические
- Строки
- FixedString
- Дата, Date32
- ДатаВремя, DateTime64 (только часовые пояса UTC)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- все типы ClickHouse LowCardinality
- Map с ключами и значениями, использующими любые из вышеперечисленных типов (включая Nullables)
- Tuple и Array с элементами, использующими любые из вышеперечисленных типов (включая Nullables, только один уровень глубины)
- Типы SimpleAggregateFunction (для назначений AggregatingMergeTree или SummingMergeTree)

### Avro {#avro}

#### Поддерживаемые типы данных Avro {#supported-avro-data-types}
ClickPipes поддерживает все примитивные и сложные типы Avro, а также все логические типы Avro, кроме `time-millis`, `time-micros`, `local-timestamp-millis`, `local_timestamp-micros` и `duration`.  Типы Avro `record` преобразуются в Tuple, типы `array` в Array, а `map` в Map (только строковые ключи).  В общем, преобразования, перечисленные [здесь](/interfaces/formats/Avro#data-type-mapping), доступны.  Мы рекомендуем использовать точное сопоставление типов для числовых типов Avro, поскольку ClickPipes не проверяет переполнение или потерю точности при конвертации типов. 
В качестве альтернативы все типы Avro могут быть вставлены в колонку `String` и будут представлены как допустимая строка JSON в этом случае.

#### Nullable типы и объединения Avro {#nullable-types-and-avro-unions}
Nullable типы в Avro определяются с помощью схемы объединения `(T, null)` или `(null, T)`, где T - базовый тип Avro.  Во время вывода схемы такие объединения будут сопоставлены с колонкой "Nullable" в ClickHouse.  Обратите внимание, что ClickHouse не поддерживает
типов `Nullable(Array)`, `Nullable(Map)` или `Nullable(Tuple)`.  Объединения null Avro для этих типов будут сопоставлены с непростыми версиями (типы Avro Record будут сопоставлены с именованным Tuple в ClickHouse).  "Nulls" Avro для этих типов будут вставлены как:
- Пустой Array для null Avro массива
- Пустой Map для null Avro Map
- Именованный Tuple со всеми значениями по умолчанию/нулевыми для null Avro Record

#### Поддержка Variant типов {#variant-type-support}
ClickPipes поддерживает тип Variant в следующих случаях:
- Объединения Avro. Если ваша схема Avro содержит объединение с несколькими ненулевыми типами, ClickPipes выведет
  соответствующий тип варианта.  В других случаях типы Variant для данных Avro не поддерживаются.
- Поля JSON. Вы можете вручную указать тип Variant (например, `Variant(String, Int64, DateTime)`) для любого поля JSON
  в потоке исходных данных.  Из-за того, как ClickPipes определяет правильный подтип варианта, только один целочисленный или тип даты/времени
  может быть использован в определении Variant - например, `Variant(Int64, UInt32)` не поддерживается.

#### Поддержка JSON типов {#json-type-support}
ClickPipes поддерживает JSON типы в следующих случаях:
- Типы Avro Record всегда могут быть назначены колонке JSON.
- Строки и байтовые типы Avro могут быть назначены колонке JSON, если колонка фактически хранит объекты строк JSON.
- Поля JSON, которые всегда являются объектом JSON, могут быть назначены колонке назначения JSON.

Обратите внимание, что вам придется вручную изменить колонку назначения на желаемый JSON тип, включая любые фиксированные или пропущенные пути.

## Виртуальные колонки Kafka {#kafka-virtual-columns}

Следующие виртуальные колонки поддерживаются для источников данных, совместимых с Kafka. При создании новой таблицы назначения виртуальные колонки могут быть добавлены с помощью кнопки `Add Column`.

| Название           | Описание                                        | Рекомендуемый тип данных  |
|--------------------|------------------------------------------------|----------------------------|
| `_key`             | Ключ сообщения Kafka                           | `String`                   |
| `_timestamp`       | Временная метка Kafka (миллисекундная точность)| `DateTime64(3)`           |
| `_partition`       | Партиция Kafka                                 | `Int32`                    |
| `_offset`          | Смещение Kafka                                 | `Int64`                    |
| `_topic`           | Топик Kafka                                    | `String`                   |
| `_header_keys`     | Параллельный массив ключей в заголовках записи | `Array(String)`            |
| `_header_values`   | Параллельный массив значений заголовков записи | `Array(String)`            |
| `_raw_message`     | Полное сообщение Kafka                         | `String`                   |

Обратите внимание, что колонка `_raw_message` рекомендуется только для данных JSON. 
Для случаев, когда требуется только строка JSON (например, использование функций ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) для
заполнения последующего материализованного представления), может улучшить производительность ClickPipes удаление всех "не виртуальных" колонок.