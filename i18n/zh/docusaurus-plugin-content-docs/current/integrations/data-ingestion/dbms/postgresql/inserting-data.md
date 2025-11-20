---
slug: /integrations/postgresql/inserting-data
title: '如何从 PostgreSQL 插入数据'
keywords: ['postgres', 'postgresql', 'inserts']
description: '本页介绍如何使用 ClickPipes、PeerDB 或 Postgres 表函数从 PostgreSQL 插入数据'
doc_type: 'guide'
---

我们建议先阅读[本指南](/guides/inserting-data)，了解向 ClickHouse 插入数据的最佳实践，以优化写入性能。

对于从 PostgreSQL 批量加载数据，用户可以使用：

- [ClickPipes](/integrations/clickpipes/postgres)，ClickHouse Cloud 的托管集成服务。
- `PeerDB by ClickHouse`，一款专为将 PostgreSQL 数据库复制到自托管 ClickHouse 和 ClickHouse Cloud 而设计的 ETL 工具。
- [Postgres 表函数](/sql-reference/table-functions/postgresql)，可直接读取数据。对于基于已知水位线（例如时间戳）的批量复制场景（只要这种方式已足够），或者一次性迁移场景，这通常是一个合适的选择。该方法可以扩展到数千万行。需要迁移更大数据集的用户应考虑发起多个请求，每个请求处理一部分数据。在将这些数据块的分区移动到最终表之前，可以为每个数据块使用中间表。这样可以在请求失败时进行重试。有关这种批量加载策略的更多详情，请参阅此处。
- 将数据从 Postgres 导出为 CSV 格式，然后通过本地文件或结合对象存储与表函数，将其插入到 ClickHouse 中。