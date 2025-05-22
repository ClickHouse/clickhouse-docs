
# deltaLakeCluster 表函数

这是对 [deltaLake](sql-reference/table-functions/deltalake.md) 表函数的扩展。

允许从指定集群的多个节点并行处理来自 [Delta Lake](https://github.com/delta-io/delta) 表的文件，文件存储在 Amazon S3 中。在发起者处，它创建与集群中所有节点的连接，并动态分发每个文件。在工作节点上，它向发起者询问下一个要处理的任务并进行处理。这个过程会重复，直到所有任务完成。

## 语法 {#syntax}

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 参数 {#arguments}

- `cluster_name` — 用于构建远程和本地服务器的一组地址和连接参数的集群名称。

- 所有其他参数的描述与等效的 [deltaLake](sql-reference/table-functions/deltalake.md) 表函数中的参数描述相同。

## 返回值 {#returned_value}

一个具有指定结构的表，用于从指定的 Delta Lake 表在 S3 中读取集群数据。

## 相关 {#related}

- [deltaLake 引擎](engines/table-engines/integrations/deltalake.md)
- [deltaLake 表函数](sql-reference/table-functions/deltalake.md)
