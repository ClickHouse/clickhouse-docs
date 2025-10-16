---
'slug': '/integrations/postgresql/inserting-data'
'title': '如何从 PostgreSQL 插入数据'
'keywords':
- 'postgres'
- 'postgresql'
- 'inserts'
'description': '页面描述如何使用 ClickPipes、PeerDB 或 PostgreSQL 表函数从 PostgreSQL 插入数据'
'doc_type': 'guide'
---

我们建议阅读 [this guide](/guides/inserting-data) 以了解在 ClickHouse 中插入数据的最佳实践，以优化插入性能。

对于从 PostgreSQL 批量加载数据，用户可以使用：

- 使用 [ClickPipes](/integrations/clickpipes/postgres)，这是 ClickHouse Cloud 的管理集成服务。
- `PeerDB by ClickHouse`，这是一款专门为 PostgreSQL 数据库复制到自管理的 ClickHouse 和 ClickHouse Cloud 而设计的 ETL 工具。
- [Postgres 表函数](/sql-reference/table-functions/postgresql) 直接读取数据。这通常适用于基于已知水印的批量复制，例如时间戳。如果这是一次性迁移，这种方法也是适合的。此方法可以扩展到数千万行。希望迁移更大数据集的用户应考虑多个请求，每个请求处理一部分数据。可以为每个部分使用暂存表，待其分区被移动到最终表后。这允许重新尝试失败的请求。有关此批量加载策略的更多信息，请参见此处。
- 数据可以以 CSV 格式从 Postgres 导出。然后可以通过表函数从本地文件或对象存储将其插入到 ClickHouse 中。
