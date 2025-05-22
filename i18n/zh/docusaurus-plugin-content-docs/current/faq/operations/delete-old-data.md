---
'slug': '/faq/operations/delete-old-data'
'title': '是否可以从 ClickHouse 表中删除旧记录？'
'toc_hidden': true
'toc_priority': 20
'description': '本页面回答了是否可以从 ClickHouse 表中删除旧记录的问题'
---


# 是否可以从 ClickHouse 表中删除旧记录？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

简短的回答是“可以”。ClickHouse 有多种机制，允许通过移除旧数据来释放磁盘空间。每种机制旨在满足不同的场景。

## TTL {#ttl}

ClickHouse 允许在某些条件发生时自动丢弃值。此条件被配置为基于任何列的表达式，通常只是任何时间戳列的静态偏移量。

这种方法的主要优势在于，它不需要任何外部系统来触发，一旦配置了 TTL，数据移除会在后台自动发生。

:::note
TTL 还可以用来将数据不仅移动到 [/dev/null](https://en.wikipedia.org/wiki/Null_device)，还可以在不同存储系统之间移动，如从 SSD 到 HDD。
:::

有关 [配置 TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 的更多细节。

## DELETE FROM {#delete-from}

[DELETE FROM](/sql-reference/statements/delete.md) 允许在 ClickHouse 中运行标准 DELETE 查询。在过滤子句中指定的行被标记为已删除，并从未来的结果集中移除。行的清理是异步发生的。

:::note
DELETE FROM 从版本 23.3 开始一般可用。在旧版本中，它是实验性的，必须通过以下方式启用：
```sql
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETE 使用异步批量操作删除行。与 DELETE FROM 不同，ALTER DELETE 后运行的查询以及在批量操作完成之前将包括目标删除的行。有关更多细节，请参见 [ALTER DELETE](/sql-reference/statements/alter/delete.md) 文档。

`ALTER DELETE` 可以灵活地删除旧数据。如果您需要定期执行此操作，主要缺点是需要一个外部系统来提交查询。由于变更会重写完整的分区，即使只删除一行，也存在一些性能考虑。

这是使基于 ClickHouse 的系统符合 [GDPR](https://gdpr-info.eu) 的最常用方法。

有关 [变更]( /sql-reference/statements/alter#mutations) 的更多细节。

## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION` 提供了一种具有成本效益的方式来删除整个分区。它不够灵活，需要在创建表时配置适当的分区方案，但仍覆盖大多数常见情况。与变更相同，常规使用时也需要从外部系统执行。

有关 [操作分区]( /sql-reference/statements/alter/partition) 的更多细节。

## TRUNCATE {#truncate}

从表中删除所有数据相对激进，但在某些情况下这可能正是您需要的。

有关 [表截断]( /sql-reference/statements/truncate.md) 的更多细节。
