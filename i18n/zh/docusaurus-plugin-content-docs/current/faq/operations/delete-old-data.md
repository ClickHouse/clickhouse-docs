---
slug: /faq/operations/delete-old-data
title: '是否可以从 ClickHouse 表中删除历史记录？'
toc_hidden: true
toc_priority: 20
description: '本页解答是否可以从 ClickHouse 表中删除历史记录'
doc_type: 'reference'
keywords: ['delete data', 'TTL', 'data retention', 'cleanup', 'data lifecycle']
---



# 是否可以从 ClickHouse 表中删除旧记录? {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

简单来说,答案是"可以"。ClickHouse 提供了多种机制,通过删除旧数据来释放磁盘空间。每种机制适用于不同的场景。


## TTL {#ttl}

ClickHouse 允许在满足特定条件时自动删除数据。该条件通过基于任意列的表达式进行配置,通常只需为时间戳列设置静态偏移量即可。

这种方法的主要优势在于无需外部系统触发,一旦配置了 TTL,数据删除将在后台自动执行。

:::note
TTL 不仅可以用于将数据删除(移动到 [/dev/null](https://en.wikipedia.org/wiki/Null_device)),还可以在不同存储系统之间移动数据,例如从 SSD 移动到 HDD。
:::

更多详细信息请参阅[配置 TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)。


## DELETE FROM {#delete-from}

[DELETE FROM](/sql-reference/statements/delete.md) 允许在 ClickHouse 中执行标准的 DELETE 查询。符合过滤条件的行将被标记为已删除,并从后续的查询结果集中移除。行数据的清理以异步方式进行。

:::note
DELETE FROM 从 23.3 及更高版本开始正式可用。在更早的版本中,该功能为实验性功能,需要通过以下设置启用:

```sql
SET allow_experimental_lightweight_delete = true;
```

:::


## ALTER DELETE {#alter-delete}

ALTER DELETE 通过异步批处理操作删除行。与 DELETE FROM 不同,在 ALTER DELETE 执行后、批处理操作完成前运行的查询仍会包含待删除的行。更多详情请参阅 [ALTER DELETE](/sql-reference/statements/alter/delete.md) 文档。

可以使用 `ALTER DELETE` 灵活地删除旧数据。如果需要定期执行此操作,主要缺点是需要外部系统来提交查询。此外还需要考虑性能问题,因为即使只删除单行数据,mutation 操作也会重写完整的数据部分。

这是使基于 ClickHouse 的系统符合 [GDPR](https://gdpr-info.eu) 合规要求的最常见方法。

更多关于 [mutations](/sql-reference/statements/alter#mutations) 的详情。


## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION` 提供了一种高效且经济的方式来删除整个分区。虽然它不够灵活,需要在建表时配置合适的分区方案,但仍能满足大多数常见场景。与 mutation 类似,常规使用时需要从外部系统执行。

更多详细信息请参阅[分区操作](/sql-reference/statements/alter/partition)。


## TRUNCATE {#truncate}

从表中删除所有数据是一个比较激进的操作,但在某些情况下可能正是您所需要的。

有关[表截断](/sql-reference/statements/truncate.md)的更多详细信息,请参阅相关文档。
