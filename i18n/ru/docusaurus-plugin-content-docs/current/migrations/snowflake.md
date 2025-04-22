---
sidebar_label: 'Snowflake'
sidebar_position: 20
slug: /migrations/snowflake
description: 'Миграция из Snowflake в ClickHouse'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'snowflake']
title: 'Миграция из Snowflake в ClickHouse'
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';


# Миграция из Snowflake в ClickHouse

Этот гид показывает, как мигрировать данные из Snowflake в ClickHouse.

Миграция данных между Snowflake и ClickHouse требует использования объектного хранилища, такого как S3, в качестве промежуточного хранилища для передачи. Процесс миграции также основывается на использовании команд `COPY INTO` из Snowflake и `INSERT INTO SELECT` в ClickHouse.

## 1. Экспорт данных из Snowflake {#1-exporting-data-from-snowflake}

<Image img={migrate_snowflake_clickhouse} size="md" alt="Миграция из Snowflake в ClickHouse"/>

Экспорт данных из Snowflake требует использования внешней стадии, как показано на диаграмме выше.

Допустим, мы хотим экспортировать таблицу Snowflake со следующей схемой:

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

Чтобы переместить данные этой таблицы в базу данных ClickHouse, сначала нужно скопировать эти данные на внешнюю стадию. При копировании данных мы рекомендуем использовать Parquet в качестве промежуточного формата, так как он позволяет делиться информацией о типах, сохраняет точность, хорошо сжимается и нативно поддерживает вложенные структуры, распространенные в аналитике.

В приведенном ниже примере мы создаем именованный формат файлов в Snowflake, чтобы представить Parquet и желаемые параметры файлов. Затем мы указываем, какой бакет будет содержать наш скопированный набор данных. Наконец, мы копируем набор данных в бакет.

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- Создаем внешнюю стадию, которая указывает бакет S3 для копирования
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- Применяем префикс "mydataset" ко всем файлам и указываем максимальный размер файла 150mb
-- Параметр `header=true` необходим для получения имен колонок
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

Для набора данных около 5TB с максимальным размером файла 150MB и с использованием 2X-Large Snowflake warehouse, расположенного в том же AWS `us-east-1` регионе, копирование данных в бакет S3 займет около 30 минут.

## 2. Импорт в ClickHouse {#2-importing-to-clickhouse}

Когда данные загружены в промежуточное объектное хранилище, функции ClickHouse, такие как [s3 table function](/sql-reference/table-functions/s3), можно использовать для вставки данных в таблицу, как показано ниже.

Этот пример использует [s3 table function](/sql-reference/table-functions/s3) для AWS S3, но [gcs table function](/sql-reference/table-functions/gcs) можно использовать для Google Cloud Storage, а [azureBlobStorage table function](/sql-reference/table-functions/azureBlobStorage) можно использовать для Azure Blob Storage.

Предположим, что у нас есть следующая схема целевой таблицы:

```sql
CREATE TABLE default.mydataset
(
        `timestamp` DateTime64(6),
        `some_text` String,
        `some_file` Tuple(filename String, version String),
        `complex_data` Tuple(name String, description String),
)
ENGINE = MergeTree
ORDER BY (timestamp)
```

Мы можем затем использовать команду `INSERT INTO SELECT`, чтобы вставить данные из S3 в таблицу ClickHouse:

```sql
INSERT INTO mydataset
SELECT
        timestamp,
        some_text,
        JSONExtract(
                ifNull(some_file, '{}'),
                'Tuple(filename String, version String)'
        ) AS some_file,
        JSONExtract(
                ifNull(complex_data, '{}'),
                'Tuple(filename String, description String)'
        ) AS complex_data,
FROM s3('https://mybucket.s3.amazonaws.com/mydataset/mydataset*.parquet')
SETTINGS input_format_null_as_default = 1, -- Убедитесь, что колонки вставляются как значения по умолчанию, если значения нулевые
input_format_parquet_case_insensitive_column_matching = 1 -- Сопоставление колонок между исходными данными и целевой таблицей должно быть нечувствительно к регистру
```

:::note Примечание о вложенных структурах колонок
Колонки `VARIANT` и `OBJECT` в исходной схеме таблицы Snowflake будут по умолчанию выводиться как JSON строки, что заставляет нас приводить их к типу при вставке в ClickHouse.

Вложенные структуры, такие как `some_file`, конвертируются в JSON строки при копировании Snowflake. Импорт этих данных требует от нас преобразования этих структур в Tuples во время вставки в ClickHouse, используя [функцию JSONExtract](/sql-reference/functions/json-functions#jsonextract), как показано выше.
:::

## 3. Тестирование успешного экспорта данных {#3-testing-successful-data-export}

Чтобы проверить, были ли ваши данные корректно вставлены, достаточно выполнить запрос `SELECT` к вашей новой таблице:

```sql
SELECT * FROM mydataset limit 10;
```

## Дальнейшее чтение и поддержка {#further-reading-and-support}

В дополнение к этому руководству, мы также рекомендуем прочитать нашу статью в блоге [сравнивающую Snowflake и ClickHouse](https://clickhouse.com/blog/clickhouse-vs-snowflake-for-real-time-analytics-comparison-migration-guide).

Если у вас есть проблемы с передачей данных из Snowflake в ClickHouse, пожалуйста, свяжитесь с нами по адресу support@clickhouse.com.
