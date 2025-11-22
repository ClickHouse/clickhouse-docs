---
description: '这是 Delta Lake 表函数的扩展版本。'
sidebar_label: 'deltaLakeCluster'
sidebar_position: 46
slug: /sql-reference/table-functions/deltalakeCluster
title: 'deltaLakeCluster'
doc_type: 'reference'
---



# deltaLakeCluster 表函数

这是对 [deltaLake](sql-reference/table-functions/deltalake.md) 表函数的扩展。

允许在指定集群的多个节点上并行处理位于 Amazon S3 中的 [Delta Lake](https://github.com/delta-io/delta) 表文件。在发起节点上，它会与集群中的所有节点建立连接，并动态分发每个文件。在工作节点上，它会向发起节点请求下一个待处理的任务并执行处理。如此往复，直到所有任务完成为止。



## 语法 {#syntax}

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeCluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeS3Cluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
deltaLakeAzureCluster(cluster_name, named_collection[, option=value [,..]])
```

`deltaLakeS3Cluster` 是 `deltaLakeCluster` 的别名,两者均用于 S3。


## 参数 {#arguments}

- `cluster_name` — 集群名称,用于构建远程和本地服务器的地址集及连接参数。

- 所有其他参数的说明与 [deltaLake](sql-reference/table-functions/deltalake.md) 表函数中对应参数的说明相同。


## 返回值 {#returned_value}

返回一个具有指定结构的表,用于从 S3 中指定的 Delta Lake 表读取集群数据。


## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型:`LowCardinality(String)`。
- `_file` — 文件名称。类型:`LowCardinality(String)`。
- `_size` — 文件大小(以字节为单位)。类型:`Nullable(UInt64)`。如果文件大小未知,则值为 `NULL`。
- `_time` — 文件最后修改时间。类型:`Nullable(DateTime)`。如果时间未知,则值为 `NULL`。
- `_etag` — 文件的 ETag。类型:`LowCardinality(String)`。如果 ETag 未知,则值为 `NULL`。


## 相关内容 {#related}

- [deltaLake 引擎](engines/table-engines/integrations/deltalake.md)
- [deltaLake 表函数](sql-reference/table-functions/deltalake.md)
