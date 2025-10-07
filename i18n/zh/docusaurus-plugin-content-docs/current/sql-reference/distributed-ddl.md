---
'description': '分布式 DDL 的文档'
'sidebar_label': '分布式 DDL'
'sidebar_position': 3
'slug': '/sql-reference/distributed-ddl'
'title': '分布式 DDL 查询 (ON CLUSTER 子句)'
'doc_type': 'reference'
---

默认情况下，`CREATE`、`DROP`、`ALTER` 和 `RENAME` 查询仅影响执行它们的当前服务器。在集群设置中，可以使用 `ON CLUSTER` 子句以分布式方式运行这些查询。

例如，以下查询将在 `cluster` 中的每个主机上创建 `all_hits` `Distributed` 表：

```sql
CREATE TABLE IF NOT EXISTS all_hits ON CLUSTER cluster (p Date, i Int32) ENGINE = Distributed(cluster, default, hits)
```

为了正确运行这些查询，每个主机必须具有相同的集群定义（为了简化配置同步，您可以使用来自 ZooKeeper 的替换）。它们还必须连接到 ZooKeeper 服务器。

即使一些主机当前不可用，查询的本地版本最终仍将在集群中的每个主机上执行。

:::important    
在单个主机内执行查询的顺序是有保证的。
:::
