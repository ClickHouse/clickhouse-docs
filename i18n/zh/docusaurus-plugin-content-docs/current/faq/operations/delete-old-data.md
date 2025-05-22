---
'slug': '/faq/operations/delete-old-data'
'title': '是否可以从 ClickHouse 表中删除旧记录？'
'toc_hidden': true
'toc_priority': 20
'description': '本页面回答了是否可以从 ClickHouse 表中删除旧记录的问题'
---


# 是否可以从 ClickHouse 表中删除旧记录？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

简短的回答是“可以”。 ClickHouse 有多种机制可以通过删除旧数据来释放磁盘空间。每种机制针对不同的场景。

## TTL {#ttl}

ClickHouse 允许在满足某些条件时自动删除值。该条件配置为基于任何列的表达式，通常只是对任何时间戳列的静态偏移。

这种方法的主要优势在于，它不需要任何外部系统来触发，一旦配置了 TTL，数据删除将自动在后台进行。

:::note
TTL 也可以用于将数据移动到 [/dev/null](https://en.wikipedia.org/wiki/Null_device)，还可以在不同的存储系统之间移动，例如从 SSD 到 HDD。
:::

有关 [配置 TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 的更多详细信息。

## DELETE FROM {#delete-from}

[DELETE FROM](/sql-reference/statements/delete.md) 允许在 ClickHouse 中执行标准 DELETE 查询。筛选子句中标记为删除的行将被标记，并从未来的结果集中移除。行的清理是异步进行的。

:::note
从版本 23.3 及更新版本开始，DELETE FROM 一般可用。在更早版本中，它是实验性的，必须通过以下方式启用：
```sql
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETE 使用异步批处理操作删除行。与 DELETE FROM 不同，在 ALTER DELETE 之后运行的查询以及在批处理操作完成之前将包括目标删除的行。有关更多详细信息，请参阅 [ALTER DELETE](/sql-reference/statements/alter/delete.md) 文档。

可以发布 `ALTER DELETE` 来灵活地删除旧数据。如果需要定期执行，主要缺点将是需要一个外部系统来提交查询。还有一些性能考虑，因为即使只有一行需要删除，变更操作也会重写完整的分片。

这是使基于 ClickHouse 系统符合 [GDPR](https://gdpr-info.eu) 的最常见方法。

有关 [变更](https://clickhouse.com/docs/en/sql-reference/statements/alter#mutations) 的更多详细信息。

## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION` 提供了一种经济高效的方式来删除整个分区。它不那么灵活，需要在创建表时配置适当的分区方案，但仍然涵盖了大多数常见的情况。像变更一样，需要从外部系统执行以便定期使用。

有关 [操作分区](https://clickhouse.com/docs/en/sql-reference/statements/alter/partition) 的更多详细信息。

## TRUNCATE {#truncate}

从表中删除所有数据是相当激进的，但在某些情况下，这可能正是您所需要的。

有关 [表截断](https://clickhouse.com/docs/en/sql-reference/statements/truncate.md) 的更多详细信息。
