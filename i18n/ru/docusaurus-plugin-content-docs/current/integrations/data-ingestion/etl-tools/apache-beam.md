---
sidebar_label: 'Apache Beam'
slug: /integrations/apache-beam
description: 'Вы можете выполнять приём данных в ClickHouse с помощью Apache Beam'
title: 'Интеграция Apache Beam и ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
keywords: ['apache beam', 'потоковая обработка', 'пакетная обработка', 'коннектор JDBC', 'конвейер данных']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция Apache Beam и ClickHouse {#integrating-apache-beam-and-clickhouse}

<ClickHouseSupportedBadge/>

**Apache Beam** — это открытая унифицированная модель программирования, которая позволяет разработчикам определять и выполнять как пакетные, так и потоковые (непрерывные) конвейеры обработки данных. Гибкость Apache Beam заключается в его способности поддерживать широкий спектр сценариев обработки данных — от ETL (Extract, Transform, Load — извлечение, преобразование и загрузка) операций до сложной обработки событий и аналитики в режиме реального времени.  
Эта интеграция использует официальный [JDBC-коннектор](https://github.com/ClickHouse/clickhouse-java) ClickHouse в качестве базового слоя записи данных.

## Пакет интеграции {#integration-package}

Пакет, необходимый для интеграции Apache Beam и ClickHouse, поддерживается и развивается в разделе [Apache Beam I/O Connectors](https://beam.apache.org/documentation/io/connectors/) — пакете интеграций с популярными системами хранения данных и базами данных.
Реализация `org.apache.beam.sdk.io.clickhouse.ClickHouseIO` находится в [репозитории Apache Beam](https://github.com/apache/beam/tree/0bf43078130d7a258a0f1638a921d6d5287ca01e/sdks/java/io/clickhouse/src/main/java/org/apache/beam/sdk/io/clickhouse).

## Настройка пакета Apache Beam ClickHouse {#setup-of-the-apache-beam-clickhouse-package}

### Установка пакета {#package-installation}

Добавьте следующую зависимость в используемую систему управления пакетами:

```xml
<dependency>
    <groupId>org.apache.beam</groupId>
    <artifactId>beam-sdks-java-io-clickhouse</artifactId>
    <version>${beam.version}</version>
</dependency>
```

:::important Рекомендуемая версия Beam
Коннектор `ClickHouseIO` рекомендуется использовать, начиная с Apache Beam версии `2.59.0`.
Более ранние версии могут не в полной мере поддерживать функциональность коннектора.
:::

Артефакты можно найти в [официальном репозитории Maven](https://mvnrepository.com/artifact/org.apache.beam/beam-sdks-java-io-clickhouse).


### Пример кода {#code-example}

Следующий пример считывает CSV‑файл с именем `input.csv` как коллекцию `PCollection`, преобразует его в объект `Row` (используя определённую схему) и вставляет в локальный экземпляр ClickHouse с помощью `ClickHouseIO`:

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
        // Create a Pipeline object.
        Pipeline p = Pipeline.create();

        Schema SCHEMA =
                Schema.builder()
                        .addField(Schema.Field.of("name", Schema.FieldType.STRING).withNullable(true))
                        .addField(Schema.Field.of("age", Schema.FieldType.INT16).withNullable(true))
                        .addField(Schema.Field.of("insertion_time", Schema.FieldType.DATETIME).withNullable(false))
                        .build();

        // Apply transforms to the pipeline.
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

        // Run the pipeline.
        p.run().waitUntilFinish();
    }
}

```


## Поддерживаемые типы данных {#supported-data-types}

| ClickHouse                         | Apache Beam                | Поддерживается | Примечания                                                                                                                                               |
|------------------------------------|----------------------------|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| `TableSchema.TypeName.FLOAT32`     | `Schema.TypeName#FLOAT`    | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.FLOAT64`     | `Schema.TypeName#DOUBLE`   | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.INT8`        | `Schema.TypeName#BYTE`     | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.INT16`       | `Schema.TypeName#INT16`    | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.INT32`       | `Schema.TypeName#INT32`    | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.INT64`       | `Schema.TypeName#INT64`    | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.STRING`      | `Schema.TypeName#STRING`   | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.UINT8`       | `Schema.TypeName#INT16`    | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.UINT16`      | `Schema.TypeName#INT32`    | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.UINT32`      | `Schema.TypeName#INT64`    | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.UINT64`      | `Schema.TypeName#INT64`    | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.DATE`        | `Schema.TypeName#DATETIME` | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.DATETIME`    | `Schema.TypeName#DATETIME` | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.ARRAY`       | `Schema.TypeName#ARRAY`    | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.ENUM8`       | `Schema.TypeName#STRING`   | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.ENUM16`      | `Schema.TypeName#STRING`   | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.BOOL`        | `Schema.TypeName#BOOLEAN`  | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.TUPLE`       | `Schema.TypeName#ROW`      | ✅              |                                                                                                                                                          |
| `TableSchema.TypeName.FIXEDSTRING` | `FixedBytes`               | ✅              | `FixedBytes` — это `LogicalType`, представляющий байтовый массив фиксированной длины, <br/> определённый в пакете <br/> `org.apache.beam.sdk.schemas.logicaltypes` |
|                                    | `Schema.TypeName#DECIMAL`  | ❌              |                                                                                                                                                          |
|                                    | `Schema.TypeName#MAP`      | ❌              |                                                                                                                                                          |

## Параметры ClickHouseIO.Write {#clickhouseiowrite-parameters}

Вы можете настроить конфигурацию `ClickHouseIO.Write` с помощью следующих функций-сеттеров:

| Функция-сеттер параметра    | Тип аргумента               | Значение по умолчанию         | Описание                                                         |
|-----------------------------|-----------------------------|-------------------------------|------------------------------------------------------------------|
| `withMaxInsertBlockSize`    | `(long maxInsertBlockSize)` | `1000000`                     | Максимальный размер блока строк для вставки.                     |
| `withMaxRetries`            | `(int maxRetries)`          | `5`                           | Максимальное число повторных попыток для неуспешных вставок.     |
| `withMaxCumulativeBackoff`  | `(Duration maxBackoff)`     | `Duration.standardDays(1000)` | Максимальная суммарная продолжительность интервала ожидания (backoff) для повторных попыток. |
| `withInitialBackoff`        | `(Duration initialBackoff)` | `Duration.standardSeconds(5)` | Начальная продолжительность интервала ожидания (backoff) перед первой повторной попыткой. |
| `withInsertDistributedSync` | `(Boolean sync)`            | `true`                        | Если `true`, синхронизирует операции вставки для распределённых таблиц. |
| `withInsertQuorum`          | `(Long quorum)`             | `null`                        | Количество реплик, необходимых для подтверждения операции вставки. |
| `withInsertDeduplicate`     | `(Boolean deduplicate)`     | `true`                        | Если `true`, включена дедупликация для операций вставки.         |
| `withTableSchema`           | `(TableSchema schema)`      | `null`                        | Схема целевой таблицы ClickHouse.                               |

## Ограничения {#limitations}

При использовании коннектора учитывайте следующие ограничения:

* На данный момент поддерживается только операция Sink. Коннектор не поддерживает операцию Source.
* ClickHouse выполняет дедупликацию при вставке в таблицу `ReplicatedMergeTree` или в таблицу `Distributed`, построенную поверх `ReplicatedMergeTree`. Без репликации вставка в обычную MergeTree может привести к дубликатам, если вставка завершилась с ошибкой, а затем была успешно повторена. Однако каждый блок вставляется атомарно, и размер блока можно настроить с помощью `ClickHouseIO.Write.withMaxInsertBlockSize(long)`. Дедупликация достигается за счёт использования контрольных сумм вставленных блоков. Дополнительные сведения о дедупликации см. в разделах [Deduplication](/guides/developer/deduplication) и [Deduplicate insertion config](/operations/settings/settings#insert_deduplicate).
* Коннектор не выполняет никаких DDL-операций; следовательно, целевая таблица должна существовать до вставки.

## Связанные материалы {#related-content}

* [Документация по классу `ClickHouseIO`](https://beam.apache.org/releases/javadoc/current/org/apache/beam/sdk/io/clickhouse/ClickHouseIO.html).
* Репозиторий с примерами на GitHub: [clickhouse-beam-connector](https://github.com/ClickHouse/clickhouse-beam-connector).