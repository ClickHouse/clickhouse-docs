---
slug: /integrations/postgresql/inserting-data
title: 如何从 PostgreSQL 插入数据
keywords: ['postgres', 'postgresql', 'inserts']
---

我们建议阅读 [本指南](/guides/inserting-data) 以了解将数据插入 ClickHouse 的最佳实践，从而优化插入性能。

对于从 PostgreSQL 批量加载数据，用户可以使用：

- 使用 [ClickPipes](/integrations/clickpipes/postgres)，这是 ClickHouse Cloud 的托管集成服务 - 现在处于私人预览状态。请 [在此注册](https://clickpipes.peerdb.io/)
- `PeerDB by ClickHouse`，一个专门为 PostgreSQL 数据库复制到自托管 ClickHouse 和 ClickHouse Cloud 而设计的 ETL 工具。
    - PeerDB 现在在 ClickHouse Cloud 中本地可用 - 通过我们的 [新 ClickPipe 连接器](/integrations/clickpipes/postgres) 实现极速的 Postgres 到 ClickHouse CDC - 现在处于私人预览状态。请 [在此注册](https://clickpipes.peerdb.io/)
- [Postgres 表函数](/sql-reference/table-functions/postgresql) 直接读取数据。这通常适用于基于已知水印（例如时间戳）的批复制，如果这是一次性迁移。此方法可以扩展到数千万行。希望迁移更大数据集的用户应考虑多个请求，每个请求处理一部分数据。在每个部分的最终表移除之前，可以使用暂存表。这允许对失败的请求进行重试。有关此批量加载策略的更多详细信息，请参见此处。
- 数据可以以 CSV 格式从 Postgres 导出。然后可以通过表函数从本地文件或对象存储插入到 ClickHouse。
