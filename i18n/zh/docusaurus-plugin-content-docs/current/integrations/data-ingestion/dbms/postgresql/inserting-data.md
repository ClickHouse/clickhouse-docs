---
slug: /integrations/postgresql/inserting-data
title: '如何从 PostgreSQL 插入数据'
keywords: ['postgres', 'postgresql', 'inserts']
description: '本页面介绍如何使用 ClickPipes、PeerDB 或 Postgres 表函数从 PostgreSQL 插入数据'
doc_type: 'guide'
---

我们建议先阅读[本指南](/guides/inserting-data)，了解向 ClickHouse 插入数据的最佳实践，以优化插入性能。

对于从 PostgreSQL 批量导入数据，用户可以使用：

- [ClickPipes](/integrations/clickpipes/postgres)，这是 ClickHouse Cloud 的托管集成服务。
- `PeerDB by ClickHouse`，一款专门为 PostgreSQL 数据库复制到自托管 ClickHouse 和 ClickHouse Cloud 设计的 ETL 工具。
- 使用 [Postgres 表函数](/sql-reference/table-functions/postgresql) 直接读取数据。通常适用于基于已知水位线（例如时间戳）的批量复制已足够，或一次性迁移的场景。此方法可以扩展到数千万行。计划迁移更大数据集的用户应考虑发出多次请求，每次处理一部分数据。可以为每个数据分片使用中间表，在其分区移动到最终表之前暂存数据。这样可以对失败的请求进行重试。有关此批量加载策略的更多详细信息，请参见此处。
- 将数据从 PostgreSQL 导出为 CSV 格式。然后可以通过本地文件，或通过对象存储结合表函数，将其插入 ClickHouse。