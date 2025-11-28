---
description: 'Расширение табличной функции s3, позволяющее обрабатывать файлы
  из Amazon S3 и Google Cloud Storage параллельно на нескольких узлах указанного
  кластера.'
sidebar_label: 's3Cluster'
sidebar_position: 181
slug: /sql-reference/table-functions/s3Cluster
title: 's3Cluster'
doc_type: 'reference'
---



# Табличная функция s3Cluster

Это расширение табличной функции [s3](sql-reference/table-functions/s3.md).

Позволяет обрабатывать файлы из [Amazon S3](https://aws.amazon.com/s3/) и [Google Cloud Storage](https://cloud.google.com/storage/) параллельно на нескольких узлах заданного кластера. На узле-инициаторе она устанавливает соединение со всеми узлами кластера, раскрывает шаблоны с использованием символа `*` в путях к файлам S3 и динамически распределяет каждый файл. На рабочем узле она запрашивает у инициатора следующую задачу для обработки и обрабатывает её. Это повторяется до тех пор, пока все задачи не будут выполнены.



## Синтаксис

```sql
s3Cluster(cluster_name, url[, NOSIGN | access_key_id, secret_access_key,[session_token]][, format][, structure][, compression_method][, headers][, extra_credentials])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```


## Аргументы {#arguments}

| Argument                              | Description                                                                                                                                                                                             |
|---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                        | Имя кластера, которое используется для построения набора адресов и параметров подключения к удалённым и локальным серверам.                                                                            |
| `url`                                 | Путь к файлу или набору файлов. Поддерживает следующие шаблоны в режиме только для чтения: `*`, `**`, `?`, `{'abc','def'}` и `{N..M}`, где `N`, `M` — числа, `abc`, `def` — строки. Для получения дополнительной информации см. [Wildcards In Path](../../engines/table-engines/integrations/s3.md#wildcards-in-path). |
| `NOSIGN`                              | Если это ключевое слово указано вместо учётных данных, все запросы будут выполняться без подписи.                                                                                                      |
| `access_key_id` and `secret_access_key` | Ключи, задающие учётные данные для использования с указанным endpoint’ом. Необязательные.                                                                                                              |
| `session_token`                       | Сессионный токен для использования с указанными ключами. Необязателен при передаче ключей.                                                                                                             |
| `format`                              | [Формат](/sql-reference/formats) файла.                                                                                                                                                                |
| `structure`                           | Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                              |
| `compression_method`                  | Необязательный параметр. Поддерживаемые значения: `none`, `gzip` или `gz`, `brotli` или `br`, `xz` или `LZMA`, `zstd` или `zst`. По умолчанию метод сжатия определяется автоматически по расширению файла. |
| `headers`                             | Необязательный параметр. Позволяет передавать заголовки в запросе к S3. Передавайте их в формате `headers(key=value)`, например `headers('x-amz-request-payer' = 'requester')`. Пример использования см. [здесь](/sql-reference/table-functions/s3#accessing-requester-pays-buckets). |
| `extra_credentials`                   | Необязательный параметр. `roleARN` может быть передан через этот параметр. Пример см. [здесь](/cloud/data-sources/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role).                     |

Аргументы также могут быть переданы с использованием [именованных коллекций](operations/named-collections.md). В этом случае `url`, `access_key_id`, `secret_access_key`, `format`, `structure`, `compression_method` работают тем же образом, а также поддерживаются некоторые дополнительные параметры:

| Argument                       | Description                                                                                                                                                                                                                       |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `filename`                     | Добавляется к `url`, если указан.                                                                                                                                                                                                |
| `use_environment_credentials`  | Включён по умолчанию, позволяет передавать дополнительные параметры с помощью переменных окружения `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`. |
| `no_sign_request`              | По умолчанию отключён.                                                                                                                                                                                                           |
| `expiration_window_seconds`    | Значение по умолчанию — 120.                                                                                                                                                                                                     |



## Возвращаемое значение {#returned_value}

Таблица заданной структуры, используемая для чтения или записи данных в указанный файл.



## Примеры

Выберите данные из всех файлов в каталогах `/root/data/clickhouse` и `/root/data/database/`, используя все узлы кластера `cluster_simple`:

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

Подсчитайте общее количество строк во всех файлах в кластере `cluster_simple`:

:::tip
Если ваш список файлов содержит числовые диапазоны с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры по отдельности или символ `?`.
:::

Для боевых сценариев использования рекомендуется применять [именованные коллекции](operations/named-collections.md). Вот пример:

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

Пользователи могут использовать те же подходы, что и описанные для функции S3 [здесь](/sql-reference/table-functions/s3#accessing-public-buckets).



## Оптимизация производительности {#optimizing-performance}

Подробнее об оптимизации производительности функции s3 читайте в [нашем подробном руководстве](/integrations/s3/performance).



## Связанные разделы {#related}

- [Движок S3](../../engines/table-engines/integrations/s3.md)
- [Табличная функция S3](../../sql-reference/table-functions/s3.md)
