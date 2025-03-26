---
sidebar_label: 'ClickHouse Kafka Connect Sink'
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: 'Официальный коннектор Kafka от ClickHouse.'
title: 'ClickHouse Kafka Connect Sink'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
Если вам нужна помощь, пожалуйста, [сообщите об ошибке в репозитории](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) или задайте вопрос в [публичном Slack ClickHouse](https://clickhouse.com/slack).
:::
**ClickHouse Kafka Connect Sink** — это коннектор Kafka, который передает данные из темы Kafka в таблицу ClickHouse.

### Лицензия {#license}

Коннектор Kafka Sink распространяется под [Лицензией Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

### Требования к окружению {#requirements-for-the-environment}

В окружении должна быть установлена платформа [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) версии v2.7 или более поздней.

### Матрица совместимости версий {#version-compatibility-matrix}

| Version ClickHouse Kafka Connect | Version ClickHouse | Kafka Connect | Платформа Confluent |
|----------------------------------|--------------------|---------------|----------------------|
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1                |

### Основные функции {#main-features}

- Поставляется с заранее определенными семантиками exactly-once. Используется новая функция ядра ClickHouse под названием [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) (используется как хранилище состояний конектора) и позволяет создать минималистичную архитектуру.
- Поддержка сторонних хранилищ состояний: в данный момент по умолчанию используется память, но также может использоваться KeeperMap (Redis будет добавлен скоро).
- Интеграция на уровне ядра: разработано, поддерживается и обслуживается ClickHouse.
- Непрерывное тестирование с использованием [ClickHouse Cloud](https://clickhouse.com/cloud).
- Вставка данных с объявленной схемой и без схемы.
- Поддержка всех типов данных ClickHouse.

### Инструкции по установке {#installation-instructions}

#### Соберите ваши данные подключения {#gather-your-connection-details}

<ConnectionDetails />

#### Общие инструкции по установке {#general-installation-instructions}

Коннектор распространяется как единый JAR-файл, содержащий все классы, необходимые для работы плагина.

Чтобы установить плагин, выполните следующие шаги:

- Скачайте zip-архив, содержащий файл Connector JAR, со страницы [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) репозитория ClickHouse Kafka Connect Sink.
- Извлеките содержимое ZIP-файла и скопируйте его в нужное место.
- Добавьте путь с директорией плагина в конфигурацию [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) в вашем свойствах Connect, чтобы позволить платформе Confluent обнаружить плагин.
- Укажите имя темы, имя хоста экземпляра ClickHouse и пароль в конфигурации.

```yml
connector.class=com.clickhouse.kafka.connect.ClickHouseSinkConnector
tasks.max=1
topics=<topic_name>
ssl=true
jdbcConnectionProperties=?sslmode=STRICT
security.protocol=SSL
hostname=<hostname>
database=<database_name>
password=<password>
ssl.truststore.location=/tmp/kafka.client.truststore.jks
port=8443
value.converter.schemas.enable=false
value.converter=org.apache.kafka.connect.json.JsonConverter
exactlyOnce=true
username=default
schemas.enable=false
```

- Перезапустите платформу Confluent.
- Если вы используете платформу Confluent, войдите в интерфейс управления Confluent Control Center, чтобы убедиться, что ClickHouse Sink доступен в списке доступных коннекторов.

### Параметры конфигурации {#configuration-options}

Чтобы подключить ClickHouse Sink к серверу ClickHouse, вам нужно предоставить:

- данные подключения: hostname (**обязательно**) и port (необязательно)
- учетные данные пользователя: password (**обязательно**) и username (необязательно)
- класс коннектора: `com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**обязательно**)
- topics или topics.regex: Kafka-темы для опроса - имена тем должны соответствовать именам таблиц (**обязательно**)
- преобразователи ключей и значений: устанавливаются в зависимости от типа данных в вашей теме. Обязательны, если не определены в конфигурации рабочего процесса.

Полная таблица параметров конфигурации:

| Название свойства                                     | Описание                                                                                                                                                                                                                                                         | Значение по умолчанию                                    |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `hostname` (Обязательно)                             | Имя хоста или IP-адрес сервера                                                                                                                                                                                                                                | N/A                                                      |
| `port`                                              | Порт ClickHouse - по умолчанию 8443 (для HTTPS в облаке), но для HTTP (по умолчанию для самоуправляемых) он должен быть 8123                                                                                                                                 | `8443`                                                   |
| `ssl`                                               | Включить ssl-соединение к ClickHouse                                                                                                                                                                                                                           | `true`                                                   |
| `jdbcConnectionProperties`                          | Свойства подключения при подключении к ClickHouse. Должны начинаться с `?` и соединяться с помощью `&` между `param=value`                                                                                                                                    | `""`                                                     |
| `username`                                          | Имя пользователя базы данных ClickHouse                                                                                                                                                                                                                        | `default`                                                |
| `password` (Обязательно)                             | Пароль базы данных ClickHouse                                                                                                                                                                                                                                | N/A                                                      |
| `database`                                          | Имя базы данных ClickHouse                                                                                                                                                                                                                                       | `default`                                                |
| `connector.class` (Обязательно)                      | Класс коннектора (явно задайте и сохраните как значение по умолчанию)                                                                                                                                                                                         | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                         | Количество задач коннектора                                                                                                                                                                                                                                   | `"1"`                                                    |
| `errors.retry.timeout`                              | Таймаут повторной попытки ClickHouse JDBC                                                                                                                                                                                                                     | `"60"`                                                   |
| `exactlyOnce`                                       | Включено Exactly Once                                                                                                                                                                                                                                          | `"false"`                                                |
| `topics` (Обязательно)                             | Kafka-темы для опроса - имена тем должны соответствовать именам таблиц                                                                                                                                                                                            | `""`                                                     |
| `key.converter` (Обязательно* - см. Описание)       | Установите в зависимости от типов ваших ключей. Обязательно здесь, если вы передаете ключи (и не определены в конфигурации рабочего процесса).                                                                                                                  | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Обязательно* - см. Описание)     | Установите в зависимости от типа данных в вашей теме. Поддерживаются: - JSON, String, Avro или Protobuf форматы. Обязательно здесь, если не определены в конфигурации рабочего процесса.                                                                          | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                    | Поддержка схем преобразователя значения коннектора                                                                                                                                                                                                               | `"false"`                                                |
| `errors.tolerance`                                  | Ошибки в соединителе допускаются. Поддерживаемые: none, all                                                                                                                                                                                                    | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`                 | Если установлено (с errors.tolerance=all), будет использоваться DLQ для неудавшихся партий (см. [Устранение неполадок](#troubleshooting))                                                                                                                              | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable`     | Добавляет дополнительные заголовки для DLQ                                                                                                                                                                                                                     | `""`                                                     |
| `clickhouseSettings`                                | Список настроек ClickHouse через запятую (например, "insert_quorum=2 и т.д.")                                                                                                                                                                                  | `""`                                                     |
| `topic2TableMap`                                    | Список через запятую, который отображает имена тем на имена таблиц (например, "topic1=table1, topic2=table2 и т.д.")                                                                                                                                              | `""`                                                     |
| `tableRefreshInterval`                              | Время (в секундах) для обновления кэша определения таблицы                                                                                                                                                                                                      | `0`                                                      |
| `keeperOnCluster`                                   | Позволяет настроить параметр ON CLUSTER для самоуправляемых экземпляров (например, `ON CLUSTER clusterNameInConfigFileDefinition`) для таблицы connect_state exactly-once (см. [Распределенные DDL Запросы](/sql-reference/distributed-ddl) | `""`                                                     |
| `bypassRowBinary`                                   | Позволяет отключить использование RowBinary и RowBinaryWithDefaults для данных на основе схемы (Avro, Protobuf и т.д.) - должно использоваться только когда данные будут содержать отсутствующие столбцы, и Nullable/Default неприемлемы                           | `"false"`                                                |
| `dateTimeFormats`                                   | Форматы даты и времени для разбора полей схемы DateTime64, разделенные `;` (например, `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`).                                                                                    | `""`                                                     |
| `tolerateStateMismatch`                             | Позволяет коннектору удалять записи "раньше", чем текущий смещение, сохраненное AFTER_PROCESSING (например, если смещение 5 отправлено, а смещение 250 - последняя зарегистрированная смещение)                                                                          | `"false"`                                                |

### Целевые таблицы {#target-tables}

ClickHouse Connect Sink считывает сообщения из тем Kafka и записывает их в соответствующие таблицы. ClickHouse Connect Sink записывает данные в существующие таблицы. Пожалуйста, убедитесь, что целевая таблица с соответствующей схемой создана в ClickHouse перед тем, как начать вставлять в нее данные.

Каждая тема требует выделенной целевой таблицы в ClickHouse. Имя целевой таблицы должно соответствовать имени исходной темы.

### Предварительная обработка {#pre-processing}

Если вам нужно преобразовать исходящие сообщения перед их отправкой в ClickHouse Kafka Connect Sink, используйте [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html).

### Поддерживаемые типы данных {#supported-data-types}

**С объявленной схемой:**

| Тип Kafka Connect                    | Тип ClickHouse     | Поддерживается | Примитив |
|-------------------------------------|--------------------|----------------|----------|
| STRING                              | String             | ✅             | Да       |
| INT8                                | Int8               | ✅             | Да       |
| INT16                               | Int16              | ✅             | Да       |
| INT32                               | Int32              | ✅             | Да       |
| INT64                               | Int64              | ✅             | Да       |
| FLOAT32                             | Float32            | ✅             | Да       |
| FLOAT64                             | Float64            | ✅             | Да       |
| BOOLEAN                             | Boolean            | ✅             | Да       |
| ARRAY                               | Array(T)           | ✅             | Нет      |
| MAP                                 | Map(Primitive, T)  | ✅             | Нет      |
| STRUCT                              | Variant(T1, T2, ...) | ✅             | Нет      |
| STRUCT                              | Tuple(a T1, b T2, ...) | ✅             | Нет      |
| STRUCT                              | Nested(a T1, b T2, ...) | ✅             | Нет      |
| BYTES                               | String             | ✅             | Нет      |
| org.apache.kafka.connect.data.Time   | Int64 / DateTime64 | ✅             | Нет      |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32    | ✅             | Нет      |
| org.apache.kafka.connect.data.Decimal | Decimal           | ✅             | Нет      |

**Без объявленной схемы:**

Запись преобразуется в JSON и отправляется в ClickHouse в виде значения в формате [JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow).

### Рецепты конфигурации {#configuration-recipes}

Это некоторые распространенные рецепты конфигурации, чтобы вы могли начать быстро.

#### Базовая конфигурация {#basic-configuration}

Самая простая конфигурация, чтобы начать - она предполагает, что вы запускаете Kafka Connect в распределенном режиме и у вас работает сервер ClickHouse на `localhost:8443` с включенным SSL, данные представлены в безсхемном JSON.

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    "tasks.max": "1",
    "consumer.override.max.poll.records": "5000",
    "consumer.override.max.partition.fetch.bytes": "5242880",
    "database": "default",
    "errors.retry.timeout": "60",
    "exactlyOnce": "false",
    "hostname": "localhost",
    "port": "8443",
    "ssl": "true",
    "jdbcConnectionProperties": "?ssl=true&sslmode=strict",
    "username": "default",
    "password": "<PASSWORD>",
    "topics": "<TOPIC_NAME>",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "false",
    "clickhouseSettings": ""
  }
}
```

#### Базовая конфигурация с несколькими темами {#basic-configuration-with-multiple-topics}

Коннектор может потреблять данные из нескольких тем.

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "topics": "SAMPLE_TOPIC, ANOTHER_TOPIC, YET_ANOTHER_TOPIC",
    ...
  }
}
```

#### Базовая конфигурация с DLQ {#basic-configuration-with-dlq}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "errors.tolerance": "all",
    "errors.deadletterqueue.topic.name": "<DLQ_TOPIC>",
    "errors.deadletterqueue.context.headers.enable": "true"
  }
}
```

#### Использование с разными форматами данных {#using-with-different-data-formats}

##### Поддержка схемы Avro {#avro-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "io.confluent.connect.avro.AvroConverter",
    "value.converter.schema.registry.url": "<SCHEMA_REGISTRY_HOST>:<PORT>",
    "value.converter.schemas.enable": "true"
  }
}
```

##### Поддержка схемы Protobuf {#protobuf-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "io.confluent.connect.protobuf.ProtobufConverter",
    "value.converter.schema.registry.url": "<SCHEMA_REGISTRY_HOST>:<PORT>",
    "value.converter.schemas.enable": "true"
  }
}
```

Обратите внимание: если вы столкнетесь с проблемами с отсутствующими классами, не в каждой среде есть преобразователь protobuf, и вам может понадобиться альтернативная версия JAR с включенными зависимостями.

##### Поддержка схемы JSON {#json-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "org.apache.kafka.connect.json.JsonConverter"
  }
}
```

