---
description: 'Предоставляет интерфейс, аналогичный таблице, для `SELECT` и `INSERT` данных из Google Cloud Storage. Требуется роль IAM `Storage Object User`.'
keywords: ['gcs', 'bucket']
sidebar_label: 'gcs'
sidebar_position: 70
slug: /sql-reference/table-functions/gcs
title: 'gcs'
doc_type: 'reference'
---



# Табличная функция gcs

Предоставляет табличный интерфейс для выполнения `SELECT` и `INSERT` данных из [Google Cloud Storage](https://cloud.google.com/storage/). Требуется роль IAM [`Storage Object User`](https://cloud.google.com/storage/docs/access-control/iam-roles).

Это псевдоним табличной функции [s3](../../sql-reference/table-functions/s3.md).

Если в вашем кластере несколько реплик, вы можете использовать [функцию s3Cluster](../../sql-reference/table-functions/s3Cluster.md) (которая работает с GCS) для параллельной вставки данных.



## Синтаксис

```sql
gcs(url [, NOSIGN | hmac_key, hmac_secret] [,format] [,structure] [,compression_method])
gcs(named_collection[, option=value [,..]])
```

:::tip GCS
Табличная функция GCS интегрируется с Google Cloud Storage с помощью GCS XML API и HMAC-ключей.
Дополнительные сведения об endpoint и HMAC см. в [документации по совместимости Google](https://cloud.google.com/storage/docs/interoperability).
:::


## Аргументы

| Аргумент                     | Описание                                                                                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                        | Путь к файлу в бакете. Поддерживает следующие шаблоны (wildcards) в режиме только для чтения: `*`, `**`, `?`, `{abc,def}` и `{N..M}`, где `N`, `M` — числа, `'abc'`, `'def'` — строки.       |
| `NOSIGN`                     | Если это ключевое слово указано вместо учетных данных, все запросы не будут подписываться.                                                                                                   |
| `hmac_key` and `hmac_secret` | Ключи учетных данных, используемые с указанной конечной точкой (endpoint). Необязательные.                                                                                                   |
| `format`                     | [Формат](/sql-reference/formats) файла.                                                                                                                                                      |
| `structure`                  | Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                     |
| `compression_method`         | Необязательный параметр. Поддерживаемые значения: `none`, `gzip` или `gz`, `brotli` или `br`, `xz` или `LZMA`, `zstd` или `zst`. По умолчанию метод сжатия определяется по расширению файла. |

:::note GCS
Путь GCS имеет следующий формат, так как endpoint для Google XML API отличается от JSON API:

```text
  https://storage.googleapis.com/<bucket>/<folder>/<filename(s)>
```

and not ~~[https://storage.cloud.google.com](https://storage.cloud.google.com)~~.
:::

Аргументы также могут передаваться с использованием [именованных коллекций](operations/named-collections.md). В этом случае `url`, `format`, `structure`, `compression_method` работают тем же образом, а также поддерживается несколько дополнительных параметров:

| Параметр                      | Описание                                                                                                                                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_key_id`               | `hmac_key`, необязательный параметр.                                                                                                                                                                                                                 |
| `secret_access_key`           | `hmac_secret`, необязательный параметр.                                                                                                                                                                                                              |
| `filename`                    | Добавляется к URL, если указан.                                                                                                                                                                                                                      |
| `use_environment_credentials` | Включён по умолчанию, позволяет передавать дополнительные параметры с помощью переменных окружения `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`. |
| `no_sign_request`             | Отключён по умолчанию.                                                                                                                                                                                                                               |
| `expiration_window_seconds`   | Значение по умолчанию — 120.                                                                                                                                                                                                                         |


## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения данных из указанного файла или записи данных в него.



## Примеры

Выбор первых двух строк таблицы из файла в GCS `https://storage.googleapis.com/my-test-bucket-768/data.csv`:

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

То же самое, но из файла, сжатого с помощью `gzip`:

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


## Использование

Предположим, что у нас есть несколько файлов со следующими URI в GCS:

* &#39;[https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;1.csv](https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_1.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;2.csv](https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_2.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;3.csv](https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_3.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/some&#95;prefix/some&#95;file&#95;4.csv](https://storage.googleapis.com/my-test-bucket-768/some_prefix/some_file_4.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;1.csv](https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_1.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;2.csv](https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_2.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;3.csv](https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_3.csv)&#39;
* &#39;[https://storage.googleapis.com/my-test-bucket-768/another&#95;prefix/some&#95;file&#95;4.csv](https://storage.googleapis.com/my-test-bucket-768/another_prefix/some_file_4.csv)&#39;

Подсчитаем количество строк в файлах, имена которых оканчиваются на цифры от 1 до 3:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/{some,another}_prefix/some_file_{1..3}.csv', 'CSV', 'column1 UInt32, column2 UInt32, column3 UInt32')
```

```text
┌─count()─┐
│      18 │
└─────────┘
```

Подсчитайте суммарное количество строк во всех файлах из этих двух каталогов:

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
Если в перечне файлов встречаются числовые диапазоны с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры по отдельности или символ `?`.
:::

Подсчитайте общее количество строк в файлах с именами `file-000.csv`, `file-001.csv`, ... , `file-999.csv`:

```sql
SELECT count(*)
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/my-test-bucket-768/big_prefix/file-{000..999}.csv', 'CSV', 'name String, value UInt32');
```

```text
┌─count()─┐
│      12 │
└─────────┘
```

Запишите данные в файл `test-data.csv.gz`:

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
VALUES ('test-data', 1), ('test-data-2', 2);
```

Выгрузите данные из существующей таблицы в файл `test-data.csv.gz`:

```sql
INSERT INTO FUNCTION gcs('https://storage.googleapis.com/my-test-bucket-768/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip')
SELECT name, value FROM existing_table;
```

Глоб-шаблон ** можно использовать для рекурсивного обхода каталогов. Рассмотрим следующий пример: он рекурсивно получит все файлы из каталога `my-test-bucket-768`:

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**', 'CSV', 'name String, value UInt32', 'gzip');
```

Приведённый ниже пример получает данные из всех файлов `test-data.csv.gz` во всех вложенных папках каталога `my-test-bucket` (рекурсивно):

```sql
SELECT * FROM gcs('https://storage.googleapis.com/my-test-bucket-768/**/test-data.csv.gz', 'CSV', 'name String, value UInt32', 'gzip');
```

Для продакшена рекомендуется использовать [именованные коллекции](operations/named-collections.md). Вот пример:

```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = '***',
        secret_access_key = '***';
SELECT count(*)
FROM gcs(creds, url='https://s3-object-url.csv')
```


## Партиционированная запись

Если при вставке данных в таблицу `GCS` указано выражение `PARTITION BY`, для каждого значения партиции создаётся отдельный файл. Разделение данных на отдельные файлы помогает повысить эффективность операций чтения.

**Примеры**

1. Использование идентификатора партиции в ключе создаёт отдельные файлы:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket/file_{_partition_id}.csv', 'CSV', 'a String, b UInt32, c UInt32')
    PARTITION BY a VALUES ('x', 2, 3), ('x', 4, 5), ('y', 11, 12), ('y', 13, 14), ('z', 21, 22), ('z', 23, 24);
```

В результате данные записываются в три файла: `file_x.csv`, `file_y.csv` и `file_z.csv`.

2. Использование идентификатора партиции в имени бакета приводит к созданию файлов в разных бакетах:

```sql
INSERT INTO TABLE FUNCTION
    gcs('http://bucket.amazonaws.com/my_bucket_{_partition_id}/file.csv', 'CSV', 'a UInt32, b UInt32, c UInt32')
    PARTITION BY a VALUES (1, 2, 3), (1, 4, 5), (10, 11, 12), (10, 13, 14), (20, 21, 22), (20, 23, 24);
```

В результате данные записываются в три файла в разных бакетах: `my_bucket_1/file.csv`, `my_bucket_10/file.csv` и `my_bucket_20/file.csv`.


## См. также {#related}
- [Табличная функция S3](s3.md)
- [Движок таблицы S3](../../engines/table-engines/integrations/s3.md)
