---
sidebar_label: '常见问题'
description: '关于 ClickPipes for MongoDB 的常见问题解答。'
slug: /integrations/clickpipes/mongodb/faq
sidebar_position: 2
title: 'ClickPipes for MongoDB 常见问题解答'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', '数据摄取', '实时同步']
---



# ClickPipes for MongoDB 常见问题解答

### 我可以查询 JSON 数据类型中的单个字段吗？

对于直接字段访问，例如 `{"user_id": 123}`，可以使用**点号语法（dot notation）**：

```sql
SELECT doc.user_id as user_id FROM your_table;
```

要直接访问嵌套对象中的字段，例如 `{"address": { "city": "San Francisco", "state": "CA" }}`，请使用 `^` 运算符：

```sql
SELECT doc.^address.city AS city FROM your_table;
```

在进行聚合时，请使用 `CAST` 函数或 `::` 语法将该字段转换为适当的类型：

```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```

要了解更多关于处理 JSON 的信息，请参阅我们的 [JSON 使用指南](./quickstart)。

### 如何在 ClickHouse 中展平嵌套的 MongoDB 文档？

MongoDB 文档在 ClickHouse 中默认作为 JSON 类型进行复制，并保留其嵌套结构。你有多种方式可以对这些数据进行展平。如果你希望将数据展平成列，可以使用普通视图、物化视图，或者在查询时进行访问。

1. **普通视图（Normal Views）**：使用普通视图封装展平逻辑。
2. **物化视图（Materialized Views）**：对于小规模数据集，可以使用可刷新的物化视图并结合 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier)，定期对数据进行展平和去重。对于大规模数据集，我们建议使用不带 `FINAL` 的增量物化视图以实时展平数据，然后在查询时进行数据去重。
3. **查询时访问（Query-time Access）**：无需展平，直接在查询中使用点号（dot）语法访问嵌套字段。

有关详细示例，请参阅我们的 [JSON 使用指南](./quickstart)。

### 我能否连接没有公网 IP 或位于私有网络中的 MongoDB 数据库？

我们支持使用 AWS PrivateLink 连接没有公网 IP 或位于私有网络中的 MongoDB 数据库。目前暂不支持 Azure Private Link 和 GCP Private Service Connect。

### 如果我从 MongoDB 中删除数据库/表，会发生什么？

当你从 MongoDB 中删除数据库/表时，ClickPipes 将继续运行，但已删除的数据库/表将停止复制变更。ClickHouse 中对应的表将被保留。

### MongoDB CDC Connector 如何处理事务？

事务中的每个文档变更都会单独写入 ClickHouse。变更会按照它们在 oplog 中出现的顺序应用；只有已提交的变更才会被复制到 ClickHouse。如果某个 MongoDB 事务被回滚，这些变更将不会出现在变更流（change stream）中。

更多示例，请参阅我们的 [JSON 使用指南](./quickstart)。

### 如何处理 `resume of change stream was not possible, as the resume point may no longer be in the oplog.` 错误？

当 oplog 被截断且 ClickPipe 无法在预期位置恢复变更流时，通常会出现此错误。要解决此问题，请[重新同步 ClickPipe](./resync.md)。为避免此问题再次发生，我们建议增加 oplog 的保留时间。参见 [MongoDB Atlas](./source/atlas#enable-oplog-retention)、[自托管 MongoDB](./source/generic#enable-oplog-retention) 或 [Amazon DocumentDB](./source/documentdb#configure-change-stream-log-retention) 的相关说明。

### 复制是如何管理的？

我们使用 MongoDB 原生的 Change Streams API 来跟踪数据库中的变更。Change Streams API 通过利用 MongoDB 的 oplog（操作日志）提供可恢复的数据库变更流。ClickPipe 使用 MongoDB 的恢复令牌（resume tokens）来跟踪在 oplog 中的位置，并确保每一次变更都被复制到 ClickHouse。

### 我应该使用哪种 read preference？

应使用哪种 read preference 取决于你的具体用例。如果你希望尽量减轻主节点的负载，我们建议使用 `secondaryPreferred` read preference。如果你希望优化摄取延迟，我们建议使用 `primaryPreferred` read preference。更多详情请参阅 [MongoDB 文档](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1)。


### MongoDB ClickPipe 是否支持分片集群（Sharded Cluster）？ {#does-the-mongodb-clickpipe-support-sharded-cluster}

是的，MongoDB ClickPipe 同时支持副本集（Replica Set）和分片集群（Sharded Cluster）。

### MongoDB ClickPipe 是否支持 Amazon DocumentDB？ {#documentdb-support}

是的，MongoDB ClickPipe 支持 Amazon DocumentDB 5.0。详情参见 [Amazon DocumentDB source setup guide](./source/documentdb.md)。

### MongoDB ClickPipe 是否支持 PrivateLink？ {#privatelink-support}

目前仅在 AWS 上支持为 MongoDB（以及 DocumentDB）集群配置 PrivateLink。

请注意，与单节点关系型数据库不同，MongoDB 客户端需要成功完成副本集发现，才能遵循配置的 `ReadPreference`。这要求为集群中的所有节点设置 PrivateLink，使 MongoDB 客户端能够成功建立副本集连接，并在当前连接的节点宕机时切换到其他节点。

如果你更倾向于连接集群中的单个节点，可以在 ClickPipes 设置过程中，在连接字符串中指定 `/?directConnection=true`，以跳过副本集发现。在这种情况下，PrivateLink 的设置将类似于单节点关系型数据库，这是支持 PrivateLink 的最简单选项。

对于副本集连接，你可以使用 VPC Resource 或 VPC Endpoint Service 为 MongoDB 设置 PrivateLink。若选择 VPC Resource，你需要创建一个 `GROUP` 资源配置，以及为集群中每个节点创建一个 `CHILD` 资源配置。若选择 VPC Endpoint Service，你需要为集群中每个节点创建一个单独的 Endpoint Service（以及单独的 NLB）。

更多详情请参见 [AWS PrivateLink for ClickPipes](../aws-privatelink.md) 文档。如需帮助，请联系 ClickHouse 支持团队。
