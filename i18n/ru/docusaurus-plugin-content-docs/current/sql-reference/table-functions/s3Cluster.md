---
description: 'Расширение функции таблицы s3, которое позволяет обрабатывать файлы
  из Amazon S3 и Google Cloud Storage параллельно с множеством узлов в указанном
  кластере.'
sidebar_label: 's3Cluster'
sidebar_position: 181
slug: /sql-reference/table-functions/s3Cluster
title: 's3Cluster'
---


# Функция таблицы s3Cluster

Это расширение для функции таблицы [s3](sql-reference/table-functions/s3.md).

Позволяет обрабатывать файлы из [Amazon S3](https://aws.amazon.com/s3/) и Google Cloud Storage [Google Cloud Storage](https://cloud.google.com/storage/) параллельно с множеством узлов в указанном кластере. На инициаторе создается соединение со всеми узлами в кластере, раскрываются символы подстановки в пути к файлу S3 и динамически распределяются задачи на каждый файл. На узле-работнике инициатор запрашивает следующую задачу для обработки и обрабатывает её. Это повторяется, пока все задачи не будут выполнены.

**Синтаксис**

```sql
s3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,structure] [,compression_method],[,headers])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```

**Аргументы**

- `cluster_name` — Имя кластера, который используется для построения набора адресов и параметров соединения с удаленными и локальными серверами.
- `url` — путь к файлу или группе файлов. Поддерживает следующие символы подстановки в режиме только для чтения: `*`, `**`, `?`, `{'abc','def'}` и `{N..M}`, где `N`, `M` — числа, `abc`, `def` — строки. Для получения дополнительной информации смотрите [Символы подстановки в пути](../../engines/table-engines/integrations/s3.md#wildcards-in-path).
- `NOSIGN` — Если это ключевое слово указано вместо учетных данных, все запросы не будут подписаны.
- `access_key_id` и `secret_access_key` — Ключи, которые указывают учетные данные для использования с данным конечным пунктом. Необязательные.
- `session_token` - Токен сессии для использования с данными ключами. Необязателен при передаче ключей.
- `format` — [формат](/sql-reference/formats) файла.
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.
- `compression_method` — Параметр является необязательным. Поддерживаемые значения: `none`, `gzip` или `gz`, `brotli` или `br`, `xz` или `LZMA`, `zstd` или `zst`. По умолчанию метод сжатия будет автоматически определен по расширению файла.
- `headers` - Параметр является необязательным. Позволяет передавать заголовки в запрос S3. Передается в формате `headers(key=value)`, например, `headers('x-amz-request-payer' = 'requester')`. См. [здесь](/sql-reference/table-functions/s3#accessing-requester-pays-buckets) для примера использования.

Аргументы также могут быть переданы с использованием [именованных коллекций](operations/named-collections.md). В этом случае `url`, `access_key_id`, `secret_access_key`, `format`, `structure`, `compression_method` работают аналогичным образом, и поддерживаются некоторые дополнительные параметры:

 - `filename` — добавляется к url, если указано.
 - `use_environment_credentials` — включен по умолчанию, позволяет передавать дополнительные параметры с помощью переменных окружения `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`.
 - `no_sign_request` — выключен по умолчанию.
 - `expiration_window_seconds` — значение по умолчанию 120.

**Возвращаемое значение**

Таблица с указанной структурой для чтения или записи данных в указанный файл.

**Примеры**

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
Если ваш список файлов содержит диапазоны чисел с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
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

## Доступ к частным и публичным ведрам {#accessing-private-and-public-buckets}

Пользователи могут использовать те же подходы, что и в документации для функции s3 [здесь](/sql-reference/table-functions/s3#accessing-public-buckets).

## Оптимизация производительности {#optimizing-performance}

Для получения информации об оптимизации производительности функции s3 смотрите [наш детальный гид](/integrations/s3/performance).

**Смотрите также**

- [Движок S3](../../engines/table-engines/integrations/s3.md)
- [Функция таблицы s3](../../sql-reference/table-functions/s3.md)
