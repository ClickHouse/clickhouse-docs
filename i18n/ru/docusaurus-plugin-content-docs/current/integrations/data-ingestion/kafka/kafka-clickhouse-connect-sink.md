---
sidebar_label: ClickHouse Kafka Connect Sink
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: Официальный коннектор Kafka от ClickHouse.
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
Если вам нужна помощь, пожалуйста, [создайте проблему в репозитории](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) или задайте вопрос в [публичном Slack ClickHouse](https://clickhouse.com/slack).
:::
**ClickHouse Kafka Connect Sink** - это коннектор Kafka, который передает данные из темы Kafka в таблицу ClickHouse.

### License {#license}

Коннектор Kafka Sink распространяется под [Лицензией Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

### Requirements for the environment {#requirements-for-the-environment}

В окружении должна быть установлена фреймворк [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) версии 2.7 или более поздней.

### Version compatibility matrix {#version-compatibility-matrix}

| Версия ClickHouse Kafka Connect | Версия ClickHouse | Kafka Connect | Платформа Confluent |
|----------------------------------|--------------------|---------------|--------------------|
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1              |

### Main Features {#main-features}

- Поставляется с встроенной семантикой exactly-once. Она поддерживается новой функцией ядра ClickHouse, названной [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) (используется как состояние хранения коннектора) и позволяет создать минималистичную архитектуру.
- Поддержка сторонних хранилищ состояния: в данный момент по умолчанию используется In-memory, но может использовать KeeperMap (Redis будет добавлен в ближайшее время).
- Интеграция с основным ядром: создано, поддерживается и обслуживается ClickHouse.
- Непрерывное тестирование с [ClickHouse Cloud](https://clickhouse.com/cloud).
- Вставки данных с объявленной схемой и без схемы.
- Поддержка всех типов данных ClickHouse.

### Installation instructions {#installation-instructions}

#### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />

#### General Installation Instructions {#general-installation-instructions}

Коннектор распространяется в виде одного JAR-файла, содержащего все классы, необходимые для работы плагина.

Чтобы установить плагин, выполните следующие шаги:

- Скачайте zip-архив, содержащий файл Connector JAR, со страницы [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) репозитория ClickHouse Kafka Connect Sink.
- Извлеките содержимое ZIP-файла и скопируйте его в нужное место.
- Добавьте путь с директорией плагина к настройке [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) в вашем файле свойств Connect, чтобы позволить платформе Confluent найти плагин.
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

### Configuration options {#configuration-options}

Чтобы подключить ClickHouse Sink к серверу ClickHouse, вам необходимо предоставить:

- данные подключения: имя хоста (**обязательно**) и порт (необязательно)
- учетные данные пользователя: пароль (**обязательно**) и имя пользователя (необязательно)
- класс коннектора: `com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**обязательно**)
- topics или topics.regex: темы Kafka для отслеживания - имена тем должны соответствовать именам таблиц (**обязательно**)
- конвертеры ключа и значения: настраиваются в зависимости от типа данных в вашей теме. Обязательно, если еще не определены в конфигурации рабочего процесса.

Полная таблица параметров конфигурации:

| Название параметра                            | Описание                                                                                                                                                                                                                                                      | Значение по умолчанию                                   |
|-----------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| `hostname` (обязательно)                     | Имя хоста или IP-адрес сервера                                                                                                                                                                                                                               | N/A                                                   |
| `port`                                        | Порт ClickHouse - по умолчанию 8443 (для HTTPS в облаке), но для HTTP (по умолчанию для собственных серверов) он должен составлять 8123                                                                                                                       | `8443`                                               |
| `ssl`                                         | Включить ssl-соединение с ClickHouse                                                                                                                                                                                                                          | `true`                                               |
| `jdbcConnectionProperties`                    | Свойства подключения при подключении к ClickHouse. Должен начинаться с `?` и соединяться с помощью `&` между `param=value`                                                                                                                                 | `""`                                                 |
| `username`                                    | Имя пользователя базы данных ClickHouse                                                                                                                                                                                                                         | `default`                                            |
| `password` (обязательно)                     | Пароль базы данных ClickHouse                                                                                                                                                                                                                                   | N/A                                                  |
| `database`                                    | Имя базы данных ClickHouse                                                                                                                                                                                                                                     | `default`                                            |
| `connector.class` (обязательно)              | Класс коннектора (в явном виде установлен и сохранен как значение по умолчанию)                                                                                                                                                                                | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                   | Количество задач коннектора                                                                                                                                                                                                                                    | `"1"`                                               |
| `errors.retry.timeout`                        | Таймаут повторных попыток ClickHouse JDBC                                                                                                                                                                                                                      | `"60"`                                              |
| `exactlyOnce`                                 | Включение exactly Once                                                                                                                                                                                                                                         | `"false"`                                           |
| `topics` (обязательно)                       | Темы Kafka для отслеживания - имена тем должны соответствовать именам таблиц                                                                                                                                                                                  | `""`                                                 |
| `key.converter` (обязательно* - см. Описание) | Установить в зависимости от типов ваших ключей. Обязательно здесь, если вы передаете ключи (и не определены в конфигурации рабочего процесса).                                                                                                                | `"org.apache.kafka.connect.storage.StringConverter"`  |
| `value.converter` (обязательно* - см. Описание) | Установить в зависимости от типа данных в вашей теме. Поддерживаются: - JSON, String, Avro или Protobuf форматы. Обязательно здесь, если не определено в конфигурации рабочего процесса.                                                                        | `"org.apache.kafka.connect.json.JsonConverter"`       |
| `value.converter.schemas.enable`              | Поддержка схемы конвертера значения                                                                                                                                                                                                                           | `"false"`                                           |
| `errors.tolerance`                            | Ошибка толерантности коннектора. Поддерживаемые: none, all                                                                                                                                                                                                   | `"none"`                                            |
| `errors.deadletterqueue.topic.name`          | Если установлено (с errors.tolerance=all), будет использоваться DLQ для неудачных пакетов (см. [Устранение неполадок](#troubleshooting))                                                                                                                       | `""`                                               |
| `errors.deadletterqueue.context.headers.enable` | Добавляет дополнительные заголовки для DLQ                                                                                                                                                                                                                       | `""`                                                |
| `clickhouseSettings`                          | Список настроек ClickHouse, разделенных запятой (например, "insert_quorum=2 и т. д...")                                                                                                                                                                           | `""`                                                |
| `topic2TableMap`                              | Список, разделенный запятыми, который сопоставляет имена тем имена таблиц (например, "topic1=table1, topic2=table2 и т. д...")                                                                                                                                 | `""`                                                |
| `tableRefreshInterval`                        | Время (в секундах) для обновления кеша определения таблицы                                                                                                                                                                                                    | `0`                                                 |
| `keeperOnCluster`                             | Позволяет конфигурировать параметр ON CLUSTER для собственных экземпляров (например, `ON CLUSTER имясообщениевфайлеопределения`) для таблицы connect_state exactly-once (см. [Распределенные DDL Запросы](/sql-reference/distributed-ddl) | `""`                                               |
| `bypassRowBinary`                             | Позволяет отключить использование RowBinary и RowBinaryWithDefaults для данных на основе схемы (Avro, Protobuf и т. д.) - должен использоваться только в случае, если данные будут содержать пропущенные колонки, и Nullable/Default неприемлемы                              | `"false"`                                           |
| `dateTimeFormats`                             | Форматы даты и времени для анализа полей схемы DateTime64, разделенные `;` (например, `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`).                                                                                                                        | `""`                                                |
| `tolerateStateMismatch`                       | Позволяет коннектору игнорировать записи "раньше", чем текущее смещение, хранящееся AFTER_PROCESSING (например, если смещение 5 отправляется, а последнее записанное смещение составляет 250)                                                                           | `"false"`                                           |

### Target Tables {#target-tables}

ClickHouse Connect Sink читает сообщения из тем Kafka и пишет их в соответствующие таблицы. ClickHouse Connect Sink записывает данные в существующие таблицы. Пожалуйста, убедитесь, что целевая таблица с соответствующей схемой была создана в ClickHouse перед началом вставки данных в нее.

Каждая тема требует выделенной целевой таблицы в ClickHouse. Имя целевой таблицы должно совпадать с именем источника темы.

### Pre-processing {#pre-processing}

Если вам необходимо преобразовать исходящие сообщения перед их отправкой в ClickHouse Kafka Connect Sink, используйте [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html).

### Supported Data types {#supported-data-types}

**С объявленной схемой:**

| Тип Kafka Connect                       | Тип ClickHouse      | Поддерживается | Примитив  |
|----------------------------------------|---------------------|----------------|-----------|
| STRING                                 | String              | ✅             | Да        |
| INT8                                   | Int8                | ✅             | Да        |
| INT16                                  | Int16               | ✅             | Да        |
| INT32                                  | Int32               | ✅             | Да        |
| INT64                                  | Int64               | ✅             | Да        |
| FLOAT32                                | Float32             | ✅             | Да        |
| FLOAT64                                | Float64             | ✅             | Да        |
| BOOLEAN                                | Boolean             | ✅             | Да        |
| ARRAY                                  | Array(T)            | ✅             | Нет       |
| MAP                                    | Map(Primitive, T)   | ✅             | Нет       |
| STRUCT                                 | Variant(T1, T2, …)  | ✅             | Нет       |
| STRUCT                                 | Tuple(a T1, b T2, …)| ✅             | Нет       |
| STRUCT                                 | Nested(a T1, b T2, …)| ✅            | Нет       |
| BYTES                                  | String              | ✅             | Нет       |
| org.apache.kafka.connect.data.Time     | Int64 / DateTime64  | ✅             | Нет       |
| org.apache.kafka.connect.data.Timestamp| Int32 / Date32      | ✅             | Нет       |
| org.apache.kafka.connect.data.Decimal  | Decimal             | ✅             | Нет       |

**Без объявленной схемы:**

Запись преобразуется в JSON и отправляется в ClickHouse как значение в формате [JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow).

### Configuration Recipes {#configuration-recipes}

Вот некоторые общие рецепты конфигурации, которые помогут вам быстро начать.

#### Basic Configuration {#basic-configuration}

Самая базовая конфигурация, чтобы начать - предполагается, что вы запускаете Kafka Connect в распределенном режиме и у вас запущен сервер ClickHouse на `localhost:8443` с включенным SSL, данные находятся в формате JSON без схемы.

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

#### Basic Configuration with Multiple Topics {#basic-configuration-with-multiple-topics}

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

#### Basic Configuration with DLQ {#basic-configuration-with-dlq}

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

#### Using with different data formats {#using-with-different-data-formats}

##### Avro Schema Support {#avro-schema-support}

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

##### Protobuf Schema Support {#protobuf-schema-support}

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

Пожалуйста, обратите внимание: если вы столкнетесь с проблемами отсутствующих классов, не каждое окружение поставляется с конвертером protobuf, и вам может понадобиться альтернативная версия jar с зависимостями.

##### JSON Schema Support {#json-schema-support}

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

##### String Support {#string-support}

Коннектор поддерживает конвертер строк в разных форматах ClickHouse: [JSON](/interfaces/formats#jsoneachrow), [CSV](/interfaces/formats#csv) и [TSV](/interfaces/formats#tabseparated).

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

### Logging {#logging}

Логирование автоматически предоставляется платформой Kafka Connect.
Место назначения и формат журналирования могут быть настроены через файл [конфигурации Kafka connect](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file).

Если вы используете платформу Confluent, логи можно увидеть с помощью выполнения команды CLI:

```bash
confluent local services connect log
```

Для дополнительных подробностей ознакомьтесь с официальным [учебником](https://docs.confluent.io/platform/current/connect/logging.html).

### Monitoring {#monitoring}

ClickHouse Kafka Connect сообщает о метриках времени выполнения через [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html). JMX включен в Kafka Connector по умолчанию.

Имя `MBeanName` ClickHouse Connect:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect сообщает о следующих метриках:

| Название                      | Тип  | Описание                                                                                     |
|-------------------------------|------|---------------------------------------------------------------------------------------------|
| `receivedRecords`             | long | Общее количество полученных записей.                                                        |
| `recordProcessingTime`        | long | Общее время в наносекундах, затраченное на группировку и преобразование записей в единую структуру. |
| `taskProcessingTime`          | long | Общее время в наносекундах, затраченное на обработку и вставку данных в ClickHouse.             |

### Limitations {#limitations}

- Удаления не поддерживаются.
- Размер пакета наследуется от свойств потребителя Kafka.
- При использовании KeeperMap для exactly-once и изменении или обратной перемотке смещения вам нужно удалить содержимое из KeeperMap для данной темы. (См. руководство по устранению неполадок ниже для получения более подробной информации)

### Tuning Performance {#tuning-performance}

Если вы когда-либо думали: "Я хотел бы настроить размер пакета для коннектора sink", то этот раздел для вас.

##### Connect Fetch vs Connector Poll {#connect-fetch-vs-connector-poll}

Kafka Connect (фреймворк, на котором построен наш коннектор sink) будет получать сообщения из тем Kafka в фоновом режиме (независимо от коннектора).

Вы можете управлять этим процессом, используя `fetch.min.bytes` и `fetch.max.bytes` - в то время как `fetch.min.bytes` задает минимальное количество, необходимое перед тем, как фреймворк передаст значения коннектору (в пределах временного лимита, установленного `fetch.max.wait.ms`), `fetch.max.bytes` устанавливает верхний размерный лимит. Если вы хотите передавать более крупные пакеты коннектору, одним из вариантов может быть увеличение минимального получения или максимального ожидания для создания более крупных пакетов данных.

Эти полученные данные затем обрабатываются клиентом коннектора, опрашивающим сообщения, где количество для каждого опроса контролируется `max.poll.records` - имейте в виду, что получение является независимым от опроса!

При настройке этих параметров пользователи должны стремиться к тому, чтобы их размер получения производил несколько пакетов `max.poll.records` (и помнить, что параметры `fetch.min.bytes` и `fetch.max.bytes` представляют собой сжатые данные) - таким образом, каждая задача коннектора вставляет как можно больший пакет.

ClickHouse оптимизирован для более крупных пакетов, даже с небольшими задержками, а не для частых, но меньших пакетов - чем больше пакет, тем лучше.

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

Больше деталей можно найти в [документации Confluent](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration)
или в [документации Kafka](https://kafka.apache.org/documentation/#consumerconfigs).

#### Multiple high throughput topics {#multiple-high-throughput-topics}

Если ваш коннектор настроен на подписку на несколько тем, вы используете `topics2TableMap` для сопоставления тем с таблицами, и вы испытываете узкое место при вставке, что приводит к задержке потребителя, подумайте о создании одного коннектора для каждой темы вместо этого. Основная причина, по которой это происходит, заключается в том, что в данный момент пакеты вставляются в каждую таблицу [последовательно](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100).

Создание одного коннектора для каждой темы является обходным решением, которое гарантирует, что вы получите максимально возможную скорость вставки.

### Troubleshooting {#troubleshooting}

#### "State mismatch for topic `[someTopic]` partition `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

Это происходит, когда смещение, хранящееся в KeeperMap, отличается от смещения, хранящегося в Kafka, обычно когда тема была удалена
или смещение было настроено вручную.
Чтобы исправить это, вам нужно удалить старые значения, хранящиеся для данной темы + раздела.

**ПРИМЕЧАНИЕ: Эта корректировка может иметь последствия в отношении exactly-once.**

#### "What errors will the connector retry?" {#what-errors-will-the-connector-retry}

В данный момент внимание сосредоточено на выявлении ошибок, которые являются временными и могут быть повторены, включая:

- `ClickHouseException` - это общее исключение, которое может быть выброшено ClickHouse.
  Обычно оно выбрасывается, когда сервер перегружен, и следующие коды ошибок считаются особенно временными:
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
- `SocketTimeoutException` - Это исключение выбрасывается, когда истекает время ожидания сокета.
- `UnknownHostException` - Это исключение выбрасывается, когда хост не может быть разрешен.
- `IOException` - Это исключение выбрасывается, когда возникает проблема с сетью.

#### "All my data is blank/zeroes" {#all-my-data-is-blankzeroes}
Вероятно, поля в ваших данных не совпадают с полями в таблице - это особенно часто встречается с CDC (и форматом Debezium).
Одно из распространенных решений - добавить преобразование flatten в конфигурацию вашего коннектора:

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

Это преобразует ваши данные из вложенного JSON в плоский JSON (используя `_` в качестве разделителя). Поля в таблице будут следовать формату "field1_field2_field3" (например, "before_id", "after_id" и т. д.).

#### "I want to use my Kafka keys in ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Ключи Kafka не хранятся в поле значения по умолчанию, но вы можете использовать преобразование `KeyToValue`, чтобы переместить ключ в поле значения (под именем нового поля `_key`):

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
