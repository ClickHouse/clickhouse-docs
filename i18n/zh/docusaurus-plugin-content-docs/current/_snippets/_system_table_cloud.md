:::note 在 ClickHouse Cloud 中进行查询
该系统表中的数据保存在 ClickHouse Cloud 中每个节点的本地。因此，如需获得所有数据的完整视图，需要使用 `clusterAllReplicas` 函数。更多详情请参阅[此处](/operations/system-tables/overview#system-tables-in-clickhouse-cloud)。
:::