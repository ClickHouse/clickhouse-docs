---
sidebar_label: 'Руководство по миграции'
slug: /migrations/snowflake
description: 'Миграция с Snowflake на ClickHouse'
keywords: ['Snowflake']
title: 'Миграция с Snowflake на ClickHouse'
show_related_blogs: false
doc_type: 'guide'
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';

# Миграция из Snowflake в ClickHouse {#migrate-from-snowflake-to-clickhouse}

> В этом руководстве описывается процесс миграции данных из Snowflake в ClickHouse.

Для миграции данных из Snowflake в ClickHouse необходимо использовать объектное хранилище,
например S3, в качестве промежуточного хранилища. Процесс миграции также
предполагает использование команды `COPY INTO` в Snowflake и `INSERT INTO SELECT`
в ClickHouse.

<VerticalStepper headerLevel="h2">

## Экспорт данных из Snowflake {#1-exporting-data-from-snowflake}

<Image img={migrate_snowflake_clickhouse} size="md" alt="Миграция с Snowflake на ClickHouse" />

Для экспорта данных из Snowflake необходимо использовать внешний stage (external stage), как показано на диаграмме выше.

Предположим, что мы хотим экспортировать таблицу Snowflake со следующей схемой:

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

Чтобы перенести данные этой таблицы в базу данных ClickHouse, сначала нужно скопировать их во внешний stage. При копировании данных мы рекомендуем использовать Parquet как промежуточный формат, поскольку он позволяет передавать информацию о типах, сохраняет точность, хорошо сжимается и нативно поддерживает вложенные структуры, типичные для аналитики.

В примере ниже мы создаём именованный формат файла в Snowflake для представления формата Parquet и требуемых параметров файлов. Затем указываем, какой bucket будет содержать наш скопированный набор данных. Наконец, копируем набор данных в этот bucket.

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- Создайте внешний stage, указывающий S3-бакет для копирования данных
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- Примените префикс "mydataset" ко всем файлам и укажите максимальный размер файла 150 МБ
-- Параметр `header=true` требуется для получения имён столбцов
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

Для набора данных объемом около 5 ТБ с максимальным размером файла 150 МБ и при использовании виртуального склада Snowflake типа 2X-Large, расположенного в том же регионе AWS `us-east-1`, копирование данных в бакет S3 займет примерно 30 минут.

## Импорт в ClickHouse {#2-importing-to-clickhouse}

После того как данные размещены во временном объектном хранилище, функции ClickHouse, такие как [табличная функция s3](/sql-reference/table-functions/s3), можно использовать для вставки данных в таблицу, как показано ниже.

В этом примере используется [табличная функция s3](/sql-reference/table-functions/s3) для AWS S3, но [табличную функцию gcs](/sql-reference/table-functions/gcs) можно использовать для Google Cloud Storage, а [табличную функцию azureBlobStorage](/sql-reference/table-functions/azureBlobStorage) — для Azure Blob Storage.

Предположим, что целевая схема таблицы имеет следующий вид:

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

Затем мы можем использовать команду `INSERT INTO SELECT`, чтобы загрузить данные из S3 в таблицу ClickHouse:

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
SETTINGS input_format_null_as_default = 1, -- Столбцы вставляются со значениями по умолчанию, если значения равны null
input_format_parquet_case_insensitive_column_matching = 1 -- Сопоставление столбцов между исходными данными и целевой таблицей выполняется без учёта регистра
```

:::note Примечание о вложенных структурах столбцов
Столбцы `VARIANT` и `OBJECT` в исходной схеме таблицы Snowflake по умолчанию будут выводиться в виде строк JSON, поэтому при вставке в ClickHouse их необходимо явно приводить к нужному типу.

Вложенные структуры, такие как `some_file`, при выполнении операции COPY в Snowflake преобразуются в строки JSON. Импорт этих данных требует преобразования таких структур в тип `Tuple` при вставке в ClickHouse с использованием [функции JSONExtract](/sql-reference/functions/json-functions#JSONExtract), как показано выше.
:::

## Проверка успешного экспорта данных {#3-testing-successful-data-export}

Чтобы проверить, что данные были корректно вставлены, выполните запрос `SELECT` к новой таблице:

```sql
SELECT * FROM mydataset LIMIT 10;
```

</VerticalStepper>
