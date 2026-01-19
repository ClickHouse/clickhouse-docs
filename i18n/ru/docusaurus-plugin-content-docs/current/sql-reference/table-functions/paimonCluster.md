---
description: 'Расширение табличной функции paimon, которое позволяет обрабатывать файлы из Apache Paimon параллельно на нескольких узлах указанного кластера.'
sidebar_label: 'paimonCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/paimonCluster
title: 'paimonCluster'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# Табличная функция paimonCluster \{#paimoncluster-table-function\}

<ExperimentalBadge />

Это расширение табличной функции [paimon](/sql-reference/table-functions/paimon.md).

Позволяет обрабатывать файлы из Apache [Paimon](https://paimon.apache.org/) параллельно на множестве узлов заданного кластера. На инициаторе создаётся подключение ко всем узлам кластера, и каждый файл динамически распределяется между ними. Рабочий узел запрашивает у инициатора следующую задачу для обработки и выполняет её. Это повторяется до тех пор, пока все задачи не будут выполнены.

## Синтаксис \{#syntax\}

```sql
paimonS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

paimonAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

paimonHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
```

## Аргументы \{#arguments\}

- `cluster_name` — имя кластера, которое используется для построения набора адресов и параметров подключения к удалённым и локальным серверам.
- Описание всех остальных аргументов совпадает с описанием аргументов эквивалентной табличной функции [paimon](/sql-reference/table-functions/paimon.md).

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных из кластера из указанной таблицы Paimon.

## Виртуальные столбцы \{#virtual-columns\}

- `_path` — путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — имя файла. Тип: `LowCardinality(String)`.
- `_size` — размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение — `NULL`.
- `_time` — время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_etag` — ETag файла. Тип: `LowCardinality(String)`. Если ETag неизвестен, значение — `NULL`.

**См. также**

- [Табличная функция Paimon](sql-reference/table-functions/paimon.md)