##### Поддержка строк {#string-support}

Коннектор поддерживает преобразователь строк в разных форматах ClickHouse: [JSON](/interfaces/formats#jsoneachrow), [CSV](/interfaces/formats#csv) и [TSV](/interfaces/formats#tabseparated).

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "org.apache.kafka.connect.storage.StringConverter",
    "customInsertFormat": "true",
    "insertFormat": "CSV"
  }
}
```

### Логирование {#logging}

Логирование обеспечивается автоматически платформой Kafka Connect.
Место назначения логирования и формат могут быть настроены через [файл конфигурации](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file) Kafka Connect.

Если вы используете платформу Confluent, журналы можно просмотреть, выполнив команду CLI:

```bash
confluent local services connect log
```

Для получения дополнительных сведений ознакомьтесь с официальным [руководством](https://docs.confluent.io/platform/current/connect/logging.html).

### Мониторинг {#monitoring}

ClickHouse Kafka Connect сообщает метрики выполнения через [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html). JMX включен в коннектор Kafka по умолчанию.

ClickHouse Connect `MBeanName`:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect сообщает следующие метрики:

| Название                   | Тип  | Описание                                                                               |
|---------------------------|------|---------------------------------------------------------------------------------------|
| `receivedRecords`         | long | Общее количество полученных записей.                                                  |
| `recordProcessingTime`    | long | Общее время в наносекундах, затраченное на группировку и преобразование записей в единую структуру. |
| `taskProcessingTime`      | long | Общее время в наносекундах, затраченное на обработку и вставку данных в ClickHouse.   |

### Ограничения {#limitations}

- Удаления не поддерживаются.
- Размер партии наследуется от свойств потребителя Kafka.
- При использовании KeeperMap для exactly-once и изменении или возвращении смещения, вам необходимо удалить содержимое из KeeperMap для этой конкретной темы. (См. ниже руководство по устранению неполадок для получения дополнительных сведений)

### Настройка производительности {#tuning-performance}

Если вы когда-либо думали: "Я хотел бы настроить размер партии для коннектора sink", то этот раздел для вас.

##### Fetch Connect против Poll Connector {#connect-fetch-vs-connector-poll}

Kafka Connect (рамка, на которой основан наш коннектор sink) будет извлекать сообщения из тем Kafka в фоновом режиме (независимо от коннектора).

Вы можете контролировать этот процесс, используя `fetch.min.bytes` и `fetch.max.bytes` - в то время как `fetch.min.bytes` определяет минимальное количество, необходимое, прежде чем платформа передаст значения коннектору (в пределах временного ограничения, установленного `fetch.max.wait.ms`), `fetch.max.bytes` устанавливает верхний предел размера. Если вы хотите передать более крупные партии к коннектору, одним из вариантов может быть увеличение минимальной выборки или максимального ожидания для формирования более крупных пакетов данных.

Эти извлеченные данные затем обрабатываются клиентом коннектора, опрашивающим сообщения, где количество для каждого опроса контролируется `max.poll.records` - обратите внимание, что получение независимо от опроса!

При настройке этих параметров пользователи должны стремиться так, чтобы их размер выборки производил несколько партий `max.poll.records` (и помнить, что настройки `fetch.min.bytes` и `fetch.max.bytes` представляют сжатые данные) - таким образом, каждая задача коннектора вставляет как можно более крупную партию.

ClickHouse оптимизирован для больших партий, даже с небольшой задержкой, а не частых, но меньших партий - чем больше партия, тем лучше.

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

Более подробную информацию можно найти в [документации Confluent](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration)
или в [документации Kafka](https://kafka.apache.org/documentation/#consumerconfigs).

#### Несколько тем с высокой пропускной способностью {#multiple-high-throughput-topics}

Если ваш коннектор настроен на подписку на несколько тем, вы используете `topic2TableMap` для сопоставления тем с таблицами, и вы сталкиваетесь с узким местом при вставке, что приводит к задержке потребителя, рассмотрите возможность создания одного коннектора на тему. Основная причина, по которой это происходит, заключается в том, что в данный момент партии вставляются в каждую таблицу [поочередно](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100).

Создание одного коннектора на тему — это обходной путь, который обеспечивает максимальную скорость вставки.

### Устранение неполадок {#troubleshooting}

#### "Несоответствие состояния для темы `[someTopic]` раздела `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

