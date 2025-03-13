---
slug: /sql-reference/table-functions/deltalakeCluster
sidebar_position: 46
sidebar_label: deltaLakeCluster
title: 'deltaLakeCluster'
description: '这是对 deltaLake 表函数的扩展。'
---


# deltaLakeCluster 表函数

这是对 [deltaLake](sql-reference/table-functions/deltalake.md) 表函数的扩展。

允许从指定集群中的多个节点并行处理 Amazon S3 中的 [Delta Lake](https://github.com/delta-io/delta) 表的文件。在发起者上，它创建与集群中所有节点的连接，并动态分配每个文件。在工作节点上，它询问发起者下一个要处理的任务并进行处理。这一过程重复进行，直到所有任务完成。

**语法**

``` sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**参数**

- `cluster_name` — 用于构建远程和本地服务器的地址和连接参数集的集群名称。

- 其他所有参数的描述与等效的 [deltaLake](sql-reference/table-functions/deltalake.md) 表函数中的参数描述一致。

**返回值**

具有指定结构的表，用于从 S3 中指定的 Delta Lake 表读取集群的数据。

**另见**

- [deltaLake 引擎](engines/table-engines/integrations/deltalake.md)
- [deltaLake 表函数](sql-reference/table-functions/deltalake.md)
