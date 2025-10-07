---
sidebar_label: 'Руководство по миграции'
slug: '/migrations/snowflake'
description: 'Перемещение из Snowflake в ClickHouse'
keywords: ['Snowflake']
title: 'Перемещение из Snowflake в ClickHouse'
show_related_blogs: false
doc_type: guide
---
import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';


# Миграция из Snowflake в ClickHouse

> Этот гид показывает, как мигрировать данные из Snowflake в ClickHouse.

Миграция данных между Snowflake и ClickHouse требует использования объектного хранилища, такого как S3, в качестве промежуточного хранилища для переноса. Процесс миграции также основывается на использовании команд `COPY INTO` из Snowflake и `INSERT INTO SELECT` из ClickHouse.

<VerticalStepper headerLevel="h2">

## Экспорт данных из Snowflake {#1-exporting-data-from-snowflake}

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

Чтобы переместить данные этой таблицы в базу данных ClickHouse, сначала необходимо скопировать эти данные на внешнюю стадию. При копировании данных мы рекомендуем формат Parquet в качестве промежуточного формата, так как он позволяет делиться информацией о типах, сохраняет точность, хорошо сжимается и нативно поддерживает вложенные структуры, распространенные в аналитике.

В примере ниже мы создаем именованный формат файла в Snowflake для представления Parquet и желаемых параметров файла. Затем мы указываем, какой бакет будет содержать наш скопированный набор данных. Наконец, мы копируем набор данных в бакет.

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- Create the external stage that specifies the S3 bucket to copy into
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- Apply "mydataset" prefix to all files and specify a max file size of 150mb
-- The `header=true` parameter is required to get column names
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

Для набора данных объемом около 5ТБ с максимальным размером файла 150МБ и использованием 2X-Large Snowflake warehouse, расположенного в том же регионе AWS `us-east-1`, копирование данных в корзину S3 займет около 30 минут.

## Импорт в ClickHouse {#2-importing-to-clickhouse}

После того как данные находятся на промежуточном объектном хранилище, функции ClickHouse, такие как [s3 table function](/sql-reference/table-functions/s3), могут быть использованы для вставки данных в таблицу, как показано ниже.

Этот пример использует [s3 table function](/sql-reference/table-functions/s3) для AWS S3, но [gcs table function](/sql-reference/table-functions/gcs) может быть использована для Google Cloud Storage, а [azureBlobStorage table function](/sql-reference/table-functions/azureBlobStorage) может быть использована для Azure Blob Storage.

Предполагая следующую целевую схему таблицы:

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
SETTINGS input_format_null_as_default = 1, -- Ensure columns are inserted as default if values are null
input_format_parquet_case_insensitive_column_matching = 1 -- Column matching between source data and target table should be case insensitive
```

:::note Заметка о вложенных структурах колонок
Столбцы `VARIANT` и `OBJECT` в оригинальной схеме таблицы Snowflake будут выводиться как строки JSON по умолчанию, что заставляет нас приводить их к типам при вставке в ClickHouse.

Вложенные структуры, такие как `some_file`, преобразуются в строки JSON при копировании Snowflake. Импорт этих данных требует преобразования этих структур в кортежи на момент вставки в ClickHouse, используя [функцию JSONExtract](/sql-reference/functions/json-functions#JSONExtract), как показано выше.
:::

## Проверка успешного экспорта данных {#3-testing-successful-data-export}

Чтобы проверить, были ли ваши данные правильно вставлены, просто выполните запрос `SELECT` на вашей новой таблице:

```sql
SELECT * FROM mydataset LIMIT 10;
```

</VerticalStepper>