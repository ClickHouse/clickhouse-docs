---
description: 'Предоставляет табличный интерфейс для выполнения операций `SELECT` и `INSERT` с данными в Google Cloud Storage. Требует роли IAM `Storage Object User`.'
keywords: ['gcs', 'bucket']
sidebar_label: 'gcs'
sidebar_position: 70
slug: /sql-reference/table-functions/gcs
title: 'gcs'
doc_type: 'reference'
---



# Табличная функция gcs

Предоставляет табличный интерфейс для команд `SELECT` и `INSERT` к данным в [Google Cloud Storage](https://cloud.google.com/storage/). Требуется роль IAM [`Storage Object User`](https://cloud.google.com/storage/docs/access-control/iam-roles).

Это псевдоним [табличной функции s3](../../sql-reference/table-functions/s3.md).

Если в вашем кластере несколько реплик, вы можете использовать [функцию s3Cluster](../../sql-reference/table-functions/s3Cluster.md) (которая также работает с GCS) для распараллеливания вставок.



## Синтаксис {#syntax}

```sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
Табличная функция GCS интегрируется с Google Cloud Storage с использованием GCS XML API и ключей HMAC.
Подробнее о конечной точке (endpoint) и HMAC см. в [документации Google по взаимодействию](https://cloud.google.com/storage/docs/interoperability).
:::


## Аргументы {#arguments}

| Аргумент                     | Описание                                                                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                        | Путь к файлу в бакете. Поддерживает следующие подстановочные символы в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.                       |
| `NOSIGN`                     | Если это ключевое слово указано вместо учетных данных, все запросы не будут подписываться.                                                                                                |
| `hmac_key` и `hmac_secret` | Ключи, задающие учетные данные для использования с указанной конечной точкой. Необязательные параметры.                                                                                                                      |
| `format`                     | [Формат](/sql-reference/formats) файла.                                                                                                                                        |
| `structure`                  | Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                            |
| `compression_method`         | Необязательный параметр. Поддерживаемые значения: `none`, `gzip` или `gz`, `brotli` или `br`, `xz` или `LZMA`, `zstd` или `zst`. По умолчанию метод сжатия определяется автоматически по расширению файла. |

:::note GCS
Путь GCS имеет следующий формат, поскольку конечная точка для Google XML API отличается от JSON API:

```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
```

а не ~~https://storage.cloud.google.com~~.
:::

Аргументы также можно передавать с помощью [именованных коллекций](operations/named-collections.md). В этом случае параметры `url`, `format`, `structure`, `compression_method` работают аналогично, и поддерживаются некоторые дополнительные параметры:

| Параметр                     | Описание                                                                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_key_id`               | `hmac_key`, необязательный параметр.                                                                                                                                                                                                             |
| `secret_access_key`           | `hmac_secret`, необязательный параметр.                                                                                                                                                                                                          |
| `filename`                    | Добавляется к url, если указан.                                                                                                                                                                                                 |
| `use_environment_credentials` | Включен по умолчанию, позволяет передавать дополнительные параметры через переменные окружения `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`. |
| `no_sign_request`             | Отключен по умолчанию.                                                                                                                                                                                                              |
| `expiration_window_seconds`   | Значение по умолчанию — 120.                                                                                                                                                                                                             |


## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения или записи данных в указанный файл.


## Примеры {#examples}

Выборка первых двух строк из файла GCS `https://storage.googleapis.com/my-test-bucket-768/data.csv`:

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

Аналогичный запрос, но для файла со сжатием `gzip`:

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

Предположим, что у нас есть несколько файлов со следующими URI в GCS:

- 'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv'
- 'https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv'

Подсчитаем количество строк в файлах, заканчивающихся числами от 1 до 3:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      18 │
└─────────┘
```

Подсчитаем общее количество строк во всех файлах в этих двух каталогах:

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
Если список файлов содержит диапазоны чисел с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

Подсчитаем общее количество строк в файлах с именами `file-000.csv`, `file-001.csv`, ... , `file-999.csv`:

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

Шаблон \*\* может использоваться для рекурсивного обхода каталогов. Рассмотрим пример ниже — он получит все файлы из каталога `my-test-bucket-768` рекурсивно:

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

Следующий запрос получает данные из всех файлов `test-data.csv.gz` из любой папки внутри каталога `my-test-bucket` рекурсивно:

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

Для производственного использования рекомендуется применять [именованные коллекции](operations/named-collections.md). Вот пример:

```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```


## Партиционированная запись {#partitioned-write}

Если при вставке данных в таблицу `GCS` указать выражение `PARTITION BY`, для каждого значения партиции будет создан отдельный файл. Разделение данных на отдельные файлы помогает повысить эффективность операций чтения.

**Примеры**

1. Использование идентификатора партиции в ключе создаёт отдельные файлы:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```

В результате данные записываются в три файла: `file_x.csv`, `file_y.csv` и `file_z.csv`.

2. Использование идентификатора партиции в имени бакета создаёт файлы в разных бакетах:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```

В результате данные записываются в три файла в разных бакетах: `my_bucket_1/file.csv`, `my_bucket_10/file.csv` и `my_bucket_20/file.csv`.


## Связанные разделы {#related}

- [Табличная функция S3](s3.md)
- [Движок S3](../../engines/table-engines/integrations/s3.md)
