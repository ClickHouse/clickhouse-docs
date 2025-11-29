---
description: '这是 deltaLake 表函数的扩展形式。'
sidebar_label: 'deltaLakeCluster'
sidebar_position: 46
slug: /sql-reference/table-functions/deltalakeCluster
title: 'deltaLakeCluster'
doc_type: 'reference'
---



# deltaLakeCluster 表函数 {#deltalakecluster-table-function}

这是对 [deltaLake](sql-reference/table-functions/deltalake.md) 表函数的扩展。

允许在指定集群中的多个节点上，并行处理 Amazon S3 中来自 [Delta Lake](https://github.com/delta-io/delta) 表的文件。在发起节点上，它会创建到集群中所有节点的连接，并动态分派每个文件。在工作节点上，它会向发起节点请求下一个待处理任务并执行处理。该过程会重复进行，直到所有任务完成为止。



## 语法 {#syntax}

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeCluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeS3Cluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
deltaLakeS3Cluster(cluster_name, named_collection[, option=value [,..]])

deltaLakeAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
deltaLakeAzureCluster(cluster_name, named_collection[, option=value [,..]])
```

`deltaLakeS3Cluster` 是 `deltaLakeCluster` 的别名，两者都用于 S3。


## 参数 {#arguments}

- `cluster_name` — 用于构建远程和本地服务器地址集合及连接参数的集群名称。

- 其他所有参数的说明与对应的 [deltaLake](sql-reference/table-functions/deltalake.md) 表函数中的参数说明相同。



## 返回值 {#returned_value}

一个具有指定结构的表，用于在集群中读取 S3 上指定 Delta Lake 表的数据。



## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（字节）。类型：`Nullable(UInt64)`。如果文件大小未知，则值为 `NULL`。
- `_time` — 文件的最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，则值为 `NULL`。
- `_etag` — 文件的 ETag。类型：`LowCardinality(String)`。如果 ETag 未知，则值为 `NULL`。



## 相关内容 {#related}

- [deltaLake 引擎](engines/table-engines/integrations/deltalake.md)
- [deltaLake 表函数](sql-reference/table-functions/deltalake.md)
