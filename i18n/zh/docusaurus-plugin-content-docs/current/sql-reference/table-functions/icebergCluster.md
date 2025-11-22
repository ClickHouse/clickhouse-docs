---
description: '对 `iceberg` 表函数的扩展，用于在指定集群的多个节点上并行处理 Apache Iceberg 文件。'
sidebar_label: 'icebergCluster'
sidebar_position: 91
slug: /sql-reference/table-functions/icebergCluster
title: 'icebergCluster'
doc_type: 'reference'
---



# icebergCluster 表函数

这是对 [iceberg](/sql-reference/table-functions/iceberg.md) 表函数的扩展。

可在指定集群中的多个节点上并行处理来自 Apache [Iceberg](https://iceberg.apache.org/) 的文件。在发起节点上，会创建到集群中所有节点的连接，并动态分发各个文件。在工作节点上，则向发起节点请求要处理的下一个任务并进行处理。该过程会反复执行，直到所有任务都完成。



## 语法 {#syntax}

```sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```


## 参数 {#arguments}

- `cluster_name` — 集群名称,用于构建远程和本地服务器的地址集及连接参数。
- 所有其他参数的说明与等效的 [iceberg](/sql-reference/table-functions/iceberg.md) 表函数中的参数说明相同。

**返回值**

一个具有指定结构的表,用于从集群中指定的 Iceberg 表读取数据。

**示例**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```


## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型:`LowCardinality(String)`。
- `_file` — 文件名。类型:`LowCardinality(String)`。
- `_size` — 文件大小(以字节为单位)。类型:`Nullable(UInt64)`。如果文件大小未知,则值为 `NULL`。
- `_time` — 文件最后修改时间。类型:`Nullable(DateTime)`。如果时间未知,则值为 `NULL`。
- `_etag` — 文件的 ETag。类型:`LowCardinality(String)`。如果 ETag 未知,则值为 `NULL`。

**另请参阅**

- [Iceberg 引擎](/engines/table-engines/integrations/iceberg.md)
- [Iceberg 表函数](sql-reference/table-functions/iceberg.md)
