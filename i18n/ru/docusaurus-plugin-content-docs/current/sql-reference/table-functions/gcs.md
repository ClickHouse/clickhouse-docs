---
slug: /sql-reference/table-functions/gcs
sidebar_position: 70
sidebar_label: gcs
keywords: [gcs, bucket]
title: "gcs"
description: "Предоставляет интерфейс, похожий на таблицу, для `SELECT` и `INSERT` данных из Google Cloud Storage. Требует роль IAM `Storage Object User`."
---


# Функция таблицы gcs

Предоставляет интерфейс, похожий на таблицу, для `SELECT` и `INSERT` данных из [Google Cloud Storage](https://cloud.google.com/storage/). Требует роль IAM [`Storage Object User`](https://cloud.google.com/storage/docs/access-control/iam-roles).

Это псевдоним для [функции таблицы s3](../../sql-reference/table-functions/s3.md).

Если у вас есть несколько реплик в кластере, вы можете использовать [функцию s3Cluster](../../sql-reference/table-functions/s3Cluster.md) (которая работает с GCS) для параллелизации вставок.

**Синтаксис**

``` sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
Функция таблицы GCS интегрируется с Google Cloud Storage, используя XML API GCS и HMAC ключи. Смотрите [документацию по совместимости Google](https://cloud.google.com/storage/docs/interoperability) для получения дополнительной информации о конечной точке и HMAC.

:::

**Параметры**

- `url` — Путь к файлу в корзине. Поддерживает следующие шаблоны в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.
  :::note GCS
  Путь GCS имеет следующий формат, так как конечная точка для Google XML API отличается от JSON API:
```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
  ```
  а не ~~https://storage.cloud.google.com~~.
  :::
- `NOSIGN` — Если это ключевое слово указано вместо учетных данных, все запросы не будут подписаны.
- `hmac_key` и `hmac_secret` — Ключи, определяющие учетные данные для использования с указанной конечной точкой. Необязательно.
- `format` — [формат](/sql-reference/formats) файла.
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.
- `compression_method` — Параметр является необязательным. Поддерживаемые значения: `none`, `gzip` или `gz`, `brotli` или `br`, `xz` или `LZMA`, `zstd` или `zst`. По умолчанию метод сжатия будет автоматически определен по расширению файла.

Аргументы также могут передаваться с использованием [именованных коллекций](operations/named-collections.md). В этом случае `url`, `format`, `structure`, `compression_method` работают аналогичным образом, и поддерживаются дополнительные параметры:

 - `access_key_id` — `hmac_key`, необязателен.
 - `secret_access_key` — `hmac_secret`, необязателен.
 - `filename` — добавляется к URL, если указано.
 - `use_environment_credentials` — включен по умолчанию, позволяет передавать дополнительные параметры с помощью переменных окружения `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`.
 - `no_sign_request` — отключен по умолчанию.
 - `expiration_window_seconds` — значение по умолчанию равно 120.


**Возвращаемое значение**

Таблица со специфицированной структурой для чтения или записи данных в указанный файл.

**Примеры**

Выбор первых двух строк из таблицы из файла GCS `https://storage.googleapis.com/my-test-bucket-768/data.csv`:

``` sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
LIMIT 2;
```

``` text
┌─column1─┬─column2─┬─column3─┐
│       1 │       2 │       3 │
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```

Аналогично, но из файла с методом сжатия `gzip`:

``` sql
SELECT *
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/data.csv.gz', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32', 'gzip')
LIMIT 2;
```

``` text
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

Посчитаем количество строк в файлах, которые заканчиваются числами от 1 до 3:

``` sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

``` text
┌─count()─┐
│      18 │
└─────────┘
```

Посчитаем общее количество строк во всех файлах в этих двух директориях:

``` sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/*', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

``` text
┌─count()─┐
│      24 │
└─────────┘
```

:::warning
Если ваш список файлов содержит числовые диапазоны сLeading нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

Посчитаем общее количество строк в файлах с именами `file-000.csv`, `file-001.csv`, ... , `file-999.csv`:

``` sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

``` text
┌─count()─┐
│      12 │
└─────────┘
```

Вставка данных в файл `test-data.csv.gz`:

``` sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

Вставка данных в файл `test-data.csv.gz` из существующей таблицы:

``` sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

Шаблон ** может использоваться для рекурсивного обхода каталогов. Рассмотрим следующий пример, он получит все файлы из каталога `my-test-bucket-768` рекурсивно:

``` sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

Следующий запрос получит данные из всех файлов `test-data.csv.gz` из любой папки внутри директории `my-test-bucket` рекурсивно:

``` sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

Для производственных случаев рекомендуется использовать [именованные коллекции](operations/named-collections.md). Вот пример:
``` sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```

## Запись с разбиением {#partitioned-write}

Если вы указываете выражение `PARTITION BY` при вставке данных в таблицу `GCS`, для каждого значения партиции создается отдельный файл. Разделение данных на отдельные файлы помогает улучшить эффективность операций чтения.

**Примеры**

1. Использование идентификатора партиции в ключе создает отдельные файлы:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```
В результате данные записываются в три файла: `file_x.csv`, `file_y.csv` и `file_z.csv`.

2. Использование идентификатора партиции в имени корзины создает файлы в разных корзинах:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```
В результате данные записываются в три файла в разных корзинах: `my_bucket_1/file.csv`, `my_bucket_10/file.csv`, и `my_bucket_20/file.csv`.

**Смотрите также**

-   [Функция таблицы S3](s3.md)
-   [Движок S3](../../engines/table-engines/integrations/s3.md)
