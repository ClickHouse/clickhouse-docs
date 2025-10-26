---
'sidebar_label': '常见问题'
'description': '关于 ClickPipes for MongoDB 的常见问题。'
'slug': '/integrations/clickpipes/mongodb/faq'
'sidebar_position': 2
'title': 'ClickPipes for MongoDB 常见问题解答'
'doc_type': 'reference'
---


# ClickPipes for MongoDB FAQ

### Can I query for individual fields in the JSON datatype? {#can-i-query-for-individual-fields-in-the-json-datatype}

对于直接字段访问，例如 `{"user_id": 123}`，您可以使用 **点表示法**：
```sql
SELECT doc.user_id as user_id FROM your_table;
```
对于嵌套对象字段的直接字段访问，例如 `{"address": { "city": "San Francisco", "state": "CA" }}`，使用 `^` 运算符：
```sql
SELECT doc.^address.city AS city FROM your_table;
```
对于聚合，使用 `CAST` 函数或 `::` 语法将字段转换为适当的类型：
```sql
SELECT sum(doc.shipping.cost::Float32) AS total_shipping_cost FROM t1;
```
要了解有关 JSON 的更多信息，请参阅我们的 [Working with JSON guide](./quickstart)。

### How do I flatten the nested MongoDB documents in ClickHouse? {#how-do-i-flatten-the-nested-mongodb-documents-in-clickhouse}

MongoDB 文档默认以 JSON 类型在 ClickHouse 中进行复制，保留嵌套结构。您有几种选项可以将这些数据扁平化。如果您想将数据扁平化为列，您可以使用普通视图、物化视图或查询时访问。

1. **普通视图**：使用普通视图来封装扁平化逻辑。
2. **物化视图**：对于较小的数据集，您可以使用可刷新的物化视图，并结合 [`FINAL` 修饰符](/sql-reference/statements/select/from#final-modifier) 定期扁平化并去重数据。对于较大的数据集，我们建议使用增量物化视图而不使用 `FINAL`，以实时扁平化数据，然后在查询时去重数据。
3. **查询时访问**：不仅限于扁平化，可以使用点表示法直接访问查询中的嵌套字段。

有关详细示例，请参阅我们的 [Working with JSON guide](./quickstart)。

### Can I connect MongoDB databases that don't have a public IP or are in private networks? {#can-i-connect-mongodb-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

我们支持 AWS PrivateLink 连接没有公共 IP 或位于私有网络中的 MongoDB 数据库。目前不支持 Azure Private Link 和 GCP Private Service Connect。

### What happens if I delete a database/table from my MongoDB database? {#what-happens-if-i-delete-a-database-table-from-my-mongodb-database}

当您从 MongoDB 中删除数据库/表时，ClickPipes 将继续运行，但删除的数据库/表将停止复制更改。ClickHouse 中的相应表将被保留。

### How does MongoDB CDC Connector handle transactions? {#how-does-mongodb-cdc-connector-handle-transactions}

事务内的每个文档更改都单独处理并发送到 ClickHouse。更改按它们在 oplog 中出现的顺序应用；只有提交的更改才会复制到 ClickHouse。如果 MongoDB 事务被回滚，这些更改将不会出现在变更流中。

有关更多示例，请参阅我们的 [Working with JSON guide](./quickstart)。

### How do I handle `resume of change stream was not possible, as the resume point may no longer be in the oplog.` error? {#resume-point-may-no-longer-be-in-the-oplog-error}

此错误通常发生在 oplog 被截断时，ClickPipe 无法在预期的点恢复变更流。要解决此问题，请 [重新同步 ClickPipe](./resync.md)。为避免此问题再次发生，我们建议 [增加 oplog 保留期限](./source/atlas#enable-oplog-retention)（或如果您在自管理 MongoDB，请 [点击这里](./source/generic#enable-oplog-retention)）。

### How is replication managed? {#how-is-replication-managed}

我们使用 MongoDB 的原生变更流 API 跟踪数据库中的更改。变更流 API 通过利用 MongoDB 的 oplog（操作日志）提供可恢复的数据库更改流。ClickPipe 使用 MongoDB 的恢复令牌跟踪 oplog 中的位置，并确保每个更改都复制到 ClickHouse。

### Which read preference should I use? {#which-read-preference-should-i-use}

使用哪个读取偏好取决于您的具体使用情况。如果您想最小化对主节点的负载，我们建议使用 `secondaryPreferred` 读取偏好。如果您想优化数据摄取延迟，我们建议使用 `primaryPreferred` 读取偏好。有关更多详细信息，请参阅 [MongoDB documentation](https://www.mongodb.com/docs/manual/core/read-preference/#read-preference-modes-1)。

### Does the MongoDB ClickPipe support Sharded Cluster? {#does-the-mongodb-clickpipe-support-sharded-cluster}
是的，MongoDB ClickPipe 同时支持副本集和分片集群。
