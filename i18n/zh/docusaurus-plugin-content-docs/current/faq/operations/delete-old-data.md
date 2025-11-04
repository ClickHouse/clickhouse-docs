---
'slug': '/faq/operations/delete-old-data'
'title': '是否可以从 ClickHouse 表中删除旧记录？'
'toc_hidden': true
'toc_priority': 20
'description': '本页回答了是否可以从 ClickHouse 表中删除旧记录的问题'
'doc_type': 'reference'
---


# 是否可以从 ClickHouse 表中删除旧记录？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

简短的回答是“可以”。ClickHouse 具有多种机制，可以通过删除旧数据来释放磁盘空间。每种机制针对不同的场景。

## TTL {#ttl}

ClickHouse 允许在某些条件发生时自动删除值。这个条件是基于任何列配置的表达式，通常只是针对任何时间戳列的静态偏移量。

这种方法的主要优势是，它不需要任何外部系统来触发，一旦配置了 TTL，数据删除就会在后台自动发生。

:::note
TTL 也可以用于将数据移动到不仅是 [/dev/null](https://en.wikipedia.org/wiki/Null_device)，还可以在不同的存储系统之间移动，比如从 SSD 到 HDD。
:::

有关 [配置 TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 的更多细节。

## DELETE FROM {#delete-from}
[DELETE FROM](/sql-reference/statements/delete.md) 允许在 ClickHouse 中运行标准的 DELETE 查询。过滤条件中目标行将被标记为已删除，并从未来的结果集中移除。行的清理是异步进行的。

:::note
DELETE FROM 一般在 23.3 版本及更新版本中可用。在旧版本中，它是实验性的，必须通过以下方式启用：
```sql
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETE 使用异步批处理操作删除行。与 DELETE FROM 不同，在 ALTER DELETE 之后和批处理操作完成之前运行的查询将包含被标记为删除的行。有关更多详细信息，请参见 [ALTER DELETE](/sql-reference/statements/alter/delete.md) 文档。

`ALTER DELETE` 可以灵活地删除旧数据。如果您需要定期执行此操作，主要的缺点是需要有一个外部系统来提交查询。由于变更重写完整的分区，即使只有一行要删除，还有一些性能考虑。

这是使基于 ClickHouse 的系统符合 [GDPR](https://gdpr-info.eu) 最常见的方法。

有关 [变更]( /sql-reference/statements/alter#mutations) 的更多细节。

## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION` 提供了一种成本高效的方式来删除整个分区。它的灵活性不高，需要在表创建时配置适当的分区方案，但仍然涵盖了大多数常见情况。像变更一样，通常需要从外部系统执行以便定期使用。

有关 [操控分区]( /sql-reference/statements/alter/partition) 的更多细节。

## TRUNCATE {#truncate}

从表中删除所有数据是一个相对激进的操作，但在某些情况下，这可能正是您需要的。

有关 [表截断]( /sql-reference/statements/truncate.md) 的更多细节。
