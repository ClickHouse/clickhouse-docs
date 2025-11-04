---
slug: '/sql-reference/table-functions/s3Cluster'
sidebar_label: s3Cluster
sidebar_position: 181
description: 'Расширение для функции таблицы s3, которое позволяет обрабатывать'
title: s3Cluster
doc_type: reference
---
# s3Cluster Табличная Функция

Это расширение для табличной функции [s3](sql-reference/table-functions/s3.md).

Позволяет обрабатывать файлы из [Amazon S3](https://aws.amazon.com/s3/) и Google Cloud Storage [Google Cloud Storage](https://cloud.google.com/storage/) параллельно с множеством узлов в указанном кластере. На инициаторе создается соединение со всеми узлами кластера, раскрываются знаки звездочки в пути к файлу S3 и динамически распределяются каждый файл. На рабочем узле он запрашивает у инициатора следующую задачу для обработки и выполняет её. Это повторяется, пока все задачи не будут завершены.

## Синтаксис {#syntax}

```sql
s3Cluster(cluster_name, url[, NOSIGN | access_key_id, secret_access_key,[session_token]][, format][, structure][, compression_method][, headers][, extra_credentials])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```

## Аргументы {#arguments}

| Аргумент                             | Описание                                                                                                                                                                                               |
|--------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                       | Название кластера, который используется для формирования набора адресов и параметров соединения с удаленными и локальными серверами.                                                                    |
| `url`                                | Путь к файлу или множеству файлов. Поддерживает следующие шаблоны в режиме только для чтения: `*`, `**`, `?`, `{'abc','def'}` и `{N..M}`, где `N`, `M` — числа, `abc`, `def` — строки. Для получения дополнительной информации смотрите [Шаблоны в Путях](../../engines/table-engines/integrations/s3.md#wildcards-in-path). |
| `NOSIGN`                             | Если это ключевое слово указано вместо учетных данных, все запросы не будут подписаны.                                                                                                               |
| `access_key_id` и `secret_access_key` | Ключи, которые указывают учетные данные для использования с заданной конечной точкой. Обязательный параметр.                                                                                          |
| `session_token`                      | Токен сессии для использования с заданными ключами. Опционально при передаче ключей.                                                                                                                  |
| `format`                             | [формат](/sql-reference/formats) файла.                                                                                                                                                                  |
| `structure`                          | Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                             |
| `compression_method`                 | Параметр опциональный. Поддерживаемые значения: `none`, `gzip` или `gz`, `brotli` или `br`, `xz` или `LZMA`, `zstd` или `zst`. По умолчанию, метод сжатия будет определен автоматически по расширению файла.                 |
| `headers`                            | Параметр опциональный. Позволяет передать заголовки в запрос S3. Передавайте в формате `headers(key=value)` например `headers('x-amz-request-payer' = 'requester')`. Смотрите [здесь](/sql-reference/table-functions/s3#accessing-requester-pays-buckets) пример использования. |
| `extra_credentials`                  | Опционально. `roleARN` можно передать через этот параметр. Смотрите [здесь](/cloud/security/secure-s3#access-your-s3-bucket-with-the-clickhouseaccess-role) пример.                                         |

Аргументы также могут быть переданы с использованием [именованных коллекций](operations/named-collections.md). В этом случае параметры `url`, `access_key_id`, `secret_access_key`, `format`, `structure`, `compression_method` работают аналогично, и поддерживаются дополнительные параметры:

| Аргумент                       | Описание                                                                                                                                                                                                                      |
|--------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `filename`                     | добавляется к url, если указан.                                                                                                                                                                                              |
| `use_environment_credentials`  | включено по умолчанию, позволяет передавать дополнительные параметры с использованием переменных окружения `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`. |
| `no_sign_request`              | отключено по умолчанию.                                                                                                                                                                                                      |
| `expiration_window_seconds`    | значение по умолчанию 120.                                                                                                                                                                                                    |

## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения или записи данных в указанном файле.

## Примеры {#examples}

Выбор данных из всех файлов в папках `/root/data/clickhouse` и `/root/data/database/`, используя все узлы в кластере `cluster_simple`:

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

Подсчет общего количества строк во всех файлах в кластере `cluster_simple`:

:::tip
Если ваш список файлов содержит числовые диапазоны с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

Для производственных случаев рекомендуется использовать [именованные коллекции](operations/named-collections.md). Вот пример:
```sql

CREATE NAMED COLLECTION creds AS
        access_key_id = 'minio',
        secret_access_key = 'ClickHouse_Minio_P@ssw0rd';
SELECT count(*) FROM s3Cluster(
    'cluster_simple', creds, url='https://s3-object-url.csv',
    format='CSV', structure='name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
)
```

## Доступ к приватным и публичным корзинам {#accessing-private-and-public-buckets}

Пользователи могут использовать те же подходы, что и в документе для функции s3 [здесь](/sql-reference/table-functions/s3#accessing-public-buckets).

## Оптимизация производительности {#optimizing-performance}

Для получения подробной информации о том, как оптимизировать производительность функции s3, смотрите [наш детальный гид](/integrations/s3/performance).

## Связано {#related}

- [S3 движок](../../engines/table-engines/integrations/s3.md)
- [s3 табличная функция](../../sql-reference/table-functions/s3.md)