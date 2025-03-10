---
slug: /sql-reference/table-functions/hudiCluster
sidebar_position: 86
sidebar_label: hudiCluster
title: 'hudiCluster 表函数'
description: '对 hudi 表函数的扩展。允许在指定集群中的多个节点并行处理来自 Apache Hudi 表的 Amazon S3 中的文件。'
---


# hudiCluster 表函数

这是对 [hudi](sql-reference/table-functions/hudi.md) 表函数的扩展。

允许在指定集群中的多个节点并行处理来自 Apache [Hudi](https://hudi.apache.org/) 表的 Amazon S3 中的文件。在发起者处，它创建与集群中所有节点的连接，并动态分配每个文件。在工作节点上，它向发起者询问下一个要处理的任务并进行处理。这个过程一直重复，直到所有任务完成。

**语法**

``` sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**参数**

- `cluster_name` — 用于构建一组地址和连接参数，以连接远程和本地服务器的集群名称。

- 所有其他参数的描述与等效的 [hudi](sql-reference/table-functions/hudi.md) 表函数中的参数描述相符。

**返回值**

返回一个具有指定结构的表，用于从集群中读取指定 Hudi 表中的数据，存储在 S3 中。

**另请参阅**

- [Hudi 引擎](engines/table-engines/integrations/hudi.md)
- [Hudi 表函数](sql-reference/table-functions/hudi.md)
