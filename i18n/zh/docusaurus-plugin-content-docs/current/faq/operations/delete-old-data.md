---
slug: /faq/operations/delete-old-data
title: 是否可以从 ClickHouse 表中删除旧记录？
toc_hidden: true
toc_priority: 20
---


# 是否可以从 ClickHouse 表中删除旧记录？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

简短的回答是“可以”。 ClickHouse 提供多种机制，通过删除旧数据来释放磁盘空间。每种机制旨在针对不同的场景。

## TTL {#ttl}

ClickHouse 允许在满足某些条件时自动删除值。这个条件配置为基于任何列的表达式，通常只是任何时间戳列的静态偏移量。

这种方法的主要优点是它不需要任何外部系统来触发，一旦配置了 TTL，数据删除将在后台自动发生。

:::note
TTL 还可以用于将数据移动，不仅是到 [/dev/null](https://en.wikipedia.org/wiki/Null_device)，还可以在不同的存储系统之间移动，如从 SSD 到 HDD。
:::

有关 [配置 TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 的更多细节。

## DELETE FROM {#delete-from}

[DELETE FROM](/sql-reference/statements/delete.md) 允许在 ClickHouse 中运行标准的 DELETE 查询。目标行在过滤子句中被标记为已删除，并从未来的结果集中移除。行的清理是异步进行的。

:::note
DELETE FROM 从版本 23.3 及更新版本中一般可用。在较旧的版本中，它是实验性的，必须通过以下命令启用：
```sql
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETE 使用异步批处理操作删除行。与 DELETE FROM 不同，在 ALTER DELETE 之后以及批处理操作完成之前运行的查询将包括目标被删除的行。有关更多详细信息，请参见 [ALTER DELETE](/sql-reference/statements/alter/delete.md) 文档。

`ALTER DELETE` 可以灵活地删除旧数据。如果需要定期进行此操作，主要的缺点是需要一个外部系统来提交查询。由于突变重写完整的部分，即使只有一行需要删除，性能方面也有一些考虑。

这是使基于 ClickHouse 的系统符合 [GDPR](https://gdpr-info.eu) 的最常见方法。

有关 [突变](https://clickhouse.com/docs/en/sql-reference/statements/alter#mutations) 的更多细节。

## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION` 提供了一种成本效益高的方式来删除整个分区。它不太灵活，需要在创建表时配置适当的分区方案，但仍然覆盖了大多数常见案例。与突变一样，需要从外部系统执行以便进行常规使用。

有关 [操作分区](https://clickhouse.com/docs/en/sql-reference/statements/alter/partition) 的更多细节。

## TRUNCATE {#truncate}

完全删除表中的所有数据是相当激进的，但在某些情况下，它可能正是您所需要的。

有关 [表截断](https://clickhouse.com/docs/en/sql-reference/statements/truncate.md) 的更多细节。
