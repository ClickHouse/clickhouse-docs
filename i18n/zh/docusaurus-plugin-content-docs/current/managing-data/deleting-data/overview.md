---
'slug': '/deletes/overview'
'title': '删除概览'
'description': '如何在 ClickHouse 中删除数据'
'keywords':
- 'delete'
- 'truncate'
- 'drop'
- 'lightweight delete'
---

在 ClickHouse 中，有几种删除数据的方法，每种方法都有其自身的优点和性能特征。您应该根据您的数据模型和计划删除的数据量选择适当的方法。

| 方法 | 语法 | 何时使用 |
| --- | --- | --- |
| [轻量级删除](/guides/developer/lightweight-delete) | `DELETE FROM [table]` | 在删除少量数据时使用。行会立即从所有后续的 SELECT 查询中过滤掉，但最初只能在内部标记为已删除，而不会立即从磁盘中移除。 |
| [删除变更](/sql-reference/statements/alter/delete) | `ALTER TABLE [table] DELETE` | 当数据必须立即从磁盘中删除（例如出于合规性）时使用。对 SELECT 性能有负面影响。 |
| [截断表](/sql-reference/statements/truncate) | `TRUNCATE TABLE [db.table]` | 高效地移除表中的所有数据。 |
| [删除分区](/sql-reference/statements/alter/partition#drop-partitionpart) | `DROP PARTITION` | 高效地移除分区中的所有数据。 |

以下是 ClickHouse 中删除数据的不同方式的概要：

## 轻量级删除 {#lightweight-deletes}

轻量级删除使行立即被标记为已删除，因此可以自动从所有后续的 `SELECT` 查询中过滤掉。这些已删除行的实际移除在自然合并周期中发生，因此产生的 I/O 较少。因此，在未指定的时间内，数据实际上可能并未从存储中删除，只是标记为已删除。如果需要确保数据被删除，请考虑上述变更命令。

```sql
-- delete all data from 2018 with a lightweight delete. Not recommended.
DELETE FROM posts WHERE toYear(CreationDate) = 2018
```

使用轻量级的 `DELETE` 语句删除大量数据也可能对 `SELECT` 查询性能产生负面影响。该命令也不兼容具有投影的表。

请注意，在操作中使用了变更来 [标记已删除的行](/sql-reference/statements/delete#how-lightweight-deletes-work-internally-in-clickhouse)（添加 `_row_exists` 列），因此会产生一些 I/O。

一般而言，如果可以容忍已删除数据在磁盘上的存在（例如在不合规的情况下），应优先选择轻量级删除。如果需要删除所有数据，则仍应避免这种方法。

有关 [轻量级删除](/guides/developer/lightweight-delete) 的更多信息。

## 删除变更 {#delete-mutations}

删除变更可以通过 `ALTER TABLE ... DELETE` 命令发出，例如 

```sql
-- delete all data from 2018 with a mutation. Not recommended.
ALTER TABLE posts DELETE WHERE toYear(CreationDate) = 2018
```

这些可以以同步方式（如果为非复制时默认为）或异步方式执行（由 [mutations_sync](/operations/settings/settings#mutations_sync) 设置确定）。这些操作非常 IO 密集，重写所有匹配 `WHERE` 表达式的部分。此过程没有原子性 - 部分在准备好时会被变更部分替换，开始执行的 `SELECT` 查询将看到已经变更的部分的数据以及尚未变更的部分的数据。用户可以通过 [systems.mutations](/operations/system-tables/mutations#monitoring-mutations) 表跟踪进度状态。这些是 I/O 密集型操作，应谨慎使用，因为它们会影响集群的 `SELECT` 性能。

有关 [删除变更](/sql-reference/statements/alter/delete) 的更多信息。

## 截断表 {#truncate-table}

如果需要删除表中的所有数据，请使用如下所示的 `TRUNCATE TABLE` 命令。这是一个轻量级操作。

```sql
TRUNCATE TABLE posts
```

有关 [TRUNCATE TABLE](/sql-reference/statements/truncate) 的更多信息。

## 删除分区 {#drop-partition}

如果您为数据指定了自定义分区键，可以高效地删除分区。避免高基数的分区。

```sql
ALTER TABLE posts (DROP PARTITION '2008')
```

有关 [DROP PARTITION](/sql-reference/statements/alter/partition) 的更多信息。

## 更多资源 {#more-resources}

- [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
