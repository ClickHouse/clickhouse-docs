---
'slug': '/integrations/postgresql/inserting-data'
'title': '如何从PostgreSQL插入数据'
'keywords':
- 'postgres'
- 'postgresql'
- 'inserts'
'description': '页面描述如何使用ClickPipes、PeerDB或Postgres表函数从PostgresSQL插入数据'
---



我们建议阅读 [本指南](/guides/inserting-data) 以了解将数据插入 ClickHouse 的最佳实践，从而优化插入性能。

对于从 PostgreSQL 批量加载数据，用户可以使用：

- 使用 [ClickPipes](/integrations/clickpipes/postgres)，这是 ClickHouse Cloud 的托管集成服务 - 现已进入公开测试阶段。请 [在此注册](https://clickpipes.peerdb.io/)
- `PeerDB by ClickHouse`，一个专门为 PostgreSQL 数据库复制到自管理的 ClickHouse 和 ClickHouse Cloud 设计的 ETL 工具。
    - PeerDB 现在已在 ClickHouse Cloud 中原生提供 - 我们的 [新 ClickPipe 连接器](/integrations/clickpipes/postgres) 提供快速的 Postgres 到 ClickHouse CDC，现已进入公开测试阶段。请 [在此注册](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)
- [Postgres 表函数](/sql-reference/table-functions/postgresql) 直接读取数据。这通常适用于基于已知水印（例如时间戳）的批量复制，或者用于一次性迁移。该方法可以扩展到千万行。希望迁移更大数据集的用户应考虑多次请求，每次处理一部分数据。可以为每个数据块使用临时表，然后再将其分区移动到最终表。这允许对失败的请求进行重试。有关此批量加载策略的更多详细信息，请参见此处。
- 数据可以从 Postgres 以 CSV 格式导出。然后可以从本地文件或通过对象存储使用表函数插入到 ClickHouse 中。
