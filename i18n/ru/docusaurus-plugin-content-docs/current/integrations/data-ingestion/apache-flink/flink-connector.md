---
sidebar_label: 'Apache Flink'
sidebar_position: 1
slug: /integrations/apache-flink
description: 'Введение в Apache Flink с ClickHouse'
keywords: ['clickhouse', 'Apache Flink', 'migrating', 'data', 'stream processing']
title: 'Коннектор Flink'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Коннектор Flink \{#flink-connector\}

<ClickHouseSupportedBadge />

Это официальный [Apache Flink Sink Connector](https://github.com/ClickHouse/flink-connector-clickhouse) с поддержкой от ClickHouse. Он построен на основе [AsyncSinkBase](https://cwiki.apache.org/confluence/display/FLINK/FLIP-171%3A+Async+Sink) Flink и официального [java client](https://github.com/ClickHouse/clickhouse-java) ClickHouse.

Коннектор поддерживает DataStream API Apache Flink. Поддержка Table API [запланирована в одном из будущих релизов](https://github.com/ClickHouse/flink-connector-clickhouse/issues/42).

<TOCInline toc={toc} />

## Требования \{#requirements\}

* Java 11+ (для Flink 1.17+) или 17+ (для Flink 2.0+)
* Apache Flink 1.17+

## Матрица совместимости версий Flink \{#flink-compatibility-matrix\}

Коннектор разбит на два артефакта для поддержки Flink 1.17+ и Flink 2.0+. Выберите артефакт, соответствующий нужной версии Flink:

| Версия Flink | Артефакт                         | Версия ClickHouse Java Client | Требуемая версия Java |
| ------------ | -------------------------------- | ----------------------------- | --------------------- |
| latest       | flink-connector-clickhouse-2.0.0 | 0.9.5                         | Java 17+              |
| 2.0.1        | flink-connector-clickhouse-2.0.0 | 0.9.5                         | Java 17+              |
| 2.0.0        | flink-connector-clickhouse-2.0.0 | 0.9.5                         | Java 17+              |
| 1.20.2       | flink-connector-clickhouse-1.17  | 0.9.5                         | Java 11+              |
| 1.19.3       | flink-connector-clickhouse-1.17  | 0.9.5                         | Java 11+              |
| 1.18.1       | flink-connector-clickhouse-1.17  | 0.9.5                         | Java 11+              |
| 1.17.2       | flink-connector-clickhouse-1.17  | 0.9.5                         | Java 11+              |

:::note
Коннектор не тестировался на версиях Flink ниже 1.17.2
:::

## Установка и настройка \{#installation--setup\}

### Добавьте как зависимость \{#import-as-a-dependency\}

#### Для Flink 2.0+ \{#flink-2\}

<Tabs>
  <TabItem value="Maven" label="Maven" default>
    ```maven
    <dependency>
        <groupId>com.clickhouse.flink</groupId>
        <artifactId>flink-connector-clickhouse-2.0.0</artifactId>
        <version>{{ stable_version }}</version>
        <classifier>all</classifier>
    </dependency>
    ```
  </TabItem>

  <TabItem value="Gradle" label="Gradle">
    ```gradle
    dependencies {
        implementation("com.clickhouse.flink:flink-connector-clickhouse-2.0.0:{{ stable_version }}")
    }
    ```
  </TabItem>

  <TabItem value="SBT" label="SBT">
    ```sbt
    libraryDependencies += "com.clickhouse.flink" % "flink-connector-clickhouse-2.0.0" % {{ stable_version }} classifier "all"
    ```
  </TabItem>
</Tabs>

#### Для Flink 1.17+ \{#flink-117\}

<Tabs>
  <TabItem value="Maven" label="Maven" default>
    ```maven
    <dependency>
        <groupId>com.clickhouse.flink</groupId>
        <artifactId>flink-connector-clickhouse-1.17</artifactId>
        <version>{{ stable_version }}</version>
        <classifier>all</classifier>
    </dependency>
    ```
  </TabItem>

  <TabItem value="Gradle" label="Gradle">
    ```gradle
    dependencies {
        implementation("com.clickhouse.flink:flink-connector-clickhouse-1.17:{{ stable_version }}")
    }
    ```
  </TabItem>

  <TabItem value="SBT" label="SBT">
    ```sbt
    libraryDependencies += "com.clickhouse.flink" % "flink-connector-clickhouse-1.17" % {{ stable_version }} classifier "all"
    ```
  </TabItem>
</Tabs>

### Скачайте бинарный файл \{#download-the-binary\}

Шаблон имени JAR-файла:

```bash
flink-connector-clickhouse-${flink_version}-${stable_version}-all.jar
```

где:

* `flink_version` — одно из значений: `2.0.0` или `1.17`
* `stable_version` — [версия стабильного релиза артефакта](https://github.com/ClickHouse/flink-connector-clickhouse/releases)

Все доступные JAR-файлы опубликованных релизов можно найти в [репозитории Maven Central](https://repo1.maven.org/maven2/com/clickhouse/flink/).


## Использование DataStream API \{#using-the-datastream-api\}

### Пример \{#datastream-snippet\}

Предположим, вы хотите вставить необработанные данные CSV в ClickHouse:

<Tabs groupId="raw_csv_java_example">
  <TabItem value="Java" label="Java" default>
    ```java
    public static void main(String[] args) {
        // Настройте ClickHouseClient
        ClickHouseClientConfig clickHouseClientConfig = new ClickHouseClientConfig(url, username, password, database, tableName);

        // Создайте ElementConverter
        ElementConverter<String, ClickHousePayload> convertorString = new ClickHouseConvertor<>(String.class);

        // Создайте sink и задайте формат с помощью `setClickHouseFormat`
        ClickHouseAsyncSink<String> csvSink = new ClickHouseAsyncSink<>(
                convertorString,
                MAX_BATCH_SIZE,
                MAX_IN_FLIGHT_REQUESTS,
                MAX_BUFFERED_REQUESTS,
                MAX_BATCH_SIZE_IN_BYTES,
                MAX_TIME_IN_BUFFER_MS,
                MAX_RECORD_SIZE_IN_BYTES,
                clickHouseClientConfig
        );

        csvSink.setClickHouseFormat(ClickHouseFormat.CSV);

        // Наконец, подключите DataStream к sink.
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        Path csvFilePath = new Path(fileFullName);
        FileSource<String> csvSource = FileSource
                .forRecordStreamFormat(new TextLineInputFormat(), csvFilePath)
                .build();

        env.fromSource(
                csvSource,
                WatermarkStrategy.noWatermarks(),
                "GzipCsvSource"
        ).sinkTo(csvSink);
    }
    ```
  </TabItem>
</Tabs>

Дополнительные примеры и фрагменты кода можно найти в наших тестах:

* [flink-connector-clickhouse-1.17](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/flink-connector-clickhouse-1.17/src/test/java/org/apache/flink/connector/clickhouse/sink)
* [flink-connector-clickhouse-2.0.0](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/flink-connector-clickhouse-2.0.0/src/test/java/org/apache/flink/connector/clickhouse/sink)

### Пример быстрого запуска \{#datastream-quick-start\}

Мы подготовили пример на базе Maven для быстрого начала работы с ClickHouse Sink:

* [Flink 1.17+](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/examples/maven/flink-v1.7/covid)
* [Flink 2.0.0+](https://github.com/ClickHouse/flink-connector-clickhouse/tree/main/examples/maven/flink-v2/covid)

Более подробные инструкции см. в [руководстве по примеру](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/examples/README.md)

### Варианты подключения к DataStream API \{#datastream-api-connection-options\}

#### Параметры клиента ClickHouse \{#client-options\}

| Параметры                   | Описание                                                                                                                                                       | Значение по умолчанию | Обязательно |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------- |
| `url`                       | Полный URL ClickHouse                                                                                                                                          | Н/Д                   | Да          |
| `username`                  | Имя пользователя базы данных ClickHouse                                                                                                                        | Н/Д                   | Да          |
| `password`                  | Пароль базы данных ClickHouse                                                                                                                                  | Н/Д                   | Да          |
| `database`                  | Имя базы данных ClickHouse                                                                                                                                     | Н/Д                   | Да          |
| `table`                     | Имя таблицы ClickHouse                                                                                                                                         | Н/Д                   | Да          |
| `options`                   | map параметров конфигурации Java-клиента                                                                                                                       | Пустой map            | Нет         |
| `serverSettings`            | map настроек сессии сервера ClickHouse                                                                                                                         | Пустой map            | Нет         |
| `enableJsonSupportAsString` | Настройка сервера ClickHouse, при которой для [типа данных JSON](https://clickhouse.com/docs/sql-reference/data-types/newjson) ожидается String в формате JSON | true                  | Нет         |

`options` и `serverSettings` следует передавать клиенту как `Map<String, String>`. Если для любого из них передан пустой map, будут использоваться значения по умолчанию клиента или сервера соответственно.

:::note
Все доступные параметры Java-клиента перечислены в [ClientConfigProperties.java](https://github.com/ClickHouse/clickhouse-java/blob/main/client-v2/src/main/java/com/clickhouse/client/api/ClientConfigProperties.java) и на [этой странице документации](https://clickhouse.com/docs/integrations/language-clients/java/client#configuration).

Все доступные настройки сессии сервера перечислены на [этой странице документации](https://clickhouse.com/docs/operations/settings/settings).
:::

Например:

<Tabs groupId="client_options_example">
  <TabItem value="Java" label="Java" default>
    ```java
    Map<String, String> javaClientOptions = Map.of(
        ClientConfigProperties.CA_CERTIFICATE.getKey(), "<my_CA_cert>",
        ClientConfigProperties.SSL_CERTIFICATE.getKey(), "<my_SSL_cert>",
        ClientConfigProperties.CLIENT_NETWORK_BUFFER_SIZE.getKey(), "30000",
        ClientConfigProperties.HTTP_MAX_OPEN_CONNECTIONS.getKey(), "5"
    );

    Map<String, String> serverSettings = Map.of(
        "insert_deduplicate", "1"
    );

    ClickHouseClientConfig clickHouseClientConfig = new ClickHouseClientConfig(
        url,
        username,
        password,
        database,
        tableName,
        javaClientOptions,
        serverSettings,
        false // enableJsonSupportAsString
    );
    ```
  </TabItem>
</Tabs>

#### Параметры sink \{#sink-options\}

Следующие параметры напрямую взяты из `AsyncSinkBase` во Flink:

| Parameters             | Description                                                                                                   | Default Value | Required |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- | ------------- | -------- |
| `maxBatchSize`         | Максимальное количество записей, вставляемых за один пакет                                                    | N/A           | Да       |
| `maxInFlightRequests`  | Максимальное количество запросов в обработке, допустимое до того, как sink начнет применять обратное давление | N/A           | Да       |
| `maxBufferedRequests`  | Максимальное количество записей, которое может быть буферизовано в sink до применения обратного давления      | N/A           | Да       |
| `maxBatchSizeInBytes`  | Максимальный размер пакета (в байтах). Все отправляемые пакеты будут меньше либо равны этому значению         | N/A           | Да       |
| `maxTimeInBufferMS`    | Максимальное время, в течение которого запись может находиться в sink перед сбросом                           | N/A           | Да       |
| `maxRecordSizeInBytes` | Максимальный размер записи, который принимает sink; записи большего размера будут автоматически отклонены     | N/A           | Да       |

## Поддерживаемые типы данных \{#supported-data-types\}

В таблице ниже приведена краткая справка по преобразованию типов данных при вставке данных из Flink в ClickHouse.

### Вставка данных из Flink в ClickHouse \{#inserting-data-from-flink-into-clickhouse\}

[//]: # "TODO: добавить столбец \"Flink SQL Type\", как только будет добавлена поддержка API таблиц"

| Тип Java            | Тип ClickHouse    | Поддерживается | Метод сериализации            |
| ------------------- | ----------------- | -------------- | ----------------------------- |
| `byte`/`Byte`       | `Int8`            | ✅              | `DataWriter.writeInt8`        |
| `short`/`Short`     | `Int16`           | ✅              | `DataWriter.writeInt16`       |
| `int`/`Integer`     | `Int32`           | ✅              | `DataWriter.writeInt32`       |
| `long`/`Long`       | `Int64`           | ✅              | `DataWriter.writeInt64`       |
| `BigInteger`        | `Int128`          | ✅              | `DataWriter.writeInt128`      |
| `BigInteger`        | `Int256`          | ✅              | `DataWriter.writeInt256`      |
| `short`/`Short`     | `UInt8`           | ✅              | `DataWriter.writeUInt8`       |
| `int`/`Integer`     | `UInt8`           | ✅              | `DataWriter.writeUInt8 `      |
| `int`/`Integer`     | `UInt16`          | ✅              | `DataWriter.writeUInt16`      |
| `long`/`Long`       | `UInt32`          | ✅              | `DataWriter.writeUInt32`      |
| `long`/`Long`       | `UInt64`          | ✅              | `DataWriter.writeUInt64`      |
| `BigInteger`        | `UInt64`          | ✅              | `DataWriter.writeUInt64`      |
| `BigInteger`        | `UInt128`         | ✅              | `DataWriter.writeUInt128`     |
| `BigInteger`        | `UInt256`         | ✅              | `DataWriter.writeUInt256`     |
| `BigDecimal`        | `Decimal`         | ✅              | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal32`       | ✅              | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal64`       | ✅              | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal128`      | ✅              | `DataWriter.writeDecimal`     |
| `BigDecimal`        | `Decimal256`      | ✅              | `DataWriter.writeDecimal`     |
| `float`/`Float`     | `Float`           | ✅              | `DataWriter.writeFloat32`     |
| `double`/`Double`   | `Double`          | ✅              | `DataWriter.writeFloat64`     |
| `boolean`/`Boolean` | `Boolean`         | ✅              | `DataWriter.writeBoolean`     |
| `String`            | `String`          | ✅              | `DataWriter.writeString`      |
| `String`            | `FixedString`     | ✅              | `DataWriter.writeFixedString` |
| `LocalDate`         | `Date`            | ✅              | `DataWriter.writeDate`        |
| `LocalDate`         | `Date32`          | ✅              | `DataWriter.writeDate32`      |
| `LocalDateTime`     | `DateTime`        | ✅              | `DataWriter.writeDateTime`    |
| `ZonedDateTime`     | `DateTime`        | ✅              | `DataWriter.writeDateTime`    |
| `LocalDateTime`     | `DateTime64`      | ✅              | `DataWriter.writeDateTime64`  |
| `ZonedDateTime`     | `DateTime64`      | ✅              | `DataWriter.writeDateTime64`  |
| `int`/`Integer`     | `Time`            | ❌              | Н/Д                           |
| `long`/`Long`       | `Time64`          | ❌              | Н/Д                           |
| `byte`/`Byte`       | `Enum8`           | ✅              | `DataWriter.writeInt8`        |
| `int`/`Integer`     | `Enum16`          | ✅              | `DataWriter.writeInt16`       |
| `java.util.UUID`    | `UUID`            | ✅              | `DataWriter.writeIntUUID`     |
| `String`            | `JSON`            | ✅              | `DataWriter.writeJSON`        |
| `Array<Type>`       | `Array<Type>`     | ✅              | `DataWriter.writeArray`       |
| `Map<K,V>`          | `Map<K,V>`        | ✅              | `DataWriter.writeMap`         |
| `Tuple<Type,..>`    | `Tuple<T1,T2,..>` | ✅              | `DataWriter.writeTuple`       |
| `Object`            | `Variant`         | ❌              | Н/Д                           |

Примечания:

* При выполнении операций с датами необходимо указать `ZoneId`.
* При выполнении операций с десятичными числами необходимо указать [точность и масштаб](https://clickhouse.com/docs/sql-reference/data-types/decimal#decimal-value-ranges).
* Чтобы ClickHouse мог разобрать строку Java как JSON, необходимо включить `enableJsonSupportAsString` в `ClickHouseClientConfig`.
* Коннектору требуется `ElementConvertor` для преобразования элементов входного DataStream в данные для ClickHouse. Для этого коннектор предоставляет `ClickHouseConvertor` и `POJOConvertor`, которые можно использовать для реализации этого преобразования с помощью указанных выше методов сериализации `DataWriter`.

## Поддерживаемые входные форматы \{#supported-input-formats\}

Список доступных входных форматов ClickHouse можно найти [на этой странице документации](https://clickhouse.com/docs/interfaces/formats#formats-overview) и в [ClickHouseFormat.java](https://github.com/ClickHouse/clickhouse-java/blob/main/clickhouse-data/src/main/java/com/clickhouse/data/ClickHouseFormat.java).

Чтобы указать формат, который коннектор должен использовать для сериализации вашего DataStream в данные для ClickHouse, используйте функцию `setClickHouseFormat`. Например:

```java
ClickHouseAsyncSink<String> csvSink = new ClickHouseAsyncSink<>(
        convertorString,
        MAX_BATCH_SIZE,
        MAX_IN_FLIGHT_REQUESTS,
        MAX_BUFFERED_REQUESTS,
        MAX_BATCH_SIZE_IN_BYTES,
        MAX_TIME_IN_BUFFER_MS,
        MAX_RECORD_SIZE_IN_BYTES,
        clickHouseClientConfig
);
csvSink.setClickHouseFormat(ClickHouseFormat.CSV);
```

:::note
По умолчанию коннектор использует [RowBinaryWithDefaults](https://clickhouse.com/docs/interfaces/formats/RowBinaryWithDefaults) или [RowBinary](https://clickhouse.com/docs/interfaces/formats/RowBinary), если параметр `setSupportDefault` в `ClickHouseClientConfig` явно установлен в `true` или `false` соответственно.
:::


## Метрики \{#metrics\}

Коннектор предоставляет следующие дополнительные метрики в дополнение к уже существующим метрикам Flink:

| Metric                                  | Description                                                                                                                                                                                                                                                                                                                         | Type      | Status |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ |
| `numBytesSend`                          | Общее количество байтов, отправленных в ClickHouse в полезной нагрузке запроса. *Примечание: эта метрика измеряет размер сериализованных данных, переданных по сети, и может отличаться от `written_bytes` в `system.query_log` ClickHouse, который отражает фактическое количество байтов, записанных в хранилище после обработки* | Counter   | ✅      |
| `numRecordSend`                         | Общее количество записей, отправленных в ClickHouse                                                                                                                                                                                                                                                                                 | Counter   | ✅      |
| `numRequestSubmitted`                   | Общее количество отправленных запросов (фактическое количество выполненных сбросов)                                                                                                                                                                                                                                                 | Counter   | ✅      |
| `numOfDroppedBatches`                   | Общее количество батчей, отброшенных из-за ошибок, не допускающих повторной попытки                                                                                                                                                                                                                                                 | Counter   | ✅      |
| `numOfDroppedRecords`                   | Общее количество записей, отброшенных из-за ошибок, не допускающих повторной попытки                                                                                                                                                                                                                                                | Counter   | ✅      |
| `totalBatchRetries`                     | Общее количество повторных попыток отправки батчей из-за ошибок, допускающих повторную попытку                                                                                                                                                                                                                                      | Counter   | ✅      |
| `writeLatencyHistogram`                 | Гистограмма распределения задержки успешной записи (мс)                                                                                                                                                                                                                                                                             | Histogram | ✅      |
| `writeFailureLatencyHistogram`          | Гистограмма распределения задержки неуспешной записи (мс)                                                                                                                                                                                                                                                                           | Histogram | ✅      |
| `triggeredByMaxBatchSizeCounter`        | Общее количество сбросов, вызванных достижением `maxBatchSize`                                                                                                                                                                                                                                                                      | Counter   | ✅      |
| `triggeredByMaxBatchSizeInBytesCounter` | Общее количество сбросов, вызванных достижением `maxBatchSizeInBytes`                                                                                                                                                                                                                                                               | Counter   | ✅      |
| `triggeredByMaxTimeInBufferMSCounter`   | Общее количество сбросов, вызванных достижением `maxTimeInBufferMS`                                                                                                                                                                                                                                                                 | Counter   | ✅      |
| `actualRecordsPerBatch`                 | Гистограмма распределения фактического размера батча                                                                                                                                                                                                                                                                                | Histogram | ✅      |
| `actualBytesPerBatch`                   | Гистограмма распределения фактического количества байтов в батче                                                                                                                                                                                                                                                                    | Histogram | ✅      |

[//]: # "| actualTimeInBuffer           | Гистограмма распределения фактического времени пребывания в буфере до сброса | Histogram | ❌      |"

## Ограничения \{#limitations\}

* В настоящее время sink предоставляет гарантию доставки как минимум один раз. Работа над семантикой exactly-once отслеживается [здесь](https://github.com/ClickHouse/flink-connector-clickhouse/issues/106).
* Sink пока не поддерживает очередь необрабатываемых сообщений (DLQ) для буферизации записей, которые не удалось обработать. Пока коннектор будет пытаться повторно вставить записи, завершившиеся ошибкой, и отбрасывать их в случае неудачи. Эта возможность отслеживается [здесь](https://github.com/ClickHouse/flink-connector-clickhouse/issues/105).
* Sink пока не поддерживает создание через Table API Flink или Flink SQL. Эта возможность отслеживается [здесь](https://github.com/ClickHouse/flink-connector-clickhouse/issues/42).

## Совместимость версий ClickHouse и безопасность \{#compatibility-and-security\}

* Коннектор ежедневно тестируется в CI с рядом последних версий ClickHouse, включая latest и head. Список тестируемых версий периодически обновляется по мере выхода новых релизов ClickHouse. Список версий, с которыми коннектор ежедневно проходит тесты, см. [здесь](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/.github/workflows/tests-nightly.yaml#L15).
* Сведения об известных уязвимостях и инструкции по сообщению о новой уязвимости см. в [политике безопасности ClickHouse](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md#security-change-log-and-support).
* Мы рекомендуем регулярно обновлять коннектор, чтобы своевременно получать исправления безопасности и другие улучшения.
* Если у вас возникла проблема с миграцией, создайте [issue](https://github.com/ClickHouse/flink-connector-clickhouse/issues) в GitHub, и мы ответим!

## Расширенные и рекомендуемые варианты использования \{#advanced-and-recommended-usage\}

* Для оптимальной производительности убедитесь, что тип элементов вашего DataStream **не** является Generic — см. [описание различий между типами во Flink](https://nightlies.apache.org/flink/flink-docs-release-2.2/docs/dev/datastream/fault-tolerance/serialization/types_serialization/#flinks-typeinformation-class). Элементы не типа Generic позволяют избежать накладных расходов на сериализацию через Kryo и повысить пропускную способность при записи в ClickHouse.
* Мы рекомендуем установить `maxBatchSize` как минимум в 1000, а в идеале — в диапазоне от 10 000 до 100 000. Подробнее см. [в этом руководстве по пакетным вставкам](https://clickhouse.com/docs/optimize/bulk-inserts).
* Чтобы выполнять дедупликацию в стиле OLTP или upsert в ClickHouse, обратитесь к [этой странице документации](https://clickhouse.com/docs/guides/developer/deduplication#options-for-deduplication). *Примечание: не путайте это с дедупликацией пакетов при повторных попытках, которая подробно описана [ниже](#duplicate_batches).*

## Устранение неполадок \{#troubleshooting\}

### CANNOT_READ_ALL_DATA \{#cannot_read_all_data\}

Может возникнуть следующая ошибка:

```text
com.clickhouse.client.api.ServerException: Code: 33. DB::Exception: Cannot read all data. Bytes read: 9205. Bytes expected: 1100022.: (at row 9) : While executing BinaryRowInputFormat. (CANNOT_READ_ALL_DATA)
```

**Причина**: Чаще всего ошибка CANNOT&#95;READ&#95;ALL&#95;DATA означает, что схема таблицы ClickHouse перестала соответствовать схеме записей Flink. Это может произойти, если одна из них была изменена с нарушением обратной совместимости.

**Решение**: Обновите схему таблицы ClickHouse, входной тип данных коннектора или и то и другое, чтобы они снова стали совместимыми. При необходимости см. [сопоставление типов](#inserting-data-from-flink-into-clickhouse), чтобы понять, как типы Java соотносятся с типами ClickHouse. *Примечание: если какие-то записи все еще находятся в обработке, при перезапуске коннектора потребуется сбросить состояние Flink.*


### Низкая пропускная способность \{#low_throughput\}

Вы можете заметить, что пропускная способность коннектора не масштабируется вместе с параллелизмом задания (числом задач Flink) при записи в ClickHouse.

**Причина**: фоновый [процесс слияния частей](https://clickhouse.com/docs/merges) в ClickHouse может замедлять вставки. Это может происходить, если настроенный размер пакета слишком мал, коннектор слишком часто выполняет сброс, или из-за сочетания обоих факторов.

**Решение**: Мониторьте метрики `numRequestSubmitted` и `actualRecordsPerBatch`, чтобы понять, как подобрать размер пакета (`maxBatchSize`) и частоту сброса. Рекомендации по размеру пакета также приведены в разделе [Расширенное и рекомендуемое использование](#advanced-and-recommended-usage).

[//]: # "TODO: uncomment this section once https://github.com/ClickHouse/flink-connector-clickhouse/issues/121 is closed"

[//]: # "### I see duplicate batches of rows in my ClickHouse table {#duplicate_batches}"

[//]: #

[//]: # "**Cause**: If one or more records in a Flink batch fails to insert into ClickHouse because of a retryable failure, the connector will retry the **entire batch**. If [insert deduplication](https://clickhouse.com/docs/guides/developer/deduplicating-inserts-on-retries#query-level-insert-deduplication) is disabled, this may result in duplicate records landing in your ClickHouse table. Otherwise, it's possible that the deduplication window or window duration may be too small and is expiring blocks before the connector retries them."

[//]: #

[//]: # "**Solution**:"

[//]: # "- If your table is using a `Replicated*MergeTree` table engine:"

[//]: # "  1. ensure the server session setting `insert_deduplicate=1` (see the [example](#client-options) above for how to set it, if necessary). Note that `insert_deduplicate` is on by default for replicated tables."

[//]: # "  2. if necessary, increase either/both the `MergeTree` table settings [`replicated_deduplication_window`](https://clickhouse.com/docs/operations/settings/merge-tree-settings#replicated_deduplication_window) or [`replicated_deduplication_window_seconds`](https://clickhouse.com/docs/operations/settings/merge-tree-settings#replicated_deduplication_window_seconds)."

[//]: # "- If your table is using a non-replicated `*MergeTree` table engine, increase the `MergeTree` table setting [`non_replicated_deduplication_window`](https://clickhouse.com/docs/operations/settings/merge-tree-settings#non_replicated_deduplication_window)."

[//]: #

[//]: # "_Note 1: this solution relies on [synchronous inserts](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default), which is recommended for use with the Flink connector. Please ensure server session setting `async_insert=0`._"

[//]: #

[//]: # "_Note 2: a large number for `(non_)replicated_deduplication_window` may slow down inserts because more entries need to be compared._"

### В таблице ClickHouse отсутствуют строки \{#missing_rows\}

**Причина**: Пакеты были отброшены либо из-за ошибки, не подлежащей повторной попытке, либо потому, что их не удалось вставить за заданное число повторных попыток (настраивается через `ClickHouseClientConfig.setNumberOfRetries()`). *Примечание: по умолчанию коннектор пытается повторно вставить пакет до 3 раз, прежде чем отбросить его.*

**Решение**: Проверьте логи TaskManager и/или трассировки стека, чтобы определить первопричину.

## Участие в разработке и поддержка \{#contributing-and-support\}

Если вы хотите внести вклад в проект или сообщить о каких-либо проблемах, мы будем рады вашей помощи!
Перейдите в наш [репозиторий GitHub](https://github.com/ClickHouse/flink-connector-clickhouse), чтобы создать issue, предложить
улучшения или отправить pull request.

Мы приветствуем ваш вклад! Перед началом работы, пожалуйста, ознакомьтесь с [руководством для участников](https://github.com/ClickHouse/flink-connector-clickhouse/blob/main/CONTRIBUTING.md) в репозитории.
Спасибо, что помогаете улучшать коннектор ClickHouse для Flink!