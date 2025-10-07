---
'sidebar_label': 'ClickHouse Kafka Connect Sink'
'sidebar_position': 2
'slug': '/integrations/kafka/clickhouse-kafka-connect-sink'
'description': 'Официальный коннектор Kafka от ClickHouse.'
'title': 'ClickHouse Kafka Connect Sink'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
Если вам нужна помощь, пожалуйста, [сообщите о проблеме в репозитории](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) или задайте вопрос в [публичном Slack ClickHouse](https://clickhouse.com/slack).
:::
**ClickHouse Kafka Connect Sink** — это коннектор Kafka, который передает данные из топика Kafka в таблицу ClickHouse.

### Лицензия {#license}

Коннектор Kafka Sink распространяется под [лицензией Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).

### Требования к окружению {#requirements-for-the-environment}

В окружении должна быть установлена версия фреймворка [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) v2.7 или более поздняя.

### Матрица совместимости версий {#version-compatibility-matrix}

| Версия ClickHouse Kafka Connect | Версия ClickHouse | Kafka Connect | Confluent platform |
|---------------------------------|-------------------|---------------|--------------------|
| 1.0.0                           | > 23.3            | > 2.7         | > 6.1              |

### Основные функции {#main-features}

- Поставляется с готовой семантикой exactly-once. Она поддерживается новой основной функцией ClickHouse под названием [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) (используется как хранилище состояния коннектора) и позволяет создать минималистичную архитектуру.
- Поддержка сторонних хранилищ состояния: По умолчанию используется in-memory, но может использовать KeeperMap (Redis будет добавлен скоро).
- Интеграция с основным продуктом: Построен, поддерживается и обслуживается ClickHouse.
- Постоянное тестирование с [ClickHouse Cloud](https://clickhouse.com/cloud).
- Вставка данных с заданной схемой и без схемы.
- Поддержка всех типов данных ClickHouse.

### Инструкции по установке {#installation-instructions}

#### Соберите свои данные для подключения {#gather-your-connection-details}

<ConnectionDetails />

#### Общие инструкции по установке {#general-installation-instructions}

Коннектор распространяется в виде одного JAR файла, содержащего все классы, необходимые для работы плагина.

Чтобы установить плагин, выполните следующие шаги:

- Скачайте ZIP-архив, содержащий JAR файл коннектора, на странице [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) репозитория ClickHouse Kafka Connect Sink.
- Извлеките содержимое ZIP-файла и скопируйте его в нужное место.
- Добавьте путь с директорией плагинов в конфигурацию [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) в вашем файле свойств Connect, чтобы платформа Confluent могла найти плагин.
- Укажите имя топика, имя хоста экземпляра ClickHouse и пароль в конфигурации.

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
- Если вы используете платформу Confluent, войдите в пользовательский интерфейс Confluent Control Center, чтобы убедиться, что ClickHouse Sink доступен в списке доступных коннекторов.

### Опции конфигурации {#configuration-options}

Чтобы подключить ClickHouse Sink к серверу ClickHouse, вам необходимо предоставить:

- данные подключения: hostname (**обязательно**) и порт (опционально)
- учетные данные пользователя: пароль (**обязательно**) и имя пользователя (опционально)
- класс коннектора: `com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**обязательно**)
- topics или topics.regex: топики Kafka для опроса - имена топиков должны совпадать с именами таблиц (**обязательно**)
- преобразователи ключей и значений: настройте в зависимости от типа данных в вашем топике. Обязательно, если не определено в конфигурации рабочего процесса.

Полная таблица опций конфигурации:

| Имя свойства                                    | Описание                                                                                                                                                           | Значение по умолчанию                                                  |
|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| `hostname` (Обязательно)                       | Имя хоста или IP-адрес сервера                                                                                                                                   | N/A                                                                  |
| `port`                                         | Порт ClickHouse - по умолчанию 8443 (для HTTPS в облаке), но для HTTP (по умолчанию для саморазмещенных) это должно быть 8123                                     | `8443`                                                               |
| `ssl`                                          | Включить SSL-соединение с ClickHouse                                                                                                                            | `true`                                                               |
| `jdbcConnectionProperties`                     | Свойства соединения при подключении к Clickhouse. Должен начинаться с `?` и объединяться с помощью `&` между `param=value`                                      | `""`                                                                 |
| `username`                                     | Имя пользователя базы данных ClickHouse                                                                                                                          | `default`                                                            |
| `password` (Обязательно)                       | Пароль базы данных ClickHouse                                                                                                                                   | N/A                                                                  |
| `database`                                     | Имя базы данных ClickHouse                                                                                                                                     | `default`                                                            |
| `connector.class` (Обязательно)                | Класс коннектора (явно установленный и сохраненный как значение по умолчанию)                                                                                     | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"`             |
| `tasks.max`                                    | Количество задач коннектора                                                                                                                                     | `"1"`                                                                |
| `errors.retry.timeout`                         | Таймаут повторной попытки ClickHouse JDBC                                                                                                                        | `"60"`                                                               |
| `exactlyOnce`                                  | Включен режим Exactly Once                                                                                                                                      | `"false"`                                                            |
| `topics` (Обязательно)                         | Топики Kafka для опроса - имена топиков должны совпадать с именами таблиц                                                                                       | `""`                                                                 |
| `key.converter` (Обязательно* - см. Описание)  | Установите в зависимости от типов ваших ключей. Обязательно, если вы передаете ключи (и не определены в конфигурации рабочего процесса).                           | `"org.apache.kafka.connect.storage.StringConverter"`                  |
| `value.converter` (Обязательно* - см. Описание)| Установите в зависимости от типа данных в вашем топике. Поддерживаемые: - JSON, String, Avro или Protobuf форматы. Обязательно, если не определено в конфигурации рабочего процесса. | `"org.apache.kafka.connect.json.JsonConverter"`                      |
| `value.converter.schemas.enable`               | Поддержка схемы преобразователя значений коннектора                                                                                                             | `"false"`                                                            |
| `errors.tolerance`                             | Ошибки в коннекторе. Поддерживаемые: none, all                                                                                                                 | `"none"`                                                             |
| `errors.deadletterqueue.topic.name`            | Если установлено (с `errors.tolerance=all`), будет использоваться DLQ для неудачных пакетных операций (см. [Устранение неполадок](#troubleshooting))                   | `""`                                                                 |
| `errors.deadletterqueue.context.headers.enable`| Добавляет дополнительные заголовки для DLQ                                                                                                                      | `""`                                                                 |
| `clickhouseSettings`                           | Список настроек ClickHouse, разделенный запятыми (например, "insert_quorum=2 и т. д.")                                                                           | `""`                                                                 |
| `topic2TableMap`                               | Список, разделенный запятыми, который сопоставляет имена топиков с именами таблиц (например, "topic1=table1, topic2=table2 и т. д.")                               | `""`                                                                 |
| `tableRefreshInterval`                         | Время (в секундах) для обновления кэша определения таблицы                                                                                                        | `0`                                                                  |
| `keeperOnCluster`                              | Позволяет настроить параметр ON CLUSTER для саморазмещенных экземпляров (например, `ON CLUSTER clusterNameInConfigFileDefinition`) для таблицы connect_state exactly-once (см. [Распределенные DDL Запросы](/sql-reference/distributed-ddl)) | `""`                                                                 |
| `bypassRowBinary`                              | Позволяет отключить использование RowBinary и RowBinaryWithDefaults для данных на основе схемы (Avro, Protobuf и т. д.) - следует использовать только тогда, когда данные будут иметь отсутствующие столбцы, и Nullable/Default недопустимы | `"false"`                                                            |
| `dateTimeFormats`                              | Форматы даты и времени для разбора полей схемы DateTime64, разделенные `;` (например, `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`). | `""`                                                                 |
| `tolerateStateMismatch`                        | Позволяет коннектору удалять записи "ранее", чем текущий сохраненный офсет AFTER_PROCESSING (например, если передан офсет 5, а последний записанный офсет - 250) | `"false"`                                                            |
| `ignorePartitionsWhenBatching`                 | Игнорирует партицию при сборе сообщений для вставки (хотя только если `exactlyOnce` равно `false`). Примечание по производительности: больше задач коннектора, меньше партиций Kafka, назначенных на каждую задачу - это может означать снижающуюся отдачу. | `"false"`                                                            |

### Целевые таблицы {#target-tables}

ClickHouse Connect Sink считывает сообщения из топиков Kafka и записывает их в соответствующие таблицы. ClickHouse Connect Sink записывает данные в существующие таблицы. Пожалуйста, убедитесь, что целевая таблица с подходящей схемой была создана в ClickHouse до начала вставки данных в нее.

Каждому топику требуется выделенная целевая таблица в ClickHouse. Имя целевой таблицы должно совпадать с именем исходного топика.

### Предварительная обработка {#pre-processing}

Если вам нужно преобразовать исходящие сообщения перед их отправкой в ClickHouse Kafka Connect Sink, используйте [Преобразования Kafka Connect](https://docs.confluent.io/platform/current/connect/transforms/overview.html).

### Поддерживаемые типы данных {#supported-data-types}

**С объявленной схемой:**

| Тип Kafka Connect                       | Тип ClickHouse       | Поддерживается | Примитив |
|----------------------------------------|----------------------|----------------|----------|
| STRING                                 | String               | ✅             | Да       |
| STRING                                 | JSON. См. ниже (1)              | ✅             | Да       |
| INT8                                   | Int8                 | ✅             | Да       |
| INT16                                  | Int16                | ✅             | Да       |
| INT32                                  | Int32                | ✅             | Да       |
| INT64                                  | Int64                | ✅             | Да       |
| FLOAT32                                | Float32              | ✅             | Да       |
| FLOAT64                                | Float64              | ✅             | Да       |
| BOOLEAN                                | Boolean              | ✅             | Да       |
| ARRAY                                  | Array(T)             | ✅             | Нет      |
| MAP                                    | Map(Primitive, T)    | ✅             | Нет      |
| STRUCT                                 | Variant(T1, T2, ...)   | ✅             | Нет      |
| STRUCT                                 | Tuple(a T1, b T2, ...) | ✅             | Нет      |
| STRUCT                                 | Nested(a T1, b T2, ...) | ✅             | Нет      |
| STRUCT                                 | JSON. См. ниже (1), (2)          | ✅             | Нет      |
| BYTES                                  | String               | ✅             | Нет      |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64   | ✅             | Нет      |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32       | ✅             | Нет      |
| org.apache.kafka.connect.data.Decimal   | Decimal              | ✅             | Нет      |

- (1) - JSON поддерживается только тогда, когда в настройках ClickHouse установлен `input_format_binary_read_json_as_string=1`. Это работает только для семейства формата RowBinary, и эта настройка влияет на все столбцы в запросе вставки, так что они все должны быть строками. В этом случае коннектор преобразует STRUCT в строку JSON.

- (2) - Когда структура имеет объединения, такие как `oneof`, преобразователь должен быть настроен так, чтобы НЕ добавлять префикс/суффикс к именам полей. Существует настройка `generate.index.for.unions=false` [для `ProtobufConverter`](https://docs.confluent.io/platform/current/schema-registry/connect.html#protobuf).

**Без объявленной схемы:**

Запись преобразуется в JSON и отправляется в ClickHouse как значение в формате [JSONEachRow](../../../sql-reference/formats.mdx#jsoneachrow).

### Рецепты конфигурации {#configuration-recipes}

Вот некоторые общие рецепты конфигурации, которые помогут вам быстро начать.

#### Основная конфигурация {#basic-configuration}

Наиболее простая конфигурация, чтобы начать работу — предполагается, что вы запускаете Kafka Connect в распределенном режиме и у вас запущен сервер ClickHouse на `localhost:8443` с включенным SSL, данные находятся в JSON без схемы.

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

#### Основная конфигурация с несколькими топиками {#basic-configuration-with-multiple-topics}

Коннектор может потреблять данные из нескольких топиков.

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

Обратите внимание: если у вас возникают проблемы с отсутствующими классами, не в каждой среде есть преобразователь protobuf, и вам может потребоваться альтернативный выпуск jar с зависимостями.

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

##### Поддержка строки {#string-support}

Коннектор поддерживает преобразователь строки в разных форматах ClickHouse: [JSON](/interfaces/formats#jsoneachrow), [CSV](/interfaces/formats#csv) и [TSV](/interfaces/formats#tabseparated).

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

Логирование автоматически обеспечивается платформой Kafka Connect. Место назначения и формат журналирования могут быть настроены через конфигурационный файл Kafka connect [configuration file](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file).

Если вы используете платформу Confluent, логи можно просмотреть, выполнив команду CLI:

```bash
confluent local services connect log
```

Для получения дополнительных деталей ознакомьтесь с официальным [учебником](https://docs.confluent.io/platform/current/connect/logging.html).

### Мониторинг {#monitoring}

ClickHouse Kafka Connect сообщает метрики времени выполнения через [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html). JMX включен в коннектор Kafka по умолчанию.

Имя `MBeanName` ClickHouse Connect:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

ClickHouse Kafka Connect сообщает следующие метрики:

| Имя                     | Тип   | Описание                                                                              |
|------------------------|-------|--------------------------------------------------------------------------------------|
| `receivedRecords`      | long  | Общее количество полученных записей.                                                 |
| `recordProcessingTime` | long  | Общее время в наносекундах, потраченное на группировку и преобразование записей в единообразную структуру. |
| `taskProcessingTime`   | long  | Общее время в наносекундах, потраченное на обработку и вставку данных в ClickHouse. |

### Ограничения {#limitations}

- Удаления не поддерживаются.
- Размер пакета унаследован от свойств потребителя Kafka.
- При использовании KeeperMap для exactly-once и изменении или перематывании офсета необходимо удалить содержимое из KeeperMap для этого конкретного топика. (См. руководство по устранению неполадок ниже для получения более подробной информации).

### Оптимизация производительности {#tuning-performance}

Если вы когда-либо думали: "Я хотел бы отрегулировать размер пакета для коннектора sink", то этот раздел для вас.

##### Fetch Connect vs Poll Connector {#connect-fetch-vs-connector-poll}

Kafka Connect (фреймворк, на котором построен наш коннектор sink) будет фетчить сообщения из топиков Kafka в фоновом режиме (независимо от коннектора).

Вы можете контролировать этот процесс, используя `fetch.min.bytes` и `fetch.max.bytes` — в то время как `fetch.min.bytes` устанавливает минимальное количество, необходимое перед тем, как фреймворк передаст значения коннектору (в пределах временного лимита, установленного `fetch.max.wait.ms`), `fetch.max.bytes` устанавливает верхний предел размера. Если вы хотите передать более крупные пакеты в коннектор, одним из вариантов может быть увеличение минимального фетча или максимального ожидания для формирования больших наборов данных.

Эти извлеченные данные затем потребляются клиентом коннектора, опрашивающим сообщения, количество для каждого опроса контролируется `max.poll.records` — обратите внимание, что fetch независим от poll!

Когда вы настраиваете эти параметры, пользователи должны стремиться к тому, чтобы их размер извлечения производил несколько пакетов `max.poll.records` (и не забывайте, что настройки `fetch.min.bytes` и `fetch.max.bytes` представляют собой сжатые данные) — таким образом, каждая задача коннектора вставляет как можно больше пакетов.

ClickHouse оптимизирован для больших пакетов, даже с небольшими задержками, а не для частых, но маленьких пакетов — чем больше пакет, тем лучше.

```properties
consumer.max.poll.records=5000
consumer.max.partition.fetch.bytes=5242880
```

Более подробную информацию можно найти в [документации Confluent](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration) или в [документации Kafka](https://kafka.apache.org/documentation/#consumerconfigs).

#### Несколько топиков с высокой пропускной способностью {#multiple-high-throughput-topics}

Если ваш коннектор настроен на подписку на несколько топиков, вы используете `topic2TableMap` для сопоставления топиков с таблицами, и вы experiencing a bottleneck при вставке, что приводит к задержкам потребителя, рассмотрите возможность создания одного коннектора на топик вместо этого. Основная причина, по которой это происходит, заключается в том, что в настоящее время пакеты вставляются в каждую таблицу [поочередно](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100).

Создание одного коннектора на топик является обходным решением, которое гарантирует, что вы получите максимально возможную скорость вставки.

### Устранение неполадок {#troubleshooting}

#### "Несоответствие состояния для топика `[someTopic]` партиция `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

Это происходит, когда офсет, хранящийся в KeeperMap, отличается от офсета, хранящегося в Kafka, обычно когда топик был удален или офсет был вручную изменен. Чтобы исправить это, вам нужно удалить старые значения, хранящиеся для данного топика + партиции.

**ПРИМЕЧАНИЕ: Это изменение может иметь последствия для exactly-once.**

#### "Какие ошибки будет пытаться повторить коннектор?" {#what-errors-will-the-connector-retry}

На данный момент внимание уделяется выявлению ошибок, которые являются временными и могут быть повторены, включая:

- `ClickHouseException` — это общее исключение, которое может быть выброшено ClickHouse. Обычно оно выбрасывается, когда сервер перегружен, и следующие коды ошибок считаются особенно временными:
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
- `SocketTimeoutException` — Это выбрасывается, когда сокет истекает по времени.
- `UnknownHostException` — Это выбрасывается, когда хост не может быть разрешен.
- `IOException` — Это выбрасывается, когда есть проблема с сетью.

#### "Все мои данные пустые/нули" {#all-my-data-is-blankzeroes}
Вероятно, поля в ваших данных не соответствуют полям в таблице — это особенно распространено в случае CDC (и формата Debezium). Одним из распространенных решений является добавление трансформации flatten в конфигурацию вашего коннектора:

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

Это преобразует ваши данные из вложенного JSON в упрощенный JSON (используя `_` в качестве разделителя). Поля в таблице тогда будут иметь формат "field1_field2_field3" (т.е. "before_id", "after_id" и т.д.).

#### "Я хочу использовать свои ключи Kafka в ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}
Ключи Kafka по умолчанию не хранятся в поле значений, но вы можете использовать трансформацию `KeyToValue`, чтобы переместить ключ в поле значений (под новым именем поля `_key`):

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
