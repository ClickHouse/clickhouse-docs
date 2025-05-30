---
'slug': '/integrations/postgresql/inserting-data'
'title': '如何从 PostgreSQL 插入数据'
'keywords':
- 'postgres'
- 'postgresql'
- 'inserts'
'description': '页面描述如何使用 ClickPipes、PeerDB 或 Postgres 表函数从 PostgreSQL 插入数据'
---

我们建议阅读 [本指南](/guides/inserting-data)，以了解在 ClickHouse 中插入数据的最佳实践，以优化插入性能。

对于从 PostgreSQL 批量加载数据，用户可以使用：

- 使用 [ClickPipes](/integrations/clickpipes/postgres)，这是 ClickHouse Cloud 的托管集成服务。
- `PeerDB by ClickHouse`，这是一个专门为 PostgreSQL 数据库复制到自管理 ClickHouse 和 ClickHouse Cloud 设计的 ETL 工具。
- [Postgres 表函数](/sql-reference/table-functions/postgresql) 直接读取数据。这通常适合基于已知水印（例如时间戳）的批量复制，或如果只是一次性的迁移。此方法可以扩展到数千万行。希望迁移更大数据集的用户应考虑多个请求，每个请求处理一块数据。在最终表之前可以为每个块使用暂存表。这允许对失败的请求进行重试。有关此批量加载策略的更多详细信息，请参见此处。
- 数据可以以 CSV 格式从 Postgres 导出。然后，可以通过本地文件或使用表函数通过对象存储将其插入 ClickHouse。
