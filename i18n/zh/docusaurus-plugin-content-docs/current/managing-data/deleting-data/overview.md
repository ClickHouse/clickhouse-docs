---
'slug': '/deletes/overview'
'title': '删除概述'
'description': '在ClickHouse中如何删除数据'
'keywords':
- 'delete'
- 'truncate'
- 'drop'
- 'lightweight delete'
---

在 ClickHouse 中有几种删除数据的方法，每种方法都有其自身的优点和性能特征。您应该根据您的数据模型和打算删除的数据量选择合适的方法。

| 方法 | 语法 | 使用时机 |
| --- | --- | --- |
| [轻量级删除](/guides/developer/lightweight-delete) | `DELETE FROM [table]` | 用于删除少量数据。行会立即从所有后续的 SELECT 查询中被过滤出来，但最初只是在内部标记为已删除，而未从磁盘中移除。 |
| [删除变更](/sql-reference/statements/alter/delete) | `ALTER TABLE [table] DELETE` | 当必须立即从磁盘中删除数据（例如，出于合规性原因）时使用。会对 SELECT 性能产生负面影响。 |
| [截断表](/sql-reference/statements/truncate) | `TRUNCATE TABLE [db.table]` | 高效地移除表中的所有数据。 |
| [删除分区](/sql-reference/statements/alter/partition#drop-partitionpart) | `DROP PARTITION` | 高效地移除分区中的所有数据。 |

以下是 ClickHouse 中删除数据的不同方式的总结：

## 轻量级删除 {#lightweight-deletes}

轻量级删除会立即将行标记为已删除，以便能够自动从所有后续的 `SELECT` 查询中过滤出来。这些已删除行的后续移除会在自然合并周期中进行，因此会产生更少的 I/O。因此，可能在未指定的期间内，数据实际上并未从存储中删除，仅被标记为已删除。如果您需要保证数据被删除，请考虑上述变更命令。

```sql
-- delete all data from 2018 with a lightweight delete. Not recommended.
DELETE FROM posts WHERE toYear(CreationDate) = 2018
```

使用轻量级的 `DELETE` 语句删除大量数据也可能会对 `SELECT` 查询性能产生负面影响。该命令也与具有投影的表不兼容。

请注意，在操作中使用了变更来 [标记已删除的行](/sql-reference/statements/delete#how-lightweight-deletes-work-internally-in-clickhouse)（添加一个 `_row_exists` 列），因此会产生一定的 I/O。

一般来说，如果可以容忍已删除数据在磁盘上的存在（例如，在非合规情况下），则应优先考虑轻量级删除。这种方法在所有数据需要被删除时仍应避免使用。

有关 [轻量级删除]( /guides/developer/lightweight-delete) 的更多信息。

## 删除变更 {#delete-mutations}

可以通过 `ALTER TABLE ... DELETE` 命令发出删除变更，例如：

```sql
-- delete all data from 2018 with a mutation. Not recommended.
ALTER TABLE posts DELETE WHERE toYear(CreationDate) = 2018
```

可以同步执行（如果未复制则默认）或异步执行（由 [mutations_sync](/operations/settings/settings#mutations_sync) 设置决定）。这些操作会极其耗费 I/O，重写所有符合 `WHERE` 表达式的部分。这个过程没有原子性 - 部分在可用时会替换为已变更的部分，在变更期间开始执行的 `SELECT` 查询将会看到已经变更的部分的数据，以及尚未变更的部分的数据。用户可以通过 [systems.mutations](/operations/system-tables/mutations#monitoring-mutations) 表跟踪进度状态。这些操作是 I/O 密集型的，应谨慎使用，因为它们会影响集群的 `SELECT` 性能。

有关 [删除变更]( /sql-reference/statements/alter/delete) 的更多信息。

## 截断表 {#truncate-table}

如果需要删除表中的所有数据，请使用下面显示的 `TRUNCATE TABLE` 命令。这是一个轻量级操作。

```sql
TRUNCATE TABLE posts
```

有关 [TRUNCATE TABLE]( /sql-reference/statements/truncate) 的更多信息。

## 删除分区 {#drop-partition}

如果您为数据指定了自定义分区键，则可以高效地删除分区。避免高基数分区。

```sql
ALTER TABLE posts (DROP PARTITION '2008')
```

有关 [DROP PARTITION]( /sql-reference/statements/alter/partition) 的更多信息。

## 更多资源 {#more-resources}

- [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
