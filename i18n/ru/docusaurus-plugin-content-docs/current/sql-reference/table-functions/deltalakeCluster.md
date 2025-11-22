---
description: 'Расширение табличной функции deltaLake.'
sidebar_label: 'deltaLakeCluster'
sidebar_position: 46
slug: /sql-reference/table-functions/deltalakeCluster
title: 'deltaLakeCluster'
doc_type: 'reference'
---



# Функция таблицы deltaLakeCluster

Это расширение функции таблицы [deltaLake](sql-reference/table-functions/deltalake.md).

Позволяет параллельно обрабатывать файлы из таблиц [Delta Lake](https://github.com/delta-io/delta) в Amazon S3 одновременно на нескольких узлах в указанном кластере. На инициирующем узле создаётся соединение со всеми узлами кластера, и каждый файл динамически распределяется между ними. На рабочем узле он запрашивает у инициатора следующую задачу и обрабатывает её. Это повторяется до тех пор, пока все задачи не будут завершены.



## Синтаксис {#syntax}

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeCluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeS3Cluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
deltaLakeAzureCluster(cluster_name, named_collection[, option=value [,..]])
```

`deltaLakeS3Cluster` является псевдонимом `deltaLakeCluster`, обе функции работают с S3.


## Аргументы {#arguments}

- `cluster_name` — имя кластера, используемое для формирования набора адресов и параметров подключения к удалённым и локальным серверам.

- Описание остальных аргументов совпадает с описанием аргументов табличной функции [deltaLake](sql-reference/table-functions/deltalake.md).


## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения данных из указанной таблицы Delta Lake в S3 на кластере.


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_etag` — ETag файла. Тип: `LowCardinality(String)`. Если ETag неизвестен, значение — `NULL`.


## Связанные разделы {#related}

- [Движок deltaLake](engines/table-engines/integrations/deltalake.md)
- [Табличная функция deltaLake](sql-reference/table-functions/deltalake.md)
