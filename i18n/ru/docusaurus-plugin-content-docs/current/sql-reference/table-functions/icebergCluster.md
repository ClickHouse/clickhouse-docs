---
slug: '/sql-reference/table-functions/icebergCluster'
sidebar_label: icebergCluster
sidebar_position: 91
description: 'Расширение для функции таблицы iceberg, которое позволяет обрабатывать'
title: icebergCluster
doc_type: reference
---
# icebergCluster Табличная Функция

Это расширение к таблице [iceberg](/sql-reference/table-functions/iceberg.md).

Позволяет обрабатывать файлы из Apache [Iceberg](https://iceberg.apache.org/) параллельно с многих узлов в указанном кластере. На инициаторе создается соединение со всеми узлами в кластере и динамически распределяются файлы. На рабочем узле он запрашивает у инициатора следующую задачу для обработки и обрабатывает её. Это повторяется, пока все задачи не будут завершены.

## Синтаксис {#syntax}

```sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```

## Аргументы {#arguments}

- `cluster_name` — Имя кластера, который используется для формирования набора адресов и параметров соединения с удалёнными и локальными серверами.
- Описание всех других аргументов совпадает с описанием аргументов в эквивалентной таблице [iceberg](/sql-reference/table-functions/iceberg.md).

**Возвращаемое значение**

Таблица с заданной структурой для чтения данных из кластера в указанной таблице Iceberg.

**Примеры**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

## Виртуальные Колонки {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.
- `_etag` — Etag файла. Тип: `LowCardinality(String)`. Если etag неизвестен, значение равно `NULL`.

**Смотрите Также**

- [Iceberg движок](/engines/table-engines/integrations/iceberg.md)
- [Iceberg таблица функция](sql-reference/table-functions/iceberg.md)