---
slug: /faq/operations/delete-old-data
title: '是否可以从 ClickHouse 表中删除旧记录？'
toc_hidden: true
toc_priority: 20
description: '本页解答是否可以从 ClickHouse 表中删除旧记录的问题'
doc_type: 'reference'
keywords: ['删除数据', 'TTL', '数据保留', '清理', '数据生命周期']
---



# 是否可以从 ClickHouse 表中删除旧记录? {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

简单来说,答案是"可以"。ClickHouse 提供了多种机制,通过删除旧数据来释放磁盘空间。每种机制适用于不同的场景。


## TTL {#ttl}

ClickHouse 允许在满足特定条件时自动删除数据。该条件通过基于任意列的表达式进行配置,通常只需为时间戳列设置静态偏移量即可。

这种方法的主要优势在于无需任何外部系统触发,一旦配置了 TTL,数据删除将在后台自动执行。

:::note
TTL 不仅可用于将数据删除(移动到 [/dev/null](https://en.wikipedia.org/wiki/Null_device)),还可用于在不同存储系统之间移动数据,例如从 SSD 移动到 HDD。
:::

更多详细信息请参阅[配置 TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)。


## DELETE FROM {#delete-from}

[DELETE FROM](/sql-reference/statements/delete.md) 允许在 ClickHouse 中运行标准的 DELETE 查询。过滤子句中指定的行将被标记为已删除,并从后续的结果集中移除。行的清理操作异步执行。

:::note
DELETE FROM 从 23.3 及更高版本开始正式可用。在旧版本中,它是实验性功能,必须通过以下方式启用:

```sql
SET allow_experimental_lightweight_delete = true;
```

:::


## ALTER DELETE {#alter-delete}

ALTER DELETE 通过异步批处理操作删除行。与 DELETE FROM 不同,在 ALTER DELETE 执行之后、批处理操作完成之前运行的查询仍会包含待删除的行。更多详情请参阅 [ALTER DELETE](/sql-reference/statements/alter/delete.md) 文档。

可以使用 `ALTER DELETE` 灵活删除旧数据。如果需要定期执行此操作,主要缺点是需要外部系统来提交查询。此外还需要考虑性能问题,因为即使只删除单行,变更操作(mutation)也会重写完整的数据部分(part)。

这是使基于 ClickHouse 的系统符合 [GDPR](https://gdpr-info.eu) 合规要求的最常见方法。

有关[变更操作(mutation)](/sql-reference/statements/alter#mutations)的更多详情。


## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION` 提供了一种高效且经济的方式来删除整个分区。虽然它不够灵活,需要在创建表时配置合适的分区方案,但仍能满足大多数常见场景。与 mutation 操作类似,在日常使用中需要从外部系统执行。

更多详情请参阅[操作分区](/sql-reference/statements/alter/partition)。


## TRUNCATE {#truncate}

从表中删除所有数据是一个相当激进的操作,但在某些情况下这可能正是您所需要的。

有关表截断的更多详细信息,请参阅[表截断](/sql-reference/statements/truncate.md)。
