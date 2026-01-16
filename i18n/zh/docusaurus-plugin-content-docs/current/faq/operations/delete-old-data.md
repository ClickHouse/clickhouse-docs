---
slug: /faq/operations/delete-old-data
title: '是否可以从 ClickHouse 表中删除旧记录？'
toc_hidden: true
toc_priority: 20
description: '本页解答是否可以从 ClickHouse 表中删除 ClickHouse 表中的旧记录'
doc_type: 'reference'
keywords: ['删除数据', 'TTL', '数据保留', '清理', '数据生命周期']
---

# 是否可以从 ClickHouse 表中删除旧记录？ \\{#is-it-possible-to-delete-old-records-from-a-clickhouse-table\\}

简而言之：可以。ClickHouse 提供了多种机制，可以通过移除旧数据来释放磁盘空间。每种机制都针对不同的使用场景。

## TTL \\{#ttl\\}

ClickHouse 允许在满足某些条件时自动删除数据。该条件通过基于任意列的表达式进行配置，通常只是对某个时间戳列施加一个固定偏移量。

这种方式的主要优势在于它不需要任何外部系统来触发，一旦配置了 TTL，数据删除就会在后台自动进行。

:::note
TTL 不仅可以用来将数据“移动”到 [/dev/null](https://en.wikipedia.org/wiki/Null_device)，还可以在不同存储系统之间迁移数据，例如从 SSD 迁移到 HDD。
:::

有关[配置 TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)的更多详细信息。

## DELETE FROM \\{#delete-from\\}

[DELETE FROM](/sql-reference/statements/delete.md) 允许在 ClickHouse 中运行标准的 DELETE 查询。满足过滤条件的行会被标记为已删除，并且在后续的结果集中不再返回。行的清理是以异步方式执行的。

:::note
DELETE FROM 自 23.3 及更新版本起为正式可用特性（GA）。在更早的版本中，它是实验性功能，必须通过以下方式启用：

```sql
SET allow_experimental_lightweight_delete = true;
```

:::

## ALTER DELETE \\{#alter-delete\\}

ALTER DELETE 使用异步批处理操作来删除行。与 DELETE FROM 不同，在执行 ALTER DELETE 之后但在批处理操作完成之前运行的查询，仍然会包含计划删除的行。有关更多详细信息，请参阅 [ALTER DELETE](/sql-reference/statements/alter/delete.md) 文档。

`ALTER DELETE` 可用于灵活地删除旧数据。如果需要定期执行，其主要缺点是需要有一个外部系统来提交查询。还需要考虑性能问题，因为变更（mutation）会重写完整的数据片段（part），即使只需要删除单行数据也是如此。

这是使基于 ClickHouse 的系统满足 [GDPR](https://gdpr-info.eu) 合规性要求的最常见方法。

更多详情请参阅 [变更（mutations）](/sql-reference/statements/alter#mutations)。

## DROP PARTITION \\{#drop-partition\\}

`ALTER TABLE ... DROP PARTITION` 提供了一种低成本删除整个分区的方式。它的灵活性不高，并且需要在创建表时配置合适的分区方案，但仍能覆盖大多数常见场景。与变更（mutation）类似，在常规使用中通常需要通过外部系统来执行该操作。

更多关于[操作分区](/sql-reference/statements/alter/partition)的详细信息。

## TRUNCATE \\{#truncate\\}

从表中删除所有数据是一个相当激进的操作，但在某些情况下，这可能正是你所需要的。

有关[表截断](/sql-reference/statements/truncate.md)的更多详细信息，请参阅该文档。
