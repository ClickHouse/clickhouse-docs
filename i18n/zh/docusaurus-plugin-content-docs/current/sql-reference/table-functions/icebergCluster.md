---
slug: /sql-reference/table-functions/icebergCluster
sidebar_position: 91
sidebar_label: icebergCluster
title: 'icebergCluster'
description: '对 iceberg 表函数的扩展，允许从指定集群中的多个节点并行处理来自 Apache Iceberg 的文件。'
---


# icebergCluster 表函数

这是对 [iceberg](/sql-reference/table-functions/iceberg.md) 表函数的扩展。

允许从指定集群中的多个节点并行处理来自 Apache [Iceberg](https://iceberg.apache.org/) 的文件。在发起者节点，它会创建与集群中所有节点的连接，并动态分配每个文件。在工作节点，它向发起者询问下一个要处理的任务并进行处理。这个过程会重复进行，直到所有任务完成。

**语法**

``` sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```

**参数**

- `cluster_name` — 用于构建与远程和本地服务器连接参数的地址集合的集群名称。

- 其他所有参数的描述与等效的 [iceberg](/sql-reference/table-functions/iceberg.md) 表函数中的参数描述相同。

**返回值**

一个具有指定结构的表，用于从指定 Iceberg 表中读取集群的数据。

**示例**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

**另请参见**

- [Iceberg 引擎](/engines/table-engines/integrations/iceberg.md)
- [Iceberg 表函数](sql-reference/table-functions/iceberg.md)
