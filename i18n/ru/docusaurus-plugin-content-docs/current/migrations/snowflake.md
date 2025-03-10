---
sidebar_label: Snowflake
sidebar_position: 20
slug: /migrations/snowflake
description: Миграция из Snowflake в ClickHouse
keywords: [migrate, migration, migrating, data, etl, elt, snowflake]
---

import migrate_snowflake_clickhouse from '@site/static/images/migrations/migrate_snowflake_clickhouse.png';


# Миграция из Snowflake в ClickHouse

Этот гайд показывает, как мигрировать данные из Snowflake в ClickHouse.

Миграция данных между Snowflake и ClickHouse требует использования объектного хранилища, такого как S3, в качестве промежуточного хранилища для передачи. Процесс миграции также зависит от использования команд `COPY INTO` из Snowflake и `INSERT INTO SELECT` в ClickHouse.

## 1. Экспорт данных из Snowflake {#1-exporting-data-from-snowflake}

<img src={migrate_snowflake_clickhouse} class="image" alt="Миграция из Snowflake в ClickHouse" style={{width: '600px', marginBottom: '20px', textAlign: 'left'}} />

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

В приведенном ниже примере мы создаем именованный формат файла в Snowflake для представления Parquet и желаемых параметров файла. Затем мы указываем, какой бакет будет содержать наш скопированный набор данных. Наконец, мы копируем набор данных в бакет.

```sql
CREATE FILE FORMAT my_parquet_format TYPE = parquet;

-- Создайте внешнюю стадию, указывающую S3 бакет для копирования
CREATE OR REPLACE STAGE external_stage
URL='s3://mybucket/mydataset'
CREDENTIALS=(AWS_KEY_ID='<key>' AWS_SECRET_KEY='<secret>')
FILE_FORMAT = my_parquet_format;

-- Примените префикс "mydataset" ко всем файлам и укажите максимальный размер файла 150MB
-- Параметр `header=true` необходим для получения имен колонок
COPY INTO @external_stage/mydataset from mydataset max_file_size=157286400 header=true;
```

Для набора данных объемом около 5TB с максимальным размером файла 150MB и использованием склада Snowflake размером 2X-Large, расположенного в том же AWS регионе `us-east-1`, копирование данных в S3 бакет займет около 30 минут.

## 2. Импорт в ClickHouse {#2-importing-to-clickhouse}

Как только данные помещены в промежуточное объектное хранилище, функции ClickHouse, такие как [функция таблицы s3](/sql-reference/table-functions/s3), могут быть использованы для вставки данных в таблицу, как показано ниже.

В этом примере используется [функция таблицы s3](/sql-reference/table-functions/s3) для AWS S3, но [функция таблицы gcs](/sql-reference/table-functions/gcs) может быть использована для Google Cloud Storage, а [функция таблицы azureBlobStorage](/sql-reference/table-functions/azureBlobStorage) может быть использована для Azure Blob Storage.

Предположим, что у нас схема целевой таблицы следующая:

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

Теперь мы можем использовать команду `INSERT INTO SELECT`, чтобы вставить данные из S3 в таблицу ClickHouse:

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
SETTINGS input_format_null_as_default = 1, -- Убедитесь, что колонки вставляются как значения по умолчанию, если значения null
input_format_parquet_case_insensitive_column_matching = 1 -- Совпадение колонок между исходными данными и целевой таблицей должно игнорировать регистр
```

:::note Примечание о вложенных структурах колонок
Колонки `VARIANT` и `OBJECT` в оригинальной схеме таблицы Snowflake будут выводиться как JSON строки по умолчанию, что заставляет нас приводить их к нужному типу при вставке в ClickHouse.

Вложенные структуры, такие как `some_file`, конвертируются в JSON строки при копировании в Snowflake. Импорт этих данных требует трансформации этих структур в Tuples во время вставки в ClickHouse, используя [функцию JSONExtract](/sql-reference/functions/json-functions#jsonextract), как показано выше.
:::

## 3. Тестирование успешного экспорта данных {#3-testing-successful-data-export}

Чтобы проверить, были ли ваши данные правильно вставлены, просто выполните запрос `SELECT` на вашей новой таблице:

```sql
SELECT * FROM mydataset limit 10;
```

## Дополнительные материалы и поддержка {#further-reading-and-support}

Кроме этого руководства, мы также рекомендуем прочитать нашу статью в блоге [сравнение Snowflake и ClickHouse](https://clickhouse.com/blog/clickhouse-vs-snowflake-for-real-time-analytics-comparison-migration-guide).

Если у вас возникли проблемы с передачей данных из Snowflake в ClickHouse, пожалуйста, свяжитесь с нами по адресу support@clickhouse.com.
