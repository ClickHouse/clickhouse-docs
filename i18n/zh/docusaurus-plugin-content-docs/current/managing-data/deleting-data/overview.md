---
'slug': '/deletes/overview'
'title': '删除概述'
'description': '如何在ClickHouse中删除数据'
'keywords':
- 'delete'
- 'truncate'
- 'drop'
- 'lightweight delete'
---



在 ClickHouse 中，有多种方式删除数据，每种方式都有其自身的优缺点和性能特征。您应该根据数据模型和计划删除的数据量选择合适的方法。

| 方法 | 语法 | 何时使用 |
| --- | --- | --- |
| [轻量级删除](/guides/developer/lightweight-delete) | `DELETE FROM [table]` | 当删除少量数据时使用。行会立即从所有后续 `SELECT` 查询中过滤出来，但最初仅在内部标记为已删除，而不会从磁盘上移除。 |
| [删除变更](/sql-reference/statements/alter/delete) | `ALTER TABLE [table] DELETE` | 当数据必须立即从磁盘中删除时使用（例如，出于合规性）。会对 `SELECT` 性能产生负面影响。 |
| [截断表](/sql-reference/statements/truncate) | `TRUNCATE TABLE [db.table]` | 高效地移除表中的所有数据。 |
| [删除分区](/sql-reference/statements/alter/partition#drop-partitionpart) | `DROP PARTITION` | 高效地移除分区中的所有数据。 |

以下是 ClickHouse 中不同删除数据方式的总结：

## 轻量级删除 {#lightweight-deletes}

轻量级删除会导致行立即被标记为已删除，从而可以自动从所有后续的 `SELECT` 查询中过滤掉。这些已删除行的后续删除发生在自然合并周期中，因此产生的 I/O 较少。因此，在未指定的时间内，数据实际上可能不会从存储中删除，而只是标记为已删除。如果您需要确保数据被删除，请考虑上述变更命令。

```sql
-- delete all data from 2018 with a lightweight delete. Not recommended.
DELETE FROM posts WHERE toYear(CreationDate) = 2018
```

使用轻量级 `DELETE` 语句删除大量数据也可能会对 `SELECT` 查询性能产生负面影响。该命令也不兼容具有投影的表。

请注意，在标记已删除的行的操作中使用了变更 [命令](/sql-reference/statements/delete#how-lightweight-deletes-work-internally-in-clickhouse)（添加 `_row_exists` 列），因此产生了一些 I/O。

一般来说，如果可以容忍在磁盘上存在已删除数据的情况（例如，在非合规性情况下），则应优先选择轻量级删除。如果需要删除所有数据，则仍应避免使用这种方法。

阅读更多关于 [轻量级删除](/guides/developer/lightweight-delete)。

## 删除变更 {#delete-mutations}

可以通过 `ALTER TABLE ... DELETE` 命令发出删除变更，例如：

```sql
-- delete all data from 2018 with a mutation. Not recommended.
ALTER TABLE posts DELETE WHERE toYear(CreationDate) = 2018
```

这些可以以同步（如果是非复制的情况下默认为此）或异步执行（由 [mutations_sync](/operations/settings/settings#mutations_sync) 设置决定）。这些操作非常耗 I/O，重写所有符合 `WHERE` 表达式的分片。这个过程没有原子性 - 当变更准备就绪后，分片会立即替换为已变更的分片，而在变更过程中开始执行的 `SELECT` 查询将会看到部分已变更的数据和未变更的部分数据。用户可以通过 [systems.mutations](/operations/system-tables/mutations#monitoring-mutations) 表跟踪进度状态。这些是 I/O 强度较高的操作，应谨慎使用，因为它们可能会影响集群的 `SELECT` 性能。

阅读更多关于 [删除变更](/sql-reference/statements/alter/delete)。

## 截断表 {#truncate-table}

如果需要删除表中的所有数据，请使用以下所示的 `TRUNCATE TABLE` 命令。这是一个轻量级操作。

```sql
TRUNCATE TABLE posts
```

阅读更多关于 [TRUNCATE TABLE](/sql-reference/statements/truncate)。

## 删除分区 {#drop-partition}

如果您为数据指定了自定义分区键，可以高效地删除分区。避免高基数分区。

```sql
ALTER TABLE posts (DROP PARTITION '2008')
```

阅读更多关于 [DROP PARTITION](/sql-reference/statements/alter/partition)。

## 其他资源 {#more-resources}

- [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
