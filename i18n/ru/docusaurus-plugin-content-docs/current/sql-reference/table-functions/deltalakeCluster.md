---
slug: '/sql-reference/table-functions/deltalakeCluster'
sidebar_label: deltaLakeCluster
sidebar_position: 46
description: 'Это расширение для функции таблицы deltaLake.'
title: deltaLakeCluster
doc_type: reference
---
# deltaLakeCluster Табличная Функция

Это расширение для табличной функции [deltaLake](sql-reference/table-functions/deltalake.md).

Позволяет обрабатывать файлы из таблиц [Delta Lake](https://github.com/delta-io/delta) в Amazon S3 параллельно с нескольких узлов в указанном кластере. На инициаторе создается соединение со всеми узлами кластера и динамически распределяются файлы. На рабочем узле он запрашивает у инициатора следующую задачу для обработки и выполняет её. Это повторяется, пока все задачи не будут завершены.

## Синтаксис {#syntax}

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeCluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeS3Cluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
deltaLakeAzureCluster(cluster_name, named_collection[, option=value [,..]])
```
`deltaLakeS3Cluster` является псевдонимом для `deltaLakeCluster`, оба предназначены для S3.

## Аргументы {#arguments}

- `cluster_name` — Название кластера, которое используется для построения набора адресов и параметров соединения с удаленными и локальными серверами.

- Описание всех других аргументов совпадает с описанием аргументов в эквивалентной табличной функции [deltaLake](sql-reference/table-functions/deltalake.md).

## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения данных из кластера в указанной таблице Delta Lake в S3.

## Виртуальные колонки {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Название файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.
- `_etag` — Etag файла. Тип: `LowCardinality(String)`. Если etag неизвестен, значение равно `NULL`.

## Связанные материалы {#related}

- [движок deltaLake](engines/table-engines/integrations/deltalake.md)
- [табличная функция deltaLake](sql-reference/table-functions/deltalake.md)