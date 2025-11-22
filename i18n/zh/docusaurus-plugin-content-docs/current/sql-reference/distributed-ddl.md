---
description: 'Distributed Ddl 文档'
sidebar_label: 'Distributed DDL'
sidebar_position: 3
slug: /sql-reference/distributed-ddl
title: '分布式 DDL 查询（ON CLUSTER 子句）'
doc_type: 'reference'
---

默认情况下，`CREATE`、`DROP`、`ALTER` 和 `RENAME` 查询只会影响当前执行所在的服务器。在集群环境下，可以通过 `ON CLUSTER` 子句以分布式方式运行此类查询。

例如，下面的查询会在 `cluster` 中的每台主机上创建 `all_hits` 的 `Distributed` 表：

```sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

为了正确运行这些查询，每个主机必须具有相同的集群定义（为简化配置同步，可以使用来自 ZooKeeper 的配置替换）。这些主机还必须连接到 ZooKeeper 服务器。

查询的本地版本最终会在集群中的每个主机上执行，即使某些主机当前不可用。

:::important\
在同一主机内，查询的执行顺序是有保证的。
:::
