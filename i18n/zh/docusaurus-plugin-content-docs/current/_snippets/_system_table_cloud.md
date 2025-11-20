:::note 在 ClickHouse Cloud 中进行查询
此系统表中的数据在 ClickHouse Cloud 中由各个节点本地存储。因此，如需获取所有数据的全局视图，需要使用 `clusterAllReplicas` 函数。有关更多详情，请参阅[此处](/operations/system-tables/overview#system-tables-in-clickhouse-cloud)。
:::