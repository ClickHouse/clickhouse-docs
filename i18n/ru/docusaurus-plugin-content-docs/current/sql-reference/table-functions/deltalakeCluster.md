---
description: 'Это расширение табличной функции deltaLake.'
sidebar_label: 'deltaLakeCluster'
sidebar_position: 46
slug: /sql-reference/table-functions/deltalakeCluster
title: 'deltaLakeCluster'
doc_type: 'reference'
---



# Табличная функция deltaLakeCluster {#deltalakecluster-table-function}

Это расширение табличной функции [deltaLake](sql-reference/table-functions/deltalake.md).

Позволяет параллельно обрабатывать файлы из таблиц [Delta Lake](https://github.com/delta-io/delta) в Amazon S3 одновременно с нескольких узлов заданного кластера. На инициаторе создаётся подключение ко всем узлам в кластере, и каждый файл динамически распределяется между ними. Рабочий узел запрашивает у инициатора следующую задачу и обрабатывает её. Это повторяется до тех пор, пока все задачи не будут выполнены.



## Синтаксис {#syntax}

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeCluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeS3Cluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
deltaLakeAzureCluster(cluster_name, named_collection[, option=value [,..]])
```

`deltaLakeS3Cluster` — это псевдоним `deltaLakeCluster`, оба используются с S3.


## Аргументы {#arguments}

- `cluster_name` — имя кластера, которое используется для формирования набора адресов и параметров подключения к удалённым и локальным серверам.

- Описание всех остальных аргументов аналогично описанию аргументов в эквивалентной табличной функции [deltaLake](sql-reference/table-functions/deltalake.md).



## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения данных с кластера из указанной таблицы Delta Lake в S3.



## Виртуальные столбцы {#virtual-columns}

- `_path` — путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — имя файла. Тип: `LowCardinality(String)`.
- `_size` — размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение — `NULL`.
- `_time` — время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_etag` — ETag файла. Тип: `LowCardinality(String)`. Если ETag неизвестен, значение — `NULL`.



## См. также {#related}

- [движок Delta Lake](engines/table-engines/integrations/deltalake.md)
- [табличная функция Delta Lake](sql-reference/table-functions/deltalake.md)
