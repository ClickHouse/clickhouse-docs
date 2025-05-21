---
'slug': '/faq/operations/delete-old-data'
'title': '是否可以从 ClickHouse 表中删除旧记录?'
'toc_hidden': true
'toc_priority': 20
'description': '本页面回答了是否可以从 ClickHouse 表中删除旧记录的问题'
---




# 是否可以从 ClickHouse 表中删除旧记录？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

简短的答案是“可以”。ClickHouse 具有多种机制，可以通过删除旧数据来释放磁盘空间。每种机制针对不同的场景。

## TTL {#ttl}

ClickHouse 允许在某些条件发生时自动丢弃值。这个条件配置为基于任意列的表达式，通常只是针对任何时间戳列的静态偏移。

这种方法的主要优点是，它不需要任何外部系统来触发，一旦 TTL 配置完成，数据的删除将在后台自动发生。

:::note
TTL 还可以用于将数据移动到 [/dev/null](https://en.wikipedia.org/wiki/Null_device)，也可以在不同的存储系统之间移动，例如从 SSD 到 HDD。
:::

有关 [配置 TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 的更多详细信息。

## DELETE FROM {#delete-from}
[DELETE FROM](/sql-reference/statements/delete.md) 允许在 ClickHouse 中运行标准的 DELETE 查询。在过滤条件中目标行被标记为已删除，并从未来的结果集中移除。目标行的清理是异步进行的。

:::note
DELETE FROM 在 23.3 版及更高版本中普遍可用。在旧版本中，它是实验性的，必须通过以下方式启用：
```sql
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETE 使用异步批处理操作删除行。与 DELETE FROM 不同，ALTER DELETE 后运行的查询在批处理操作完成之前将包括目标行的删除。有关更多详细信息，请参见 [ALTER DELETE](/sql-reference/statements/alter/delete.md) 文档。

`ALTER DELETE` 可以灵活地删除旧数据。如果您需要定期执行此操作，主要缺点将是需要一个外部系统来提交查询。由于变更会重写完整的分区，即使只删除一行也会有一些性能考虑。

这是使基于 ClickHouse 的系统符合 [GDPR](https://gdpr-info.eu) 的最常见方法。

有关 [变更]( /sql-reference/statements/alter#mutations) 的更多详细信息。

## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION` 提供了一种具有成本效益的方法，可以删除整个分区。它的灵活性不高，并且需要在表创建时配置适当的分区方案，但仍然覆盖了大多数常见情况。像变更一样，需要从外部系统执行以进行定期使用。

有关 [操作分区]( /sql-reference/statements/alter/partition) 的更多详细信息。

## TRUNCATE {#truncate}

从表中删除所有数据是相对激进的，但在某些情况下，这可能正是您所需要的。

有关 [表截断]( /sql-reference/statements/truncate.md) 的更多详细信息。
