---
'slug': '/integrations/postgresql/inserting-data'
'title': '如何从 PostgreSQL 插入数据'
'keywords':
- 'postgres'
- 'postgresql'
- 'inserts'
'description': '页面描述了如何使用 ClickPipes、PeerDB 或 PostgreSQL 表函数从 PostgresSQL 插入数据'
---

我们建议阅读 [本指南](/guides/inserting-data) 以了解在 ClickHouse 中插入数据的最佳实践，从而优化插入性能。

对于从 PostgreSQL 批量加载数据，用户可以使用：

- 使用 [ClickPipes](/integrations/clickpipes/postgres)，这是 ClickHouse Cloud 的自管理集成服务 - 目前处于公开测试阶段。请 [在此注册](https://clickpipes.peerdb.io/)
- `PeerDB by ClickHouse`，一个专门为 PostgreSQL 数据库复制到自托管的 ClickHouse 和 ClickHouse Cloud 设计的 ETL 工具。
    - PeerDB 现在在 ClickHouse Cloud 中原生可用 - 使用我们的 [新 ClickPipe 连接器](/integrations/clickpipes/postgres) 实现流畅的 PostgreSQL 到 ClickHouse 的变更数据捕获 (CDC) - 目前处于公开测试阶段。请 [在此注册](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)
- [Postgres 表函数](/sql-reference/table-functions/postgresql) 直接读取数据。这通常适用于基于已知水印（例如时间戳）的批量复制，或者是一次性的迁移。这种方法可以扩展到数千万行。希望迁移更大数据集的用户应该考虑多个请求，每个请求处理一块数据。可以在最终表之前为每个数据块使用暂存表。这允许重试失败的请求。有关这种批量加载策略的更多详细信息，请参见此处。
- 数据可以以 CSV 格式从 Postgres 导出，然后可以通过本地文件或通过对象存储使用表函数插入到 ClickHouse 中。
