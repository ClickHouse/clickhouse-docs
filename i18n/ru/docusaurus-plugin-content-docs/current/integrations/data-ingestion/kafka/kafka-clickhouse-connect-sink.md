---
sidebar_label: 'ClickHouse Kafka Connect Sink'
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: 'Официальный коннектор Kafka для ClickHouse.'
title: 'ClickHouse Kafka Connect Sink'
doc_type: 'guide'
keywords: ['ClickHouse Kafka Connect Sink', 'Kafka connector ClickHouse', 'official ClickHouse connector', 'ClickHouse Kafka integration']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';


# ClickHouse Kafka Connect Sink

:::note
Если вам нужна помощь, пожалуйста, [создайте issue в репозитории](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) или задайте вопрос в [публичном Slack ClickHouse](https://clickhouse.com/slack).
:::
**ClickHouse Kafka Connect Sink** — это коннектор Kafka, который передает данные из топика Kafka в таблицу ClickHouse.

### Лицензия {#license}

Kafka Connector Sink распространяется под лицензией [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

### Требования к окружению {#requirements-for-the-environment}

В окружении должен быть установлен фреймворк [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) версии 2.7 или выше.

### Матрица совместимости версий {#version-compatibility-matrix}

| Версия ClickHouse Kafka Connect | Версия ClickHouse | Kafka Connect | Платформа Confluent |
| -------------------------------- | ------------------ | ------------- | ------------------ |
| 1.0.0                            | > 23.3             | > 2.7         | > 6.1              |

### Основные возможности {#main-features}

- Поставляется с готовой семантикой exactly-once. Работает на основе новой функции ядра ClickHouse под названием [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) (используется коннектором в качестве хранилища состояний) и позволяет создавать минималистичную архитектуру.
- Поддержка сторонних хранилищ состояний: по умолчанию используется In-memory, но можно использовать KeeperMap (поддержка Redis будет добавлена в ближайшее время).
- Основная интеграция: разработан, поддерживается и сопровождается командой ClickHouse.
- Непрерывно тестируется с [ClickHouse Cloud](https://clickhouse.com/cloud).
- Вставка данных с объявленной схемой и без схемы.
- Поддержка всех типов данных ClickHouse.

### Инструкции по установке {#installation-instructions}

#### Соберите данные для подключения {#gather-your-connection-details}

<ConnectionDetails />

#### Общие инструкции по установке {#general-installation-instructions}

Коннектор распространяется в виде одного JAR-файла, содержащего все файлы классов, необходимые для запуска плагина.

Чтобы установить плагин, выполните следующие шаги:

- Скачайте zip-архив, содержащий JAR-файл коннектора, со страницы [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) репозитория ClickHouse Kafka Connect Sink.
- Распакуйте содержимое ZIP-файла и скопируйте его в нужное расположение.
- Добавьте путь к директории плагина в конфигурацию [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) в файле свойств Connect, чтобы платформа Confluent могла найти плагин.
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
- Если вы используете платформу Confluent, войдите в интерфейс Confluent Control Center, чтобы убедиться, что ClickHouse Sink доступен в списке доступных коннекторов.

### Параметры конфигурации {#configuration-options}

Чтобы подключить ClickHouse Sink к серверу ClickHouse, необходимо указать:

- данные подключения: имя хоста (**обязательно**) и порт (необязательно)
- учетные данные пользователя: пароль (**обязательно**) и имя пользователя (необязательно)
- класс коннектора: `com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**обязательно**)
- topics или topics.regex: топики Kafka для опроса — имена топиков должны совпадать с именами таблиц (**обязательно**)
- конвертеры ключей и значений: устанавливаются в зависимости от типа данных в вашем топике. Обязательны, если не определены в конфигурации воркера.

Полная таблица параметров конфигурации:


| Имя свойства                                     | Описание                                                                                                                                                                                                                           | Значение по умолчанию                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `hostname` (Обязательно)                         | Имя хоста или IP-адрес сервера                                                                                                                                                                                                     | Н/Д                                                      |
| `port`                                           | Порт ClickHouse — по умолчанию 8443 (для HTTPS в облаке), но для HTTP (по умолчанию для самостоятельного развертывания) следует использовать 8123                                                                                  | `8443`                                                   |
| `ssl`                                            | Включить SSL-соединение с ClickHouse                                                                                                                                                                                               | `true`                                                   |
| `jdbcConnectionProperties`                       | Свойства соединения при подключении к ClickHouse. Должны начинаться с `?` и объединяться через `&` между `param=value`                                                                                                            | `""`                                                     |
| `username`                                       | Имя пользователя базы данных ClickHouse                                                                                                                                                                                            | `default`                                                |
| `password` (Обязательно)                         | Пароль базы данных ClickHouse                                                                                                                                                                                                      | Н/Д                                                      |
| `database`                                       | Имя базы данных ClickHouse                                                                                                                                                                                                         | `default`                                                |
| `connector.class` (Обязательно)                  | Класс коннектора (явно задайте и сохраните значение по умолчанию)                                                                                                                                                                  | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                      | Количество задач коннектора                                                                                                                                                                                                        | `"1"`                                                    |
| `errors.retry.timeout`                           | Таймаут повторных попыток ClickHouse JDBC                                                                                                                                                                                          | `"60"`                                                   |
| `exactlyOnce`                                    | Включена семантика Exactly Once                                                                                                                                                                                                    | `"false"`                                                |
| `topics` (Обязательно)                           | Топики Kafka для опроса — имена топиков должны совпадать с именами таблиц                                                                                                                                                          | `""`                                                     |
| `key.converter` (Обязательно\* — см. описание)   | Задайте в соответствии с типами ваших ключей. Обязательно здесь, если вы передаете ключи (и это не определено в конфигурации воркера).                                                                                             | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Обязательно\* — см. описание) | Задайте на основе типа данных в вашем топике. Поддерживаются форматы: JSON, String, Avro или Protobuf. Обязательно здесь, если не определено в конфигурации воркера.                                                               | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                 | Поддержка схем конвертером значений коннектора                                                                                                                                                                                     | `"false"`                                                |
| `errors.tolerance`                               | Толерантность коннектора к ошибкам. Поддерживаются: none, all                                                                                                                                                                      | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`              | Если задано (с errors.tolerance=all), для неудачных пакетов будет использоваться DLQ (см. [Устранение неполадок](#troubleshooting))                                                                                                | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable`  | Добавляет дополнительные заголовки для DLQ                                                                                                                                                                                         | `""`                                                     |
| `clickhouseSettings`                             | Список настроек ClickHouse через запятую (например, "insert_quorum=2" и т. д.)                                                                                                                                                     | `""`                                                     |
| `topic2TableMap`                                 | Список через запятую, сопоставляющий имена топиков с именами таблиц (например, "topic1=table1, topic2=table2" и т. д.)                                                                                                             | `""`                                                     |
| `tableRefreshInterval`                           | Время (в секундах) для обновления кеша определений таблиц                                                                                                                                                                          | `0`                                                      |
| `keeperOnCluster`                                | Позволяет настроить параметр ON CLUSTER для самостоятельно развернутых экземпляров (например, `ON CLUSTER clusterNameInConfigFileDefinition`) для таблицы connect_state с семантикой exactly-once (см. [Распределенные DDL-запросы](/sql-reference/distributed-ddl)) | `""`                                                     |
| `bypassRowBinary`                                | Позволяет отключить использование RowBinary и RowBinaryWithDefaults для данных на основе схем (Avro, Protobuf и т. д.) — следует использовать только когда в данных будут отсутствующие столбцы, а Nullable/Default неприемлемы     | `"false"`                                                |
| `dateTimeFormats`                                | Форматы даты и времени для разбора полей схемы DateTime64, разделенные `;` (например, `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`).                                                       | `""`                                                     |
| `tolerateStateMismatch`                          | Позволяет коннектору отбрасывать записи «более ранние», чем текущее смещение, сохраненное AFTER_PROCESSING (например, если отправлено смещение 5, а последнее записанное смещение было 250)                                         | `"false"`                                                |
| `ignorePartitionsWhenBatching`                   | Будет игнорировать разделы при сборе сообщений для вставки (но только если `exactlyOnce` равно `false`). Примечание по производительности: чем больше задач коннектора, тем меньше разделов Kafka назначается на задачу — это может означать снижение эффективности. | `"false"`                                                |

### Целевые таблицы {#target-tables}


ClickHouse Connect Sink читает сообщения из топиков Kafka и записывает их в соответствующие таблицы. ClickHouse Connect Sink записывает данные только в существующие таблицы. Убедитесь, что целевая таблица с соответствующей схемой создана в ClickHouse до начала вставки данных.

Для каждого топика требуется отдельная целевая таблица в ClickHouse. Имя целевой таблицы должно совпадать с именем исходного топика.

### Предварительная обработка {#pre-processing}

Если необходимо преобразовать исходящие сообщения перед их отправкой в ClickHouse Kafka Connect
Sink, используйте [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html).

### Поддерживаемые типы данных {#supported-data-types}

**С объявленной схемой:**

| Тип Kafka Connect                       | Тип ClickHouse           | Поддержка | Примитивный |
| --------------------------------------- | ------------------------ | --------- | --------- |
| STRING                                  | String                   | ✅        | Да       |
| STRING                                  | JSON. См. ниже (1)      | ✅        | Да       |
| INT8                                    | Int8                     | ✅        | Да       |
| INT16                                   | Int16                    | ✅        | Да       |
| INT32                                   | Int32                    | ✅        | Да       |
| INT64                                   | Int64                    | ✅        | Да       |
| FLOAT32                                 | Float32                  | ✅        | Да       |
| FLOAT64                                 | Float64                  | ✅        | Да       |
| BOOLEAN                                 | Boolean                  | ✅        | Да       |
| ARRAY                                   | Array(T)                 | ✅        | Нет        |
| MAP                                     | Map(Primitive, T)        | ✅        | Нет        |
| STRUCT                                  | Variant(T1, T2, ...)     | ✅        | Нет        |
| STRUCT                                  | Tuple(a T1, b T2, ...)   | ✅        | Нет        |
| STRUCT                                  | Nested(a T1, b T2, ...)  | ✅        | Нет        |
| STRUCT                                  | JSON. См. ниже (1), (2) | ✅        | Нет        |
| BYTES                                   | String                   | ✅        | Нет        |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64       | ✅        | Нет        |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32           | ✅        | Нет        |
| org.apache.kafka.connect.data.Decimal   | Decimal                  | ✅        | Нет        |

- (1) - JSON поддерживается только при установке параметра `input_format_binary_read_json_as_string=1` в настройках ClickHouse. Это работает только для семейства форматов RowBinary, и параметр влияет на все столбцы в запросе вставки, поэтому все они должны быть строками. В этом случае коннектор преобразует STRUCT в строку JSON.

- (2) - Когда структура содержит объединения типа `oneof`, конвертер должен быть настроен так, чтобы НЕ добавлять префикс/суффикс к именам полей. Для этого используется параметр `generate.index.for.unions=false` [для `ProtobufConverter`](https://docs.confluent.io/platform/current/schema-registry/connect.html#protobuf).

**Без объявленной схемы:**

Запись преобразуется в JSON и отправляется в ClickHouse как значение в формате [JSONEachRow](/interfaces/formats/JSONEachRow).

### Примеры конфигурации {#configuration-recipes}

Ниже приведены распространенные примеры конфигурации для быстрого начала работы.

#### Базовая конфигурация {#basic-configuration}

Минимальная конфигурация для начала работы — предполагается, что Kafka Connect запущен в распределенном режиме, сервер ClickHouse работает на `localhost:8443` с включенным SSL, данные представлены в JSON без схемы.

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

#### Базовая конфигурация с несколькими топиками {#basic-configuration-with-multiple-topics}

Коннектор может потреблять данные из нескольких топиков


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
    "errors.deadletterqueue.context.headers.enable": "true",
  }
}
```

#### Использование с различными форматами данных {#using-with-different-data-formats}

##### Поддержка схем Avro {#avro-schema-support}

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

##### Поддержка схем Protobuf {#protobuf-schema-support}

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

Обратите внимание: если вы столкнетесь с проблемами отсутствующих классов, не во всех окружениях присутствует конвертер protobuf, и вам может потребоваться альтернативная версия jar-файла с включенными зависимостями.

##### Поддержка схем JSON {#json-schema-support}

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

##### Поддержка строк {#string-support}

Коннектор поддерживает String Converter в различных форматах ClickHouse: [JSON](/interfaces/formats/JSONEachRow), [CSV](/interfaces/formats/CSV) и [TSV](/interfaces/formats/TabSeparated).

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

Логирование автоматически предоставляется платформой Kafka Connect.
Назначение и формат логирования можно настроить через [конфигурационный файл](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file) Kafka Connect.

При использовании Confluent Platform логи можно просмотреть, выполнив команду CLI:

```bash
confluent local services connect log
```

Дополнительную информацию см. в официальном [руководстве](https://docs.confluent.io/platform/current/connect/logging.html).

### Мониторинг {#monitoring}

ClickHouse Kafka Connect предоставляет метрики времени выполнения через [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html). JMX включен в Kafka Connector по умолчанию.

#### Метрики ClickHouse {#clickhouse-specific-metrics}

Коннектор предоставляет пользовательские метрики через следующее имя MBean:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

| Имя метрики            | Тип  | Описание                                                                                            |
| ---------------------- | ---- | --------------------------------------------------------------------------------------------------- |
| `receivedRecords`      | long | Общее количество полученных записей.                                                                |
| `recordProcessingTime` | long | Общее время в наносекундах, затраченное на группировку и преобразование записей в единую структуру. |
| `taskProcessingTime`   | long | Общее время в наносекундах, затраченное на обработку и вставку данных в ClickHouse.                |

#### Метрики Kafka Producer/Consumer {#kafka-producer-consumer-metrics}

Коннектор предоставляет стандартные метрики производителя и потребителя Kafka, которые дают представление о потоке данных, пропускной способности и производительности.

**Метрики уровня топика:**

- `records-sent-total`: Общее количество записей, отправленных в топик
- `bytes-sent-total`: Общее количество байт, отправленных в топик
- `record-send-rate`: Средняя скорость отправки записей в секунду
- `byte-rate`: Средняя скорость отправки байт в секунду
- `compression-rate`: Достигнутый коэффициент сжатия


**Метрики уровня партиции:**

- `records-sent-total`: Общее количество записей, отправленных в партицию
- `bytes-sent-total`: Общее количество байтов, отправленных в партицию
- `records-lag`: Текущее отставание в партиции
- `records-lead`: Текущее опережение в партиции
- `replica-fetch-lag`: Информация об отставании реплик

**Метрики подключений уровня узла:**

- `connection-creation-total`: Общее количество созданных подключений к узлу Kafka
- `connection-close-total`: Общее количество закрытых подключений
- `request-total`: Общее количество запросов, отправленных на узел
- `response-total`: Общее количество ответов, полученных от узла
- `request-rate`: Средняя частота запросов в секунду
- `response-rate`: Средняя частота ответов в секунду

Эти метрики помогают отслеживать:

- **Пропускную способность**: Отслеживание скорости приёма данных
- **Отставание**: Выявление узких мест и задержек обработки
- **Сжатие**: Измерение эффективности сжатия данных
- **Состояние подключений**: Мониторинг сетевого соединения и стабильности

#### Метрики фреймворка Kafka Connect {#kafka-connect-framework-metrics}

Коннектор интегрируется с фреймворком Kafka Connect и предоставляет метрики для отслеживания жизненного цикла задач и ошибок.

**Метрики статуса задач:**

- `task-count`: Общее количество задач в коннекторе
- `running-task-count`: Количество выполняющихся задач
- `paused-task-count`: Количество приостановленных задач
- `failed-task-count`: Количество задач, завершившихся с ошибкой
- `destroyed-task-count`: Количество уничтоженных задач
- `unassigned-task-count`: Количество неназначенных задач

Значения статуса задач включают: `running`, `paused`, `failed`, `destroyed`, `unassigned`

**Метрики ошибок:**

- `deadletterqueue-produce-failures`: Количество неудачных записей в DLQ
- `deadletterqueue-produce-requests`: Общее количество попыток записи в DLQ
- `last-error-timestamp`: Временная метка последней ошибки
- `records-skip-total`: Общее количество записей, пропущенных из-за ошибок
- `records-retry-total`: Общее количество записей, для которых была выполнена повторная попытка
- `errors-total`: Общее количество обнаруженных ошибок

**Метрики производительности:**

- `offset-commit-failures`: Количество неудачных фиксаций смещений
- `offset-commit-avg-time-ms`: Среднее время фиксации смещений
- `offset-commit-max-time-ms`: Максимальное время фиксации смещений
- `put-batch-avg-time-ms`: Среднее время обработки пакета
- `put-batch-max-time-ms`: Максимальное время обработки пакета
- `source-record-poll-total`: Общее количество опрошенных записей

#### Рекомендации по мониторингу {#monitoring-best-practices}

1. **Мониторинг отставания потребителя**: Отслеживайте `records-lag` для каждой партиции, чтобы выявлять узкие места в обработке
2. **Отслеживание частоты ошибок**: Следите за `errors-total` и `records-skip-total` для обнаружения проблем с качеством данных
3. **Наблюдение за состоянием задач**: Отслеживайте метрики статуса задач, чтобы убедиться в их корректной работе
4. **Измерение пропускной способности**: Используйте `records-send-rate` и `byte-rate` для отслеживания производительности приёма данных
5. **Мониторинг состояния подключений**: Проверяйте метрики подключений уровня узла на наличие сетевых проблем
6. **Отслеживание эффективности сжатия**: Используйте `compression-rate` для оптимизации передачи данных

Подробные определения метрик JMX и интеграцию с Prometheus см. в конфигурационном файле [jmx-export-connector.yml](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/jmx-export-connector.yml).

### Ограничения {#limitations}

- Удаления не поддерживаются.
- Размер пакета наследуется из свойств Kafka Consumer.
- При использовании KeeperMap для режима exactly-once и изменении или откате смещения необходимо удалить содержимое из KeeperMap для конкретного топика. (Подробнее см. в руководстве по устранению неполадок ниже)

### Настройка производительности и оптимизация пропускной способности {#tuning-performance}

В этом разделе рассматриваются стратегии настройки производительности для ClickHouse Kafka Connect Sink. Настройка производительности необходима при работе со сценариями высокой пропускной способности или когда требуется оптимизировать использование ресурсов и минимизировать отставание.

#### Когда требуется настройка производительности? {#when-is-performance-tuning-needed}

Настройка производительности обычно требуется в следующих сценариях:

- **Высоконагруженные рабочие нагрузки**: При обработке миллионов событий в секунду из топиков Kafka
- **Отставание потребителя**: Когда коннектор не успевает за скоростью производства данных, что приводит к увеличению отставания
- **Ограничения ресурсов**: Когда необходимо оптимизировать использование процессора, памяти или сети
- **Множественные топики**: При одновременном потреблении из нескольких высоконагруженных топиков
- **Малые размеры сообщений**: При работе с большим количеством небольших сообщений, которые выиграют от пакетной обработки на стороне сервера

Настройка производительности **обычно НЕ требуется**, когда:

- Обрабатываются низкие или умеренные объёмы (< 10 000 сообщений/секунду)
- Отставание потребителя стабильно и приемлемо для вашего сценария использования
- Настройки коннектора по умолчанию уже соответствуют требованиям к пропускной способности
- Кластер ClickHouse легко справляется с входящей нагрузкой


#### Понимание потока данных {#understanding-the-data-flow}

Перед настройкой важно понять, как данные проходят через коннектор:

1. **Kafka Connect Framework** извлекает сообщения из топиков Kafka в фоновом режиме
2. **Коннектор опрашивает** сообщения из внутреннего буфера фреймворка
3. **Коннектор группирует** сообщения на основе размера опроса
4. **ClickHouse получает** пакетную вставку через HTTP/S
5. **ClickHouse обрабатывает** вставку (синхронно или асинхронно)

Производительность можно оптимизировать на каждом из этих этапов.

#### Настройка размера пакетов Kafka Connect {#connect-fetch-vs-connector-poll}

Первый уровень оптимизации — управление объемом данных, которые коннектор получает в одном пакете из Kafka.

##### Настройки извлечения {#fetch-settings}

Kafka Connect (фреймворк) извлекает сообщения из топиков Kafka в фоновом режиме, независимо от коннектора:

- **`fetch.min.bytes`**: Минимальный объем данных, прежде чем фреймворк передаст значения коннектору (по умолчанию: 1 байт)
- **`fetch.max.bytes`**: Максимальный объем данных для извлечения в одном запросе (по умолчанию: 52428800 / 50 МБ)
- **`fetch.max.wait.ms`**: Максимальное время ожидания перед возвратом данных, если `fetch.min.bytes` не достигнут (по умолчанию: 500 мс)

##### Настройки опроса {#poll-settings}

Коннектор опрашивает сообщения из буфера фреймворка:

- **`max.poll.records`**: Максимальное количество записей, возвращаемых в одном опросе (по умолчанию: 500)
- **`max.partition.fetch.bytes`**: Максимальный объем данных на партицию (по умолчанию: 1048576 / 1 МБ)

##### Рекомендуемые настройки для высокой пропускной способности {#recommended-batch-settings}

Для оптимальной производительности с ClickHouse используйте более крупные пакеты:


```properties
# Увеличить количество записей за один опрос
consumer.max.poll.records=5000
```


# Увеличьте размер выборки из раздела (5 МБ)
consumer.max.partition.fetch.bytes=5242880



# Необязательно: увеличьте минимальный объем выборки, чтобы дольше ждать накопления данных (1 МБ)
consumer.fetch.min.bytes=1048576



# Опционально: Уменьшите время ожидания, если критична задержка

consumer.fetch.max.wait.ms=300

````

**Важно**: Настройки выборки Kafka Connect относятся к сжатым данным, тогда как ClickHouse получает несжатые данные. Балансируйте эти настройки с учётом вашего коэффициента сжатия.

**Компромиссы**:
- **Большие пакеты** = Лучшая производительность загрузки в ClickHouse, меньше частей, меньше накладных расходов
- **Большие пакеты** = Более высокое потребление памяти, потенциальное увеличение сквозной задержки
- **Слишком большие пакеты** = Риск таймаутов, ошибок OutOfMemory или превышения `max.poll.interval.ms`

Подробнее: [Документация Confluent](https://docs.confluent.io/platform/current/connect/references/allconfigs.html#override-the-worker-configuration) | [Документация Kafka](https://kafka.apache.org/documentation/#consumerconfigs)

#### Асинхронные вставки {#asynchronous-inserts}

Асинхронные вставки — это мощная функция, когда коннектор отправляет относительно небольшие пакеты или когда вы хотите дополнительно оптимизировать загрузку, передав ответственность за пакетирование ClickHouse.

##### Когда использовать асинхронные вставки {#when-to-use-async-inserts}

Рассмотрите возможность включения асинхронных вставок, когда:

- **Много небольших пакетов**: Ваш коннектор отправляет частые небольшие пакеты (< 1000 строк на пакет)
- **Высокая конкурентность**: Несколько задач коннектора записывают в одну и ту же таблицу
- **Распределённое развёртывание**: Запущено много экземпляров коннектора на разных хостах
- **Накладные расходы на создание частей**: Вы сталкиваетесь с ошибками «слишком много частей»
- **Смешанная нагрузка**: Сочетание загрузки данных в реальном времени с запросами

**НЕ** используйте асинхронные вставки, когда:

- Вы уже отправляете большие пакеты (> 10 000 строк на пакет) с контролируемой частотой
- Вам требуется немедленная видимость данных (запросы должны видеть данные мгновенно)
- Семантика exactly-once с `wait_for_async_insert=0` конфликтует с вашими требованиями
- Ваш сценарий использования может выиграть от улучшений пакетирования на стороне клиента

##### Как работают асинхронные вставки {#how-async-inserts-work}

При включённых асинхронных вставках ClickHouse:

1. Получает запрос на вставку от коннектора
2. Записывает данные в буфер в памяти (вместо немедленной записи на диск)
3. Возвращает успех коннектору (если `wait_for_async_insert=0`)
4. Сбрасывает буфер на диск, когда выполняется одно из этих условий:
   - Буфер достигает `async_insert_max_data_size` (по умолчанию: 10 МБ)
   - Прошло `async_insert_busy_timeout_ms` миллисекунд с момента первой вставки (по умолчанию: 1000 мс)
   - Накоплено максимальное количество запросов (`async_insert_max_query_number`, по умолчанию: 100)

Это значительно сокращает количество создаваемых частей и улучшает общую пропускную способность.

##### Включение асинхронных вставок {#enabling-async-inserts}

Добавьте настройки асинхронных вставок в параметр конфигурации `clickhouseSettings`:

```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
````

**Ключевые настройки**:

- **`async_insert=1`**: Включить асинхронные вставки
- **`wait_for_async_insert=1`** (рекомендуется): Коннектор ожидает сброса данных в хранилище ClickHouse перед подтверждением. Обеспечивает гарантии доставки.
- **`wait_for_async_insert=0`**: Коннектор подтверждает сразу после буферизации. Лучшая производительность, но данные могут быть потеряны при сбое сервера до сброса.

##### Настройка поведения асинхронных вставок {#tuning-async-inserts}

Вы можете тонко настроить поведение сброса асинхронных вставок:

```json
"clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=10485760,async_insert_busy_timeout_ms=1000"
```

Распространённые параметры настройки:

- **`async_insert_max_data_size`** (по умолчанию: 10485760 / 10 МБ): Максимальный размер буфера перед сбросом
- **`async_insert_busy_timeout_ms`** (по умолчанию: 1000): Максимальное время (мс) перед сбросом
- **`async_insert_stale_timeout_ms`** (по умолчанию: 0): Время (мс) с момента последней вставки перед сбросом
- **`async_insert_max_query_number`** (по умолчанию: 100): Максимальное количество запросов перед сбросом

**Компромиссы**:

- **Преимущества**: Меньше частей, лучшая производительность слияния, меньше накладных расходов CPU, улучшенная пропускная способность при высокой конкурентности
- **Соображения**: Данные не сразу доступны для запросов, немного увеличенная сквозная задержка
- **Риски**: Потеря данных при сбое сервера, если `wait_for_async_insert=0`, потенциальная нагрузка на память при больших буферах

##### Асинхронные вставки с семантикой exactly-once {#async-inserts-with-exactly-once}

При использовании `exactlyOnce=true` с асинхронными вставками:


```json
{
  "config": {
    "exactlyOnce": "true",
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```

**Важно**: Всегда используйте `wait_for_async_insert=1` с exactly-once, чтобы фиксация смещений происходила только после сохранения данных.

Подробнее об асинхронных вставках см. в [документации ClickHouse по асинхронным вставкам](/best-practices/selecting-an-insert-strategy#asynchronous-inserts).

#### Параллелизм коннектора {#connector-parallelism}

Увеличьте параллелизм для повышения пропускной способности:

##### Задачи на коннектор {#tasks-per-connector}

```json
"tasks.max": "4"
```

Каждая задача обрабатывает подмножество партиций топика. Больше задач = больше параллелизма, но:

- Максимальное эффективное количество задач = количество партиций топика
- Каждая задача поддерживает собственное соединение с ClickHouse
- Больше задач = больше накладных расходов и потенциальная конкуренция за ресурсы

**Рекомендация**: Начните с `tasks.max`, равного количеству партиций топика, затем корректируйте на основе метрик CPU и пропускной способности.

##### Игнорирование партиций при пакетировании {#ignoring-partitions}

По умолчанию коннектор группирует сообщения по партициям. Для повышения пропускной способности можно группировать сообщения из разных партиций:

```json
"ignorePartitionsWhenBatching": "true"
```

**Предупреждение**: Используйте только при `exactlyOnce=false`. Эта настройка может повысить пропускную способность за счет создания более крупных пакетов, но теряются гарантии упорядочивания внутри партиций.

#### Несколько высоконагруженных топиков {#multiple-high-throughput-topics}

Если ваш коннектор настроен на подписку на несколько топиков, вы используете `topic2TableMap` для сопоставления топиков с таблицами и испытываете узкое место при вставке, приводящее к отставанию потребителя, рассмотрите возможность создания отдельного коннектора для каждого топика.

Основная причина этого заключается в том, что в настоящее время пакеты вставляются в каждую таблицу [последовательно](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/578ac07e8be1a920aaa3b26e49183595c3edd04b/src/main/java/com/clickhouse/kafka/connect/sink/ProxySinkTask.java#L95-L100).

**Рекомендация**: Для нескольких высоконагруженных топиков разверните отдельный экземпляр коннектора для каждого топика, чтобы максимизировать параллельную пропускную способность вставки.

#### Выбор движка таблиц ClickHouse {#table-engine-considerations}

Выберите подходящий движок таблиц ClickHouse для вашего случая использования:

- **`MergeTree`**: Оптимален для большинства случаев использования, обеспечивает баланс между производительностью запросов и вставок
- **`ReplicatedMergeTree`**: Необходим для высокой доступности, добавляет накладные расходы на репликацию
- **`*MergeTree` с правильным `ORDER BY`**: Оптимизируйте под ваши паттерны запросов

**Настройки для рассмотрения**:

```sql
CREATE TABLE my_table (...)
ENGINE = MergeTree()
ORDER BY (timestamp, id)
SETTINGS
    -- Увеличьте максимальное количество потоков вставки для параллельной записи частей
    max_insert_threads = 4,
    -- Разрешите вставки с кворумом для надежности (ReplicatedMergeTree)
    insert_quorum = 2
```

Для настроек вставки на уровне коннектора:

```json
"clickhouseSettings": "insert_quorum=2,insert_quorum_timeout=60000"
```

#### Пулы соединений и таймауты {#connection-pooling}

Коннектор поддерживает HTTP-соединения с ClickHouse. Настройте таймауты для сетей с высокой задержкой:

```json
"clickhouseSettings": "socket_timeout=300000,connection_timeout=30000"
```

- **`socket_timeout`** (по умолчанию: 30000 мс): Максимальное время для операций чтения
- **`connection_timeout`** (по умолчанию: 10000 мс): Максимальное время для установления соединения

Увеличьте эти значения, если возникают ошибки таймаута при работе с большими пакетами.

#### Мониторинг и устранение проблем с производительностью {#monitoring-performance}

Отслеживайте следующие ключевые метрики:

1. **Отставание потребителя**: Используйте инструменты мониторинга Kafka для отслеживания отставания по партициям
2. **Метрики коннектора**: Отслеживайте `receivedRecords`, `recordProcessingTime`, `taskProcessingTime` через JMX (см. [Мониторинг](#monitoring))
3. **Метрики ClickHouse**:
   - `system.asynchronous_inserts`: Отслеживайте использование буфера асинхронных вставок
   - `system.parts`: Отслеживайте количество частей для обнаружения проблем со слиянием
   - `system.merges`: Отслеживайте активные слияния
   - `system.events`: Отслеживайте `InsertedRows`, `InsertedBytes`, `FailedInsertQuery`

**Распространенные проблемы с производительностью**:


| Симптом                      | Возможная причина                    | Решение                                                                  |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| Высокая задержка потребителя | Слишком маленькие пакеты             | Увеличьте `max.poll.records`, включите асинхронные вставки               |
| Ошибки "Too many parts"      | Частые мелкие вставки                | Включите асинхронные вставки, увеличьте размер пакета                    |
| Ошибки таймаута              | Большой размер пакета, медленная сеть| Уменьшите размер пакета, увеличьте `socket_timeout`, проверьте сеть      |
| Высокая загрузка CPU         | Слишком много мелких частей          | Включите асинхронные вставки, увеличьте настройки слияния                |
| Ошибки OutOfMemory           | Слишком большой размер пакета        | Уменьшите `max.poll.records`, `max.partition.fetch.bytes`                |
| Неравномерная нагрузка задач | Неравномерное распределение партиций | Перебалансируйте партиции или настройте `tasks.max`                      |

#### Сводка рекомендаций {#performance-best-practices}

1. **Начните со значений по умолчанию**, затем измеряйте и настраивайте на основе фактической производительности
2. **Предпочитайте большие пакеты**: По возможности стремитесь к 10 000–100 000 строк на вставку
3. **Используйте асинхронные вставки** при отправке множества мелких пакетов или при высокой конкурентности
4. **Всегда используйте `wait_for_async_insert=1`** с семантикой exactly-once
5. **Масштабируйтесь горизонтально**: Увеличивайте `tasks.max` до количества партиций
6. **Один коннектор на высоконагруженный топик** для максимальной пропускной способности
7. **Мониторьте непрерывно**: Отслеживайте задержку потребителя, количество частей и активность слияния
8. **Тестируйте тщательно**: Всегда тестируйте изменения конфигурации под реалистичной нагрузкой перед развертыванием в продакшене

#### Пример: Конфигурация для высокой пропускной способности {#example-high-throughput}

Вот полный пример, оптимизированный для высокой пропускной способности:

```json
{
  "name": "clickhouse-high-throughput",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    "tasks.max": "8",

    "topics": "high_volume_topic",
    "hostname": "my-clickhouse-host.cloud",
    "port": "8443",
    "database": "default",
    "username": "default",
    "password": "<PASSWORD>",
    "ssl": "true",

    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "false",

    "exactlyOnce": "false",
    "ignorePartitionsWhenBatching": "true",

    "consumer.max.poll.records": "10000",
    "consumer.max.partition.fetch.bytes": "5242880",
    "consumer.fetch.min.bytes": "1048576",
    "consumer.fetch.max.wait.ms": "500",

    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=16777216,async_insert_busy_timeout_ms=1000,socket_timeout=300000"
  }
}
```

**Эта конфигурация**:

- Обрабатывает до 10 000 записей за опрос
- Группирует данные из партиций для более крупных вставок
- Использует асинхронные вставки с буфером 16 МБ
- Запускает 8 параллельных задач (соответствует количеству ваших партиций)
- Оптимизирована для пропускной способности в ущерб строгому порядку

### Устранение неполадок {#troubleshooting}

#### "State mismatch for topic `[someTopic]` partition `[0]`" {#state-mismatch-for-topic-sometopic-partition-0}

Это происходит, когда смещение, хранящееся в KeeperMap, отличается от смещения, хранящегося в Kafka, обычно когда топик был удален
или смещение было изменено вручную.
Чтобы исправить это, необходимо удалить старые значения, хранящиеся для данного топика и партиции.

**ПРИМЕЧАНИЕ: Эта корректировка может повлиять на семантику exactly-once.**

#### "What errors will the connector retry?" {#what-errors-will-the-connector-retry}

В настоящее время основное внимание уделяется выявлению временных ошибок, которые можно повторить, включая:

- `ClickHouseException` — Это общее исключение, которое может быть выброшено ClickHouse.
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
- `SocketTimeoutException` — Возникает при истечении времени ожидания сокета.
- `UnknownHostException` — Возникает, когда хост не может быть разрешен.
- `IOException` — Возникает при проблемах с сетью.


#### "Все мои данные пустые/нулевые" {#all-my-data-is-blankzeroes}

Вероятно, поля в ваших данных не соответствуют полям в таблице — это особенно часто встречается при работе с CDC (и форматом Debezium).
Одно из распространённых решений — добавить преобразование flatten в конфигурацию коннектора:

```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```

Это преобразует ваши данные из вложенного JSON в плоский JSON (используя `_` в качестве разделителя). Поля в таблице будут следовать формату "field1_field2_field3" (например, "before_id", "after_id" и т. д.).

#### "Я хочу использовать ключи Kafka в ClickHouse" {#i-want-to-use-my-kafka-keys-in-clickhouse}

Ключи Kafka по умолчанию не сохраняются в поле значения, но вы можете использовать преобразование `KeyToValue`, чтобы переместить ключ в поле значения (под новым именем поля `_key`):

```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
