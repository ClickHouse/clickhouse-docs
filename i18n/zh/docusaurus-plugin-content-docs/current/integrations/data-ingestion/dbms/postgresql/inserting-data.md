---
slug: /integrations/postgresql/inserting-data
title: '如何从 PostgreSQL 插入数据'
keywords: ['postgres', 'postgresql', 'inserts']
description: '介绍如何使用 ClickPipes、PeerDB 或 Postgres 表函数从 PostgreSQL 插入数据的页面'
doc_type: 'guide'
---

我们建议先阅读[本指南](/guides/inserting-data)，了解向 ClickHouse 插入数据的最佳实践，以优化插入性能。

对于从 PostgreSQL 批量加载数据，用户可以使用：

- [ClickPipes](/integrations/clickpipes/postgres)，这是 ClickHouse Cloud 的托管集成服务。
- `PeerDB by ClickHouse`，一款专为将 PostgreSQL 数据库复制到自托管 ClickHouse 和 ClickHouse Cloud 而设计的 ETL 工具。
- 使用 [Postgres 表函数](/sql-reference/table-functions/postgresql) 直接读取数据。通常适用于基于已知水位线（例如时间戳）的批量复制已足够，或只需一次性迁移的场景。该方式可以扩展到数千万行数据。希望迁移更大数据集的用户应考虑将数据拆分为多个请求，每个请求处理一部分数据。可以为每一部分使用中间表，在将其分区移动到最终表之前先写入中间表。这样可以在请求失败时进行重试。有关这种批量加载策略的更多详细信息，请参阅此处。
- 可以先将 Postgres 中的数据导出为 CSV 格式。然后可以从本地文件或通过对象存储配合表函数将其插入到 ClickHouse 中。