---
sidebar_label: '常见问题'
description: '关于 ClickPipes for MongoDB 的常见问题。'
slug: /integrations/clickpipes/mongodb/faq
sidebar_position: 2
title: 'ClickPipes for MongoDB 常见问题'
doc_type: 'reference'
keywords: ['clickpipes', 'mongodb', 'cdc', '数据导入', '实时同步']
---



# ClickPipes for MongoDB 常见问题

### 我可以查询 JSON 数据类型中的单个字段吗？ {#can-i-query-for-individual-fields-in-the-json-datatype}

对于直接字段访问,例如 `{"user_id": 123}`,您可以使用**点表示法**:

```sql
SELECT doc.user_id as user_id FROM your_table;
```

对于嵌套对象字段的直接访问,例如 `{"address": { "city": "San Francisco", "state": "CA" }}`,使用 `^` 运算符:

```sql
SELECT doc.^address.city AS city FROM your_table;
```

对于聚合操作,使用 `CAST` 函数或 `::` 语法将字段转换为相应的类型:

```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```

要了解更多关于使用 JSON 的信息,请参阅我们的 [JSON 使用指南](./quickstart)。

### 如何在 ClickHouse 中展平嵌套的 MongoDB 文档? {#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse}

默认情况下,MongoDB 文档在 ClickHouse 中以 JSON 类型复制,保留嵌套结构。您有多种选项来展平这些数据。如果您想将数据展平为列,可以使用普通视图、物化视图或查询时访问。

1. **普通视图**:使用普通视图封装展平逻辑。
2. **物化视图**:对于较小的数据集,您可以使用带有 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier) 的可刷新物化视图来定期展平和去重数据。对于较大的数据集,我们建议使用不带 `FINAL` 的增量物化视图来实时展平数据,然后在查询时去重数据。
3. **查询时访问**:不进行展平,而是使用点表示法在查询中直接访问嵌套字段。

有关详细示例,请参阅我们的 [JSON 使用指南](./quickstart)。

### 我可以连接没有公网 IP 或位于私有网络中的 MongoDB 数据库吗? {#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

我们支持使用 AWS PrivateLink 连接没有公网 IP 或位于私有网络中的 MongoDB 数据库。目前不支持 Azure Private Link 和 GCP Private Service Connect。

### 如果我从 MongoDB 数据库中删除数据库/表会发生什么? {#what-happens-if-i-delete-a-database-table-from-my-mongodb-database}

当您从 MongoDB 中删除数据库/表时,ClickPipes 将继续运行,但已删除的数据库/表将停止复制更改。ClickHouse 中的相应表将被保留。

### MongoDB CDC 连接器如何处理事务? {#how-does-mongodb-cdc-connector-handle-transactions}

事务中的每个文档更改都会单独处理并发送到 ClickHouse。更改按照它们在 oplog 中出现的顺序应用;只有已提交的更改才会复制到 ClickHouse。如果 MongoDB 事务被回滚,这些更改不会出现在变更流中。

有关更多示例,请参阅我们的 [JSON 使用指南](./quickstart)。

### 如何处理 `resume of change stream was not possible, as the resume point may no longer be in the oplog.` 错误? {#resume-point-may-no-longer-be-in-the-oplog-error}

此错误通常发生在 oplog 被截断且 ClickPipe 无法在预期点恢复变更流时。要解决此问题,请[重新同步 ClickPipe](./resync.md)。为避免此问题再次发生,我们建议增加 oplog 保留期。请参阅 [MongoDB Atlas](./source/atlas#enable-oplog-retention)、[自管理 MongoDB](./source/generic#enable-oplog-retention) 或 [Amazon DocumentDB](./source/documentdb#configure-change-stream-log-retention) 的说明。

### 复制是如何管理的? {#how-is-replication-managed}

我们使用 MongoDB 的原生 Change Streams API 来跟踪数据库中的更改。Change Streams API 通过利用 MongoDB 的 oplog(操作日志)提供可恢复的数据库更改流。ClickPipe 使用 MongoDB 的恢复令牌来跟踪 oplog 中的位置,并确保每个更改都复制到 ClickHouse。

### 我应该使用哪种读取偏好? {#which-read-preference-should-i-use}

使用哪种读取偏好取决于您的具体使用场景。如果您想最小化主节点的负载,我们建议使用 `secondaryPreferred` 读取偏好。如果您想优化摄取延迟,我们建议使用 `primaryPreferred` 读取偏好。有关更多详细信息,请参阅 [MongoDB 文档](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1)。


### MongoDB ClickPipe 是否支持分片集群？ {#does-the-mongodb-clickpipe-support-sharded-cluster}

是的,MongoDB ClickPipe 同时支持副本集和分片集群。

### MongoDB ClickPipe 是否支持 Amazon DocumentDB? {#documentdb-support}

是的,MongoDB ClickPipe 支持 Amazon DocumentDB 5.0。详情请参阅 [Amazon DocumentDB 数据源设置指南](./source/documentdb.md)。

### MongoDB ClickPipe 是否支持 PrivateLink? {#privatelink-support}

我们仅支持 AWS 中的 MongoDB(和 DocumentDB)集群使用 PrivateLink。

请注意,与单节点关系型数据库不同,MongoDB 客户端需要成功发现副本集才能遵守配置的 `ReadPreference`。这要求为集群中的所有节点设置 PrivateLink,以便 MongoDB 客户端能够成功建立副本集连接,并在已连接节点发生故障时重定向到其他节点。

如果您希望连接到集群中的单个节点,可以在 ClickPipes 设置期间在连接字符串中指定 `/?directConnection=true` 来跳过副本集发现。在这种情况下,PrivateLink 设置将类似于单节点关系型数据库,这是支持 PrivateLink 的最简单方式。

对于副本集连接,您可以使用 VPC 资源或 VPC 终端节点服务为 MongoDB 设置 PrivateLink。如果选择 VPC 资源,您需要创建一个 `GROUP` 资源配置,以及为集群中的每个节点创建一个 `CHILD` 资源配置。如果选择 VPC 终端节点服务,您需要为集群中的每个节点分别创建终端节点服务(以及相应的 NLB)。

更多详情请参阅 [ClickPipes 的 AWS PrivateLink](../aws-privatelink.md) 文档。如需帮助,请联系 ClickHouse 支持团队。
