---
slug: /sql-reference/table-functions/icebergCluster
sidebar_position: 91
sidebar_label: icebergCluster
title: 'icebergCluster'
description: 'Расширение функции таблицы iceberg, которое позволяет обрабатывать файлы из Apache Iceberg параллельно с нескольких узлов в заданном кластере.'
---


# Функция таблицы icebergCluster

Это расширение функции таблицы [iceberg](/sql-reference/table-functions/iceberg.md).

Позволяет обрабатывать файлы из Apache [Iceberg](https://iceberg.apache.org/) параллельно с нескольких узлов в заданном кластере. На инициаторе создается соединение со всеми узлами кластера и динамически распределяются все файлы. На рабочем узле он запрашивает у инициатора следующее задание для обработки и обрабатывает его. Это повторяется до завершения всех заданий.

**Синтаксис**

``` sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```

**Аргументы**

- `cluster_name` — Имя кластера, который используется для построения набора адресов и параметров соединения с удаленными и локальными серверами.

- Описание всех остальных аргументов совпадает с описанием аргументов в эквивалентной функции таблицы [iceberg](/sql-reference/table-functions/iceberg.md).

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных из кластера в указанной таблице Iceberg.

**Примеры**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

**См. также**

- [Iceberg engine](/engines/table-engines/integrations/iceberg.md)
- [Iceberg table function](sql-reference/table-functions/iceberg.md)