Это происходит, когда смещение, хранимое в KeeperMap, отличается от смещения, хранимого в Kafka, обычно когда тема была удалена
или смещение было вручную отрегулировано.
Чтобы исправить это, вам нужно удалить старые значения, хранящиеся для данной темы + раздела.

**ПРИМЕЧАНИЕ: Этот коррекционный процесс может иметь последствия для exactly-once.**

#### "Какие ошибки коннектор будет повторять?" {#what-errors-will-the-connector-retry}

В данный момент основное внимание уделяется выявлению ошибок, которые являются временными и могут быть повторены, включая:

- `ClickHouseException` - это общее исключение, которое может быть выброшено ClickHouse.
  Оно обычно выбрасывается, когда сервер перегружен, и следующие коды ошибок считаются особенно временными:
  - 3 - UNEXPECTED_END_OF_FILE
  - 159 - TIMEOUT_EXCEEDED
  - 164 - READONLY
  - 202 - TOO_MANY_SIMULTANEOUS_QUERIES
  - 203 - NO_FREE_CONNECTION
  - 209 - SOCKET_TIMEOUT
  - 210 - NETWORK_ERROR
  - 242 - TABLE_IS_READ_ONLY
  - 252 - TOO_MANY_PARTS
  - 285 - TOO_FEW_LIVE_REPLICAS
  - 319 - UNKNOWN_STATUS_OF_INSERT
  - 425 - SYSTEM_ERROR
  - 999 - KEEPER_EXCEPTION
  - 1002 - UNKNOWN_EXCEPTION
- `SocketTimeoutException` - выбрасывается, когда время ожидания сокета истекает.
- `UnknownHostException` - выбрасывается, когда хост не может быть разрешен.
- `IOException` - выбрасывается, когда возникает проблема с сетью.

#### "Все мои данные пустые/нули" {#all-my-data-is-blankzeroes}
Скорее всего, поля в ваших данных не соответствуют полям в таблице - это особенно часто встречается с CDC (и форматом Debezium).
Одно из распространенных решений - добавить преобразование flatten к вашей конфигурации коннектора:

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

Это преобразует ваши данные из вложенного JSON в плоский JSON (используя `_` в качестве разделителя). Поля в таблице будут иметь формат "field1_field2_field3" (т.е. "before_id", "after_id" и т.д.).

#### "Я хочу использовать свои ключи Kafka в ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Ключи Kafka по умолчанию не сохраняются в поле значения, но вы можете использовать преобразование `KeyToValue`, чтобы переместить ключ в поле значения (под новым именем поля `_key`):

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
