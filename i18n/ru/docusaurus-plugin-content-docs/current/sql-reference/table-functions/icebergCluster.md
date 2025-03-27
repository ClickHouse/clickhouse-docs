---
description: 'Расширение функции табличного процесса iceberg, которое позволяет обрабатывать файлы
  из Apache Iceberg параллельно с многих узлов в указанном кластере.'
sidebar_label: 'icebergCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/icebergCluster
title: 'icebergCluster'
---


# Функция табличного процесса icebergCluster

Это расширение функции табличного процесса [iceberg](/sql-reference/table-functions/iceberg.md).

Позволяет обрабатывать файлы из Apache [Iceberg](https://iceberg.apache.org/) параллельно с многих узлов в указанном кластере. На инициаторе устанавливается соединение со всеми узлами в кластере и динамически распределяются все файлы. На рабочем узле он запрашивает у инициатора следующую задачу для обработки и выполняет ее. Это повторяется, пока все задачи не будут завершены.

**Синтаксис**

```sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```

**Аргументы**

- `cluster_name` — Имя кластера, которое используется для построения набора адресов и параметров соединения с удаленными и локальными серверами.

- Описание всех остальных аргументов совпадает с описанием аргументов в эквивалентной функции табличного процесса [iceberg](/sql-reference/table-functions/iceberg.md).

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных из кластера в указанной таблице Iceberg.

**Примеры**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

**Смотрите также**

- [Движок Iceberg](/engines/table-engines/integrations/iceberg.md)
- [Функция табличного процесса Iceberg](sql-reference/table-functions/iceberg.md)
