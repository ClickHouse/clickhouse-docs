---
'slug': '/integrations/postgresql/inserting-data'
'title': '如何从PostgreSQL插入数据'
'keywords':
- 'postgres'
- 'postgresql'
- 'inserts'
'description': '页面描述了如何使用ClickPipes、PeerDB或Postgres表函数从PostgreSQL插入数据'
---

我们建议阅读 [本指南](/guides/inserting-data) 以了解在 ClickHouse 中插入数据的最佳实践，以优化插入性能。

对于从 PostgreSQL 批量加载数据，用户可以使用：

- 使用 [ClickPipes](/integrations/clickpipes/postgres)，这是 ClickHouse Cloud 的托管集成服务 - 目前处于公开测试阶段。请 [在这里注册](https://clickpipes.peerdb.io/)
- `PeerDB by ClickHouse`，这是专门为 PostgreSQL 数据库复制到自管理的 ClickHouse 和 ClickHouse Cloud 设计的 ETL 工具。
    - PeerDB 现在在 ClickHouse Cloud 中原生可用 - 通过我们的 [新 ClickPipe 连接器](/integrations/clickpipes/postgres) 实现快速的 Postgres 到 ClickHouse 的 CDC - 目前处于公开测试阶段。请 [在这里注册](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)
- [Postgres 表函数](/sql-reference/table-functions/postgresql) 直接读取数据。这通常适用于基于已知水印的批量复制，例如时间戳。如果这是一次性迁移，此方法通常也适用。该方法可扩展到数千万行。希望迁移更大数据集的用户应考虑多次请求，每次处理数据的一部分。在将每个数据块的分区移动到最终表之前，可以为每个数据块使用暂存表。这允许对失败的请求进行重试。有关此批量加载策略的更多详细信息，请参见这里。
- 数据可以从 Postgres 导出为 CSV 格式。然后可以通过表函数从本地文件或对象存储将其插入到 ClickHouse 中。
