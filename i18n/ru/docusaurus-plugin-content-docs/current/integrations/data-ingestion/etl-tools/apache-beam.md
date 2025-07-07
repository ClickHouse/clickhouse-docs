---
sidebar_label: 'Apache Beam'
slug: /integrations/apache-beam
description: 'Пользователи могут загружать данные в ClickHouse с помощью Apache Beam'
title: 'Интеграция Apache Beam и ClickHouse'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция Apache Beam и ClickHouse

<ClickHouseSupportedBadge/>

**Apache Beam** — это модель программирования с открытым исходным кодом, которая позволяет разработчикам определять и выполнять как пакетные, так и потоковые (непрерывные) конвейеры обработки данных. Гибкость Apache Beam проявляется в его способности поддерживать широкий спектр сценариев обработки данных, от операций ETL (Извлечение, Преобразование, Загрузка) до сложной обработки событий и аналитики в реальном времени. Эта интеграция использует официальный [JDBC соединитель](https://github.com/ClickHouse/clickhouse-java) ClickHouse для нижележащего слоя вставки.

## Пакет интеграции {#integration-package}

Пакет интеграции, необходимый для интеграции Apache Beam и ClickHouse, поддерживается и разрабатывается в рамках [Apache Beam I/O Connectors](https://beam.apache.org/documentation/io/connectors/) — набора интеграций с множеством популярных систем хранения данных и баз данных. Реализация `org.apache.beam.sdk.io.clickhouse.ClickHouseIO` находится в [репозитории Apache Beam](https://github.com/apache/beam/tree/0bf43078130d7a258a0f1638a921d6d5287ca01e/sdks/java/io/clickhouse/src/main/java/org/apache/beam/sdk/io/clickhouse).

## Настройка пакета Apache Beam ClickHouse {#setup-of-the-apache-beam-clickhouse-package}

### Установка пакета {#package-installation}

Добавьте следующую зависимость в свою систему управления пакетами:
```xml
<dependency>
    <groupId>org.apache.beam</groupId>
    <artifactId>beam-sdks-java-io-clickhouse</artifactId>
    <version>${beam.version}</version>
</dependency>
```

:::important Рекомендуемая версия Beam
Рекомендуется использовать соединитель `ClickHouseIO`, начиная с версии Apache Beam `2.59.0`. Ранее версии могут не полностью поддерживать функциональность соединителя.
:::


Артефакты можно найти в [официальном репозитории maven](https://mvnrepository.com/artifact/org.apache.beam/beam-sdks-java-io-clickhouse).

### Пример кода {#code-example}

Следующий пример считывает CSV файл с именем `input.csv` как `PCollection`, преобразует его в объект Row (используя определенную схему) и вставляет его в локальный экземпляр ClickHouse, используя `ClickHouseIO`:

```java

package org.example;

import org.apache.beam.sdk.Pipeline;
import org.apache.beam.sdk.io.TextIO;
import org.apache.beam.sdk.io.clickhouse.ClickHouseIO;
import org.apache.beam.sdk.schemas.Schema;
import org.apache.beam.sdk.transforms.DoFn;
import org.apache.beam.sdk.transforms.ParDo;
import org.apache.beam.sdk.values.PCollection;
import org.apache.beam.sdk.values.Row;
import org.joda.time.DateTime;


public class Main {


    public static void main(String[] args) {
        // Создание объекта Pipeline.
        Pipeline p = Pipeline.create();

        Schema SCHEMA =
                Schema.builder()
                        .addField(Schema.Field.of("name", Schema.FieldType.STRING).withNullable(true))
                        .addField(Schema.Field.of("age", Schema.FieldType.INT16).withNullable(true))
                        .addField(Schema.Field.of("insertion_time", Schema.FieldType.DATETIME).withNullable(false))
                        .build();


        // Применение преобразований к конвейеру.
        PCollection<String> lines = p.apply("ReadLines", TextIO.read().from("src/main/resources/input.csv"));


        PCollection<Row> rows = lines.apply("ConvertToRow", ParDo.of(new DoFn<String, Row>() {
            @ProcessElement
            public void processElement(@Element String line, OutputReceiver<Row> out) {

                String[] values = line.split(",");
                Row row = Row.withSchema(SCHEMA)
                        .addValues(values[0], Short.parseShort(values[1]), DateTime.now())
                        .build();
                out.output(row);
            }
        })).setRowSchema(SCHEMA);

        rows.apply("Write to ClickHouse",
                        ClickHouseIO.write("jdbc:clickhouse://localhost:8123/default?user=default&password=******", "test_table"));

        // Запуск конвейера.
        p.run().waitUntilFinish();
    }
}

```

## Поддерживаемые типы данных {#supported-data-types}

| ClickHouse                         | Apache Beam                | Поддерживается | Примечания                                                                                                                                |
|------------------------------------|----------------------------|----------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `TableSchema.TypeName.FLOAT32`     | `Schema.TypeName#FLOAT`    | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.FLOAT64`     | `Schema.TypeName#DOUBLE`   | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.INT8`        | `Schema.TypeName#BYTE`     | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.INT16`       | `Schema.TypeName#INT16`    | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.INT32`       | `Schema.TypeName#INT32`    | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.INT64`       | `Schema.TypeName#INT64`    | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.STRING`      | `Schema.TypeName#STRING`   | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.UINT8`       | `Schema.TypeName#INT16`    | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.UINT16`      | `Schema.TypeName#INT32`    | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.UINT32`      | `Schema.TypeName#INT64`    | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.UINT64`      | `Schema.TypeName#INT64`    | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.DATE`        | `Schema.TypeName#DATETIME` | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.DATETIME`    | `Schema.TypeName#DATETIME` | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.ARRAY`       | `Schema.TypeName#ARRAY`    | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.ENUM8`       | `Schema.TypeName#STRING`   | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.ENUM16`      | `Schema.TypeName#STRING`   | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.BOOL`        | `Schema.TypeName#BOOLEAN`  | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.TUPLE`       | `Schema.TypeName#ROW`      | ✅              |                                                                                                                                          |
| `TableSchema.TypeName.FIXEDSTRING` | `FixedBytes`               | ✅              | `FixedBytes` — это `LogicalType`, представляющий фиксированный по длине <br/> массив байт, расположенный в <br/> `org.apache.beam.sdk.schemas.logicaltypes` |
|                                    | `Schema.TypeName#DECIMAL`  | ❌              |                                                                                                                                          |
|                                    | `Schema.TypeName#MAP`      | ❌              |                                                                                                                                          |

## Параметры ClickHouseIO.Write {#clickhouseiowrite-parameters}

Вы можете настроить конфигурацию `ClickHouseIO.Write` с помощью следующих сеттеров:

| Функция установки параметра       | Тип аргумента               | Значение по умолчанию          | Описание                                                        |
|------------------------------------|-----------------------------|--------------------------------|-----------------------------------------------------------------|
| `withMaxInsertBlockSize`           | `(long maxInsertBlockSize)` | `1000000`                      | Максимальный размер блока строк для вставки.                     |
| `withMaxRetries`                   | `(int maxRetries)`          | `5`                            | Максимальное количество попыток повторной вставки в случае ошибки.|
| `withMaxCumulativeBackoff`         | `(Duration maxBackoff)`     | `Duration.standardDays(1000)`  | Максимальная кумулятивная длительность откладывания для повторных попыток. |
| `withInitialBackoff`               | `(Duration initialBackoff)` | `Duration.standardSeconds(5)`  | Начальная длительность откладывания перед первой попыткой повторной вставки. |
| `withInsertDistributedSync`        | `(Boolean sync)`            | `true`                         | Если истинно, синхронизирует операции вставки для распределенных таблиц. |
| `withInsertQuorum`                 | `(Long quorum)`             | `null`                         | Количество реплик, необходимых для подтверждения операции вставки. |
| `withInsertDeduplicate`            | `(Boolean deduplicate)`     | `true`                         | Если истинно, включена дедупликация для операций вставки.       |
| `withTableSchema`                  | `(TableSchema schema)`      | `null`                         | Схема целевой таблицы ClickHouse.                               |

## Ограничения {#limitations}

Пожалуйста, учитывайте следующие ограничения при использовании соединителя:
* На сегодняшний день поддерживается только операция Sink. Соединитель не поддерживает операцию Source.
* ClickHouse выполняет дедупликацию при вставке в `ReplicatedMergeTree` или в распределённую таблицу, построенную на основе `ReplicatedMergeTree`. Без репликации вставка в обычный MergeTree может привести к дубликатам, если вставка не удалась, а затем была успешно повторена. Однако каждый блок вставляется атомарно, и размер блока можно настроить с помощью `ClickHouseIO.Write.withMaxInsertBlockSize(long)`. Дедупликация достигается с использованием контрольных сумм вставленных блоков. Для получения дополнительной информации о дедупликации, пожалуйста, посетите [Дедупликация](/guides/developer/deduplication) и [Настройки дедупликации вставки](/operations/settings/settings#insert_deduplicate).
* Соединитель не выполняет никаких DDL операторов; поэтому целевая таблица должна существовать до вставки.

## Связанный контент {#related-content}
* Документация класса `ClickHouseIO` [доступна здесь](https://beam.apache.org/releases/javadoc/current/org/apache/beam/sdk/io/clickhouse/ClickHouseIO.html).
* Репозиторий `Github` примеров [clickhouse-beam-connector](https://github.com/ClickHouse/clickhouse-beam-connector).
