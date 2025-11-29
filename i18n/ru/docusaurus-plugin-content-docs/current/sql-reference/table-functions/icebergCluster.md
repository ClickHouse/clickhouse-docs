---
description: 'Расширение табличной функции iceberg, позволяющее обрабатывать файлы
  из Apache Iceberg параллельно на множестве узлов в заданном кластере.'
sidebar_label: 'icebergCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/icebergCluster
title: 'icebergCluster'
doc_type: 'reference'
---



# Табличная функция icebergCluster {#icebergcluster-table-function}

Это расширение табличной функции [iceberg](/sql-reference/table-functions/iceberg.md).

Позволяет параллельно обрабатывать файлы Apache [Iceberg](https://iceberg.apache.org/) на многих узлах в заданном кластере. На узле-инициаторе создаётся соединение со всеми узлами кластера, и каждый файл динамически распределяется между ними. Рабочий узел запрашивает у инициатора следующую задачу для обработки и выполняет её. Это повторяется до тех пор, пока все задачи не будут завершены.



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

* `cluster_name` — имя кластера, которое используется для построения набора адресов и параметров подключения к удалённым и локальным серверам.
* Описание всех остальных аргументов совпадает с описанием аргументов в эквивалентной табличной функции [iceberg](/sql-reference/table-functions/iceberg.md).

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных из указанной таблицы Iceberg в кластере.

**Примеры**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```


## Виртуальные столбцы {#virtual-columns}

- `_path` — путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — имя файла. Тип: `LowCardinality(String)`.
- `_size` — размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение — `NULL`.
- `_time` — время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_etag` — ETag файла. Тип: `LowCardinality(String)`. Если ETag неизвестен, значение — `NULL`.

**См. также**

- [Движок Iceberg](/engines/table-engines/integrations/iceberg.md)
- [Табличная функция Iceberg](sql-reference/table-functions/iceberg.md)
