---
sidebar_label: '常见问题'
description: '关于 MongoDB 的 ClickPipes 常见问题。'
slug: /integrations/clickpipes/mongodb/faq
sidebar_position: 2
title: 'MongoDB 的 ClickPipes 常见问题'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'CDC（变更数据捕获）', '数据摄取', '实时同步']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

### 能否查询 JSON 数据类型中的单个字段？ \{#can-i-query-for-individual-fields-in-the-json-datatype\}

要直接访问字段 (例如 `{"user_id": 123}`) ，您可以使用**点表示法**：

```sql
SELECT doc.user_id as user_id FROM your_table;
```

要直接访问嵌套对象中的字段，例如 `{"address": { "city": "San Francisco", "state": "CA" }}`，请使用 `^` 运算符：

```sql
SELECT doc.^address.city AS city FROM your_table;
```

对于聚合，请使用 `CAST` 函数或 `::` 语法将字段转换为合适的类型：

```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```

要详细了解如何使用 JSON，请参阅我们的[JSON 使用指南](./quickstart)。

### 如何在 ClickHouse 中扁平化嵌套的 MongoDB 文档？ \{#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse\}

默认情况下，MongoDB 文档会在 ClickHouse 中以 JSON 类型复制，并保留其嵌套结构。您可以通过多种方式将这些数据扁平化。如果您希望将数据扁平化为列，可以使用普通视图、materialized view，或在查询时直接访问。

1. **普通视图**：使用普通视图封装扁平化逻辑。
2. **Materialized Views**：对于较小的数据集，您可以使用可刷新的 materialized view，并结合 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier) 定期对数据进行扁平化和去重。对于较大的数据集，我们建议使用不带 `FINAL` 的增量materialized view 实时扁平化数据，然后在查询时再进行去重。
3. **查询时访问**：不进行扁平化，而是在查询中使用点表示法直接访问嵌套字段。

有关详细示例，请参阅我们的 [JSON 使用指南](./quickstart)。

### 我可以连接没有公网 IP 或位于私有网络中的 MongoDB 数据库吗？ \{#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks\}

我们支持通过 AWS PrivateLink 连接没有公网 IP 或位于私有网络中的 MongoDB 数据库。目前暂不支持 Azure Private Link 和 GCP Private Service Connect。

### 如果我从 MongoDB 数据库中删除某个数据库/表，会发生什么？ \{#what-happens-if-i-delete-a-database-table-from-my-mongodb-database\}

当您从 MongoDB 中删除数据库/表时，ClickPipes 仍会继续运行，但被删除的数据库/表将不再复制变更。ClickHouse 中对应的表会被保留。

### MongoDB CDC Connector 如何处理事务？ \{#how-does-mongodb-cdc-connector-handle-transactions\}

事务中的每项文档变更都会单独处理并写入 ClickHouse。变更会按照它们在 oplog 中出现的顺序依次应用，并且只有已提交的变更才会复制到 ClickHouse。如果 MongoDB 事务被回滚，这些变更就不会出现在变更流中。

有关更多示例，请参阅我们的 [JSON 使用指南](./quickstart)。

### 如何处理 `resume of change stream was not possible, as the resume point may no longer be in the oplog.` 错误？ \{#resume-point-may-no-longer-be-in-the-oplog-error\}

此错误通常发生在 oplog 被截断，导致 ClickPipe 无法从预期位置恢复变更流时。要解决此问题，请[重新同步 ClickPipe](./resync.md)。为避免此问题再次发生，建议延长 oplog 保留时间。请参阅 [MongoDB Atlas](./source/atlas#enable-oplog-retention)、[自管理 MongoDB](./source/generic#enable-oplog-retention) 或 [Amazon DocumentDB](./source/documentdb#configure-change-stream-log-retention) 的相关说明。

### 复制是如何管理的？ \{#how-is-replication-managed\}

我们使用 MongoDB 原生的 Change Streams API 来跟踪数据库中的变更。Change Streams API 利用 MongoDB 的 oplog (操作日志) 提供可恢复的数据库变更流。ClickPipe 使用 MongoDB 的恢复令牌来跟踪 oplog 中的位置，并确保每一项变更都能复制到 ClickHouse。

### 我应该使用哪种读取偏好？ \{#which-read-preference-should-i-use\}

应使用哪种读取偏好取决于您的具体场景。如果您希望尽量减轻主节点的负载，我们建议使用 `secondaryPreferred` 读取偏好。如果您希望尽可能降低摄取延迟，我们建议使用 `primaryPreferred` 读取偏好。更多详细信息，请参阅 [MongoDB 文档](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1)。

### MongoDB ClickPipe 是否支持分片集群？ \{#does-the-mongodb-clickpipe-support-sharded-cluster\}

是，MongoDB ClickPipe 同时支持副本集和分片集群。

### MongoDB ClickPipe 是否支持 Amazon DocumentDB？ \{#documentdb-support\}

是，MongoDB ClickPipe 支持 Amazon DocumentDB 5.0。详情请参阅 [Amazon DocumentDB 数据源配置指南](./source/documentdb.md)。

### MongoDB ClickPipe 是否支持 PrivateLink？ \{#privatelink-support\}

我们目前仅支持在 AWS 上为 MongoDB (以及 DocumentDB) 集群配置 PrivateLink。

请注意，不同于单节点关系型数据库，MongoDB 客户端需要成功发现副本集，才能遵循已配置的 `ReadPreference`。这意味着需要为集群中的所有节点搭建 PrivateLink，这样 MongoDB 客户端才能成功建立副本集连接，并在当前连接的节点发生故障时切换到其他节点。

如果您希望连接到集群中的单个节点，则可以在搭建 ClickPipes 时，在连接字符串中指定 `/?directConnection=true` 以跳过副本集发现。在这种情况下，PrivateLink 的配置方式将类似于单节点关系型数据库，也是支持 PrivateLink 的最简单方案。

对于副本集连接，您可以通过 VPC Resource 或 VPC Endpoint Service 为 MongoDB 搭建 PrivateLink。如果您选择 VPC Resource，则需要创建一个 `GROUP` 资源配置，并为集群中的每个节点分别创建一个 `CHILD` 资源配置。如果您选择 VPC Endpoint Service，则需要为集群中的每个节点分别创建独立的 Endpoint Service (以及独立的 NLB) 。

更多详情，请参阅 [AWS PrivateLink for ClickPipes](../aws-privatelink.md) 文档。如需帮助，请联系 ClickHouse Support。