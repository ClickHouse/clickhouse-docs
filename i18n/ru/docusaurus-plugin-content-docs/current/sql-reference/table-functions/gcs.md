---
description: 'Предоставляет интерфейс в виде таблицы для `SELECT` и `INSERT` данных из Google Cloud Storage. Требуется роль IAM `Storage Object User`.'
keywords: ['gcs', 'bucket']
sidebar_label: 'gcs'
sidebar_position: 70
slug: /sql-reference/table-functions/gcs
title: 'gcs'
---


# gcs Табличная Функция

Предоставляет интерфейс в виде таблицы для `SELECT` и `INSERT` данных из [Google Cloud Storage](https://cloud.google.com/storage/). Требуется роль IAM [`Storage Object User`](https://cloud.google.com/storage/docs/access-control/iam-roles).

Это псевдоним для [табличной функции s3](../../sql-reference/table-functions/s3.md).

Если у вас есть несколько реплик в вашем кластере, вы можете использовать [функцию s3Cluster](../../sql-reference/table-functions/s3Cluster.md) (которая работает с GCS) для параллелизации вставок.

**Синтаксис**

```sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
Глобальная таблица GCS интегрируется с Google Cloud Storage, используя XML API GCS и HMAC ключи. См. [документацию о совместимости Google]( https://cloud.google.com/storage/docs/interoperability) для получения более подробной информации о конечной точке и HMAC.

:::

**Параметры**

- `url` — Путь к файлу в ведре. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, а `'abc'`, `'def'` — строки.
  :::note GCS
  Путь GCS имеет следующий формат, так как конечная точка для Google XML API отличается от JSON API:
```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
  ```
  а не ~~https://storage.cloud.google.com~~.
  :::
- `NOSIGN` — Если это ключевое слово указано вместо учетных данных, все запросы не будут подписаны.
- `hmac_key` и `hmac_secret` — Ключи, которые указывают учетные данные, используемые с данной конечной точкой. Необязательные.
- `format` — [формат](/sql-reference/formats) файла.
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.
- `compression_method` — Параметр является необязательным. Поддерживаемые значения: `none`, `gzip` или `gz`, `brotli` или `br`, `xz` или `LZMA`, `zstd` или `zst`. По умолчанию он автоматически определяет метод сжатия по расширению файла.

Аргументы также могут передаваться с помощью [именованных коллекций](operations/named-collections.md). В этом случае `url`, `format`, `structure`, `compression_method` работают так же, а также поддерживаются некоторые дополнительные параметры:

 - `access_key_id` — `hmac_key`, необязательный.
 - `secret_access_key` — `hmac_secret`, необязательный.
 - `filename` — добавляется к URL, если указан.
 - `use_environment_credentials` — включен по умолчанию, позволяет передавать дополнительные параметры с помощью переменных среды `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`.
 - `no_sign_request` — отключен по умолчанию.
 - `expiration_window_seconds` — значение по умолчанию 120.


**Возвращаемое значение**

Таблица с указанной структурой для чтения или записи данных в указанный файл.

**Примеры**

Выбор первых двух строк из таблицы из GCS файла `https://storage.googleapis.com/my-test-bucket-768/data.csv`:

```sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

Аналогично, но из файла с методом сжатия `gzip`:

```sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32', 'gzip')
LIMIT 2;
```

```text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

## Использование {#usage}

Предположим, что у нас есть несколько файлов со следующими URI на GCS:

-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv'
-   'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv'

Посчитаем количество строк в файлах, заканчивающихся на числа от 1 до 3:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      18 │
└─────────┘
```

Посчитаем общее количество строк во всех файлах в этих двух директориях:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/*', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      24 │
└─────────┘
```

:::warning
Если ваш список файлов содержит диапазоны чисел с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

Посчитаем общее количество строк в файлах с именами `file-000.csv`, `file-001.csv`, ... , `file-999.csv`:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

```text
┌─count()─┐
│      12 │
└─────────┘
```

Вставим данные в файл `test-data.csv.gz`:

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

Вставим данные в файл `test-data.csv.gz` из существующей таблицы:

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

Глобальное ** может быть использовано для рекурсивного обхода директорий. Рассмотрим следующий пример, он извлечет все файлы из директории `my-test-bucket-768` рекурсивно:

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

Следующий запрос получает данные из всех файлах `test-data.csv.gz` из любой папки в директории `my-test-bucket` рекурсивно:

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

Для производственных случаев рекомендуется использовать [именованные коллекции](operations/named-collections.md). Вот пример:
```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```

## Запись по Партиям {#partitioned-write}

Если вы укажете выражение `PARTITION BY` при вставке данных в таблицу `GCS`, для каждого значения партиции будет создан отдельный файл. Разделение данных на отдельные файлы помогает улучшить эффективность операций чтения.

**Примеры**

1. Использование ID партиции в ключе создает отдельные файлы:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```
В результате данные записываются в три файла: `file_x.csv`, `file_y.csv` и `file_z.csv`.

2. Использование ID партиции в имени ведра создает файлы в разных ведрах:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```
В результате данные записываются в три файла в разных ведрах: `my_bucket_1/file.csv`, `my_bucket_10/file.csv` и `my_bucket_20/file.csv`.

**Смотри также**

-   [Табличная функция S3](s3.md)
-   [Движок S3](../../engines/table-engines/integrations/s3.md)
