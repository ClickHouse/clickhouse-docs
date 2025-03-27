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

В этом руководстве показано, как мигрировать данные из Snowflake в ClickHouse.

Миграция данных между Snowflake и ClickHouse требует использования объектного хранилища, такого как S3, в качестве промежуточного хранилища для передачи. Процесс миграции также зависит от использования команд `COPY INTO` из Snowflake и `INSERT INTO SELECT` в ClickHouse.

## 1. Экспорт данных из Snowflake {#1-exporting-data-from-snowflake}

<Image img={migrate_snowflake_clickhouse} size="md" alt="Миграция из Snowflake в ClickHouse"/>

Экспорт данных из Snowflake требует использования внешней стадии, как показано на диаграмме выше.

Предположим, мы хотим экспортировать таблицу Snowflake со следующей схемой:

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

Чтобы перенести данные этой таблицы в базу данных ClickHouse, сначала нужно скопировать эти данные на внешнюю стадию. При копировании данных мы рекомендуем использовать Parquet в качестве промежуточного формата, так как он позволяет делиться информацией о типах, сохраняет точность, хорошо сжимается и нативно поддерживает вложенные структуры, общие для аналитики.

В следующем примере мы создаем именованный формат файлов в Snowflake для представления Parquet и желаемых параметров файла. Затем мы указываем, какой бакет будет содержать наш скопированный набор данных. Наконец, мы копируем набор данных в бакет.

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- Создание внешней стадии, которая указывает S3 бакет для копирования
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- Примените префикс "mydataset" ко всем файлам и установите максимальный размер файла 150MB
-- Параметр `header=true` требуется для получения имен столбцов
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

Для набора данных объемом около 5TB с максимальным размером файла 150MB и использованием склада Snowflake 2X-Large, расположенного в том же AWS регионе `us-east-1`, копирование данных в S3 бакет займет около 30 минут.

## 2. Импорт в ClickHouse {#2-importing-to-clickhouse}

После того как данные находятся на промежуточном объектном хранилище, функции ClickHouse, такие как [s3 table function](/sql-reference/table-functions/s3), могут быть использованы для вставки данных в таблицу, как показано ниже.

Этот пример использует [s3 table function](/sql-reference/table-functions/s3) для AWS S3, но [gcs table function](/sql-reference/table-functions/gcs) можно использовать для Google Cloud Storage, а [azureBlobStorage table function](/sql-reference/table-functions/azureBlobStorage) — для Azure Blob Storage.

Предполагая следующее целевое назначение схемы таблицы:

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

Мы можем использовать команду `INSERT INTO SELECT`, чтобы вставить данные из S3 в таблицу ClickHouse:

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
SETTINGS input_format_null_as_default = 1, -- Убедитесь, что столбцы вставляются как значения по умолчанию, если они null
input_format_parquet_case_insensitive_column_matching = 1 -- Сопоставление столбцов между исходными данными и целевой таблицей должно быть нечувствительным к регистру
```

:::note Примечание о вложенных структурах столбцов
Столбцы `VARIANT` и `OBJECT` в оригинальной схеме таблицы Snowflake будут по умолчанию выводиться как строки JSON, что заставляет нас выполнять преобразование этих данных при вставке в ClickHouse.

Вложенные структуры, такие как `some_file`, преобразуются в строки JSON при копировании Snowflake. Импорт этих данных требует от нас преобразования этих структур в Кортежи во время вставки в ClickHouse, используя [JSONExtract function](/sql-reference/functions/json-functions#jsonextract), как показано выше.
:::

## 3. Тестирование успешного экспорта данных {#3-testing-successful-data-export}

Чтобы проверить, были ли ваши данные правильно вставлены, просто выполните запрос `SELECT` к вашей новой таблице:

```sql
SELECT * FROM mydataset limit 10;
```

## Дальнейшее чтение и поддержка {#further-reading-and-support}

В дополнение к этому руководству, мы также рекомендуем прочитать нашу статью в блоге [сравнение Snowflake и ClickHouse](https://clickhouse.com/blog/clickhouse-vs-snowflake-for-real-time-analytics-comparison-migration-guide).

Если у вас возникли проблемы с передачей данных из Snowflake в ClickHouse, пожалуйста, свяжитесь с нами по адресу support@clickhouse.com.
