:::note 在 ClickHouse Cloud 中进行查询
此系统表中的数据在 ClickHouse Cloud 的每个节点上本地存储。因此，要获取所有数据的完整视图，需要使用 `clusterAllReplicas` 函数。更多详情请参见[此处](/operations/system-tables/overview#system-tables-in-clickhouse-cloud)。
:::