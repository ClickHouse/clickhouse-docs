---
description: 'Расширение табличной функции s3, позволяющее обрабатывать файлы из Amazon S3 и Google Cloud Storage параллельно на нескольких узлах заданного кластера.'
sidebar_label: 's3Cluster'
sidebar_position: 181
slug: /sql-reference/table-functions/s3Cluster
title: 's3Cluster'
doc_type: 'reference'
---



# Табличная функция s3Cluster

Это расширение табличной функции [s3](sql-reference/table-functions/s3.md).

Позволяет обрабатывать файлы из [Amazon S3](https://aws.amazon.com/s3/) и [Google Cloud Storage](https://cloud.google.com/storage/) параллельно на множестве узлов в указанном кластере. На инициирующем узле создаётся соединение со всеми узлами кластера, раскрываются шаблоны с `*` в путях к файлам S3, и каждый файл динамически распределяется по узлам. Рабочий узел запрашивает у инициирующего узла следующую задачу и обрабатывает её. Это повторяется до завершения всех задач.



## Синтаксис {#syntax}

```sql
s3Cluster(cluster_name, url[, NOSIGN | access_key_id, secret_access_key,[session_token]][, format][, structure][, compression_method][, headers][, extra_credentials])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```


## Аргументы {#arguments}

| Аргумент                                | Описание                                                                                                                                                                                                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster_name`                          | Имя кластера, используемое для формирования набора адресов и параметров подключения к удалённым и локальным серверам.                                                                                                                                                                                 |
| `url`                                   | Путь к файлу или группе файлов. Поддерживает следующие подстановочные символы в режиме только для чтения: `*`, `**`, `?`, `{'abc','def'}` и `{N..M}`, где `N`, `M` — числа, `abc`, `def` — строки. Подробнее см. [Подстановочные символы в пути](../../engines/table-engines/integrations/s3.md#wildcards-in-path). |
| `NOSIGN`                                | Если это ключевое слово указано вместо учётных данных, все запросы не будут подписываться.                                                                                                                                                                                                         |
| `access_key_id` и `secret_access_key` | Ключи, определяющие учётные данные для использования с указанной конечной точкой. Необязательный параметр.                                                                                                                                                                                                               |
| `session_token`                         | Токен сеанса для использования с указанными ключами. Необязательный параметр при передаче ключей.                                                                                                                                                                                                                             |
| `format`                                | [Формат](/sql-reference/formats) файла.                                                                                                                                                                                                                                                 |
| `structure`                             | Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                     |
| `compression_method`                    | Необязательный параметр. Поддерживаемые значения: `none`, `gzip` или `gz`, `brotli` или `br`, `xz` или `LZMA`, `zstd` или `zst`. По умолчанию метод сжатия определяется автоматически по расширению файла.                                                                                                          |
| `headers`                               | Необязательный параметр. Позволяет передавать заголовки в запросе S3. Передаётся в формате `headers(key=value)`, например `headers('x-amz-request-payer' = 'requester')`. Пример использования см. [здесь](/sql-reference/table-functions/s3#accessing-requester-pays-buckets).                             |
| `extra_credentials`                     | Необязательный параметр. Через этот параметр можно передать `roleARN`. Пример см. [здесь](/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role).                                                                                                              |

Аргументы также можно передавать с использованием [именованных коллекций](operations/named-collections.md). В этом случае параметры `url`, `access_key_id`, `secret_access_key`, `format`, `structure`, `compression_method` работают аналогичным образом, а также поддерживаются некоторые дополнительные параметры:

| Argument                      | Description                                                                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filename`                    | Добавляется к URL, если указан.                                                                                                                                                                                                 |
| `use_environment_credentials` | Включён по умолчанию, позволяет передавать дополнительные параметры через переменные окружения `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`. |
| `no_sign_request`             | Отключён по умолчанию.                                                                                                                                                                                                              |
| `expiration_window_seconds`   | Значение по умолчанию — 120.                                                                                                                                                                                                             |


## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения или записи данных в указанный файл.


## Примеры {#examples}

Выборка данных из всех файлов в папках `/root/data/clickhouse` и `/root/data/database/` с использованием всех узлов кластера `cluster_simple`:

```sql
SELECT * FROM s3Cluster(
    'cluster_simple',
    'http://minio1:9001/root/data/{clickhouse,database}/*',
    'minio',
    'ClickHouse_Minio_P@ssw0rd',
    'CSV',
    'name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
) ORDER BY (name, value, polygon);
```

Подсчёт общего количества строк во всех файлах в кластере `cluster_simple`:

:::tip
Если список файлов содержит числовые диапазоны с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или символ `?`.
:::

Для использования в продакшене рекомендуется применять [именованные коллекции](operations/named-collections.md). Вот пример:

```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = 'minio',
        secret_access_key = 'ClickHouse_Minio_P@ssw0rd';
SELECT count(*) FROM s3Cluster(
    'cluster_simple', creds, url='https://s3-object-url.csv',
    format='CSV', structure='name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
)
```


## Доступ к приватным и публичным бакетам {#accessing-private-and-public-buckets}

Можно использовать те же подходы, что описаны для функции s3 [здесь](/sql-reference/table-functions/s3#accessing-public-buckets).


## Оптимизация производительности {#optimizing-performance}

Подробную информацию об оптимизации производительности функции s3 см. в [подробном руководстве](/integrations/s3/performance).


## Связанные разделы {#related}

- [Движок S3](../../engines/table-engines/integrations/s3.md)
- [Табличная функция s3](../../sql-reference/table-functions/s3.md)
