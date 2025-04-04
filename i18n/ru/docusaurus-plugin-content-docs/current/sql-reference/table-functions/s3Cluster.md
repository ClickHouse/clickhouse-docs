---
description: 'Расширение функции табличного типа s3, которое позволяет обрабатывать файлы
  из Amazon S3 и Google Cloud Storage параллельно с множеством узлов в указанном
  кластере.'
sidebar_label: 's3Cluster'
sidebar_position: 181
slug: /sql-reference/table-functions/s3Cluster
title: 's3Cluster'
---


# Функция табличного типа s3Cluster

Это расширение функции табличного типа [s3](sql-reference/table-functions/s3.md).

Позволяет обрабатывать файлы из [Amazon S3](https://aws.amazon.com/s3/) и Google Cloud Storage [Google Cloud Storage](https://cloud.google.com/storage/) параллельно с множеством узлов в указанном кластере. На инициаторе создаётся соединение со всеми узлами в кластере, раскрываются знаки звездочки в пути к файлам S3 и динамически распределяются файлы. На узле-работнике он запрашивает у инициатора следующую задачу для обработки и выполняет её. Это повторяется, пока все задачи не будут завершены.

**Синтаксис**

```sql
s3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,structure] [,compression_method],[,headers])
s3Cluster(cluster_name, named_collection[, option=value [,..]])
```

**Аргументы**

- `cluster_name` — Имя кластера, которое используется для построения набора адресов и параметров соединения с удалёнными и локальными серверами.
- `url` — путь к файлу или группе файлов. Поддерживает следующие подстановочные знаки в режиме только для чтения: `*`, `**`, `?`, `{'abc','def'}` и `{N..M}`, где `N`, `M` — числа, `abc`, `def` — строки. Для получения дополнительной информации смотрите [Подстановочные знаки в пути](../../engines/table-engines/integrations/s3.md#wildcards-in-path).
- `NOSIGN` — Если это ключевое слово указано вместо учетных данных, все запросы не будут подписаны.
- `access_key_id` и `secret_access_key` — Ключи, которые указывают учетные данные для использования с данным конечным пунктом. Необязательно.
- `session_token` - Токен сессии для использования с указанными ключами. Необязательно при передаче ключей.
- `format` — [Формат](/sql-reference/formats) файла.
- `structure` — Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.
- `compression_method` — Параметр является необязательным. Поддерживаемые значения: `none`, `gzip` или `gz`, `brotli` или `br`, `xz` или `LZMA`, `zstd` или `zst`. По умолчанию будет автоматически определён метод сжатия по расширению файла.
- `headers` - Параметр является необязательным. Позволяет передавать заголовки в запрос S3. Передавайте в формате `headers(key=value)`, например, `headers('x-amz-request-payer' = 'requester')`. Смотрите [здесь](/sql-reference/table-functions/s3#accessing-requester-pays-buckets) пример использования.

Аргументы также могут быть переданы с использованием [именованных коллекций](operations/named-collections.md). В этом случае `url`, `access_key_id`, `secret_access_key`, `format`, `structure`, `compression_method` работают аналогичным образом, и поддерживаются некоторые дополнительные параметры:

 - `filename` — добавляется к URL, если указан.
 - `use_environment_credentials` — включен по умолчанию, позволяет передавать дополнительные параметры с помощью переменных окружения `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`, `AWS_CONTAINER_CREDENTIALS_FULL_URI`, `AWS_CONTAINER_AUTHORIZATION_TOKEN`, `AWS_EC2_METADATA_DISABLED`.
 - `no_sign_request` — отключен по умолчанию.
 - `expiration_window_seconds` — значение по умолчанию 120.

**Возвращаемое значение**

Таблица с указанной структурой для чтения или записи данных в указанном файле.

**Примеры**

Выбрать данные из всех файлов в папках `/root/data/clickhouse` и `/root/data/database/`, используя все узлы кластера `cluster_simple`:

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

Посчитать общее количество строк во всех файлах в кластере `cluster_simple`:

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

## Доступ к приватным и публичным корзинам {#accessing-private-and-public-buckets}

Пользователи могут использовать такие же подходы, как в документе для функции s3 [здесь](/sql-reference/table-functions/s3#accessing-public-buckets).

## Оптимизация производительности {#optimizing-performance}

Для получения подробной информации об оптимизации производительности функции s3 смотрите [наш подробный гид](/integrations/s3/performance).


**См. также**

- [Движок S3](../../engines/table-engines/integrations/s3.md)
- [Функция табличного типа s3](../../sql-reference/table-functions/s3.md)
