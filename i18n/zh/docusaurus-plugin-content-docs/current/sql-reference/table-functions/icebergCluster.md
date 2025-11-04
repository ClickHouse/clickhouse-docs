---
'description': '一个扩展 iceberg 表函数的功能，允许从指定集群中的多个节点并行处理 Apache Iceberg 的文件。'
'sidebar_label': 'icebergCluster'
'sidebar_position': 91
'slug': '/sql-reference/table-functions/icebergCluster'
'title': 'icebergCluster'
'doc_type': 'reference'
---


# icebergCluster 表函数

这是对 [iceberg](/sql-reference/table-functions/iceberg.md) 表函数的扩展。

允许从指定集群中的多个节点并行处理来自 Apache [Iceberg](https://iceberg.apache.org/) 的文件。发起者与集群中的所有节点建立连接，并动态分发每个文件。在工作节点上，它会向发起者请求下一个要处理的任务并进行处理。这一过程会重复，直到所有任务完成。

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

- `cluster_name` — 用于构建远程和本地服务器的地址和连接参数集合的集群名称。
- 所有其他参数的描述与等效的 [iceberg](/sql-reference/table-functions/iceberg.md) 表函数中的参数描述相符。

**返回值**

一个表，具有指定的结构，用于从指定的 Iceberg 表中读取来自集群的数据。

**示例**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

## 虚拟列 {#virtual-columns}

- `_path` — 文件的路径。类型: `LowCardinality(String)`。
- `_file` — 文件的名称。类型: `LowCardinality(String)`。
- `_size` — 文件的大小（以字节为单位）。类型: `Nullable(UInt64)`。如果文件大小未知，值为 `NULL`。
- `_time` — 文件的最后修改时间。类型: `Nullable(DateTime)`。如果时间未知，值为 `NULL`。
- `_etag` — 文件的 etag。类型: `LowCardinality(String)`。如果 etag 未知，值为 `NULL`。

**另请参见**

- [Iceberg 引擎](/engines/table-engines/integrations/iceberg.md)
- [Iceberg 表函数](sql-reference/table-functions/iceberg.md)
