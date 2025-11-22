---
description: 'paimon 表函数的扩展版，可在指定集群的多个节点上并行处理 Apache Paimon 的文件。'
sidebar_label: 'paimonCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/paimonCluster
title: 'paimonCluster'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# paimonCluster 表函数

<ExperimentalBadge />

这是对 [paimon](/sql-reference/table-functions/paimon.md) 表函数的扩展。

允许在指定集群中的多个节点上并行处理来自 Apache [Paimon](https://paimon.apache.org/) 的文件。在发起端节点上，它会创建到集群中所有节点的连接，并将每个文件动态分发出去。在工作节点上，它会向发起端请求下一个要处理的任务并对其进行处理。这个过程会重复进行，直到所有任务都完成。



## 语法 {#syntax}

```sql
paimonS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

paimonAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

paimonHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
```


## 参数 {#arguments}

- `cluster_name` — 集群名称,用于构建远程和本地服务器的地址集及连接参数。
- 所有其他参数的说明与等效的 [paimon](/sql-reference/table-functions/paimon.md) 表函数中的参数说明相同。

**返回值**

返回一个具有指定结构的表,用于从集群中指定的 Paimon 表读取数据。


## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小(以字节为单位)。类型：`Nullable(UInt64)`。如果文件大小未知,则值为 `NULL`。
- `_time` — 文件最后修改时间。类型：`Nullable(DateTime)`。如果时间未知,则值为 `NULL`。
- `_etag` — 文件的 ETag。类型：`LowCardinality(String)`。如果 ETag 未知,则值为 `NULL`。

**另请参阅**

- [Paimon 表函数](sql-reference/table-functions/paimon.md)
