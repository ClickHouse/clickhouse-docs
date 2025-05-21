---
'slug': '/updating-data/overview'
'title': '概述'
'description': '如何在ClickHouse中更新数据'
'keywords':
- 'update'
- 'updating data'
---



## ClickHouse 和 OLTP 数据库中更新数据的差异 {#differences-between-updating-data-in-clickhouse-and-oltp-databases}

在处理更新时，ClickHouse 和 OLTP 数据库由于其底层设计哲学和目标用例存在显著差异。例如，PostgreSQL 作为一个面向行的、符合 ACID 标准的关系数据库，支持强大且事务性的数据更新和删除操作，通过多版本并发控制 (MVCC) 等机制确保数据的一致性和完整性。这使得即使在高并发环境中也能进行安全可靠的修改。

相反，ClickHouse 是一个针对读取密集型分析和高吞吐量附加操作优化的列式数据库。虽然它原生支持就地更新和删除，但必须谨慎使用以避免产生高 I/O。或者，可以重构表，将删除和更新转换为附加操作，在这些操作中，它们是异步处理的和/或在读取时进行处理，从而反映出对高吞吐数据摄取和高效查询性能的关注，而非实时的数据操作。

## 在 ClickHouse 中更新数据的方法 {#methods-to-update-data-in-clickhouse}

在 ClickHouse 中有几种更新数据的方法，每种方法都有其自身的优点和性能特征。您应根据数据模型和计划更新的数据量选择合适的方法。

对于这两种操作，如果在某个时间间隔内提交的变更数量持续超过后台处理的变更数量，则必须应用的非物化变更的队列将继续增长。这将导致 `SELECT` 查询性能最终下降。

总之，更新操作应谨慎发出，变更队列应通过 `system.mutations` 表密切跟踪。不要像在 OLTP 数据库中那样频繁发出更新。如果您有频繁更新的需求，请参见 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)。

| 方法                                                                                | 语法                                   | 使用时机                                                                                                                                                                                                 |
|--------------------------------------------------------------------------------------|-----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [更新变更](/sql-reference/statements/alter/update)                                  | `ALTER TABLE [table] UPDATE`            | 当数据必须立即更新到磁盘（例如，为了合规性）时使用。对 `SELECT` 性能产生负面影响。                                                                                                                                         |
| [轻量级更新](/guides/developer/lightweight-update)                                  | `ALTER TABLE [table] UPDATE`            | 启用 `SET apply_mutations_on_fly = 1;` 时使用。用于更新少量数据。行会在所有后续 `SELECT` 查询中立即返回更新后的数据，但最初仅在内部标记为已在磁盘上更新。                                                                                   |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)   | `ENGINE = ReplacingMergeTree`           | 当更新大量数据时使用。此表引擎针对合并时的数据去重进行了优化。                                                                                                                                               |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) | `ENGINE = CollapsingMergeTree(Sign)`    | 当频繁更新单独行时使用，或在需要维护随着时间变化的对象的最新状态的场景中使用。例如，跟踪用户活动或文章统计。                                                                                                               |

以下是几种在 ClickHouse 中更新数据的不同方法总结：

## 更新变更 {#update-mutations}

更新变更可以通过 `ALTER TABLE ... UPDATE` 命令发出，例如：

```sql
ALTER TABLE posts_temp
        (UPDATE AnswerCount = AnswerCount + 1 WHERE AnswerCount = 0)
```
这些操作极其占用 I/O，会重写所有与 `WHERE` 表达式匹配的部分。这个过程没有原子性 - 部分在准备就绪后会被替换为变更后的部分，而在变更过程中开始执行的 `SELECT` 查询将会看到已变更部分的数据以及尚未变更部分的数据。用户可以通过 [systems.mutations](/operations/system-tables/mutations) 表追踪进度状态。这些是 I/O 密集型操作，应谨慎使用，因为它们可能影响集群的 `SELECT` 性能。

了解更多关于 [更新变更](/sql-reference/statements/alter/update) 的信息。

## 轻量级更新 {#lightweight-updates}

轻量级更新提供了一种机制来更新行，使其立即更新，并且后续的 `SELECT` 查询将自动返回更改后的值（这会导致额外的开销，并降低查询速度）。这有效解决了普通变更的原子性限制。我们在下面提供了一个示例：

```sql
SET apply_mutations_on_fly = 1;

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│       26762   │
└───────────┘

1 row in set. Elapsed: 0.115 sec. Processed 59.55 million rows, 238.25 MB (517.83 million rows/s., 2.07 GB/s.)
Peak memory usage: 113.65 MiB.

-increment count
ALTER TABLE posts
        (UPDATE ViewCount = ViewCount + 1 WHERE Id = 404346)

SELECT ViewCount
FROM posts
WHERE Id = 404346

┌─ViewCount─┐
│       26763   │
└───────────┘

1 row in set. Elapsed: 0.149 sec. Processed 59.55 million rows, 259.91 MB (399.99 million rows/s., 1.75 GB/s.)
```

请注意，对于轻量级更新，仍使用变更来更新数据；只是在 `SELECT` 查询中没有立即进行物化，而是作为异步过程在后台应用。这仍将带来与变更相同的重大开销，因此是一个 I/O 密集型操作，应谨慎使用。此操作可使用的表达式也有限 (具体详情见 [这里](/guides/developer/lightweight-update#support-for-subqueries-and-non-deterministic-functions))。

了解更多关于 [轻量级更新](/guides/developer/lightweight-update) 的信息。

## Collapsing Merge Tree {#collapsing-merge-tree}

基于更新是昂贵的但插入可以利用来执行更新的想法，[`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) 表引擎可以与 `sign` 列一起使用，以告诉 ClickHouse 通过合并（删除）一对标志为 `1` 和 `-1` 的行来更新特定行。如果对 `sign` 列插入 `-1`，则整个行将被删除。如果对 `sign` 列插入 `1`，ClickHouse 将保留该行。要更新的行基于创建表时 `ORDER BY ()` 语句中使用的排序键来确定。

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8 -- A special column used with the CollapsingMergeTree table engine
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID

INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1) -- sign = -1 signals to update the state of this row
INSERT INTO UAct VALUES (4324182021466249494, 6, 185, 1) -- the row is replaced with the new state

SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration
FROM UAct
GROUP BY UserID
HAVING sum(Sign) > 0

┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

:::note
上述更新方法要求用户在客户端维护状态。虽然从 ClickHouse 的角度来看这是最有效的，但在大规模操作时可能比较复杂。

我们建议阅览 [`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) 文档以获取更全面的概述。
:::

## 更多资源 {#more-resources}

- [在 ClickHouse 中处理更新和删除](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
