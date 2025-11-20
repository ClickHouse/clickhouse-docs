---
slug: /integrations/postgresql/inserting-data
title: '如何从 PostgreSQL 写入数据'
keywords: ['postgres', 'postgresql', 'inserts']
description: '本页介绍如何使用 ClickPipes、PeerDB 或 Postgres 表函数从 PostgresSQL 写入数据'
doc_type: 'guide'
---

我们建议先阅读[本指南](/guides/inserting-data)，了解向 ClickHouse 写入数据的最佳实践，从而优化写入性能。

对于从 PostgreSQL 批量加载数据，用户可以使用：

- 使用 [ClickPipes](/integrations/clickpipes/postgres)，这是 ClickHouse Cloud 的托管集成服务。
- `PeerDB by ClickHouse`，一种专门为将 PostgreSQL 数据库复制到自托管 ClickHouse 和 ClickHouse Cloud 而设计的 ETL 工具。
- 使用 [Postgres 表函数](/sql-reference/table-functions/postgresql) 直接读取数据。这通常适用于基于已知水位线（例如时间戳）的批量复制足以满足需求，或是一次性迁移的场景。该方法可以扩展到数千万行。需要迁移更大数据集的用户应考虑发起多次请求，每次处理一部分数据。可以为每个数据块使用暂存表，在其分区被移动到最终表之前先写入暂存表中。这样在请求失败时可以进行重试。有关此批量加载策略的更多详细信息，请参阅此处。
- 可以将数据从 Postgres 导出为 CSV 格式，然后通过本地文件，或结合使用表函数和对象存储，将其写入 ClickHouse。