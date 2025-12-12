---
sidebar_label: 'Приёмник ClickHouse Kafka Connect'
sidebar_position: 2
slug: /integrations/kafka/clickhouse-kafka-connect-sink
description: 'Официальный коннектор Kafka от ClickHouse.'
title: 'Приёмник ClickHouse Kafka Connect'
doc_type: 'guide'
keywords: ['Приёмник ClickHouse Kafka Connect', 'коннектор Kafka для ClickHouse', 'официальный коннектор ClickHouse', 'интеграция ClickHouse с Kafka']
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# ClickHouse Kafka Connect Sink {#clickhouse-kafka-connect-sink}

:::note
Если вам нужна помощь, [создайте обращение (issue) в репозитории](https://github.com/ClickHouse/clickhouse-kafka-connect/issues) или задайте вопрос в [публичном Slack ClickHouse](https://clickhouse.com/slack).
:::
**ClickHouse Kafka Connect Sink** — это коннектор Kafka, который доставляет данные из топика Kafka в таблицу ClickHouse.

### Лицензия {#license}

Kafka Connector Sink распространяется под [лицензией Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

### Требования к среде {#requirements-for-the-environment}

В среде должен быть установлен фреймворк [Kafka Connect](https://docs.confluent.io/platform/current/connect/index.html) версии 2.7 или новее.

### Матрица совместимости версий {#version-compatibility-matrix}

| ClickHouse Kafka Connect version | ClickHouse version | Kafka Connect | Confluent platform |
| -------------------------------- | ------------------ | ------------- | ------------------ |
| 1.0.0                            | &gt; 23.3          | &gt; 2.7      | &gt; 6.1           |

### Основные возможности {#main-features}

* Поставляется с готовой семантикой exactly-once. Она основана на новой функции ядра ClickHouse под названием [KeeperMap](https://github.com/ClickHouse/ClickHouse/pull/39976) (используется коннектором как хранилище состояния) и позволяет использовать минималистичную архитектуру.
* Поддержка сторонних хранилищ состояния: по умолчанию используется In-memory, но может использовать KeeperMap (поддержка Redis будет добавлена позже).
* Глубокая интеграция: разрабатывается, сопровождается и поддерживается ClickHouse.
* Непрерывно тестируется с [ClickHouse Cloud](https://clickhouse.com/cloud).
* Вставка данных с объявленной схемой и без неё.
* Поддержка всех типов данных ClickHouse.

### Инструкции по установке {#installation-instructions}

#### Сбор параметров подключения {#gather-your-connection-details}

<ConnectionDetails />

#### Общие инструкции по установке {#general-installation-instructions}

Коннектор распространяется как единый JAR-файл, содержащий все классы, необходимые для запуска плагина.

Чтобы установить плагин, выполните следующие шаги:

* Скачайте ZIP-архив, содержащий JAR-файл коннектора, со страницы [Releases](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) репозитория ClickHouse Kafka Connect Sink.
* Извлеките содержимое ZIP-файла и скопируйте его в нужное место.
* Добавьте путь к директории с плагином в параметр конфигурации [plugin.path](https://kafka.apache.org/documentation/#connectconfigs_plugin.path) в вашем файле свойств Connect, чтобы Confluent Platform могла найти плагин.
* Укажите имя топика, имя хоста экземпляра ClickHouse и пароль в конфигурации.

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

* Перезапустите Confluent Platform.
* Если вы используете Confluent Platform, войдите в Confluent Control Center, чтобы убедиться, что ClickHouse Sink доступен в списке коннекторов.

### Параметры конфигурации {#configuration-options}

Чтобы подключить ClickHouse Sink к серверу ClickHouse, необходимо указать:

* параметры подключения: hostname (**обязательно**) и port (необязательно)
* учетные данные пользователя: password (**обязательно**) и username (необязательно)
* класс коннектора: `com.clickhouse.kafka.connect.ClickHouseSinkConnector` (**обязательно**)
* topics или topics.regex: Kafka topics для опроса — имена topics должны совпадать с именами таблиц (**обязательно**)
* конвертеры ключей и значений (key и value converters): задаются в зависимости от типа данных в ваших topics. Обязательны, если еще не определены в конфигурации worker.

Полная таблица параметров конфигурации:

| Property Name                                   | Description                                                                                                                                                                                                                        | Default Value                                            |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `hostname` (Required)                           | Имя хоста или IP-адрес сервера                                                                                                                                                                                                     | N/A                                                      |
| `port`                                          | Порт ClickHouse — по умолчанию 8443 (для HTTPS в облаке), но для HTTP (значение по умолчанию для self-hosted) должен быть 8123                                                                                                     | `8443`                                                   |
| `ssl`                                           | Включить SSL-подключение к ClickHouse                                                                                                                                                                                              | `true`                                                   |
| `jdbcConnectionProperties`                      | Свойства подключения при подключении к ClickHouse. Должны начинаться с `?` и объединяться с помощью `&` между `param=value`                                                                                                        | `""`                                                     |
| `username`                                      | Имя пользователя базы данных ClickHouse                                                                                                                                                                                            | `default`                                                |
| `password` (Required)                           | Пароль базы данных ClickHouse                                                                                                                                                                                                      | N/A                                                      |
| `database`                                      | Имя базы данных ClickHouse                                                                                                                                                                                                         | `default`                                                |
| `connector.class` (Required)                    | Класс коннектора (явно задаётся и остаётся значением по умолчанию)                                                                                                                                                                | `"com.clickhouse.kafka.connect.ClickHouseSinkConnector"` |
| `tasks.max`                                     | Количество задач коннектора                                                                                                                                                                                                        | `"1"`                                                    |
| `errors.retry.timeout`                          | Таймаут повторных попыток ClickHouse JDBC                                                                                                                                                                                          | `"60"`                                                   |
| `exactlyOnce`                                   | Включение режима exactly-once                                                                                                                                                                                                      | `"false"`                                                |
| `topics` (Required)                             | Топики Kafka для опроса — имена топиков должны совпадать с именами таблиц                                                                                                                                                          | `""`                                                     |
| `key.converter` (Required* - See Description)   | Устанавливается в соответствии с типами ваших ключей. Обязательно здесь, если вы передаёте ключи (и параметр не задан в конфигурации worker).                                                                                     | `"org.apache.kafka.connect.storage.StringConverter"`     |
| `value.converter` (Required* - See Description) | Устанавливается на основе типа данных в вашем топике. Поддерживаются форматы: JSON, String, Avro или Protobuf. Обязательно здесь, если параметр не задан в конфигурации worker.                                                  | `"org.apache.kafka.connect.json.JsonConverter"`          |
| `value.converter.schemas.enable`                | Поддержка схем для конвертера значений коннектора                                                                                                                                                                                  | `"false"`                                                |
| `errors.tolerance`                              | Допустимый уровень ошибок коннектора. Поддерживаются значения: none, all                                                                                                                                                           | `"none"`                                                 |
| `errors.deadletterqueue.topic.name`             | Если задан (при errors.tolerance=all), для неудачных пакетов будет использоваться DLQ (см. [Troubleshooting](#troubleshooting))                                                                                                   | `""`                                                     |
| `errors.deadletterqueue.context.headers.enable` | Добавляет дополнительные заголовки для DLQ                                                                                                                                                                                         | `""`                                                     |
| `clickhouseSettings`                            | Разделённый запятыми список настроек ClickHouse (например, «insert_quorum=2, и т. д.»)                                                                                                                                           | `""`                                                     |
| `topic2TableMap`                                | Разделённый запятыми список, который сопоставляет имена топиков именам таблиц (например, «topic1=table1, topic2=table2, и т. д.»)                                                                                                  | `""`                                                     |
| `tableRefreshInterval`                          | Время (в секундах) для обновления кэша определения таблицы                                                                                                                                                                         | `0`                                                      |
| `keeperOnCluster`                               | Позволяет настраивать параметр ON CLUSTER для self-hosted экземпляров (например, `ON CLUSTER clusterNameInConfigFileDefinition`) для таблицы connect_state в режиме exactly-once (см. [Distributed DDL Queries](/sql-reference/distributed-ddl) | `""`                                                     |
| `bypassRowBinary`                               | Позволяет отключить использование RowBinary и RowBinaryWithDefaults для данных на основе схемы (Avro, Protobuf и т. д.) — следует использовать только тогда, когда в данных будут отсутствующие столбцы и Nullable/Default неприемлемы | `"false"`                                                |
| `dateTimeFormats`                               | Форматы даты и времени для парсинга полей схемы типа DateTime64, разделённые с помощью `;` (например, `someDateField=yyyy-MM-dd HH:mm:ss.SSSSSSSSS;someOtherDateField=yyyy-MM-dd HH:mm:ss`).                                       | `""`                                                     |
| `tolerateStateMismatch`                         | Позволяет коннектору отбрасывать записи «раньше» текущего смещения, сохранённого AFTER_PROCESSING (например, если отправлено смещение 5, а последнее зафиксированное смещение — 250)                                              | `"false"`                                                |
| `ignorePartitionsWhenBatching`                  | Игнорирует раздел (partition) при сборе сообщений для вставки (но только если `exactlyOnce` имеет значение `false`). Примечание по производительности: чем больше задач коннектора, тем меньше разделов Kafka назначается на задачу — это может приводить к убывающей отдаче. | `"false"`                                                |

### Целевые таблицы {#target-tables}

ClickHouse Connect Sink читает сообщения из топиков Kafka и записывает их в соответствующие таблицы. ClickHouse Connect Sink записывает данные в уже существующие таблицы. Пожалуйста, убедитесь, что целевая таблица с подходящей схемой создана в ClickHouse до начала вставки данных в неё.

Для каждого топика требуется отдельная целевая таблица в ClickHouse. Имя целевой таблицы должно совпадать с именем исходного топика.

### Предварительная обработка {#pre-processing}

Если вам нужно трансформировать исходящие сообщения перед тем, как они будут отправлены в ClickHouse Kafka Connect Sink, используйте [Kafka Connect Transformations](https://docs.confluent.io/platform/current/connect/transforms/overview.html).

### Поддерживаемые типы данных {#supported-data-types}

**При объявленной схеме:**

| Тип Kafka Connect                       | Тип ClickHouse          | Поддерживается | Примитивный |
| --------------------------------------- | ----------------------- | -------------- | ----------- |
| STRING                                  | String                  | ✅              | Да          |
| STRING                                  | JSON. См. ниже (1)      | ✅              | Да          |
| INT8                                    | Int8                    | ✅              | Да          |
| INT16                                   | Int16                   | ✅              | Да          |
| INT32                                   | Int32                   | ✅              | Да          |
| INT64                                   | Int64                   | ✅              | Да          |
| FLOAT32                                 | Float32                 | ✅              | Да          |
| FLOAT64                                 | Float64                 | ✅              | Да          |
| BOOLEAN                                 | Boolean                 | ✅              | Да          |
| ARRAY                                   | Array(T)                | ✅              | Нет         |
| MAP                                     | Map(Primitive, T)       | ✅              | Нет         |
| STRUCT                                  | Variant(T1, T2, ...)    | ✅              | Нет         |
| STRUCT                                  | Tuple(a T1, b T2, ...)  | ✅              | Нет         |
| STRUCT                                  | Nested(a T1, b T2, ...) | ✅              | Нет         |
| STRUCT                                  | JSON. См. ниже (1), (2) | ✅              | Нет         |
| BYTES                                   | String                  | ✅              | Нет         |
| org.apache.kafka.connect.data.Time      | Int64 / DateTime64      | ✅              | Нет         |
| org.apache.kafka.connect.data.Timestamp | Int32 / Date32          | ✅              | Нет         |
| org.apache.kafka.connect.data.Decimal   | Decimal                 | ✅              | Нет         |

* (1) JSON поддерживается только когда в настройках ClickHouse установлено значение `input_format_binary_read_json_as_string=1`. Это работает только для семейства форматов RowBinary, и настройка влияет на все столбцы в запросе `INSERT`, поэтому все они должны быть строковыми. В этом случае коннектор будет конвертировать STRUCT в JSON-строку.

* (2) Когда STRUCT содержит union-поля, такие как `oneof`, конвертер должен быть настроен так, чтобы НЕ добавлять префикс/суффикс к именам полей. Для этого есть настройка `generate.index.for.unions=false` в [`ProtobufConverter`](https://docs.confluent.io/platform/current/schema-registry/connect.html#protobuf).

**Без объявленной схемы:**

Запись конвертируется в JSON и отправляется в ClickHouse как значение в формате [JSONEachRow](/interfaces/formats/JSONEachRow).

### Рецепты конфигурации {#configuration-recipes}

Ниже приведено несколько типовых рецептов конфигурации, которые помогут вам быстро начать работу.

#### Базовая конфигурация {#basic-configuration}

Самая простая конфигурация для начала работы — предполагается, что вы запускаете Kafka Connect в распределённом режиме и у вас работает сервер ClickHouse на `localhost:8443` с включённым SSL, а данные представлены в виде JSON без схемы.

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

Обратите внимание: если вы столкнётесь с проблемами, связанными с отсутствующими классами, учтите, что не во всех средах доступен protobuf-конвертер, и вам может потребоваться альтернативная сборка jar-файла, в которую включены зависимости.

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

Коннектор поддерживает String Converter для различных форматов ClickHouse: [JSON](/interfaces/formats/JSONEachRow), [CSV](/interfaces/formats/CSV) и [TSV](/interfaces/formats/TabSeparated).

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

Логирование автоматически обеспечивается платформой Kafka Connect.
Место назначения и формат логов можно настроить в [файле конфигурации](https://docs.confluent.io/platform/current/connect/logging.html#log4j-properties-file) Kafka Connect.

При использовании Confluent Platform логи можно просматривать, запустив CLI-команду:

```bash
confluent local services connect log
```

Для получения дополнительных сведений ознакомьтесь с официальным [руководством](https://docs.confluent.io/platform/current/connect/logging.html).

### Мониторинг {#monitoring}

ClickHouse Kafka Connect экспортирует метрики времени выполнения через [Java Management Extensions (JMX)](https://www.oracle.com/technical-resources/articles/javase/jmx.html). JMX по умолчанию включён в коннекторе Kafka.

#### Метрики, специфичные для ClickHouse {#clickhouse-specific-metrics}

Коннектор предоставляет пользовательские метрики под следующим именем MBean:

```java
com.clickhouse:type=ClickHouseKafkaConnector,name=SinkTask{id}
```

| Metric Name            | Type | Description                                                                                         |
| ---------------------- | ---- | --------------------------------------------------------------------------------------------------- |
| `receivedRecords`      | long | Общее количество полученных записей.                                                                |
| `recordProcessingTime` | long | Общее время в наносекундах, затраченное на группировку и преобразование записей в единую структуру. |
| `taskProcessingTime`   | long | Общее время в наносекундах, затраченное на обработку и вставку данных в ClickHouse.                 |

#### Метрики Kafka Producer/Consumer {#kafka-producer-consumer-metrics}

Коннектор экспортирует стандартные метрики продюсера и консюмера Kafka, которые дают представление о потоке данных, пропускной способности и производительности.

**Метрики на уровне топика:**

* `records-sent-total`: Общее количество записей, отправленных в топик
* `bytes-sent-total`: Общий объем данных (в байтах), отправленных в топик
* `record-send-rate`: Средняя скорость отправки записей в секунду
* `byte-rate`: Средняя скорость отправки данных в байтах в секунду
* `compression-rate`: Достигнутый коэффициент сжатия

**Метрики на уровне партиций:**
- `records-sent-total`: Общее количество записей, отправленных в партицию
- `bytes-sent-total`: Общее количество байт, отправленных в партицию
- `records-lag`: Текущее отставание в партиции
- `records-lead`: Текущее опережение в партиции
- `replica-fetch-lag`: Информация об отставании реплик

**Метрики подключений на уровне узлов:**
- `connection-creation-total`: Общее количество подключений, установленных к узлу Kafka
- `connection-close-total`: Общее количество закрытых подключений
- `request-total`: Общее количество запросов, отправленных на узел
- `response-total`: Общее количество ответов, полученных от узла
- `request-rate`: Средняя частота запросов в секунду
- `response-rate`: Средняя частота ответов в секунду

Эти метрики помогают отслеживать:
- **Пропускную способность**: Скорости ингестии данных
- **Отставание**: Узкие места и задержки обработки
- **Сжатие**: Эффективность сжатия данных
- **Состояние подключений**: Сетевую доступность и стабильность

#### Метрики фреймворка Kafka Connect {#kafka-connect-framework-metrics}

Коннектор интегрируется с фреймворком Kafka Connect и предоставляет метрики для жизненного цикла задач и отслеживания ошибок.

**Метрики статуса задач:**
- `task-count`: Общее количество задач в коннекторе
- `running-task-count`: Количество задач, которые сейчас выполняются
- `paused-task-count`: Количество задач, которые сейчас на паузе
- `failed-task-count`: Количество задач, завершившихся с ошибкой
- `destroyed-task-count`: Количество уничтоженных задач
- `unassigned-task-count`: Количество неназначенных задач

Возможные значения статуса задач: `running`, `paused`, `failed`, `destroyed`, `unassigned`

**Метрики ошибок:**
- `deadletterqueue-produce-failures`: Количество неудачных записей в DLQ
- `deadletterqueue-produce-requests`: Общее количество попыток записи в DLQ
- `last-error-timestamp`: Временная метка последней ошибки
- `records-skip-total`: Общее количество записей, пропущенных из‑за ошибок
- `records-retry-total`: Общее количество записей, которые были повторно обработаны
- `errors-total`: Общее количество возникших ошибок

**Метрики производительности:**
- `offset-commit-failures`: Количество неудачных фиксаций смещений
- `offset-commit-avg-time-ms`: Среднее время фиксации смещений
- `offset-commit-max-time-ms`: Максимальное время фиксации смещений
- `put-batch-avg-time-ms`: Среднее время обработки батча
- `put-batch-max-time-ms`: Максимальное время обработки батча
- `source-record-poll-total`: Общее количество опрошенных записей

#### Рекомендации по мониторингу {#monitoring-best-practices}

1. **Отслеживайте отставание потребителя**: Мониторьте `records-lag` по партициям для выявления узких мест обработки
2. **Отслеживайте уровень ошибок**: Наблюдайте за `errors-total` и `records-skip-total`, чтобы выявлять проблемы с качеством данных
3. **Контролируйте состояние задач**: Отслеживайте метрики статуса задач, чтобы убедиться, что задачи выполняются корректно
4. **Измеряйте пропускную способность**: Используйте `records-send-rate` и `byte-rate` для отслеживания производительности ингестии
5. **Отслеживайте состояние подключений**: Проверяйте метрики подключений на уровне узлов для выявления сетевых проблем
6. **Отслеживайте эффективность сжатия**: Используйте `compression-rate` для оптимизации передачи данных

Подробные определения JMX-метрик и информацию об интеграции с Prometheus см. в конфигурационном файле [jmx-export-connector.yml](https://github.com/ClickHouse/clickhouse-kafka-connect/blob/main/jmx-export-connector.yml).

### Ограничения {#limitations}

- Удаление записей не поддерживается.
- Размер батча наследуется из свойств Kafka Consumer.
- При использовании KeeperMap для exactly-once и изменении или перемотке смещения необходимо удалить содержимое KeeperMap для соответствующего топика. (См. руководство по устранению неполадок ниже для получения дополнительной информации)

### Настройка производительности и оптимизация пропускной способности {#tuning-performance}

В этом разделе рассматриваются стратегии настройки производительности для ClickHouse Kafka Connect Sink. Настройка производительности важна при работе с сценариями высокой пропускной способности или когда необходимо оптимизировать использование ресурсов и минимизировать отставание.

#### Когда требуется настройка производительности? {#when-is-performance-tuning-needed}

Настройка производительности, как правило, требуется в следующих сценариях:

- **Высоконагруженные сценарии**: При обработке миллионов событий в секунду из топиков Kafka
- **Отставание потребителя**: Когда коннектор не успевает за скоростью генерации данных, что приводит к росту отставания
- **Ограниченные ресурсы**: Когда нужно оптимизировать использование CPU, памяти или сети
- **Несколько топиков**: При одновременном потреблении из нескольких высоконагруженных топиков
- **Малый размер сообщений**: При работе с большим количеством маленьких сообщений, которые выигрывают от серверного батчинга

Настройка производительности **обычно НЕ требуется**, когда:

- Обрабатываются небольшие или умеренные объёмы (< 10 000 сообщений/секунду)
- Отставание потребителя стабильно и приемлемо для вашего сценария
- Стандартные настройки коннектора уже удовлетворяют требованиям по пропускной способности
- Ваш кластер ClickHouse без труда справляется с входящей нагрузкой

#### Понимание потока данных {#understanding-the-data-flow}

Перед началом настройки важно понять, как данные проходят через коннектор:

1. **Kafka Connect Framework** в фоновом режиме читает сообщения из топиков Kafka
2. **Коннектор опрашивает** сообщения из внутреннего буфера фреймворка
3. **Коннектор формирует пакеты** сообщений на основе размера выборки (poll size)
4. **ClickHouse получает** пакетную вставку по HTTP/S
5. **ClickHouse обрабатывает** вставку (синхронно или асинхронно)

Производительность можно оптимизировать на каждом из этих этапов.

#### Настройка размера пакета в Kafka Connect {#connect-fetch-vs-connector-poll}

Первый уровень оптимизации — управление объёмом данных, который коннектор получает за один пакет из Kafka.

##### Параметры выборки (Fetch) {#fetch-settings}

Kafka Connect (фреймворк) выбирает сообщения из топиков Kafka в фоновом режиме, независимо от коннектора:

- **`fetch.min.bytes`**: Минимальный объём данных, прежде чем фреймворк передаст данные коннектору (по умолчанию: 1 байт)
- **`fetch.max.bytes`**: Максимальный объём данных для выборки за один запрос (по умолчанию: 52428800 / 50 MB)
- **`fetch.max.wait.ms`**: Максимальное время ожидания перед возвратом данных, если `fetch.min.bytes` не достигнут (по умолчанию: 500 мс)

##### Параметры опроса (Poll) {#poll-settings}

Коннектор опрашивает сообщения из буфера фреймворка:

- **`max.poll.records`**: Максимальное количество записей, возвращаемых за один опрос (по умолчанию: 500)
- **`max.partition.fetch.bytes`**: Максимальный объём данных на партицию (по умолчанию: 1048576 / 1 MB)

##### Рекомендуемые настройки для высокой пропускной способности {#recommended-batch-settings}

Для оптимальной работы с ClickHouse ориентируйтесь на более крупные пакеты:

```properties
# Increase the number of records per poll
consumer.max.poll.records=5000

# Increase the partition fetch size (5 MB)
consumer.max.partition.fetch.bytes=5242880

# Optional: Increase minimum fetch size to wait for more data (1 MB)
consumer.fetch.min.bytes=1048576

# Optional: Reduce wait time if latency is critical
consumer.fetch.max.wait.ms=300
```

# Увеличить размер выборки раздела до 5 МБ {#increase-the-partition-fetch-size-5-mb}
consumer.max.partition.fetch.bytes=5242880

# Необязательно: увеличьте минимальный размер получаемых данных, чтобы дожидаться большего объёма (1 МБ) {#optional-increase-minimum-fetch-size-to-wait-for-more-data-1-mb}
consumer.fetch.min.bytes=1048576

# Необязательно: уменьшите время ожидания, если задержка критична {#optional-reduce-wait-time-if-latency-is-critical}

consumer.fetch.max.wait.ms=300

````json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```json
{
  "name": "clickhouse-connect",
  "config": {
    "connector.class": "com.clickhouse.kafka.connect.ClickHouseSinkConnector",
    ...
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
````json
"clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=10485760,async_insert_busy_timeout_ms=1000"
```json
"clickhouseSettings": "async_insert=1,wait_for_async_insert=1,async_insert_max_data_size=10485760,async_insert_busy_timeout_ms=1000"
```json
{
  "config": {
    "exactlyOnce": "true",
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```json
{
  "config": {
    "exactlyOnce": "true",
    "clickhouseSettings": "async_insert=1,wait_for_async_insert=1"
  }
}
```json
"tasks.max": "4"
```json
"tasks.max": "4"
```json
"ignorePartitionsWhenBatching": "true"
```json
"ignorePartitionsWhenBatching": "true"
```sql
CREATE TABLE my_table (...)
ENGINE = MergeTree()
ORDER BY (timestamp, id)
SETTINGS 
    -- Increase max insert threads for parallel part writing
    max_insert_threads = 4,
    -- Allow inserts with quorum for reliability (ReplicatedMergeTree)
    insert_quorum = 2
```sql
CREATE TABLE my_table (...)
ENGINE = MergeTree()
ORDER BY (timestamp, id)
SETTINGS 
    -- Увеличение максимального числа потоков вставки для параллельной записи частей
    max_insert_threads = 4,
    -- Разрешение вставок с кворумом для обеспечения надёжности (ReplicatedMergeTree)
    insert_quorum = 2
```json
"clickhouseSettings": "insert_quorum=2,insert_quorum_timeout=60000"
```json
"clickhouseSettings": "insert_quorum=2,insert_quorum_timeout=60000"
```json
"clickhouseSettings": "socket_timeout=300000,connection_timeout=30000"
```json
"clickhouseSettings": "socket_timeout=300000,connection_timeout=30000"
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
```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```properties
transforms=flatten
transforms.flatten.type=org.apache.kafka.connect.transforms.Flatten$Value
transforms.flatten.delimiter=_
```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```properties
transforms=keyToValue
transforms.keyToValue.type=com.clickhouse.kafka.connect.transforms.KeyToValue
transforms.keyToValue.field=_key
```
