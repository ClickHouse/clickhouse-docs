---
slug: /deletes/overview
title: 删除概述
description: 如何在 ClickHouse 中删除数据
keywords: ['delete', 'truncate', 'drop', 'lightweight delete']
---

在 ClickHouse 中，有几种方式可以删除数据，每种方式都有其自身的优势和性能特征。您应该根据您的数据模型和打算删除的数据量选择合适的方法。

| 方法 | 语法 | 何时使用 |
| --- | --- | --- |
| [轻量级删除](/guides/developer/lightweight-delete) | `DELETE FROM [table]` | 当删除少量数据时使用。行会立即从所有后续的 SELECT 查询中过滤出来，但最初仅在内部标记为已删除，而不从磁盘移除。 |
| [删除变更](/sql-reference/statements/alter/delete) | `ALTER TABLE [table] DELETE` | 当数据必须立即从磁盘删除（例如，出于合规性原因）时使用。对 SELECT 性能有负面影响。 |
| [截断表](/sql-reference/statements/truncate) | `TRUNCATE TABLE [db.table]` | 高效地移除表中的所有数据。 |
| [删除分区](/sql-reference/statements/alter/partition#drop-partitionpart) | `DROP PARTITION` | 高效地移除分区中的所有数据。 |

这是在 ClickHouse 中删除数据的不同方式的总结：

## 轻量级删除 {#lightweight-deletes}

轻量级删除会立即将行标记为已删除，使得它们可以自动从所有后续的 `SELECT` 查询中过滤掉。这些已删除行的后续移除发生在自然合并周期中，从而减少了 I/O。因此，可能在未指定的时间内，数据并未真正从存储中删除，而只是被标记为已删除。如果您需要确保数据已被删除，请考虑使用上述变更命令。

```sql
-- 使用变更删除2018年的所有数据。不推荐。
DELETE FROM posts WHERE toYear(CreationDate) = 2018
```

使用轻量级 `DELETE` 语句删除大量数据也可能对 `SELECT` 查询性能产生负面影响。该命令也不与带有投影的表兼容。

请注意，在操作中使用变更以[标记已删除行](/sql-reference/statements/delete#how-lightweight-deletes-work-internally-in-clickhouse)（添加一个 `_row_exists` 列），因此会产生一定的 I/O。

总的来说，如果可以容忍已删除数据在磁盘上的存在（例如，在非合规案例中），则应优先选择轻量级删除。 如果所有数据都需要被删除，则仍应避免此方法。

了解更多关于[轻量级删除](/guides/developer/lightweight-delete)的信息。

## 删除变更 {#delete-mutations}

删除变更可以通过 `ALTER TABLE … DELETE` 命令发出，例如：

```sql
-- 使用变更删除2018年的所有数据。不推荐。
ALTER TABLE posts DELETE WHERE toYear(CreationDate) = 2018
```

这些操作可以同步执行（如果未复制，默认情况）或异步执行（由 [mutations_sync](/operations/settings/settings#mutations_sync) 设置确定）。这些操作非常占 I/O，重写所有匹配 `WHERE` 表达式的分区。这个过程没有原子性 - 当分区准备就绪时，部分分区会被替换为已变更的分区，而在变更过程中开始执行的 `SELECT` 查询将查看已变更的分区和未变更的分区。这些用户可以通过 [systems.mutations](/operations/system-tables/mutations#monitoring-mutations) 表来跟踪进度。这些是高 I/O 操作，应谨慎使用，因为它们可能会影响集群的 `SELECT` 性能。

了解更多有关[删除变更](/sql-reference/statements/alter/delete)的信息。

## 截断表 {#truncate-table}

如果需要删除表中的所有数据，请使用下面显示的 `TRUNCATE TABLE` 命令。这是一个轻量级操作。

```sql
TRUNCATE TABLE posts
```

了解更多有关[TRUNCATE TABLE](/sql-reference/statements/truncate)的信息。

## 删除分区 {#drop-partition}

如果您为数据指定了自定义分区键，则可以高效地删除分区。避免高基数分区。

```sql
ALTER TABLE posts (DROP PARTITION '2008')
```

了解更多有关[DROP PARTITION](/sql-reference/statements/alter/partition)的信息。

## 更多资源 {#more-resources}

- [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
