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
Если вам нужна помощь, пожалуйста, [создайте проблему в репозитории](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) или задайте вопрос в [публикации ClickHouse в Slack](https://clickhouse.com/slack).
:::
**ClickHouse Kafka Connect Sink** — это коннектор Kafka, который передает данные из темы Kafka в таблицу ClickHouse.

### Лицензия {#license}

Коннектор Kafka Sink распространяется под [лицензией Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

### Требования к окружению {#requirements-for-the-environment}

В окружении должна быть установлена версия фреймворка [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) v2.7 или выше.

### Матрица совместимости версий {#version-compatibility-matrix}

| Версия ClickHouse Kafka Connect | Версия ClickHouse | Kafka Connect | Платформа Confluent |
|----------------------------------|--------------------|---------------|----------------------|
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1                |

### Основные функции {#main-features}

- Поставляется с готовой к использованию семантикой exactly-once. Использует новую функцию ядра ClickHouse под названием [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) (используется в качестве хранилища состояния для коннектора) и позволяет создать минималистичную архитектуру.
- Поддержка сторонних хранилищ состояния: по умолчанию используется память, но также может использовать KeeperMap (вскоре будет добавлен Redis).
- Интеграция с ядром: разработан, поддерживается и поддерживается ClickHouse.
- Непрерывно тестируется с [ClickHouse Cloud](https://clickhouse.com/cloud).
- Вставка данных с объявленной схемой и без схемы.
- Поддержка всех типов данных ClickHouse.

### Инструкции по установке {#installation-instructions}

#### Соберите ваши данные для подключения {#gather-your-connection-details}

<ConnectionDetails />

#### Общие инструкции по установке {#general-installation-instructions}

Коннектор распространяется в виде единого JAR-файла, содержащего все классы, необходимые для работы плагина.

Чтобы установить плагин, выполните следующие шаги:

- Скачайте zip-архив, содержащий JAR-файл коннектора, со страницы [Релизы](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) репозитория ClickHouse Kafka Connect Sink.
- Извлеките содержимое ZIP-файла и скопируйте его в нужное место.
- Добавьте путь с директорией плагина в конфигурацию [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) в вашем файле свойств Connect, чтобы позволить платформе Confluent найти плагин.
- Укажите имя темы, имя хоста инстанса ClickHouse и пароль в конфигурации.

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

Чтобы подключить ClickHouse Sink к серверу ClickHouse, вам необходимо указать:

- данные подключения: hostname (**обязательно**) и port (необязательно)
- учетные данные пользователя: password (**обязательно**) и username (необязательно)
- класс коннектора: `com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**обязательно**)
- темы или topics.regex: темы Kafka для опроса — названия тем должны совпадать с названиями таблиц (**обязательно**)
- конвертеры ключей и значений: задавайте в зависимости от типа данных в вашей теме. Обязательно, если не уже определены в конфигурации worker.

Полная таблица опций конфигурации:

| Название свойства                                   | Описание                                                                                                                                                                                                                        | Значение по умолчанию                                     |
|-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `hostname` (Обязательно)                            | Имя хоста или IP-адрес сервера                                                                                                                                                                                                | N/A                                                      |
| `port`                                             | Порт ClickHouse — значение по умолчанию 8443 (для HTTPS в облаке), но для HTTP (значение по умолчанию для логирования на собственном хосте) это должно быть 8123                                                               | `8443`                                                   |
| `ssl`                                              | Включить ssl-соединение с ClickHouse                                                                                                                                                                                         | `true`                                                   |
| `jdbcConnectionProperties`                         | Параметры подключения при подключении к ClickHouse. Должны начинаться с `?` и соединяться `&` между `param=value`                                                                                                          | `""`                                                     |
| `username`                                         | Имя пользователя базы данных ClickHouse                                                                                                                                                                                       | `default`                                                |
| `password` (Обязательно)                           | Пароль базы данных ClickHouse                                                                                                                                                                                                   | N/A                                                      |
| `database`                                         | Название базы данных ClickHouse                                                                                                                                                                                               | `default`                                                |
| `connector.class` (Обязательно)                    | Класс коннектора (явно установлен и оставлен как значение по умолчанию)                                                                                                                                                       | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                        | Количество задач коннектора                                                                                                                                                                                                     | `"1"`                                                    |
| `errors.retry.timeout`                             | Таймаут повторного запроса JDBC ClickHouse                                                                                                                                                                                     | `"60"`                                                   |
| `exactlyOnce`                                      | Включен exactly once                                                                                                                                                                                                            | `"false"`                                                |
| `topics` (Обязательно)                              | Темы Kafka для опроса — названия тем должны совпадать с названиями таблиц                                                                                                                                                     | `""`                                                     |
| `key.converter` (Обязательно* - см. описание)      | Укажите в зависимости от типов ваших ключей. Обязательно, если вы передаете ключи (и не указаны в конфигурации Worker).                                                                                                        | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Обязательно* - см. описание)    | Установите в зависимости от типа данных в вашей теме. Поддерживаются: - форматы JSON, String, Avro или Protobuf. Обязательно, если не указаны в конфигурации Worker.                                                             | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                   | Поддержка схемы конвертера значений                                                                                                                                                                                           | `"false"`                                                |
| `errors.tolerance`                                 | Ошибка толерантности коннектора. Поддерживается: none, all                                                                                                                                                                   | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`                | Если задано (с errors.tolerance=all), будет использоваться DLQ для неудачных партий (см. [Устранение неполадок](#troubleshooting))                                                                                             | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable`    | Добавляет дополнительные заголовки для DLQ                                                                                                                                                                                   | `""`                                                     |
| `clickhouseSettings`                               | Список настроек ClickHouse, разделенный запятыми (например, "insert_quorum=2, etc...")                                                                                                                                      | `""`                                                     |
| `topic2TableMap`                                   | Список, разделенный запятыми, который сопоставляет названия тем с названиями таблиц (например, "topic1=table1, topic2=table2, etc...")                                                                                       | `""`                                                     |
| `tableRefreshInterval`                             | Время (в секундах) для обновления кеша определения таблицы                                                                                                                                                                     | `0`                                                      |
| `keeperOnCluster`                                  | Позволяет конфигурировать параметр ON CLUSTER для собственных инстансов (например, `ON CLUSTER clusterNameInConfigFileDefinition`) для таблицы connect_state с exactly-once (см. [Распределенные DDL Запросы](/sql-reference/distributed-ddl)) | `""`                                                     |
| `bypassRowBinary`                                  | Позволяет отключить использование RowBinary и RowBinaryWithDefaults для данных на основе схемы (Avro, Protobuf и т.д.) - должен использоваться только когда данные имеют отсутствующие столбцы, и Nullable/Default недопустимы           | `"false"`                                                |
| `dateTimeFormats`                                  | Форматы даты и времени для парсинга полей схемы DateTime64, разделенные `;` (например, `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`).                                                 | `""`                                                     |
| `tolerateStateMismatch`                            | Позволяет коннектору сбрасывать записи "раньше" текущего сохраненного смещения AFTER_PROCESSING (например, если смещение 5 отправлено, а смещение 250 было последним записанным смещением)                                 | `"false"`                                                |
| `ignorePartitionsWhenBatching`                     | Игнорирует партиции при сборе сообщений для вставки (хотя только если `exactlyOnce` равно `false`). Примечание по производительности: чем больше задач коннектора, тем меньше партиций Kafka будет назначено на задачу - это может означать уменьшение отдачи. | `"false"`                                                |

### Целевые таблицы {#target-tables}

ClickHouse Connect Sink читает сообщения из тем Kafka и записывает их в соответствующие таблицы. ClickHouse Connect Sink записывает данные в существующие таблицы. Пожалуйста, убедитесь, что целевая таблица с подходящей схемой была создана в ClickHouse перед началом вставки данных в неё.

Каждой теме требуется выделенная целевая таблица в ClickHouse. Название целевой таблицы должно совпадать с названием исходной темы.

### Предварительная обработка {#pre-processing}

Если вам нужно преобразовать исходящие сообщения перед отправкой их в ClickHouse Kafka Connect Sink, используйте [Преобразования Kafka Connect](https://docs.confluent.io/platform/current/connect/transforms/overview.html).

### Поддерживаемые типы данных {#supported-data-types}

**С объявленной схемой:**

| Тип Kafka Connect                    | Тип ClickHouse      | Поддерживается | Примитив |
|--------------------------------------|---------------------|----------------|----------|
| STRING                               | String              | ✅             | Да       |
| INT8                                 | Int8                | ✅             | Да       |
| INT16                                | Int16               | ✅             | Да       |
| INT32                                | Int32               | ✅             | Да       |
| INT64                                | Int64               | ✅             | Да       |
| FLOAT32                              | Float32             | ✅             | Да       |
| FLOAT64                              | Float64             | ✅             | Да       |
| BOOLEAN                              | Boolean             | ✅             | Да       |
| ARRAY                                | Array(T)            | ✅             | Нет      |
| MAP                                  | Map(Primitive, T)   | ✅             | Нет      |
| STRUCT                               | Variant(T1, T2, ...)  | ✅            | Нет      |
| STRUCT                               | Tuple(a T1, b T2, ...)| ✅            | Нет      |
| STRUCT                               | Nested(a T1, b T2, ...)| ✅           | Нет      |
| BYTES                                | String              | ✅             | Нет      |
| org.apache.kafka.connect.data.Time    | Int64 / DateTime64  | ✅             | Нет      |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32      | ✅            | Нет      |
| org.apache.kafka.connect.data.Decimal   | Decimal             | ✅             | Нет      |

**Без объявленной схемы:**

Запись преобразуется в JSON и отправляется в ClickHouse как значение в формате [JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow).

### Рецепты конфигурации {#configuration-recipes}

Это некоторые общие рецепты конфигурации, чтобы быстро начать работу.

#### Основная конфигурация {#basic-configuration}

Самая простая конфигурация, чтобы начать — предполагает, что вы запускаете Kafka Connect в распределенном режиме и у вас есть сервер ClickHouse, работающий на `localhost:8443` с включенным SSL, данные находятся в формате JSON без схемы.

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

#### Основная конфигурация с DLQ {#basic-configuration-with-dlq}

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

Пожалуйста, обратите внимание: если вы столкнетесь с проблемами с отсутствующими классами, не каждая среда поставляется с конвертером protobuf, и вам может понадобиться альтернативная версия JAR с зависимостями.

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

Коннектор поддерживает конвертер String в различных форматах ClickHouse: [JSON](/interfaces/formats#jsoneachrow), [CSV](/interfaces/formats#csv) и [TSV](/interfaces/formats#tabseparated).

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

Логирование предоставляется автоматически платформой Kafka Connect.
Место назначения и формат логирования могут быть настроены через [файл конфигурации](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file) Kafka Connect.

При использовании платформы Confluent логи можно увидеть, выполнив команду CLI:

```bash
confluent local services connect log
```

Для получения дополнительной информации ознакомьтесь с официальным [учебником](https://docs.confluent.io/platform/current/connect/logging.html).

### Мониторинг {#monitoring}

ClickHouse Kafka Connect сообщает о показателях времени через [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html). JMX включен в коннекторе Kafka по умолчанию.

`MBeanName` ClickHouse Connect:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect сообщает следующие метрики:

| Название                  | Тип  | Описание                                                                                         |
|---------------------------|------|---------------------------------------------------------------------------------------------------|
| `receivedRecords`         | long | Общее количество полученных записей.                                                             |
| `recordProcessingTime`    | long | Общее время в наносекундах, затраченное на группировку и преобразование записей в унифицированную структуру. |
| `taskProcessingTime`      | long | Общее время в наносекундах, затраченное на обработку и вставку данных в ClickHouse.              |

### Ограничения {#limitations}

- Удаления не поддерживаются.
- Размер партии унаследован от свойств потребителя Kafka.
- При использовании KeeperMap для exactly-once и изменении или перематывании смещения необходимо удалить содержимое из KeeperMap для конкретной темы. (Пожалуйста, смотрите руководство по устранению неполадок ниже для получения дополнительных деталей)

### Настройка производительности {#tuning-performance}

Если вы когда-либо думали: "Я хотел бы настроить размер партии для коннектора sink", тогда этот раздел для вас.

##### Fetch Connect против Подсчета коннектора {#connect-fetch-vs-connector-poll}

Kafka Connect (фреймворк, на котором построен наш коннектор sink) будет в фоновом режиме получать сообщения из тем Kafka (независимо от коннектора).

Вы можете контролировать этот процесс с помощью `fetch.min.bytes` и `fetch.max.bytes` — в то время как `fetch.min.bytes` устанавливает минимальное количество, необходимое, прежде чем фреймворк передаст значения коннектору (до предельного времени, установленного `fetch.max.wait.ms`), `fetch.max.bytes` устанавливает верхний предельный размер. Если вы хотите передать более крупные партии коннектору, одним из вариантов может быть увеличение минимального извлечения или максимального ожидания, чтобы сформировать более крупные пакеты данных.

Эти извлеченные данные затем потребляются клиентом коннектора, который опрашивает сообщения, где количество для каждого опроса контролируется параметром `max.poll.records` — обратите внимание, что извлечение независимо от опроса!

При настройке этих параметров пользователи должны стремиться к тому, чтобы их размер извлечения создавал несколько партий `max.poll.records` (и учитывать, что параметры `fetch.min.bytes` и `fetch.max.bytes` представляют сжатые данные) — так, чтобы каждая задача коннектора вставляла как можно большую партию.

ClickHouse оптимизирован для больших партий, даже с незначительной задержкой, а не для частых, но меньших партий — чем больше партия, тем лучше.

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

Более подробную информацию можно найти в [документации Confluent](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration)
или в [документации Kafka](https://kafka.apache.org/documentation/#consumerconfigs).

#### Несколько тем с высоким объемом трафика {#multiple-high-throughput-topics}

Если ваш коннектор настроен на подписку на несколько тем, вы используете `topic2TableMap`, чтобы сопоставить темы с таблицами, и вы испытываете узкое место при вставке, приводящее к задержке потребителя, подумайте о создании одного коннектора на тему. Главная причина, по которой это происходит, заключается в том, что в настоящее время партии вставляются в каждую таблицу [по очереди](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100).

Создание одного коннектора на тему является временным решением, которое обеспечивает максимально возможную скорость вставки.

### Устранение неполадок {#troubleshooting}

#### "Несоответствие состояния для темы `[someTopic]` партиции `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

Это происходит, когда смещение, сохраненное в KeeperMap, отличается от смещения, сохраненного в Kafka, обычно, когда тема была удалена
или смещение было вручную отрегулировано.
Чтобы исправить это, вам нужно удалить старые значения для данной темы + партиции.

**ПРИМЕЧАНИЕ: Это регулирование может иметь последствия для exactly-once.**

#### "Какие ошибки будет повторять коннектор?" {#what-errors-will-the-connector-retry}

В настоящее время акцент сделан на выявлении ошибок, которые являются временными и могут быть повторными, включая:

- `ClickHouseException` — это общее исключение, которое может быть вызвано ClickHouse.
  Обычно возникает, когда сервер перегружен, и следующие коды ошибок считаются особенно временными:
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
- `SocketTimeoutException` — выбрасывается, когда время ожидания сокета истекает.
- `UnknownHostException` — возникает, когда хост не может быть разрешен.
- `IOException` — выбрасывается, когда возникают проблемы с сетью.

#### "Все мои данные пустые/нулевые" {#all-my-data-is-blankzeroes}
Скорее всего, поля в ваших данных не совпадают с полями в таблице — это особенно часто бывает с CDC (и форматом Debezium).
Одно из распространенных решений — добавить преобразование flatten в конфигурацию вашего коннектора:

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

Это преобразует ваши данные из вложенного JSON в плоский JSON (используя `_` в качестве разделителя). Затем поля в таблице будут следовать формату "field1_field2_field3" (например, "before_id", "after_id" и т.д.).

#### "Я хочу использовать свои ключи Kafka в ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Ключи Kafka по умолчанию не хранятся в поле значений, но вы можете использовать преобразование `KeyToValue`, чтобы переместить ключ в поле значений (под новым названием поля `_key`):

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
