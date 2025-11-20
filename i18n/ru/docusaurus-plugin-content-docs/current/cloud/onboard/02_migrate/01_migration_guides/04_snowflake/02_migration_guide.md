---
sidebar_label: 'Руководство по миграции'
slug: /migrations/snowflake
description: 'Переход с Snowflake на ClickHouse'
keywords: ['Snowflake']
title: 'Переход с Snowflake на ClickHouse'
show_related_blogs: false
doc_type: 'guide'
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';
import Image from '@theme/IdealImage';


# Миграция из Snowflake в ClickHouse

> В этом руководстве описывается процесс миграции данных из Snowflake в ClickHouse.

Для миграции данных между Snowflake и ClickHouse необходимо использовать объектное хранилище,
например S3, в качестве промежуточного хранилища для передачи данных. Процесс миграции также
предполагает использование команды `COPY INTO` в Snowflake и `INSERT INTO SELECT`
в ClickHouse.

<VerticalStepper headerLevel="h2">


## Экспорт данных из Snowflake {#1-exporting-data-from-snowflake}

<Image
  img={migrate_snowflake_clickhouse}
  size='md'
  alt='Миграция из Snowflake в ClickHouse'
/>

Для экспорта данных из Snowflake необходимо использовать внешнее промежуточное хранилище (external stage), как показано на диаграмме выше.

Предположим, что нам нужно экспортировать таблицу Snowflake со следующей схемой:

```sql
CREATE TABLE MYDATASET (
   timestamp TIMESTAMP,
   some_text varchar,
   some_file OBJECT,
   complex_data VARIANT,
) DATA_RETENTION_TIME_IN_DAYS = 0;
```

Чтобы перенести данные этой таблицы в базу данных ClickHouse, сначала необходимо скопировать их во внешнее промежуточное хранилище. При копировании данных мы рекомендуем использовать Parquet в качестве промежуточного формата, так как он позволяет передавать информацию о типах данных, сохраняет точность, обеспечивает хорошее сжатие и нативно поддерживает вложенные структуры, часто встречающиеся в аналитике.

В примере ниже мы создаем именованный формат файла в Snowflake для представления Parquet с нужными параметрами. Затем указываем бакет, в который будет скопирован набор данных. И наконец, копируем набор данных в бакет.

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- Создаем внешнее промежуточное хранилище, указывающее на S3-бакет для копирования
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- Применяем префикс "mydataset" ко всем файлам и указываем максимальный размер файла 150 МБ
-- Параметр `header=true` необходим для получения имен столбцов
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

Для набора данных объемом около 5 ТБ с максимальным размером файла 150 МБ при использовании хранилища Snowflake размера 2X-Large, расположенного в том же регионе AWS `us-east-1`, копирование данных в S3-бакет займет около 30 минут.


## Импорт в ClickHouse {#2-importing-to-clickhouse}

После размещения данных в промежуточном объектном хранилище для вставки данных в таблицу можно использовать функции ClickHouse, такие как [табличная функция s3](/sql-reference/table-functions/s3), как показано ниже.

В этом примере используется [табличная функция s3](/sql-reference/table-functions/s3) для AWS S3, но для Google Cloud Storage можно использовать [табличную функцию gcs](/sql-reference/table-functions/gcs), а для Azure Blob Storage — [табличную функцию azureBlobStorage](/sql-reference/table-functions/azureBlobStorage).

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

Затем можно использовать команду `INSERT INTO SELECT` для вставки данных из S3 в таблицу ClickHouse:

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
SETTINGS input_format_null_as_default = 1, -- Обеспечивает вставку значений по умолчанию в столбцы, если значения равны null
input_format_parquet_case_insensitive_column_matching = 1 -- Сопоставление столбцов между исходными данными и целевой таблицей выполняется без учета регистра
```

:::note Примечание о вложенных структурах столбцов
Столбцы `VARIANT` и `OBJECT` в исходной схеме таблицы Snowflake по умолчанию выводятся как JSON-строки, что требует их приведения типов при вставке в ClickHouse.

Вложенные структуры, такие как `some_file`, преобразуются Snowflake в JSON-строки при копировании. Для импорта этих данных необходимо преобразовать эти структуры в кортежи (Tuples) во время вставки в ClickHouse с помощью [функции JSONExtract](/sql-reference/functions/json-functions#JSONExtract), как показано выше.
:::


## Проверка успешного экспорта данных {#3-testing-successful-data-export}

Чтобы проверить, что данные были корректно вставлены, просто выполните запрос `SELECT` к новой таблице:

```sql
SELECT * FROM mydataset LIMIT 10;
```

</VerticalStepper>
