---
sidebar_label: 'ClickHouse Kafka Connect Sink'
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: 'Официальный коннектор Kafka от ClickHouse.'
title: 'ClickHouse Kafka Connect Sink'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
Если вам нужна помощь, пожалуйста, [сообщите об ошибке в репозитории](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) или задайте вопрос в [публичном Slack ClickHouse](https://clickhouse.com/slack).
:::
**ClickHouse Kafka Connect Sink** — это коннектор Kafka, который передает данные из топика Kafka в таблицу ClickHouse.

### Лицензия {#license}

Коннектор Kafka Sink распространяется под [Лицензией Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

### Требования к окружению {#requirements-for-the-environment}

В окружении должна быть установлена платформа [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) версии 2.7 или более поздней.

### Матрица совместимости версий {#version-compatibility-matrix}

| Версия ClickHouse Kafka Connect | Версия ClickHouse | Kafka Connect | Платформа Confluent |
|---------------------------------|--------------------|---------------|----------------------|
| 1.0.0                           | > 23.3             | > 2.7         | > 6.1                |

### Основные функции {#main-features}

- Поставляется с готовой к использованию семантикой exactly-once. Основан на новой функции ядра ClickHouse, называемой [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) (используется как хранилище состояний коннектора) и позволяет создавать минималистичную архитектуру.
- Поддержка сторонних хранилищ состояний: по умолчанию используется память, но можно использовать KeeperMap (Redis будет добавлен в ближайшее время).
- Интеграция с ядром: разработан, поддерживается и обслуживается ClickHouse.
- Постоянно тестируется на платформе [ClickHouse Cloud](https://clickhouse.com/cloud).
- Вставка данных с объявленной схемой и без схемы.
- Поддержка всех типов данных ClickHouse.

### Инструкция по установке {#installation-instructions}

#### Соберите свои данные подключения {#gather-your-connection-details}

<ConnectionDetails />

#### Общие инструкции по установке {#general-installation-instructions}

Коннектор распространяется в виде одного JAR-файла, содержащего все классы, необходимые для работы плагина.

Чтобы установить плагин, выполните следующие шаги:

- Скачайте архив ZIP, содержащий файл Connector JAR со страницы [Релизы](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) репозитория ClickHouse Kafka Connect Sink.
- Извлеките содержимое ZIP-файла и скопируйте его в нужное место.
- Добавьте путь с директорией плагина в параметр [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) в файле конфигурации Connect, чтобы платформа Confluent могла найти плагин.
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
- Если вы используете платформу Confluent, войдите в интерфейс Confluent Control Center, чтобы убедиться, что ClickHouse Sink доступен в списке доступных коннекторов.

### Опции конфигурации {#configuration-options}

Чтобы подключить ClickHouse Sink к серверу ClickHouse, необходимо предоставить:

- данные для подключения: имя хоста (**обязательно**) и порт (необязательно)
- учетные данные пользователя: пароль (**обязательно**) и имя пользователя (необязательно)
- класс коннектора: `com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**обязательно**)
- темы или topics.regex: темы Kafka, которые нужно опрашивать - имена тем должны соответствовать именам таблиц (**обязательно**)
- конвертеры ключа и значения: установить в зависимости от типа данных вашей темы. Обязательно, если они не определены в конфигурации работника.

Полная таблица опций конфигурации:

| Имя свойства                                   | Описание                                                                                                                                                                                                                        | Значение по умолчанию                                   |
|------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| `hostname` (обязательно)                       | Имя хоста или IP-адрес сервера                                                                                                                                                                                                | N/A                                                   |
| `port`                                         | Порт ClickHouse - по умолчанию 8443 (для HTTPS в облаке), но для HTTP (по умолчанию для собственных хостингов) он должен быть 8123                                                                                           | `8443`                                               |
| `ssl`                                          | Включить ssl-соединение с ClickHouse                                                                                                                                                                                        | `true`                                               |
| `jdbcConnectionProperties`                     | Свойства соединения при подключении к ClickHouse. Должны начинаться с `?` и объединяться с `&` между `param=value`                                                                                                             | `""`                                                 |
| `username`                                     | Имя пользователя базы данных ClickHouse                                                                                                                                                                                      | `default`                                            |
| `password` (обязательно)                       | Пароль базы данных ClickHouse                                                                                                                                                                                                  | N/A                                                   |
| `database`                                     | Имя базы данных ClickHouse                                                                                                                                                                                                      | `default`                                            |
| `connector.class` (обязательно)                | Класс коннектора (явно установлен и оставлен по умолчанию)                                                                                                                                                                     | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                    | Количество задач коннектора                                                                                                                                                                                                     | `"1"`                                                |
| `errors.retry.timeout`                         | Таймаут повторной попытки JDBC ClickHouse                                                                                                                                                                                      | `"60"`                                               |
| `exactlyOnce`                                  | Включен режим Exactly Once                                                                                                                                                                                                      | `"false"`                                            |
| `topics` (обязательно)                        | Темы Kafka для опроса - имена тем должны соответствовать именам таблиц                                                                                                                                                          | `""`                                                 |
| `key.converter` (обязательно* - см. описание) | Установите в зависимости от типов ваших ключей. Обязательно, если вы передаете ключи (и они не определены в конфигурации работника).                                                                                             | `"org.apache.kafka.connect.storage.StringConverter"` |
| `value.converter` (обязательно* - см. описание)| Установите в зависимости от типа данных вашей темы. Поддерживаемые: - форматы JSON, String, Avro или Protobuf. Обязательно, если не определены в конфигурации работника.                                                        | `"org.apache.kafka.connect.json.JsonConverter"`      |
| `value.converter.schemas.enable`               | Поддержка схемы конвертера значений                                                                                                                                                                                            | `"false"`                                            |
| `errors.tolerance`                             | Допустимость ошибок коннектора. Поддерживается: none, all                                                                                                                                                                       | `"none"`                                             |
| `errors.deadletterqueue.topic.name`            | Если установлено (с errors.tolerance=all), будет использоваться DLQ для неудачных пакетов (см. [Устранение неполадок](#troubleshooting))                                                                                        | `""`                                                 |
| `errors.deadletterqueue.context.headers.enable`| Добавляет дополнительные заголовки для DLQ                                                                                                                                                                                    | `""`                                                 |
| `clickhouseSettings`                           | Список настроек ClickHouse, разделенный запятыми (например, "insert_quorum=2, и т.д...")                                                                                                                                      | `""`                                                 |
| `topic2TableMap`                               | Список, разделенный запятыми, который сопоставляет имена тем с именами таблиц (например, "topic1=table1, topic2=table2, и т.д...")                                                                                          | `""`                                                 |
| `tableRefreshInterval`                         | Время (в секундах) для обновления кеша определения таблицы                                                                                                                                                                     | `0`                                                  |
| `keeperOnCluster`                              | Позволяет настроить параметр ON CLUSTER для собственных экземпляров (например, `ON CLUSTER clusterNameInConfigFileDefinition`) для таблицы connect_state с семантикой exactly-once (см. [Запросы распределенного DDL](/sql-reference/distributed-ddl) | `""`                                                 |
| `bypassRowBinary`                              | Позволяет отключить использование RowBinary и RowBinaryWithDefaults для данных на основе схемы (Avro, Protobuf и т.д.) - должен использоваться только когда данные будут иметь отсутствующие столбцы, а Nullable/Default неприемлемы          | `"false"`                                            |
| `dateTimeFormats`                              | Форматы даты и времени для разбора полей схемы DateTime64, разделенные `;` (например, `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`).                                                | `""`                                                 |
| `tolerateStateMismatch`                        | Позволяет коннектору удалять записи, "ранее" чем текущее смещение, сохраненное после обработки (например, если смещение 5 было отправлено, а смещение 250 было последним зафиксированным смещением)                                 | `"false"`                                            |
| `ignorePartitionsWhenBatching`                 | Будет игнорировать партицию при сборе сообщений для вставки (хотя только если `exactlyOnce` — `false`). Примечание по производительности: чем больше задач коннектора, тем меньше партиций Kafka назначено на задачу — это может снизить отдачу. | `"false"`                                            |

### Целевые таблицы {#target-tables}

ClickHouse Connect Sink читает сообщения из топиков Kafka и записывает их в соответствующие таблицы. ClickHouse Connect Sink записывает данные в существующие таблицы. Пожалуйста, убедитесь, что целевая таблица с подходящей схемой была создана в ClickHouse до начала вставки данных в нее.

Каждая тема требует выделенной целевой таблицы в ClickHouse. Имя целевой таблицы должно совпадать с именем исходной темы.

### Предварительная обработка {#pre-processing}

Если вам нужно преобразовать исходящие сообщения перед отправкой их в ClickHouse Kafka Connect Sink, используйте [Преобразования Kafka Connect](https://docs.confluent.io/platform/current/connect/transforms/overview.html).

### Поддерживаемые типы данных {#supported-data-types}

**С объявленной схемой:**

| Тип Kafka Connect                      | Тип ClickHouse       | Поддерживаемый | Примитивный |
|---------------------------------------|----------------------|----------------|-------------|
| STRING                                | String               | ✅             | Да          |
| INT8                                  | Int8                 | ✅             | Да          |
| INT16                                 | Int16                | ✅             | Да          |
| INT32                                 | Int32                | ✅             | Да          |
| INT64                                 | Int64                | ✅             | Да          |
| FLOAT32                               | Float32              | ✅             | Да          |
| FLOAT64                               | Float64              | ✅             | Да          |
| BOOLEAN                               | Boolean              | ✅             | Да          |
| ARRAY                                 | Array(T)             | ✅             | Нет         |
| MAP                                   | Map(Primitive, T)    | ✅             | Нет         |
| STRUCT                                | Variant(T1, T2, ...)  | ✅             | Нет         |
| STRUCT                                | Tuple(a T1, b T2, ...) | ✅             | Нет         |
| STRUCT                                | Nested(a T1, b T2, ...) | ✅             | Нет         |
| BYTES                                 | String               | ✅             | Нет         |
| org.apache.kafka.connect.data.Time    | Int64 / DateTime64   | ✅             | Нет         |
| org.apache.kafka.connect.data.Timestamp| Int32 / Date32       | ✅             | Нет         |
| org.apache.kafka.connect.data.Decimal  | Decimal              | ✅             | Нет         |

**Без объявленной схемы:**

Запись преобразуется в JSON и отправляется в ClickHouse в формате [JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow).

### Рецепты конфигурации {#configuration-recipes}

Это некоторые распространенные рецепты конфигурации, которые помогут вам быстро начать.

#### Основная конфигурация {#basic-configuration}

Самая простая конфигурация, чтобы начать - предполагает, что вы выполняете Kafka Connect в распределенном режиме и используете сервер ClickHouse на `localhost:8443` с включенным SSL, данные в формате без схемы JSON.

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

#### Основная конфигурация с несколькими темами {#basic-configuration-with-multiple-topics}

Коннектор может потреблять данные из нескольких тем:

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

#### Основная конфигурация с DLQ {#basic-configuration-with-dlq}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "errors.tolerance": "all",
    "errors.deadletterqueue.topic.name": "<DLQ_TOPIC>",
    "errors.deadletterqueue.context.headers.enable": "true",
  }
}
```

#### Использование с различными форматами данных {#using-with-different-data-formats}

##### Поддержка схемы Avro {#avro-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "io.confluent.connect.avro.AvroConverter",
    "value.converter.schema.registry.url": "<SCHEMA_REGISTRY_HOST>:<PORT>",
    "value.converter.schemas.enable": "true",
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
    "value.converter.schemas.enable": "true",
  }
}
```

Пожалуйста, обратите внимание: если вы столкнетесь с проблемами с отсутствующими классами, не каждое окружение поставляется с конвертером protobuf, и вам может понадобиться альтернативный релиз JAR с зависимостями.

##### Поддержка схемы JSON {#json-schema-support}

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  }
}
```

##### Поддержка стрингов {#string-support}

Коннектор поддерживает String Converter в различных форматах ClickHouse: [JSON](/interfaces/formats#jsoneachrow), [CSV](/interfaces/formats#csv) и [TSV](/interfaces/formats#tabseparated).

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

Логирование автоматически предоставляется платформой Kafka Connect. Место назначения и формат логирования можно настроить через [файл конфигурации Kafka connect](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file).

Если вы используете платформу Confluent, логи можно просмотреть, выполнив команду CLI:

```bash
confluent local services connect log
```

Для получения дополнительных сведений ознакомьтесь с официальным [учебным пособием](https://docs.confluent.io/platform/current/connect/logging.html).

### Мониторинг {#monitoring}

ClickHouse Kafka Connect сообщает о метриках выполнения через [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html). По умолчанию JMX включен для коннектора Kafka.

Имя ClickHouse Connect `MBeanName`:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect сообщает о следующих метриках:

| Имя                   | Тип   | Описание                                                                                     |
|-----------------------|-------|----------------------------------------------------------------------------------------------|
| `receivedRecords`     | long  | Общее количество полученных записей.                                                        |
| `recordProcessingTime`| long  | Общее время в наносекундах, затраченное на группировку и преобразование записей в единую структуру. |
| `taskProcessingTime`  | long  | Общее время в наносекундах, затраченное на обработку и вставку данных в ClickHouse.          |

### Ограничения {#limitations}

- Удаления не поддерживаются.
- Размер пакета наследуется от свойств потребителя Kafka.
- При использовании KeeperMap для режима exactly-once и изменении или перемотке смещения необходимо удалить содержимое из KeeperMap для этой конкретной темы. (См. ниже руководство по устранению неполадок для получения дополнительной информации)

### Настройка производительности {#tuning-performance}

Если вы когда-либо думали про себя "Я хотел бы настроить размер пакета для коннектора sink", то этот раздел предназначен для вас.

##### Fetch Connect vs Poll Connector {#connect-fetch-vs-connector-poll}

Kafka Connect (на базе которого работает наш коннектор sink) будет извлекать сообщения из топиков Kafka в фоновом режиме (независимо от коннектора).

Вы можете управлять этим процессом, используя `fetch.min.bytes` и `fetch.max.bytes` - в то время как `fetch.min.bytes` устанавливает минимальное количество, необходимое, прежде чем фреймворк передаст значения коннектору (в пределах временного лимита, установленного `fetch.max.wait.ms`), `fetch.max.bytes` устанавливает верхний предел размера. Если вы хотите передать более крупные пакеты коннектору, одним из вариантов может быть увеличение минимального извлечения или максимального ожидания для формирования больших пакетов данных.

Эти извлеченные данные затем используются клиентом коннектора, который опрашивает сообщения, при этом количество для каждого опроса контролируется `max.poll.records` - обратите внимание, что извлечение независимо от опроса!

При настройке этих параметров пользователи должны стремиться к тому, чтобы размер их извлечения создавал несколько пакетов `max.poll.records` (и не забудьте, что настройки `fetch.min.bytes` и `fetch.max.bytes` представляют сжатые данные) - таким образом, каждая задача коннектора вставляет как можно более крупный пакет.

ClickHouse оптимизирован для больших пакетов, даже с небольшой задержкой, а не для частых, но меньших пакетов - чем больше пакет, тем лучше.

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

Больше деталей можно найти в [документации Confluent](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration)
или в [документации Kafka](https://kafka.apache.org/documentation/#consumerconfigs).

#### Несколько тем с высокой пропускной способностью {#multiple-high-throughput-topics}

Если ваш коннектор настроен на подписку на несколько тем, вы используете `topics2TableMap` для сопоставления тем с таблицами, и вы испытываете узкое место при вставке, что приводит к задержкам потребления, рассмотрите возможность создания одного коннектора на тему. Основная причина, по которой это происходит, заключается в том, что в настоящее время пакеты вставляются в каждую таблицу [поочередно](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100).

Создание одного коннектора на тему является обходным решением, которое гарантирует, что вы получите максимально возможную скорость вставки.

### Устранение неполадок {#troubleshooting}

#### "Несоответствие состояния для темы `[someTopic]` партиция `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

Это происходит, когда смещение, хранящееся в KeeperMap, отличается от смещения, хранящегося в Kafka, обычно когда тема была удалена
или смещение было вручную изменено.
Чтобы исправить это, необходимо удалить старые значения, хранящиеся для данной темы + партиции.

**ПРИМЕЧАНИЕ: Эта корректировка может иметь последствия для exactly-once.**

#### "Какие ошибки будет повторно пытаться коннектор?" {#what-errors-will-the-connector-retry}

В настоящее время основное внимание уделяется выявлению ошибок, которые являются временными и могут быть повторными, включая:

- `ClickHouseException` - Это общий исключение, которое может быть выброшено ClickHouse.
  Обычно оно возникает, когда сервер перегружен, и следующие коды ошибок считаются особенно временными:
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
- `SocketTimeoutException` - Это исключение возникает, когда сокет истекает.
- `UnknownHostException` - Это исключение возникает, когда хост не может быть разрешен.
- `IOException` - Это исключение возникает, когда возникает проблема в сети.

#### "Все мои данные пустые/нули" {#all-my-data-is-blankzeroes}
Вероятно, поля в ваших данных не совпадают с полями в таблице - это особенно распространено с CDC (и форматом Debezium).
Одно из распространенных решений — добавить преобразование flatten в конфигурацию вашего коннектора:

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

Это преобразует ваши данные из вложенного JSON в уплощенный JSON (используя `_` в качестве разделителя). Поля в таблице будут следовать формату "field1_field2_field3" (т.е. "before_id", "after_id" и т.д.).

#### "Я хочу использовать мои ключи Kafka в ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Ключи Kafka по умолчанию не хранятся в поле значения, но вы можете использовать преобразование `KeyToValue`, чтобы переместить ключ в поле значения (под новым именем поля `_key`):

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
