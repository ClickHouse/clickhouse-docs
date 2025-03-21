---
slug: /sql-reference/table-functions/s3Cluster
sidebar_position: 181
sidebar_label: s3Cluster
title: "s3Cluster"
description: "Расширение функции таблицы s3, которое позволяет обрабатывать файлы из Amazon S3 и Google Cloud Storage параллельно с использованием нескольких узлов в заданном кластере."
---


# Функция таблицы s3Cluster

Это расширение функции таблицы [s3](sql-reference/table-functions/s3.md).

Позволяет обрабатывать файлы из [Amazon S3](https://aws.amazon.com/s3/) и Google Cloud Storage [Google Cloud Storage](https://cloud.google.com/storage/) параллельно с использованием нескольких узлов в заданном кластере. На инициаторе устанавливается соединение со всеми узлами в кластере, раскрываются подстановочные знаки в пути к файлам S3 и динамически распределяются файлы. На рабочем узле он запрашивает у инициатора следующую задачу для обработки и выполняет ее. Это повторяется, пока все задания не будут завершены.

**Синтаксис**

``` sql
s3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,structure] [,compression_method],[,headers])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```

**Аргументы**

- `cluster_name` — Имя кластера, которое используется для создания набора адресов и параметров подключения к удаленным и локальным серверам.
- `url` — путь к файлу или группе файлов. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `**`, `?`, `{'abc','def'}` и `{N..M}`, где `N`, `M` — числа, `abc`, `def` — строки. Для получения дополнительной информации см. [Подстановочные знаки в пути](../../engines/table-engines/integrations/s3.md#wildcards-in-path).
- `NOSIGN` — Если это ключевое слово указано вместо учетных данных, все запросы не будут подписаны.
- `access_key_id` и `secret_access_key` — Ключи, которые указывают учетные данные, используемые с заданной конечной точкой. Необязательно.
- `session_token` - Токен сессии для использования с указанными ключами. Необязательно при передаче ключей.
- `format` — Формат [файла](/sql-reference/formats).
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.
- `compression_method` — Параметр является необязательным. Поддерживаемые значения: `none`, `gzip` или `gz`, `brotli` или `br`, `xz` или `LZMA`, `zstd` или `zst`. По умолчанию будет автоматически определен метод сжатия по расширению файла.
- `headers` - Параметр является необязательным. Позволяет передавать заголовки в запрос S3. Указывайте в формате `headers(key=value)` например `headers('x-amz-request-payer' = 'requester')`. См. [здесь](/sql-reference/table-functions/s3#accessing-requester-pays-buckets) для примера использования.

Аргументы также можно передавать с использованием [именованных коллекций](operations/named-collections.md). В этом случае `url`, `access_key_id`, `secret_access_key`, `format`, `structure`, `compression_method` работают аналогичным образом, и поддерживаются некоторые дополнительные параметры:

 - `filename` — добавляется к url, если указан.
 - `use_environment_credentials` — включен по умолчанию, позволяет передавать дополнительные параметры с использованием переменных окружения `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`.
 - `no_sign_request` — отключен по умолчанию.
 - `expiration_window_seconds` — значение по умолчанию составляет 120.

**Возвращаемое значение**

Таблица с заданной структурой для чтения или записи данных в указанный файл.

**Примеры**

Выбор данных из всех файлов в папках `/root/data/clickhouse` и `/root/data/database/`, используя все узлы в кластере `cluster_simple`:

``` sql
SELECT * FROM s3Cluster(
    'cluster_simple',
    'http://minio1:9001/root/data/{clickhouse,database}/*',
    'minio',
    'minio123',
    'CSV',
    'name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
) ORDER BY (name, value, polygon);
```

Подсчет общего количества строк во всех файлах в кластере `cluster_simple`:

:::tip
Если ваш список файлов содержит диапазоны чисел с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

Для производственных случаев рекомендуется использовать [именованные коллекции](operations/named-collections.md). Вот пример:
``` sql

CREATE NAMED COLLECTION creds AS
        access_key_id = 'minio',
        secret_access_key = 'minio123';
SELECT count(*) FROM s3Cluster(
    'cluster_simple', creds, url='https://s3-object-url.csv',
    format='CSV', structure='name String, value UInt32, polygon Array(Array(Tuple(Float64, Float64)))'
)
```

## Доступ к частным и публичным бакетам {#accessing-private-and-public-buckets}

Пользователи могут использовать такие же подходы, как и в документе для функции s3 [здесь](/sql-reference/table-functions/s3#accessing-public-buckets).

## Оптимизация производительности {#optimizing-performance}

Для получения информации об оптимизации производительности функции s3 смотрите [наше подробное руководство](/integrations/s3/performance).


**Смотрите также**

- [S3 engine](../../engines/table-engines/integrations/s3.md)
- [s3 table function](../../sql-reference/table-functions/s3.md)
